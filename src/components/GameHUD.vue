<template>
  <div class="game-hud">
    <div class="health-bar">
      <div class="health-fill" :style="{ 
        width: `${(playerHealth / maxHealth) * 100}%`,
        background: playerHealth <= 20 ? '#FF0000' : 
                   playerHealth <= 50 ? '#FF8000' : '#00FF00'
      }"></div>
      <span>{{ playerHealth }}/{{ maxHealth }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  playerHealth: number
  maxHealth: number
}>()
</script>

<style scoped>
.game-hud {
  display: flex;
  align-items: center;
  pointer-events: none;
}

.health-bar {
  background: #333333;
  border: 2px solid #666666;
  height: 20px;
  width: 200px;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.health-bar span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}
</style>
