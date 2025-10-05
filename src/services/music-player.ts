/**
 * Music Player Service - Manages audio assets and playback
 * Handles background music, sound effects, and audio state
 */

export interface AudioTrack {
  name: string
  src: string
  loop?: boolean
  volume?: number
}

export class MusicPlayerService {
  private static instance: MusicPlayerService
  private audioContext: AudioContext | null = null
  private backgroundMusic: HTMLAudioElement | null = null
  private soundEffects: Map<string, HTMLAudioElement> = new Map()
  private isMuted = false
  private masterVolume = 0.7

  private constructor() {
    this.initializeAudioContext()
  }

  public static getInstance(): MusicPlayerService {
    if (!MusicPlayerService.instance) {
      MusicPlayerService.instance = new MusicPlayerService()
    }
    return MusicPlayerService.instance
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      console.log('Audio context initialized')
    } catch (error) {
      console.warn('Failed to initialize audio context:', error)
    }
  }

  /**
   * Load background music
   */
  async loadBackgroundMusic(): Promise<void> {
    try {
      const module = await import('@/assets/game_music.mp3')
      const audioSrc = module.default as string
      
      this.backgroundMusic = new Audio(audioSrc)
      this.backgroundMusic.loop = true
      this.backgroundMusic.volume = this.masterVolume * 0.3 // Background music quieter
      
      console.log('Background music loaded')
    } catch (error) {
      console.warn('Failed to load background music:', error)
    }
  }

  /**
   * Load sound effects
   */
  async loadSoundEffects(): Promise<void> {
    const soundEffects = [
      { name: 'eating', src: '@/assets/eating_sound.mp3' },
      { name: 'stool', src: '@/assets/stool_sound.mp3' }
    ]

    for (const effect of soundEffects) {
      try {
        const module = await import(/* @vite-ignore */ effect.src)
        const audioSrc = module.default as string
        
        const audio = new Audio(audioSrc)
        audio.volume = this.masterVolume * 0.5 // Sound effects medium volume
        
        this.soundEffects.set(effect.name, audio)
        console.log(`Sound effect loaded: ${effect.name}`)
      } catch (error) {
        console.warn(`Failed to load sound effect ${effect.name}:`, error)
      }
    }
  }

  /**
   * Play background music
   */
  async playBackgroundMusic(): Promise<void> {
    if (!this.backgroundMusic || this.isMuted) return

    try {
      // Resume audio context if suspended
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume()
      }

      await this.backgroundMusic.play()
      console.log('Background music started')
    } catch (error) {
      console.warn('Failed to play background music:', error)
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause()
      this.backgroundMusic.currentTime = 0
    }
  }

  /**
   * Play sound effect
   */
  async playSoundEffect(effectName: string): Promise<void> {
    if (this.isMuted) return

    const audio = this.soundEffects.get(effectName)
    if (!audio) {
      console.warn(`Sound effect not found: ${effectName}`)
      return
    }

    try {
      // Resume audio context if suspended
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Clone and play to allow overlapping sounds
      const audioClone = audio.cloneNode() as HTMLAudioElement
      await audioClone.play()
    } catch (error) {
      console.warn(`Failed to play sound effect ${effectName}:`, error)
    }
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    
    // Update background music volume
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.masterVolume * 0.3
    }
    
    // Update sound effects volume
    this.soundEffects.forEach(audio => {
      audio.volume = this.masterVolume * 0.5
    })
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterVolume
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted
    
    if (this.backgroundMusic) {
      this.backgroundMusic.muted = this.isMuted
    }
    
    this.soundEffects.forEach(audio => {
      audio.muted = this.isMuted
    })
    
    console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`)
  }

  /**
   * Check if audio is muted
   */
  isAudioMuted(): boolean {
    return this.isMuted
  }

  /**
   * Load all audio assets
   */
  async loadAllAudio(): Promise<void> {
    await Promise.all([
      this.loadBackgroundMusic(),
      this.loadSoundEffects()
    ])
  }

  /**
   * Get audio loading status
   */
  getAudioStatus(): { backgroundMusic: boolean, soundEffects: number, total: number } {
    return {
      backgroundMusic: this.backgroundMusic !== null,
      soundEffects: this.soundEffects.size,
      total: this.soundEffects.size + (this.backgroundMusic ? 1 : 0)
    }
  }
}

// Export singleton instance
export const musicPlayer = MusicPlayerService.getInstance()
