import { useState } from "react";
import { Link } from "wouter";
import { TrendingUp, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import mainBalanceDarkThemeIcon from "@/assets/dashboard-icons/dark-theme/Main Balance.png";
import pointingHand from "@/assets/decor/pointing-hand.webp";

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

/** Official Stripe Logo */
function StripeLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 25" fill="currentColor">
      <path d="M59.64 14.28c0-4.44-2.16-7.8-6.48-7.8-4.36 0-7 3.36-7 7.76 0 5.24 3.08 7.76 7.56 7.76 2.2 0 3.88-.48 5.12-1.2v-3.48c-1.24.68-2.68 1.08-4.44 1.08-1.76 0-3.32-.68-3.52-2.76h8.72c.04-.32.04-.84.04-1.36zm-8.8-1.52c0-1.92 1.16-2.72 2.32-2.72 1.12 0 2.24.8 2.24 2.72h-4.56zm-7.64-6.28h-4.44v15.28h4.44V6.48zm0-2.48h-4.44V0h4.44v4zm-7.88 5.36c-.88-.4-2.08-.68-3.44-.68-3.08 0-4.96 1.6-4.96 4.32 0 3.8 5.24 3.2 5.24 4.84 0 .6-.52.88-1.4.88-1.24 0-2.8-.52-4.04-1.2v3.76c1.4.6 2.88.84 4.28.84 3.28 0 5.24-1.6 5.24-4.44 0-4.12-5.28-3.4-5.28-4.92 0-.52.44-.8 1.28-.8 1.08 0 2.36.44 3.36.96l-.28-3.56zm-17.76.92v-3.8h-4.24v3.8h-2.4v3.6h2.4v7.76c0 2.92 1.96 4.64 4.88 4.64 1.16 0 2.08-.2 2.68-.48v-3.52c-.44.16-1 .28-1.6.28-1.12 0-1.56-.56-1.56-1.72v-6.96h3.16v-3.6h-3.32zm-10.28-.92c-.96 0-1.6.44-2.04.96V6.48H.8V21.76h4.44v-9.2c0-2.08 1.6-2.52 2.04-2.52.4 0 .76.08.96.16V6.2c-.32-.08-.64-.12-.96-.12z" />
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

  const comingSoonText = isAmharic ? "🔒 በቅርቡ" : isOromo ? "🔒 DHIYOOTTI" : "🔒 COMING SOON";

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

        {/* 3. Three Emerging Payment Cards (Click-activated only, with authentic logos and gold EMV chips) */}
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
              <StripeLogo className="h-3.5 w-auto text-white" />
              <GoldChip />
            </div>
            <div className="flex justify-center relative z-10">
              <span className="px-2 py-0.5 rounded-full bg-black/45 text-[9px] font-bold tracking-wider text-white/95 border border-white/15 shadow-sm">
                {comingSoonText}
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
              <span className="px-2 py-0.5 rounded-full bg-black/60 text-[9px] font-bold tracking-wider text-white border border-white/20 shadow-sm">
                {comingSoonText}
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
              <span className="px-2 py-0.5 rounded-full bg-[#003087] text-[9px] font-bold tracking-wider text-white shadow-sm">
                {comingSoonText}
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

        {/* 4. Realistic Front Leather Pocket */}
        <div
          className="relative z-40 mx-2 -mt-2 rounded-b-[40px] overflow-hidden"
          style={{ filter: "drop-shadow(0 14px 24px rgba(0, 0, 0, 0.6))" }}
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
                  <EyeOff className="w-4 h-4 text-[#a2cb95]" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-400" />
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
                    className="text-xs text-[#7ea873]"
                    style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                  >
                    {summary.daysUntilExpiry}{isAmharic ? " ቀናት ቀርተዋል" : isOromo ? " guyyoota hafan" : "d left"}
                  </span>
                )}
              </div>
            ) : (
              <div className="pt-0.5">
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold hover:bg-emerald-500/30 transition-all"
                  style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                >
                  {isAmharic ? "የቪአይፒ ፓኬጅ ይውሰዱ" : isOromo ? "Paakeejii VIP Fudhadhaa" : "Get a VIP Package"}{" "}
                  <ChevronRight className="w-3 h-3" />
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

