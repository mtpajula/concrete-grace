import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { hexKey, hexDirections, type Position } from '@/utils/hex-grid'
import { WorldGenerator } from '@/generators/world-generator'
import { createCell, getSpawnConfig, CELL_REGISTRY } from '@/cells/cell-registry'
import type { BaseCell, CellInteractionResult } from '@/cells/base-cell'

export interface GameState {
  playerPosition: Position
  worldSeed: number
  discoveredAaltoBuildings: Set<string>
  dialogueHistory: DialogueEntry[]
  plantsEaten: number // Count of destroyed plant life
  playerHealth: number
  maxHealth: number
}

export interface DialogueEntry {
  id: string
  speaker: 'player' | 'architect'
  text: string
  timestamp: number
}

export const useConcreteGraceStore = defineStore('concreteGrace', () => {
  // Game world settings
  const WORLD_SIZE = 1000
  const CHUNK_SIZE = 50

  // Game state
  const gameState = ref<GameState>({
    playerPosition: { q: 0, r: 0 },
    worldSeed: Math.random() * 10000,
    discoveredAaltoBuildings: new Set<string>(),
    dialogueHistory: [],
    plantsEaten: 0,
    playerHealth: 100,
    maxHealth: 100
  })

  // World generator instance
  const worldGenerator = new WorldGenerator(gameState.value.worldSeed)

  // Check if position is blocked (for movement)  
  function isBlocked(q: number, r: number): boolean {
    const cell = getCellAt(q, r)
    return cell?.isBlocking() || false
  }

  // Get cell at hex position (new modular system)
  function getCellAt(q: number, r: number): BaseCell | null {
    const key = hexKey(q, r)
    return worldGenerator.getCells().get(key) || null
  }

  // Get nearby cells for rendering (hexagonal area) - optimized cell-based approach
  function getNearbyCells(centerQ: number, centerR: number, radius: number = 12): BaseCell[] {
    const cellList: BaseCell[] = []
    
    for (let q = centerQ - radius; q <= centerQ + radius; q++) {
      for (let r = centerR - radius; r <= centerR + radius; r++) {
        const cell = getCellAt(q, r)
        if (cell) {
          cellList.push(cell)
        }
      }
    }

    return cellList
  }

  // Generate playable chunk using the new generator
  function generateChunk(chunkQ: number, chunkR: number) {
    worldGenerator.generatePlayableChunk(chunkQ, chunkR)
  }

  // Unified plant consumption using modular cell system
  function consumePlant(identifier: string | { q: number, r: number }): boolean {
    let cell: BaseCell | null = null
    let position: { q: number, r: number } | null = null

    if (typeof identifier === 'string') {
      // Consume by cell ID - find the cell directly
      const cells = worldGenerator.getCells()
      for (const [key, c] of cells) {
        if (c.id === identifier) {
          position = c.position
          cell = c
          break
        }
      }
      if (!cell || !position) {
        return false
      }
    } else {
      // Consume by position
      position = identifier
      cell = getCellAt(position.q, position.r)
    }
    
    // Validate plant cell
    if (!cell || cell.type !== 'plant' || !position) {
      return false
    }

    // Use cell's interaction system
    const result = cell.onPlayerAction()
    if (result.success) {
      // Apply health change
      if (result.healthChange) {
        gameState.value.playerHealth = Math.min(gameState.value.maxHealth, gameState.value.playerHealth + result.healthChange)
      }

      // Count destroyed plant life
      gameState.value.plantsEaten += 1

      // Transform to ruined land if specified
      if (result.transformsTo) {
        const ruinedCell = createCell(result.transformsTo, position)
        const key = hexKey(position.q, position.r)
        
        // Update the modular cell system
        worldGenerator.getCells().set(key, ruinedCell)
      }
      
      return true
    }
    
    return false
  }

  // Convenience function for position-based consumption
  function consumePlantAtPosition(q: number, r: number): boolean {
    return consumePlant({q, r })
  }

  // Move player in hex grid (direction: 0-5 for hex directions)
  function movePlayer(direction: number): { moved: boolean; message?: string } {
    console.log(`MovePlayer called with direction: ${direction}`)
    const delta = hexDirections[direction]
    
    if (!delta) {
      return { moved: false }
    }
    
    console.log(`Delta: q=${delta.q}, r=${delta.r}`)
    
    const newQ = gameState.value.playerPosition.q + delta.q
    const newR = gameState.value.playerPosition.r + delta.r
    console.log(`Current position: q=${gameState.value.playerPosition.q}, r=${gameState.value.playerPosition.r}`)
    console.log(`New position: q=${newQ}, r=${newR}`)

    // Check bounds
    if (Math.abs(newQ) > WORLD_SIZE || Math.abs(newR) > WORLD_SIZE) {
      return { moved: false }
    }

    // Check for obstacles
    const blocked = isBlocked(newQ, newR)
    
    if (blocked) {
      return { moved: false }
    }

    // Check for cell interactions BEFORE updating position
    const cell = getCellAt(newQ, newR)
    let shouldMove = true
    let interactionMessage = ''

    if (cell) {
      const result = cell.onPlayerEnter()
      
      // Handle Aalto building discovery
      if (cell.type === 'aalto' && !cell.discovered) {
        gameState.value.discoveredAaltoBuildings.add(cell.id)
      }
      
      // Apply health changes
      if (result.healthChange) {
        gameState.value.playerHealth = Math.max(0, gameState.value.playerHealth + result.healthChange)
        
        // Check for death from health change
        if (gameState.value.playerHealth <= 0) {
          // Update position even if dying (player should be at the cell where they died)
          gameState.value.playerPosition.q = newQ
          gameState.value.playerPosition.r = newR
          return { moved: true, message: result.message || "💀 You collapsed!" }
        } else if (result.message) {
          interactionMessage = result.message
        }
      }
    }

    // Only update position if movement is allowed
    if (shouldMove) {
      gameState.value.playerPosition.q = newQ
      gameState.value.playerPosition.r = newR
      
      // Lose health every other move (reduced pressure for exploration)
      if (Math.random() < 0.5) {
        gameState.value.playerHealth = Math.max(0, gameState.value.playerHealth - 1)
      }

      // Check for health critical state
      if (gameState.value.playerHealth <= 0) {
        return { moved: true, message: "💀 You collapsed from exhaustion!" }
      }

      // Return with interaction message if any
      if (interactionMessage) {
        return { moved: true, message: interactionMessage }
      }
    }

    return { moved: true }
  }

  // Initialize world
  function initWorld() {
    // Generate initial chunks around player
    for (let chunkQ = -2; chunkQ <= 2; chunkQ++) {
      for (let chunkR = -2; chunkR <= 2; chunkR++) {
        generateChunk(chunkQ, chunkR)
      }
    }
  }

  // Get game status
  const plantsDestroyed = computed(() => gameState.value.plantsEaten)
  const discoveredBuildings = computed(() => gameState.value.discoveredAaltoBuildings.size)

  // Debug helper - get cell at player position
  function debugPlayerPosition() {
    const { q, r } = gameState.value.playerPosition
    return getCellAt(q, r)
  }

  return {
    // State
    gameState,
    worldGenerator,
    WORLD_SIZE,
    CHUNK_SIZE,

        // Computed
        plantsDestroyed,
        discoveredBuildings,

    // Methods
    getCellAt,
    getNearbyCells,
    generateChunk,
    consumePlant,
    consumePlantAtPosition,
    movePlayer,
    initWorld,
    isBlocked,
    debugPlayerPosition,
    // Spawn parameter management
    updateSpawnConfig: (cellType: string, config: any) => {
      const registryEntry = CELL_REGISTRY[cellType as any]
      if (registryEntry && registryEntry.spawnConfig) {
        registryEntry.spawnConfig = { ...registryEntry.spawnConfig, ...config }
      }
    },
    getSpawnConfig: (cellType: string) => getSpawnConfig(cellType as any),
    getAllSpawnConfigs: () => {
      const configs: Record<string, any> = {}
      Object.keys(CELL_REGISTRY).forEach(type => {
        const config = getSpawnConfig(type as any)
        if (config) {
          configs[type] = config
        }
      })
      return configs
    }
  }
})
