import { useEffect, useRef } from "react";
import { useListDeposits, getListDepositsQueryKey, useListWithdrawals, getListWithdrawalsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { showEarningAlert } from "@/components/earning-alert";

export type NewTxEvent = { txType: "deposit" | "withdrawal"; amount: number };

export const NEW_EVENTS_KEY = "birr_new_events";

export function addNewEvent(event: NewTxEvent) {
  try {
    const existing: NewTxEvent[] = JSON.parse(localStorage.getItem(NEW_EVENTS_KEY) ?? "[]");
    existing.push(event);
    localStorage.setItem(NEW_EVENTS_KEY, JSON.stringify(existing));
  } catch {}
}

export function useDepositWatcher() {
  const { user } = useAuth();

  const { data: deposits } = useListDeposits({
    query: {
      queryKey: getListDepositsQueryKey(),
      refetchInterval: 30000,
      enabled: !!user,
    },
  });

  const { data: withdrawals } = useListWithdrawals({
    query: {
      queryKey: getListWithdrawalsQueryKey(),
      refetchInterval: 30000,
      enabled: !!user,
    },
  });

  const knownDepositStatuses = useRef<Record<number, string>>({});
  const depositInit = useRef(false);

  const knownWithdrawalStatuses = useRef<Record<number, string>>({});
  const withdrawalInit = useRef(false);

  useEffect(() => {
    if (!deposits) return;

    if (!depositInit.current) {
      deposits.forEach(dep => { knownDepositStatuses.current[dep.id] = dep.status; });
      depositInit.current = true;
      return;
    }

    deposits.forEach(dep => {
      const prev = knownDepositStatuses.current[dep.id];
      if (prev === "pending" && dep.status === "approved") {
        showEarningAlert({
          type: "deposit",
          title: "Deposit Approved!",
          amount: `+${dep.amount.toLocaleString("en-ET", { minimumFractionDigits: 2 })} ETB`,
          description: "Your deposit has been verified and added to your balance.",
        });
        addNewEvent({ txType: "deposit", amount: dep.amount });
      }
      knownDepositStatuses.current[dep.id] = dep.status;
    });
  }, [deposits]);

  useEffect(() => {
    if (!withdrawals) return;

    if (!withdrawalInit.current) {
      withdrawals.forEach(w => { knownWithdrawalStatuses.current[w.id] = w.status; });
      withdrawalInit.current = true;
      return;
    }

    withdrawals.forEach(w => {
      const prev = knownWithdrawalStatuses.current[w.id];
      if (prev === "pending" && w.status === "approved") {
        showEarningAlert({
          type: "withdrawal_approved",
          title: "Withdrawal Approved!",
          amount: `${w.amount.toLocaleString("en-ET", { minimumFractionDigits: 2 })} ETB`,
          description: "Your withdrawal has been processed and is on its way.",
        });
        addNewEvent({ txType: "withdrawal", amount: w.amount });
      } else if (prev === "pending" && w.status === "rejected") {
        showEarningAlert({
          type: "withdrawal_rejected",
          title: "Withdrawal Rejected",
          amount: `${w.amount.toLocaleString("en-ET", { minimumFractionDigits: 2 })} ETB`,
          description: "Your withdrawal was not approved. Contact support for details.",
        });
        addNewEvent({ txType: "withdrawal", amount: w.amount });
      }
      knownWithdrawalStatuses.current[w.id] = w.status;
    });
  }, [withdrawals]);
}
