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
  power: string;
  rarity: string;
  rarityAm: string;
  rarityColor: string;
  amount: number;
  ability: string;
  abilityAm: string;
  agility: string;
  previewUrl: string;
  rotClass: string;
  themeColor: string;
}

const MOBS: MobData[] = [
  { id: "character-1", name: "Lucky Pixel Cat", nameAm: "ዕድለኛ ድመት", power: "720 CP", rarity: "Rare", rarityAm: "ብርቅዬ", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 45, ability: "Meow Lucky Charm", abilityAm: "የዕድል ውበት", agility: "60 AG", previewUrl: "/mobs/cat.png", rotClass: "-rotate-6 translate-y-1", themeColor: "#60A5FA" },
  { id: "character-2", name: "Venom Shadow Spider", nameAm: "መርዛማ ሸረሪት", power: "680 CP", rarity: "Curse Mob", rarityAm: "የመርገምት ካራክተር", rarityColor: "text-red-400 bg-red-500/20 border-red-500/40", amount: -25, ability: "Poison Web Trap", abilityAm: "የመርዝ ድር ወጥመድ", agility: "88 AG", previewUrl: "/mobs/spider.png", rotClass: "rotate-6 -translate-y-2 z-10", themeColor: "#EF4444" },
  { id: "character-3", name: "Golden Dairy Cow", nameAm: "ወርቃማ ላም", power: "500 CP", rarity: "Common", rarityAm: "መደበኛ", rarityColor: "text-slate-300 bg-slate-500/20 border-slate-500/40", amount: 30, ability: "Milk Yield Boost", abilityAm: "የወተት ምርት መጨመሪያ", agility: "40 AG", previewUrl: "/mobs/cow.png", rotClass: "-rotate-12 translate-x-1", themeColor: "#94A3B8" },
  { id: "character-4", name: "Explosive Creeper", nameAm: "ፈንጂ ክሪፐር", power: "990 CP", rarity: "Danger Mob", rarityAm: "አደገኛ ካራክተር", rarityColor: "text-red-400 bg-red-600/30 border-red-500", amount: -50, ability: "TNT Blast Penalty", abilityAm: "የቲኤንቲ ፍንዳታ ቅጣት", agility: "70 AG", previewUrl: "/mobs/creeper.png", rotClass: "rotate-12 scale-110 z-20", themeColor: "#22C55E" },
  { id: "character-5", name: "Void Enderman", nameAm: "የጠፈር ኤንደርማን", power: "890 CP", rarity: "Epic", rarityAm: "ድንቅ (Epic)", rarityColor: "text-purple-400 bg-purple-500/20 border-purple-500/40", amount: 120, ability: "Teleport Stash", abilityAm: "የቴሌፖርት ድብቅ ሳጥን", agility: "95 AG", previewUrl: "/mobs/enderman.png", rotClass: "-rotate-3 -translate-y-1", themeColor: "#C084FC" },
  { id: "character-6", name: "Arch Evoker", nameAm: "አርች ኢቮከር", power: "950 CP", rarity: "Dark Boss", rarityAm: "ጨለማ ቦስ", rarityColor: "text-rose-400 bg-rose-900/40 border-rose-500", amount: -65, ability: "Vex Soul Drain", abilityAm: "የመንፈስ ኃይል መምጠጫ", agility: "75 AG", previewUrl: "/mobs/evoker.png", rotClass: "rotate-8 scale-105 z-10", themeColor: "#F43F5E" },
  { id: "character-7", name: "Iron Golem Sentinel", nameAm: "የብረት ጎለም ዘበኛ", power: "920 CP", rarity: "Epic", rarityAm: "ድንቅ (Epic)", rarityColor: "text-purple-400 bg-purple-500/20 border-purple-500/40", amount: 90, ability: "Iron Shield Guard", abilityAm: "የብረት ጋሻ መከላከያ", agility: "50 AG", previewUrl: "/mobs/golem.png", rotClass: "-rotate-8 scale-110 z-10", themeColor: "#E2E8F0" },
  { id: "character-8", name: "Phantom Skeleton Horse", nameAm: "የመንፈስ አጽም ፈረስ", power: "810 CP", rarity: "Rare", rarityAm: "ብርቅዬ", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 75, ability: "Soul Velocity", abilityAm: "የመንፈስ ፍጥነት", agility: "92 AG", previewUrl: "/mobs/horse.png", rotClass: "rotate-4 translate-y-2", themeColor: "#38BDF8" },
  { id: "character-9", name: "Jungle Ocelot", nameAm: "የጫካ ነብር (ኦሰሎት)", power: "640 CP", rarity: "Rare", rarityAm: "ብርቅዬ", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 55, ability: "Pounce Hunting", abilityAm: "የፈጣን ዝላይ አደን", agility: "85 AG", previewUrl: "/mobs/ocelot.png", rotClass: "-rotate-[15deg] translate-x-2 z-20", themeColor: "#FACC15" },
  { id: "character-10", name: "Diamond Panda King", nameAm: "የአልማዝ ፓንዳ ንጉስ", power: "1000 CP", rarity: "Mythic Jackpot", rarityAm: "የአፈ ታሪክ ጃክፖት", rarityColor: "text-yellow-300 bg-yellow-500/30 border-yellow-400 font-bold", amount: 215, ability: "Bamboo Wealth", abilityAm: "የቀርከሃ ሀብት", agility: "99 AG", previewUrl: "/mobs/panda.png", rotClass: "rotate-12 scale-125 z-30", themeColor: "#38BDF8" },
  { id: "character-11", name: "Skeletal Sniper", nameAm: "የአጽም ቀስተኛ", power: "710 CP", rarity: "Curse Mob", rarityAm: "የመርገምት ካራክተር", rarityColor: "text-red-400 bg-red-500/20 border-red-500/40", amount: -35, ability: "Piercing Arrow", abilityAm: "የሚወጋ ቀስት", agility: "65 AG", previewUrl: "/mobs/skeleton.png", rotClass: "-rotate-6 -translate-y-2", themeColor: "#CBD5E1" },
  { id: "character-12", name: "Alpha Timber Wolf", nameAm: "የጫካ ተኩላ መሪ", power: "780 CP", rarity: "Rare", rarityAm: "ብርቅዬ", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 65, ability: "Pack Leader Howl", abilityAm: "የመሪ ጩኸት", agility: "80 AG", previewUrl: "/mobs/wolf.png", rotClass: "rotate-9 scale-105 z-10", themeColor: "#94A3B8" },
  { id: "character-13", name: "Deep Ocean Squid", nameAm: "የውቅያኖስ ስኩዊድ", power: "450 CP", rarity: "Common", rarityAm: "መደበኛ", rarityColor: "text-slate-300 bg-slate-500/20 border-slate-500/40", amount: 25, ability: "Ink Cloud Escape", abilityAm: "የቀለም ደመና ማምለጫ", agility: "55 AG", previewUrl: "/mobs/squid.png", rotClass: "-rotate-[10deg] translate-y-1", themeColor: "#3B82F6" },
  { id: "character-14", name: "Mystic Fire Fox", nameAm: "የእሳት ቀበሮ", power: "860 CP", rarity: "Epic", rarityAm: "ድንቅ (Epic)", rarityColor: "text-purple-400 bg-purple-500/20 border-purple-500/40", amount: 105, ability: "Berry Treasure", abilityAm: "የቤሪ ፍሬ ሀብት", agility: "90 AG", previewUrl: "/mobs/fox.png", rotClass: "rotate-6 scale-110 z-10", themeColor: "#FB923C" },
  { id: "character-15", name: "Emerald Master Trader", nameAm: "የኤመራልድ ነጋዴ", power: "690 CP", rarity: "Rare", rarityAm: "ብርቅዬ", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 60, ability: "Emerald Exchange", abilityAm: "የኤመራልድ ልውውጥ", agility: "60 AG", previewUrl: "/mobs/villager.png", rotClass: "-rotate-4 translate-x-1", themeColor: "#10B981" }
];

function localizeArcadeMessage(msg: string, isAmharic: boolean): string {
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
  const { t, isAmharic } = useLanguage();

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
        title: isAmharic ? "የዕለት ማሽከርከሪያ ጣሪያ ደርሷል" : "Arcade Limit Reached",
        description: localizeArcadeMessage(arcadeStatus.message, isAmharic),
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
            const errMsg = err?.data?.error || err?.message || (isAmharic ? "ማሽከርከሪያውን ማስኬድ አልተቻለም" : "Failed to process arcade spin");
            toast({ title: isAmharic ? "የማሽከርከሪያ ስህተት" : "Spin Claim Error", description: errMsg, variant: "destructive" });
            fetchArcadeStatus();
          });
      }
    }
    step();
  }

  const currentMob = MOBS[selectedIndex];
  const HS = isAmharic ? ({ fontFamily: "'LogaComic', sans-serif" } as const) : ({ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" } as const);
  const HSsm = isAmharic ? ({ fontFamily: "'Noto Sans Ethiopic', sans-serif" } as const) : ({ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" } as const);

  if (isFullPageGame) {
    return (
      <div className="fixed inset-0 bg-[#1A1A1A] text-white flex flex-col overflow-hidden" style={{ zIndex: 30 }}>
        <div className="flex items-center justify-between bg-white/5 border-b border-white/10 px-4 py-3 flex-shrink-0">
          <button onClick={() => setIsFullPageGame(false)} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors" style={HS}>
            <ArrowLeft className="w-5 h-5 text-black" />
            <span className="text-base font-semibold text-black">{isAmharic ? "ወደ አርኬድ ተመለስ" : "Back to Arcade"}</span>
          </button>
          <div className="flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-xl border border-yellow-500/30">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400" style={HS}>
              {balance.toLocaleString()} {isAmharic ? "ብር" : "ETB"}
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-lg mx-auto w-full px-4 py-4 space-y-5">
            <div className="text-center">
              <h1 className="text-[26px] font-bold text-white mb-1" style={HS}>
                🎮 {isAmharic ? "የማይንክራፍት ካራክተር መምረጫ" : "MINECRAFT MOB SPINNER"}
              </h1>
              <p className="text-xs text-gray-400" style={HSsm}>
                {isAmharic ? "ካራክተር በማሽከርከር እስከ +215 ብር ያሸንፉ ወይም ወጥመዶችን ያስወግዱ!" : "Spin to select 1 of 15 mobs. Win up to +215 ETB or dodge traps!"}
              </p>
            </div>
            {arcadeStatus && (
              <div className={`px-4 py-2.5 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 border shadow-lg ${!arcadeStatus.hasActiveVip ? "bg-red-500/15 border-red-500/40 text-red-300" : arcadeStatus.isUnlimited ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold" : arcadeStatus.canSpin ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" : "bg-red-500/15 border-red-500/40 text-red-300"}`} style={HSsm}>
                {arcadeStatus.isUnlimited ? <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> : <ShieldAlert className="w-4 h-4" />}
                <span>{localizeArcadeMessage(arcadeStatus.message, isAmharic)}</span>
              </div>
            )}
            <div className="flex justify-center">
              <Button onClick={startSpin} disabled={isSpinning || (arcadeStatus ? !arcadeStatus.canSpin : false)} className={`w-full max-w-sm py-6 rounded-2xl text-lg font-bold shadow-xl transition-all ${isSpinning ? "bg-amber-500 text-black animate-pulse" : arcadeStatus && !arcadeStatus.canSpin ? "bg-gray-700 text-gray-400 cursor-not-allowed border border-white/10" : "bg-primary text-[#1A1A1A] hover:bg-primary/90 shadow-primary/30"}`} style={{ ...HS, letterSpacing: isAmharic ? "0" : "0.08em" }}>
                <RefreshCw className={`w-5 h-5 mr-2 ${isSpinning ? "animate-spin" : ""}`} />
                {isSpinning ? (isAmharic ? "በማሽከርከር ላይ..." : "SPINNING AUTO-PICKER...") : arcadeStatus && !arcadeStatus.canSpin ? (isAmharic ? "የዕለት ጣሪያ ደርሷል" : "DAILY LIMIT REACHED") : (isAmharic ? "አሽከርክር እና ምረጥ" : "START AUTO-PICKER (SPIN)")}
              </Button>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2 uppercase" style={HS}>{isAmharic ? "የተመረጡ 15 ካራክተሮች" : "Selected Mob Roster (15 Mobs)"}</p>
              <div className="grid grid-cols-5 gap-2">
                {MOBS.map((mob, idx) => (
                  <button key={mob.id} onClick={() => !isSpinning && setSelectedIndex(idx)} className={`relative p-2 rounded-2xl flex flex-col items-center justify-center transition-all ${idx === selectedIndex ? "ring-2 ring-primary/60 scale-110 z-10" : "opacity-75 hover:opacity-100"}`}>
                    <img src={mob.previewUrl} alt={isAmharic ? mob.nameAm : mob.name} className="w-10 h-10 object-contain mb-1" />
                    <span className={`text-[11px] font-semibold ${mob.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={HSsm}>{mob.amount >= 0 ? `+${mob.amount}` : mob.amount}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col sm:flex-row gap-5 items-center shadow-2xl">
              <div className="w-40 h-40 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                <SpriteWalkAnimation mob={currentMob} displayWidth={120} />
              </div>
              <div className="flex-1 w-full space-y-3 text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="font-bold text-white text-xl" style={HS}>{isAmharic ? currentMob.nameAm : currentMob.name}</h3>
                  <Badge className={currentMob.rarityColor} style={HSsm}>{isAmharic ? currentMob.rarityAm : currentMob.rarity}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs block" style={HSsm}>{isAmharic ? "የኃይል ደረጃ፦" : "Power Rating:"}</span>
                    <span className="font-semibold text-yellow-400 text-base" style={HSsm}>{currentMob.power}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block" style={HSsm}>{isAmharic ? "ፍጥነት፦" : "Agility Stat:"}</span>
                    <span className="font-semibold text-cyan-400 text-base" style={HSsm}>{currentMob.agility}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block" style={HSsm}>{isAmharic ? "የብር መጠን፦" : "Birr Potential:"}</span>
                    <span className={`font-bold text-base ${currentMob.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={HSsm}>{currentMob.amount >= 0 ? `+${currentMob.amount} ${isAmharic ? "ብር" : "ETB"}` : `${currentMob.amount} ${isAmharic ? "ብር" : "ETB"}`}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block" style={HSsm}>{isAmharic ? "ልዩ ችሎታ፦" : "Special Skill:"}</span>
                    <span className="font-semibold text-gray-200 text-sm" style={HSsm}>{isAmharic ? currentMob.abilityAm : currentMob.ability}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-20 flex-shrink-0" />
          </div>
        </div>
        {modalResult && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] border-2 border-primary rounded-3xl p-6 text-center max-w-sm w-full space-y-4 shadow-2xl">
              <div className="text-5xl">{modalResult.amount >= 200 ? "💎" : modalResult.amount >= 0 ? "🎉" : "💣"}</div>
              <h3 className={`text-2xl font-bold ${modalResult.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={HS}>
                {modalResult.amount >= 200 ? (isAmharic ? "ትልቅ ሽልማት (JACKPOT)!" : "JACKPOT REWARD!") : modalResult.amount >= 0 ? (isAmharic ? "ብር አሸንፈዋል!" : "YOU WON BIRR!") : (isAmharic ? "የቅጣት ወጥመድ!" : "PENALTY TRAP!")}
              </h3>
              <p className="text-sm text-gray-300" style={HSsm}>{isAmharic ? "ያረፈበት ካራክተር፦ " : "Landed on "}<strong className="text-white">{isAmharic ? modalResult.nameAm : modalResult.name}</strong> ({isAmharic ? modalResult.abilityAm : modalResult.ability})</p>
              <div className={`text-3xl font-bold ${modalResult.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={HS}>{modalResult.amount >= 0 ? `+${modalResult.amount} ${isAmharic ? "ብር" : "ETB"}` : `${modalResult.amount} ${isAmharic ? "ብር" : "ETB"}`}</div>
              <Button onClick={() => setModalResult(null)} className="w-full bg-primary text-[#1A1A1A] font-semibold py-3 rounded-xl" style={{ ...HS, letterSpacing: isAmharic ? "0" : "0.08em" }}>{isAmharic ? "መጫወቱን ይቀጥሉ" : "CONTINUE PLAYING"}</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto md:max-w-none">
      <div className="flex items-center justify-between px-2 pt-2">
        <div>
          <h1 className="text-[28px] text-[#2B7A4B] font-bold" style={{ ...HS, letterSpacing: isAmharic ? "0" : "0.08em" }}>{isAmharic ? "ናኦሚ አርኬድ" : "NAOMI ARCADE"}</h1>
          <p className="text-gray-400 text-[18px]" style={HSsm}>{isAmharic ? "ጨዋታዎችን ይጫወቱ እና የብር ሽልማት ያግኙ" : "Play games & earn Birr rewards"}</p>
        </div>
        <div className="bg-[#1A1A1A] px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold text-white" style={HS}>{balance.toLocaleString()} {isAmharic ? "ብር" : "ETB"}</span>
        </div>
      </div>
      <div className="relative flex flex-col space-y-4">
        <div className="relative w-full h-64 rounded-3xl overflow-hidden border border-border shadow-lg">
          <img src="/game-thumbnail.jpg" alt={isAmharic ? "የማይንክራፍት ካራክተር መምረጫ" : "Minecraft Mob Spinner"} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 flex flex-col justify-end">
            <h2 className="text-[26px] font-bold text-white mb-1" style={HS}>{isAmharic ? "የማይንክራፍት ካራክተር መምረጫ" : "Minecraft Mob Spinner"}</h2>
            <p className="text-gray-200 text-xs leading-snug" style={HSsm}>{isAmharic ? "ካራክተር በማሽከርከር እስከ 215 ብር ፈጣን የገንዘብ ሽልማት ያሸንፉ! በየደረጃው የተመደበ ዕለታዊ ማሽከርከሪያ ይኖርዎታል።" : "Spin the auto-picker to randomly land on 1 of 15 mobs. Win up to +215 ETB with Diamond Panda or dodge Creeper TNT traps! Tiered daily spins per VIP level (VIP 4+ Unlimited)."}</p>
          </div>
        </div>
        <div className="space-y-4 pt-1">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold" style={HSsm}>{isAmharic ? "ጃክፖት፦ +215 ብር" : "Jackpot: +215 ETB"}</span>
            <span className="px-3 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-xs font-semibold" style={HSsm}>{isAmharic ? "የቅጣት ወጥመዶች ተካትተዋል" : "Danger Traps Included"}</span>
            {arcadeStatus && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${!arcadeStatus.hasActiveVip ? "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30" : arcadeStatus.isUnlimited ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40" : arcadeStatus.canSpin ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30"}`} style={HSsm}>{localizeArcadeMessage(arcadeStatus.message, isAmharic)}</span>
            )}
          </div>
          <div>
            <Button onClick={() => setIsFullPageGame(true)} className="w-full bg-primary text-[#1A1A1A] hover:bg-primary/90 font-bold text-lg py-6 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ ...HS, letterSpacing: isAmharic ? "0" : "0.08em" }}>
              <Play className="w-5 h-5 fill-current mr-2" />
              {isAmharic ? "ጨዋታውን ይጀምሩ" : "START GAME"}
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-4 pt-2">
        <p className="text-[22px] text-muted-foreground font-semibold" style={HS}>{isAmharic ? "በቅርቡ የሚመጡ ጨዋታዎች" : "Upcoming Arcade Games"}</p>
        <div className="relative flex flex-col space-y-3">
          <div className="relative w-full h-48 rounded-3xl overflow-hidden border border-border shadow-md">
            <video src="/Gamevid.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-md text-black px-3 py-1 rounded-full text-xs font-extrabold shadow-lg" style={HS}>🔒 {isAmharic ? "በቅርቡ" : "COMING SOON"}</div>
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white" style={HS}>🎬 {isAmharic ? "አኒሜሽን ቅድመ እይታ" : "Animated Preview"}</div>
          </div>
          <div>
            <h3 className="text-[22px] font-bold text-foreground mb-1" style={HS}>{isAmharic ? "የብር ፈንጂ ፍለጋ" : "Birr Mine Sweeper"}</h3>
            <p className="text-muted-foreground text-sm" style={HSsm}>{isAmharic ? "የተደበቁ ኤመራልድ ሳጥኖችን ያግኙ እና ቲኤንቲ ፈንጂዎችን ያስወግዱ! ከፍተኛ ሽልማት!" : "Uncover hidden emerald tiles while dodging TNT mines. High risk multipliers!"}</p>
          </div>
          <Button disabled variant="outline" className="w-full text-muted-foreground border-border bg-muted/40 py-5 rounded-2xl" style={HS}>{isAmharic ? "በቅርቡ ይጠብቁ" : "Coming Soon"}</Button>
        </div>
      </div>
    </div>
  );
}
