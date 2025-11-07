import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

// 全局样式
import './assets/styles/reset.less'
import './assets/styles/global.less'

// Ant Design Vue 样式
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)

// Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')
