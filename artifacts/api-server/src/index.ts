import app from "./app";
import { logger } from "./lib/logger";
import { db, userPackagesTable, packagesTable, usersTable, transactionsTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { getEthiopiaToday } from "./lib/date";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

// ---------------------------------------------------------------------------
// Package expiry daemon — deactivates any active package whose expiry has
// passed. Runs once every hour. The daily-yield credit path already checks
// expiry lazily; this daemon is the background safety net so expired packages
// never linger as "active" between yield credits.
// ---------------------------------------------------------------------------
setInterval(
  async () => {
    try {
      const result = await db
        .update(userPackagesTable)
        .set({ isActive: false })
        .where(
          and(
            eq(userPackagesTable.isActive, true),
            sql`expires_at < NOW()`,
          ),
        );
      if (result.rowCount && result.rowCount > 0) {
        logger.info({ count: result.rowCount }, "Expired packages deactivated");
      }
    } catch (err) {
      logger.error({ err }, "Package expiry daemon error");
    }
  },
  60 * 60 * 1000,
);

// ---------------------------------------------------------------------------
// Daily yield credit daemon — ensures users with active packages receive
// their daily yield even if they don't open the app that day.
// Runs every 6 hours. Uses the same idempotency guard as the
// /api/yields/credit-daily endpoint (check for today's daily_yield
// transaction + FOR UPDATE row lock), so double-crediting is impossible.
// ---------------------------------------------------------------------------
setInterval(
  async () => {
    try {
      const today = getEthiopiaToday();

      // Find all active, unexpired user_packages with their daily return
      const activePackages = await db
        .select({
          userId: userPackagesTable.userId,
          userPackageId: userPackagesTable.id,
          dailyReturn: packagesTable.dailyReturn,
          packageName: packagesTable.name,
          expiresAt: userPackagesTable.expiresAt,
        })
        .from(userPackagesTable)
        .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
        .where(
          and(
            eq(userPackagesTable.isActive, true),
            sql`expires_at > NOW()`,
          ),
        );

      if (activePackages.length === 0) return;

      let credited = 0;

      for (const pkg of activePackages) {
        try {
          await db.transaction(async (tx) => {
            // Lock the user row to prevent races with concurrent dashboard yield calls
            await tx.execute(sql`SELECT id FROM users WHERE id = ${pkg.userId} FOR UPDATE`);

            // Idempotency: skip if today's yield already exists for this user
            const [existing] = await tx
              .select({ id: transactionsTable.id })
              .from(transactionsTable)
              .where(
                and(
                  eq(transactionsTable.userId, pkg.userId),
                  eq(transactionsTable.type, "daily_yield"),
                  sql`to_char(created_at + interval '3 hours', 'YYYY-MM-DD') = ${today}`,
                ),
              )
              .limit(1);

            if (existing) return; // Already credited today (by dashboard or earlier daemon run)

            const dailyReturn = parseFloat(pkg.dailyReturn);

            // Atomically credit balance + totalYield
            await tx
              .update(usersTable)
              .set({
                mainBalance: sql`main_balance + ${String(dailyReturn)}::numeric`,
                totalYield: sql`total_yield + ${String(dailyReturn)}::numeric`,
              })
              .where(eq(usersTable.id, pkg.userId));

            await tx.insert(transactionsTable).values({
              userId: pkg.userId,
              type: "daily_yield",
              amount: String(dailyReturn),
              description: `Daily yield from ${pkg.packageName}`,
              status: "completed",
            });

            credited++;
          });
        } catch (userErr) {
          // Log per-user errors but continue crediting other users
          logger.error({ err: userErr, userId: pkg.userId }, "Yield daemon: failed to credit user");
        }
      }

      if (credited > 0) {
        logger.info({ count: credited, total: activePackages.length }, "Yield daemon: daily yields credited");
      }
    } catch (err) {
      logger.error({ err }, "Yield daemon error");
    }
  },
  6 * 60 * 60 * 1000, // Every 6 hours
);
