<script setup lang="ts">
import ConcreteGrace from '@/components/ConcreteGrace.vue'
</script>

<template>
  <div id="app">
    <ConcreteGrace />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Courier New', monospace;
  background: #2F2F2F;
  color: #CCCCCC;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
