import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaSharedState } from './plugin/plugin'
import App from './App.vue'

const app = createApp(App)

const pinia = createPinia()
pinia.use(PiniaSharedState())

app.use(pinia)

app.mount('#app')
