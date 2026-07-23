import { Router } from "express";
import { db } from "@workspace/db";
import {
  depositsTable,
  packagesTable,
  transactionsTable,
  userPackagesTable,
  usersTable,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/portfolio", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const [[freshUser], userPackages, approvedDeposits, recentTransactions] = await Promise.all([
    db
      .select({
        mainBalance: usersTable.mainBalance,
        totalDeposited: usersTable.totalDeposited,
      })
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .limit(1),
    db
      .select({
        id: userPackagesTable.id,
        packageId: userPackagesTable.packageId,
        name: packagesTable.name,
        tier: packagesTable.tier,
        cost: packagesTable.cost,
        dailyReturn: packagesTable.dailyReturn,
        totalYield: packagesTable.totalYield,
        durationDays: packagesTable.durationDays,
        purchasedAt: userPackagesTable.purchasedAt,
        expiresAt: userPackagesTable.expiresAt,
        isActive: userPackagesTable.isActive,
        totalEarned: userPackagesTable.totalEarned,
      })
      .from(userPackagesTable)
      .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
      .where(eq(userPackagesTable.userId, user.id))
      .orderBy(desc(userPackagesTable.purchasedAt)),
    db
      .select({
        id: depositsTable.id,
        amount: depositsTable.amount,
        senderName: depositsTable.senderName,
        status: depositsTable.status,
        createdAt: depositsTable.createdAt,
      })
      .from(depositsTable)
      .where(eq(depositsTable.userId, user.id))
      .orderBy(desc(depositsTable.createdAt)),
    db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, user.id))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(8),
  ]);

  const now = new Date();

  const approvedFundingSources = approvedDeposits.filter((deposit) => deposit.status === "approved");

  const normalizedFundingSources = approvedFundingSources.map((deposit) => ({
    id: deposit.id,
    amount: parseFloat(deposit.amount),
    senderName: deposit.senderName,
    createdAt: deposit.createdAt.toISOString(),
  }));

  const formattedPackages = userPackages.map((userPackage) => {
    const purchasedAt = new Date(userPackage.purchasedAt);
    const expiresAt = new Date(userPackage.expiresAt);
    const cost = parseFloat(userPackage.cost);
    const dailyReturn = parseFloat(userPackage.dailyReturn);
    const projectedTotalYield = parseFloat(userPackage.totalYield);
    const totalEarned = parseFloat(userPackage.totalEarned);
    const totalDurationMs = Math.max(1, expiresAt.getTime() - purchasedAt.getTime());
    const elapsedMs = Math.max(0, Math.min(totalDurationMs, now.getTime() - purchasedAt.getTime()));
    const daysRemaining = Math.max(
      0,
      Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const daysElapsed = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));
    const linkedFundingSource =
      approvedFundingSources.find((deposit) => deposit.createdAt.getTime() <= purchasedAt.getTime()) ?? null;
    const isActive = userPackage.isActive && now < expiresAt;

    return {
      id: userPackage.id,
      packageId: userPackage.packageId,
      name: userPackage.name,
      tier: userPackage.tier,
      cost,
      dailyReturn,
      projectedTotalYield,
      projectedReturnRemaining: Math.max(0, projectedTotalYield - totalEarned),
      totalEarned,
      durationDays: userPackage.durationDays,
      daysElapsed,
      daysRemaining,
      progressPercent,
      purchasedAt: purchasedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive,
      fundingSourceId: linkedFundingSource?.id ?? null,
      fundingSourceSenderName: linkedFundingSource?.senderName ?? null,
      fundingSourceAmount: linkedFundingSource ? parseFloat(linkedFundingSource.amount) : null,
      fundingSourceCreatedAt: linkedFundingSource?.createdAt.toISOString() ?? null,
    };
  });

  const activePackages = formattedPackages.filter((portfolioPackage) => portfolioPackage.isActive);
  const completedPackages = formattedPackages.filter((portfolioPackage) => !portfolioPackage.isActive);

  res.json({
    summary: {
      availableBalance: parseFloat(freshUser?.mainBalance ?? user.mainBalance),
      totalDeposited: parseFloat(freshUser?.totalDeposited ?? user.totalDeposited),
      activeCapital: activePackages.reduce((sum, portfolioPackage) => sum + portfolioPackage.cost, 0),
      totalInvested: formattedPackages.reduce((sum, portfolioPackage) => sum + portfolioPackage.cost, 0),
      activePackagesCount: activePackages.length,
      completedPackagesCount: completedPackages.length,
      totalEarnedAllTime: formattedPackages.reduce(
        (sum, portfolioPackage) => sum + portfolioPackage.totalEarned,
        0,
      ),
      totalProjectedYield: activePackages.reduce(
        (sum, portfolioPackage) => sum + portfolioPackage.projectedTotalYield,
        0,
      ),
      totalProjectedReturnRemaining: activePackages.reduce(
        (sum, portfolioPackage) => sum + portfolioPackage.projectedReturnRemaining,
        0,
      ),
    },
    activePackages,
    completedPackages,
    fundingSources: normalizedFundingSources.slice(0, 5),
    recentTransactions: recentTransactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: parseFloat(transaction.amount),
      description: transaction.description,
      status: transaction.status,
      createdAt: transaction.createdAt.toISOString(),
    })),
  });
});

export default router;
