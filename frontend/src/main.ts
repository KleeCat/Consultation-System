import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { buildWebRouter } from './router'

const app = createApp(App)

app.use(createPinia())
app.use(buildWebRouter())
app.mount('#app')
