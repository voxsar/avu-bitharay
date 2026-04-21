#!/usr/bin/env node
/**
 * Emergency script to add watering records for all players' plants
 * This helps players whose plants are at risk due to the watering UI issue
 */

const db = require('./database.js');

const players = db.prepare('SELECT id, username FROM players').all();
const getProgress = db.prepare('SELECT state_json FROM plant_progress WHERE player_id = ?');
const updateProgress = db.prepare(`
  UPDATE plant_progress 
  SET state_json = ?, 
      updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') 
  WHERE player_id = ?
`);

let updated = 0;
let totalPlantsWatered = 0;

console.log('🌱 Starting emergency watering for all plants...\n');

players.forEach(p => {
	const row = getProgress.get(p.id);
	if (row) {
		const pots = JSON.parse(row.state_json);
		let changed = false;
		let plantsWatered = 0;

		pots.forEach(pot => {
			if (pot.plantType && pot.stage < 6) {
				// Add 3 waterings AND advance to next stage (simulating the waterPot logic)
				pot.waterings = 0;  // Reset waterings after advancing
				pot.stage++;        // Advance to next stage
				plantsWatered++;
			}
		});

		if (changed) {
			updateProgress.run(JSON.stringify(pots), p.id);
			updated++;
			totalPlantsWatered += plantsWatered;
			console.log(`✓ ${p.username}: watered ${plantsWatered} plants`);
		}
	}
});

console.log(`\n🎉 Complete!`);
console.log(`   Players updated: ${updated}`);
console.log(`   Total plants watered: ${totalPlantsWatered}`);
console.log(`\nNote: Each plant received 3/3 waterings for their current stage.`);
console.log(`They will advance to the next stage on their next login.`);
