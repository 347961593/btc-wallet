import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { Buffer } from 'buffer'

// 设置全局 Buffer
window.Buffer = Buffer
window.global = window

createApp(App).mount('#app')
