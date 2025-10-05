/**
 * Brutalist Cell - Concrete monoliths that block movement
 */

import { BaseCell, type CellType, type CellRenderInfo, type CellInteractionResult } from './base-cell'
import { ASSET_KEYS } from '@/assets/asset-registry'

export class BrutalistCell extends BaseCell {
  private selectedAsset: string

  constructor(q: number, r: number) {
    super(q, r)
    // Select the asset once when the cell is created
    const brutalistAssets = [ASSET_KEYS.BRUTAL_1, ASSET_KEYS.BRUTAL_2, ASSET_KEYS.BRUTAL_3, ASSET_KEYS.BRUTAL_4]
    this.selectedAsset = brutalistAssets[Math.floor(Math.random() * brutalistAssets.length)]
  }
  protected getType(): CellType {
    return 'brutalist'
  }

  protected getSize(): number {
    return Math.floor(Math.random() * 8) + 6
  }

  public getRenderInfo(): CellRenderInfo {
    return {
      color: '#666666',
      priority: 5,
      imageAsset: 'brutalist',
      getImage: this.createGetImageFunction(this.selectedAsset),
      fallbackRenderer: (ctx, x, y, size) => {
        const hexSize = size * 0.7 // Smaller fallback to fit within cell
        ctx.fillStyle = '#666666'
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
    }
  }

  public isBlocking(): boolean {
    return true
  }
}
