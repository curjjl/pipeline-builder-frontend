# Pipeline Builder Frontend

基于 Vue 3 + TypeScript + Vite 的企业级数据管道构建平台前端项目。

## 技术栈

- **核心框架**: Vue 3.4+ (Composition API)
- **开发语言**: TypeScript 5.x
- **构建工具**: Vite 5.x
- **UI 框架**: Ant Design Vue 4.x
- **图编辑器**: AntV X6 2.x
- **状态管理**: Pinia 2.x
- **路由管理**: Vue Router 4.x

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 代码检查

```bash
# ESLint 检查
npm run lint

# Prettier 格式化
npm run format
```

## 项目结构

```
pipeline-builder-frontend/
├── docs/                    # 技术文档
├── src/
│   ├── api/                 # API 接口
│   ├── assets/              # 静态资源
│   ├── components/          # 组件
│   ├── composables/         # 组合式函数
│   ├── layouts/             # 布局
│   ├── router/              # 路由
│   ├── stores/              # 状态管理
│   ├── types/               # 类型定义
│   ├── utils/               # 工具函数
│   ├── views/               # 页面
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── public/                  # 公共资源
└── index.html              # HTML 入口

```

## 开发指南

详细的开发指南请查看 [docs](./docs) 目录下的技术文档。

## License

MIT
