/**
 * GAME CONTROLLER - Unified Loop Management
 * ─────────────────────────────────────────────────────────────
 * Manages the core game loop: POIs → Seeds → Daily Actions → Progression
 */

import { saveGameProgress } from './api.js';

// Daily requirements
export const DAILY_REQUIREMENTS = {
	seedsToPlant: 3,
	wateringsNeeded: 9,  // 3 plants × 3 waterings
	drumsNeeded: 2,
	crowRounds: 3
};

/**
 * Check if player has enough seeds for today's actions
 */
export function hasEnoughSeeds(state) {
	return state.seeds >= DAILY_REQUIREMENTS.seedsToPlant;
}

/**
 * Check if all daily actions are complete
 */
export function isDayComplete(state) {
	const actions = state.dailyActions;
	return (
		actions.plantsPlanted >= DAILY_REQUIREMENTS.seedsToPlant &&
		actions.plantsWatered >= DAILY_REQUIREMENTS.wateringsNeeded &&
		actions.drumsPlayed >= DAILY_REQUIREMENTS.drumsNeeded &&
		actions.crowsChased >= DAILY_REQUIREMENTS.crowRounds
	);
}

/**
 * Plant a seed (consumes 1 seed)
 */
export function plantSeed(state, potIndex) {
	if (state.seeds <= 0) {
		return { success: false, message: 'No seeds available! Play mini-games to earn seeds.' };
	}

	if (state.dailyActions.plantsPlanted >= DAILY_REQUIREMENTS.seedsToPlant) {
		return { success: false, message: 'Already planted enough seeds for today!' };
	}

	// Consume seed
	state.seeds--;
	state.seedsUsedToday++;
	state.dailyActions.plantsPlanted++;

	return {
		success: true,
		message: `Planted seed ${state.dailyActions.plantsPlanted}/${DAILY_REQUIREMENTS.seedsToPlant}`,
		remaining: state.seeds
	};
}

/**
 * Water a plant
 */
export function waterPlant(state, potIndex) {
	if (state.dailyActions.plantsPlanted === 0) {
		return { success: false, message: 'Plant some seeds first!' };
	}

	if (state.dailyActions.plantsWatered >= DAILY_REQUIREMENTS.wateringsNeeded) {
		return { success: false, message: 'All plants watered for today!' };
	}

	state.dailyActions.plantsWatered++;

	return {
		success: true,
		message: `Watered plant! ${state.dailyActions.plantsWatered}/${DAILY_REQUIREMENTS.wateringsNeeded}`,
		complete: state.dailyActions.plantsWatered >= DAILY_REQUIREMENTS.wateringsNeeded
	};
}

/**
 * Play drums for the egg
 */
export function playDrums(state) {
	if (state.dailyActions.drumsPlayed >= DAILY_REQUIREMENTS.drumsNeeded) {
		return { success: false, message: 'Drums already played enough today!' };
	}

	state.dailyActions.drumsPlayed++;

	return {
		success: true,
		message: `Played drums! ${state.dailyActions.drumsPlayed}/${DAILY_REQUIREMENTS.drumsNeeded}`,
		complete: state.dailyActions.drumsPlayed >= DAILY_REQUIREMENTS.drumsNeeded
	};
}

/**
 * Chase crows (minigame)
 */
export function chaseCrows(state, success) {
	if (state.dailyActions.crowsChased >= DAILY_REQUIREMENTS.crowRounds) {
		return { success: false, message: 'Crows already chased today!' };
	}

	if (success) {
		state.dailyActions.crowsChased++;
	}

	return {
		success: success,
		message: success
			? `Chased crows! ${state.dailyActions.crowsChased}/${DAILY_REQUIREMENTS.crowRounds}`
			: 'Try again to chase the crows!',
		complete: state.dailyActions.crowsChased >= DAILY_REQUIREMENTS.crowRounds
	};
}

/**
 * Complete the current day and advance
 */
export function completeDay(state) {
	if (!isDayComplete(state)) {
		return {
			success: false,
			message: 'Complete all daily actions first!',
			missing: getMissingActions(state)
		};
	}

	// Mark day complete
	state.todayComplete = true;
	state.eggGlowing = true;

	// Health bonus for completion
	state.eggHealth = Math.min(100, state.eggHealth + 5);

	// Check if this is the final day
	if (state.currentDay >= state.totalDays) {
		state.phase = state.eggHealth >= 50 ? 'hatched' : 'gameover';
		return {
			success: true,
			message: state.phase === 'hatched'
				? '🐣 The egg has hatched! Congratulations!'
				: '💔 The egg did not survive...',
			final: true
		};
	}

	return {
		success: true,
		message: `Day ${state.currentDay} complete! ✨ The egg glows with health!`,
		canProgress: true
	};
}

/**
 * Get list of incomplete actions
 */
function getMissingActions(state) {
	const missing = [];
	const actions = state.dailyActions;

	if (actions.plantsPlanted < DAILY_REQUIREMENTS.seedsToPlant) {
		missing.push(`Plant seeds (${actions.plantsPlanted}/${DAILY_REQUIREMENTS.seedsToPlant})`);
	}
	if (actions.plantsWatered < DAILY_REQUIREMENTS.wateringsNeeded) {
		missing.push(`Water plants (${actions.plantsWatered}/${DAILY_REQUIREMENTS.wateringsNeeded})`);
	}
	if (actions.drumsPlayed < DAILY_REQUIREMENTS.drumsNeeded) {
		missing.push(`Play drums (${actions.drumsPlayed}/${DAILY_REQUIREMENTS.drumsNeeded})`);
	}
	if (actions.crowsChased < DAILY_REQUIREMENTS.crowRounds) {
		missing.push(`Chase crows (${actions.crowsChased}/${DAILY_REQUIREMENTS.crowRounds})`);
	}

	return missing;
}

/**
 * Get progress percentage for the current day
 */
export function getDailyProgress(state) {
	const actions = state.dailyActions;
	const total =
		DAILY_REQUIREMENTS.seedsToPlant +
		DAILY_REQUIREMENTS.wateringsNeeded +
		DAILY_REQUIREMENTS.drumsNeeded +
		DAILY_REQUIREMENTS.crowRounds;

	const completed =
		Math.min(actions.plantsPlanted, DAILY_REQUIREMENTS.seedsToPlant) +
		Math.min(actions.plantsWatered, DAILY_REQUIREMENTS.wateringsNeeded) +
		Math.min(actions.drumsPlayed, DAILY_REQUIREMENTS.drumsNeeded) +
		Math.min(actions.crowsChased, DAILY_REQUIREMENTS.crowRounds);

	return Math.floor((completed / total) * 100);
}

/**
 * Check if Witch should appear (surplus seeds check)
 */
export function shouldShowWitch(state) {
	// Witch appears if:
	// - Player has completed planting (has used required seeds)
	// - Player still has extra seeds
	// - Witch hasn't offered today
	const hasPlanted = state.dailyActions.plantsPlanted >= DAILY_REQUIREMENTS.seedsToPlant;
	const hasSurplus = state.seeds > 0;
	const notOfferedYet = !state.witchOfferedSeedsToday;

	return hasPlanted && hasSurplus && notOfferedYet;
}

/**
 * Witch takes seeds from player
 */
export function giveSeeds(state, amount) {
	if (amount > state.seeds) {
		amount = state.seeds;
	}

	state.seeds -= amount;
	state.totalSeedsGivenToWitch += amount;
	state.witchOfferedSeedsToday = true;

	return {
		success: true,
		given: amount,
		remaining: state.seeds
	};
}

/**
 * Calculate extra seeds (surplus beyond daily need)
 */
export function getExtraSeeds(state) {
	const needed = DAILY_REQUIREMENTS.seedsToPlant - state.dailyActions.plantsPlanted;
	return Math.max(0, state.seeds - needed);
}
