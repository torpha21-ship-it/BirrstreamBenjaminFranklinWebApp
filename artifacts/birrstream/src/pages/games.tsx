import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { Coins, RefreshCw, ArrowLeft, Play, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetDashboardSummaryQueryKey, getGetUserProfileQueryKey, getGetMeQueryKey, customFetch } from "@workspace/api-client-react";
import { withApiBaseUrl } from "@/lib/api-base-url";

/* ================================================================
   SPRITE DATA — Each character's sprite sheet dimensions & frames.
   This is the SAME data from the original style.css, ported to JS
   so we can drive the walk animation via requestAnimationFrame.
   ================================================================ */
interface SpriteData {
  imageUrl: string;      // sprite sheet URL
  columns: number;       // columns in the sheet
  sheetWidth: number;    // original sheet width px
  sheetHeight: number;   // original sheet height px
  totalFrames: number;   // total frames in the sheet
}

interface MobData {
  id: string;
  name: string;
  power: string;
  rarity: string;
  rarityColor: string;
  amount: number;
  ability: string;
  agility: string;
  previewUrl: string;
  rotClass: string;
  sprite: SpriteData;
}

const MOBS: MobData[] = [
  { id: "character-1", name: "Lucky Pixel Cat", power: "720 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 45, ability: "Meow Lucky Charm", agility: "60 AG", previewUrl: "https://assets.codepen.io/36869/cat-preview.webp", rotClass: "-rotate-6 translate-y-1",
    sprite: { imageUrl: "https://assets.codepen.io/36869/cat.webp", columns: 5, sheetWidth: 2980, sheetHeight: 5364, totalFrames: 42 } },
  { id: "character-2", name: "Venom Shadow Spider", power: "680 CP", rarity: "Curse Mob", rarityColor: "text-red-400 bg-red-500/20 border-red-500/40", amount: -25, ability: "Poison Web Trap", agility: "88 AG", previewUrl: "https://assets.codepen.io/36869/spider-preview.webp", rotClass: "rotate-6 -translate-y-2 z-10",
    sprite: { imageUrl: "https://assets.codepen.io/36869/spider.webp", columns: 5, sheetWidth: 2980, sheetHeight: 3576, totalFrames: 28 } },
  { id: "character-3", name: "Golden Dairy Cow", power: "500 CP", rarity: "Common", rarityColor: "text-slate-300 bg-slate-500/20 border-slate-500/40", amount: 30, ability: "Milk Yield Boost", agility: "40 AG", previewUrl: "https://assets.codepen.io/36869/cow-preview.webp", rotClass: "-rotate-12 translate-x-1",
    sprite: { imageUrl: "https://assets.codepen.io/36869/cow.webp", columns: 5, sheetWidth: 2980, sheetHeight: 7152, totalFrames: 60 } },
  { id: "character-4", name: "Explosive Creeper", power: "990 CP", rarity: "Danger Mob", rarityColor: "text-red-400 bg-red-600/30 border-red-500", amount: -50, ability: "TNT Blast Penalty", agility: "70 AG", previewUrl: "https://assets.codepen.io/36869/creeper-preview.webp", rotClass: "rotate-12 scale-110 z-20",
    sprite: { imageUrl: "https://assets.codepen.io/36869/creeper.webp", columns: 5, sheetWidth: 2980, sheetHeight: 6556, totalFrames: 55 } },
  { id: "character-5", name: "Void Enderman", power: "890 CP", rarity: "Epic", rarityColor: "text-purple-400 bg-purple-500/20 border-purple-500/40", amount: 120, ability: "Teleport Stash", agility: "95 AG", previewUrl: "https://assets.codepen.io/36869/enderman-preview.webp", rotClass: "-rotate-3 -translate-y-1",
    sprite: { imageUrl: "https://assets.codepen.io/36869/enderman.webp", columns: 5, sheetWidth: 2980, sheetHeight: 6556, totalFrames: 55 } },
  { id: "character-6", name: "Arch Evoker", power: "950 CP", rarity: "Dark Boss", rarityColor: "text-rose-400 bg-rose-900/40 border-rose-500", amount: -65, ability: "Vex Soul Drain", agility: "75 AG", previewUrl: "https://assets.codepen.io/36869/evoker-preview.webp", rotClass: "rotate-8 scale-105 z-10",
    sprite: { imageUrl: "https://assets.codepen.io/36869/evoker.webp", columns: 5, sheetWidth: 2980, sheetHeight: 11920, totalFrames: 99 } },
  { id: "character-7", name: "Iron Golem Sentinel", power: "920 CP", rarity: "Epic", rarityColor: "text-purple-400 bg-purple-500/20 border-purple-500/40", amount: 90, ability: "Iron Shield Guard", agility: "50 AG", previewUrl: "https://assets.codepen.io/36869/golem-preview.webp", rotClass: "-rotate-8 scale-110 z-10",
    sprite: { imageUrl: "https://assets.codepen.io/36869/golem.webp", columns: 5, sheetWidth: 2980, sheetHeight: 8940, totalFrames: 72 } },
  { id: "character-8", name: "Phantom Skeleton Horse", power: "810 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 75, ability: "Soul Velocity", agility: "92 AG", previewUrl: "https://assets.codepen.io/36869/horse-preview.webp", rotClass: "rotate-4 translate-y-2",
    sprite: { imageUrl: "https://assets.codepen.io/36869/horse.webp", columns: 5, sheetWidth: 2980, sheetHeight: 5960, totalFrames: 47 } },
  { id: "character-9", name: "Jungle Ocelot", power: "640 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 55, ability: "Pounce Hunting", agility: "85 AG", previewUrl: "https://assets.codepen.io/36869/ocelot-preview.webp", rotClass: "-rotate-[15deg] translate-x-2 z-20",
    sprite: { imageUrl: "https://assets.codepen.io/36869/ocelot.webp", columns: 5, sheetWidth: 2980, sheetHeight: 4768, totalFrames: 37 } },
  { id: "character-10", name: "Diamond Panda King", power: "1000 CP", rarity: "Mythic Jackpot", rarityColor: "text-yellow-300 bg-yellow-500/30 border-yellow-400 font-bold", amount: 215, ability: "Bamboo Wealth", agility: "99 AG", previewUrl: "https://assets.codepen.io/36869/panda-preview.webp", rotClass: "rotate-12 scale-125 z-30",
    sprite: { imageUrl: "https://assets.codepen.io/36869/panda.webp", columns: 5, sheetWidth: 2980, sheetHeight: 10728, totalFrames: 88 } },
  { id: "character-11", name: "Skeletal Sniper", power: "710 CP", rarity: "Curse Mob", rarityColor: "text-red-400 bg-red-500/20 border-red-500/40", amount: -35, ability: "Piercing Arrow", agility: "65 AG", previewUrl: "https://assets.codepen.io/36869/skeleton-preview.webp", rotClass: "-rotate-6 -translate-y-2",
    sprite: { imageUrl: "https://assets.codepen.io/36869/skeleton.webp", columns: 5, sheetWidth: 2980, sheetHeight: 7748, totalFrames: 65 } },
  { id: "character-12", name: "Alpha Timber Wolf", power: "780 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 65, ability: "Pack Leader Howl", agility: "80 AG", previewUrl: "https://assets.codepen.io/36869/wolf-preview.webp", rotClass: "rotate-9 scale-105 z-10",
    sprite: { imageUrl: "https://assets.codepen.io/36869/wolf.webp", columns: 5, sheetWidth: 2980, sheetHeight: 7152, totalFrames: 58 } },
  { id: "character-13", name: "Deep Ocean Squid", power: "450 CP", rarity: "Common", rarityColor: "text-slate-300 bg-slate-500/20 border-slate-500/40", amount: 25, ability: "Ink Cloud Escape", agility: "55 AG", previewUrl: "https://assets.codepen.io/36869/squid-preview.png", rotClass: "-rotate-[10deg] translate-y-1",
    sprite: { imageUrl: "https://assets.codepen.io/36869/squid.webp", columns: 5, sheetWidth: 2980, sheetHeight: 12516, totalFrames: 104 } },
  { id: "character-14", name: "Mystic Fire Fox", power: "860 CP", rarity: "Epic", rarityColor: "text-purple-400 bg-purple-500/20 border-purple-500/40", amount: 105, ability: "Berry Treasure", agility: "90 AG", previewUrl: "https://assets.codepen.io/36869/fox-preview.webp", rotClass: "rotate-6 scale-110 z-10",
    sprite: { imageUrl: "https://assets.codepen.io/36869/fox.webp", columns: 5, sheetWidth: 2980, sheetHeight: 8344, totalFrames: 69 } },
  { id: "character-15", name: "Emerald Master Trader", power: "690 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 60, ability: "Emerald Exchange", agility: "60 AG", previewUrl: "https://assets.codepen.io/36869/villager-preview.webp", rotClass: "-rotate-4 translate-x-1",
    sprite: { imageUrl: "https://assets.codepen.io/36869/villager.webp", columns: 5, sheetWidth: 2980, sheetHeight: 4768, totalFrames: 37 } }
];

/* ================================================================
   SPRITE WALK ANIMATION COMPONENT (Exact 48 FPS)
   ================================================================ */
function SpriteWalkAnimation({ sprite, displayWidth = 160 }: { sprite: SpriteData; displayWidth?: number }) {
  const divRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Calculate dimensions
  const frameWidthOriginal = sprite.sheetWidth / sprite.columns;
  const scaleFactor = displayWidth / frameWidthOriginal;
  const scaledSheetWidth = sprite.sheetWidth * scaleFactor;
  const scaledSheetHeight = sprite.sheetHeight * scaleFactor;
  const rows = Math.ceil(sprite.totalFrames / sprite.columns);
  const frameHeight = scaledSheetHeight / rows;

  useEffect(() => {
    let startTime = 0;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      // Exact 48 FPS calculation (0.048 frames per millisecond)
      const currentFrame = Math.floor(elapsed * 0.048) % sprite.totalFrames;

      if (divRef.current) {
        const col = currentFrame % sprite.columns;
        const row = Math.floor(currentFrame / sprite.columns);
        const x = col * displayWidth;
        const y = row * frameHeight;
        divRef.current.style.backgroundPosition = `${-x}px ${-y}px`;
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [sprite, displayWidth, frameHeight]);

  return (
    <div
      ref={divRef}
      style={{
        width: displayWidth,
        height: frameHeight,
        backgroundImage: `url(${sprite.imageUrl})`,
        backgroundSize: `${scaledSheetWidth}px ${scaledSheetHeight}px`,
        backgroundPosition: "0px 0px",
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        filter: "drop-shadow(0px 1px 0px #ffda0e) drop-shadow(-1px 0px 0px #ffda0e) drop-shadow(1px 0px 0px #ffda0e) drop-shadow(0px -1px 0px #ffda0e) drop-shadow(1px 1px 0px #ffda0e) drop-shadow(-1px -1px 0px #ffda0e) drop-shadow(2px 4px 6px black)",
      }}
    />
  );
}

/* ================================================================
   STICKER COLLAGE COMPONENT (Memoized for high performance)
   ================================================================ */
const StickerCollage = memo(function StickerCollage() {
  const doubled = [...MOBS, ...MOBS];

  return (
    <div className="relative min-h-[200px] bg-black/40 rounded-2xl border border-white/10 overflow-hidden flex flex-wrap items-center justify-center shadow-inner"
      style={{ gap: 0, padding: "8px 4px" }}
    >
      {doubled.map((mob, idx) => (
        <div
          key={`${mob.id}-${idx}`}
          className="relative inline-block transition-transform hover:scale-125 hover:z-50 cursor-pointer"
          title={`${mob.name} (${mob.amount >= 0 ? '+' : ''}${mob.amount} ETB)`}
          style={{
            margin: "-4px -2px",
            transform: `rotate(${(idx % 7 - 3) * 5}deg)`,
            zIndex: idx % 5 + 1,
          }}
        >
          <img
            src={mob.previewUrl}
            alt={mob.name}
            loading="lazy"
            className="w-11 h-11 object-contain"
            style={{
              filter: "drop-shadow(0 0 2px #ffffff) drop-shadow(1px 2px 4px rgba(0,0,0,0.8))"
            }}
          />
        </div>
      ))}

      {/* Sticker Doodle Floating Badges */}
      <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-0.5 rounded-full text-[10px] font-extrabold rotate-12 shadow-lg" style={{ fontFamily: "'Highstories', sans-serif" }}>
        💎 +500 ETB
      </div>
      <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold -rotate-6 shadow-lg" style={{ fontFamily: "'Highstories', sans-serif" }}>
        💣 TNT TRAPS
      </div>
    </div>
  );
});

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
interface ArcadeStatus {
  hasActiveVip: boolean;
  highestPackageName: string | null;
  highestSortOrder?: number;
  maxSpins: number | "Unlimited";
  spinsToday: number;
  spinsRemaining: number | "Unlimited";
  isUnlimited: boolean;
  canSpin: boolean;
  message: string;
}

export default function Games() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [balance, setBalance] = useState<number>(() => parseFloat((user as any)?.mainBalance || "1000"));
  const [isFullPageGame, setIsFullPageGame] = useState(false);
  const [arcadeStatus, setArcadeStatus] = useState<ArcadeStatus | null>(null);

  const fetchArcadeStatus = useCallback(() => {
    customFetch<ArcadeStatus>("/api/arcade/status")
      .then((data) => setArcadeStatus(data))
      .catch((err) => console.error("Failed to fetch arcade status", err));
  }, []);

  useEffect(() => {
    fetchArcadeStatus();
  }, [fetchArcadeStatus]);

  // Audio Context singleton ref to eliminate lag from audio creation
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Preload all sprite images into browser memory on mount
  useEffect(() => {
    MOBS.forEach((mob) => {
      const img = new Image();
      img.src = mob.sprite.imageUrl;
      const prev = new Image();
      prev.src = mob.previewUrl;
    });
  }, []);

  // Full-page game state
  const [selectedIndex, setSelectedIndex] = useState(() => Math.floor(Math.random() * MOBS.length));
  const [isSpinning, setIsSpinning] = useState(false);
  const [modalResult, setModalResult] = useState<MobData | null>(null);

  useEffect(() => {
    if (user?.mainBalance) {
      setBalance(parseFloat((user as any).mainBalance));
    }
  }, [user]);

  function playArcadeSound(type: 'tick' | 'win' | 'loss') {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'loss') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  }

  function startSpin() {
    if (isSpinning) return;

    // Check spin limits before starting the animation
    if (arcadeStatus && !arcadeStatus.canSpin) {
      toast({
        title: "Arcade Limit Reached",
        description: arcadeStatus.message,
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
        if (ticks > maxTicks - 8) {
          delay += 45;
        }
        setTimeout(step, delay);
      } else {
        setIsSpinning(false);
        const finalMob = MOBS[curr];
        setModalResult(finalMob);
        playArcadeSound(finalMob.amount >= 0 ? 'win' : 'loss');

        // Claim winnings/losses on backend PostgreSQL database using customFetch
        customFetch<{ success: boolean; newBalance: number; message: string }>("/api/arcade/claim", {
          method: "POST",
          body: JSON.stringify({
            mobId: finalMob.id,
            mobName: finalMob.name,
            amount: finalMob.amount,
          }),
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
            console.error("Arcade claim error:", err);
            const errMsg = err?.data?.error || err?.message || "Failed to process arcade spin";
            toast({
              title: "Spin Claim Error",
              description: errMsg,
              variant: "destructive",
            });
            fetchArcadeStatus();
          });
      }
    }

    step();
  }

  const currentMob = MOBS[selectedIndex];

  const HS = { fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" } as const;
  const HSsm = { fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" } as const;

  /* ================================================================
     FULL-PAGE GAME VIEW
     Fixed: 100vw/100vh, no scroll, perfectly centered, no extra space
     ================================================================ */
  if (isFullPageGame) {
    return (
      <div
        className="fixed inset-0 bg-[#1A1A1A] text-white flex flex-col overflow-hidden"
        style={{ zIndex: 30 }}
      >
        {/* Top Nav Bar */}
        <div className="flex items-center justify-between bg-white/5 border-b border-white/10 px-4 py-3 flex-shrink-0">
          <button
            onClick={() => setIsFullPageGame(false)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors"
            style={HS}
          >
            <ArrowLeft className="w-5 h-5 text-black" />
            <span className="text-base font-semibold text-black">Back to Arcade</span>
          </button>

          <div className="flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-xl border border-yellow-500/30">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400" style={HS}>
              {balance.toLocaleString()} ETB
            </span>
          </div>
        </div>

        {/* Scrollable game content area — takes all remaining space */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-lg mx-auto w-full px-4 py-4 space-y-5">
            {/* Header Title */}
            <div className="text-center">
              <h1 className="text-[26px] font-bold text-white mb-1" style={HS}>
                🎮 MINECRAFT MOB SPINNER
              </h1>
              <p className="text-xs text-gray-400" style={HSsm}>
                Spin to select 1 of 15 mobs. Win up to +500 ETB or dodge traps!
              </p>
            </div>

            {/* VIP Spin Status Indicator */}
            {arcadeStatus && (
              <div
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 border shadow-lg ${
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
                {arcadeStatus.isUnlimited ? (
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
                <span>{arcadeStatus.message}</span>
              </div>
            )}

            {/* Spin Button */}
            <div className="flex justify-center">
              <Button
                onClick={startSpin}
                disabled={isSpinning || (arcadeStatus ? !arcadeStatus.canSpin : false)}
                className={`w-full max-w-sm py-6 rounded-2xl text-lg font-bold shadow-xl transition-all ${
                  isSpinning
                    ? "bg-amber-500 text-black animate-pulse"
                    : arcadeStatus && !arcadeStatus.canSpin
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed border border-white/10"
                    : "bg-primary text-[#1A1A1A] hover:bg-primary/90 shadow-primary/30"
                }`}
                style={{ ...HS, letterSpacing: "0.08em" }}
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${isSpinning ? "animate-spin" : ""}`} />
                {isSpinning
                  ? "SPINNING AUTO-PICKER..."
                  : arcadeStatus && !arcadeStatus.canSpin
                  ? "DAILY LIMIT REACHED"
                  : "START AUTO-PICKER (SPIN)"}
              </Button>
            </div>

            {/* Character Selector Grid */}
            <div>
              <p className="text-xs text-gray-400 mb-2 uppercase" style={HS}>
                Selected Mob Roster (15 Mobs)
              </p>
              <div className="grid grid-cols-5 gap-2">
                {MOBS.map((mob, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isGain = mob.amount >= 0;
                  return (
                    <button
                      key={mob.id}
                      onClick={() => !isSpinning && setSelectedIndex(idx)}
                      className={`relative p-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? "ring-2 ring-primary/60 scale-110 z-10"
                          : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={mob.previewUrl}
                        alt={mob.name}
                        className="w-10 h-10 object-contain mb-1"
                      />
                      <span
                        className={`text-[11px] font-semibold ${isGain ? "text-emerald-400" : "text-red-400"}`}
                        style={HSsm}
                      >
                        {isGain ? `+${mob.amount}` : mob.amount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Character with REAL SPRITE WALK ANIMATION + RPG Stats */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col sm:flex-row gap-5 items-center shadow-2xl">
              {/* Sprite Walk Animation Showcase — no background card */}
              <div className="w-40 h-40 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                <SpriteWalkAnimation sprite={currentMob.sprite} displayWidth={120} />
              </div>

              {/* RPG Stats */}
              <div className="flex-1 w-full space-y-3 text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="font-bold text-white text-xl" style={HS}>
                    {currentMob.name}
                  </h3>
                  <Badge className={currentMob.rarityColor} style={HSsm}>
                    {currentMob.rarity}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs block" style={HSsm}>Power Rating:</span>
                    <span className="font-semibold text-yellow-400 text-base" style={HSsm}>{currentMob.power}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block" style={HSsm}>Agility Stat:</span>
                    <span className="font-semibold text-cyan-400 text-base" style={HSsm}>{currentMob.agility}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block" style={HSsm}>Birr Potential:</span>
                    <span className={`font-bold text-base ${currentMob.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={HSsm}>
                      {currentMob.amount >= 0 ? `+${currentMob.amount} ETB` : `${currentMob.amount} ETB`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block" style={HSsm}>Special Skill:</span>
                    <span className="font-semibold text-gray-200 text-sm" style={HSsm}>{currentMob.ability}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom spacer — same height as the Spin button for scroll room */}
            <div className="h-20 flex-shrink-0" />
          </div>
        </div>

        {/* Outcome Announcement Overlay */}
        {modalResult && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] border-2 border-primary rounded-3xl p-6 text-center max-w-sm w-full space-y-4 shadow-2xl">
              <div className="text-5xl">
                {modalResult.amount >= 400 ? "💎" : modalResult.amount >= 0 ? "🎉" : "💣"}
              </div>
              <h3 className={`text-2xl font-bold ${modalResult.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={HS}>
                {modalResult.amount >= 400 ? "JACKPOT REWARD!" : modalResult.amount >= 0 ? "YOU WON BIRR!" : "PENALTY TRAP!"}
              </h3>
              <p className="text-sm text-gray-300" style={HSsm}>
                Landed on <strong className="text-white">{modalResult.name}</strong> ({modalResult.ability})
              </p>
              <div className={`text-3xl font-bold ${modalResult.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={HS}>
                {modalResult.amount >= 0 ? `+${modalResult.amount} ETB` : `${modalResult.amount} ETB`}
              </div>
              <Button
                onClick={() => setModalResult(null)}
                className="w-full bg-primary text-[#1A1A1A] font-semibold py-3 rounded-xl"
                style={{ ...HS, letterSpacing: "0.08em" }}
              >
                CONTINUE PLAYING
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================================================================
     ARCADE HUB VIEW
     ================================================================ */
  return (
    <div className="space-y-6 max-w-md mx-auto md:max-w-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 pt-2">
        <div>
          <h1 className="text-[28px] text-[#2B7A4B] font-bold" style={{ ...HS, letterSpacing: "0.08em" }}>
            NAOMI ARCADE
          </h1>
          <p className="text-gray-400 text-[18px]" style={HSsm}>
            Play games & earn Birr rewards
          </p>
        </div>
        <div className="bg-[#1A1A1A] px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold text-white" style={HS}>
            {balance.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Main Game Card — Styled like Main Balance card */}
      <div className="bg-[#1A1A1A] rounded-3xl p-5 text-white border border-white/10 shadow-2xl relative overflow-hidden flex flex-col space-y-4">
        
        {/* THUMBNAIL IMAGE WITH TITLE & DESCRIPTION OVERLAY ON TOP */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
          <img
            src="/game-thumbnail.jpg"
            alt="Minecraft Mob Spinner"
            className="w-full h-full object-cover"
          />
          {/* Title & Description Overlay on top of Thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 flex flex-col justify-end">
            <h2 className="text-[26px] font-bold text-white mb-1" style={HS}>
              Minecraft Mob Spinner
            </h2>
            <p className="text-gray-200 text-xs leading-snug" style={HSsm}>
              Spin the auto-picker to randomly land on 1 of 15 mobs. Win up to +215 ETB with Diamond Panda or dodge Creeper TNT traps! Tiered daily spins per VIP level (VIP 4+ Unlimited).
            </p>
          </div>
        </div>

        {/* OUTSIDE / BELOW THUMBNAIL: Badges & Start Button */}
        <div className="space-y-4 pt-1">
          {/* Info Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold" style={HSsm}>
              Jackpot: +215 ETB
            </span>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold" style={HSsm}>
              Danger Traps Included
            </span>
            {arcadeStatus && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  !arcadeStatus.hasActiveVip
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : arcadeStatus.isUnlimited
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : arcadeStatus.canSpin
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}
                style={HSsm}
              >
                {arcadeStatus.message}
              </span>
            )}
          </div>

          {/* Start Game Button */}
          <div>
            <Button
              onClick={() => setIsFullPageGame(true)}
              className="w-full bg-primary text-[#1A1A1A] hover:bg-primary/90 font-bold text-lg py-6 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ ...HS, letterSpacing: "0.08em" }}
            >
              <Play className="w-5 h-5 fill-current mr-2" />
              START GAME
            </Button>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="space-y-4 pt-2">
        <p className="text-[22px] text-gray-400 font-semibold" style={HS}>
          Upcoming Arcade Games
        </p>

        {/* Coming Soon Card 1 — ANIMATED VIDEO THUMBNAIL */}
        <div className="bg-[#1A1A1A] rounded-3xl p-5 text-white border border-white/10 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
          
          {/* Animated Video Thumbnail */}
          <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 shadow-md">
            <video
              src="/Gamevid.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Animated Thumbnail Overlay Badge */}
            <div className="absolute top-3 right-3 bg-amber-500/80 backdrop-blur-md text-black px-3 py-1 rounded-full text-xs font-extrabold shadow-lg" style={HS}>
              🔒 COMING SOON
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white" style={HS}>
              🎬 Animated Preview
            </div>
          </div>

          <div>
            <h3 className="text-[22px] font-bold text-white mb-1" style={HS}>
              Birr Mine Sweeper
            </h3>
            <p className="text-gray-300 text-sm" style={HSsm}>
              Uncover hidden emerald tiles while dodging TNT mines. High risk multipliers!
            </p>
          </div>

          <Button disabled variant="outline" className="w-full text-gray-500 border-white/10 bg-white/5 py-5 rounded-2xl" style={HS}>
            Coming Soon
          </Button>
        </div>
      </div>
    </div>
  );
}
