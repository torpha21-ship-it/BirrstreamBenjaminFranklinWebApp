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
  const [isWalletHovered, setIsWalletHovered] = useState(false);

  const holderName = (user?.fullName || "Valued Member").toUpperCase();
  const businessName = (user?.fullName || user?.username || "BirrStream Business").toUpperCase();
  const userEmail = user?.email || "user@birrstream.com";

  const comingSoonText = isAmharic ? "🔒 በቅርቡ" : isOromo ? "🔒 DHIYOOTTI" : "🔒 COMING SOON";

  return (
    <div className="relative z-10 -mx-4 select-none">
      <style>{`
        .bs-wallet-container {
          perspective: 1000px;
        }
        .bs-wallet-card {
          transition: transform 0.5s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.3s ease;
          transform-origin: bottom center;
        }
        .bs-wallet-card:hover {
          z-index: 50 !important;
          transform: translateY(-38px) scale(1.03) !important;
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.6);
        }
        .bs-wallet-container:hover .bs-card-stripe {
          transform: translateY(-46px) rotate(-3deg);
        }
        .bs-wallet-container:hover .bs-card-wise {
          transform: translateY(-26px) rotate(2deg);
        }
        .bs-wallet-container:hover .bs-card-paypal {
          transform: translateY(-10px) rotate(0deg);
        }
      `}</style>

      {/* Outer Wallet Wrapper */}
      <div
        className="bs-wallet-container relative w-full pt-14 pb-2 transition-all duration-300"
        onMouseEnter={() => setIsWalletHovered(true)}
        onMouseLeave={() => setIsWalletHovered(false)}
        onTouchStart={() => setIsWalletHovered(prev => !prev)}
      >
        {/* Pointing hand floating behind/beside the wallet */}
        <img
          src={pointingHand}
          alt=""
          aria-hidden="true"
          className="absolute -right-6 -top-2 h-[95px] w-auto object-contain pointer-events-none select-none opacity-90 z-20"
        />

        {/* 1. Wallet Back Liner */}
        <div
          className="absolute left-3 right-3 top-10 bottom-2 bg-[#162716] rounded-t-[28px] rounded-b-[36px] shadow-inner pointer-events-none"
          style={{
            boxShadow: "inset 0 20px 35px rgba(0, 0, 0, 0.7), inset 0 2px 10px rgba(0,0,0,0.5)",
            border: "1px solid rgba(61, 86, 53, 0.3)",
          }}
        />

        {/* 2. Three Emerging Payment Cards */}
        <div className="relative mx-5 h-20">
          {/* Card 1: Stripe (Purple) */}
          <div
            className="bs-wallet-card bs-card-stripe absolute inset-x-2 h-36 -top-12 bg-gradient-to-br from-[#6a62ff] to-[#4e44e6] text-white rounded-2xl p-3.5 shadow-xl flex flex-col justify-between cursor-pointer border border-white/20"
            style={{
              zIndex: 10,
              transform: isWalletHovered ? "translateY(-46px) rotate(-3deg)" : "translateY(0) rotate(-1.5deg)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs tracking-widest uppercase">Stripe</span>
              <div className="w-6 h-4.5 bg-white/25 rounded border border-white/20" />
            </div>
            <div className="flex justify-center">
              <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-bold tracking-wider text-white/90 border border-white/10 shadow-sm">
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
            className="bs-wallet-card bs-card-wise absolute inset-x-3 h-36 -top-8 bg-gradient-to-br from-[#a6e673] to-[#8ac957] text-[#163316] rounded-2xl p-3.5 shadow-xl flex flex-col justify-between cursor-pointer border border-white/30"
            style={{
              zIndex: 20,
              transform: isWalletHovered ? "translateY(-26px) rotate(2deg)" : "translateY(0) rotate(1deg)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs tracking-widest uppercase text-[#163316]">Wise</span>
              <div className="w-6 h-4.5 bg-black/15 rounded border border-black/10" />
            </div>
            <div className="flex justify-center">
              <span className="px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-bold tracking-wider text-white border border-white/20 shadow-sm">
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
            className="bs-wallet-card bs-card-paypal absolute inset-x-4 h-36 -top-4 bg-white text-[#003087] rounded-2xl p-3.5 shadow-2xl flex flex-col justify-between cursor-pointer border border-gray-200"
            style={{
              zIndex: 30,
              transform: isWalletHovered ? "translateY(-10px) rotate(0deg)" : "translateY(0) rotate(0deg)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-sm tracking-wide">
                Pay<span className="text-[#0079C1]">Pal</span>
              </span>
              <div className="w-6 h-4.5 bg-black/10 rounded border border-black/10" />
            </div>
            <div className="flex justify-center">
              <span className="px-2 py-0.5 rounded-full bg-[#003087] text-[10px] font-bold tracking-wider text-white shadow-sm">
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

        {/* 3. Front Leather Pocket with Stitching & BirrStream Balance Metrics */}
        <div className="relative z-40 px-3 -mt-6">
          <div
            className="relative rounded-3xl p-5 text-white overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(180deg, #1d331d 0%, #152515 100%)",
              boxShadow: "0 18px 36px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
              border: "1.5px dashed #3e5e36",
            }}
          >
            {/* Top header row with Main Balance & Eye Reveal Button */}
            <div className="flex items-center justify-between mb-1.5">
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
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#a2cb95] transition-all flex items-center gap-1 text-xs font-semibold"
                title={showBalance ? "Hide Balance" : "Reveal Balance"}
              >
                {showBalance ? (
                  <>
                    <EyeOff className="w-4 h-4 text-[#a2cb95]" />
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-emerald-400" />
                  </>
                )}
              </button>
            </div>

            {/* Balance Amount */}
            {isLoading ? (
              <div className="h-10 bg-white/10 rounded-xl animate-pulse w-44 mb-2" />
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {showBalance ? fmt(summary?.mainBalance ?? 0) : "••••••••"}
                  </span>
                  <span className="text-lg font-bold text-[#95c088]" style={displayFont}>
                    {currency}
                  </span>
                </div>

                {/* Pending Withdrawal Alert if present */}
                {pendingWithdrawalTotal > 0 && (
                  <div className="flex items-center justify-between bg-yellow-500/15 border border-yellow-500/30 rounded-xl px-3 py-2 mt-2 mb-1.5">
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
              </>
            )}

            {/* Active VIP Package status */}
            {summary?.activePackageName ? (
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
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
              <Link
                href="/packages"
                className="inline-flex items-center gap-1 mt-2.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold hover:bg-emerald-500/30 transition-all"
                style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
              >
                {isAmharic ? "የቪአይፒ ፓኬጅ ይውሰዱ" : isOromo ? "Paakeejii VIP Fudhadhaa" : "Get a VIP Package"}{" "}
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}

            {/* Progress bar to next VIP tier */}
            {summary?.nextTierName && (
              <div className="mt-3">
                <div
                  className="flex justify-between text-xs text-[#95c088] mb-1 font-medium"
                  style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                >
                  <span>
                    {t("dash.progress_to_vip")} {summary.nextTierName}
                  </span>
                  <span className="font-bold">{Math.round(summary.progressToNextTier)}%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
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
