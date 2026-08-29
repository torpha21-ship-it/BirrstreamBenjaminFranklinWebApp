import { useListPackages, getListPackagesQueryKey, usePurchasePackage, useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Lock, Star, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { BSLogo } from "@/components/bs-logo";
import { useLanguage } from "@/context/language-context";

// Animated VIP icons from `VIP Icons`
import vip1Anim from "@/assets/vip-icons/wired-outline-1145-wings-hover-pinch.webp";
import vip2Anim from "@/assets/vip-icons/wired-outline-1148-bee-hover-pinch.webp";
import vip3Anim from "@/assets/vip-icons/wired-outline-1154-spider-hover-pinch.webp";
import vip4Anim from "@/assets/vip-icons/wired-outline-2815-ghost-hover-pinch.webp";
import vip5Anim from "@/assets/vip-icons/wired-outline-2936-mistletoe-hover-pinch.webp";

// SVGs and special tier arts (VIP4 SVG used for VIP Elite as instructed)
import vip4Svg from "@/assets/decor/vip4.svg";
import apexBg from "@/assets/decor/vip-apex.png";
import titanBg from "@/assets/decor/vip-titan.png";
import alphaBg from "@/assets/decor/vip-alpha.png";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TIER_COLORS: Record<string, { bg: string; text: string; badge: string; glassBg: string; buttonBg: string; buttonText: string }> = {
  vip1: {
    bg: "bg-[#A8D5B5]",
    text: "text-[#1B5E38]",
    badge: "bg-[#1B5E38] text-white",
    glassBg: "bg-white/30 border-white/40",
    buttonBg: "bg-[#1B5E38] hover:bg-[#1B5E38]/90",
    buttonText: "text-white",
  },
  vip2: {
    bg: "bg-[#F5E6A3]",
    text: "text-[#7A5E00]",
    badge: "bg-[#7A5E00] text-white",
    glassBg: "bg-white/30 border-white/40",
    buttonBg: "bg-[#7A5E00] hover:bg-[#7A5E00]/90",
    buttonText: "text-white",
  },
  vip3: {
    bg: "bg-[#C9BDF5]",
    text: "text-[#4A359C]",
    badge: "bg-[#4A359C] text-white",
    glassBg: "bg-white/30 border-white/40",
    buttonBg: "bg-[#4A359C] hover:bg-[#4A359C]/90",
    buttonText: "text-white",
  },
  vip4: {
    bg: "bg-[#F2A89A]",
    text: "text-[#A32B1C]",
    badge: "bg-[#A32B1C] text-white",
    glassBg: "bg-white/30 border-white/40",
    buttonBg: "bg-[#A32B1C] hover:bg-[#A32B1C]/90",
    buttonText: "text-white",
  },
  vip5: {
    bg: "bg-[#2B7A4B]",
    text: "text-white",
    badge: "bg-white text-[#2B7A4B]",
    glassBg: "bg-white/20 border-white/30",
    buttonBg: "bg-white hover:bg-white/90",
    buttonText: "text-[#2B7A4B]",
  },
  elite: {
    bg: "bg-[#1E1E2F]",
    text: "text-white",
    badge: "bg-amber-400 text-black",
    glassBg: "bg-white/10 border-white/20",
    buttonBg: "bg-amber-400 hover:bg-amber-300",
    buttonText: "text-black",
  },
  apex: {
    bg: "bg-[#1A1A1A]",
    text: "text-white",
    badge: "bg-primary text-white",
    glassBg: "bg-white/10 border-white/20",
    buttonBg: "bg-primary hover:bg-primary/90",
    buttonText: "text-white",
  },
  titan: {
    bg: "bg-[#1A1A1A]",
    text: "text-white",
    badge: "bg-primary text-white",
    glassBg: "bg-white/10 border-white/20",
    buttonBg: "bg-primary hover:bg-primary/90",
    buttonText: "text-white",
  },
  alpha: {
    bg: "bg-[#1A1A1A]",
    text: "text-white",
    badge: "bg-primary text-white",
    glassBg: "bg-white/10 border-white/20",
    buttonBg: "bg-primary hover:bg-primary/90",
    buttonText: "text-white",
  },
};

const TIER_ANIMATED_ICONS: Record<string, string> = {
  vip1: vip1Anim,
  vip2: vip2Anim,
  vip3: vip3Anim,
  vip4: vip4Anim,
  vip5: vip5Anim,
};

const TIER_BG_IMAGES: Record<string, string> = {
  elite: vip4Svg, // User instruction: "first use the VIP4 SVG in place of VIP Elite"
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
  const { t, isAmharic, isOromo, currency } = useLanguage();

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0" : "-0.01em",
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
              title: isAmharic ? `${name} ነቅቷል!` : isOromo ? `Paakeejiin ${name} hojjechuu eegaleera!` : `${name} activated!`,
              description: isAmharic
                ? `ዕለታዊ የ +${fmt(data.package?.dailyReturn ?? 0)} ብር ትርፍ አሁን ጀምሯል።`
                : isOromo
                ? `Galiin guyyaa +${fmt(data.package?.dailyReturn ?? 0)} ${currency} amma eegaleera.`
                : `Daily returns of +${fmt(data.package?.dailyReturn ?? 0)} ${currency} start now.`
            });
          } else {
            toast({
              title: isAmharic ? "ማንቃት አልተሳካም" : isOromo ? "Hojjechiisuun hin milkoofne" : "Activation failed",
              description: isAmharic ? "እባክዎ ቀሪ ሂሳብዎን ያረጋግጡ" : isOromo ? "Haftee qarshii keessanii mirkaneeffadhaa" : "Please check your balance",
              variant: "destructive"
            });
          }
        },
        onError: () => toast({ title: isAmharic ? "ስህተት ተከስቷል" : isOromo ? "Dogoggorri uumameera" : "An error occurred", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="px-4 pt-6 pb-8 max-w-md mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border shadow-sm flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground" style={displayFont}>
            {t("packages.title")}
          </h1>
          <p className="text-xs text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            {isAmharic ? "ቀሪ ሂሳብ፦ " : isOromo ? "Haftee Qarshii፦ " : "Balance: "}{fmt(summary?.mainBalance ?? 0)} {currency}
          </p>
        </div>
      </div>

      <div id="tut-packages-list" className="space-y-4">
        {isLoading ? Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-48 bg-card rounded-3xl animate-pulse border border-border" />
        )) : packages?.map(pkg => {
          const colors = TIER_COLORS[pkg.tier] ?? TIER_COLORS.vip1;
          const canAfford = (summary?.mainBalance ?? 0) >= pkg.cost;
          const animatedIcon = TIER_ANIMATED_ICONS[pkg.tier];
          const bgImg = TIER_BG_IMAGES[pkg.tier];

          return (
            <div key={pkg.id} className={`${colors.bg} rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm`}>
              {/* Background Artwork for Elite, Apex, Titan, Alpha (Original state) */}
              {bgImg && (
                <img
                  src={bgImg}
                  alt=""
                  aria-hidden="true"
                  className="absolute right-0 top-0 w-44 h-44 object-contain object-right-top pointer-events-none select-none opacity-80"
                />
              )}

              {pkg.tier === "vip5" && (
                <div className="absolute top-3 right-3 z-10">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-spin" style={{ animationDuration: "8s" }} />
                </div>
              )}

              {/* Card Header: Tier Badge on left, Price on right */}
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                  <span className={`text-xs font-black px-3.5 py-1 rounded-full whitespace-nowrap shadow-sm ${colors.badge}`} style={displayFont}>
                    {pkg.name}
                  </span>
                  {pkg.isLocked && (
                    <div className="inline-flex items-center gap-1 mt-1.5 backdrop-blur-sm bg-white/20 rounded-full px-2.5 py-0.5 border border-white/30 whitespace-nowrap">
                      <Lock className={`w-3 h-3 ${colors.text}`} />
                      <span className={`text-[10.5px] font-semibold ${colors.text}`} style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                        {isAmharic ? "የተቆለፈ — በቪአይፒ ግቦች ይክፈቱ" : isOromo ? "Cufameera — Sadarkaa VIPtiin banaa" : "Locked — unlock via VIP Upgrades"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${colors.text} leading-none`}>{fmt(pkg.cost)}</p>
                  <p className={`text-xs ${colors.text} opacity-80 font-bold mt-1`} style={displayFont}>{currency}</p>
                </div>
              </div>

              {/* Centered Animated Icon for VIP 1–5 ONLY */}
              {animatedIcon && (
                <div className="flex items-center justify-center my-1 relative z-10">
                  <img
                    src={animatedIcon}
                    alt={pkg.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-sm pointer-events-none select-none"
                  />
                </div>
              )}

              {/* Glass Details Card & Action Button */}
              <div className="relative z-10 space-y-2 mt-2">
                <div className={`flex gap-2 ${colors.text} backdrop-blur-md ${colors.glassBg} rounded-2xl px-3 py-2 border`}>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] opacity-75 font-semibold" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                      {t("packages.daily_return")}
                    </p>
                    <p className="font-extrabold text-xs sm:text-sm">+{fmt(pkg.dailyReturn)} {currency}</p>
                  </div>
                  <div className="w-px bg-current opacity-20 self-stretch" />
                  <div className="flex-1 text-center">
                    <p className="text-[10px] opacity-75 font-semibold" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                      {isAmharic ? "የ 7 ቀን ትርፍ" : isOromo ? "Waliigala Guyyaa 7" : "7-Day Total"}
                    </p>
                    <p className="font-extrabold text-xs sm:text-sm">{fmt(pkg.totalYield)} {currency}</p>
                  </div>
                  <div className="w-px bg-current opacity-20 self-stretch" />
                  <div className="flex-1 text-center">
                    <p className="text-[10px] opacity-75 font-semibold" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                      {t("packages.duration")}
                    </p>
                    <p className="font-extrabold text-xs sm:text-sm">{pkg.durationDays} {isAmharic ? "ቀናት" : isOromo ? "guyyoota" : "days"}</p>
                  </div>
                </div>

                {!pkg.isLocked ? (
                  <button
                    onClick={() => handlePurchase(pkg.id, pkg.name, pkg.cost)}
                    disabled={purchaseMutation.isPending || !canAfford}
                    className={`w-full py-2.5 rounded-2xl font-extrabold text-xs transition-all active:scale-[0.98] shadow-sm cursor-pointer ${
                      canAfford
                        ? `${colors.buttonBg} ${colors.buttonText}`
                        : "bg-white/20 opacity-50 cursor-not-allowed " + colors.text
                    }`}
                    style={displayFont}
                  >
                    {!canAfford
                      ? (isAmharic ? `ተጨማሪ ${fmt(pkg.cost - (summary?.mainBalance ?? 0))} ብር ያስፈልጋል` : isOromo ? `Dabalataan ${fmt(pkg.cost - (summary?.mainBalance ?? 0))} Qarshii barbaachisa` : `Need ${fmt(pkg.cost - (summary?.mainBalance ?? 0))} more ETB`)
                      : purchaseMutation.isPending ? (isAmharic ? "በማንቃት ላይ..." : isOromo ? "Hojjechiisaa jira..." : "Activating...") : (isAmharic ? `${pkg.name} ፓኬጅን ይግዙ` : isOromo ? `Paakeejii ${pkg.name} Biti` : `Activate ${pkg.name}`)}
                  </button>
                ) : (
                  <Link
                    href="/vip-upgrades"
                    className={`block w-full py-2.5 rounded-2xl font-bold text-xs text-center bg-white/20 hover:bg-white/30 border border-white/30 transition-colors ${colors.text}`}
                    style={displayFont}
                  >
                    {isAmharic ? "የመክፈቻ መስፈርቶችን ይመልከቱ" : isOromo ? "Ulaagaalee Banuuf Barbaachisan Ilaalaa" : "View Unlock Requirements"}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active package info */}
      {summary?.activePackageName && (
        <div className="mt-6 bg-card rounded-3xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
            <span className="font-bold text-foreground" style={displayFont}>
              {isAmharic ? "ንቁ ፓኬጅ፦ " : isOromo ? "Paakeejii Hojjechaa Jiru፦ " : "Active: "}{summary.activePackageName}
            </span>
          </div>
          <p className="text-sm text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            {isAmharic
              ? `ዕለታዊ ገቢ +${fmt(summary.activePackageDailyReturn ?? 0)} ብር/ቀን · ${summary.daysUntilExpiry} ቀናት ቀርተዋል`
              : isOromo
              ? `Galiin guyyaa +${fmt(summary.activePackageDailyReturn ?? 0)} Qarshii/guyyaa · guyyoota ${summary.daysUntilExpiry} hafan`
              : `Earning +${fmt(summary.activePackageDailyReturn ?? 0)} ${currency}/day · ${summary.daysUntilExpiry} days remaining`}
          </p>
        </div>
      )}
    </div>
  );
}
