<template>
  <div v-if="isVisible" class="debug-overlay">
    <div class="debug-dialog">
      <div class="debug-header">
        <h3>🔧 Debug Tools</h3>
        <button @click="toggleDebug" class="debug-close">✕</button>
      </div>
      
      <div class="debug-content">
        <div class="debug-section">
          <h4>🌟 Aalto Building Testing</h4>
          <button 
            @click="forceAaltoBuilding" 
            class="debug-button aalto-button"
            :disabled="isForceGenerating"
          >
            {{ isForceGenerating ? 'Generating...' : '🏛️ Force Aalto Building' }}
          </button>
          <p class="debug-description">
            Generate an Aalto building at player location for dialogue testing
          </p>
        </div>
        
        <div class="debug-section">
          <h4>🌱 Plant Testing</h4>
          <button 
            @click="forcePlant" 
            class="debug-button plant-button"
            :disabled="isForceGenerating"
          >
            🌱 Force Plant
          </button>
          <p class="debug-description">
            Generate a plant at player location for consumption testing
          </p>
        </div>
        
        <div class="debug-section">
          <h4>📊 Game State</h4>
          <div class="debug-stats">
            <p><strong>Player Position:</strong> ({{ playerPosition.q }}, {{ playerPosition.r }})</p>
            <p><strong>Health:</strong> {{ playerHealth }}/{{ maxHealth }}</p>
            <p><strong>Plants Destroyed:</strong> {{ plantsDestroyed }}</p>
            <p><strong>Discovered Aalto:</strong> {{ discoveredAaltoCount }}</p>
          </div>
        </div>

        <div class="debug-section">
          <h4>⚙️ Spawn Parameters</h4>
          <div class="spawn-controls">
            <div class="spawn-control">
              <label>Aalto Building Chance:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                v-model="aaltoConfig.chance"
                @input="updateAaltoConfig"
                class="spawn-slider"
              />
              <span class="spawn-value">{{ ((aaltoConfig.chance || 0) * 100).toFixed(1) }}%</span>
            </div>
            
            <div class="spawn-control">
              <label>Max Aalto per Chunk:</label>
              <input 
                type="range" 
                min="0" 
                max="5" 
                step="1" 
                v-model="aaltoConfig.maxPerChunk"
                @input="updateAaltoConfig"
                class="spawn-slider"
              />
              <span class="spawn-value">{{ aaltoConfig.maxPerChunk || 0 }}</span>
            </div>
            
            <div class="spawn-control">
              <label>
                <input 
                  type="checkbox" 
                  v-model="aaltoConfig.requiresPath"
                  @change="updateAaltoConfig"
                />
                Requires Path
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConcreteGraceStore } from '@/stores/concrete-grace'
import { hexKey } from '@/utils/hex-grid'
import { createCell } from '@/cells/cell-registry'

const gameStore = useConcreteGraceStore()

interface DebugDialogProps {
  isVisible: boolean
}

const props = defineProps<DebugDialogProps>()

const emit = defineEmits<{
  toggleDebug: []
}>()

const isForceGenerating = computed(() => {
  // Could add loading state management here if needed
  return false
})

const playerPosition = computed(() => gameStore.gameState.playerPosition)
const playerHealth = computed(() => gameStore.gameState.playerHealth)
const maxHealth = computed(() => gameStore.gameState.maxHealth)
const plantsDestroyed = computed(() => gameStore.gameState.plantsEaten)
const discoveredAaltoCount = computed(() => gameStore.gameState.discoveredAaltoBuildings.size)

// Spawn parameters
const spawnConfigs = computed(() => gameStore.getAllSpawnConfigs())
const aaltoConfig = computed(() => gameStore.getSpawnConfig('aalto') || {})

const updateAaltoConfig = () => {
  gameStore.updateSpawnConfig('aalto', aaltoConfig.value)
}

const toggleDebug = () => {
  emit('toggleDebug')
}

const forceAaltoBuilding = () => {
  const { q, r } = gameStore.gameState.playerPosition
  
  // Use the modular cell system
  const aaltoCell = createCell('aalto', { q, r })
  const key = hexKey(q, r)
  
  // Update the modular cell system
  gameStore.worldGenerator.getCells().set(key, aaltoCell)
  
  console.log(`🔧 Debug: Forced Aalto building at (${q}, ${r})`)
}

const forcePlant = () => {
  const { q, r } = gameStore.gameState.playerPosition
  
  // Use the modular cell system
  const plantCell = createCell('plant', { q, r })
  const key = hexKey(q, r)
  
  // Update the modular cell system
  gameStore.worldGenerator.getCells().set(key, plantCell)
  
  console.log(`🔧 Debug: Forced plant at (${q}, ${r})`)
}
</script>

<style scoped>
.debug-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.debug-dialog {
  background: #1A1A1A;
  border: 2px solid #666666;
  border-radius: 12px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #333333;
  background: #222222;
}

.debug-header h3 {
  margin: 0;
  color: #FFD700;
  font-family: 'Courier New', monospace;
  font-size: 1.1em;
}

.debug-close {
  background: none;
  border: none;
  color: #666666;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.debug-close:hover {
  background: #333333;
  color: #CCCCCC;
}

.debug-content {
  padding: 20px;
}

.debug-section {
  margin-bottom: 24px;
}

.debug-section h4 {
  margin: 0 0 12px 0;
  color: #CCCCCC;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  border-bottom: 1px solid #333333;
  padding-bottom: 8px;
}

.debug-button {
  background: #2A2A2A;
  border: 2px solid #444444;
  color: #CCCCCC;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  transition: all 0.2s;
  width: 100%;
  font-size: 14px;
}

.debug-button:hover:not(:disabled) {
  background: #3A3A3A;
  border-color: #666666;
  transform: translateY(-1px);
}

.debug-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.aalto-button {
  border-color: #8B4513;
}

.aalto-button:hover:not(:disabled) {
  border-color: #8B4513;
  background: #3A2515;
}

.plant-button:hover:not(:disabled) {
  border-color: #228B22;
  background: #1A3A1A;
}

.debug-description {
  margin: 8px 0 0 0;
  color: #999999;
  font-size: 0.8em;
  font-style: italic;
  line-height: 1.3;
}

.debug-stats {
  background: #1E1E1E;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #333333;
}

.debug-stats p {
  margin: 4px 0;
  color: #CCCCCC;
  font-size: 0.85em;
  font-family: 'Courier New', monospace;
}

.debug-stats strong {
  color: #FFD700;
}

.spawn-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spawn-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spawn-control label {
  min-width: 140px;
  font-size: 12px;
  color: #CCCCCC;
}

.spawn-slider {
  flex: 1;
  height: 4px;
  background: #333333;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.spawn-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #666666;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #999999;
}

.spawn-slider::-webkit-slider-thumb:hover {
  background: #888888;
  border-color: #BBBBBB;
}

.spawn-value {
  min-width: 40px;
  text-align: right;
  font-size: 12px;
  color: #999999;
  font-family: monospace;
}

.spawn-control input[type="checkbox"] {
  margin-right: 6px;
}
</style>
