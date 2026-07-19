import { useGetVipUpgradeGoals, getGetVipUpgradeGoalsQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Lock, CheckCircle2, Users, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import creatorImg from "@/assets/decor/creator.png";
import explorerImg from "@/assets/decor/explorer.png";
import jesterImg from "@/assets/decor/jester.png";
import outlawImg from "@/assets/decor/outlaw.png";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/** One background image per tier, cycling if there are more than 4 goals */
const GOAL_BG_IMAGES = [creatorImg, explorerImg, jesterImg, outlawImg];

/** Progress-bar colour per tier */
const BAR_COLORS = ["bg-[#D4B61B]", "bg-[#5B44BE]", "bg-[#C0402E]", "bg-primary"];

export default function VipUpgrades() {
  const { data: goals, isLoading } = useGetVipUpgradeGoals({ query: { queryKey: getGetVipUpgradeGoalsQueryKey() } });

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>VIP Upgrades</h1>
      </div>

      <div className="bg-[#1A1A1A] rounded-3xl p-5 mb-5 text-white">
        <p className="text-gray-400 text-sm">Earn premium VIP packages by growing your network. No cash purchase required.</p>
        <div className="mt-3 flex gap-3">
          <div className="flex items-center gap-1.5 text-gray-300 text-xs">
            <Users className="w-3.5 h-3.5" /> Direct referrals
          </div>
          <div className="flex items-center gap-1.5 text-gray-300 text-xs">
            <TrendingUp className="w-3.5 h-3.5" /> Network volume
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-56 bg-card rounded-3xl animate-pulse border border-border" />
            ))
          : goals?.map((goal, i) => {
              const bgImg = GOAL_BG_IMAGES[i % GOAL_BG_IMAGES.length];
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
                  {/* Very light vignette — keeps edges subtle without obscuring the photo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-transparent to-black/15" />

                  {/* Content: semi-opaque card backdrop so text is fully legible over any photo */}
                  <div className="relative z-10 m-4 p-4 bg-card/85 backdrop-blur-sm rounded-2xl">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Milestone</span>
                        <h3 className="text-xl font-bold text-foreground mt-0.5" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>{goal.packageName}</h3>
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
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground/70">Direct Referrals</span>
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
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground/70">Network Volume</span>
                          <span className="text-xs font-bold text-foreground">
                            {fmt(goal.currentDownlineVolume)}/{fmt(goal.requiredDownlineVolume)} ETB
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
                      <span className="text-sm font-bold text-foreground">Overall: {goal.progressPercent}%</span>
                      {goal.isUnlocked
                        ? <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/15 text-primary">Unlocked! 🎉</span>
                        : <span className="text-xs text-muted-foreground">{100 - goal.progressPercent}% remaining</span>
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
