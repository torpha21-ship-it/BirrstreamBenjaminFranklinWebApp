import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, userPackagesTable, packagesTable, transactionsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { getEthiopiaToday } from "../lib/date";

const router = Router();

/**
 * Credit today's daily yield for the requesting user's active package.
 * Called automatically when the dashboard loads.
 *
 * Idempotency is guaranteed by two layers:
 *  1. A SELECT ... FOR UPDATE on the user row serialises concurrent calls:
 *     the second request blocks until the first commits, then sees the
 *     already-inserted yield transaction and returns early.
 *  2. The idempotency check queries only today's records using a SQL date
 *     filter (not a JavaScript scan of all historical records).
 */
router.post("/yields/credit-daily", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const today = getEthiopiaToday();

  const creditResult = await db.transaction(async (tx) => {
    // ── Acquire an exclusive row-lock on the user ─────────────────────────
    // All concurrent yield-credit requests for the same user queue here.
    // The second request will execute AFTER the first commits and will find
    // the yield already recorded, preventing double-credit.
    await tx.execute(sql`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`);

    // ── Idempotency check — SQL date filter, not JS scan of all history ───
    const [existing] = await tx
      .select({ id: transactionsTable.id })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, user.id),
          eq(transactionsTable.type, "daily_yield"),
          sql`created_at AT TIME ZONE 'UTC' >= (${today}::date)::timestamptz`,
          sql`created_at AT TIME ZONE 'UTC' < (${today}::date + interval '1 day')::timestamptz`,
        ),
      )
      .limit(1);

    if (existing) {
      return { credited: false, reason: "Already credited today", yieldAmount: 0 };
    }

    // ── Get active unexpired package ──────────────────────────────────────
    const [result] = await tx
      .select()
      .from(userPackagesTable)
      .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
      .where(and(eq(userPackagesTable.userId, user.id), eq(userPackagesTable.isActive, true)))
      .limit(1);

    if (!result) {
      return { credited: false, reason: "No active package", yieldAmount: 0 };
    }

    // ── Check package expiry ──────────────────────────────────────────────
    const now = new Date();
    const expires = new Date(result.user_packages.expiresAt);
    if (now > expires) {
      await tx
        .update(userPackagesTable)
        .set({ isActive: false })
        .where(eq(userPackagesTable.id, result.user_packages.id));
      return { credited: false, reason: "Package expired", yieldAmount: 0 };
    }

    const dailyReturn = parseFloat(result.packages.dailyReturn);

    // ── Atomically credit balance ─────────────────────────────────────────
    const [updated] = await tx
      .update(usersTable)
      .set({
        mainBalance: sql`main_balance + ${String(dailyReturn)}::numeric`,
        totalYield: sql`total_yield + ${String(dailyReturn)}::numeric`,
      })
      .where(eq(usersTable.id, user.id))
      .returning({ mainBalance: usersTable.mainBalance });

    await tx.insert(transactionsTable).values({
      userId: user.id,
      type: "daily_yield",
      amount: String(dailyReturn),
      description: `Daily yield from ${result.packages.name}`,
      status: "completed",
    });

    return {
      credited: true,
      yieldAmount: dailyReturn,
      packageName: result.packages.name,
      newBalance: parseFloat(updated.mainBalance),
    };
  });

  res.json(creditResult);
});

export default router;
