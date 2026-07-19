---
name: BirrStream money operation pattern
description: Required pattern for any code that reads or writes user balances or financial records
---

## The rule

Every operation that moves money (balance change, withdrawal, deposit approval, package purchase, task reward, yield credit, streak bonus) **must**:

1. Run inside `db.transaction(async (tx) => { ... })`
2. Use atomic SQL arithmetic instead of read-modify-write:
   ```ts
   // CORRECT
   await tx.update(usersTable)
     .set({ mainBalance: sql`main_balance + ${String(amount)}::numeric` })
     .where(eq(usersTable.id, userId));

   // WRONG — reads stale req.user.mainBalance, then overwrites DB
   const newBalance = parseFloat(user.mainBalance) + amount;
   await db.update(usersTable).set({ mainBalance: String(newBalance) });
   ```
3. For operations that must check balance first (withdrawals, purchases), use a conditional WHERE and check the returned row count:
   ```ts
   const [updated] = await tx.update(usersTable)
     .set({ mainBalance: sql`main_balance - ${String(cost)}::numeric` })
     .where(and(eq(usersTable.id, userId), sql`main_balance >= ${String(cost)}::numeric`))
     .returning();
   if (!updated) throw Object.assign(new Error("INSUFFICIENT"), { httpStatus: 400, ... });
   ```
4. For idempotency-sensitive operations (yield, streaks), lock the user row first:
   ```ts
   await tx.execute(sql`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`);
   // OR for streak table:
   const [streak] = await tx.select().from(loginStreakTable).where(...).for("update");
   ```
5. Atomic status-claim for admin approve/reject (prevents double-approval race):
   ```ts
   const [deposit] = await tx.update(depositsTable)
     .set({ status: "approved" })
     .where(and(eq(depositsTable.id, id), eq(depositsTable.status, "pending")))
     .returning();
   if (!deposit) throw Object.assign(new Error("CONFLICT"), { httpStatus: 400, ... });
   ```

**Why:** Without transactions, a server crash between two DB writes leaves permanently inconsistent state. Without atomic SQL increments, concurrent requests both read the same stale balance and both commit their calculation, creating phantom money.

**How to apply:** Any new endpoint that touches `main_balance`, `total_withdrawn`, `total_deposited`, `total_yield`, or inserts into `transactions` must follow this pattern exactly.

## Error signaling inside transactions

Throw a tagged error to trigger rollback AND surface a user-facing message:
```ts
throw Object.assign(new Error("SENTINEL_CODE"), { httpStatus: 400, clientMessage: "Human-readable error" });
```
Catch outside the transaction:
```ts
} catch (err: any) {
  if (err.httpStatus === 400) res.status(400).json({ error: err.clientMessage });
  else throw err;
}
```
