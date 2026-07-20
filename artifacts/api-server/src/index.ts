import app from "./app";
import { logger } from "./lib/logger";
import { db, userPackagesTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";

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
