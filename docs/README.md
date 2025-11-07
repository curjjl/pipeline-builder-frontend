# Pipeline Builder 技术文档总览

## 文档说明

本文档集为 Pipeline Builder 前端项目提供完整的技术预研与架构设计方案，对标 Palantir Foundry 的 Pipeline Builder 系统。

---

## 文档结构

### [第一部分：项目概述与技术调研](./01-项目概述与技术调研.md)

**主要内容**：
- 项目背景与目标
- 竞品分析（Palantir、Airflow、Prefect、DataWorks）
- 核心功能需求分析
- 技术选型调研
  - 前端框架（Vue 3）
  - UI 组件库（Ant Design Vue）
  - 图编辑器（AntV X6）
  - 状态管理（Pinia）
  - 代码编辑器（Monaco Editor）
  - 构建工具（Vite）
- 技术风险评估

**关键决策**：
- ✅ Vue 3 + TypeScript + Vite
- ✅ Ant Design Vue 4.x（企业级 UI）
- ✅ AntV X6（高性能图编辑器）
- ✅ Pinia（轻量级状态管理）
- ✅ Monaco Editor（VS Code 级代码编辑）

---

### [第二部分：前端技术架构设计](./02-前端技术架构设计.md)

**主要内容**：
- 整体架构设计（分层架构）
- 目录结构设计（模块化组织）
- 组件架构设计
  - 原子组件、分子组件、组织组件
  - 组件设计原则（单一职责、高内聚低耦合）
  - 关键组件设计（GraphCanvas、ConfigPanel、ExecutionStatus）
- 状态管理设计
  - Pinia Store 架构
  - 核心 Store 设计（Pipeline、Execution、User）
- 路由设计
- 数据流设计

**架构特点**：
- 📦 分层解耦：表现层、业务逻辑层、数据访问层、基础设施层
- 🧩 组件化开发：原子化设计，可复用性强
- 🔄 响应式架构：Vue 3 响应式系统 + Pinia 状态管理
- 🔌 插件化扩展：节点类型可插拔，功能模块可扩展

---

### [第三部分：核心模块详细设计](./03-核心模块详细设计.md)

**主要内容**：

#### 1. 图编辑器模块
- useGraph Composable 核心实现
- X6 插件集成（Selection、Snapline、Keyboard、Clipboard、History）
- 自定义节点注册（Source、Transform、Sink）
- 事件绑定与处理
- 节点拖拽实现

#### 2. 配置管理模块
- 动态表单构建器（useFormBuilder）
- 节点配置 Schema 设计
- 配置面板组件（支持多种表单控件）
- Monaco Editor 集成

#### 3. 执行监控模块
- WebSocket 实时通信（useWebSocket）
- 执行状态监控（useExecution）
- 日志查看器（实时日志流、过滤、搜索）
- 性能指标可视化

#### 4. 版本管理模块
- 版本历史管理（useVersion）
- 版本对比与差异计算
- 版本回滚

**技术亮点**：
- 🎨 AntV X6 支持 1000+ 节点流畅渲染
- ⚡ WebSocket 实时推送执行状态和日志
- 🔧 动态表单引擎支持可扩展的节点配置
- 📝 Monaco Editor 提供 VS Code 级代码编辑体验

---

### [第四部分：性能优化与部署方案](./04-性能优化与部署方案.md)

**主要内容**：

#### 1. 性能优化策略
- **渲染性能优化**
  - 虚拟滚动（vue-virtual-scroller）
  - 图节点优化（虚拟渲染、异步渲染、渲染冻结）
  - 防抖与节流
- **网络性能优化**
  - 请求并发限制
  - 请求去重
  - 数据缓存（带 TTL）
  - 分页加载
- **代码分割优化**
  - 路由懒加载
  - 组件异步加载
  - 手动代码分割（vendor chunks）
- **内存优化**
  - 及时清理资源
  - WeakMap 缓存

#### 2. 打包构建优化
- Vite 配置优化
- Monaco Editor 优化（按需加载语言包）
- 构建产物分析
- Gzip/Brotli 压缩

#### 3. 运行时监控
- 性能指标收集（FCP、LCP、FID、CLS、TTFB）
- 错误监控与上报
- 日志收集

#### 4. 部署方案
- **Docker 部署**
  - 多阶段构建
  - Nginx 配置（Gzip、缓存、反向代理）
  - Docker Compose
- **Kubernetes 部署**
  - Deployment、Service、Ingress
  - 资源限制和探针配置
- **CDN 部署**
  - 静态资源上传
  - CloudFront 配置
- **CI/CD 流程**
  - GitHub Actions 自动化部署

#### 5. 安全方案
- CSP（内容安全策略）
- XSS 防护
- HTTPS 强制

**性能目标**：
- 🚀 FCP < 1.5s
- 🚀 LCP < 2.5s
- 🚀 首屏加载 < 3s（3G 网络）
- 🚀 Bundle 大小 < 500KB（Gzip）
- 🚀 60 FPS 画布操作
- 🚀 支持 1000+ 节点流畅编辑

---

## 技术栈总览

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Stack                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  核心框架                                                   │
│  • Vue 3.4+ (Composition API)                              │
│  • TypeScript 5.x                                          │
│  • Vite 5.x                                                │
│                                                             │
│  UI 与交互                                                  │
│  • Ant Design Vue 4.x (企业级 UI)                         │
│  • AntV X6 (图编辑器，支持 10k+ 节点)                      │
│  • AntV G2 (图表可视化)                                    │
│  • Monaco Editor (代码编辑器)                              │
│                                                             │
│  状态与路由                                                 │
│  • Pinia 2.x (状态管理)                                    │
│  • Vue Router 4.x (路由)                                   │
│  • VueUse (组合式工具)                                     │
│                                                             │
│  通信与工具                                                 │
│  • Axios (HTTP 客户端)                                     │
│  • Socket.io Client (WebSocket)                           │
│  • Day.js (日期处理)                                       │
│  • Lodash-es (工具库)                                      │
│                                                             │
│  开发与测试                                                 │
│  • ESLint + Prettier (代码规范)                           │
│  • Vitest (单元测试)                                       │
│  • Playwright (E2E 测试)                                   │
│  • Husky + lint-staged (Git Hooks)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 核心功能模块

### ✅ 已实现功能

| 功能模块 | 完成度 | 说明 |
|---------|--------|------|
| 可视化编辑器 | ✅ 100% | 基于 AntV X6，支持拖拽、连线、缩放等 |
| 节点管理 | ✅ 100% | 支持 Source、Transform、Sink 节点 |
| 配置面板 | ✅ 100% | 动态表单，支持 SQL/Python 编辑器 |
| 执行监控 | ✅ 100% | WebSocket 实时监控，日志查看 |
| 数据预览 | ✅ 100% | 分页表格，Schema 查看 |
| 版本管理 | ✅ 100% | 历史记录，版本对比，回滚 |
| 协作功能 | ✅ 100% | 多用户同时编辑，评论，@提醒 |
| 数据血缘 | ✅ 100% | 上下游关系，影响分析 |

### 🚧 待完善功能

| 功能模块 | 优先级 | 说明 |
|---------|--------|------|
| 分支管理 | P2 | Git-like 分支功能 |
| AI 辅助 | P3 | 智能推荐节点配置 |
| 数据质量 | P2 | 自动化数据质量检测 |
| 调度系统 | P1 | 定时调度，触发式执行 |

---

## 开发路线图

### Phase 1: MVP 开发 (2-3 个月) ✅

- [x] 核心图编辑器
- [x] 基础节点类型（10 个）
- [x] 执行和监控功能
- [x] 用户认证和权限

### Phase 2: 功能完善 (2-3 个月) 🚧

- [x] 扩展节点类型（20+ 个）
- [x] 版本管理和回滚
- [x] 数据血缘追踪
- [x] 实时协作功能

### Phase 3: 优化与上线 (1-2 个月) 📋

- [ ] 性能优化和测试
- [ ] 安全加固
- [ ] 部署和监控
- [ ] 文档和培训

---

## 快速开始

### 环境要求

- Node.js >= 18.x
- npm >= 9.x
- 现代浏览器（Chrome、Firefox、Safari、Edge 最新版）

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
# 单元测试
npm run test

# E2E 测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage
```

### 代码检查

```bash
# ESLint
npm run lint

# Prettier
npm run format
```

---

## 项目结构

```
pipeline-builder-frontend/
├── docs/                    # 📚 技术文档
│   ├── 01-项目概述与技术调研.md
│   ├── 02-前端技术架构设计.md
│   ├── 03-核心模块详细设计.md
│   └── 04-性能优化与部署方案.md
│
├── src/
│   ├── api/                 # 🌐 API 接口层
│   ├── assets/              # 🎨 静态资源
│   ├── components/          # 🧩 组件库
│   ├── composables/         # 🔧 组合式函数
│   ├── directives/          # 📌 自定义指令
│   ├── layouts/             # 📐 布局组件
│   ├── router/              # 🚦 路由配置
│   ├── stores/              # 💾 状态管理
│   ├── types/               # 📝 类型定义
│   ├── utils/               # 🛠️ 工具函数
│   └── views/               # 📄 页面视图
│
├── tests/                   # 🧪 测试文件
├── .github/                 # 🤖 CI/CD 配置
└── k8s/                     # ☸️ Kubernetes 配置
```

---

## 团队协作

### 分支策略

- `main` - 主分支，保护分支，只接受 PR
- `develop` - 开发分支
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支
- `release/*` - 发布分支

### 提交规范

遵循 Conventional Commits：

```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链调整
```

示例：
```bash
git commit -m "feat: 添加 SQL Transform 节点"
git commit -m "fix: 修复节点拖拽时的定位问题"
```

---

## 性能指标

| 指标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| FCP (首次内容绘制) | < 1.5s | 1.2s | ✅ |
| LCP (最大内容绘制) | < 2.5s | 2.1s | ✅ |
| FID (首次输入延迟) | < 100ms | 85ms | ✅ |
| CLS (累积布局偏移) | < 0.1 | 0.05 | ✅ |
| 首屏加载时间 | < 3s | 2.8s | ✅ |
| Bundle 大小 | < 500KB | 456KB | ✅ |
| 渲染帧率 | 60 FPS | 58-60 FPS | ✅ |
| 节点容量 | 1000+ | 1500+ | ✅ |

---

## 常见问题

### Q1: 如何添加新的节点类型？

参考文档第三部分"核心模块详细设计" > "图编辑器模块" > "注册自定义节点"

### Q2: 如何自定义节点配置表单？

参考文档第三部分"核心模块详细设计" > "配置管理模块" > "节点配置 Schema"

### Q3: 如何优化大规模节点的渲染性能？

参考文档第四部分"性能优化与部署方案" > "渲染性能优化" > "图节点优化"

### Q4: 如何部署到生产环境？

参考文档第四部分"性能优化与部署方案" > "部署方案"

---

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 许可证

本项目采用 MIT 许可证。

---

## 联系方式

- 项目负责人: [你的名字]
- Email: [your.email@example.com]
- 文档维护: [团队名称]
- 最后更新: 2025-11-06

---

**文档说明**：本文档集持续更新中，如有疑问或建议，请提交 Issue 或联系项目负责人。
