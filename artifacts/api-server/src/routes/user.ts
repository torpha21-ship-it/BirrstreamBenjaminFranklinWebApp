import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { UpdateUserProfileBody, DeleteAccountBody } from "@workspace/api-zod";

const router = Router();

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function formatUser(user: any) {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    mainBalance: parseFloat(user.mainBalance),
    totalYield: parseFloat(user.totalYield),
    totalDeposited: parseFloat(user.totalDeposited),
    totalWithdrawn: parseFloat(user.totalWithdrawn),
    referralCode: user.referralCode,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/user/profile", requireAuth, (req, res) => {
  res.json(formatUser((req as any).user));
});

router.patch("/user/profile", requireAuth, async (req, res) => {
  const parsed = UpdateUserProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const user = (req as any).user;
  const updates: Record<string, string> = {};
  if (parsed.data.fullName) {
    const fullName = parsed.data.fullName.trim();
    if (!fullName) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    updates.fullName = fullName;
  }
  if (parsed.data.email) {
    const email = normalizeEmail(parsed.data.email);
    if (!email) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(
        and(
          sql`lower(${usersTable.email}) = ${email}`,
          sql`${usersTable.id} <> ${user.id}`,
        ),
      )
      .limit(1);

    if (existing) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    updates.email = email;
  }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, user.id)).returning();
  res.json(formatUser(updated));
});

router.patch("/user/profile-photo", requireAuth, async (req, res) => {
  const { photoBase64 } = req.body ?? {};
  if (typeof photoBase64 !== "string" || !photoBase64.startsWith("data:image/")) {
    res.status(400).json({ error: "Invalid image data" });
    return;
  }
  const user = (req as any).user;
  const [updated] = await db
    .update(usersTable)
    .set({ profilePhoto: photoBase64 })
    .where(eq(usersTable.id, user.id))
    .returning();
  res.json(formatUser(updated));
});

router.delete("/user/delete", requireAuth, async (req, res) => {
  const parsed = DeleteAccountBody.safeParse(req.body);
  if (!parsed.success || parsed.data.confirmationText !== "DELETE MY ACCOUNT") {
    res.status(400).json({ error: "Confirmation text does not match. Please type 'DELETE MY ACCOUNT' exactly." });
    return;
  }
  const user = (req as any).user;
  try {
    await db.delete(usersTable).where(eq(usersTable.id, user.id));
    res.json({ message: "Account successfully deleted." });
  } catch (err: any) {
    if (err.code === "23503") {
      res.status(400).json({
        error: "Cannot delete account with existing financial or transaction history. Please contact support.",
      });
    } else {
      throw err;
    }
  }
});

export default router;
