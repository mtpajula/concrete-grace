/**
 * Path Cell - Walkable paths connecting areas
 */

import { BaseCell, type CellType, type CellRenderInfo, type CellInteractionResult } from './base-cell'

export class PathCell extends BaseCell {
  protected getType(): CellType {
    return 'path'
  }

  public getRenderInfo(): CellRenderInfo {
    return {
      color: '#444444',
      priority: 1,
      fallbackRenderer: (ctx, x, y, size) => {
        const hexSize = size * 0.8 // Path fills most of the cell
        ctx.fillStyle = '#444444'
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
}
