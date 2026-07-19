import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const commissionsTable = pgTable("commissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id), // who receives
  fromUserId: integer("from_user_id").notNull().references(() => usersTable.id), // who triggered
  level: integer("level").notNull(), // 1, 2, or 3
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCommissionSchema = createInsertSchema(commissionsTable).omit({ id: true, createdAt: true });
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Commission = typeof commissionsTable.$inferSelect;
