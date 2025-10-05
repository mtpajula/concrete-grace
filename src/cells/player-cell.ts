/**
 * Player Cell - The player character
 */

import { BaseCell, type CellType, type CellRenderInfo, type CellInteractionResult } from './base-cell'
import { ASSET_KEYS } from '@/assets/asset-registry'

export class PlayerCell extends BaseCell {
  protected getType(): CellType {
    return 'player'
  }

  protected getSize(): number {
    return 1
  }

  public getRenderInfo(): CellRenderInfo {
    return {
      color: '#FFD700',
      priority: 10, // Highest priority - always render on top
      imageAsset: 'player',
      getImage: this.createGetImageFunction(ASSET_KEYS.PLAYER),
      fallbackRenderer: (ctx, x, y, size) => {
        const playerSize = size * 0.8
        // Fallback diamond shape
        ctx.fillStyle = '#FFD700'
        ctx.beginPath()
        ctx.moveTo(x, y - playerSize/2)
        ctx.lineTo(x + playerSize/2, y)
        ctx.lineTo(x, y + playerSize/2)
        ctx.lineTo(x - playerSize/2, y)
        ctx.closePath()
        ctx.fill()
        
        // Add player glow
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)'
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }
  }

  public canInteract(): boolean {
    return false // Player doesn't interact with itself
  }

  public isBlocking(): boolean {
    return false // Player doesn't block movement
  }
}
