import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useTheme } from './composables/useTheme'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 初始化主题（从 localStorage 恢复）
useTheme()

app.mount('#root')
