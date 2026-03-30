/**
 * FLOWER POT MANAGEMENT SYSTEM
 * ─────────────────────────────────────────────────────────────
 * Manages 9 flower pots with 5 different plant types.
 * Each plant has 7 growth stages (0-6).
 * Each stage requires 3 waterings to advance to the next stage.
 */

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
const WATERINGS_PER_STAGE = 3;
const PLANTS_STORAGE_KEY = 'avurudhu_bithara_plants_v1';

// ─── Pot State Structure ──────────────────────────────────────
/**
 * Each pot has:
 * - plantType: string | null (e.g., 'rose', 'sunflower', or null for empty)
 * - stage: number (0-6, where 0 is sprout and 6 is fully grown)
 * - waterings: number (0-2, current waterings for this stage)
 * - lastWatered: ISO date string (tracks when it was last watered)
 */

function makeEmptyPot() {
	return {
		plantType: null,
		stage: 0,
		waterings: 0,
		lastWatered: null
	};
}

function makeDefaultPotState() {
	return Array.from({ length: TOTAL_POTS }, () => makeEmptyPot());
}

// ─── State Management ─────────────────────────────────────────
export function loadPlantState() {
	try {
		const raw = localStorage.getItem(PLANTS_STORAGE_KEY);
		if (!raw) return makeDefaultPotState();
		const parsed = JSON.parse(raw);
		// Ensure we always have exactly 9 pots
		if (!Array.isArray(parsed) || parsed.length !== TOTAL_POTS) {
			return makeDefaultPotState();
		}

		// Clean up invalid plant types (e.g., deleted plants)
		let needsSave = false;
		parsed.forEach(pot => {
			if (pot.plantType && !PLANT_CONFIG[pot.plantType]) {
				console.warn(`Removing invalid plant type: ${pot.plantType}`);
				pot.plantType = null;
				pot.stage = 0;
				pot.waterings = 0;
				pot.lastWatered = null;
				needsSave = true;
			}
		});

		if (needsSave) {
			savePlantState(parsed);
		}

		return parsed;
	} catch {
		return makeDefaultPotState();
	}
}

export function savePlantState(potState) {
	localStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(potState));
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

	// Add watering
	pot.waterings++;
	pot.lastWatered = new Date().toISOString();

	// Check if stage should advance
	if (pot.waterings >= WATERINGS_PER_STAGE) {
		pot.stage++;
		pot.waterings = 0;

		const plantName = PLANT_CONFIG[pot.plantType].name;

		if (pot.stage >= TOTAL_STAGES - 1) {
			return {
				success: true,
				stageUp: true,
				fullyGrown: true,
				message: `🌺 Your ${plantName} is fully grown!`
			};
		}

		return {
			success: true,
			stageUp: true,
			fullyGrown: false,
			message: `🌱 Your ${plantName} grew to stage ${pot.stage + 1}!`
		};
	}

	const remaining = WATERINGS_PER_STAGE - pot.waterings;
	return {
		success: true,
		stageUp: false,
		message: `💧 Watered! ${remaining} more watering${remaining !== 1 ? 's' : ''} needed for next stage.`
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
	pot.waterings = 0;
	pot.lastWatered = null;

	return {
		success: true,
		message: `🌱 Planted a ${PLANT_CONFIG[plantType].name} seed!`
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
	pot.waterings = 0;
	pot.lastWatered = null;

	return {
		success: true,
		wasFullyGrown,
		message: wasFullyGrown
			? `✂️ Harvested a beautiful ${plantName}!`
			: `✂️ Removed the ${plantName}.`
	};
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
			waterings: 0,
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
			waterings: 0,
			progress: 0,
			isFullyGrown: false
		};
	}

	const isFullyGrown = pot.stage >= TOTAL_STAGES - 1;
	const totalProgress = ((pot.stage * WATERINGS_PER_STAGE + pot.waterings) / (TOTAL_STAGES * WATERINGS_PER_STAGE)) * 100;

	return {
		isEmpty: false,
		plantName: config.name,
		plantType: pot.plantType,
		stage: pot.stage,
		waterings: pot.waterings,
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
