# 🌺 Flower Growing System Documentation

## Overview

The flower growing system features **4 different plant types**, each with **7 growth stages**. Each stage requires **3 waterings** to advance to the next stage.

## Plant Types

1. **🌹 Rose** - Red roses with classic beauty
2. **🌼 Marigold** - Bright orange marigolds
3. **🌻 Sunflower** - Happy yellow sunflowers
4. **🌼 Daffodil** - Yellow daffodils

## Growth System

### Stages
- **Stage 0-6**: 7 total growth stages per plant
- Each plant progresses through visible growth stages
- Stage 6 is fully grown (mature plant with flowers)

### Watering Requirements
- **3 waterings per stage** to advance to the next stage
- Total of **21 waterings** (3 waterings × 7 stages) to fully grow a plant
- Visual indicators show current waterings (3 dots at top of pot)
- Progress bar at bottom shows overall growth progress

## How to Use

### Watering Plants

**Method 1: Click Mode (Recommended)**
1. Click the **Watering Can** or press **W** key to enable watering mode
2. Click on any planted pot to water it
3. Click the Watering Can again or press **W** to disable watering mode

**Method 2: Drag and Drop**
1. Drag the **Watering Can** from the bottom toolbar
2. Drop it on a pot to water that plant

### Visual Feedback

- **Water Drops**: Animated droplets appear when watering
- **Progress Bar**: Shows overall growth progress (0-100%)
- **Watering Dots**: Three dots show waterings in current stage
  - Empty dots: waterings needed
  - Filled (blue) dots: waterings completed
- **Plant Name**: Displays the plant type below each pot
- **Fully Grown Badge**: Gold checkmark appears on mature plants

### Messages

- After each watering: Shows waterings remaining for next stage
- When stage advances: "🌱 Your [Plant] grew to stage X!"
- When fully grown: "🌺 Your [Plant] is fully grown!"

## Testing & Debug Commands

Open the browser console (F12) and use these commands:

### Setup Test Garden
```javascript
setupTestGarden()
```
Plants one of each flower type in the first 5 pots.

### Plant Specific Flower
```javascript
plantInPot(potIndex, plantType)
// Example: plantInPot(0, 'rose')
// Pot indices: 0-8 (top-left to bottom-right)
// Plant types: 'rose', 'marigold', 'sunflower', 'daffodil'
```

### Fast-Grow for Testing
```javascript
fastGrow(potIndex, targetStage)
// Example: fastGrow(0, 5) - Grows pot 0 to stage 5
```

### Clear All Pots
```javascript
clearAllPots()
```

### Other Debug Functions
```javascript
debugPlantRandom()  // Plants a random flower in first empty pot
debugResetPots()    // Resets all pots to empty
```

## File Structure

```
src/
├── plants.js         - Core plant logic (state, watering, growth)
├── plantsUI.js       - UI rendering and user interactions
├── plantDebug.js     - Debug helpers for testing
└── main.js           - Integration with main game
```

## State Management

Plant state is saved in localStorage as `avurudhu_bithara_plants_v1`:

```javascript
{
  plantType: 'rose' | 'marigold' | 'sunflower' | 'daffodil' | null,
  stage: 0-6,          // Current growth stage
  waterings: 0-2,      // Waterings in current stage
  lastWatered: 'ISO date' // Last watering timestamp
}
```

## Next Steps

Currently implemented:
- ✅ 9-pot grid layout
- ✅ 5 plant types with 7 stages each
- ✅ 3 waterings per stage progression
- ✅ Visual feedback and animations
- ✅ Progress tracking
- ✅ State persistence

To be implemented:
- ⏳ Seed planting UI (currently plants can only be added via debug commands)
- ⏳ Shop/inventory system for seeds
- ⏳ Harvesting rewards
- ⏳ Plant withering system
- ⏳ Plant care requirements (time-based)

## Sprite Information

Each plant sprite sheet contains **7 horizontal frames**:
- Frame 0: Sprout/seedling
- Frame 1-5: Growth stages
- Frame 6: Fully mature with flowers

Sprite files:
- `interface-collection_0000_roses.png` - Rose stages
- `interface-collection_0002_maigolds.png` - Marigold stages
- `interface-collection_0003_sunflowers.png` - Sunflower stages
- `interface-collection_0005_daafo.png` - Daffodil stages

## Keyboard Shortcuts

- **W**: Toggle watering mode on/off
