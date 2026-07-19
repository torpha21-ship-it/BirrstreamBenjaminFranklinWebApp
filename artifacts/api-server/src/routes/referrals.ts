import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, commissionsTable, userPackagesTable, packagesTable } from "@workspace/db";
import { eq, and, sum } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/referrals/info", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const host = req.headers.host || "birrstream.com";
  const protocol = req.headers["x-forwarded-proto"] || "https";

  const level1 = await db.select().from(usersTable).where(eq(usersTable.referredByUserId, user.id));
  const level1Ids = level1.map(u => u.id);

  let level2Count = 0;
  let level3Count = 0;
  for (const l1Id of level1Ids) {
    const l2 = await db.select().from(usersTable).where(eq(usersTable.referredByUserId, l1Id));
    level2Count += l2.length;
    for (const l2User of l2) {
      const l3 = await db.select().from(usersTable).where(eq(usersTable.referredByUserId, l2User.id));
      level3Count += l3.length;
    }
  }

  const commissions = await db.select().from(commissionsTable).where(eq(commissionsTable.userId, user.id));
  const totalCommissions = commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);

  res.json({
    referralCode: user.referralCode,
    referralLink: `${protocol}://${host}/register?ref=${user.referralCode}`,
    totalDirectReferrals: level1.length,
    totalNetworkSize: level1.length + level2Count + level3Count,
    totalCommissionsEarned: totalCommissions,
    level1Count: level1.length,
    level2Count,
    level3Count,
  });
});

router.get("/referrals/network", requireAuth, async (req, res) => {
  const user = (req as any).user;

  async function getAffiliateEntries(userIds: number[]) {
    const entries = [];
    for (const uid of userIds) {
      const [u] = await db.select().from(usersTable).where(eq(usersTable.id, uid));
      if (!u) continue;
      const [activePkg] = await db.select().from(userPackagesTable)
        .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
        .where(and(eq(userPackagesTable.userId, uid), eq(userPackagesTable.isActive, true)))
        .limit(1);
      const commissions = await db.select().from(commissionsTable).where(
        and(eq(commissionsTable.userId, user.id), eq(commissionsTable.fromUserId, uid))
      );
      entries.push({
        id: u.id,
        username: u.username,
        joinedAt: u.createdAt.toISOString(),
        activeDepositAmount: activePkg ? parseFloat(activePkg.packages.cost) : 0,
        commissionPaid: commissions.reduce((s, c) => s + parseFloat(c.amount), 0),
        hasActivePackage: !!activePkg,
      });
    }
    return entries;
  }

  const level1Users = await db.select().from(usersTable).where(eq(usersTable.referredByUserId, user.id));
  const level1 = await getAffiliateEntries(level1Users.map(u => u.id));

  const level2UsersList = [];
  for (const l1 of level1Users) {
    const l2 = await db.select().from(usersTable).where(eq(usersTable.referredByUserId, l1.id));
    level2UsersList.push(...l2);
  }
  const level2 = await getAffiliateEntries(level2UsersList.map(u => u.id));

  const level3UsersList = [];
  for (const l2 of level2UsersList) {
    const l3 = await db.select().from(usersTable).where(eq(usersTable.referredByUserId, l2.id));
    level3UsersList.push(...l3);
  }
  const level3 = await getAffiliateEntries(level3UsersList.map(u => u.id));

  res.json({ level1, level2, level3 });
});

router.get("/referrals/vip-upgrades", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const level1 = await db.select().from(usersTable).where(eq(usersTable.referredByUserId, user.id));
  const level1Ids = level1.map(u => u.id);

  let downlineVolume = 0;
  for (const lid of level1Ids) {
    const [pkg] = await db.select().from(userPackagesTable)
      .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
      .where(and(eq(userPackagesTable.userId, lid), eq(userPackagesTable.isActive, true)))
      .limit(1);
    if (pkg) downlineVolume += parseFloat(pkg.packages.cost);
  }

  const goals = [
    { id: 1, packageName: "VIP Elite", requiredDirectReferrals: 5, requiredDownlineVolume: 15000 },
    { id: 2, packageName: "VIP Apex", requiredDirectReferrals: 10, requiredDownlineVolume: 50000 },
    { id: 3, packageName: "VIP Titan", requiredDirectReferrals: 20, requiredDownlineVolume: 150000 },
    { id: 4, packageName: "VIP Alpha", requiredDirectReferrals: 50, requiredDownlineVolume: 500000 },
  ];

  const directReferrals = level1.length;

  res.json(goals.map(g => {
    const refProgress = Math.min(1, directReferrals / g.requiredDirectReferrals);
    const volProgress = Math.min(1, downlineVolume / g.requiredDownlineVolume);
    const progressPercent = Math.round(((refProgress + volProgress) / 2) * 100);
    return {
      id: g.id,
      packageName: g.packageName,
      requiredDirectReferrals: g.requiredDirectReferrals,
      requiredDownlineVolume: g.requiredDownlineVolume,
      currentDirectReferrals: directReferrals,
      currentDownlineVolume: downlineVolume,
      isUnlocked: directReferrals >= g.requiredDirectReferrals && downlineVolume >= g.requiredDownlineVolume,
      progressPercent,
    };
  }));
});

export default router;
