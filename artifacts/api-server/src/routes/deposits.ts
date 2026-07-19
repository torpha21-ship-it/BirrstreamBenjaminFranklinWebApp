import { Router } from "express";
import { db } from "@workspace/db";
import { depositsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { SubmitDepositBody } from "@workspace/api-zod";

const router = Router();

router.post("/deposits", requireAuth, async (req, res) => {
  const parsed = SubmitDepositBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const user = (req as any).user;
  const { amount, senderName, receiptBase64 } = parsed.data;

  if (amount < 500 || amount > 50000) {
    res.status(400).json({ error: "Amount must be between 500 and 50,000 ETB" });
    return;
  }

  const [deposit] = await db.insert(depositsTable).values({
    userId: user.id,
    amount: String(amount),
    senderName,
    receiptUrl: receiptBase64 ? "receipt_uploaded" : null,
    status: "pending",
  }).returning();

  res.status(201).json({
    id: deposit.id,
    amount: parseFloat(deposit.amount),
    senderName: deposit.senderName,
    receiptUrl: deposit.receiptUrl,
    status: deposit.status,
    createdAt: deposit.createdAt.toISOString(),
  });
});

router.get("/deposits/history", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const deposits = await db.select().from(depositsTable)
    .where(eq(depositsTable.userId, user.id))
    .orderBy(desc(depositsTable.createdAt));

  res.json(deposits.map(d => ({
    id: d.id,
    amount: parseFloat(d.amount),
    senderName: d.senderName,
    receiptUrl: d.receiptUrl,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
  })));
});

export default router;
