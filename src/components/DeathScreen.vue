<template>
  <div class="death-overlay">
    <div class="death-container">
      <!-- Background Image -->
      <div class="death-background">
        <img 
          src="@/assets/cutscenes/death.png" 
          alt="Death in Concrete Forest" 
          class="death-image"
        />
        
        <!-- Dark overlay for text readability -->
        <div class="image-overlay"></div>
      </div>
      
      <!-- Death Content -->
      <div class="death-content">
        <div class="death-title">
          <h1>Concrete Dreams Fade</h1>
          <p class="death-subtitle">
            Even permanence yields to time.<br>
            Your form dissolves back to dust.<br>
            The cycle begins anew.
          </p>
        </div>
        
        <!-- Game Over Stats -->
        <div class="death-stats" v-if="gameStats">
          <div class="stat-item">
            <span class="stat-label">Plants destroyed:</span>
            <span class="stat-value">{{ gameStats.plantsDestroyed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Aalto buildings found:</span>
            <span class="stat-value">{{ gameStats.discoveredAalto }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Time endured:</span>
            <span class="stat-value">{{ gameStats.survivalTime }}</span>
          </div>
        </div>
        
        <!-- Restart Button -->
        <div class="restart-section">
          <button @click="restartGame" class="restart-button">
            Return to the Beginning
          </button>
          <p class="restart-hint">
            Press ENTER or click to start anew
          </p>
        </div>
        
        <!-- Philosophy -->
        <div class="death-philosophy">
          <p class="philosophy-text">
            "The architect builds not for permanence,<br>
            but for the beauty of collapse into memory."
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface DeathScreenProps {
  plantsDestroyed: number
  discoveredAalto: number
  survivalTime: string
}

const props = defineProps<DeathScreenProps>()

const emit = defineEmits<{
  restart: []
}>()

const audioRef = ref<HTMLAudioElement>()
const audioPlaying = ref(false)

// Load and play start theme music
const loadStartThemeMusic = async () => {
  try {
    const audioModule = await import('@/assets/start_theme.mp3')
    const audioSrc = typeof audioModule.default === 'string' 
      ? audioModule.default 
      : typeof audioModule === 'string' 
        ? audioModule 
        : ''
    
    if (audioSrc) {
      const audio = new Audio(audioSrc)
      audio.loop = true
      audio.volume = 0.3 // Lower volume for death screen atmosphere
      audioRef.value = audio
      
      // Attempt to play audio
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audioPlaying.value = true
            console.log('Death screen music started')
          })
          .catch((error) => {
            console.warn('Failed to play death screen music:', error)
          })
      }
    }
  } catch (error) {
    console.warn('Failed to load death screen music:', error)
  }
}

// Handle enter key to restart
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.code === 'Enter') {
    event.preventDefault()
    restartGame()
  }
}

const restartGame = () => {
  // Stop music before restarting
  if (audioRef.value) {
    audioRef.value.pause()
  }
  // Refresh the entire page to restart the game
  window.location.reload()
}

// Computed stats object
const gameStats = computed(() => ({
  plantsDestroyed: props.plantsDestroyed,
  discoveredAalto: props.discoveredAalto,
  survivalTime: props.survivalTime
}))

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
  loadStartThemeMusic()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value = undefined
  }
})
</script>

<style scoped>
.death-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000000;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.death-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.death-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.death-image {
  width: 100%;
  height: 100%;
  object-fit: cover !important;
  object-position: center;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 30%,
    rgba(0, 0, 0, 0.4) 70%,
    rgba(0, 0, 0, 0.8) 100%
  );
}

.death-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #FFFFFF;
  max-width: 800px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
}

.death-title {
  animation: fadeInUp 1.5s ease-out;
}

.death-title h1 {
  margin: 0 0 20px 0;
  font-family: 'Courier New', monospace;
  font-size: 2.5rem;
  font-weight: bold;
  color: #CCCCCC;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
}

.death-subtitle {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  line-height: 1.6;
  color: #AAAAAA;
  font-style: italic;
}

.death-stats {
  animation: fadeInUp 2s ease-out;
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid #444444;
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 300px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #333333;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #BBBBBB;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.stat-value {
  color: #8B4513;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1rem;
}

.restart-section {
  animation: fadeInUp 2.5s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.restart-button {
  background: linear-gradient(145deg, #3A2A1A, #4A3A2A);
  border: 2px solid #666666;
  color: #FFFFFF;
  padding: 18px 36px;
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

.restart-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(139, 69, 19, 0.4), transparent);
  transition: left 0.8s ease;
}

.restart-button:hover::before {
  left: 100%;
}

.restart-button:hover {
  background: linear-gradient(145deg, #4A3A2A, #5A4A3A);
  border-color: #8B4513;
  color: #FFD700;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.3);
}

.restart-button:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.restart-hint {
  margin: 0;
  color: #888888;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  opacity: 0.8;
}

.death-philosophy {
  animation: fadeInUp 3s ease-out;
  margin-top: 20px;
}

.philosophy-text {
  margin: 0;
  color: #999999;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  font-style: italic;
  line-height: 1.5;
  opacity: 0.9;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .death-content {
    padding: 20px;
  }
  
  .death-title h1 {
    font-size: 2rem;
  }
  
  .death-stats {
    min-width: 280px;
  }
  
  .restart-button {
    padding: 14px 28px;
    font-size: 1rem;
  }
}
</style>
