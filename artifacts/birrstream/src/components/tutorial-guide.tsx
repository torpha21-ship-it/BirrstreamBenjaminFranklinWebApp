import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/context/language-context";
import { useLocation } from "wouter";
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle2 } from "lucide-react";

import protestAvatar from "@/assets/avatar/wired-outline-656-person-protesting-hover-pinch.webp";
import walkingAvatar from "@/assets/avatar/wired-outline-646-person-walking-loop-cycle.webp";

interface TutorialStep {
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
  preferredPlacement?: "top" | "bottom";
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetSelector: "#tut-wallet",
    title: "Main Balance & Total Yield",
    titleAm: "ዋና ቀሪ ሂሳብ እና የዕለት ትርፍ",
    titleOr: "Haftee Qarshii fi Bu'aa Guyyaa",
    description: "Here is your live ETB balance and accumulated returns. Your funds are protected by the Reserve Floor and grow every 24 hours.",
    descriptionAm: "ዋና የብር ሂሳብዎ እና የዕለት ገቢዎ እዚህ ይገኛል። የተቀማጭ ገንዘብዎ በሪዘርቭ ፍሎር ሙሉ በሙሉ የተጠበቀ ነው።",
    descriptionOr: "Hafteen qarshii keessanii fi bu'aan guyyaa asitti mul'ata. Qarshiin keessan eegamaadha.",
    targetBadge: "Step 1 of 5",
    targetBadgeAm: "ደረጃ 1 ከ 5",
    targetBadgeOr: "Sadarkaa 1/5",
    actionHint: "Live balance tracking & Reserve protection 🛡️",
    actionHintAm: "ቀጥታ የሂሳብ ቁጥጥር እና የሪዘርቭ ዋስትና 🛡️",
    actionHintOr: "Hordoffii haftee fi eegumsa rizarvii 🛡️",
    preferredPlacement: "bottom",
  },
  {
    targetSelector: "#tut-actions",
    title: "Instant Deposit & Action Center",
    titleAm: "ፈጣን ተቀማጭ እና የአገልግሎት አዝራሮች",
    titleOr: "Galcha Saffisaa fi Tajaajiloota",
    description: "Deposit ETB via Telebirr or CBE, request fast withdrawals, explore VIP packages, and earn from daily tasks right here.",
    descriptionAm: "በቴሌብር ወይም ንግድ ባንክ በፍጥነት ገንዘብ ያስገቡ፣ ያውጡ፣ ፓኬጆችን ይክፈቱ እና ከዕለት ተግባራት ተጨማሪ ብር ያግኙ።",
    descriptionOr: "Telebirr yookiin CBE dhaan qarshii galchaa, baasaa, paakeejota banaa.",
    targetBadge: "Step 2 of 5",
    targetBadgeAm: "ደረጃ 2 ከ 5",
    targetBadgeOr: "Sadarkaa 2/5",
    actionHint: "Deposit starting from only 500 ETB 💳",
    actionHintAm: "ዝቅተኛው ተቀማጭ 500 ብር ብቻ ነው 💳",
    actionHintOr: "Galchi xiqqaan 500 Qarshiidha 💳",
    preferredPlacement: "bottom",
  },
  {
    targetSelector: "#tut-streak",
    title: "Daily Login Streak (+5 ETB)",
    titleAm: "የዕለት ተሳትፎ ጉርሻ (+5 ብር)",
    titleOr: "Hirmaannaa Guyyaa (+5 Qarshii)",
    description: "Tap the Check-In button once every 24 hours to build your streak and claim instant cash bonus rewards into your balance.",
    descriptionAm: "በየቀኑ ይህንን አዝራር በመጫን የ 5 ብር የዕለት ጉርሻዎን በቀጥታ ወደ ዋና ሂሳብዎ ያስገቡ።",
    descriptionOr: "Guyyaa hunda galmaa'uun badhaasa qarshii 5 battalumatti fudhadhaa.",
    targetBadge: "Step 3 of 5",
    targetBadgeAm: "ደረጃ 3 ከ 5",
    targetBadgeOr: "Sadarkaa 3/5",
    actionHint: "Daily check-in gives free cash rewards 🎁",
    actionHintAm: "ነፃ የዕለት ተሳትፎ ሽልማቶች 🎁",
    actionHintOr: "Badhaasa galmee guyyaa bilisaa 🎁",
    preferredPlacement: "top",
  },
  {
    targetSelector: "#tut-vipcards",
    title: "3D VIP Cards & Guaranteed Yields",
    titleAm: "የ 7 ቀን ቪአይፒ ካርዶች እና ትርፍ",
    titleOr: "Kaardota VIP 3D fi Bu'aa",
    description: "Unlock special VIP 1 through VIP 5 time cards to activate high-multiplier daily returns for 7 consecutive days.",
    descriptionAm: "ለ 7 ተከታታይ ቀናት ከፍተኛ የዕለት ትርፍ የሚያስገኙ የቪአይፒ ካርዶችን እዚህ ይመልከቱ እና ያግብሩ።",
    descriptionOr: "Kaardota VIP fayyadamuun bu'aa olaanaa guyyoota 7f argadhaa.",
    targetBadge: "Step 4 of 5",
    targetBadgeAm: "ደረጃ 4 ከ 5",
    targetBadgeOr: "Sadarkaa 4/5",
    actionHint: "Up to +4,375 ETB weekly yield 📈",
    actionHintAm: "በሳምንት እስከ +4,375 ብር ትርፍ 📈",
    actionHintOr: "Torbanitti hanga +4,375 Qarshii argadhaa 📈",
    preferredPlacement: "top",
  },
  {
    targetSelector: "#tut-nav-leaderboard",
    title: "Top 689 Earners Leaderboard",
    titleAm: "የ 689 ተጠቃሚዎች ደረጃ ሰንጠረዥ",
    titleOr: "Sadarkaa Miseensota 689",
    description: "Tap the Trophy tab to view all 689 members competing for top ranks, key badges, and network referral commissions.",
    descriptionAm: "የ 689 ተጠቃሚዎችን የገቢ ደረጃዎች እና የቀጥታ ውድድር ለማየት የዋንጫውን አዝራር ይጫኑ።",
    descriptionOr: "Sadarkaa miseensota 689 ilaaluuf mallattoo waancaa tuqaa.",
    targetBadge: "Step 5 of 5",
    targetBadgeAm: "ደረጃ 5 ከ 5",
    targetBadgeOr: "Sadarkaa 5/5",
    actionHint: "You're all set to start earning today! 🌟",
    actionHintAm: "አሁን ገቢ ማግኘት ለመጀመር ዝግጁ ነዎት! 🌟",
    actionHintOr: "Amma eegaluuf qophiidha! 🌟",
    preferredPlacement: "top",
  },
];

const TUTORIAL_STORAGE_KEY = "birrstream_tutorial_v2_completed";

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
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null);

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

  // Handle step change & scrolling
  useEffect(() => {
    if (!isOpen) return;

    const step = TUTORIAL_STEPS[currentStep];
    if (!step) return;

    // If on another route, navigate back to dashboard first
    if (location !== "/dashboard") {
      setLocation("/dashboard");
    }

    const timer = setTimeout(() => {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(updateTargetBox, 350);
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

  // First-time auto trigger
  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Event listener to re-trigger
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
      }, 550);
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
      }, 550);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
  };

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  // Compute speech bubble layout placement relative to target element
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const isTargetInBottomHalf = targetBox ? targetBox.centerY > viewportHeight / 2 : false;
  const isNavTarget = step.targetSelector.includes("nav");

  // Determine card placement
  const showBubbleAtTop = isNavTarget || isTargetInBottomHalf;

  // Calculate pointer line coordinates
  const bubbleAnchorX = typeof window !== "undefined" ? Math.min(window.innerWidth / 2, 220) : 200;
  const bubbleAnchorY = showBubbleAtTop ? 280 : viewportHeight - 280;

  const targetAnchorX = targetBox ? targetBox.centerX : bubbleAnchorX;
  const targetAnchorY = targetBox
    ? showBubbleAtTop
      ? targetBox.y - 10
      : targetBox.y + targetBox.height + 10
    : bubbleAnchorY;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto select-none">
      {/* ── DARK BACKDROP WITH SPOTLIGHT MASK ── */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] transition-opacity duration-500 pointer-events-auto" />

      {/* ── TARGET COMPONENT SPOTLIGHT & BEACON ── */}
      {targetBox && (
        <div
          className="absolute z-10 pointer-events-none transition-all duration-500 ease-out"
          style={{
            left: targetBox.x - 6,
            top: targetBox.y - 6,
            width: targetBox.width + 12,
            height: targetBox.height + 12,
          }}
        >
          {/* Glowing Target Border */}
          <div className="w-full h-full rounded-2xl border-2 border-amber-400 shadow-[0_0_24px_rgba(245,230,163,0.85)] animate-pulse bg-white/5" />

          {/* Pulsing Target Radar Beacon Point */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
            style={{
              top: showBubbleAtTop ? -16 : "auto",
              bottom: showBubbleAtTop ? "auto" : -16,
            }}
          >
            <span className="relative flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-6 w-6 bg-amber-500 border-2 border-white shadow-lg items-center justify-center text-[10px] font-black text-black">
                ●
              </span>
            </span>
          </div>
        </div>
      )}

      {/* ── ANIMATED CONNECTING POINTER LINE (Connecting Chat Bubble & Target Element) ── */}
      {targetBox && (
        <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="pointerLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E6A3" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.95" />
            </linearGradient>
            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Animated Connecting Line Path */}
          <path
            d={`M ${targetAnchorX} ${targetAnchorY} Q ${(targetAnchorX + bubbleAnchorX) / 2} ${(targetAnchorY + bubbleAnchorY) / 2} ${bubbleAnchorX} ${bubbleAnchorY}`}
            fill="none"
            stroke="url(#pointerLineGrad)"
            strokeWidth="3.5"
            strokeDasharray="6,4"
            className="animate-[dash_1s_linear_infinite]"
            filter="url(#lineGlow)"
          />

          {/* Anchor Dot on Target */}
          <circle cx={targetAnchorX} cy={targetAnchorY} r="5" fill="#F5E6A3" stroke="#ffffff" strokeWidth="2" />
        </svg>
      )}

      {/* ── FLOATING TUTORIAL CARD & ANIMATED AVATAR ── */}
      <div
        className={`absolute left-0 right-0 px-4 z-30 flex flex-col items-center transition-all duration-500 ease-out max-w-md mx-auto ${
          showBubbleAtTop ? "top-6 sm:top-10" : "bottom-6 sm:bottom-10"
        }`}
      >
        {/* Animated Avatar: Walking during transition, Protesting when speech bubble is open */}
        <div
          className={`relative z-40 transition-all duration-500 ease-out flex flex-col items-center ${
            showBubbleAtTop ? "order-2 -mt-4" : "order-1 -mb-4"
          }`}
        >
          {isTransitioning ? (
            // Walking Avatar with moving displacement animation
            <div className="w-24 h-24 sm:w-28 sm:h-28 transition-transform duration-500 animate-bounce drop-shadow-2xl">
              <img
                src={walkingAvatar}
                alt="Walking Guide"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              />
            </div>
          ) : (
            // Protesting / Explaining Avatar pointing at the specific component
            <div className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-2xl animate-in zoom-in-90 duration-300">
              <img
                src={protestAvatar}
                alt="Pointing Guide"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform"
              />
            </div>
          )}
        </div>

        {/* ── SPEECH BUBBLE CHAT CARD ── */}
        <div
          ref={bubbleRef}
          className={`w-full bg-card/95 backdrop-blur-md border-2 border-primary/50 rounded-[28px] p-5 shadow-2xl relative z-30 overflow-hidden ${
            showBubbleAtTop ? "order-1" : "order-2"
          }`}
        >
          {/* Gradient accent top line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-primary" />

          {/* Card Header */}
          <div className="flex items-center justify-between mb-2.5 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-wider">
                {isAmharic ? step.targetBadgeAm : isOromo ? step.targetBadgeOr : step.targetBadge}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Interactive Point</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleComplete}
              className="w-7 h-7 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              title="Close Tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title */}
          <h3 className="font-black text-base text-foreground mb-1.5 leading-tight" style={displayFont}>
            {isAmharic ? step.titleAm : isOromo ? step.titleOr : step.title}
          </h3>

          {/* Description */}
          <p
            className="text-xs text-muted-foreground leading-relaxed mb-3.5"
            style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
          >
            {isAmharic ? step.descriptionAm : isOromo ? step.descriptionOr : step.description}
          </p>

          {/* Action Hint */}
          {step.actionHint && (
            <div className="bg-primary/10 border border-primary/25 rounded-2xl px-3 py-2 mb-3.5 flex items-center gap-2 text-[11px] font-bold text-primary">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{isAmharic ? step.actionHintAm : isOromo ? step.actionHintOr : step.actionHint}</span>
            </div>
          )}

          {/* Footer Controls & Step Navigation */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {TUTORIAL_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? "w-6 bg-primary"
                      : idx < currentStep
                      ? "w-2 bg-primary/40"
                      : "w-1.5 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isTransitioning}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground bg-muted/70 hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
                  style={displayFont}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isAmharic ? "ወደ ኋላ" : isOromo ? "Duuba" : "Back"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isTransitioning}
                className="px-4 py-2 rounded-full text-xs font-black bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
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
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
