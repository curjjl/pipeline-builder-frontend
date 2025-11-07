# ⚡ 快速启动指南

## 🎯 当前状态

✅ **项目框架搭建完成**
🔄 **依赖正在安装中**（npm install 运行中）

---

## 📋 检查依赖安装状态

### 选项 1：查看 node_modules 文件夹
```bash
# 检查 node_modules 是否存在且有内容
dir node_modules        # Windows
# 或
ls node_modules         # Linux/Mac
```

### 选项 2：尝试启动
```bash
npm run dev
```
- ✅ 如果成功启动 → 依赖安装完成
- ❌ 如果报错 → 依赖还在安装中，请等待

---

## 🚀 快速启动（3 步）

### 步骤 1：确认依赖已安装
```bash
# 如果 node_modules 文件夹存在且有内容，说明安装完成
```

### 步骤 2：启动开发服务器
```bash
npm run dev
```

### 步骤 3：访问应用
```
自动打开 http://localhost:5173
```

---

## 🎨 你将看到

- ✅ **顶部导航栏**：Pipeline Builder Logo + 用户信息
- ✅ **左侧菜单**：管道列表、执行历史、数据源
- ✅ **主内容区**：管道列表页面（带示例数据）

---

## 🛠️ 常用命令

```bash
npm run dev         # 开发服务器
npm run build       # 生产构建
npm run preview     # 预览构建
npm run lint        # 代码检查
npm run format      # 代码格式化
```

---

## 📂 关键文件

| 文件 | 说明 |
|------|------|
| `src/main.ts` | 应用入口 |
| `src/App.vue` | 根组件 |
| `src/router/index.ts` | 路由配置 |
| `src/stores/modules/` | 状态管理 |
| `src/views/` | 页面组件 |
| `vite.config.ts` | Vite 配置 |

---

## 📖 详细文档

- **完整指南**：[SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **技术文档**：[docs/](./docs/)
- **项目说明**：[README.md](./README.md)

---

## ⚠️ 如果安装失败

```bash
# 清除缓存
npm cache clean --force

# 删除已有的 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

---

## 🎯 下一步做什么？

1. **启动项目**，熟悉页面结构
2. **查看代码**，了解项目架构
3. **阅读文档**，开始核心功能开发
4. **实现图编辑器**（参考 `docs/03-核心模块详细设计.md`）

---

**需要帮助？** 查看 [SETUP_GUIDE.md](./SETUP_GUIDE.md) 获取详细说明
