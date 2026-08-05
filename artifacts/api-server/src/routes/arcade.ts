import { Router } from "express";
import { db, usersTable, transactionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

/**
 * Endpoint called when a user completes an Arcade game spin.
 * Atomically updates PostgreSQL main_balance and logs an arcade_win / arcade_loss transaction.
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

  const mobName = req.body.mobName;
  const rawAmount = req.body.amount;
  const amount = Math.min(1000, Math.max(-500, rawAmount));

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
