import { Router } from "express";
import { db, usersTable, transactionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { z } from "zod";

const router = Router();

const ClaimResultBody = z.object({
  mobId: z.string(),
  mobName: z.string(),
  amount: z.number().min(-500).max(1000),
});

/**
 * Endpoint called when a user completes an Arcade game spin.
 * Atomically updates PostgreSQL main_balance and logs an arcade_win / arcade_loss transaction.
 */
router.post("/arcade/claim", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = ClaimResultBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid arcade claim payload" });
    return;
  }

  const { mobName, amount } = parsed.data;

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
        type: isWin ? "arcade_win" : "arcade_loss",
        amount: String(Math.abs(amount)),
        description: `Arcade: ${mobName} (${isWin ? "+" : ""}${amount} ETB)`,
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
