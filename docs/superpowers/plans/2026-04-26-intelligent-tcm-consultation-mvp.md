# 智能中医问诊系统 MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个可在诊所单机运行的智能中医自助问诊 MVP，完成患者问答、舌象采集、规则判定、结果展示与后台记录查看闭环。

**Architecture:** 前端使用单一 Vue 3 应用承载 patient/admin 两套路由，后端使用 FastAPI + SQLModel + SQLite 提供会话、问答、采集、分析与后台查询 API。舌象分析首版采用轻量图像质量检测和规则化特征提取，题库、规则与建议模板均通过 YAML 配置驱动。

**Tech Stack:** Vue 3, TypeScript, Vite, Pinia, Vue Router, Element Plus, Vitest, FastAPI, SQLModel, SQLite, OpenCV, Pydantic, Pytest, YAML

---

## Scope Guard

本计划只覆盖设计文档中定义的第一版 MVP，不包含：

- 麦克风听诊
- 脉搏传感器接入
- 云端部署
- 多诊室协同
- 医疗级诊断模型

---

## File Structure Map

### Root

- Create: `.gitignore` — 忽略 Python、Node、SQLite、日志与图像产物
- Create: `README.md` — 项目简介、启动方式、目录说明
- Create: `pyproject.toml` — Python 依赖、pytest 配置、格式化配置
- Create: `scripts/dev.ps1` — 一键启动前后端开发环境
- Create: `scripts/seed_demo_data.py` — 生成演示用患者记录和舌象占位数据

### Backend

- Create: `backend/app/main.py` — FastAPI 入口与路由挂载
- Create: `backend/app/core/config.py` — 环境变量、路径与配置加载
- Create: `backend/app/core/database.py` — SQLite 连接、会话与建表入口
- Create: `backend/app/core/logging.py` — 日志配置
- Create: `backend/app/models/*.py` — 患者、会话、答案、抓拍、特征、结果、报告实体
- Create: `backend/app/schemas/*.py` — API 输入输出模型
- Create: `backend/app/api/routes/*.py` — session/questionnaire/capture/analysis/admin 路由
- Create: `backend/app/repositories/*.py` — 数据访问封装
- Create: `backend/app/services/*.py` — 流程与业务服务
- Create: `backend/app/engines/*.py` — 评分、置信度、风险、建议生成
- Create: `backend/app/utils/image_quality.py` — 亮度、模糊、位置评分
- Create: `backend/app/utils/image_storage.py` — 本地图像保存与命名
- Create: `backend/tests/**/*` — API、服务、规则与图像处理测试

### Frontend

- Create: `frontend/package.json` — Node 依赖与脚本
- Create: `frontend/vite.config.ts` — Vite 构建配置
- Create: `frontend/tsconfig.json` — TypeScript 配置
- Create: `frontend/index.html` — Vite 入口 HTML
- Create: `frontend/src/main.ts` — Vue 启动入口
- Create: `frontend/src/App.vue` — 根组件
- Create: `frontend/src/router/index.ts` — patient/admin 路由定义
- Create: `frontend/src/stores/consultation.ts` — 患者端会话状态
- Create: `frontend/src/api/*.ts` — API 客户端
- Create: `frontend/src/layouts/*.vue` — 患者端与后台布局
- Create: `frontend/src/components/**/*.vue` — 进度条、摄像头预览、记录表格等组件
- Create: `frontend/src/views/patient/*.vue` — 患者端欢迎、问答、采集、结果页面
- Create: `frontend/src/views/admin/*.vue` — 后台登录、记录列表、详情页面
- Create: `frontend/src/tests/**/*.spec.ts` — store、router、组件测试

### Config/Data

- Create: `config/questionnaire.yaml` — 题目与选项
- Create: `config/question_scoring.yaml` — 题目到体质分值映射
- Create: `config/tongue_rules.yaml` — 舌象修正规则
- Create: `config/confidence_rules.yaml` — 置信度判定规则
- Create: `config/risk_rules.yaml` — 风险提示规则
- Create: `config/advice_templates.yaml` — 调理建议模板
- Create: `data/.gitkeep` — 本地图像与数据库目录占位

---

## Chunk 1: 工程骨架与后端基础

### Task 1: 初始化仓库骨架与开发工具

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `pyproject.toml`
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/index.html`
- Create: `scripts/dev.ps1`
- Test: `backend/tests/api/test_health.py`
- Test: `frontend/src/tests/smoke/app-shell.spec.ts`

- [ ] **Step 1: 写后端健康检查失败测试**

```python
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint_returns_ok():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 2: 运行后端测试确认失败**

Run: `uv run pytest backend/tests/api/test_health.py -q`

Expected: FAIL，提示 `ModuleNotFoundError: No module named 'backend.app.main'`

- [ ] **Step 3: 写前端应用壳失败测试**

```ts
import { describe, it, expect } from 'vitest'

describe('app shell', () => {
  it('renders the root app without crashing', async () => {
    const mod = await import('../../App.vue')
    expect(mod.default).toBeTruthy()
  })
})
```

- [ ] **Step 4: 运行前端测试确认失败**

Run: `npm --prefix frontend run test -- src/tests/smoke/app-shell.spec.ts`

Expected: FAIL，提示 `Cannot find module '../../App.vue'`

- [ ] **Step 5: 搭建最小工程骨架**

实现内容：

- 在 `pyproject.toml` 中加入 `fastapi`、`uvicorn`、`sqlmodel`、`pytest`、`opencv-python-headless`、`pyyaml`
- 在 `frontend/package.json` 中加入 `vue`、`vite`、`typescript`、`vitest`、`vue-router`、`pinia`、`element-plus`
- 在 `backend/app/main.py` 中提供最小 FastAPI 应用与 `/api/health`
- 在 `frontend/src/main.ts`、`frontend/src/App.vue` 中提供最小 Vue 应用壳
- 在 `scripts/dev.ps1` 中并行启动 `uv run uvicorn backend.app.main:app --reload` 和 `npm --prefix frontend run dev`

- [ ] **Step 6: 重新运行测试确认通过**

Run: `uv run pytest backend/tests/api/test_health.py -q`

Expected: PASS

Run: `npm --prefix frontend run test -- src/tests/smoke/app-shell.spec.ts`

Expected: PASS

- [ ] **Step 7: 提交**

```bash
git add .gitignore README.md pyproject.toml backend frontend scripts
git commit -m "chore(repo): 初始化问诊系统工程骨架"
```

### Task 2: 建立数据库、基础实体与会话生命周期

**Files:**
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/database.py`
- Create: `backend/app/models/patient.py`
- Create: `backend/app/models/consultation_session.py`
- Create: `backend/app/models/questionnaire_answer.py`
- Create: `backend/app/models/tongue_capture.py`
- Create: `backend/app/models/tongue_feature.py`
- Create: `backend/app/models/constitution_result.py`
- Create: `backend/app/models/result_report.py`
- Create: `backend/app/schemas/session.py`
- Create: `backend/app/repositories/session_repo.py`
- Create: `backend/app/services/session_service.py`
- Create: `backend/app/api/routes/session.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/services/test_session_service.py`
- Test: `backend/tests/api/test_session_routes.py`

- [ ] **Step 1: 写会话服务失败测试**

```python
def test_create_session_sets_created_status(session_service):
    session = session_service.create_session(
        name="张三",
        gender="male",
        age=30,
    )
    assert session.session_status == "created"
    assert session.patient.name == "张三"
```

- [ ] **Step 2: 运行测试确认失败**

Run: `uv run pytest backend/tests/services/test_session_service.py -q`

Expected: FAIL，提示 `fixture 'session_service' not found` 或 `ImportError`

- [ ] **Step 3: 实现最小持久化链路**

实现内容：

- `config.py` 统一定义 `BASE_DIR`、`DATA_DIR`、`DB_PATH`
- `database.py` 提供 SQLite engine、`get_session()`、`create_db_and_tables()`
- 模型中定义患者、问诊会话及关联关系
- `session_service.py` 实现创建会话、推进状态、读取会话
- `session.py` 路由提供 `POST /api/sessions` 与 `GET /api/sessions/{session_id}`

- [ ] **Step 4: 写路由级失败测试**

```python
def test_post_session_returns_created_payload(client):
    response = client.post("/api/sessions", json={
        "name": "李四",
        "gender": "female",
        "age": 28
    })
    body = response.json()
    assert response.status_code == 201
    assert body["session_status"] == "created"
```

- [ ] **Step 5: 运行全量基础测试并修正**

Run: `uv run pytest backend/tests/services/test_session_service.py backend/tests/api/test_session_routes.py -q`

Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add backend/app/core backend/app/models backend/app/schemas backend/app/repositories backend/app/services backend/app/api/routes backend/tests
git commit -m "feat(api): 添加问诊会话与数据持久化基础"
```

---

## Chunk 2: 规则引擎与分析后端

### Task 3: 添加题库配置、问答接口与评分引擎

**Files:**
- Create: `config/questionnaire.yaml`
- Create: `config/question_scoring.yaml`
- Create: `backend/app/schemas/questionnaire.py`
- Create: `backend/app/repositories/questionnaire_repo.py`
- Create: `backend/app/services/questionnaire_service.py`
- Create: `backend/app/engines/questionnaire_scorer.py`
- Create: `backend/app/api/routes/questionnaire.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/engines/test_questionnaire_scorer.py`
- Test: `backend/tests/api/test_questionnaire_routes.py`

- [ ] **Step 1: 写评分引擎失败测试**

```python
def test_questionnaire_scorer_maps_answers_to_constitution_scores():
    answers = {
        "fatigue_level": "often",
        "cold_hands_feet": "always",
    }
    result = score_questionnaire(answers)
    assert result["qi_deficiency"] > result["balanced"]
    assert result["yang_deficiency"] > 0
```

- [ ] **Step 2: 运行测试确认失败**

Run: `uv run pytest backend/tests/engines/test_questionnaire_scorer.py -q`

Expected: FAIL，提示 `NameError: score_questionnaire is not defined`

- [ ] **Step 3: 建立题库与评分配置**

实现内容：

- `questionnaire.yaml` 至少放入欢迎问卷所需 12-18 题
- `question_scoring.yaml` 记录题目编码、选项值、体质权重
- `questionnaire_service.py` 提供读取题库、保存答案、汇总结构化结果
- `questionnaire_scorer.py` 根据配置累计各体质原始分并归一化

- [ ] **Step 4: 写问答 API 失败测试**

```python
def test_submit_answers_returns_questionnaire_summary(client, session_id):
    response = client.post(
        f"/api/sessions/{session_id}/questionnaire",
        json={"answers": [{"question_code": "fatigue_level", "answer_value": "often"}]},
    )
    body = response.json()
    assert response.status_code == 200
    assert body["session_status"] == "questionnaire_completed"
    assert body["summary"]["qi_deficiency"] >= 0
```

- [ ] **Step 5: 实现问答接口并跑测试**

Run: `uv run pytest backend/tests/engines/test_questionnaire_scorer.py backend/tests/api/test_questionnaire_routes.py -q`

Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add config/questionnaire.yaml config/question_scoring.yaml backend/app/schemas/questionnaire.py backend/app/repositories/questionnaire_repo.py backend/app/services/questionnaire_service.py backend/app/engines/questionnaire_scorer.py backend/app/api/routes/questionnaire.py backend/tests
git commit -m "feat(engine): 添加问卷评分引擎与问答接口"
```

### Task 4: 添加舌象抓拍记录、图像质量检测与基础特征提取

**Files:**
- Create: `backend/app/schemas/capture.py`
- Create: `backend/app/repositories/capture_repo.py`
- Create: `backend/app/services/capture_service.py`
- Create: `backend/app/utils/image_quality.py`
- Create: `backend/app/utils/image_storage.py`
- Create: `backend/app/engines/tongue_feature_extractor.py`
- Create: `backend/app/api/routes/capture.py`
- Create: `backend/tests/fixtures/tongue_samples/.gitkeep`
- Test: `backend/tests/utils/test_image_quality.py`
- Test: `backend/tests/engines/test_tongue_feature_extractor.py`
- Test: `backend/tests/api/test_capture_routes.py`

- [ ] **Step 1: 写图像质量检测失败测试**

```python
def test_brightness_score_marks_dark_image_as_poor():
    image = make_solid_image(value=20)
    quality = evaluate_image_quality(image)
    assert quality["quality_status"] == "poor"
    assert quality["brightness_score"] < 0.4
```

- [ ] **Step 2: 运行测试确认失败**

Run: `uv run pytest backend/tests/utils/test_image_quality.py -q`

Expected: FAIL，提示 `ImportError` 或 `evaluate_image_quality` 未定义

- [ ] **Step 3: 实现基础图像工具**

实现内容：

- `image_storage.py` 按 `session_id/date/index` 规则保存图片
- `image_quality.py` 提供亮度、清晰度、位置评分和 `quality_status`
- `capture_service.py` 保存抓拍记录并支持选定最终分析图

- [ ] **Step 4: 写特征提取失败测试**

```python
def test_feature_extractor_outputs_displayable_fields():
    image = make_demo_tongue_image(hue="pale_red", coating="thin_white")
    result = extract_tongue_features(image)
    assert result["tongue_color"] == "pale_red"
    assert result["coating_color"] == "white"
```

- [ ] **Step 5: 实现轻量舌象特征提取与抓拍接口**

实现内容：

- `tongue_feature_extractor.py` 先基于颜色区间、亮度与纹理阈值输出首版特征
- `POST /api/sessions/{session_id}/captures` 接收 base64 或 multipart 图片
- `POST /api/sessions/{session_id}/captures/{capture_id}/select` 标记最终分析图

- [ ] **Step 6: 跑测试确认通过**

Run: `uv run pytest backend/tests/utils/test_image_quality.py backend/tests/engines/test_tongue_feature_extractor.py backend/tests/api/test_capture_routes.py -q`

Expected: PASS

- [ ] **Step 7: 提交**

```bash
git add backend/app/schemas/capture.py backend/app/repositories/capture_repo.py backend/app/services/capture_service.py backend/app/utils backend/app/engines/tongue_feature_extractor.py backend/app/api/routes/capture.py backend/tests
git commit -m "feat(tongue): 添加舌象抓拍与基础特征分析"
```

### Task 5: 编排分析流程、生成结果报告并开放后台查询接口

**Files:**
- Create: `config/tongue_rules.yaml`
- Create: `config/confidence_rules.yaml`
- Create: `config/risk_rules.yaml`
- Create: `config/advice_templates.yaml`
- Create: `backend/app/schemas/analysis.py`
- Create: `backend/app/schemas/admin.py`
- Create: `backend/app/repositories/result_repo.py`
- Create: `backend/app/services/analysis_service.py`
- Create: `backend/app/services/report_service.py`
- Create: `backend/app/services/admin_service.py`
- Create: `backend/app/engines/fusion_engine.py`
- Create: `backend/app/engines/confidence_engine.py`
- Create: `backend/app/engines/risk_engine.py`
- Create: `backend/app/engines/advice_engine.py`
- Create: `backend/app/api/routes/analysis.py`
- Create: `backend/app/api/routes/admin.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/services/test_analysis_service.py`
- Test: `backend/tests/api/test_analysis_routes.py`
- Test: `backend/tests/api/test_admin_routes.py`

- [ ] **Step 1: 写融合分析失败测试**

```python
def test_analysis_service_combines_questionnaire_and_tongue_scores(analysis_service, prepared_session):
    result = analysis_service.run(prepared_session.session_id)
    assert result.primary_constitution in {"qi_deficiency", "yang_deficiency"}
    assert result.confidence_level in {"high", "medium", "low"}
    assert "diet_advice" in result.report.display_payload
```

- [ ] **Step 2: 运行测试确认失败**

Run: `uv run pytest backend/tests/services/test_analysis_service.py -q`

Expected: FAIL，提示 `analysis_service` 未实现

- [ ] **Step 3: 实现分析链路**

实现内容：

- `fusion_engine.py` 按 70/30 规则融合问答与舌象分
- `confidence_engine.py` 基于完整度、图像质量、主次分差生成高/中/低
- `risk_engine.py` 根据重点答案和图像异常生成风险等级
- `advice_engine.py` 根据主体质与候选体质拼接调理建议
- `analysis_service.py` 编排：读会话 -> 读答案/特征 -> 评分 -> 存结果 -> 存快照

- [ ] **Step 4: 写后台查询失败测试**

```python
def test_admin_list_returns_completed_sessions(client, completed_session):
    response = client.get("/api/admin/records")
    body = response.json()
    assert response.status_code == 200
    assert body["items"][0]["session_status"] == "completed"
```

- [ ] **Step 5: 实现分析接口与后台接口**

实现内容：

- `POST /api/sessions/{session_id}/analyze`
- `GET /api/admin/records`
- `GET /api/admin/records/{session_id}`

- [ ] **Step 6: 跑测试确认通过**

Run: `uv run pytest backend/tests/services/test_analysis_service.py backend/tests/api/test_analysis_routes.py backend/tests/api/test_admin_routes.py -q`

Expected: PASS

- [ ] **Step 7: 提交**

```bash
git add config/tongue_rules.yaml config/confidence_rules.yaml config/risk_rules.yaml config/advice_templates.yaml backend/app/schemas/analysis.py backend/app/schemas/admin.py backend/app/repositories/result_repo.py backend/app/services/analysis_service.py backend/app/services/report_service.py backend/app/services/admin_service.py backend/app/engines backend/app/api/routes/analysis.py backend/app/api/routes/admin.py backend/tests
git commit -m "feat(report): 添加结果分析编排与后台查询接口"
```

---

## Chunk 3: 患者端前台实现

### Task 6: 搭建患者端路由、布局与问诊状态管理

**Files:**
- Create: `frontend/src/router/index.ts`
- Create: `frontend/src/stores/consultation.ts`
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/consultation.ts`
- Create: `frontend/src/layouts/PatientLayout.vue`
- Create: `frontend/src/components/common/StepProgress.vue`
- Create: `frontend/src/views/patient/WelcomeView.vue`
- Create: `frontend/src/views/patient/ProfileView.vue`
- Create: `frontend/src/views/patient/QuestionnaireView.vue`
- Modify: `frontend/src/App.vue`
- Test: `frontend/src/tests/router/patient-routes.spec.ts`
- Test: `frontend/src/tests/stores/consultation.spec.ts`

- [ ] **Step 1: 写患者端 store 失败测试**

```ts
import { setActivePinia, createPinia } from 'pinia'
import { useConsultationStore } from '../../stores/consultation'

it('blocks result route before analysis completes', () => {
  setActivePinia(createPinia())
  const store = useConsultationStore()
  store.status = 'questionnaire_completed'
  expect(store.canVisitResult).toBe(false)
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm --prefix frontend run test -- src/tests/stores/consultation.spec.ts`

Expected: FAIL，提示 `useConsultationStore` 不存在

- [ ] **Step 3: 实现前台壳与状态管理**

实现内容：

- `router/index.ts` 定义 `/patient/*` 路由
- `consultation.ts` 保存 session、profile、answers、capture、result、status
- `StepProgress.vue` 根据状态显示当前步骤
- `PatientLayout.vue` 提供统一页头、进度条、主操作区

- [ ] **Step 4: 写路由守卫失败测试**

```ts
it('redirects to welcome when session is missing', async () => {
  const { router } = await buildRouterForTest()
  await router.push('/patient/questionnaire')
  expect(router.currentRoute.value.fullPath).toBe('/patient/welcome')
})
```

- [ ] **Step 5: 实现欢迎页、基础信息页与问答页最小流程**

实现内容：

- 欢迎页显示系统介绍和“开始问诊”
- 基础信息页提交后调用 `POST /api/sessions`
- 问答页加载 `GET /api/questionnaire`（若后端采用此路由）或静态题库 API，并支持分页作答

- [ ] **Step 6: 跑测试确认通过**

Run: `npm --prefix frontend run test -- src/tests/router/patient-routes.spec.ts src/tests/stores/consultation.spec.ts`

Expected: PASS

- [ ] **Step 7: 提交**

```bash
git add frontend/src/router/index.ts frontend/src/stores/consultation.ts frontend/src/api frontend/src/layouts/PatientLayout.vue frontend/src/components/common/StepProgress.vue frontend/src/views/patient frontend/src/tests
git commit -m "feat(patient): 搭建患者端基础流程"
```

### Task 7: 完成舌象采集、分析中页与结果展示页

**Files:**
- Create: `frontend/src/components/capture/CameraPreview.vue`
- Create: `frontend/src/components/result/EvidenceCard.vue`
- Create: `frontend/src/components/result/AdviceCard.vue`
- Create: `frontend/src/views/patient/CaptureGuideView.vue`
- Create: `frontend/src/views/patient/CaptureView.vue`
- Create: `frontend/src/views/patient/CaptureConfirmView.vue`
- Create: `frontend/src/views/patient/AnalyzingView.vue`
- Create: `frontend/src/views/patient/ResultView.vue`
- Create: `frontend/src/views/patient/FinishView.vue`
- Modify: `frontend/src/api/consultation.ts`
- Modify: `frontend/src/stores/consultation.ts`
- Test: `frontend/src/tests/components/camera-preview.spec.ts`
- Test: `frontend/src/tests/views/result-view.spec.ts`

- [ ] **Step 1: 写摄像头预览组件失败测试**

```ts
it('shows guidance message when camera stream is unavailable', async () => {
  const wrapper = mount(CameraPreview, {
    props: { streamError: 'permission_denied' },
  })
  expect(wrapper.text()).toContain('请允许摄像头权限')
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm --prefix frontend run test -- src/tests/components/camera-preview.spec.ts`

Expected: FAIL，提示 `CameraPreview` 不存在

- [ ] **Step 3: 实现采集与分析页面**

实现内容：

- `CaptureGuideView.vue` 展示舌象采集提示
- `CameraPreview.vue` 负责 `getUserMedia`、抓拍、错误提示
- `CaptureView.vue` 调用抓拍 API，并根据质量结果决定是否允许继续
- `CaptureConfirmView.vue` 支持重拍与选定最终图
- `AnalyzingView.vue` 调用 `/analyze` 并轮播“正在整理问答信息”等提示

- [ ] **Step 4: 写结果页失败测试**

```ts
it('renders evidence tags and confidence label', async () => {
  const wrapper = mount(ResultView, {
    global: { plugins: [piniaWithResultState()] },
  })
  expect(wrapper.text()).toContain('置信度')
  expect(wrapper.text()).toContain('舌色偏淡')
})
```

- [ ] **Step 5: 实现结果页与结束页**

实现内容：

- `ResultView.vue` 展示主体质、候选体质、舌象图、依据标签、调理建议、风险提示
- `AdviceCard.vue` 与 `EvidenceCard.vue` 做成通用卡片
- `FinishView.vue` 提供“返回首页”

- [ ] **Step 6: 跑测试确认通过**

Run: `npm --prefix frontend run test -- src/tests/components/camera-preview.spec.ts src/tests/views/result-view.spec.ts`

Expected: PASS

- [ ] **Step 7: 手工烟测一次患者端主流程**

Run: `powershell -NoProfile -Command "./scripts/dev.ps1"`

Expected: 浏览器可完成 欢迎页 -> 基础信息 -> 问答 -> 采集 -> 结果 -> 结束页 闭环

- [ ] **Step 8: 提交**

```bash
git add frontend/src/components/capture frontend/src/components/result frontend/src/views/patient frontend/src/api/consultation.ts frontend/src/stores/consultation.ts frontend/src/tests
git commit -m "feat(patient): 完成舌象采集与结果页联调"
```

---

## Chunk 4: 后台、演示数据与交付收尾

### Task 8: 搭建后台登录、记录列表与详情页

**Files:**
- Create: `frontend/src/layouts/AdminLayout.vue`
- Create: `frontend/src/views/admin/LoginView.vue`
- Create: `frontend/src/views/admin/RecordListView.vue`
- Create: `frontend/src/views/admin/RecordDetailView.vue`
- Create: `frontend/src/components/admin/RecordTable.vue`
- Create: `frontend/src/api/admin.ts`
- Modify: `frontend/src/router/index.ts`
- Test: `frontend/src/tests/views/admin-records.spec.ts`
- Test: `frontend/src/tests/components/record-table.spec.ts`

- [ ] **Step 1: 写后台记录列表失败测试**

```ts
it('shows completed sessions in a table', async () => {
  const wrapper = await mountAdminRecordsWithMocks()
  expect(wrapper.text()).toContain('问诊时间')
  expect(wrapper.text()).toContain('completed')
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm --prefix frontend run test -- src/tests/views/admin-records.spec.ts`

Expected: FAIL，提示 `RecordListView` 不存在

- [ ] **Step 3: 实现后台基础界面**

实现内容：

- `AdminLayout.vue` 统一后台导航
- `LoginView.vue` 做本地固定账号登录（首版可写死 demo 账号）
- `RecordListView.vue` 展示问诊时间、患者、主体质、风险等级
- `RecordDetailView.vue` 展示问答摘要、舌象图、特征、体质评分、结果快照

- [ ] **Step 4: 写记录表组件失败测试**

```ts
it('emits select event when a row is clicked', async () => {
  const wrapper = mount(RecordTable, { props: { items: [demoRecord] } })
  await wrapper.find('tbody tr').trigger('click')
  expect(wrapper.emitted('select')?.length).toBe(1)
})
```

- [ ] **Step 5: 实现后台 API 对接并跑测试**

Run: `npm --prefix frontend run test -- src/tests/views/admin-records.spec.ts src/tests/components/record-table.spec.ts`

Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add frontend/src/layouts/AdminLayout.vue frontend/src/views/admin frontend/src/components/admin/RecordTable.vue frontend/src/api/admin.ts frontend/src/router/index.ts frontend/src/tests
git commit -m "feat(admin): 添加后台记录查看界面"
```

### Task 9: 完成演示数据、运行文档与全链路验收

**Files:**
- Modify: `README.md`
- Create: `backend/tests/api/test_end_to_end_smoke.py`
- Create: `frontend/src/tests/e2e/patient-admin-smoke.spec.ts`
- Create: `scripts/seed_demo_data.py`
- Modify: `scripts/dev.ps1`
- Modify: `docs/superpowers/specs/2026-04-26-intelligent-tcm-consultation-design.md`

- [ ] **Step 1: 写后端端到端烟测失败测试**

```python
def test_patient_flow_smoke(client, demo_image_b64):
    session = client.post("/api/sessions", json={"name": "演示患者", "gender": "female", "age": 35}).json()
    client.post(f"/api/sessions/{session['session_id']}/questionnaire", json={"answers": demo_answers()})
    capture = client.post(f"/api/sessions/{session['session_id']}/captures", json={"image_base64": demo_image_b64}).json()
    client.post(f"/api/sessions/{session['session_id']}/captures/{capture['capture_id']}/select")
    result = client.post(f"/api/sessions/{session['session_id']}/analyze").json()
    assert result["primary_constitution"]
```

- [ ] **Step 2: 运行烟测确认失败**

Run: `uv run pytest backend/tests/api/test_end_to_end_smoke.py -q`

Expected: FAIL，提示至少一个前置接口尚未联通或夹具缺失

- [ ] **Step 3: 完成演示脚本与示例数据**

实现内容：

- `seed_demo_data.py` 生成 3-5 组演示患者、答案和占位舌象
- `scripts/dev.ps1` 增加可选 `-SeedDemoData` 参数
- `README.md` 说明安装、启动、目录、演示账号、常见问题

- [ ] **Step 4: 写前端烟测或关键页面挂载测试**

```ts
it('renders patient result and admin detail from seeded fixtures', async () => {
  const resultWrapper = await mountResultViewWithFixture()
  const adminWrapper = await mountAdminDetailWithFixture()
  expect(resultWrapper.text()).toContain('主要体质')
  expect(adminWrapper.text()).toContain('舌象特征')
})
```

- [ ] **Step 5: 跑最终测试集**

Run: `uv run pytest backend/tests -q`

Expected: PASS

Run: `npm --prefix frontend run test`

Expected: PASS

- [ ] **Step 6: 按设计文档核对 MVP 完整性**

核对清单：

- 患者端流程闭环
- 舌象重拍可用
- 结果页含依据、置信度、风险提示
- 后台可查看历史记录
- README 能指导他人启动项目

- [ ] **Step 7: 提交**

```bash
git add README.md backend/tests frontend/src/tests scripts docs/superpowers/specs/2026-04-26-intelligent-tcm-consultation-design.md
git commit -m "docs(repo): 完善演示文档与全链路验收说明"
```

---

## Execution Notes

- 优先小步提交，不要把多个任务揉成一个大提交。
- 后端接口优先于前端页面，避免前端长时间对着假数据开发。
- 舌象特征提取首版只追求“稳定输出 + 可解释字段”，不要过早优化复杂算法。
- 若后台登录影响节奏，可先用本地固定账号实现，再在后续版本替换为数据库用户表。
- `scripts/seed_demo_data.py` 应生成固定结果，保证演示可重复。

## Ready-to-Run Command Summary

- 后端单测：`uv run pytest backend/tests -q`
- 前端单测：`npm --prefix frontend run test`
- 启动后端：`uv run uvicorn backend.app.main:app --reload`
- 启动前端：`npm --prefix frontend run dev`
- 一键启动：`powershell -NoProfile -Command "./scripts/dev.ps1"`

## Definition of Done

满足以下条件才算本计划完成：

- 患者端可完成“欢迎 -> 基础信息 -> 问答 -> 舌象采集 -> 分析 -> 结果 -> 结束”闭环
- 后台可查看记录列表与详情
- 后端测试与前端测试均通过
- 关键配置文件、脚本、README 齐备
- 演示环境断网时仍可本地运行

Plan complete and saved to `docs/superpowers/plans/2026-04-26-intelligent-tcm-consultation-mvp.md`. Ready to execute?
