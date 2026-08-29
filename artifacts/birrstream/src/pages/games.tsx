import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { Coins, RefreshCw, ArrowLeft, Play, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetDashboardSummaryQueryKey, getGetUserProfileQueryKey, getGetMeQueryKey, customFetch } from "@workspace/api-client-react";
import { withApiBaseUrl } from "@/lib/api-base-url";
import { useLanguage } from "@/context/language-context";

/* ================================================================
   MOB DATA — 15 Minecraft Mobs with Local Assets & RPG Stats
   ================================================================ */
interface MobData {
  id: string;
  name: string;
  nameAm: string;
  nameOr: string;
  power: string;
  rarity: string;
  rarityAm: string;
  rarityOr: string;
  rarityColor: string;
  amount: number;
  ability: string;
  abilityAm: string;
  abilityOr: string;
  agility: string;
  previewUrl: string;
  rotClass: string;
  themeColor: string;
}

const MOBS: MobData[] = [
  { id: "character-1", name: "Lucky Pixel Cat", nameAm: "ዕድለኛ ድመት", nameOr: "Adurree Milkii", power: "720 CP", rarity: "Rare", rarityAm: "ብርቅዬ", rarityOr: "Dhabamaa", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 45, ability: "Meow Lucky Charm", abilityAm: "የዕድል ውበት", abilityOr: "Milkii Adurree", agility: "60 AG", previewUrl: "/mobs/cat.png", rotClass: "-rotate-6 translate-y-1", themeColor: "#60A5FA" },
  { id: "character-2", name: "Venom Shadow Spider", nameAm: "መርዛማ ሸረሪት", nameOr: "Sariitii Summaa'aa", power: "680 CP", rarity: "Curse Mob", rarityAm: "የመርገምት ካራክተር", rarityOr: "Abaarsa", rarityColor: "text-red-400 bg-red-500/20 border-red-500/40", amount: -25, ability: "Poison Web Trap", abilityAm: "የመርዝ ድር ወጥመድ", abilityOr: "Kiyyoo Summii", agility: "88 AG", previewUrl: "/mobs/spider.png", rotClass: "rotate-6 -translate-y-2 z-10", themeColor: "#EF4444" },
  { id: "character-3", name: "Golden Dairy Cow", nameAm: "ወርቃማ ላም", nameOr: "Sa'a Warqee", power: "500 CP", rarity: "Common", rarityAm: "መደበኛ", rarityOr: "Waliigalaa", rarityColor: "text-slate-300 bg-slate-500/20 border-slate-500/40", amount: 30, ability: "Milk Yield Boost", abilityAm: "የወተት ምርት መጨመሪያ", abilityOr: "Guddistuu Aannanii", agility: "40 AG", previewUrl: "/mobs/cow.png", rotClass: "-rotate-12 translate-x-1", themeColor: "#94A3B8" },
  { id: "character-4", name: "Explosive Creeper", nameAm: "ፈንጂ ክሪፐር", nameOr: "Dhoohaa Kiriipar", power: "990 CP", rarity: "Danger Mob", rarityAm: "አደገኛ ካራክተር", rarityOr: "Balaa", rarityColor: "text-red-400 bg-red-600/30 border-red-500", amount: -50, ability: "TNT Blast Penalty", abilityAm: "የቲኤንቲ ፍንዳታ ቅጣት", abilityOr: "Adabbii Dhoohoo TNT", agility: "70 AG", previewUrl: "/mobs/creeper.png", rotClass: "rotate-12 scale-110 z-20", themeColor: "#22C55E" },
  { id: "character-5", name: "Void Enderman", nameAm: "የጠፈር ኤንደርማን", nameOr: "Eendarmaan Hawaa", power: "890 CP", rarity: "Epic", rarityAm: "ድንቅ (Epic)", rarityOr: "Akkamii (Epic)", rarityColor: "text-purple-400 bg-purple-500/20 border-purple-500/40", amount: 120, ability: "Teleport Stash", abilityAm: "የቴሌፖርት ድብቅ ሳጥን", abilityOr: "Kuusaa Telepoortii", agility: "95 AG", previewUrl: "/mobs/enderman.png", rotClass: "-rotate-3 -translate-y-1", themeColor: "#C084FC" },
  { id: "character-6", name: "Arch Evoker", nameAm: "አርች ኢቮከር", nameOr: "Archi Iivookar", power: "950 CP", rarity: "Dark Boss", rarityAm: "ጨለማ ቦስ", rarityOr: "Boosii Dukkanaa", rarityColor: "text-rose-400 bg-rose-900/40 border-rose-500", amount: -65, ability: "Vex Soul Drain", abilityAm: "የመንፈስ ኃይል መምጠጫ", abilityOr: "Harkisa Lubbuu", agility: "75 AG", previewUrl: "/mobs/evoker.png", rotClass: "rotate-8 scale-105 z-10", themeColor: "#F43F5E" },
  { id: "character-7", name: "Iron Golem Sentinel", nameAm: "የብረት ጎለም ዘበኛ", nameOr: "Goolam Sibiilaa", power: "920 CP", rarity: "Epic", rarityAm: "ድንቅ (Epic)", rarityOr: "Akkamii (Epic)", rarityColor: "text-purple-400 bg-purple-500/20 border-purple-500/40", amount: 90, ability: "Iron Shield Guard", abilityAm: "የብረት ጋሻ መከላከያ", abilityOr: "Eegduu Gaachana Sibiilaa", agility: "50 AG", previewUrl: "/mobs/golem.png", rotClass: "-rotate-8 scale-110 z-10", themeColor: "#E2E8F0" },
  { id: "character-8", name: "Phantom Skeleton Horse", nameAm: "የመንፈስ አጽም ፈረስ", nameOr: "Farda Lafee Hafuuraa", power: "810 CP", rarity: "Rare", rarityAm: "ብርቅዬ", rarityOr: "Dhabamaa", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 75, ability: "Soul Velocity", abilityAm: "የመንፈስ ፍጥነት", abilityOr: "Saffisa Lubbuu", agility: "92 AG", previewUrl: "/mobs/horse.png", rotClass: "rotate-4 translate-y-2", themeColor: "#38BDF8" },
  { id: "character-9", name: "Jungle Ocelot", nameAm: "የጫካ ነብር (ኦሰሎት)", nameOr: "Qeerransa Bosonaa", power: "640 CP", rarity: "Rare", rarityAm: "ብርቅዬ", rarityOr: "Dhabamaa", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 55, ability: "Pounce Hunting", abilityAm: "የፈጣን ዝላይ አደን", abilityOr: "Adamsuu Utalchoo", agility: "85 AG", previewUrl: "/mobs/ocelot.png", rotClass: "-rotate-[15deg] translate-x-2 z-20", themeColor: "#FACC15" },
  { id: "character-10", name: "Diamond Panda King", nameAm: "የአልማዝ ፓንዳ ንጉስ", nameOr: "Mootii Paandaa Alamaazii", power: "1000 CP", rarity: "Mythic Jackpot", rarityAm: "የአፈ ታሪክ ጃክፖት", rarityOr: "Badhaasa Guddaa", rarityColor: "text-yellow-300 bg-yellow-500/30 border-yellow-400 font-bold", amount: 215, ability: "Bamboo Wealth", abilityAm: "የቀርከሃ ሀብት", abilityOr: "Qabeenya Baambuu", agility: "99 AG", previewUrl: "/mobs/panda.png", rotClass: "rotate-12 scale-125 z-30", themeColor: "#38BDF8" },
  { id: "character-11", name: "Skeletal Sniper", nameAm: "የአጽም ቀስተኛ", nameOr: "Xiyya-Dhaabaa Lafee", power: "710 CP", rarity: "Curse Mob", rarityAm: "የመርገምት ካራክተር", rarityOr: "Abaarsa", rarityColor: "text-red-400 bg-red-500/20 border-red-500/40", amount: -35, ability: "Piercing Arrow", abilityAm: "የሚወጋ ቀስት", abilityOr: "Xiyya Waraanaa", agility: "65 AG", previewUrl: "/mobs/skeleton.png", rotClass: "-rotate-6 -translate-y-2", themeColor: "#CBD5E1" },
  { id: "character-12", name: "Alpha Timber Wolf", nameAm: "የጫካ ተኩላ መሪ", nameOr: "Mootii Yeeyyii", power: "780 CP", rarity: "Rare", rarityAm: "ብርቅዬ", rarityOr: "Dhabamaa", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 65, ability: "Pack Leader Howl", abilityAm: "የመሪ ጩኸት", abilityOr: "Iyyansa Hoggantichaa", agility: "80 AG", previewUrl: "/mobs/wolf.png", rotClass: "rotate-9 scale-105 z-10", themeColor: "#94A3B8" },
  { id: "character-13", name: "Deep Ocean Squid", nameAm: "የውቅያኖስ ስኩዊድ", nameOr: "Iskuwiidii Garbaa", power: "450 CP", rarity: "Common", rarityAm: "መደበኛ", rarityOr: "Waliigalaa", rarityColor: "text-slate-300 bg-slate-500/20 border-slate-500/40", amount: 25, ability: "Ink Cloud Escape", abilityAm: "የቀለም ደመና ማምለጫ", abilityOr: "Baqa Duumessa Qalamaa", agility: "55 AG", previewUrl: "/mobs/squid.png", rotClass: "-rotate-[10deg] translate-y-1", themeColor: "#3B82F6" },
  { id: "character-14", name: "Mystic Fire Fox", nameAm: "የእሳት ቀበሮ", nameOr: "Waraabessa Abiddaa", power: "860 CP", rarity: "Epic", rarityAm: "ድንቅ (Epic)", rarityOr: "Akkamii (Epic)", rarityColor: "text-purple-400 bg-purple-500/20 border-purple-500/40", amount: 105, ability: "Berry Treasure", abilityAm: "የቤሪ ፍሬ ሀብት", abilityOr: "Qabeenya Beeriitti", agility: "90 AG", previewUrl: "/mobs/fox.png", rotClass: "rotate-6 scale-110 z-10", themeColor: "#FB923C" },
  { id: "character-15", name: "Emerald Master Trader", nameAm: "የኤመራልድ ነጋዴ", nameOr: "Daldalaa Eemeraaldii", power: "690 CP", rarity: "Rare", rarityAm: "ብርቅዬ", rarityOr: "Dhabamaa", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 60, ability: "Emerald Exchange", abilityAm: "የኤመራልድ ልውውጥ", abilityOr: "Jijjiirraa Eemeraaldii", agility: "60 AG", previewUrl: "/mobs/villager.png", rotClass: "-rotate-4 translate-x-1", themeColor: "#10B981" }
];

function localizeArcadeMessage(msg: string, isAmharic: boolean, isOromo?: boolean): string {
  if (isOromo) {
    if (msg.includes("Unlimited Daily Spins")) return "VIP 4+ Hojjechaa jira፦ Naannessuu guyyaa daangaa malee fayyadamaa!";
    if (msg.includes("No Active VIP") || msg.includes("Purchase a VIP")) return "VIPn hojjetu hin jiru፦ Naannessuuf paakeejii VIP bitaa.";
    if (msg.includes("Daily spin limit reached") || msg.includes("Reset at midnight")) return "Daangaan naannessuu har'aa ga'eera. Walakkaa halkanitti haaroma.";
    if (msg.includes("Spins")) {
      return msg
        .replace("Active:", "Hojjechaa jira፦")
        .replace("Daily Spins", "Naannessuu Guyyaa")
        .replace("remaining today", "har'a hafe");
    }
    return msg;
  }
  if (!isAmharic) return msg;
  if (msg.includes("Unlimited Daily Spins")) return "ቪአይፒ 4+ ነቅቷል፦ ያልተገደበ ዕለታዊ ማሽከርከር ይደሰቱ!";
  if (msg.includes("No Active VIP") || msg.includes("Purchase a VIP")) return "ምንም ንቁ ቪአይፒ የለም፦ ለማሽከርከር የቪአይፒ ፓኬጅ ይግዙ።";
  if (msg.includes("Daily spin limit reached") || msg.includes("Reset at midnight")) return "የዛሬው የማሽከርከሪያ ጣሪያ ደርሷል። እኩለ ሌሊት ላይ ይታደሳል።";
  if (msg.includes("Spins")) {
    return msg
      .replace("Active:", "ነቅቷል፦")
      .replace("Daily Spins", "ዕለታዊ ማሽከርከሪያዎች")
      .replace("remaining today", "ዛሬ የቀሩ");
  }
  return msg;
}

/* ================================================================
   SPRITE WALK & IDLE ANIMATION COMPONENT
   ================================================================ */
function SpriteWalkAnimation({ mob, displayWidth = 130 }: { mob: MobData; displayWidth?: number }) {
  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: displayWidth }}>
      <style>{`
        @keyframes voxel-walk {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-10px) rotate(-5deg) scale(1.04); }
          50% { transform: translateY(0px) rotate(0deg) scale(1); }
          75% { transform: translateY(-10px) rotate(5deg) scale(1.04); }
        }
        @keyframes voxel-shadow {
          0%, 100% { transform: scaleX(1); opacity: 0.6; }
          25%, 75% { transform: scaleX(0.75); opacity: 0.3; }
          50% { transform: scaleX(1); opacity: 0.6; }
        }
        @keyframes voxel-aura {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
      <div
        className="absolute inset-0 rounded-full blur-xl pointer-events-none"
        style={{
          backgroundColor: mob.themeColor || "#38BDF8",
          animation: "voxel-aura 2s ease-in-out infinite",
        }}
      />
      <div
        style={{
          animation: "voxel-walk 1.1s ease-in-out infinite",
          transformOrigin: "bottom center",
        }}
        className="relative z-10"
      >
        <img
          src={mob.previewUrl}
          alt={mob.name}
          className="object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
          style={{
            width: displayWidth,
            height: displayWidth,
            imageRendering: "pixelated",
            filter: "drop-shadow(0px 1px 0px #ffda0e) drop-shadow(-1px 0px 0px #ffda0e) drop-shadow(1px 0px 0px #ffda0e) drop-shadow(0px -1px 0px #ffda0e) drop-shadow(0 6px 12px rgba(0,0,0,0.7))",
          }}
        />
      </div>
      <div
        className="w-20 h-3 bg-black/60 rounded-full mt-2 pointer-events-none"
        style={{
          animation: "voxel-shadow 1.1s ease-in-out infinite",
        }}
      />
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
interface ArcadeStatus {
  hasActiveVip: boolean;
  canSpin: boolean;
  isUnlimited: boolean;
  totalDailySpins: number;
  spinsUsedToday: number;
  spinsRemainingToday: number;
  message: string;
  vipTierName: string | null;
}

export default function Games() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { t, isAmharic, isOromo, currency } = useLanguage();

  const [isFullPageGame, setIsFullPageGame] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(9);
  const [isSpinning, setIsSpinning] = useState(false);
  const [modalResult, setModalResult] = useState<MobData | null>(null);
  const [balance, setBalance] = useState<number>(user?.mainBalance ?? 0);
  const [arcadeStatus, setArcadeStatus] = useState<ArcadeStatus | null>(null);

  useEffect(() => {
    if (user?.mainBalance !== undefined) {
      setBalance(user.mainBalance);
    }
  }, [user?.mainBalance]);

  const fetchArcadeStatus = useCallback(() => {
    customFetch<ArcadeStatus>("/api/arcade/status")
      .then((data) => {
        if (data) {
          setArcadeStatus(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load arcade status:", err);
      });
  }, []);

  useEffect(() => {
    fetchArcadeStatus();
  }, [fetchArcadeStatus]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  function playArcadeSound(type: 'tick' | 'win' | 'loss') {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(440 + (Math.random() * 200), ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'win') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'loss') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  }

  function startSpin() {
    if (isSpinning) return;
    if (arcadeStatus && !arcadeStatus.canSpin) {
      toast({
        title: isAmharic ? "የዕለት ማሽከርከሪያ ጣሪያ ደርሷል" : isOromo ? "Daangaan Naannessuu Ga'eera" : "Arcade Limit Reached",
        description: localizeArcadeMessage(arcadeStatus.message, isAmharic, isOromo),
        variant: "destructive",
      });
      return;
    }
    setIsSpinning(true);
    setModalResult(null);
    let curr = selectedIndex;
    let ticks = 0;
    const maxTicks = 25 + Math.floor(Math.random() * 10);
    let delay = 60;
    function step() {
      curr = (curr + 1) % MOBS.length;
      setSelectedIndex(curr);
      playArcadeSound('tick');
      ticks++;
      if (ticks < maxTicks) {
        if (ticks > maxTicks - 8) delay += 45;
        setTimeout(step, delay);
      } else {
        setIsSpinning(false);
        const finalMob = MOBS[curr];
        setModalResult(finalMob);
        playArcadeSound(finalMob.amount >= 0 ? 'win' : 'loss');
        customFetch<{ success: boolean; newBalance: number }>("/api/arcade/claim", {
          method: "POST",
          body: JSON.stringify({ mobId: finalMob.id, mobName: finalMob.name, amount: finalMob.amount }),
        })
          .then((data) => {
            if (data && typeof data.newBalance === "number") {
              setBalance(data.newBalance);
              qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
              qc.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
              qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
              fetchArcadeStatus();
            }
          })
          .catch((err: any) => {
            const errMsg = err?.data?.error || err?.message || (isAmharic ? "ማሽከርከሪያውን ማስኬድ አልተቻለም" : isOromo ? "Naannessuu adeemsisuun hin danda'amne" : "Failed to process arcade spin");
            toast({ title: isAmharic ? "የማሽከርከሪያ ስህተት" : isOromo ? "Dogoggora Naannessuu" : "Spin Claim Error", description: errMsg, variant: "destructive" });
            fetchArcadeStatus();
          });
      }
    }
    step();
  }

  const currentMob = MOBS[selectedIndex];
  const HS = isAmharic ? ({ fontFamily: "'LogaComic', sans-serif" } as const) : ({ fontFamily: "'Plus Jakarta Sans', sans-serif" } as const);
  const HSsm = isAmharic ? ({ fontFamily: "'Noto Sans Ethiopic', sans-serif" } as const) : ({ fontFamily: "'Plus Jakarta Sans', sans-serif" } as const);

  if (isFullPageGame) {
    return (
      <div className="fixed inset-0 bg-[#1A1A1A] text-white flex flex-col overflow-hidden" style={{ zIndex: 30 }}>
        {/* Top bar */}
        <div className="flex items-center justify-between bg-white/5 border-b border-white/10 px-4 py-3 flex-shrink-0">
          <button
            onClick={() => setIsFullPageGame(false)}
            className="flex items-center gap-2 bg-white text-black px-3.5 py-2 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors text-sm font-semibold"
            style={HS}
          >
            <ArrowLeft className="w-4 h-4 text-black" />
            <span>{t("games.back_to_arcade")}</span>
          </button>
          <div className="flex items-center gap-1.5 bg-black/60 px-3.5 py-1.5 rounded-xl border border-yellow-500/30">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-xs sm:text-sm font-bold text-yellow-400" style={HS}>
              {balance.toLocaleString()} {currency}
            </span>
          </div>
        </div>

        {/* Scrollable Game Canvas */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-md mx-auto w-full px-4 py-4 space-y-4">
            {/* Title Header */}
            <div className="text-center pt-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight" style={HS}>
                🎮 {isAmharic ? "የማይንክራፍት ካራክተር መምረጫ" : isOromo ? "Filattuu Kaaraakterii Maayinkiraaftii" : "Minecraft Mob Spinner"}
              </h1>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed" style={HSsm}>
                {isAmharic ? "ካራክተር በማሽከርከር እስከ +215 ብር ያሸንፉ ወይም ወጥመዶችን ያስወግዱ!" : isOromo ? "Kaaraakterii naannessuun hanga +215 Qarshii mo'adhaa ykn kiyyoo irraa fagaadhaa!" : `Spin to select 1 of 15 mobs. Win up to +215 ${currency} or dodge traps!`}
              </p>
            </div>

            {/* VIP Status banner */}
            {arcadeStatus && (
              <div
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 border shadow-sm ${
                  !arcadeStatus.hasActiveVip
                    ? "bg-red-500/15 border-red-500/40 text-red-300"
                    : arcadeStatus.isUnlimited
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                    : arcadeStatus.canSpin
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "bg-red-500/15 border-red-500/40 text-red-300"
                }`}
                style={HSsm}
              >
                {arcadeStatus.isUnlimited ? <Sparkles className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" /> : <ShieldAlert className="w-4 h-4 flex-shrink-0" />}
                <span className="leading-snug">{localizeArcadeMessage(arcadeStatus.message, isAmharic, isOromo)}</span>
              </div>
            )}

            {/* Action Spin Button */}
            <div className="flex justify-center pt-1">
              <Button
                onClick={startSpin}
                disabled={isSpinning || (arcadeStatus ? !arcadeStatus.canSpin : false)}
                className={`w-full py-4 rounded-2xl text-base font-bold shadow-lg transition-all ${
                  isSpinning
                    ? "bg-amber-500 text-black animate-pulse"
                    : arcadeStatus && !arcadeStatus.canSpin
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed border border-white/10"
                    : "bg-primary text-[#1A1A1A] hover:bg-primary/90 shadow-primary/30"
                }`}
                style={HS}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSpinning ? "animate-spin" : ""}`} />
                {isSpinning
                  ? (isAmharic ? "በማሽከርከር ላይ..." : isOromo ? "Naanna'aa jira..." : "Spinning Auto-Picker...")
                  : arcadeStatus && !arcadeStatus.canSpin
                  ? (isAmharic ? "የዕለት ጣሪያ ደርሷል" : isOromo ? "Daangaan Guyyaa Ga'eera" : "Daily Limit Reached")
                  : (isAmharic ? "አሽከርክር እና ምረጥ" : isOromo ? "Naannessi fi Filadhu" : "Start Auto-Picker (Spin)")}
              </Button>
            </div>

            {/* Mob Roster Grid */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider" style={HS}>{t("games.roster_title")}</p>
              <div className="grid grid-cols-5 gap-1.5 bg-black/40 p-2 rounded-2xl border border-white/10">
                {MOBS.map((mob, idx) => (
                  <button
                    key={mob.id}
                    onClick={() => !isSpinning && setSelectedIndex(idx)}
                    className={`relative p-1.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                      idx === selectedIndex ? "ring-2 ring-primary bg-white/10 scale-105 z-10" : "opacity-75 hover:opacity-100 hover:bg-white/5"
                    }`}
                  >
                    <img src={mob.previewUrl} alt={isAmharic ? mob.nameAm : isOromo ? mob.nameOr : mob.name} className="w-8 h-8 sm:w-9 sm:h-9 object-contain mb-0.5" />
                    <span className={`text-[10px] font-bold ${mob.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={HSsm}>
                      {mob.amount >= 0 ? `+${mob.amount}` : mob.amount}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Mob Highlight Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center shadow-xl">
              <div className="w-32 h-32 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                <SpriteWalkAnimation mob={currentMob} displayWidth={110} />
              </div>
              <div className="flex-1 w-full space-y-2.5 text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="font-bold text-white text-lg" style={HS}>
                    {isAmharic ? currentMob.nameAm : isOromo ? currentMob.nameOr : currentMob.name}
                  </h3>
                  <Badge className={`${currentMob.rarityColor} text-xs font-semibold px-2 py-0.5`} style={HSsm}>
                    {isAmharic ? currentMob.rarityAm : isOromo ? currentMob.rarityOr : currentMob.rarity}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 text-[11px] block" style={HSsm}>{t("games.power_rating")}</span>
                    <span className="font-bold text-yellow-400 text-sm" style={HSsm}>{currentMob.power}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block" style={HSsm}>{t("games.agility_stat")}</span>
                    <span className="font-bold text-cyan-400 text-sm" style={HSsm}>{currentMob.agility}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block" style={HSsm}>{t("games.birr_potential")}</span>
                    <span className={`font-bold text-sm ${currentMob.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={HSsm}>
                      {currentMob.amount >= 0 ? `+${currentMob.amount} ${currency}` : `${currentMob.amount} ${currency}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block" style={HSsm}>{t("games.special_skill")}</span>
                    <span className="font-semibold text-gray-200 text-xs line-clamp-1" style={HSsm}>
                      {isAmharic ? currentMob.abilityAm : isOromo ? currentMob.abilityOr : currentMob.ability}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-16 flex-shrink-0" />
          </div>
        </div>

        {/* Spin Result Modal */}
        {modalResult && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] border-2 border-primary rounded-3xl p-6 text-center max-w-sm w-full space-y-4 shadow-2xl">
              <div className="text-4xl">{modalResult.amount >= 200 ? "💎" : modalResult.amount >= 0 ? "🎉" : "💣"}</div>
              <h3 className={`text-xl font-bold ${modalResult.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={HS}>
                {modalResult.amount >= 200 ? t("games.jackpot") : modalResult.amount >= 0 ? t("games.you_won") : t("games.penalty")}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed" style={HSsm}>
                {t("games.landed_on")} <strong className="text-white font-semibold">{isAmharic ? modalResult.nameAm : isOromo ? modalResult.nameOr : modalResult.name}</strong> ({isAmharic ? modalResult.abilityAm : isOromo ? modalResult.abilityOr : modalResult.ability})
              </p>
              <div className={`text-2xl font-bold ${modalResult.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={HS}>
                {modalResult.amount >= 0 ? `+${modalResult.amount} ${currency}` : `${modalResult.amount} ${currency}`}
              </div>
              <Button onClick={() => setModalResult(null)} className="w-full bg-primary text-[#1A1A1A] font-bold py-3 rounded-xl shadow-md" style={HS}>
                {t("games.continue_playing")}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-8 space-y-5 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2B7A4B] leading-tight" style={HS}>
            {t("games.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5" style={HSsm}>
            {t("games.subtitle")}
          </p>
        </div>
        <div className="bg-card px-3.5 py-2 rounded-2xl border border-border shadow-sm flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-foreground" style={HS}>
            {balance.toLocaleString()} {currency}
          </span>
        </div>
      </div>

      {/* Featured Game Card */}
      <div id="tut-games-spinner" className="relative flex flex-col space-y-3">
        <div className="relative w-full h-56 rounded-3xl overflow-hidden border border-border shadow-lg">
          <img src="/game-thumbnail.jpg" alt={t("games.featured")} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-4 flex flex-col justify-end">
            <h2 className="text-xl font-bold text-white mb-0.5" style={HS}>
              {t("games.featured")}
            </h2>
            <p className="text-gray-200 text-xs leading-relaxed line-clamp-2" style={HSsm}>
              {t("games.featured_desc")}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-semibold" style={HSsm}>
              {isAmharic ? `ጃክፖት፦ +215 ${currency}` : isOromo ? `Badhaasa Guddaa፦ +215 ${currency}` : `Jackpot: +215 ${currency}`}
            </span>
            <span className="px-2.5 py-1 bg-red-500/15 text-red-600 dark:text-red-400 rounded-full text-[11px] font-semibold" style={HSsm}>
              {isAmharic ? "የቅጣት ወጥመዶች ተካትተዋል" : isOromo ? "Kiyyoowwan Balaa Qabata" : "Danger Traps Included"}
            </span>
            {arcadeStatus && (
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${!arcadeStatus.hasActiveVip ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" : arcadeStatus.isUnlimited ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40" : arcadeStatus.canSpin ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"}`} style={HSsm}>
                {localizeArcadeMessage(arcadeStatus.message, isAmharic, isOromo)}
              </span>
            )}
          </div>
          <Button
            onClick={() => setIsFullPageGame(true)}
            className="w-full bg-primary text-[#1A1A1A] hover:bg-primary/90 font-bold text-base py-4 rounded-2xl shadow-md shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
            style={HS}
          >
            <Play className="w-4 h-4 fill-current mr-2" />
            {t("games.play_now")}
          </Button>
        </div>
      </div>

      {/* Upcoming Games Section */}
      <div className="space-y-3 pt-2">
        <p className="text-lg font-bold text-foreground" style={HS}>
          {isAmharic ? "በቅርቡ የሚመጡ ጨዋታዎች" : isOromo ? "Taphawwan Dhiyootti Dhufan" : "Upcoming Arcade Games"}
        </p>
        <div className="relative flex flex-col space-y-3 bg-card p-3.5 rounded-3xl border border-border shadow-sm">
          <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-border">
            <video src="/Gamevid.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
            <div className="absolute top-2.5 right-2.5 bg-amber-500/90 backdrop-blur-md text-black px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm" style={HS}>
              🔒 {isAmharic ? "በቅርቡ" : isOromo ? "DHIYOOTTI" : "COMING SOON"}
            </div>
            <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-xl text-[10px] font-bold text-white" style={HS}>
              🎬 {isAmharic ? "አኒሜሽን ቅድመ እይታ" : isOromo ? "Agarsiisa Socho'aa" : "Animated Preview"}
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-0.5" style={HS}>
              {isAmharic ? "የብር ፈንጂ ፍለጋ" : isOromo ? "Sakatta'aa Dhoohoo Qarshii" : "Birr Mine Sweeper"}
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed" style={HSsm}>
              {isAmharic ? "የተደበቁ ኤመራልድ ሳጥኖችን ያግኙ እና ቲኤንቲ ፈንጂዎችን ያስወግዱ! ከፍተኛ ሽልማት!" : isOromo ? "Saanduqa Eemeraaldii dhokate barbaadaa dhoohoo TNT jalaa miliqaa! Badhaasa guddaa!" : "Uncover hidden emerald tiles while dodging TNT mines. High risk multipliers!"}
            </p>
          </div>
          <Button disabled variant="outline" className="w-full text-muted-foreground border-border bg-muted/40 py-3 rounded-xl text-xs font-semibold" style={HS}>
            {isAmharic ? "በቅርቡ ይጠብቁ" : isOromo ? "Dhiyootti Eegaa" : "Coming Soon"}
          </Button>
        </div>
      </div>
    </div>
  );
}
