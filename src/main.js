/**
 * KOEL'S NEW YEAR EGG ADVENTURE
 * ─────────────────────────────────────────────────────────────
 * Take care of an Asian Koel Egg over 14 real calendar days.
 * Complete 4 daily actions to keep the egg healthy.
 * Day 14 = hatch day (Sinhala & Tamil New Year, April 14).
 *
 * Sprite sheet: artslab_sprite_collection.png
 *   1024×1024 px → 4 columns × 4 rows → each sprite 256×256 px
 *   Col 0 = neglected/cracked
 *   Col 1 = fair/normal
 *   Col 2 = good/glowing
 *   Col 3 = excellent/golden  (row 3 col 3 = hatched chick!)
 *   Row increases with game progress (days 1→14)
 */

// ─── Imports ──────────────────────────────────────────────────
import { initPlantUI } from './plantsUI.js';
import './plantDebug.js'; // Debug helpers for testing plants
import { plantInPot } from './plantDebug.js';
import { initLevel1 } from './level1.js';
import './level1Debug.js'; // Debug helpers for Level 1

// ─── Constants ────────────────────────────────────────────────
const STORAGE_KEY = 'avurudhu_bithara_v1';
const LEVEL1_STORAGE_KEY = 'avurudhu_bithara_level1_v1';
const TOTAL_DAYS = 14;
const ACTIONS = ['water', 'sing', 'feed', 'protect'];

// Health changes per day based on completed actions
const HEALTH_DELTA = {
	4: +5,   // all done  → improves
	3: 0,   // 3/4 done  → stable
	2: -8,   // 2/4 done  → slight drop
	1: -15,  // 1/4 done  → noticeable drop
	0: -20,  // none done → big drop (per missed day)
};

// ─── State helpers ────────────────────────────────────────────
function todayISO() {
	return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

function daysBetween(isoA, isoB) {
	const msPerDay = 1000 * 60 * 60 * 24;
	return Math.round((new Date(isoB) - new Date(isoA)) / msPerDay);
}

function makeDefaultState() {
	const today = todayISO();
	return {
		currentLevel: 1,  // 1 = map exploration, 2 = egg caring
		level1Complete: false,
		collectedItems: { egg: false, plants: [] }, // plants from Level 1
		startDate: today,
		lastVisitDate: today,
		currentDay: 1,
		streak: 0,
		eggHealth: 100,   // 0–100
		dailyActions: { water: false, sing: false, feed: false, protect: false },
		todayComplete: false,
		phase: 'playing',  // 'playing' | 'hatched' | 'gameover'
		coins: { gold: 0, red: 0, silver: 0 },  // coin collection
	};
}

function loadState() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return makeDefaultState();
		return { ...makeDefaultState(), ...JSON.parse(raw) };
	} catch {
		return makeDefaultState();
	}
}

function saveState(state) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Day advancement logic ────────────────────────────────────
/**
 * Called on page load.
 * If the calendar date has advanced since lastVisitDate,
 * processes each missed day and updates state accordingly.
 */
function processNewDays(state) {
	const today = todayISO();
	if (state.lastVisitDate === today) return state; // same day — nothing to do

	const daysMissed = daysBetween(state.lastVisitDate, today);

	// Process the LAST recorded day first (was it completed?)
	const lastDayActions = state.dailyActions;
	const lastCompleted = ACTIONS.filter(a => lastDayActions[a]).length;
	applyHealthDelta(state, lastCompleted);
	if (lastCompleted === 4) state.streak++;
	else if (lastCompleted < 3) state.streak = 0;

	// For any additional fully missed days (player was gone > 1 day)
	for (let i = 1; i < daysMissed; i++) {
		applyHealthDelta(state, 0);
		state.streak = 0;
		if (state.eggHealth <= 0) break;
	}

	// Advance to today
	const newDay = Math.min(TOTAL_DAYS, state.currentDay + daysMissed);
	state.currentDay = newDay;
	state.lastVisitDate = today;
	state.dailyActions = { water: false, sing: false, feed: false, protect: false };
	state.todayComplete = false;

	// Check terminal conditions
	if (state.eggHealth <= 0) state.phase = 'gameover';
	else if (state.currentDay >= TOTAL_DAYS && !state.todayComplete)
    /* Day 14 check happens after actions, not yet */;

	return state;
}

function applyHealthDelta(state, completedCount) {
	const delta = HEALTH_DELTA[completedCount] ?? HEALTH_DELTA[0];
	state.eggHealth = Math.max(0, Math.min(100, state.eggHealth + delta));
}

// ─── Sprite selection ─────────────────────────────────────────
/**
 * Maps (day, healthPercent) → {col, row} in the 4×4 sprite sheet.
 *
 * Rows increase with game progress:
 *   Row 0 → Days  1–4  (early stage)
 *   Row 1 → Days  5–8  (mid stage)
 *   Row 2 → Days  9–12 (late stage)
 *   Row 3 → Days 13–14 (hatching / end)
 *
 * Columns reflect care quality:
 *   Col 0 → poor  (<25 % health)
 *   Col 1 → fair  (25–49 %)
 *   Col 2 → good  (50–74 %)
 *   Col 3 → excellent (75–100 %)
 *
 * Special endings on Day 14:
 *   ≥50 % health → col 3 row 3 (chick hatched — best ending)
 *   <50  % health → col 0 row 3 (broken egg — bad ending)
 */
function getSpriteCoords(day, health) {
	// Terminal hatching day
	if (day >= TOTAL_DAYS) {
		return health >= 50
			? { col: 3, row: 3 }  // 🐣 Chick!
			: { col: 0, row: 3 }; // 💔 Broken egg
	}

	// Day-before-hatch (day 13): egg beginning to crack open
	if (day === 13) {
		return health >= 50
			? { col: 2, row: 3 }  // egg glowing pre-hatch
			: { col: 1, row: 3 }; // cracking badly
	}

	const row = day <= 4 ? 0 : day <= 8 ? 1 : 2;
	const col = health >= 75 ? 3 : health >= 50 ? 2 : health >= 25 ? 1 : 0;
	return { col, row };
}

function applySprite(col, row) {
	const el = document.getElementById('egg-sprite');
	// background-size: 400% 400% → image is 4× element width/height
	// position formula: (col/3)*100 %  (row/3)*100 %
	const xPct = (col / 3) * 100;
	const yPct = (row / 3) * 100;
	el.style.backgroundPosition = `${xPct}% ${yPct}%`;

	// Toggle health class for visual effect
	el.classList.toggle('healthy', col >= 2);
	el.classList.toggle('unhealthy', col < 2);
}

// ─── DOM helpers ──────────────────────────────────────────────
const $ = id => document.getElementById(id);

function updateUI(state) {
	// Day number
	$('day-number').textContent = state.currentDay;

	// Streak progress bar (fills day by day over 14 days)
	$('streak-bar-fill').style.width = `${(state.currentDay / TOTAL_DAYS) * 100}%`;

	// Health bar
	const hp = state.eggHealth;
	$('health-bar-fill').style.width = `${hp}%`;
	$('health-value').textContent = `${hp}%`;
	$('health-bar-fill').style.background = hp > 60
		? 'linear-gradient(to right, #4caf50, #8bc34a)'
		: hp > 30
			? 'linear-gradient(to right, #f5a623, #f7c948)'
			: 'linear-gradient(to right, #e53935, #f4511e)';

	// Action buttons (if they exist)
	for (const action of ACTIONS) {
		const btn = $(`btn-${action}`);
		if (!btn) continue;  // Skip if button doesn't exist
		const done = state.dailyActions[action];
		const countEl = btn.querySelector('.action-count');

		countEl.textContent = done ? '1/1 ✓' : '0/1';
		btn.classList.toggle('done', done);
		btn.disabled = done || state.phase !== 'playing';
	}

	// Egg sprite
	const { col, row } = getSpriteCoords(state.currentDay, state.eggHealth);
	applySprite(col, row);

	// Coin counts
	if ($('gold-count')) $('gold-count').textContent = state.coins.gold;
	if ($('red-count')) $('red-count').textContent = state.coins.red;
	if ($('silver-count')) $('silver-count').textContent = state.coins.silver;

	// Debug info
	$('debug-info').textContent =
		`Day ${state.currentDay} | HP ${state.eggHealth} | streak ${state.streak} | phase ${state.phase}`;
}

// ─── Message overlay ──────────────────────────────────────────
function showMessage(icon, html, closeCb) {
	$('message-icon').textContent = icon;
	$('message-text').innerHTML = html;
	$('message-overlay').classList.remove('hidden');

	const closeBtn = $('message-close');
	const handler = () => {
		$('message-overlay').classList.add('hidden');
		closeBtn.removeEventListener('click', handler);
		closeCb?.();
	};
	closeBtn.addEventListener('click', handler);
}

// ─── Action handler ───────────────────────────────────────────
function handleAction(state, action) {
	if (state.dailyActions[action]) return;
	if (state.phase !== 'playing') return;

	// Mark action done
	state.dailyActions[action] = true;

	// Visual feedback on the button (if it exists)
	const btn = $(`btn-${action}`);
	if (btn) {
		btn.classList.add('just-done');
		setTimeout(() => btn.classList.remove('just-done'), 400);
	}

	// Pop animation on egg
	const egg = $('egg-sprite');
	egg.style.animation = 'none';
	void egg.offsetWidth; // reflow
	egg.style.animation = 'eggPop 0.5s ease, eggFloat 3s ease-in-out 0.5s infinite';

	// Check if all done for today
	const allDone = ACTIONS.every(a => state.dailyActions[a]);
	if (allDone && !state.todayComplete) {
		state.todayComplete = true;

		// Reward health
		applyHealthDelta(state, 4);
		state.streak++;

		// Win condition: complete all actions on day 14
		if (state.currentDay >= TOTAL_DAYS) {
			state.phase = 'hatched';
			saveState(state);
			updateUI(state);
			triggerHatchEnding(state);
			return;
		}

		// Day-complete message (not the last day)
		saveState(state);
		updateUI(state);
		showMessage(
			'🌟',
			`<strong>All done for Day ${state.currentDay}!</strong><br>
       The egg feels happy and loved.<br>
       <em>Come back tomorrow to continue!</em><br>
       <small>Streak: ${state.streak} day${state.streak !== 1 ? 's' : ''}</small>`,
			null
		);
		return;
	}

	saveState(state);
	updateUI(state);
}

function triggerHatchEnding(state) {
	if (state.eggHealth >= 75) {
		showMessage(
			'🐣',
			`<strong>The egg has hatched!</strong><br>
       The Koel chick chirps happily into the<br>
       Sinhala &amp; Tamil New Year!<br>
       <br>
       <strong>🌺 Subha Aluth Avuruddak Weva! 🌺</strong><br>
       <small>Final health: ${state.eggHealth}% — Excellent care!</small>`,
			null
		);
	} else {
		showMessage(
			'🐣',
			`<strong>The egg has hatched!</strong><br>
       The chick is a little tired but alive.<br>
       Try to care better next time!<br>
       <small>Final health: ${state.eggHealth}%</small>`,
			null
		);
	}
}

// ─── Phase screens ────────────────────────────────────────────
function checkEndStates(state) {
	if (state.phase === 'gameover') {
		showMessage(
			'💔',
			`<strong>The egg didn't make it…</strong><br>
       The Koel egg grew too weak without care.<br>
       <em>Start a new journey?</em>`,
			() => {
				state = makeDefaultState();
				saveState(state);
				updateUI(state);
			}
		);
		// Disable actions (if buttons exist)
		for (const a of ACTIONS) {
			const btn = $(`btn-${a}`);
			if (btn) btn.disabled = true;
		}
	} else if (state.phase === 'hatched') {
		triggerHatchEnding(state);
	}
}

// ─── New-day notification ─────────────────────────────────────
function maybeShowNewDayMessage(state, wasNewDay, missedDays) {
	if (!wasNewDay) return;

	if (missedDays > 1) {
		showMessage(
			'😔',
			`<strong>You were away for ${missedDays} days…</strong><br>
       The egg missed you badly.<br>
       <em>Health dropped to ${state.eggHealth}%.</em><br>
       <small>Protect what's left — take your actions today!</small>`,
			null
		);
	} else {
		if (state.currentDay <= TOTAL_DAYS && state.phase === 'playing') {
			showMessage(
				'🌅',
				`<strong>Day ${state.currentDay} of ${TOTAL_DAYS}!</strong><br>
         The sun rises on a new morning.<br>
         <em>Complete your 4 daily actions to nurture the egg!</em>`,
				null
			);
		}
	}
}

// ─── Level Management ─────────────────────────────────────────
/**
 * Switch between Level 1 (map exploration) and Level 2 (egg caring)
 */
function switchLevel(state, targetLevel) {
	const level1Screen = $('level1-screen');
	const gameContainer = $('game-container');

	if (targetLevel === 1) {
		level1Screen.classList.remove('hidden');
		gameContainer.classList.add('hidden');
		state.currentLevel = 1;
	} else if (targetLevel === 2) {
		level1Screen.classList.add('hidden');
		gameContainer.classList.remove('hidden');
		state.currentLevel = 2;

		// Transfer collected plants to Level 2 on first transition
		if (!state.level1Complete) {
			transferLevel1Items(state);
			state.level1Complete = true;
		}
	}

	saveState(state);
}

/**
 * Transfer collected items from Level 1 to Level 2
 */
function transferLevel1Items(state) {
	const { plants } = state.collectedItems;

	// Pre-plant collected plants in first N pots
	if (plants.length > 0) {
		plants.forEach((plantType, index) => {
			if (index < 10) { // Max 10 pots (actually 9, but safe limit)
				plantInPot(index, plantType);
			}
		});
	}

	// Show welcome message for Level 2
	if (plants.length > 0 || state.collectedItems.egg) {
		setTimeout(() => {
			showMessage(
				'🌱',
				`<strong>Your journey begins!</strong><br>
         You collected: ${state.collectedItems.egg ? '🥚 Egg' : ''} 
         ${plants.length > 0 ? `and ${plants.length} plant${plants.length > 1 ? 's' : ''}` : ''}!<br>
         <br>
         <em>Now nurture your egg for 14 days!</em>`,
				null
			);
		}, 500);
	}
}

/**
 * Plant daily coin yields
 */
const PLANT_COIN_YIELDS = {
	rose: { gold: 5, red: 0, silver: 0 },
	marigold: { gold: 3, red: 2, silver: 0 },
	sunflower: { gold: 8, red: 0, silver: 0 },
	daffodil: { gold: 2, red: 0, silver: 1 }
};

/**
 * Generate daily coins from plants collected in Level 1
 */
function generateDailyPlantCoins(state) {
	if (state.currentLevel !== 2 || !state.collectedItems.plants) return;

	const { plants } = state.collectedItems;
	let totalGold = 0, totalRed = 0, totalSilver = 0;

	plants.forEach(plantType => {
		const yield_ = PLANT_COIN_YIELDS[plantType] || { gold: 0, red: 0, silver: 0 };
		totalGold += yield_.gold;
		totalRed += yield_.red;
		totalSilver += yield_.silver;
	});

	if (totalGold > 0 || totalRed > 0 || totalSilver > 0) {
		state.coins.gold += totalGold;
		state.coins.red += totalRed;
		state.coins.silver += totalSilver;

		// Show notification
		showMessage(
			'🌺',
			`<strong>Your plants earned coins!</strong><br>
       +${totalGold} gold, +${totalRed} red, +${totalSilver} silver`,
			null
		);
	}
}

// ─── Init ─────────────────────────────────────────────────────
function init() {
	let state = loadState();
	const today = todayISO();

	// Check which level to initialize
	if (state.currentLevel === 1) {
		// Initialize Level 1 (map exploration)
		switchLevel(state, 1);
		initLevel1(state);
		return;
	}

	// Level 2 initialization (existing egg-caring game)
	// Detect new day(s)
	const wasNewDay = state.lastVisitDate !== today;
	const missedDays = wasNewDay ? daysBetween(state.lastVisitDate, today) : 0;

	if (wasNewDay) {
		state = processNewDays(state);

		// Generate daily coins from plants
		generateDailyPlantCoins(state);

		saveState(state);
	}

	// First ever visit
	if (!wasNewDay && state.streak === 0 && ACTIONS.every(a => !state.dailyActions[a])) {
		// First load on day 1 — show welcome
		if (state.currentDay === 1) {
			setTimeout(() => {
				showMessage(
					'🥚',
					`<strong>Welcome to Koel's New Year Egg Adventure!</strong><br>
           A Koel egg has been entrusted to you.<br>
           <br>
           Complete 4 daily actions each day for <strong>14 days</strong>.<br>
           Keep your streak alive and watch it hatch on<br>
           <strong>Sinhala &amp; Tamil New Year (April 14)!</strong>`,
					null
				);
			}, 500);
		}
	}

	updateUI(state);
	checkEndStates(state);
	maybeShowNewDayMessage(state, wasNewDay, missedDays);

	// ── Wire action buttons (if they exist) ──
	for (const action of ACTIONS) {
		const btn = $(`btn-${action}`);
		if (btn) {
			btn.addEventListener('click', () => {
				handleAction(state, action);
			});
		}
	}

	// ── Message close (already wired per call) ──
	// (see showMessage above)

	// ── Debug controls ──
	$('debug-next-day').addEventListener('click', () => {
		if (state.phase !== 'playing') return;

		// Simulate next day: process current day actions then advance
		const completedCount = ACTIONS.filter(a => state.dailyActions[a]).length;
		applyHealthDelta(state, completedCount);
		if (completedCount === 4) state.streak++;
		else if (completedCount < 3) state.streak = 0;

		state.currentDay = Math.min(TOTAL_DAYS, state.currentDay + 1);
		state.dailyActions = { water: false, sing: false, feed: false, protect: false };
		state.todayComplete = false;

		if (state.eggHealth <= 0) state.phase = 'gameover';
		else if (state.currentDay >= TOTAL_DAYS && state.todayComplete) state.phase = 'hatched';

		saveState(state);
		updateUI(state);
		checkEndStates(state);
	});

	$('debug-reset').addEventListener('click', () => {
		state = makeDefaultState();
		saveState(state);
		updateUI(state);
		$('message-overlay').classList.add('hidden');
	});

	// Ctrl+D → toggle debug panel
	document.addEventListener('keydown', e => {
		if (e.ctrlKey && e.key === 'd') {
			e.preventDefault();
			$('debug-panel').classList.toggle('hidden');
		}
	});

	// ── Crow/bird infestation ──
	startCrowSystem();

	// ── Watering can tool ──
	startWateringCanSystem();

	// ── Drums ──
	startDrumSystem();

	// ── Background ambient music ──
	startBackgroundMusic();

	// ── Plant system ──
	initPlantUI();
}

// ─── Coin Animation System ────────────────────────────────────
/**
 * Spawns an animated coin from a source element that flies
 * upward, then falls with gravity to the coin counter.
 * @param {string} type - 'gold', 'red', or 'silver'
 * @param {HTMLElement} sourceElement - Element to spawn from
 */
function spawnCoin(type, sourceElement) {
	const container = $('game-container');
	const sourceRect = sourceElement.getBoundingClientRect();
	const containerRect = container.getBoundingClientRect();

	// Create coin element
	const coin = document.createElement('img');
	coin.className = 'flying-coin';
	coin.src = type === 'red' ? 'assets/images/coin_red.png' : type === 'silver' ? 'assets/images/coin_silver.png' : 'assets/images/coin.png';

	// Start position (center of source element)
	const startX = sourceRect.left + sourceRect.width / 2 - containerRect.left;
	const startY = sourceRect.top + sourceRect.height / 2 - containerRect.top;

	coin.style.left = `${startX}px`;
	coin.style.top = `${startY}px`;
	coin.style.transform = 'translate(-50%, -50%)';

	container.appendChild(coin);

	// Target position (coin counter in sidebar)
	const targetCounter = $(`${type}-counter`);
	if (!targetCounter) {
		coin.remove();
		return;
	}
	const targetRect = targetCounter.getBoundingClientRect();
	const targetX = targetRect.left + targetRect.width / 2 - containerRect.left;
	const targetY = targetRect.top + targetRect.height / 2 - containerRect.top;

	// Phase 1: Shoot upward
	const upwardY = startY - 120; // Go up by 120px
	const arcX = startX + (Math.random() - 0.5) * 40; // Add slight horizontal variance

	coin.style.transition = 'left 0.4s ease-out, top 0.4s ease-out';

	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			coin.style.left = `${arcX}px`;
			coin.style.top = `${upwardY}px`;
		});
	});

	// Phase 2: Fall with gravity to target
	setTimeout(() => {
		const fallDuration = 800; // 800ms fall time
		coin.style.transition = `left ${fallDuration}ms ease-in, top ${fallDuration}ms cubic-bezier(0.5, 0, 0.9, 1)`;
		coin.style.left = `${targetX}px`;
		coin.style.top = `${targetY}px`;

		// After reaching target, remove coin and increment counter
		setTimeout(() => {
			coin.remove();
			incrementCoin(type);
		}, fallDuration);
	}, 400); // Wait for upward phase to complete
}

/**
 * Increments the coin counter and updates the UI
 * @param {string} type - 'gold', 'red', or 'silver'
 */
function incrementCoin(type) {
	const state = loadState();
	state.coins[type]++;
	saveState(state);

	// Update UI counter with pop animation
	const countEl = $(`${type}-count`);
	if (countEl) {
		countEl.textContent = state.coins[type];
		const counter = $(`${type}-counter`);
		if (counter) {
			counter.style.animation = 'none';
			void counter.offsetWidth; // Reflow
			counter.style.animation = 'coinPop 0.3s ease';
		}
	}
}

// ─── Drum System ──────────────────────────────────────────────
/**
 * Pair of drums (hand drums/bongos) positioned together
 * Click either drum - both drum together in alternating motion for 5 seconds
 */
let drumsPlaying = false;

function startDrumSystem() {
	const drumLeft = $('drum-left');
	const drumRight = $('drum-right');

	if (!drumLeft || !drumRight) return;

	// Click either drum to start both drumming
	drumLeft.addEventListener('click', () => playDrums());
	drumRight.addEventListener('click', () => playDrums());
}

function playDrums() {
	if (drumsPlaying) return; // Already drumming

	const drumLeft = $('drum-left');
	const drumRight = $('drum-right');

	drumsPlaying = true;

	// Generate a red coin
	spawnCoin('red', drumLeft);

	// Play drumroll audio
	const audio = new Audio('assets/audio/drumroll.mp3');
	audio.play().catch(err => console.log('Audio play failed:', err));

	// Start alternating vibration animation on both drums
	drumLeft.classList.add('drumming');
	drumRight.classList.add('drumming');

	// Also make the egg vibrate
	const egg = $('egg-sprite');
	if (egg) {
		egg.style.animation = 'none';
		void egg.offsetWidth; // reflow
		egg.style.animation = 'drumVibrate 0.15s ease-in-out infinite, eggFloat 3s ease-in-out infinite';
	}

	// Stop after 5 seconds
	setTimeout(() => {
		drumLeft.classList.remove('drumming');
		drumRight.classList.remove('drumming');
		drumsPlaying = false;

		// Restore egg animation
		if (egg) {
			egg.style.animation = 'eggFloat 3s ease-in-out infinite';
		}
	}, 5000);
}

// ─── Background Music System ──────────────────────────────────
/**
 * Plays ambient background music at random intervals
 * Minimum 20 seconds between plays, with added randomness
 */
function startBackgroundMusic() {
	function playRandomBackground() {
		const audio = new Audio('assets/audio/bg_random.mp3');
		audio.play().catch(err => console.log('Background audio play failed:', err));

		// Schedule next play: 20-45 seconds random interval
		const minDelay = 20000; // 20 seconds minimum
		const randomDelay = Math.random() * 25000; // 0-25 seconds additional
		const nextPlayDelay = minDelay + randomDelay;

		setTimeout(playRandomBackground, nextPlayDelay);
	}

	// Start first play after initial delay (5-10 seconds after page load)
	const initialDelay = 5000 + Math.random() * 5000;
	setTimeout(playRandomBackground, initialDelay);
}

// ─── Watering Can System ──────────────────────────────────
/**
 * Interactive watering can that can be picked up and used
 * - Click to select/pick up the can
 * - Follows cursor when selected
 * - Left click while holding to water (plays animation)
 * - Click again to drop back to original position
 */
let canSelected = false;
let canElement = null;
let canHomePosition = { x: 0, y: 0 };

function startWateringCanSystem() {
	canElement = $('watering-can');
	if (!canElement) return;

	// Store home position (initial position)
	const rect = canElement.getBoundingClientRect();
	const container = $('game-container').getBoundingClientRect();
	canHomePosition.x = rect.left - container.left + rect.width / 2;
	canHomePosition.y = rect.top - container.top + rect.height / 2;

	// Click on can to select it (only when not already selected)
	canElement.addEventListener('click', (e) => {
		if (!canSelected) {
			e.stopPropagation();
			selectCan();
		} else {
			// If already selected, trigger watering
			waterAction();
		}
	});

	// Track mouse movement when can is selected
	document.addEventListener('mousemove', (e) => {
		if (canSelected && canElement) {
			const container = $('game-container');
			const rect = container.getBoundingClientRect();

			// Convert mouse position to position relative to container
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			// Update can position (centered on cursor)
			canElement.style.left = `${x}px`;
			canElement.style.top = `${y}px`;
			canElement.style.transform = 'translate(-50%, -50%)';
		}
	});

	// Right-click to deselect and return home
	document.addEventListener('contextmenu', (e) => {
		if (canSelected) {
			e.preventDefault();
			deselectCan();
		}
	});

	// Left-click anywhere else while holding can to water
	document.addEventListener('click', (e) => {
		if (canSelected && e.target !== canElement) {
			waterAction();
		}
	});
}

function selectCan() {
	canSelected = true;
	canElement.classList.add('selected');

	// Store original parent for later
	if (!canElement.dataset.originalParent) {
		canElement.dataset.originalParent = canElement.parentElement.id;
	}

	// Move can to be direct child of game-container for absolute positioning
	const container = $('game-container');
	container.appendChild(canElement);

	// Clear all positioning - will be set by mousemove
	canElement.style.bottom = '';
	canElement.style.left = '';
	canElement.style.top = '';
	canElement.style.right = '';
}

function deselectCan() {
	canSelected = false;
	canElement.classList.remove('selected');

	// Move can back to original parent
	const originalParent = $(canElement.dataset.originalParent);
	if (originalParent) {
		originalParent.appendChild(canElement);
	}

	// Clear inline styles to let CSS defaults take over
	canElement.style.left = '';
	canElement.style.bottom = '';
	canElement.style.top = '';
	canElement.style.right = '';
	canElement.style.transform = '';

	// Reset sprite to frame 0
	canElement.style.backgroundPosition = '0% 0%';
}

function waterAction() {
	if (canElement.classList.contains('watering')) return;  // Already watering

	// Play pouring sound
	const pourSound = new Audio('assets/audio/pourcan.mp3');
	pourSound.play().catch(err => console.log('Audio play failed:', err));

	// Play watering animation
	canElement.classList.add('watering');

	// Animate through sprite frames
	let frame = 0;
	const frameInterval = setInterval(() => {
		frame++;
		if (frame <= 4) {
			// Calculate background position for 5-frame sprite (0%, 25%, 50%, 75%, 100%)
			const xPos = (frame / 4) * 100;
			canElement.style.backgroundPosition = `${xPos}% 0%`;
		}
	}, 160);  // 160ms per frame = 800ms total for 5 frames

	// Check if watering the egg
	const canRect = canElement.getBoundingClientRect();
	const eggRect = $('egg-sprite')?.getBoundingClientRect();

	if (eggRect) {
		const distance = Math.hypot(
			canRect.left + canRect.width / 2 - (eggRect.left + eggRect.width / 2),
			canRect.top + canRect.height / 2 - (eggRect.top + eggRect.height / 2)
		);

		// If close enough to egg, trigger water action effect
		if (distance < 150) {
			// Visual feedback on egg
			const egg = $('egg-sprite');
			egg.style.animation = 'none';
			void egg.offsetWidth; // reflow
			egg.style.animation = 'eggPop 0.5s ease, eggFloat 3s ease-in-out 0.5s infinite';
		}
	}

	// Remove animation class after animation completes
	setTimeout(() => {
		clearInterval(frameInterval);
		canElement.classList.remove('watering');
		canElement.style.backgroundPosition = '0% 0%';  // Reset to frame 0
	}, 800);  // Match animation duration
}

// ─── Crow / Bird system ───────────────────────────────────────
/**
 * crow_sprite.png — 7-frame horizontal strip
 *   Frame 0 : stationary perch
 *   Frames 1–6 : fly-away animation
 *
 * Crows spawn near the egg basket and scatter on click.
 */
const CROW_FRAMES = 6;
const CROW_FLY_FRAME_MS = 70;   // ms per fly frame  (fast flap)
const CROW_FLY_DURATION = 700;  // total flight-off duration in ms
const MAX_CROWS = 6;

let crowRespawnTimer = null;

function spawnCrows() {
	const container = $('game-container');
	const count = 2 + Math.floor(Math.random() * 3); // 2–4 birds
	for (let i = 0; i < count; i++) {
		setTimeout(() => {
			if (document.querySelectorAll('.crow').length < MAX_CROWS) {
				createCrow(container);
			}
		}, i * 480 + Math.random() * 350);
	}
}

function createCrow(container) {
	const el = document.createElement('div');
	el.className = 'crow flying-in';

	// Target perch position (right-centre of scene)
	const targetX = 48 + Math.random() * 33;  // 48–81 %
	const targetY = 60 + Math.random() * 16;  // 60–76 %

	// Randomly face left (default) or right (flipped via scaleX(-1))
	const faceRight = Math.random() > 0.5;
	el.dataset.faceRight = faceRight ? '1' : '0';
	if (faceRight) el.classList.add('face-right');

	// Enter from the SAME side the bird departs to, so it always
	// travels in the same horizontal direction as fly-away:
	// faceRight=true → flies away LEFT → enters from RIGHT, sweeps left to land
	// faceRight=false → flies away RIGHT → enters from LEFT, sweeps right to land
	const entryX = faceRight ? targetX + 55 : targetX - 55;
	const entryY = targetY - 90;
	el.style.left = `${entryX}%`;
	el.style.top = `${entryY}%`;
	el.style.opacity = '0';

	container.appendChild(el);

	// Flap wings during descent
	const FLY_IN_MS = 750;
	let frame = 1;
	setCrowFrame(el, frame);
	const frameTimer = setInterval(() => {
		frame = (frame % (CROW_FRAMES - 1)) + 1;
		setCrowFrame(el, frame);
	}, CROW_FLY_FRAME_MS);

	// Trigger glide-in transition on the very next paint
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			el.style.transition =
				`left ${FLY_IN_MS}ms linear, ` +
				`top  ${FLY_IN_MS}ms ease-out, ` +
				`opacity 120ms linear`;
			el.style.left = `${targetX}%`;
			el.style.top = `${targetY}%`;
			el.style.opacity = '1';
		});
	});

	// After landing: stop flapping, switch to idle bob
	setTimeout(() => {
		clearInterval(frameTimer);
		el.style.transition = '';
		el.classList.remove('flying-in');
		el.classList.add('idle');
		setCrowFrame(el, 0);
		el.addEventListener('click', () => flyAwayCrow(el));
		// Start idle behavior (random hops and caws)
		startCrowIdleBehavior(el);
	}, FLY_IN_MS + 80);
}

function flyAwayCrow(el) {
	if (el.classList.contains('flying-away')) return;

	// Cancel idle behavior
	if (el.idleBehaviorTimer) {
		clearTimeout(el.idleBehaviorTimer);
		el.idleBehaviorTimer = null;
	}

	el.classList.remove('idle');
	el.classList.add('flying-away');

	// Spawn silver coin from crow position
	spawnCoin('silver', el);

	// Play all sounds together
	const cawSound = new Audio('assets/audio/single_crow.mp3');
	const flyawayAudio = new Audio('assets/audio/flyaway.mp3');
	cawSound.play().catch(err => console.log('Audio play failed:', err));
	flyawayAudio.play().catch(err => console.log('Audio play failed:', err));

	// Second caw after brief delay
	setTimeout(() => {
		const cawSound2 = new Audio('assets/audio/single_crow.mp3');
		cawSound2.play().catch(err => console.log('Audio play failed:', err));
	}, 150);

	const faceRight = el.dataset.faceRight === '1';
	const startX = parseFloat(el.style.left);
	const startY = parseFloat(el.style.top);

	// Fly in the direction the bird faces, swooping upward off-screen
	// Sprite faces right by default; .face-right applies scaleX(-1) → faces left
	const moveX = faceRight ? -55 : 55;
	const moveY = -90;

	// Animate sprite frames 1–6 rapidly
	let frame = 1;
	setCrowFrame(el, frame);
	const frameTimer = setInterval(() => {
		frame = (frame % (CROW_FRAMES - 1)) + 1;   // cycles 1 → 2 → … → 6 → 1
		setCrowFrame(el, frame);
	}, CROW_FLY_FRAME_MS);

	// CSS transition for smooth positional movement + fade-out
	el.style.transition =
		`left ${CROW_FLY_DURATION}ms linear, ` +
		`top  ${CROW_FLY_DURATION}ms ease-in, ` +
		`opacity ${Math.round(CROW_FLY_DURATION * 0.35)}ms linear ${Math.round(CROW_FLY_DURATION * 0.65)}ms`;

	// Trigger movement on the very next paint so transition fires
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			el.style.left = `${startX + moveX}%`;
			el.style.top = `${startY + moveY}%`;
			el.style.opacity = '0';
		});
	});

	setTimeout(() => {
		clearInterval(frameTimer);
		el.remove();
		onCrowRemoved();
	}, CROW_FLY_DURATION + 60);
}

function setCrowFrame(el, frameIndex) {
	// background-size: 700% 100% → 7 equal columns
	// x-position formula identical to egg-sprite: (index / max) × 100 %
	const xPct = (frameIndex / (CROW_FRAMES - 1)) * 100;
	el.style.backgroundPosition = `${xPct}% 0%`;
}

function startCrowIdleBehavior(el) {
	if (!el.classList.contains('idle')) return;

	// Random delay between 3-8 seconds before next action
	const delay = 3000 + Math.random() * 5000;

	el.idleBehaviorTimer = setTimeout(() => {
		if (!el.classList.contains('idle')) return; // Crow might have flown away

		// Play crow caw sound
		const cawSound = new Audio('assets/audio/single_crow.mp3');
		cawSound.play().catch(err => console.log('Audio play failed:', err));

		// Make crow hop slightly
		const currentTop = parseFloat(el.style.top);
		el.style.transition = 'top 150ms ease-out';
		el.style.top = `${currentTop - 3}%`;

		// Return to original position
		setTimeout(() => {
			if (el.classList.contains('idle')) {
				el.style.transition = 'top 150ms ease-in';
				el.style.top = `${currentTop}%`;
				// Reset transition after hop completes
				setTimeout(() => {
					el.style.transition = '';
					// Schedule next idle action
					startCrowIdleBehavior(el);
				}, 150);
			}
		}, 150);
	}, delay);
}

function onCrowRemoved() {
	const remaining = document.querySelectorAll('.crow').length;
	if (remaining === 0) {
		// All crows shooed — bring a new flock after a quiet pause
		if (crowRespawnTimer) clearTimeout(crowRespawnTimer);
		crowRespawnTimer = setTimeout(spawnCrows, 9000 + Math.random() * 6000);
	}
}

function startCrowSystem() {
	// First flock lands a couple of seconds after page load
	setTimeout(spawnCrows, 2500);
}

// ─── Start ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

// ─── Exports for Level 1 ──────────────────────────────────────
export { switchLevel, saveState, loadState, showMessage, spawnCoin };
