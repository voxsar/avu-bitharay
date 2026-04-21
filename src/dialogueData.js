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
		id: "N3",
		character: "nilame",
		trigger: {
			type: "random",
			conditions: ["tradition_score > 25"]
		},
		dialogue: "The women prepare the rituals, the men compete in games. This is how it has always been.",
		audio: "audio/nilame/n3.mp3",
		choices: [
			{
				text: "What if someone wants to break that pattern?",
				next: "N3_PATTERN",
				effects: {
					humanity: 10
				}
			},
			{
				text: "Tradition has wisdom.",
				next: null,
				effects: {
					tradition: 15
				}
			},
			{
				text: "Who decided these roles?",
				next: "N3_AUTHORITY",
				effects: {
					compassion: 5,
					humanity: 10
				}
			}
		]
	},

	{
		id: "N3_PATTERN",
		character: "nilame",
		trigger: { type: "followup" },
		dialogue: "Then they are arrogant. The pattern has survived centuries. Do you think you are wiser than your ancestors?",
		audio: "audio/nilame/n3_pattern.mp3",
		choices: [
			{
				text: "No, but times change.",
				next: null,
				effects: {
					humanity: 15,
					tradition: -10,
					flags: ["challenged_nilame"]
				}
			},
			{
				text: "You're right. I'll respect it.",
				next: null,
				effects: {
					tradition: 20
				}
			},
			{
				text: "Maybe survival doesn't mean it's just.",
				next: null,
				effects: {
					compassion: 20,
					tradition: -15,
					flags: ["moral_rebel"]
				}
			}
		]
	},

	{
		id: "N3_AUTHORITY",
		character: "nilame",
		trigger: { type: "followup" },
		dialogue: "The gods. The land. The blood of generations. Authority does not need to justify itself to every child who questions.",
		audio: "audio/nilame/n3_authority.mp3",
		choices: [
			{
				text: "That sounds like an excuse.",
				next: null,
				effects: {
					humanity: 20,
					tradition: -20,
					flags: ["defied_nilame"]
				}
			},
			{
				text: "I understand.",
				next: null,
				effects: {
					tradition: 15
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

	{
		id: "N5",
		character: "nilame",
		trigger: {
			type: "conditional",
			conditions: ["compassion_score > 40", "tradition_score < 20"]
		},
		dialogue: "You waste your energy on those who cannot help you win. Avurudhu celebrates the worthy, not the weak.",
		audio: "audio/nilame/n5.mp3",
		choices: [
			{
				text: "The weak matter too.",
				next: "N5_WEAK",
				effects: {
					compassion: 15
				}
			},
			{
				text: "Maybe you're wrong about what Avurudhu means.",
				next: "N5_MEANING",
				effects: {
					humanity: 15
				}
			},
			{
				text: "You're right. I'll focus on winning.",
				next: null,
				effects: {
					competition: 20,
					compassion: -10
				}
			}
		]
	},

	{
		id: "N5_WEAK",
		character: "nilame",
		trigger: { type: "followup" },
		dialogue: "They matter when they know their place. Charity is noble, but confusion of roles breeds chaos.",
		audio: "audio/nilame/n5_weak.mp3",
		choices: [
			{
				text: "Who assigns these places?",
				next: null,
				effects: {
					humanity: 15,
					flags: ["questions_hierarchy"]
				}
			},
			{
				text: "I see your point.",
				next: null,
				effects: {
					tradition: 10
				}
			}
		]
	},

	{
		id: "N5_MEANING",
		character: "nilame",
		trigger: { type: "followup" },
		dialogue: "I am the keeper of this tradition. Do not presume to teach me about my own heritage.",
		audio: "audio/nilame/n5_meaning.mp3",
		choices: [
			{
				text: "Heritage belongs to everyone.",
				next: null,
				effects: {
					humanity: 20,
					tradition: -15,
					flags: ["populist_path"]
				}
			},
			{
				text: "You're right. I apologize.",
				next: null,
				effects: {
					tradition: 15
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

	{
		id: "W6",
		character: "witch",
		trigger: {
			type: "random",
			conditions: ["level >= 1", "compassion_score > 20"]
		},
		dialogue: "I was a dancer once. They praised me… until I spoke too freely. A woman who questions is a woman who threatens.",
		audio: "audio/witch/w6.mp3",
		choices: [
			{
				text: "What did you question?",
				next: "W6_QUESTION",
				effects: {
					compassion: 10
				}
			},
			{
				text: "They had no right to cast you out.",
				next: "W6_RIGHTS",
				effects: {
					compassion: 15,
					humanity: 10
				}
			},
			{
				text: "Maybe you should have been more careful.",
				next: null,
				effects: {
					tradition: 10,
					flags: ["blamed_witch"]
				}
			}
		]
	},

	{
		id: "W6_QUESTION",
		character: "witch",
		trigger: { type: "followup" },
		dialogue: "Why the women serve and the men glory. Why mourning is feminine and triumph masculine. Why only certain bodies belong in certain dances.",
		audio: "audio/witch/w6_question.mp3",
		choices: [
			{
				text: "Those are good questions.",
				next: "W6_GOOD",
				effects: {
					compassion: 20,
					humanity: 15,
					flags: ["witch_ally"]
				}
			},
			{
				text: "Some structures exist for a reason.",
				next: null,
				effects: {
					tradition: 15
				}
			},
			{
				text: "I don't know what to believe.",
				next: null,
				effects: {
					humanity: 10,
					flags: ["uncertain_morality"]
				}
			}
		]
	},

	{
		id: "W6_GOOD",
		character: "witch",
		trigger: { type: "followup" },
		dialogue: "They thought them dangerous. The Nilame said I was poisoning the youth. But I only asked what no one dared to ask.",
		audio: "audio/witch/w6_good.mp3",
		choices: [
			{
				text: "I'll keep asking too.",
				next: null,
				effects: {
					humanity: 25,
					compassion: 15,
					coins: 15,
					flags: ["revolutionary_path"]
				}
			},
			{
				text: "That took courage.",
				next: null,
				effects: {
					compassion: 20
				}
			}
		]
	},

	{
		id: "W6_RIGHTS",
		character: "witch",
		trigger: { type: "followup" },
		dialogue: "Rights? We have what power allows us. I had beauty, then I had voice. When I used both, I had neither.",
		audio: "audio/witch/w6_rights.mp3",
		choices: [
			{
				text: "That's not justice.",
				next: null,
				effects: {
					humanity: 20,
					compassion: 15
				}
			},
			{
				text: "Maybe justice is illusion.",
				next: null,
				effects: {
					humanity: 15,
					flags: ["cynical_path"]
				}
			}
		]
	},

	{
		id: "W7",
		character: "witch",
		trigger: {
			type: "conditional",
			conditions: ["humanity_score > 50"]
		},
		dialogue: "You walk differently than the others. Like someone who sees the cage even while dancing in it.",
		audio: "audio/witch/w7.mp3",
		choices: [
			{
				text: "Can one escape the cage?",
				next: "W7_ESCAPE",
				effects: {
					humanity: 10
				}
			},
			{
				text: "How did you escape?",
				next: "W7_HOW",
				effects: {
					compassion: 10
				}
			},
			{
				text: "I don't see a cage.",
				next: null,
				effects: {
					tradition: 15,
					humanity: -10
				}
			}
		]
	},

	{
		id: "W7_ESCAPE",
		character: "witch",
		trigger: { type: "followup" },
		dialogue: "Escape? I fled into exile. That's not escape, that's survival. Escape would be dancing AND speaking. Being seen AND being heard.",
		audio: "audio/witch/w7_escape.mp3",
		choices: [
			{
				text: "Then I'll try for both.",
				next: null,
				effects: {
					humanity: 25,
					compassion: 15,
					flags: ["seeks_integration"]
				}
			},
			{
				text: "Maybe survival is enough.",
				next: null,
				effects: {
					compassion: 10
				}
			}
		]
	},

	{
		id: "W7_HOW",
		character: "witch",
		trigger: { type: "followup" },
		dialogue: "I didn't escape. I was expelled. There's no honor in my exile, only necessity. The question is: will you wait until they push you out too?",
		audio: "audio/witch/w7_how.mp3",
		choices: [
			{
				text: "I'll stand my ground first.",
				next: null,
				effects: {
					humanity: 20,
					competition: 10,
					flags: ["defiant_stance"]
				}
			},
			{
				text: "I'll be more careful than you.",
				next: null,
				effects: {
					tradition: 10,
					flags: ["pragmatic_caution"]
				}
			},
			{
				text: "Maybe I'll help change things.",
				next: null,
				effects: {
					humanity: 25,
					compassion: 20,
					flags: ["reformer_path"]
				}
			}
		]
	},

	{
		id: "W8",
		character: "witch",
		trigger: {
			type: "conditional",
			conditions: ["flags.includes('challenged_nilame') || flags.includes('defied_nilame')"]
		},
		dialogue: "You spoke against him. I heard. They all heard. The question is: do you have the strength to bear what comes next?",
		audio: "audio/witch/w8.mp3",
		choices: [
			{
				text: "What will come?",
				next: "W8_WHAT",
				effects: {
					compassion: 5
				}
			},
			{
				text: "I'll face whatever comes.",
				next: null,
				effects: {
					humanity: 20,
					competition: 10,
					coins: 20
				}
			},
			{
				text: "Maybe I should apologize.",
				next: null,
				effects: {
					tradition: 15,
					humanity: -15
				}
			}
		]
	},

	{
		id: "W8_WHAT",
		character: "witch",
		trigger: { type: "followup" },
		dialogue: "Whispers. Isolation. They won't cast you out immediately—that would be crude. They'll make you cast yourself out. Make you feel you never belonged.",
		audio: "audio/witch/w8_what.mp3",
		choices: [
			{
				text: "Then I'll prove I do belong.",
				next: null,
				effects: {
					competition: 20,
					humanity: 10
				}
			},
			{
				text: "Or I'll create my own belonging.",
				next: null,
				effects: {
					humanity: 25,
					compassion: 15,
					flags: ["creates_community"]
				}
			},
			{
				text: "That's cruel.",
				next: null,
				effects: {
					compassion: 20
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
