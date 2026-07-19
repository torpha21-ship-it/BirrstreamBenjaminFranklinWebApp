import { useEffect, useMemo } from "react";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetLoginStreak, getGetLoginStreakQueryKey, useCheckinStreak, useGetUserProfile, getGetUserProfileQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowDownRight, ArrowUpRight, Package, ListChecks, Users, ChevronRight, Flame, TrendingUp } from "lucide-react";
import { UpperScreenBg } from "@/components/upper-screen-bg";
import { BSLogo } from "@/components/bs-logo";
import { showEarningAlert } from "@/components/earning-alert";
import pointingHand from "@/assets/decor/pointing-hand.webp";
import reserveFloorCard from "@/assets/decor/reserve-floor-card.png";
import totalDepositedCard from "@/assets/decor/total-deposited-card.png";
import totalWithdrawnCard from "@/assets/decor/total-withdrawn-card.png";
import totalYieldCard from "@/assets/decor/total-yield-card.png";
import streakImg from "@/assets/decor/173.png";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function creditDailyYield(token: string | null) {
  if (!token) return null;
  try {
    const res = await fetch("/api/yields/credit-daily", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: summary, isLoading } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: streak } = useGetLoginStreak({ query: { queryKey: getGetLoginStreakQueryKey() } });
  const { data: profileData } = useGetUserProfile({ query: { queryKey: getGetUserProfileQueryKey() } });
  const checkinMutation = useCheckinStreak();

  // Auto-credit daily yield when dashboard loads
  useEffect(() => {
    if (!token) return;
    // Guard against repeated calls on HMR remounts — only credit once per calendar day per session
    const todayKey = `birr_yield_credited_${new Date().toDateString()}`;
    if (sessionStorage.getItem(todayKey)) return;
    sessionStorage.setItem(todayKey, "1");
    creditDailyYield(token).then(result => {
      if (result?.credited) {
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        showEarningAlert({
          type: "yield",
          title: "Daily Yield Credited!",
          amount: `+${fmt(result.yieldAmount)} ETB`,
          description: `${result.packageName} daily return added to your balance.`,
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCheckin = () => {
    checkinMutation.mutate(undefined, {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        qc.invalidateQueries({ queryKey: getGetLoginStreakQueryKey() });
        toast({ title: `+${data.bonusEarned} ETB streak bonus!`, description: `Day ${data.newStreak} streak!` });
      },
      onError: () => toast({ title: "Already checked in today", variant: "destructive" }),
    });
  };

  const statCards = [
    { label: "Total Yield", value: summary?.totalYield ?? 0, color: "bg-[#F5E6A3]", textColor: "text-[#8B7200]", image: totalYieldCard },
    { label: "Total Deposited", value: summary?.totalDeposited ?? 0, color: "bg-[#C9BDF5]", textColor: "text-[#5B44BE]", image: totalDepositedCard },
    { label: "Total Withdrawn", value: summary?.totalWithdrawn ?? 0, color: "bg-[#F2A89A]", textColor: "text-[#C0402E]", image: totalWithdrawnCard },
    { label: "Reserve Floor", value: summary?.reserveFloor ?? 0, color: "bg-[#A8D5B5]", textColor: "text-[#2B7A4B]", image: reserveFloorCard },
  ];

  const dayNames = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayNum = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

    // Find last check-in by scanning the 7-day array backwards
    const streakDays: any[] = streak?.days ?? [];
    let lastCheckinDaysAgo: number | null = null;
    for (let i = streakDays.length - 1; i >= 0; i--) {
      if (streakDays[i]?.checkedIn) {
        lastCheckinDaysAgo = streakDays.length - 1 - i; // 0 = today, 1 = yesterday…
        break;
      }
    }

    // Build set of checked-in day-of-month numbers in current month
    const checkedInDays = new Set<number>();
    if (lastCheckinDaysAgo !== null && streak?.currentStreak) {
      const lastDate = new Date(now);
      lastDate.setDate(now.getDate() - lastCheckinDaysAgo);
      for (let i = 0; i < streak.currentStreak; i++) {
        const d = new Date(lastDate);
        d.setDate(lastDate.getDate() - i);
        if (d.getFullYear() === year && d.getMonth() === month) {
          checkedInDays.add(d.getDate());
        }
      }
    }

    const cells: (number | null)[] = [
      ...Array(firstDayOfWeek).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const monthLabel = now.toLocaleDateString("en-ET", { month: "long", year: "numeric" });
    return { cells, checkedInDays, todayNum };
  }, [streak]);

  return (
    <div className="px-4 pt-0 pb-6 space-y-4 max-w-md mx-auto relative">
      <UpperScreenBg />

      {/* Centred brand mark — pulled to very top, cancels space-y-4 gap */}
      <div className="flex justify-center -mb-3 -mt-4 relative z-10">
        <BSLogo />
      </div>

      {/* Header: welcome text + profile avatar — single white card */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm border border-border relative z-10 -mx-4">
        <div>
          <p className="text-xs text-foreground/70 font-medium">Welcome back</p>
          <h1
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}
          >
            {user?.fullName?.split(" ")[0]}
          </h1>
        </div>
        <Link
          href="/profile"
          className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-primary/30 overflow-hidden flex-shrink-0"
        >
          {(profileData as any)?.profilePhoto
            ? <img src={(profileData as any).profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            : (user?.fullName?.[0] ?? "U")}
        </Link>
      </div>

      {/* Main Balance Card */}
      <div className="bg-[#1A1A1A] rounded-3xl px-6 pt-3 pb-6 text-white relative z-10 overflow-hidden -mx-4">
        <img src={pointingHand} alt="" aria-hidden="true" className="absolute right-0 top-0 h-1/2 object-contain object-right-top pointer-events-none select-none opacity-90" />
        <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[28px] text-gray-400" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>Main Balance</p>
        </div>
        {isLoading ? (
          <div className="h-12 bg-white/10 rounded-xl animate-pulse w-48 mb-2" />
        ) : (
          <p className="text-4xl font-bold mb-1">
            {fmt(summary?.mainBalance ?? 0)}{" "}
            <span className="text-xl font-semibold text-gray-300" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>ETB</span>
          </p>
        )}
        {summary?.activePackageName ? (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
              {summary.activePackageName}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <TrendingUp className="w-3 h-3" />
              +{fmt(summary.activePackageDailyReturn ?? 0)} ETB/day
            </span>
            {summary.daysUntilExpiry !== null && (
              <span className="text-xs text-gray-500">{summary.daysUntilExpiry}d left</span>
            )}
          </div>
        ) : (
          <Link href="/packages" className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
            Get a VIP Package <ChevronRight className="w-3 h-3" />
          </Link>
        )}

        {/* Progress bar to next tier */}
        {summary?.nextTierName && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress to {summary.nextTierName}</span>
              <span>{Math.round(summary.progressToNextTier)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${summary.progressToNextTier}%` }}
              />
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 relative z-10">
        {[
          { icon: ArrowDownRight, label: "Deposit", href: "/deposit", color: "text-primary bg-primary/10" },
          { icon: ArrowUpRight, label: "Withdraw", href: "/withdraw", color: "text-[#D4B61B] bg-[#F5E6A3]" },
          { icon: Package, label: "Packages", href: "/packages", color: "text-[#5B44BE] bg-[#C9BDF5]" },
          { icon: ListChecks, label: "Tasks", href: "/tasks", color: "text-[#2B7A4B] bg-[#A8D5B5]" },
        ].map(({ icon: Icon, label, href, color }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border hover:scale-105 active:scale-95 transition-transform"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-foreground">{label}</span>
          </Link>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 relative z-10 -mx-4">
        {statCards.map(card => (
          <div key={card.label} className={`${card.color} rounded-2xl p-4 relative overflow-hidden`}>
            <img
              src={card.image}
              alt=""
              aria-hidden="true"
              className="absolute -right-2 -bottom-2 h-14 w-14 object-contain pointer-events-none select-none opacity-90"
            />
            <div className="relative z-10">
              <p className={`text-xs font-semibold ${card.textColor} opacity-70 mb-1`} style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>{card.label}</p>
              <p className={`text-lg font-bold ${card.textColor}`} style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>{fmt(card.value)}</p>
              <p className={`text-xs ${card.textColor} opacity-60`} style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>ETB</p>
            </div>
          </div>
        ))}
      </div>

      {/* Login Streak */}
      <div className="bg-card rounded-3xl p-5 border border-border relative z-10 -mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            <h2 className="text-[32px] font-bold text-foreground leading-none" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>Login Streak</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-ET", { month: "long", year: "numeric" })}</span>
            <span className="text-sm font-bold text-primary">{streak?.currentStreak ?? 0} 🔥</span>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
            <div key={d} className="text-[10px] font-semibold text-muted-foreground text-center py-0.5">{d}</div>
          ))}
        </div>

        {/* Monthly calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {calendarData.cells.map((day, i) => {
            if (day === null) return <div key={`pad-${i}`} />;
            const isToday = day === calendarData.todayNum;
            const isCheckedIn = calendarData.checkedInDays.has(day);
            const isFuture = day > calendarData.todayNum;
            return (
              <div
                key={day}
                className={`aspect-square rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  isCheckedIn
                    ? "bg-primary text-white shadow-sm shadow-primary/40"
                    : isToday
                    ? "ring-2 ring-primary text-primary"
                    : isFuture
                    ? "text-muted-foreground/25"
                    : "text-muted-foreground/50"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend + decorative image filling the right space */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
          <span className="flex items-center gap-1.5 text-[22px] text-muted-foreground" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
            <span className="w-3 h-3 rounded-full bg-primary inline-block flex-shrink-0" />Checked in
          </span>
          <span className="flex items-center gap-1.5 text-[22px] text-muted-foreground" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
            <span className="w-3 h-3 rounded-full border-2 border-primary inline-block flex-shrink-0" />Today
          </span>
          <span className="flex items-center gap-1.5 text-[22px] text-muted-foreground" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
            <span className="w-3 h-3 rounded-full bg-muted-foreground/25 inline-block flex-shrink-0" />Missed
          </span>
          <img
            src={streakImg}
            alt=""
            aria-hidden="true"
            className="ml-auto h-14 w-auto object-contain flex-shrink-0 select-none pointer-events-none"
          />
        </div>

        {!streak?.todayCheckedIn ? (
          <button
            onClick={handleCheckin}
            disabled={checkinMutation.isPending}
            className="w-full py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}
          >
            {checkinMutation.isPending ? "Checking in..." : "Check In — Earn +5 ETB"}
          </button>
        ) : (
          <div className="w-full py-3 bg-accent/30 text-accent-foreground rounded-2xl font-semibold text-sm text-center">
            ✓ Checked in today!
          </div>
        )}
      </div>

      {/* Navigate to more */}
      <div className="grid grid-cols-1 gap-3 relative z-10 -mx-4">
        {[
          { label: "My Referral Network", desc: "View your affiliate downline", href: "/affiliate-network", icon: Users },
          { label: "VIP Upgrade Goals", desc: "Earn premium packages through referrals", href: "/vip-upgrades", icon: Package },
        ].map(({ label, desc, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-[28px] text-foreground leading-tight" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
