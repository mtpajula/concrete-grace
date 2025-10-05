/**
 * Cell Registry - Central registry for all cell types
 * Makes adding new cell types "plug-and-play"
 */

import { BrutalistCell } from './brutalist-cell'
import { PlantCell } from './plant-cell'
import { AaltoBuildingCell } from './aalto-building-cell'
import { AaltoStoolCell } from './aalto-stool-cell'
import { PathCell } from './path-cell'
import { RuinedCell } from './ruined-cell'
import type { CellType, BaseCell } from './base-cell'

export interface SpawnConfig {
  chance?: number           // Chance per chunk (0-1)
  maxPerChunk?: number     // Maximum instances per chunk
  requiresPath?: boolean    // Must be placed on path tiles
  requiresEmpty?: boolean   // Must be placed on empty tiles
}

export interface CellRegistryEntry {
  type: CellType
  cellClass: new (position: { q: number, r: number }, id?: string) => BaseCell
  spawnWeight: number       // For random spawning
  spawnConfig?: SpawnConfig // For special spawning (like Aalto buildings)
  description: string
}

/**
 * Central registry for all cell types
 * To add a new cell type:
 * 1. Create a new cell class extending BaseCell
 * 2. Add it to this registry
 * 3. The rest of the system will automatically handle it
 */
export const CELL_REGISTRY: Record<CellType, CellRegistryEntry> = {
  brutalist: {
    type: 'brutalist',
    cellClass: BrutalistCell,
    spawnWeight: 0.7,
    description: 'Concrete monoliths that block movement'
  },
  plant: {
    type: 'plant',
    cellClass: PlantCell,
    spawnWeight: 0.06,
    description: 'Green life that can be consumed for health'
  },
  aalto: {
    type: 'aalto',
    cellClass: AaltoBuildingCell,
    spawnWeight: 0.0, // Special spawning via spawnConfig
    spawnConfig: {
      chance: 0.05,           // 5% chance per chunk
      maxPerChunk: 1,         // Maximum 1 per chunk
      requiresPath: true      // Must be placed on path tiles
    },
    description: 'Organic architecture that triggers dialogue'
  },
  aalto_stool: {
    type: 'aalto_stool',
    cellClass: AaltoStoolCell,
    spawnWeight: 0.03,
    description: 'Dangerous three-legged furniture'
  },
  path: {
    type: 'path',
    cellClass: PathCell,
    spawnWeight: 0.0, // Special handling in world generator
    description: 'Walkable paths connecting areas'
  },
  ruined: {
    type: 'ruined',
    cellClass: RuinedCell,
    spawnWeight: 0.0, // Created when plants are consumed
    description: 'Contaminated land where plants were consumed'
  }
}

/**
 * Get cell class by type
 */
export function getCellClass(type: CellType): (new (position: { q: number, r: number }, id?: string) => BaseCell) | undefined {
  return CELL_REGISTRY[type]?.cellClass
}

/**
 * Get spawn weight for a cell type
 */
export function getSpawnWeight(type: CellType): number {
  return CELL_REGISTRY[type]?.spawnWeight || 0
}

/**
 * Get spawn configuration for a cell type
 */
export function getSpawnConfig(type: CellType): SpawnConfig | undefined {
  return CELL_REGISTRY[type]?.spawnConfig
}

/**
 * Get all cell types that have special spawn configuration
 */
export function getSpecialSpawnCellTypes(): CellType[] {
  return Object.entries(CELL_REGISTRY)
    .filter(([_, entry]) => entry && entry.spawnConfig)
    .map(([type, _]) => type as CellType)
}

/**
 * Get all cell types that can be randomly spawned
 */
export function getSpawnableCellTypes(): CellType[] {
  return Object.entries(CELL_REGISTRY)
    .filter(([_, entry]) => entry && entry.spawnWeight > 0)
    .map(([type, _]) => type as CellType)
}

/**
 * Create a cell instance by type
 */
export function createCell(type: CellType, position: { q: number, r: number }, id?: string): BaseCell {
  const CellClass = getCellClass(type)
  if (!CellClass) {
    throw new Error(`Unknown cell type: ${type}`)
  }
  return new CellClass(position, id)
}
