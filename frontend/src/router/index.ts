import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'

import PatientLayout from '../layouts/PatientLayout.vue'
import { useConsultationStore } from '../stores/consultation'
import AnalyzingView from '../views/patient/AnalyzingView.vue'
import CaptureConfirmView from '../views/patient/CaptureConfirmView.vue'
import CaptureGuideView from '../views/patient/CaptureGuideView.vue'
import CaptureView from '../views/patient/CaptureView.vue'
import FinishView from '../views/patient/FinishView.vue'
import ProfileView from '../views/patient/ProfileView.vue'
import QuestionnaireView from '../views/patient/QuestionnaireView.vue'
import ResultView from '../views/patient/ResultView.vue'
import WelcomeView from '../views/patient/WelcomeView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/patient/welcome',
  },
  {
    path: '/patient',
    component: PatientLayout,
    children: [
      { path: 'welcome', component: WelcomeView },
      { path: 'profile', component: ProfileView },
      { path: 'questionnaire', component: QuestionnaireView },
      { path: 'capture-guide', component: CaptureGuideView },
      { path: 'capture', component: CaptureView },
      { path: 'capture-confirm', component: CaptureConfirmView },
      { path: 'analyzing', component: AnalyzingView },
      { path: 'result', component: ResultView },
      { path: 'finish', component: FinishView },
    ],
  },
]

export function buildRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })

  router.beforeEach((to) => {
    const store = useConsultationStore()
    if (to.path === '/patient/questionnaire' && !store.sessionId) {
      return '/patient/welcome'
    }
    return true
  })

  return router
}

export default buildRouter
