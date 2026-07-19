import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { generateToken, revokeToken, requireAuth } from "../middlewares/auth";
import {
  RegisterBody,
  LoginBody,
  ForgotPasswordBody,
} from "@workspace/api-zod";
import crypto from "crypto";
import { promisify } from "util";

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

function formatUser(user: any) {
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

router.post("/auth/register", async (req, res) => {
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

router.post("/auth/login", async (req, res) => {
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
  // In a real app, send a reset email. Here just acknowledge.
  res.json({ message: "If that email is registered, a reset link has been sent." });
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json(formatUser((req as any).user));
});

export default router;
