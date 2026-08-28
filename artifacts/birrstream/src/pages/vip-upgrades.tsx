import { useGetVipUpgradeGoals, getGetVipUpgradeGoalsQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Lock, CheckCircle2, Users, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/context/language-context";
import vip1Bg from "@/assets/decor/vip1.svg";
import vip2Bg from "@/assets/decor/vip3.svg";
import vip3Bg from "@/assets/decor/vip2.svg";
import vip4Bg from "@/assets/decor/vip4.svg";
import vip5Bg from "@/assets/decor/vip5.svg";
import eliteBg from "@/assets/decor/vip-elite.png";
import apexBg from "@/assets/decor/vip-apex.png";
import titanBg from "@/assets/decor/vip-titan.png";
import alphaBg from "@/assets/decor/vip-alpha.png";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const VIP_CARD_BACKGROUNDS: Record<string, string> = {
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

function getGoalBackground(packageName: string, index: number) {
  const key = packageName.toLowerCase().replace(/\s+/g, "");
  for (const k of Object.keys(VIP_CARD_BACKGROUNDS)) {
    if (key.includes(k)) return VIP_CARD_BACKGROUNDS[k];
  }
  const keys = Object.keys(VIP_CARD_BACKGROUNDS);
  return VIP_CARD_BACKGROUNDS[keys[index % keys.length]];
}

/** Progress-bar colour per tier */
const BAR_COLORS = ["bg-[#D4B61B]", "bg-[#5B44BE]", "bg-[#C0402E]", "bg-primary"];

export default function VipUpgrades() {
  const { data: goals, isLoading } = useGetVipUpgradeGoals({ query: { queryKey: getGetVipUpgradeGoalsQueryKey() } });
  const { t, isAmharic, isOromo, currency } = useLanguage();

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0" : "-0.01em",
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground" style={displayFont}>
          {t("profile.vip_upgrades")}
        </h1>
      </div>

      <div className="bg-[#1A1A1A] rounded-3xl p-5 mb-5 text-white">
        <p className="text-gray-400 text-sm" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
          {isAmharic
            ? "አውታረ መረብዎን በማሳደግ ነፃ የቪአይፒ ፓኬጆችን ያግኙ። ምንም የገንዘብ ግዢ አያስፈልግም።"
            : isOromo
            ? "Netwoorkii keessan babal'isuun paakeejota VIP gatii malee argadhaa. Kaffaltiin qarshii hin barbaachisu."
            : "Earn premium VIP packages by growing your network. No cash purchase required."}
        </p>
        <div className="mt-3 flex gap-3">
          <div className="flex items-center gap-1.5 text-gray-300 text-xs" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            <Users className="w-3.5 h-3.5" /> {isAmharic ? "ቀጥተኛ ተጋባዦች" : isOromo ? "Afeeramaa Kallattii" : "Direct referrals"}
          </div>
          <div className="flex items-center gap-1.5 text-gray-300 text-xs" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            <TrendingUp className="w-3.5 h-3.5" /> {isAmharic ? "የአውታረ መረብ ገቢ" : isOromo ? "Hamma Galcha Netwoorkii" : "Network volume"}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-56 bg-card rounded-3xl animate-pulse border border-border" />
            ))
          : goals?.map((goal, i) => {
              const bgImg = getGoalBackground(goal.packageName, i);
              const barColor = BAR_COLORS[i % BAR_COLORS.length];

              return (
                <div key={goal.id} className="rounded-3xl overflow-hidden relative min-h-[220px]">
                  {/* Full-bleed background photo */}
                  <img
                    src={bgImg}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none"
                  />
                  {/* Very light vignette */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-transparent to-black/15" />

                  {/* Content: semi-opaque card backdrop so text is fully legible over any photo */}
                  <div className="relative z-10 m-4 p-4 bg-card/85 backdrop-blur-sm rounded-2xl">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                          {isAmharic ? "የደረጃ ግብ" : isOromo ? "Galma Sadarkaa" : "Milestone"}
                        </span>
                        <h3 className="text-xl font-bold text-foreground mt-0.5" style={displayFont}>{goal.packageName}</h3>
                      </div>
                      {goal.isUnlocked
                        ? <CheckCircle2 className="w-7 h-7 text-primary" />
                        : <Lock className="w-6 h-6 text-muted-foreground" />
                      }
                    </div>

                    {/* Requirements */}
                    <div className="space-y-3">
                      {/* Direct Referrals */}
                      <div>
                        <div className="flex justify-between mb-1" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                          <span className="text-xs font-semibold text-foreground/70">{isAmharic ? "ቀጥተኛ ተጋባዦች" : isOromo ? "Afeeramaa Kallattii" : "Direct Referrals"}</span>
                          <span className="text-xs font-bold text-foreground">
                            {goal.currentDirectReferrals}/{goal.requiredDirectReferrals}
                          </span>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(100, (goal.currentDirectReferrals / goal.requiredDirectReferrals) * 100)}%` }}
                          />
                        </div>
                      </div>
                      {/* Network Volume */}
                      <div>
                        <div className="flex justify-between mb-1" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                          <span className="text-xs font-semibold text-foreground/70">{isAmharic ? "የአውታረ መረብ ተቀማጭ መጠን" : isOromo ? "Hamma Galcha Netwoorkii" : "Network Volume"}</span>
                          <span className="text-xs font-bold text-foreground">
                            {fmt(goal.currentDownlineVolume)}/{fmt(goal.requiredDownlineVolume)} {currency}
                          </span>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(100, (goal.currentDownlineVolume / goal.requiredDownlineVolume) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground" style={displayFont}>
                        {isAmharic ? "ጠቅላላ ሂደት፦ " : isOromo ? "Waliigala፦ " : "Overall: "}{goal.progressPercent}%
                      </span>
                      {goal.isUnlocked
                        ? <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/15 text-primary" style={displayFont}>{isAmharic ? "ተከፍቷል! 🎉" : isOromo ? "Banameera! 🎉" : "Unlocked! 🎉"}</span>
                        : <span className="text-xs text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>{100 - goal.progressPercent}% {isAmharic ? "ቀርቷል" : isOromo ? "hafeera" : "remaining"}</span>
                      }
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
