/**
 * DIALOGUE DATA
 * ─────────────────────────────────────────────────────────────
 * All dialogue nodes for Nilame and Witch characters
 */

export const DIALOGUE_NODES = [
	// ─── NILAME DIALOGUES ─────────────────────────────────────────
	{
		id: "N1",
		character: "nilame",
		trigger: {
			type: "after_minigame",
			conditions: ["games_completed >= 1"]
		},
		dialogue: "Avurudhu is not just play. It is discipline, order, and pride. You prove yourself here.",
		audio: "audio/nilame/n1.mp3",
		choices: [
			{
				text: "I'll do this properly.",
				next: null,
				effects: {
					tradition: 10,
					competition: 10,
					compassion: 0,
					humanity: 0,
					coins: 0,
					flags: []
				}
			},
			{
				text: "It's just a game, no?",
				next: null,
				effects: {
					tradition: -5,
					competition: 0,
					compassion: 0,
					humanity: 10,
					coins: 0,
					flags: []
				}
			},
			{
				text: "What do I get if I win?",
				next: "N1_REWARD",
				effects: {
					competition: 10,
					coins: 5,
					flags: ["reward_focus"]
				}
			}
		]
	},

	{
		id: "N1_REWARD",
		character: "nilame",
		trigger: { type: "followup" },
		dialogue: "Recognition. Respect. And something more… if you prove worthy.",
		audio: "audio/nilame/n1_reward.mp3",
		choices: [
			{
				text: "Then I'll win.",
				next: null,
				effects: {
					competition: 10
				}
			}
		]
	},

	{
		id: "N2",
		character: "nilame",
		trigger: {
			type: "progress_unlock",
			conditions: ["seeds >= 2"]
		},
		dialogue: "You may move forward now. But greatness is never satisfied with enough.",
		audio: "audio/nilame/n2.mp3",
		choices: [
			{
				text: "I'll keep going.",
				next: null,
				effects: {
					competition: 10,
					tradition: 5,
					coins: 10,
					flags: ["grind_mode"]
				}
			},
			{
				text: "I'll move on.",
				next: null,
				effects: {}
			},
			{
				text: "Why should I care?",
				next: null,
				effects: {
					competition: -5,
					humanity: 10
				}
			}
		]
	},

	{
		id: "N4",
		character: "nilame",
		trigger: {
			type: "interrupt",
			conditions: ["gave_seeds == true"]
		},
		dialogue: "You give away what you have earned? That is not strength.",
		audio: "audio/nilame/n4.mp3",
		choices: [
			{
				text: "Tradition matters.",
				next: null,
				effects: {
					tradition: 15
				}
			},
			{
				text: "She needed it.",
				next: null,
				effects: {
					compassion: 15
				}
			},
			{
				text: "I decide for myself.",
				next: null,
				effects: {
					flags: ["independent_path"]
				}
			}
		]
	},

	// ─── WITCH DIALOGUES ──────────────────────────────────────────
	{
		id: "W1",
		character: "witch",
		trigger: {
			type: "random",
			conditions: ["level == 1"]
		},
		dialogue: "They celebrate… but not everyone is invited to joy.",
		audio: "audio/witch/w1.mp3",
		choices: [
			{
				text: "What happened to you?",
				next: "W2",
				effects: {
					compassion: 10
				}
			},
			{
				text: "You're trying to scare me.",
				next: null,
				effects: {
					tradition: 5
				}
			},
			{
				text: "I don't have time.",
				next: null,
				effects: {
					competition: 10
				}
			}
		]
	},

	{
		id: "W2",
		character: "witch",
		trigger: { type: "followup" },
		dialogue: "I danced where they dance now… until I no longer fit their world.",
		audio: "audio/witch/w2.mp3",
		choices: [
			{
				text: "That's not fair.",
				next: null,
				effects: {
					compassion: 15,
					flags: ["witch_trust"]
				}
			},
			{
				text: "There must be a reason.",
				next: null,
				effects: {
					tradition: 5
				}
			},
			{
				text: "What do you want?",
				next: "W4",
				effects: {}
			}
		]
	},

	{
		id: "W3",
		character: "witch",
		trigger: {
			type: "random",
			conditions: ["competition_score > 30"]
		},
		dialogue: "Run faster. Collect more. Maybe then they'll finally see you.",
		audio: "audio/witch/w3.mp3",
		choices: [
			{
				text: "I will.",
				next: null,
				effects: {
					competition: 10,
					flags: ["witch_disappointed"]
				}
			},
			{
				text: "That's not why I'm here.",
				next: null,
				effects: {
					humanity: 10,
					coins: 5
				}
			},
			{
				text: "You think it's pointless?",
				next: null,
				effects: {
					compassion: 10
				}
			}
		]
	},

	{
		id: "W4",
		character: "witch",
		trigger: {
			type: "conditional",
			conditions: ["level == 2", "seeds > 2"]
		},
		dialogue: "You have more than you need… I never did.",
		audio: "audio/witch/w4.mp3",
		choices: [
			{
				text: "Take them.",
				next: null,
				effects: {
					compassion: 20,
					competition: -5,
					coins: 10,
					flags: ["gave_seeds"]
				}
			},
			{
				text: "I need them.",
				next: null,
				effects: {
					competition: 10
				}
			},
			{
				text: "Why should I help?",
				next: "W5",
				effects: {}
			}
		]
	},

	{
		id: "W5",
		character: "witch",
		trigger: { type: "followup" },
		dialogue: "Because one day… you may stand where I stand.",
		audio: "audio/witch/w5.mp3",
		choices: [
			{
				text: "I understand.",
				next: null,
				effects: {
					compassion: 15
				}
			},
			{
				text: "That won't be me.",
				next: null,
				effects: {
					competition: 10
				}
			}
		]
	},

	// ─── FINAL NODE ───────────────────────────────────────────────
	{
		id: "FINAL",
		character: "system",
		trigger: {
			type: "endgame"
		},
		dialogue: "Calculating your path...",
		choices: []
	}
];
