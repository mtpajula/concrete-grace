<template>
  <div ref="gameContainer" class="concrete-grace">
    <!-- Game Content (hidden when start screen is shown) -->
    <template v-if="!showStartScreen">
      <div v-if="!gameStore.gameState.structures.size" class="loading">
        Generating concrete world...
      </div>

      <!-- Game Canvas -->
      <canvas ref="gameCanvas" class="game-canvas"></canvas>

      <!-- UI Components -->
      <div class="game-ui">
        <GameHUD 
          :playerHealth="gameStore.gameState.playerHealth"
          :maxHealth="gameStore.gameState.maxHealth"
        />
      </div>

      <!-- Message System -->
      <GameMessages ref="messagesRef" />

      <!-- Dialogue System -->
      <GameDialogue 
        v-if="showDialogue" 
        :options="dialogueOptions"
        :recentDialogue="recentDialogue"
        @optionSelected="selectDialogueOption"
        @close="closeDialogue"
      />

      <!-- Debug Dialog -->
      <DebugDialog 
        :is-visible="showDebug"
        @toggle-debug="toggleDebug" 
      />
    </template>

    <!-- Start Screen -->
    <StartScreen 
      v-if="showStartScreen"
      @enter-game="enterGame"
    />

    <!-- Death Screen -->
    <DeathScreen 
      v-if="showDeathScreen"
      :plants-destroyed="gameStore.gameState.plantsEaten"
      :discovered-aalto="gameStore.gameState.discoveredAaltoBuildings.size"
      :survival-time="formatSurvivalTime()"
    />

    <!-- Aalto Cutscene -->
    <AaltoCutscene 
      v-if="showCutscene"
      @complete="completeAaltoCutscene"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useConcreteGraceStore } from '@/stores/concrete-grace'
import { GameRenderer, type RenderConfig } from '@/renderers/game-renderer'
import { GameInputHandler, type ExtendedInputCallbacks } from '@/input/game-input'
import { hexDirections } from '@/utils/hex-grid'
import { dialogueService, type DialogueEntry, type DialogueOption } from '@/services/dialogue-service'
import { MusicPlayerService } from '@/services/music-player'
import GameHUD from './GameHUD.vue'
import GameMessages from './GameMessages.vue'
import GameDialogue from './GameDialogue.vue'
import DebugDialog from './DebugDialog.vue'
import AaltoCutscene from './AaltoCutscene.vue'
import StartScreen from './StartScreen.vue'
import DeathScreen from './DeathScreen.vue'

const gameStore = useConcreteGraceStore()
const gameContainer = ref<HTMLDivElement>()
const gameCanvas = ref<HTMLCanvasElement>()
const messagesRef = ref<InstanceType<typeof GameMessages>>()

let gameRenderer: GameRenderer | null = null
let inputHandler: GameInputHandler | null = null

// Game settings
const TILE_SIZE = 24
const RENDER_RADIUS = 12 // Increased from 8 to show more cells

// Circular render area parameters - adjust these to fine-tune the shape
const CIRCULAR_PARAMS = {
  horizontalRadius: 12,    // Horizontal render radius
  verticalRadius: 12,      // Vertical render radius (increase for more up/down)
  verticalStretch: 1.0,    // Vertical stretch factor (1.0 = perfect circle, >1.0 = more vertical)
}

// Helper function to get current world data for rendering
function getCurrentWorldData() {
  const { q, r } = gameStore.gameState.playerPosition
  return {
    cells: Array.from(gameStore.worldGenerator.getCells().values()).filter(cell => {
      // Use configurable circular render area
      const deltaQ = cell.position.q - q
      const deltaR = cell.position.r - r
      
      // Apply vertical stretch factor
      const adjustedDeltaQ = deltaQ
      const adjustedDeltaR = deltaR * CIRCULAR_PARAMS.verticalStretch
      
      // Calculate elliptical distance using configurable radii
      const normalizedQ = adjustedDeltaQ / CIRCULAR_PARAMS.horizontalRadius
      const normalizedR = adjustedDeltaR / CIRCULAR_PARAMS.verticalRadius
      
      // Perfect circular distance calculation
      const circularDistance = Math.sqrt(normalizedQ * normalizedQ + normalizedR * normalizedR)
      
      return circularDistance <= 1.0
    }),
    playerPosition: gameStore.gameState.playerPosition,
    plantsDestroyed: gameStore.plantsDestroyed
  }
}

// Dialogue state
const showDialogue = ref(false)
const dialogueOptions = ref<DialogueOption[]>([])
const recentDialogue = ref<DialogueEntry[]>([])

// Debug state
const showDebug = ref(false)

// Cutscene state
const showCutscene = ref(false)

// Start screen state
const showStartScreen = ref(true)

// Death screen state
const showDeathScreen = ref(false)

// Game session tracking
const gameStartTime = ref<Date | null>(null)

// Game audio - using centralized service
const musicPlayer = MusicPlayerService.getInstance()

// Initialize game systems
async function initGame() {
  if (!gameCanvas.value) return

  // Only initialize if not on start screen
  if (showStartScreen.value) return

  gameStore.initWorld()
  resizeCanvas()
  
  await initRenderer()
  initInputHandler()
  
  startGameLoop()
  
  // Generate chunks periodically
  setInterval(generateNearbyChunks, 2000)
}

async function initRenderer() {
  if (!gameCanvas.value) return
  
  const config: RenderConfig = {
    tileSize: TILE_SIZE,
    canvasWidth: gameCanvas.value.width,
    canvasHeight: gameCanvas.value.height
  }
  
  gameRenderer = new GameRenderer(config)
  
  const ctx = gameCanvas.value.getContext('2d')
  if (ctx) {
    const worldData = getCurrentWorldData()
    await gameRenderer.render(ctx, worldData.cells, worldData.playerPosition, worldData.plantsDestroyed)
  }
}

function initInputHandler() {
  const callbacks: ExtendedInputCallbacks = {
    movePlayer: handlePlayerMove,
    consumePlant: handlePlantConsumption,
    interactWithAalto: handleAaltoInteraction,
    toggleDebug: toggleDebug,
    debugPlayerPosition: gameStore.debugPlayerPosition,
    cleanupDepletedPlants: gameStore.cleanupDepletedPlants,
    generateNearbyChunks,
    moveToHex: handleMouseMoveToHex,
    showMessage: showMessage
  }
  
  inputHandler = new GameInputHandler(callbacks, TILE_SIZE)
  if (gameCanvas.value) {
    inputHandler.setCanvas(gameCanvas.value)
  }
}

function startGameLoop() {
  const gameLoop = async () => {
    if (gameRenderer && gameCanvas.value) {
      const ctx = gameCanvas.value.getContext('2d')
      if (ctx) {
        const worldData = getCurrentWorldData()
        await gameRenderer.render(ctx, worldData.cells, worldData.playerPosition, worldData.plantsDestroyed)
      }
    }
    requestAnimationFrame(gameLoop)
  }
  requestAnimationFrame(gameLoop)
}

function resizeCanvas() {
  if (!gameCanvas.value || !gameContainer.value) return

  const rect = gameContainer.value.getBoundingClientRect()
  gameCanvas.value.width = rect.width
  gameCanvas.value.height = rect.height
  
  if (gameRenderer) {
    gameRenderer.updateConfig({
      tileSize: TILE_SIZE,
      canvasWidth: gameCanvas.value.width,
      canvasHeight: gameCanvas.value.height
    })
  }
}

function generateNearbyChunks() {
  const { q, r } = gameStore.gameState.playerPosition
  const chunkQ = Math.floor(q / gameStore.CHUNK_SIZE)
  const chunkR = Math.floor(r / gameStore.CHUNK_SIZE)

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      gameStore.generateChunk(chunkQ + dx, chunkR + dy)
    }
  }
}

// Game actions
function handlePlantConsumption() {
  const { q, r } = gameStore.gameState.playerPosition
  const cell = gameStore.getCellAt(q, r)

  if (cell?.type === 'aalto') {
    // Pause game music when entering architect scene
    musicPlayer.stopBackgroundMusic()
    
    // Enter Aalto building cutscene
    showCutscene.value = true
  } else if (cell?.type === 'plant') {
    const consumed = gameStore.consumePlantAtPosition(q, r)
    if (consumed) {
      // Play eating sound effect
      musicPlayer.playSoundEffect('eating')
      showMessage(`🌱 Plant consumed! Health +10. Plants destroyed: ${gameStore.plantsDestroyed}`)
    }
  } else {
    showMessage(`❌ No consumable plant or entrance here`)
  }
}

function handleAaltoInteraction() {
  const cell = gameStore.getCellAt(
    gameStore.gameState.playerPosition.q,
    gameStore.gameState.playerPosition.r
  )

  if (cell && cell.type === 'aalto') {
    startAaltoDialogue(cell.id)
  }
}

function handleMouseMoveToHex(q: number, r: number) {
  const playerQ = gameStore.gameState.playerPosition.q
  const playerR = gameStore.gameState.playerPosition.r
  
  const distance = Math.abs(q - playerQ) + Math.abs(r - playerR) + Math.abs(q - playerQ + r - playerR)
  
  if (distance <= 1) {
    const deltaQ = q - playerQ
    const deltaR = r - playerR
    
    // Find matching hex direction and move
    const directionIndex = hexDirections.findIndex(dir => dir.q === deltaQ && dir.r === deltaR)
    
    if (directionIndex !== -1) {
      const moved = gameStore.movePlayer(directionIndex)
      if (moved) {
        generateNearbyChunks()
      }
    }
  }
}

function showMessage(message: string) {
  messagesRef.value?.showMessage(message)
}

function toggleDebug() {
  showDebug.value = !showDebug.value
}


function enterGame() {
  showStartScreen.value = false
  gameStartTime.value = new Date() // Start timing the session
  // Initialize game after hiding start screen
  nextTick(async () => {
    initGame()
    await musicPlayer.loadAllAudio() // Load all audio assets
    musicPlayer.playBackgroundMusic() // Start game music
  })
}

function handlePlayerMove(direction: number) {
  const result = gameStore.movePlayer(direction)
  
  // Start game music on first user interaction
  musicPlayer.playBackgroundMusic()
  
  // Play stool sound if stepping on Aalto stool
  if (result.message && result.message.includes('stool')) {
    musicPlayer.playSoundEffect('stool')
  }
  
  // Show movement message if available
  if (result.message) {
    showMessage(result.message)
  }
  
  // Check if player should die (health <= 0)
  if (gameStore.gameState.playerHealth <= 0) {
    showDeathScreen.value = true
    musicPlayer.stopBackgroundMusic()
    return result
  }
  
  return result
}

function formatSurvivalTime(): string {
  if (!gameStartTime.value) return "0 min"
  
  const now = new Date()
  const diffMs = now.getTime() - gameStartTime.value.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffSecs = Math.floor((diffMs % 60000) / 1000)
  
  return `${diffMins}m ${diffSecs}s`
}

function completeAaltoCutscene() {
  showCutscene.value = false
  
  // Resume game music when returning to the world
  musicPlayer.playBackgroundMusic()
  
  showMessage('🏛️ You return to the endless world...')
}

// Dialogue system using service
function startAaltoDialogue(buildingId: string) {
  showDialogue.value = true
  const dialogue = dialogueService.initializeDialogue(buildingId)
  dialogueOptions.value = dialogue.options
  recentDialogue.value = dialogue.recentDialogue
}

function selectDialogueOption(option: DialogueOption) {
  recentDialogue.value = dialogueService.selectOption(option, recentDialogue.value)
  dialogueOptions.value = []
}

function closeDialogue() {
  showDialogue.value = false
  const closedDialogue = dialogueService.closeDialogue()
  dialogueOptions.value = closedDialogue.options
  recentDialogue.value = closedDialogue.recentDialogue
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  window.addEventListener('resize', resizeCanvas)
  initGame()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  inputHandler?.cleanup()
  musicPlayer.stopBackgroundMusic()
})
</script>

<style scoped>
.concrete-grace {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(to bottom, #1A1A1A 0%, #2F2F2F 50%, #1A1A1A 100%);
  font-family: 'Courier New', monospace;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  color: #CCCCCC;
}

.game-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}

.game-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}
</style>
