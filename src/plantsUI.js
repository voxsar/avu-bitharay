/**
 * FLOWER POT UI SYSTEM
 * ─────────────────────────────────────────────────────────────
 * Handles visual display and user interactions for the pot grid.
 */

import {
	loadPlantState,
	savePlantState,
	waterPot,
	getPotInfo,
	getSpritePosition,
	PLANT_CONFIG
} from './plants.js';

// ─── State ────────────────────────────────────────────────────
let potState = null;
let isDragging = false;
let wateringMode = false;

// ─── Initialize ───────────────────────────────────────────────
export function initPlantUI() {
	console.log('🌱 initPlantUI() called');
	potState = loadPlantState();
	console.log('Loaded potState:', potState);

	// Auto-populate with test plants if garden is empty (for testing)
	autoPopulateTestGarden();

	setupEventListeners();
	renderAllPots();
	console.log('✅ Plant UI initialized');
}

// Expose globally for debugging
window.debugRenderPots = () => {
	renderAllPots();
	console.log('Pots re-rendered');
};

/**
 * Auto-populate empty garden with random plants for testing
 */
function autoPopulateTestGarden() {
	// Check if any pots have plants
	const hasAnyPlants = potState.some(pot => pot.plantType !== null);

	if (!hasAnyPlants) {
		console.log('🌱 Empty garden detected - auto-populating with test plants...');

		const plantTypes = ['rose', 'marigold', 'sunflower', 'daffodil'];

		// Plant 6 random plants in random positions
		const potsToFill = 6;
		const availablePots = [0, 1, 2, 3, 4, 5, 6, 7, 8];

		// Shuffle and take first 6 pots
		for (let i = availablePots.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[availablePots[i], availablePots[j]] = [availablePots[j], availablePots[i]];
		}

		const selectedPots = availablePots.slice(0, potsToFill);

		selectedPots.forEach((potIndex, i) => {
			const randomPlant = plantTypes[i % plantTypes.length];
			potState[potIndex].plantType = randomPlant;
			potState[potIndex].stage = 0;
			potState[potIndex].waterings = 0;
			potState[potIndex].lastWatered = null;
		});

		savePlantState(potState);
		console.log('✅ Test garden created! Click the watering can (or press W) to start watering.');
	}
}

// ─── Rendering ────────────────────────────────────────────────
/**
 * Render all 9 pots in the grid
 */
function renderAllPots() {
	const potCells = document.querySelectorAll('#pot-grid .pot-cell');
	console.log(`Rendering ${potCells.length} pots`);

	potCells.forEach((cell, index) => {
		renderPot(cell, index);
	});
}

/**
 * Render a single pot
 */
function renderPot(cell, potIndex) {
	const pot = potState[potIndex];
	const info = getPotInfo(pot);
	console.log(`Rendering pot ${potIndex}:`, info.isEmpty ? 'empty' : info.plantType);


	// Clear existing content
	cell.innerHTML = '';
	cell.className = 'pot-cell';

	if (info.isEmpty) {
		// Empty pot - show base pot image
		cell.classList.add('empty');
		const potImg = document.createElement('div');
		potImg.className = 'pot-base';
		cell.appendChild(potImg);
		return;
	}

	// Has a plant - show plant sprite
	cell.classList.add('has-plant');
	cell.setAttribute('data-pot-index', potIndex);
	cell.setAttribute('data-plant-type', info.plantType);

	// Plant sprite container
	const plantSprite = document.createElement('div');
	plantSprite.className = 'plant-sprite';
	plantSprite.style.backgroundImage = `url('${info.spritePath}')`;

	// Set sprite position based on stage (7 horizontal frames)
	const xPos = getSpritePosition(pot.stage);
	plantSprite.style.backgroundPositionX = `${xPos}%`;
	plantSprite.style.backgroundPositionY = '0%';

	cell.appendChild(plantSprite);

	// Progress indicator
	const progressBar = document.createElement('div');
	progressBar.className = 'pot-progress';

	const progressFill = document.createElement('div');
	progressFill.className = 'pot-progress-fill';
	progressFill.style.width = `${info.progress}%`;
	progressFill.style.backgroundColor = info.color;

	progressBar.appendChild(progressFill);
	cell.appendChild(progressBar);

	// Watering counter (dots showing waterings in current stage)
	if (!info.isFullyGrown) {
		const wateringDots = document.createElement('div');
		wateringDots.className = 'watering-dots';

		for (let i = 0; i < 3; i++) {
			const dot = document.createElement('div');
			dot.className = 'watering-dot';
			if (i < pot.waterings) {
				dot.classList.add('filled');
			}
			wateringDots.appendChild(dot);
		}

		cell.appendChild(wateringDots);
	} else {
		// Fully grown indicator
		const grownBadge = document.createElement('div');
		grownBadge.className = 'fully-grown-badge';
		grownBadge.textContent = '✓';
		cell.appendChild(grownBadge);
	}

	// Plant name label
	const nameLabel = document.createElement('div');
	nameLabel.className = 'plant-name';
	nameLabel.textContent = info.plantName;
	cell.appendChild(nameLabel);
}

// ─── Event Listeners ──────────────────────────────────────────
function setupEventListeners() {
	const wateringCan = document.getElementById('watering-can');
	const potGrid = document.getElementById('pot-grid');

	if (!wateringCan || !potGrid) {
		console.error('Required elements not found');
		return;
	}

	// Watering can click to toggle watering mode
	wateringCan.addEventListener('click', () => {
		wateringMode = !wateringMode;
		wateringCan.classList.toggle('active', wateringMode);
		document.body.classList.toggle('watering-mode', wateringMode);

		if (wateringMode) {
			showFeedback('💧 Watering mode ON - Click a plant to water it!', 'info');
		} else {
			showFeedback('Watering mode OFF', 'info');
		}
	});

	// Click on pot to water (when in watering mode)
	potGrid.addEventListener('click', (e) => {
		if (!wateringMode) return;

		const potCell = e.target.closest('.pot-cell');
		if (!potCell) return;

		const potIndex = Array.from(potGrid.children).indexOf(potCell);
		handleWaterPot(potIndex);
	});

	// Drag and drop watering (alternative method)
	wateringCan.draggable = true;

	wateringCan.addEventListener('dragstart', (e) => {
		isDragging = true;
		wateringCan.classList.add('dragging');
		e.dataTransfer.effectAllowed = 'move';
	});

	wateringCan.addEventListener('dragend', () => {
		isDragging = false;
		wateringCan.classList.remove('dragging');
	});

	// Allow drop on pots
	potGrid.addEventListener('dragover', (e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	});

	potGrid.addEventListener('drop', (e) => {
		e.preventDefault();

		const potCell = e.target.closest('.pot-cell');
		if (!potCell) return;

		const potIndex = Array.from(potGrid.children).indexOf(potCell);
		handleWaterPot(potIndex);
	});

	// Keyboard shortcut: W key toggles watering mode
	document.addEventListener('keydown', (e) => {
		if (e.key.toLowerCase() === 'w' && !e.ctrlKey && !e.metaKey) {
			wateringCan.click();
		}
	});
}

// ─── Actions ──────────────────────────────────────────────────
/**
 * Handle watering a pot
 */
function handleWaterPot(potIndex) {
	const result = waterPot(potState, potIndex);

	if (!result.success) {
		showFeedback(result.message, 'error');
		playSound('error');
		return;
	}

	// Save state
	savePlantState(potState);

	// Visual feedback
	showWaterAnimation(potIndex);
	playSound('water');

	// Update the pot display
	const potCells = document.querySelectorAll('#pot-grid .pot-cell');
	renderPot(potCells[potIndex], potIndex);

	// Show message
	const messageType = result.stageUp ? 'success' : 'info';
	showFeedback(result.message, messageType);

	// If fully grown, extra celebration
	if (result.fullyGrown) {
		celebrateFullyGrown(potIndex);
	}
}

// ─── Visual Effects ───────────────────────────────────────────
/**
 * Show water droplets animation on a pot
 */
function showWaterAnimation(potIndex) {
	const potCells = document.querySelectorAll('#pot-grid .pot-cell');
	const cell = potCells[potIndex];

	// Add water drops
	for (let i = 0; i < 5; i++) {
		const drop = document.createElement('div');
		drop.className = 'water-drop';
		drop.style.left = `${20 + Math.random() * 60}%`;
		drop.style.animationDelay = `${i * 0.1}s`;
		cell.appendChild(drop);

		setTimeout(() => drop.remove(), 1000);
	}

	// Flash the cell
	cell.classList.add('being-watered');
	setTimeout(() => cell.classList.remove('being-watered'), 600);
}

/**
 * Celebrate when a plant becomes fully grown
 */
function celebrateFullyGrown(potIndex) {
	const potCells = document.querySelectorAll('#pot-grid .pot-cell');
	const cell = potCells[potIndex];

	// Sparkle effect
	cell.classList.add('celebrating');

	for (let i = 0; i < 10; i++) {
		const sparkle = document.createElement('div');
		sparkle.className = 'sparkle';
		sparkle.style.left = `${Math.random() * 100}%`;
		sparkle.style.top = `${Math.random() * 100}%`;
		sparkle.style.animationDelay = `${i * 0.1}s`;
		cell.appendChild(sparkle);

		setTimeout(() => sparkle.remove(), 1500);
	}

	setTimeout(() => cell.classList.remove('celebrating'), 1500);
}

/**
 * Show feedback message to user
 */
function showFeedback(message, type = 'info') {
	// Remove existing feedback
	const existing = document.querySelector('.plant-feedback');
	if (existing) existing.remove();

	const feedback = document.createElement('div');
	feedback.className = `plant-feedback ${type}`;
	feedback.textContent = message;

	const potGrid = document.getElementById('pot-grid');
	potGrid.parentElement.appendChild(feedback);

	// Auto-remove after 3 seconds
	setTimeout(() => {
		feedback.classList.add('fade-out');
		setTimeout(() => feedback.remove(), 300);
	}, 3000);
}

// ─── Sound Effects ────────────────────────────────────────────
function playSound(type) {
	// Use existing sound file if available
	const soundMap = {
		water: 'assets/audio/pourcan.mp3',
		error: 'assets/audio/single_crow.mp3',
		success: 'assets/audio/drumroll.mp3'
	};

	const soundFile = soundMap[type];
	if (!soundFile) return;

	try {
		const audio = new Audio(soundFile);
		audio.volume = 0.3;
		audio.play().catch(() => {
			// Ignore errors if sound can't play
		});
	} catch (e) {
		// Ignore sound errors
	}
}

// ─── Debug / Testing Helpers ──────────────────────────────────
/**
 * Plant a random seed in the first empty pot (for testing)
 */
export function debugPlantRandom() {
	const emptyIndex = potState.findIndex(pot => !pot.plantType);
	if (emptyIndex === -1) {
		console.log('No empty pots!');
		return;
	}

	const types = Object.values(PLANT_CONFIG).map((_, i, arr) =>
		['rose', 'marigold', 'sunflower', 'jasmine', 'daffodil'][i]
	);
	const randomType = types[Math.floor(Math.random() * types.length)];

	potState[emptyIndex].plantType = randomType;
	potState[emptyIndex].stage = 0;
	potState[emptyIndex].waterings = 0;

	savePlantState(potState);
	renderAllPots();

	console.log(`Planted ${randomType} in pot ${emptyIndex}`);
}

/**
 * Reset all pots (for testing)
 */
export function debugResetPots() {
	potState = Array.from({ length: 9 }, () => ({
		plantType: null,
		stage: 0,
		waterings: 0,
		lastWatered: null
	}));
	savePlantState(potState);
	renderAllPots();
	console.log('All pots reset');
}

// Make debug functions available globally for console testing
if (typeof window !== 'undefined') {
	window.debugPlantRandom = debugPlantRandom;
	window.debugResetPots = debugResetPots;
}
