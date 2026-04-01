/**
 * DEBUG HELPER FOR TESTING PLANT SYSTEM
 * ─────────────────────────────────────────────────────────────
 * Run these commands in the browser console to test the plant system:
 */

// Import functions
import { loadPlantState, savePlantState, plantSeed, PLANT_TYPES } from './plants.js';

/**
 * Quick setup: Plant one of each flower type in first 4 pots
 */
export function setupTestGarden() {
	const potState = loadPlantState();

	const plants = ['rose', 'marigold', 'sunflower', 'daffodil'];

	plants.forEach((plantType, index) => {
		potState[index].plantType = plantType;
		potState[index].stage = 0;
		potState[index].waterings = 0;
		potState[index].lastWatered = null;
	});

	savePlantState(potState);

	console.log('Test garden setup complete! Refresh the page to see the plants.');
	console.log('Use watering mode (click watering can or press W) to water them.');

	return potState;
}

/**
 * Plant a specific plant in a specific pot
 */
export function plantInPot(potIndex, plantType) {
	const potState = loadPlantState();

	if (potIndex < 0 || potIndex > 8) {
		console.error('Invalid pot index. Use 0-8');
		return;
	}

	if (!['rose', 'marigold', 'sunflower', 'daffodil'].includes(plantType)) {
		console.error('Invalid plant type. Use: rose, marigold, sunflower, daffodil');
		return;
	}

	potState[potIndex].plantType = plantType;
	potState[potIndex].stage = 0;
	potState[potIndex].waterings = 0;
	potState[potIndex].lastWatered = null;

	savePlantState(potState);
	console.log(`Planted ${plantType} in pot ${potIndex}. Refresh to see changes.`);
}

/**
 * Fast-grow a plant (for testing stage progression)
 */
export function fastGrow(potIndex, targetStage = 6) {
	const potState = loadPlantState();

	if (potIndex < 0 || potIndex > 8) {
		console.error('Invalid pot index. Use 0-8');
		return;
	}

	if (!potState[potIndex].plantType) {
		console.error('This pot is empty!');
		return;
	}

	potState[potIndex].stage = Math.min(6, targetStage);
	potState[potIndex].waterings = 0;

	savePlantState(potState);
	console.log(`Pot ${potIndex} fast-grown to stage ${potState[potIndex].stage}. Refresh to see changes.`);
}

/**
 * Clear all pots
 */
export function clearAllPots() {
	const potState = loadPlantState();

	potState.forEach(pot => {
		pot.plantType = null;
		pot.stage = 0;
		pot.waterings = 0;
		pot.lastWatered = null;
	});

	savePlantState(potState);
	console.log('All pots cleared. Refresh to see changes.');
}

// Make functions available globally for console access
if (typeof window !== 'undefined') {
	window.setupTestGarden = setupTestGarden;
	window.plantInPot = plantInPot;
	window.fastGrow = fastGrow;
	window.clearAllPots = clearAllPots;
}
