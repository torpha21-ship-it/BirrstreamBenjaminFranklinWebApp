import rateLimit from "express-rate-limit";
import type { Request } from "express";

/**
 * Rate limiters for abuse-prone endpoints.
 *
 * The auth limiters key off IP (the default) and require `app.set("trust proxy")`
 * so `req.ip` reflects the real client behind the Replit/Vercel proxy. The
 * per-user task limiter keys off the authenticated user id when present,
 * falling back to IP, so it must be mounted AFTER requireAuth.
 *
 * NOTE: the daily-yield endpoint intentionally has NO limiter — it is called
 * automatically on every dashboard load and is already idempotent.
 */

// Shared key generator for authenticated per-user limiters.
const userKeyGenerator = (req: Request) => String((req as any).user?.id ?? req.ip);

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: "Too many registration attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const taskLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: userKeyGenerator,
  message: { error: "Too many task completions. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const yieldLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3,
  keyGenerator: userKeyGenerator,
  message: { error: "Daily yield already credited. Come back tomorrow." },
  standardHeaders: true,
  legacyHeaders: false,
});
