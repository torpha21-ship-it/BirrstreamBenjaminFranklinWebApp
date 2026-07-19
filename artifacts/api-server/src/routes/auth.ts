import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { generateToken, requireAuth } from "../middlewares/auth";
import {
  RegisterBody,
  LoginBody,
  ForgotPasswordBody,
} from "@workspace/api-zod";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "birrstream_salt").digest("hex");
}

function generateReferralCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
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
  const existing = await db.select().from(usersTable).where(
    or(eq(usersTable.username, username), eq(usersTable.email, email))
  );
  if (existing.length > 0) {
    res.status(400).json({ error: "Username or email already in use" });
    return;
  }

  let referredByUserId: number | undefined;
  if (referralCode) {
    const referrer = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode));
    if (referrer.length > 0) {
      referredByUserId = referrer[0].id;
    }
  }

  const [user] = await db.insert(usersTable).values({
    fullName,
    username,
    email,
    passwordHash: hashPassword(password),
    referralCode: generateReferralCode(),
    referredByUserId: referredByUserId ?? null,
    mainBalance: "0",
    totalYield: "0",
    totalDeposited: "0",
    totalWithdrawn: "0",
  }).returning();

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
  const [user] = await db.select().from(usersTable).where(
    or(eq(usersTable.username, usernameOrEmail), eq(usersTable.email, usernameOrEmail))
  );
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = generateToken(user.id);
  res.json({ user: formatUser(user), token });
});

router.post("/auth/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

router.post("/auth/forgot-password", async (req, res) => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  // In a real app, send email. Here just acknowledge.
  res.json({ message: "If that email is registered, a reset link has been sent." });
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json(formatUser((req as any).user));
});

export default router;
