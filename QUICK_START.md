# 🌱 Quick Start Guide - Plant System

## Getting Started

Your plant growing system is now running at: **http://localhost:5174/**

## Testing the System

### Step 1: Add Some Plants

Since the planting UI isn't implemented yet, use the browser console to add plants:

1. Open the browser console (Press **F12**)
2. Run this command to set up a test garden:
   ```javascript
   setupTestGarden()
   ```
3. Refresh the page (**F5**) to see the plants appear

### Step 2: Water Your Plants

**Option A: Click Mode (Easier)**
1. Click the **Watering Can** at the bottom left (or press **W**)
2. The watering can will glow blue
3. Click on any plant to water it
4. Watch the water drops animation!
5. Click the watering can again (or press **W**) to turn off watering mode

**Option B: Drag & Drop**
1. Drag the **Watering Can** from the bottom
2. Drop it on a plant to water it

### Step 3: Watch Your Plants Grow

- Each plant needs **3 waterings** to advance to the next stage
- Watch the **3 dots** at the top of each pot fill up as you water
- After 3 waterings, the plant will grow to the next stage
- There are **7 stages total** (0-6)
- The progress bar at the bottom shows overall growth

### Step 4: Celebrate Fully Grown Plants!

- After **21 total waterings** (3 × 7 stages), your plant will be fully grown
- You'll see a gold checkmark badge
- Sparkle effects will appear!

## Console Commands Reference

```javascript
// Setup test garden (plants one of each type)
setupTestGarden()

// Plant specific flower in specific pot (0-8)
plantInPot(0, 'rose')        // Plant rose in pot 0
plantInPot(1, 'sunflower')   // Plant sunflower in pot 1
plantInPot(2, 'marigold')    // Plant marigold in pot 2

// Fast-grow for testing (instant growth)
fastGrow(0, 3)   // Grow pot 0 to stage 3
fastGrow(1, 6)   // Grow pot 1 to fully grown

// Clear all pots
clearAllPots()

// Plant random flower in first empty pot
debugPlantRandom()
```

## Plant Types Available

1. **rose** - Beautiful red roses 🌹
2. **marigold** - Bright orange marigolds 🌼
3. **sunflower** - Happy yellow sunflowers 🌻
4. **daffodil** - Cheerful yellow daffodils 🌼

## Pot Grid Layout

```
Pot 0   Pot 1   Pot 2
Pot 3   Pot 4   Pot 5
Pot 6   Pot 7   Pot 8
```

## Tips

- Your plant data is saved automatically in your browser
- Refresh the page anytime - your plants will still be there
- You can water plants as many times as you want (no penalties)
- Each plant type has unique sprites showing different growth stages
- The progress bar and dots help you track growth progress

## Troubleshooting

**Can't see plants after running setupTestGarden()?**
- Make sure to refresh the page (F5) after running the command

**Watering mode not working?**
- Make sure plants are actually planted (run `setupTestGarden()`)
- Try pressing W key to toggle watering mode
- Check console for any error messages

**Plants not showing up?**
- Check that the sprite image files are in the root folder:
  - `interface-collection_0000_roses.png`
  - `interface-collection_0002_maigolds.png`
  - `interface-collection_0003_sunflowers.png`
  - `interface-collection_0005_daafo.png`
  - `interface-collection_0007_Layer-1.png`

## Next Steps

Once you're happy with the basic system, you can add:
- Seed shop UI
- Seed inventory
- Click-to-plant system
- Harvesting and rewards
- Time-based growth requirements
- Plant withering if not watered

Enjoy your garden! 🌺
