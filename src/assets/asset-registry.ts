/**
 * Asset Registry - Centralized asset management
 * Uses simple keys instead of full paths for better DRY compliance
 */

import { CellAssetLoader } from '@/cells/base-cell'

// Import all image assets
import aaltoBuildingImage from '@/assets/aalto_building.png'
import aaltoStoolImage from '@/assets/aalto_stool.png'
import plantImage from '@/assets/plant.png'
import plantEatenImage from '@/assets/plant_eaten.png'
import brutal1Image from '@/assets/structures/brutal_1.png'
import brutal2Image from '@/assets/structures/brutal_2.png'
import playerImage from '@/assets/player.png'

/**
 * Asset keys - single source of truth for asset identifiers
 */
export const ASSET_KEYS = {
  AALTO_BUILDING: 'aalto_building',
  AALTO_STOOL: 'aalto_stool', 
  PLANT: 'plant',
  PLANT_EATEN: 'plant_eaten',
  BRUTAL_1: 'brutal_1',
  BRUTAL_2: 'brutal_2',
  PLAYER: 'player'
} as const

/**
 * Register all game assets with the CellAssetLoader
 */
export function registerGameAssets(): void {
  // Register image assets using simple keys
  CellAssetLoader.registerAsset(ASSET_KEYS.AALTO_BUILDING, () => Promise.resolve({ default: aaltoBuildingImage }))
  CellAssetLoader.registerAsset(ASSET_KEYS.AALTO_STOOL, () => Promise.resolve({ default: aaltoStoolImage }))
  CellAssetLoader.registerAsset(ASSET_KEYS.PLANT, () => Promise.resolve({ default: plantImage }))
  CellAssetLoader.registerAsset(ASSET_KEYS.PLANT_EATEN, () => Promise.resolve({ default: plantEatenImage }))
  CellAssetLoader.registerAsset(ASSET_KEYS.BRUTAL_1, () => Promise.resolve({ default: brutal1Image }))
  CellAssetLoader.registerAsset(ASSET_KEYS.BRUTAL_2, () => Promise.resolve({ default: brutal2Image }))
  CellAssetLoader.registerAsset(ASSET_KEYS.PLAYER, () => Promise.resolve({ default: playerImage }))
  
  console.log('Game assets registered with CellAssetLoader')
}
