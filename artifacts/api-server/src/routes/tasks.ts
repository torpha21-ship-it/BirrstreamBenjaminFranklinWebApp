import { Router } from "express";
import { db } from "@workspace/db";
import { dailyTasksTable, userTaskCompletionsTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CompleteTaskParams } from "@workspace/api-zod";

const router = Router();

router.get("/tasks", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const today = new Date().toISOString().split("T")[0];

  const tasks = await db.select().from(dailyTasksTable).where(eq(dailyTasksTable.isActive, true));
  const completions = await db.select().from(userTaskCompletionsTable).where(
    and(eq(userTaskCompletionsTable.userId, user.id), eq(userTaskCompletionsTable.date, today))
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
  const today = new Date().toISOString().split("T")[0];

  const [task] = await db.select().from(dailyTasksTable).where(eq(dailyTasksTable.id, parsed.data.id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const existing = await db.select().from(userTaskCompletionsTable).where(
    and(
      eq(userTaskCompletionsTable.userId, user.id),
      eq(userTaskCompletionsTable.taskId, task.id),
      eq(userTaskCompletionsTable.date, today)
    )
  );

  if (existing.length > 0) {
    res.status(400).json({ error: "Task already completed today" });
    return;
  }

  await db.insert(userTaskCompletionsTable).values({
    userId: user.id,
    taskId: task.id,
    date: today,
    completedAt: new Date(),
  });

  const rewardEarned = parseFloat(task.reward);
  const newBalance = parseFloat(user.mainBalance) + rewardEarned;

  await db.update(usersTable).set({
    mainBalance: String(newBalance),
    totalYield: String(parseFloat(user.totalYield) + rewardEarned),
  }).where(eq(usersTable.id, user.id));

  await db.insert(transactionsTable).values({
    userId: user.id,
    type: "task_earning",
    amount: String(rewardEarned),
    description: `Task reward: ${task.title}`,
    status: "completed",
  });

  res.json({
    success: true,
    rewardEarned,
    newBalance,
    message: `Earned ${rewardEarned} ETB from task!`,
  });
});

export default router;
