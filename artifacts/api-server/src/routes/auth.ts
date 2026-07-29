import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, passwordResetTokensTable } from "@workspace/db";
import { eq, or, and, sql } from "drizzle-orm";
import { generateToken, revokeToken, requireAuth } from "../middlewares/auth";
import { loginLimiter, registerLimiter } from "../middlewares/rate-limit";
import {
  RegisterBody,
  LoginBody,
  ForgotPasswordBody,
} from "@workspace/api-zod";
import crypto, { createHash } from "crypto";
import { promisify } from "util";
import nodemailer from "nodemailer";

const scryptAsync = promisify(crypto.scrypt);
const router = Router();

type PasswordVerificationResult = {
  valid: boolean;
  algorithm: "scrypt" | "legacy_sha256";
  reason?: "invalid_scrypt_shape" | "invalid_legacy_shape" | "length_mismatch";
};

function normalizeIdentifier(value: string): string {
  return value.trim();
}

function normalizeEmail(value: string): string {
  return normalizeIdentifier(value).toLowerCase();
}

function isHex(value: string): boolean {
  return /^[0-9a-f]+$/i.test(value);
}

// ---------------------------------------------------------------------------
// Password hashing — scrypt via Node.js built-in crypto (no external deps).
// Format: "scrypt:<hex-salt>:<hex-hash>"
// Backwards-compatible: legacy SHA-256 hashes (no "scrypt:" prefix) are
// verified on login and transparently re-hashed to scrypt in the same request.
// ---------------------------------------------------------------------------
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${hash.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<PasswordVerificationResult> {
  if (stored.startsWith("scrypt:")) {
    const [, salt, key] = stored.split(":");
    if (!salt || !key || !isHex(salt) || !isHex(key)) {
      return { valid: false, algorithm: "scrypt", reason: "invalid_scrypt_shape" };
    }

    const expected = Buffer.from(key, "hex");
    const hash = (await scryptAsync(password, salt, 64)) as Buffer;
    if (expected.length !== hash.length) {
      return { valid: false, algorithm: "scrypt", reason: "length_mismatch" };
    }

    // timingSafeEqual prevents timing attacks
    return {
      valid: crypto.timingSafeEqual(expected, hash),
      algorithm: "scrypt",
    };
  }

  if (stored.length !== 64 || !isHex(stored)) {
    return { valid: false, algorithm: "legacy_sha256", reason: "invalid_legacy_shape" };
  }

  // Legacy SHA-256 path — still works, will be upgraded to scrypt on next login
  const sha256 = crypto.createHash("sha256").update(password + "birrstream_salt").digest("hex");
  return {
    valid: crypto.timingSafeEqual(Buffer.from(sha256, "hex"), Buffer.from(stored, "hex")),
    algorithm: "legacy_sha256",
  };
}

// ---------------------------------------------------------------------------
// Referral code — hex, collision-checked against DB
// ---------------------------------------------------------------------------
async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 hex chars
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.referralCode, code))
      .limit(1);
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique referral code — please retry");
}

export function formatUser(user: any) {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    mainBalance: parseFloat(user.mainBalance),
    totalYield: parseFloat(user.totalYield),
    totalDeposited: parseFloat(user.totalDeposited),
    totalWithdrawn: parseFloat(user.totalWithdrawn),
    referralCode: user.referralCode,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/auth/register", registerLimiter, async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { password, confirmPassword, referralCode } = parsed.data;
  const fullName = parsed.data.fullName.trim();
  const username = normalizeIdentifier(parsed.data.username);
  const email = normalizeEmail(parsed.data.email);

  if (!fullName || !username || !email) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }
  const existing = await db
    .select()
    .from(usersTable)
    .where(
      or(
        sql`lower(${usersTable.username}) = lower(${username})`,
        sql`lower(${usersTable.email}) = ${email}`,
      ),
    );
  if (existing.length > 0) {
    res.status(400).json({ error: "Username or email already in use" });
    return;
  }

  let referredByUserId: number | null = null;
  if (referralCode) {
    const [referrer] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.referralCode, referralCode))
      .limit(1);
    if (referrer) referredByUserId = referrer.id;
  }

  const [passwordHash, uniqueCode] = await Promise.all([
    hashPassword(password),
    generateUniqueReferralCode(),
  ]);

  const [user] = await db
    .insert(usersTable)
    .values({
      fullName,
      username,
      email,
      passwordHash,
      referralCode: uniqueCode,
      referredByUserId,
      mainBalance: "0",
      totalYield: "0",
      totalDeposited: "0",
      totalWithdrawn: "0",
    })
    .returning();

  const token = generateToken(user.id);
  res.status(201).json({ user: formatUser(user), token });
});

router.post("/auth/login", loginLimiter, async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { password } = parsed.data;
  const usernameOrEmail = normalizeIdentifier(parsed.data.usernameOrEmail);
  const normalizedIdentifier = usernameOrEmail.toLowerCase();

  if (!usernameOrEmail) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(
      or(
        sql`lower(${usersTable.username}) = ${normalizedIdentifier}`,
        sql`lower(${usersTable.email}) = ${normalizedIdentifier}`,
      ),
    );
  if (!user) {
    req.log?.warn(
      { authFlow: "custom-db", failure: "user_not_found", identifierType: usernameOrEmail.includes("@") ? "email" : "username" },
      "Login failed",
    );
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const passwordResult = await verifyPassword(password, user.passwordHash);
  if (!passwordResult.valid) {
    req.log?.warn(
      {
        authFlow: "custom-db",
        failure: "password_verification_failed",
        userId: user.id,
        accountCreatedAt: user.createdAt,
        algorithm: passwordResult.algorithm,
        reason: passwordResult.reason ?? "mismatch",
      },
      "Login failed",
    );
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Transparently upgrade legacy SHA-256 hash to scrypt on successful login
  const needsUpgrade = passwordResult.algorithm === "legacy_sha256";
  if (needsUpgrade) {
    const newHash = await hashPassword(password);
    await db
      .update(usersTable)
      .set({ passwordHash: newHash, lastLoginAt: new Date() })
      .where(eq(usersTable.id, user.id));
  } else {
    await db
      .update(usersTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(usersTable.id, user.id));
  }

  req.log?.info(
    {
      authFlow: "custom-db",
      success: true,
      userId: user.id,
      algorithm: passwordResult.algorithm,
      upgradedLegacyHash: needsUpgrade,
    },
    "Login succeeded",
  );

  const token = generateToken(user.id);
  res.json({ user: formatUser(user), token });
});

// requireAuth is intentional: ensures the token is valid before revoking it
router.post("/auth/logout", requireAuth, (req, res) => {
  const token = (req as any).token as string;
  revokeToken(token);
  res.json({ message: "Logged out successfully" });
});

router.post("/auth/forgot-password", async (req, res) => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const email = normalizeEmail(parsed.data.email);

  // Always return 200 with the same message — never reveal whether an email
  // is registered (prevents account enumeration).
  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(sql`lower(${usersTable.email}) = ${email}`)
    .limit(1);

  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing unused tokens for this user so only the newest
    // link is valid.
    await db
      .update(passwordResetTokensTable)
      .set({ used: true })
      .where(
        and(
          eq(passwordResetTokensTable.userId, user.id),
          eq(passwordResetTokensTable.used, false),
        ),
      );

    await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // Only attempt email delivery when SMTP is configured. Errors are logged
    // but never surfaced to the caller (again, no enumeration signal).
    if (process.env["SMTP_HOST"] && process.env["SMTP_USER"]) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env["SMTP_HOST"],
          port: Number(process.env["SMTP_PORT"] ?? 587),
          secure: false,
          auth: {
            user: process.env["SMTP_USER"],
            pass: process.env["SMTP_PASS"],
          },
        });

        const frontendUrl = process.env["FRONTEND_URL"] ?? "";
        const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;
        await transporter.sendMail({
          from: `"BirrStream" <${process.env["SMTP_USER"]}>`,
          to: email,
          subject: "BirrStream — Reset Your Password",
          text: `Click the link below to reset your password (valid for 1 hour):\n\n${resetLink}`,
          html: `<p>Click the link below to reset your password (valid for 1 hour):</p>
                 <p><a href="${resetLink}">${resetLink}</a></p>`,
        });
      } catch (err) {
        req.log?.error({ err }, "Failed to send password reset email");
      }
    }
  }

  res.json({ message: "If that email is registered, a reset link has been sent." });
});

router.post("/auth/reset-password", async (req, res) => {
  const { token, newPassword } = (req.body ?? {}) as {
    token?: unknown;
    newPassword?: unknown;
  };
  if (
    typeof token !== "string" ||
    typeof newPassword !== "string" ||
    newPassword.length < 8
  ) {
    res
      .status(400)
      .json({ error: "Invalid input. Password must be at least 8 characters." });
    return;
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const [tokenRow] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.tokenHash, tokenHash))
    .limit(1);

  if (!tokenRow || tokenRow.used || new Date(tokenRow.expiresAt) < new Date()) {
    res
      .status(400)
      .json({ error: "Invalid or expired reset link. Please request a new one." });
    return;
  }

  const newHash = await hashPassword(newPassword);

  await db.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({ passwordHash: newHash })
      .where(eq(usersTable.id, tokenRow.userId));
    await tx
      .update(passwordResetTokensTable)
      .set({ used: true })
      .where(eq(passwordResetTokensTable.id, tokenRow.id));
  });

  res.json({ message: "Password updated successfully. You can now log in." });
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json(formatUser((req as any).user));
});

export default router;
