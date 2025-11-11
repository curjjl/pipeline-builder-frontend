# Transform 配置面板快速使用指南

## 🚀 快速开始

### 方法一：添加Transform节点并配置

#### 步骤1：点击工具栏上的Transform按钮
```
工具栏 → Transform 部分 → 点击 [Filter图标] 按钮
```

**效果**：
- 自动创建一个Transform节点
- 右侧配置面板自动打开
- 节点会显示在画布上

#### 步骤2：配置转换
1. 在右侧面板选择转换类型（Filter/Select/Clean/Rename/Aggregate/Sort）
2. 根据选择的类型填写配置选项
3. 点击 "Apply Transform" 应用配置

#### 步骤3：连接节点
- 从Dataset节点拖拽连接到Transform节点
- Transform节点会自动获取输入列信息

---

### 方法二：双击已有Transform节点

#### 步骤1：找到Transform节点
在画布上找到紫色的Transform节点

#### 步骤2：双击节点
双击节点后右侧会打开配置面板

#### 步骤3：配置和应用
同方法一的步骤2-3

---

## 📊 完整工作流示例

### 示例：清理并筛选客户数据

#### 1. 添加数据源
```
点击 "Add Data" → 选择 "Customers" 数据集
```

#### 2. 添加Transform节点
```
点击工具栏 Transform 按钮 (Filter图标)
```
✅ 此时配置面板会自动打开

#### 3. 连接节点
```
从 Customers 节点的输出端口拖拽到 Transform 节点的输入端口
```

#### 4. 配置数据清理
在右侧配置面板：
- 选择转换类型: "Clean Data"
- 勾选选项:
  - ☑ Remove rows with null values
    - 选择列: email, phone
  - ☑ Remove duplicate rows
  - ☑ Trim whitespace
- 点击 "Apply Transform"

#### 5. 双击节点再次配置
```
双击 Transform 节点 → 配置面板重新打开
```

#### 6. 添加过滤条件
- 选择转换类型: "Filter Rows"
- 添加条件:
  - Column: age
  - Operator: Greater Than
  - Value: 18
- 点击 "Apply Transform"

#### 7. 查看结果
- 底部面板会自动切换到 Preview
- 可以看到清理和过滤后的数据

---

## 🎯 核心功能

### ✅ 自动打开配置面板
点击工具栏 Transform 按钮后，配置面板会：
- 自动创建节点
- 立即打开右侧配置面板
- 等待您的配置输入

### ✅ 智能列检测
- 自动从输入节点获取列信息
- 显示列类型和图标
- 支持递归查找上游数据源

### ✅ 实时反馈
- 配置更改立即显示
- 应用后显示成功消息
- 节点上显示转换计数

---

## 🐛 调试信息

### 浏览器控制台输出

当您操作时，控制台会显示详细的调试信息：

#### 添加Transform节点
```
Added Transform node - Double click to configure
showTransformConfig changed: true
selectedTransformNode changed: Transform
```

#### 双击节点
```
=== Node Double Click ===
Node: {id: 'node-1', type: 'transform', ...}
Node Type: transform
Opening Transform Config Panel
Detected columns: [{name: 'id', type: 'Number'}, ...]
```

#### 配置面板加载
```
=== TransformConfigPanel Mounted ===
Node: {id: 'node-1', name: 'Transform', ...}
Columns: [{name: 'id', type: 'Number'}, ...]
```

### 检查步骤

如果配置面板没有显示，请检查：

1. **打开浏览器控制台** (F12)
2. **点击Transform按钮或双击节点**
3. **查看控制台输出**：
   - 是否显示 "Opening Transform Config Panel"？
   - 是否显示 "TransformConfigPanel Mounted"？
   - 列数据是否正确检测？

---

## 💡 提示和技巧

### 1. 快速配置
```
工具栏 Transform 按钮 → 自动打开配置 → 立即开始配置
```

### 2. 重新配置
```
双击任何 Transform 节点 → 修改配置 → Apply
```

### 3. 连接顺序
```
建议：先添加数据源 → 再添加Transform → 最后连接
优点：Transform能自动检测输入列
```

### 4. 多个转换
```
可以添加多个Transform节点形成处理链
Dataset → Transform1 → Transform2 → Output
```

### 5. 查看列信息
```
Transform配置面板会显示：
- 列名
- 列类型（String/Number/Date...）
- 类型图标（不同颜色）
```

---

## ⚠️ 常见问题

### Q1: 点击Transform按钮没有反应？

**检查**：
1. 打开浏览器控制台(F12)
2. 查看是否有JavaScript错误
3. 刷新页面重试

**解决**：
- 确保已经添加了数据源节点
- 尝试刷新页面

### Q2: 配置面板没有显示列信息？

**原因**：Transform节点没有连接到输入节点

**解决**：
1. 确保Transform节点已连接到Dataset或其他Transform节点
2. 连接后双击Transform节点重新打开

### Q3: Apply后没有效果？

**检查**：
1. 打开控制台查看是否有错误
2. 确认配置已正确填写（必填项）
3. 查看节点上的transformCount是否增加

**解决**：
- 检查Transform配置是否完整
- 查看底部Preview面板的数据

### Q4: 如何关闭配置面板？

**方法**：
- 点击配置面板右上角的 ✕ 按钮
- 点击 "Cancel" 按钮
- 点击画布空白区域

---

## 🎨 界面元素说明

### 工具栏 Transform 部分
```
┌────────────────────────────┐
│ Transform                  │
│ [Filter] [Join] [Output]   │
└────────────────────────────┘
   ↑       ↑      ↑
   │       │      └─ 添加Output节点
   │       └──────── 添加Join节点
   └──────────────── 添加Transform节点（会自动打开配置）
```

### 配置面板布局
```
┌──────────────────────────────┐
│ Transform Configuration  [✕] │ ← 标题和关闭按钮
├──────────────────────────────┤
│ Node: Transform              │
│ Type: [Transform]            │ ← 节点信息
├──────────────────────────────┤
│ Transformation Type          │
│ [Filter Rows ▼]              │ ← 类型选择
├──────────────────────────────┤
│                              │
│  [动态配置区域]                │ ← 根据类型变化
│                              │
│                              │
├──────────────────────────────┤
│        [Cancel] [Apply]       │ ← 操作按钮
└──────────────────────────────┘
```

---

## 📝 配置示例

### 示例1：过滤年龄大于18的用户

```yaml
Transformation Type: Filter Rows

Condition 1:
  Column: age
  Operator: Greater Than
  Value: 18

点击: Apply Transform
```

### 示例2：只保留关键列

```yaml
Transformation Type: Select Columns

选择的列:
  ☑ user_id
  ☑ name
  ☑ email
  ☑ created_at

未选择（将被移除）:
  ☐ internal_id
  ☐ temp_data

点击: Apply Transform
```

### 示例3：数据清理

```yaml
Transformation Type: Clean Data

清理选项:
  ☑ Remove rows with null values
    Columns: email, phone
  ☑ Remove duplicate rows
  ☑ Trim whitespace
  ☑ Standardize text case

点击: Apply Transform
```

---

## 🔄 完整操作流程图

```
开始
  │
  ├─ 1. 点击 "Add Data" 添加数据源
  │
  ├─ 2. 点击工具栏 Transform 按钮
  │     └→ 自动创建节点 + 打开配置面板
  │
  ├─ 3. 连接 Dataset → Transform
  │     └→ 自动检测列信息
  │
  ├─ 4. 在配置面板选择转换类型
  │     └→ Filter/Select/Clean/Rename/Aggregate/Sort
  │
  ├─ 5. 填写配置选项
  │     └→ 根据转换类型填写不同的表单
  │
  ├─ 6. 点击 "Apply Transform"
  │     ├→ 配置保存到节点
  │     ├→ 面板自动关闭
  │     └→ 显示成功消息
  │
  └─ 7. 查看结果
        └→ 底部 Preview 面板
```

---

## 📞 获取帮助

### 查看完整文档
- [Transform Guide](./TRANSFORM_GUIDE.md) - 详细使用指南
- [IMPROVEMENTS](./IMPROVEMENTS.md) - 功能对比和路线图

### 调试建议
1. 始终保持浏览器控制台打开
2. 查看console.log输出
3. 检查网络请求（如果有）

### 报告问题
如果遇到问题，请提供：
- 浏览器控制台截图
- 操作步骤
- 预期行为 vs 实际行为

---

*最后更新: 2025-11-11*
*问题修复版本*
