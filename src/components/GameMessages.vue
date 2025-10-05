<template>
  <Transition name="message">
    <div v-if="currentMessage" class="game-message">
      {{ currentMessage }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const currentMessage = ref<string>('')

const showMessage = (message: string) => {
  currentMessage.value = message
  setTimeout(() => {
    currentMessage.value = ''
  }, 2000)
}

defineExpose({ showMessage })
</script>

<style scoped>
.game-message {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 15px 25px;
  border-radius: 8px;
  z-index: 9999;
  font-family: 'Courier New', monospace;
  pointer-events: none;
  font-size: 16px;
  font-weight: bold;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.message-enter-active, .message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from, .message-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
