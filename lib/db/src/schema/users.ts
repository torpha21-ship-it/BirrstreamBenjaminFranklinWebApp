import { pgTable, serial, text, numeric, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  mainBalance: numeric("main_balance", { precision: 14, scale: 2 }).notNull().default("0"),
  totalYield: numeric("total_yield", { precision: 14, scale: 2 }).notNull().default("0"),
  totalDeposited: numeric("total_deposited", { precision: 14, scale: 2 }).notNull().default("0"),
  totalWithdrawn: numeric("total_withdrawn", { precision: 14, scale: 2 }).notNull().default("0"),
  referralCode: text("referral_code").notNull().unique(),
  referredByUserId: integer("referred_by_user_id"),
  loginStreak: integer("login_streak").notNull().default(0),
  lastLoginAt: timestamp("last_login_at"),
  isAdmin: boolean("is_admin").notNull().default(false),
  profilePhoto: text("profile_photo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
