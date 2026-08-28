import { useState } from "react";
import { Link } from "wouter";
import { TrendingUp, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import mainBalanceDarkThemeIcon from "@/assets/dashboard-icons/dark-theme/Main Balance.png";
import pointingHand from "@/assets/decor/pointing-hand.webp";
import lockDollarIcon from "@/assets/decor/wired-outline-946-lock-dollar-in-reveal.webp";

import batteryEmpty from "@/assets/decor/wired-outline-2765-battery-vertical-level-4-morph-empty.webp";
import batteryLevel1 from "@/assets/decor/wired-outline-2765-battery-vertical-level-4-morph-level-1.webp";
import batteryLevel2 from "@/assets/decor/wired-outline-2765-battery-vertical-level-4-morph-level-2.webp";
import batteryLevel3 from "@/assets/decor/wired-outline-2765-battery-vertical-level-4-morph-level-3.webp";
import batteryLevel4 from "@/assets/decor/wired-outline-2765-battery-vertical-level-4-hover-pinch.webp";

function getBatteryIcon(daysLeft: number) {
  if (daysLeft <= 0) return batteryEmpty;
  if (daysLeft <= 2) return batteryLevel1;
  if (daysLeft <= 4) return batteryLevel2;
  if (daysLeft <= 6) return batteryLevel3;
  return batteryLevel4;
}

interface WalletCardProps {
  summary: any;
  isLoading: boolean;
  user: any;
  pendingWithdrawalTotal: number;
  displayFont: React.CSSProperties;
}

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Gold EMV Smart Chip component with realistic contact grid */
function GoldChip() {
  return (
    <div
      className="relative w-6 h-4.5 rounded-[3px] overflow-hidden border border-[#9a781b]/60 flex-shrink-0 shadow-sm"
      style={{
        background: "linear-gradient(135deg, #ffe082 0%, #d4af37 40%, #aa8012 80%, #ffd54f 100%)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.7), 0 1px 2px rgba(0,0,0,0.3)",
      }}
    >
      <svg className="w-full h-full opacity-60" viewBox="0 0 24 18" fill="none">
        <rect x="0.5" y="0.5" width="23" height="17" rx="1.5" stroke="#5a3d00" strokeWidth="0.75" />
        <path d="M0 6 H9 V12 H0" stroke="#5a3d00" strokeWidth="0.6" />
        <path d="M24 6 H15 V12 H24" stroke="#5a3d00" strokeWidth="0.6" />
        <path d="M8 0 V18" stroke="#5a3d00" strokeWidth="0.6" />
        <path d="M16 0 V18" stroke="#5a3d00" strokeWidth="0.6" />
        <rect x="9" y="6" width="6" height="6" rx="1" stroke="#5a3d00" strokeWidth="0.6" fill="rgba(255,255,255,0.2)" />
      </svg>
    </div>
  );
}

/** Official Stripe Logo — Clean, crisp, and properly ordered LTR */
function StripeLogo({ className = "h-4 w-auto text-white" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 76 34" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* s */}
      <path d="M11.8 8.1c-1.2-.5-2.6-.8-4.3-.8-3.9 0-6.2 2-6.2 5.3 0 4.8 6.7 4 6.7 6 0 .7-.6 1.1-1.7 1.1-1.6 0-3.6-.6-5.1-1.5l-.3 4.4c1.7.7 3.6 1 5.5 1 4.1 0 6.6-2 6.6-5.6 0-5.1-6.6-4.3-6.6-6.1 0-.6.5-1 1.5-1 1.3 0 3 .5 4.2 1.2l.3-4.3z" />
      {/* t */}
      <path d="M20 4.5v3.8h-3.4v4.5H20v9.6c0 3.7 2.5 5.8 6.1 5.8 1.4 0 2.6-.3 3.3-.6v-4.4c-.6.2-1.3.3-2.1.3-1.4 0-1.9-.7-1.9-2.2v-8.5h4V8.3h-4V4.5L20 4.5z" />
      {/* r */}
      <path d="M37.5 8.3c-1.2 0-2.1.5-2.6 1.2V8.3h-5.5v19.6h5.5v-11.4c0-2.6 2-3.2 2.6-3.2.5 0 .9.1 1.2.2V8.3c-.4-.1-.8-.1-1.2-.1z" />
      {/* i */}
      <path d="M44.5 0h-5.5v5.1h5.5V0zm0 8.3h-5.5v19.6h5.5V8.3z" />
      {/* p */}
      <path d="M55.5 8.3c-1.4 0-2.3.6-2.9 1.4V8.3h-5.5V34h5.5v-7.2c.6.7 1.6 1.2 2.9 1.2 3.9 0 6.8-3.2 6.8-8.9 0-5.9-2.9-8.8-6.8-8.8zm-1 13.7c-1.4 0-2.4-1.1-2.4-3.9 0-2.7.9-3.8 2.4-3.8 1.5 0 2.4 1.1 2.4 3.8 0 2.8-.9 3.9-2.4 3.9z" />
      {/* e */}
      <path d="M73.5 18.2c0-4.1-2-7.2-6-7.2-4.1 0-6.6 3.2-6.6 7.2 0 4.9 2.9 7.2 7.2 7.2 2.1 0 3.6-.5 4.8-1.1V21c-.9.5-2.5.9-4 .9-1.7 0-3.1-.6-3.3-2.6h7.8c.1-.4.1-.8.1-1.1zm-6-1.5c0-1.8.8-2.6 1.7-2.6.8 0 1.6.8 1.6 2.6h-3.3z" />
    </svg>
  );
}

/** Official Wise Logo with fast-forward arrow */
function WiseLogo({ color = "#142e00" }: { color?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill={color}>
        <path d="M12.5 3L6 14.5H12L9.5 21L19 9.5H13L15.5 3H12.5Z" />
      </svg>
      <span className="font-extrabold text-xs tracking-tight uppercase" style={{ color, letterSpacing: "0.08em" }}>
        WISE
      </span>
    </div>
  );
}

/** Official PayPal Logo */
function PayPalLogo() {
  return (
    <div className="flex items-center gap-1">
      <svg className="w-3.5 h-4 flex-shrink-0" viewBox="0 0 32 38" fill="none">
        <path
          d="M26.4 7.6C25.7 3.3 22.3 0 16.7 0H4.9C3.9 0 3 0.8 2.8 1.8L0 20.3C-0.1 20.9 0.4 21.5 1 21.5H7.7L9.6 9.4C9.8 8.4 10.7 7.6 11.7 7.6H20.1C24.1 7.6 26.8 9.5 26.4 13.9C26.1 17.5 23.8 20.4 19.3 20.4H14.8C14.1 20.4 13.5 20.9 13.4 21.6L11.5 33.7C11.4 34.3 11.9 34.9 12.5 34.9H18.7C19.5 34.9 20.3 34.3 20.4 33.5L20.5 33.1L21.6 26.2L21.7 25.6C21.8 24.8 22.6 24.2 23.4 24.2H24.3C29.6 24.2 33.7 20.6 34.7 14.3C35.2 11.3 34.6 8.8 33 7C31.5 5.2 29.2 4.4 26.4 7.6Z"
          fill="#003087"
        />
        <path
          d="M11.7 7.6C10.7 7.6 9.8 8.4 9.6 9.4L7.7 21.5H1H2.8L4.9 7.6C5.1 6.6 6 5.8 7 5.8H18.8C24.4 5.8 27.8 9.1 28.5 13.4C29.2 18.9 25.9 23.4 20.6 23.4H16.1C15.4 23.4 14.8 23.9 14.7 24.6L12.8 36.7C12.7 37.3 13.2 37.9 13.8 37.9H20C20.8 37.9 21.6 37.3 21.7 36.5L21.8 36.1L22.9 29.2L23 28.6C23.1 27.8 23.9 27.2 24.7 27.2H25.6C30.9 27.2 35 23.6 36 17.3C36.6 13.6 35.8 10.6 33.8 8.6C31.9 6.6 29 5.8 25.2 5.8H11.7Z"
          fill="#0079C1"
          fillOpacity="0.85"
        />
      </svg>
      <span className="font-black text-xs tracking-tight text-[#003087]">
        Pay<span className="text-[#0079C1]">Pal</span>
      </span>
    </div>
  );
}

export function WalletCard({
  summary,
  isLoading,
  user,
  pendingWithdrawalTotal,
  displayFont,
}: WalletCardProps) {
  const { t, isAmharic, isOromo, currency } = useLanguage();
  // 1. Amount hidden by default with asterisks unless eye clicked
  const [showBalance, setShowBalance] = useState(false);
  const [activeCard, setActiveCard] = useState<"stripe" | "wise" | "paypal" | null>(null);

  const holderName = (user?.fullName || "Valued Member").toUpperCase();
  const businessName = (user?.fullName || user?.username || "BirrStream Business").toUpperCase();
  const userEmail = user?.email || "user@birrstream.com";

  const comingSoonText = isAmharic ? "በቅርቡ" : isOromo ? "DHIYOOTTI" : "COMING SOON";
  const comingSoonFont = isAmharic ? { fontFamily: "'LogaComic', sans-serif" } : { fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" };

  return (
    <div className="relative z-10 -mx-4 select-none">
      <style>{`
        .bs-wallet-card {
          transition: transform 0.4s cubic-bezier(0.34, 1.3, 0.64, 1), box-shadow 0.3s ease, z-index 0.1s ease;
          transform-origin: bottom center;
        }
      `}</style>

      {/* Outer Wallet Wrapper */}
      <div className="relative w-full pt-3 pb-2">
        {/* Pointing hand floating above wallet and cards on top-right (lowered slightly, clipped to card edge) */}
        <div className="absolute right-0 top-1 w-36 h-20 overflow-hidden pointer-events-none z-[60]">
          <img
            src={pointingHand}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-contain object-right-top select-none opacity-95 drop-shadow-md"
          />
        </div>

        {/* 2. Wallet Back Liner — cut down so top of cards visibly stick out into the open */}
        <div
          className="absolute left-2.5 right-2.5 top-9 bottom-2 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, #132413 0%, #0d180d 100%)",
            borderRadius: "18px 18px 42px 42px",
            boxShadow: "inset 0 16px 28px rgba(0, 0, 0, 0.8), inset 0 2px 6px rgba(0,0,0,0.5)",
            border: "1px solid rgba(61, 86, 53, 0.35)",
          }}
        />

        {/* 3. Three Emerging Payment Cards (Click-activated only, with authentic logos, animated lock, and gold EMV chips) */}
        <div className="relative mx-5 h-16">
          {/* Card 1: Stripe (Official Blurple Gradient) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveCard(prev => prev === "stripe" ? null : "stripe");
            }}
            className={`bs-wallet-card absolute inset-x-2 h-32 top-0 text-white rounded-2xl p-3 shadow-xl flex flex-col justify-between cursor-pointer border border-white/25 active:scale-[0.98] overflow-hidden ${
              activeCard === "stripe" ? "z-50 shadow-2xl ring-2 ring-indigo-300/50" : "z-10"
            }`}
            style={{
              background: "linear-gradient(135deg, #635bff 0%, #4338ca 60%, #312e81 100%)",
              transform:
                activeCard === "stripe"
                  ? "translateY(-40px) rotate(-2deg) scale(1.03)"
                  : "translateY(0px) rotate(-1.5deg)",
            }}
          >
            {/* Gloss light reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.12] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <StripeLogo className="h-4 w-auto text-white" />
              <GoldChip />
            </div>
            <div className="flex justify-center relative z-10">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/45 text-[11px] font-bold tracking-wider text-white border border-white/15 shadow-sm"
                style={comingSoonFont}
              >
                <img src={lockDollarIcon} alt="" className="w-3.5 h-3.5 object-contain flex-shrink-0" />
                <span>{comingSoonText}</span>
              </span>
            </div>
            <div className="flex items-end justify-between relative z-10">
              <div className="truncate max-w-[150px]">
                <span className="block text-[8px] uppercase tracking-wider text-white/70">
                  {isAmharic ? "ባለቤት" : isOromo ? "Abbaa" : "Holder"}
                </span>
                <span className="text-[11px] font-bold truncate block">{holderName}</span>
              </div>
              <span className="text-[11px] font-mono tracking-widest text-white/90">•••• 4242</span>
            </div>
          </div>

          {/* Card 2: Wise (Official Bright Lime Green) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveCard(prev => prev === "wise" ? null : "wise");
            }}
            className={`bs-wallet-card absolute inset-x-3 h-32 top-2 text-[#142e00] rounded-2xl p-3 shadow-xl flex flex-col justify-between cursor-pointer border border-white/40 active:scale-[0.98] overflow-hidden ${
              activeCard === "wise" ? "z-50 shadow-2xl ring-2 ring-lime-300/60" : "z-20"
            }`}
            style={{
              background: "linear-gradient(135deg, #9fe870 0%, #82d64e 60%, #68bf33 100%)",
              transform:
                activeCard === "wise"
                  ? "translateY(-40px) rotate(1.5deg) scale(1.03)"
                  : "translateY(0px) rotate(1deg)",
            }}
          >
            {/* Gloss light reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.18] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <WiseLogo color="#142e00" />
              <GoldChip />
            </div>
            <div className="flex justify-center relative z-10">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 text-[11px] font-bold tracking-wider text-white border border-white/20 shadow-sm"
                style={comingSoonFont}
              >
                <img src={lockDollarIcon} alt="" className="w-3.5 h-3.5 object-contain flex-shrink-0" />
                <span>{comingSoonText}</span>
              </span>
            </div>
            <div className="flex items-end justify-between relative z-10">
              <div className="truncate max-w-[150px]">
                <span className="block text-[8px] uppercase tracking-wider text-[#142e00]/75">
                  {isAmharic ? "ንግድ" : isOromo ? "Daldala" : "Business"}
                </span>
                <span className="text-[11px] font-bold truncate block text-[#142e00]">{businessName}</span>
              </div>
              <span className="text-[11px] font-mono tracking-widest font-bold text-[#142e00]/90">•••• 8810</span>
            </div>
          </div>

          {/* Card 3: PayPal (Clean White with Double-P Monogram) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveCard(prev => prev === "paypal" ? null : "paypal");
            }}
            className={`bs-wallet-card absolute inset-x-4 h-32 top-4 bg-white text-[#003087] rounded-2xl p-3 shadow-2xl flex flex-col justify-between cursor-pointer border border-gray-200 active:scale-[0.98] overflow-hidden ${
              activeCard === "paypal" ? "z-50 shadow-2xl ring-2 ring-blue-300/50" : "z-30"
            }`}
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f4f6f9 50%, #e9edf4 100%)",
              transform:
                activeCard === "paypal"
                  ? "translateY(-40px) rotate(0deg) scale(1.03)"
                  : "translateY(0px) rotate(0deg)",
            }}
          >
            {/* Subtle card sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/[0.04] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <PayPalLogo />
              <GoldChip />
            </div>
            <div className="flex justify-center relative z-10">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#003087] text-[11px] font-bold tracking-wider text-white shadow-sm"
                style={comingSoonFont}
              >
                <img src={lockDollarIcon} alt="" className="w-3.5 h-3.5 object-contain flex-shrink-0" />
                <span>{comingSoonText}</span>
              </span>
            </div>
            <div className="flex items-end justify-between relative z-10">
              <div className="truncate max-w-[150px]">
                <span className="block text-[8px] uppercase tracking-wider text-gray-500">
                  {isAmharic ? "ኢሜይል" : isOromo ? "Imeelii" : "Email"}
                </span>
                <span className="text-[11px] font-bold truncate block text-[#003087]">{userEmail}</span>
              </div>
              <span className="text-[11px] font-mono tracking-widest text-[#003087]/80">•••• 0094</span>
            </div>
          </div>
        </div>

        {/* 4. Realistic Front Leather Pocket (Clean with no outer shadow) */}
        <div
          className="relative z-40 mx-2 -mt-2 rounded-b-[40px] overflow-hidden"
          onClick={() => setActiveCard(null)}
        >
          {/* Background SVG that dynamically stretches to 100% width and 100% height */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 340 240"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* Main leather pocket fill with curved top lip */}
            <path
              d="M 0 20 C 0 10, 8 10, 16 10 C 28 10, 36 24, 52 24 L 288 24 C 304 24, 312 10, 324 10 C 332 10, 340 10, 340 20 L 340 190 C 340 225, 315 240, 290 240 L 50 240 C 25 240, 0 225, 0 190 Z"
              fill="url(#bsPocketGrad)"
            />
            {/* Inset dashed stitching */}
            <path
              d="M 9 23 C 9 16, 14 15, 19 15 C 27 15, 33 28, 48 28 L 292 28 C 307 28, 313 15, 321 15 C 326 15, 331 16, 331 23 L 331 188 C 331 218, 310 231, 288 231 L 52 231 C 30 231, 9 218, 9 188 Z"
              stroke="#3e5e36"
              strokeWidth="1.8"
              strokeDasharray="6 4"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <defs>
              <linearGradient id="bsPocketGrad" x1="170" y1="0" x2="170" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1f361f" />
                <stop offset="100%" stopColor="#122012" />
              </linearGradient>
            </defs>
          </svg>

          {/* Pocket Content (In normal flow — expands pocket naturally so nothing overflows) */}
          <div className="relative z-10 px-5 pt-8 pb-5 text-white flex flex-col space-y-2.5">
            {/* Top header row with Main Balance & Eye Reveal Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={mainBalanceDarkThemeIcon} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                <p className="text-xl sm:text-2xl font-bold text-[#b4d8a8]" style={displayFont}>
                  {t("dash.main_balance")}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBalance(prev => !prev);
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[#a2cb95] transition-all flex items-center justify-center cursor-pointer"
                title={showBalance ? "Hide Balance" : "Reveal Balance"}
              >
                {showBalance ? (
                  <Eye className="w-4 h-4 text-emerald-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-[#a2cb95]" />
                )}
              </button>
            </div>

            {/* Balance Amount — Uses asterisks '********' when hidden */}
            {isLoading ? (
              <div className="h-10 bg-white/10 rounded-xl animate-pulse w-44" />
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {showBalance ? fmt(summary?.mainBalance ?? 0) : "********"}
                  </span>
                  <span className="text-lg font-bold text-[#95c088]" style={displayFont}>
                    {currency}
                  </span>
                </div>

                {/* Pending Withdrawal Alert if present */}
                {pendingWithdrawalTotal > 0 && (
                  <div className="flex items-center justify-between bg-yellow-500/15 border border-yellow-500/30 rounded-xl px-3 py-2 mt-2">
                    <span
                      className="text-xs text-yellow-300 font-medium"
                      style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                    >
                      ⏳ {isAmharic ? "በመጠባበቅ ላይ ያለ ገንዘብ" : isOromo ? "Qarshii eeggamaa jiru" : "Pending Withdrawal"}
                    </span>
                    <span className="text-xs font-bold text-yellow-300">
                      -{fmt(pendingWithdrawalTotal)} {currency}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Active VIP Package status */}
            {summary?.activePackageName ? (
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <span
                  className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold"
                  style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                >
                  {summary.activePackageName}
                </span>
                <span
                  className="flex items-center gap-1 text-xs text-[#a2cb95]"
                  style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                >
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  +{fmt(summary.activePackageDailyReturn ?? 0)} {currency}/{isAmharic ? "ቀን" : isOromo ? "guyyaa" : "day"}
                </span>
                {summary.daysUntilExpiry !== null && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs text-[#7ea873]"
                    style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                  >
                    <img
                      src={getBatteryIcon(summary.daysUntilExpiry)}
                      alt=""
                      className="w-8 h-8 object-contain flex-shrink-0 [filter:invert(1)]"
                    />
                    {summary.daysUntilExpiry}{isAmharic ? " ቀናት ቀርተዋል" : isOromo ? " guyyoota hafan" : "d left"}
                  </span>
                )}
              </div>
            ) : (
              <div className="pt-0.5">
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold hover:bg-emerald-500/30 transition-all group"
                  style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                >
                  <img
                    src={batteryEmpty}
                    alt=""
                    className="w-8 h-8 object-contain flex-shrink-0 group-hover:scale-110 transition-transform [filter:invert(1)]"
                  />
                  <span>{isAmharic ? "የቪአይፒ ፓኬጅ ይውሰዱ" : isOromo ? "Paakeejii VIP Fudhadhaa" : "Get a VIP Package"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Progress bar to next VIP tier — Compacted inside pocket with #b4d8a8 matching Main Balance text */}
            {summary?.nextTierName && (
              <div className="pt-1 px-1">
                <div
                  className="flex justify-between text-xs text-[#95c088] mb-1.5 font-medium"
                  style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                >
                  <span>
                    {t("dash.progress_to_vip")} {summary.nextTierName}
                  </span>
                  <span className="font-bold">{Math.round(summary.progressToNextTier)}%</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/10 mx-1">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${summary.progressToNextTier}%`, backgroundColor: "#b4d8a8" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

