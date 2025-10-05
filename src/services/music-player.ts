/**
 * Music Player Service - Manages audio assets and playback
 * Handles background music, sound effects, and audio state
 */

// Import audio assets
import gameMusic from '@/assets/game_music.mp3'
import eatingSound from '@/assets/eating_sound.mp3'
import stoolSound from '@/assets/stool_sound.mp3'

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
      this.backgroundMusic = new Audio(gameMusic)
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
    console.log('Loading sound effects...')
    const soundEffects = [
      { name: 'eating', audio: eatingSound },
      { name: 'stool', audio: stoolSound }
    ]

    for (const effect of soundEffects) {
      try {
        console.log(`Loading sound effect: ${effect.name}`)
        const audio = new Audio(effect.audio)
        audio.volume = this.masterVolume * 0.5 // Sound effects medium volume
        
        this.soundEffects.set(effect.name, audio)
        console.log(`Sound effect loaded: ${effect.name}`)
      } catch (error) {
        console.warn(`Failed to load sound effect ${effect.name}:`, error)
      }
    }
    console.log(`Total sound effects loaded: ${this.soundEffects.size}`)
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
    console.log(`Attempting to play sound effect: ${effectName}`)
    
    if (this.isMuted) {
      console.log('Audio is muted, skipping sound effect')
      return
    }

    const audio = this.soundEffects.get(effectName)
    if (!audio) {
      console.warn(`Sound effect not found: ${effectName}`)
      console.log('Available sound effects:', Array.from(this.soundEffects.keys()))
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
      console.log(`Sound effect played: ${effectName}`)
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
    console.log('Loading all audio assets...')
    await Promise.all([
      this.loadBackgroundMusic(),
      this.loadSoundEffects()
    ])
    console.log('All audio assets loaded')
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
