import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  userPackagesTable,
  packagesTable,
  transactionsTable,
} from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/admin";
import { formatUser } from "./auth";

const router = Router();

// GET /api/admin/users — list all users (paginated, 50 per page)
router.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query["page"] ?? "1"), 10) || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const users = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      fullName: usersTable.fullName,
      email: usersTable.email,
      mainBalance: usersTable.mainBalance,
      isAdmin: usersTable.isAdmin,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable);

  res.json({
    users: users.map((u) => ({
      ...u,
      mainBalance: parseFloat(u.mainBalance),
      createdAt: u.createdAt.toISOString(),
    })),
    total: Number(count),
    page,
    totalPages: Math.ceil(Number(count) / limit),
  });
});

// GET /api/admin/users/:id — full user detail
router.get("/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const userId = parseInt(String(req.params["id"]), 10);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [activePackage] = await db
    .select()
    .from(userPackagesTable)
    .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
    .where(
      and(
        eq(userPackagesTable.userId, userId),
        eq(userPackagesTable.isActive, true),
      ),
    )
    .limit(1);

  const recentTransactions = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, userId))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(10);

  const [commissionTotal] = await db
    .select({ total: sql<string>`coalesce(sum(amount), '0')` })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, userId),
        eq(transactionsTable.type, "commission"),
      ),
    );

  res.json({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    mainBalance: parseFloat(user.mainBalance),
    totalYield: parseFloat(user.totalYield),
    totalDeposited: parseFloat(user.totalDeposited),
    totalWithdrawn: parseFloat(user.totalWithdrawn),
    referralCode: user.referralCode,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt.toISOString(),
    activePackage: activePackage ? activePackage.packages.name : null,
    recentTransactions: recentTransactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount),
      description: t.description,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    })),
    totalCommissionsEarned: parseFloat(commissionTotal.total),
  });
});

// POST /api/admin/users/:id/adjust-balance — manually credit or debit balance
router.post(
  "/admin/users/:id/adjust-balance",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const userId = parseInt(String(req.params["id"]), 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }

    const { amount, reason } = (req.body ?? {}) as {
      amount?: unknown;
      reason?: unknown;
    };
    if (
      typeof amount !== "number" ||
      amount === 0 ||
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      res.status(400).json({
        error: "amount (non-zero number) and reason (string) are required",
      });
      return;
    }

    try {
      const result = await db.transaction(async (tx) => {
        // Atomic adjustment. For debits, the WHERE clause guarantees the
        // balance never goes negative; 0 rows returned means it would have.
        const [updated] = await tx
          .update(usersTable)
          .set({ mainBalance: sql`main_balance + ${String(amount)}::numeric` })
          .where(
            amount < 0
              ? and(
                  eq(usersTable.id, userId),
                  sql`main_balance + ${String(amount)}::numeric >= 0`,
                )
              : eq(usersTable.id, userId),
          )
          .returning({ mainBalance: usersTable.mainBalance });

        if (!updated) {
          throw Object.assign(new Error("INSUFFICIENT"), {
            httpStatus: 400,
            clientMessage: "Cannot reduce balance below zero.",
          });
        }

        await tx.insert(transactionsTable).values({
          userId,
          type: "admin_adjustment",
          amount: String(Math.abs(amount)),
          description: `Admin balance adjustment: ${reason}`,
          status: "completed",
        });

        return { newBalance: parseFloat(updated.mainBalance) };
      });

      res.json({ message: "Balance adjusted", newBalance: result.newBalance });
    } catch (err: any) {
      if (err.httpStatus === 400) {
        res.status(400).json({ error: err.clientMessage });
      } else {
        throw err;
      }
    }
  },
);

export default router;
