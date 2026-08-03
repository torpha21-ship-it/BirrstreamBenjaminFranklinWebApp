import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Gamepad2, Sparkles, Trophy, Flame, ShieldAlert, Zap, Lock, Coins, RefreshCw, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  spriteIndex: number;
}

const MOBS: MobData[] = [
  { id: "character-1", name: "Lucky Pixel Cat", power: "720 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/10 border-blue-500/30", amount: 150, ability: "Meow Lucky Charm", agility: "60 AG", previewUrl: "https://assets.codepen.io/36869/cat-preview.webp", spriteIndex: 1 },
  { id: "character-2", name: "Venom Shadow Spider", power: "680 CP", rarity: "Curse Mob", rarityColor: "text-red-400 bg-red-500/10 border-red-500/30", amount: -75, ability: "Poison Web Trap", agility: "88 AG", previewUrl: "https://assets.codepen.io/36869/spider-preview.webp", spriteIndex: 2 },
  { id: "character-3", name: "Golden Dairy Cow", power: "500 CP", rarity: "Common", rarityColor: "text-slate-300 bg-slate-500/10 border-slate-500/30", amount: 100, ability: "Milk Yield Boost", agility: "40 AG", previewUrl: "https://assets.codepen.io/36869/cow-preview.webp", spriteIndex: 3 },
  { id: "character-4", name: "Explosive Creeper", power: "990 CP", rarity: "Danger Mob", rarityColor: "text-red-500 bg-red-600/20 border-red-500 animate-pulse", amount: -150, ability: "TNT Blast Penalty", agility: "70 AG", previewUrl: "https://assets.codepen.io/36869/creeper-preview.webp", spriteIndex: 4 },
  { id: "character-5", name: "Void Enderman", power: "890 CP", rarity: "Epic", rarityColor: "text-purple-400 bg-purple-500/10 border-purple-500/30", amount: 400, ability: "Teleport Stash", agility: "95 AG", previewUrl: "https://assets.codepen.io/36869/enderman-preview.webp", spriteIndex: 5 },
  { id: "character-6", name: "Arch Evoker", power: "950 CP", rarity: "Dark Boss", rarityColor: "text-rose-500 bg-rose-900/30 border-rose-500 animate-pulse", amount: -200, ability: "Vex Soul Drain", agility: "75 AG", previewUrl: "https://assets.codepen.io/36869/evoker-preview.webp", spriteIndex: 6 },
  { id: "character-7", name: "Iron Golem Sentinel", power: "920 CP", rarity: "Epic", rarityColor: "text-purple-400 bg-purple-500/10 border-purple-500/30", amount: 300, ability: "Iron Shield Guard", agility: "50 AG", previewUrl: "https://assets.codepen.io/36869/golem-preview.webp", spriteIndex: 7 },
  { id: "character-8", name: "Phantom Skeleton Horse", power: "810 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/10 border-blue-500/30", amount: 250, ability: "Soul Velocity", agility: "92 AG", previewUrl: "https://assets.codepen.io/36869/horse-preview.webp", spriteIndex: 8 },
  { id: "character-9", name: "Jungle Ocelot", power: "640 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/10 border-blue-500/30", amount: 180, ability: "Pounce Hunting", agility: "85 AG", previewUrl: "https://assets.codepen.io/36869/ocelot-preview.webp", spriteIndex: 9 },
  { id: "character-10", name: "Diamond Panda King", power: "1000 CP", rarity: "Mythic Jackpot", rarityColor: "text-yellow-400 bg-yellow-500/20 border-yellow-500/50 font-bold", amount: 500, ability: "Bamboo Wealth", agility: "99 AG", previewUrl: "https://assets.codepen.io/36869/panda-preview.webp", spriteIndex: 10 },
  { id: "character-11", name: "Skeletal Sniper", power: "710 CP", rarity: "Curse Mob", rarityColor: "text-red-400 bg-red-500/10 border-red-500/30", amount: -100, ability: "Piercing Arrow", agility: "65 AG", previewUrl: "https://assets.codepen.io/36869/skeleton-preview.webp", spriteIndex: 11 },
  { id: "character-12", name: "Alpha Timber Wolf", power: "780 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/10 border-blue-500/30", amount: 220, ability: "Pack Leader Howl", agility: "80 AG", previewUrl: "https://assets.codepen.io/36869/wolf-preview.webp", spriteIndex: 12 },
  { id: "character-13", name: "Deep Ocean Squid", power: "450 CP", rarity: "Common", rarityColor: "text-slate-300 bg-slate-500/10 border-slate-500/30", amount: 80, ability: "Ink Cloud Escape", agility: "55 AG", previewUrl: "https://assets.codepen.io/36869/squid-preview.png", spriteIndex: 13 },
  { id: "character-14", name: "Mystic Fire Fox", power: "860 CP", rarity: "Epic", rarityColor: "text-purple-400 bg-purple-500/10 border-purple-500/30", amount: 350, ability: "Berry Treasure", agility: "90 AG", previewUrl: "https://assets.codepen.io/36869/fox-preview.webp", spriteIndex: 14 },
  { id: "character-15", name: "Emerald Master Trader", power: "690 CP", rarity: "Rare", rarityColor: "text-blue-400 bg-blue-500/10 border-blue-500/30", amount: 200, ability: "Emerald Exchange", agility: "60 AG", previewUrl: "https://assets.codepen.io/36869/villager-preview.webp", spriteIndex: 15 }
];

export default function Games() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(() => parseFloat((user as any)?.mainBalance || "1000"));
  const [isGameOpen, setIsGameOpen] = useState(false);

  // Game state
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

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-3xl border border-indigo-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-primary animate-pulse" />
            <h1 className="text-2xl font-extrabold text-white tracking-wide">NAOMI ARCADE</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Spin to pick Minecraft mobs & earn Birr rewards!</p>
        </div>
        <div className="bg-black/60 border border-yellow-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-inner">
          <Coins className="w-5 h-5 text-yellow-400" />
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Game Balance</span>
            <span className="text-lg font-black text-yellow-400">{balance.toLocaleString("en-ET", { minimumFractionDigits: 2 })} ETB</span>
          </div>
        </div>
      </div>

      {/* Featured Game Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Featured Game
          </h2>
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">
            PLAYABLE NOW
          </Badge>
        </div>

        {/* Featured Card: Minecraft Mob Spinner */}
        <div className="relative group overflow-hidden rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950 p-6 shadow-2xl transition-all hover:border-emerald-400">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
            {/* Custom Pixel Thumbnail Grid */}
            <div className="relative w-full md:w-64 h-44 bg-black/60 rounded-2xl border border-emerald-500/30 overflow-hidden flex items-center justify-center p-3 shadow-inner">
              <div className="grid grid-cols-3 gap-2 w-full h-full items-center justify-items-center opacity-90">
                <img src="https://assets.codepen.io/36869/panda-preview.webp" className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-bounce" alt="Panda" />
                <img src="https://assets.codepen.io/36869/creeper-preview.webp" className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" alt="Creeper" />
                <img src="https://assets.codepen.io/36869/cat-preview.webp" className="w-12 h-12 object-contain" alt="Cat" />
                <img src="https://assets.codepen.io/36869/enderman-preview.webp" className="w-12 h-12 object-contain" alt="Enderman" />
                <img src="https://assets.codepen.io/36869/golem-preview.webp" className="w-12 h-12 object-contain" alt="Golem" />
                <img src="https://assets.codepen.io/36869/fox-preview.webp" className="w-12 h-12 object-contain" alt="Fox" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end justify-center p-2">
                <span className="text-[11px] font-black text-emerald-400 tracking-wider uppercase bg-black/70 px-3 py-1 rounded-full border border-emerald-500/40">
                  15 PIXEL MOBS
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="flex-1 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                <h3 className="text-xl font-black text-white tracking-wide font-mono">MINECRAFT MOB SPINNER</h3>
              </div>
              <p className="text-sm text-slate-300">
                Trigger the auto-picker to randomly cycle through animated Minecraft characters. Land on Diamond Panda for +500 Birr jackpot or dodge TNT Creeper explosions!
              </p>
              
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">Up to +500 ETB</Badge>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/40">Danger Penalty Mobs</Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40">RPG Stat Grades</Badge>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={() => setIsGameOpen(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-base px-8 py-6 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current mr-2" />
                  START GAME NOW
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Games Section */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          More Arcade Games
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Coming Soon Card 1 */}
          <Card className="bg-slate-900/60 border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
            <CardContent className="p-5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">Birr Mine Sweeper</h3>
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 text-[10px]">
                    <Lock className="w-3 h-3 mr-1" /> SOON
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Uncover hidden emerald tiles while dodging TNT mines. High risk multipliers!
                </p>
              </div>
              <Button disabled variant="outline" className="w-full text-slate-500 border-slate-800 bg-slate-900/50">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Coming Soon Card 2 */}
          <Card className="bg-slate-900/60 border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
            <CardContent className="p-5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">Diamond Crash</h3>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 text-[10px]">
                    <Lock className="w-3 h-3 mr-1" /> SOON
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Watch the diamond rocket soar up to 50x multiplier before it crashes down.
                </p>
              </div>
              <Button disabled variant="outline" className="w-full text-slate-500 border-slate-800 bg-slate-900/50">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Coming Soon Card 3 */}
          <Card className="bg-slate-900/60 border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all sm:col-span-2 md:col-span-1">
            <CardContent className="p-5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">Ender Mystery Box</h3>
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 text-[10px]">
                    <Lock className="w-3 h-3 mr-1" /> SOON
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Pick 1 of 3 Ender Chests to reveal instant cash rewards or rare artifacts.
                </p>
              </div>
              <Button disabled variant="outline" className="w-full text-slate-500 border-slate-800 bg-slate-900/50">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Minecraft Game Modal / Drawer */}
      {isGameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-emerald-500/60 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎮</span>
                <h3 className="font-black text-white text-lg tracking-wide font-mono">MINECRAFT MOB SPINNER</h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsGameOpen(false)}
                className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Wallet Bar & Spin Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <div className="text-center sm:text-left">
                  <span className="text-xs text-slate-400 block font-semibold">Your Wallet Balance</span>
                  <span className="text-xl font-black text-yellow-400">{balance.toLocaleString()} ETB</span>
                </div>

                <Button
                  onClick={startSpin}
                  disabled={isSpinning}
                  className={`w-full sm:w-auto px-8 py-6 rounded-2xl font-black text-base transition-all ${
                    isSpinning 
                      ? "bg-amber-500 text-slate-950 animate-pulse" 
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30"
                  }`}
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${isSpinning ? "animate-spin" : ""}`} />
                  {isSpinning ? "SPINNING AUTO-PICKER..." : "START AUTO-PICKER (SPIN)"}
                </Button>
              </div>

              {/* Mob Grid Picker */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Selectable Characters (15 Mobs)</h4>
                <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
                  {MOBS.map((mob, idx) => {
                    const isSelected = idx === selectedIndex;
                    const isGain = mob.amount >= 0;
                    return (
                      <button
                        key={mob.id}
                        onClick={() => !isSpinning && setSelectedIndex(idx)}
                        className={`relative p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? "bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/50 scale-105"
                            : "bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100"
                        }`}
                      >
                        <img src={mob.previewUrl} alt={mob.name} className="w-10 h-10 object-contain mb-1" />
                        <span className={`text-[10px] font-bold px-1 rounded ${isGain ? "text-emerald-400" : "text-red-400"}`}>
                          {isGain ? `+${mob.amount}` : mob.amount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Mob Gamified Stats Preview */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-center">
                <div className="w-24 h-24 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-2 flex-shrink-0">
                  <img src={currentMob.previewUrl} alt={currentMob.name} className="w-20 h-20 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                </div>

                <div className="flex-1 w-full space-y-2 text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-white text-lg">{currentMob.name}</h3>
                    <Badge className={currentMob.rarityColor}>{currentMob.rarity}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Power Rating:</span>
                      <span className="font-bold text-yellow-400">{currentMob.power}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Agility Stat:</span>
                      <span className="font-bold text-cyan-400">{currentMob.agility}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Birr Potential:</span>
                      <span className={`font-black text-sm ${currentMob.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {currentMob.amount >= 0 ? `+${currentMob.amount} BIRR` : `${currentMob.amount} BIRR`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Special Skill:</span>
                      <span className="font-bold text-slate-200">{currentMob.ability}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Outcome Announcement overlay */}
            {modalResult && (
              <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
                <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 text-center max-w-sm w-full space-y-4 shadow-2xl">
                  <div className="text-5xl">
                    {modalResult.amount >= 400 ? "💎" : modalResult.amount >= 0 ? "🎉" : "💣"}
                  </div>
                  <h3 className={`text-xl font-extrabold ${modalResult.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {modalResult.amount >= 400 ? "JACKPOT REWARD!" : modalResult.amount >= 0 ? "YOU WON BIRR!" : "PENALTY TRAP!"}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Landed on <strong className="text-white">{modalResult.name}</strong> ({modalResult.ability})
                  </p>
                  <div className={`text-3xl font-black ${modalResult.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {modalResult.amount >= 0 ? `+${modalResult.amount} ETB` : `${modalResult.amount} ETB`}
                  </div>
                  <Button 
                    onClick={() => setModalResult(null)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl"
                  >
                    CONTINUE PLAYING
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
