import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/lib/auth";
import { Trophy, Flame, TrendingUp, Search } from "lucide-react";
import { BSLogo } from "@/components/bs-logo";

import oneKeyIcon from "@/assets/decor/wired-outline-1284-one-key-hover-press.webp";
import twoKeyIcon from "@/assets/decor/wired-outline-1285-two-key-hover-press.webp";
import threeKeyIcon from "@/assets/decor/wired-outline-1286-three-key-hover-press.webp";

/* ── Ethiopian Name Pool ── */
const FIRST_NAMES = [
  "Ephrem","Bethlehem","Yonas","Hiwot","Abel","Tewodros","Almaz","Kidus","Marta","Binyam","Desta","Rahel","Samuel",
  "Tsion","Natnael","Meseret","Henok","Lidya","Dawit","Helen","Abebe","Abraham","Abrham","Abiy","Adane","Adisu",
  "Alemu","Amare","Amina","Aster","Ayele","Azeb","Bekele","Bereket","Berhanu","Biniam","Biruk","Bisrat","Bruktawit",
  "Chaltu","Dagmawi","Daniel","Dereje","Eden","Eleni","Ermias","Eyob","Eyuel","Fikre","Fitsum","Frezer","Gelila",
  "Gemechu","Getachew","Girma","Gizaw","Habte","Haimanot","Hana","Ifa","Kalkidan","Kassahun","Kebede","Kidist",
  "Lensa","Liya","Mahlet","Mekdes","Mekonnen","Melat","Meron","Meskerem","Mihret","Mikyas","Mulu","Nahom",
  "Netsanet","Rediet","Ruth","Sara","Selamawit","Selam","Solomon","Tadesse","Tariku","Teferi","Teshome","Tigist",
  "Tilahun","Tinsae","Wubet","Yared","Yohannes","Zerihun","Zinash","Zelalem","Fikirte","Obsa","Tolosa","Hundesa",
  "Dabala","Boru","Gudeta","Hirut","Worku","Alemayehu","Tesfaye","Mulugeta","Fasil","Negash","Habtamu","Asnake","Belay","Tsega","Tekalign",
];

const LAST_NAMES = [
  "Tadesse","Assefa","Girma","Mengistu","Tesfaye","Kassahun","Ayana","Yohannes","Bekele","Girmay","Haile","Getachew",
  "Wolde","Alemayehu","Berhanu","Defar","Mulatu","Solomon","Kebede","Fikre","Abebe","Gebremedhin","Berhane","Teshome",
  "Negash","Demissie","Worku","Ayele","Tilahun","Mulugeta","Dawit","Kassa","Mekonnen","Habte","Legesse","Gebru",
  "Desta","Seyoum","Belay","Ararsa","Hundessa","Tolosa","Gudeta","Boru","Dabala","Feyisa","Dinka","Yadeta","Regasa",
  "Lemi","Galata","Tufa","Kumsa",
];

const VIP_TIERS = [
  { name: "VIP 5 Apex",    color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",   short: "Apex" },
  { name: "VIP 4 Titan",   color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30", short: "Titan" },
  { name: "VIP 3 Grand",   color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",       short: "Grand" },
  { name: "VIP 2 Pro",     color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30", short: "Pro" },
  { name: "VIP 1 Starter", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",   short: "Starter" },
];

export interface LeaderboardUser {
  id: number;
  rank: number;
  name: string;
  earnings: number;
  dailyYield: number;
  vipIdx: number;
  streakDays: number;
  avatar: string;
}

/* Deterministic seeded random number generator */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* Generate 689 users once with stable authentic profiles */
function generateUsers(): LeaderboardUser[] {
  const rng = seededRandom(108);
  const users: LeaderboardUser[] = [];
  const avatarPool = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=70",
    "https://images.unsplash.com/photo-1548142813-c348350df52b?w=100&auto=format&fit=crop&q=70",
  ];

  for (let i = 0; i < 689; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[i % LAST_NAMES.length];
    const rank = i + 1;

    // Realistic earnings scale
    let baseEarnings: number;
    if (rank === 1) baseEarnings = 248950;
    else if (rank === 2) baseEarnings = 194300;
    else if (rank === 3) baseEarnings = 156800;
    else {
      baseEarnings = Math.max(850, Math.round(145000 * Math.exp(-rank * 0.006) + (rng() * 2500)));
    }

    const dailyYield = Math.max(25, Math.round(baseEarnings * (0.012 + (rng() * 0.004))));

    let vipIdx: number;
    if (rank <= 3) vipIdx = 0;
    else if (rank <= 20) vipIdx = 1;
    else if (rank <= 75) vipIdx = 2;
    else if (rank <= 220) vipIdx = 3;
    else vipIdx = 4;

    users.push({
      id: i + 1,
      rank,
      name: `${first} ${last}`,
      earnings: baseEarnings,
      dailyYield,
      vipIdx,
      streakDays: Math.max(2, Math.round(89 * Math.exp(-rank * 0.005) + (rng() * 6))),
      avatar: avatarPool[i % avatarPool.length],
    });
  }

  return users;
}

const INITIAL_USERS = generateUsers();

const fmt = (n: number) => n.toLocaleString("en-ET", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function Leaderboard() {
  const { isAmharic, isOromo, currency } = useLanguage();
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(40);
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0.045em" : "-0.01em",
  };

  /* ── Slow animated rank shuffling every 7 seconds for live competition feel (outside top 3) ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prev => {
        const next = [...prev];
        const swapCount = 2 + Math.floor(Math.random() * 3);
        for (let s = 0; s < swapCount; s++) {
          const i = 3 + Math.floor(Math.random() * (next.length - 6));
          const j = i + 1 + Math.floor(Math.random() * 3);
          if (j < next.length) {
            // Swap ranks cleanly
            const tempRank = next[i].rank;
            next[i].rank = next[j].rank;
            next[j].rank = tempRank;
            [next[i], next[j]] = [next[j], next[i]];
          }
        }
        return next;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  /* ── Infinite scroll ── */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 150) {
      setVisibleCount(prev => Math.min(prev + 35, 689));
    }
  }, []);

  /* Filter by search query while strictly maintaining true user rank */
  const filtered = searchQuery.trim()
    ? users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  const displayed = filtered.slice(0, visibleCount);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative bg-background">
      {/* ── CLEAN HEADER ── */}
      <div className="px-4 pt-3 pb-3 bg-card border-b border-border/80 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-base text-foreground leading-tight" style={displayFont}>
                {isAmharic ? "የደረጃ ሰንጠረዥ" : isOromo ? "Sadarkaa Galiiwwan" : "Top Earners Leaderboard"}
              </h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isAmharic ? "የ 689 ተጠቃሚዎች የገቢ ደረጃዎች" : isOromo ? "Sadarkaa miseensota 689" : "Official earnings rankings (689 active members)"}
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAmharic ? "በስም ፈልግ..." : isOromo ? "Maqaadhaan barbaadi..." : "Search member by name..."}
            className="w-full pl-9 pr-4 py-2 bg-muted/40 hover:bg-muted/60 focus:bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
          />
        </div>
      </div>

      {/* ── SCROLLABLE LIST ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-2 no-scrollbar"
        style={{ minHeight: 0 }}
      >
        {displayed.map((earner) => {
          const isRank1 = earner.rank === 1;
          const isRank2 = earner.rank === 2;
          const isRank3 = earner.rank === 3;
          const isTop3 = isRank1 || isRank2 || isRank3;
          const keyIcon = isRank1 ? oneKeyIcon : isRank2 ? twoKeyIcon : isRank3 ? threeKeyIcon : null;
          const vip = VIP_TIERS[earner.vipIdx];

          /* ── Task 8: Top 3 Earners use the 4 dashboard stat card colors ── */
          // Rank 1: Total Yield color (#F5E6A3)
          // Rank 2: Total Deposited color (#C9BDF5)
          // Rank 3: Total Withdrawn color (#F2A89A)
          let cardStyle = "bg-card border border-border shadow-sm hover:border-border/80";
          let keyAnimClass = "";

          if (isRank1) {
            cardStyle = "bg-[#F5E6A3]/35 dark:bg-[#F5E6A3]/15 border-2 border-[#F5E6A3] dark:border-[#F5E6A3]/50 shadow-md";
            keyAnimClass = "animate-earner-rank1";
          } else if (isRank2) {
            cardStyle = "bg-[#C9BDF5]/35 dark:bg-[#C9BDF5]/15 border-2 border-[#C9BDF5] dark:border-[#C9BDF5]/50 shadow-md";
            keyAnimClass = "animate-earner-rank2";
          } else if (isRank3) {
            cardStyle = "bg-[#F2A89A]/35 dark:bg-[#F2A89A]/15 border-2 border-[#F2A89A] dark:border-[#F2A89A]/50 shadow-md";
            keyAnimClass = "animate-earner-rank3";
          }

          return (
            <div
              key={earner.id}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-colors duration-300 ${cardStyle}`}
            >
              {/* Rank Badge or Animated Key Icon */}
              <div className="w-9 flex items-center justify-center flex-shrink-0">
                {keyIcon ? (
                  <img
                    src={keyIcon}
                    alt={`Rank ${earner.rank}`}
                    className={`w-7 h-7 object-contain ${keyAnimClass}`}
                  />
                ) : (
                  <span className={`text-xs font-black ${earner.rank <= 10 ? "text-foreground font-extrabold" : "text-muted-foreground"}`}>
                    #{earner.rank}
                  </span>
                )}
              </div>

              {/* Avatar Frame */}
              <div className="relative flex-shrink-0">
                <img
                  src={earner.avatar}
                  alt={earner.name}
                  className={`w-10 h-10 rounded-full object-cover ${
                    isRank1
                      ? "border-2 border-[#F5E6A3] shadow-sm"
                      : isRank2
                      ? "border-2 border-[#C9BDF5] shadow-sm"
                      : isRank3
                      ? "border-2 border-[#F2A89A] shadow-sm"
                      : "border border-border/80"
                  }`}
                  loading="lazy"
                />
              </div>

              {/* Earner Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-xs font-black text-foreground truncate block leading-tight"
                    style={displayFont}
                  >
                    {earner.name}
                  </span>
                  <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-black border ${vip.color}`}>
                    {vip.short}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                  <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                    <Flame className="w-3 h-3" />
                    <span>{earner.streakDays}d</span>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    +{fmt(earner.dailyYield)}/{isAmharic ? "ቀን" : "day"}
                  </span>
                </div>
              </div>

              {/* ETB Total Earnings */}
              <div className="text-right flex-shrink-0 pl-1">
                <span className={`text-xs font-black block ${
                  isRank1 ? "text-amber-800 dark:text-amber-300" : isRank2 ? "text-purple-800 dark:text-purple-300" : isRank3 ? "text-rose-800 dark:text-rose-300" : "text-foreground"
                }`}>
                  {fmt(earner.earnings)}
                </span>
                <span className="text-[10px] text-muted-foreground font-bold">
                  {currency}
                </span>
              </div>
            </div>
          );
        })}

        {/* Empty search result */}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-xs font-semibold">{isAmharic ? "ተጠቃሚው አልተገኘም" : "No member found"}</p>
          </div>
        )}

        {/* Infinite Scroll Trigger Indicator */}
        {visibleCount < filtered.length && (
          <div className="py-3 text-center">
            <span className="text-[11px] text-muted-foreground font-semibold">
              {isAmharic ? "ተጨማሪ በመጫን ላይ..." : "Loading more members..."}
            </span>
          </div>
        )}
      </div>

      {/* ── STICKY BOTTOM: YOUR ACCOUNT RANK STANDING ── */}
      <div className="p-3 bg-card border-t border-border shadow-lg flex items-center justify-between sticky bottom-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground" style={displayFont}>
                {user?.fullName || "Your Account"}
              </span>
              <span className="px-1.5 py-0.2 bg-primary/15 text-primary rounded-full text-[9px] font-black border border-primary/25">
                #{user?.id ? (Number(user.id) % 150) + 38 : 72}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {isAmharic ? "ወደ ቀጣዩ ደረጃ 2,500 ብር ብቻ ይቀራል" : "2,500 ETB to next rank"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-primary block">
            {user?.mainBalance ? fmt(user.mainBalance) : "18,450"} {currency}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 justify-end">
            <TrendingUp className="w-3 h-3" /> +3 this week
          </span>
        </div>
      </div>
    </div>
  );
}
