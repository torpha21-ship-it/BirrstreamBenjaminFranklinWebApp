import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Gamepad2, Sparkles, Trophy, Flame, Zap, Lock, Coins, RefreshCw, ArrowLeft, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
}

const MOBS: MobData[] = [
  { id: "character-1", name: "Lucky Pixel Cat", power: "720 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 150, ability: "Meow Lucky Charm", agility: "60 AG", previewUrl: "https://assets.codepen.io/36869/cat-preview.webp", rotClass: "-rotate-6 translate-y-1" },
  { id: "character-2", name: "Venom Shadow Spider", power: "680 CP", rarity: "Curse Mob", rarityColor: "text-red-400 bg-red-500/20 border-red-500/40", amount: -75, ability: "Poison Web Trap", agility: "88 AG", previewUrl: "https://assets.codepen.io/36869/spider-preview.webp", rotClass: "rotate-6 -translate-y-2 z-10" },
  { id: "character-3", name: "Golden Dairy Cow", power: "500 CP", rarity: "Common", rarityColor: "text-slate-300 bg-slate-500/20 border-slate-500/40", amount: 100, ability: "Milk Yield Boost", agility: "40 AG", previewUrl: "https://assets.codepen.io/36869/cow-preview.webp", rotClass: "-rotate-12 translate-x-1" },
  { id: "character-4", name: "Explosive Creeper", power: "990 CP", rarity: "Danger Mob", rarityColor: "text-red-400 bg-red-600/30 border-red-500 animate-pulse", amount: -150, ability: "TNT Blast Penalty", agility: "70 AG", previewUrl: "https://assets.codepen.io/36869/creeper-preview.webp", rotClass: "rotate-12 scale-110 z-20" },
  { id: "character-5", name: "Void Enderman", power: "890 CP", rarity: "Epic", rarityColor: "text-purple-400 bg-purple-500/20 border-purple-500/40", amount: 400, ability: "Teleport Stash", agility: "95 AG", previewUrl: "https://assets.codepen.io/36869/enderman-preview.webp", rotClass: "-rotate-3 -translate-y-1" },
  { id: "character-6", name: "Arch Evoker", power: "950 CP", rarity: "Dark Boss", rarityColor: "text-rose-400 bg-rose-900/40 border-rose-500 animate-pulse", amount: -200, ability: "Vex Soul Drain", agility: "75 AG", previewUrl: "https://assets.codepen.io/36869/evoker-preview.webp", rotClass: "rotate-8 scale-105 z-10" },
  { id: "character-7", name: "Iron Golem Sentinel", power: "920 CP", rarity: "Epic", rarityColor: "text-purple-400 bg-purple-500/20 border-purple-500/40", amount: 300, ability: "Iron Shield Guard", agility: "50 AG", previewUrl: "https://assets.codepen.io/36869/golem-preview.webp", rotClass: "-rotate-8 scale-110 z-10" },
  { id: "character-8", name: "Phantom Skeleton Horse", power: "810 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 250, ability: "Soul Velocity", agility: "92 AG", previewUrl: "https://assets.codepen.io/36869/horse-preview.webp", rotClass: "rotate-4 translate-y-2" },
  { id: "character-9", name: "Jungle Ocelot", power: "640 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 180, ability: "Pounce Hunting", agility: "85 AG", previewUrl: "https://assets.codepen.io/36869/ocelot-preview.webp", rotClass: "-rotate-15 translate-x-2 z-20" },
  { id: "character-10", name: "Diamond Panda King", power: "1000 CP", rarity: "Mythic Jackpot", rarityColor: "text-yellow-300 bg-yellow-500/30 border-yellow-400 font-bold", amount: 500, ability: "Bamboo Wealth", agility: "99 AG", previewUrl: "https://assets.codepen.io/36869/panda-preview.webp", rotClass: "rotate-12 scale-125 z-30" },
  { id: "character-11", name: "Skeletal Sniper", power: "710 CP", rarity: "Curse Mob", rarityColor: "text-red-400 bg-red-500/20 border-red-500/40", amount: -100, ability: "Piercing Arrow", agility: "65 AG", previewUrl: "https://assets.codepen.io/36869/skeleton-preview.webp", rotClass: "-rotate-6 -translate-y-2" },
  { id: "character-12", name: "Alpha Timber Wolf", power: "780 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 220, ability: "Pack Leader Howl", agility: "80 AG", previewUrl: "https://assets.codepen.io/36869/wolf-preview.webp", rotClass: "rotate-9 scale-105 z-10" },
  { id: "character-13", name: "Deep Ocean Squid", power: "450 CP", rarity: "Common", rarityColor: "text-slate-300 bg-slate-500/20 border-slate-500/40", amount: 80, ability: "Ink Cloud Escape", agility: "55 AG", previewUrl: "https://assets.codepen.io/36869/squid-preview.png", rotClass: "-rotate-10 translate-y-1" },
  { id: "character-14", name: "Mystic Fire Fox", power: "860 CP", rarity: "Epic", rarityColor: "text-purple-400 bg-purple-500/20 border-purple-500/40", amount: 350, ability: "Berry Treasure", agility: "90 AG", previewUrl: "https://assets.codepen.io/36869/fox-preview.webp", rotClass: "rotate-6 scale-110 z-10" },
  { id: "character-15", name: "Emerald Master Trader", power: "690 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/20 border-blue-500/40", amount: 200, ability: "Emerald Exchange", agility: "60 AG", previewUrl: "https://assets.codepen.io/36869/villager-preview.webp", rotClass: "-rotate-4 translate-x-1" }
];

export default function Games() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(() => parseFloat((user as any)?.mainBalance || "1000"));
  const [isFullPageGame, setIsFullPageGame] = useState(false);

  // Full-page game state
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [modalResult, setModalResult] = useState<MobData | null>(null);

  useEffect(() => {
    if (user?.mainBalance) {
      setBalance(parseFloat((user as any).mainBalance));
    }
  }, [user]);

  function playArcadeSound(type: 'tick' | 'win' | 'loss') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
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
        setBalance(prev => prev + finalMob.amount);
        setModalResult(finalMob);
        playArcadeSound(finalMob.amount >= 0 ? 'win' : 'loss');
      }
    }

    step();
  }

  const currentMob = MOBS[selectedIndex];

  // Full-Page Clean Game View (No background cards wrapper)
  if (isFullPageGame) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white p-4 md:p-6 flex flex-col justify-between -mx-4 md:mx-0">
        {/* Keyframe style for active stuck-in-hover character movement */}
        <style>{`
          @keyframes activeMobHover {
            0%, 100% {
              transform: translateY(0px) scale(1.12);
              filter: drop-shadow(0 0 12px rgba(250, 204, 21, 0.8)) drop-shadow(0 0 25px rgba(74, 222, 128, 0.6));
            }
            50% {
              transform: translateY(-10px) scale(1.22);
              filter: drop-shadow(0 0 18px rgba(74, 222, 128, 0.9)) drop-shadow(0 0 35px rgba(250, 204, 21, 0.9));
            }
          }
          .animate-active-mob {
            animation: activeMobHover 1.5s ease-in-out infinite;
          }
        `}</style>

        {/* Full-Page Top Navigation Bar */}
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
          <button 
            onClick={() => setIsFullPageGame(false)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-base font-semibold">Back to Arcade</span>
          </button>

          <div className="flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-xl border border-yellow-500/30">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
              {balance.toLocaleString()} ETB
            </span>
          </div>
        </div>

        {/* Full-Page Main Game Screen */}
        <div className="space-y-6 flex-1 max-w-2xl mx-auto w-full">
          {/* Header Title */}
          <div className="text-center">
            <h1 className="text-[28px] font-bold text-white mb-1" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
              🎮 MINECRAFT MOB SPINNER
            </h1>
            <p className="text-xs text-gray-400" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
              Spin to select 1 of 15 mobs. Win up to +500 ETB or dodge traps!
            </p>
          </div>

          {/* Action Spin Button */}
          <div className="flex justify-center">
            <Button
              onClick={startSpin}
              disabled={isSpinning}
              className={`w-full max-w-sm py-6 rounded-2xl text-lg font-bold shadow-xl transition-all ${
                isSpinning
                  ? "bg-amber-500 text-black animate-pulse"
                  : "bg-primary text-[#1A1A1A] hover:bg-primary/90 shadow-primary/30"
              }`}
              style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.08em" }}
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isSpinning ? "animate-spin" : ""}`} />
              {isSpinning ? "SPINNING AUTO-PICKER..." : "START AUTO-PICKER (SPIN)"}
            </Button>
          </div>

          {/* Character Selector Row */}
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
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
                    className={`relative p-2 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? "bg-primary/20 border-primary ring-2 ring-primary/60 scale-110 z-10"
                        : "bg-white/5 border-white/10 hover:border-white/20 opacity-75"
                    }`}
                  >
                    <img 
                      src={mob.previewUrl} 
                      alt={mob.name} 
                      className={`w-10 h-10 object-contain mb-1 ${isSelected ? "animate-pulse" : ""}`} 
                    />
                    <span 
                      className={`text-[11px] font-semibold ${isGain ? "text-emerald-400" : "text-red-400"}`}
                      style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.04em" }}
                    >
                      {isGain ? `+${mob.amount}` : mob.amount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Moving Character & Gamified RPG Stats (Stuck in active hover animation state!) */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 items-center shadow-2xl">
            {/* Active Moving Mob Showcase */}
            <div className="w-32 h-32 bg-black/60 rounded-3xl border border-white/20 flex items-center justify-center p-3 flex-shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-yellow-500/10 pointer-events-none" />
              <img 
                src={currentMob.previewUrl} 
                alt={currentMob.name} 
                className="w-24 h-24 object-contain animate-active-mob" 
              />
            </div>

            {/* RPG Gamified Stats */}
            <div className="flex-1 w-full space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="font-bold text-white text-2xl" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
                  {currentMob.name}
                </h3>
                <Badge className={currentMob.rarityColor} style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
                  {currentMob.rarity}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400 text-xs block" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>Power Rating:</span>
                  <span className="font-semibold text-yellow-400 text-base" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>{currentMob.power}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>Agility Stat:</span>
                  <span className="font-semibold text-cyan-400 text-base" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>{currentMob.agility}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>Birr Potential:</span>
                  <span className={`font-bold text-base ${currentMob.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
                    {currentMob.amount >= 0 ? `+${currentMob.amount} ETB` : `${currentMob.amount} ETB`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>Special Skill:</span>
                  <span className="font-semibold text-gray-200 text-sm" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>{currentMob.ability}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Outcome Announcement Overlay */}
        {modalResult && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] border-2 border-primary rounded-3xl p-6 text-center max-w-sm w-full space-y-4 shadow-2xl">
              <div className="text-5xl">
                {modalResult.amount >= 400 ? "💎" : modalResult.amount >= 0 ? "🎉" : "💣"}
              </div>
              <h3 className={`text-2xl font-bold ${modalResult.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
                {modalResult.amount >= 400 ? "JACKPOT REWARD!" : modalResult.amount >= 0 ? "YOU WON BIRR!" : "PENALTY TRAP!"}
              </h3>
              <p className="text-sm text-gray-300" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
                Landed on <strong className="text-white">{modalResult.name}</strong> ({modalResult.ability})
              </p>
              <div className={`text-3xl font-bold ${modalResult.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
                {modalResult.amount >= 0 ? `+${modalResult.amount} ETB` : `${modalResult.amount} ETB`}
              </div>
              <Button 
                onClick={() => setModalResult(null)}
                className="w-full bg-primary text-[#1A1A1A] font-semibold py-3 rounded-xl"
                style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.08em" }}
              >
                CONTINUE PLAYING
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standard Arcade Hub View: Cards styled like Main Balance card (Double length downward)
  return (
    <div className="space-y-6 max-w-md mx-auto md:max-w-none">
      {/* Top Header */}
      <div className="flex items-center justify-between -mx-4 px-6 pt-2">
        <div>
          <h1 className="text-[28px] text-[#2B7A4B] font-bold" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.08em" }}>
            NAOMI ARCADE
          </h1>
          <p className="text-gray-400 text-[18px]" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
            Play games & earn Birr rewards
          </p>
        </div>
        <div className="bg-[#1A1A1A] px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
            {balance.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Main Game Card — Designed like Main Balance Card, double length downward */}
      <div className="bg-[#1A1A1A] rounded-3xl p-6 text-white border border-white/10 shadow-2xl relative overflow-hidden -mx-4 flex flex-col min-h-[580px]">
        
        {/* FIRST HALF (Top): DOODLE STICKER COLLAGE of every character */}
        <div className="flex-1 space-y-3 pb-4 border-b border-white/10 relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[24px] text-gray-400 font-semibold" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
              Minecraft Mob Sticker Roster
            </p>
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
              15 Mob Stickers
            </span>
          </div>

          {/* Doodle Sticker Art Canvas: Overlapping character stickers with white outlines & random rotations */}
          <div className="relative min-h-[220px] bg-black/40 rounded-2xl border border-white/10 p-3 overflow-hidden flex flex-wrap items-center justify-center gap-1.5 shadow-inner">
            {MOBS.map((mob) => (
              <div 
                key={mob.id}
                className={`relative inline-block transition-transform hover:scale-125 hover:z-40 cursor-pointer ${mob.rotClass}`}
                title={`${mob.name} (${mob.amount >= 0 ? '+' : ''}${mob.amount} ETB)`}
              >
                <img 
                  src={mob.previewUrl} 
                  alt={mob.name} 
                  className="w-12 h-12 object-contain"
                  style={{
                    filter: "drop-shadow(0px 0px 2px #ffffff) drop-shadow(0px 0px 4px #ffffff) drop-shadow(2px 3px 6px rgba(0,0,0,0.9))"
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
        </div>

        {/* SECOND HALF (Bottom): Concise Game Info Text + Start Game Button */}
        <div className="pt-5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-[26px] font-bold text-white mb-1" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
              Minecraft Mob Spinner
            </h2>
            <p className="text-gray-300 text-sm leading-snug" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
              Spin the auto-picker to randomly land on 1 of 15 mobs. Win up to +500 ETB with Diamond Panda or dodge Creeper TNT traps!
            </p>
          </div>

          {/* Concise Info Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
              Jackpot: +500 ETB
            </span>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
              Danger Traps Included
            </span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
              RPG Power Grades
            </span>
          </div>

          {/* Streamlined Start Game Button */}
          <div className="pt-2">
            <Button
              onClick={() => setIsFullPageGame(true)}
              className="w-full bg-primary text-[#1A1A1A] hover:bg-primary/90 font-bold text-lg py-6 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.08em" }}
            >
              <Play className="w-5 h-5 fill-current mr-2" />
              START GAME
            </Button>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="space-y-4 pt-2">
        <p className="text-[22px] text-gray-400 font-semibold" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
          Upcoming Arcade Games
        </p>

        {/* Coming Soon Card 1 */}
        <div className="bg-[#1A1A1A] rounded-3xl p-6 text-white border border-white/10 shadow-xl relative overflow-hidden -mx-4 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-[22px] font-bold text-white" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
                Birr Mine Sweeper
              </h3>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full font-semibold" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
              <Lock className="w-3 h-3 inline mr-1" /> SOON
            </span>
          </div>

          <p className="text-gray-300 text-sm my-4" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
            Uncover hidden emerald tiles while dodging TNT mines. High risk multipliers!
          </p>

          <Button disabled variant="outline" className="w-full text-gray-500 border-white/10 bg-white/5 py-5 rounded-2xl" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
            Coming Soon
          </Button>
        </div>

        {/* Coming Soon Card 2 */}
        <div className="bg-[#1A1A1A] rounded-3xl p-6 text-white border border-white/10 shadow-xl relative overflow-hidden -mx-4 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-[22px] font-bold text-white" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
                Diamond Crash
              </h3>
            </div>
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-semibold" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
              <Lock className="w-3 h-3 inline mr-1" /> SOON
            </span>
          </div>

          <p className="text-gray-300 text-sm my-4" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
            Watch the diamond rocket soar up to 50x multiplier before it crashes down.
          </p>

          <Button disabled variant="outline" className="w-full text-gray-500 border-white/10 bg-white/5 py-5 rounded-2xl" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
            Coming Soon
          </Button>
        </div>
      </div>
    </div>
  );
}
