import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/context/language-context";
import { useLocation } from "wouter";
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle2 } from "lucide-react";

import protestAvatar from "@/assets/avatar/wired-outline-656-person-protesting-hover-pinch.webp";
import walkingAvatar from "@/assets/avatar/wired-outline-646-person-walking-loop-cycle.webp";

interface TutorialStep {
  route: string;
  targetSelector: string;
  title: string;
  titleAm: string;
  titleOr: string;
  description: string;
  descriptionAm: string;
  descriptionOr: string;
  targetBadge: string;
  targetBadgeAm: string;
  targetBadgeOr: string;
  actionHint: string;
  actionHintAm: string;
  actionHintOr: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    route: "/dashboard",
    targetSelector: "#tut-wallet",
    title: "Main Wallet Balance",
    titleAm: "ዋና ቀሪ ሂሳብ",
    titleOr: "Haftee Qarshii",
    description: "Your live ETB balance protected by the Reserve Floor.",
    descriptionAm: "ዋና የብር ሂሳብዎ በሪዘርቭ ፍሎር ሙሉ በሙሉ የተጠበቀ ነው።",
    descriptionOr: "Hafteen qarshii keessanii eegumsa guutuu qaba.",
    targetBadge: "1/8",
    targetBadgeAm: "1/8",
    targetBadgeOr: "1/8",
    actionHint: "👉 Tap here to explore Deposit!",
    actionHintAm: "👉 ተቀማጭን ለማየት እዚህ ይጫኑ!",
    actionHintOr: "👉 Galcha ilaaluuf as tuqaa!",
  },
  {
    route: "/deposit",
    targetSelector: "#tut-deposit-form",
    title: "Instant Deposit",
    titleAm: "ፈጣን ተቀማጭ",
    titleOr: "Galcha Saffisaa",
    description: "Transfer via Telebirr or CBE & upload your receipt.",
    descriptionAm: "በቴሌብር ወይም ንግድ ባንክ ያስተላልፉና ደረሰኝ ያረጋግጡ።",
    descriptionOr: "Telebirr ykn CBE dhaan galchaa nagahee galchaa.",
    targetBadge: "2/8",
    targetBadgeAm: "2/8",
    targetBadgeOr: "2/8",
    actionHint: "👉 Tap to view 7-Day VIP Packages!",
    actionHintAm: "👉 የ 7 ቀን ቪአይፒ ለማየት ይጫኑ!",
    actionHintOr: "👉 Paakeejota VIP ilaaluuf tuqaa!",
  },
  {
    route: "/packages",
    targetSelector: "#tut-packages-list",
    title: "7-Day VIP Packages",
    titleAm: "የ 7 ቀን ቪአይፒ ፓኬጆች",
    titleOr: "Paakeejota VIP 7",
    description: "Activate VIP tiers for automatic daily profit streaming.",
    descriptionAm: "በየ 24 ሰዓቱ የተረጋገጠ ትርፍ የሚያስገኙ ፓኬጆችን ይክፈቱ።",
    descriptionOr: "Paakeejota VIP banuudhaan bu'aa guyyaa argadhaa.",
    targetBadge: "3/8",
    targetBadgeAm: "3/8",
    targetBadgeOr: "3/8",
    actionHint: "👉 Tap to check Naomi Arcade Games!",
    actionHintAm: "👉 ናኦሚ አርኬድን ለማየት ይጫኑ!",
    actionHintOr: "👉 Taphawwan Naomi ilaaluuf tuqaa!",
  },
  {
    route: "/games",
    targetSelector: "#tut-games-spinner",
    title: "Naomi Arcade Games",
    titleAm: "ናኦሚ አርኬድ ጨዋታዎች",
    titleOr: "Taphawwan Naomi",
    description: "Spin the Minecraft Mob Picker to win cash prizes.",
    descriptionAm: "የማይንክራፍት ካራክተሮችን በማሽከርከር ገንዘብ ያሸንፉ።",
    descriptionOr: "Taphawwan taphachuun badhaasa qarshii argadhaa.",
    targetBadge: "4/8",
    targetBadgeAm: "4/8",
    targetBadgeOr: "4/8",
    actionHint: "👉 Tap to view Daily Tasks!",
    actionHintAm: "👉 የዕለት ተግባራትን ለማየት ይጫኑ!",
    actionHintOr: "👉 Hojiiwwan Guyyaa ilaaluuf tuqaa!",
  },
  {
    route: "/tasks",
    targetSelector: "#tut-tasks-list",
    title: "Daily Tasks & Videos",
    titleAm: "የዕለት ተግባራት",
    titleOr: "Hojiiwwan Guyyaa",
    description: "Watch short videos & complete habits to collect extra Birr.",
    descriptionAm: "ቪዲዮዎችን በመመልከት እና ቀላል ተግባራትን በማጠናቀቅ ተጨማሪ ብር ያግኙ።",
    descriptionOr: "Viidiyoo daawwachuun qarshii dabalataa sassaabbadhaa.",
    targetBadge: "5/8",
    targetBadgeAm: "5/8",
    targetBadgeOr: "5/8",
    actionHint: "👉 Tap to check Live Leaderboard!",
    actionHintAm: "👉 ደረጃ ሰንጠረዥን ለማየት ይጫኑ!",
    actionHintOr: "👉 Sadarkaa Miseensota ilaaluuf tuqaa!",
  },
  {
    route: "/leaderboard",
    targetSelector: "#tut-leaderboard-top",
    title: "689 Member Leaderboard",
    titleAm: "የደረጃ ሰንጠረዥ",
    titleOr: "Sadarkaa Miseensota",
    description: "Real-time active rankings competition with animated key badges.",
    descriptionAm: "የ 689 ተጠቃሚዎች የቀጥታ የገቢ ደረጃዎች እና ውድድር።",
    descriptionOr: "Dorgommii sadarkaa miseensota 689 yeroo qabatamaa.",
    targetBadge: "6/8",
    targetBadgeAm: "6/8",
    targetBadgeOr: "6/8",
    actionHint: "👉 Tap to view KYC Verification!",
    actionHintAm: "👉 የማንነት ማረጋገጫ ለማየት ይጫኑ!",
    actionHintOr: "👉 Mirkaneessa Eenyummaa ilaaluuf tuqaa!",
  },
  {
    route: "/profile",
    targetSelector: "#tut-profile-kyc",
    title: "KYC ID Verification",
    titleAm: "የማንነት ማረጋገጫ (KYC)",
    titleOr: "Mirkaneessa KYC",
    description: "Submit your National/University ID to unlock instant withdrawals.",
    descriptionAm: "መታወቂያዎን በማስገባት የገንዘብ ማውጫ ፈቃድ ያረጋግጡ።",
    descriptionOr: "Waraqaa eenyummaa galchuun baasii eeggadhaa.",
    targetBadge: "7/8",
    targetBadgeAm: "7/8",
    targetBadgeOr: "7/8",
    actionHint: "👉 Tap to return for Daily Login Streak!",
    actionHintAm: "👉 የዕለት ጉርሻን ለማየት ወደ ዳሽቦርድ!",
    actionHintOr: "👉 Hirmaannaa Guyyaaf gara daashboordiitti!",
  },
  {
    route: "/dashboard",
    targetSelector: "#tut-streak",
    title: "Login Streak (+5 ETB)",
    titleAm: "የዕለት ተሳትፎ (+5 ብር)",
    titleOr: "Hirmaannaa Guyyaa (+5)",
    description: "Check in every 24h for free cash. You are all set to start earning!",
    descriptionAm: "በየቀኑ ተሳትፎ በመመዝገብ የ 5 ብር ነፃ ጉርሻ ያግኙ። አሁን ዝግጁ ኖት!",
    descriptionOr: "Guyyaa hunda galmaa'aa. Amma eegaluuf qophiidha!",
    targetBadge: "8/8",
    targetBadgeAm: "8/8",
    targetBadgeOr: "8/8",
    actionHint: "🎉 Ready to earn! Tap Finish.",
    actionHintAm: "🎉 ዝግጁ ኖት! ጨርስን ይጫኑ።",
    actionHintOr: "🎉 Qophiidha! Xumuri tuqaa.",
  },
];

// STRICTLY ONE-TIME PERMANENT STORAGE KEY
const PERMANENT_TUTORIAL_KEY = "birrstream_tutorial_permanent_v1";

interface TargetBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

type AnimPhase = "idle" | "collapsing" | "walking";

export function TutorialGuide() {
  const { isAmharic, isOromo } = useLanguage();
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [targetBox, setTargetBox] = useState<TargetBox | null>(null);

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0.045em" : "-0.01em",
  };

  // Strictly check one-time status on initial load
  useEffect(() => {
    const isDone = localStorage.getItem(PERMANENT_TUTORIAL_KEY);
    if (!isDone) {
      const timer = setTimeout(() => {
        // Double-check key before opening
        if (!localStorage.getItem(PERMANENT_TUTORIAL_KEY)) {
          setIsOpen(true);
        }
      }, 900);
      return () => clearTimeout(timer);
    }
  }, []);

  // Recalculate target element coordinates
  const updateTargetBox = useCallback(() => {
    const step = TUTORIAL_STEPS[currentStep];
    if (!step) return;

    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetBox({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      });
    } else {
      setTargetBox(null);
    }
  }, [currentStep]);

  // Route change and smooth scroll tracking
  useEffect(() => {
    if (!isOpen) return;

    const step = TUTORIAL_STEPS[currentStep];
    if (!step) return;

    if (location !== step.route) {
      setLocation(step.route);
    }

    const timer = setTimeout(() => {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          updateTargetBox();
          setAnimPhase("idle");
        }, 250);
      } else {
        updateTargetBox();
        setAnimPhase("idle");
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, currentStep, location, setLocation, updateTargetBox]);

  // Keep coordinates updated on scroll / resize
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("scroll", updateTargetBox, true);
    window.addEventListener("resize", updateTargetBox);
    return () => {
      window.removeEventListener("scroll", updateTargetBox, true);
      window.removeEventListener("resize", updateTargetBox);
    };
  }, [isOpen, updateTargetBox]);

  // Allow manual replay strictly from Profile Guide button
  useEffect(() => {
    const handleManualStart = () => {
      setCurrentStep(0);
      setAnimPhase("idle");
      setIsOpen(true);
      if (location !== "/dashboard") {
        setLocation("/dashboard");
      }
    };
    window.addEventListener("birr:start-tutorial", handleManualStart);
    return () => window.removeEventListener("birr:start-tutorial", handleManualStart);
  }, [location, setLocation]);

  // Snappy Multi-Stage Transition: Collapse -> Walk -> Expand
  const advanceStep = useCallback((nextIdx: number) => {
    if (animPhase !== "idle") return;

    setAnimPhase("collapsing");
    setTimeout(() => {
      setAnimPhase("walking");
      setCurrentStep(nextIdx);
    }, 200);
  }, [animPhase]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      advanceStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      advanceStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    // Mark strictly as completed permanently
    localStorage.setItem(PERMANENT_TUTORIAL_KEY, "done");
  };

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  // ── FLUID CLAMPED POSITIONING (NEVER CUT OFF OR HIDDEN) ──
  const winWidth = typeof window !== "undefined" ? window.innerWidth : 380;
  const winHeight = typeof window !== "undefined" ? window.innerHeight : 700;

  const bubbleW = Math.min(235, winWidth - 32);
  const bubbleH = 100;
  const avatarSize = 44;

  // Space check: Place above if sufficient headroom, else below
  const spaceAbove = targetBox ? targetBox.y : winHeight / 2;
  const placeAbove = spaceAbove >= (bubbleH + avatarSize + 40);

  // Clamped Avatar Position
  const rawAvatarX = targetBox ? targetBox.centerX : winWidth / 2;
  const avatarX = Math.max(avatarSize / 2 + 16, Math.min(winWidth - avatarSize / 2 - 16, rawAvatarX));

  const avatarY = targetBox
    ? placeAbove
      ? Math.max(targetBox.y - avatarSize - 16, bubbleH + 12)
      : Math.min(targetBox.y + targetBox.height + 16, winHeight - avatarSize - 80)
    : winHeight / 2;

  // Clamped Bubble Position
  const bubbleX = Math.max(12, Math.min(winWidth - bubbleW - 12, avatarX - bubbleW / 2));
  const bubbleY = placeAbove
    ? Math.max(8, avatarY - bubbleH - 8)
    : Math.min(winHeight - bubbleH - 76, avatarY + avatarSize + 8);

  // Black Dotted Line Coordinates
  const lineStartX = targetBox ? Math.max(16, Math.min(winWidth - 16, targetBox.centerX)) : avatarX;
  const lineStartY = targetBox
    ? placeAbove
      ? targetBox.y - 2
      : targetBox.y + targetBox.height + 2
    : avatarY;

  const lineEndX = avatarX;
  const lineEndY = placeAbove ? avatarY + avatarSize - 4 : avatarY + 4;

  const isCollapsing = animPhase === "collapsing";
  const isWalking = animPhase === "walking";
  const isVisible = animPhase === "idle";

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none select-none overflow-hidden">
      {/* ── TARGET COMPONENT INTERACTIVE CLICKABLE SPOTLIGHT ── */}
      {targetBox && (
        <div
          onClick={handleNext}
          className="absolute z-10 pointer-events-auto cursor-pointer transition-all duration-300 ease-out group"
          style={{
            left: targetBox.x - 3,
            top: targetBox.y - 3,
            width: targetBox.width + 6,
            height: targetBox.height + 6,
          }}
          title="Click to interact & advance"
        >
          {/* Crisp highlight ring */}
          <div className="w-full h-full rounded-2xl border-2 border-amber-400 shadow-[0_0_15px_rgba(245,230,163,0.9)] group-hover:border-emerald-400 transition-colors" />

          {/* Beacon Point */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
            style={{
              top: placeAbove ? -8 : "auto",
              bottom: placeAbove ? "auto" : -8,
            }}
          >
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-90" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-white shadow-sm" />
            </span>
          </div>
        </div>
      )}

      {/* ── 1. BLACK DOTTED LINE (Connecting Feature to Avatar) ── */}
      {targetBox && (
        <svg
          className="absolute inset-0 w-full h-full z-20 pointer-events-none overflow-visible"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isCollapsing ? `scale(0)` : `scale(1)`,
            transformOrigin: `${avatarX}px ${avatarY}px`,
            transition: "all 180ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <line
            x1={lineStartX}
            y1={lineStartY}
            x2={lineEndX}
            y2={lineEndY}
            stroke="#121331"
            strokeWidth="2.5"
            strokeDasharray="4,4"
            className="dark:stroke-white drop-shadow-sm"
          />
          <circle cx={lineStartX} cy={lineStartY} r="3" fill="#121331" className="dark:fill-white" />
          <circle cx={lineEndX} cy={lineEndY} r="3" fill="#121331" className="dark:fill-white" />
        </svg>
      )}

      {/* ── 2. ANIMATED AVATAR (Between Line and Bubble) ── */}
      <div
        className="absolute z-30 pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: avatarX - avatarSize / 2,
          top: avatarY,
          width: avatarSize,
          height: avatarSize,
          transition: isWalking
            ? "all 400ms cubic-bezier(0.25, 1, 0.5, 1)"
            : "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {isWalking ? (
          <div className="w-full h-full animate-bounce drop-shadow-md">
            <img src={walkingAvatar} alt="Guide" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-full h-full drop-shadow-md animate-in zoom-in-75 duration-150">
            <img src={protestAvatar} alt="Guide" className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      {/* ── 3. TINY CHAT BUBBLE (Snugly Adjacent to Avatar) ── */}
      <div
        className="absolute z-40 pointer-events-auto transition-all"
        style={{
          left: bubbleX,
          top: bubbleY,
          width: bubbleW,
          transform: isVisible ? "scale(1) translateY(0px)" : "scale(0) translateY(8px)",
          transformOrigin: `${avatarX - bubbleX}px ${placeAbove ? "100%" : "0%"}`,
          opacity: isVisible ? 1 : 0,
          transition: "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Compact Comic Bubble */}
        <div className="w-full bg-card border-2 border-[#121331] dark:border-white rounded-2xl p-2 sm:p-2.5 shadow-xl relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.2 rounded-full bg-primary/15 text-primary border border-primary/30 text-[8px] font-black uppercase">
                {isAmharic ? step.targetBadgeAm : isOromo ? step.targetBadgeOr : step.targetBadge}
              </span>
              <span className="text-[8px] text-amber-500 font-bold flex items-center gap-0.5">
                <Sparkles className="w-2 h-2" />
                <span>Guide</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleComplete}
              className="w-4 h-4 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              title="Close Tutorial (Never Show Again)"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Title */}
          <h4 className="font-bold text-[11px] text-foreground mb-0.5 leading-tight" style={displayFont}>
            {isAmharic ? step.titleAm : isOromo ? step.titleOr : step.title}
          </h4>

          {/* Description */}
          <p
            className="text-[9.5px] text-muted-foreground leading-tight mb-1"
            style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
          >
            {isAmharic ? step.descriptionAm : isOromo ? step.descriptionOr : step.description}
          </p>

          {/* Interactive Tap Hint */}
          <div
            onClick={handleNext}
            className="bg-primary/10 border border-primary/25 rounded-md px-1.5 py-0.5 mb-1 flex items-center gap-1 text-[8.5px] font-bold text-primary cursor-pointer hover:bg-primary/20 transition-colors"
          >
            <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{isAmharic ? step.actionHintAm : isOromo ? step.actionHintOr : step.actionHint}</span>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-0.5 border-t border-border/60">
            {/* Step Dots */}
            <div className="flex items-center gap-0.5">
              {TUTORIAL_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-150 ${
                    idx === currentStep
                      ? "w-2.5 bg-primary"
                      : idx < currentStep
                      ? "w-1 bg-primary/40"
                      : "w-0.5 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            {/* Nav Buttons */}
            <div className="flex items-center gap-1">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-1.5 py-0.2 rounded-full text-[8.5px] font-bold text-muted-foreground hover:text-foreground bg-muted/60 transition-colors flex items-center gap-0.5 cursor-pointer"
                  style={displayFont}
                >
                  <ArrowLeft className="w-2 h-2" />
                  <span>{isAmharic ? "ወደ ኋላ" : "Back"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer"
                style={displayFont}
              >
                <span>
                  {isLast
                    ? isAmharic
                      ? "ጨርስ"
                      : isOromo
                      ? "Xumuri"
                      : "Finish"
                    : isAmharic
                    ? "ቀጣይ"
                    : isOromo
                    ? "Itti Fufi"
                    : "Next"}
                </span>
                <ArrowRight className="w-2 h-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
