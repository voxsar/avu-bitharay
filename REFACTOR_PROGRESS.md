# Egg-Centric Architecture Refactor - Progress Report

## Overview

This is a major architectural refactor to transform the game from a level-based structure into a unified egg-centric loop where all systems feed into daily egg care progression.

## Completed Work

### 1. Core State Restructuring ✅
**File: `src/main.js`**

Removed level separation and created unified state structure:
- **Seeds as consumable resource** (not unlock tokens)
- **Daily action tracking** (plant, water, drums, crows)
- **Witch interaction tracking** (seeds given, offers made)
- **Progression tracking** without levels
- **Health delta system** based on completion (complete/partial/none)

Key changes:
```javascript
{
  seeds: 0,  // Consumable resource
  seedsUsedToday: 0,  // Daily consumption tracking
  dailyActions: {
    plantsPlanted: 0,
    plantsWatered: 0,
    drumsPlayed: 0,
    crowsChased: 0
  },
  witchOfferedSeedsToday: false,
  totalSeedsGivenToWitch: 0
}
```

### 2. Game Controller System ✅
**File: `src/gameController.js`**

Central controller for the unified game loop:

**Functions:**
- `hasEnoughSeeds()` - Check if player can start daily actions
- `isDayComplete()` - Validate all requirements met
- `plantSeed()` - Consume seed, track planting
- `waterPlant()` - Track watering progress
- `playDrums()` - Track drum interactions
- `chaseCrows()` - Handle crow chase minigame
- `completeDay()` - Validate and advance to next day
- `getDailyProgress()` - Calculate completion percentage
- `shouldShowWitch()` - Check for Witch appearance conditions
- `giveSeeds()` - Transfer seeds to Witch
- `getExtraSeeds()` - Calculate surplus beyond daily need

**Daily Requirements:**
- Plant 3 seeds
- Water 9 times (3 plants × 3 waterings each)
- Play drums 2 times
- Chase crows 3 rounds

### 3. POI System (Repeatable) ✅
**File: `src/poiSystem.js`**

Transformed POIs from one-time progression gates to repeatable resource generators:

**Features:**
- **12 hotspots** across 4 map regions
- **3 game types** (tile match, riddle, tofu hunter)
- **Repeatable** - players can return anytime
- **Daily limit** - 10 plays per day (optional limiter)
- **Generates seeds** - +1 seed per successful game
- **No progression gates** - purely for resource generation

**Functions:**
- `initPOISystem()` - Initialize hotspots, return play interface
- `playPOI()` - Launch mini-game at hotspot
- `canPlayPOI()` - Check if plays remaining today
- `getRemainingPlays()` - Get plays left

## Architecture Flow

```
┌─────────────────────────────────────────────┐
│         UNIFIED GAME LOOP                   │
├─────────────────────────────────────────────┤
│                                             │
│  1. Check Seed Availability                │
│     ├─ Enough? → Continue to actions       │
│     └─ Not enough? → POI prompt            │
│                                             │
│  2. POI Mini-Games (Repeatable)            │
│     → Play games to earn seeds             │
│     → +1 seed per win, up to 10/day       │
│                                             │
│  3. Daily Actions (Seed Consumption)       │
│     ├─ Plant 3 seeds (consumes seeds)      │
│     ├─ Water 9 times                       │
│     ├─ Play drums 2 times                  │
│     └─ Chase crows 3 rounds                │
│                                             │
│  4. Day Complete Check                     │
│     ├─ All done? → Egg glows ✨           │
│     ├─ Progress to next day                │
│     └─ +5 health bonus                     │
│                                             │
│  5. Narrative Events                       │
│     ├─ Witch (if surplus seeds)            │
│     ├─ Nilame (reactive to behavior)       │
│     └─ Choice effects on stats             │
│                                             │
│  Repeat for 14 days → Hatch or Fail        │
└─────────────────────────────────────────────┘
```

## Remaining Work

### Phase 2: Integration & UI

#### 1. Update main.js init() function
- Remove level switching logic
- Initialize POI system instead of level1
- Add daily action UI controls
- Add seed count display
- Add daily progress indicator

#### 2. Create/Update UI Components
- **Planting Interface** - Click pots to plant seeds
- **Watering Interface** - Already exists, update integration
- **Drums Interface** - Click drums to play
- **Crow Chase** - Mini-game for crow chasing
- **Progress Panel** - Show daily completion status
- **Seed Counter** - Always visible resource count
- **POI Access Button** - "Visit Village" or "Play Games"

#### 3. Wire Up Daily Actions
- Connect plant pots to `gameController.plantSeed()`
- Connect watering can to `gameController.waterPlant()`
- Connect drums to `gameController.playDrums()`
- Create crow chase interface
- Add day completion button (enabled when complete)

#### 4. Egg Glow Effect
- Add CSS for glowing animation
- Trigger when `state.eggGlowing = true`
- Visual feedback on completion

#### 5. Witch Integration
- Check `shouldShowWitch()` after daily actions
- Display Witch dialogue with seed trade option
- Update dialogueData.js W4 node to call `giveSeeds()`
- Track compassion vs competition stats

#### 6. Nilame Updates
- Make Nilame reactive to:
  - Seed hoarding (praise)
  - Seed giving (disapproval)
  - Progress efficiency
  - Leaderboard position
- Update dialogue triggers

### Phase 3: Polish & Testing

#### 1. Remove Old Code
- Remove level1.js old progression logic
- Remove forced progression buttons
- Clean up level-based routing

#### 2. Update Backend
- Ensure POI state saves correctly
- Add any new fields to database schema if needed

#### 3. Testing Checklist
- [ ] Seeds consumed on planting
- [ ] Daily actions track correctly
- [ ] Can't progress without completing all actions
- [ ] POIs are repeatable
- [ ] Seeds regenerate from POIs
- [ ] Witch appears with surplus
- [ ] Giving seeds reduces player count
- [ ] Egg glows on completion
- [ ] Health updates correctly
- [ ] 14-day cycle works
- [ ] Hatching/failure endpoints

## Key Design Principles

✅ **Egg care is the core loop** - Everything feeds into it
✅ **Seeds are consumable** - Not unlock tokens
✅ **POIs are resource generators** - Repeatable, not one-time
✅ **Resource tension** - Witch creates moral choice (seeds vs compassion)
✅ **Daily enforcement** - Must complete actions to progress
✅ **No forced progression** - But required actions create natural gates

## Files Modified

- ✅ `src/main.js` - State structure, constants
- ✅ `src/gameController.js` - NEW: Daily cycle management
- ✅ `src/poiSystem.js` - NEW: Repeatable POI system
- ⏳ `src/main.js` - UI integration (pending)
- ⏳ `src/dialogue.js` - Witch/Nilame integration (pending)
- ⏳ `src/dialogueData.js` - Update triggers (pending)
- ⏳ `index.html` - UI elements for new systems (pending)
- ⏳ `src/style.css` - Egg glow effect (pending)

## Next Steps

1. **Integrate POI system into main UI** - Add "Visit Village" button
2. **Wire up daily action controls** - Plant, water, drums, crows
3. **Add progress feedback** - Daily completion indicator
4. **Implement Witch mechanic** - Surplus seed dialogue
5. **Test complete loop** - Ensure full cycle works
6. **Polish and refine** - UX improvements

## Notes

- This is ~40-50% complete
- Core architecture is sound
- Integration work is straightforward but extensive
- Testing will be critical to ensure balance
- Consider adding tooltips/tutorials for new players
