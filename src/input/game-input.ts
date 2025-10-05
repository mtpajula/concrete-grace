import { hexDirections } from '@/utils/hex-grid'
import { getDirectionForKeyCode, getActionForKeyCode } from '@/utils/key-mapping'

export interface InputCallbacks {
  movePlayer: (direction: number) => { moved: boolean; message?: string }
  consumePlant: () => void
  interactWithAalto: () => void
  toggleDebug: () => void
  debugPlayerPosition: () => void
  cleanupDepletedPlants: () => void
  generateNearbyChunks: () => void
  showMessage: (message: string) => void
  moveToHex: (q: number, r: number) => void
}

export class GameInputHandler {
  private callbacks: InputCallbacks
  private tileSize: number
  private canvasElement: HTMLCanvasElement | null = null

  constructor(callbacks: InputCallbacks, tileSize: number) {
    this.callbacks = callbacks
    this.tileSize = tileSize
    this.setupEventListeners()
  }

  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyPress.bind(this))
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvasElement = canvas
    canvas.addEventListener('click', this.handleCanvasClick.bind(this))
  }

  removeCanvas() {
    if (this.canvasElement) {
      this.canvasElement.removeEventListener('click', this.handleCanvasClick.bind(this))
      this.canvasElement = null
    }
  }

  cleanup() {
    window.removeEventListener('keydown', this.handleKeyPress.bind(this))
    window.removeEventListener('resize', this.handleResize.bind(this))
    this.removeCanvas()
  }

  private handleKeyPress(event: KeyboardEvent) {
    // Check for movement keys first
    const direction = getDirectionForKeyCode(event.code)
    if (direction !== null) {
      const moveResult = this.callbacks.movePlayer(direction)
      if (moveResult.moved) {
        this.callbacks.generateNearbyChunks()
        if (moveResult.message) {
          this.callbacks.showMessage(moveResult.message)
        }
      }
      return
    }

        // Check for action keys
        const action = getActionForKeyCode(event.code)
        switch (action) {
          case 'consumePlant':
            this.callbacks.consumePlant()
            break
          case 'interactAalto':
            this.callbacks.interactWithAalto()
            break
          case 'toggleDebug':
            this.callbacks.toggleDebug()
            break
          case 'debugPosition':
            this.callbacks.debugPlayerPosition()
            break
          case 'cleanupPlants':
            this.callbacks.cleanupDepletedPlants()
            break
        }
  }

  private handleCanvasClick(event: MouseEvent) {
    if (!this.canvasElement) return

    const rect = this.canvasElement.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    const centerX = this.canvasElement.width / 2
    const centerY = this.canvasElement.height / 2
    
    const relativeX = clickX - centerX
    const relativeY = clickY - centerY

    // Convert pixel to hex coordinates
    const targetQ = Math.round(relativeX / (this.tileSize * 3/2))
    const targetR = Math.round((relativeY - Math.sqrt(3)/2 * relativeX) / (this.tileSize * Math.sqrt(3)))
    
    this.callbacks.moveToHex(targetQ, targetR)
  }

  private handleResize() {
    // Canvas resize should be handled by the main component
  }
}

// Use InputCallbacks directly (now includes moveToHex)
export type ExtendedInputCallbacks = InputCallbacks
