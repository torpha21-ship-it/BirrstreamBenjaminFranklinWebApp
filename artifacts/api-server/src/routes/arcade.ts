import { Router } from "express";
import { db, usersTable, transactionsTable, userPackagesTable, packagesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { getEthiopiaToday } from "../lib/date";

const router = Router();

/**
 * Helper to compute user's arcade spin capabilities based on active VIP packages.
 */
async function getUserArcadeStatus(userId: number) {
  const today = getEthiopiaToday();

  // Query active packages joined with package definitions
  const activePackages = await db
    .select({
      id: userPackagesTable.id,
      packageId: userPackagesTable.packageId,
      sortOrder: packagesTable.sortOrder,
      tier: packagesTable.tier,
      name: packagesTable.name,
    })
    .from(userPackagesTable)
    .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
    .where(
      and(
        eq(userPackagesTable.userId, userId),
        eq(userPackagesTable.isActive, true),
        sql`user_packages.expires_at > NOW()`,
      ),
    );

  if (activePackages.length === 0) {
    return {
      hasActiveVip: false,
      highestPackageName: null,
      maxSpins: 0,
      spinsToday: 0,
      spinsRemaining: 0,
      isUnlimited: false,
      canSpin: false,
      message: "Active VIP package required to play Arcade games.",
    };
  }

  // Find package with highest sortOrder (VIP 1 = 1, VIP 2 = 2, VIP 3 = 3, VIP 4+ = 4+)
  let highestPkg = activePackages[0];
  for (const pkg of activePackages) {
    if (pkg.sortOrder > highestPkg.sortOrder) {
      highestPkg = pkg;
    }
  }

  const isUnlimited = highestPkg.sortOrder >= 4;
  const maxSpins = isUnlimited ? Infinity : highestPkg.sortOrder;

  // Count spins today
  const [spinCountRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, userId),
        sql`description LIKE 'Arcade%'`,
        sql`to_char(created_at + interval '3 hours', 'YYYY-MM-DD') = ${today}`,
      ),
    );

  const spinsToday = spinCountRes?.count || 0;
  const spinsRemaining = isUnlimited ? Infinity : Math.max(0, maxSpins - spinsToday);
  const canSpin = isUnlimited || spinsToday < maxSpins;

  return {
    hasActiveVip: true,
    highestPackageName: highestPkg.name,
    highestSortOrder: highestPkg.sortOrder,
    maxSpins: isUnlimited ? "Unlimited" : maxSpins,
    spinsToday,
    spinsRemaining: isUnlimited ? "Unlimited" : spinsRemaining,
    isUnlimited,
    canSpin,
    message: canSpin
      ? (isUnlimited ? "Unlimited VIP 4+ Free Spins!" : `${spinsRemaining} of ${maxSpins} spin(s) left today`)
      : `Daily limit of ${maxSpins} spin(s) reached for ${highestPkg.name}. Upgrade to VIP 4 for UNLIMITED spins!`,
  };
}

/**
 * GET /api/arcade/status
 * Returns current user's arcade spin limits and remaining allowance.
 */
router.get("/arcade/status", requireAuth, async (req, res) => {
  const user = (req as any).user;
  try {
    const status = await getUserArcadeStatus(user.id);
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch arcade status" });
  }
});

/**
 * Endpoint called when a user completes an Arcade game spin.
 * Enforces Tiered VIP daily spin limits.
 * Atomically updates PostgreSQL main_balance and logs a transaction.
 */
router.post("/arcade/claim", requireAuth, async (req, res) => {
  const user = (req as any).user;

  if (
    !req.body ||
    typeof req.body.mobName !== "string" ||
    typeof req.body.amount !== "number" ||
    isNaN(req.body.amount)
  ) {
    res.status(400).json({ error: "Invalid arcade claim payload" });
    return;
  }

  // Check spin limits
  const status = await getUserArcadeStatus(user.id);

  if (!status.hasActiveVip) {
    res.status(400).json({ error: status.message });
    return;
  }

  if (!status.canSpin) {
    res.status(400).json({ error: status.message });
    return;
  }

  const mobName = req.body.mobName;
  const rawAmount = req.body.amount;
  const amount = Math.min(215, Math.max(-65, rawAmount));

  try {
    const result = await db.transaction(async (tx) => {
      // Row lock to prevent race conditions during rapid spins
      await tx.execute(sql`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`);

      const [updated] = await tx
        .update(usersTable)
        .set({
          mainBalance: sql`GREATEST(main_balance + ${String(amount)}::numeric, 0)`,
        })
        .where(eq(usersTable.id, user.id))
        .returning({ mainBalance: usersTable.mainBalance });

      const isWin = amount >= 0;

      await tx.insert(transactionsTable).values({
        userId: user.id,
        type: isWin ? "task_earning" : "admin_adjustment",
        amount: String(Math.abs(amount)),
        description: isWin
          ? `Arcade Win: ${mobName} (+${amount} ETB)`
          : `Arcade Loss: ${mobName} (${amount} ETB)`,
        status: "completed",
      });

      return parseFloat(updated.mainBalance);
    });

    res.json({
      success: true,
      amount,
      newBalance: result,
      message: amount >= 0 ? `Won +${amount} ETB!` : `Lost ${amount} ETB`,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to process arcade claim" });
  }
});

export default router;
