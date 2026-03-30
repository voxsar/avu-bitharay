/**
 * Scores routes — submit and retrieve highscores
 * GET  /api/scores/leaderboard    – top 50 scores (public)
 * POST /api/scores                – submit a score (token required)
 * GET  /api/scores/player/:id     – scores for a specific player (token required)
 */

'use strict';

const express = require('express');
const db = require('../database');

const router = express.Router();

// ─── GET /api/scores/leaderboard ──────────────────────────────
router.get('/leaderboard', (req, res) => {
	const limit = Math.min(parseInt(req.query.limit) || 50, 100);

	const rows = db.prepare(`
    SELECT
      s.id,
      p.username,
      s.score,
      s.day_reached,
      s.egg_health,
      s.coins_gold,
      s.coins_red,
      s.coins_silver,
      s.phase,
      s.created_at,
      ROW_NUMBER() OVER (ORDER BY s.score DESC, s.egg_health DESC, s.created_at ASC) AS rank
    FROM scores s
    JOIN players p ON p.id = s.player_id
    ORDER BY s.score DESC, s.egg_health DESC, s.created_at ASC
    LIMIT ?
  `).all(limit);

	return res.json({ leaderboard: rows, total: rows.length });
});

// ─── POST /api/scores ─────────────────────────────────────────
router.post('/', (req, res) => {
	const token = extractToken(req);
	if (!token) return res.status(401).json({ error: 'Authorization token required' });

	// Resolve player from token
	const player = db.prepare('SELECT id FROM players WHERE token = ?').get(token);
	if (!player) return res.status(401).json({ error: 'Invalid token' });

	const { score, dayReached, eggHealth, coinsGold, coinsRed, coinsSilver, phase } = req.body || {};

	if (typeof score !== 'number' || score < 0) {
		return res.status(400).json({ error: 'score must be a non-negative number' });
	}

	const insert = db.prepare(`
    INSERT INTO scores (player_id, score, day_reached, egg_health, coins_gold, coins_red, coins_silver, phase)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

	const result = insert.run(
		player.id,
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
});

// ─── GET /api/scores/player/:id ───────────────────────────────
router.get('/player/:id', (req, res) => {
	const token = extractToken(req);
	if (!token) return res.status(401).json({ error: 'Authorization token required' });

	const player = db.prepare('SELECT id FROM players WHERE id = ? AND token = ?')
		.get(req.params.id, token);
	if (!player) return res.status(404).json({ error: 'Player not found or token invalid' });

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
function extractToken(req) {
	const auth = req.headers.authorization || '';
	if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
	return null;
}

function clamp(val, min, max) {
	const n = parseInt(val) || 0;
	return Math.min(Math.max(n, min), max);
}

module.exports = router;
