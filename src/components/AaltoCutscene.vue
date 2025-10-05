<template>
  <div class="cutscene-overlay">
    <div class="cutscene-container">
      <!-- Background with dimming animation -->
      <div 
        class="cutscene-background" 
        :class="{ 'dimmed': isDimmed, 'fade-in': showAnimation }"
      >
        <img 
          src="@/assets/cutscenes/architect.png" 
          alt="The Architect" 
          class="architect-image"
        />
      </div>
      
      <!-- Dialogue Box -->
      <div class="dialogue-container" :class="{ 'fade-in': showDialogue }">
        <!-- Current Dialogue Entry -->
        <div class="dialogue-box" v-if="currentDialogue">
          <div class="dialogue-entry">
            <div class="speaker-name" :class="currentDialogue.speaker.toLowerCase().replace(/[^a-z]/g, '-')">
              {{ currentDialogue.speaker }}
            </div>
            <div class="dialogue-text">{{ currentDialogue.text }}</div>
            
            <!-- Continue prompts integrated with dialogue -->
            <div class="continue-prompts">
              <p v-if="!isFinished" class="next-prompt">
                Press <strong>SPACE</strong> to continue...
              </p>
              <button v-if="isFinished" @click="completeCutscene" class="continue-button flicker">
                Continue to World
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'

interface DialogueEntry {
  id: string
  speaker: string
  text: string
}

const emit = defineEmits<{
  complete: []
}>()

const isDimmed = ref(false)
const showAnimation = ref(false)
const showDialogue = ref(false)
const currentIndex = ref(0)
const architectAudio = ref<HTMLAudioElement | null>(null)

const isFinished = computed(() => currentIndex.value >= dialogueEntries.length - 1)

const currentDialogue = computed(() => {
  if (currentIndex.value >= 0 && currentIndex.value < dialogueEntries.length) {
    return dialogueEntries[currentIndex.value]
  }
  return null
})

const dialogueEntries: DialogueEntry[] = [
  {
    id: 'architect-1',
    speaker: 'ARCHITECT',
    text: 'You came back.\nEven concrete remembers its maker.'
  },
  {
    id: 'player-1',
    speaker: 'PLAYER',
    text: 'What is this place?'
  },
  {
    id: 'architect-2',
    speaker: 'ARCHITECT',
    text: 'A building that refused to die.\nA curve inside a straight world.'
  },
  {
    id: 'player-2',
    speaker: 'PLAYER',
    text: 'It feels... alive.'
  },
  {
    id: 'architect-3',
    speaker: 'ARCHITECT',
    text: 'Once, it was.\nYou built it to feel something. Then you built walls around the feeling.'
  },
  {
    id: 'player-3',
    speaker: 'PLAYER',
    text: 'The world outside—why is it all grey?'
  },
  {
    id: 'architect-4',
    speaker: 'ARCHITECT',
    text: 'You traded warmth for permanence.\nYou called it progress.\nYou called it home.'
  },
  {
    id: 'player-4',
    speaker: 'PLAYER',
    text: 'There were green things. I ate them.'
  },
  {
    id: 'architect-5',
    speaker: 'ARCHITECT',
    text: 'Of course.\nLife was always a loan. You spent it.'
  },
  {
    id: 'player-5',
    speaker: 'PLAYER',
    text: 'Can it be restored?'
  },
  {
    id: 'architect-6',
    speaker: 'ARCHITECT',
    text: 'Restoration is a myth.\nWe only rebuild ruins into quieter ruins.'
  },
  {
    id: 'player-6',
    speaker: 'PLAYER',
    text: 'Then what am I supposed to do?'
  },
  {
    id: 'architect-7',
    speaker: 'ARCHITECT',
    text: 'Walk.\nEndure what you made.\nEven architects must live in their buildings.'
  },
  {
    id: 'architect-final',
    speaker: 'ARCHITECT (fading)',
    text: 'Concrete dreams of forests. But it only wakes as dust.'
  }
]

// Handle spacebar to advance dialogue
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    event.preventDefault()
    nextDialogue()
  }
}

const nextDialogue = () => {
  if (currentIndex.value < dialogueEntries.length - 1) {
    currentIndex.value++
    
    // Start dimming effect partway through dialogue
    if (currentIndex.value === Math.floor(dialogueEntries.length / 3)) {
      isDimmed.value = true
    }
  }
}

// Initialize architect music
const initArchitectMusic = async () => {
  try {
  const audioModule = await import('@/assets/architect_music.mp3')
  const audioSrc = typeof audioModule.default === 'string' 
    ? audioModule.default 
    : typeof audioModule === 'string' 
      ? audioModule 
      : ''
  
  if (audioSrc) {
    architectAudio.value = new Audio(audioSrc)
    architectAudio.value.loop = true
    architectAudio.value.volume = 0.3 // Moderate volume for dialogue music
    
    // Start architect music
    try {
      await architectAudio.value.play()
      console.log('Architect music started')
    } catch (error) {
      console.log('Architect audio autoplay prevented')
    }
  }
} catch (error) {
  console.warn('Failed to load architect music:', error)
  }
}

const completeCutscene = () => {
  // Stop architect music when exiting
  if (architectAudio.value) {
    architectAudio.value.pause()
    architectAudio.value = null
  }
  emit('complete')
}

onMounted(async () => {
  await nextTick()
  
  // Add key event listener
  window.addEventListener('keydown', handleKeyPress)
  
  // Initialize architect music
  await initArchitectMusic()
  
  // Start animations
  setTimeout(() => {
    showAnimation.value = true
  }, 100)
  
  // Show dialogue after brief delay
  setTimeout(() => {
    showDialogue.value = true
  }, 800)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  
  // Cleanup architect music on unmount if still playing
  if (architectAudio.value) {
    architectAudio.value.pause()
    architectAudio.value = null
  }
})
</script>

<style scoped>
.cutscene-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000000;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cutscene-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cutscene-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 2s ease-in-out;
}

.cutscene-background.fade-in {
  opacity: 1;
}

.cutscene-background.dimmed {
  opacity: 0.6;
}

.architect-image {
  width: 100%;
  height: 100%;
  object-fit: cover !important;
  object-position: center;
}

.dialogue-container {
  position: relative;
  background: rgba(26, 26, 26, 0.95);
  border: 2px solid #666666;
  border-radius: 12px;
  max-width: 800px;
  max-height: 500px;
  width: 90%;
  padding: 0;
  opacity: 0;
  transform: translateY(20px);
  transition: all 1s ease-in-out;
  backdrop-filter: blur(10px);
}

.dialogue-container.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.dialogue-box {
  padding: 24px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialogue-entry {
  width: 100%;
  animation: fadeInSlide 0.8s ease-in-out;
}

@keyframes fadeInSlide {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.speaker-name {
  font-weight: bold;
  margin-bottom: 12px;
  font-family: 'Courier New', monospace;
  font-size: 1em;
}

.speaker-name.architect {
  color: #8B4513;
}

.speaker-name.player {
  color: #CCCCCC;
}

.speaker-name.architect-fading {
  color: #654321;
  opacity: 0.8;
}

.dialogue-text {
  color: #E0E0E0;
  line-height: 1.6;
  white-space: pre-line;
  font-size: 1em;
}

.continue-prompts {
  margin-top: 20px;
  text-align: center;
}

.next-prompt {
  margin: 0;
  color: #888888;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.next-prompt strong {
  color: #FFD700;
  font-size: 1.1em;
}

.continue-button {
  background: #2A2A2A;
  border: 2px solid #666666;
  color: #CCCCCC;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.2s;
}

.continue-button:hover {
  background: #3A3A3A;
  border-color: #888888;
  color: #FFFFFF;
  transform: translateY(-1px);
}

.flicker {
  animation: flicker 1.5s infinite ease-in-out;
}

@keyframes flicker {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
  }
}
</style>