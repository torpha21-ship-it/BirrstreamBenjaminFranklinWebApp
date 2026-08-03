// Minecraft Mob Spinner Game Engine
(function () {
  const MOB_DATA = {
    'character-1': { name: 'Lucky Pixel Cat', power: '720 CP', rarity: 'Rare', rarityClass: 'badge-rare', amount: 150, ability: 'Meow Lucky Charm', agility: '60 AG' },
    'character-2': { name: 'Venom Shadow Spider', power: '680 CP', rarity: 'Curse Mob', rarityClass: 'badge-curse', amount: -75, ability: 'Poison Web Trap', agility: '88 AG' },
    'character-3': { name: 'Golden Dairy Cow', power: '500 CP', rarity: 'Common', rarityClass: 'badge-common', amount: 100, ability: 'Milk Yield Boost', agility: '40 AG' },
    'character-4': { name: 'Explosive Creeper', power: '990 CP', rarity: 'Danger Mob', rarityClass: 'badge-danger', amount: -150, ability: 'TNT Blast Penalty', agility: '70 AG' },
    'character-5': { name: 'Void Enderman', power: '890 CP', rarity: 'Epic', rarityClass: 'badge-epic', amount: 400, ability: 'Teleport Stash', agility: '95 AG' },
    'character-6': { name: 'Arch Evoker', power: '950 CP', rarity: 'Dark Boss', rarityClass: 'badge-danger', amount: -200, ability: 'Vex Soul Drain', agility: '75 AG' },
    'character-7': { name: 'Iron Golem Sentinel', power: '920 CP', rarity: 'Epic', rarityClass: 'badge-epic', amount: 300, ability: 'Iron Shield Guard', agility: '50 AG' },
    'character-8': { name: 'Phantom Skeleton Horse', power: '810 CP', rarity: 'Rare', rarityClass: 'badge-rare', amount: 250, ability: 'Soul Velocity', agility: '92 AG' },
    'character-9': { name: 'Jungle Ocelot', power: '640 CP', rarity: 'Rare', rarityClass: 'badge-rare', amount: 180, ability: 'Pounce Hunting', agility: '85 AG' },
    'character-10': { name: 'Diamond Panda King', power: '1000 CP', rarity: 'Mythic Jackpot', rarityClass: 'badge-mythic', amount: 500, ability: 'Bamboo Wealth', agility: '99 AG' },
    'character-11': { name: 'Skeletal Sniper', power: '710 CP', rarity: 'Curse Mob', rarityClass: 'badge-curse', amount: -100, ability: 'Piercing Arrow', agility: '65 AG' },
    'character-12': { name: 'Alpha Timber Wolf', power: '780 CP', rarity: 'Rare', rarityClass: 'badge-rare', amount: 220, ability: 'Pack Leader Howl', agility: '80 AG' },
    'character-13': { name: 'Deep Ocean Squid', power: '450 CP', rarity: 'Common', rarityClass: 'badge-common', amount: 80, ability: 'Ink Cloud Escape', agility: '55 AG' },
    'character-14': { name: 'Mystic Fire Fox', power: '860 CP', rarity: 'Epic', rarityClass: 'badge-epic', amount: 350, ability: 'Berry Treasure', agility: '90 AG' },
    'character-15': { name: 'Emerald Master Trader', power: '690 CP', rarity: 'Rare', rarityClass: 'badge-rare', amount: 200, ability: 'Emerald Exchange', agility: '60 AG' }
  };

  let playerBalance = 1000;
  let isSpinning = false;

  const btnSpin = document.getElementById('btn-spin');
  const balanceEl = document.getElementById('player-balance');
  const mobTitle = document.getElementById('mob-name-title');
  const statPower = document.getElementById('stat-power');
  const statRarity = document.getElementById('stat-rarity');
  const statValue = document.getElementById('stat-value');
  const statAbility = document.getElementById('stat-ability');
  const statAgility = document.getElementById('stat-agility');

  const modal = document.getElementById('result-modal');
  const modalIcon = document.getElementById('modal-icon');
  const modalTitle = document.getElementById('modal-title');
  const modalSub = document.getElementById('modal-sub');
  const modalAmount = document.getElementById('modal-amount');
  const modalClose = document.getElementById('modal-close');

  const radioInputs = Array.from(document.querySelectorAll('input[name="character"]'));

  function updateGamifiedStats(characterId) {
    const data = MOB_DATA[characterId] || MOB_DATA['character-1'];
    if (mobTitle) mobTitle.textContent = data.name;
    if (statPower) statPower.textContent = data.power;
    if (statRarity) {
      statRarity.textContent = data.rarity;
      statRarity.className = `stat-val ${data.rarityClass}`;
    }
    if (statValue) {
      const isPositive = data.amount >= 0;
      statValue.textContent = (isPositive ? '+' : '') + data.amount + ' BIRR';
      statValue.className = `stat-val ${isPositive ? 'text-gain' : 'text-loss'}`;
    }
    if (statAbility) statAbility.textContent = data.ability;
    if (statAgility) statAgility.textContent = data.agility;
  }

  radioInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      if (!isSpinning) {
        updateGamifiedStats(e.target.id);
      }
    });
  });

  function playArcadeSound(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
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
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  }

  function startAutoPicker() {
    if (isSpinning) return;
    isSpinning = true;
    btnSpin.disabled = true;
    btnSpin.classList.add('spinning');

    let currentIdx = 0;
    let totalTicks = 0;
    const maxTicks = 25 + Math.floor(Math.random() * 10);
    let delay = 60;

    function step() {
      radioInputs[currentIdx].checked = false;
      currentIdx = (currentIdx + 1) % radioInputs.length;
      radioInputs[currentIdx].checked = true;
      radioInputs[currentIdx].focus();
      
      const charId = radioInputs[currentIdx].id;
      updateGamifiedStats(charId);
      playArcadeSound('tick');

      totalTicks++;

      if (totalTicks < maxTicks) {
        if (totalTicks > maxTicks - 8) {
          delay += 40;
        }
        setTimeout(step, delay);
      } else {
        isSpinning = false;
        btnSpin.disabled = false;
        btnSpin.classList.remove('spinning');
        showOutcome(charId);
      }
    }

    step();
  }

  function showOutcome(characterId) {
    const data = MOB_DATA[characterId];
    if (!data) return;

    playerBalance += data.amount;
    if (balanceEl) {
      balanceEl.textContent = playerBalance.toLocaleString() + ' BIRR';
    }

    const isWin = data.amount >= 0;
    playArcadeSound(isWin ? 'win' : 'loss');

    if (modal) {
      modalIcon.textContent = isWin ? (data.amount >= 400 ? '💎' : '🎉') : '💣';
      modalTitle.textContent = isWin ? (data.amount >= 400 ? 'JACKPOT REWARD!' : 'YOU WON BIRR!') : 'DANGER TRAP TRIGGERED!';
      modalTitle.style.color = isWin ? '#4ade80' : '#f87171';
      modalSub.textContent = `You landed on ${data.name}! (${data.ability})`;
      modalAmount.textContent = (isWin ? '+' : '') + data.amount + ' BIRR';
      modalAmount.className = `modal-amount ${isWin ? 'win' : 'loss'}`;
      modal.classList.remove('hidden');
    }
  }

  if (btnSpin) {
    btnSpin.addEventListener('click', startAutoPicker);
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isSpinning) {
      e.preventDefault();
      startAutoPicker();
    }
  });

  updateGamifiedStats('character-1');
})();