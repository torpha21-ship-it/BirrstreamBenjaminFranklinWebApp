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
  nextRoute?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    route: "/dashboard",
    targetSelector: "#tut-wallet",
    title: "Main Wallet Balance",
    titleAm: "ዋና ቀሪ ሂሳብ",
    titleOr: "Haftee Qarshii",
    description: "Your live ETB balance with guaranteed safety floor protection.",
    descriptionAm: "ዋና የብር ሂሳብዎ በሪዘርቭ ፍሎር ሙሉ በሙሉ የተጠበቀ ነው።",
    descriptionOr: "Hafteen qarshii keessanii eegumsa guutuu qaba.",
    targetBadge: "1/8",
    targetBadgeAm: "1/8",
    targetBadgeOr: "1/8",
    actionHint: "👇 Tap Deposit below to fund!",
    actionHintAm: "👇 ለማስገባት ተቀማጭን ይጫኑ!",
    actionHintOr: "👇 Galchuuf tuqaa!",
    nextRoute: "/deposit",
  },
  {
    route: "/deposit",
    targetSelector: "#tut-deposit-form",
    title: "Instant Deposit",
    titleAm: "ፈጣን ተቀማጭ",
    titleOr: "Galcha Saffisaa",
    description: "Transfer via Telebirr/CBE & submit receipt for auto verification.",
    descriptionAm: "በቴሌብር/ንግድ ባንክ ያስተላልፉና ደረሰኝ በማያያዝ ያረጋግጡ።",
    descriptionOr: "Telebirr ykn CBE dhaan galchaa nagahee galchaa.",
    targetBadge: "2/8",
    targetBadgeAm: "2/8",
    targetBadgeOr: "2/8",
    actionHint: "👉 Next: 7-Day VIP Packages!",
    actionHintAm: "👉 ቀጣይ፦ የ 7 ቀን ቪአይፒ!",
    actionHintOr: "👉 Itti aanee: Paakeejota VIP!",
    nextRoute: "/packages",
  },
  {
    route: "/packages",
    targetSelector: "#tut-packages-list",
    title: "7-Day VIP Packages",
    titleAm: "የ 7 ቀን ቪአይፒ ፓኬጆች",
    titleOr: "Paakeejota VIP 7",
    description: "Activate VIP 1–5 tiers for streaming daily returns every 24h.",
    descriptionAm: "በየ 24 ሰዓቱ የተረጋገጠ ትርፍ የሚያስገኙ ፓኬጆችን ይክፈቱ።",
    descriptionOr: "Paakeejota VIP banuudhaan bu'aa guyyaa argadhaa.",
    targetBadge: "3/8",
    targetBadgeAm: "3/8",
    targetBadgeOr: "3/8",
    actionHint: "👉 Next: Naomi Arcade Games!",
    actionHintAm: "👉 ቀጣይ፦ ናኦሚ አርኬድ!",
    actionHintOr: "👉 Itti aanee: Taphawwan Naomi!",
    nextRoute: "/games",
  },
  {
    route: "/games",
    targetSelector: "#tut-games-spinner",
    title: "Naomi Arcade Games",
    titleAm: "ናኦሚ አርኬድ ጨዋታዎች",
    titleOr: "Taphawwan Naomi",
    description: "Spin the Minecraft Mob Picker to win instant Birr cash jackpots.",
    descriptionAm: "የማይንክራፍት ካራክተሮችን በማሽከርከር የገንዘብ ሽልማት ያሸንፉ።",
    descriptionOr: "Taphawwan taphachuun badhaasa qarshii argadhaa.",
    targetBadge: "4/8",
    targetBadgeAm: "4/8",
    targetBadgeOr: "4/8",
    actionHint: "👉 Next: Daily Task Rewards!",
    actionHintAm: "👉 ቀጣይ፦ የዕለት ተግባራት!",
    actionHintOr: "👉 Itti aanee: Hojiiwwan Guyyaa!",
    nextRoute: "/tasks",
  },
  {
    route: "/tasks",
    targetSelector: "#tut-tasks-list",
    title: "Daily Tasks & Videos",
    titleAm: "የዕለት ተግባራት",
    titleOr: "Hojiiwwan Guyyaa",
    description: "Watch short videos & complete habits to collect free extra Birr.",
    descriptionAm: "ቪዲዮዎችን በመመልከት እና ቀላል ተግባራትን በማጠናቀቅ ተጨማሪ ብር ያግኙ።",
    descriptionOr: "Viidiyoo daawwachuun qarshii dabalataa sassaabbadhaa.",
    targetBadge: "5/8",
    targetBadgeAm: "5/8",
    targetBadgeOr: "5/8",
    actionHint: "👉 Next: Live 689 Leaderboard!",
    actionHintAm: "👉 ቀጣይ፦ ደረጃ ሰንጠረዥ!",
    actionHintOr: "👉 Itti aanee: Sadarkaa Miseensota!",
    nextRoute: "/leaderboard",
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
    actionHint: "👉 Next: Identity Verification!",
    actionHintAm: "👉 ቀጣይ፦ የማንነት ማረጋገጫ!",
    actionHintOr: "👉 Itti aanee: Mirkaneessa Eenyummaa!",
    nextRoute: "/profile",
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
    actionHint: "👉 Next: Daily Login Streak!",
    actionHintAm: "👉 ቀጣይ፦ የዕለት ጉርሻ!",
    actionHintOr: "👉 Itti aanee: Hirmaannaa Guyyaa!",
    nextRoute: "/dashboard",
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

const TUTORIAL_STORAGE_KEY = "birrstream_tutorial_v4_completed";

interface TargetBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export function TutorialGuide() {
  const { isAmharic, isOromo } = useLanguage();
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  // Handle route change & smooth element scrolling
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
        setTimeout(updateTargetBox, 300);
      } else {
        updateTargetBox();
      }
    }, 150);

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
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Event listener to restart guide from Profile
  useEffect(() => {
    const handleStart = () => {
      setCurrentStep(0);
      setIsTransitioning(false);
      setIsOpen(true);
      if (location !== "/dashboard") {
        setLocation("/dashboard");
      }
    };
    window.addEventListener("birr:start-tutorial", handleStart);
    return () => window.removeEventListener("birr:start-tutorial", handleStart);
  }, [location, setLocation]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsTransitioning(false);
      }, 400);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsTransitioning(false);
      }, 400);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
  };

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  // Placement calculation for tiny floating bubble
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const isTargetInBottomHalf = targetBox ? targetBox.centerY > viewportHeight / 2 : false;
  const showBubbleAtTop = isTargetInBottomHalf;

  // Exact anchor coordinates for connecting pointer
  const bubbleAnchorX = typeof window !== "undefined" ? Math.min(window.innerWidth / 2, 170) : 160;
  const bubbleAnchorY = showBubbleAtTop ? 180 : viewportHeight - 180;

  const targetAnchorX = targetBox ? targetBox.centerX : bubbleAnchorX;
  const targetAnchorY = targetBox
    ? showBubbleAtTop
      ? targetBox.y - 4
      : targetBox.y + targetBox.height + 4
    : bubbleAnchorY;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none select-none">
      {/* ── CLEAN SPOTLIGHT ON TARGET (Clickable so user can interact!) ── */}
      {targetBox && (
        <div
          onClick={handleNext}
          className="absolute z-10 pointer-events-auto cursor-pointer transition-all duration-300 ease-out group"
          style={{
            left: targetBox.x - 4,
            top: targetBox.y - 4,
            width: targetBox.width + 8,
            height: targetBox.height + 8,
          }}
          title="Click to interact & advance"
        >
          {/* Animated Gold Glowing Ring */}
          <div className="w-full h-full rounded-2xl border-2 border-amber-400 shadow-[0_0_18px_rgba(245,230,163,0.9)] group-hover:border-emerald-400 transition-colors" />

          {/* Interactive Tap Ping Beacon */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
            style={{
              top: showBubbleAtTop ? -10 : "auto",
              bottom: showBubbleAtTop ? "auto" : -10,
            }}
          >
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-90" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border border-white shadow-sm" />
            </span>
          </div>
        </div>
      )}

      {/* ── ANIMATED CONNECTING POINTER LINE ── */}
      {targetBox && (
        <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="pointerLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E6A3" stopOpacity="1" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
            </linearGradient>
          </defs>

          <path
            d={`M ${targetAnchorX} ${targetAnchorY} Q ${(targetAnchorX + bubbleAnchorX) / 2} ${(targetAnchorY + bubbleAnchorY) / 2} ${bubbleAnchorX} ${bubbleAnchorY}`}
            fill="none"
            stroke="url(#pointerLineGrad)"
            strokeWidth="2.5"
            strokeDasharray="4,3"
            className="animate-[dash_1s_linear_infinite]"
          />
          <circle cx={targetAnchorX} cy={targetAnchorY} r="4" fill="#F5E6A3" stroke="#121331" strokeWidth="1.5" />
        </svg>
      )}

      {/* ── TINY FLOATING SPEECH BUBBLE & COMPACT AVATAR ── */}
      <div
        className={`absolute left-0 right-0 px-3 z-30 flex flex-col items-center pointer-events-auto transition-all duration-300 ease-out max-w-[260px] sm:max-w-[290px] mx-auto ${
          showBubbleAtTop ? "top-3 sm:top-5" : "bottom-3 sm:bottom-5"
        }`}
      >
        {/* Compact Avatar */}
        <div
          className={`relative z-40 transition-all duration-300 flex flex-col items-center ${
            showBubbleAtTop ? "order-2 -mt-2" : "order-1 -mb-2"
          }`}
        >
          {isTransitioning ? (
            <div className="w-12 h-12 sm:w-14 sm:h-14 animate-bounce drop-shadow-md">
              <img src={walkingAvatar} alt="Guide" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md animate-in zoom-in-90 duration-200">
              <img src={protestAvatar} alt="Guide" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        {/* Tiny Comic Speech Bubble */}
        <div
          className={`w-full bg-card/95 border-2 border-primary/70 rounded-2xl p-2.5 sm:p-3 shadow-lg relative z-30 ${
            showBubbleAtTop ? "order-1" : "order-2"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.2 rounded-full bg-primary/15 text-primary border border-primary/30 text-[8.5px] font-black uppercase">
                {isAmharic ? step.targetBadgeAm : isOromo ? step.targetBadgeOr : step.targetBadge}
              </span>
              <span className="text-[8.5px] text-amber-500 font-bold flex items-center gap-0.5">
                <Sparkles className="w-2 h-2" />
                <span>Guide</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleComplete}
              className="w-5 h-5 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              title="Close Tutorial"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Title */}
          <h4 className="font-bold text-xs text-foreground mb-0.5 leading-tight" style={displayFont}>
            {isAmharic ? step.titleAm : isOromo ? step.titleOr : step.title}
          </h4>

          {/* Description */}
          <p
            className="text-[10.5px] text-muted-foreground leading-snug mb-1.5"
            style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
          >
            {isAmharic ? step.descriptionAm : isOromo ? step.descriptionOr : step.description}
          </p>

          {/* Action Hint / Click Target */}
          {step.actionHint && (
            <div
              onClick={handleNext}
              className="bg-primary/10 border border-primary/25 rounded-lg px-2 py-1 mb-1.5 flex items-center gap-1 text-[9.5px] font-bold text-primary cursor-pointer hover:bg-primary/20 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
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
                      ? "w-3 bg-primary"
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
                  disabled={isTransitioning}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-muted-foreground hover:text-foreground bg-muted/60 transition-colors flex items-center gap-0.5 cursor-pointer"
                  style={displayFont}
                >
                  <ArrowLeft className="w-2.5 h-2.5" />
                  <span>{isAmharic ? "ወደ ኋላ" : "Back"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isTransitioning}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer"
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
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
