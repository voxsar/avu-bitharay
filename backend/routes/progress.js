/**
 * Progress routes — save and load per-player game progress
 * GET /api/progress/all     – all progress for authenticated player
 * PUT /api/progress/game    – save main game state
 * PUT /api/progress/level1  – save level-1 exploration state
 * PUT /api/progress/plants  – save plant pot state
 */

'use strict';

const express = require('express');
const db = require('../database');

const router = express.Router();

// ─── Auth middleware ──────────────────────────────────────────
function requirePlayer(req, res, next) {
	const auth = req.headers.authorization || '';
	const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
	if (!token) return res.status(401).json({ error: 'Authorization token required' });

	const player = db.prepare('SELECT id FROM players WHERE token = ?').get(token);
	if (!player) return res.status(401).json({ error: 'Invalid token' });

	req.playerId = player.id;
	next();
}

// ─── GET /api/progress/all ────────────────────────────────────
router.get('/all', requirePlayer, (req, res) => {
	const game = db.prepare('SELECT state_json FROM game_progress WHERE player_id = ?').get(req.playerId);
	const level1 = db.prepare('SELECT state_json FROM level1_progress WHERE player_id = ?').get(req.playerId);
	const plants = db.prepare('SELECT state_json FROM plant_progress WHERE player_id = ?').get(req.playerId);

	return res.json({
		game: game ? JSON.parse(game.state_json) : null,
		level1: level1 ? JSON.parse(level1.state_json) : null,
		plants: plants ? JSON.parse(plants.state_json) : null,
	});
});

// ─── PUT /api/progress/game ───────────────────────────────────
router.put('/game', requirePlayer, (req, res) => {
	const { state } = req.body || {};
	if (!state || typeof state !== 'object' || Array.isArray(state)) {
		return res.status(400).json({ error: 'state must be an object' });
	}

	db.prepare(`
    INSERT INTO game_progress (player_id, state_json, updated_at)
    VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    ON CONFLICT(player_id) DO UPDATE SET
      state_json = excluded.state_json,
      updated_at = excluded.updated_at
  `).run(req.playerId, JSON.stringify(state));

	return res.json({ ok: true });
});

// ─── PUT /api/progress/level1 ─────────────────────────────────
router.put('/level1', requirePlayer, (req, res) => {
	const { state } = req.body || {};
	if (!state || typeof state !== 'object' || Array.isArray(state)) {
		return res.status(400).json({ error: 'state must be an object' });
	}

	db.prepare(`
    INSERT INTO level1_progress (player_id, state_json, updated_at)
    VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    ON CONFLICT(player_id) DO UPDATE SET
      state_json = excluded.state_json,
      updated_at = excluded.updated_at
  `).run(req.playerId, JSON.stringify(state));

	return res.json({ ok: true });
});

// ─── PUT /api/progress/plants ─────────────────────────────────
router.put('/plants', requirePlayer, (req, res) => {
	const { state } = req.body || {};
	if (!Array.isArray(state)) {
		return res.status(400).json({ error: 'state must be an array' });
	}

	db.prepare(`
    INSERT INTO plant_progress (player_id, state_json, updated_at)
    VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    ON CONFLICT(player_id) DO UPDATE SET
      state_json = excluded.state_json,
      updated_at = excluded.updated_at
  `).run(req.playerId, JSON.stringify(state));

	return res.json({ ok: true });
});

module.exports = router;
