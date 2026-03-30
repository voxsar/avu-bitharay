/**
 * LEVEL 1 UI: Map rendering, hotspot interactions, game modals
 * ─────────────────────────────────────────────────────────────
 */

import { GAME_HELP_TEXT } from './miniGames.js';

// ─── DOM Helpers ──────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// ─── Initialize Level 1 UI ────────────────────────────────────
let currentGame = null;
let onHotspotClickCallback = null;

export function initLevel1UI(level1State, onHotspotClick) {
	onHotspotClickCallback = onHotspotClick;

	const mapContainer = $('map-container');
	if (!mapContainer) {
		console.error('map-container element not found!');
		return;
	}

	// Clear existing hotspots
	mapContainer.innerHTML = '';

	// Render hotspots
	level1State.hotspots.forEach(hotspot => {
		renderHotspot(mapContainer, hotspot);
	});

	// Update progress display
	updateProgressDisplay(level1State);
}

// ─── Render Hotspot ───────────────────────────────────────────
function renderHotspot(container, hotspot) {
	const el = document.createElement('div');
	el.className = 'hotspot';
	el.dataset.id = hotspot.id;
	el.dataset.state = hotspot.state;

	// Position on map
	el.style.left = `${hotspot.x}%`;
	el.style.top = `${hotspot.y}%`;

	// Icon based on state
	let icon = '';
	if (hotspot.state === 'available') {
		icon = '✨'; // Glowing available
		el.classList.add('available');
	} else if (hotspot.state === 'won') {
		icon = '✅'; // Completed
		el.classList.add('completed');
	} else if (hotspot.state === 'failed') {
		icon = hotspot.retries > 0 ? '💪' : '❌'; // Retry or failed
		el.classList.add('failed');
	}

	el.innerHTML = `
		<div class="hotspot-icon">${icon}</div>
		<div class="hotspot-tooltip">
			${getTooltipText(hotspot)}
		</div>
	`;

	// Click handler
	if (hotspot.state === 'available') {
		el.addEventListener('click', () => {
			if (onHotspotClickCallback) {
				onHotspotClickCallback(hotspot.id);
			}
		});
	}

	container.appendChild(el);
}

function getTooltipText(hotspot) {
	const rewardText = hotspot.reward.type === 'egg'
		? '🥚 Egg'
		: `🌸 ${capitalize(hotspot.reward.plantType)}`;

	const gameTypeText = {
		'tilematch': '🎴 Tile Match',
		'riddle': '❓ Riddle',
		'tofuhunter': '🎮 Tofu Hunter'
	}[hotspot.gameType] || 'Game';

	if (hotspot.state === 'available') {
		return `${gameTypeText}<br>Reward: ${rewardText}`;
	} else if (hotspot.state === 'won') {
		return `Completed!<br>Won: ${rewardText}`;
	} else if (hotspot.state === 'failed') {
		return hotspot.retries > 0
			? `Failed<br>${hotspot.retries} ${hotspot.retries === 1 ? 'retry' : 'retries'} left`
			: 'Failed - No retries';
	}
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Progress Display ─────────────────────────────────────────
export function updateProgressDisplay(level1State) {
	const progressPanel = $('level1-progress');
	if (!progressPanel) return;

	const { egg, plants } = level1State.itemsCollected;
	const gamesPlayed = level1State.gamesPlayed;
	const totalGames = level1State.hotspots.length;
	const remaining = totalGames - gamesPlayed;

	progressPanel.innerHTML = `
		<div class="progress-item">
			<span class="progress-label">Egg:</span>
			<span class="progress-value">${egg ? '✅' : '❌'}</span>
		</div>
		<div class="progress-item">
			<span class="progress-label">Plants:</span>
			<span class="progress-value">${plants.length} / 2</span>
		</div>
		<div class="progress-item">
			<span class="progress-label">Games Left:</span>
			<span class="progress-value">${remaining}</span>
		</div>
	`;
}

// ─── Game Modal ───────────────────────────────────────────────
/**
 * Show game modal with mini-game
 * @param {Object} game - Game instance (TileMatchGame, RiddleGame, or TofuHunterGame)
 * @param {Object} reward - {type: 'egg' | 'plant', plantType?: string}
 * @param {Function} onComplete - Callback (won: boolean)
 */
export function showGameModal(game, reward, onComplete) {
	const modal = $('game-modal');
	if (!modal) {
		console.error('game-modal element not found!');
		return;
	}

	currentGame = game;

	// Build reward preview
	const rewardIcon = reward.type === 'egg' ? '🥚' : '🌸';
	const rewardName = reward.type === 'egg'
		? 'Egg'
		: capitalize(reward.plantType);

	modal.innerHTML = `
		<div class="game-modal-content">
			<div class="game-modal-header">
				<h2>${game.getTitle()}</h2>
				<div class="game-reward-preview">
					<span class="reward-icon">${rewardIcon}</span>
					<span class="reward-name">${rewardName}</span>
				</div>
			</div>
			<div class="game-container" id="game-container-inner"></div>
			<button id="close-game-modal" class="game-close-btn">✖</button>
		</div>
	`;

	modal.classList.remove('hidden');

	// Initialize game
	const gameContainer = $('game-container-inner');
	game.init(gameContainer, (won) => {
		handleGameEnd(won, reward, onComplete);
	});

	// Close button handler (forfeit)
	$('close-game-modal').addEventListener('click', () => {
		if (currentGame) {
			currentGame.destroy();
			currentGame = null;
		}
		modal.classList.add('hidden');
		onComplete(false); // Count as loss
	});
}

function handleGameEnd(won, reward, onComplete) {
	const modal = $('game-modal');
	const gameContainer = $('game-container-inner');

	// Cleanup game
	if (currentGame) {
		currentGame.destroy();
		currentGame = null;
	}

	// Show result screen
	const rewardIcon = reward.type === 'egg' ? '🥚' : '🌸';
	const rewardName = reward.type === 'egg'
		? 'Egg'
		: capitalize(reward.plantType);

	gameContainer.innerHTML = `
		<div class="game-result ${won ? 'win' : 'lose'}">
			<div class="result-icon">${won ? '🎉' : '😔'}</div>
			<h2>${won ? 'You Won!' : 'Try Again!'}</h2>
			${won ? `
				<div class="reward-display">
					<div class="reward-icon-large">${rewardIcon}</div>
					<div class="reward-name-large">${rewardName}</div>
				</div>
			` : '<p>Better luck next time!</p>'}
			<button id="result-ok-btn" class="result-btn">OK</button>
		</div>
	`;

	// OK button closes modal and triggers callback
	$('result-ok-btn').addEventListener('click', () => {
		modal.classList.add('hidden');
		onComplete(won);
	});
}

// ─── Narrator Help System ─────────────────────────────────────
let narratorAnimationInterval = null;

/**
 * Show narrator with game-specific help text
 * @param {Object} game - Game instance with getTitle() method
 * @param {Function} onDismiss - Callback when user clicks to continue to game
 * @param {Function} onCancel - Optional callback when user cancels (clicks outside)
 */
export function showNarratorHelp(game, onDismiss, onCancel = null) {
	const gameTitle = game.getTitle();
	const helpContent = GAME_HELP_TEXT[gameTitle];

	if (!helpContent) {
		console.warn('No help text found for game:', gameTitle);
		// Fallback: continue without narrator
		onDismiss();
		return;
	}

	// Remove existing narrator if any
	hideNarratorHelp();

	// Create narrator container
	const level1Screen = $('level1-screen');
	if (!level1Screen) {
		console.error('level1-screen element not found!');
		onDismiss();
		return;
	}

	// Create backdrop
	const backdrop = document.createElement('div');
	backdrop.id = 'narrator-backdrop';
	level1Screen.appendChild(backdrop);

	// Create narrator container
	const narratorContainer = document.createElement('div');
	narratorContainer.id = 'narrator-container';
	narratorContainer.innerHTML = `
		<div id="narrator-sprite"></div>
		<div class="narrator-dialog">
			<div class="narrator-dialog-title">${helpContent.title}</div>
			<div class="narrator-dialog-text">${helpContent.instruction}</div>
			<div class="narrator-dismiss-hint">Click to continue →</div>
		</div>
	`;

	level1Screen.appendChild(narratorContainer);

	// Start mouth animation
	startMouthAnimation();

	// Click on dialog to dismiss
	const dialog = narratorContainer.querySelector('.narrator-dialog');
	dialog.addEventListener('click', (e) => {
		e.stopPropagation(); // Prevent backdrop click
		hideNarratorHelp();
		onDismiss();
	});

	// Click outside (backdrop) to cancel
	backdrop.addEventListener('click', () => {
		hideNarratorHelp();
		if (onCancel) {
			onCancel();
		}
		// Don't call onDismiss - that would load the game
	});
}

/**
 * Hide narrator with slide-out animation
 */
export function hideNarratorHelp() {
	const narratorContainer = $('narrator-container');
	const backdrop = $('narrator-backdrop');

	if (!narratorContainer) return;

	// Stop mouth animation
	stopMouthAnimation();

	// Trigger slide-out animation
	narratorContainer.classList.add('sliding-out');
	if (backdrop) backdrop.classList.add('fading-out');

	// Remove from DOM after animation completes
	setTimeout(() => {
		if (narratorContainer && narratorContainer.parentNode) {
			narratorContainer.parentNode.removeChild(narratorContainer);
		}
		if (backdrop && backdrop.parentNode) {
			backdrop.parentNode.removeChild(backdrop);
		}
	}, 400); // Match animation duration in CSS
}

/**
 * Start narrator mouth animation (toggle between open/closed)
 */
function startMouthAnimation() {
	const sprite = $('narrator-sprite');
	if (!sprite) return;

	let isOpen = false;
	narratorAnimationInterval = setInterval(() => {
		isOpen = !isOpen;
		if (isOpen) {
			sprite.classList.add('mouth-open');
		} else {
			sprite.classList.remove('mouth-open');
		}
	}, 300); // Toggle every 300ms
}

/**
 * Stop narrator mouth animation
 */
function stopMouthAnimation() {
	if (narratorAnimationInterval) {
		clearInterval(narratorAnimationInterval);
		narratorAnimationInterval = null;
	}
}
