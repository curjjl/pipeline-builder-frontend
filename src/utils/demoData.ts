/**
 * 演示数据初始化工具
 * 用于快速创建包含完整数据转换流程的示例Pipeline
 */

import type { Node, Edge, Pipeline } from '@/stores/modules/pipeline'
import type { Transform } from '@/utils/transform'

/**
 * 创建示例Pipeline
 * 场景：分析高价值客户的购买行为
 *
 * 流程：
 * 1. Products数据集 -> 筛选高价值产品(price > 500) -> 排序
 * 2. Customers数据集 -> 筛选VIP客户
 * 3. Transactions数据集
 * 4. Join Products + Transactions -> 获取产品交易详情
 * 5. Join 上一步结果 + Customers -> 获取完整客户购买信息
 * 6. Output -> 输出最终分析结果
 */
export function createDemoPipeline(): Pipeline {
  const now = new Date().toISOString()

  const pipelineId = `demo_pipeline_${Date.now()}`

  // 创建节点
  const nodes: Node[] = [
    // 1. Products数据集节点
    {
      id: 'node_products',
      type: 'dataset',
      name: 'Products',
      x: 100,
      y: 100,
      data: {
        datasetId: 'products',
        datasetName: 'Products',
        description: '产品信息数据集'
      }
    },

    // 2. Products筛选节点 - 筛选高价值产品
    {
      id: 'node_filter_products',
      type: 'transform',
      name: 'Filter High-Value Products',
      x: 350,
      y: 100,
      data: {
        description: '筛选价格大于500的高价值产品'
      }
    },

    // 3. Products排序节点 - 按价格降序
    {
      id: 'node_sort_products',
      type: 'transform',
      name: 'Sort Products by Price',
      x: 600,
      y: 100,
      data: {
        description: '按价格降序排列产品'
      }
    },

    // 4. Customers数据集节点
    {
      id: 'node_customers',
      type: 'dataset',
      name: 'Customers',
      x: 100,
      y: 300,
      data: {
        datasetId: 'customers',
        datasetName: 'Customers',
        description: '客户信息数据集'
      }
    },

    // 5. Customers筛选节点 - 筛选VIP客户
    {
      id: 'node_filter_customers',
      type: 'transform',
      name: 'Filter VIP Customers',
      x: 350,
      y: 300,
      data: {
        description: '筛选VIP客户'
      }
    },

    // 6. Transactions数据集节点
    {
      id: 'node_transactions',
      type: 'dataset',
      name: 'Transactions',
      x: 100,
      y: 500,
      data: {
        datasetId: 'transactions',
        datasetName: 'Transactions',
        description: '交易记录数据集'
      }
    },

    // 7. Join节点 - Products + Transactions
    {
      id: 'node_join_product_transaction',
      type: 'join',
      name: 'Join Products & Transactions',
      x: 850,
      y: 300,
      data: {
        description: '关联产品信息和交易记录',
        joinConfig: {
          type: 'inner',
          leftKey: 'product_id',
          rightKey: 'product_id'
        }
      }
    },

    // 8. Join节点 - 上一步结果 + Customers
    {
      id: 'node_join_final',
      type: 'join',
      name: 'Join with Customers',
      x: 1100,
      y: 300,
      data: {
        description: '关联客户信息，获取完整的客户购买数据',
        joinConfig: {
          type: 'inner',
          leftKey: 'customer_id',
          rightKey: 'customer_id'
        }
      }
    },

    // 9. Output节点
    {
      id: 'node_output',
      type: 'output',
      name: 'VIP Customer Purchase Analysis',
      x: 1350,
      y: 300,
      data: {
        description: 'VIP客户高价值产品购买分析结果'
      }
    }
  ]

  // 创建边（连接）
  const edges: Edge[] = [
    // Products流程
    {
      id: 'edge_1',
      source: 'node_products',
      target: 'node_filter_products'
    },
    {
      id: 'edge_2',
      source: 'node_filter_products',
      target: 'node_sort_products'
    },
    {
      id: 'edge_3',
      source: 'node_sort_products',
      target: 'node_join_product_transaction'
    },

    // Customers流程
    {
      id: 'edge_4',
      source: 'node_customers',
      target: 'node_filter_customers'
    },
    {
      id: 'edge_5',
      source: 'node_filter_customers',
      target: 'node_join_final'
    },

    // Transactions流程
    {
      id: 'edge_6',
      source: 'node_transactions',
      target: 'node_join_product_transaction'
    },

    // Join流程
    {
      id: 'edge_7',
      source: 'node_join_product_transaction',
      target: 'node_join_final'
    },

    // 输出
    {
      id: 'edge_8',
      source: 'node_join_final',
      target: 'node_output'
    }
  ]

  return {
    id: pipelineId,
    name: 'VIP Customer Analysis Pipeline (Demo)',
    description: 'Demo pipeline for analyzing VIP customer purchase behavior with high-value products',
    nodes,
    edges,
    createdAt: now,
    updatedAt: now
  }
}

/**
 * 创建Transform配置
 * 用于配置各个Transform节点的转换规则
 */
export function getDemoTransforms(): Map<string, Transform[]> {
  const transforms = new Map<string, Transform[]>()

  // Products筛选 - 筛选价格 > 500的产品
  transforms.set('node_filter_products', [
    {
      id: 'transform_filter_1',
      type: 'filter',
      name: 'Filter price > 500',
      config: {
        column: 'price',
        operator: 'greater than',
        value: 500
      },
      enabled: true
    }
  ])

  // Products排序 - 按价格降序
  transforms.set('node_sort_products', [
    {
      id: 'transform_sort_1',
      type: 'sort',
      name: 'Sort by price descending',
      config: {
        column: 'price',
        order: 'desc'
      },
      enabled: true
    }
  ])

  // Customers筛选 - 筛选VIP客户
  transforms.set('node_filter_customers', [
    {
      id: 'transform_filter_2',
      type: 'filter',
      name: 'Filter VIP segment',
      config: {
        column: 'segment',
        operator: 'equals',
        value: 'VIP'
      },
      enabled: true
    }
  ])

  return transforms
}

/**
 * 导出完整的演示配置（包含Transform规则）
 */
export function getCompleteDemoConfig() {
  return {
    pipeline: createDemoPipeline(),
    transforms: getDemoTransforms()
  }
}

/**
 * 生成Pipeline的JSON Schema配置
 * 用于保存和恢复
 */
export function exportPipelineSchema(
  pipeline: Pipeline,
  transforms: Map<string, Transform[]>
): string {
  const schema = {
    version: '1.0.0',
    pipeline: {
      id: pipeline.id,
      name: pipeline.name,
      description: pipeline.description,
      nodes: pipeline.nodes,
      edges: pipeline.edges,
      createdAt: pipeline.createdAt,
      updatedAt: pipeline.updatedAt
    },
    transforms: Object.fromEntries(transforms),
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy: 'Pipeline Builder Demo',
      nodeCount: pipeline.nodes.length,
      edgeCount: pipeline.edges.length
    }
  }

  return JSON.stringify(schema, null, 2)
}

/**
 * 从JSON Schema恢复Pipeline配置
 */
export function importPipelineSchema(schemaJson: string): {
  pipeline: Pipeline
  transforms: Map<string, Transform[]>
} {
  const schema = JSON.parse(schemaJson)

  return {
    pipeline: schema.pipeline as Pipeline,
    transforms: new Map(Object.entries(schema.transforms))
  }
}
