<template>
  <div class="atmospheric-overlay">
    <div class="atmospheric-container">
      <!-- Background Image -->
      <div class="atmospheric-background">
        <img 
          src="@/assets/cutscenes/start_scene.png" 
          alt="Brutalist Labyrinth" 
          class="atmospheric-image"
        />
        
        <!-- Overlay for text readability -->
        <div class="image-overlay"></div>
      </div>
      
      <!-- Atmospheric Text -->
      <div class="atmospheric-content">
        <div class="atmospheric-text">
          <p class="text-line-1">{{ textLine1 }}</p>
          <p class="text-line-2">{{ textLine2 }}</p>
        </div>
        
        <!-- Continue Button -->
        <div class="continue-section">
          <button @click="continueToGame" class="continue-button">
            Continue
          </button>
          <p class="continue-hint">
            Press ENTER or click to continue
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  complete: []
}>()

const textLine1 = ref('')
const textLine2 = ref('')
const fullText1 = 'The air hums with the weight of purpose long forgotten.'
const fullText2 = 'Somewhere beyond the walls, a curve still remembers softness.'

const audioRef = ref<HTMLAudioElement>()
const audioPlaying = ref(false)

// Typewriter effect
const typeText = async (text: string, target: any, delay: number = 50) => {
  for (let i = 0; i <= text.length; i++) {
    target.value = text.slice(0, i)
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

// Load and play cutscene music
const loadCutsceneMusic = async () => {
  try {
    const audioModule = await import('@/assets/start_cutscene.mp3')
    const audioSrc = typeof audioModule.default === 'string' 
      ? audioModule.default 
      : typeof audioModule === 'string' 
        ? audioModule 
        : ''
    
    if (audioSrc) {
      const audio = new Audio(audioSrc)
      audio.loop = true
      audio.volume = 0.4 // Moderate volume for atmospheric effect
      audioRef.value = audio
      
      // Attempt to play audio
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audioPlaying.value = true
            console.log('Cutscene music started')
          })
          .catch((error) => {
            console.warn('Failed to play cutscene music:', error)
          })
      }
    }
  } catch (error) {
    console.warn('Failed to load cutscene music:', error)
  }
}

// Start typewriter effect
const startTypewriter = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000)) // Initial delay
  await typeText(fullText1, textLine1, 80)
  await new Promise(resolve => setTimeout(resolve, 500)) // Pause between lines
  await typeText(fullText2, textLine2, 80)
}

// Handle enter key to continue
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.code === 'Enter') {
    event.preventDefault()
    continueToGame()
  }
}

const continueToGame = () => {
  // Fade out music before continuing
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
  
  emit('complete')
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
  loadCutsceneMusic()
  startTypewriter()
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
.atmospheric-overlay {
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

.atmospheric-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.atmospheric-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.atmospheric-image {
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
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 30%,
    rgba(0, 0, 0, 0.3) 70%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

.atmospheric-content {
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
  gap: 60px;
}

.atmospheric-text {
  display: flex;
  flex-direction: column;
  gap: 30px;
  animation: fadeInUp 1s ease-out;
}

.text-line-1,
.text-line-2 {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 1.4rem;
  line-height: 1.6;
  color: #CCCCCC;
  font-style: italic;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  min-height: 1.6em;
}

.text-line-1 {
  color: #DDDDDD;
}

.text-line-2 {
  color: #BBBBBB;
}

.continue-section {
  animation: fadeInUp 2s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.continue-button {
  background: linear-gradient(145deg, #2A2A2A, #3A3A3A);
  border: 2px solid #666666;
  color: #FFFFFF;
  padding: 16px 32px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
}

.continue-button:hover {
  background: linear-gradient(145deg, #3A3A3A, #4A4A4A);
  border-color: #8B4513;
  color: #FFD700;
  transform: translateY(-2px);
  opacity: 1;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.continue-hint {
  margin: 0;
  color: #888888;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  opacity: 0.8;
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
  .atmospheric-content {
    padding: 20px;
    gap: 40px;
  }
  
  .text-line-1,
  .text-line-2 {
    font-size: 1.2rem;
  }
  
  .continue-button {
    padding: 14px 28px;
    font-size: 1rem;
  }
}
</style>
