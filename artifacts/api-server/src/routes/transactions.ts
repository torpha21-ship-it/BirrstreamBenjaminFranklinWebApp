import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db";
import { eq, and, desc, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { ListTransactionsQueryParams } from "@workspace/api-zod";

const router = Router();

/**
 * Maps frontend filter names to the actual transaction type strings stored in DB.
 * Includes all types that exist after the audit fixes (package_purchase, daily_yield, etc.).
 */
const TYPE_MAP: Record<string, string[]> = {
  deposits: ["deposit"],
  withdrawals: ["withdrawal"],
  task_earnings: ["task_earning"],
  commissions: ["commission"],
  packages: ["package_purchase"],
  yields: ["daily_yield"],
  streaks: ["streak_bonus"],
};

router.get("/transactions", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = ListTransactionsQueryParams.safeParse(req.query);
  const filterType = parsed.success ? parsed.data.type : undefined;

  const typeFilter =
    filterType && filterType !== "all" ? (TYPE_MAP[filterType] ?? []) : null;

  // Unknown filter type — return empty rather than silently returning all
  if (typeFilter !== null && typeFilter.length === 0) {
    res.json([]);
    return;
  }

  // Filter in SQL — don't fetch all rows and reduce in JS
  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(
      typeFilter
        ? and(eq(transactionsTable.userId, user.id), inArray(transactionsTable.type, typeFilter))
        : eq(transactionsTable.userId, user.id),
    )
    .orderBy(desc(transactionsTable.createdAt));

  res.json(
    transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount),
      description: t.description,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    })),
  );
});

export default router;
