<template>
  <div class="start-overlay">
    <div class="start-container">
      <!-- Background Image -->
      <div class="start-background">
        <img 
          src="@/assets/cutscenes/start.png" 
          alt="Concrete Forest" 
          class="start-image"
        />
        
        <!-- Overlay for text readability -->
        <div class="image-overlay"></div>
      </div>
      
      <!-- Start Content -->
      <div class="start-content">
        <div class="game-title">
          <h1>Concrete Grace</h1>
          <p class="subtitle">
            An journey through brutalist ruins
          </p>
        </div>
        
        <!-- Audio Control -->
        <div v-if="audioBlocked" class="audio-control">
          <button @click="enableAudio" class="audio-button">
            🔊 Enable Audio
          </button>
          <p class="audio-hint">
            Click to enable atmospheric music
          </p>
        </div>

        <!-- Enter Button -->
        <div class="enter-section">
          <button @click="startMusicAndEnterGame" class="enter-button">
            Enter the Concrete Forest
          </button>
          <p class="enter-hint">
            Press ENTER or click to begin your descent
          </p>
        </div>
    
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  enterGame: []
}>()

const audioRef = ref<HTMLAudioElement>()
const audioBlocked = ref(false)
const audioPlaying = ref(false)

// Function to enable and start audio
const enableAudio = async () => {
  if (audioRef.value && audioRef.value.paused) {
    try {
      await audioRef.value.play()
      audioPlaying.value = true
      audioBlocked.value = false
      console.log('Audio enabled and playing')
    } catch (error) {
      console.error('Failed to play audio:', error)
      audioBlocked.value = true
    }
  }
}

// Function to start music when user interacts
const startMusicAndEnterGame = () => {
  // Start music if it hasn't started yet
  if (audioRef.value && audioRef.value.paused && !audioPlaying.value) {
    enableAudio()
  }
  
  // Enter game
  enterGame()
}

// Handle enter key to start game
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.code === 'Enter') {
    event.preventDefault()
    
    // Start music if it hasn't started yet
    if (audioRef.value && audioRef.value.paused && !audioPlaying.value) {
      enableAudio()
    }
    
    enterGame()
  }
}

const enterGame = () => {
  // Fade out music before entering game
  if (audioRef.value) {
    const fadeOutInterval = setInterval(() => {
      if (audioRef.value && audioRef.value.volume > 0) {
        audioRef.value.volume = Math.max(0, audioRef.value.volume - 0.05)
      } else {
        clearInterval(fadeOutInterval)
        audioRef.value?.pause()
      }
    }, 50)
  }
  
  emit('enterGame')
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyPress)
  
  // Initialize audio with Vite asset handling
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
      audio.volume = 0.3 // Start at low volume
      audioRef.value = audio
      
      // Attempt to play audio (may require user interaction)
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audioPlaying.value = true
            console.log('Audio autoplay succeeded')
          })
          .catch(() => {
            audioBlocked.value = true
            console.log('Audio autoplay was prevented. Enable Audio button shown.')
          })
      }
      
      console.log('Start theme loaded successfully')
    }
  } catch (error) {
    console.warn('Failed to load start theme:', error)
  }
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
.start-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000000;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.start-image {
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
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.2) 70%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.start-content {
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
  gap: 40px;
}

.game-title {
  animation: fadeInUp 1.5s ease-out;
}

.game-title h1 {
  transition: all 0.5s ease-in-out;
  margin: 0 0 20px 0;
  font-family: 'Courier New', monospace;
  font-size: 3.5rem;
  font-weight: bold;
  color: #CCCCCC;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  letter-spacing: 2px;
}

.game-title h1:hover {
  color: #FFD700;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

.subtitle {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #BBBBBB;
  font-style: italic;
  max-width: 500px;
}

.audio-control {
  animation: fadeInUp 1.5s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.audio-button {
  background: linear-gradient(145deg, #3A3A2A, #4A4A3A);
  border: 2px solid #555555;
  color: #FFFFFF;
  padding: 14px 28px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.audio-button:hover {
  background: linear-gradient(145deg, #4A4A3A, #5A5A4A);
  border-color: #FFD700;
  color: #FFD700;
  transform: translateY(-2px);
  opacity: 1;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.audio-hint {
  margin: 0;
  color: #888888;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  opacity: 0.8;
  font-style: italic;
}

.enter-section {
  animation: fadeInUp 2s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.enter-button {
  background: linear-gradient(145deg, #2A2A2A, #3A3A3A);
  border: 2px solid #666666;
  color: #FFFFFF;
  padding: 20px 40px;
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1.3rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

.enter-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
  transition:左 0.6s ease;
}

.enter-button:hover::before {
  left: 100%;
}

.enter-button:hover {
  background: linear-gradient(145deg, #3A3A3A, #4A4A4A);
  border-color: #8B4513;
  color: #FFD700;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.3);
}

.enter-button:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.enter-hint {
  margin: 0;
  color: #888888;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  opacity: 0.8;
}

.game-jam-info {
  animation: fadeInUp 2.5s ease-out;
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333333;
  border-radius: 8px;
  padding: 24px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.jam-title {
  margin: 0;
  color: #8B4513;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1rem;
}

.jam-theme {
  margin: 0;
  color: #CCCCCC;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
}

.jam-diversifiers {
  margin: 0;
  color: #AAAAAA;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
}

.jam-diversifiers em {
  color: #666666;
  font-style: italic;
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
  .start-content {
    padding: 20px;
    gap: 30px;
  }
  
  .game-title h1 {
    font-size: 2.5rems;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .enter-button {
    padding: 16px 32px;
    font-size: 1.1rem;
  }
  
  .game-jam-info {
    padding: 20px;
  }
}
</style>
