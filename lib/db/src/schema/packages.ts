import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const packagesTable = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cost: numeric("cost", { precision: 14, scale: 2 }).notNull(),
  dailyReturn: numeric("daily_return", { precision: 14, scale: 2 }).notNull(),
  totalYield: numeric("total_yield", { precision: 14, scale: 2 }).notNull(),
  durationDays: integer("duration_days").notNull().default(7),
  isLocked: boolean("is_locked").notNull().default(false),
  tier: text("tier").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const userPackagesTable = pgTable("user_packages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  packageId: integer("package_id").notNull().references(() => packagesTable.id),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  totalEarned: numeric("total_earned", { precision: 14, scale: 2 }).notNull().default("0"),
});

export const insertPackageSchema = createInsertSchema(packagesTable).omit({ id: true });
export const insertUserPackageSchema = createInsertSchema(userPackagesTable).omit({ id: true });
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packagesTable.$inferSelect;
export type UserPackage = typeof userPackagesTable.$inferSelect;
