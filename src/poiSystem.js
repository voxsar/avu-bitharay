/**
 * POI SYSTEM - Repeatable Resource Generation
 * ─────────────────────────────────────────────────────────────
 * POIs (Points of Interest) are repeatable mini-games that generate seeds.
 * Players can return to POIs whenever they need more seeds.
 */

import { showGameModal, showNarratorHelp } from './level1UI.js';
import { TileMatchGame, RiddleGame, TofuHunterGame } from './miniGames.js';
import { showMessage } from './main.js';

// ─── Constants ────────────────────────────────────────────────
const TOTAL_HOTSPOTS = 12;
const GAME_TYPES = ['tilematch', 'riddle', 'tofuhunter'];
const MAX_DAILY_PLAYS = 10; // Optional limit on POI plays per day

// ─── POI State Management ─────────────────────────────────────
let poiState = null;

function makeDefaultPOIState() {
	return {
		hotspots: [],  // Array of {id, x, y, gameType}
		initialized: false
	};
}

export function setPOIStateCache(saved) {
	if (saved && typeof saved === 'object') {
		poiState = { ...makeDefaultPOIState(), ...saved };
	} else {
		poiState = null;
	}
}

function loadPOIState() {
	if (!poiState) {
		poiState = makeDefaultPOIState();
	}
	return poiState;
}

function savePOIState(state) {
	poiState = state;
	// POI positions don't change, so minimal save needed
}

// ─── Hotspot Generation ───────────────────────────────────────
function generateHotspots() {
	const hotspots = [];

	const regions = [
		{ centerX: 25, centerY: 35, radius: 15 },  // Top-left region
		{ centerX: 65, centerY: 30, radius: 18 },  // Top-right region
		{ centerX: 40, centerY: 65, radius: 16 },  // Bottom-center region
		{ centerX: 75, centerY: 70, radius: 14 }   // Bottom-right region
	];

	const hotspotsPerRegion = Math.floor(TOTAL_HOTSPOTS / regions.length);
	const remainder = TOTAL_HOTSPOTS % regions.length;

	let hotspotId = 0;

	regions.forEach((region, regionIndex) => {
		const count = hotspotsPerRegion + (regionIndex < remainder ? 1 : 0);

		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const distance = Math.random() * region.radius;
			const x = region.centerX + Math.cos(angle) * distance;
			const y = region.centerY + Math.sin(angle) * distance;

			const clampedX = Math.max(10, Math.min(90, x));
			const clampedY = Math.max(10, Math.min(90, y));

			const gameType = GAME_TYPES[hotspotId % GAME_TYPES.length];

			hotspots.push({
				id: hotspotId,
				x: clampedX,
				y: clampedY,
				gameType
			});

			hotspotId++;
		}
	});

	return hotspots;
}

// ─── POI Initialization ───────────────────────────────────────
export function initPOISystem(gameState, onComplete) {
	const state = loadPOIState();

	// Generate hotspots if not already done
	if (!state.initialized || state.hotspots.length === 0) {
		state.hotspots = generateHotspots();
		state.initialized = true;
		savePOIState(state);
	}

	return {
		hotspots: state.hotspots,
		playHotspot: (hotspotId) => playPOI(hotspotId, gameState, onComplete)
	};
}

/**
 * Play a POI mini-game
 */
function playPOI(hotspotId, gameState, onComplete) {
	const state = loadPOIState();
	const hotspot = state.hotspots.find(h => h.id === hotspotId);

	if (!hotspot) {
		console.error('Hotspot not found:', hotspotId);
		return;
	}

	// Check daily limit (optional)
	if (gameState.poisPlayedToday >= MAX_DAILY_PLAYS) {
		showMessage(
			'⏰',
			`<strong>Take a break!</strong><br>
			You've played ${MAX_DAILY_PLAYS} games today.<br>
			Come back tomorrow for more seeds!`,
			null
		);
		return;
	}

	// Create appropriate mini-game
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

	// Show narrator help first
	showNarratorHelp(
		game,
		// On continue
		() => {
			showGameModal(game, (won) => {
				if (won) {
					// Award seed
					gameState.seeds++;
					gameState.totalSeedsEarned++;
					gameState.poisPlayedToday++;

					showMessage(
						'🌸',
						`<strong>Success!</strong><br>
						You earned 1 flower seed!<br>
						<br>
						Total seeds: <strong>${gameState.seeds}</strong>`,
						null
					);

					// Callback for state updates
					if (onComplete) {
						onComplete(true, gameState);
					}
				} else {
					if (onComplete) {
						onComplete(false, gameState);
					}
				}
			});
		},
		// On cancel
		() => {
			// Player cancelled, do nothing
		}
	);
}

/**
 * Check if player can play POIs
 */
export function canPlayPOI(gameState) {
	return gameState.poisPlayedToday < MAX_DAILY_PLAYS;
}

/**
 * Get remaining plays for today
 */
export function getRemainingPlays(gameState) {
	return MAX_DAILY_PLAYS - gameState.poisPlayedToday;
}

export { poiState, loadPOIState };
