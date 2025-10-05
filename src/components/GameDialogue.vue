<template>
  <div class="dialogue-overlay">
    <div class="dialogue-box">
      <div class="dialogue-content">
        <div v-for="entry in recentDialogue" :key="entry.id" class="dialogue-entry" :class="entry.speaker">
          <div class="speaker-name">{{ entry.speaker === 'architect' ? 'Isometric Architect' : 'You' }}</div>
          <div class="dialogue-text">{{ entry.text }}</div>
        </div>
      </div>
      <div class="dialogue-options" v-if="options.length > 0">
        <button
          v-for="(option, index) in options"
          :key="index"
          @click="$emit('optionSelected', option)"
          class="dialogue-option"
        >
          {{ option.text }}
        </button>
      </div>
      <button v-else @click="$emit('close')" class="dialogue-close">Continue</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: Array<{ text: string; response: string }>
  recentDialogue: Array<{ id: string; speaker: 'player' | 'architect'; text: string }>
}>()

defineEmits<{
  optionSelected: [option: { text: string; response: string }]
  close: []
}>()
</script>

<style scoped>
.dialogue-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialogue-box {
  background: #1A1A1A;
  border: 2px solid #666666;
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 70vh;
  overflow-y: auto;
}

.dialogue-content {
  margin-bottom: 20px;
}

.dialogue-entry {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
}

.dialogue-entry.player {
  background: rgba(255, 215, 0, 0.1);
  border-left: 4px solid #FFD700;
  margin-left: 20px;
}

.dialogue-entry.architect {
  background: rgba(102, 102, 102, 0.1);
  border-left: 4px solid #666666;
  margin-right: 20px;
}

.speaker-name {
  font-size: 0.8rem;
  color: #999999;
  margin-bottom: 4px;
  font-weight: bold;
}

.dialogue-text {
  color: #CCCCCC;
  line-height: 1.4;
}

.dialogue-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialogue-option {
  background: #333333;
  border: 1px solid #666666;
  color: #CCCCCC;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dialogue-option:hover {
  background: #444444;
  border-color: #FFD700;
}

.dialogue-close {
  background: #4A4A4A;
  border: 1px solid #666666;
  color: #CCCCCC;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
}

.dialogue-close:hover {
  background: #555555;
}
</style>
