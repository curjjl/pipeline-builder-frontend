# Palantir Foundry Pipeline Builder 复刻设计与实现文档

## 文档说明

本文档详细描述如何复刻 Palantir Foundry Pipeline Builder 的界面设计和交互体验，力求还原官方产品的视觉风格和用户体验。

**参考资料**：
- Palantir Foundry 官方文档
- Pipeline Builder 学习教程
- Foundry 视频演示

---

## 第一部分：UI 设计规范

### 1.1 整体视觉风格

#### 设计理念
Palantir Foundry 采用现代化、专业化的企业级设计语言：
- **简洁克制**：去除多余装饰，专注内容
- **数据为先**：突出数据流转和处理过程
- **深色基调**：减少视觉疲劳，适合长时间使用
- **高对比度**：确保信息层次清晰

#### 色彩系统

```less
// 主色调
@primary-color: #4A90E2;          // 蓝色（节点连线、按钮）
@success-color: #52C41A;          // 绿色（成功状态）
@warning-color: #FAAD14;          // 橙色（警告状态）
@error-color: #F5222D;            // 红色（错误状态）
@info-color: #1890FF;             // 信息色

// 背景色（深色主题）
@bg-primary: #1E1E1E;             // 主背景（画布区域）
@bg-secondary: #252525;           // 次级背景（侧边栏）
@bg-tertiary: #2C2C2C;            // 第三级背景（卡片、面板）
@bg-elevated: #303030;            // 浮起元素背景（弹窗、下拉）

// 文字颜色
@text-primary: #E8E8E8;           // 主文字
@text-secondary: #A8A8A8;         // 次要文字
@text-disabled: #5A5A5A;          // 禁用文字
@text-placeholder: #6A6A6A;       // 占位文字

// 边框颜色
@border-color: #3A3A3A;           // 默认边框
@border-color-split: #2A2A2A;     // 分割线
@border-color-hover: #4A4A4A;     // 悬停边框

// 节点类型颜色
@node-input: #4A90E2;             // 数据输入节点（蓝色）
@node-transform: #7B68EE;         // 数据转换节点（紫色）
@node-output: #52C41A;            // 数据输出节点（绿色）
@node-function: #F59E0B;          // 函数节点（橙色）
```

#### 字体系统

```less
// 字体家族
@font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
              'Helvetica Neue', Arial, sans-serif;
@font-family-code: 'Monaco', 'Menlo', 'Courier New', monospace;

// 字体大小
@font-size-xs: 11px;              // 极小文字（提示、标签）
@font-size-sm: 12px;              // 小文字（次要信息）
@font-size-base: 14px;            // 基础文字
@font-size-lg: 16px;              // 大文字（标题）
@font-size-xl: 18px;              // 超大文字（页面标题）
@font-size-xxl: 24px;             // 特大文字

// 行高
@line-height-base: 1.5;
@line-height-compact: 1.2;
```

#### 间距系统

```less
// 标准间距（8px 基准）
@spacing-xs: 4px;                 // 极小间距
@spacing-sm: 8px;                 // 小间距
@spacing-md: 16px;                // 中间距
@spacing-lg: 24px;                // 大间距
@spacing-xl: 32px;                // 超大间距
@spacing-xxl: 48px;               // 特大间距
```

#### 圆角和阴影

```less
// 圆角
@border-radius-sm: 2px;           // 小圆角
@border-radius-base: 4px;         // 基础圆角
@border-radius-lg: 8px;           // 大圆角

// 阴影
@shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
@shadow-md: 0 2px 8px rgba(0, 0, 0, 0.4);
@shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.5);
```

---

### 1.2 页面布局设计

#### 整体布局结构

```
┌────────────────────────────────────────────────────────────────┐
│  Header（顶部导航栏 - 高度 56px）                               │
│  ├─ Logo + Pipeline 名称                                       │
│  ├─ 操作按钮（保存、运行、调度、版本）                           │
│  └─ 用户菜单                                                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────┬─────────────────────────────────┬─────────────┐ │
│  │          │                                 │             │ │
│  │  Left    │         Canvas                  │    Right    │ │
│  │  Panel   │         (主画布区域)             │    Panel    │ │
│  │          │                                 │             │ │
│  │  节点库  │  ┌───────────────────────────┐  │  配置面板   │ │
│  │          │  │                           │  │             │ │
│  │  • Input │  │   [Node1] ──→ [Node2]    │  │  或         │ │
│  │  • Trans │  │      ↓                    │  │             │ │
│  │  • Output│  │   [Node3]                 │  │  数据预览   │ │
│  │          │  │                           │  │             │ │
│  │  (可折叠)│  │                           │  │  (可折叠)   │ │
│  │          │  └───────────────────────────┘  │             │ │
│  │          │                                 │             │ │
│  │  宽220px │         自适应宽度               │   宽400px   │ │
│  │          │                                 │             │ │
│  └──────────┴─────────────────────────────────┴─────────────┘ │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Bottom Panel（底部面板 - 可折叠，高度 240px）                  │
│  ├─ Tabs: 执行日志 | 数据预览 | 性能监控                       │
│  └─ 内容区域                                                   │
└────────────────────────────────────────────────────────────────┘
```

#### 区域说明

**1. Header（顶部栏）**
- 背景色：`@bg-tertiary` (#2C2C2C)
- 高度：56px
- 边框：底部 1px 实线 `@border-color`
- 布局：Flex，左右分布

**2. Left Panel（左侧节点面板）**
- 背景色：`@bg-secondary` (#252525)
- 宽度：220px（可折叠到 48px）
- 边框：右侧 1px 实线 `@border-color`
- 内容：节点分类列表 + 搜索框

**3. Canvas（画布区域）**
- 背景色：`@bg-primary` (#1E1E1E)
- 宽度：自适应
- 网格：10px 点状网格，颜色 `rgba(255,255,255,0.05)`
- 支持缩放、拖拽、框选

**4. Right Panel（右侧面板）**
- 背景色：`@bg-secondary` (#252525)
- 宽度：400px（可折叠到 0）
- 边框：左侧 1px 实线 `@border-color`
- 内容：节点配置 或 数据预览（根据选中状态切换）

**5. Bottom Panel（底部面板）**
- 背景色：`@bg-secondary` (#252525)
- 高度：240px（可折叠到 0）
- 边框：顶部 1px 实线 `@border-color`
- 内容：执行日志、数据预览、性能监控（Tab 切换）

---

### 1.3 组件设计规范

#### 1.3.1 节点（Node）设计

**基础节点样式**：
```
┌─────────────────────────────────────┐
│  ●  Node Name                       │  ← 标题栏（高 32px）
├─────────────────────────────────────┤
│  📊 Description text...             │  ← 内容区（高度自适应）
│                                     │
│  Status: ✓ Configured               │  ← 状态信息
└─────────────────────────────────────┘
  ↑                                 ↑
输入端口                           输出端口
```

**节点尺寸**：
- 最小宽度：180px
- 最小高度：60px
- 圆角：6px
- 边框：2px

**节点状态**：
1. **默认状态**
   - 边框：2px solid `节点类型颜色`
   - 背景：`@bg-tertiary` + 半透明
   - 阴影：无

2. **悬停状态**
   - 边框：2px solid `节点类型颜色`（加亮）
   - 背景：`@bg-tertiary` + 10% 透明度
   - 阴影：`@shadow-sm`

3. **选中状态**
   - 边框：3px solid `@primary-color`
   - 背景：`@bg-tertiary`
   - 阴影：`@shadow-md`
   - 外围：2px 蓝色光晕

4. **运行中状态**
   - 边框：2px solid `@info-color`（闪烁动画）
   - 图标：旋转加载动画

5. **成功状态**
   - 边框：2px solid `@success-color`
   - 图标：绿色对勾

6. **错误状态**
   - 边框：2px solid `@error-color`
   - 背景：红色半透明覆盖
   - 图标：红色感叹号

**节点类型图标**：
```typescript
const nodeIcons = {
  // 数据源
  'database': 'DatabaseOutlined',
  'file': 'FileTextOutlined',
  'api': 'ApiOutlined',

  // 转换
  'transform': 'FunctionOutlined',
  'filter': 'FilterOutlined',
  'join': 'MergeCellsOutlined',
  'aggregate': 'GroupOutlined',

  // 输出
  'output': 'ExportOutlined',
  'export': 'DownloadOutlined'
}
```

#### 1.3.2 连接线（Edge）设计

**线条样式**：
- 颜色：`@primary-color` (#4A90E2)
- 粗细：2px
- 类型：贝塞尔曲线（Bezier）
- 箭头：实心三角形（8px）

**连接线状态**：
1. **默认**：颜色 `#4A90E2`，不透明度 0.6
2. **悬停**：颜色 `#4A90E2`，不透明度 1.0，粗细 3px
3. **选中**：颜色 `#1890FF`，不透明度 1.0，虚线动画
4. **数据流动**：粒子流动画效果（可选）

**连接点（Port）**：
- 尺寸：8px × 8px
- 形状：圆形
- 颜色：与节点边框色相同
- 悬停：放大到 10px，显示工具提示

#### 1.3.3 工具栏（Toolbar）设计

```
┌─────────────────────────────────────────────────────────────┐
│  [◀] [▶] [↶] [↷]  ⎪  [+] [-] [⊡]  ⎪  [▶ Run] [⏸ Pause]   │
│   历史    撤销重做      缩放  适应       运行     暂停       │
└─────────────────────────────────────────────────────────────┘
```

**按钮分组**：
1. **历史操作**：前进、后退、撤销、重做
2. **视图控制**：放大、缩小、适应画布、全屏
3. **执行控制**：运行、暂停、停止、调度
4. **其他操作**：保存、导出、分享

**按钮样式**：
- 尺寸：32px × 32px
- 圆角：4px
- 间距：8px
- 悬停：背景色变化 + 工具提示

#### 1.3.4 节点面板（Node Palette）

```
┌──────────────────────┐
│  🔍 Search nodes... │  ← 搜索框
├──────────────────────┤
│  ▼ Input             │  ← 分类（可折叠）
│     📦 Dataset       │
│     💾 Database      │
│     📄 File          │
│     🌐 API           │
├──────────────────────┤
│  ▼ Transform         │
│     🔧 Function      │
│     🔍 Filter        │
│     🔗 Join          │
│     📊 Aggregate     │
├──────────────────────┤
│  ▼ Output            │
│     💾 Database      │
│     📄 File          │
│     🌐 API           │
└──────────────────────┘
```

**节点项样式**：
- 高度：40px
- 悬停：背景色变化
- 图标：16px，左侧对齐
- 文字：14px，左边距 8px
- 拖拽：半透明跟随光标

#### 1.3.5 配置面板（Config Panel）

```
┌─────────────────────────────────────┐
│  Node Configuration                 │  ← 标题
├─────────────────────────────────────┤
│                                     │
│  Basic Settings                     │  ← 区块标题
│  ┌───────────────────────────────┐  │
│  │ Name: [Transform Data       ] │  │  ← 表单字段
│  │ Description: [Process...    ] │  │
│  └───────────────────────────────┘  │
│                                     │
│  Advanced Settings                  │
│  ┌───────────────────────────────┐  │
│  │ Retry: [3] times              │  │
│  │ Timeout: [300] seconds        │  │
│  └───────────────────────────────┘  │
│                                     │
│  Code Editor                        │
│  ┌───────────────────────────────┐  │
│  │ SELECT * FROM input          │  │  ← 代码编辑器
│  │ WHERE status = 'active'      │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Test] [Save] [Cancel]            │  ← 操作按钮
└─────────────────────────────────────┘
```

**布局特点**：
- 标题：18px 粗体，底部边框
- 区块：24px 上外边距
- 字段：垂直排列，16px 间距
- 按钮：底部固定，右对齐

#### 1.3.6 数据预览（Data Preview）

```
┌─────────────────────────────────────────────────────────┐
│  Data Preview - Transform Node                         │
│  ─────────────────────────────────────────────────────  │
│  Showing 100 of 10,245 rows                            │
├─────────────────────────────────────────────────────────┤
│  │ id    │ name      │ age  │ status   │ created_at │  │
│  ├───────┼───────────┼──────┼──────────┼────────────┤  │
│  │ 1001  │ Alice     │ 28   │ active   │ 2024-01-01 │  │
│  │ 1002  │ Bob       │ 35   │ active   │ 2024-01-02 │  │
│  │ 1003  │ Charlie   │ 42   │ inactive │ 2024-01-03 │  │
│  │ ...   │ ...       │ ...  │ ...      │ ...        │  │
├─────────────────────────────────────────────────────────┤
│  Statistics                                             │
│  • Columns: 5                                          │
│  • Rows: 10,245                                        │
│  • Size: 2.4 MB                                        │
└─────────────────────────────────────────────────────────┘
```

**表格样式**：
- 表头：固定，背景色 `@bg-elevated`
- 行高：36px
- 边框：细线 `@border-color-split`
- 悬停：行背景色变化
- 排序：点击表头排序
- 过滤：列头搜索图标

---

## 第二部分：核心功能实现

### 2.1 节点系统设计

#### 2.1.1 节点类型定义

```typescript
// types/node.ts

export enum NodeCategory {
  INPUT = 'input',           // 数据输入
  TRANSFORM = 'transform',   // 数据转换
  OUTPUT = 'output',         // 数据输出
  FUNCTION = 'function'      // 自定义函数
}

export enum NodeType {
  // Input 类型
  DATASET = 'dataset',              // Foundry Dataset
  DATABASE = 'database',            // 数据库
  FILE = 'file',                    // 文件
  API = 'api',                      // API 接口

  // Transform 类型
  SQL_TRANSFORM = 'sql-transform',  // SQL 转换
  PYTHON = 'python',                // Python 脚本
  FILTER = 'filter',                // 过滤器
  JOIN = 'join',                    // 连接
  UNION = 'union',                  // 合并
  AGGREGATE = 'aggregate',          // 聚合
  PIVOT = 'pivot',                  // 透视
  WINDOW = 'window',                // 窗口函数

  // Output 类型
  OUTPUT_DATASET = 'output-dataset', // 输出到 Dataset
  OUTPUT_DATABASE = 'output-database', // 输出到数据库
  OUTPUT_FILE = 'output-file',       // 输出到文件
}

export interface NodeConfig {
  id: string
  type: NodeType
  category: NodeCategory
  name: string
  description?: string
  icon: string
  color: string

  // 端口配置
  ports: {
    input: PortConfig[]
    output: PortConfig[]
  }

  // 配置表单 Schema
  configSchema: ConfigSchema

  // 默认配置
  defaultConfig: Record<string, any>
}

export interface PortConfig {
  id: string
  name: string
  type: 'dataset' | 'stream' | 'trigger'
  required: boolean
  multiple: boolean  // 是否支持多个输入
}

export interface ConfigSchema {
  fields: ConfigField[]
}

export interface ConfigField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'code' | 'switch' | 'datasource'
  required: boolean
  defaultValue?: any
  options?: Array<{ label: string; value: any }>
  validator?: (value: any) => string | null
  visible?: (formData: Record<string, any>) => boolean
}
```

#### 2.1.2 内置节点配置

```typescript
// config/nodes.ts

import { NodeConfig, NodeCategory, NodeType } from '@/types/node'

export const NODE_CONFIGS: Record<NodeType, NodeConfig> = {
  // ================== Input Nodes ==================

  [NodeType.DATASET]: {
    id: 'dataset',
    type: NodeType.DATASET,
    category: NodeCategory.INPUT,
    name: 'Dataset',
    description: '从 Foundry Dataset 读取数据',
    icon: 'DatabaseOutlined',
    color: '#4A90E2',
    ports: {
      input: [],
      output: [
        {
          id: 'output',
          name: 'Output',
          type: 'dataset',
          required: true,
          multiple: false
        }
      ]
    },
    configSchema: {
      fields: [
        {
          name: 'datasetPath',
          label: 'Dataset Path',
          type: 'datasource',
          required: true
        },
        {
          name: 'branch',
          label: 'Branch',
          type: 'select',
          required: true,
          defaultValue: 'master',
          options: [
            { label: 'master', value: 'master' },
            { label: 'develop', value: 'develop' }
          ]
        },
        {
          name: 'columns',
          label: 'Select Columns',
          type: 'select',
          required: false,
          options: [] // 动态加载
        }
      ]
    },
    defaultConfig: {
      branch: 'master'
    }
  },

  [NodeType.DATABASE]: {
    id: 'database',
    type: NodeType.DATABASE,
    category: NodeCategory.INPUT,
    name: 'Database',
    description: '从数据库读取数据',
    icon: 'DatabaseOutlined',
    color: '#4A90E2',
    ports: {
      input: [],
      output: [{ id: 'output', name: 'Output', type: 'dataset', required: true, multiple: false }]
    },
    configSchema: {
      fields: [
        {
          name: 'connectionId',
          label: 'Database Connection',
          type: 'select',
          required: true,
          options: [] // 从后端加载
        },
        {
          name: 'query',
          label: 'SQL Query',
          type: 'code',
          required: true,
          defaultValue: 'SELECT * FROM table_name LIMIT 1000'
        },
        {
          name: 'schema',
          label: 'Schema',
          type: 'text',
          required: false
        },
        {
          name: 'table',
          label: 'Table',
          type: 'text',
          required: false
        }
      ]
    },
    defaultConfig: {
      query: 'SELECT * FROM table_name LIMIT 1000'
    }
  },

  // ================== Transform Nodes ==================

  [NodeType.SQL_TRANSFORM]: {
    id: 'sql-transform',
    type: NodeType.SQL_TRANSFORM,
    category: NodeCategory.TRANSFORM,
    name: 'SQL Transform',
    description: '使用 SQL 转换数据',
    icon: 'CodeOutlined',
    color: '#7B68EE',
    ports: {
      input: [
        {
          id: 'input',
          name: 'Input',
          type: 'dataset',
          required: true,
          multiple: true // 支持多输入（用于 JOIN）
        }
      ],
      output: [
        {
          id: 'output',
          name: 'Output',
          type: 'dataset',
          required: true,
          multiple: false
        }
      ]
    },
    configSchema: {
      fields: [
        {
          name: 'sql',
          label: 'SQL Query',
          type: 'code',
          required: true,
          defaultValue: 'SELECT * FROM input'
        },
        {
          name: 'validateSchema',
          label: 'Validate Output Schema',
          type: 'switch',
          required: false,
          defaultValue: true
        }
      ]
    },
    defaultConfig: {
      sql: 'SELECT * FROM input',
      validateSchema: true
    }
  },

  [NodeType.FILTER]: {
    id: 'filter',
    type: NodeType.FILTER,
    category: NodeCategory.TRANSFORM,
    name: 'Filter',
    description: '过滤数据行',
    icon: 'FilterOutlined',
    color: '#7B68EE',
    ports: {
      input: [{ id: 'input', name: 'Input', type: 'dataset', required: true, multiple: false }],
      output: [{ id: 'output', name: 'Output', type: 'dataset', required: true, multiple: false }]
    },
    configSchema: {
      fields: [
        {
          name: 'condition',
          label: 'Filter Condition',
          type: 'code',
          required: true,
          defaultValue: 'column_name > 0'
        },
        {
          name: 'mode',
          label: 'Mode',
          type: 'select',
          required: true,
          defaultValue: 'keep',
          options: [
            { label: 'Keep matching rows', value: 'keep' },
            { label: 'Remove matching rows', value: 'remove' }
          ]
        }
      ]
    },
    defaultConfig: {
      condition: 'column_name > 0',
      mode: 'keep'
    }
  },

  // ================== Output Nodes ==================

  [NodeType.OUTPUT_DATASET]: {
    id: 'output-dataset',
    type: NodeType.OUTPUT_DATASET,
    category: NodeCategory.OUTPUT,
    name: 'Output Dataset',
    description: '写入到 Foundry Dataset',
    icon: 'ExportOutlined',
    color: '#52C41A',
    ports: {
      input: [{ id: 'input', name: 'Input', type: 'dataset', required: true, multiple: false }],
      output: []
    },
    configSchema: {
      fields: [
        {
          name: 'datasetPath',
          label: 'Output Dataset Path',
          type: 'text',
          required: true
        },
        {
          name: 'mode',
          label: 'Write Mode',
          type: 'select',
          required: true,
          defaultValue: 'SNAPSHOT',
          options: [
            { label: 'Snapshot (replace all)', value: 'SNAPSHOT' },
            { label: 'Append', value: 'APPEND' },
            { label: 'Update', value: 'UPDATE' }
          ]
        },
        {
          name: 'partitionColumns',
          label: 'Partition Columns',
          type: 'select',
          required: false,
          options: [] // 动态加载
        }
      ]
    },
    defaultConfig: {
      mode: 'SNAPSHOT'
    }
  }
}

// 节点分类
export const NODE_CATEGORIES = [
  {
    category: NodeCategory.INPUT,
    label: 'Input',
    icon: 'InboxOutlined',
    nodes: [
      NodeType.DATASET,
      NodeType.DATABASE,
      NodeType.FILE,
      NodeType.API
    ]
  },
  {
    category: NodeCategory.TRANSFORM,
    label: 'Transform',
    icon: 'FunctionOutlined',
    nodes: [
      NodeType.SQL_TRANSFORM,
      NodeType.PYTHON,
      NodeType.FILTER,
      NodeType.JOIN,
      NodeType.AGGREGATE
    ]
  },
  {
    category: NodeCategory.OUTPUT,
    label: 'Output',
    icon: 'ExportOutlined',
    nodes: [
      NodeType.OUTPUT_DATASET,
      NodeType.OUTPUT_DATABASE,
      NodeType.OUTPUT_FILE
    ]
  }
]
```

---

## 第三部分：Mock 数据设计

### 3.1 Mock 数据结构

```typescript
// mock/data.ts

export const MOCK_PIPELINES = [
  {
    id: 'pipeline-001',
    name: 'Customer Analytics Pipeline',
    description: '客户数据分析管道',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
    createdBy: 'admin@example.com',
    status: 'active',
    nodes: [
      {
        id: 'node-001',
        type: 'dataset',
        label: 'Customers Dataset',
        x: 100,
        y: 100,
        data: {
          datasetPath: '/datasets/customers',
          branch: 'master'
        }
      },
      {
        id: 'node-002',
        type: 'sql-transform',
        label: 'Filter Active Customers',
        x: 400,
        y: 100,
        data: {
          sql: "SELECT * FROM input WHERE status = 'active'"
        }
      },
      {
        id: 'node-003',
        type: 'output-dataset',
        label: 'Active Customers Output',
        x: 700,
        y: 100,
        data: {
          datasetPath: '/datasets/active_customers',
          mode: 'SNAPSHOT'
        }
      }
    ],
    edges: [
      {
        id: 'edge-001',
        source: 'node-001',
        target: 'node-002',
        sourcePort: 'output',
        targetPort: 'input'
      },
      {
        id: 'edge-002',
        source: 'node-002',
        target: 'node-003',
        sourcePort: 'output',
        targetPort: 'input'
      }
    ]
  }
]

export const MOCK_DATASETS = [
  {
    path: '/datasets/customers',
    name: 'Customers',
    schema: [
      { name: 'id', type: 'INTEGER', nullable: false },
      { name: 'name', type: 'STRING', nullable: false },
      { name: 'email', type: 'STRING', nullable: false },
      { name: 'age', type: 'INTEGER', nullable: true },
      { name: 'status', type: 'STRING', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false }
    ],
    rowCount: 10245,
    sizeBytes: 2457600,
    preview: [
      { id: 1001, name: 'Alice Johnson', email: 'alice@example.com', age: 28, status: 'active', created_at: '2024-01-01T00:00:00Z' },
      { id: 1002, name: 'Bob Smith', email: 'bob@example.com', age: 35, status: 'active', created_at: '2024-01-02T00:00:00Z' },
      { id: 1003, name: 'Charlie Brown', email: 'charlie@example.com', age: 42, status: 'inactive', created_at: '2024-01-03T00:00:00Z' }
      // ... 更多数据
    ]
  }
]

export const MOCK_EXECUTIONS = [
  {
    id: 'exec-001',
    pipelineId: 'pipeline-001',
    status: 'completed',
    startTime: '2024-01-20T10:00:00Z',
    endTime: '2024-01-20T10:05:23Z',
    duration: 323000, // 毫秒
    totalTasks: 3,
    completedTasks: 3,
    failedTasks: 0,
    logs: [
      { timestamp: '2024-01-20T10:00:00Z', level: 'info', message: 'Pipeline execution started' },
      { timestamp: '2024-01-20T10:00:05Z', level: 'info', message: 'Reading dataset: /datasets/customers' },
      { timestamp: '2024-01-20T10:02:15Z', level: 'info', message: 'Applying SQL transform' },
      { timestamp: '2024-01-20T10:04:30Z', level: 'info', message: 'Writing output dataset' },
      { timestamp: '2024-01-20T10:05:23Z', level: 'info', message: 'Pipeline execution completed successfully' }
    ]
  }
]
```

---

**文档未完，将继续创建第四、第五部分...**
