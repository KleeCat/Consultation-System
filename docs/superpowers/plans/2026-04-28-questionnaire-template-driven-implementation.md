# 问卷模板驱动改造 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把患者端静态问卷升级为后端题库驱动的动态分组问卷，并在不破坏现有问诊主流程的前提下补齐提交校验、版本追踪和测试覆盖。

**Architecture:** 后端继续以 `config/questionnaire.yaml` 和 `config/question_scoring.yaml` 作为配置源，其中前者负责模板展示，后者负责评分。新增 `GET /api/questionnaire/template` 作为模板读取接口，保留现有问卷提交接口并加强校验。前端问卷页改为启动时拉取模板、按分组分页渲染、在最后一组统一提交。

**Tech Stack:** FastAPI、SQLModel、Pytest、Vue 3、Pinia、Vue Router、Vitest、Vite、YAML 配置、RTK 命令包装

---

## File Map

- Modify: `config/questionnaire.yaml`
  - 升级为带版本、分组、13 道题和自定义选项的问卷模板。
- Modify: `config/question_scoring.yaml`
  - 为 13 道题补齐体质评分映射。
- Modify: `backend/app/schemas/questionnaire.py`
  - 新增模板接口响应模型。
- Modify: `backend/app/api/routes/questionnaire.py`
  - 新增模板读取接口；统一提交校验错误返回。
- Modify: `backend/app/services/questionnaire_service.py`
  - 读取模板、按模板校验提交答案、返回结构化模板数据。
- Modify: `backend/app/repositories/questionnaire_repo.py`
  - 在更新问卷状态时同时持久化 `questionnaire_version`。
- Create: `backend/tests/api/test_questionnaire_template_routes.py`
  - 模板接口契约测试。
- Modify: `backend/tests/api/test_questionnaire_routes.py`
  - 提交成功、非法题号、非法选项、缺少必答题等测试。
- Modify: `backend/tests/engines/test_questionnaire_scorer.py`
  - 扩展新题目评分断言。
- Modify: `backend/tests/conftest.py`
  - 更新 `prepared_session` 使用的问卷答案，适配必答题数量增加。
- Modify: `backend/tests/api/test_end_to_end_smoke.py`
  - 使用完整问卷答案跑通主流程 smoke。
- Modify: `frontend/src/api/consultation.ts`
  - 新增问卷模板获取函数与类型。
- Create: `frontend/src/components/questionnaire/QuestionnaireProgress.vue`
  - 显示当前分组进度。
- Create: `frontend/src/components/questionnaire/QuestionCard.vue`
  - 单题卡片 + 单选选项卡片。
- Modify: `frontend/src/views/patient/QuestionnaireView.vue`
  - 重写为动态模板、分组分页、卡片作答和统一提交。
- Create: `frontend/src/tests/views/questionnaire-view.spec.ts`
  - 动态渲染、分页、校验、提交与错误提示测试。

---

## Chunk 1: 后端模板契约与模板配置

### Task 1: 定义模板接口契约测试

**Files:**
- Create: `backend/tests/api/test_questionnaire_template_routes.py`
- Modify: `backend/app/schemas/questionnaire.py`
- Modify: `backend/app/api/routes/questionnaire.py`
- Modify: `backend/app/services/questionnaire_service.py`
- Modify: `config/questionnaire.yaml`

- [ ] **Step 1: Write the failing test**

```python
def test_get_questionnaire_template_returns_groups_questions_and_version(client):
    response = client.get("/api/questionnaire/template")
    body = response.json()

    assert response.status_code == 200
    assert body["questionnaire_code"] == "tcm_constitution_questionnaire"
    assert body["version"] == "v1"
    assert body["title"]
    assert len(body["groups"]) == 3
    assert len(body["questions"]) == 13
    assert {group["group_code"] for group in body["groups"]} == {
        "body_sensation",
        "diet_sleep_excretion",
        "emotion_lifestyle",
    }
    assert all(question["question_type"] == "single_choice" for question in body["questions"])
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk summary uv run pytest backend/tests/api/test_questionnaire_template_routes.py -q
```

Expected: FAIL with `404 Not Found` or response schema assertion failure because the template route does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add response models to `backend/app/schemas/questionnaire.py`:

```python
class QuestionnaireOptionResponse(BaseModel):
    value: str
    label: str
    description: str | None = None


class QuestionnaireQuestionResponse(BaseModel):
    question_code: str
    group_code: str
    question_text: str
    question_help: str | None = None
    required: bool
    question_type: str
    options: list[QuestionnaireOptionResponse]


class QuestionnaireGroupResponse(BaseModel):
    group_code: str
    group_title: str
    group_description: str


class QuestionnaireTemplateResponse(BaseModel):
    questionnaire_code: str
    version: str
    title: str
    description: str
    groups: list[QuestionnaireGroupResponse]
    questions: list[QuestionnaireQuestionResponse]
```

Add template loader logic to `backend/app/services/questionnaire_service.py`:

```python
class QuestionnaireService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = QuestionnaireRepository(db)
        self.config = yaml.safe_load(QUESTIONNAIRE_PATH.read_text(encoding="utf-8"))
        self.question_map = {item["question_code"]: item for item in self.config["questions"]}

    def get_template(self) -> dict[str, object]:
        return {
            "questionnaire_code": self.config["questionnaire_code"],
            "version": self.config["version"],
            "title": self.config["title"],
            "description": self.config["description"],
            "groups": self.config["groups"],
            "questions": self.config["questions"],
        }
```

Add route to `backend/app/api/routes/questionnaire.py`:

```python
@router.get("/questionnaire/template", response_model=QuestionnaireTemplateResponse)
def get_questionnaire_template(db: Session = Depends(get_session)) -> QuestionnaireTemplateResponse:
    template = QuestionnaireService(db).get_template()
    return QuestionnaireTemplateResponse(**template)
```

Upgrade `config/questionnaire.yaml` to this shape:

```yaml
questionnaire_code: tcm_constitution_questionnaire
version: v1
title: 中医问诊问卷
description: 请根据近两周的真实感受完成作答。
groups:
  - group_code: body_sensation
    group_title: 体感与寒热
    group_description: 先了解近期精力、寒热与身体轻重感。
questions:
  - question_code: fatigue_level
    group_code: body_sensation
    question_text: 最近精力状态怎么样？
    required: true
    question_type: single_choice
    options:
      - value: energetic
        label: 精力充足
```

Continue the YAML until all 3 groups and 13 questions are present.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk summary uv run pytest backend/tests/api/test_questionnaire_template_routes.py -q
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
rtk git add -- config/questionnaire.yaml backend/app/schemas/questionnaire.py backend/app/api/routes/questionnaire.py backend/app/services/questionnaire_service.py backend/tests/api/test_questionnaire_template_routes.py
rtk git commit -m "feat(questionnaire): 新增问卷模板接口"
```

---

## Chunk 2: 问卷评分扩展与提交校验

### Task 2: 扩展评分配置并锁定评分回归

**Files:**
- Modify: `config/question_scoring.yaml`
- Modify: `backend/tests/engines/test_questionnaire_scorer.py`

- [ ] **Step 1: Write the failing scorer test**

```python
def test_questionnaire_scorer_maps_new_answers_to_constitution_scores():
    answers = {
        "fatigue_level": "slight_activity_tired",
        "cold_sensitivity": "often_need_more_clothes",
        "sleep_quality": "hard_to_fall_asleep",
        "emotion_state": "often_depressed",
    }

    result = score_questionnaire(answers)

    assert result["qi_deficiency"] > result["balanced"]
    assert result["yang_deficiency"] > 0
    assert result["yin_deficiency"] > 0
    assert result["qi_stagnation"] > 0
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk summary uv run pytest backend/tests/engines/test_questionnaire_scorer.py -q
```

Expected: FAIL with missing question code or zero-score assertions because the new answer values are not in `question_scoring.yaml`.

- [ ] **Step 3: Write minimal implementation**

Expand `config/question_scoring.yaml` so all 13 questions are covered. Use additive scoring like:

```yaml
scoring:
  fatigue_level:
    energetic:
      balanced: 2
    occasional_fatigue:
      balanced: 1
      qi_deficiency: 1
    afternoon_tired:
      qi_deficiency: 2
    slight_activity_tired:
      qi_deficiency: 4
  cold_sensitivity:
    basically_not_cold:
      balanced: 2
    cold_in_winter:
      yang_deficiency: 1
    hands_feet_cold:
      yang_deficiency: 3
    often_need_more_clothes:
      yang_deficiency: 4
  sleep_quality:
    sleep_well:
      balanced: 1
    light_sleep:
      yin_deficiency: 1
    dreamful_tired:
      yin_deficiency: 2
      qi_stagnation: 1
    hard_to_fall_asleep:
      yin_deficiency: 3
      qi_stagnation: 1
```

Continue until every new `question_code`/`answer_value` in the template has a score mapping.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk summary uv run pytest backend/tests/engines/test_questionnaire_scorer.py -q
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
rtk git add -- config/question_scoring.yaml backend/tests/engines/test_questionnaire_scorer.py
rtk git commit -m "feat(questionnaire): 扩展问卷评分配置"
```

### Task 3: 为提交接口补齐模板校验和版本落库

**Files:**
- Modify: `backend/app/services/questionnaire_service.py`
- Modify: `backend/app/repositories/questionnaire_repo.py`
- Modify: `backend/app/api/routes/questionnaire.py`
- Modify: `backend/tests/api/test_questionnaire_routes.py`
- Create: `backend/tests/services/test_questionnaire_service.py`
- Modify: `backend/tests/conftest.py`
- Modify: `backend/tests/api/test_end_to_end_smoke.py`

- [ ] **Step 1: Write the failing API/service tests**

```python
def test_submit_answers_rejects_unknown_question_code(client, session_id):
    response = client.post(
        f"/api/sessions/{session_id}/questionnaire",
        json={"answers": [{"question_code": "unknown_code", "answer_value": "x"}]},
    )

    assert response.status_code == 400
    assert "unknown question_code" in response.json()["detail"]


def test_submit_answers_rejects_invalid_answer_value(client, session_id):
    response = client.post(
        f"/api/sessions/{session_id}/questionnaire",
        json={"answers": [{"question_code": "fatigue_level", "answer_value": "bad_value"}]},
    )

    assert response.status_code == 400
    assert "invalid answer_value" in response.json()["detail"]


def test_submit_answers_writes_questionnaire_version(test_engine, session_service):
    session = session_service.create_session(name="测试患者", gender="female", age=30)
    with Session(test_engine) as db:
        service = QuestionnaireService(db)
        service.submit_answers(session.session_id, complete_answers_payload())
        stored = QuestionnaireRepository(db).get_session(session.session_id)
        assert stored.questionnaire_version == "v1"
```

Add a full payload helper in `backend/tests/conftest.py`:

```python
def complete_questionnaire_answers():
    return [
        {"question_code": "fatigue_level", "answer_value": "afternoon_tired"},
        ...
    ]
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
rtk summary uv run pytest backend/tests/api/test_questionnaire_routes.py backend/tests/services/test_questionnaire_service.py backend/tests/api/test_end_to_end_smoke.py -q
```

Expected: FAIL because the service currently trusts unknown question codes, does not validate required questions, and does not persist `questionnaire_version`.

- [ ] **Step 3: Write minimal implementation**

In `backend/app/services/questionnaire_service.py`, validate against the template before saving:

```python
def submit_answers(self, session_id: int, answers: list[QuestionnaireAnswerInput]) -> tuple[str, dict[str, float]]:
    seen_codes: set[str] = set()
    answer_dict: dict[str, str] = {}

    for item in answers:
        if item.question_code not in self.question_map:
            raise ValueError(f"unknown question_code: {item.question_code}")
        if item.question_code in seen_codes:
            raise ValueError(f"duplicate question_code: {item.question_code}")

        question = self.question_map[item.question_code]
        option_map = {option["value"]: option for option in question["options"]}
        if item.answer_value not in option_map:
            raise ValueError(f"invalid answer_value for {item.question_code}: {item.answer_value}")

        seen_codes.add(item.question_code)
        answer_dict[item.question_code] = item.answer_value
        ...

    required_codes = {
        question["question_code"]
        for question in self.config["questions"]
        if question.get("required", True)
    }
    missing_codes = sorted(required_codes - seen_codes)
    if missing_codes:
        raise ValueError(f"missing required questions: {', '.join(missing_codes)}")

    summary = score_questionnaire(answer_dict)
    consultation_session = self.repo.get_session(session_id=session_id)
    self.repo.update_session_questionnaire(consultation_session, "questionnaire_completed", self.config["version"])
    return consultation_session.session_status, summary
```

In `backend/app/repositories/questionnaire_repo.py`, add:

```python
def update_session_questionnaire(
    self,
    consultation_session: ConsultationSession,
    status: str,
    questionnaire_version: str,
) -> ConsultationSession:
    consultation_session.session_status = status
    consultation_session.questionnaire_version = questionnaire_version
    self.db.add(consultation_session)
    self.db.commit()
    self.db.refresh(consultation_session)
    return consultation_session
```

In `backend/app/api/routes/questionnaire.py`, convert validation errors to HTTP 400:

```python
try:
    session_status, summary = questionnaire_service.submit_answers(...)
except ValueError as exc:
    raise HTTPException(status_code=400, detail=str(exc)) from exc
```

Update `backend/tests/conftest.py` and `backend/tests/api/test_end_to_end_smoke.py` to reuse a full 13-answer payload, so existing analysis tests still reach the capture/analyze stages.

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
rtk summary uv run pytest backend/tests/api/test_questionnaire_routes.py backend/tests/services/test_questionnaire_service.py backend/tests/api/test_end_to_end_smoke.py backend/tests/services/test_analysis_service.py -q
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
rtk git add -- backend/app/services/questionnaire_service.py backend/app/repositories/questionnaire_repo.py backend/app/api/routes/questionnaire.py backend/tests/api/test_questionnaire_routes.py backend/tests/services/test_questionnaire_service.py backend/tests/conftest.py backend/tests/api/test_end_to_end_smoke.py
rtk git commit -m "fix(questionnaire): 补齐问卷校验与版本落库"
```

---

## Chunk 3: 前端动态模板加载与分组分页

### Task 4: 接入模板 API 并实现分组分页壳子

**Files:**
- Modify: `frontend/src/api/consultation.ts`
- Create: `frontend/src/components/questionnaire/QuestionnaireProgress.vue`
- Create: `frontend/src/components/questionnaire/QuestionCard.vue`
- Modify: `frontend/src/views/patient/QuestionnaireView.vue`
- Create: `frontend/src/tests/views/questionnaire-view.spec.ts`

- [ ] **Step 1: Write the failing view test**

```typescript
it('loads template and renders the first group with next-step validation', async () => {
  vi.mocked(getQuestionnaireTemplate).mockResolvedValue(mockTemplate)

  const wrapper = mount(QuestionnaireView, {
    global: { plugins: [createPinia()] },
  })

  await flushPromises()

  expect(getQuestionnaireTemplate).toHaveBeenCalled()
  expect(wrapper.text()).toContain('体感与寒热')
  expect(wrapper.text()).toContain('最近精力状态怎么样？')

  await wrapper.get('button[data-testid="next-group"]').trigger('click')
  expect(wrapper.text()).toContain('请先完成当前分组的必答题')
})
```

Use a mock template like:

```typescript
const mockTemplate = {
  questionnaire_code: 'tcm_constitution_questionnaire',
  version: 'v1',
  title: '中医问诊问卷',
  description: '请根据近两周的真实感受完成作答。',
  groups: [
    { group_code: 'body_sensation', group_title: '体感与寒热', group_description: '...' },
    { group_code: 'diet_sleep_excretion', group_title: '饮食睡眠与排泄', group_description: '...' },
  ],
  questions: [
    {
      question_code: 'fatigue_level',
      group_code: 'body_sensation',
      question_text: '最近精力状态怎么样？',
      required: true,
      question_type: 'single_choice',
      options: [{ value: 'energetic', label: '精力充足' }],
    },
  ],
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk summary npm --prefix frontend run test -- src/tests/views/questionnaire-view.spec.ts
```

Expected: FAIL because `getQuestionnaireTemplate` does not exist and the view is still hard-coded.

- [ ] **Step 3: Write minimal implementation**

In `frontend/src/api/consultation.ts`, add:

```typescript
export interface QuestionnaireOption {
  value: string
  label: string
  description?: string
}

export interface QuestionnaireQuestion {
  question_code: string
  group_code: string
  question_text: string
  question_help?: string
  required: boolean
  question_type: 'single_choice'
  options: QuestionnaireOption[]
}

export interface QuestionnaireGroup {
  group_code: string
  group_title: string
  group_description: string
}

export interface QuestionnaireTemplateResponse {
  questionnaire_code: string
  version: string
  title: string
  description: string
  groups: QuestionnaireGroup[]
  questions: QuestionnaireQuestion[]
}

export function getQuestionnaireTemplate() {
  return httpGet<QuestionnaireTemplateResponse>('/api/questionnaire/template')
}
```

Create `frontend/src/components/questionnaire/QuestionnaireProgress.vue`:

```vue
<template>
  <header class="progress-card">
    <p class="eyebrow">问诊问卷</p>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <strong>第 {{ current }} / {{ total }} 组</strong>
  </header>
</template>
```

Create `frontend/src/components/questionnaire/QuestionCard.vue`:

```vue
<template>
  <section class="question-card">
    <h3>{{ question.question_text }}</h3>
    <p v-if="question.question_help">{{ question.question_help }}</p>
    <button
      v-for="option in question.options"
      :key="option.value"
      type="button"
      :class="{ selected: modelValue === option.value }"
      @click="$emit('update:modelValue', option.value)"
    >
      <span>{{ option.label }}</span>
      <small v-if="option.description">{{ option.description }}</small>
    </button>
  </section>
</template>
```

Rewrite `frontend/src/views/patient/QuestionnaireView.vue` with local state:

```typescript
const template = ref<QuestionnaireTemplateResponse | null>(null)
const currentGroupIndex = ref(0)
const answers = reactive<Record<string, string>>({})
const validationError = ref('')

const groupedQuestions = computed(() => {
  if (!template.value) return []
  return template.value.groups.map((group) => ({
    ...group,
    questions: template.value!.questions.filter((question) => question.group_code === group.group_code),
  }))
})

function canAdvanceCurrentGroup() {
  return currentGroup.value.questions.every((question) => !question.required || answers[question.question_code])
}
```

Load template on mount and keep submit for the last chunk.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk summary npm --prefix frontend run test -- src/tests/views/questionnaire-view.spec.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
rtk git add -- frontend/src/api/consultation.ts frontend/src/components/questionnaire/QuestionnaireProgress.vue frontend/src/components/questionnaire/QuestionCard.vue frontend/src/views/patient/QuestionnaireView.vue frontend/src/tests/views/questionnaire-view.spec.ts
rtk git commit -m "feat(questionnaire): 接入动态问卷模板"
```

---

## Chunk 4: 前端提交联动、错误处理与全量回归

### Task 5: 完成问卷提交流程与错误提示

**Files:**
- Modify: `frontend/src/views/patient/QuestionnaireView.vue`
- Modify: `frontend/src/tests/views/questionnaire-view.spec.ts`

- [ ] **Step 1: Write the failing submit/error tests**

```typescript
it('submits all answers on the last group and routes to capture guide', async () => {
  vi.mocked(getQuestionnaireTemplate).mockResolvedValue(mockTemplateWithThreeGroups)
  vi.mocked(submitQuestionnaire).mockResolvedValue({
    session_id: 9,
    session_status: 'questionnaire_completed',
    summary: { qi_deficiency: 4 },
  })

  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useConsultationStore()
  store.sessionId = 9

  const wrapper = mount(QuestionnaireView, { global: { plugins: [pinia] } })
  await flushPromises()

  await answerAllGroups(wrapper)
  await wrapper.get('button[data-testid="submit-questionnaire"]').trigger('click')
  await flushPromises()

  expect(submitQuestionnaire).toHaveBeenCalledWith(9, expect.arrayContaining([
    expect.objectContaining({ question_code: 'fatigue_level' }),
  ]))
  expect(push).toHaveBeenCalledWith('/patient/capture-guide')
})


it('shows a reload error state when template loading fails', async () => {
  vi.mocked(getQuestionnaireTemplate).mockRejectedValue(new Error('Request failed: 500'))
  const wrapper = mount(QuestionnaireView, { global: { plugins: [createPinia()] } })
  await flushPromises()
  expect(wrapper.text()).toContain('问卷加载失败')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk summary npm --prefix frontend run test -- src/tests/views/questionnaire-view.spec.ts
```

Expected: FAIL because the view does not yet handle multi-group submission or template-load error states.

- [ ] **Step 3: Write minimal implementation**

Complete `submitAnswers` in `frontend/src/views/patient/QuestionnaireView.vue`:

```typescript
async function submitAnswers() {
  if (!store.sessionId || !template.value) {
    router.push('/patient/welcome')
    return
  }

  if (!canAdvanceCurrentGroup()) {
    validationError.value = '请先完成当前分组的必答题'
    return
  }

  submitting.value = true
  submitError.value = ''

  try {
    const payload = template.value.questions.map((question) => ({
      question_code: question.question_code,
      answer_value: answers[question.question_code],
    }))
    const response = await submitQuestionnaire(store.sessionId, payload)
    store.status = response.session_status
    store.questionnaireSummary = response.summary
    router.push('/patient/capture-guide')
  } catch (error) {
    submitError.value = `问卷提交失败：${error instanceof Error ? error.message : '未知错误'}`
  } finally {
    submitting.value = false
  }
}
```

Add a load failure state:

```vue
<section v-if="loadError" class="error-state">
  <p>{{ loadError }}</p>
  <button type="button" @click="loadTemplate">重新加载</button>
</section>
```

Also redirect to `/patient/welcome` immediately when `store.sessionId` is empty.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk summary npm --prefix frontend run test -- src/tests/views/questionnaire-view.spec.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
rtk git add -- frontend/src/views/patient/QuestionnaireView.vue frontend/src/tests/views/questionnaire-view.spec.ts
rtk git commit -m "fix(questionnaire): 完成问卷提交流程"
```

### Task 6: 执行全量回归并记录结果

**Files:**
- Modify: `frontend/src/tests/views/questionnaire-view.spec.ts`（如需补充边界用例）
- Modify: `backend/tests/api/test_questionnaire_routes.py`（如需补充边界用例）

- [ ] **Step 1: Run focused backend regression**

Run:

```bash
rtk summary uv run pytest backend/tests/api/test_questionnaire_template_routes.py backend/tests/api/test_questionnaire_routes.py backend/tests/engines/test_questionnaire_scorer.py backend/tests/services/test_questionnaire_service.py backend/tests/api/test_end_to_end_smoke.py backend/tests/services/test_analysis_service.py -q
```

Expected: PASS

- [ ] **Step 2: Run focused frontend regression**

Run:

```bash
rtk summary npm --prefix frontend run test -- src/tests/views/questionnaire-view.spec.ts src/tests/views/profile-view.spec.ts src/tests/views/capture-view.spec.ts src/tests/router/patient-routes.spec.ts
```

Expected: PASS

- [ ] **Step 3: Run full frontend test suite**

Run:

```bash
rtk summary npm --prefix frontend run test
```

Expected: PASS

- [ ] **Step 4: Run frontend build**

Run:

```bash
rtk summary npm --prefix frontend run build
```

Expected: PASS

- [ ] **Step 5: Hand-test the full patient flow**

Run services in the worktree:

```bash
rtk summary npm --prefix frontend run dev
rtk summary uv run uvicorn backend.app.main:app --reload
```

Then verify manually:

1. 打开 `/patient/profile`
2. 创建会话进入问卷页
3. 完成三组问卷
4. 提交后进入 `/patient/capture-guide`
5. 继续完成示例舌象或真实采集流程
6. 结果页仍可正常显示

- [ ] **Step 6: Commit**

```bash
rtk git add -- .
rtk git commit -m "test(questionnaire): 完成问卷动态化回归验证"
```

---

Plan complete and saved to `docs/superpowers/plans/2026-04-28-questionnaire-template-driven-implementation.md`. Ready to execute?
