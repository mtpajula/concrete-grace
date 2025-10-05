/**
 * Centralized key mapping for game input handling
 * Eliminates duplication and provides consistent movement directions
 */

export interface KeyMapping {
  code: string
  direction: number
  description: string
}

export interface ActionMapping {
  code: string
  action: string
  description: string
}

// Movement keys mapped to hex directions
export const MOVEMENT_KEYS: KeyMapping[] = [
  // Arrow Keys
  { code: 'ArrowUp', direction: 2, description: 'Northeast' },
  { code: 'ArrowDown', direction: 5, description: 'Southwest' },
  { code: 'ArrowLeft', direction: 3, description: 'West' },
  { code: 'ArrowRight', direction: 0, description: 'East' },
  
  // WASD Keys
  { code: 'KeyW', direction: 2, description: 'Northeast' },
  { code: 'KeyS', direction: 5, description: 'Southwest' },
  { code: 'KeyA', direction: 3, description: 'West' },
  { code: 'KeyD', direction: 0, description: 'East' },
  
  // Numpad Keys (grid layout mapped to hex directions)
  { code: 'Numpad7', direction: 3, description: 'Northwest (top-left)' },
  { code: 'Numpad8', direction: 2, description: 'East (up center)' },
  { code: 'Numpad9', direction: 1, description: 'Northeast (top-right)' },
  { code: 'Numpad1', direction: 4, description: 'Southwest (bottom-left)' },
  { code: 'Numpad2', direction: 5, description: 'Southeast (down center)' },
  { code: 'Numpad3', direction: 0, description: 'West (bottom-right)' }
]

// Action keys for game interactions
export const ACTION_KEYS: ActionMapping[] = [
  { code: 'Space', action: 'consumePlant', description: 'Consume plant' },
  { code: 'Enter', action: 'interactAalto', description: 'Interact with Aalto building' },
  { code: 'KeyH', action: 'toggleDebug', description: 'Toggle debug dialog' },
  { code: 'KeyF', action: 'debugPosition', description: 'Debug player position' },
  { code: 'KeyG', action: 'forcePlant', description: 'Force create plant' },
  { code: 'KeyK', action: 'cleanupPlants', description: 'Cleanup depleted plants' },
  { code: 'KeyJ', action: 'findAalto', description: 'Find closest Aalto building' }
]

/**
 * Find movement direction for a key code
 */
export function getDirectionForKeyCode(code: string): number | null {
  const mapping = MOVEMENT_KEYS.find(k => k.code === code)
  return mapping ? mapping.direction : null
}

/**
 * Find action for a key code  
 */
export function getActionForKeyCode(code: string): string | null {
  const mapping = ACTION_KEYS.find(k => k.code === code)
  return mapping ? mapping.action : null
}

/**
 * Check if key code is a movement key
 */
export function isMovementKey(code: string): boolean {
  return MOVEMENT_KEYS.some(k => k.code === code)
}

/**
 * Check if key code is an action key
 */
export function isActionKey(code: string): boolean {
  return ACTION_KEYS.some(k => k.code === code)
}
