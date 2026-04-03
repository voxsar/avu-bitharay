/**
 * DIALOGUE & NARRATIVE SYSTEM
 * ─────────────────────────────────────────────────────────────
 * Manages character dialogues, player choices, and stat tracking
 * Characters: Nilame (tradition/competition), Witch (compassion/humanity)
 */

import { saveGameProgress } from './api.js';

// ─── Character Types ──────────────────────────────────────────
export const CHARACTERS = {
	nilame: {
		name: 'Nilame',
		color: '#8B4513',
		emoji: '👨‍⚖️',
		image: 'assets/images/narrator_open.png'
	},
	witch: {
		name: 'Witch',
		color: '#9370DB',
		emoji: '🧙‍♀️',
		image: 'assets/images/nona.png'
	},
	system: {
		name: 'System',
		color: '#666',
		emoji: '⚙️',
		image: null
	}
};

// ─── Dialogue State Management ───────────────────────────────
let dialogueState = null;

function makeDefaultDialogueState() {
	return {
		stats: {
			tradition: 0,
			compassion: 0,
			competition: 0,
			humanity: 0
		},
		flags: [], // Story flags (e.g., 'witch_trust', 'gave_seeds')
		seenNodes: [], // Track which dialogue nodes have been shown
		currentNode: null
	};
}

export function initDialogueState(saved) {
	if (saved && typeof saved === 'object') {
		dialogueState = { ...makeDefaultDialogueState(), ...saved };
	} else {
		dialogueState = makeDefaultDialogueState();
	}
	return dialogueState;
}

export function getDialogueState() {
	if (!dialogueState) {
		dialogueState = makeDefaultDialogueState();
	}
	return dialogueState;
}

export function saveDialogueState(state) {
	dialogueState = state;
	// Save to game progress (will be stored in game state)
}

// ─── Stat Modifiers ───────────────────────────────────────────
export function modifyStats(effects) {
	const state = getDialogueState();

	if (effects.tradition !== undefined) {
		state.stats.tradition += effects.tradition;
	}
	if (effects.compassion !== undefined) {
		state.stats.compassion += effects.compassion;
	}
	if (effects.competition !== undefined) {
		state.stats.competition += effects.competition;
	}
	if (effects.humanity !== undefined) {
		state.stats.humanity += effects.humanity;
	}

	// Add flags
	if (effects.flags && Array.isArray(effects.flags)) {
		effects.flags.forEach(flag => {
			if (!state.flags.includes(flag)) {
				state.flags.push(flag);
			}
		});
	}

	saveDialogueState(state);
	return state;
}

export function hasFlag(flag) {
	const state = getDialogueState();
	return state.flags.includes(flag);
}

export function getStat(statName) {
	const state = getDialogueState();
	return state.stats[statName] || 0;
}

// ─── Condition Evaluation ─────────────────────────────────────
/**
 * Evaluate trigger conditions for a dialogue node
 * @param {Array} conditions - Array of condition strings (e.g., ["seeds >= 2", "level == 1"])
 * @param {Object} gameContext - Current game state context
 * @returns {boolean}
 */
export function evaluateConditions(conditions, gameContext) {
	if (!conditions || conditions.length === 0) return true;

	const state = getDialogueState();

	return conditions.every(condition => {
		// Parse condition string (e.g., "seeds >= 2")
		const match = condition.match(/^(\w+)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
		if (!match) return false;

		const [, variable, operator, valueStr] = match;
		let value = isNaN(valueStr) ? valueStr.trim() : Number(valueStr);

		// Get actual value based on variable name
		let actualValue;
		if (variable === 'seeds') {
			actualValue = gameContext.seeds || 0;
		} else if (variable === 'level') {
			actualValue = gameContext.level || 1;
		} else if (variable === 'games_completed') {
			actualValue = gameContext.gamesCompleted || 0;
		} else if (variable.endsWith('_score')) {
			// e.g., competition_score
			const statName = variable.replace('_score', '');
			actualValue = state.stats[statName] || 0;
		} else if (state.flags.includes(variable)) {
			actualValue = true;
			value = (valueStr === 'true');
		} else {
			actualValue = false;
		}

		// Evaluate operator
		switch (operator) {
			case '==': return actualValue == value;
			case '!=': return actualValue != value;
			case '>=': return actualValue >= value;
			case '<=': return actualValue <= value;
			case '>': return actualValue > value;
			case '<': return actualValue < value;
			default: return false;
		}
	});
}

// ─── Dialogue Node Processing ─────────────────────────────────
/**
 * Find the next eligible dialogue node based on trigger conditions
 * @param {Array} nodes - All dialogue nodes
 * @param {Object} triggerContext - Context for trigger evaluation (type, gameContext)
 * @returns {Object|null} - The matching node or null
 */
export function findTriggeredNode(nodes, triggerContext) {
	const state = getDialogueState();
	const { type, gameContext } = triggerContext;

	// Filter nodes by trigger type
	const eligibleNodes = nodes.filter(node => {
		// Skip already seen nodes (unless they're followup or random)
		if (state.seenNodes.includes(node.id) &&
		    node.trigger.type !== 'followup' &&
		    node.trigger.type !== 'random') {
			return false;
		}

		// Check trigger type
		if (node.trigger.type !== type) return false;

		// Evaluate conditions
		return evaluateConditions(node.trigger.conditions, gameContext);
	});

	if (eligibleNodes.length === 0) return null;

	// For random triggers, pick one randomly
	if (type === 'random') {
		const randomIndex = Math.floor(Math.random() * eligibleNodes.length);
		return eligibleNodes[randomIndex];
	}

	// Otherwise return the first eligible node
	return eligibleNodes[0];
}

/**
 * Mark a dialogue node as seen
 * @param {string} nodeId
 */
export function markNodeSeen(nodeId) {
	const state = getDialogueState();
	if (!state.seenNodes.includes(nodeId)) {
		state.seenNodes.push(nodeId);
		saveDialogueState(state);
	}
}

// ─── Dialogue UI ──────────────────────────────────────────────

/** Prevent more than one dialogue popup at a time */
let isDialogueOpen = false;

/**
 * Show a dialogue box with character portrait, message, and choices.
 * Only one dialogue may be open at a time.
 * @param {Object} node - Dialogue node to display
 * @param {Function} onChoice - Callback(choiceIndex, choice)
 */
export function showDialogue(node, onChoice) {
	if (isDialogueOpen) return;
	isDialogueOpen = true;

	const character = CHARACTERS[node.character] || CHARACTERS.system;

	// Build the portrait section if the character has an image
	const portraitHTML = character.image
		? `<img class="dialogue-character-portrait" src="${character.image}" alt="${character.name}" />`
		: `<span class="dialogue-character-icon">${character.emoji}</span>`;

	// Create dialogue overlay
	const overlay = document.createElement('div');
	overlay.id = 'dialogue-overlay';
	overlay.className = 'dialogue-overlay';

	overlay.innerHTML = `
		<div class="dialogue-box">
			<div class="dialogue-header">
				${portraitHTML}
				<span class="dialogue-character-name" style="color: ${character.color}">${character.name}</span>
			</div>
			<div class="dialogue-content">
				<p class="dialogue-text">${node.dialogue}</p>
			</div>
			<div class="dialogue-choices" id="dialogue-choices"></div>
		</div>
	`;

	document.body.appendChild(overlay);

	// Add choices
	const choicesContainer = overlay.querySelector('#dialogue-choices');
	node.choices.forEach((choice, index) => {
		const button = document.createElement('button');
		button.className = 'dialogue-choice-btn';
		button.textContent = choice.text;
		button.addEventListener('click', () => {
			removeDialogue();
			if (onChoice) onChoice(index, choice);
		});
		choicesContainer.appendChild(button);
	});

	// Mark node as seen
	markNodeSeen(node.id);
}

/**
 * Remove the dialogue overlay
 */
export function removeDialogue() {
	const overlay = document.getElementById('dialogue-overlay');
	if (overlay) {
		overlay.remove();
	}
	isDialogueOpen = false;
}

/**
 * Process a player's choice and apply effects
 * @param {Object} choice - The choice object from a dialogue node
 * @param {Function} onNext - Callback for handling the next node
 */
export function processChoice(choice, onNext) {
	// Apply effects
	if (choice.effects) {
		modifyStats(choice.effects);

		// If coins are awarded, they should be added to game state
		if (choice.effects.coins) {
			// This will be handled by the caller who has access to game state
		}
	}

	// If there's a next node, call the callback with it
	if (choice.next && onNext) {
		onNext(choice.next);
	}
}
