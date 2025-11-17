# Pipeline Builder 完整演示指南

本指南将带您完成一个完整的数据管道构建场景，展示如何使用Pipeline Builder进行数据转换和分析。

## 演示场景概述

**目标**: 分析VIP客户的高价值产品购买行为

**数据集**:
- **Products**: 产品信息（12条记录）
- **Customers**: 客户信息（10条记录）
- **Transactions**: 交易记录（15条记录）

**数据流程**:
```
Products → Filter(price > 500) → Sort(desc) ┐
                                              ├→ Join → Join + Customers(VIP) → Output
Transactions ────────────────────────────────┘
```

## 步骤1: 创建新的Pipeline

1. 访问 `http://localhost:5173/`
2. 点击 "Create Pipeline" 按钮
3. 输入Pipeline名称: `VIP Customer Analysis Pipeline`
4. 输入描述: `分析VIP客户的高价值产品购买行为`
5. 点击 "Create" 创建Pipeline

## 步骤2: 添加数据集节点

### 2.1 添加 Products 数据集

1. 点击工具栏的 "Add Data" 下拉菜单
2. 选择 "Products" 数据集
3. 节点将出现在画布左侧

**数据预览**:
- 点击 Products 节点
- 右侧面板将显示产品数据预览
- 查看数据列: product_id, product_name, category, price, cost, stock, supplier, created_at
- 总共 12 条记录

### 2.2 添加 Customers 数据集

1. 点击 "Add Data" → "Customers"
2. 节点出现在Products节点下方

**数据预览**:
- 点击 Customers 节点查看数据
- 列: customer_id, name, email, phone, registration_date, city, country, lifetime_value, segment
- 总共 10 条记录
- 注意 segment 列包含: Premium, Standard, VIP

### 2.3 添加 Transactions 数据集

1. 点击 "Add Data" → "Transactions"
2. 节点出现在Customers节点下方

**数据预览**:
- 列: transaction_id, customer_id, product_id, quantity, total_amount, discount, transaction_date, payment_method, status
- 总共 15 条交易记录

## 步骤3: 添加Transform节点 - 筛选高价值产品

1. 选中 Products 节点
2. 点击工具栏的 "Transform" 图标（Filter图标）
3. 创建一个新的Transform节点

**配置筛选条件**:
1. 节点名称: `Filter High-Value Products`
2. 点击节点，在右侧面板中点击 "Add Transform"
3. 选择 "Filter" 转换类型
4. 配置参数:
   - Column: `price`
   - Operator: `greater than` (>)
   - Value: `500`
5. 点击 "Apply"

**验证数据**:
- 点击该Transform节点查看数据预览
- 应该只显示价格 > 500 的产品
- 预期结果: 约 7-8 条记录

## 步骤4: 添加Transform节点 - 排序产品

1. 选中上一步的 Filter 节点
2. 再次点击 "Transform" 图标
3. 创建排序节点

**配置排序**:
1. 节点名称: `Sort Products by Price`
2. 添加 "Sort" 转换
3. 配置参数:
   - Column: `price`
   - Order: `desc` (降序)
4. 点击 "Apply"

**验证数据**:
- 数据应该按价格从高到低排列
- 最高价格的产品应该在最前面

## 步骤5: 添加Transform节点 - 筛选VIP客户

1. 选中 Customers 节点
2. 点击 "Transform" 图标

**配置筛选**:
1. 节点名称: `Filter VIP Customers`
2. 添加 "Filter" 转换
3. 配置参数:
   - Column: `segment`
   - Operator: `equals` (=)
   - Value: `VIP`
4. 点击 "Apply"

**验证数据**:
- 应该只显示segment为VIP的客户
- 预期结果: 约 2-3 条VIP客户记录

## 步骤6: 添加Join节点 - 关联产品和交易

1. 点击工具栏的 "Join" 图标（MergeCells图标）
2. 创建Join节点

**配置Join**:
1. 节点名称: `Join Products & Transactions`
2. 连接节点:
   - 从 `Sort Products by Price` 节点拖拽连线到该Join节点
   - 从 `Transactions` 节点拖拽连线到该Join节点
3. 点击Join节点，在右侧面板配置:
   - Join Type: `inner` (内连接)
   - Left Key: `product_id` (来自Products)
   - Right Key: `product_id` (来自Transactions)
4. 点击 "Apply"

**验证数据**:
- 点击Join节点查看结果
- 数据应该包含产品信息和对应的交易记录
- 列应该包含: 所有产品列 + 所有交易列

## 步骤7: 添加Join节点 - 关联客户信息

1. 再次点击 "Join" 图标
2. 创建第二个Join节点

**配置Join**:
1. 节点名称: `Join with VIP Customers`
2. 连接节点:
   - 从上一步的Join节点拖拽连线到这个新Join节点
   - 从 `Filter VIP Customers` 节点拖拽连线到这个新Join节点
3. 配置:
   - Join Type: `inner`
   - Left Key: `customer_id` (来自Transactions)
   - Right Key: `customer_id` (来自Customers)
4. 点击 "Apply"

**验证数据**:
- 最终结果应该包含:
  - VIP客户信息
  - 购买的高价值产品信息
  - 交易详情
- 这是经过层层筛选和关联后的最终分析数据

## 步骤8: 添加Output节点

1. 选中最后的Join节点
2. 点击工具栏的 "Output" 图标（Export图标）
3. 创建Output节点

**配置Output**:
1. 节点名称: `VIP Customer Purchase Analysis`
2. 点击Output节点查看最终输出数据

**数据分析**:
- 在Output节点中，您可以看到完整的分析结果
- 使用右侧面板的导出功能:
  - 导出为CSV
  - 导出为Excel
  - 导出为JSON

## 步骤9: 保存Pipeline

1. 点击顶部工具栏的 "Save" 按钮
2. Pipeline会自动保存到浏览器的localStorage
3. 查看完整的JSON Schema配置

**打开浏览器控制台** (F12):
```javascript
// 查看保存的Pipeline
const pipelineId = 'your_pipeline_id'
const saved = localStorage.getItem(`pipeline_${pipelineId}`)
console.log(JSON.parse(saved))
```

**JSON Schema结构**:
```json
{
  "id": "pipeline_xxx",
  "name": "VIP Customer Analysis Pipeline",
  "description": "...",
  "nodes": [...],
  "edges": [...],
  "nodeDataCache": {...},
  "transformCache": {...},
  "createdAt": "2025-...",
  "updatedAt": "2025-..."
}
```

## 步骤10: 验证完整流程

### 10.1 数据流验证

1. **Products节点** (12条)
   → **Filter** (7条, price > 500)
   → **Sort** (7条, 按价格降序)

2. **Customers节点** (10条)
   → **Filter** (2条, VIP客户)

3. **Transactions节点** (15条)

4. **Join #1** (Products + Transactions)
   → 结果: 包含高价值产品的交易记录

5. **Join #2** (上一步结果 + VIP Customers)
   → 最终结果: VIP客户购买高价值产品的完整信息

### 10.2 节点详情面板验证

对于每个节点，点击后应该显示:

**数据集节点**:
- About 部分: 节点名称、类型、创建/更新时间
- Columns 部分: 所有列的列表（带类型标识）
- 数据表格: 完整数据预览
- 统计信息: 行数统计

**Transform节点**:
- 节点信息
- Transform配置列表（每个transform的参数）
- 转换后的数据预览
- 列统计信息

**Join节点**:
- 节点信息
- Join配置（join type, keys）
- Join后的数据预览
- 合并后的列信息

**Output节点**:
- 最终输出数据预览
- 导出选项（CSV、Excel、JSON）
- 行数和列数统计

## 步骤11: 从JSON恢复Pipeline

1. 复制保存的JSON配置
2. 创建一个新的Pipeline
3. 使用导入功能加载JSON配置
4. 验证所有节点、边、Transform配置都已正确恢复

## 快速演示模式

### 使用浏览器控制台快速初始化演示数据

打开浏览器控制台 (F12)，执行以下代码:

```javascript
import { getCompleteDemoConfig } from '@/utils/demoData'
import { usePipelineStore } from '@/stores/modules/pipeline'

const store = usePipelineStore()
const { pipeline, transforms } = getCompleteDemoConfig()

// 加载演示Pipeline
store.setPipeline(pipeline)

// 加载Transform配置
transforms.forEach((transformList, nodeId) => {
  transformList.forEach(transform => {
    store.addTransform(nodeId, transform)
  })
})

console.log('✅ 演示数据已加载!')
```

## 预期结果总结

**处理前**:
- Products: 12条记录
- Customers: 10条记录
- Transactions: 15条记录

**处理后 (Output节点)**:
- 只包含VIP客户购买高价值产品(价格>500)的交易记录
- 每条记录包含完整的客户信息、产品信息和交易详情
- 产品按价格降序排列
- 预计最终结果: 约 3-5 条记录

**数据列**:
最终输出应包含所有三个数据集的列:
- 产品信息: product_id, product_name, category, price, cost, stock, supplier, created_at
- 客户信息: customer_id, name, email, phone, registration_date, city, country, lifetime_value, segment
- 交易信息: transaction_id, quantity, total_amount, discount, transaction_date, payment_method, status

## 常见问题

### Q: 为什么Join后数据变少了？
A: 使用inner join时，只保留两个数据集中都存在匹配键的记录。如果某些交易的客户不是VIP，或某些产品价格不够高，这些记录会被过滤掉。

### Q: 如何修改Transform配置？
A: 点击Transform节点，在右侧面板中找到对应的Transform，点击编辑按钮，修改参数后点击Apply。

### Q: 数据预览看不到完整数据？
A: 数据预览默认显示前100行。可以使用导出功能导出完整数据。

### Q: Pipeline保存在哪里？
A: 当前版本使用浏览器的localStorage保存。清除浏览器缓存会丢失数据。未来版本会支持后端持久化存储。

## 下一步

完成演示后，您可以:
1. 尝试添加更多Transform操作（如GroupBy聚合、Pivot透视等）
2. 导入自己的CSV数据进行分析
3. 创建更复杂的多层Join场景
4. 使用Python/SQL Transform进行高级数据处理

## 技术细节

### Pipeline JSON Schema规范

完整的Pipeline配置遵循以下Schema:

```typescript
{
  version: string              // Schema版本
  pipeline: {
    id: string                 // Pipeline唯一标识
    name: string               // Pipeline名称
    description: string        // 描述
    nodes: Node[]              // 节点列表
    edges: Edge[]              // 边列表
    createdAt: string          // 创建时间(ISO 8601)
    updatedAt: string          // 更新时间
  }
  transforms: {
    [nodeId: string]: Transform[]  // 每个节点的Transform列表
  }
  metadata: {
    exportedAt: string         // 导出时间
    exportedBy: string         // 导出者
    nodeCount: number          // 节点数量
    edgeCount: number          // 边数量
  }
}
```

### Node类型

```typescript
interface Node {
  id: string                   // 节点唯一ID
  type: 'dataset' | 'transform' | 'join' | 'output'
  name: string                 // 显示名称
  x: number                    // 画布X坐标
  y: number                    // 画布Y坐标
  data: any                    // 节点特定配置
}
```

### Transform类型

```typescript
interface Transform {
  id: string                   // Transform唯一ID
  type: TransformType          // Transform类型
  name: string                 // 显示名称
  config: any                  // Transform参数配置
  enabled: boolean             // 是否启用
}
```

支持的Transform类型请参考: `src/utils/transform.ts`

---

**版本**: 1.0.0
**最后更新**: 2025-11-17
**维护者**: Pipeline Builder Team
