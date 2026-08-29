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
  actionHint?: string;
  actionHintAm?: string;
  actionHintOr?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    route: "/dashboard",
    targetSelector: "#tut-wallet",
    title: "Main Wallet Balance",
    titleAm: "ዋና ቀሪ ሂሳብ",
    titleOr: "Haftee Qarshii",
    description: "Your live ETB balance with safety floor protection.",
    descriptionAm: "ዋና የብር ሂሳብዎ በሪዘርቭ ፍሎር ሙሉ በሙሉ የተጠበቀ ነው።",
    descriptionOr: "Hafteen qarshii keessanii eegumsa guutuu qaba.",
    targetBadge: "1/8",
    targetBadgeAm: "1/8",
    targetBadgeOr: "1/8",
    actionHint: "👇 Tap Deposit below to fund!",
    actionHintAm: "👇 ለማስገባት ተቀማጭን ይጫኑ!",
    actionHintOr: "👇 Galchuuf tuqaa!",
  },
  {
    route: "/deposit",
    targetSelector: "#tut-deposit-form",
    title: "Instant Deposit",
    titleAm: "ፈጣን ተቀማጭ",
    titleOr: "Galcha Saffisaa",
    description: "Transfer via Telebirr/CBE & submit receipt.",
    descriptionAm: "በቴሌብር/ንግድ ባንክ ያስተላልፉና ደረሰኝ ያረጋግጡ።",
    descriptionOr: "Telebirr ykn CBE dhaan galchaa nagahee galchaa.",
    targetBadge: "2/8",
    targetBadgeAm: "2/8",
    targetBadgeOr: "2/8",
    actionHint: "👉 Next: 7-Day VIP Packages!",
    actionHintAm: "👉 ቀጣይ፦ የ 7 ቀን ቪአይፒ!",
    actionHintOr: "👉 Itti aanee: Paakeejota VIP!",
  },
  {
    route: "/packages",
    targetSelector: "#tut-packages-list",
    title: "7-Day VIP Packages",
    titleAm: "የ 7 ቀን ቪአይፒ ፓኬጆች",
    titleOr: "Paakeejota VIP 7",
    description: "Activate VIP 1–5 tiers for daily profit streaming.",
    descriptionAm: "በየቀኑ የተረጋገጠ ትርፍ የሚያስገኙ ፓኬጆችን ይክፈቱ።",
    descriptionOr: "Paakeejota VIP banuudhaan bu'aa guyyaa argadhaa.",
    targetBadge: "3/8",
    targetBadgeAm: "3/8",
    targetBadgeOr: "3/8",
    actionHint: "👉 Next: Naomi Arcade Games!",
    actionHintAm: "👉 ቀጣይ፦ ናኦሚ አርኬድ!",
    actionHintOr: "👉 Itti aanee: Taphawwan Naomi!",
  },
  {
    route: "/games",
    targetSelector: "#tut-games-spinner",
    title: "Naomi Arcade Games",
    titleAm: "ናኦሚ አርኬድ ጨዋታዎች",
    titleOr: "Taphawwan Naomi",
    description: "Spin Minecraft Mob Picker for cash jackpots.",
    descriptionAm: "የማይንክራፍት ካራክተሮችን በማሽከርከር ገንዘብ ያሸንፉ።",
    descriptionOr: "Taphawwan taphachuun badhaasa qarshii argadhaa.",
    targetBadge: "4/8",
    targetBadgeAm: "4/8",
    targetBadgeOr: "4/8",
    actionHint: "👉 Next: Daily Task Rewards!",
    actionHintAm: "👉 ቀጣይ፦ የዕለት ተግባራት!",
    actionHintOr: "👉 Itti aanee: Hojiiwwan Guyyaa!",
  },
  {
    route: "/tasks",
    targetSelector: "#tut-tasks-list",
    title: "Daily Tasks & Videos",
    titleAm: "የዕለት ተግባራት",
    titleOr: "Hojiiwwan Guyyaa",
    description: "Watch short videos & complete daily habits for extra Birr.",
    descriptionAm: "ቪዲዮዎችን በመመልከት እና ቀላል ተግባራትን በማጠናቀቅ ተጨማሪ ብር ያግኙ።",
    descriptionOr: "Viidiyoo daawwachuun qarshii dabalataa sassaabbadhaa.",
    targetBadge: "5/8",
    targetBadgeAm: "5/8",
    targetBadgeOr: "5/8",
    actionHint: "👉 Next: Live 689 Leaderboard!",
    actionHintAm: "👉 ቀጣይ፦ ደረጃ ሰንጠረዥ!",
    actionHintOr: "👉 Itti aanee: Sadarkaa Miseensota!",
  },
  {
    route: "/leaderboard",
    targetSelector: "#tut-leaderboard-top",
    title: "689 Member Leaderboard",
    titleAm: "የደረጃ ሰንጠረዥ",
    titleOr: "Sadarkaa Miseensota",
    description: "Active rankings competition with animated key badges.",
    descriptionAm: "የ 689 ተጠቃሚዎች የቀጥታ የገቢ ደረጃዎች እና ውድድር።",
    descriptionOr: "Dorgommii sadarkaa miseensota 689 yeroo qabatamaa.",
    targetBadge: "6/8",
    targetBadgeAm: "6/8",
    targetBadgeOr: "6/8",
    actionHint: "👉 Next: Identity Verification!",
    actionHintAm: "👉 ቀጣይ፦ የማንነት ማረጋገጫ!",
    actionHintOr: "👉 Itti aanee: Mirkaneessa Eenyummaa!",
  },
  {
    route: "/profile",
    targetSelector: "#tut-profile-kyc",
    title: "KYC ID Verification",
    titleAm: "የማንነት ማረጋገጫ (KYC)",
    titleOr: "Mirkaneessa KYC",
    description: "Submit your National/University ID for instant withdrawals.",
    descriptionAm: "መታወቂያዎን በማስገባት የገንዘብ ማውጫ ፈቃድ ያረጋግጡ።",
    descriptionOr: "Waraqaa eenyummaa galchuun baasii eeggadhaa.",
    targetBadge: "7/8",
    targetBadgeAm: "7/8",
    targetBadgeOr: "7/8",
    actionHint: "👉 Next: Daily Login Streak!",
    actionHintAm: "👉 ቀጣይ፦ የዕለት ጉርሻ!",
    actionHintOr: "👉 Itti aanee: Hirmaannaa Guyyaa!",
  },
  {
    route: "/dashboard",
    targetSelector: "#tut-streak",
    title: "Login Streak (+5 ETB)",
    titleAm: "የዕለት ተሳትፎ (+5 ብር)",
    titleOr: "Hirmaannaa Guyyaa (+5)",
    description: "Check in every 24h for free cash. You are all set!",
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

const TUTORIAL_STORAGE_KEY = "birrstream_tutorial_v5_completed";

interface TargetBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

type AnimPhase = "idle" | "collapsing" | "walking" | "expanding";

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

  // Recalculate target element position
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

  // Handle step / route changes
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
        }, 280);
      } else {
        updateTargetBox();
        setAnimPhase("idle");
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [isOpen, currentStep, location, setLocation, updateTargetBox]);

  // Reposition on scroll and resize
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("scroll", updateTargetBox, true);
    window.addEventListener("resize", updateTargetBox);
    return () => {
      window.removeEventListener("scroll", updateTargetBox, true);
      window.removeEventListener("resize", updateTargetBox);
    };
  }, [isOpen, updateTargetBox]);

  // Auto start on first visit
  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Event listener to restart guide from Profile
  useEffect(() => {
    const handleStart = () => {
      setCurrentStep(0);
      setAnimPhase("idle");
      setIsOpen(true);
      if (location !== "/dashboard") {
        setLocation("/dashboard");
      }
    };
    window.addEventListener("birr:start-tutorial", handleStart);
    return () => window.removeEventListener("birr:start-tutorial", handleStart);
  }, [location, setLocation]);

  // Snappy Multi-Stage Transition: Collapse line/bubble into avatar -> Walk to new feature -> Expand line & bubble
  const advanceStep = useCallback((nextStepIdx: number) => {
    if (animPhase !== "idle") return;

    // Stage 1: Gracefully collapse the black dotted line and speech bubble INTO the avatar
    setAnimPhase("collapsing");

    setTimeout(() => {
      // Stage 2: Avatar turns into walking avatar and starts traveling across screen
      setAnimPhase("walking");
      setCurrentStep(nextStepIdx);
    }, 220);
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
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
  };

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  // Spatial Proximity Calculation
  // We place [Target Feature] <--- [Black Dotted Line] ---> [Avatar Icon] ---> [Chat Bubble]
  // ALL 3 are closely anchored together.
  const winWidth = typeof window !== "undefined" ? window.innerWidth : 380;
  const winHeight = typeof window !== "undefined" ? window.innerHeight : 700;

  const isTargetInBottomHalf = targetBox ? targetBox.centerY > winHeight * 0.45 : false;

  // Avatar position (tightly anchored right beside/above the target element)
  const avatarSize = 48; // Compact 48px avatar
  const avatarX = targetBox ? Math.min(Math.max(targetBox.centerX, 50), winWidth - 50) : winWidth / 2;
  const avatarY = targetBox
    ? isTargetInBottomHalf
      ? Math.max(targetBox.y - avatarSize - 28, 20)
      : Math.min(targetBox.y + targetBox.height + 28, winHeight - avatarSize - 80)
    : winHeight / 2;

  // Dotted Line coordinates connecting Feature <---> Avatar
  const lineStartX = targetBox ? targetBox.centerX : avatarX;
  const lineStartY = targetBox
    ? isTargetInBottomHalf
      ? targetBox.y - 2
      : targetBox.y + targetBox.height + 2
    : avatarY;

  const lineEndX = avatarX;
  const lineEndY = isTargetInBottomHalf ? avatarY + avatarSize - 4 : avatarY + 4;

  // Chat Bubble coordinates (directly adjacent to the Avatar)
  const bubbleWidth = Math.min(240, winWidth - 32);
  const bubbleX = Math.min(Math.max(avatarX - bubbleWidth / 2, 16), winWidth - bubbleWidth - 16);
  const bubbleY = isTargetInBottomHalf ? avatarY - 88 : avatarY + avatarSize + 10;

  const isCollapsing = animPhase === "collapsing";
  const isWalking = animPhase === "walking";
  const isVisible = animPhase === "idle";

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none select-none">
      {/* ── TARGET COMPONENT SPOTLIGHT (Clickable to advance interactively!) ── */}
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
          title="Click component to interact & advance"
        >
          {/* Crisp highlight ring */}
          <div className="w-full h-full rounded-2xl border-2 border-amber-400 shadow-[0_0_16px_rgba(245,230,163,0.85)] group-hover:border-emerald-400 transition-colors" />

          {/* Beacon Point */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
            style={{
              top: isTargetInBottomHalf ? -8 : "auto",
              bottom: isTargetInBottomHalf ? "auto" : -8,
            }}
          >
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-90" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-white shadow-sm" />
            </span>
          </div>
        </div>
      )}

      {/* ── 1. BLACK DOTTED LINE (Connecting Target Feature to Avatar) ── */}
      {targetBox && (
        <svg
          className="absolute inset-0 w-full h-full z-20 pointer-events-none overflow-visible transition-opacity duration-200"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isCollapsing ? `scale(0)` : `scale(1)`,
            transformOrigin: `${avatarX}px ${avatarY}px`,
            transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Black Dotted Line */}
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

          {/* Anchor Dots */}
          <circle cx={lineStartX} cy={lineStartY} r="3.5" fill="#121331" className="dark:fill-white" />
          <circle cx={lineEndX} cy={lineEndY} r="3.5" fill="#121331" className="dark:fill-white" />
        </svg>
      )}

      {/* ── 2. ANIMATED AVATAR ICON (Positioned Between Line & Bubble) ── */}
      <div
        className="absolute z-30 pointer-events-none transition-all duration-400 ease-out"
        style={{
          left: avatarX - avatarSize / 2,
          top: avatarY,
          width: avatarSize,
          height: avatarSize,
          transition: isWalking
            ? "all 450ms cubic-bezier(0.25, 1, 0.5, 1)"
            : "all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {isWalking ? (
          // Walking Avatar: Travels smoothly across screen to the feature
          <div className="w-full h-full animate-bounce drop-shadow-md">
            <img
              src={walkingAvatar}
              alt="Walking Guide"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
            />
          </div>
        ) : (
          // Protesting Avatar: Appears right near feature pointing and explaining
          <div className="w-full h-full drop-shadow-md animate-in zoom-in-75 duration-200">
            <img
              src={protestAvatar}
              alt="Explaining Guide"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
            />
          </div>
        )}
      </div>

      {/* ── 3. TINY CHAT BUBBLE (Gracefully Collapses & Expands From Avatar) ── */}
      <div
        className="absolute z-40 pointer-events-auto transition-all"
        style={{
          left: bubbleX,
          top: bubbleY,
          width: bubbleWidth,
          transform: isVisible ? "scale(1) translateY(0px)" : "scale(0) translateY(12px)",
          transformOrigin: `${avatarX - bubbleX}px ${isTargetInBottomHalf ? "100%" : "0%"}`,
          opacity: isVisible ? 1 : 0,
          transition: "all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Comic Speech Bubble Body */}
        <div className="w-full bg-card border-2 border-[#121331] dark:border-white rounded-2xl p-2.5 shadow-xl relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
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
              title="Close Tutorial"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Title */}
          <h4 className="font-bold text-[11.5px] text-foreground mb-0.5 leading-tight" style={displayFont}>
            {isAmharic ? step.titleAm : isOromo ? step.titleOr : step.title}
          </h4>

          {/* Description */}
          <p
            className="text-[10px] text-muted-foreground leading-snug mb-1"
            style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
          >
            {isAmharic ? step.descriptionAm : isOromo ? step.descriptionOr : step.description}
          </p>

          {/* Action Hint */}
          {step.actionHint && (
            <div
              onClick={handleNext}
              className="bg-primary/10 border border-primary/25 rounded-md px-1.5 py-0.5 mb-1 flex items-center gap-1 text-[9px] font-bold text-primary cursor-pointer hover:bg-primary/20 transition-colors"
            >
              <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{isAmharic ? step.actionHintAm : isOromo ? step.actionHintOr : step.actionHint}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-1 border-t border-border/60">
            {/* Step Dots */}
            <div className="flex items-center gap-0.5">
              {TUTORIAL_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-200 ${
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
                  className="px-1.5 py-0.2 rounded-full text-[9px] font-bold text-muted-foreground hover:text-foreground bg-muted/60 transition-colors flex items-center gap-0.5 cursor-pointer"
                  style={displayFont}
                >
                  <ArrowLeft className="w-2 h-2" />
                  <span>{isAmharic ? "ወደ ኋላ" : "Back"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer"
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
