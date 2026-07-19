import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, userPackagesTable, packagesTable, loginStreakTable, transactionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const [activeUserPkg] = await db
    .select()
    .from(userPackagesTable)
    .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
    .where(and(eq(userPackagesTable.userId, user.id), eq(userPackagesTable.isActive, true)))
    .orderBy(desc(userPackagesTable.purchasedAt))
    .limit(1);

  const packages = await db.select().from(packagesTable).where(eq(packagesTable.isLocked, false)).orderBy(packagesTable.sortOrder);
  const userBalance = parseFloat(user.mainBalance);
  const reserveFloor = activeUserPkg
    ? parseFloat(activeUserPkg.packages.cost) * 0.4
    : 0;

  let progressToNextTier = 0;
  let nextTierName: string | null = null;
  let daysUntilExpiry: number | null = null;
  let packageExpiresAt: string | null = null;

  if (activeUserPkg) {
    const now = new Date();
    const expires = new Date(activeUserPkg.user_packages.expiresAt);
    daysUntilExpiry = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    packageExpiresAt = expires.toISOString();

    const currentIdx = packages.findIndex(p => p.id === activeUserPkg.user_packages.packageId);
    if (currentIdx >= 0 && currentIdx < packages.length - 1) {
      const nextPkg = packages[currentIdx + 1];
      nextTierName = nextPkg.name;
      progressToNextTier = Math.min(100, (userBalance / parseFloat(nextPkg.cost)) * 100);
    } else {
      progressToNextTier = 100;
    }
  } else if (packages.length > 0) {
    nextTierName = packages[0].name;
    progressToNextTier = Math.min(100, (userBalance / parseFloat(packages[0].cost)) * 100);
  }

  res.json({
    mainBalance: parseFloat(user.mainBalance),
    totalYield: parseFloat(user.totalYield),
    totalDeposited: parseFloat(user.totalDeposited),
    totalWithdrawn: parseFloat(user.totalWithdrawn),
    activePackageName: activeUserPkg ? activeUserPkg.packages.name : null,
    activePackageDailyReturn: activeUserPkg ? parseFloat(activeUserPkg.packages.dailyReturn) : null,
    packageExpiresAt,
    daysUntilExpiry,
    progressToNextTier,
    nextTierName,
    reserveFloor,
  });
});

router.get("/dashboard/streak", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const today = new Date().toISOString().split("T")[0];

  let [streak] = await db.select().from(loginStreakTable).where(eq(loginStreakTable.userId, user.id));
  if (!streak) {
    [streak] = await db.insert(loginStreakTable).values({
      userId: user.id,
      currentStreak: 0,
      lastCheckinDate: null,
    }).returning();
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const daysSinceLastCheckin = streak.lastCheckinDate
      ? Math.floor((new Date(today).getTime() - new Date(streak.lastCheckinDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const daysAgo = 6 - i;
    const checkedIn = streak.lastCheckinDate !== null && daysAgo <= streak.currentStreak - 1;
    return {
      dayNumber: i + 1,
      date: dateStr,
      checkedIn,
      bonus: 5,
    };
  });

  res.json({
    currentStreak: streak.currentStreak,
    days,
    todayCheckedIn: streak.lastCheckinDate === today,
    bonusPerDay: 5,
  });
});

router.post("/dashboard/streak/checkin", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const today = new Date().toISOString().split("T")[0];

  let [streak] = await db.select().from(loginStreakTable).where(eq(loginStreakTable.userId, user.id));
  if (!streak) {
    [streak] = await db.insert(loginStreakTable).values({
      userId: user.id,
      currentStreak: 0,
      lastCheckinDate: null,
    }).returning();
  }

  if (streak.lastCheckinDate === today) {
    res.status(400).json({ error: "Already checked in today" });
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const newStreak = streak.lastCheckinDate === yesterdayStr ? streak.currentStreak + 1 : 1;
  const bonusEarned = 5;

  await db.update(loginStreakTable).set({
    currentStreak: newStreak,
    lastCheckinDate: today,
    updatedAt: new Date(),
  }).where(eq(loginStreakTable.userId, user.id));

  await db.update(usersTable).set({
    mainBalance: String(parseFloat(user.mainBalance) + bonusEarned),
  }).where(eq(usersTable.id, user.id));

  await db.insert(transactionsTable).values({
    userId: user.id,
    type: "streak_bonus",
    amount: String(bonusEarned),
    description: `Day ${newStreak} login streak bonus`,
    status: "completed",
  });

  res.json({
    success: true,
    bonusEarned,
    newStreak,
    newBalance: parseFloat(user.mainBalance) + bonusEarned,
  });
});

export default router;
