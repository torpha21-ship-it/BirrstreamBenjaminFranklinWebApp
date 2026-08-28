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

export function WalletCard({
  summary,
  isLoading,
  user,
  pendingWithdrawalTotal,
  displayFont,
}: WalletCardProps) {
  const { t, isAmharic, isOromo, currency } = useLanguage();
  const [showBalance, setShowBalance] = useState(true);
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
      <div className="relative w-full pt-4 pb-2">
        {/* Pointing hand floating above wallet and cards on top-right */}
        <img
          src={pointingHand}
          alt=""
          aria-hidden="true"
          className="absolute -right-5 -top-3 h-[95px] w-auto object-contain pointer-events-none select-none opacity-95 z-[60] drop-shadow-lg"
        />

        {/* 1. Wallet Back Liner — dark leather backing behind all cards */}
        <div
          className="absolute left-2.5 right-2.5 top-2 bottom-2 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, #132413 0%, #0d180d 100%)",
            borderRadius: "20px 20px 42px 42px",
            boxShadow: "inset 0 16px 28px rgba(0, 0, 0, 0.8), inset 0 2px 6px rgba(0,0,0,0.5)",
            border: "1px solid rgba(61, 86, 53, 0.35)",
          }}
        />

        {/* 2. Three Emerging Payment Cards (Click-activated only) */}
        <div className="relative mx-5 h-16">
          {/* Card 1: Stripe (Purple) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveCard(prev => prev === "stripe" ? null : "stripe");
            }}
            className={`bs-wallet-card absolute inset-x-2 h-32 top-0 bg-gradient-to-br from-[#6a62ff] to-[#4e44e6] text-white rounded-2xl p-3.5 shadow-xl flex flex-col justify-between cursor-pointer border border-white/25 active:scale-[0.98] ${
              activeCard === "stripe" ? "z-50 shadow-2xl ring-2 ring-indigo-300/40" : "z-10"
            }`}
            style={{
              transform:
                activeCard === "stripe"
                  ? "translateY(-40px) rotate(-2deg) scale(1.03)"
                  : "translateY(0px) rotate(-1.5deg)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs tracking-widest uppercase">Stripe</span>
              <div className="w-6 h-4 bg-white/25 rounded border border-white/20" />
            </div>
            <div className="flex justify-center">
              <span className="px-2 py-0.5 rounded-full bg-black/40 text-[9px] font-bold tracking-wider text-white/90 border border-white/10 shadow-sm">
                {comingSoonText}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div className="truncate max-w-[150px]">
                <span className="block text-[8px] uppercase tracking-wider text-white/70">
                  {isAmharic ? "ባለቤት" : isOromo ? "Abbaa" : "Holder"}
                </span>
                <span className="text-[11px] font-bold truncate block">{holderName}</span>
              </div>
              <span className="text-[11px] font-mono tracking-widest text-white/90">•••• 4242</span>
            </div>
          </div>

          {/* Card 2: Wise (Lime Green) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveCard(prev => prev === "wise" ? null : "wise");
            }}
            className={`bs-wallet-card absolute inset-x-3 h-32 top-2 bg-gradient-to-br from-[#a6e673] to-[#8ac957] text-[#163316] rounded-2xl p-3.5 shadow-xl flex flex-col justify-between cursor-pointer border border-white/35 active:scale-[0.98] ${
              activeCard === "wise" ? "z-50 shadow-2xl ring-2 ring-lime-300/40" : "z-20"
            }`}
            style={{
              transform:
                activeCard === "wise"
                  ? "translateY(-40px) rotate(1.5deg) scale(1.03)"
                  : "translateY(0px) rotate(1deg)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs tracking-widest uppercase text-[#163316]">Wise</span>
              <div className="w-6 h-4 bg-black/15 rounded border border-black/10" />
            </div>
            <div className="flex justify-center">
              <span className="px-2 py-0.5 rounded-full bg-black/60 text-[9px] font-bold tracking-wider text-white border border-white/20 shadow-sm">
                {comingSoonText}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div className="truncate max-w-[150px]">
                <span className="block text-[8px] uppercase tracking-wider text-[#163316]/75">
                  {isAmharic ? "ንግድ" : isOromo ? "Daldala" : "Business"}
                </span>
                <span className="text-[11px] font-bold truncate block text-[#163316]">{businessName}</span>
              </div>
              <span className="text-[11px] font-mono tracking-widest font-bold text-[#163316]/90">•••• 8810</span>
            </div>
          </div>

          {/* Card 3: PayPal (Clean White) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveCard(prev => prev === "paypal" ? null : "paypal");
            }}
            className={`bs-wallet-card absolute inset-x-4 h-32 top-4 bg-white text-[#003087] rounded-2xl p-3.5 shadow-2xl flex flex-col justify-between cursor-pointer border border-gray-200 active:scale-[0.98] ${
              activeCard === "paypal" ? "z-50 shadow-2xl ring-2 ring-blue-300/40" : "z-30"
            }`}
            style={{
              transform:
                activeCard === "paypal"
                  ? "translateY(-40px) rotate(0deg) scale(1.03)"
                  : "translateY(0px) rotate(0deg)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-sm tracking-wide">
                Pay<span className="text-[#0079C1]">Pal</span>
              </span>
              <div className="w-6 h-4 bg-black/10 rounded border border-black/10" />
            </div>
            <div className="flex justify-center">
              <span className="px-2 py-0.5 rounded-full bg-[#003087] text-[9px] font-bold tracking-wider text-white shadow-sm">
                {comingSoonText}
              </span>
            </div>
            <div className="flex items-end justify-between">
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

        {/* 3. Realistic Front Leather Pocket — Normal flow wrapper with dynamic background SVG and inset stitching */}
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

            {/* Balance Amount */}
            {isLoading ? (
              <div className="h-10 bg-white/10 rounded-xl animate-pulse w-44" />
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {showBalance ? fmt(summary?.mainBalance ?? 0) : "••••••••"}
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

            {/* Progress bar to next VIP tier */}
            {summary?.nextTierName && (
              <div className="pt-1">
                <div
                  className="flex justify-between text-xs text-[#95c088] mb-1.5 font-medium"
                  style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                >
                  <span>
                    {t("dash.progress_to_vip")} {summary.nextTierName}
                  </span>
                  <span className="font-bold">{Math.round(summary.progressToNextTier)}%</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all duration-700"
                    style={{ width: `${summary.progressToNextTier}%` }}
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
