import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import './assets/patient-theme.css'
import { buildWebRouter } from './router'

const app = createApp(App)
const router = buildWebRouter()

const syncPatientTheme = (path: string) => {
  if (typeof document === 'undefined') {
    return
  }

  if (path.startsWith('/patient')) {
    document.body.dataset.appSurface = 'patient'
    return
  }

  delete document.body.dataset.appSurface
}

if (typeof window !== 'undefined') {
  syncPatientTheme(window.location.pathname)
}

router.afterEach((to) => {
  syncPatientTheme(to.path)
})

app.use(createPinia())
app.use(router)
app.mount('#app')
