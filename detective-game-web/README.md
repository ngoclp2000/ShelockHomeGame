# Detective Investigation - Web Game

A 2D top-down detective adventure game built with Phaser 3 + TypeScript + Vite.

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Features

- **Top-down 2D exploration** with WASD/Arrow keys or touch joystick
- **Collect clues** by approaching and pressing E (or tap interact button)
- **Interview suspects** with branching dialogue
- **Notebook** tracks your investigation timeline
- **Solve the case** by selecting killer, motive, weapon, and key evidence

## Controls

| Platform | Movement                   | Interact                     |
| -------- | -------------------------- | ---------------------------- |
| Desktop  | WASD / Arrows              | E key                        |
| Mobile   | Touch joystick (left side) | Interact button (right side) |

## Project Structure

```
detective-game-web/
├── src/
│   ├── main.ts                 # Entry point
│   ├── game/
│   │   ├── phaserGame.ts       # Phaser config
│   │   ├── scenes/             # Boot, Preload, Menu, Game
│   │   ├── entities/           # Player, NPC, Interactable
│   │   ├── systems/            # Input, Dialogue, Save, etc.
│   │   └── data/               # Types and loaders
│   └── ui/
│       ├── uiRoot.ts           # DOM overlay
│       ├── components/         # Tabs, Panels, Modals
│       └── styles.css          # UI theme
├── public/
│   ├── cases/case_001.json     # Case data
│   ├── maps/case_001_map.json  # Tiled map
│   └── sprites/                # Placeholder sprites
└── package.json
```

## Creating Placeholder Assets

The game needs these placeholder images (or use solid color PNGs):

### Tileset (public/maps/tileset.png)

- 128x32 PNG with 4 tiles (32x32 each)
- Tile 1: Floor color (#3d3d3d)
- Tile 2: Floor variant (#2d2d2d)
- Tile 3: Wall (#1a1a1a)
- Tile 4: Decoration (#4a4a4a)

### Player Sprite (public/sprites/player.png)

- 128x192 spritesheet (4 columns x 4 rows)
- Each frame: 32x48 pixels
- Rows: Down, Up, Left, Right (4 walk frames each)

### Icons (public/sprites/)

- clue_icon.png: 32x32 magnifying glass icon
- npc_icon.png: 32x48 character silhouette

### UI (public/ui/)

- paper_texture.png: Optional paper background

## Adding New Cases

1. Create `public/cases/case_XXX.json` with structure like `case_001.json`
2. Create `public/maps/case_XXX_map.json` (Tiled format)
3. Update case selection in MainMenuScene

## Tech Stack

- **Phaser 3** - Game engine
- **TypeScript** - Type safety
- **Vite** - Fast development
- **Vanilla CSS** - UI styling

## Building for Production

```bash
npm run build
```

Output in `dist/` folder.
