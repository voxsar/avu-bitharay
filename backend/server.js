'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import routes (also initialises the DB schema on first load)
const playersRouter = require('./routes/players');
const scoresRouter = require('./routes/scores');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security & Parsing ───────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// ─── CORS ─────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
	.split(',')
	.map(o => o.trim())
	.filter(Boolean);

app.use(cors({
	origin(origin, cb) {
		// Allow server-to-server (no origin) and listed origins
		if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
		cb(new Error(`CORS: origin ${origin} not allowed`));
	},
	methods: ['GET', 'POST', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/players', playersRouter);
app.use('/api/scores', scoresRouter);

// ─── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 & Error handler ──────────────────────────────────────
app.use((_req, res) => {
	res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
	console.error(err.message || err);
	res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
	console.log(`Avu Bitharay API running on port ${PORT}`);
});
