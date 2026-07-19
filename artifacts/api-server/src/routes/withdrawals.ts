import { Router } from "express";
import { db } from "@workspace/db";
import {
  withdrawalsTable,
  withdrawalSettingsTable,
  usersTable,
  userPackagesTable,
  packagesTable,
  transactionsTable,
} from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { SubmitWithdrawalBody, UpdateWithdrawalSettingsBody } from "@workspace/api-zod";

const router = Router();

router.get("/withdrawals/settings", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const [settings] = await db
    .select()
    .from(withdrawalSettingsTable)
    .where(eq(withdrawalSettingsTable.userId, user.id));
  if (!settings) {
    res.json({ bankName: null, accountName: null, walletId: null, isConfigured: false });
    return;
  }
  res.json({
    bankName: settings.bankName,
    accountName: settings.accountName,
    walletId: settings.walletId,
    isConfigured: !!(settings.bankName && settings.accountName && settings.walletId),
  });
});

router.put("/withdrawals/settings", requireAuth, async (req, res) => {
  const parsed = UpdateWithdrawalSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const user = (req as any).user;
  const { bankName, accountName, walletId } = parsed.data;

  const existing = await db
    .select()
    .from(withdrawalSettingsTable)
    .where(eq(withdrawalSettingsTable.userId, user.id));
  if (existing.length > 0) {
    await db
      .update(withdrawalSettingsTable)
      .set({ bankName, accountName, walletId, updatedAt: new Date() })
      .where(eq(withdrawalSettingsTable.userId, user.id));
  } else {
    await db
      .insert(withdrawalSettingsTable)
      .values({ userId: user.id, bankName, accountName, walletId });
  }

  res.json({ bankName, accountName, walletId, isConfigured: true });
});

router.post("/withdrawals", requireAuth, async (req, res) => {
  const parsed = SubmitWithdrawalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const user = (req as any).user;
  const { amount } = parsed.data;

  try {
    const withdrawal = await db.transaction(async (tx) => {
      // ── 1. Verify withdrawal settings inside the transaction ──────────────
      const [settings] = await tx
        .select()
        .from(withdrawalSettingsTable)
        .where(eq(withdrawalSettingsTable.userId, user.id));
      if (!settings?.bankName || !settings?.accountName || !settings?.walletId) {
        throw Object.assign(new Error("SETTINGS_MISSING"), {
          httpStatus: 400,
          clientMessage: "Please configure withdrawal settings first.",
        });
      }

      // ── 2. Get active package for the reserve-floor check ─────────────────
      const [activeUserPkg] = await tx
        .select()
        .from(userPackagesTable)
        .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
        .where(and(eq(userPackagesTable.userId, user.id), eq(userPackagesTable.isActive, true)))
        .limit(1);

      const reserveFloor = activeUserPkg ? parseFloat(activeUserPkg.packages.cost) * 0.4 : 0;

      // ── 3. Atomically deduct balance ───────────────────────────────────────
      // The WHERE clause enforces both the reserve-floor rule and the balance
      // check in a single statement. PostgreSQL acquires an exclusive row-lock
      // on UPDATE, so concurrent withdrawal requests queue up — the second one
      // will see the already-decremented balance and be rejected.
      const [updated] = await tx
        .update(usersTable)
        .set({
          mainBalance: sql`main_balance - ${String(amount)}::numeric`,
          totalWithdrawn: sql`total_withdrawn + ${String(amount)}::numeric`,
        })
        .where(
          and(
            eq(usersTable.id, user.id),
            sql`(main_balance - ${String(reserveFloor)}::numeric) >= ${String(amount)}::numeric`,
          ),
        )
        .returning({ mainBalance: usersTable.mainBalance });

      if (!updated) {
        // Fetch fresh balance for an accurate error message
        const [fresh] = await tx
          .select({ mainBalance: usersTable.mainBalance })
          .from(usersTable)
          .where(eq(usersTable.id, user.id));
        const balance = parseFloat(fresh?.mainBalance ?? "0");
        const available = Math.max(0, balance - reserveFloor);
        throw Object.assign(new Error("INSUFFICIENT_FUNDS"), {
          httpStatus: 400,
          clientMessage:
            reserveFloor > 0
              ? `Cannot withdraw more than ${available.toFixed(2)} ETB. The 40% reserve rule requires ${reserveFloor.toFixed(2)} ETB in your account.`
              : "Insufficient balance.",
        });
      }

      // ── 4. Insert withdrawal record ────────────────────────────────────────
      const [w] = await tx
        .insert(withdrawalsTable)
        .values({
          userId: user.id,
          amount: String(amount),
          bankName: settings.bankName,
          accountName: settings.accountName,
          walletId: settings.walletId,
          status: "pending",
        })
        .returning();

      // ── 5. Insert transaction log ──────────────────────────────────────────
      await tx.insert(transactionsTable).values({
        userId: user.id,
        type: "withdrawal",
        amount: String(amount),
        description: `Withdrawal to ${settings.bankName}`,
        status: "pending",
        relatedId: w.id,
      });

      return w;
    });

    res.status(201).json({
      id: withdrawal.id,
      amount: parseFloat(withdrawal.amount),
      status: withdrawal.status,
      bankName: withdrawal.bankName,
      accountName: withdrawal.accountName,
      walletId: withdrawal.walletId,
      createdAt: withdrawal.createdAt.toISOString(),
    });
  } catch (err: any) {
    if (err.httpStatus === 400) {
      res.status(400).json({ error: err.clientMessage });
    } else {
      throw err;
    }
  }
});

router.get("/withdrawals/history", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const withdrawals = await db
    .select()
    .from(withdrawalsTable)
    .where(eq(withdrawalsTable.userId, user.id))
    .orderBy(desc(withdrawalsTable.createdAt));

  res.json(
    withdrawals.map(w => ({
      id: w.id,
      amount: parseFloat(w.amount),
      status: w.status,
      bankName: w.bankName,
      accountName: w.accountName,
      walletId: w.walletId,
      createdAt: w.createdAt.toISOString(),
    })),
  );
});

export default router;
