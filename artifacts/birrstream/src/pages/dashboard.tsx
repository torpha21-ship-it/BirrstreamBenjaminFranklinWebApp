import { useEffect, useMemo, useState } from "react";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetLoginStreak, getGetLoginStreakQueryKey, useCheckinStreak, useGetUserProfile, getGetUserProfileQueryKey, useListWithdrawals } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ChevronRight, ShieldCheck, Trophy } from "lucide-react";
import { useKyc } from "@/hooks/use-kyc";
import { BSLogo } from "@/components/bs-logo";
import { LeaderboardModal } from "@/components/leaderboard-modal";
import oneKeyIcon from "@/assets/decor/wired-outline-1284-one-key-hover-press.webp";
import { showEarningAlert } from "@/components/earning-alert";
import { withApiBaseUrl } from "@/lib/api-base-url";
import { AdSlider } from "@/components/ad-slider";
import { LogoSlider } from "@/components/logo-slider";
import { AnimatedLogoSlider } from "@/components/animated-logo-slider";
import totalYieldStatic from "@/assets/dashboard-icons/static/Total Yield.png";
import totalDepositedStatic from "@/assets/dashboard-icons/static/Total Deposited.png";
import totalWithdrawnStatic from "@/assets/dashboard-icons/static/Total Withdrawn.png";
import reserveFloorStatic from "@/assets/dashboard-icons/static/Reserve Floor.png";
import streakImg from "@/assets/decor/173.png";
import { SpecialVipCardSlider } from "@/components/special-vip-card-slider";
import { NightDayToggle } from "@/components/night-day-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { WalletCard } from "@/components/wallet-card";
import { useLanguage } from "@/context/language-context";

import hiIcon from "@/assets/dashboard-icons/Hi.webp";
import hiDarkIcon from "@/assets/dashboard-icons/dark-theme/Hi.webp";
import depositIcon from "@/assets/dashboard-icons/Deposit.gif";
import withdrawIcon from "@/assets/dashboard-icons/Withdraw.gif";
import packagesIcon from "@/assets/dashboard-icons/Packages.webp";
import tasksIcon from "@/assets/dashboard-icons/Tasks.webp";
import loginStreakIcon from "@/assets/dashboard-icons/Login Streak.webp";
import checkInIcon from "@/assets/dashboard-icons/Check In Button.webp";
import referralNetworkIcon from "@/assets/dashboard-icons/My Referal Network.webp";
import vipUpgradeGoalsIcon from "@/assets/dashboard-icons/VIP Upgrade Goals.webp";
import warningTriangleIcon from "@/assets/decor/wired-outline-1140-warning-triangle-hover-enlarge.webp";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function creditDailyYield(token: string | null) {
  if (!token) return null;
  try {
    const res = await fetch(withApiBaseUrl("/api/yields/credit-daily"), {
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
  const { t, isAmharic, isOromo, currency } = useLanguage();
  const { kycStatus, isApproved, isPending } = useKyc();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: summary, isLoading } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: streak } = useGetLoginStreak({ query: { queryKey: getGetLoginStreakQueryKey() } });
  const checkinMutation = useCheckinStreak();
  const { data: withdrawals } = useListWithdrawals();

  // Sum up all pending withdrawal amounts to show in the balance card
  const pendingWithdrawalTotal = useMemo(() => {
    if (!withdrawals || !Array.isArray(withdrawals)) return 0;
    return withdrawals
      .filter((w: any) => w.status === "pending")
      .reduce((sum: number, w: any) => sum + (w.amount ?? 0), 0);
  }, [withdrawals]);

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
          title: isAmharic ? "የዕለት ትርፍ ተገኝቷል!" : isOromo ? "Bu'aan Guyyaa Galameera!" : "Daily Yield Credited!",
          amount: `+${fmt(result.yieldAmount)} ${currency}`,
          description: isAmharic
            ? `${result.packageName} የዕለት ትርፍ ወደ ሂሳብዎ ተጨምሯል።`
            : isOromo
            ? `${result.packageName} bu'aan guyyaa gara herrega keessanitti dabalameera.`
            : `${result.packageName} daily return added to your balance.`,
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAmharic, isOromo, currency]);

  const handleCheckin = () => {
    checkinMutation.mutate(undefined, {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        qc.invalidateQueries({ queryKey: getGetLoginStreakQueryKey() });
        toast({
          title: isAmharic
            ? `+${data.bonusEarned} ብር ጉርሻ!`
            : isOromo
            ? `+${data.bonusEarned} Qarshii Badhaasa!`
            : `+${data.bonusEarned} ETB streak bonus!`,
          description: isAmharic
            ? `ቀን ${data.newStreak} ተከታታይ ተሳትፎ!`
            : isOromo
            ? `Guyyaa ${data.newStreak} walitti fufiinsaan!`
            : `Day ${data.newStreak} streak!`
        });
      },
      onError: () => toast({
        title: isAmharic
          ? "ዛሬ አስቀድመው ተሳትፈዋል"
          : isOromo
          ? "Har'a duraan galmooftaniittu"
          : "Already checked in today",
        variant: "destructive"
      }),
    });
  };

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0" : "-0.01em",
  };

  const statCards = [
    { label: t("stats.total_yield", "Total Yield"), value: summary?.totalYield ?? 0, color: "bg-[#F5E6A3]", textColor: "text-[#8B7200]", image: totalYieldStatic },
    { label: t("stats.total_deposited", "Total Deposited"), value: summary?.totalDeposited ?? 0, color: "bg-[#C9BDF5]", textColor: "text-[#5B44BE]", image: totalDepositedStatic },
    { label: t("stats.total_withdrawn", "Total Withdrawn"), value: summary?.totalWithdrawn ?? 0, color: "bg-[#F2A89A]", textColor: "text-[#C0402E]", image: totalWithdrawnStatic },
    { label: t("stats.reserve_floor", "Reserve Floor"), value: summary?.reserveFloor ?? 0, color: "bg-[#A8D5B5]", textColor: "text-[#2B7A4B]", image: reserveFloorStatic },
  ];

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

    const monthLabel = now.toLocaleDateString(isAmharic ? "am-ET" : "en-ET", { month: "long", year: "numeric" });
    return { cells, checkedInDays, todayNum, monthLabel };
  }, [streak, isAmharic]);

  return (
    <div className="px-4 pt-4 pb-2 space-y-4 max-w-md mx-auto relative overflow-x-hidden">
      {/* Top Bar: Brand Logo on left with Language Toggle on right */}
      <div className="flex items-center justify-between z-20 min-h-[44px] px-1">
        <div className="flex items-center">
          <BSLogo />
        </div>
        <div className="flex-shrink-0">
          <LanguageToggle />
        </div>
      </div>

      {/* Header: greeting text + Hi.webp on left, KYC Warning in middle, Night/Day toggle on right (on page background directly) */}
      <div className="flex items-center justify-between relative z-10 py-1">
        <div className="flex items-center gap-2 min-w-0">
          <div>
            <p className="text-xs text-muted-foreground font-medium" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
              {t("dash.welcome")}
            </p>
            <h1
              className="text-lg font-bold text-foreground truncate max-w-[130px]"
              style={displayFont}
            >
              {user?.fullName?.split(" ")[0]}
            </h1>
            <button
              type="button"
              onClick={() => setIsLeaderboardOpen(true)}
              className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40 hover:border-amber-500/70 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer text-[10px] font-extrabold group"
              style={displayFont}
            >
              <img src={oneKeyIcon} alt="Rank" className="w-3.5 h-3.5 object-contain group-hover:rotate-12 transition-transform" />
              <span>{isAmharic ? "ደረጃ ሰንጠረዥ" : isOromo ? "Sadarkaa" : "Top Earners"}</span>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
            </button>
          </div>
          <img src={hiIcon} alt="Hi" className="w-8 h-8 object-contain select-none pointer-events-none dark:hidden flex-shrink-0" />
          <img src={hiDarkIcon} alt="Hi" className="w-8 h-8 object-contain select-none pointer-events-none hidden dark:inline-block flex-shrink-0" />
        </div>

        {/* KYC Status Indicator in middle */}
        {isApproved ? (
          <Link
            href="/profile#kyc"
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold shadow-sm mx-auto group hover:bg-emerald-500/25 transition-all"
            title="KYC Verified"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span style={displayFont}>{isAmharic ? "ማንነት ተረጋግጧል" : isOromo ? "Mirkanaa'eera" : "Verified"}</span>
          </Link>
        ) : isPending ? (
          <Link href="/profile#kyc" className="relative flex flex-col items-center group cursor-pointer mx-auto">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#F5E6A3] text-[#8B7200] font-extrabold text-[9px] px-2 py-0.5 rounded shadow-sm whitespace-nowrap flex items-center gap-1 z-20">
              <span>{isAmharic ? "KYC በግምገማ ላይ" : isOromo ? "KYC Gamaaggama Irra" : "KYC In Review"}</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#F5E6A3]" />
            </div>
            <img
              src={warningTriangleIcon}
              alt="KYC In Review"
              className="w-8 h-8 object-contain select-none transition-transform group-hover:scale-110 dark:[filter:invert(1)_hue-rotate(180deg)]"
            />
          </Link>
        ) : (
          <Link href="/profile#kyc" className="relative flex flex-col items-center group cursor-pointer mx-auto">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#F5E6A3] text-[#8B7200] font-extrabold text-[9px] px-2 py-0.5 rounded shadow-sm whitespace-nowrap animate-bounce flex items-center gap-1 z-20">
              <span>{isAmharic ? "KYC ያረጋግጡ" : isOromo ? "KYC Mirkaneessi" : "Verify KYC"}</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#F5E6A3]" />
            </div>
            <img
              src={warningTriangleIcon}
              alt="KYC Warning"
              className="w-8 h-8 object-contain select-none transition-transform group-hover:scale-110 dark:[filter:invert(1)_hue-rotate(180deg)]"
            />
          </Link>
        )}

        {/* Night-Day Animated Toggle placed on right */}
        <div className="flex items-center justify-end flex-shrink-0">
          <NightDayToggle size={70} />
        </div>
      </div>

      {/* Realistic Wallet Balance Card */}
      <WalletCard
        summary={summary}
        isLoading={isLoading}
        user={user}
        pendingWithdrawalTotal={pendingWithdrawalTotal}
        displayFont={displayFont}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 relative z-10">
        {[
          { iconSrc: depositIcon, label: t("dash.deposit"), href: "/deposit", color: "bg-[#FCE7EE]" },
          { iconSrc: withdrawIcon, label: t("dash.withdraw"), href: "/withdraw", color: "bg-[#F5E6A3]" },
          { iconSrc: packagesIcon, label: t("dash.packages", "Packages"), href: "/packages", color: "bg-[#C9BDF5]" },
          { iconSrc: tasksIcon, label: t("dash.tasks", "Tasks"), href: "/tasks", color: "bg-[#A8D5B5]" },
        ].map(({ iconSrc, label, href, color }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border hover:scale-105 active:scale-95 transition-transform"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} overflow-hidden p-1.5`}>
              <img src={iconSrc} alt={label} className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-semibold text-foreground text-center line-clamp-1" style={displayFont}>{label}</span>
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
              className="absolute right-2 bottom-2 h-8 w-8 object-contain pointer-events-none select-none drop-shadow-sm"
            />
            <div className="relative z-10">
              <p className={`text-[19px] ${card.textColor} opacity-80 mb-0.5`} style={displayFont}>{card.label}</p>
              <p className={`text-[15px] font-bold ${card.textColor}`}>{fmt(card.value)}</p>
              <p className={`text-[10px] ${card.textColor} opacity-60 font-semibold`}>{currency}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Login Streak */}
      <div className="bg-card rounded-3xl p-5 border border-border relative z-10 -mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#FCE7EE] rounded-xl flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0">
              <img src={loginStreakIcon} alt="" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight whitespace-nowrap" style={displayFont}>
              {t("dash.login_streak")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
              {calendarData.monthLabel}
            </span>
            <span className="text-sm font-bold text-primary">{streak?.currentStreak ?? 0} 🔥</span>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, idx) => (
            <div key={d} className="text-[10px] font-semibold text-muted-foreground text-center py-0.5" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
              {isAmharic ? ["እሁ", "ሰኞ", "ማክ", "ረቡ", "ሐሙ", "አር", "ቅዳ"][idx] : isOromo ? ["DIL", "WIX", "KIB", "ROO", "KAM", "JMI", "SAN"][idx] : d}
            </div>
          ))}
        </div>

        {/* Monthly calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {calendarData.cells.map((day, i) => {
            if (day === null) return <div key={`pad-${i}`} />;
            const isToday = day === calendarData.todayNum;
            const isCheckedIn = calendarData.checkedInDays.has(day);
            const isFuture = day > calendarData.todayNum;
            const isPastMissed = day < calendarData.todayNum && !isCheckedIn;
            return (
              <div
                key={day}
                className={`aspect-square rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  isCheckedIn
                    ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/30"
                    : isToday
                    ? "border-2 border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary/30"
                    : isPastMissed
                    ? "bg-muted-foreground/20 text-muted-foreground/70 font-semibold"
                    : "text-muted-foreground/30"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend + decorative image filling the right space */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
          <span className="flex items-center gap-1.5 text-[18px] text-muted-foreground" style={displayFont}>
            <span className="w-3.5 h-3.5 rounded-full bg-primary inline-block flex-shrink-0" />
            {t("dash.checked_in_legend")}
          </span>
          <span className="flex items-center gap-1.5 text-[18px] text-muted-foreground" style={displayFont}>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-primary bg-primary/10 inline-block flex-shrink-0" />
            {t("dash.today_legend")}
          </span>
          <span className="flex items-center gap-1.5 text-[18px] text-muted-foreground" style={displayFont}>
            <span className="w-3.5 h-3.5 rounded-full bg-muted-foreground/20 inline-block flex-shrink-0" />
            {t("dash.missed_legend")}
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
            className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            style={displayFont}
          >
            <img src={checkInIcon} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
            <span>{checkinMutation.isPending ? t("dash.checking_in") : t("dash.check_in")}</span>
          </button>
        ) : (
          <div className="w-full py-3 bg-accent/30 text-accent-foreground rounded-2xl font-semibold text-sm text-center" style={displayFont}>
            ✓ {t("dash.checked_in")}
          </div>
        )}
      </div>

      {/* Navigate to more */}
      <div className="grid grid-cols-1 gap-3 relative z-10 -mx-4">
        {[
          { label: t("dash.referral_network"), desc: t("dash.referral_sub"), href: "/affiliate-network", iconSrc: referralNetworkIcon },
          { label: t("dash.vip_upgrade"), desc: t("dash.vip_upgrade_sub"), href: "/vip-upgrades", iconSrc: vipUpgradeGoalsIcon },
        ].map(({ label, desc, href, iconSrc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FCE7EE] rounded-xl flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0">
                <img src={iconSrc} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-semibold text-[22px] text-foreground leading-tight" style={displayFont}>{label}</p>
                <p className="text-xs text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>{desc}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {/* Special 3D VIP Upgrade Cards Slider */}
      <div className="relative z-10 -mx-4">
        <SpecialVipCardSlider />
      </div>

      {/* Top Logo Slider: moved to page bottom below Time Cards */}
      <LogoSlider className="-mx-4" />

      {/* Video Ad Slider: moved to page bottom below Time Cards */}
      <AdSlider />

      {/* Bottom Custom Logo Slider: moved to page bottom below Ad Slider */}
      <AnimatedLogoSlider className="-mx-4" reverse />

      {/* Top Earners Ranking Leaderboard Modal */}
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
    </div>
  );
}
