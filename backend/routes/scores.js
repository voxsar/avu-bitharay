/**
 * Scores routes — submit and retrieve highscores
 * GET  /api/scores/leaderboard    – top 50 scores (public)
 * POST /api/scores                – submit a score (JWT required)
 * GET  /api/scores/player/:id     – scores for a specific player (JWT required)
 */

'use strict';

const express = require('express');
const db = require('../database');
const { verifyJWT } = require('./players');

const router = express.Router();

// ─── GET /api/scores/leaderboard ──────────────────────────────
router.get('/leaderboard', (req, res) => {
	const limit = Math.min(parseInt(req.query.limit) || 50, 100);

	// Fetch all active players with game progress
	const progressRows = db.prepare(`
    SELECT
      p.id,
      p.username,
      gp.state_json,
      gp.updated_at
    FROM players p
    JOIN game_progress gp ON p.id = gp.player_id
    WHERE gp.state_json IS NOT NULL
  `).all();

	// Compute live scores from game state
	const liveScores = progressRows.map(row => {
		const state = JSON.parse(row.state_json);
		const dayPoints = (state.currentDay || 1) * 100;
		const healthPoints = state.eggHealth || 0;
		const coinPoints =
			((state.coins?.gold || 0) * 2) +
			(state.coins?.red || 0) +
			(state.coins?.silver || 0);
		const streakBonus = (state.streak || 0) * 25;
		const hatchBonus = state.phase === 'hatched' ? 500 : 0;
		const score = dayPoints + healthPoints + coinPoints + streakBonus + hatchBonus;

		return {
			id: row.id,
			username: row.username,
			score,
			day_reached: state.currentDay || 1,
			egg_health: state.eggHealth || 0,
			coins_gold: state.coins?.gold || 0,
			coins_red: state.coins?.red || 0,
			coins_silver: state.coins?.silver || 0,
			phase: state.phase || 'playing',
			created_at: row.updated_at,
		};
	});

	// Sort by score descending, then health descending
	liveScores.sort((a, b) => {
		if (b.score !== a.score) return b.score - a.score;
		return b.egg_health - a.egg_health;
	});

	// Add rank and limit results
	const ranked = liveScores.slice(0, limit).map((entry, index) => ({
		...entry,
		rank: index + 1,
	}));

	return res.json({ leaderboard: ranked, total: ranked.length });
});

// ─── POST /api/scores ─────────────────────────────────────────
router.post('/', (req, res) => {
	const payload = verifyJWT(req);
	if (!payload) return res.status(401).json({ error: 'Valid JWT required' });

	const { score, dayReached, eggHealth, coinsGold, coinsRed, coinsSilver, phase } = req.body || {};

	if (typeof score !== 'number' || score < 0) {
		return res.status(400).json({ error: 'score must be a non-negative number' });
	}

	try {
		const insert = db.prepare(`
    INSERT INTO scores (player_id, score, day_reached, egg_health, coins_gold, coins_red, coins_silver, phase)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

		const result = insert.run(
			payload.sub,
			Math.round(score),
			clamp(dayReached, 1, 14),
			clamp(eggHealth, 0, 100),
			clamp(coinsGold, 0, 99999),
			clamp(coinsRed, 0, 99999),
			clamp(coinsSilver, 0, 99999),
			['playing', 'hatched', 'gameover'].includes(phase) ? phase : 'gameover'
		);

		// Find rank of this submission
		const rankRow = db.prepare(`
    SELECT COUNT(*) + 1 AS rank
    FROM scores
    WHERE score > ? OR (score = ? AND egg_health > ?)
  `).get(Math.round(score), Math.round(score), clamp(eggHealth, 0, 100));

		return res.status(201).json({
			scoreId: result.lastInsertRowid,
			rank: rankRow?.rank || 1,
			message: 'Score submitted successfully'
		});
	} catch (err) {
		if (err.message.includes('FOREIGN KEY constraint')) {
			return res.status(410).json({ error: 'Player account no longer exists. Please register again.' });
		}
		console.error(err.message);
		return res.status(500).json({ error: 'Database error' });
	}
});

// ─── GET /api/scores/player/:id ───────────────────────────────
router.get('/player/:id', (req, res) => {
	const payload = verifyJWT(req);
	if (!payload) return res.status(401).json({ error: 'Valid JWT required' });
	if (String(payload.sub) !== String(req.params.id)) return res.status(403).json({ error: 'Forbidden' });

	const scores = db.prepare(`
    SELECT id, score, day_reached, egg_health, coins_gold, coins_red, coins_silver, phase, created_at
    FROM scores
    WHERE player_id = ?
    ORDER BY score DESC, created_at DESC
    LIMIT 20
  `).all(req.params.id);

	return res.json({ scores });
});

// ─── Helpers ──────────────────────────────────────────────────
function clamp(val, min, max) {
	const n = parseInt(val) || 0;
	return Math.min(Math.max(n, min), max);
}

module.exports = router;
