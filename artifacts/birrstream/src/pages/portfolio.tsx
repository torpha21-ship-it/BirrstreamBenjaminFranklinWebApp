import { getGetPortfolioQueryKey, PortfolioPackage, useGetPortfolio } from "@workspace/api-client-react";
import { ArrowLeft, ArrowUpRight, CalendarDays, Package, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { Link } from "wouter";
import { BSLogo } from "@/components/bs-logo";
import { Progress } from "@/components/ui/progress";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-ET", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const TIER_STYLES: Record<string, { card: string; soft: string; accent: string; chip: string }> = {
  vip1: {
    card: "bg-[#A8D5B5]",
    soft: "bg-white/25",
    accent: "text-[#2B7A4B]",
    chip: "bg-[#2B7A4B] text-white",
  },
  vip2: {
    card: "bg-[#F5E6A3]",
    soft: "bg-white/25",
    accent: "text-[#8B7200]",
    chip: "bg-[#D4B61B] text-white",
  },
  vip3: {
    card: "bg-[#C9BDF5]",
    soft: "bg-white/25",
    accent: "text-[#5B44BE]",
    chip: "bg-[#5B44BE] text-white",
  },
  vip4: {
    card: "bg-[#F2A89A]",
    soft: "bg-white/25",
    accent: "text-[#C0402E]",
    chip: "bg-[#C0402E] text-white",
  },
  vip5: {
    card: "bg-primary",
    soft: "bg-white/20",
    accent: "text-white",
    chip: "bg-white text-primary",
  },
  elite: {
    card: "bg-[#1A1A1A]",
    soft: "bg-white/10",
    accent: "text-white",
    chip: "bg-primary text-white",
  },
  apex: {
    card: "bg-[#1A1A1A]",
    soft: "bg-white/10",
    accent: "text-white",
    chip: "bg-primary text-white",
  },
  titan: {
    card: "bg-[#1A1A1A]",
    soft: "bg-white/10",
    accent: "text-white",
    chip: "bg-primary text-white",
  },
  alpha: {
    card: "bg-[#1A1A1A]",
    soft: "bg-white/10",
    accent: "text-white",
    chip: "bg-primary text-white",
  },
};

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}

function PortfolioPackageCard({
  portfolioPackage,
  completed = false,
}: {
  portfolioPackage: PortfolioPackage;
  completed?: boolean;
}) {
  const tierStyle = TIER_STYLES[portfolioPackage.tier] ?? TIER_STYLES.vip1;

  return (
    <div className={`${tierStyle.card} rounded-3xl p-5 relative overflow-hidden`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tierStyle.chip}`}>
            {portfolioPackage.name}
          </span>
          <p className={`text-xs mt-2 ${tierStyle.accent} opacity-80`}>
            {completed ? "Completed package" : "Active investment"}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${tierStyle.accent}`}>{fmt(portfolioPackage.cost)}</p>
          <p className={`text-xs ${tierStyle.accent} opacity-70`}>ETB capital</p>
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-3 rounded-2xl p-3 mb-4 border border-white/20 ${tierStyle.soft}`}>
        <div>
          <p className={`text-[11px] ${tierStyle.accent} opacity-70`}>Earned to date</p>
          <p className={`font-bold text-sm ${tierStyle.accent}`}>+{fmt(portfolioPackage.totalEarned)} ETB</p>
        </div>
        <div>
          <p className={`text-[11px] ${tierStyle.accent} opacity-70`}>Projected return</p>
          <p className={`font-bold text-sm ${tierStyle.accent}`}>{fmt(portfolioPackage.projectedTotalYield)} ETB</p>
        </div>
        <div>
          <p className={`text-[11px] ${tierStyle.accent} opacity-70`}>Daily return</p>
          <p className={`font-bold text-sm ${tierStyle.accent}`}>+{fmt(portfolioPackage.dailyReturn)} ETB</p>
        </div>
        <div>
          <p className={`text-[11px] ${tierStyle.accent} opacity-70`}>Remaining</p>
          <p className={`font-bold text-sm ${tierStyle.accent}`}>{portfolioPackage.daysRemaining} days</p>
        </div>
      </div>

      <div className="mb-4">
        <div className={`flex items-center justify-between text-xs mb-2 ${tierStyle.accent}`}>
          <span>{portfolioPackage.daysElapsed} of {portfolioPackage.durationDays} days</span>
          <span>{portfolioPackage.progressPercent}%</span>
        </div>
        <Progress
          value={portfolioPackage.progressPercent}
          className={`h-2.5 ${portfolioPackage.tier === "vip5" || portfolioPackage.tier === "elite" || portfolioPackage.tier === "apex" || portfolioPackage.tier === "titan" || portfolioPackage.tier === "alpha" ? "bg-white/15" : "bg-white/35"}`}
        />
      </div>

      <div className="space-y-2 text-xs">
        <div className={`flex items-center justify-between ${tierStyle.accent}`}>
          <span className="opacity-70">Start date</span>
          <span className="font-semibold">{formatDate(portfolioPackage.purchasedAt)}</span>
        </div>
        <div className={`flex items-center justify-between ${tierStyle.accent}`}>
          <span className="opacity-70">End date</span>
          <span className="font-semibold">{formatDate(portfolioPackage.expiresAt)}</span>
        </div>
        <div className={`flex items-center justify-between ${tierStyle.accent}`}>
          <span className="opacity-70">Projected remaining</span>
          <span className="font-semibold">{fmt(portfolioPackage.projectedReturnRemaining)} ETB</span>
        </div>
        {portfolioPackage.fundingSourceSenderName && (
          <div className={`mt-3 rounded-2xl px-3 py-2.5 border border-white/20 ${tierStyle.soft}`}>
            <p className={`text-[11px] mb-1 ${tierStyle.accent} opacity-70`}>Linked deposit source</p>
            <p className={`font-semibold text-sm ${tierStyle.accent}`}>
              {portfolioPackage.fundingSourceSenderName} · {fmt(portfolioPackage.fundingSourceAmount ?? 0)} ETB
            </p>
            {portfolioPackage.fundingSourceCreatedAt && (
              <p className={`text-[11px] mt-1 ${tierStyle.accent} opacity-70`}>
                Added {formatDate(portfolioPackage.fundingSourceCreatedAt)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Portfolio() {
  const { data, isLoading } = useGetPortfolio({
    query: { queryKey: getGetPortfolioQueryKey() },
  });

  return (
    <div className="px-4 pt-0 pb-6 max-w-md mx-auto">
      <div className="flex justify-center mb-0">
        <BSLogo />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Portfolio</h1>
          <p className="text-xs text-muted-foreground">Track your active capital and completed package returns</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-3xl p-5 text-white mb-5">
        <p className="text-sm text-gray-400">Investment overview</p>
        <p className="text-3xl font-bold mt-1">{fmt(data?.summary.activeCapital ?? 0)} ETB</p>
        <p className="text-xs text-gray-400 mt-1">Currently deployed across {data?.summary.activePackagesCount ?? 0} active package(s)</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/10 rounded-2xl p-3">
            <p className="text-[11px] text-gray-400">All-time earned</p>
            <p className="text-sm font-bold mt-1">+{fmt(data?.summary.totalEarnedAllTime ?? 0)}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3">
            <p className="text-[11px] text-gray-400">Projected live yield</p>
            <p className="text-sm font-bold mt-1">{fmt(data?.summary.totalProjectedYield ?? 0)}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3">
            <p className="text-[11px] text-gray-400">Still to earn</p>
            <p className="text-sm font-bold mt-1">{fmt(data?.summary.totalProjectedReturnRemaining ?? 0)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <SummaryCard icon={Wallet} label="Available Balance" value={`${fmt(data?.summary.availableBalance ?? 0)} ETB`} tone="bg-primary/10 text-primary" />
        <SummaryCard icon={PiggyBank} label="Total Deposited" value={`${fmt(data?.summary.totalDeposited ?? 0)} ETB`} tone="bg-[#C9BDF5] text-[#5B44BE]" />
        <SummaryCard icon={Package} label="Lifetime Invested" value={`${fmt(data?.summary.totalInvested ?? 0)} ETB`} tone="bg-[#A8D5B5] text-[#2B7A4B]" />
        <SummaryCard icon={TrendingUp} label="Completed Packages" value={`${data?.summary.completedPackagesCount ?? 0}`} tone="bg-[#F5E6A3] text-[#8B7200]" />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Active Packages</h2>
          <Link href="/packages" className="text-xs font-semibold text-primary">
            Manage packages
          </Link>
        </div>

        <div className="space-y-4">
          {isLoading ? Array(2).fill(0).map((_, index) => (
            <div key={index} className="h-72 bg-card rounded-3xl animate-pulse border border-border" />
          )) : (data?.activePackages.length ?? 0) === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-6 text-center">
              <p className="font-semibold text-foreground">No active package yet</p>
              <p className="text-sm text-muted-foreground mt-1">Activate a VIP package to start tracking live returns here.</p>
              <Link href="/packages" className="inline-flex items-center gap-2 mt-4 px-4 py-3 bg-primary text-white rounded-2xl font-semibold text-sm">
                <ArrowUpRight className="w-4 h-4" />
                Browse Packages
              </Link>
            </div>
          ) : data?.activePackages.map((portfolioPackage) => (
            <PortfolioPackageCard key={portfolioPackage.id} portfolioPackage={portfolioPackage} />
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-foreground">Funding Sources</h2>
        </div>
        <div className="space-y-3">
          {(data?.fundingSources.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Approved deposit records will appear here once you fund your account.</p>
          ) : data?.fundingSources.map((source) => (
            <div key={source.id} className="flex items-center justify-between rounded-2xl bg-background border border-border px-4 py-3">
              <div>
                <p className="font-semibold text-sm text-foreground">{source.senderName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(source.createdAt)}</p>
              </div>
              <p className="font-bold text-sm text-[#2B7A4B]">+{fmt(source.amount)} ETB</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Completed Packages</h2>
          <span className="text-xs text-muted-foreground">{data?.completedPackages.length ?? 0} archived</span>
        </div>
        <div className="space-y-4">
          {(data?.completedPackages.length ?? 0) === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-5">
              <p className="text-sm text-muted-foreground">Completed packages will move here after their investment window ends.</p>
            </div>
          ) : data?.completedPackages.map((portfolioPackage) => (
            <PortfolioPackageCard key={portfolioPackage.id} portfolioPackage={portfolioPackage} completed />
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-5">
        <h2 className="font-bold text-foreground mb-4">Recent Portfolio Activity</h2>
        <div className="space-y-3">
          {(data?.recentTransactions.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Your deposit, yield, and package activity will appear here.</p>
          ) : data?.recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between rounded-2xl bg-background border border-border px-4 py-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className={`font-bold text-sm ${transaction.type === "withdrawal" ? "text-[#C0402E]" : "text-[#2B7A4B]"}`}>
                  {transaction.type === "withdrawal" ? "-" : "+"}{fmt(transaction.amount)} ETB
                </p>
                <p className="text-[11px] text-muted-foreground capitalize">{transaction.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
