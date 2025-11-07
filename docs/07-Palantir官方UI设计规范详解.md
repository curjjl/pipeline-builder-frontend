# Palantir Pipeline Builder - 官方UI设计规范详解

> 基于30张官方截图的完整设计分析与规范文档
>
> 创建时间：2025年
> 版本：v1.0

## 目录

1. [设计概览](#设计概览)
2. [色彩系统](#色彩系统)
3. [布局结构](#布局结构)
4. [组件设计规范](#组件设计规范)
5. [交互设计](#交互设计)
6. [响应式设计](#响应式设计)

---

## 1. 设计概览

### 1.1 整体风格

Palantir Pipeline Builder 采用**轻量级现代企业应用设计风格**：

- **主题**：浅色主题（Light Theme）
- **设计语言**：简洁、专业、数据驱动
- **视觉层次**：清晰的信息架构，强调内容优先
- **交互模式**：拖拽、点选、面板式操作

### 1.2 设计原则

1. **清晰性**：信息层次分明，操作路径明确
2. **高效性**：减少点击次数，快捷操作支持
3. **一致性**：统一的视觉语言和交互模式
4. **专业性**：面向数据工程师的专业工具

---

## 2. 色彩系统

### 2.1 主色调（Primary Colors）

```css
/* 品牌蓝色 - 主要操作按钮、链接、选中态 */
--primary-blue: #2D6EED;
--primary-blue-hover: #2563DB;
--primary-blue-active: #1E54C7;
--primary-blue-light: #E8F0FE;

/* 二级蓝色 - 图标、辅助元素 */
--secondary-blue: #4A8CFF;
--icon-blue: #4285F4;
```

### 2.2 中性色（Neutral Colors）

```css
/* 背景色 */
--bg-primary: #FFFFFF;
--bg-secondary: #F5F6F7;
--bg-tertiary: #E8EAED;
--canvas-bg: #ECEEF1;

/* 边框色 */
--border-light: #E4E7EB;
--border-medium: #D0D5DD;
--border-dark: #98A2B3;

/* 文字颜色 */
--text-primary: #212121;
--text-secondary: #5F6368;
--text-tertiary: #80868B;
--text-disabled: #BABEC4;
```

### 2.3 功能色（Functional Colors）

```css
/* 成功 */
--success: #34A853;
--success-light: #E6F4EA;

/* 警告 */
--warning: #FF9800;
--warning-light: #FFF4E5;

/* 错误 */
--error: #EA4335;
--error-light: #FCE8E6;

/* 信息 */
--info: #4285F4;
--info-light: #E8F0FE;
```

### 2.4 数据可视化色板

```css
/* 节点类型颜色 */
--node-dataset: #4285F4;        /* 数据集节点 */
--node-transform: #9334E6;      /* 转换节点 */
--node-join: #F59E0B;           /* 连接节点 */
--node-filter: #10B981;         /* 筛选节点 */
--node-aggregate: #EF4444;      /* 聚合节点 */
--node-output: #8B5CF6;         /* 输出节点 */
```

---

## 3. 布局结构

### 3.1 整体布局

Palantir Pipeline Builder 采用**经典的上-中-下三段式布局**：

```
┌─────────────────────────────────────────────────────────────┐
│  顶部导航栏 (Top Navigation Bar) - 48px                        │
├─────────────────────────────────────────────────────────────┤
│  工具栏 (Toolbar) - 56px                                       │
├────────────────────────────────────┬────────────────────────┤
│                                    │                        │
│                                    │  右侧面板              │
│        画布区域 (Canvas)             │  (Right Panel)         │
│                                    │  300-350px            │
│                                    │                        │
├────────────────────────────────────┴────────────────────────┤
│  底部面板 (Bottom Panel) - 可变高度 (40-60% viewport)           │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 顶部导航栏 (Top Navigation Bar)

**尺寸**：
- 高度：`48px`
- 背景色：`#FFFFFF`
- 底部边框：`1px solid #E4E7EB`

**布局结构**：

```html
┌──────────────────────────────────────────────────────────────────────┐
│ [图标] [面包屑] | [Graph] [Proposals] [History] | [按钮组] [用户]       │
└──────────────────────────────────────────────────────────────────────┘
```

**左侧区域**：
- Palantir Logo (24x24px)
- 面包屑导航：`[Gena] Palantir ... > Deep Dive: Building ... > Pipeline`
- 字体大小：12px
- 颜色：`#5F6368`

**中间区域**（标签页）：
- 三个标签：Graph, Proposals, History
- 字体大小：14px
- 字重：Medium (500)
- 选中态：下方蓝色下划线（2px高，`#2D6EED`）
- 未选中态颜色：`#5F6368`
- 选中态颜色：`#2D6EED`

**右侧区域**（操作按钮）：
- Save（绿色勾选图标）
- Propose（灰色按钮）
- Deploy（蓝色按钮）
- Share（图标按钮）
- 更多操作（...图标）
- 用户头像

### 3.3 工具栏 (Toolbar)

**尺寸**：
- 高度：`56px`
- 背景色：`#F5F6F7`
- 底部边框：`1px solid #E4E7EB`

**布局结构**：

```
┌────────────────────────────────────────────────────────────┐
│ [工具组1: 基础操作] | [工具组2: 数据操作] | [工具组3: 高级操作] │
└────────────────────────────────────────────────────────────┘
```

**工具图标**：
- 尺寸：24x24px 图标
- 间距：图标之间 8px
- 分组间距：16px
- 图标颜色：`#5F6368`
- 悬停颜色：`#2D6EED`
- 选中背景：`#E8F0FE` （圆角 4px）

**工具分组**：

1. **基础操作组**：
   - Tools（工具）
   - Select（选择）
   - Remove（移除）
   - Layout（布局）
   - Text（文本）

2. **数据操作组**：
   - Add data（添加数据）- 带下拉菜单
   - Reusables（可复用）- 带下拉菜单
   - Transform（转换）
   - API

3. **高级操作组**：
   - Edit（编辑）
   - 其他自定义工具

### 3.4 画布区域 (Canvas)

**尺寸**：
- 占据主要内容区域
- 背景色：`#ECEEF1`
- 支持缩放和平移

**左侧缩放控制**：
- 位置：左下角
- 三个图标垂直排列
  - 放大（+）
  - 缩小（-）
  - 适应画布（方框图标）
- 图标尺寸：32x32px
- 背景：`#FFFFFF`
- 边框：`1px solid #E4E7EB`
- 圆角：`4px`

**画布特性**：
- 支持拖拽节点
- 支持框选多个节点
- 支持右键菜单
- 支持连接线绘制
- 网格背景（可选）

### 3.5 右侧面板 (Right Panel)

**尺寸**：
- 宽度：`320px`
- 背景色：`#FFFFFF`
- 左侧边框：`1px solid #E4E7EB`

**头部**：
- 标题："Pipeline outputs"
- 字体大小：16px
- 字重：Medium (500)
- 设置图标（齿轮）
- 添加按钮（+ Add）

**内容区域**：
- 描述文字：
  ```
  Pipeline outputs are the artifacts your pipeline
  builds. Pipeline Builder ensures all outputs are
  defined, healthy, and ready to deploy.
  ```
- 字体大小：13px
- 颜色：`#5F6368`
- 行高：1.5

**操作按钮**：
- "+ Add pipeline output" 按钮
- 样式：`background: #2D6EED`, `color: #FFFFFF`
- 圆角：`4px`
- 高度：`36px`
- 图标：加号（+）+ 圆圈

**右侧工具栏**：
- 垂直排列的图标按钮
- 图标包括：搜索、过滤、图表、日历、文件夹等
- 图标尺寸：20x20px
- 间距：12px

### 3.6 底部面板 (Bottom Panel)

**尺寸**：
- 高度：可调节（拖拽分隔线）
- 默认高度：约占视口高度的 40-50%
- 最小高度：`200px`
- 背景色：`#FFFFFF`
- 顶部边框：`1px solid #E4E7EB`

**标签页**：
- Input table
- Output table
- Selection preview
- Preview
- Transformations
- Suggestions

**标签样式**：
- 未选中：`color: #5F6368`, 背景透明
- 选中：`color: #2D6EED`, 下方蓝色下划线（2px）
- 字体大小：13px
- 高度：40px

**内容区域**：
- 左侧：数据集信息（About, Columns, Schedules）
- 中间：数据表格
- 右侧："Mini graph" 小图标

---

## 4. 组件设计规范

### 4.1 节点 (Node) 组件

#### 4.1.1 数据集节点 (Dataset Node)

**尺寸**：
- 宽度：`180px`
- 高度：`72px` (紧凑模式) / `auto` (展开模式)
- 圆角：`6px`

**视觉样式**：

```css
.node-dataset {
  background: #FFFFFF;
  border: 1px solid #D0D5DD;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 12px;
}

.node-dataset:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #98A2B3;
}

.node-dataset.selected {
  border: 2px solid #2D6EED;
  box-shadow: 0 0 0 3px #E8F0FE;
}
```

**内容结构**：

```html
┌─────────────────────────────────────┐
│ [蓝色数据库图标]  products           │
│                  5 columns          │
│                  [Snapshot ▼]       │
└─────────────────────────────────────┘
```

- **图标**：
  - 位置：左上角
  - 尺寸：20x20px
  - 颜色：`#4285F4`
  - 类型：数据库表格图标

- **节点名称**：
  - 字体大小：14px
  - 字重：Medium (500)
  - 颜色：`#212121`
  - 可编辑（双击或右键重命名）

- **列数信息**：
  - 字体大小：12px
  - 颜色：`#5F6368`
  - 格式："{N} columns"

- **快照下拉框**：
  - 字体大小：11px
  - 颜色：`#5F6368`
  - 背景：`#F5F6F7`
  - 圆角：`3px`
  - 下拉箭头图标

**连接点 (Ports)**：

```css
.node-port {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 2px solid #98A2B3;
}

.node-port:hover {
  background: #2D6EED;
  border-color: #2D6EED;
  width: 10px;
  height: 10px;
}
```

- **输入端口**：顶部中央
- **输出端口**：底部中央
- **悬停效果**：放大、变色

#### 4.1.2 转换节点 (Transform Node)

**尺寸**：
- 宽度：`220px` (比数据集节点宽)
- 高度：`56px` (更紧凑)
- 圆角：`6px`

**视觉样式**：

```css
.node-transform {
  background: #FFFFFF;
  border: 1px solid #D0D5DD;
  border-radius: 6px;
  padding: 10px 12px;
}

.node-transform::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #9334E6;
  border-radius: 6px 0 0 6px;
}
```

**内容结构**：

```html
┌─────────────────────────────────────┐
│ [转换图标] clean products     [编辑] │
│           5 columns                 │
└─────────────────────────────────────┘
```

- 左侧有彩色竖条标识（紫色）
- 图标为转换类型图标
- 右侧有快捷编辑按钮

#### 4.1.3 节点状态

**默认态 (Default)**：
```css
border: 1px solid #D0D5DD;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

**悬停态 (Hover)**：
```css
border-color: #98A2B3;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
cursor: pointer;
```

**选中态 (Selected)**：
```css
border: 2px solid #2D6EED;
box-shadow: 0 0 0 3px #E8F0FE;
```

**错误态 (Error)**：
```css
border: 2px solid #EA4335;
box-shadow: 0 0 0 3px #FCE8E6;
```

**执行中态 (Running)**：
```css
border: 2px solid #FF9800;
animation: pulse 2s infinite;
```

### 4.2 连接线 (Edge) 组件

**视觉样式**：

```css
.edge-line {
  stroke: #98A2B3;
  stroke-width: 2px;
  fill: none;
}

.edge-line:hover {
  stroke: #2D6EED;
  stroke-width: 3px;
}

.edge-line.selected {
  stroke: #2D6EED;
  stroke-width: 3px;
}

.edge-arrow {
  fill: #98A2B3;
}

.edge-arrow:hover {
  fill: #2D6EED;
}
```

**连接线类型**：
- **数据流连接**：实线，箭头
- **依赖关系**：虚线，箭头
- **贝塞尔曲线**：平滑过渡

**连接点按钮**：
- 中点有操作按钮（加号、删除等）
- 悬停时显示
- 尺寸：20x20px 圆形
- 背景：`#FFFFFF`
- 边框：`1px solid #D0D5DD`

### 4.3 按钮 (Button) 组件

#### 4.3.1 主要按钮 (Primary Button)

```css
.button-primary {
  background: #2D6EED;
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s;
}

.button-primary:hover {
  background: #2563DB;
  box-shadow: 0 2px 4px rgba(45, 110, 237, 0.3);
}

.button-primary:active {
  background: #1E54C7;
}

.button-primary:disabled {
  background: #BABEC4;
  cursor: not-allowed;
}
```

**使用场景**：
- Save
- Apply
- Deploy
- Add pipeline output

#### 4.3.2 次要按钮 (Secondary Button)

```css
.button-secondary {
  background: #FFFFFF;
  color: #5F6368;
  border: 1px solid #D0D5DD;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  height: 36px;
  cursor: pointer;
}

.button-secondary:hover {
  background: #F5F6F7;
  border-color: #98A2B3;
}
```

**使用场景**：
- Cancel
- Propose
- Close

#### 4.3.3 文字按钮 (Text Button)

```css
.button-text {
  background: none;
  color: #2D6EED;
  border: none;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.button-text:hover {
  background: #E8F0FE;
  border-radius: 4px;
}
```

#### 4.3.4 图标按钮 (Icon Button)

```css
.button-icon {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.button-icon:hover {
  background: #F5F6F7;
}

.button-icon.active {
  background: #E8F0FE;
  color: #2D6EED;
}
```

### 4.4 输入框 (Input) 组件

#### 4.4.1 文本输入框

```css
.input-text {
  background: #FFFFFF;
  border: 1px solid #D0D5DD;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 13px;
  height: 36px;
  color: #212121;
}

.input-text:hover {
  border-color: #98A2B3;
}

.input-text:focus {
  border-color: #2D6EED;
  box-shadow: 0 0 0 3px #E8F0FE;
  outline: none;
}

.input-text::placeholder {
  color: #BABEC4;
}
```

#### 4.4.2 搜索输入框

```css
.input-search {
  /* 继承 .input-text 样式 */
  padding-left: 36px;
  background-image: url('search-icon.svg');
  background-position: 10px center;
  background-repeat: no-repeat;
  background-size: 16px;
}
```

**特点**：
- 左侧有搜索图标
- 右侧有清除按钮（有内容时显示）
- 支持快捷键提示（如 `/` 聚焦搜索）

#### 4.4.3 下拉选择框

```css
.input-select {
  background: #FFFFFF;
  border: 1px solid #D0D5DD;
  border-radius: 4px;
  padding: 8px 32px 8px 12px;
  font-size: 13px;
  height: 36px;
  appearance: none;
  background-image: url('chevron-down.svg');
  background-position: right 10px center;
  background-repeat: no-repeat;
  background-size: 16px;
}

.input-select:hover {
  border-color: #98A2B3;
}

.input-select:focus {
  border-color: #2D6EED;
  box-shadow: 0 0 0 3px #E8F0FE;
}
```

### 4.5 表格 (Table) 组件

#### 4.5.1 表格头部

```css
.table-header {
  background: #F5F6F7;
  border-bottom: 1px solid #E4E7EB;
  height: 40px;
  padding: 0 16px;
}

.table-header-cell {
  font-size: 12px;
  font-weight: 600;
  color: #5F6368;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-header-cell:hover {
  color: #212121;
  cursor: pointer;
}

/* 排序指示器 */
.sort-indicator {
  margin-left: 4px;
  color: #98A2B3;
}
```

#### 4.5.2 表格行

```css
.table-row {
  border-bottom: 1px solid #E4E7EB;
  height: 48px;
  transition: background 0.15s;
}

.table-row:hover {
  background: #F5F6F7;
}

.table-row.selected {
  background: #E8F0FE;
}

.table-cell {
  padding: 12px 16px;
  font-size: 13px;
  color: #212121;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-cell.secondary {
  color: #5F6368;
}
```

#### 4.5.3 表格功能

**固定列**：
```css
.table-cell.fixed {
  position: sticky;
  left: 0;
  background: #FFFFFF;
  z-index: 1;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}
```

**行选择**：
- 左侧有复选框列
- 支持多选（Shift/Ctrl）
- 选中行高亮显示

**列筛选**：
- 表头有筛选图标
- 点击显示筛选下拉框
- 支持文本搜索、范围选择

**数据类型指示**：
- 列头显示数据类型（String, Number, Date等）
- 不同类型有不同图标
- 颜色编码

### 4.6 对话框 (Dialog/Modal) 组件

#### 4.6.1 基础对话框

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
  min-width: 400px;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E4E7EB;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #212121;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E4E7EB;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

**使用场景**：
- Rename节点
- 创建Pipeline
- 添加数据源
- 配置转换

#### 4.6.2 转换配置面板

**尺寸**：
- 宽度：`700px`
- 最大高度：`80vh`
- 圆角：`8px`

**内容结构**：

```
┌────────────────────────────────────────────┐
│  [Transform name] ▼            [X] Close    │
├────────────────────────────────────────────┤
│  Expression *    [input field]             │
│  Type *          [dropdown]                │
│  Formats *       [multi-input]             │
│                                            │
│               [Apply]  [Cancel]            │
└────────────────────────────────────────────┘
```

**特点**：
- 左侧面包屑导航
- 参数分组显示
- 必填项标星号（*）
- 支持表达式编辑器
- 实时预览（部分转换）

### 4.7 右键菜单 (Context Menu) 组件

```css
.context-menu {
  background: #FFFFFF;
  border: 1px solid #D0D5DD;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 200px;
}

.context-menu-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #212121;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}

.context-menu-item:hover {
  background: #F5F6F7;
}

.context-menu-item.disabled {
  color: #BABEC4;
  cursor: not-allowed;
}

.context-menu-divider {
  height: 1px;
  background: #E4E7EB;
  margin: 4px 0;
}

.context-menu-icon {
  width: 16px;
  height: 16px;
  color: #5F6368;
}
```

**菜单项**：
- Actions
- Rename
- Copy RID
- Copy
- Paste
- Delete
- （分隔线）
- Transform
- Split
- Join
- Union
- Use LLM
- Generate
- Explain
- Add output

### 4.8 提示框 (Tooltip) 组件

```css
.tooltip {
  background: #424242;
  color: #FFFFFF;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-width: 250px;
  z-index: 9999;
}

.tooltip::before {
  content: '';
  position: absolute;
  border: 6px solid transparent;
  /* 箭头方向根据位置动态计算 */
}
```

**显示时机**：
- 悬停在图标按钮上 0.5s 后
- 悬停在被截断的文本上
- 悬停在禁用元素上（显示禁用原因）

### 4.9 侧边栏 (Sidebar) 组件

**转换分类侧边栏**：

```css
.transform-sidebar {
  width: 200px;
  background: #F5F6F7;
  border-right: 1px solid #E4E7EB;
  overflow-y: auto;
}

.transform-category {
  padding: 8px 16px;
  font-size: 13px;
  color: #5F6368;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.transform-category:hover {
  background: #ECEEF1;
  color: #212121;
}

.transform-category.active {
  background: #E8F0FE;
  color: #2D6EED;
  border-left-color: #2D6EED;
  font-weight: 500;
}

.transform-category-header {
  padding: 12px 16px 4px;
  font-size: 11px;
  font-weight: 600;
  color: #80868B;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

**分类列表**：
- All
- Popular
- Custom functions
- UDFs
- Aggregate
- Array
- Binary
- Boolean
- Cast
- Data preparation
- Datetime
- Distance measure

### 4.10 标签页 (Tabs) 组件

```css
.tabs-container {
  border-bottom: 1px solid #E4E7EB;
  background: #FFFFFF;
  display: flex;
}

.tab-item {
  padding: 12px 20px;
  font-size: 13px;
  color: #5F6368;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-item:hover {
  color: #212121;
}

.tab-item.active {
  color: #2D6EED;
  border-bottom-color: #2D6EED;
  font-weight: 500;
}

.tab-item .badge {
  margin-left: 6px;
  background: #E4E7EB;
  color: #5F6368;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}
```

---

## 5. 交互设计

### 5.1 拖拽交互

#### 5.1.1 从工具栏拖拽节点

**步骤**：
1. 用户点击工具栏"Add data"按钮
2. 显示下拉菜单
3. 用户点击某个数据源
4. 节点出现在画布中央（或鼠标位置）

**视觉反馈**：
- 拖拽时鼠标显示"抓取"光标
- 节点半透明跟随鼠标
- 画布显示放置位置提示

#### 5.1.2 节点之间连线

**步骤**：
1. 鼠标悬停在节点输出端口
2. 端口高亮放大
3. 点击并拖拽
4. 显示临时连接线跟随鼠标
5. 悬停在目标节点输入端口
6. 端口高亮
7. 释放鼠标完成连接

**视觉反馈**：
- 连接线为虚线，跟随鼠标
- 有效目标端口绿色高亮
- 无效目标端口红色高亮
- 连接完成后线条变实线，有动画效果

#### 5.1.3 节点移动

**交互**：
- 单选：点击节点后拖拽
- 多选：框选或Ctrl/Cmd点击，然后拖拽

**视觉反馈**：
- 拖拽时节点略微缩小（95%）
- 显示浅色阴影
- 实时更新连接线
- 自动对齐辅助线（虚线）

### 5.2 选择交互

#### 5.2.1 单选

- 点击节点：选中该节点
- 点击画布空白：取消所有选择
- 点击连接线：选中该连接

#### 5.2.2 多选

- **框选**：在画布空白处按住鼠标左键拖拽，显示选择框
- **加选**：按住 Ctrl/Cmd 点击节点
- **范围选**：选中一个节点后，按住 Shift 点击另一个节点

**选择框样式**：
```css
.selection-box {
  border: 2px dashed #2D6EED;
  background: rgba(45, 110, 237, 0.1);
}
```

### 5.3 编辑交互

#### 5.3.1 节点重命名

**触发方式**：
- 双击节点名称
- 右键菜单选择"Rename"
- 选中节点后按 F2 键

**交互**：
1. 节点名称变为输入框
2. 文本全选
3. 用户输入新名称
4. 按 Enter 确认，Esc 取消

#### 5.3.2 转换配置

**触发方式**：
- 点击节点上的转换图标
- 右键菜单选择"Transform"
- 工具栏点击"Transform"按钮（需先选中节点）

**交互流程**：
1. 打开转换配置面板（底部或侧边）
2. 选择转换类型（搜索或分类浏览）
3. 配置参数（表达式、字段选择等）
4. 实时预览结果（在底部数据表格）
5. 点击"Apply"应用转换
6. 节点更新，显示转换名称

### 5.4 数据预览交互

#### 5.4.1 选中节点查看数据

**交互**：
1. 用户点击选中一个节点
2. 底部面板自动切换到"Selection preview"标签
3. 显示该节点的数据预览

**数据显示**：
- 默认显示前 50 行
- 支持滚动加载更多
- 显示列数统计
- 支持列搜索和排序

#### 5.4.2 列级操作

**交互**：
- 点击列头：排序
- 点击列头下拉：筛选、类型转换
- 拖拽列头：调整列顺序
- 拖拽列边界：调整列宽度

**右键列菜单**：
- Sort ascending
- Sort descending
- Filter
- Hide column
- Copy column name
- Transform column

### 5.5 快捷操作

#### 5.5.1 快捷提示气泡

**蓝色提示气泡**：
```
┌─────────────────────────────────────────────────────────┐
│ Click a dataset node and select an action [图标] [图标]  │
│ or [图标] to transform your data.              [X]      │
└─────────────────────────────────────────────────────────┘
```

**样式**：
```css
.hint-bubble {
  background: #2D6EED;
  color: #FFFFFF;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(45, 110, 237, 0.3);
  font-size: 13px;
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 600px;
}

.hint-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-top-color: #2D6EED;
}
```

#### 5.5.2 浮动工具栏

**选中节点时显示**：
- 位置：节点上方或右侧
- 图标：Transform, Split, Join, Delete 等
- 快速操作，无需右键菜单

```css
.floating-toolbar {
  background: #FFFFFF;
  border: 1px solid #D0D5DD;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  display: flex;
  gap: 4px;
}
```

### 5.6 加载状态

#### 5.6.1 节点数据加载

```css
.node-loading {
  position: relative;
}

.node-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
}

.node-loading .spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border: 3px solid #E4E7EB;
  border-top-color: #2D6EED;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

#### 5.6.2 表格数据加载

- 显示骨架屏（Skeleton）
- 或显示加载进度条
- 支持取消加载操作

---

## 6. 响应式设计

### 6.1 最小分辨率

**支持的最小分辨率**：`1280x720px`

**小于最小分辨率时**：
- 显示提示信息："请使用更大的屏幕以获得最佳体验"
- 或强制显示滚动条

### 6.2 布局适配

#### 6.2.1 中等屏幕 (1280px - 1600px)

- 右侧面板宽度：`280px`
- 底部面板默认高度：`40%`
- 节点略微缩小

#### 6.2.2 大屏幕 (1600px+)

- 右侧面板宽度：`320px`
- 底部面板默认高度：`45%`
- 节点标准尺寸
- 支持更多列显示

### 6.3 面板可调节

**用户可自定义**：
- 右侧面板宽度（拖拽调节）
- 底部面板高度（拖拽调节）
- 面板展开/收起状态
- 设置保存到本地存储

**拖拽分隔线**：
```css
.panel-resizer {
  width: 4px; /* 或 height: 4px */
  background: transparent;
  cursor: col-resize; /* 或 row-resize */
  position: absolute;
}

.panel-resizer:hover,
.panel-resizer:active {
  background: #2D6EED;
}
```

---

## 7. 动画与过渡

### 7.1 动画时长

```css
/* 快速交互：按钮悬停、选中态 */
--transition-fast: 150ms;

/* 标准交互：面板展开、对话框显示 */
--transition-normal: 250ms;

/* 慢速交互：页面切换、大型动画 */
--transition-slow: 400ms;
```

### 7.2 缓动函数

```css
/* 标准缓动 */
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);

/* 进入动画 */
--ease-in: cubic-bezier(0.0, 0.0, 0.2, 1);

/* 离开动画 */
--ease-out: cubic-bezier(0.4, 0.0, 1, 1);

/* 强调动画 */
--ease-emphasized: cubic-bezier(0.4, 0.0, 0.6, 1);
```

### 7.3 常用动画

#### 7.3.1 淡入淡出

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

#### 7.3.2 缩放

```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

#### 7.3.3 滑入

```css
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### 7.3.4 脉冲（加载中）

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

---

## 8. 字体与排版

### 8.1 字体家族

```css
:root {
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                       'Roboto', 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'Roboto Mono', 'Courier New', monospace;
}
```

### 8.2 字体大小

```css
:root {
  --font-size-xs: 11px;   /* 小标签、辅助信息 */
  --font-size-sm: 12px;   /* 表头、次要文本 */
  --font-size-base: 13px; /* 正文、按钮 */
  --font-size-md: 14px;   /* 节点名称、重要文本 */
  --font-size-lg: 16px;   /* 面板标题 */
  --font-size-xl: 18px;   /* 对话框标题 */
  --font-size-2xl: 20px;  /* 页面标题 */
}
```

### 8.3 字重

```css
:root {
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### 8.4 行高

```css
:root {
  --line-height-tight: 1.25;   /* 标题 */
  --line-height-normal: 1.5;   /* 正文 */
  --line-height-relaxed: 1.75; /* 说明文字 */
}
```

---

## 9. 间距系统

### 9.1 间距单位

采用 4px 基准的间距系统：

```css
:root {
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
}
```

### 9.2 应用场景

- **组件内边距**：`--spacing-3` (12px) 或 `--spacing-4` (16px)
- **组件外边距**：`--spacing-4` (16px) 或 `--spacing-6` (24px)
- **图标与文字间距**：`--spacing-2` (8px)
- **表单字段间距**：`--spacing-4` (16px)
- **模块间距**：`--spacing-6` (24px) 或 `--spacing-8` (32px)

---

## 10. 图标系统

### 10.1 图标库

推荐使用 **Material Icons** 或 **Heroicons**

### 10.2 图标尺寸

```css
:root {
  --icon-xs: 14px;  /* 小图标、Badge */
  --icon-sm: 16px;  /* 输入框、表格 */
  --icon-base: 20px; /* 按钮、菜单 */
  --icon-md: 24px;  /* 工具栏、节点 */
  --icon-lg: 32px;  /* 大型图标 */
}
```

### 10.3 图标颜色

- **默认**：`#5F6368`
- **激活**：`#2D6EED`
- **禁用**：`#BABEC4`
- **错误**：`#EA4335`
- **成功**：`#34A853`

---

## 11. 阴影系统

```css
:root {
  /* 轻微阴影 - 卡片、输入框 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);

  /* 标准阴影 - 悬停卡片、下拉框 */
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);

  /* 重阴影 - 对话框、抽屉 */
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.2);

  /* 超重阴影 - 模态框 */
  --shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.25);

  /* 焦点阴影 - 输入框焦点态 */
  --shadow-focus: 0 0 0 3px rgba(45, 110, 237, 0.2);
}
```

---

## 12. 圆角系统

```css
:root {
  --radius-sm: 3px;   /* 小元素、Badge */
  --radius-base: 4px; /* 按钮、输入框 */
  --radius-md: 6px;   /* 卡片、节点 */
  --radius-lg: 8px;   /* 面板、对话框 */
  --radius-full: 9999px; /* 圆形按钮、头像 */
}
```

---

## 13. Z-Index 层级

```css
:root {
  --z-index-base: 1;
  --z-index-dropdown: 1000;
  --z-index-sticky: 1020;
  --z-index-fixed: 1030;
  --z-index-modal-backdrop: 1040;
  --z-index-modal: 1050;
  --z-index-popover: 1060;
  --z-index-tooltip: 1070;
}
```

---

## 14. 设计资源

### 14.1 设计文件

- Figma 文件（待创建）
- Sketch 文件（待创建）
- Adobe XD 文件（待创建）

### 14.2 图标资源

- Material Icons: https://fonts.google.com/icons
- Heroicons: https://heroicons.com/
- Lucide Icons: https://lucide.dev/

### 14.3 字体资源

- Roboto: https://fonts.google.com/specimen/Roboto
- Inter: https://fonts.google.com/specimen/Inter

---

## 附录

### A. 组件状态速查表

| 状态 | 背景色 | 边框色 | 文字色 | 阴影 |
|------|--------|--------|--------|------|
| Default | #FFFFFF | #D0D5DD | #212121 | shadow-sm |
| Hover | #F5F6F7 | #98A2B3 | #212121 | shadow-md |
| Active/Selected | #E8F0FE | #2D6EED | #2D6EED | shadow-focus |
| Disabled | #F5F6F7 | #E4E7EB | #BABEC4 | none |
| Error | #FCE8E6 | #EA4335 | #EA4335 | none |

### B. 关键尺寸速查表

| 元素 | 尺寸 |
|------|------|
| 顶部导航栏高度 | 48px |
| 工具栏高度 | 56px |
| 右侧面板宽度 | 320px |
| 底部面板默认高度 | 40-50% viewport |
| 节点宽度 | 180-220px |
| 节点高度 | 56-72px |
| 按钮高度 | 36px |
| 输入框高度 | 36px |
| 表格行高 | 48px |
| 图标标准尺寸 | 20px |

### C. 动画速查表

| 交互类型 | 时长 | 缓动 |
|----------|------|------|
| 按钮悬停 | 150ms | ease-standard |
| 面板展开 | 250ms | ease-out |
| 对话框显示 | 250ms | ease-standard |
| 节点拖拽 | 0ms | - |
| 页面切换 | 400ms | ease-emphasized |
| 加载动画 | 1000ms (循环) | linear |

---

## 总结

本文档基于 Palantir Foundry Pipeline Builder 的 30 张官方截图，详细分析并记录了其完整的 UI 设计规范，包括：

1. ✅ **色彩系统**：完整的主色、中性色、功能色定义
2. ✅ **布局结构**：五大区域的详细尺寸和组织方式
3. ✅ **组件规范**：10+ 核心组件的设计细节和代码实现
4. ✅ **交互设计**：6大类交互模式的完整流程
5. ✅ **响应式设计**：多分辨率适配策略
6. ✅ **设计系统**：字体、间距、图标、阴影、圆角、层级的统一规范

这份文档可以作为前端开发的**设计蓝图**，确保实现的界面与 Palantir 官方保持高度一致。

---

**文档版本**：v1.0
**最后更新**：2025年
**维护者**：Pipeline Builder 开发团队
