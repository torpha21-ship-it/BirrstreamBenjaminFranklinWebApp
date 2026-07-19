import { useState } from "react";
import { useSubmitWithdrawal, useListWithdrawals, getListWithdrawalsQueryKey, useGetWithdrawalSettings, getGetWithdrawalSettingsQueryKey, useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings2, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-[#D4B61B]", bg: "bg-[#F5E6A3]", label: "Pending" },
  approved: { icon: CheckCircle2, color: "text-[#2B7A4B]", bg: "bg-[#A8D5B5]", label: "Approved" },
  rejected: { icon: XCircle, color: "text-[#C0402E]", bg: "bg-[#F2A89A]", label: "Rejected" },
};

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Withdraw() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const submitMutation = useSubmitWithdrawal();
  const { data: summary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: settings } = useGetWithdrawalSettings({ query: { queryKey: getGetWithdrawalSettingsQueryKey() } });
  const { data: withdrawals } = useListWithdrawals({ query: { queryKey: getListWithdrawalsQueryKey() } });

  const available = Math.max(0, (summary?.mainBalance ?? 0) - (summary?.reserveFloor ?? 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    submitMutation.mutate(
      { data: { amount: amountNum } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListWithdrawalsQueryKey() });
          qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: "Withdrawal submitted!", description: "Will be processed within 24 hours." });
          setAmount("");
        },
        onError: (err: any) => {
          toast({ title: "Withdrawal failed", description: "Cannot breach the 40% reserve requirement.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>Withdraw Funds</h1>
        <Link href="/withdrawal-settings" className="ml-auto w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
        </Link>
      </div>

      {/* Balance Info */}
      <div className="bg-[#1A1A1A] rounded-3xl p-5 mb-5 text-white">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-xs mb-1" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>Main Balance</p>
            <p className="text-2xl font-bold">{fmt(summary?.mainBalance ?? 0)}</p>
            <p className="text-gray-400 text-xs" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>ETB</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>Available to Withdraw</p>
            <p className="text-2xl font-bold text-primary">{fmt(available)}</p>
            <p className="text-gray-400 text-xs" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>ETB</p>
          </div>
        </div>
        {summary?.reserveFloor && summary.reserveFloor > 0 && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-white/5 rounded-2xl">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs">40% reserve rule: {fmt(summary.reserveFloor)} ETB must remain in your account while {summary.activePackageName} is active.</p>
          </div>
        )}
      </div>

      {/* Settings Warning */}
      {!settings?.isConfigured && (
        <Link href="/withdrawal-settings" className="flex items-center gap-3 bg-[#F5E6A3] rounded-2xl p-4 mb-5 border border-[#D4B61B]/30">
          <AlertTriangle className="w-5 h-5 text-[#8B7200] flex-shrink-0" />
          <div>
            <p className="font-semibold text-[#8B7200] text-sm">Configure bank settings first</p>
            <p className="text-[#8B7200]/70 text-xs">Tap to set your bank/wallet details</p>
          </div>
        </Link>
      )}

      {settings?.isConfigured && (
        <div className="bg-card rounded-2xl p-4 mb-5 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Withdrawing to</p>
          <p className="font-semibold text-foreground text-sm">{settings.bankName} — {settings.accountName}</p>
          <p className="text-xs text-muted-foreground">{settings.walletId}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-card rounded-3xl p-5 border border-border mb-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Withdrawal Amount (ETB)</label>
            <input
              type="number" min="1" step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`Max: ${fmt(available)} ETB`}
              required
              className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitMutation.isPending || !settings?.isConfigured || available <= 0}
            className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {submitMutation.isPending ? "Submitting..." : "Request Withdrawal"}
          </button>
        </form>
      </div>

      {/* History */}
      {withdrawals && withdrawals.length > 0 && (
        <div>
          <h2 className="font-bold text-foreground mb-3">Recent Withdrawals</h2>
          <div className="space-y-3">
            {withdrawals.slice(0, 5).map(w => {
              const cfg = STATUS_CONFIG[w.status as keyof typeof STATUS_CONFIG];
              const Icon = cfg?.icon ?? Clock;
              return (
                <div key={w.id} className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg?.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg?.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{fmt(w.amount)} ETB</p>
                      <p className="text-xs text-muted-foreground">{w.bankName} · {new Date(w.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg?.bg} ${cfg?.color}`}>{cfg?.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
