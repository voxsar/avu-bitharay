/**
 * Players routes — registration, login, and profile
 * POST /api/players/register  – create a new player (password → bcrypt hash)
 * POST /api/players/login     – verify password, return signed JWT
 * GET  /api/players/:id       – get player info (JWT required)
 */

'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRY = '1y'; // 1-year expiry as requested
const BCRYPT_ROUNDS = 10;

// ─── POST /api/players/register ───────────────────────────────
router.post('/register', async (req, res) => {
	const { username, password, email } = req.body || {};

	if (!username || typeof username !== 'string') {
		return res.status(400).json({ error: 'username is required' });
	}

	const trimmed = username.trim().slice(0, 30);
	if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed) || trimmed.length < 2) {
		return res.status(400).json({
			error: 'username must be 2–30 characters and contain only letters, numbers, spaces, hyphens or underscores'
		});
	}

	if (!password || typeof password !== 'string' || password.length < 6) {
		return res.status(400).json({ error: 'password must be at least 6 characters' });
	}

	// Validate optional email
	if (email && typeof email === 'string' && email.length > 0) {
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return res.status(400).json({ error: 'invalid email address' });
		}
	}

	try {
		const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
		const id = uuidv4();

		db.prepare(
			'INSERT INTO players (id, username, email, password_hash) VALUES (?, ?, ?, ?)'
		).run(id, trimmed, email?.trim() || null, passwordHash);

		const token = jwt.sign({ sub: id, username: trimmed }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

		return res.status(201).json({ playerId: id, username: trimmed, token });
	} catch (err) {
		if (err.message && err.message.includes('UNIQUE')) {
			return res.status(409).json({ error: 'Username is already taken' });
		}
		console.error('Register error:', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
});

// ─── POST /api/players/login ──────────────────────────────────
router.post('/login', async (req, res) => {
	const { username, password } = req.body || {};

	if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
		return res.status(400).json({ error: 'username and password are required' });
	}

	const player = db.prepare(
		'SELECT id, username, password_hash FROM players WHERE username = ?'
	).get(username.trim());

	if (!player) {
		return res.status(401).json({ error: 'Invalid username or password' });
	}

	const match = await bcrypt.compare(password, player.password_hash);
	if (!match) {
		return res.status(401).json({ error: 'Invalid username or password' });
	}

	const token = jwt.sign({ sub: player.id, username: player.username }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

	return res.json({ playerId: player.id, username: player.username, token });
});

// ─── GET /api/players/:id ─────────────────────────────────────
router.get('/:id', (req, res) => {
	const payload = verifyJWT(req);
	if (!payload) return res.status(401).json({ error: 'Valid JWT required' });
	if (String(payload.sub) !== String(req.params.id)) return res.status(403).json({ error: 'Forbidden' });

	const player = db.prepare('SELECT id, username, email, created_at FROM players WHERE id = ?')
		.get(req.params.id);

	if (!player) return res.status(404).json({ error: 'Player not found' });

	const best = db.prepare('SELECT MAX(score) as best FROM scores WHERE player_id = ?')
		.get(req.params.id);

	return res.json({ ...player, bestScore: best?.best || 0 });
});

// ─── Helper ───────────────────────────────────────────────────
function verifyJWT(req) {
	const auth = req.headers.authorization || '';
	const raw = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
	if (!raw) return null;
	try {
		return jwt.verify(raw, JWT_SECRET);
	} catch {
		return null;
	}
}

module.exports = router;
module.exports.verifyJWT = verifyJWT;
