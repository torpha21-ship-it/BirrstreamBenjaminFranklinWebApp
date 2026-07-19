import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  depositsTable,
  withdrawalsTable,
  transactionsTable,
  userPackagesTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/admin";

const router = Router();

router.get("/admin/stats", requireAuth, requireAdmin, async (_req, res) => {
  const [userCountRow] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const [totalsRow] = await db
    .select({
      totalDeposited: sql<string>`coalesce(sum(${usersTable.totalDeposited}), 0)`,
      totalWithdrawn: sql<string>`coalesce(sum(${usersTable.totalWithdrawn}), 0)`,
    })
    .from(usersTable);

  const pendingDeposits = await db.select().from(depositsTable).where(eq(depositsTable.status, "pending"));
  const pendingWithdrawals = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.status, "pending"));
  const [activePkgRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userPackagesTable)
    .where(eq(userPackagesTable.isActive, true));

  res.json({
    totalUsers: Number(userCountRow.count),
    totalDeposited: parseFloat(totalsRow.totalDeposited),
    totalWithdrawn: parseFloat(totalsRow.totalWithdrawn),
    pendingDepositsCount: pendingDeposits.length,
    pendingDepositsAmount: pendingDeposits.reduce((sum, d) => sum + parseFloat(d.amount), 0),
    pendingWithdrawalsCount: pendingWithdrawals.length,
    pendingWithdrawalsAmount: pendingWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0),
    totalActivePackages: Number(activePkgRow.count),
  });
});

router.get("/admin/deposits/pending", requireAuth, requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(depositsTable)
    .innerJoin(usersTable, eq(depositsTable.userId, usersTable.id))
    .where(eq(depositsTable.status, "pending"))
    .orderBy(depositsTable.createdAt);

  res.json(
    rows.map(r => ({
      id: r.deposits.id,
      userId: r.users.id,
      username: r.users.username,
      fullName: r.users.fullName,
      amount: parseFloat(r.deposits.amount),
      senderName: r.deposits.senderName,
      receiptUrl: r.deposits.receiptUrl,
      status: r.deposits.status,
      createdAt: r.deposits.createdAt.toISOString(),
    }))
  );
});

router.post("/admin/deposits/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  const depositId = parseInt(String(req.params.id), 10);
  const [deposit] = await db.select().from(depositsTable).where(eq(depositsTable.id, depositId));
  if (!deposit) {
    res.status(404).json({ error: "Deposit not found" });
    return;
  }
  if (deposit.status !== "pending") {
    res.status(400).json({ error: "Deposit already processed" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, deposit.userId));
  const amount = parseFloat(deposit.amount);

  await db
    .update(usersTable)
    .set({
      mainBalance: String(parseFloat(user.mainBalance) + amount),
      totalDeposited: String(parseFloat(user.totalDeposited) + amount),
    })
    .where(eq(usersTable.id, user.id));

  await db.update(depositsTable).set({ status: "approved" }).where(eq(depositsTable.id, depositId));

  await db.insert(transactionsTable).values({
    userId: user.id,
    type: "deposit",
    amount: String(amount),
    description: `Deposit approved from ${deposit.senderName}`,
    status: "completed",
    relatedId: depositId,
  });

  res.json({ message: "Deposit approved and credited" });
});

router.post("/admin/deposits/:id/reject", requireAuth, requireAdmin, async (req, res) => {
  const depositId = parseInt(String(req.params.id), 10);
  const [deposit] = await db.select().from(depositsTable).where(eq(depositsTable.id, depositId));
  if (!deposit) {
    res.status(404).json({ error: "Deposit not found" });
    return;
  }
  if (deposit.status !== "pending") {
    res.status(400).json({ error: "Deposit already processed" });
    return;
  }

  await db.update(depositsTable).set({ status: "rejected" }).where(eq(depositsTable.id, depositId));

  res.json({ message: "Deposit rejected" });
});

router.get("/admin/withdrawals/pending", requireAuth, requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(withdrawalsTable)
    .innerJoin(usersTable, eq(withdrawalsTable.userId, usersTable.id))
    .where(eq(withdrawalsTable.status, "pending"))
    .orderBy(withdrawalsTable.createdAt);

  res.json(
    rows.map(r => ({
      id: r.withdrawals.id,
      userId: r.users.id,
      username: r.users.username,
      fullName: r.users.fullName,
      amount: parseFloat(r.withdrawals.amount),
      bankName: r.withdrawals.bankName,
      accountName: r.withdrawals.accountName,
      walletId: r.withdrawals.walletId,
      status: r.withdrawals.status,
      createdAt: r.withdrawals.createdAt.toISOString(),
    }))
  );
});

router.post("/admin/withdrawals/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  const withdrawalId = parseInt(String(req.params.id), 10);
  const [withdrawal] = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, withdrawalId));
  if (!withdrawal) {
    res.status(404).json({ error: "Withdrawal not found" });
    return;
  }
  if (withdrawal.status !== "pending") {
    res.status(400).json({ error: "Withdrawal already processed" });
    return;
  }

  // Funds were already deducted from balance when the withdrawal was submitted.
  await db.update(withdrawalsTable).set({ status: "approved" }).where(eq(withdrawalsTable.id, withdrawalId));
  await db
    .update(transactionsTable)
    .set({ status: "completed" })
    .where(and(eq(transactionsTable.relatedId, withdrawalId), eq(transactionsTable.type, "withdrawal")));

  res.json({ message: "Withdrawal approved" });
});

router.post("/admin/withdrawals/:id/reject", requireAuth, requireAdmin, async (req, res) => {
  const withdrawalId = parseInt(String(req.params.id), 10);
  const [withdrawal] = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, withdrawalId));
  if (!withdrawal) {
    res.status(404).json({ error: "Withdrawal not found" });
    return;
  }
  if (withdrawal.status !== "pending") {
    res.status(400).json({ error: "Withdrawal already processed" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, withdrawal.userId));
  const amount = parseFloat(withdrawal.amount);

  // Refund the deducted balance
  await db
    .update(usersTable)
    .set({
      mainBalance: String(parseFloat(user.mainBalance) + amount),
      totalWithdrawn: String(Math.max(0, parseFloat(user.totalWithdrawn) - amount)),
    })
    .where(eq(usersTable.id, user.id));

  await db.update(withdrawalsTable).set({ status: "rejected" }).where(eq(withdrawalsTable.id, withdrawalId));
  await db
    .update(transactionsTable)
    .set({ status: "rejected" })
    .where(and(eq(transactionsTable.relatedId, withdrawalId), eq(transactionsTable.type, "withdrawal")));

  res.json({ message: "Withdrawal rejected and refunded" });
});

export default router;
