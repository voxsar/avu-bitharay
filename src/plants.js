/**
 * FLOWER POT MANAGEMENT SYSTEM
 * ─────────────────────────────────────────────────────────────
 * Manages 9 flower pots with 5 different plant types.
 * Each plant has 7 growth stages (0-6).
 * Each stage requires 3 waterings to advance to the next stage.
 */

import { savePlantProgress } from './api.js';

// ─── Plant Types ──────────────────────────────────────────────
export const PLANT_TYPES = {
	ROSE: 'rose',
	MARIGOLD: 'marigold',
	SUNFLOWER: 'sunflower',
	DAFFODIL: 'daffodil',
	EMPTY: null
};

// Plant configuration with sprite paths
export const PLANT_CONFIG = {
	rose: {
		name: 'Rose',
		spritePath: 'assets/images/interface-collection_0000_roses.png',
		color: '#d32f2f'
	},
	marigold: {
		name: 'Marigold',
		spritePath: 'assets/images/interface-collection_0002_maigolds.png',
		color: '#ff9800'
	},
	sunflower: {
		name: 'Sunflower',
		spritePath: 'assets/images/interface-collection_0003_sunflowers.png',
		color: '#fdd835'
	},
	daffodil: {
		name: 'Daffodil',
		spritePath: 'assets/images/interface-collection_0005_daafo.png',
		color: '#ffeb3b'
	}
};

// ─── Constants ────────────────────────────────────────────────
const TOTAL_POTS = 9;
const TOTAL_STAGES = 7;  // Stages 0-6
const WATERINGS_PER_DAY = 3;  // Must water 3 times per day

function makeEmptyPot() {
	return {
		plantType: null,
		stage: 0,
		wateringsToday: 0,  // Daily watering counter (0-3)
		lastWateredDate: null  // Track which day we last watered
	};
}

function makeDefaultPotState() {
	return Array.from({ length: TOTAL_POTS }, () => makeEmptyPot());
}

// ─── Module-level state cache (populated from DB on startup) ──
let _plantStateCache = null;

/**
 * Initialise the plant state cache from data loaded out of the database.
 * Called once during the startup loading flow before the game starts.
 * @param {Array|null} pots - raw array from DB, or null for a fresh save
 */
export function setPlantStateCache(pots) {
	if (Array.isArray(pots) && pots.length === TOTAL_POTS) {
		// Sanitise invalid plant types and migrate old structure
		pots.forEach(pot => {
			if (pot.plantType && !PLANT_CONFIG[pot.plantType]) {
				pot.plantType = null;
				pot.stage = 0;
				pot.wateringsToday = 0;
				pot.lastWateredDate = null;
			}
			// Migrate old 'waterings' field to 'wateringsToday'
			if (pot.waterings !== undefined) {
				pot.wateringsToday = pot.waterings || 0;
				delete pot.waterings;
			}
			// Ensure new fields exist
			if (pot.wateringsToday === undefined) pot.wateringsToday = 0;
			if (pot.lastWateredDate === undefined) pot.lastWateredDate = null;
			// Migrate old 'lastWatered' to 'lastWateredDate'
			if (pot.lastWatered && !pot.lastWateredDate) {
				pot.lastWateredDate = pot.lastWatered.split('T')[0]; // Extract date only
				delete pot.lastWatered;
			}
		});
		_plantStateCache = pots;
	} else {
		_plantStateCache = makeDefaultPotState();
	}
}

// ─── State Management ─────────────────────────────────────────
export function loadPlantState() {
	if (!_plantStateCache) {
		_plantStateCache = makeDefaultPotState();
	}
	return _plantStateCache;
}

export function savePlantState(potState) {
	_plantStateCache = potState;
	savePlantProgress(potState);
}

// ─── Pot Actions ──────────────────────────────────────────────
/**
 * Water a specific pot by index (0-8).
 * Returns an object with success status and message.
 */
export function waterPot(potState, potIndex) {
	if (potIndex < 0 || potIndex >= TOTAL_POTS) {
		return { success: false, message: 'Invalid pot index' };
	}

	const pot = potState[potIndex];

	// Check if pot is empty
	if (!pot.plantType) {
		return { success: false, message: 'This pot is empty! Plant something first.' };
	}

	// Check if already fully grown
	if (pot.stage >= TOTAL_STAGES - 1) {
		return {
			success: false,
			message: `This ${PLANT_CONFIG[pot.plantType].name} is fully grown!`
		};
	}

	// Check if already watered 3 times today
	const today = new Date().toISOString().split('T')[0];

	if (pot.lastWateredDate !== today) {
		// New day - reset daily counter
		pot.wateringsToday = 0;
		pot.lastWateredDate = today;
	}

	if (pot.wateringsToday >= WATERINGS_PER_DAY) {
		return {
			success: false,
			message: `💧 Already watered 3 times today! This plant will grow tomorrow.`
		};
	}

	// Add watering for today
	pot.wateringsToday++;

	const plantName = PLANT_CONFIG[pot.plantType].name;
	const remaining = WATERINGS_PER_DAY - pot.wateringsToday;
	const daysToGrow = (TOTAL_STAGES - 1 - pot.stage);

	if (pot.wateringsToday >= WATERINGS_PER_DAY) {
		return {
			success: true,
			message: `💧 Watered! (3/3 today) ✓ Your ${plantName} will grow tomorrow! (${daysToGrow} more day${daysToGrow !== 1 ? 's' : ''} to fully grow)`
		};
	}

	return {
		success: true,
		message: `💧 Watered! ${remaining} more watering${remaining !== 1 ? 's' : ''} needed today (${pot.wateringsToday}/3)`
	};
}

/**
 * Plant a seed in a specific pot.
 * (To be expanded when planting UI is added)
 */
export function plantSeed(potState, potIndex, plantType) {
	if (potIndex < 0 || potIndex >= TOTAL_POTS) {
		return { success: false, message: 'Invalid pot index' };
	}

	if (!PLANT_CONFIG[plantType]) {
		return { success: false, message: 'Invalid plant type' };
	}

	const pot = potState[potIndex];

	// Check if pot already has a plant
	if (pot.plantType) {
		return {
			success: false,
			message: `This pot already has a ${PLANT_CONFIG[pot.plantType].name}!`
		};
	}

	// Plant the seed (starts at stage 0)
	pot.plantType = plantType;
	pot.stage = 0;
	pot.wateringsToday = 0;
	pot.lastWateredDate = null;

	return {
		success: true,
		message: `🌱 Planted a ${PLANT_CONFIG[plantType].name} seed! Water it 3 times daily to help it grow.`
	};
}

/**
 * Remove/harvest a plant from a pot
 */
export function harvestPlant(potState, potIndex) {
	if (potIndex < 0 || potIndex >= TOTAL_POTS) {
		return { success: false, message: 'Invalid pot index' };
	}

	const pot = potState[potIndex];

	if (!pot.plantType) {
		return { success: false, message: 'This pot is empty!' };
	}

	const plantName = PLANT_CONFIG[pot.plantType].name;
	const wasFullyGrown = pot.stage >= TOTAL_STAGES - 1;

	// Reset pot to empty
	pot.plantType = null;
	pot.stage = 0;
	pot.wateringsToday = 0;
	pot.lastWateredDate = null;

	return {
		success: true,
		wasFullyGrown,
		message: wasFullyGrown
			? `✂️ Harvested a beautiful ${plantName}!`
			: `✂️ Removed the ${plantName}.`
	};
}

/**
 * Process daily plant growth during day rollover
 * Called when a new day starts
 * @param {Array} potState - The plant pots state
 * @param {string} yesterday - ISO date string for yesterday (YYYY-MM-DD)
 * @returns {Array} Array of growth messages for plants that grew
 */
export function processDailyPlantGrowth(potState, yesterday) {
	const growthMessages = [];

	potState.forEach((pot, index) => {
		if (!pot.plantType) return; // Skip empty pots
		if (pot.stage >= TOTAL_STAGES - 1) return; // Skip fully grown plants

		// Check if this plant was watered 3 times yesterday
		if (pot.lastWateredDate === yesterday && pot.wateringsToday >= WATERINGS_PER_DAY) {
			// Advance to next stage
			pot.stage++;
			const plantName = PLANT_CONFIG[pot.plantType].name;

			if (pot.stage >= TOTAL_STAGES - 1) {
				growthMessages.push(`🌺 Your ${plantName} is fully grown! All 7 stages complete! 🎉`);
			} else {
				const daysRemaining = (TOTAL_STAGES - 1) - pot.stage;
				growthMessages.push(`🌱 Your ${plantName} grew to stage ${pot.stage + 1}! (${daysRemaining} more day${daysRemaining !== 1 ? 's' : ''} to fully grow)`);
			}
		}

		// Reset daily watering counter for new day
		pot.wateringsToday = 0;
	});

	return growthMessages;
}

// ─── Helper Functions ─────────────────────────────────────────
/**
 * Get progress info for a specific pot
 */
export function getPotInfo(pot) {
	if (!pot.plantType) {
		return {
			isEmpty: true,
			plantName: 'Empty',
			stage: 0,
			wateringsToday: 0,
			progress: 0,
			isFullyGrown: false
		};
	}

	const config = PLANT_CONFIG[pot.plantType];

	// Handle invalid plant types (e.g., deleted plants like jasmine)
	if (!config) {
		console.warn(`Invalid plant type: ${pot.plantType}. Treating as empty pot.`);
		return {
			isEmpty: true,
			plantName: 'Empty',
			stage: 0,
			wateringsToday: 0,
			progress: 0,
			isFullyGrown: false
		};
	}

	const isFullyGrown = pot.stage >= TOTAL_STAGES - 1;
	// Progress based on stages (0-6), each stage is ~14.3% of total growth
	const totalProgress = (pot.stage / (TOTAL_STAGES - 1)) * 100;

	return {
		isEmpty: false,
		plantName: config.name,
		plantType: pot.plantType,
		stage: pot.stage,
		wateringsToday: pot.wateringsToday || 0,
		progress: Math.min(100, totalProgress),
		isFullyGrown,
		color: config.color,
		spritePath: config.spritePath
	};
}

/**
 * Get sprite position for a plant at a given stage
 * Sprites are arranged horizontally: 7 stages from left to right
 */
export function getSpritePosition(stage) {
	// Clamp stage between 0-6
	const clampedStage = Math.max(0, Math.min(TOTAL_STAGES - 1, stage));
	// Calculate background position (each stage is 1/6 of the way across)
	const xPercent = (clampedStage / (TOTAL_STAGES - 1)) * 100;
	return xPercent;
}

/**
 * Get all pots with plants
 */
export function getActivePots(potState) {
	return potState
		.map((pot, index) => ({ pot, index }))
		.filter(({ pot }) => pot.plantType !== null);
}

/**
 * Get statistics about the garden
 */
export function getGardenStats(potState) {
	const active = getActivePots(potState);
	const fullyGrown = active.filter(({ pot }) => pot.stage >= TOTAL_STAGES - 1);
	const empty = TOTAL_POTS - active.length;

	const typeCounts = {};
	active.forEach(({ pot }) => {
		typeCounts[pot.plantType] = (typeCounts[pot.plantType] || 0) + 1;
	});

	return {
		totalPots: TOTAL_POTS,
		activePots: active.length,
		emptyPots: empty,
		fullyGrownPots: fullyGrown.length,
		plantTypeCounts: typeCounts
	};
}
