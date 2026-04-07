/**
 * Leaderboard page — standalone view for high scores
 * Accessible at /score
 */

// API base URL (matches the pattern from api.js)
const API_BASE =
	window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
		? 'http://localhost:3000/api'
		: '/api';

const $ = (id) => document.getElementById(id);

/**
 * Fetch leaderboard data from the backend
 */
async function fetchLeaderboard(limit = 50) {
	try {
		const res = await fetch(`${API_BASE}/scores/leaderboard?limit=${limit}`);
		if (!res.ok) throw new Error('Failed to fetch leaderboard');
		const data = await res.json();
		return data.leaderboard || [];
	} catch (error) {
		console.error('Leaderboard fetch error:', error);
		throw error;
	}
}

/**
 * Format coin display with icons
 */
function formatCoins(gold, red, silver) {
	const parts = [];
	if (gold > 0) parts.push(`🥇${gold}`);
	if (red > 0) parts.push(`🔴${red}`);
	if (silver > 0) parts.push(`🥈${silver}`);
	return parts.length > 0 ? parts.join(' ') : '—';
}

/**
 * Format game phase for display
 */
function formatPhase(phase) {
	if (!phase) return '—';
	if (phase === 'hatched') return '🐣 Hatched';
	if (phase === 'nurturing') return '🥚 Nurturing';
	return phase;
}

/**
 * Get medal emoji for top 3 ranks
 */
function getMedalForRank(rank) {
	if (rank === 1) return '🥇';
	if (rank === 2) return '🥈';
	if (rank === 3) return '🥉';
	return rank;
}

/**
 * Render leaderboard table rows
 */
function renderLeaderboard(entries) {
	const tbody = $('leaderboard-body');
	tbody.innerHTML = '';

	if (entries.length === 0) {
		tbody.innerHTML = `
			<tr>
				<td colspan="7" class="no-data">No scores yet. Be the first to complete the adventure!</td>
			</tr>
		`;
		return;
	}

	entries.forEach((entry) => {
		const row = document.createElement('tr');
		row.className = entry.rank <= 3 ? 'top-rank' : '';

		row.innerHTML = `
			<td class="rank-col">${getMedalForRank(entry.rank)}</td>
			<td class="player-col">${escapeHtml(entry.username)}</td>
			<td class="score-col">${entry.score.toLocaleString()}</td>
			<td class="day-col">Day ${entry.day_reached || 1}</td>
			<td class="health-col">${entry.egg_health || 0}%</td>
			<td class="coins-col">${formatCoins(entry.coins_gold, entry.coins_red, entry.coins_silver)}</td>
			<td class="phase-col">${formatPhase(entry.phase)}</td>
		`;

		tbody.appendChild(row);
	});
}

/**
 * Simple HTML escape to prevent XSS
 */
function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Show/hide UI elements
 */
function showElement(elementId) {
	const el = $(elementId);
	if (el) {
		el.classList.remove('hidden');
		el.classList.add('visible');
	}
}

function hideElement(elementId) {
	const el = $(elementId);
	if (el) {
		el.classList.remove('visible');
		el.classList.add('hidden');
	}
}

/**
 * Load and display leaderboard
 */
async function loadLeaderboard() {
	showElement('loading-indicator');
	hideElement('leaderboard-error');
	hideElement('leaderboard-table-wrapper');

	try {
		const leaderboard = await fetchLeaderboard(100);
		hideElement('loading-indicator');
		showElement('leaderboard-table-wrapper');
		renderLeaderboard(leaderboard);
	} catch (error) {
		hideElement('loading-indicator');
		showElement('leaderboard-error');
	}
}

/**
 * Initialize the leaderboard page
 */
function init() {
	// Load leaderboard on page load
	loadLeaderboard();

	// Refresh button
	const refreshBtn = $('refresh-button');
	if (refreshBtn) {
		refreshBtn.addEventListener('click', () => {
			refreshBtn.disabled = true;
			refreshBtn.textContent = '⏳ Refreshing...';

			loadLeaderboard().finally(() => {
				refreshBtn.disabled = false;
				refreshBtn.textContent = '🔄 Refresh';
			});
		});
	}
}

// Start when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
