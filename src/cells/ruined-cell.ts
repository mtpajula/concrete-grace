/**
 * Ruined Cell - Contaminated land where plants were consumed
 */

import { BaseCell, type CellType, type CellRenderInfo, type CellInteractionResult } from './base-cell'

export class RuinedCell extends BaseCell {
  protected getType(): CellType {
    return 'ruined'
  }

  public getRenderInfo(): CellRenderInfo {
    return {
      color: '#8B4513',
      priority: 2,
      imageAsset: 'plant_eaten',
      getImage: this.createGetImageFunction('@/assets/plant_eaten.png'),
      fallbackRenderer: (ctx, x, y, size) => {
        const hexSize = size * 0.6 // Smaller ruined area
        const contaminatedSize = hexSize * 0.6
        
        ctx.fillStyle = '#8B4513'
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = Math.PI / 3 * i
          const px = x + contaminatedSize * Math.cos(angle)
          const py = y + contaminatedSize * Math.sin(angle)
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()

        // Toxicity effects
        ctx.fillStyle = '#654321'
        for (let i = 0; i < 3; i++) {
          const angle = Math.PI / 3 * i * 2
          const px = x + contaminatedSize * Math.cos(angle) * 0.8
          const py = y + contaminatedSize * Math.sin(angle) * 0.8
          ctx.beginPath()
          ctx.arc(px, py, contaminatedSize * 0.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }
}
