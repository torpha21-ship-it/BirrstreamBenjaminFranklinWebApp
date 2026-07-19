import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, userPackagesTable, packagesTable, loginStreakTable, transactionsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { getEthiopiaToday, getEthiopiaYesterday } from "../lib/date";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  const user = (req as any).user;

  // Fetch fresh balance from DB — req.user was populated at auth time and may
  // be stale if yield/tasks/streaks ran concurrently in other tabs.
  const [[freshUser], [activeUserPkg], packages] = await Promise.all([
    db.select({ mainBalance: usersTable.mainBalance }).from(usersTable).where(eq(usersTable.id, user.id)),
    db
      .select()
      .from(userPackagesTable)
      .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
      .where(and(eq(userPackagesTable.userId, user.id), eq(userPackagesTable.isActive, true)))
      .orderBy(desc(userPackagesTable.purchasedAt))
      .limit(1),
    db.select().from(packagesTable).where(eq(packagesTable.isLocked, false)).orderBy(packagesTable.sortOrder),
  ]);

  const userBalance = parseFloat(freshUser?.mainBalance ?? user.mainBalance);
  const reserveFloor = activeUserPkg ? parseFloat(activeUserPkg.packages.cost) * 0.4 : 0;

  let progressToNextTier = 0;
  let nextTierName: string | null = null;
  let daysUntilExpiry: number | null = null;
  let packageExpiresAt: string | null = null;

  if (activeUserPkg) {
    const now = new Date();
    const expires = new Date(activeUserPkg.user_packages.expiresAt);
    daysUntilExpiry = Math.max(
      0,
      Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
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
    mainBalance: userBalance,
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
  const today = getEthiopiaToday();

  let [streak] = await db
    .select()
    .from(loginStreakTable)
    .where(eq(loginStreakTable.userId, user.id));
  if (!streak) {
    [streak] = await db
      .insert(loginStreakTable)
      .values({ userId: user.id, currentStreak: 0, lastCheckinDate: null })
      .returning();
  }

  // Build the 7-day calendar view in Ethiopia timezone
  const days = Array.from({ length: 7 }, (_, i) => {
    const eatNowMs = Date.now() + 3 * 60 * 60 * 1000;
    const d = new Date(eatNowMs);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const daysAgo = 6 - i;
    const checkedIn = streak.lastCheckinDate !== null && daysAgo <= streak.currentStreak - 1;
    return { dayNumber: i + 1, date: dateStr, checkedIn, bonus: 5 };
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
  const today = getEthiopiaToday();
  const yesterday = getEthiopiaYesterday();

  try {
    const result = await db.transaction(async (tx) => {
      // ── Lock the streak row to prevent concurrent double check-in ─────────
      let [streak] = await tx
        .select()
        .from(loginStreakTable)
        .where(eq(loginStreakTable.userId, user.id))
        .for("update");

      if (!streak) {
        [streak] = await tx
          .insert(loginStreakTable)
          .values({ userId: user.id, currentStreak: 0, lastCheckinDate: null })
          .returning();
      }

      if (streak.lastCheckinDate === today) {
        throw Object.assign(new Error("ALREADY_CHECKED_IN"), {
          httpStatus: 400,
          clientMessage: "Already checked in today",
        });
      }

      const newStreak = streak.lastCheckinDate === yesterday ? streak.currentStreak + 1 : 1;
      const bonusEarned = 5;

      await tx
        .update(loginStreakTable)
        .set({ currentStreak: newStreak, lastCheckinDate: today, updatedAt: new Date() })
        .where(eq(loginStreakTable.userId, user.id));

      // ── Atomically credit the streak bonus ────────────────────────────────
      const [updated] = await tx
        .update(usersTable)
        .set({ mainBalance: sql`main_balance + ${String(bonusEarned)}::numeric` })
        .where(eq(usersTable.id, user.id))
        .returning({ mainBalance: usersTable.mainBalance });

      await tx.insert(transactionsTable).values({
        userId: user.id,
        type: "streak_bonus",
        amount: String(bonusEarned),
        description: `Day ${newStreak} login streak bonus`,
        status: "completed",
      });

      return { bonusEarned, newStreak, newBalance: parseFloat(updated.mainBalance) };
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    if (err.httpStatus === 400) {
      res.status(400).json({ error: err.clientMessage });
    } else {
      throw err;
    }
  }
});

export default router;
