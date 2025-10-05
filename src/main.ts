import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { registerGameAssets } from '@/assets/asset-registry'

// Register all game assets
registerGameAssets()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
