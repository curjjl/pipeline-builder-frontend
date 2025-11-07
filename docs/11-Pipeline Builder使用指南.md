# Pipeline Builder 使用指南

## 📚 目录

1. [快速开始](#快速开始)
2. [核心功能](#核心功能)
3. [完整使用案例](#完整使用案例)
4. [节点类型详解](#节点类型详解)
5. [数据转换操作](#数据转换操作)
6. [最佳实践](#最佳实践)
7. [常见问题](#常见问题)

---

## 🚀 快速开始

### 启动应用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问应用
http://localhost:5173
```

### 第一个Pipeline

1. **添加数据源**
   - 点击工具栏"Add data"按钮
   - 选择一个数据集（Products、Customers或Transactions）
   - 节点会自动添加到画布上

2. **应用转换**
   - 选中数据节点
   - 点击"Transform"按钮
   - 在右侧面板选择转换类型（如Filter、Sort等）
   - 配置转换参数

3. **查看结果**
   - 点击"Run"按钮执行Pipeline
   - 在底部面板查看数据预览
   - 查看控制台输出的执行结果

4. **保存Pipeline**
   - 点击"Save"按钮保存Pipeline
   - 数据会存储到localStorage

---

## 💡 核心功能

### 1. 节点管理

#### 可用节点类型

| 节点类型 | 图标颜色 | 功能说明 | 输入端口 | 输出端口 |
|---------|---------|---------|---------|---------|
| **Dataset** | 蓝色 | 数据源节点，加载模拟数据 | 0 | 1 |
| **Transform** | 紫色 | 数据转换节点，应用各种转换操作 | 1 | 1 |
| **Join** | 橙色 | 连接节点，合并两个数据表 | 2 | 1 |
| **Output** | 紫色 | 输出节点，保存处理结果 | 1 | 0 |

#### 添加节点

- **数据集节点**：点击"Add data" → 选择数据集
- **Join节点**：点击"Join"按钮
- **Output节点**：点击"Output"按钮

#### 节点操作

- **移动节点**：拖拽节点到目标位置
- **选中节点**：单击节点
- **重命名节点**：双击节点标签
- **删除节点**：右键 → Delete，或选中后按Delete键
- **复制节点**：右键 → Duplicate

### 2. 连接管理

#### 创建连接

1. 鼠标悬停在源节点上，底部会显示输出端口
2. 从输出端口拖拽到目标节点的输入端口
3. 系统会自动创建连接

#### 连接规则

- Dataset节点：只有输出端口
- Transform节点：1个输入端口，1个输出端口
- Join节点：2个输入端口，1个输出端口
- Output节点：只有输入端口

### 3. 数据预览

#### 查看节点数据

1. 选中任意节点
2. 底部面板自动切换到"Preview"标签
3. 显示该节点的输出数据

#### 数据统计

- **总行数**：数据表的总记录数
- **列信息**：列名、数据类型
- **列统计**：正常值、空值、空字符串、空白字符统计

### 4. Pipeline执行

#### 手动执行

点击工具栏的"Run"按钮，系统会：

1. 验证Pipeline结构（检查循环依赖）
2. 按拓扑排序顺序执行所有节点
3. 计算每个节点的输出数据
4. 在控制台输出执行结果
5. 显示执行成功/失败消息

#### 执行结果

执行完成后，控制台会输出：
- 处理的节点数量
- 每个节点的数据行数
- 每个节点的样本数据（前3行）

### 5. 保存和加载

#### 保存Pipeline

1. 点击"Save"按钮
2. Pipeline数据会保存到localStorage
3. 控制台输出完整的Pipeline JSON结构

#### 加载Pipeline

Pipeline会在页面加载时自动从localStorage恢复

---

## 📖 完整使用案例

### 案例1：产品销售分析

**目标**：分析高价值产品的销售情况

#### 步骤

1. **添加Products数据集**
   ```
   点击"Add data" → "Products"
   ```

2. **过滤高价产品**
   - 选中Products节点
   - 点击"Transform"
   - 选择"Filter"转换
   - 配置：
     - Column: `price`
     - Operator: `>`
     - Value: `500`

3. **排序**
   - 保持选中
   - 再次点击"Transform"
   - 选择"Sort"转换
   - 配置：
     - Column: `price`
     - Order: `desc`（降序）

4. **运行Pipeline**
   - 点击"Run"按钮
   - 查看底部面板的数据预览
   - 应该只显示价格>500的产品，按价格降序排列

### 案例2：客户交易关联分析

**目标**：关联客户信息和交易记录，分析客户购买行为

#### 步骤

1. **添加数据源**
   ```
   添加Customers数据集
   添加Transactions数据集
   ```

2. **添加Join节点**
   - 点击"Join"按钮
   - Join节点出现在画布上

3. **连接节点**
   - 从Customers节点的输出端口连接到Join节点的第一个输入端口
   - 从Transactions节点的输出端口连接到Join节点的第二个输入端口

4. **配置Join**
   - 选中Join节点
   - 在配置面板设置：
     - Join Type: `Inner Join`
     - Left Key: `customer_id`（Customers表的字段）
     - Right Key: `customer_id`（Transactions表的字段）

5. **过滤高价值交易**
   - 添加Transform节点
   - 从Join节点连接到Transform节点
   - 添加Filter转换：
     - Column: `total_amount`
     - Operator: `>`
     - Value: `1000`

6. **按客户分组统计**
   - 添加另一个Transform节点
   - 添加Group By转换：
     - Group By: `name`（客户名称）
     - Aggregations:
       - Column: `total_amount`
       - Function: `sum`
       - Alias: `total_spending`

7. **运行Pipeline**
   - 点击"Run"按钮
   - 查看每个客户的总消费额
   - 数据会显示关联后的客户交易信息

### 案例3：数据清洗和转换

**目标**：清洗产品数据并计算利润

#### 步骤

1. **添加Products数据集**

2. **选择需要的列**
   - 添加Transform节点
   - 选择"Select Columns"转换（暂未实现UI，可通过编程方式）

3. **添加计算列**
   - 添加Transform节点
   - 通过代码手动添加转换计算利润：
     ```javascript
     {
       type: 'addColumn',
       config: {
         columnName: 'profit',
         expression: 'price - cost'
       }
     }
     ```

4. **过滤有库存的产品**
   - 添加Filter转换：
     - Column: `stock`
     - Operator: `>`
     - Value: `0`

5. **按类别分组**
   - 添加Group By转换：
     - Group By: `category`
     - Aggregations:
       - Sum of profit
       - Count of products
       - Average price

---

## 🔧 节点类型详解

### Dataset节点（数据源）

**功能**：加载模拟数据作为Pipeline的起点

**配置**：
- `datasetId`: 数据集ID（products/customers/transactions）
- `datasetName`: 显示名称
- `columnCount`: 列数（自动计算）

**可用数据集**：

#### 1. Products（产品表）
- **记录数**：12行
- **字段**：
  - `product_id`: 产品ID
  - `product_name`: 产品名称
  - `category`: 类别
  - `price`: 价格
  - `cost`: 成本
  - `stock`: 库存
  - `supplier`: 供应商
  - `created_at`: 创建时间

#### 2. Customers（客户表）
- **记录数**：10行
- **字段**：
  - `customer_id`: 客户ID
  - `name`: 姓名
  - `email`: 邮箱
  - `phone`: 电话
  - `registration_date`: 注册日期
  - `city`: 城市
  - `country`: 国家
  - `lifetime_value`: 生命周期价值
  - `segment`: 客户细分

#### 3. Transactions（交易表）
- **记录数**：15行
- **字段**：
  - `transaction_id`: 交易ID
  - `customer_id`: 客户ID
  - `product_id`: 产品ID
  - `quantity`: 数量
  - `total_amount`: 总金额
  - `discount`: 折扣
  - `transaction_date`: 交易日期
  - `payment_method`: 支付方式
  - `status`: 状态

### Transform节点（转换）

**功能**：对输入数据应用各种转换操作

**支持的转换类型**：

1. **Filter（过滤）**
   - 根据条件筛选行
   - 支持的操作符：`=`, `!=`, `>`, `>=`, `<`, `<=`, `in`, `contains`, `starts_with`, `ends_with`

2. **Sort（排序）**
   - 按指定列排序
   - 支持升序/降序

3. **Group By（分组聚合）**
   - 按列分组
   - 支持聚合函数：`count`, `sum`, `avg`, `min`, `max`, `first`, `last`

4. **Cast（类型转换）**
   - 转换列的数据类型
   - 支持类型：String, Number, Date, Boolean

5. **Distinct（去重）**
   - 移除重复行

6. **其他转换**（部分未实现UI）：
   - Select Columns（选择列）
   - Rename Column（重命名列）
   - Trim（去除空白字符）
   - Split（拆分列）
   - Remove Column（删除列）
   - Fill Null（填充空值）
   - Replace（替换值）

### Join节点（连接）

**功能**：合并两个数据表

**配置**：
```typescript
{
  type: 'inner' | 'left' | 'right' | 'outer',
  leftKey: string,   // 左表的连接键
  rightKey: string   // 右表的连接键
}
```

**连接类型**：
- **Inner Join**：只返回两表都匹配的行
- **Left Join**：返回左表所有行，右表匹配的行
- **Right Join**：返回右表所有行，左表匹配的行
- **Full Outer Join**：返回两表所有行

**注意事项**：
- Join节点必须有2个输入
- 连接键必须在两个表中都存在
- 连接后的数据会合并两表的所有列

### Output节点（输出）

**功能**：标记Pipeline的输出端点

**配置**：
- `outputName`: 输出数据集名称

**说明**：
- Output节点不会实际保存数据（模拟环境）
- 主要用于标记数据流的终点
- 可以添加多个Output节点保存不同的中间结果

---

## 🔄 数据转换操作

### Filter转换

**配置选项**：

```typescript
{
  column: string,           // 要过滤的列
  operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'contains' | 'starts_with' | 'ends_with',
  value: any,               // 比较值
  dataType: 'string' | 'number' | 'boolean' | 'date'
}
```

**示例**：

```javascript
// 过滤价格大于1000的产品
{
  column: 'price',
  operator: '>',
  value: 1000,
  dataType: 'number'
}

// 过滤包含"Laptop"的产品
{
  column: 'product_name',
  operator: 'contains',
  value: 'Laptop',
  dataType: 'string'
}
```

### Group By转换

**配置选项**：

```typescript
{
  groupBy: string[],        // 分组字段
  aggregations: [           // 聚合操作
    {
      column: string,       // 要聚合的列
      function: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'first' | 'last',
      alias: string         // 结果列名
    }
  ]
}
```

**示例**：

```javascript
// 按类别统计产品数量和平均价格
{
  groupBy: ['category'],
  aggregations: [
    { column: 'product_id', function: 'count', alias: 'product_count' },
    { column: 'price', function: 'avg', alias: 'avg_price' }
  ]
}
```

### Sort转换

**配置选项**：

```typescript
{
  column: string,           // 排序列
  order: 'asc' | 'desc'     // 排序方向
}
```

---

## 🎯 最佳实践

### 1. Pipeline设计原则

#### 模块化设计
- 将复杂的数据处理拆分成多个简单步骤
- 每个Transform节点只做一件事
- 便于调试和维护

#### 性能优化
- 尽早过滤数据，减少后续处理的数据量
- 避免在Join前进行过多的转换
- 使用适当的数据类型

#### 可读性
- 给节点起有意义的名称
- 添加注释说明复杂的转换逻辑
- 合理布局节点，保持图的清晰

### 2. 常见模式

#### ETL模式
```
Extract (Dataset) → Transform (Filter, Cast, etc.) → Load (Output)
```

#### 数据聚合模式
```
Dataset → Filter → Group By → Sort → Output
```

#### 多表关联模式
```
Dataset1 ─┐
          ├→ Join → Transform → Output
Dataset2 ─┘
```

### 3. 调试技巧

#### 逐步验证
1. 先添加数据源，验证数据正确加载
2. 每添加一个转换，点击"Run"验证结果
3. 使用数据预览查看每个节点的输出

#### 使用控制台
- 查看Pipeline执行日志
- 检查每个节点的数据行数
- 查看样本数据验证转换结果

#### 常见错误
- **连接循环**：检查Pipeline是否有循环依赖
- **字段不存在**：验证列名是否正确
- **类型不匹配**：检查数据类型转换

---

## ❓ 常见问题

### Q1: 如何清空画布？

**A**: 目前需要手动删除所有节点。未来会添加"Clear All"功能。

### Q2: Pipeline可以保存多个版本吗？

**A**: 当前版本使用localStorage保存，每次保存会覆盖之前的版本。建议使用浏览器的LocalStorage查看器管理多个版本。

### Q3: 支持哪些数据格式？

**A**: 当前版本使用内置的模拟数据（JSON格式）。未来会支持CSV、Excel等格式导入。

### Q4: 如何添加自定义转换？

**A**: 可以通过代码方式添加转换到`transformCache`。查看`src/utils/transform.ts`了解可用的转换函数。

### Q5: Join节点必须连接2个输入吗？

**A**: 是的。Join节点需要至少2个输入。如果只有1个输入，执行时会跳过Join操作。

### Q6: 数据预览显示的是实时数据吗？

**A**: 是的。选中节点后，系统会实时计算该节点的输出数据并显示在预览面板中。

### Q7: 如何导出处理后的数据？

**A**: 当前版本在控制台输出数据。未来会添加CSV/Excel导出功能。

### Q8: Transform节点可以应用多个转换吗？

**A**: 可以。选中Transform节点，多次点击"Transform"按钮添加多个转换。它们会按顺序应用。

---

## 🔮 未来计划

### 即将推出

- [ ] 自定义Python/SQL转换
- [ ] CSV/Excel数据导入
- [ ] 数据导出功能
- [ ] Pipeline版本控制
- [ ] 撤销/重做功能完善
- [ ] 实时协作编辑
- [ ] 性能监控和优化建议
- [ ] 数据血缘分析
- [ ] 自动化测试和验证

---

## 📞 技术支持

如有问题或建议，请联系开发团队或提交Issue。

**文档版本**: v1.0.0
**最后更新**: 2025-11-07
