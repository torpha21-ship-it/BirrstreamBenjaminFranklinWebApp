import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/language-context";
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle2 } from "lucide-react";

import protestAvatar from "@/assets/avatar/wired-outline-656-person-protesting-hover-pinch.webp";
import walkingAvatar from "@/assets/avatar/wired-outline-646-person-walking-loop-cycle.webp";

interface TutorialStep {
  title: string;
  titleAm: string;
  titleOr: string;
  description: string;
  descriptionAm: string;
  descriptionOr: string;
  targetBadge?: string;
  targetBadgeAm?: string;
  targetBadgeOr?: string;
  actionHint?: string;
  actionHintAm?: string;
  actionHintOr?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to Naomi Labs & BirrStream!",
    titleAm: "እንኳን ወደ ናኦሚ ላብስ እና ብር-ስትሪም በደህና መጡ!",
    titleOr: "Baga gara Naomi Labs fi BirrStream dhuftan!",
    description: "Your official smart earning platform. Grow your ETB balance daily and withdraw directly to Telebirr and Commercial Bank of Ethiopia.",
    descriptionAm: "በኢትዮጵያ አስተማማኝ የዕለት ገቢ መድረክ። የብር ሂሳብዎን በየቀኑ ያሳድጉ እና በቀጥታ ወደ ቴሌብር እና ንግድ ባንክ ያውጡ።",
    descriptionOr: "Galiin guyyaa keessan herrega Telebirr fi Baankii Daldala Itoophiyaatti kallattiin kan galu.",
    targetBadge: "Step 1 of 5",
    targetBadgeAm: "ደረጃ 1 ከ 5",
    targetBadgeOr: "Sadarkaa 1/5",
    actionHint: "Let's explore your dashboard 🚀",
    actionHintAm: "የዳሽቦርድ ገጽዎን አብረን እንቃኝ 🚀",
    actionHintOr: "Fuula duraa haa daawwannu 🚀",
  },
  {
    title: "Main Balance & Instant Deposit",
    titleAm: "ዋና ቀሪ ሂሳብ እና ፈጣን ተቀማጭ",
    titleOr: "Haftee Qarshii fi Galcha Saffisaa",
    description: "Deposit ETB via Telebirr or CBE in seconds. Your funds are protected by the Reserve Floor and verified instantly.",
    descriptionAm: "በቴሌብር ወይም በኢትዮጵያ ንግድ ባንክ በሰከንዶች ውስጥ ገንዘብ ያስገቡ። የተቀማጭ ገንዘብዎ በሪዘርቭ ፍሎር ሙሉ በሙሉ የተጠበቀ ነው።",
    descriptionOr: "Telebirr fi CBE dhaan qarshii galchuun salphaadha. Hafteen keessan eegamaadha.",
    targetBadge: "Step 2 of 5",
    targetBadgeAm: "ደረጃ 2 ከ 5",
    targetBadgeOr: "Sadarkaa 2/5",
    actionHint: "Minimum deposit is only 500 ETB 💳",
    actionHintAm: "ዝቅተኛው ተቀማጭ 500 ብር ብቻ ነው 💳",
    actionHintOr: "Galchi xiqqaan 500 Qarshiidha 💳",
  },
  {
    title: "7-Day VIP Yield Packages",
    titleAm: "የ 7 ቀን ቪአይፒ ፓኬጆች",
    titleOr: "Paakeejota VIP Guyyoota 7",
    description: "Activate VIP1 to VIP5 packages to receive guaranteed daily yield payments credited to your account every 24 hours.",
    descriptionAm: "ከ ቪአይፒ 1 እስከ ቪአይፒ 5 ፓኬጆችን በማንቃት በየ 24 ሰዓቱ የተረጋገጠ የዕለት ትርፍ ክፍያዎችን ይቀበሉ።",
    descriptionOr: "Paakeejota VIP1 hanga VIP5 fayyadamuun bu'aa guyyaa guyyaan argadhaa.",
    targetBadge: "Step 3 of 5",
    targetBadgeAm: "ደረጃ 3 ከ 5",
    targetBadgeOr: "Sadarkaa 3/5",
    actionHint: "Earn up to +4,375 ETB weekly 📈",
    actionHintAm: "በሳምንት እስከ +4,375 ብር ያግኙ 📈",
    actionHintOr: "Torbanitti hanga +4,375 Qarshii argadhaa 📈",
  },
  {
    title: "Daily Check-In & Naomi Arcade",
    titleAm: "የዕለት ተሳትፎ እና ናኦሚ አርኬድ",
    titleOr: "Hirmaannaa Guyyaa fi Taphawwan",
    description: "Check in daily to build your login streak for cash bonuses (+5 ETB) and spin Minecraft mobs for instant jackpot rewards.",
    descriptionAm: "በየቀኑ በመግባት የጉርሻ ብር (+5 ብር) ያግኙ እንዲሁም በአርኬድ ጨዋታዎች ትላልቅ የብር ጃክፖቶችን ያሸንፉ።",
    descriptionOr: "Guyyaa hunda galmaa'uun badhaasa +5 Qarshii fi taphawwan irraa milkaa'aa.",
    targetBadge: "Step 4 of 5",
    targetBadgeAm: "ደረጃ 4 ከ 5",
    targetBadgeOr: "Sadarkaa 4/5",
    actionHint: "Free daily check-in rewards 🎁",
    actionHintAm: "ነፃ የዕለት ተሳትፎ ሽልማቶች 🎁",
    actionHintOr: "Badhaasa galmee guyyaa bilisaa 🎁",
  },
  {
    title: "Top 689 Earners Leaderboard",
    titleAm: "የ 689 ተጠቃሚዎች ደረጃ ሰንጠረዥ",
    titleOr: "Sadarkaa Miseensota 689",
    description: "Compete on the live leaderboard with 689 members. Upgrade your VIP tier and grow your referral network to reach Rank #1!",
    descriptionAm: "ከ 689 አባላት ጋር በቀጥታ ይወዳደሩ። የቪአይፒ ደረጃዎን በማሳደግ እና ጓደኞችዎን በመጋበዝ የቁጥር #1 ደረጃ ባለቤት ይሁኑ!",
    descriptionOr: "Sadarkaa 689 keessatti dorgomaa. Afeerraadhaan sadarkaa 1ffaa qabadhaa!",
    targetBadge: "Step 5 of 5",
    targetBadgeAm: "ደረጃ 5 ከ 5",
    targetBadgeOr: "Sadarkaa 5/5",
    actionHint: "You're all set to earn today! 🌟",
    actionHintAm: "አሁን ገቢ ማግኘት ለመጀመር ዝግጁ ነዎት! 🌟",
    actionHintOr: "Amma eegaluuf qophiidha! 🌟",
  },
];

const TUTORIAL_STORAGE_KEY = "birrstream_tutorial_v1_completed";

export function TutorialGuide() {
  const { isAmharic, isOromo } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0.045em" : "-0.01em",
  };

  useEffect(() => {
    // Check if user has already seen the tutorial
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listen for manual trigger
    const handleStartTutorial = () => {
      setCurrentStep(0);
      setIsTransitioning(false);
      setIsOpen(true);
    };
    window.addEventListener("birr:start-tutorial", handleStartTutorial);
    return () => window.removeEventListener("birr:start-tutorial", handleStartTutorial);
  }, []);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      // Switch to walking avatar during transition
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsTransitioning(false);
      }, 450);
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
      }, 450);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
  };

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md relative flex flex-col items-center">
        {/* ── ANIMATED AVATAR GUIDE (Protesting when explaining, Walking when transitioning) ── */}
        <div className="relative mb-[-14px] z-20 flex flex-col items-center">
          <div className="relative">
            {isTransitioning ? (
              // Walking Avatar during step transitions
              <div className="w-24 h-24 sm:w-28 sm:h-28 transition-transform duration-300 translate-x-2 drop-shadow-xl">
                <img
                  src={walkingAvatar}
                  alt="Walking Guide"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
            ) : (
              // Protesting / Explaining Avatar when speech bubble is open
              <div className="w-24 h-24 sm:w-28 sm:h-28 transition-transform duration-300 drop-shadow-xl animate-in zoom-in-90 duration-200">
                <img
                  src={protestAvatar}
                  alt="Explaining Guide"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── ANIMATED SPEECH BUBBLE CHAT CARD ── */}
        <div className="w-full bg-card border-2 border-primary/40 rounded-[28px] p-5 shadow-2xl relative z-10 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-wider">
                {isAmharic ? step.targetBadgeAm : isOromo ? step.targetBadgeOr : step.targetBadge}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Guide</span>
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
          <h3 className="font-extrabold text-base text-foreground mb-2 leading-tight" style={displayFont}>
            {isAmharic ? step.titleAm : isOromo ? step.titleOr : step.title}
          </h3>

          {/* Description */}
          <p
            className="text-xs text-muted-foreground leading-relaxed mb-4"
            style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
          >
            {isAmharic ? step.descriptionAm : isOromo ? step.descriptionOr : step.description}
          </p>

          {/* Action / Tip Hint Box */}
          {step.actionHint && (
            <div className="bg-primary/10 border border-primary/25 rounded-2xl px-3 py-2 mb-4 flex items-center gap-2 text-[11px] font-bold text-primary">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{isAmharic ? step.actionHintAm : isOromo ? step.actionHintOr : step.actionHint}</span>
            </div>
          )}

          {/* Step Progress Dots & Navigation Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            {/* Progress Dots */}
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

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isTransitioning}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
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
