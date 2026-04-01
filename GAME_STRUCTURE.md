# Core Game Structure Implementation

This document describes the implemented core game structure for Avu Bitharay.

## Overview

The game now features:
- **Village exploration** with POI (points of interest) mini-games
- **Flower seed collection** system (1 seed per completed game)
- **Progression system** with optional advancement (2 seeds minimum)
- **Narrative system** with two characters: Nilame and Witch
- **Player stats** that affect story outcomes (tradition, compassion, competition, humanity)

## Game Flow

### Registration → Level 1 (Village Exploration)

1. Player registers/logs in
2. Enters the village hub (Level 1 screen)
3. Sees 12 POI hotspots scattered across the map

### Level 1: Exploration Phase

**Mechanics:**
- Click on glowing hotspots to play mini-games
- Three types of mini-games:
  - 🎴 Tile Match - Memory matching game
  - ❓ Riddle Challenge - Answer riddles
  - 🎮 Tofu Hunter - Action clicking game
- Each successful game rewards **1 flower seed** 🌸
- Each hotspot allows up to 2 retries on failure

**Progression:**
- Player needs **minimum 2 seeds** to unlock progression
- When 2+ seeds collected, "✨ Progress to Next Level" button appears
- Player can continue playing more games to collect extra seeds
- Extra seeds matter for later narrative choices

**Dialogue Triggers:**
- After completing first mini-game: Nilame dialogue (N1)
- When 2 seeds collected: Nilame dialogue about progression (N2)
- Random encounters: Witch dialogues (W1, W3)

### Level 2: Continuation (Planned)

**From Problem Statement:**
- Same exploration structure continues
- Stronger narrative stakes
- **Seed Choice**: If player has more than 2 seeds, can give extras to the Witch
- This becomes a key emotional branching mechanic

**Key Dialogues:**
- W4: Witch asks for extra seeds
- N4: Nilame criticizes if player gives away seeds
- Player choices affect final outcome

## Narrative System

### Characters

**Nilame (👨‍⚖️)**
- Represents tradition, order, competition
- Encourages player to strive for excellence
- Criticizes compassionate choices

**Witch (🧙‍♀️)**
- Represents compassion, humanity, outcasts
- Challenges competitive mindset
- Asks for help with surplus seeds

### Player Stats

Four core stats tracked through choices:
- **Tradition**: Respect for customs and order
- **Compassion**: Empathy and helping others
- **Competition**: Drive to win and collect more
- **Humanity**: Individual choice over social pressure

### Dialogue Nodes

All dialogue nodes are in `src/dialogueData.js`:

**Nilame Nodes:**
- N1: After first game completion
- N1_REWARD: Followup about rewards
- N2: When progression unlocked (2+ seeds)
- N4: Reacts if player gives seeds to Witch

**Witch Nodes:**
- W1: Initial encounter (random in Level 1)
- W2: Backstory (followup to W1)
- W3: Comments on competitive play
- W4: Asks for extra seeds (Level 2, conditional on seeds > 2)
- W5: Explains her situation (followup to W4)

## Technical Implementation

### Files Structure

```
src/
├── dialogue.js          - Dialogue system core logic
├── dialogueData.js      - All dialogue nodes
├── level1.js            - Level 1 exploration logic (updated)
├── level1UI.js          - Level 1 UI rendering (updated)
├── main.js              - Main game loop (dialogue integration)
└── style.css            - Dialogue UI styling
```

### State Management

**Game State** (`main.js`):
```javascript
{
  currentLevel: 1 | 2,
  collectedItems: { seeds: number },
  dialogueState: DialogueState,
  coins: { gold, red, silver },
  // ... other game state
}
```

**Dialogue State** (`dialogue.js`):
```javascript
{
  stats: {
    tradition: number,
    compassion: number,
    competition: number,
    humanity: number
  },
  flags: string[],        // e.g., ['witch_trust', 'gave_seeds']
  seenNodes: string[],    // Track shown dialogues
  currentNode: string
}
```

**Level 1 State** (`level1.js`):
```javascript
{
  hotspots: [
    {
      id, x, y,
      gameType: 'tilematch' | 'riddle' | 'tofuhunter',
      state: 'available' | 'playing' | 'won' | 'failed',
      retries: number
    }
  ],
  seedsCollected: number,
  progressUnlocked: boolean,
  level1Locked: boolean
}
```

### Key Functions

**Dialogue System:**
- `showDialogue(node, onChoice)` - Display dialogue with choices
- `processChoice(choice, onNext)` - Apply effects and continue
- `triggerDialogue(type)` - Find and show appropriate dialogue
- `evaluateConditions(conditions, context)` - Check if dialogue should trigger
- `modifyStats(effects)` - Update player stats

**Level 1:**
- `checkProgressUnlock()` - Show button when seeds >= 2
- `progressToLevel2()` - Transition to next level
- `triggerDialogue(type)` - Call dialogue system at key moments

## UI Components

### Dialogue Box
- Character icon and name (color-coded)
- Dialogue text
- Multiple choice buttons
- Smooth animations (fade in, slide up)

### Progress Unlock Button
- Fixed position (bottom-right)
- Pulse animation to draw attention
- Shows current seed count
- Only appears when eligible (2+ seeds)

### Stats Display (optional)
- Can show current stat values
- Fixed position (top-right)
- Updates in real-time

## Progression Logic

### Key Rule from Problem Statement:
> "The player can move on any time after earning 2 seeds. Extra seeds matter because they affect later choices and narrative."

**Implementation:**
1. At 2 seeds: Progress button appears + Nilame dialogue (N2)
2. Player chooses to either:
   - Continue playing (collect more seeds)
   - Progress to Level 2 immediately
3. In Level 2: Extra seeds enable new choices (giving to Witch)

## Next Steps (Not Yet Implemented)

### Level 2 Structure
- Decide on Level 2 gameplay:
  - Option A: Continue village exploration with new hotspots
  - Option B: Integrate seed-giving into egg-caring gameplay
  - Option C: Separate "village marketplace" scene for seed interaction

### Witch Seed-Giving Mechanic
- Add UI for offering seeds to Witch
- Implement seed transfer (reduces player's seed count)
- Trigger consequent dialogues (N4, etc.)

### Endgame Calculation
- Calculate final outcome based on stats
- Multiple endings based on stat distribution
- Display results with narrative conclusion

### Backend Enhancements
- Optional: Separate tables for stats and flags
- Track dialogue choices for analytics
- Leaderboards based on stat combinations

## Testing Checklist

- [ ] Registration → Level 1 flow
- [ ] Mini-game completion awards seeds
- [ ] Progress button appears at 2 seeds
- [ ] Can continue playing after 2 seeds
- [ ] Dialogue triggers correctly after games
- [ ] Stats update from choices
- [ ] State persists across page reloads
- [ ] Transition to Level 2 works
- [ ] Level 2 seed-giving mechanic (pending implementation)

## Notes

- The current egg-caring gameplay (14 days) is the existing Level 2
- Need to clarify how seed-giving fits with egg-caring
- Audio files referenced in dialogues are not yet implemented
- All dialogue text follows the problem statement exactly
