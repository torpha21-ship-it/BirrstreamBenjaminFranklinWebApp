import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAdminStats, getGetAdminStatsQueryKey,
  useListPendingDeposits, getListPendingDepositsQueryKey,
  useListPendingWithdrawals, getListPendingWithdrawalsQueryKey,
  useApproveDeposit, useRejectDeposit,
  useApproveWithdrawal, useRejectWithdrawal,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, TrendingUp, TrendingDown, Clock, Check, X, ShieldAlert, Package } from "lucide-react";
import { Redirect } from "wouter";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type Tab = "deposits" | "withdrawals";

export default function Admin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("deposits");

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey(), enabled: !!user?.isAdmin },
  });
  const { data: pendingDeposits, isLoading: depositsLoading } = useListPendingDeposits({
    query: { queryKey: getListPendingDepositsQueryKey(), enabled: !!user?.isAdmin },
  });
  const { data: pendingWithdrawals, isLoading: withdrawalsLoading } = useListPendingWithdrawals({
    query: { queryKey: getListPendingWithdrawalsQueryKey(), enabled: !!user?.isAdmin },
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    qc.invalidateQueries({ queryKey: getListPendingDepositsQueryKey() });
    qc.invalidateQueries({ queryKey: getListPendingWithdrawalsQueryKey() });
  };

  const approveDeposit = useApproveDeposit({
    mutation: {
      onSuccess: () => { toast({ title: "Deposit approved and credited" }); invalidateAll(); },
      onError: () => toast({ title: "Failed to approve deposit", variant: "destructive" }),
    },
  });
  const rejectDeposit = useRejectDeposit({
    mutation: {
      onSuccess: () => { toast({ title: "Deposit rejected" }); invalidateAll(); },
      onError: () => toast({ title: "Failed to reject deposit", variant: "destructive" }),
    },
  });
  const approveWithdrawal = useApproveWithdrawal({
    mutation: {
      onSuccess: () => { toast({ title: "Withdrawal approved" }); invalidateAll(); },
      onError: () => toast({ title: "Failed to approve withdrawal", variant: "destructive" }),
    },
  });
  const rejectWithdrawal = useRejectWithdrawal({
    mutation: {
      onSuccess: () => { toast({ title: "Withdrawal rejected and refunded" }); invalidateAll(); },
      onError: () => toast({ title: "Failed to reject withdrawal", variant: "destructive" }),
    },
  });

  if (user && !user.isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, suffix: "", color: "bg-[#C9BDF5]", textColor: "text-[#5B44BE]" },
    { label: "Total Deposited", value: stats?.totalDeposited ?? 0, icon: TrendingUp, suffix: "ETB", color: "bg-[#A8D5B5]", textColor: "text-[#2B7A4B]" },
    { label: "Total Withdrawn", value: stats?.totalWithdrawn ?? 0, icon: TrendingDown, suffix: "ETB", color: "bg-[#F2A89A]", textColor: "text-[#C0402E]" },
    { label: "Active Packages", value: stats?.totalActivePackages ?? 0, icon: Package, suffix: "", color: "bg-[#F5E6A3]", textColor: "text-[#8B7200]" },
  ];

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto md:max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map(({ label, value, icon: Icon, suffix, color, textColor }) => (
          <div key={label} className={`${color} rounded-2xl p-4`}>
            <Icon className={`w-4 h-4 ${textColor} opacity-70 mb-2`} />
            {statsLoading ? (
              <div className="h-6 bg-white/30 rounded animate-pulse w-16 mb-1" />
            ) : (
              <p className={`text-lg font-bold ${textColor}`}>
                {typeof value === "number" && suffix ? fmt(value) : value}
              </p>
            )}
            <p className={`text-xs ${textColor} opacity-60`}>{label}{suffix ? ` (${suffix})` : ""}</p>
          </div>
        ))}
      </div>

      {/* Pending summary banner */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-bold text-foreground">{stats?.pendingDepositsCount ?? 0} pending deposits</p>
            <p className="text-xs text-muted-foreground">{fmt(stats?.pendingDepositsAmount ?? 0)} ETB</p>
          </div>
        </div>
        <div className="flex-1 bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#D4B61B]" />
          <div>
            <p className="text-sm font-bold text-foreground">{stats?.pendingWithdrawalsCount ?? 0} pending withdrawals</p>
            <p className="text-xs text-muted-foreground">{fmt(stats?.pendingWithdrawalsAmount ?? 0)} ETB</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "deposits" as Tab, label: `Deposits (${pendingDeposits?.length ?? 0})` },
          { key: "withdrawals" as Tab, label: `Withdrawals (${pendingWithdrawals?.length ?? 0})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Deposits tab */}
      {tab === "deposits" && (
        <div className="space-y-3">
          {depositsLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {!depositsLoading && pendingDeposits?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No pending deposits</div>
          )}
          {pendingDeposits?.map(d => (
            <div key={d.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-foreground">{fmt(d.amount)} ETB</p>
                <p className="text-sm text-muted-foreground truncate">{d.fullName} (@{d.username})</p>
                <p className="text-xs text-muted-foreground">Sender: {d.senderName}</p>
                <p className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => approveDeposit.mutate({ id: d.id })}
                  disabled={approveDeposit.isPending}
                  className="w-9 h-9 bg-[#A8D5B5] text-[#2B7A4B] rounded-full flex items-center justify-center hover:opacity-80 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => rejectDeposit.mutate({ id: d.id })}
                  disabled={rejectDeposit.isPending}
                  className="w-9 h-9 bg-[#F2A89A] text-[#C0402E] rounded-full flex items-center justify-center hover:opacity-80 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Withdrawals tab */}
      {tab === "withdrawals" && (
        <div className="space-y-3">
          {withdrawalsLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {!withdrawalsLoading && pendingWithdrawals?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No pending withdrawals</div>
          )}
          {pendingWithdrawals?.map(w => (
            <div key={w.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-foreground">{fmt(w.amount)} ETB</p>
                <p className="text-sm text-muted-foreground truncate">{w.fullName} (@{w.username})</p>
                <p className="text-xs text-muted-foreground">{w.bankName} — {w.accountName} — {w.walletId}</p>
                <p className="text-xs text-muted-foreground">{new Date(w.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => approveWithdrawal.mutate({ id: w.id })}
                  disabled={approveWithdrawal.isPending}
                  className="w-9 h-9 bg-[#A8D5B5] text-[#2B7A4B] rounded-full flex items-center justify-center hover:opacity-80 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => rejectWithdrawal.mutate({ id: w.id })}
                  disabled={rejectWithdrawal.isPending}
                  className="w-9 h-9 bg-[#F2A89A] text-[#C0402E] rounded-full flex items-center justify-center hover:opacity-80 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
