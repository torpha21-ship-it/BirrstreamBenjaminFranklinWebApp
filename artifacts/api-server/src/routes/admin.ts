import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  depositsTable,
  withdrawalsTable,
  transactionsTable,
  userPackagesTable,
  commissionsTable,
} from "@workspace/db";
import { eq, and, sql, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/admin";

const router = Router();

/** Commission rates credited to each referral level when a deposit is approved. */
const COMMISSION_RATES: Record<number, number> = { 1: 0.05, 2: 0.03, 3: 0.02 };

/**
 * Walk up to 3 levels of the referral chain and credit commissions.
 * Must be called inside an active Drizzle transaction (pass `tx`).
 */
async function creditReferralCommissions(
  tx: typeof db,
  depositUserId: number,
  depositAmount: number,
): Promise<void> {
  let currentUserId = depositUserId;
  for (let level = 1; level <= 3; level++) {
    const [current] = await tx
      .select({ referredByUserId: usersTable.referredByUserId })
      .from(usersTable)
      .where(eq(usersTable.id, currentUserId))
      .limit(1);

    if (!current?.referredByUserId) break;

    const referrerId = current.referredByUserId;
    const rate = COMMISSION_RATES[level];
    const commission = parseFloat((depositAmount * rate).toFixed(2));

    // Atomically credit the referrer's balance
    await tx
      .update(usersTable)
      .set({ mainBalance: sql`main_balance + ${String(commission)}::numeric` })
      .where(eq(usersTable.id, referrerId));

    // Record in commissions table (for referral dashboard)
    await tx.insert(commissionsTable).values({
      userId: referrerId,
      fromUserId: depositUserId,
      level,
      amount: String(commission),
      description: `Level ${level} referral commission (${(rate * 100).toFixed(0)}% of ${depositAmount.toFixed(2)} ETB deposit)`,
    });

    // Record in transactions table (for transaction history)
    await tx.insert(transactionsTable).values({
      userId: referrerId,
      type: "commission",
      amount: String(commission),
      description: `Level ${level} referral commission from deposit`,
      status: "completed",
    });

    currentUserId = referrerId;
  }
}

// ── Admin Stats ─────────────────────────────────────────────────────────────

router.get("/admin/stats", requireAuth, requireAdmin, async (_req, res) => {
  const [userCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable);

  const [totalsRow] = await db
    .select({
      totalDeposited: sql<string>`coalesce(sum(${usersTable.totalDeposited}), 0)`,
      totalWithdrawn: sql<string>`coalesce(sum(${usersTable.totalWithdrawn}), 0)`,
    })
    .from(usersTable);

  // Use SQL aggregation — never pull all rows just to reduce in JS
  const [depositAgg] = await db
    .select({
      count: sql<number>`count(*)`,
      total: sql<string>`coalesce(sum(amount), '0')`,
    })
    .from(depositsTable)
    .where(eq(depositsTable.status, "pending"));

  const [withdrawalAgg] = await db
    .select({
      count: sql<number>`count(*)`,
      total: sql<string>`coalesce(sum(amount), '0')`,
    })
    .from(withdrawalsTable)
    .where(eq(withdrawalsTable.status, "pending"));

  const [activePkgRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userPackagesTable)
    .where(eq(userPackagesTable.isActive, true));

  res.json({
    totalUsers: Number(userCountRow.count),
    totalDeposited: parseFloat(totalsRow.totalDeposited),
    totalWithdrawn: parseFloat(totalsRow.totalWithdrawn),
    pendingDepositsCount: Number(depositAgg.count),
    pendingDepositsAmount: parseFloat(depositAgg.total),
    pendingWithdrawalsCount: Number(withdrawalAgg.count),
    pendingWithdrawalsAmount: parseFloat(withdrawalAgg.total),
    totalActivePackages: Number(activePkgRow.count),
  });
});

// ── Deposit management ───────────────────────────────────────────────────────

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
      receiptUrl: r.deposits.receiptUrl, // base64 data URL — admins can view the actual image
      status: r.deposits.status,
      createdAt: r.deposits.createdAt.toISOString(),
    })),
  );
});

router.post("/admin/deposits/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  const depositId = parseInt(String(req.params.id), 10);
  if (isNaN(depositId)) {
    res.status(400).json({ error: "Invalid deposit id" });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      // ── Atomic claim: UPDATE with status guard as compare-and-swap ─────────
      // Only one concurrent approve request can update the row from 'pending'.
      // PostgreSQL's row-level lock on UPDATE prevents both requests from
      // succeeding — the second sees 0 rows and we throw.
      const [deposit] = await tx
        .update(depositsTable)
        .set({ status: "approved" })
        .where(and(eq(depositsTable.id, depositId), eq(depositsTable.status, "pending")))
        .returning();

      if (!deposit) {
        throw Object.assign(new Error("CONFLICT"), {
          httpStatus: 400,
          clientMessage: "Deposit not found or already processed.",
        });
      }

      const amount = parseFloat(deposit.amount);

      // ── Credit user balance atomically ────────────────────────────────────
      await tx
        .update(usersTable)
        .set({
          mainBalance: sql`main_balance + ${String(amount)}::numeric`,
          totalDeposited: sql`total_deposited + ${String(amount)}::numeric`,
        })
        .where(eq(usersTable.id, deposit.userId));

      await tx.insert(transactionsTable).values({
        userId: deposit.userId,
        type: "deposit",
        amount: String(amount),
        description: `Deposit approved from ${deposit.senderName}`,
        status: "completed",
        relatedId: depositId,
      });

      // ── Credit referral commissions (up to 3 levels) ─────────────────────
      await creditReferralCommissions(tx as any, deposit.userId, amount);
    });

    res.json({ message: "Deposit approved and credited" });
  } catch (err: any) {
    if (err.httpStatus === 400) {
      res.status(400).json({ error: err.clientMessage });
    } else {
      throw err;
    }
  }
});

router.post("/admin/deposits/:id/reject", requireAuth, requireAdmin, async (req, res) => {
  const depositId = parseInt(String(req.params.id), 10);
  if (isNaN(depositId)) {
    res.status(400).json({ error: "Invalid deposit id" });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      const [deposit] = await tx
        .update(depositsTable)
        .set({ status: "rejected" })
        .where(and(eq(depositsTable.id, depositId), eq(depositsTable.status, "pending")))
        .returning();

      if (!deposit) {
        throw Object.assign(new Error("CONFLICT"), {
          httpStatus: 400,
          clientMessage: "Deposit not found or already processed.",
        });
      }
    });

    res.json({ message: "Deposit rejected" });
  } catch (err: any) {
    if (err.httpStatus === 400) {
      res.status(400).json({ error: err.clientMessage });
    } else {
      throw err;
    }
  }
});

// ── Withdrawal management ────────────────────────────────────────────────────

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
    })),
  );
});

router.post("/admin/withdrawals/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  const withdrawalId = parseInt(String(req.params.id), 10);
  if (isNaN(withdrawalId)) {
    res.status(400).json({ error: "Invalid withdrawal id" });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      // Funds were already deducted when the withdrawal was submitted.
      // Atomically mark approved — status guard prevents double-approval.
      const [withdrawal] = await tx
        .update(withdrawalsTable)
        .set({ status: "approved" })
        .where(and(eq(withdrawalsTable.id, withdrawalId), eq(withdrawalsTable.status, "pending")))
        .returning();

      if (!withdrawal) {
        throw Object.assign(new Error("CONFLICT"), {
          httpStatus: 400,
          clientMessage: "Withdrawal not found or already processed.",
        });
      }

      await tx
        .update(transactionsTable)
        .set({ status: "completed" })
        .where(
          and(
            eq(transactionsTable.relatedId, withdrawalId),
            eq(transactionsTable.type, "withdrawal"),
          ),
        );
    });

    res.json({ message: "Withdrawal approved" });
  } catch (err: any) {
    if (err.httpStatus === 400) {
      res.status(400).json({ error: err.clientMessage });
    } else {
      throw err;
    }
  }
});

router.post("/admin/withdrawals/:id/reject", requireAuth, requireAdmin, async (req, res) => {
  const withdrawalId = parseInt(String(req.params.id), 10);
  if (isNaN(withdrawalId)) {
    res.status(400).json({ error: "Invalid withdrawal id" });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      // Atomically claim the rejection — prevents double-refund race condition
      const [withdrawal] = await tx
        .update(withdrawalsTable)
        .set({ status: "rejected" })
        .where(and(eq(withdrawalsTable.id, withdrawalId), eq(withdrawalsTable.status, "pending")))
        .returning();

      if (!withdrawal) {
        throw Object.assign(new Error("CONFLICT"), {
          httpStatus: 400,
          clientMessage: "Withdrawal not found or already processed.",
        });
      }

      const amount = parseFloat(withdrawal.amount);

      // Atomically refund the previously deducted balance
      await tx
        .update(usersTable)
        .set({
          mainBalance: sql`main_balance + ${String(amount)}::numeric`,
          totalWithdrawn: sql`GREATEST(total_withdrawn - ${String(amount)}::numeric, 0)`,
        })
        .where(eq(usersTable.id, withdrawal.userId));

      await tx
        .update(transactionsTable)
        .set({ status: "rejected" })
        .where(
          and(
            eq(transactionsTable.relatedId, withdrawalId),
            eq(transactionsTable.type, "withdrawal"),
          ),
        );
    });

    res.json({ message: "Withdrawal rejected and refunded" });
  } catch (err: any) {
    if (err.httpStatus === 400) {
      res.status(400).json({ error: err.clientMessage });
    } else {
      throw err;
    }
  }
});

export default router;
