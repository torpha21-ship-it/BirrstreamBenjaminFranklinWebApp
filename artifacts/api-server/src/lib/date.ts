/**
 * Returns today's date string in YYYY-MM-DD format using Ethiopia timezone (EAT = UTC+3).
 * Ethiopia observes East Africa Time year-round with no DST.
 * All "daily" boundaries (yield, tasks, streaks) use this instead of UTC
 * so that midnight in Ethiopia — not 3 am — resets the day for users.
 */
export function getEthiopiaToday(): string {
  const now = new Date();
  // Offset UTC to EAT (UTC+3)
  const eatMs = now.getTime() + 3 * 60 * 60 * 1000;
  return new Date(eatMs).toISOString().split("T")[0];
}

/**
 * Returns yesterday's date string in EAT timezone.
 */
export function getEthiopiaYesterday(): string {
  const now = new Date();
  const eatMs = now.getTime() + 3 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000;
  return new Date(eatMs).toISOString().split("T")[0];
}
