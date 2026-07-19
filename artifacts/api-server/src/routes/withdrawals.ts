import { Router } from "express";
import { db } from "@workspace/db";
import { withdrawalsTable, withdrawalSettingsTable, usersTable, userPackagesTable, packagesTable, transactionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { SubmitWithdrawalBody, UpdateWithdrawalSettingsBody } from "@workspace/api-zod";

const router = Router();

router.get("/withdrawals/settings", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const [settings] = await db.select().from(withdrawalSettingsTable).where(eq(withdrawalSettingsTable.userId, user.id));
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

  const existing = await db.select().from(withdrawalSettingsTable).where(eq(withdrawalSettingsTable.userId, user.id));
  if (existing.length > 0) {
    await db.update(withdrawalSettingsTable).set({ bankName, accountName, walletId, updatedAt: new Date() }).where(eq(withdrawalSettingsTable.userId, user.id));
  } else {
    await db.insert(withdrawalSettingsTable).values({ userId: user.id, bankName, accountName, walletId });
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

  const [settings] = await db.select().from(withdrawalSettingsTable).where(eq(withdrawalSettingsTable.userId, user.id));
  if (!settings?.bankName || !settings?.accountName || !settings?.walletId) {
    res.status(400).json({ error: "Please configure withdrawal settings first." });
    return;
  }

  // Check 40% reserve rule
  const [activeUserPkg] = await db
    .select()
    .from(userPackagesTable)
    .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
    .where(and(eq(userPackagesTable.userId, user.id), eq(userPackagesTable.isActive, true)))
    .limit(1);

  const balance = parseFloat(user.mainBalance);
  const reserveFloor = activeUserPkg ? parseFloat(activeUserPkg.packages.cost) * 0.4 : 0;
  const availableForWithdrawal = balance - reserveFloor;

  if (amount > availableForWithdrawal) {
    res.status(400).json({
      error: `Cannot withdraw more than ${availableForWithdrawal.toFixed(2)} ETB. The 40% reserve rule requires you to maintain ${reserveFloor.toFixed(2)} ETB in your account.`,
    });
    return;
  }

  if (amount > balance) {
    res.status(400).json({ error: "Insufficient balance" });
    return;
  }

  const [withdrawal] = await db.insert(withdrawalsTable).values({
    userId: user.id,
    amount: String(amount),
    bankName: settings.bankName,
    accountName: settings.accountName,
    walletId: settings.walletId,
    status: "pending",
  }).returning();

  await db.update(usersTable).set({
    mainBalance: String(balance - amount),
    totalWithdrawn: String(parseFloat(user.totalWithdrawn) + amount),
  }).where(eq(usersTable.id, user.id));

  await db.insert(transactionsTable).values({
    userId: user.id,
    type: "withdrawal",
    amount: String(amount),
    description: `Withdrawal to ${settings.bankName}`,
    status: "pending",
    relatedId: withdrawal.id,
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
});

router.get("/withdrawals/history", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const withdrawals = await db.select().from(withdrawalsTable)
    .where(eq(withdrawalsTable.userId, user.id))
    .orderBy(desc(withdrawalsTable.createdAt));

  res.json(withdrawals.map(w => ({
    id: w.id,
    amount: parseFloat(w.amount),
    status: w.status,
    bankName: w.bankName,
    accountName: w.accountName,
    walletId: w.walletId,
    createdAt: w.createdAt.toISOString(),
  })));
});

export default router;
