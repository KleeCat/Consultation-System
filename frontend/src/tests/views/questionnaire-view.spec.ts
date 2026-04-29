import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getQuestionnaireTemplate, submitQuestionnaire } from '../../api/consultation'
import { useConsultationStore } from '../../stores/consultation'
import QuestionnaireView from '../../views/patient/QuestionnaireView.vue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

vi.mock('../../api/consultation', () => ({
  getQuestionnaireTemplate: vi.fn(),
  submitQuestionnaire: vi.fn(),
}))

const template = {
  questionnaire_code: 'tcm_constitution_questionnaire',
  version: 'v1',
  title: '中医问诊问卷',
  description: '请根据最近两周的真实感受完成作答。',
  groups: [
    {
      group_code: 'body_sensation',
      group_title: '体感与寒热',
      group_description: '先了解近期精力、寒热与身体轻重感。',
    },
    {
      group_code: 'emotion_lifestyle',
      group_title: '情绪压力与生活习惯',
      group_description: '最后了解近期情绪、压力与作息活动状态。',
    },
  ],
  questions: [
    {
      question_code: 'fatigue_level',
      group_code: 'body_sensation',
      question_text: '最近精力状态怎么样？',
      required: true,
      question_type: 'single_choice' as const,
      options: [
        { value: 'energetic', label: '精力充足' },
        { value: 'afternoon_tired', label: '下午容易乏力' },
      ],
    },
    {
      question_code: 'emotion_state',
      group_code: 'emotion_lifestyle',
      question_text: '最近情绪状态更接近哪种？',
      required: true,
      question_type: 'single_choice' as const,
      options: [
        { value: 'stable', label: '比较平稳' },
        { value: 'often_depressed', label: '经常压抑或心情不舒' },
      ],
    },
  ],
}

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useConsultationStore()
  store.sessionId = 9

  return {
    store,
    wrapper: mount(QuestionnaireView, {
      global: {
        plugins: [pinia],
      },
    }),
  }
}

describe('questionnaire view', () => {
  beforeEach(() => {
    push.mockReset()
    vi.mocked(getQuestionnaireTemplate).mockReset()
    vi.mocked(submitQuestionnaire).mockReset()
  })

  it('renders questionnaire inside the shared shell when the template loads', async () => {
    vi.mocked(getQuestionnaireTemplate).mockResolvedValue(template)

    const { wrapper } = mountView()

    await flushPromises()

    expect(getQuestionnaireTemplate).toHaveBeenCalled()
    expect(wrapper.find('.patient-page-shell').exists()).toBe(true)
    expect(wrapper.text()).toContain('体质问答')
    expect(wrapper.text()).toContain('根据最近两周的真实感受完成作答')
    expect(wrapper.text()).toContain('体感与寒热')
    expect(wrapper.text()).toContain('最近精力状态怎么样？')
    expect(wrapper.text()).toContain('精力充足')
  })

  it('blocks next group when required answers are missing', async () => {
    vi.mocked(getQuestionnaireTemplate).mockResolvedValue(template)

    const { wrapper } = mountView()

    await flushPromises()
    await wrapper.get('[data-testid="next-group"]').trigger('click')

    expect(wrapper.text()).toContain('请先完成当前分组的必答题')
    expect(wrapper.text()).toContain('体感与寒热')
  })

  it('supports group pagination and submission', async () => {
    vi.mocked(getQuestionnaireTemplate).mockResolvedValue(template)
    vi.mocked(submitQuestionnaire).mockResolvedValue({
      session_id: 9,
      session_status: 'questionnaire_completed',
      summary: { qi_deficiency: 3 },
    })

    const { store, wrapper } = mountView()

    await flushPromises()

    await wrapper.findAll('.option-card')[0].trigger('click')
    await wrapper.get('[data-testid="next-group"]').trigger('click')

    expect(wrapper.text()).toContain('情绪压力与生活习惯')

    await wrapper.findAll('.option-card')[1].trigger('click')
    await wrapper.get('[data-testid="submit-questionnaire"]').trigger('click')
    await flushPromises()

    expect(submitQuestionnaire).toHaveBeenCalledWith(9, [
      { question_code: 'fatigue_level', answer_value: 'energetic' },
      { question_code: 'emotion_state', answer_value: 'often_depressed' },
    ])
    expect(store.status).toBe('questionnaire_completed')
    expect(store.questionnaireSummary).toEqual({ qi_deficiency: 3 })
    expect(push).toHaveBeenCalledWith('/patient/capture-guide')
  })

  it('shows a retryable page-level error card when template loading fails', async () => {
    vi.mocked(getQuestionnaireTemplate).mockRejectedValue(new Error('Request failed: 500'))

    const { wrapper } = mountView()

    await flushPromises()

    expect(wrapper.text()).toContain('问卷加载失败')
    expect(wrapper.text()).toContain('重新加载')
    expect(wrapper.text()).toContain('返回建档页')
  })

  it('preserves current answers when questionnaire submission fails', async () => {
    vi.mocked(getQuestionnaireTemplate).mockResolvedValue(template)
    vi.mocked(submitQuestionnaire).mockRejectedValue(new Error('Request failed: 500'))

    const { wrapper } = mountView()

    await flushPromises()

    await wrapper.findAll('.option-card')[0].trigger('click')
    await wrapper.get('[data-testid="next-group"]').trigger('click')
    await wrapper.findAll('.option-card')[1].trigger('click')
    await wrapper.get('[data-testid="submit-questionnaire"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('问卷提交失败')
    expect(wrapper.find('[data-testid="submit-questionnaire"]').exists()).toBe(true)
    expect(wrapper.findAll('.option-card.selected')).toHaveLength(1)
    expect(wrapper.findAll('.option-card.selected')[0].text()).toContain('经常压抑或心情不舒')
  })

  it('redirects to welcome when session is missing', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    mount(QuestionnaireView, {
      global: {
        plugins: [pinia],
      },
    })

    await flushPromises()

    expect(getQuestionnaireTemplate).not.toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/patient/welcome')
  })
})
