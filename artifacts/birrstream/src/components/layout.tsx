import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, ListChecks, Plus, User as UserIcon,
  X, ArrowUpRight, ArrowDownRight, Package, Users, Receipt, ChevronRight,
  Trophy, ShieldAlert, MessageCircle, BriefcaseBusiness
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EarningAlertContainer } from "@/components/earning-alert";
import { useDepositWatcher } from "@/hooks/use-deposit-watcher";
import quickActionsLower from "@/assets/decor/quick-actions-lower.svg";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/portfolio", icon: BriefcaseBusiness, label: "Portfolio" },
  { href: "/tasks", icon: ListChecks, label: "Daily Tasks" },
  { href: "/packages", icon: Package, label: "VIP Packages" },
  { href: "/referral", icon: Users, label: "Referrals" },
  { href: "/transactions", icon: Receipt, label: "Transactions" },
  { href: "/vip-upgrades", icon: Trophy, label: "VIP Upgrades" },
  { href: "/support", icon: MessageCircle, label: "Support" },
  { href: "/profile", icon: UserIcon, label: "Profile" },
];

const MOBILE_NAV = [
  { href: "/dashboard", icon: LayoutDashboard },
  { href: "/tasks", icon: ListChecks },
  { href: "/support", icon: MessageCircle },
  { href: "/profile", icon: UserIcon },
];

const ADMIN_NAV_ITEM = { href: "/admin", icon: ShieldAlert, label: "Admin Panel" };

function DepositWatcher() {
  useDepositWatcher();
  return null;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/30">
              <span className="text-white text-sm font-bold">B</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">BirrStream</h1>
          </div>
        </div>

        {/* Balance pill */}
        <div className="px-4 mb-4">
          <div className="bg-[#1A1A1A] rounded-2xl px-4 py-3">
            <p className="text-gray-400 text-xs">Balance</p>
            <p className="text-white font-bold">
              {(user as any).mainBalance?.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"} ETB
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

      {/* Floating Add Menu (Mobile) */}
      {isAddMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-[100px]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddMenuOpen(false)} />
          <div className="relative bg-card w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Quick Actions</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddMenuOpen(false)}
                className="rounded-full"
                aria-label="Close quick actions"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Link href="/deposit" onClick={() => setIsAddMenuOpen(false)} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-primary text-[#1A1A1A] hover:opacity-90 transition-opacity">
                <ArrowDownRight className="w-7 h-7" />
                <span className="font-semibold text-sm">Deposit</span>
              </Link>
              <Link href="/withdraw" onClick={() => setIsAddMenuOpen(false)} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-[#F5E6A3] text-[#8B7200] hover:opacity-90 transition-opacity">
                <ArrowUpRight className="w-7 h-7" />
                <span className="font-semibold text-sm">Withdraw</span>
              </Link>
            </div>
            {/*
              Lower section — pink-wave SVG is an actual <img> filling the container.
              CSS background was invisible because the opaque button tiles covered it.
              Now the SVG renders as a real image; buttons use bg-white/60 + backdrop-blur
              so the pink shows through as a frosted tint.
            */}
            {/* min-height ≈ 2× the SVG's natural rendered height so the pink wave fills prominently */}
            <div className="rounded-2xl overflow-hidden relative" style={{ minHeight: 220 }}>
              <img
                src={quickActionsLower}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
              />
              {/* Buttons sit at the top; the wave fills the remaining space below them */}
              <div className="relative z-10 grid grid-cols-2 gap-3 p-3">
                {[
                  { href: "/packages", icon: Package, label: "Packages", color: "text-[#5B44BE]" },
                  { href: "/portfolio", icon: BriefcaseBusiness, label: "Portfolio", color: "text-primary" },
                  { href: "/referral", icon: Users, label: "Referral", color: "text-[#2B7A4B]" },
                  { href: "/transactions", icon: Receipt, label: "History", color: "text-[#C0402E]" },
                ].map(({ href, icon: Icon, label, color }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsAddMenuOpen(false)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/60 backdrop-blur-sm ${color} transition-opacity hover:opacity-80`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold text-xs">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav — floating island, fully rounded at every corner */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-[68px] bg-[#1A1A1A] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.28)] flex items-center justify-between px-6 z-40">
        {MOBILE_NAV.slice(0, 2).map(({ href, icon: Icon }) => {
          const showBadge = href === "/dashboard" && unreadCount > 0;
          return (
            <Link
              key={href}
              href={href}
              aria-label={href === "/dashboard" ? "Dashboard" : "Daily Tasks"}
              onClick={href === "/dashboard" ? clearBadge : undefined}
              className={`flex flex-col items-center p-2 transition-colors ${location === href ? "text-primary" : "text-gray-400"}`}
            >
              <span className="relative">
                <Icon className="w-6 h-6" />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center px-0.5">
                    <span className="text-white text-[10px] font-bold leading-none">{unreadCount > 9 ? "9+" : unreadCount}</span>
                  </span>
                )}
              </span>
            </Link>
          );
        })}

        {/* Centre + button */}
        <div className="relative -top-6">
          <button
            onClick={() => setIsAddMenuOpen(prev => !prev)}
            aria-label={isAddMenuOpen ? "Close quick actions" : "Open quick actions"}
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 text-[#1A1A1A] hover:scale-105 transition-transform active:scale-95"
          >
            <Plus className={`w-8 h-8 transition-transform duration-200 ${isAddMenuOpen ? "rotate-45" : ""}`} />
          </button>
        </div>

        {MOBILE_NAV.slice(2).map(({ href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={href === "/support" ? "Support" : "Profile"}
            className={`flex flex-col items-center p-2 transition-colors ${location === href ? "text-primary" : "text-gray-400"}`}
          >
            <Icon className="w-6 h-6" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
