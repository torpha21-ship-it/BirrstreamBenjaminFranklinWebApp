import { Router } from "express";
import { db } from "@workspace/db";
import { packagesTable, userPackagesTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { PurchasePackageParams } from "@workspace/api-zod";

const router = Router();

function formatPackage(pkg: any) {
  return {
    id: pkg.id,
    name: pkg.name,
    cost: parseFloat(pkg.cost),
    dailyReturn: parseFloat(pkg.dailyReturn),
    totalYield: parseFloat(pkg.totalYield),
    durationDays: pkg.durationDays,
    isLocked: pkg.isLocked,
    tier: pkg.tier,
  };
}

router.get("/packages", requireAuth, async (req, res) => {
  const pkgs = await db.select().from(packagesTable).orderBy(packagesTable.sortOrder);
  res.json(pkgs.map(formatPackage));
});

router.post("/packages/:id/purchase", requireAuth, async (req, res) => {
  const parsed = PurchasePackageParams.safeParse({ id: parseInt(req.params["id"] as string) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid package id" });
    return;
  }

  const user = (req as any).user;
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, parsed.data.id));

  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  if (pkg.isLocked) {
    res.status(400).json({ error: "Package is locked. Unlock through VIP upgrades." });
    return;
  }

  const cost = parseFloat(pkg.cost);
  const balance = parseFloat(user.mainBalance);

  if (balance < cost) {
    const shortfallAmount = cost - balance;
    res.status(400).json({
      success: false,
      message: `Insufficient balance. Need ${shortfallAmount.toFixed(2)} more ETB to unlock.`,
      shortfallAmount,
    });
    return;
  }

  // Deactivate previous packages
  await db.update(userPackagesTable).set({ isActive: false }).where(
    and(eq(userPackagesTable.userId, user.id), eq(userPackagesTable.isActive, true))
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + pkg.durationDays);

  await db.insert(userPackagesTable).values({
    userId: user.id,
    packageId: pkg.id,
    purchasedAt: new Date(),
    expiresAt,
    isActive: true,
    totalEarned: "0",
  });

  const newBalance = balance - cost;
  await db.update(usersTable).set({
    mainBalance: String(newBalance),
  }).where(eq(usersTable.id, user.id));

  await db.insert(transactionsTable).values({
    userId: user.id,
    type: "deposit",
    amount: String(cost),
    description: `Purchased ${pkg.name} package`,
    status: "completed",
  });

  res.json({
    success: true,
    package: formatPackage(pkg),
    newBalance,
    message: `Successfully activated ${pkg.name}!`,
    shortfallAmount: null,
  });
});

router.get("/packages/active", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const [result] = await db
    .select()
    .from(userPackagesTable)
    .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
    .where(and(eq(userPackagesTable.userId, user.id), eq(userPackagesTable.isActive, true)))
    .orderBy(desc(userPackagesTable.purchasedAt))
    .limit(1);

  if (!result) {
    res.status(404).json({ error: "No active package" });
    return;
  }

  const now = new Date();
  const expires = new Date(result.user_packages.expiresAt);
  const daysRemaining = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = result.packages.durationDays;
  const daysElapsed = totalDays - daysRemaining;
  const dailyReturn = parseFloat(result.packages.dailyReturn);
  const totalEarnedSoFar = daysElapsed * dailyReturn;

  res.json({
    package: formatPackage(result.packages),
    purchasedAt: result.user_packages.purchasedAt.toISOString(),
    expiresAt: expires.toISOString(),
    daysRemaining,
    totalEarnedSoFar,
    dailyEarningsToday: dailyReturn,
  });
});

export default router;
