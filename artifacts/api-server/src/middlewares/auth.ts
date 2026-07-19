import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

interface Session {
  userId: number;
  expiresAt: number;
}

// In-memory session store. Tokens survive for 30 days; the server restart
// caveat is documented in replit.md. For a production deployment, replace
// this Map with a database-backed store (e.g. a sessions table).
const SESSIONS: Map<string, Session> = new Map();
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function generateToken(userId: number): string {
  // Use cryptographically secure random bytes — Math.random() is NOT safe here
  const token = crypto.randomBytes(32).toString("hex");
  SESSIONS.set(token, { userId, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

/** Invalidates a token immediately (used by logout). */
export function revokeToken(token: string): void {
  SESSIONS.delete(token);
}

export function getUserIdFromToken(token: string): number | null {
  const session = SESSIONS.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    SESSIONS.delete(token);
    return null;
  }
  return session.userId;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const userId = getUserIdFromToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    revokeToken(token); // clean up stale session
    res.status(401).json({ error: "User not found" });
    return;
  }
  (req as any).user = user;
  (req as any).token = token; // exposed so logout can revoke it
  next();
}
