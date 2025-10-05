/**
 * Base Cell Class - Foundation for all cell types
 * Provides common interface and behavior for all cells
 */

export type CellType = 'brutalist' | 'aalto' | 'aalto_stool' | 'plant' | 'path' | 'ruined'

export interface CellPosition {
  q: number
  r: number
}

export interface CellRenderInfo {
  color: string
  priority: number
  imageAsset?: string
  fallbackRenderer?: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void
  getImage?: () => Promise<HTMLImageElement | null>
}

export interface CellInteractionResult {
  success: boolean
  message?: string
  healthChange?: number
  triggersDialogue?: boolean
  transformsTo?: CellType
}

/**
 * Generic asset loader for cells
 */
export class CellAssetLoader {
  private static loadedAssets = new Map<string, HTMLImageElement>()
  private static loadingPromises = new Map<string, Promise<HTMLImageElement | null>>()

  /**
   * Load an image asset with caching
   */
  static async loadImage(assetPath: string): Promise<HTMLImageElement | null> {
    // Return cached asset if already loaded
    if (this.loadedAssets.has(assetPath)) {
      return this.loadedAssets.get(assetPath)!
    }

    // Return existing promise if currently loading
    if (this.loadingPromises.has(assetPath)) {
      return this.loadingPromises.get(assetPath)!
    }

    // Start loading
    const loadPromise = this.performImageLoad(assetPath)
    this.loadingPromises.set(assetPath, loadPromise)

    try {
      const image = await loadPromise
      if (image) {
        this.loadedAssets.set(assetPath, image)
      }
      return image
    } finally {
      this.loadingPromises.delete(assetPath)
    }
  }

  /**
   * Perform the actual image loading
   */
  private static async performImageLoad(assetPath: string): Promise<HTMLImageElement | null> {
    try {
      const module = await import(/* @vite-ignore */ assetPath)
      const imageSrc = module.default as string
      const image = new Image()
      
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error(`Failed to load image: ${assetPath}`))
        image.src = imageSrc
      })
      
      console.log(`Asset loaded: ${assetPath}`)
      return image
    } catch (error) {
      console.warn(`Failed to load asset ${assetPath}:`, error)
      return null
    }
  }

  /**
   * Get cached asset if available
   */
  static getCachedImage(assetPath: string): HTMLImageElement | null {
    return this.loadedAssets.get(assetPath) || null
  }

  /**
   * Check if asset is loaded
   */
  static isAssetLoaded(assetPath: string): boolean {
    return this.loadedAssets.has(assetPath)
  }
}

/**
 * Base class for all cell types
 * Provides common interface and default behavior
 */
export abstract class BaseCell {
  public readonly id: string
  public readonly position: CellPosition
  public readonly type: CellType
  public readonly size: number
  public readonly rotation: number
  public readonly health?: number
  public readonly discovered?: boolean

  constructor(position: CellPosition, id?: string) {
    this.position = position
    this.id = id || this.generateId()
    this.type = this.getType()
    this.size = this.getSize()
    this.rotation = this.getRotation()
    this.health = this.getHealth()
    this.discovered = this.getDiscovered()
  }

  /**
   * Generate unique ID for this cell
   */
  protected generateId(): string {
    return `${this.getType()}_${this.position.q}_${this.position.r}_${Date.now()}`
  }

  /**
   * Get the cell type - must be implemented by subclasses
   */
  protected abstract getType(): CellType

  /**
   * Get the cell size - can be overridden by subclasses
   */
  protected getSize(): number {
    return 1
  }

  /**
   * Get the cell rotation - can be overridden by subclasses
   */
  protected getRotation(): number {
    return 0
  }

  /**
   * Get the cell health - can be overridden by subclasses
   */
  protected getHealth(): number | undefined {
    return undefined
  }

  /**
   * Get the discovered state - can be overridden by subclasses
   */
  protected getDiscovered(): boolean | undefined {
    return undefined
  }

  /**
   * Get rendering information for this cell
   */
  public abstract getRenderInfo(): CellRenderInfo

  /**
   * Check if this cell blocks movement
   */
  public isBlocking(): boolean {
    return false
  }

  /**
   * Handle player interaction with this cell
   */
  public onPlayerEnter(): CellInteractionResult {
    return { success: true }
  }

  /**
   * Handle player action on this cell (space key, etc.)
   */
  public onPlayerAction(): CellInteractionResult {
    return { success: false }
  }

  /**
   * Check if this cell can be interacted with
   */
  public canInteract(): boolean {
    return false
  }

  /**
   * Convert to Structure interface for compatibility
   */
  public toStructure() {
    return {
      id: this.id,
      position: this.position,
      type: this.type,
      size: this.size,
      rotation: this.rotation,
      health: this.health,
      discovered: this.discovered
    }
  }

  /**
   * Create a copy of this cell with new position
   */
  public clone(newPosition?: CellPosition): BaseCell {
    const CellClass = this.constructor as new (position: CellPosition, id?: string) => BaseCell
    return new CellClass(newPosition || this.position, this.id)
  }

  /**
   * Helper method for loading assets using the generic asset loader
   */
  protected async loadAsset(assetPath: string): Promise<HTMLImageElement | null> {
    return CellAssetLoader.loadImage(assetPath)
  }

  /**
   * Helper method to create getImage function for render info
   */
  protected createGetImageFunction(assetPath: string): () => Promise<HTMLImageElement | null> {
    return () => this.loadAsset(assetPath)
  }
}
