import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, commissionsTable, userPackagesTable, packagesTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// ---------------------------------------------------------------------------
// Batch affiliate entry builder — replaces the original N+1 per-user loop.
// Issues exactly 3 queries (users, active packages, commissions) regardless
// of network size, then assembles results in memory.
// ---------------------------------------------------------------------------
async function getBatchAffiliateEntries(
  userIds: number[],
  viewerUserId: number,
): Promise<Array<{
  id: number;
  username: string;
  joinedAt: string;
  activeDepositAmount: number;
  commissionPaid: number;
  hasActivePackage: boolean;
}>> {
  if (userIds.length === 0) return [];

  const [users, activePkgs, commissions] = await Promise.all([
    db.select().from(usersTable).where(inArray(usersTable.id, userIds)),
    db
      .select()
      .from(userPackagesTable)
      .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
      .where(and(inArray(userPackagesTable.userId, userIds), eq(userPackagesTable.isActive, true))),
    db
      .select()
      .from(commissionsTable)
      .where(
        and(
          eq(commissionsTable.userId, viewerUserId),
          inArray(commissionsTable.fromUserId, userIds),
        ),
      ),
  ]);

  const pkgByUserId = new Map(activePkgs.map(p => [p.user_packages.userId, p]));
  const commissionByFromUserId = new Map<number, number>();
  for (const c of commissions) {
    commissionByFromUserId.set(
      c.fromUserId,
      (commissionByFromUserId.get(c.fromUserId) ?? 0) + parseFloat(c.amount),
    );
  }

  return users.map(u => {
    const pkg = pkgByUserId.get(u.id);
    return {
      id: u.id,
      username: u.username,
      joinedAt: u.createdAt.toISOString(),
      activeDepositAmount: pkg ? parseFloat(pkg.packages.cost) : 0,
      commissionPaid: commissionByFromUserId.get(u.id) ?? 0,
      hasActivePackage: pkgByUserId.has(u.id),
    };
  });
}

// ---------------------------------------------------------------------------
// Helper: fetch one level of referral IDs given a set of parent IDs
// ---------------------------------------------------------------------------
async function getChildIds(parentIds: number[]): Promise<number[]> {
  if (parentIds.length === 0) return [];
  const rows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(inArray(usersTable.referredByUserId, parentIds));
  return rows.map(r => r.id);
}

// ---------------------------------------------------------------------------

router.get("/referrals/info", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const host = req.headers.host || "birrstream.com";
  const protocol = req.headers["x-forwarded-proto"] || "https";

  const level1Ids = await getChildIds([user.id]);
  const level2Ids = await getChildIds(level1Ids);
  const level3Ids = await getChildIds(level2Ids);

  const allCommissions = await db
    .select()
    .from(commissionsTable)
    .where(eq(commissionsTable.userId, user.id));
  const totalCommissionsEarned = allCommissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);

  res.json({
    referralCode: user.referralCode,
    referralLink: `${protocol}://${host}/register?ref=${user.referralCode}`,
    totalDirectReferrals: level1Ids.length,
    totalNetworkSize: level1Ids.length + level2Ids.length + level3Ids.length,
    totalCommissionsEarned,
    level1Count: level1Ids.length,
    level2Count: level2Ids.length,
    level3Count: level3Ids.length,
  });
});

router.get("/referrals/network", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const level1Ids = await getChildIds([user.id]);
  const level2Ids = await getChildIds(level1Ids);
  const level3Ids = await getChildIds(level2Ids);

  // 3 parallel calls × 3 queries each = 9 total DB round-trips, regardless of network size
  const [level1Entries, level2Entries, level3Entries] = await Promise.all([
    getBatchAffiliateEntries(level1Ids, user.id),
    getBatchAffiliateEntries(level2Ids, user.id),
    getBatchAffiliateEntries(level3Ids, user.id),
  ]);

  res.json({ level1: level1Entries, level2: level2Entries, level3: level3Entries });
});

router.get("/referrals/vip-upgrades", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const level1Ids = await getChildIds([user.id]);

  let downlineVolume = 0;
  if (level1Ids.length > 0) {
    const activePkgs = await db
      .select()
      .from(userPackagesTable)
      .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
      .where(and(inArray(userPackagesTable.userId, level1Ids), eq(userPackagesTable.isActive, true)));
    downlineVolume = activePkgs.reduce((sum, p) => sum + parseFloat(p.packages.cost), 0);
  }

  const directReferrals = level1Ids.length;
  const goals = [
    { id: 1, packageName: "VIP Elite", requiredDirectReferrals: 5, requiredDownlineVolume: 15000 },
    { id: 2, packageName: "VIP Apex", requiredDirectReferrals: 10, requiredDownlineVolume: 50000 },
    { id: 3, packageName: "VIP Titan", requiredDirectReferrals: 20, requiredDownlineVolume: 150000 },
    { id: 4, packageName: "VIP Alpha", requiredDirectReferrals: 50, requiredDownlineVolume: 500000 },
  ];

  res.json(
    goals.map(g => {
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
    }),
  );
});

export default router;
