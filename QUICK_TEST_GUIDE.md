# Pipeline Builder 快速测试指南

## 准备工作

1. **启动开发服务器**:
```bash
cd /home/user/pipeline-builder-frontend
npm run dev
```

2. **访问应用**: 打开浏览器访问 `http://localhost:5173/`

## 快速测试步骤

### 方式一：使用"加载演示Pipeline"按钮（推荐）

这是最快速的测试方式，一键加载完整的演示场景。

1. **访问首页**: `http://localhost:5173/`

2. **点击"加载演示Pipeline"按钮** （带火箭图标的按钮）

3. **自动跳转到编辑器**: 系统会自动：
   - 创建包含9个节点的完整Pipeline
   - 配置所有Transform规则
   - 连接所有节点
   - 保存到localStorage
   - 跳转到编辑器页面

4. **验证节点布局**:
   ```
   Products → Filter → Sort ─┐
                               ├→ Join ─┐
   Transactions ──────────────┘        ├→ Join → Output
                                        │
   Customers → Filter ─────────────────┘
   ```

### 方式二：手动创建Pipeline（详细测试）

如果需要详细测试每个功能，参考 `DEMO_GUIDE.md` 中的完整步骤。

## 测试检查清单

### ✓ 1. 数据集节点测试

**测试步骤**:
1. 点击 `Products` 节点
2. 查看右侧面板

**预期结果**:
- ✅ 显示节点信息（名称、类型、时间）
- ✅ 显示8个列：product_id, product_name, category, price, cost, stock, supplier, created_at
- ✅ 数据表格显示12条记录
- ✅ 可以点击列查看统计信息（Normal/Null/Empty/Whitespace）

**重复测试**: `Customers` 节点（10条记录）、`Transactions` 节点（15条记录）

### ✓ 2. Filter Transform节点测试

**测试节点**: `Filter High-Value Products`

**测试步骤**:
1. 点击该Transform节点
2. 查看右侧面板

**预期结果**:
- ✅ 显示转换后的数据（只有价格 > 500 的产品）
- ✅ 记录数从12条减少到约7-8条
- ✅ 所有显示的产品price字段值都 > 500
- ✅ 可以查看Transform配置详情

**验证数据**:
打开浏览器控制台 (F12):
```javascript
// 查看节点数据
const store = window.$pinia.state.value.pipeline
const data = await store.getNodeData('node_filter_products')
console.log('Filtered products:', data)
console.log('All prices > 500?', data.every(p => p.price > 500))
```

### ✓ 3. Sort Transform节点测试

**测试节点**: `Sort Products by Price`

**测试步骤**:
1. 点击该Transform节点
2. 查看数据表格的price列

**预期结果**:
- ✅ 数据按price列降序排列
- ✅ 第一条记录的price最高
- ✅ 最后一条记录的price最低（但仍 > 500）

### ✓ 4. Filter VIP Customers测试

**测试节点**: `Filter VIP Customers`

**测试步骤**:
1. 点击该Transform节点
2. 查看segment列

**预期结果**:
- ✅ 只显示segment为"VIP"的客户
- ✅ 记录数从10条减少到约2-3条
- ✅ 所有记录的segment字段值都是"VIP"

### ✓ 5. Join节点测试（Products + Transactions）

**测试节点**: `Join Products & Transactions`

**测试步骤**:
1. 点击该Join节点
2. 查看数据列和记录

**预期结果**:
- ✅ 数据包含Products的所有列
- ✅ 数据包含Transactions的所有列
- ✅ 每条记录的product_id在两个数据集中匹配
- ✅ 只显示高价值产品(price > 500)的交易记录

**验证Join正确性**:
```javascript
// 检查Join结果
const data = await store.getNodeData('node_join_product_transaction')
console.log('Joined columns:', Object.keys(data[0]))
console.log('Has product columns?', 'product_name' in data[0])
console.log('Has transaction columns?', 'transaction_id' in data[0])
```

### ✓ 6. 最终Join节点测试

**测试节点**: `Join with Customers`

**测试步骤**:
1. 点击该Join节点
2. 验证完整的数据整合

**预期结果**:
- ✅ 包含所有三个数据集的列
- ✅ 只显示VIP客户的购买记录
- ✅ 只显示高价值产品的交易
- ✅ 最终记录数约3-5条

**完整性验证**:
```javascript
const data = await store.getNodeData('node_join_final')
console.log('Final data count:', data.length)
console.log('Columns:', Object.keys(data[0]))
console.log('All VIP?', data.every(r => r.segment === 'VIP'))
console.log('All high-value?', data.every(r => r.price > 500))
```

### ✓ 7. Output节点测试

**测试节点**: `VIP Customer Purchase Analysis`

**测试步骤**:
1. 点击该Output节点
2. 查看最终分析结果
3. 测试导出功能

**预期结果**:
- ✅ 显示完整的分析结果数据
- ✅ 可以导出为CSV、Excel、JSON格式
- ✅ 导出的文件包含所有列和数据
- ✅ 右侧显示正确的行数统计

### ✓ 8. 保存功能测试

**测试步骤**:
1. 点击顶部工具栏的 "Save" 按钮
2. 打开浏览器控制台 (F12)

**验证保存**:
```javascript
// 查看保存的Pipeline
const pipelineId = 'demo_pipeline_xxx' // 使用实际的pipeline ID
const saved = localStorage.getItem(`pipeline_${pipelineId}`)
const pipeline = JSON.parse(saved)

console.log('Saved pipeline:', pipeline)
console.log('Node count:', pipeline.nodes.length) // 应该是9
console.log('Edge count:', pipeline.edges.length) // 应该是8
console.log('Has transforms?', Object.keys(pipeline.transformCache).length > 0)
```

### ✓ 9. JSON Schema导出测试

**测试步骤**:
打开浏览器控制台执行:

```javascript
import { exportPipelineSchema } from '@/utils/demoData'
import { usePipelineStore } from '@/stores/modules/pipeline'

const store = usePipelineStore()
const schema = exportPipelineSchema(
  store.currentPipeline,
  store.transformCache
)

console.log('Pipeline JSON Schema:')
console.log(schema)

// 复制到剪贴板
copy(schema)
```

**预期结果**:
- ✅ 生成完整的JSON配置
- ✅ 包含version、pipeline、transforms、metadata部分
- ✅ 可以保存为.json文件

### ✓ 10. Pipeline恢复测试

**测试步骤**:
1. 导出Pipeline的JSON Schema（上一步）
2. 清空当前Pipeline:
```javascript
store.clear()
```

3. 从JSON恢复:
```javascript
import { importPipelineSchema } from '@/utils/demoData'

const schemaJson = '...' // 粘贴保存的JSON
const { pipeline, transforms } = importPipelineSchema(schemaJson)

store.setPipeline(pipeline)
transforms.forEach((transformList, nodeId) => {
  transformList.forEach(transform => {
    store.addTransform(nodeId, transform)
  })
})
```

4. 刷新页面验证

**预期结果**:
- ✅ 所有节点正确恢复
- ✅ 所有边正确恢复
- ✅ 所有Transform配置正确恢复
- ✅ 数据预览正常工作

## 性能测试

### 数据计算性能

**测试代码**:
```javascript
const store = usePipelineStore()

console.time('Execute Pipeline')
const result = await store.executePipeline()
console.timeEnd('Execute Pipeline')

console.log('Execution result:', result)
console.log('Success:', result.success)
console.log('Nodes processed:', result.message)
```

**预期性能**:
- ✅ 执行时间 < 100ms（9个节点，少量数据）
- ✅ 所有节点成功执行
- ✅ 无报错

### 大数据量测试（可选）

如果需要测试更大的数据集：

1. 修改 `src/mock/datasets.ts`，增加数据量
2. 重新加载演示Pipeline
3. 观察性能变化

## 常见问题排查

### Q1: 节点数据不显示？

**检查步骤**:
1. 打开浏览器控制台查看错误
2. 验证数据集是否正确加载:
```javascript
import { getDatasetData } from '@/mock/datasets'
console.log('Products:', getDatasetData('products'))
```

3. 检查节点是否正确连接:
```javascript
const store = usePipelineStore()
console.log('Edges:', store.edges)
```

### Q2: Transform不生效？

**检查步骤**:
1. 验证Transform配置:
```javascript
const transforms = store.getNodeTransforms('node_filter_products')
console.log('Transforms:', transforms)
console.log('Enabled?', transforms.every(t => t.enabled))
```

2. 手动执行Transform:
```javascript
import { applyTransform } from '@/utils/transform'
const data = getDatasetData('products')
const result = applyTransform(data, transforms[0])
console.log('Transform result:', result)
```

### Q3: Join结果为空？

**检查步骤**:
1. 验证Join keys存在:
```javascript
const leftData = await store.getNodeData('node_sort_products')
const rightData = await store.getNodeData('node_transactions')
console.log('Left keys:', Object.keys(leftData[0]))
console.log('Right keys:', Object.keys(rightData[0]))
console.log('Has product_id?', leftData[0].product_id, rightData[0].product_id)
```

2. 检查是否有匹配的记录:
```javascript
const leftIds = new Set(leftData.map(d => d.product_id))
const matches = rightData.filter(d => leftIds.has(d.product_id))
console.log('Matching transactions:', matches.length)
```

### Q4: 保存失败？

**检查步骤**:
1. 检查localStorage是否可用:
```javascript
console.log('localStorage available?', typeof localStorage !== 'undefined')
```

2. 检查存储空间:
```javascript
// 查看localStorage使用情况
let total = 0
for (let key in localStorage) {
  total += localStorage[key].length
}
console.log('localStorage size:', (total / 1024).toFixed(2), 'KB')
```

## 测试总结

完成以上所有测试后，您应该验证了：

- [x] 三个数据集正确加载
- [x] Filter Transform正确筛选数据
- [x] Sort Transform正确排序数据
- [x] Join节点正确关联数据
- [x] Output节点显示最终结果
- [x] 数据预览面板正常工作
- [x] Transform配置可查看
- [x] Pipeline保存和恢复功能
- [x] JSON Schema导出导入
- [x] 整体性能可接受

## 下一步

测试通过后，您可以：

1. **创建自定义Pipeline**: 尝试不同的数据转换组合
2. **导入自己的数据**: 使用CSV导入功能
3. **添加更多Transform**: 测试GroupBy、Pivot等高级操作
4. **优化性能**: 处理更大的数据集

---

**测试环境**:
- Node.js: v16+
- 浏览器: Chrome/Edge/Firefox (最新版本)
- 开发服务器: Vite 5.x

**最后更新**: 2025-11-17
