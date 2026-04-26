import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { buildRouter } from './router'

const app = createApp(App)

app.use(createPinia())
app.use(buildRouter())
app.mount('#app')
