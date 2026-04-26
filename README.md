# Intelligent Traditional Chinese Medicine Consultation System

智能中医问诊系统 MVP 项目仓库。当前版本面向**诊所单机演示**场景，提供：

- 患者端：基础信息录入、体质问答、舌象采集、结果展示
- 后端：会话管理、问卷评分、舌象抓拍、分析编排
- 后台端：问诊记录列表、记录详情基础查看

## 技术栈

- 后端：FastAPI + SQLModel + SQLite
- 前端：Vue 3 + Pinia + Vue Router + Vitest
- 分析：规则评分 + 基础舌象特征提取

## 目录结构

- `backend/`：FastAPI 后端代码与测试
- `frontend/`：Vue 3 前端代码与测试
- `config/`：问卷、评分、置信度、风险与建议模板
- `docs/`：设计文档与实施计划
- `scripts/`：开发与演示辅助脚本
- `data/`：运行时数据库、图片与演示数据

## 安装依赖

### 后端

```powershell
uv sync --dev
```

### 前端

```powershell
npm --prefix frontend install
```

## 本地开发

### 启动前后端

```powershell
./scripts/dev.ps1
```

### 先生成演示数据再启动

```powershell
./scripts/dev.ps1 -SeedDemoData
```

## 测试

### 后端

```powershell
uv run pytest backend/tests -q
```

### 前端

```powershell
npm --prefix frontend run test
```

## 当前状态

当前仓库已具备：

- 会话创建与持久化
- 问卷评分
- 舌象抓拍与基础质量检测
- 分析编排与后台记录 API
- 患者端与后台端页面骨架

## 演示账号

当前后台为演示骨架，登录页仅作占位说明，后续可扩展为真实认证流程。
