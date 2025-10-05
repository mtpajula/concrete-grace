export interface Position {
  q: number // Hex grid Q coordinate
  r: number // Hex grid R coordinate
}

export interface HexPosition {
  q: number
  r: number
}

// Hex coordinate utilities
export function hexKey(q: number, r: number): string {
  return `${q},${r}`
}

export function hexDistance(a: Position, b: Position): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2
}

export function hexNeighbors(q: number, r: number): Array<{q: number, r: number}> {
  return [
    { q: q + 1, r: r },     // East
    { q: q + 1, r: r - 1 }, // Northeast
    { q: q, r: r - 1 },     // Northwest
    { q: q - 1, r: r },     // West
    { q: q - 1, r: r + 1 }, // Southwest
    { q: q, r: r + 1 }      // Southeast
  ]
}

export function hexToPixel(q: number, r: number, tileSize: number = 24): { x: number, y: number } {
  const x = tileSize * (3/2 * q)
  const y = tileSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r)
  return { x, y }
}

// Hex movement directions (0-5 for UI mapping)
export const hexDirections = [
  { q: 1, r: 0 },   // East
  { q: 1, r: -1 }, // Northeast  
  { q: 0, r: -1 },  // Northwest
  { q: -1, r: 0 },  // West
  { q: -1, r: 1 },  // Southwest
  { q: 0, r: 1 }    // Southeast
]
