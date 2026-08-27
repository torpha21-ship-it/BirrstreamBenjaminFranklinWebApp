import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  X, ArrowUpRight, ArrowDownRight, Package, Users, Receipt, ChevronRight,
  Trophy, ShieldAlert
} from "lucide-react";
import { NavHomeIcon, NavTasksIcon, NavGamesIcon, NavSupportIcon, NavProfileIcon } from "@/components/nav-icons";
import { Button } from "@/components/ui/button";
import { EarningAlertContainer } from "@/components/earning-alert";
import { useDepositWatcher } from "@/hooks/use-deposit-watcher";
import { NightDayToggle } from "@/components/night-day-toggle";
import { useLanguage } from "@/context/language-context";

const ADMIN_NAV_ITEM = { href: "/admin", icon: ShieldAlert, labelKey: "nav.admin" };

function DepositWatcher() {
  useDepositWatcher();
  return null;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const { t, isAmharic } = useLanguage();

  const NAV_ITEMS = [
    { href: "/dashboard", icon: NavHomeIcon, label: t("nav.home") },
    { href: "/games", icon: NavGamesIcon, label: t("nav.games") },
    { href: "/tasks", icon: NavTasksIcon, label: t("nav.tasks") },
    { href: "/packages", icon: Package, label: isAmharic ? "የቪአይፒ ፓኬጆች" : "VIP Packages" },
    { href: "/referral", icon: Users, label: isAmharic ? "ሪፈራሎች" : "Referrals" },
    { href: "/transactions", icon: Receipt, label: isAmharic ? "ግብይቶች" : "Transactions" },
    { href: "/vip-upgrades", icon: Trophy, label: isAmharic ? "የቪአይፒ ደረጃዎች" : "VIP Upgrades" },
    { href: "/support", icon: NavSupportIcon, label: isAmharic ? "እርዳታ" : "Support" },
    { href: "/profile", icon: NavProfileIcon, label: t("nav.profile") },
  ];

  const MOBILE_NAV = [
    { href: "/dashboard", icon: NavHomeIcon, label: t("nav.home") },
    { href: "/tasks", icon: NavTasksIcon, label: t("nav.tasks") },
    { href: "/games", icon: NavGamesIcon, label: t("nav.games"), isCenterGame: true },
    { href: "/support", icon: NavSupportIcon, label: isAmharic ? "እርዳታ" : "Support" },
    { href: "/profile", icon: NavProfileIcon, label: t("nav.profile") },
  ];

  useEffect(() => {
    const handler = (e: Event) => {
      const type = (e as CustomEvent).detail?.type as string;
      if (type === "deposit" || type === "withdrawal_approved" || type === "withdrawal_rejected") {
        setUnreadCount(n => n + 1);
      }
    };
    window.addEventListener("birr:earning", handler);
    return () => window.removeEventListener("birr:earning", handler);
  }, []);

  const clearBadge = () => setUnreadCount(0);

  useEffect(() => {
    window.addEventListener("birr:clear-badge", clearBadge);
    return () => window.removeEventListener("birr:clear-badge", clearBadge);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-[100dvh] bg-background">{children}</div>;
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-28 md:pb-0 md:pl-64">
      <EarningAlertContainer />
      {user && <DepositWatcher />}
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-card border-r border-border overflow-y-auto">
        {/* Logo */}
        <div className="p-6 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/30">
              <span className="text-white text-sm font-bold">B</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Naomi Labs</h1>
          </div>
          <NightDayToggle size={64} />
        </div>

        {/* Balance pill */}
        <div className="px-4 mb-4">
          <div className="bg-[#1A1A1A] rounded-2xl px-4 py-3">
            <p className="text-gray-400 text-xs">{isAmharic ? "ቀሪ ሂሳብ" : "Balance"}</p>
            <p className="text-white font-bold">
              {(user as any).mainBalance?.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"} {isAmharic ? "ብር" : "ETB"}
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 space-y-1 pb-4">
          {(user?.isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS).map(({ href, icon: Icon, label }) => {
            const active = location === href || (href !== "/dashboard" && location.startsWith(href));
            const showBadge = href === "/dashboard" && unreadCount > 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={href === "/dashboard" ? clearBadge : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  active
                    ? "bg-primary text-[#1A1A1A] font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <span className="relative flex-shrink-0">
                  <Icon size={18} />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-card flex items-center justify-center px-0.5">
                      <span className="text-white text-[10px] font-bold leading-none">{unreadCount > 9 ? "9+" : unreadCount}</span>
                    </span>
                  )}
                </span>
                <span className="text-sm">{label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Deposit / Withdraw quick actions */}
        <div className="px-4 pb-6 flex-shrink-0 space-y-2">
          <Link
            href="/deposit"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-[#1A1A1A] rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowDownRight className="w-4 h-4" /> Deposit
          </Link>
          <Link
            href="/withdraw"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F5E6A3] text-[#8B7200] rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowUpRight className="w-4 h-4" /> Withdraw
          </Link>
        </div>
      </aside>

      <main className="w-full max-w-md mx-auto md:max-w-none min-h-[100dvh] relative">
        {children}
      </main>

      {/* Mobile Bottom Nav — White, Black & Green palette with original two-tone icons */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-[64px] bg-[#1A1A1A] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] border border-white/10 flex items-center justify-around px-2 z-40">
        {MOBILE_NAV.map(({ href, icon: Icon }) => {
          const active = location === href || (href !== "/dashboard" && location.startsWith(href));
          const showBadge = href === "/dashboard" && unreadCount > 0;

          return (
            <Link
              key={href}
              href={href}
              aria-label={href === "/dashboard" ? "Dashboard" : href}
              onClick={href === "/dashboard" ? clearBadge : undefined}
              className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                active 
                  ? "bg-white border-2 border-primary shadow-lg shadow-primary/30 scale-105" 
                  : "bg-white/90 hover:bg-white"
              }`}
            >
              <Icon
                className="w-6 h-6"
                blackStroke="#121331"
                greenStroke={active ? "#15803D" : "#185219"}
              />
              {showBadge && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center px-0.5">
                  <span className="text-white text-[10px] font-bold leading-none">{unreadCount > 9 ? "9+" : unreadCount}</span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

