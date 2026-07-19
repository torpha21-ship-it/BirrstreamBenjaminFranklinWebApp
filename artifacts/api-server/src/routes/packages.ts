import { Router } from "express";
import { db } from "@workspace/db";
import { packagesTable, userPackagesTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
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

  try {
    const result = await db.transaction(async (tx) => {
      const [pkg] = await tx
        .select()
        .from(packagesTable)
        .where(eq(packagesTable.id, parsed.data.id));

      if (!pkg) {
        throw Object.assign(new Error("NOT_FOUND"), {
          httpStatus: 404,
          clientMessage: "Package not found.",
        });
      }
      if (pkg.isLocked) {
        throw Object.assign(new Error("LOCKED"), {
          httpStatus: 400,
          clientMessage: "Package is locked. Unlock through VIP upgrades.",
        });
      }

      const cost = parseFloat(pkg.cost);

      // ── Atomically deduct balance — WHERE enforces sufficient funds ────────
      // If balance < cost the UPDATE touches 0 rows; we throw and the
      // transaction rolls back, so no partial state is ever committed.
      const [updated] = await tx
        .update(usersTable)
        .set({ mainBalance: sql`main_balance - ${String(cost)}::numeric` })
        .where(and(eq(usersTable.id, user.id), sql`main_balance >= ${String(cost)}::numeric`))
        .returning({ mainBalance: usersTable.mainBalance });

      if (!updated) {
        const [fresh] = await tx
          .select({ mainBalance: usersTable.mainBalance })
          .from(usersTable)
          .where(eq(usersTable.id, user.id));
        const balance = parseFloat(fresh?.mainBalance ?? "0");
        const shortfall = cost - balance;
        throw Object.assign(new Error("INSUFFICIENT_FUNDS"), {
          httpStatus: 400,
          clientMessage: `Insufficient balance. Need ${shortfall.toFixed(2)} more ETB to unlock.`,
          shortfallAmount: shortfall,
        });
      }

      // ── Deactivate any currently active packages ──────────────────────────
      await tx
        .update(userPackagesTable)
        .set({ isActive: false })
        .where(and(eq(userPackagesTable.userId, user.id), eq(userPackagesTable.isActive, true)));

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + pkg.durationDays);

      await tx.insert(userPackagesTable).values({
        userId: user.id,
        packageId: pkg.id,
        purchasedAt: new Date(),
        expiresAt,
        isActive: true,
        totalEarned: "0",
      });

      // ── Log with the correct transaction type ─────────────────────────────
      // Previously logged as "deposit" which corrupted transaction history.
      await tx.insert(transactionsTable).values({
        userId: user.id,
        type: "package_purchase",
        amount: String(cost),
        description: `Purchased ${pkg.name} package`,
        status: "completed",
      });

      return { pkg, newBalance: parseFloat(updated.mainBalance) };
    });

    res.json({
      success: true,
      package: formatPackage(result.pkg),
      newBalance: result.newBalance,
      message: `Successfully activated ${result.pkg.name}!`,
      shortfallAmount: null,
    });
  } catch (err: any) {
    if (err.httpStatus === 404) {
      res.status(404).json({ error: err.clientMessage });
    } else if (err.httpStatus === 400) {
      res.status(400).json({
        success: false,
        message: err.clientMessage,
        shortfallAmount: err.shortfallAmount ?? null,
      });
    } else {
      throw err;
    }
  }
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
  const daysRemaining = Math.max(
    0,
    Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );
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
