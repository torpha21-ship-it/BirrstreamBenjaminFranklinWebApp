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
  "Abebe","Abel","Abraham","Abrham","Abiy","Adane","Adisu","Alemu","Almaz","Amare","Amina","Aster","Ayele","Azeb",
  "Bekele","Bereket","Berhanu","Bethlehem","Biniam","Biruk","Bisrat","Bruktawit","Chaltu","Dagmawi","Daniel","Dawit",
  "Dereje","Desta","Eden","Eleni","Ephrem","Ermias","Eyob","Eyuel","Fikre","Fitsum","Frezer","Gelila","Gemechu",
  "Getachew","Girma","Gizaw","Habte","Haimanot","Hana","Henok","Hiwot","Ifa","Kalkidan","Kassahun","Kebede",
  "Kidist","Kidus","Lensa","Lidya","Liya","Mahlet","Marta","Mekdes","Mekonnen","Melat","Meron","Meseret",
  "Meskerem","Mihret","Mikyas","Mulu","Nahom","Natnael","Netsanet","Rediet","Ruth","Sara","Selamawit","Selam",
  "Samuel","Solomon","Tadesse","Tariku","Teferi","Teshome","Tigist","Tilahun","Tinsae","Tsion","Wubet","Yared",
  "Yohannes","Yonas","Zerihun","Zinash","Zelalem","Fikirte","Obsa","Tolosa","Hundesa","Dabala","Boru","Gudeta",
  "Hirut","Worku","Alemayehu","Tesfaye","Mulugeta","Fasil","Negash","Habtamu","Asnake","Belay","Tsega","Tekalign",
];

const LAST_NAMES = [
  "Tadesse","Bekele","Haile","Assefa","Kebede","Girma","Wolde","Mengistu","Getachew","Tesfaye","Abebe","Gebremedhin",
  "Berhane","Yohannes","Solomon","Alemayehu","Teshome","Negash","Demissie","Kassahun","Worku","Ayele","Tilahun",
  "Mulugeta","Fikre","Dawit","Kassa","Mekonnen","Habte","Legesse","Gebru","Desta","Seyoum","Belay","Ararsa",
  "Hundessa","Tolosa","Gudeta","Boru","Dabala","Feyisa","Dinka","Yadeta","Regasa","Lemi","Galata","Tufa","Kumsa",
];

const VIP_TIERS = [
  { name: "VIP 5 Apex",   color: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30",   short: "Apex" },
  { name: "VIP 4 Titan",  color: "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30", short: "Titan" },
  { name: "VIP 3 Grand",  color: "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30",       short: "Grand" },
  { name: "VIP 2 Pro",    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30", short: "Pro" },
  { name: "VIP 1 Starter",color: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",   short: "Starter" },
];

interface LeaderboardUser {
  id: number;
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

/* Generate 689 users once */
function generateUsers(): LeaderboardUser[] {
  const rng = seededRandom(42);
  const users: LeaderboardUser[] = [];
  const avatarPool = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=80&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1548142813-c348350df52b?w=80&auto=format&fit=crop&q=60",
  ];

  for (let i = 0; i < 689; i++) {
    const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];

    // Top users earn more — exponential decay
    const rank = i + 1;
    const baseEarnings = Math.max(500, Math.round(280000 * Math.exp(-rank * 0.007) + rng() * 3000));
    const dailyYield = Math.max(15, Math.round(baseEarnings * (0.01 + rng() * 0.005)));

    let vipIdx: number;
    if (rank <= 5) vipIdx = 0;
    else if (rank <= 25) vipIdx = 1;
    else if (rank <= 80) vipIdx = 2;
    else if (rank <= 250) vipIdx = 3;
    else vipIdx = 4;

    users.push({
      id: i,
      name: `${first} ${last}`,
      earnings: baseEarnings,
      dailyYield,
      vipIdx,
      streakDays: Math.max(1, Math.round(90 * Math.exp(-rank * 0.005) + rng() * 10)),
      avatar: avatarPool[Math.floor(rng() * avatarPool.length)],
    });
  }

  // Sort by earnings descending initially
  users.sort((a, b) => b.earnings - a.earnings);
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

  /* ── Slow animated rank shuffling every 6 seconds ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prev => {
        const next = [...prev];
        // Pick 3-5 random swap pairs outside top 3 (top 3 stay stable)
        const swapCount = 3 + Math.floor(Math.random() * 3);
        for (let s = 0; s < swapCount; s++) {
          const i = 3 + Math.floor(Math.random() * (next.length - 4));
          const j = i + 1 + Math.floor(Math.random() * Math.min(4, next.length - i - 1));
          if (j < next.length) {
            [next[i], next[j]] = [next[j], next[i]];
          }
        }
        return next;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  /* ── Infinite scroll ── */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      setVisibleCount(prev => Math.min(prev + 30, 689));
    }
  }, []);

  /* Filter by search */
  const filtered = searchQuery.trim()
    ? users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  const displayed = filtered.slice(0, visibleCount);

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] max-w-md mx-auto">
      {/* ── PAGE HEADER ── */}
      <div className="px-4 pt-3 pb-2 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-foreground leading-tight" style={displayFont}>
                {isAmharic ? "ደረጃ ሰንጠረዥ" : isOromo ? "Sadarkaa Galiiwwan" : "Top Earners Leaderboard"}
              </h1>
              <p className="text-[11px] text-muted-foreground">
                {isAmharic ? `${users.length} ተሳታፊዎች • ቀጥታ ውድድር` : `${users.length} members • Live competition`}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse border border-emerald-500/30">
            ● Live
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAmharic ? "ተሳታፊ ፈልግ..." : "Search member..."}
            className="w-full pl-9 pr-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* ── SCROLLABLE LEADERBOARD LIST ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 no-scrollbar"
      >
        {displayed.map((earner, idx) => {
          const rank = idx + 1;
          const isTop3 = rank <= 3;
          const keyIcon = rank === 1 ? oneKeyIcon : rank === 2 ? twoKeyIcon : rank === 3 ? threeKeyIcon : null;
          const vip = VIP_TIERS[earner.vipIdx];

          // Top 3 get special styling
          const top3Border = rank === 1
            ? "border-amber-400/60 bg-gradient-to-r from-amber-500/10 to-card"
            : rank === 2
            ? "border-slate-400/50 bg-gradient-to-r from-slate-400/10 to-card"
            : rank === 3
            ? "border-amber-700/40 bg-gradient-to-r from-amber-800/10 to-card"
            : "border-border bg-card";

          const animClass = rank === 1
            ? "animate-earner-rank1"
            : rank === 2
            ? "animate-earner-rank2"
            : rank === 3
            ? "animate-earner-rank3"
            : "";

          return (
            <div
              key={earner.id}
              className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all duration-700 ease-in-out ${top3Border} ${animClass}`}
              style={{ transitionProperty: "transform, opacity" }}
            >
              {/* Rank Number or Key Icon */}
              <div className="w-8 flex items-center justify-center flex-shrink-0">
                {keyIcon ? (
                  <img src={keyIcon} alt={`Rank ${rank}`} className="w-7 h-7 object-contain" />
                ) : (
                  <span className={`text-xs font-black ${rank <= 10 ? "text-foreground" : "text-muted-foreground"}`}>
                    #{rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <img
                src={earner.avatar}
                alt={earner.name}
                className={`w-9 h-9 rounded-full object-cover flex-shrink-0 ${
                  isTop3 ? "border-2 border-amber-400 shadow-md" : "border border-border"
                }`}
                loading="lazy"
              />

              {/* Name, VIP, Streak */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold truncate ${isTop3 ? "text-foreground" : "text-foreground"}`}
                    style={displayFont}
                  >
                    {earner.name}
                  </span>
                  <span className={`text-[8px] px-1.5 py-0 rounded-full font-extrabold border ${vip.color} flex-shrink-0`}>
                    {vip.short}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-0.5 text-amber-500">
                    <Flame className="w-2.5 h-2.5" />
                    {earner.streakDays}d
                  </span>
                  <span className="text-emerald-500 font-semibold">
                    +{fmt(earner.dailyYield)}/{isAmharic ? "ቀን" : "day"}
                  </span>
                </div>
              </div>

              {/* Total Earnings */}
              <div className="text-right flex-shrink-0 pl-1">
                <span className={`text-xs font-black block ${isTop3 ? "text-amber-600 dark:text-amber-300" : "text-foreground"}`}>
                  {fmt(earner.earnings)}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {currency}
                </span>
              </div>
            </div>
          );
        })}

        {/* Load more indicator */}
        {visibleCount < filtered.length && (
          <div className="py-4 text-center">
            <span className="text-[11px] text-muted-foreground font-semibold animate-pulse">
              {isAmharic ? "ተጨማሪ በመጫን ላይ..." : "Loading more..."}
            </span>
          </div>
        )}
      </div>

      {/* ── STICKY BOTTOM: YOUR RANK ── */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/20 border-t border-primary/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground" style={displayFont}>
                {user?.fullName || "Your Account"}
              </span>
              <span className="px-1.5 py-0 bg-primary/20 text-primary rounded-full text-[9px] font-bold">
                #{user?.id ? (Number(user.id) % 200) + 45 : 128}
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
            <TrendingUp className="w-3 h-3" /> +3
          </span>
        </div>
      </div>
    </div>
  );
}
