import { Router } from "express";
import { db } from "@workspace/db";
import { dailyTasksTable, userTaskCompletionsTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CompleteTaskParams } from "@workspace/api-zod";
import { getEthiopiaToday } from "../lib/date";

const router = Router();

router.get("/tasks", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const today = getEthiopiaToday();

  const tasks = await db
    .select()
    .from(dailyTasksTable)
    .where(eq(dailyTasksTable.isActive, true));

  const completions = await db
    .select()
    .from(userTaskCompletionsTable)
    .where(
      and(
        eq(userTaskCompletionsTable.userId, user.id),
        eq(userTaskCompletionsTable.date, today),
      ),
    );
  const completedTaskIds = new Set(completions.map(c => c.taskId));

  const taskList = tasks.map(t => {
    const completion = completions.find(c => c.taskId === t.id);
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      reward: parseFloat(t.reward),
      taskType: t.taskType,
      actionUrl: t.actionUrl,
      isCompleted: completedTaskIds.has(t.id),
      completedAt: completion?.completedAt?.toISOString() ?? null,
    };
  });

  res.json(taskList);
});

router.post("/tasks/:id/complete", requireAuth, async (req, res) => {
  const parsed = CompleteTaskParams.safeParse({ id: parseInt(req.params["id"] as string) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid task id" });
    return;
  }

  const user = (req as any).user;
  const today = getEthiopiaToday();

  const [task] = await db
    .select()
    .from(dailyTasksTable)
    .where(eq(dailyTasksTable.id, parsed.data.id));

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  try {
    const result = await db.transaction(async (tx) => {
      // ── Insert completion — DB unique constraint is the final guard ────────
      // The schema enforces UNIQUE (user_id, task_id, date). Under concurrent
      // requests both passing the application-level guard, only one INSERT will
      // succeed; the other will throw a unique_violation (pg code 23505) which
      // we catch below and convert to a 400 response.
      await tx.insert(userTaskCompletionsTable).values({
        userId: user.id,
        taskId: task.id,
        date: today,
        completedAt: new Date(),
      });

      const rewardEarned = parseFloat(task.reward);

      // ── Atomically credit balance — no stale-read risk ────────────────────
      const [updated] = await tx
        .update(usersTable)
        .set({
          mainBalance: sql`main_balance + ${String(rewardEarned)}::numeric`,
          totalYield: sql`total_yield + ${String(rewardEarned)}::numeric`,
        })
        .where(eq(usersTable.id, user.id))
        .returning({ mainBalance: usersTable.mainBalance });

      await tx.insert(transactionsTable).values({
        userId: user.id,
        type: "task_earning",
        amount: String(rewardEarned),
        description: `Task reward: ${task.title}`,
        status: "completed",
      });

      return { rewardEarned, newBalance: parseFloat(updated.mainBalance) };
    });

    res.json({
      success: true,
      rewardEarned: result.rewardEarned,
      newBalance: result.newBalance,
      message: `Earned ${result.rewardEarned} ETB from task!`,
    });
  } catch (err: any) {
    // PostgreSQL unique_violation (23505) — duplicate completion attempted concurrently
    if (err.code === "23505") {
      res.status(400).json({ error: "Task already completed today" });
    } else {
      throw err;
    }
  }
});

export default router;
