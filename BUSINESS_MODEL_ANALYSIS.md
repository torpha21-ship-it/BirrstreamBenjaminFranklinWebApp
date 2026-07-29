# BirrStream Business Model - Deep Analysis

## Overview

BirrStream (now Naomi Labs) is a VIP package investment platform where users deposit Ethiopian Birr (ETB), purchase VIP packages, and earn daily yields. The platform operates a multi-tier referral commission system and a task-reward ecosystem. This document provides a thorough analysis of how users deposit money, how they make money, and how the website owner generates revenue.

---

## 1. How Users Deposit Money

### 1.1 Deposit Flow

1. **User initiates a deposit** from the Deposit page, specifying:
   - Amount (between 500 and 50,000 ETB)
   - Sender name
   - Receipt photo (base64-encoded image)

2. **Deposit record is created** in the deposits table with status pending

3. **Admin reviews the deposit** in the admin panel (/admin/deposits/pending). The admin can:
   - **Approve**: Credits the deposit amount to the users mainBalance and totalDeposited
   - **Reject**: Marks the deposit as rejected (funds are not credited)

4. **On approval**, the users balance is updated atomically

5. **Referral commissions** are automatically credited to the referrer chain (up to 3 levels) when a deposit is approved.

### 1.2 Key Details

- **No automated payment gateway**: Deposits are manual - users upload a receipt and an admin must approve it. This means the platform has full discretion over which deposits to accept.
- **Receipt verification**: Admins can view the actual receipt image (base64 data URL) to verify the deposit.
- **Amount limits**: Minimum 500 ETB, maximum 50,000 ETB per deposit.
- **Case-insensitive matching**: Usernames and emails are compared case-insensitively to prevent duplicate accounts.

---

## 2. How Users Make Money

Users can earn ETB through four distinct mechanisms:

### 2.1 VIP Package Daily Yields (Primary Income)

This is the core earning mechanism:

1. **User purchases a VIP package** using their mainBalance
   - Packages range from VIP 1 (500 ETB) to VIP Titan (100,000 ETB)
   - Each package has a cost, dailyReturn, totalYield, and durationDays (7 days)
   - Example: VIP 1 costs 500 ETB, returns 35 ETB/day, total yield 245 ETB over 7 days

2. **Daily yield is credited automatically** when the user loads the dashboard
   - Endpoint: POST /api/yields/credit-daily
   - The system checks for an active, unexpired package
   - Credits dailyReturn amount to mainBalance and totalYield
   - Idempotent: only one yield per day per user (enforced by SQL date filter + row lock)

3. **Yield continues until package expires**
   - After durationDays (7 days), the package is deactivated
   - Total earned = dailyReturn * durationDays

**VIP Package Tiers:**

| Tier | Cost (ETB) | Daily Return (ETB) | Total Yield (ETB) | Duration |
|------|-----------|-------------------|-------------------|----------|
| VIP 1 | 500 | 35 | 245 | 7 days |
| VIP 2 | 1,000 | 80 | 560 | 7 days |
| VIP 3 | 2,000 | 180 | 1,260 | 7 days |
| VIP 4 | 5,000 | 500 | 3,500 | 7 days |
| VIP 5 | 10,000 | 1,100 | 7,700 | 7 days |
| VIP Elite | 25,000 | 3,000 | 21,000 | 7 days |
| VIP Apex | 50,000 | 7,000 | 49,000 | 7 days |
| VIP Titan | 100,000 | 16,000 | 112,000 | 7 days |
| VIP Alpha | 250,000 | 45,000 | 315,000 | 7 days |

### 2.2 Daily Tasks

Users complete simple tasks to earn ETB:

- **Task types**: stream_video, open_page, join_telegram, other
- **Rewards**: Range from 10 ETB to 25 ETB per task
- **Daily limit**: One completion per task per day
- **Rate-limited**: 3 completions per day per user (server-side limiter)

### 2.3 Referral Commissions (3-Tier)

When a users deposit is approved by admin, their referral chain earns commissions:

| Level | Commission Rate | Example (on 5,000 ETB deposit) |
|-------|----------------|-------------------------------|
| Level 1 (direct referrer) | 5% | 250 ETB |
| Level 2 (referrers referrer) | 3% | 150 ETB |
| Level 3 (level 2s referrer) | 2% | 100 ETB |

- Commissions are credited to the referrers mainBalance immediately upon deposit approval
- Recorded in both the commissions table and transactions table
- Users can track their referral network up to 3 levels deep

### 2.4 VIP Upgrade Goals (Indirect)

Users can unlock higher-tier VIP packages by meeting referral milestones:

| Goal | Required Direct Referrals | Required Downline Volume |
|------|--------------------------|-------------------------|
| VIP Elite | 5 | 15,000 ETB |
| VIP Apex | 10 | 50,000 ETB |
| VIP Titan | 20 | 150,000 ETB |
| VIP Alpha | 50 | 500,000 ETB |

---

## 3. How the Website Owner Makes Money

The owners revenue model is primarily **implicit** rather than explicit - the platform does not charge a visible transaction fee or commission on deposits/yields. Instead, revenue is generated through several mechanisms:

### 3.1 The 40% Reserve Rule (Locked Capital)

This is the most significant revenue mechanism:

- When a user has an **active VIP package**, they **cannot withdraw more than 60%** of their available balance
- The remaining **40% is locked** as a reserve that stays in the platforms control
- Formula: withdrawable = mainBalance - (packageCost * 0.4)

**Example**: A user with VIP 1 (cost 500 ETB) has 200 ETB locked as reserve. They can only withdraw from the remaining balance above this floor.

**Impact**: Over time, as users purchase packages and earn yields, a growing portion of the platforms total deposit pool becomes locked and cannot be withdrawn. This effectively means the platform holds more capital than it needs to cover withdrawals.

### 3.2 Admin Control Over Deposits and Withdrawals

The admin has **full discretionary power** over the money flow:

- **Deposit approval**: The admin can reject any deposit, meaning user funds never enter the system
- **Withdrawal rejection**: The admin can reject any withdrawal request, keeping funds in the platform
- **No automated payout**: All withdrawals require admin approval, creating a bottleneck the platform controls

This gives the platform owner the ability to:
- Delay or deny withdrawals at will
- Control the cash-out rate to manage liquidity
- Reject withdrawals if the platforms reserve pool is insufficient

### 3.3 Deposit Pool Accumulation

As users deposit ETB and purchase VIP packages:
- The daily yields are paid from the platforms pool of deposited funds
- The 40% reserve stays locked in user accounts
- Withdrawals are only approved at the admins discretion
- Over time, the net flow tends toward the platform retaining more capital than it distributes

### 3.4 No Explicit Platform Fee

Notably, the codebase does **not** contain any explicit platform fee, commission, or rake taken by the owner from:
- Deposits (100% credited to user on approval)
- Daily yields (100% credited to user)
- Task rewards (100% credited to user)
- Referral commissions (paid from the platforms pool, not deducted from the user)

The owners  revenue is the **opportunity cost of locked capital** and the **discretionary control** over the withdrawal pipeline.

---

## 4. Money Flow Diagram

`
USER DEPOSITS ETB
       |
       v
  [Admin Approval] ---- REJECT -> Funds returned to user
       |
       v (APPROVE)
  User balance credited
       |
       +--> Buy VIP Package (balance deducted)
       |         |
       |         v
       |    Daily Yield credited (every dashboard load)
       |         |
       |         v
       |    40% RESERVE LOCKED (cannot withdraw)
       |    60% WITHDRAWABLE (admin must approve)
       |
       +--> Complete Tasks -> Task reward credited
       |
       +--> Refer Friends -> Referral commissions credited
                    |
                    v
               When referred user deposits,
               commissions flow up the chain
               (Level 1: 5%, Level 2: 3%, Level 3: 2%)
`

---

## 5. Risk Assessment

### 5.1 Platform Risk (Owner)
- **Liquidity risk**: If too many users request withdrawals simultaneously, the admin may not have enough unlocked funds to approve all of them
- **Operational risk**: The platform relies on manual admin approval for deposits and withdrawals - if the admin is unavailable, users cannot cash out
- **Regulatory risk**: This model resembles a Ponzi scheme structure where early investors are paid from new deposits. The 40% reserve rule partially mitigates this but does not eliminate the structural risk

### 5.2 User Risk
- **No guaranteed yield**: Yields depend on the platform having sufficient funds to pay them
- **Withdrawal dependency**: All withdrawals require admin approval - users have no guaranteed access to their funds
- **Reserve lockup**: 40% of package cost is permanently locked while the package is active
- **Package expiry**: After 7 days, the package deactivates and no further yields are earned

### 5.3 Structural Observations
- The platform has **no explicit fee or commission** taken from users - all revenue is derived from the reserve rule and admin discretion
- The **40% reserve rule** is the primary mechanism that keeps capital in the platform
- The **admin approval gate** for both deposits and withdrawals gives the owner complete control over the money flow
- **Referral commissions** are paid from the platforms pool, not from a deduction of the depositors funds

---

## 6. Summary

| Aspect | Mechanism |
|--------|-----------|
| **User deposits** | Manual receipt upload -> admin approval -> balance credited |
| **User earnings** | VIP daily yields (7-day cycles), task rewards, 3-tier referral commissions |
| **Owner revenue** | 40% reserve rule locks capital; admin controls deposit/withdrawal pipeline; no explicit fee |
| **Key risk** | Platform-controlled liquidity; manual approval bottleneck; no automated payout guarantee |
| **Withdrawal rule** | Cannot withdraw within 40% of active package cost |

---

*Analysis generated from codebase review of artifacts/api-server/, lib/db/src/schema/, and supabase_setup.sql.*

---

## Correction: Net Loss for Lower-Tier Packages

A critical observation from the VIP package math:

| Tier | Cost (ETB) | Total Yield (ETB) | Net Result |
|------|-----------|-------------------|------------|
| VIP 1 | 500 | 245 | **-255 ETB (loss)** |
| VIP 2 | 1,000 | 560 | **-440 ETB (loss)** |
| VIP 3 | 2,000 | 1,260 | **-740 ETB (loss)** |
| VIP 4 | 5,000 | 3,500 | **-1,500 ETB (loss)** |
| VIP 5 | 10,000 | 7,700 | **-2,300 ETB (loss)** |
| VIP Elite | 25,000 | 21,000 | **-4,000 ETB (loss)** |
| VIP Apex | 50,000 | 49,000 | **-1,000 ETB (loss)** |
| VIP Titan | 100,000 | 112,000 | **+12,000 ETB (profit)** |
| VIP Alpha | 250,000 | 315,000 | **+65,000 ETB (profit)** |

Only VIP Titan and VIP Alpha produce a net profit for the user. All lower tiers result in a net loss, meaning the user effectively loses their principal minus the small yield returned.

This confirms the platform owner does not need to take an explicit fee — the 40% reserve rule and the structure of lower-tier packages (where users lose money) are the primary mechanisms that keep capital in the platform.
