# Transform Configuration Guide

基于 Palantir Foundry Pipeline Builder 官方设计实现的 Transform 配置面板使用指南。

## 🎯 功能概览

Transform 配置面板允许您对数据进行各种转换操作，无需编写代码即可完成数据清理、筛选、聚合等任务。

## 🚀 快速开始

### 打开 Transform 配置面板

有两种方式打开 Transform 配置面板：

1. **双击 Transform 节点**
   - 在画布上双击任何 Transform 节点
   - 右侧会自动打开 Transform 配置面板

2. **从上下文菜单**
   - 右键点击 Transform 节点
   - 选择 "Transform" 选项

## 📋 支持的转换类型

### 1. Filter Rows (过滤行)

根据条件筛选数据行，只保留满足条件的记录。

**使用场景**：
- 筛选特定时间范围的数据
- 过滤掉空值或无效数据
- 按特定字段值筛选

**配置选项**：
- **Column**: 选择要过滤的列
- **Operator**: 选择比较运算符
  - `Equals`: 等于
  - `Not Equals`: 不等于
  - `Contains`: 包含（文本）
  - `Greater Than`: 大于
  - `Less Than`: 小于
  - `Is Null`: 为空
  - `Not Null`: 不为空
- **Value**: 比较值（某些运算符不需要）

**示例**：
```
Column: age
Operator: Greater Than
Value: 18

结果：只保留 age > 18 的记录
```

**多条件过滤**：
- 点击 "Add Condition" 添加多个过滤条件
- 所有条件必须同时满足（AND 逻辑）

---

### 2. Select Columns (选择列)

选择要保留的列，移除不需要的列以简化数据集。

**使用场景**：
- 移除敏感或不需要的列
- 减小数据集大小
- 创建数据视图

**配置选项**：
- 勾选要保留的列
- 未勾选的列将被移除
- 显示列类型标签（String, Number, Date等）

**提示**：
- 选中计数会实时显示
- 可以通过列类型快速识别
- 至少保留一列

**示例**：
```
原始列：id, name, email, phone, address, age, city
选择：name, email, age, city

结果：只保留这4列，其他列被移除
```

---

### 3. Clean Data (清理数据)

应用常见的数据清理操作，提高数据质量。

**使用场景**：
- 移除重复记录
- 处理空值
- 标准化文本格式

**配置选项**：

1. **Remove rows with null values** (移除空值行)
   - 可以指定要检查的列
   - 如果指定列的值为空，整行被移除

2. **Remove duplicate rows** (移除重复行)
   - 基于所有列值判断重复
   - 只保留第一次出现的记录

3. **Trim whitespace** (修剪空格)
   - 移除文本列开头和结尾的空格
   - 只影响 String 类型的列

4. **Standardize text case** (标准化大小写)
   - 将所有文本转换为小写
   - 便于后续比较和匹配

**示例**：
```
原始数据：
name: " John Doe ", age: null
name: "Jane Smith", age: 25
name: "Jane Smith", age: 25  (重复)

应用配置：
☑ Remove nulls (columns: age)
☑ Remove duplicates
☑ Trim whitespace

结果：
name: "John Doe", age: 25
```

---

### 4. Rename Columns (重命名列)

修改列名以提高可读性或符合命名规范。

**使用场景**：
- 统一命名风格
- 使用更有意义的名称
- 符合下游系统的命名要求

**配置选项**：
- **From**: 选择原始列名
- **To**: 输入新列名

**注意事项**：
- 新列名不能重复
- 建议使用小写字母和下划线
- 点击 "Add Rename" 可以重命名多列

**示例**：
```
customer_id → userId
first_name → firstName
last_name → lastName
email_address → email
```

---

### 5. Aggregate (聚合)

对数据进行分组聚合，生成汇总统计。

**使用场景**：
- 按类别统计总和、平均值
- 生成报表数据
- 数据降维

**配置选项**：

1. **Group By** (分组依据)
   - 选择一个或多个列作为分组键
   - 相同值的记录会被分为一组

2. **Aggregations** (聚合函数)
   - **Column**: 要聚合的列
   - **Function**: 聚合函数
     - `Count`: 计数
     - `Sum`: 求和
     - `Average`: 平均值
     - `Min`: 最小值
     - `Max`: 最大值

**示例**：
```
原始数据：
category, product, sales
A, P1, 100
A, P2, 150
B, P3, 200
B, P4, 300

配置：
Group By: category
Aggregations:
  - sales → Sum

结果：
category, sales_sum
A, 250
B, 500
```

---

### 6. Sort (排序)

按一个或多个列对数据排序。

**使用场景**：
- 按时间排序查看最新数据
- 按数值排序找出最大/最小值
- 多级排序

**配置选项**：
- **Column**: 选择排序列
- **Order**: 排序方向
  - `Ascending` (↑): 升序（小到大）
  - `Descending` (↓): 降序（大到小）

**多级排序**：
- 点击 "Add Sort" 添加次级排序
- 先按第一个列排序，相同值再按第二个列排序

**示例**：
```
First sort: date ↓ (最新日期在前)
Second sort: amount ↓ (相同日期按金额从大到小)

结果：数据按日期和金额排序
```

---

## 💡 使用技巧

### 1. 组合多个转换

可以对同一个数据集应用多个转换：
1. Filter → Clean → Select Columns
2. 每次应用后，transformCount 会增加
3. 在节点上显示转换数量

### 2. 查看输入列

Transform 配置面板会自动：
- 获取输入节点的列信息
- 显示列类型和图标
- 提供列的上下文

### 3. 数据预览

应用转换后：
- 底部面板切换到 Preview 标签
- 查看转换后的数据
- 验证转换结果

### 4. 取消和重新配置

- 点击 "Cancel" 关闭面板不保存
- 再次双击节点可以重新配置
- 每次应用会覆盖之前的配置

---

## 🎨 界面说明

### 面板布局

```
┌─────────────────────────────────────┐
│ Transform Configuration      [✕]    │ ← 标题栏
├─────────────────────────────────────┤
│ Node: Transform Node                │ ← 节点信息
│ Type: Transform                     │
├─────────────────────────────────────┤
│ Transformation Type                 │
│ [Filter Rows ▼]                     │ ← 类型选择
├─────────────────────────────────────┤
│                                     │
│ [配置选项区域]                        │ ← 动态配置
│                                     │
│                                     │
├─────────────────────────────────────┤
│              [Cancel] [Apply]        │ ← 操作按钮
└─────────────────────────────────────┘
```

### 视觉元素

- 🟣 **紫色图标**: Transform 类型
- 🔵 **蓝色标签**: String 类型列
- 🟢 **绿色标签**: Number 类型列
- 🟠 **橙色标签**: Date 类型列
- 🟣 **紫色标签**: Boolean 类型列

---

## 📝 最佳实践

### 1. 转换顺序

建议的转换顺序：
1. **Clean** - 先清理数据质量问题
2. **Filter** - 筛选需要的数据
3. **Select** - 选择需要的列
4. **Rename** - 重命名列
5. **Aggregate/Sort** - 最后聚合或排序

### 2. 性能考虑

- 尽早过滤数据以减少处理量
- 移除不需要的列
- 避免过度聚合大数据集

### 3. 数据质量

- 先处理空值和重复项
- 标准化文本格式
- 验证转换结果

### 4. 命名规范

列重命名建议：
- 使用小写字母
- 用下划线分隔单词
- 保持简洁明了
- 避免特殊字符

---

## 🔍 故障排除

### Q: 配置面板没有显示列信息

**A**: 确保 Transform 节点已连接到输入节点（Dataset 或其他 Transform）

### Q: Apply 后没有效果

**A**: 检查：
- 是否选择了正确的列
- 过滤条件是否正确
- 查看控制台是否有错误信息

### Q: 找不到某些列

**A**: 列来自输入节点，如果输入节点的数据结构改变，需要重新配置

---

## 🚀 快捷键

| 操作 | 快捷键 |
|------|--------|
| 双击节点 | 打开配置面板 |
| Esc | 关闭面板 |
| Enter | 应用转换 |

---

## 📚 相关文档

- [Pipeline Builder Overview](./IMPROVEMENTS.md)
- [Node Types Documentation](./NODE_TYPES.md)
- [Data Preview Guide](./DATA_PREVIEW.md)

---

*最后更新: 2025-11-11*
*基于 Palantir Foundry Pipeline Builder 官方设计*
