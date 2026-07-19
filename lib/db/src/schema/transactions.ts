import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  type: text("type").notNull(), // deposit, withdrawal, task_earning, commission, streak_bonus, daily_yield
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("completed"), // pending, completed, rejected
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const depositsTable = pgTable("deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  senderName: text("sender_name").notNull(),
  receiptUrl: text("receipt_url"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const withdrawalsTable = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  walletId: text("wallet_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const withdrawalSettingsTable = pgTable("withdrawal_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  bankName: text("bank_name"),
  accountName: text("account_name"),
  walletId: text("wallet_id"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export const insertDepositSchema = createInsertSchema(depositsTable).omit({ id: true, createdAt: true });
export const insertWithdrawalSchema = createInsertSchema(withdrawalsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
export type Deposit = typeof depositsTable.$inferSelect;
export type Withdrawal = typeof withdrawalsTable.$inferSelect;
