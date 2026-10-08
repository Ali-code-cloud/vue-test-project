import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { prefetchAppData } from './services/prefetch'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Load and cache the common API data (categories, cities, services, reviews...) in the background
prefetchAppData()
