# Concrete Grace - Game Jam Entry

**"An endless isometric world of brutalist concrete stretches to the horizon — a cold, grey maze born from procedural logic. Occasionally, fragile green life pierces through the cracks — you can eat it to survive, but every bite makes the world a little more dead."**

## Theme: Secret
**Diversifiers:** Aalto (Alvar), Life is a Loan, Unexpected Consequences

A meditative survival game where procedural brutalism meets existential narrative. Built with Vue 3, Pinia, and Canvas 2D.

## Core Concept

You wander an endless concrete labyrinth, consuming rare plants to survive. Each consumption degrades the world further, revealing the hidden truth: **you are the architect of your own destruction**.

Somewhere in this brutalist expanse lies a rare Aalto building — an organic sanctuary in a world of hard edges. Inside waits the Isometric Architect, who reveals the devastating secret: **this concrete prison is your creation, and its destruction your doing**.

## Features

- **🧱 Endless Procedural Brutalism** - Infinite concrete structures generated with mathematical precision
- **🌱 Survival Consumption Loop** - Eat plants to survive (+10 health), but each consumption destroys the plant permanently
- **🏛️ Rare Aalto Encounters** - Organic architecture that triggers philosophical dialogue with the Isometric Architect
- **🪑 Dangerous Aalto Stools** - Three-legged furniture that causes -10 health damage when stepped on
- **💬 Existential Narrative** - Branching conversations exploring themes of creation, destruction, and consequence
- **📐 Hexagonal Grid Movement** - Clean, architectural navigation in 2D canvas with isometric rendering
- **⚡ Atmospheric UI** - Monospace aesthetic with health bar, dialogue system, and degradation effects
- **🎵 Audio Integration** - Atmospheric music and sound effects for immersive experience
- **🎮 Multiple Input Methods** - Keyboard controls with mouse click-to-move support

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Pinia** - Intuitive state management
- **Canvas 2D** - Isometric rendering engine
- **TypeScript** - Type safety
- **Vite** - Fast build tool

## Controls

### Movement
- **Arrow Keys** - Navigate the hexagonal concrete labyrinth
- **WASD** - Alternative movement controls
- **Numpad 1-6** - Hexagonal directional movement
- **Mouse Click** - Click on hex tiles to move there

### Actions
- **Space** - Consume plant (if standing on one) - restores 10 health
- **Enter** - Interact with Aalto buildings to start dialogue
- **Escape** - Close dialogue

### Debug Controls
- **H** - Toggle debug dialog
- **F** - Debug player position
- **G** - Force create plant at current position
- **K** - Cleanup depleted plants

## Architecture

### Game State (Pinia Store)
```typescript
interface Structure {
  id: string
  position: Position
  type: 'brutalist' | 'aalto' | 'aalto_stool' | 'plant' | 'path' | 'ruined'
  size: number
  rotation: number
  health?: number // For plants
  discovered?: boolean // For Aalto buildings
}

interface GameState {
  playerPosition: Position
  worldSeed: number
  structures: Map<string, Structure>
  discoveredAaltoBuildings: Set<string>
  dialogueHistory: DialogueEntry[]
  plantsEaten: number // Count of destroyed plant life
  playerHealth: number
  maxHealth: number
}
```

### Procedural Generation
- **Path Network**: Connected walkable areas ensuring player mobility
- **Brutalist Structures**: Dense concrete monoliths (70% spawn rate in outer areas)
- **Plants**: Very sparse green life in concrete cracks (6% spawn rate)
- **Aalto Stools**: Extremely rare dangerous furniture (3% spawn rate)
- **Aalto Buildings**: Ultra-rare organic sanctuaries (5% per chunk, max 1 per chunk)
- **Ruined Land**: Areas where plants have been consumed

### Survival Mechanics
- **Health System**: Start with 100 health, lose 1 health every other move
- **Plant Consumption**: Eating plants restores 10 health but destroys them permanently
- **Aalto Stool Hazard**: Stepping on stools causes -10 health damage
- **Death Condition**: Game ends when health reaches 0
- **World Degradation**: Visual effects intensify as more plants are consumed
- **Dialogue System**: Philosophical conversations with the Isometric Architect

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open browser:**
Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── ConcreteGrace.vue      # Main game component
│   ├── StartScreen.vue        # Game start screen with audio
│   ├── DeathScreen.vue        # Game over screen
│   ├── AaltoCutscene.vue      # Aalto building cutscene
│   ├── GameHUD.vue            # Health bar UI
│   ├── GameDialogue.vue       # Dialogue system UI
│   ├── GameMessages.vue       # In-game message system
│   └── DebugDialog.vue        # Debug information panel
├── stores/
│   └── concrete-grace.ts      # Game state & procedural logic
├── generators/
│   └── world-generator.ts     # Procedural world generation
├── renderers/
│   └── game-renderer.ts      # Canvas 2D rendering engine
├── input/
│   └── game-input.ts         # Input handling system
├── services/
│   └── dialogue-service.ts    # Dialogue management
├── utils/
│   ├── hex-grid.ts           # Hexagonal grid utilities
│   └── key-mapping.ts        # Keyboard input mapping
├── router/
│   └── index.ts              # Vue Router configuration
└── App.vue                   # Root component with monospace theme
```

## Game Progression

### Early Game
- Navigate concrete labyrinth using hexagonal movement
- Discover first plants for survival (restore health)
- Learn to avoid dangerous Aalto stools
- World begins subtle degradation as plants are consumed

### Mid Game
- Encounter first Aalto building
- Engage in philosophical dialogue with the Isometric Architect
- Explore themes of creation, destruction, and consequence
- Multiple dialogue options reveal different aspects of the narrative

### Late Game
- Multiple Aalto encounters unlock deeper narrative branches
- World degradation effects intensify (visual overlays)
- Confront the truth about your role in the concrete world
- Death screen shows statistics: plants destroyed, buildings discovered, survival time

## Narrative Themes

- **Concrete Poetry**: Architecture as metaphor for human creation/destruction
- **Life is a Loan**: Survival comes at environmental cost
- **Unexpected Consequences**: Every action ripples through the procedural world
- **Aalto Influence**: Organic forms in brutalist landscape represent lost humanity

## Visual Design

- **Color Palette**: Concrete greys (#666666), plant green (#228B22), Aalto brown (#8B4513), paths (#444444)
- **Typography**: Monospace font (Courier New) for architectural, technical aesthetic
- **Hexagonal Grid**: Clean geometric navigation with isometric rendering
- **Atmospheric Effects**: Radial gradients, vignette effects, and degradation overlays
- **Asset Integration**: Custom sprites for brutalist buildings, Aalto structures, plants, and player
- **Health Visualization**: Color-coded health bar (green/orange/red based on health level)
- **Layered Rendering**: Structures render in priority order (paths → ruined → plants → stools → buildings → Aalto)

## Development Philosophy

Built for simplicity and clarity while delivering atmospheric depth. The code structure mirrors the game's themes: **clean, geometric, and brutally honest**.

**Recommended IDE Setup:**
- [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

**Browser Requirements:**
- Modern browser with Canvas 2D support
- Keyboard for full gameplay experience
