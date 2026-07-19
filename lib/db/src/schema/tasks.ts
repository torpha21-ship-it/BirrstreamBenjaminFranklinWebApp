import { pgTable, serial, integer, numeric, text, timestamp, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const dailyTasksTable = pgTable("daily_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: numeric("reward", { precision: 8, scale: 2 }).notNull(),
  taskType: text("task_type").notNull(), // stream_video, open_page, join_telegram, other
  actionUrl: text("action_url"),
  isActive: boolean("is_active").notNull().default(true),
});

export const userTaskCompletionsTable = pgTable(
  "user_task_completions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id),
    taskId: integer("task_id").notNull().references(() => dailyTasksTable.id),
    completedAt: timestamp("completed_at").notNull().defaultNow(),
    date: text("date").notNull(), // YYYY-MM-DD for daily reset (Ethiopia timezone)
  },
  (table) => ({
    // DB-level unique constraint: a user can only complete a given task once per day.
    // This is the last line of defence against concurrent duplicate-completion requests
    // that both pass the application-level guard before either writes.
    uniqueCompletion: unique("uq_task_completion_daily").on(table.userId, table.taskId, table.date),
  }),
);

export const loginStreakTable = pgTable("login_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  lastCheckinDate: text("last_checkin_date"), // YYYY-MM-DD (Ethiopia timezone)
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDailyTaskSchema = createInsertSchema(dailyTasksTable).omit({ id: true });
export type InsertDailyTask = z.infer<typeof insertDailyTaskSchema>;
export type DailyTask = typeof dailyTasksTable.$inferSelect;
