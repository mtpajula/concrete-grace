import { hexKey, hexNeighbors } from '@/utils/hex-grid'
import { createCell, getSpawnableCellTypes, getSpawnConfig, getSpecialSpawnCellTypes, CELL_REGISTRY } from '@/cells/cell-registry'
import type { BaseCell } from '@/cells/base-cell'

export class WorldGenerator {
  private cells = new Map<string, BaseCell>() // Modular cell system
  private generatedChunks = new Set<string>() // Track which chunks have been generated
  private seed: number
  private CHUNK_SIZE = 50

  constructor(seed: number = Math.random() * 10000) {
    this.seed = seed
  }

  getCells(): Map<string, BaseCell> {
    return this.cells
  }

  /**
   * Debug function: Force regenerate a chunk (for testing spawn config changes)
   */
  forceRegenerateChunk(chunkQ: number, chunkR: number): void {
    const chunkKey = `${chunkQ},${chunkR}`
    
    // Remove from generated chunks set
    this.generatedChunks.delete(chunkKey)
    
    // Clear existing cells in this chunk
    const chunkStartQ = chunkQ * this.CHUNK_SIZE
    const chunkStartR = chunkR * this.CHUNK_SIZE
    const radius = 20
    
    for (let q = chunkStartQ - radius; q <= chunkStartQ + radius; q++) {
      for (let r = chunkStartR - radius; r <= chunkStartR + radius; r++) {
        const key = hexKey(q, r)
        this.cells.delete(key)
      }
    }
    
    // Regenerate the chunk
    this.generatePlayableChunk(chunkQ, chunkR)
  }

  /**
   * Generate special spawn cells (like Aalto buildings) using cell registry configuration
   */
  private generateSpecialSpawnCells(centerQ: number, centerR: number, radius: number): void {
    const specialSpawnTypes = getSpecialSpawnCellTypes()
    
    for (const cellType of specialSpawnTypes) {
      const spawnConfig = getSpawnConfig(cellType)
      if (!spawnConfig) continue
      
      this.generateSpecialSpawnCell(cellType, spawnConfig, centerQ, centerR, radius)
    }
  }

  /**
   * Generate a specific special spawn cell type
   */
  private generateSpecialSpawnCell(
    cellType: string, 
    config: any, 
    centerQ: number, 
    centerR: number, 
    radius: number
  ): void {
    // Check spawn chance
    if (Math.random() >= (config.chance || 0)) {
      return
    }

    // Find valid positions
    const validPositions = this.findValidSpecialSpawnPositions(cellType, config, centerQ, centerR, radius)
    
    if (validPositions.length === 0) {
      return
    }

    // Generate cells using max count
    const numCells = Math.min(config.maxPerChunk || 1, validPositions.length)
    const shuffledPositions = [...validPositions].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < numCells; i++) {
      const position = shuffledPositions[i]!
      this.placeSpecialSpawnCell(cellType, position)
    }
  }

  /**
   * Find valid positions for special spawn cell placement
   */
  private findValidSpecialSpawnPositions(
    cellType: string, 
    config: any, 
    centerQ: number, 
    centerR: number, 
    radius: number
  ): Array<{q: number, r: number}> {
    const validPositions: Array<{q: number, r: number}> = []
    
    if (config.requiresPath) {
      // Find path tiles for placement
      for (const [key, cell] of this.cells) {
        if (cell.type === 'path') {
          validPositions.push(cell.position)
        }
      }
    } else if (config.requiresEmpty) {
      // Find empty positions
      for (let q = centerQ - radius; q <= centerQ + radius; q++) {
        for (let r = centerR - radius; r <= centerR + radius; r++) {
          const key = hexKey(q, r)
          if (!this.cells.has(key)) {
            validPositions.push({ q, r })
          }
        }
      }
    } else {
      // Find any positions (fallback)
      for (let q = centerQ - radius; q <= centerQ + radius; q++) {
        for (let r = centerR - radius; r <= centerR + radius; r++) {
          validPositions.push({ q, r })
        }
      }
    }
    
    return validPositions
  }

  /**
   * Place a special spawn cell at the specified position
   */
  private placeSpecialSpawnCell(cellType: string, position: {q: number, r: number}): void {
    const key = hexKey(position.q, position.r)
    
    // Remove existing cell if any
    this.cells.delete(key)
    
    // Create cell using modular system
    const cell = createCell(cellType as any, position)
    this.addCell(cell)
    
    // Log only Aalto building generation
    if (cellType === 'aalto') {
      console.log(`🏛️ Aalto building generated at (${position.q}, ${position.r})`)
    }
  }

  // Generate a playable world chunk with guaranteed paths
  generatePlayableChunk(chunkQ: number, chunkR: number): void {
    const chunkKey = `${chunkQ},${chunkR}`
    
        // Skip if this chunk was already generated
        if (this.generatedChunks.has(chunkKey)) {
          return
        }
        
        this.generatedChunks.add(chunkKey)
    
    const radius = 20 // Smaller chunks for detailed generation
    const chunkStartQ = chunkQ * this.CHUNK_SIZE
    const chunkStartR = chunkR * this.CHUNK_SIZE

    // Create a basic path network first
    this.generatePathNetwork(chunkStartQ, chunkStartR, radius)

    // Fill remaining spaces with obstacles and plants deterministically
    this.generateObstaclesAndPlants(chunkStartQ, chunkStartR, radius)

    // Finally add special spawn cells (like Aalto buildings)
    this.generateSpecialSpawnCells(chunkStartQ, chunkStartR, radius)
  }

  private generatePathNetwork(centerQ: number, centerR: number, radius: number): void {
    // Create main paths radiating from center
    const pathPoints: Array<{q: number, r: number}> = []
    
    // Center point
    pathPoints.push({ q: centerQ, r: centerR })
    
    // Add minimal plants to center area for starting resources
    const plantPositions = [
      { q: centerQ + 2, r: centerR },
      { q: centerQ - 1, r: centerR - 1 }
    ]
    
    for (const pos of plantPositions) {
      const cell = createCell('plant', pos)
      this.addCell(cell)
    }
    
    // Create 4-6 main arteries radiating outward
    const numArteries = 4 + Math.floor(Math.random() * 3)
    for (let i = 0; i < numArteries; i++) {
      const angle = (i / numArteries) * 6 // Spread around hex directions
      const distance = Math.floor(Math.random() * radius * 0.8) + radius * 0.2
      
      // Convert angle to hex coordinates
      const arteryQ = centerQ + Math.round(Math.cos(angle) * distance)
      const arteryR = centerR + Math.round(Math.sin(angle) * distance)
      
      pathPoints.push({ q: arteryQ, r: arteryR })
    }

    // Connect all path points
    for (let i = 0; i < pathPoints.length; i++) {
        const start = pathPoints[i]!
      
      // Connect to nearby path points
      for (let j = i + 1; j < pathPoints.length; j++) {
        const end = pathPoints[j]!
        this.createPathBetween(start, end)
      }
    }
  }

  private createPathBetween(start: {q: number, r: number}, end: {q: number, r: number}): void {
    // Simple pathfinding - move toward target
    let currentQ = start.q
    let currentR = start.r
    const targetQ = end.q
    const targetR = end.r

    while (currentQ !== targetQ || currentR !== targetR) {
      // Make this tile a path
      this.markAsPath(currentQ, currentR)

      // Move one step toward target
      if (currentQ < targetQ) currentQ++
      else if (currentQ > targetQ) currentQ--
      
      if (currentR < targetR) currentR++
      else if (currentR > targetR) currentR--

      // Add some randomness to avoid boring straight lines
      if (Math.random() < 0.1) {
        const neighbors = hexNeighbors(currentQ, currentR)
        const randomIndex = Math.floor(Math.random() * neighbors.length)
        const randomNeighbor = neighbors[randomIndex]
        if (randomNeighbor) {
          currentQ = randomNeighbor.q
          currentR = randomNeighbor.r
        }
      }
    }
    
    this.markAsPath(currentQ, currentR) // Mark the final tile too
  }

  private markAsPath(q: number, r: number): void {
    const cell = createCell('path', { q, r })
    this.addCell(cell)
  }

  private generateObstaclesAndPlants(centerQ: number, centerR: number, radius: number): void {
    for (let q = centerQ - radius; q <= centerQ + radius; q++) {
      for (let r = centerR - radius; r <= centerR + radius; r++) {
        // Skip if already has something
        if (this.cells.has(hexKey(q, r))) continue

        // Ensure player starting area (0,0) is always clear - expand safe zone  
        if (Math.abs(q - centerQ) <= 8 && Math.abs(r - centerR) <= 8 && Math.abs(q - centerQ + r - centerR) <= 8) {
          this.markAsPath(q, r)
          continue
        }
        
        // Create additional paths for Aalto building placement - debugging mode
        if (Math.random() < 0.3) {
          this.markAsPath(q, r)
          continue
        }

        // Calculate distance from center for density falloff
        const distance = Math.abs(q - centerQ) + Math.abs(r - centerR) + Math.abs(q - centerQ + r - centerR)
        const densityFactor = 1 - (distance / (radius * 2)) // Higher density near chunks

        // Use modular cell generation system
        this.generateRandomCell(q, r, densityFactor)
      }
    }
  }

  /**
   * Generate a random cell using the modular system
   */
  private generateRandomCell(q: number, r: number, densityFactor: number): void {
    const spawnableTypes = getSpawnableCellTypes()
    let totalWeight = 0
    
    // Calculate total weight for all spawnable types
    for (const type of spawnableTypes) {
      const registryEntry = CELL_REGISTRY[type]
      if (!registryEntry) continue
      
      const weight = registryEntry.spawnWeight
      if (type === 'brutalist') {
        totalWeight += weight * densityFactor
      } else {
        totalWeight += weight
      }
    }
    
    const random = Math.random() * totalWeight
    let currentWeight = 0
    
    for (const type of spawnableTypes) {
      const registryEntry = CELL_REGISTRY[type]
      if (!registryEntry) continue
      
      let weight = registryEntry.spawnWeight
      if (type === 'brutalist') {
        weight *= densityFactor
      }
      
      currentWeight += weight
      if (random <= currentWeight) {
        const cell = createCell(type, { q, r })
        this.addCell(cell)
        return
      }
    }
  }

  /**
   * Add a cell to the modular cell system
   */
  private addCell(cell: BaseCell): void {
    const key = hexKey(cell.position.q, cell.position.r)
    this.cells.set(key, cell)
  }
}
