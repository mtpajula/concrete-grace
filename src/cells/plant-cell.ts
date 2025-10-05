/**
 * Plant Cell - Green life that can be consumed for health
 */

import { BaseCell, type CellType, type CellRenderInfo, type CellInteractionResult } from './base-cell'
import { ASSET_KEYS } from '@/assets/asset-registry'

export class PlantCell extends BaseCell {
  protected getType(): CellType {
    return 'plant'
  }

  protected getHealth(): number {
    return 100
  }

  public getRenderInfo(): CellRenderInfo {
    return {
      color: '#228B22',
      priority: 3,
      imageAsset: 'plant',
      getImage: this.createGetImageFunction(ASSET_KEYS.PLANT),
      fallbackRenderer: (ctx, x, y, size) => {
        const plantSize = size * 0.3 // Smaller plant to fit within cell
        // Stem
        ctx.fillStyle = '#556B2F'
        ctx.fillRect(x - 2, y - plantSize, 4, plantSize)
        // Leaves
        ctx.fillStyle = '#228B22'
        ctx.beginPath()
        ctx.ellipse(x - plantSize/3, y - plantSize * 0.7, plantSize/4, plantSize/3, -0.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(x + plantSize/3, y - plantSize * 0.7, plantSize/4, plantSize/3, 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  public canInteract(): boolean {
    return true
  }

  public onPlayerAction(): CellInteractionResult {
    return {
      success: true,
      message: '🌱 You consumed the plant! +10 health',
      healthChange: 10,
      transformsTo: 'ruined'
    }
  }
}
