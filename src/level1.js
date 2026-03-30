/**
 * LEVEL 1: MAP EXPLORATION & MINI-GAMES
 * ─────────────────────────────────────────────────────────────
 * Players explore a map (bg.png), click hotspots to play mini-games
 * (tile match, riddles, tofu hunter) and collect an egg + at least 2 plants.
 * Once all hotspots are played, Level 1 locks permanently.
 */

import { switchLevel, saveState, loadState, showMessage } from './main.js';
import { initLevel1UI, updateProgressDisplay, showGameModal, showNarratorHelp } from './level1UI.js';
import { TileMatchGame, RiddleGame, TofuHunterGame } from './miniGames.js';

// ─── Constants ────────────────────────────────────────────────
const LEVEL1_STORAGE_KEY = 'avurudhu_bithara_level1_v1';
const TOTAL_HOTSPOTS = 12;
const GAME_TYPES = ['tilematch', 'riddle', 'tofuhunter'];
const PLANT_TYPES = ['rose', 'marigold', 'sunflower', 'daffodil'];
const MAX_RETRIES = 2; // Q1: Option B - Allow 2 retries per game

// ─── Level 1 State ────────────────────────────────────────────
let level1State = null;

function makeDefaultLevel1State() {
	return {
		hotspots: [],  // Array of {id, x, y, gameType, reward, state, retries}
		itemsCollected: { egg: false, plants: [] },
		gamesPlayed: 0,
		level1Locked: false
	};
}

function loadLevel1State() {
	try {
		const raw = localStorage.getItem(LEVEL1_STORAGE_KEY);
		if (!raw) return makeDefaultLevel1State();
		return { ...makeDefaultLevel1State(), ...JSON.parse(raw) };
	} catch {
		return makeDefaultLevel1State();
	}
}

function saveLevel1State(state) {
	localStorage.setItem(LEVEL1_STORAGE_KEY, JSON.stringify(state));
}

// ─── Hotspot Generation ───────────────────────────────────────
/**
 * Generate hotspot positions clustered in 3-4 regions (Q3: Option B)
 */
function generateHotspots() {
	const hotspots = [];

	// Define 4 regions on the map (% based positioning)
	// Q3: Loosely clustered in regions for exploration feel
	const regions = [
		{ centerX: 25, centerY: 35, radius: 15 },  // Top-left region
		{ centerX: 65, centerY: 30, radius: 18 },  // Top-right region
		{ centerX: 40, centerY: 65, radius: 16 },  // Bottom-center region
		{ centerX: 75, centerY: 70, radius: 14 }   // Bottom-right region
	];

	// Distribute hotspots across regions (3-4 per region)
	const hotspotsPerRegion = Math.floor(TOTAL_HOTSPOTS / regions.length);
	const remainder = TOTAL_HOTSPOTS % regions.length;

	let hotspotId = 0;

	regions.forEach((region, regionIndex) => {
		const count = hotspotsPerRegion + (regionIndex < remainder ? 1 : 0);

		for (let i = 0; i < count; i++) {
			// Generate position within region with some randomness
			const angle = Math.random() * Math.PI * 2;
			const distance = Math.random() * region.radius;
			const x = region.centerX + Math.cos(angle) * distance;
			const y = region.centerY + Math.sin(angle) * distance;

			// Ensure within map bounds (10% - 90%)
			const clampedX = Math.max(10, Math.min(90, x));
			const clampedY = Math.max(10, Math.min(90, y));

			// Assign game type (evenly distributed)
			const gameType = GAME_TYPES[hotspotId % GAME_TYPES.length];

			// Assign rewards: ensure at least 2 eggs and 4+ plants across all hotspots
			let reward;
			if (hotspotId < 2) {
				reward = { type: 'egg' };
			} else {
				const plantIndex = (hotspotId - 2) % PLANT_TYPES.length;
				reward = { type: 'plant', plantType: PLANT_TYPES[plantIndex] };
			}

			hotspots.push({
				id: hotspotId,
				x: clampedX,
				y: clampedY,
				gameType,
				reward,
				state: 'available',  // 'available' | 'playing' | 'won' | 'failed'
				retries: MAX_RETRIES  // Q1: Allow retries
			});

			hotspotId++;
		}
	});

	return hotspots;
}

// ─── Hotspot Collision Check ──────────────────────────────────
function checkCollision(hotspots, x, y, minDistance = 8) {
	return hotspots.some(h => {
		const dx = h.x - x;
		const dy = h.y - y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance < minDistance;
	});
}

// ─── Game Flow ────────────────────────────────────────────────
/**
 * Initialize Level 1
 */
export function initLevel1(mainState) {
	level1State = loadLevel1State();

	// Generate hotspots on first visit
	if (level1State.hotspots.length === 0) {
		level1State.hotspots = generateHotspots();
		saveLevel1State(level1State);
	}

	// Check if Level 1 is already complete
	if (level1State.level1Locked) {
		// Auto-transition to Level 2
		switchLevel(mainState, 2);
		return;
	}

	// Initialize UI
	initLevel1UI(level1State, onHotspotClick);
	updateProgressDisplay(level1State);

	// Show welcome message
	setTimeout(() => {
		showMessage(
			'🗺️',
			`<strong>Welcome to Avurudhu Bithara!</strong><br>
			Explore the map and click on glowing spots.<br>
			<br>
			Play mini-games to collect:<br>
			🥚 <strong>1 Egg</strong> (required)<br>
			🌸 <strong>2+ Plants</strong> (required)<br>
			<br>
			<em>Good luck!</em>`,
			null
		);
	}, 500);
}

/**
 * Handle hotspot click
 */
function onHotspotClick(hotspotId) {
	const hotspot = level1State.hotspots.find(h => h.id === hotspotId);
	if (!hotspot) return;

	// Check if hotspot is available
	if (hotspot.state !== 'available') {
		if (hotspot.state === 'won') {
			showMessage('✅', 'You already completed this challenge!', null);
		} else if (hotspot.state === 'failed' && hotspot.retries === 0) {
			showMessage('❌', 'No retries left for this challenge.', null);
		}
		return;
	}

	// Mark as playing (prevent multiple clicks)
	hotspot.state = 'playing';
	saveLevel1State(level1State);

	// Launch appropriate mini-game
	let game;
	switch (hotspot.gameType) {
		case 'tilematch':
			game = new TileMatchGame();
			break;
		case 'riddle':
			game = new RiddleGame();
			break;
		case 'tofuhunter':
			game = new TofuHunterGame();
			break;
		default:
			console.error('Unknown game type:', hotspot.gameType);
			return;
	}

	// Show narrator help first, then game modal after dismissal
	showNarratorHelp(
		game,
		// On continue (user clicks dialog)
		() => {
			showGameModal(
				game,
				hotspot.reward,
				(won) => onGameComplete(hotspot, won)
			);
		},
		// On cancel (user clicks outside)
		() => {
			// Reset hotspot state back to available
			hotspot.state = 'available';
			saveLevel1State(level1State);
		}
	);
}

/**
 * Handle game completion
 */
function onGameComplete(hotspot, won) {
	if (won) {
		// Mark as won
		hotspot.state = 'won';
		level1State.gamesPlayed++;

		// Award reward
		if (hotspot.reward.type === 'egg') {
			level1State.itemsCollected.egg = true;
		} else if (hotspot.reward.type === 'plant') {
			level1State.itemsCollected.plants.push(hotspot.reward.plantType);
		}

		saveLevel1State(level1State);

		// Update progress display
		updateProgressDisplay(level1State);

		// Check if requirements met
		checkLevel1Complete();

	} else {
		// Failed - check retries
		hotspot.retries--;

		if (hotspot.retries > 0) {
			// Allow retry
			hotspot.state = 'available';
			showMessage(
				'💪',
				`<strong>Try again!</strong><br>
				You have ${hotspot.retries} ${hotspot.retries === 1 ? 'retry' : 'retries'} left.`,
				null
			);
		} else {
			// No retries left
			hotspot.state = 'failed';
			level1State.gamesPlayed++;
		}

		saveLevel1State(level1State);
		updateProgressDisplay(level1State);

		// Check if all hotspots exhausted
		checkLevel1Complete();
	}
}

/**
 * Check if Level 1 is complete
 */
function checkLevel1Complete() {
	const { egg, plants } = level1State.itemsCollected;
	const allHotspotsPlayed = level1State.hotspots.every(
		h => h.state === 'won' || h.state === 'failed'
	);

	// Requirements met
	if (egg && plants.length >= 2) {
		// Update main state with collected items
		const mainState = loadState();
		mainState.collectedItems = { egg, plants: [...plants] };
		mainState.level1Complete = true;
		saveState(mainState);

		// Lock Level 1
		level1State.level1Locked = true;
		saveLevel1State(level1State);

		// Show completion message
		showMessage(
			'🎉',
			`<strong>Congratulations!</strong><br>
			You collected:<br>
			🥚 Egg<br>
			🌸 ${plants.length} Plant${plants.length > 1 ? 's' : ''}<br>
			<br>
			<button id="start-level2-btn" style="
				background: linear-gradient(to bottom, #e8a820, #c98810);
				color: #fff;
				border: 2px solid #6b3a1f;
				border-radius: 12px;
				padding: 8px 24px;
				font-family: 'Cinzel Decorative', serif;
				font-size: 14px;
				cursor: pointer;
				margin-top: 12px;
			">Start Your Adventure!</button>`,
			() => {
				const btn = document.getElementById('start-level2-btn');
				if (btn) {
					btn.addEventListener('click', () => {
						switchLevel(mainState, 2);
						document.getElementById('message-overlay').classList.add('hidden');
						location.reload(); // Reload to initialize Level 2
					});
				}
			}
		);

		return true;
	}

	// All hotspots played but requirements not met
	if (allHotspotsPlayed) {
		// Lock Level 1 anyway
		level1State.level1Locked = true;
		saveLevel1State(level1State);

		// Update main state
		const mainState = loadState();
		mainState.collectedItems = { egg, plants: [...plants] };
		mainState.level1Complete = true;
		saveState(mainState);

		// Show partial completion message
		showMessage(
			'😔',
			`<strong>All challenges complete!</strong><br>
			You collected:<br>
			${egg ? '🥚 Egg<br>' : ''}
			${plants.length > 0 ? `🌸 ${plants.length} Plant${plants.length > 1 ? 's' : ''}<br>` : ''}
			<br>
			${!egg ? '<em>No egg collected - this will make the game harder!</em><br>' : ''}
			${plants.length < 2 ? '<em>Less than 2 plants - you\'ll earn fewer coins!</em><br>' : ''}
			<br>
			<button id="start-level2-btn" style="
				background: linear-gradient(to bottom, #e8a820, #c98810);
				color: #fff;
				border: 2px solid #6b3a1f;
				border-radius: 12px;
				padding: 8px 24px;
				font-family: 'Cinzel Decorative', serif;
				font-size: 14px;
				cursor: pointer;
				margin-top: 12px;
			">Continue Anyway</button>`,
			() => {
				const btn = document.getElementById('start-level2-btn');
				if (btn) {
					btn.addEventListener('click', () => {
						switchLevel(mainState, 2);
						document.getElementById('message-overlay').classList.add('hidden');
						location.reload();
					});
				}
			}
		);

		return true;
	}

	return false;
}

// ─── Exports ──────────────────────────────────────────────────
export { level1State, loadLevel1State, saveLevel1State };
