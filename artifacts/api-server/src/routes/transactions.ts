import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { ListTransactionsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/transactions", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = ListTransactionsQueryParams.safeParse(req.query);
  const filterType = parsed.success ? parsed.data.type : undefined;

  let transactions = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.userId, user.id))
    .orderBy(desc(transactionsTable.createdAt));

  if (filterType && filterType !== "all") {
    const typeMap: Record<string, string[]> = {
      deposits: ["deposit"],
      withdrawals: ["withdrawal"],
      task_earnings: ["task_earning"],
      commissions: ["commission"],
    };
    const types = typeMap[filterType] ?? [];
    transactions = transactions.filter(t => types.includes(t.type));
  }

  res.json(transactions.map(t => ({
    id: t.id,
    type: t.type,
    amount: parseFloat(t.amount),
    description: t.description,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  })));
});

export default router;
