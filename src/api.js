/**
 * API client for the Avu Bitharay backend
 * Base URL is auto-resolved: uses /api (proxied by Netlify) in production,
 * or falls back to the full backend URL for local dev.
 */

const API_BASE =
	window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
		? 'http://localhost:3000/api'
		: '/api';

// Only the player key (token) is stored in localStorage — all game progress is in the DB.
const PLAYER_KEY = 'avurudhu_player_v1';

// ─── Local player persistence (token only) ────────────────────
export function getLocalPlayer() {
	try {
		const raw = localStorage.getItem(PLAYER_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function saveLocalPlayer(player) {
	// Only persist the minimal credentials needed for authentication
	localStorage.setItem(PLAYER_KEY, JSON.stringify({
		playerId: player.playerId,
		username: player.username,
		token: player.token,
	}));
}

// ─── Player login ─────────────────────────────────────────────
/**
 * Log in with an existing username + token pair.
 * @param {string} username
 * @param {string} token
 * @returns {Promise<{playerId, username, token}>}
 */
export async function loginPlayer(username, token) {
	const res = await fetch(`${API_BASE}/players/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, token }),
	});

	const data = await res.json();
	if (!res.ok) throw new Error(data.error || 'Login failed');

	saveLocalPlayer({ playerId: data.playerId, username: data.username, token: data.token });
	return data;
}

// ─── Player registration ──────────────────────────────────────
/**
 * Register a new player with the backend.
 * @param {string} username
 * @param {string} [email]
 * @returns {Promise<{playerId, username, token}>}
 */
export async function registerPlayer(username, email = '') {
	const res = await fetch(`${API_BASE}/players/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, email: email || undefined }),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.error || 'Registration failed');
	}

	saveLocalPlayer({ playerId: data.playerId, username: data.username, token: data.token });
	return data;
}

// ─── Progress persistence (DB-backed) ────────────────────────
/**
 * Load all progress for the authenticated player from the database.
 * @returns {Promise<{game, level1, plants}>}
 */
export async function loadAllProgress() {
	const player = getLocalPlayer();
	if (!player) return { game: null, level1: null, plants: null };

	try {
		const res = await fetch(`${API_BASE}/progress/all`, {
			headers: { Authorization: `Bearer ${player.token}` },
		});
		if (!res.ok) return { game: null, level1: null, plants: null };
		return await res.json();
	} catch {
		return { game: null, level1: null, plants: null };
	}
}

/**
 * Save the main game state to the database (fire-and-forget).
 * @param {object} state
 */
export function saveGameProgress(state) {
	const player = getLocalPlayer();
	if (!player) return;
	fetch(`${API_BASE}/progress/game`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${player.token}` },
		body: JSON.stringify({ state }),
	}).catch(() => { /* silent fail */ });
}

/**
 * Save the level-1 exploration state to the database (fire-and-forget).
 * @param {object} state
 */
export function saveLevel1Progress(state) {
	const player = getLocalPlayer();
	if (!player) return;
	fetch(`${API_BASE}/progress/level1`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${player.token}` },
		body: JSON.stringify({ state }),
	}).catch(() => { /* silent fail */ });
}

/**
 * Save the plant pot state to the database (fire-and-forget).
 * @param {Array} pots
 */
export function savePlantProgress(pots) {
	const player = getLocalPlayer();
	if (!player) return;
	fetch(`${API_BASE}/progress/plants`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${player.token}` },
		body: JSON.stringify({ state: pots }),
	}).catch(() => { /* silent fail */ });
}

// ─── Submit score ─────────────────────────────────────────────
/**
 * Submit the player's final game score.
 * @param {object} state  - game state object
 * @returns {Promise<{scoreId, rank}|null>}
 */
export async function submitScore(state) {
	const player = getLocalPlayer();
	if (!player) return null;

	const score = computeScore(state);

	try {
		const res = await fetch(`${API_BASE}/scores`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${player.token}`,
			},
			body: JSON.stringify({
				score,
				dayReached: state.currentDay,
				eggHealth: state.eggHealth,
				coinsGold: state.coins.gold,
				coinsRed: state.coins.red,
				coinsSilver: state.coins.silver,
				phase: state.phase,
			}),
		});

		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

// ─── Leaderboard ─────────────────────────────────────────────
/**
 * Fetch the top leaderboard entries.
 * @param {number} [limit=20]
 * @returns {Promise<Array>}
 */
export async function fetchLeaderboard(limit = 20) {
	try {
		const res = await fetch(`${API_BASE}/scores/leaderboard?limit=${limit}`);
		if (!res.ok) return [];
		const data = await res.json();
		return data.leaderboard || [];
	} catch {
		return [];
	}
}

// ─── Score calculation ────────────────────────────────────────
/**
 * Compute a numeric score from game state.
 * Formula: (day × 100) + eggHealth + (goldCoins × 2) + redCoins + silverCoins
 *          + streak bonus (streak × 25) + hatch bonus (500 if hatched)
 */
export function computeScore(state) {
	const dayPoints = (state.currentDay || 1) * 100;
	const healthPoints = state.eggHealth || 0;
	const coinPoints =
		(state.coins?.gold || 0) * 2 +
		(state.coins?.red || 0) +
		(state.coins?.silver || 0);
	const streakBonus = (state.streak || 0) * 25;
	const hatchBonus = state.phase === 'hatched' ? 500 : 0;

	return dayPoints + healthPoints + coinPoints + streakBonus + hatchBonus;
}
