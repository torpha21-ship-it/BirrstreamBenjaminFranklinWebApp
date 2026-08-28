import React, { useState } from "react";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/lib/auth";
import {
  Trophy,
  Flame,
  TrendingUp,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Medal,
  ChevronRight,
  Zap,
} from "lucide-react";

import oneKeyIcon from "@/assets/decor/wired-outline-1284-one-key-hover-press.webp";
import twoKeyIcon from "@/assets/decor/wired-outline-1285-two-key-hover-press.webp";
import threeKeyIcon from "@/assets/decor/wired-outline-1286-three-key-hover-press.webp";

export interface EarnerUser {
  rank: number;
  name: string;
  username: string;
  avatar: string;
  totalEarnings: number;
  dailyYield: number;
  vipTier: string;
  vipColor: string;
  streakDays: number;
  change: string; // "+2", "same", "+1"
  badgeIcon?: string;
  isUser?: boolean;
}

const TOP_EARNERS_DATA: EarnerUser[] = [
  {
    rank: 1,
    name: "Ephrem Tadesse",
    username: "ephrem_king",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 248950,
    dailyYield: 3450,
    vipTier: "VIP 5 Apex",
    vipColor: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    streakDays: 89,
    change: "+1",
    badgeIcon: oneKeyIcon,
  },
  {
    rank: 2,
    name: "Bethlehem Assefa",
    username: "beth_a",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 194300,
    dailyYield: 2800,
    vipTier: "VIP 5 Apex",
    vipColor: "bg-purple-500/15 text-purple-600 border-purple-500/30",
    streakDays: 76,
    change: "+2",
    badgeIcon: twoKeyIcon,
  },
  {
    rank: 3,
    name: "Yonas Girma",
    username: "yonas_g",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 156800,
    dailyYield: 2150,
    vipTier: "VIP 4 Titan",
    vipColor: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    streakDays: 64,
    change: "same",
    badgeIcon: threeKeyIcon,
  },
  {
    rank: 4,
    name: "Hiwot Mengistu",
    username: "hiwot_m",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 124500,
    dailyYield: 1850,
    vipTier: "VIP 4 Titan",
    vipColor: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    streakDays: 58,
    change: "+3",
  },
  {
    rank: 5,
    name: "Abel Tesfaye",
    username: "abel_t",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 98700,
    dailyYield: 1450,
    vipTier: "VIP 4 Titan",
    vipColor: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    streakDays: 51,
    change: "+1",
  },
  {
    rank: 6,
    name: "Tewodros Kassahun",
    username: "teddy_k",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 84200,
    dailyYield: 1200,
    vipTier: "VIP 3 Grand",
    vipColor: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    streakDays: 45,
    change: "same",
  },
  {
    rank: 7,
    name: "Almaz Ayana",
    username: "almaz_runner",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 72600,
    dailyYield: 1050,
    vipTier: "VIP 3 Grand",
    vipColor: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    streakDays: 41,
    change: "+2",
  },
  {
    rank: 8,
    name: "Kidus Yohannes",
    username: "kidus_y",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 61400,
    dailyYield: 920,
    vipTier: "VIP 3 Grand",
    vipColor: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    streakDays: 37,
    change: "-1",
  },
  {
    rank: 9,
    name: "Marta Bekele",
    username: "marta_b",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 53800,
    dailyYield: 780,
    vipTier: "VIP 2 Pro",
    vipColor: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
    streakDays: 32,
    change: "+4",
  },
  {
    rank: 10,
    name: "Binyam Girmay",
    username: "binyam_g",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 47200,
    dailyYield: 650,
    vipTier: "VIP 2 Pro",
    vipColor: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
    streakDays: 29,
    change: "same",
  },
  {
    rank: 11,
    name: "Desta Haile",
    username: "desta_h",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 39500,
    dailyYield: 580,
    vipTier: "VIP 2 Pro",
    vipColor: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
    streakDays: 25,
    change: "+1",
  },
  {
    rank: 12,
    name: "Rahel Getachew",
    username: "rahel_g",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 34100,
    dailyYield: 490,
    vipTier: "VIP 2 Pro",
    vipColor: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
    streakDays: 22,
    change: "+2",
  },
  {
    rank: 13,
    name: "Samuel Wolde",
    username: "samuel_w",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 29800,
    dailyYield: 420,
    vipTier: "VIP 1 Starter",
    vipColor: "bg-slate-500/15 text-slate-600 border-slate-500/30",
    streakDays: 19,
    change: "same",
  },
  {
    rank: 14,
    name: "Tsion Alemayehu",
    username: "tsion_a",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 25400,
    dailyYield: 380,
    vipTier: "VIP 1 Starter",
    vipColor: "bg-slate-500/15 text-slate-600 border-slate-500/30",
    streakDays: 16,
    change: "+3",
  },
  {
    rank: 15,
    name: "Natnael Berhanu",
    username: "nati_b",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 21900,
    dailyYield: 340,
    vipTier: "VIP 1 Starter",
    vipColor: "bg-slate-500/15 text-slate-600 border-slate-500/30",
    streakDays: 14,
    change: "+1",
  },
  {
    rank: 16,
    name: "Meseret Defar",
    username: "mesi_d",
    avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 18500,
    dailyYield: 290,
    vipTier: "VIP 1 Starter",
    vipColor: "bg-slate-500/15 text-slate-600 border-slate-500/30",
    streakDays: 12,
    change: "same",
  },
  {
    rank: 17,
    name: "Henok Mulatu",
    username: "henok_m",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 15800,
    dailyYield: 250,
    vipTier: "VIP 1 Starter",
    vipColor: "bg-slate-500/15 text-slate-600 border-slate-500/30",
    streakDays: 10,
    change: "+2",
  },
  {
    rank: 18,
    name: "Lidya Solomon",
    username: "lidya_s",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 13200,
    dailyYield: 210,
    vipTier: "VIP 1 Starter",
    vipColor: "bg-slate-500/15 text-slate-600 border-slate-500/30",
    streakDays: 8,
    change: "+1",
  },
  {
    rank: 19,
    name: "Dawit Kebede",
    username: "dave_k",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 11400,
    dailyYield: 180,
    vipTier: "VIP 1 Starter",
    vipColor: "bg-slate-500/15 text-slate-600 border-slate-500/30",
    streakDays: 7,
    change: "same",
  },
  {
    rank: 20,
    name: "Helen Fikre",
    username: "helen_f",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    totalEarnings: 9800,
    dailyYield: 150,
    vipTier: "VIP 1 Starter",
    vipColor: "bg-slate-500/15 text-slate-600 border-slate-500/30",
    streakDays: 5,
    change: "+2",
  },
];

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const { isAmharic, isOromo, currency } = useLanguage();
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<"all" | "monthly" | "weekly">("all");

  if (!isOpen) return null;

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0.045em" : "-0.01em",
  };

  const top1 = TOP_EARNERS_DATA[0];
  const top2 = TOP_EARNERS_DATA[1];
  const top3 = TOP_EARNERS_DATA[2];
  const restEarners = TOP_EARNERS_DATA.slice(3);

  const fmt = (num: number) => num.toLocaleString("en-ET", { minimumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-t-[32px] sm:rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-8 duration-300">
        {/* Header with Title and Close Button */}
        <div className="p-4 pb-3 border-b border-border/80 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-card to-card">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 shadow-sm animate-pulse">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-foreground leading-tight" style={displayFont}>
                  {isAmharic ? "የከፍተኛ ገቢዎች ደረጃ ሰንጠረዥ" : isOromo ? "Sadarkaa Galiiwwan Olaanoo" : "Top Earners Leaderboard"}
                </h3>
                <span className="inline-flex items-center px-1.5 py-0.2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                  ● Live
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isAmharic ? "በናኦሚ ላብስ ከፍተኛ ገቢ ያስመዘገቡ አባላት" : isOromo ? "Miseensota galii guddaa galmeessan" : "Real-time earnings of top platform performers"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="px-4 py-2 bg-muted/20 border-b border-border/40 flex items-center justify-around gap-2">
          {[
            { id: "all", label: isAmharic ? "ሁልጊዜ" : isOromo ? "Yeroo Hunda" : "All Time" },
            { id: "monthly", label: isAmharic ? "የዚህ ወር" : isOromo ? "Ji'a Kana" : "This Month" },
            { id: "weekly", label: isAmharic ? "የዚህ ሳምንት" : isOromo ? "Torban Kana" : "This Week" },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTimeframe(t.id as any)}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer text-center ${
                timeframe === t.id
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
              style={displayFont}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* ── TOP 3 PODIUM WITH UP-AND-DOWN ANIMATION ── */}
          <div className="relative pt-6 pb-2">
            <div className="grid grid-cols-3 gap-2 items-end">
              {/* RANK 2 (Silver) — Out of phase floating animation */}
              <div className="flex flex-col items-center animate-earner-rank2">
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-300 shadow-md overflow-hidden bg-muted">
                    <img src={top2.avatar} alt={top2.name} className="w-full h-full object-cover" />
                  </div>
                  {/* Two Key Icon Badge */}
                  <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 shadow-md flex items-center justify-center">
                    <img src={twoKeyIcon} alt="Rank 2" className="w-5 h-5 object-contain" />
                  </div>
                </div>
                <span className="text-xs font-bold text-foreground text-center truncate max-w-[90px] block" style={displayFont}>
                  {top2.name.split(" ")[0]}
                </span>
                <span className="text-[10px] font-black text-slate-500 mt-0.5">
                  {fmt(top2.totalEarnings)} {currency}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-300 mt-1 font-bold">
                  {top2.vipTier}
                </span>
              </div>

              {/* RANK 1 (Gold Champion) — Elevated Champion with Key #1 & Gold Glow */}
              <div className="flex flex-col items-center animate-earner-rank1 relative z-10 -mt-4">
                <div className="absolute -top-6 text-amber-500 animate-bounce">
                  👑
                </div>
                <div className="relative mb-2">
                  <div className="w-20 h-20 rounded-full border-4 border-amber-400 shadow-xl overflow-hidden bg-amber-500/10 animate-glow-gold">
                    <img src={top1.avatar} alt={top1.name} className="w-full h-full object-cover" />
                  </div>
                  {/* One Key Icon Badge */}
                  <div className="absolute -bottom-2 -right-1 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/80 border-2 border-amber-400 shadow-lg flex items-center justify-center">
                    <img src={oneKeyIcon} alt="Rank 1" className="w-6 h-6 object-contain" />
                  </div>
                </div>
                <span className="text-xs font-extrabold text-foreground text-center truncate max-w-[100px] block text-amber-700 dark:text-amber-300" style={displayFont}>
                  {top1.name}
                </span>
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {fmt(top1.totalEarnings)} {currency}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 mt-1 font-extrabold border border-amber-500/30">
                  {top1.vipTier}
                </span>
              </div>

              {/* RANK 3 (Bronze) — Out of phase floating animation */}
              <div className="flex flex-col items-center animate-earner-rank3">
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-700 shadow-md overflow-hidden bg-muted">
                    <img src={top3.avatar} alt={top3.name} className="w-full h-full object-cover" />
                  </div>
                  {/* Three Key Icon Badge */}
                  <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-amber-900/20 border border-amber-700 shadow-md flex items-center justify-center">
                    <img src={threeKeyIcon} alt="Rank 3" className="w-5 h-5 object-contain" />
                  </div>
                </div>
                <span className="text-xs font-bold text-foreground text-center truncate max-w-[90px] block" style={displayFont}>
                  {top3.name.split(" ")[0]}
                </span>
                <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 mt-0.5">
                  {fmt(top3.totalEarnings)} {currency}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-800/15 text-amber-800 dark:text-amber-400 mt-1 font-bold">
                  {top3.vipTier}
                </span>
              </div>
            </div>
          </div>

          {/* ── RANKS 4 TO 20+ VAST LEADERBOARD LIST ── */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider px-1" style={displayFont}>
              {isAmharic ? "ተከታይ ከፍተኛ ገቢ ፈጣሪዎች" : isOromo ? "Hoggantoota Galii Dabalataa" : "Top Ranked Earners (4 - 20+)"}
            </h4>

            {restEarners.map((earner) => (
              <div
                key={earner.rank}
                className="bg-card hover:bg-muted/30 p-2.5 rounded-2xl border border-border flex items-center justify-between transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {/* Rank Number */}
                  <div className="w-7 h-7 rounded-full bg-muted/60 text-muted-foreground font-black text-xs flex items-center justify-center flex-shrink-0">
                    #{earner.rank}
                  </div>

                  {/* Avatar */}
                  <img
                    src={earner.avatar}
                    alt={earner.name}
                    className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
                  />

                  {/* Name & Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-foreground truncate block" style={displayFont}>
                        {earner.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold border ${earner.vipColor}`}>
                        {earner.vipTier.split(" ")[1] || earner.vipTier}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Flame className="w-3 h-3" />
                        <span>{earner.streakDays}d streak</span>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-500 font-semibold">+{fmt(earner.dailyYield)}/day</span>
                    </div>
                  </div>
                </div>

                {/* Total ETB Earnings */}
                <div className="text-right flex-shrink-0 pl-2">
                  <span className="text-xs font-black text-foreground block">
                    {fmt(earner.totalEarnings)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User's Own Standing (Sticky Bottom Bar) */}
        <div className="p-3.5 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/20 border-t border-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground" style={displayFont}>
                  {user?.fullName || "Your Account"}
                </span>
                <span className="px-1.5 py-0.2 bg-primary/20 text-primary rounded-full text-[9px] font-bold">
                  #{user?.id ? (Number(user.id) % 30) + 12 : 14}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {isAmharic ? "ወደ ቀጣዩ ደረጃ 2,500 ብር ብቻ ይቀራል" : "2,500 ETB to next rank milestone"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-primary block">
              {user?.mainBalance ? fmt(user.mainBalance) : "18,450.00"} {currency}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              ▲ +3 this week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
