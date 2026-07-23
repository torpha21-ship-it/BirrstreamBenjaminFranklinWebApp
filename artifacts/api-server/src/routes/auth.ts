import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, passwordResetTokensTable, emailVerificationTokensTable } from "@workspace/db";
import { eq, or, and } from "drizzle-orm";
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

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (stored.startsWith("scrypt:")) {
    const [, salt, key] = stored.split(":");
    const hash = (await scryptAsync(password, salt, 64)) as Buffer;
    // timingSafeEqual prevents timing attacks
    return crypto.timingSafeEqual(Buffer.from(key, "hex"), hash);
  }
  // Legacy SHA-256 path — still works, will be upgraded to scrypt on next login
  const sha256 = crypto.createHash("sha256").update(password + "birrstream_salt").digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sha256, "hex"), Buffer.from(stored, "hex"));
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
    emailVerified: user.emailVerified ?? false,
    verifiedAt: user.verifiedAt ? (user.verifiedAt instanceof Date ? user.verifiedAt.toISOString() : new Date(user.verifiedAt).toISOString()) : null,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/auth/register", registerLimiter, async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { fullName, username, email, password, confirmPassword, referralCode } = parsed.data;
  if (password !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }
  const existing = await db
    .select()
    .from(usersTable)
    .where(or(eq(usersTable.username, username), eq(usersTable.email, email)));
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
  const { usernameOrEmail, password } = parsed.data;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(or(eq(usersTable.username, usernameOrEmail), eq(usersTable.email, usernameOrEmail)));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Transparently upgrade legacy SHA-256 hash to scrypt on successful login
  const needsUpgrade = !user.passwordHash.startsWith("scrypt:");
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
  const { email } = parsed.data;

  // Always return 200 with the same message — never reveal whether an email
  // is registered (prevents account enumeration).
  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
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

router.post("/auth/send-verification", async (req, res) => {
  let userId: number | null = null;
  let userEmail: string | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      // Optional: check session from requireAuth logic if attached
      const authUser = (req as any).user;
      if (authUser) {
        userId = authUser.id;
        userEmail = authUser.email;
      }
    } catch (_) {}
  }

  if (!userEmail && typeof req.body?.email === "string") {
    userEmail = req.body.email;
    const [user] = await db
      .select({ id: usersTable.id, emailVerified: usersTable.emailVerified })
      .from(usersTable)
      .where(eq(usersTable.email, userEmail))
      .limit(1);
    if (user) {
      userId = user.id;
      if (user.emailVerified) {
        res.json({ message: "Email is already verified." });
        return;
      }
    }
  }

  if (!userId || !userEmail) {
    res.status(400).json({ error: "User or email not found." });
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db
    .update(emailVerificationTokensTable)
    .set({ used: true })
    .where(
      and(
        eq(emailVerificationTokensTable.userId, userId),
        eq(emailVerificationTokensTable.used, false),
      ),
    );

  await db.insert(emailVerificationTokensTable).values({
    userId,
    tokenHash,
    expiresAt,
  });

  const frontendUrl = process.env["FRONTEND_URL"] ?? "";
  const verifyLink = `${frontendUrl}/verify-email?token=${rawToken}`;

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

      await transporter.sendMail({
        from: `"BirrStream" <${process.env["SMTP_USER"]}>`,
        to: userEmail,
        subject: "BirrStream — Verify Your Email Address",
        text: `Click the link below to verify your email address:\n\n${verifyLink}`,
        html: `<p>Click the link below to verify your email address:</p>
               <p><a href="${verifyLink}">${verifyLink}</a></p>`,
      });
    } catch (err) {
      req.log?.error({ err }, "Failed to send verification email");
    }
  } else {
    console.log(`[Verification Email Link]: ${verifyLink}`);
  }

  res.json({ message: "Verification link has been sent to your email." });
});

router.post("/auth/verify-email", async (req, res) => {
  const { token } = (req.body ?? {}) as { token?: unknown };
  if (typeof token !== "string" || !token) {
    res.status(400).json({ error: "Invalid or missing verification token." });
    return;
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const [tokenRow] = await db
    .select()
    .from(emailVerificationTokensTable)
    .where(eq(emailVerificationTokensTable.tokenHash, tokenHash))
    .limit(1);

  if (!tokenRow || tokenRow.used || new Date(tokenRow.expiresAt) < new Date()) {
    res.status(400).json({ error: "Invalid or expired verification link." });
    return;
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({ emailVerified: true, verifiedAt: now })
      .where(eq(usersTable.id, tokenRow.userId));

    await tx
      .update(emailVerificationTokensTable)
      .set({ used: true })
      .where(eq(emailVerificationTokensTable.id, tokenRow.id));
  });

  res.json({ message: "Email verified successfully!", emailVerified: true });
});

export default router;
