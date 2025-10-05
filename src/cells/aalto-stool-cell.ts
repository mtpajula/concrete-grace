/**
 * Aalto Stool Cell - Dangerous three-legged furniture
 */

import { BaseCell, type CellType, type CellRenderInfo, type CellInteractionResult } from './base-cell'
import { ASSET_KEYS } from '@/assets/asset-registry'

export class AaltoStoolCell extends BaseCell {
  protected getType(): CellType {
    return 'aalto_stool'
  }

  public getRenderInfo(): CellRenderInfo {
    return {
      color: '#D2B48C',
      priority: 4,
      imageAsset: 'aalto_stool',
      getImage: this.createGetImageFunction(ASSET_KEYS.AALTO_STOOL),
      fallbackRenderer: (ctx, x, y, size) => {
        const stoolSize = size * 0.5 // Smaller stool to fit within cell
        // Main stool top
        ctx.fillStyle = '#D2B48C'
        ctx.beginPath()
        ctx.ellipse(x, y - stoolSize * 0.3, stoolSize * 0.7, stoolSize * 0.4, 0, 0, Math.PI * 2)
        ctx.fill()
        // Three legs
        ctx.fillStyle = '#CD853F'
        ctx.lineWidth = 2
        // Leg 1
        ctx.beginPath()
        ctx.moveTo(x - stoolSize * 0.2, y + stoolSize * 0.3)
        ctx.lineTo(x - stoolSize * 0.3, y + stoolSize * 0.8)
        ctx.lineTo(x - stoolSize * 0.1, y + stoolSize * 0.8)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
        // Leg 2
        ctx.beginPath()
        ctx.moveTo(x + stoolSize * 0.2, y + stoolSize * 0.3)
        ctx.lineTo(x + stoolSize * 0.3, y + stoolSize * 0.8)
        ctx.lineTo(x + stoolSize * 0.1, y + stoolSize * 0.8)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
        // Leg 3
        ctx.beginPath()
        ctx.moveTo(x, y + stoolSize * 0.3)
        ctx.lineTo(x + stoolSize * 0.05, y + stoolSize * 0.8)
        ctx.lineTo(x - stoolSize * 0.05, y + stoolSize * 0.8)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
      }
    }
  }

  public onPlayerEnter(): CellInteractionResult {
    return {
      success: true,
      message: '🪑 You tripped on the three-legged stool! -10 health.',
      healthChange: -10
    }
  }
}
