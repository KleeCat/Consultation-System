# 患者端页面风格统一 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以问卷页为视觉基线，把患者端欢迎、建档、问卷、采集、分析、结果和结束页面统一成同一套暖色卡片式体验，同时不破坏现有患者主流程。

**Architecture:** 本次改造只动前端展示层：先抽最小可复用患者端骨架组件和阶段元数据，再分批把患者端页面迁移到统一骨架。业务请求、路由和 Pinia 状态继续由各页面掌握，公共组件只负责主题、版式和可复用状态展示。

**Tech Stack:** Vue 3、TypeScript、Pinia、Vue Router、Vitest、Vite、CSS 变量/Scoped CSS、RTK 包装命令

---

## File Map

- Create: `frontend/src/assets/patient-theme.css`
  - 定义患者端统一背景、颜色、圆角、阴影、按钮和间距的最小主题变量，数值直接复用问卷页现有样式基线。
- Create: `frontend/src/constants/patientStages.ts`
  - 统一维护患者端各页面的阶段标签、标题、副标题和主操作文案。
- Create: `frontend/src/components/patient/PatientPageShell.vue`
  - 患者端页面总容器，提供统一宽度、留白、背景和分区 slot。
- Create: `frontend/src/components/patient/PatientStageHeader.vue`
  - 阶段头部：标签、标题、引导语。
- Create: `frontend/src/components/patient/PatientCard.vue`
  - 通用内容卡片，支持默认/主卡等轻量变体。
- Create: `frontend/src/components/patient/PatientTipCard.vue`
  - 承载说明、提醒、建议等辅助信息。
- Create: `frontend/src/components/patient/PatientActionBar.vue`
  - 统一主次按钮区，处理移动端纵向堆叠。
- Create: `frontend/src/components/patient/PatientStatusCard.vue`
  - 统一加载中、失败、完成等状态卡片。
- Create: `frontend/src/tests/components/patient-shell.spec.ts`
  - 验证新骨架组件的标题、slot、变体和按钮区渲染。
- Create: `frontend/src/tests/components/patient-layout.spec.ts`
  - 验证患者端布局只渲染统一布局容器，不再插入旧的全局 `StepProgress` 文本。
- Create: `frontend/src/tests/views/welcome-capture-guide.spec.ts`
  - 覆盖欢迎页与采集引导页的统一骨架、说明层级和主按钮流转。
- Create: `frontend/src/tests/views/capture-confirm-view.spec.ts`
  - 覆盖确认上传成功/失败、重新拍摄等患者端统一交互。
- Create: `frontend/src/tests/views/analyzing-view.spec.ts`
  - 覆盖分析成功跳转与失败状态卡。
- Create: `frontend/src/tests/views/finish-view.spec.ts`
  - 覆盖完成页的返回首页与重新问诊动作。
- Create: `frontend/src/tests/views/patient-result-finish-flow.spec.ts`
  - 覆盖分析成功后进入结果页、完成页，以及从结果页重启新流程的跨页链路。
- Modify: `frontend/src/main.ts`
  - 注入新的患者端主题 CSS。
- Modify: `frontend/src/layouts/PatientLayout.vue`
  - 从“全局步骤文案”切换为纯布局容器。
- Modify: `frontend/src/views/patient/WelcomeView.vue`
  - 接入统一骨架和开始问诊主卡片。
- Modify: `frontend/src/views/patient/ProfileView.vue`
  - 接入统一骨架、字段分组、错误提示和操作区。
- Modify: `frontend/src/views/patient/QuestionnaireView.vue`
  - 保留动态问卷逻辑，迁移到统一外层骨架和操作区。
- Modify: `frontend/src/views/patient/CaptureGuideView.vue`
  - 接入统一骨架、示例图和采集准备说明。
- Modify: `frontend/src/views/patient/CaptureView.vue`
  - 接入统一骨架，突出 `CameraPreview` 主任务区。
- Modify: `frontend/src/components/capture/CameraPreview.vue`
  - 与新主题保持一致，保留现有摄像头/上传/示例图能力。
- Modify: `frontend/src/views/patient/CaptureConfirmView.vue`
  - 加入统一骨架、上传中/失败提示和一致的操作区。
- Modify: `frontend/src/views/patient/AnalyzingView.vue`
  - 用统一状态卡表达分析中/失败，不扩展新的后台协议。
- Modify: `frontend/src/views/patient/ResultView.vue`
  - 重排为“核心结论 → 依据说明 → 调理建议 → 底部操作区”。
- Modify: `frontend/src/views/patient/FinishView.vue`
  - 统一完成态文案，提供“返回首页 / 重新问诊”动作。
- Modify: `frontend/src/tests/views/profile-view.spec.ts`
  - 适配新的表单结构、错误提示和按钮文案。
- Modify: `frontend/src/tests/views/questionnaire-view.spec.ts`
  - 适配统一外层骨架但保持动态问卷逻辑断言。
- Modify: `frontend/src/tests/views/capture-view.spec.ts`
  - 适配新的提示文案和页面骨架。
- Modify: `frontend/src/tests/views/result-view.spec.ts`
  - 适配新的结果结构与按钮区。
- Modify: `frontend/src/tests/components/camera-preview.spec.ts`
  - 如按钮文案或渲染层次有调整，同步断言。
- Modify: `frontend/src/tests/e2e/patient-admin-smoke.spec.ts`
  - 保证结果页在新结构下仍可从 fixture 正常渲染。

---

## Chunk 1: 骨架与主题基础设施

### Task 1: 建立患者端主题变量与阶段元数据

**Files:**
- Create: `frontend/src/assets/patient-theme.css`
- Create: `frontend/src/constants/patientStages.ts`
- Modify: `frontend/src/main.ts`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/tests/components/patient-shell.spec.ts` with a first test that imports future stage metadata and expects a stable label/title pair:

```ts
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { patientStages } from '../../constants/patientStages'

describe('patient stage metadata', () => {
  it('defines stable stage copy for patient entry and result pages', () => {
    expect(patientStages.welcome.eyebrow).toBe('开始问诊')
    expect(patientStages.result.title).toContain('结果')
    expect(patientStages.finish.primaryActionLabel).toBe('返回首页')
  })

  it('wires the patient theme from the frontend entry', () => {
    const mainTs = readFileSync(resolve(__dirname, '../../main.ts'), 'utf8')
    expect(mainTs).toContain(`import './assets/patient-theme.css'`)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/components/patient-shell.spec.ts
```

Expected: FAIL with module-not-found for `../../constants/patientStages`.

- [ ] **Step 3: Write minimal implementation**

Create `frontend/src/constants/patientStages.ts`:

```ts
export const patientStages = {
  welcome: {
    order: 0,
    eyebrow: '开始问诊',
    title: '欢迎使用智能中医问诊系统',
    description: '先了解流程，再开始本次智能问诊。',
    primaryActionLabel: '开始问诊',
  },
  profile: {
    order: 1,
    eyebrow: '第一步：建立档案',
    title: '填写基础信息',
    description: '先完成本次问诊的基本资料登记。',
    primaryActionLabel: '下一步',
  },
  questionnaire: {
    order: 2,
    eyebrow: '第二步：体质问答',
    title: '完成基础问卷',
    description: '根据最近两周的真实感受完成作答。',
    primaryActionLabel: '提交问卷',
  },
  captureGuide: {
    order: 3,
    eyebrow: '第三步：采集准备',
    title: '阅读舌象采集要求',
    description: '先确认光线、姿势和拍摄方式。',
    primaryActionLabel: '开始采集',
  },
  capture: {
    order: 4,
    eyebrow: '第四步：舌象采集',
    title: '实时采集舌象图片',
    description: '优先使用摄像头，也支持上传或示例图。',
    primaryActionLabel: '拍照采集',
  },
  captureConfirm: {
    order: 5,
    eyebrow: '第五步：确认上传',
    title: '确认当前舌象图片',
    description: '检查清晰度和居中情况，再进入分析。',
    primaryActionLabel: '确认并分析',
  },
  analyzing: {
    order: 6,
    eyebrow: '第六步：智能分析',
    title: '正在分析问答与舌象信息',
    description: '系统正在整理本次问诊线索，请稍候。',
    primaryActionLabel: '等待结果',
  },
  result: {
    order: 7,
    eyebrow: '第七步：查看结果',
    title: '查看本次问诊结果',
    description: '先看核心判断，再看依据和调理建议。',
    primaryActionLabel: '完成',
  },
  finish: {
    order: 8,
    eyebrow: '问诊完成',
    title: '本次问诊已完成',
    description: '你可以返回首页，或直接重新开始下一次问诊。',
    primaryActionLabel: '返回首页',
    secondaryActionLabel: '重新问诊',
  },
} as const
```

Treat `patientStages` as the **default copy source** for page headers and baseline action labels. Pages with runtime-specific actions (for example, questionnaire “下一步 / 提交问卷”) may override the button text at render time while keeping the same stage order and header copy.

Create `frontend/src/assets/patient-theme.css` using `QuestionnaireView` values as the baseline:

```css
:root {
  --patient-page-gap: 20px;
  --patient-card-padding: 24px;
  --patient-card-radius: 24px;
  --patient-button-radius: 16px;
  --patient-button-height: 48px;
  --patient-card-bg: rgba(255, 252, 251, 0.96);
  --patient-accent: #b55b6d;
  --patient-accent-strong: #d37b8e;
  --patient-text-strong: #5b3037;
  --patient-text-muted: #7d6166;
  --patient-line: rgba(164, 118, 126, 0.16);
  --patient-shadow: 0 18px 36px rgba(111, 59, 69, 0.08);
  --patient-success: #4f8d63;
  --patient-warning: #a86a3f;
  --patient-error: #b54861;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at top, rgba(255, 246, 241, 0.98), rgba(244, 233, 228, 0.96)),
    #f7efeb;
  color: var(--patient-text-strong);
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
```

Import the theme once in `frontend/src/main.ts`:

```ts
import './assets/patient-theme.css'
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/components/patient-shell.spec.ts
```

Expected: PASS with 1 passed test.

- [ ] **Step 5: Commit**

Run:

```bash
rtk git add frontend/src/assets/patient-theme.css frontend/src/constants/patientStages.ts frontend/src/main.ts frontend/src/tests/components/patient-shell.spec.ts
rtk git commit -m "feat(frontend): 新增患者端主题基线与阶段配置"
```

### Task 2: 建立患者端通用骨架组件并清理旧布局

**Files:**
- Create: `frontend/src/components/patient/PatientPageShell.vue`
- Create: `frontend/src/components/patient/PatientStageHeader.vue`
- Create: `frontend/src/components/patient/PatientCard.vue`
- Create: `frontend/src/components/patient/PatientTipCard.vue`
- Create: `frontend/src/components/patient/PatientActionBar.vue`
- Create: `frontend/src/components/patient/PatientStatusCard.vue`
- Create: `frontend/src/tests/components/patient-layout.spec.ts`
- Modify: `frontend/src/tests/components/patient-shell.spec.ts`
- Modify: `frontend/src/layouts/PatientLayout.vue`

- [ ] **Step 1: Write the failing test**

Extend `frontend/src/tests/components/patient-shell.spec.ts` and add `frontend/src/tests/components/patient-layout.spec.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PatientActionBar from '../../components/patient/PatientActionBar.vue'
import PatientCard from '../../components/patient/PatientCard.vue'
import PatientPageShell from '../../components/patient/PatientPageShell.vue'
import PatientStageHeader from '../../components/patient/PatientStageHeader.vue'
import PatientStatusCard from '../../components/patient/PatientStatusCard.vue'
import PatientTipCard from '../../components/patient/PatientTipCard.vue'
import PatientLayout from '../../layouts/PatientLayout.vue'

it('renders shell/header/card/action slots with patient classes', () => {
  const wrapper = mount(PatientPageShell, {
    slots: {
      header: mount(PatientStageHeader, {
        props: { eyebrow: '开始问诊', title: '欢迎', description: 'desc' },
      }).html(),
      default: mount(PatientCard, { slots: { default: '<p>body</p>' } }).html(),
      actions: mount(PatientActionBar, { slots: { default: '<button>go</button>' } }).html(),
    },
  })

  expect(wrapper.find('.patient-page-shell').exists()).toBe(true)
  expect(wrapper.text()).toContain('开始问诊')
  expect(wrapper.text()).toContain('body')
  expect(wrapper.text()).toContain('go')
})

it('keeps patient layout as a pure route container without legacy step text', () => {
  const wrapper = mount(PatientLayout, {
    global: {
      stubs: {
        RouterView: { template: '<div class="route-stub">route body</div>' },
      },
    },
  })

  expect(wrapper.find('.patient-layout').exists()).toBe(true)
  expect(wrapper.text()).toContain('route body')
  expect(wrapper.text()).not.toContain('当前流程')
})

it('supports tip/status variants for warning and error copy', () => {
  const warning = mount(PatientTipCard, {
    props: { tone: 'warning' },
    slots: { default: 'tip copy' },
  })
  const error = mount(PatientStatusCard, {
    props: { tone: 'error', title: '分析暂未完成', description: '请返回上一页重试' },
  })

  expect(warning.classes()).toContain('tone-warning')
  expect(error.classes()).toContain('tone-error')
  expect(error.text()).toContain('分析暂未完成')
})

it('supports primary and secondary action slots together', () => {
  const wrapper = mount(PatientActionBar, {
    slots: {
      default: '<button class="primary">primary</button><button class="secondary">secondary</button>',
    },
  })

  expect(wrapper.text()).toContain('primary')
  expect(wrapper.text()).toContain('secondary')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/components/patient-shell.spec.ts src/tests/components/patient-layout.spec.ts
```

Expected: FAIL because the patient components do not exist yet and `PatientLayout` still renders `StepProgress`.

- [ ] **Step 3: Write minimal implementation**

Create `PatientPageShell.vue`:

```vue
<template>
  <main class="patient-page-shell">
    <slot name="header" />
    <section class="patient-main">
      <slot />
    </section>
    <section v-if="$slots.aside" class="patient-aside">
      <slot name="aside" />
    </section>
    <slot name="actions" />
  </main>
</template>

<style scoped>
.patient-page-shell {
  display: grid;
  gap: var(--patient-page-gap);
  width: min(100%, 880px);
  margin: 0 auto;
}

.patient-main,
.patient-aside {
  display: grid;
  gap: var(--patient-page-gap);
}
</style>
```

Create `PatientStageHeader.vue`:

```vue
<template>
  <header class="patient-stage-header" :class="`tone-${tone}`">
    <p class="eyebrow">{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <p class="description">{{ description }}</p>
  </header>
</template>
```

Create `PatientCard.vue`, `PatientTipCard.vue`, `PatientActionBar.vue`, `PatientStatusCard.vue` with:

- shared border radius `var(--patient-card-radius)`
- shared padding `var(--patient-card-padding)`
- `PatientActionBar` mobile column layout under `767px`
- `PatientActionBar` contract: default slot accepts one组主按钮/次按钮/文本按钮；组件负责对齐、间距和移动端堆叠，不接管点击逻辑
- `PatientStatusCard` tone classes `loading | success | error | empty`
- `PatientTipCard` tone classes `info | warning | success`
- `PatientStageHeader` props: `eyebrow`, `title`, `description`, `tone?: 'default' | 'highlight'`
- `PatientCard` props: `title?: string`, `variant?: 'default' | 'highlight' | 'soft'`
- `PatientTipCard` props: `tone`, `title?`; default slot承载正文
- `PatientStatusCard` props: `tone`, `title`, `description`; `actions` slot承载恢复入口
- all six components stay strictly in the display layer and never own request/route/store business logic

Update `frontend/src/layouts/PatientLayout.vue` to a pure route container:

```vue
<template>
  <section class="patient-layout">
    <RouterView />
  </section>
</template>

<style scoped>
.patient-layout {
  min-height: 100vh;
  padding: 32px 16px 48px;
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/components/patient-shell.spec.ts src/tests/components/patient-layout.spec.ts
```

Expected: PASS with all component/layout tests green.

- [ ] **Step 5: Commit**

Run:

```bash
rtk git add frontend/src/components/patient frontend/src/layouts/PatientLayout.vue frontend/src/tests/components/patient-shell.spec.ts frontend/src/tests/components/patient-layout.spec.ts
rtk git commit -m "feat(frontend): 新增患者端统一页面骨架组件"
```

---

## Chunk 2: 入口页与问卷页迁移

### Task 3: 统一欢迎页、建档页、采集引导页

**Files:**
- Create: `frontend/src/tests/views/welcome-capture-guide.spec.ts`
- Modify: `frontend/src/views/patient/WelcomeView.vue`
- Modify: `frontend/src/views/patient/ProfileView.vue`
- Modify: `frontend/src/views/patient/CaptureGuideView.vue`
- Modify: `frontend/src/tests/views/profile-view.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/tests/views/welcome-capture-guide.spec.ts` and extend `profile-view.spec.ts`:

```ts
it('resets consultation and routes from welcome to profile', async () => {
  const wrapper = mount(WelcomeView, { global: { plugins: [pinia] } })
  await wrapper.get('button').trigger('click')
  expect(push).toHaveBeenCalledWith('/patient/profile')
  expect(wrapper.text()).toContain('智能中医问诊系统')
})

it('routes from capture guide to capture page with preparation tips visible', async () => {
  const wrapper = mount(CaptureGuideView, { global: { plugins: [pinia] } })
  expect(wrapper.text()).toContain('采集')
  expect(wrapper.find('img').exists()).toBe(true)
  expect(wrapper.text()).toContain('光线充足')
  expect(wrapper.text()).toContain('舌面居中')
  expect(wrapper.text()).toContain('避免逆光')
  await wrapper.get('button').trigger('click')
  expect(push).toHaveBeenCalledWith('/patient/capture')
})

it('shows grouped profile fields and keeps API behavior unchanged', async () => {
  const wrapper = mount(ProfileView, { global: { plugins: [pinia] } })
  expect(wrapper.text()).toContain('基础信息')
  expect(wrapper.text()).toContain('姓名')
  expect(wrapper.text()).toContain('性别')
  expect(wrapper.text()).toContain('年龄')
  expect(wrapper.text()).toContain('返回')
})

it('shows inline validation when profile fields are incomplete', async () => {
  const wrapper = mount(ProfileView, { global: { plugins: [pinia] } })
  await wrapper.get('button.primary').trigger('click')

  expect(wrapper.text()).toContain('请输入姓名')
})

it('shows unified submission failure feedback when profile submission fails', async () => {
  vi.mocked(createSession).mockRejectedValue(new Error('Request failed: 500'))
  const wrapper = mount(ProfileView, { global: { plugins: [pinia] } })
  await wrapper.get('input').setValue('张三')
  await wrapper.findAll('input')[1].setValue('30')
  await wrapper.get('button.primary').trigger('click')
  await flushPromises()

  expect(wrapper.text()).toContain('提交失败')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/profile-view.spec.ts src/tests/views/welcome-capture-guide.spec.ts
```

Expected: FAIL because the old pages are too bare and do not contain the unified copy/structure assertions.

- [ ] **Step 3: Write minimal implementation**

Refactor `WelcomeView.vue` to use:

```vue
<PatientPageShell>
  <template #header>
    <PatientStageHeader v-bind="patientStages.welcome" />
  </template>

  <PatientCard>
    <h2>系统能力</h2>
    <p>系统会结合基础问答与舌象采集，生成本次体质判断与调理建议。</p>
  </PatientCard>

  <PatientTipCard tone="info">
    <h2>问诊流程</h2>
    <ul>
      <li>基础建档</li>
      <li>体质问答</li>
      <li>舌象采集</li>
      <li>智能分析与建议</li>
    </ul>
    采集前请尽量保持光线充足，避免逆光。
  </PatientTipCard>

  <template #actions>
    <PatientActionBar>
      <button class="primary" @click="startConsultation">开始问诊</button>
    </PatientActionBar>
  </template>
</PatientPageShell>
```

Refactor `ProfileView.vue` to:

- keep `createSession(...)` API call untouched
- split field labels into a styled `PatientCard`
- render per-field validation copy close to `name` / `age` when they are empty or out of range
- render one default `PatientTipCard tone="info"` with填写说明，即使没有错误也存在辅助说明区
- render `errorMessage` inside `PatientTipCard tone="warning"`
- add a secondary “返回欢迎页” button that routes to `/patient/welcome`
- keep submit button disabled by `submitting`

Refactor `CaptureGuideView.vue` to:

- use `PatientStageHeader` + one preparation `PatientCard`
- use one separate `PatientTipCard` to承载示例图与注意事项，确保示例区和说明区分离
- wrap buttons in `PatientActionBar`
- show 3 preparation bullets and the demo image from `frontend/src/assets/demo-tongue-sample.png`
- keep route target `/patient/capture`

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/profile-view.spec.ts src/tests/views/welcome-capture-guide.spec.ts
```

Expected: PASS with updated page structure assertions and existing submit flow still green.

- [ ] **Step 5: Commit**

Run:

```bash
rtk git add frontend/src/views/patient/WelcomeView.vue frontend/src/views/patient/ProfileView.vue frontend/src/views/patient/CaptureGuideView.vue frontend/src/tests/views/profile-view.spec.ts frontend/src/tests/views/welcome-capture-guide.spec.ts
rtk git commit -m "feat(frontend): 统一患者端入口与建档页面风格"
```

### Task 4: 让动态问卷页接入统一外层骨架

**Files:**
- Modify: `frontend/src/views/patient/QuestionnaireView.vue`
- Modify: `frontend/src/tests/views/questionnaire-view.spec.ts`

- [ ] **Step 1: Write the failing test**

Extend `frontend/src/tests/views/questionnaire-view.spec.ts` with assertions that the dynamic behavior stays the same while the page shows the unified stage header:

```ts
it('renders questionnaire inside the shared shell when the template loads', async () => {
  ...
  expect(wrapper.text()).toContain('体质问答')
  expect(wrapper.text()).toContain('根据最近两周的真实感受完成作答')
  expect(wrapper.find('.patient-page-shell').exists()).toBe(true)
})

it('shows a retryable page-level error card when template loading fails', async () => {
  ...
  expect(wrapper.text()).toContain('问卷加载失败')
  expect(wrapper.text()).toContain('重新加载')
  expect(wrapper.text()).toContain('返回建档页')
})

it('preserves current answers when questionnaire submission fails', async () => {
  ...
  expect(wrapper.text()).toContain('问卷提交失败')
  expect(wrapper.find('[data-testid=\"submit-questionnaire\"]').exists()).toBe(true)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/questionnaire-view.spec.ts
```

Expected: FAIL because `QuestionnaireView` still uses its own root markup and does not render the shared shell.

- [ ] **Step 3: Write minimal implementation**

Refactor only the outer structure of `QuestionnaireView.vue`:

```vue
<PatientPageShell v-if="loadError" class="questionnaire-page">
  <template #header>
    <PatientStageHeader v-bind="patientStages.questionnaire" />
  </template>

  <PatientStatusCard tone="error" title="问卷加载失败" :description="loadError" />

  <template #actions>
    <PatientActionBar>
      <button class="secondary" type="button" @click="loadTemplate">重新加载</button>
      <button class="ghost" type="button" @click="router.push('/patient/profile')">返回建档页</button>
    </PatientActionBar>
  </template>
</PatientPageShell>

<PatientPageShell v-else-if="template && currentGroup" class="questionnaire-page">
  <template #header>
    <PatientStageHeader v-bind="patientStages.questionnaire" />
  </template>

  <QuestionnaireProgress ... />

  <PatientCard>
    <p class="group-eyebrow">当前分组</p>
    <h2>{{ currentGroup.group_title }}</h2>
    <p>{{ currentGroup.group_description }}</p>
  </PatientCard>

  <QuestionCard ... />

  <template #aside>
    <PatientTipCard v-if="validationError" tone="warning">
      {{ validationError }}
    </PatientTipCard>
    <PatientTipCard v-if="submitError" tone="warning">
      {{ submitError }}
    </PatientTipCard>
  </template>

  <template #actions>
    <PatientActionBar>
      <!-- 保留上一组 / 下一步 / 提交逻辑 -->
    </PatientActionBar>
  </template>
</PatientPageShell>
```

Keep these behaviors unchanged:

- `loadTemplate()`
- `isGroupComplete()`
- `submitQuestionnaire(...)`
- missing session redirect to `/patient/welcome`
- submit success route to `/patient/capture-guide`
- load failure uses page级错误卡而不是空白页
- submit failure preserves current answers and reuses current submit action for重试

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/questionnaire-view.spec.ts
```

Expected: PASS with existing pagination/submission assertions still green.

- [ ] **Step 5: Commit**

Run:

```bash
rtk git add frontend/src/views/patient/QuestionnaireView.vue frontend/src/tests/views/questionnaire-view.spec.ts
rtk git commit -m "refactor(frontend): 统一动态问卷页面外层骨架"
```

---

## Chunk 3: 采集链路迁移

### Task 5: 统一采集页与摄像头预览组件

**Files:**
- Modify: `frontend/src/views/patient/CaptureView.vue`
- Modify: `frontend/src/components/capture/CameraPreview.vue`
- Modify: `frontend/src/tests/views/capture-view.spec.ts`
- Modify: `frontend/src/tests/components/camera-preview.spec.ts`

- [ ] **Step 1: Write the failing test**

Extend `capture-view.spec.ts` and, if button labels change, `camera-preview.spec.ts`:

```ts
expect(wrapper.find('.patient-page-shell').exists()).toBe(true)
expect(wrapper.text()).toContain('实时采集舌象图片')
expect(wrapper.text()).toContain('摄像头')
expect(wrapper.text()).toContain('返回采集准备')
```

Keep the upload failure assertion:

```ts
expect(wrapper.text()).toContain('上传失败')
expect(push).not.toHaveBeenCalled()
```

And keep component-level capture-state assertions:

```ts
expect(wrapper.text()).toContain('请允许摄像头权限后重试')
expect(wrapper.text()).toContain('重新开启摄像头')
expect(wrapper.text()).toContain('使用示例舌象图片')
expect(wrapper.text()).toContain('第四步：舌象采集')
expect(wrapper.text()).toContain('请保持稳定')
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/capture-view.spec.ts src/tests/components/camera-preview.spec.ts
```

Expected: FAIL because `CaptureView` is not using the shared shell and the copy/layout assertions are missing.

- [ ] **Step 3: Write minimal implementation**

Refactor `CaptureView.vue` to:

- use `PatientPageShell` + `PatientStageHeader`
- place `CameraPreview` inside a `PatientCard`
- place neutral/success/error messages inside `PatientTipCard`
- add a visible “返回采集准备” secondary action that routes to `/patient/capture-guide`
- keep `uploadCapture(store.sessionId, imageBase64)` behavior unchanged
- while `uploading === true`, show a visible “请保持稳定，正在处理当前图像” neutral/loading hint and keep the camera area as the primary visual block

Lock the `CameraPreview.vue` contract as follows:

- component-internal states: camera starting, permission denied, unavailable, timeout, reauthorize action
- parent-page states: upload pending, upload success, upload failure, route back to guide
- emit contract remains `captured(imageBase64: string)`

Tune `CameraPreview.vue` styles to align with the theme:

```vue
<section class="capture-panel">
  <div class="preview-stage">...</div>
  <PatientTipCard v-if="cameraError === 'permission_denied'" tone="warning">
    请允许摄像头权限后重试
  </PatientTipCard>
  <div class="action-row">...</div>
</section>
```

Do not leave this as an optional branch in implementation: even if `CameraPreview.vue` stays self-contained, it must expose the same permission/unavailable/timeout copy, reauthorize button, and fallback image action defined above.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/capture-view.spec.ts src/tests/components/camera-preview.spec.ts
```

Expected: PASS with camera access, timeout, demo image and upload failure coverage intact.

- [ ] **Step 5: Commit**

Run:

```bash
rtk git add frontend/src/views/patient/CaptureView.vue frontend/src/components/capture/CameraPreview.vue frontend/src/tests/views/capture-view.spec.ts frontend/src/tests/components/camera-preview.spec.ts
rtk git commit -m "feat(frontend): 统一患者端采集页面与相机样式"
```

### Task 6: 统一确认上传页并补齐失败提示

**Files:**
- Create: `frontend/src/tests/views/capture-confirm-view.spec.ts`
- Modify: `frontend/src/views/patient/CaptureConfirmView.vue`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/tests/views/capture-confirm-view.spec.ts`:

```ts
it('confirms the selected capture and routes to analyzing', async () => {
  vi.mocked(selectCapture).mockResolvedValue({})
  store.sessionId = 3
  store.latestCapture = {
    capture_id: 8,
    quality_status: 'good',
    image_base64: 'data:image/png;base64,preview',
  }

  const wrapper = mount(CaptureConfirmView, { global: { plugins: [pinia] } })
  await wrapper.get('button.primary').trigger('click')
  await flushPromises()

  expect(selectCapture).toHaveBeenCalledWith(3, 8)
  expect(push).toHaveBeenCalledWith('/patient/analyzing')
})

it('shows a retryable error message when confirming upload fails', async () => {
  vi.mocked(selectCapture).mockRejectedValue(new Error('Request failed: 500'))
  ...
  expect(wrapper.text()).toContain('确认失败')
  expect(push).not.toHaveBeenCalled()
  expect(wrapper.find('img').exists()).toBe(true)
})

it('keeps the preview visible and disables buttons while confirming', async () => {
  vi.mocked(selectCapture).mockImplementation(() => new Promise(() => {}))
  ...
  expect(wrapper.find('img').exists()).toBe(true)
  expect(wrapper.get('button.primary').attributes('disabled')).toBeDefined()
})

it('routes back to capture when user chooses retake', async () => {
  ...
  await wrapper.get('button.secondary').trigger('click')
  expect(push).toHaveBeenCalledWith('/patient/capture')
})

it('keeps the shared shell and stage copy visible on confirm screen', async () => {
  ...
  expect(wrapper.find('.patient-page-shell').exists()).toBe(true)
  expect(wrapper.text()).toContain('第五步：确认上传')
})

it('allows retrying confirm after a failure without losing preview', async () => {
  vi.mocked(selectCapture)
    .mockRejectedValueOnce(new Error('Request failed: 500'))
    .mockResolvedValueOnce({})
  ...
  await wrapper.get('button.primary').trigger('click')
  await flushPromises()
  await wrapper.get('button.primary').trigger('click')
  await flushPromises()
  expect(selectCapture).toHaveBeenCalledTimes(2)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/capture-confirm-view.spec.ts
```

Expected: FAIL because the page currently has no error handling and no unified status presentation.

- [ ] **Step 3: Write minimal implementation**

Update `CaptureConfirmView.vue`:

```ts
const submitting = ref(false)
const errorMessage = ref('')

async function confirmCapture() {
  if (!store.sessionId || !store.latestCapture) {
    router.push('/patient/welcome')
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await selectCapture(store.sessionId, store.latestCapture.capture_id)
    store.status = 'tongue_confirmed'
    router.push('/patient/analyzing')
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? `确认失败：${error.message}` : '确认失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
```

And restructure template into:

- `PatientStageHeader`
- preview `PatientCard`
- quality hint `PatientTipCard`
- `PatientActionBar` with “重新拍摄 / 确认并分析”
- uploading state keeps preview visible and disables both actions until request resolves

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/capture-confirm-view.spec.ts
```

Expected: PASS for both success and failure paths.

- [ ] **Step 5: Commit**

Run:

```bash
rtk git add frontend/src/views/patient/CaptureConfirmView.vue frontend/src/tests/views/capture-confirm-view.spec.ts
rtk git commit -m "feat(frontend): 统一患者端确认上传页面交互"
```

### Task 7: 验证采集链路连续跳转

**Files:**
- Create: `frontend/src/tests/views/patient-capture-flow.spec.ts`
- Verify only: `frontend/src/views/patient/CaptureGuideView.vue`
- Verify only: `frontend/src/views/patient/CaptureView.vue`
- Verify only: `frontend/src/views/patient/CaptureConfirmView.vue`

- [ ] **Step 1: Write the failing integration test**

Create `frontend/src/tests/views/patient-capture-flow.spec.ts`:

```ts
it('navigates from capture guide to capture confirm and supports retake', async () => {
  ...
  expect(push).toHaveBeenCalledWith('/patient/capture')
  ...
  expect(push).toHaveBeenCalledWith('/patient/capture-confirm')
  ...
  expect(push).toHaveBeenCalledWith('/patient/capture')
  ...
  expect(push).toHaveBeenCalledWith('/patient/analyzing')
})
```

- [ ] **Step 2: Run the new integration test and related smoke tests**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/welcome-capture-guide.spec.ts src/tests/views/capture-view.spec.ts src/tests/views/capture-confirm-view.spec.ts src/tests/views/patient-capture-flow.spec.ts
```

Expected: PASS, covering `CaptureGuideView -> CaptureView -> CaptureConfirmView` 的主要跳转与关键失败态。

- [ ] **Step 3: Finalize the integration harness**

If the new flow test fails only because mocks/stubs are incomplete, complete the router push mock, `CameraPreview` emit stub, and `selectCapture` mock sequence inside `patient-capture-flow.spec.ts` until the test expresses the full forward-and-retake chain without changing product behavior.

- [ ] **Step 4: Commit**

Run:

```bash
rtk git add frontend/src/tests/views/welcome-capture-guide.spec.ts frontend/src/tests/views/capture-view.spec.ts frontend/src/tests/views/capture-confirm-view.spec.ts frontend/src/tests/views/patient-capture-flow.spec.ts
rtk git commit -m "test(frontend): 补齐患者端采集链路冒烟用例"
```

---

## Chunk 4: 分析、结果、结束页与总验证

### Task 8: 用统一状态卡重做分析页，并显式覆盖失败态

**Files:**
- Create: `frontend/src/tests/views/analyzing-view.spec.ts`
- Modify: `frontend/src/views/patient/AnalyzingView.vue`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/tests/views/analyzing-view.spec.ts`:

```ts
it('stores analysis result and routes to result page', async () => {
  vi.mocked(analyzeSession).mockResolvedValue({
    session_id: 9,
    primary_constitution: 'qi_deficiency',
    secondary_constitution: null,
    confidence_level: 'high',
    risk_level: 'low',
    score_breakdown: { qi_deficiency: 9 },
    report: {
      tongue_color: '舌色偏淡',
      coating_color: '苔白',
      diet_advice: '饮食以温和为主',
    },
  })
  ...
  expect(push).toHaveBeenCalledWith('/patient/result')
})

it('renders a visible failure state instead of throwing when analysis fails', async () => {
  vi.mocked(analyzeSession).mockRejectedValue(new Error('Request failed: 500'))
  ...
  expect(wrapper.text()).toContain('分析暂未完成')
  expect(wrapper.text()).toContain('返回采集确认')
  expect(push).not.toHaveBeenCalledWith('/patient/result')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/analyzing-view.spec.ts
```

Expected: FAIL because `AnalyzingView` currently has no guarded failure state.

- [ ] **Step 3: Write minimal implementation**

Refactor `AnalyzingView.vue` to:

- render `PatientPageShell` + `PatientStageHeader`
- use `PatientStatusCard` for `"正在分析"` and `"分析暂未完成"`
- add a `PatientTipCard` beneath the status card to explain the current processing step or failure recovery hint
- keep existing `analyzeSession(store.sessionId)` call
- catch request failure and show a local error action that routes to `/patient/capture-confirm`

Example:

```ts
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  if (!store.sessionId) {
    router.push('/patient/welcome')
    return
  }

  try {
    const response = await analyzeSession(store.sessionId)
    store.result = { ...mapResponseToStoreResult(response) }
    store.status = 'completed'
    router.push('/patient/result')
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? `分析暂未完成：${error.message}` : '分析暂未完成，请稍后重试'
  } finally {
    loading.value = false
  }
})
```

Do **not** add a new polling loop or a global timeout state machine in this task.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/analyzing-view.spec.ts
```

Expected: PASS for both success and failure states.

- [ ] **Step 5: Commit**

Run:

```bash
rtk git add frontend/src/views/patient/AnalyzingView.vue frontend/src/tests/views/analyzing-view.spec.ts
rtk git commit -m "feat(frontend): 统一患者端分析状态页"
```

### Task 9: 重构结果页与结束页，并补齐收尾动作

**Files:**
- Modify: `frontend/src/views/patient/ResultView.vue`
- Modify: `frontend/src/views/patient/FinishView.vue`
- Modify: `frontend/src/tests/views/result-view.spec.ts`
- Create: `frontend/src/tests/views/finish-view.spec.ts`
- Create: `frontend/src/tests/views/patient-result-finish-flow.spec.ts`
- Modify: `frontend/src/tests/e2e/patient-admin-smoke.spec.ts`

- [ ] **Step 1: Write the failing test**

Extend `result-view.spec.ts` and create `finish-view.spec.ts`:

```ts
expect(wrapper.text()).toContain('主要体质')
expect(wrapper.text()).toContain('调理建议')
expect(wrapper.find('.patient-page-shell').exists()).toBe(true)
expect(wrapper.text()).toContain('重新问诊')

it('shows fallback copy when evidence or advice fields are partially missing', () => {
  store.result = {
    primary_constitution: 'qi_deficiency',
    confidence_level: 'medium',
    tongue_features: [],
    report: {
      diet_advice: '',
    },
  }
  ...
  expect(wrapper.text()).toContain('舌象特征待补充')
})

it('switches to a result error state when primary constitution is missing', () => {
  store.result = null
  ...
  expect(wrapper.text()).toContain('结果暂未就绪')
  expect(wrapper.text()).toContain('返回分析页')
})

it('resets store and routes from finish page back to welcome', async () => {
  store.status = 'completed'
  const wrapper = mount(FinishView, { global: { plugins: [pinia] } })
  await wrapper.get('button.primary').trigger('click')
  expect(push).toHaveBeenCalledWith('/patient/welcome')
})

it('starts a new consultation from finish secondary action', async () => {
  ...
  await wrapper.get('button.secondary').trigger('click')
  expect(push).toHaveBeenCalledWith('/patient/profile')
})

it('routes from result view to finish and restart actions with store reset', async () => {
  ...
  await resultWrapper.get('button.primary').trigger('click')
  expect(push).toHaveBeenCalledWith('/patient/finish')
  await resultWrapper.get('button.secondary').trigger('click')
  expect(push).toHaveBeenCalledWith('/patient/profile')
})
```

Assert the required “重新问诊” secondary action also routes to `/patient/profile` after reset.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/result-view.spec.ts src/tests/views/finish-view.spec.ts src/tests/e2e/patient-admin-smoke.spec.ts
```

Expected: FAIL because the old result/finish pages do not yet match the unified shell and copy.

- [ ] **Step 3: Write minimal implementation**

Refactor `ResultView.vue` into three visible sections:

```vue
<PatientPageShell>
  <template #header>
    <PatientStageHeader v-bind="patientStages.result" />
  </template>

  <PatientCard>
    <h2>主要体质</h2>
    <p>{{ store.result.primary_constitution }}</p>
    <p>置信度：{{ store.result?.confidence_level ?? '未知' }}</p>
  </PatientCard>

  <PatientCard>
    <h3>结果依据</h3>
    <ul>
      <li v-for="item in evidenceItems" :key="item">{{ item }}</li>
    </ul>
  </PatientCard>

  <PatientCard>
    <h3>调理建议</h3>
    <p>{{ adviceItems.diet }}</p>
    <p v-if="adviceItems.routine">{{ adviceItems.routine }}</p>
    <p v-if="adviceItems.emotion">{{ adviceItems.emotion }}</p>
  </PatientCard>

  <template #actions>
    <PatientActionBar>
      <button class="primary" @click="finishConsultation">完成</button>
      <button class="secondary" @click="restartConsultation">重新问诊</button>
    </PatientActionBar>
  </template>
</PatientPageShell>
```

Before rendering the success view, gate on the core conclusion:

```ts
const hasPrimaryConclusion = computed(() => Boolean(store.result?.primary_constitution))
```

If `hasPrimaryConclusion` is false, render a `PatientStatusCard tone="error"` with:

- title: `结果暂未就绪`
- description: `请返回分析页重新进入，或直接重新问诊`
- actions: `返回分析页` and `重新问诊`

Implementation detail to lock down:

- `finishConsultation()` routes to `/patient/finish`
- `restartConsultation()` resets the consultation store, then routes to `/patient/profile`

Refactor `FinishView.vue` to:

- use `PatientPageShell` + `PatientStageHeader`
- use `PatientStatusCard tone="success"` as the main completion card
- add one `PatientTipCard` for后续建议，例如“若正式使用请在光线稳定环境下再次采集”
- keep `goHome()` reset + `/patient/welcome`
- add `restartConsultation()` reset + `/patient/profile` as a required secondary action

Update `patient-admin-smoke.spec.ts` only as needed so fixture-based result rendering still passes.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/views/result-view.spec.ts src/tests/views/finish-view.spec.ts src/tests/e2e/patient-admin-smoke.spec.ts
```

Expected: PASS with result and finish flow working on the new shell.

- [ ] **Step 5: Commit**

Run:

```bash
rtk git add frontend/src/views/patient/ResultView.vue frontend/src/views/patient/FinishView.vue frontend/src/tests/views/result-view.spec.ts frontend/src/tests/views/finish-view.spec.ts frontend/src/tests/e2e/patient-admin-smoke.spec.ts
rtk git commit -m "feat(frontend): 统一患者端结果与结束页面风格"
```

### Task 10: 做全量前端回归并准备交付

**Files:**
- Verify only: `frontend/src/views/patient/*.vue`
- Verify only: `frontend/src/components/patient/*.vue`
- Verify only: `frontend/src/tests/**/*`

- [ ] **Step 1: Run focused test batches**

Run:

```bash
rtk npm --prefix frontend run test -- src/tests/components/patient-shell.spec.ts src/tests/components/patient-layout.spec.ts src/tests/views/profile-view.spec.ts src/tests/views/questionnaire-view.spec.ts src/tests/views/capture-view.spec.ts src/tests/views/capture-confirm-view.spec.ts src/tests/views/analyzing-view.spec.ts src/tests/views/result-view.spec.ts src/tests/views/welcome-capture-guide.spec.ts src/tests/views/finish-view.spec.ts src/tests/views/patient-capture-flow.spec.ts src/tests/views/patient-result-finish-flow.spec.ts
```

Expected: PASS for all patient-facing unit tests.

- [ ] **Step 2: Run the full frontend test suite**

Run:

```bash
rtk npm --prefix frontend run test
```

Expected: PASS with all existing and new Vitest suites green.

- [ ] **Step 3: Run the production build**

Run:

```bash
rtk npm --prefix frontend run build
```

Expected: PASS and Vite outputs the production bundle without type/runtime build errors.

- [ ] **Step 4: Manual browser verification**

Run the dev server if needed:

```bash
rtk npm --prefix frontend run dev
```

Then verify in the in-app browser:

- first set viewport to a mobile baseline around `360px`
- follow the real flow from `/patient/welcome` to `/patient/finish`
- repeat a lightweight visual pass at a tablet baseline around `768px`

Expected: all pages share the same visual language, mobile and tablet widths both preserve the four-part hierarchy, and the patient flow still routes end to end.

- [ ] **Step 5: Commit**

Run:

```bash
rtk git add frontend
rtk git commit -m "test(frontend): 完成患者端页面统一回归验证"
```
