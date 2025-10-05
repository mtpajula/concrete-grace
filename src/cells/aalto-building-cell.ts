/**
 * Aalto Building Cell - Organic architecture that triggers dialogue
 */

import { BaseCell, type CellType, type CellRenderInfo, type CellInteractionResult } from './base-cell'

export class AaltoBuildingCell extends BaseCell {
  protected getType(): CellType {
    return 'aalto'
  }

  protected getSize(): number {
    return 8
  }

  protected getDiscovered(): boolean {
    return false
  }

  public getRenderInfo(): CellRenderInfo {
    return {
      color: '#8B4513',
      priority: 6,
      imageAsset: 'aalto_building',
      getImage: this.createGetImageFunction('@/assets/aalto_building.png'),
      fallbackRenderer: (ctx, x, y, size) => {
        const radius = size * 0.25 // Smaller fallback to fit within cell
        ctx.fillStyle = '#8B4513'
        ctx.beginPath()
        ctx.arc(x, y + radius * 0.5, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  public canInteract(): boolean {
    return true
  }

  public onPlayerEnter(): CellInteractionResult {
    return {
      success: true,
      message: '🏛️ You discovered an Aalto building!',
      triggersDialogue: true
    }
  }

  public onPlayerAction(): CellInteractionResult {
    return {
      success: true,
      triggersDialogue: true
    }
  }
}
