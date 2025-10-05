import { hexToPixel } from '@/utils/hex-grid'
import type { BaseCell } from '@/cells/base-cell'

export interface RenderConfig {
  tileSize: number
  canvasWidth: number
  canvasHeight: number
}

export interface Structure {
  id: string
  position: { q: number, r: number }
  type: 'brutalist' | 'aalto' | 'aalto_stool' | 'plant' | 'path' | 'ruined'
  size: number
  rotation: number
  health?: number
  discovered?: boolean
}

const STRUCTURE_COLORS = {
  brutalist: '#666666',
  aalto: '#8B4513',
  aalto_stool: '#D2B48C', // Light wood color for furniture
  plant: '#228B22',
  path: '#444444', // Dark grey for paths (darker than before)
  ruined: '#8B4513'
}

export class GameRenderer {
  private config: RenderConfig
  private imagesLoaded = false
  
  constructor(config: RenderConfig) {
    this.config = config
    this.imagesLoaded = true // No need to preload images anymore
  }

  updateConfig(config: RenderConfig) {
    this.config = config
  }

  private renderDarkGradient(ctx: CanvasRenderingContext2D) {
    // Create radial gradient from center to edges for atmospheric depth
    const centerX = this.config.canvasWidth / 2
    const centerY = this.config.canvasHeight / 2
    const radius = Math.max(this.config.canvasWidth, this.config.canvasHeight) * 0.7
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)')    // Subtle dark center
    gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.4)')  // Medium darkness
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)')    // Strong darkness at edges
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight)
    
    // Add subtle vignette effect
    const vignetteGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.2)
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    vignetteGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.3)')
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)')
    
    ctx.fillStyle = vignetteGradient
    ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight)
  }

  private renderDegradationEffect(ctx: CanvasRenderingContext2D, plantsDestroyed: number) {
    if (plantsDestroyed <= 0) return
    
    // Calculate degradation intensity based on plants destroyed
    const maxDegradation = 50
    const intensity = Math.min(plantsDestroyed / maxDegradation, 1)
    
    if (intensity > 0) {
      // Add subtle red tint overlay for environmental degradation
      ctx.fillStyle = `rgba(139, 69, 19, ${intensity * 0.1})`
      ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight)
      
      // Add some "cracks" or "corruption" effects
      if (intensity > 0.3) {
        ctx.strokeStyle = `rgba(139, 69, 19, ${intensity * 0.3})`
        ctx.lineWidth = 1
        
        // Draw some random crack lines
        for (let i = 0; i < Math.floor(intensity * 5); i++) {
          ctx.beginPath()
          const startX = Math.random() * this.config.canvasWidth
          const startY = Math.random() * this.config.canvasHeight
          const endX = startX + (Math.random() - 0.5) * 100
          const endY = startY + (Math.random() - 0.5) * 100
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()
        }
      }
    }
  }

  private getRenderPriority(type: string): number {
    switch (type) {
      case 'path': return 1        // Bottom layer - paths
      case 'ruined': return 2     // Ruined land
      case 'plant': return 3      // Plants
      case 'aalto_stool': return 4 // Furniture
      case 'brutalist': return 5  // Buildings
      case 'aalto': return 6       // Top layer - Aalto buildings (rendered last)
      default: return 7            // Unknown structures render last
    }
  }

  async render(
    ctx: CanvasRenderingContext2D, 
    cells: BaseCell[], 
    playerPosition: { q: number, r: number },
    plantsDestroyed: number
  ) {
    // Clear background
    ctx.fillStyle = '#1A1A1A'
    ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight)

    // Draw grid and cells
    this.drawHexGrid(ctx)
    await this.renderCells(ctx, cells, playerPosition)
    this.renderPlayer(ctx)
    
    // Dark gradient overlay for atmospheric depth
    this.renderDarkGradient(ctx)
    
    this.renderDegradationEffect(ctx, plantsDestroyed)
  }

  private drawHexGrid(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)'
    ctx.lineWidth = 1
    
    const centerX = this.config.canvasWidth / 2
    const centerY = this.config.canvasHeight / 2
    const gridRadius = Math.max(this.config.canvasWidth, this.config.canvasHeight) / this.config.tileSize
    
    // Draw hex grid
    for (let q = -gridRadius; q <= gridRadius; q++) {
      for (let r = -gridRadius; r <= gridRadius; r++) {
        const pixel = hexToPixel(q, r, this.config.tileSize)
        const x = centerX + pixel.x
        const y = centerY + pixel.y
        
        // Only draw if within canvas bounds
        if (x >= 0 && x <= this.config.canvasWidth && y >= 0 && y <= this.config.canvasHeight) {
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i
            const px = x + this.config.tileSize * Math.cos(angle)
            const py = y + this.config.tileSize * Math.sin(angle)
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.stroke()
        }
      }
    }
  }

  private async renderCells(ctx: CanvasRenderingContext2D, cells: BaseCell[], playerPosition: { q: number, r: number }) {
    const sortedCells = [...cells].sort((a, b) => {
      // First sort by render priority
      const aPriority = a.getRenderInfo().priority
      const bPriority = b.getRenderInfo().priority
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      // Then sort by distance from player
      const aDist = Math.abs(a.position.q) + Math.abs(a.position.r) + Math.abs(a.position.q + a.position.r)
      const bDist = Math.abs(b.position.q) + Math.abs(b.position.r) + Math.abs(b.position.q + b.position.r)
      return aDist - bDist
    })

    for (const cell of sortedCells) {
      await this.renderCell(ctx, cell, playerPosition)
    }
  }

  private async renderCell(ctx: CanvasRenderingContext2D, cell: BaseCell, playerPosition: { q: number, r: number }) {
    const relativeQ = cell.position.q - playerPosition.q
    const relativeR = cell.position.r - playerPosition.r

    const pixel = hexToPixel(relativeQ, relativeR, this.config.tileSize)
    const screenX = this.config.canvasWidth / 2 + pixel.x
    const screenY = this.config.canvasHeight / 2 + pixel.y

    const renderInfo = cell.getRenderInfo()
    
    // Try to use image asset first
    if (renderInfo.imageAsset && renderInfo.getImage) {
      const image = await renderInfo.getImage()
      if (image) {
        // Scale images to fit within cell boundaries with slight overlap for taller buildings
        let imageSize = this.config.tileSize * 0.8 // Base size fits within cell
        
        // Allow taller buildings to extend slightly beyond cell boundaries
        if (cell.type === 'brutalist' || cell.type === 'aalto') {
          imageSize = this.config.tileSize * 1.1 // Slightly taller buildings
        } else if (cell.type === 'plant' || cell.type === 'aalto_stool') {
          imageSize = this.config.tileSize * 0.6 // Smaller items
        }
        
        ctx.drawImage(
          image,
          screenX - imageSize / 2,
          screenY - imageSize / 2,
          imageSize,
          imageSize
        )
        return
      }
    }
    
    // Fall back to custom renderer or default
    if (renderInfo.fallbackRenderer) {
      renderInfo.fallbackRenderer(ctx, screenX, screenY, this.config.tileSize)
    } else {
      // Default fallback rendering
      this.renderDefaultCell(ctx, screenX, screenY, renderInfo)
    }
  }

  /**
   * Default cell rendering fallback
   */
  private renderDefaultCell(ctx: CanvasRenderingContext2D, x: number, y: number, renderInfo: any) {
    const hexSize = this.config.tileSize * 0.8
    ctx.fillStyle = renderInfo.color || '#666666'
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i
      const px = x + hexSize * Math.cos(angle)
      const py = y + hexSize * Math.sin(angle)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fill()
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const centerX = this.config.canvasWidth / 2
    const centerY = this.config.canvasHeight / 2
    const playerSize = 24

    // Fallback rendering
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - playerSize/2)
    ctx.lineTo(centerX + playerSize/2, centerY)
    ctx.lineTo(centerX, centerY + playerSize/2)
    ctx.lineTo(centerX - playerSize/2, centerY)
    ctx.closePath()
    ctx.fill()
    
    // Add player glow
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)'
    ctx.shadowBlur = 10
    ctx.fill()
    ctx.shadowBlur = 0
  }
}