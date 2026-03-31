/**
 * LEVEL 1 DEBUG HELPERS
 * ─────────────────────────────────────────────────────────────
 * Console commands for testing Level 1 functionality
 */

import { loadLevel1State, saveLevel1State, setLevel1StateCache } from './level1.js';
import { loadState, saveState } from './main.js';

// ─── Debug Commands ───────────────────────────────────────────

/**
 * Complete Level 1 instantly (collect egg + 2 plants)
 */
window.debugCompleteLevel1 = function () {
	const level1State = loadLevel1State();

	// Mark first 4 hotspots as won (1 egg + 3 plants)
	level1State.hotspots.slice(0, 4).forEach(h => {
		h.state = 'won';
	});

	// Collect items
	level1State.itemsCollected.egg = true;
	level1State.itemsCollected.plants = ['rose', 'marigold', 'sunflower'];
	level1State.gamesPlayed = 4;

	saveLevel1State(level1State);

	console.log('✅ Level 1 completed! Collected:', level1State.itemsCollected);
	console.log('💡 Refresh the page to see Level 1 completion message.');
};

/**
 * Reset Level 1 completely
 */
window.debugResetLevel1 = function () {
	setLevel1StateCache(null); // Reset level1 cache to default state

	const mainState = loadState();
	mainState.currentLevel = 1;
	mainState.level1Complete = false;
	mainState.collectedItems = { egg: false, plants: [] };
	saveState(mainState);

	console.log('🔄 Level 1 reset! Refresh the page to start over.');
};

/**
 * Unlock Level 1 (re-enable access after lock)
 */
window.debugUnlockLevel1 = function () {
	const level1State = loadLevel1State();
	level1State.level1Locked = false;
	saveLevel1State(level1State);

	const mainState = loadState();
	mainState.currentLevel = 1;
	mainState.level1Complete = false;
	saveState(mainState);

	console.log('🔓 Level 1 unlocked! Refresh to re-enter.');
};

/**
 * Mark all hotspots as played (mix of won/failed)
 */
window.debugPlayAllHotspots = function () {
	const level1State = loadLevel1State();

	level1State.hotspots.forEach((h, index) => {
		// First 5 won, rest failed
		h.state = index < 5 ? 'won' : 'failed';
		h.retries = 0;
	});

	// Collect some items
	level1State.itemsCollected.egg = true;
	level1State.itemsCollected.plants = ['rose'];
	level1State.gamesPlayed = level1State.hotspots.length;

	saveLevel1State(level1State);

	console.log('✅ All hotspots marked as played. Refresh to see result.');
};

/**
 * Skip to Level 2 directly
 */
window.debugSkipToLevel2 = function () {
	const mainState = loadState();
	mainState.currentLevel = 2;
	mainState.level1Complete = true;
	mainState.collectedItems = { egg: true, plants: ['rose', 'marigold'] };
	saveState(mainState);

	console.log('⏩ Skipped to Level 2! Refresh the page.');
};

/**
 * Show current Level 1 state
 */
window.debugShowLevel1State = function () {
	const level1State = loadLevel1State();
	console.log('📊 Level 1 State:', level1State);
	console.log('🎮 Hotspots:', level1State.hotspots.length);
	console.log('✅ Won:', level1State.hotspots.filter(h => h.state === 'won').length);
	console.log('❌ Failed:', level1State.hotspots.filter(h => h.state === 'failed').length);
	console.log('⏳ Available:', level1State.hotspots.filter(h => h.state === 'available').length);
	console.log('🎁 Items:', level1State.itemsCollected);
};

// ─── Instructions ─────────────────────────────────────────────
console.log(
	'%c🎮 Level 1 Debug Commands Available:',
	'font-weight: bold; font-size: 14px; color: #e8a820;'
);
console.log('%c  debugCompleteLevel1()    ', 'color: #5aa030', '- Complete Level 1 instantly');
console.log('%c  debugResetLevel1()       ', 'color: #5aa030', '- Reset Level 1 completely');
console.log('%c  debugUnlockLevel1()      ', 'color: #5aa030', '- Re-enable Level 1 access');
console.log('%c  debugPlayAllHotspots()   ', 'color: #5aa030', '- Mark all hotspots as played');
console.log('%c  debugSkipToLevel2()      ', 'color: #5aa030', '- Skip directly to Level 2');
console.log('%c  debugShowLevel1State()   ', 'color: #5aa030', '- Show current Level 1 state');
