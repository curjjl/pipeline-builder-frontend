# Pipeline Builder 改进计划

基于 Palantir Foundry Pipeline Builder 官方文档的功能对比分析

## 📅 2025-11-11 分析报告

### ✅ 已实现功能对比

#### 核心图形界面 ✓
- [x] 基于 AntV X6 的可视化画布
- [x] 节点拖拽和连接
- [x] 平移和缩放 (Space + 拖拽, Ctrl + 滚轮)
- [x] 小地图导航
- [x] 自动布局算法 (拓扑排序)

#### 节点系统 ✓
- [x] Dataset 节点 (数据源输入)
- [x] Transform 节点 (数据转换)
- [x] Join 节点 (多输入端口，双数据源连接)
- [x] Output 节点 (结果输出)

#### 交互功能 ✓
- [x] 节点选中/取消选中
- [x] 节点右键菜单
- [x] 边的交互工具 (删除按钮)
- [x] 撤销/重做 (Ctrl+Z / Ctrl+Y)
- [x] 全选 (Ctrl+A)
- [x] 删除 (Delete/Backspace)

#### 多视图支持 ✓
- [x] Graph 视图 (编辑)
- [x] Proposals 视图
- [x] History 视图

---

## 🎯 待实现功能（按优先级）

### 🔴 高优先级

#### 1. 增强框选功能
**官方特性**：
- Shift + 拖拽进行多选
- 快速切换平移和框选模式

**当前状态**：
- ✅ Selection 插件已启用
- ⚠️ 需要优化交互体验

**改进方案**：
```typescript
// 在 GraphCanvas.vue 中优化
selection: {
  enabled: true,
  multiple: true,
  rubberband: true,  // 橡皮筋框选
  movable: true,
  showNodeSelectionBox: true,  // 显示选择框
  modifiers: 'shift'  // Shift 键激活
}
```

#### 2. 完善复制粘贴功能
**官方特性**：
- Cmd/Ctrl + C/V 复制粘贴节点
- 可在同一 pipeline 或不同 deployment 之间复制
- 复制整个 pipeline 的部分或全部

**当前状态**：
- ✅ 快捷键已绑定
- ⚠️ 复制后粘贴偏移量需优化
- ❌ 缺少视觉反馈

**改进方案**：
```typescript
// 优化粘贴偏移
graph.bindKey(['ctrl+v', 'meta+v'], () => {
  if (!graph.isClipboardEmpty()) {
    const cells = graph.paste({ offset: 40 })  // 增加偏移
    graph.cleanSelection()
    graph.select(cells)

    // 添加提示
    message.success(`Pasted ${cells.length} node(s)`)
  }
  return false
})
```

#### 3. 节点搜索高亮
**改进方案**：
- 添加搜索框到工具栏
- 支持按名称、类型、描述搜索
- 高亮匹配的节点

---

### 🟡 中优先级

#### 4. Find and Replace 功能
**官方特性** (2025 新增)：
- 搜索整个 pipeline graph
- 识别节点并快速替换列
- 按名称、描述、列、引用的参数等搜索

**实现建议**：
```vue
<template>
  <a-modal v-model:open="findReplaceVisible" title="Find and Replace">
    <div class="find-replace-panel">
      <a-input
        v-model:value="searchText"
        placeholder="Search by name, column, parameter..."
        @pressEnter="handleFind"
      />

      <a-input
        v-model:value="replaceText"
        placeholder="Replace with..."
      />

      <a-space>
        <a-button @click="handleFind">Find</a-button>
        <a-button type="primary" @click="handleReplace">Replace</a-button>
        <a-button @click="handleReplaceAll">Replace All</a-button>
      </a-space>

      <div class="search-results">
        <div v-for="result in searchResults" :key="result.id">
          {{ result.nodeName }}: {{ result.match }}
        </div>
      </div>
    </div>
  </a-modal>
</template>
```

#### 5. Pipeline 参数系统
**功能描述**：
- 创建和管理全局参数
- 参数在多个节点中引用
- 支持不同环境的参数配置

**数据结构**：
```typescript
interface PipelineParameter {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'date'
  defaultValue: any
  description: string
}
```

#### 6. 节点验证和健康检查
**功能**：
- 实时验证节点配置
- 显示错误和警告标记
- 构建状态指示器

---

### 🟢 低优先级

#### 7. 增量管道支持
**官方特性**：
- 增量计算，只处理新数据
- 降低计算成本
- 适应数据规模变化

#### 8. 协作功能
**功能**：
- 多用户同时编辑提示
- 变更跟踪
- 评论系统

#### 9. AI 功能集成 (HyperAuto)
**官方特性**：
- AI 动态生成 pipeline
- 智能推荐转换
- 自动优化性能

---

## 🚀 近期实施计划

### Week 1: 交互优化
- [ ] 优化框选模式交互
- [ ] 增强复制粘贴功能
- [ ] 添加节点搜索高亮

### Week 2: 搜索和替换
- [ ] 实现 Find and Replace 面板
- [ ] 支持多条件搜索
- [ ] 批量替换功能

### Week 3: 参数系统
- [ ] 设计参数数据结构
- [ ] 实现参数管理界面
- [ ] 节点中引用参数

### Week 4: 验证和优化
- [ ] 添加节点验证逻辑
- [ ] 实现健康检查
- [ ] 性能优化

---

## 📝 技术债务

1. **TypeScript 类型安全**
   - 完善所有组件的类型定义
   - 避免使用 `any` 类型

2. **错误处理**
   - 统一错误处理机制
   - 用户友好的错误提示

3. **单元测试**
   - 为核心组件添加测试
   - 提高代码覆盖率

4. **文档完善**
   - API 文档
   - 用户使用手册
   - 开发者指南

---

## 🎨 UI/UX 优化

### 视觉设计
- [ ] 统一颜色系统
- [ ] 改进图标库
- [ ] 响应式布局优化

### 动画和过渡
- [ ] 节点添加动画
- [ ] 连线动画效果
- [ ] 加载状态优化

### 可访问性
- [ ] 键盘导航支持
- [ ] 屏幕阅读器友好
- [ ] 高对比度模式

---

## 📚 参考资料

- [Palantir Pipeline Builder 官方文档](https://www.palantir.com/docs/foundry/pipeline-builder/overview)
- [AntV X6 文档](https://x6.antv.vision/)
- [Vue 3 最佳实践](https://vuejs.org/guide/best-practices/)

---

*最后更新: 2025-11-11*
*维护者: Pipeline Builder Team*
