import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, userPackagesTable, packagesTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

/**
 * Credit today's daily yield for the requesting user's active package.
 * Called automatically when the dashboard loads.
 * Idempotent — safe to call multiple times per day (only credits once).
 */
router.post("/yields/credit-daily", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const today = new Date().toISOString().split("T")[0];

  // Check if already credited today
  const existing = await db
    .select()
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, user.id),
        eq(transactionsTable.type, "daily_yield"),
      )
    );

  const alreadyToday = existing.some(t => t.createdAt.toISOString().split("T")[0] === today);
  if (alreadyToday) {
    res.json({ credited: false, reason: "Already credited today", yieldAmount: 0 });
    return;
  }

  // Get active unexpired package
  const [result] = await db
    .select()
    .from(userPackagesTable)
    .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
    .where(and(eq(userPackagesTable.userId, user.id), eq(userPackagesTable.isActive, true)))
    .limit(1);

  if (!result) {
    res.json({ credited: false, reason: "No active package", yieldAmount: 0 });
    return;
  }

  // Check package hasn't expired
  const now = new Date();
  const expires = new Date(result.user_packages.expiresAt);
  if (now > expires) {
    // Mark expired
    await db
      .update(userPackagesTable)
      .set({ isActive: false })
      .where(eq(userPackagesTable.id, result.user_packages.id));

    res.json({ credited: false, reason: "Package expired", yieldAmount: 0 });
    return;
  }

  const dailyReturn = parseFloat(result.packages.dailyReturn);
  const currentBalance = parseFloat(user.mainBalance);
  const newBalance = currentBalance + dailyReturn;
  const newTotalYield = parseFloat(user.totalYield) + dailyReturn;

  await db
    .update(usersTable)
    .set({
      mainBalance: String(newBalance),
      totalYield: String(newTotalYield),
    })
    .where(eq(usersTable.id, user.id));

  await db.insert(transactionsTable).values({
    userId: user.id,
    type: "daily_yield",
    amount: String(dailyReturn),
    description: `Daily yield from ${result.packages.name}`,
    status: "completed",
  });

  res.json({
    credited: true,
    yieldAmount: dailyReturn,
    packageName: result.packages.name,
    newBalance,
  });
});

export default router;
