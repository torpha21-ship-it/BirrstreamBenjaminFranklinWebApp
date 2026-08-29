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
    title: "Main Balance & Reserve Floor",
    titleAm: "ዋና ቀሪ ሂሳብ እና የሪዘርቭ ዋስትና",
    titleOr: "Haftee Qarshii fi Eegumsa Rizarvii",
    description: "Here is your live ETB balance. Your deposited funds are 100% protected and compound every 24 hours.",
    descriptionAm: "ዋና የብር ሂሳብዎ እዚህ ይገኛል። የተቀማጭ ገንዘብዎ በሪዘርቭ ፍሎር ሙሉ በሙሉ የተጠበቀ ነው።",
    descriptionOr: "Hafteen qarshii keessanii asitti mul'ata. Qarshiin keessan eegumsa guutuu qaba.",
    targetBadge: "1 of 9 • Dashboard",
    targetBadgeAm: "1 ከ 9 • ዳሽቦርድ",
    targetBadgeOr: "1/9 • Daashboordii",
    actionHint: "Live balance tracking & Reserve safety 🛡️",
    actionHintAm: "ቀጥታ የሂሳብ ቁጥጥር እና የሪዘርቭ ዋስትና 🛡️",
    actionHintOr: "Hordoffii haftee fi eegumsa rizarvii 🛡️",
  },
  {
    route: "/dashboard",
    targetSelector: "#tut-actions",
    title: "Quick Action Center",
    titleAm: "ፈጣን የአገልግሎት አዝራሮች",
    titleOr: "Wiirtuu Tajaajila Saffisaa",
    description: "Easily Deposit funds via Telebirr/CBE, request Withdrawals, view VIP Packages, and earn from Daily Tasks.",
    descriptionAm: "በቴሌብር ወይም ንግድ ባንክ ገንዘብ ያስገቡ፣ ያውጡ፣ ፓኬጆችን ይክፈቱ እና ከዕለት ተግባራት ተጨማሪ ብር ያግኙ።",
    descriptionOr: "Telebirr yookiin CBE dhaan qarshii galchaa, baasaa, hojiiwwan hojjedhaa.",
    targetBadge: "2 of 9 • Actions",
    targetBadgeAm: "2 ከ 9 • አገልግሎቶች",
    targetBadgeOr: "2/9 • Tajaajiloota",
    actionHint: "Min deposit is only 500 ETB 💳",
    actionHintAm: "ዝቅተኛው ተቀማጭ 500 ብር ብቻ ነው 💳",
    actionHintOr: "Galchi xiqqaan 500 Qarshiidha 💳",
  },
  {
    route: "/dashboard",
    targetSelector: "#tut-streak",
    title: "Daily Login Streak (+5 ETB)",
    titleAm: "የዕለት ተሳትፎ ጉርሻ (+5 ብር)",
    titleOr: "Hirmaannaa Guyyaa (+5 Qarshii)",
    description: "Tap the Check-In button once every 24 hours to earn free instant cash bonuses added to your balance.",
    descriptionAm: "በየቀኑ ይህንን አዝራር በመጫን የ 5 ብር የዕለት ጉርሻዎን በቀጥታ ወደ ዋና ሂሳብዎ ያስገቡ።",
    descriptionOr: "Guyyaa hunda galmaa'uun badhaasa qarshii 5 battalumatti fudhadhaa.",
    targetBadge: "3 of 9 • Login Streak",
    targetBadgeAm: "3 ከ 9 • የዕለት ጉርሻ",
    targetBadgeOr: "3/9 • Hirmaannaa Guyyaa",
    actionHint: "Daily check-in gives free cash rewards 🎁",
    actionHintAm: "ነፃ የዕለት ተሳትፎ ሽልማቶች 🎁",
    actionHintOr: "Badhaasa galmee guyyaa bilisaa 🎁",
  },
  {
    route: "/dashboard",
    targetSelector: "#tut-vipcards",
    title: "3D VIP Time Cards",
    titleAm: "የ 7 ቀን ቪአይፒ ካርዶች",
    titleOr: "Kaardota VIP 3D",
    description: "Explore interactive 3D time cards and preview your 7-day daily return potential with VIP multipliers.",
    descriptionAm: "የ 7 ተከታታይ ቀናት ከፍተኛ የዕለት ትርፍ የሚያስገኙ የቪአይፒ ካርዶችን እዚህ ይመልከቱ እና ያግብሩ።",
    descriptionOr: "Kaardota VIP 3D ilaaluun bu'aa olaanaa guyyoota 7f argadhaa.",
    targetBadge: "4 of 9 • VIP Time Cards",
    targetBadgeAm: "4 ከ 9 • ቪአይፒ ካርዶች",
    targetBadgeOr: "4/9 • Kaardota VIP",
    actionHint: "Up to +4,375 ETB weekly returns 📈",
    actionHintAm: "በሳምንት እስከ +4,375 ብር ትርፍ 📈",
    actionHintOr: "Torbanitti hanga +4,375 Qarshii 📈",
  },
  {
    route: "/packages",
    targetSelector: "#tut-packages-list",
    title: "VIP 1 - VIP 5 Yield Packages",
    titleAm: "የ 7 ቀን የቪአይፒ ፓኬጆች",
    titleOr: "Paakeejota VIP 1 - VIP 5",
    description: "Activate VIP packages with animated power icons for guaranteed daily profit streaming directly into your account.",
    descriptionAm: "በየቀኑ የተረጋገጠ ትርፍ የሚያስገኙ የቪአይፒ ፓኬጆችን እዚህ ይክፈቱ።",
    descriptionOr: "Paakeejota VIP banuudhaan bu'aa guyyaa mirkanaa'e argadhaa.",
    targetBadge: "5 of 9 • Packages Page",
    targetBadgeAm: "5 ከ 9 • ፓኬጆች",
    targetBadgeOr: "5/9 • Paakeejota",
    actionHint: "Daily returns credited every 24 hours ⚡",
    actionHintAm: "ትርፍ በየ 24 ሰዓቱ ወደ ሂሳብዎ ይገባል ⚡",
    actionHintOr: "Bu'aan sa'aatii 24 hundatti galama ⚡",
  },
  {
    route: "/games",
    targetSelector: "#tut-games-spinner",
    title: "Naomi Arcade & Mob Spinner",
    titleAm: "ናኦሚ አርኬድ እና የሞብ ስፒነር",
    titleOr: "Taphawwan Naomi fi Mob Spinner",
    description: "Spin the Minecraft Mob Picker to win Birr jackpots and rewards. VIP 4+ gets unlimited daily spins!",
    descriptionAm: "የማይንክራፍት ካራክተር መምረጫውን በማሽከርከር የገንዘብ ሽልማቶችን ያሸንፉ።",
    descriptionOr: "Taphawwan taphachuun badhaasa qarshii olaanaa argadhaa.",
    targetBadge: "6 of 9 • Naomi Arcade",
    targetBadgeAm: "6 ከ 9 • ናኦሚ አርኬድ",
    targetBadgeOr: "6/9 • Taphawwan",
    actionHint: "Win up to +215 ETB per lucky spin 🎮",
    actionHintAm: "በአንድ ማሽከርከር እስከ +215 ብር ያሸንፉ 🎮",
    actionHintOr: "Naannessuu tokkoon hanga 215 Qarshii 🎮",
  },
  {
    route: "/tasks",
    targetSelector: "#tut-tasks-list",
    title: "Daily Tasks & Video Rewards",
    titleAm: "የዕለት ተግባራት እና ቪዲዮዎች",
    titleOr: "Hojiiwwan Guyyaa fi Viidiyoowwan",
    description: "Complete quick video watches, Telegram channel joins, and referral activities to collect extra daily Birr.",
    descriptionAm: "ቪዲዮዎችን በመመልከት እና ቀላል ተግባራትን በማጠናቀቅ ተጨማሪ ብር ያግኙ።",
    descriptionOr: "Viidiyoo daawwachuun qarshii dabalataa guyyaa hunda sassaabbadhaa.",
    targetBadge: "7 of 9 • Daily Tasks",
    targetBadgeAm: "7 ከ 9 • ተግባራት",
    targetBadgeOr: "7/9 • Hojiiwwan",
    actionHint: "Daily habits that boost your earnings 💰",
    actionHintAm: "ገቢዎን የሚያሳድጉ የዕለት ተግባራት 💰",
    actionHintOr: "Galii keessan kan dabalan 💰",
  },
  {
    route: "/leaderboard",
    targetSelector: "#tut-leaderboard-top",
    title: "Top 689 Earners Live Board",
    titleAm: "የ 689 ተጠቃሚዎች ደረጃ ሰንጠረዥ",
    titleOr: "Sadarkaa Miseensota 689",
    description: "Check live ranking positions across all 689 members with animated key badges and active earnings competition.",
    descriptionAm: "የ 689 ተጠቃሚዎችን የቀጥታ የገቢ ደረጃዎች እና የዋንጫ አሸናፊዎችን እዚህ ይመልከቱ።",
    descriptionOr: "Sadarkaa miseensota 689 fi galii isaanii hordofaa.",
    targetBadge: "8 of 9 • Leaderboard",
    targetBadgeAm: "8 ከ 9 • የደረጃ ሰንጠረዥ",
    targetBadgeOr: "8/9 • Sadarkaa",
    actionHint: "Real-time active rankings competition 🏆",
    actionHintAm: "የቀጥታ ውድድር እና ደረጃዎች 🏆",
    actionHintOr: "Dorgommii sadarkaa yeroo qabatamaa 🏆",
  },
  {
    route: "/profile",
    targetSelector: "#tut-profile-kyc",
    title: "Profile & KYC Verification",
    titleAm: "መገለጫ እና የማንነት ማረጋገጫ (KYC)",
    titleOr: "Piroofaayilii fi Mirkaneessa KYC",
    description: "Upload your ID to verify your account, customize your profile picture up to 5MB, and manage your withdrawal settings.",
    descriptionAm: "መታወቂያዎን በማስገባት ሂሳብዎን ያረጋግጡ እና የገንዘብ ማውጫ ሂሳብዎን ያስተካክሉ።",
    descriptionOr: "Waraqaa eenyummaa galchuun herrega keessan mirkaneessaa.",
    targetBadge: "9 of 9 • Profile & KYC",
    targetBadgeAm: "9 ከ 9 • መገለጫ",
    targetBadgeOr: "9/9 • Piroofaayilii",
    actionHint: "You are all set to start earning! 🚀",
    actionHintAm: "አሁን ገቢ ማግኘት ለመጀመር ሙሉ በሙሉ ዝግጁ ነዎት! 🚀",
    actionHintOr: "Amma eegaluuf guutummaatti qophiidha! 🚀",
  },
];

const TUTORIAL_STORAGE_KEY = "birrstream_tutorial_v3_completed";

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

    // Navigate to step's route if not already there
    if (location !== step.route) {
      setLocation(step.route);
    }

    const timer = setTimeout(() => {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(updateTargetBox, 350);
      } else {
        updateTargetBox();
      }
    }, 200);

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
      }, 1400);
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

  // Placement calculation
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const isTargetInBottomHalf = targetBox ? targetBox.centerY > viewportHeight / 2 : false;
  const showBubbleAtTop = isTargetInBottomHalf;

  // Anchor points for animated pointer line
  const bubbleAnchorX = typeof window !== "undefined" ? Math.min(window.innerWidth / 2, 200) : 180;
  const bubbleAnchorY = showBubbleAtTop ? 220 : viewportHeight - 220;

  const targetAnchorX = targetBox ? targetBox.centerX : bubbleAnchorX;
  const targetAnchorY = targetBox
    ? showBubbleAtTop
      ? targetBox.y - 6
      : targetBox.y + targetBox.height + 6
    : bubbleAnchorY;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none select-none">
      {/* ── LIGHTWEIGHT NON-OBSCURING OVERLAY (NO HEAVY GLASS BLUR) ── */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none transition-opacity duration-300" />

      {/* ── TARGET COMPONENT SPOTLIGHT & RADAR BEACON ── */}
      {targetBox && (
        <div
          className="absolute z-10 pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: targetBox.x - 4,
            top: targetBox.y - 4,
            width: targetBox.width + 8,
            height: targetBox.height + 8,
          }}
        >
          {/* Crisp Glowing Golden Ring around the pointed component */}
          <div className="w-full h-full rounded-2xl border-2 border-amber-400 shadow-[0_0_20px_rgba(245,230,163,0.9)]" />

          {/* Pulsing Beacon Dot */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
            style={{
              top: showBubbleAtTop ? -12 : "auto",
              bottom: showBubbleAtTop ? "auto" : -12,
            }}
          >
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-85" />
              <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 border-2 border-white shadow-md items-center justify-center text-[9px] font-black text-black">
                ●
              </span>
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

          {/* Animated Connecting Line Path */}
          <path
            d={`M ${targetAnchorX} ${targetAnchorY} Q ${(targetAnchorX + bubbleAnchorX) / 2} ${(targetAnchorY + bubbleAnchorY) / 2} ${bubbleAnchorX} ${bubbleAnchorY}`}
            fill="none"
            stroke="url(#pointerLineGrad)"
            strokeWidth="3"
            strokeDasharray="5,4"
            className="animate-[dash_1s_linear_infinite]"
          />

          {/* Glowing Target Anchor Dot */}
          <circle cx={targetAnchorX} cy={targetAnchorY} r="4.5" fill="#F5E6A3" stroke="#121331" strokeWidth="1.5" />
        </svg>
      )}

      {/* ── NIMBLE COMPACT CHAT BUBBLE & MOVING AVATAR ── */}
      <div
        className={`absolute left-0 right-0 px-3 z-30 flex flex-col items-center pointer-events-auto transition-all duration-400 ease-out max-w-[330px] sm:max-w-[360px] mx-auto ${
          showBubbleAtTop ? "top-4 sm:top-6" : "bottom-4 sm:bottom-6"
        }`}
      >
        {/* Animated Avatar */}
        <div
          className={`relative z-40 transition-all duration-400 flex flex-col items-center ${
            showBubbleAtTop ? "order-2 -mt-3" : "order-1 -mb-3"
          }`}
        >
          {isTransitioning ? (
            <div className="w-16 h-16 sm:w-18 sm:h-18 animate-bounce drop-shadow-lg">
              <img
                src={walkingAvatar}
                alt="Walking Guide"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-18 sm:h-18 drop-shadow-lg animate-in zoom-in-90 duration-200">
              <img
                src={protestAvatar}
                alt="Pointing Guide"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              />
            </div>
          )}
        </div>

        {/* Compact Speech Bubble Card */}
        <div
          className={`w-full bg-card/95 border-2 border-primary/60 rounded-3xl p-3.5 sm:p-4 shadow-xl relative z-30 overflow-hidden ${
            showBubbleAtTop ? "order-1" : "order-2"
          }`}
        >
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-primary" />

          {/* Header */}
          <div className="flex items-center justify-between mb-1.5 pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[9.5px] font-black uppercase tracking-wider">
                {isAmharic ? step.targetBadgeAm : isOromo ? step.targetBadgeOr : step.targetBadge}
              </span>
              <span className="text-[9.5px] text-amber-500 font-bold flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Tour</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleComplete}
              className="w-6 h-6 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              title="Close Tutorial"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm text-foreground mb-1 leading-tight" style={displayFont}>
            {isAmharic ? step.titleAm : isOromo ? step.titleOr : step.title}
          </h3>

          {/* Description */}
          <p
            className="text-[11.5px] text-muted-foreground leading-relaxed mb-2.5"
            style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
          >
            {isAmharic ? step.descriptionAm : isOromo ? step.descriptionOr : step.description}
          </p>

          {/* Action Hint */}
          {step.actionHint && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-2.5 py-1.5 mb-2.5 flex items-center gap-1.5 text-[10.5px] font-bold text-primary">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{isAmharic ? step.actionHintAm : isOromo ? step.actionHintOr : step.actionHint}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            {/* Step Dots */}
            <div className="flex items-center gap-1">
              {TUTORIAL_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    idx === currentStep
                      ? "w-4 bg-primary"
                      : idx < currentStep
                      ? "w-1.5 bg-primary/40"
                      : "w-1 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            {/* Nav Buttons */}
            <div className="flex items-center gap-1.5">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isTransitioning}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
                  style={displayFont}
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>{isAmharic ? "ወደ ኋላ" : isOromo ? "Duuba" : "Back"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isTransitioning}
                className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
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
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
