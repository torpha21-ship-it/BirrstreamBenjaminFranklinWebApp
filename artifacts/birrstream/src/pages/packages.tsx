import { useListPackages, getListPackagesQueryKey, usePurchasePackage, useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Lock, Star, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { BSLogo } from "@/components/bs-logo";
import { useLanguage } from "@/context/language-context";
import vip1Bg from "@/assets/decor/vip1.svg";
import vip2Bg from "@/assets/decor/vip2.svg";
import vip3Bg from "@/assets/decor/vip3.svg";
import vip4Bg from "@/assets/decor/vip4.svg";
import vip5Bg from "@/assets/decor/vip5.svg";
import eliteBg from "@/assets/decor/vip-elite.png";
import apexBg from "@/assets/decor/vip-apex.png";
import titanBg from "@/assets/decor/vip-titan.png";
import alphaBg from "@/assets/decor/vip-alpha.png";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TIER_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  vip1: { bg: "bg-[#A8D5B5]", text: "text-[#2B7A4B]", badge: "bg-[#2B7A4B] text-white" },
  vip2: { bg: "bg-[#F5E6A3]", text: "text-[#8B7200]", badge: "bg-[#D4B61B] text-white" },
  vip3: { bg: "bg-[#C9BDF5]", text: "text-[#5B44BE]", badge: "bg-[#5B44BE] text-white" },
  vip4: { bg: "bg-[#F2A89A]", text: "text-[#C0402E]", badge: "bg-[#C0402E] text-white" },
  vip5: { bg: "bg-primary", text: "text-white", badge: "bg-white text-primary" },
  elite: { bg: "bg-[#1A1A1A]", text: "text-white", badge: "bg-primary text-white" },
  apex: { bg: "bg-[#1A1A1A]", text: "text-white", badge: "bg-primary text-white" },
  titan: { bg: "bg-[#1A1A1A]", text: "text-white", badge: "bg-primary text-white" },
  alpha: { bg: "bg-[#1A1A1A]", text: "text-white", badge: "bg-primary text-white" },
};

const TIER_BG_IMAGES: Record<string, string> = {
  vip1: vip1Bg,
  vip2: vip3Bg,
  vip3: vip2Bg,
  vip4: vip4Bg,
  vip5: vip5Bg,
  elite: eliteBg,
  apex: apexBg,
  titan: titanBg,
  alpha: alphaBg,
};

export default function Packages() {
  const { data: packages, isLoading } = useListPackages({ query: { queryKey: getListPackagesQueryKey() } });
  const { data: summary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const qc = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const purchaseMutation = usePurchasePackage();
  const { t, isAmharic } = useLanguage();

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Highstories', sans-serif",
    letterSpacing: isAmharic ? "0" : "0.06em",
  };

  const handlePurchase = (id: number, name: string, cost: number) => {
    purchaseMutation.mutate(
      { id },
      {
        onSuccess: (data) => {
          if (data.success) {
            qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            qc.invalidateQueries({ queryKey: getListPackagesQueryKey() });
            toast({
              title: isAmharic ? `${name} ነቅቷል!` : `${name} activated!`,
              description: isAmharic
                ? `ዕለታዊ የ +${fmt(data.package?.dailyReturn ?? 0)} ብር ትርፍ አሁን ጀምሯል።`
                : `Daily returns of +${fmt(data.package?.dailyReturn ?? 0)} ETB start now.`
            });
          } else {
            toast({
              title: isAmharic ? "በቂ ያልሆነ ቀሪ ሂሳብ" : "Insufficient balance",
              description: isAmharic ? "እባክዎ መጀመሪያ ገንዘብ ያስገቡ።" : data.message,
              variant: "destructive"
            });
            if (data.shortfallAmount) setLocation("/deposit");
          }
        },
        onError: () => toast({
          title: isAmharic ? "ግዢው አልተሳካም" : "Purchase failed",
          variant: "destructive"
        }),
      }
    );
  };

  return (
    <div className="px-4 pt-0 pb-6 max-w-md mx-auto">
      {/* Centred brand mark */}
      <div className="flex justify-center mb-0">
        <BSLogo />
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground" style={displayFont}>
            {t("packages.title")}
          </h1>
          <p className="text-xs text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            {isAmharic ? "ቀሪ ሂሳብ፦ " : "Balance: "}{fmt(summary?.mainBalance ?? 0)} {isAmharic ? "ብር" : "ETB"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-40 bg-card rounded-3xl animate-pulse border border-border" />
        )) : packages?.map(pkg => {
          const colors = TIER_COLORS[pkg.tier] ?? TIER_COLORS.vip1;
          const canAfford = (summary?.mainBalance ?? 0) >= pkg.cost;
          const bgImage = TIER_BG_IMAGES[pkg.tier];
          return (
            <div key={pkg.id} className={`${colors.bg} rounded-3xl p-5 relative overflow-hidden`}>
              {bgImage && (
                <img
                  src={bgImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute right-1/4 top-0 w-1/2 h-1/2 object-contain object-center pointer-events-none select-none"
                />
              )}
              {pkg.tier === "vip5" && (
                <div className="absolute top-3 right-3 z-10">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                </div>
              )}
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors.badge}`} style={displayFont}>{pkg.name}</span>
                  {pkg.isLocked && (
                    <div className="inline-flex items-center gap-1 mt-2 backdrop-blur-sm bg-white/25 rounded-full px-2.5 py-1 border border-white/30">
                      <Lock className={`w-3 h-3 ${colors.text}`} />
                      <span className={`text-xs font-medium ${colors.text}`} style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                        {isAmharic ? "የተቆለፈ — በቪአይፒ ግቦች ይክፈቱ" : "Locked — unlock via VIP Upgrades"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${colors.text}`}>{fmt(pkg.cost)}</p>
                  <p className={`text-xs ${colors.text} opacity-70`} style={displayFont}>{isAmharic ? "ብር" : "ETB"}</p>
                </div>
              </div>
              <div className={`flex gap-3 mb-4 relative z-10 ${colors.text} backdrop-blur-sm bg-white/20 rounded-2xl px-3 py-2.5 border border-white/30`}>
                <div className="flex-1">
                  <p className="text-xs opacity-70" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                    {t("packages.daily_return")}
                  </p>
                  <p className="font-bold text-sm">+{fmt(pkg.dailyReturn)} {isAmharic ? "ብር" : "ETB"}</p>
                </div>
                <div className="w-px bg-white/20 self-stretch" />
                <div className="flex-1">
                  <p className="text-xs opacity-70" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                    {isAmharic ? "የ 7 ቀን ትርፍ" : "7-Day Total"}
                  </p>
                  <p className="font-bold text-sm">{fmt(pkg.totalYield)} {isAmharic ? "ብር" : "ETB"}</p>
                </div>
                <div className="w-px bg-white/20 self-stretch" />
                <div className="flex-1">
                  <p className="text-xs opacity-70" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                    {t("packages.duration")}
                  </p>
                  <p className="font-bold text-sm">{pkg.durationDays} {isAmharic ? "ቀናት" : "days"}</p>
                </div>
              </div>
              {!pkg.isLocked && (
                <button
                  onClick={() => handlePurchase(pkg.id, pkg.name, pkg.cost)}
                  disabled={purchaseMutation.isPending || !canAfford}
                  className={`w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] relative z-10 ${
                    canAfford
                      ? "bg-white/20 hover:bg-white/30 " + colors.text
                      : "bg-white/10 opacity-50 cursor-not-allowed " + colors.text
                  }`}
                  style={displayFont}
                >
                  {!canAfford
                    ? (isAmharic ? `ተጨማሪ ${fmt(pkg.cost - (summary?.mainBalance ?? 0))} ብር ያስፈልጋል` : `Need ${fmt(pkg.cost - (summary?.mainBalance ?? 0))} more ETB`)
                    : purchaseMutation.isPending ? (isAmharic ? "በማንቃት ላይ..." : "Activating...") : (isAmharic ? `${pkg.name} ፓኬጅን ይግዙ` : `Activate ${pkg.name}`)}
                </button>
              )}
              {pkg.isLocked && (
                <Link href="/vip-upgrades" className={`block w-full py-3 rounded-2xl font-bold text-sm text-center bg-white/10 relative z-10 ${colors.text}`} style={displayFont}>
                  {isAmharic ? "የመክፈቻ መስፈርቶችን ይመልከቱ" : "View Unlock Requirements"}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Active package info */}
      {summary?.activePackageName && (
        <div className="mt-6 bg-card rounded-3xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
            <span className="font-bold text-foreground" style={displayFont}>
              {isAmharic ? "ንቁ ፓኬጅ፦ " : "Active: "}{summary.activePackageName}
            </span>
          </div>
          <p className="text-sm text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            {isAmharic
              ? `ዕለታዊ ገቢ +${fmt(summary.activePackageDailyReturn ?? 0)} ብር/ቀን · ${summary.daysUntilExpiry} ቀናት ቀርተዋል`
              : `Earning +${fmt(summary.activePackageDailyReturn ?? 0)} ETB/day · ${summary.daysUntilExpiry} days remaining`}
          </p>
        </div>
      )}
    </div>
  );
}
