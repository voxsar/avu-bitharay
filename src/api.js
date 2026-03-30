/**
 * API client for the Avu Bitharay backend
 * Base URL is auto-resolved: uses /api (proxied by Netlify) in production,
 * or falls back to the full backend URL for local dev.
 */

const API_BASE =
	window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
		? 'http://localhost:3000/api'
		: '/api';

const PLAYER_KEY = 'avurudhu_player_v1';

// ─── Local player persistence ─────────────────────────────────
export function getLocalPlayer() {
	try {
		const raw = localStorage.getItem(PLAYER_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function saveLocalPlayer(player) {
	localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
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

// ─── Submit score ─────────────────────────────────────────────
/**
 * Submit the player's final game score.
 * Silently fails if the player is not registered — score is local-only.
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
		// Network error — score stays local
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
