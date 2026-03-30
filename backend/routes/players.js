/**
 * Players routes — registration and profile
 * POST /api/players/register  – create a new player
 * GET  /api/players/:id       – get player info (token required)
 */

'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();

// ─── POST /api/players/register ───────────────────────────────
router.post('/register', (req, res) => {
	const { username, email } = req.body || {};

	if (!username || typeof username !== 'string') {
		return res.status(400).json({ error: 'username is required' });
	}

	const trimmed = username.trim().slice(0, 30);
	if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed) || trimmed.length < 2) {
		return res.status(400).json({
			error: 'username must be 2–30 characters and contain only letters, numbers, spaces, hyphens or underscores'
		});
	}

	// Validate optional email
	if (email && typeof email === 'string' && email.length > 0) {
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return res.status(400).json({ error: 'invalid email address' });
		}
	}

	const id = uuidv4();
	const token = uuidv4();

	try {
		const insert = db.prepare(
			'INSERT INTO players (id, username, email, token) VALUES (?, ?, ?, ?)'
		);
		insert.run(id, trimmed, email?.trim() || null, token);

		return res.status(201).json({
			playerId: id,
			username: trimmed,
			token,
			message: 'Player registered successfully. Keep your token safe — it authenticates future requests.'
		});
	} catch (err) {
		if (err.message && err.message.includes('UNIQUE')) {
			return res.status(409).json({ error: 'Username is already taken' });
		}
		console.error('Register error:', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
});

// ─── POST /api/players/login ──────────────────────────────────
router.post('/login', (req, res) => {
	const { username, token } = req.body || {};

	if (!username || typeof username !== 'string' || !token || typeof token !== 'string') {
		return res.status(400).json({ error: 'username and token are required' });
	}

	const player = db.prepare(
		'SELECT id, username, email FROM players WHERE username = ? AND token = ?'
	).get(username.trim(), token.trim());

	if (!player) {
		return res.status(401).json({ error: 'Invalid username or token' });
	}

	return res.json({ playerId: player.id, username: player.username, token: token.trim() });
});

// ─── GET /api/players/:id ─────────────────────────────────────
router.get('/:id', (req, res) => {
	const token = extractToken(req);
	if (!token) return res.status(401).json({ error: 'Authorization token required' });

	const player = db.prepare('SELECT id, username, email, created_at FROM players WHERE id = ? AND token = ?')
		.get(req.params.id, token);

	if (!player) return res.status(404).json({ error: 'Player not found or token invalid' });

	// Best score for this player
	const best = db.prepare('SELECT MAX(score) as best FROM scores WHERE player_id = ?')
		.get(req.params.id);

	return res.json({ ...player, bestScore: best?.best || 0 });
});

// ─── Helper ───────────────────────────────────────────────────
function extractToken(req) {
	const auth = req.headers.authorization || '';
	if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
	return null;
}

module.exports = router;
