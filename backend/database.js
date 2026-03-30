/**
 * Database setup using Node.js built-in sqlite (node:sqlite)
 * Available in Node.js >= 22.5.0
 *
 * Tables:
 *   players  – registered players
 *   scores   – highscore entries
 */

'use strict';

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'game.db');

// Ensure the data directory exists
const fs = require('fs');
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// ─── Schema ───────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id          TEXT PRIMARY KEY,
    username    TEXT NOT NULL UNIQUE,
    email       TEXT,
    token       TEXT NOT NULL UNIQUE,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS scores (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id   TEXT NOT NULL REFERENCES players(id),
    score       INTEGER NOT NULL DEFAULT 0,
    day_reached INTEGER NOT NULL DEFAULT 1,
    egg_health  INTEGER NOT NULL DEFAULT 0,
    coins_gold  INTEGER NOT NULL DEFAULT 0,
    coins_red   INTEGER NOT NULL DEFAULT 0,
    coins_silver INTEGER NOT NULL DEFAULT 0,
    phase       TEXT NOT NULL DEFAULT 'playing',
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
  CREATE INDEX IF NOT EXISTS idx_scores_player ON scores(player_id);
`);

module.exports = db;
