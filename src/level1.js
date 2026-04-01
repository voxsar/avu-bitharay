/**
 * LEVEL 1: MAP EXPLORATION & MINI-GAMES
 * ─────────────────────────────────────────────────────────────
 * Players explore a map (bg.png), click hotspots to play mini-games
 * (tile match, riddles, tofu hunter) and collect flower seeds.
 * Each completed mini-game rewards 1 flower seed.
 * Player needs 2 seeds to unlock progression to Level 2.
 */

import { switchLevel, saveState, loadState, showMessage } from './main.js';
import { initLevel1UI, updateProgressDisplay, showGameModal, showNarratorHelp } from './level1UI.js';
import { TileMatchGame, RiddleGame, TofuHunterGame } from './miniGames.js';
import { saveLevel1Progress, saveGameProgress } from './api.js';
import { showDialogue, findTriggeredNode, processChoice, getDialogueState, markNodeSeen } from './dialogue.js';
import { DIALOGUE_NODES } from './dialogueData.js';

// ─── Constants ────────────────────────────────────────────────
const TOTAL_HOTSPOTS = 12;
const GAME_TYPES = ['tilematch', 'riddle', 'tofuhunter'];
const MAX_RETRIES = 2; // Allow 2 retries per game
const SEEDS_TO_PROGRESS = 2; // Minimum seeds needed to unlock progression

// ─── Level 1 State ────────────────────────────────────────────
let level1State = null;

function makeDefaultLevel1State() {
	return {
		hotspots: [],  // Array of {id, x, y, gameType, state, retries}
		seedsCollected: 0,  // Flower seeds collected from mini-games
		gamesPlayed: 0,
		progressUnlocked: false,  // True when seeds >= 2
		level1Locked: false
	};
}

/**
 * Initialise the level-1 state cache from data loaded out of the database.
 * Called once during the startup loading flow before the game starts.
 * @param {object|null} saved - raw object from DB, or null for a fresh start
 */
export function setLevel1StateCache(saved) {
	if (saved && typeof saved === 'object') {
		level1State = { ...makeDefaultLevel1State(), ...saved };
	} else {
		level1State = null; // will be initialised on first loadLevel1State() call
	}
}

function loadLevel1State() {
	if (!level1State) return makeDefaultLevel1State();
	return level1State;
}

function saveLevel1State(state) {
	level1State = state;
	saveLevel1Progress(state);
}

// ─── Hotspot Generation ───────────────────────────────────────
/**
 * Generate hotspot positions clustered in 3-4 regions
 */
function generateHotspots() {
	const hotspots = [];

	// Define 4 regions on the map (% based positioning)
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

			hotspots.push({
				id: hotspotId,
				x: clampedX,
				y: clampedY,
				gameType,
				state: 'available',  // 'available' | 'playing' | 'won' | 'failed'
				retries: MAX_RETRIES
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
			`<strong>Welcome to the Village!</strong><br>
			Explore the map and click on glowing hotspots.<br>
			<br>
			Play mini-games to collect <strong>flower seeds</strong> 🌸<br>
			Each successful game gives you 1 seed.<br>
			<br>
			Collect <strong>at least 2 seeds</strong> to progress!<br>
			<em>(But you can collect more...)</em>`,
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

		// Award 1 flower seed
		level1State.seedsCollected++;

		saveLevel1State(level1State);

		// Update progress display
		updateProgressDisplay(level1State);

		// Show reward message
		showMessage(
			'🌸',
			`<strong>Success!</strong><br>
			You earned 1 flower seed!<br>
			<br>
			Total seeds: <strong>${level1State.seedsCollected}</strong>`,
			null
		);

		// Check for dialogue triggers after first game
		setTimeout(() => {
			triggerDialogue('after_minigame');
		}, 2000);

		// Check if progress should be unlocked
		checkProgressUnlock();

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
	}
}

/**
 * Check if progression should be unlocked
 */
function checkProgressUnlock() {
	if (level1State.seedsCollected >= SEEDS_TO_PROGRESS && !level1State.progressUnlocked) {
		level1State.progressUnlocked = true;
		saveLevel1State(level1State);

		// Show progression unlock button
		showProgressButton();

		// Trigger Nilame dialogue about progression
		setTimeout(() => {
			triggerDialogue('progress_unlock');
		}, 1500);
	}
}

/**
 * Show the "Progress to Next Level" button
 */
function showProgressButton() {
	// Check if button already exists
	let btn = document.getElementById('level1-progress-btn');
	if (btn) return;

	btn = document.createElement('button');
	btn.id = 'level1-progress-btn';
	btn.className = 'progress-unlock-btn';
	btn.textContent = `✨ Progress to Next Level (${level1State.seedsCollected} seeds)`;

	btn.addEventListener('click', () => {
		progressToLevel2();
	});

	document.body.appendChild(btn);
}

/**
 * Progress to Level 2
 */
function progressToLevel2() {
	// Remove progress button
	const btn = document.getElementById('level1-progress-btn');
	if (btn) btn.remove();

	// Lock Level 1
	level1State.level1Locked = true;
	saveLevel1State(level1State);

	// Update main state
	const mainState = loadState();
	mainState.collectedItems = { seeds: level1State.seedsCollected };
	mainState.level1Complete = true;
	mainState.currentLevel = 2;
	saveState(mainState);

	// Show transition message
	showMessage(
		'🎉',
		`<strong>Moving Forward!</strong><br>
		You collected <strong>${level1State.seedsCollected} flower seeds</strong>.<br>
		<br>
		<em>The adventure continues...</em>`,
		null
	);

	// Transition to Level 2
	setTimeout(async () => {
		document.getElementById('message-overlay').classList.add('hidden');
		try {
			await saveGameProgress(mainState);
		} catch (err) {
			console.warn('Failed to save state before transition:', err);
		}
		location.reload();
	}, 3000);
}

/**
 * Trigger dialogue based on context
 */
function triggerDialogue(triggerType) {
	const gameContext = {
		level: 1,
		seeds: level1State.seedsCollected,
		gamesCompleted: level1State.gamesPlayed
	};

	const node = findTriggeredNode(DIALOGUE_NODES, {
		type: triggerType,
		gameContext
	});

	if (node) {
		showDialogue(node, (choiceIndex, choice) => {
			// Process the choice effects
			processChoice(choice, (nextNodeId) => {
				// If there's a next node, show it
				const nextNode = DIALOGUE_NODES.find(n => n.id === nextNodeId);
				if (nextNode) {
					showDialogue(nextNode, (idx, ch) => {
						processChoice(ch, null);
					});
				}
			});
		});
	}
}

// ─── Exports ──────────────────────────────────────────────────
export { level1State, loadLevel1State, saveLevel1State };
