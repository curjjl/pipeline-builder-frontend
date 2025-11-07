/**
 * Pipeline数据转换工具
 *
 * 提供Pipeline数据与X6 Graph之间的转换功能
 *
 * @module utils/pipelineTransform
 */

import type { Graph, Node as X6Node, Edge as X6Edge } from '@antv/x6'
import type { Pipeline, Node, Edge, NodeConfig } from '@/types/pipeline'
import { v4 as uuidv4 } from 'uuid'

// ============================================================================
// Graph to Pipeline 转换
// ============================================================================

/**
 * 将X6 Graph数据转换为Pipeline JSON
 *
 * @param graph X6 Graph实例
 * @param existingPipeline 现有Pipeline数据（用于保留元信息等）
 * @returns Pipeline对象
 */
export function graphToPipeline(
  graph: Graph,
  existingPipeline?: Partial<Pipeline>
): Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> {
  const cells = graph.getCells()

  // 提取节点
  const nodes: Node[] = cells
    .filter((cell) => cell.isNode())
    .map((cell) => x6NodeToNode(cell as X6Node))

  // 提取边
  const edges: Edge[] = cells
    .filter((cell) => cell.isEdge())
    .map((cell) => x6EdgeToEdge(cell as X6Edge))

  // 获取当前画布状态
  const zoom = graph.zoom()
  const center = graph.getGraphArea().getCenter()

  return {
    name: existingPipeline?.name || 'Untitled Pipeline',
    description: existingPipeline?.description,
    version: existingPipeline?.version || '1.0.0',

    metadata: existingPipeline?.metadata || {
      category: 'ETL',
      tags: [],
      owner: '',
      visibility: 'private',
      status: 'draft'
    },

    graph: {
      nodes,
      edges,
      layout: {
        zoom,
        center: {
          x: center.x,
          y: center.y
        }
      }
    },

    configuration: existingPipeline?.configuration || {
      execution: {
        mode: 'sequential'
      }
    }
  }
}

/**
 * 将X6节点转换为Pipeline节点
 */
function x6NodeToNode(x6Node: X6Node): Node {
  const position = x6Node.position()
  const size = x6Node.size()
  const data = x6Node.getData() || {}

  return {
    id: x6Node.id,
    type: data.type || 'custom',
    label: data.label || x6Node.getAttrByPath('label/text') || 'Untitled Node',
    description: data.description,

    position: {
      x: position.x,
      y: position.y
    },

    size: {
      width: size.width,
      height: size.height
    },

    ports: {
      input: extractPorts(x6Node, 'in'),
      output: extractPorts(x6Node, 'out')
    },

    config: data.config || {},

    metadata: {
      color: data.metadata?.color || x6Node.getAttrByPath('body/fill'),
      icon: data.metadata?.icon,
      collapsed: data.metadata?.collapsed,
      tags: data.metadata?.tags || []
    },

    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * 提取端口信息
 */
function extractPorts(x6Node: X6Node, group: 'in' | 'out') {
  const ports = x6Node.getPorts().filter((p) => p.group === group)

  return ports.map((port) => ({
    id: port.id!,
    label: port.label,
    dataType: port.attrs?.dataType,
    multiple: port.attrs?.multiple !== false,
    required: port.attrs?.required === true,
    position: port.args?.position
  }))
}

/**
 * 将X6边转换为Pipeline边
 */
function x6EdgeToEdge(x6Edge: X6Edge): Edge {
  const source = x6Edge.getSource()
  const target = x6Edge.getTarget()
  const data = x6Edge.getData() || {}

  return {
    id: x6Edge.id,

    source: {
      nodeId: source.cell!,
      portId: source.port || ''
    },

    target: {
      nodeId: target.cell!,
      portId: target.port || ''
    },

    label: data.label || x6Edge.getAttrByPath('line/label/text'),

    style: {
      type: data.style?.type || 'solid',
      color: data.style?.color || x6Edge.getAttrByPath('line/stroke'),
      width: data.style?.width || x6Edge.getAttrByPath('line/strokeWidth'),
      animated: data.style?.animated
    },

    route: {
      type: data.route?.type || 'manhattan',
      vertices: x6Edge.getVertices()
    },

    dataFlow: data.dataFlow,

    createdAt: data.createdAt || new Date().toISOString()
  }
}

// ============================================================================
// Pipeline to Graph 转换
// ============================================================================

/**
 * 将Pipeline JSON加载到X6 Graph
 *
 * @param pipeline Pipeline对象
 * @param graph X6 Graph实例
 */
export function pipelineToGraph(pipeline: Pipeline, graph: Graph): void {
  // 清空现有数据
  graph.clearCells()

  // 添加节点
  const x6Nodes = pipeline.graph.nodes.map((node) => nodeToX6Node(node))
  graph.addNodes(x6Nodes)

  // 添加边
  const x6Edges = pipeline.graph.edges.map((edge) => edgeToX6Edge(edge))
  graph.addEdges(x6Edges)

  // 恢复布局
  if (pipeline.graph.layout) {
    graph.zoom(pipeline.graph.layout.zoom)
    graph.centerPoint(
      pipeline.graph.layout.center.x,
      pipeline.graph.layout.center.y
    )
  } else {
    // 自动居中
    graph.zoomToFit({ padding: 20, maxScale: 1 })
  }
}

/**
 * 将Pipeline节点转换为X6节点
 */
function nodeToX6Node(node: Node): X6Node.Metadata {
  return {
    id: node.id,
    shape: getNodeShape(node.type),
    x: node.position.x,
    y: node.position.y,
    width: node.size?.width || 180,
    height: node.size?.height || 72,

    label: node.label,

    ports: {
      items: [
        ...node.ports.input.map((port) => ({
          id: port.id,
          group: 'in',
          label: port.label,
          attrs: {
            dataType: port.dataType,
            multiple: port.multiple,
            required: port.required
          },
          args: {
            position: port.position
          }
        })),
        ...node.ports.output.map((port) => ({
          id: port.id,
          group: 'out',
          label: port.label,
          attrs: {
            dataType: port.dataType,
            multiple: port.multiple,
            required: port.required
          },
          args: {
            position: port.position
          }
        }))
      ]
    },

    data: {
      type: node.type,
      label: node.label,
      description: node.description,
      config: node.config,
      metadata: node.metadata,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt
    },

    attrs: {
      body: {
        fill: node.metadata.color || getDefaultNodeColor(node.type)
      }
    }
  }
}

/**
 * 将Pipeline边转换为X6边
 */
function edgeToX6Edge(edge: Edge): X6Edge.Metadata {
  return {
    id: edge.id,
    shape: 'edge',

    source: {
      cell: edge.source.nodeId,
      port: edge.source.portId
    },

    target: {
      cell: edge.target.nodeId,
      port: edge.target.portId
    },

    label: edge.label,

    vertices: edge.route?.vertices,

    router: {
      name: edge.route?.type || 'manhattan'
    },

    connector: {
      name: 'rounded',
      args: { radius: 10 }
    },

    attrs: {
      line: {
        stroke: edge.style?.color || '#98A2B3',
        strokeWidth: edge.style?.width || 2,
        strokeDasharray: getStrokeDasharray(edge.style?.type || 'solid'),
        targetMarker: {
          name: 'block',
          width: 12,
          height: 8
        }
      }
    },

    data: {
      label: edge.label,
      style: edge.style,
      route: edge.route,
      dataFlow: edge.dataFlow,
      createdAt: edge.createdAt
    }
  }
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 根据节点类型获取X6 shape名称
 */
function getNodeShape(nodeType: string): string {
  const shapeMap: Record<string, string> = {
    'dataset': 'dataset-node',
    'database-source': 'dataset-node',
    'sql-transform': 'transform-node',
    'python-transform': 'transform-node',
    'javascript-transform': 'transform-node',
    'filter': 'transform-node',
    'aggregate': 'transform-node',
    'join': 'transform-node',
    'union': 'transform-node',
    'dataset-output': 'output-node'
  }

  return shapeMap[nodeType] || 'rect'
}

/**
 * 根据节点类型获取默认颜色
 */
function getDefaultNodeColor(nodeType: string): string {
  const colorMap: Record<string, string> = {
    'dataset': '#4285F4',
    'database-source': '#4285F4',
    'sql-transform': '#9334E6',
    'python-transform': '#9334E6',
    'javascript-transform': '#9334E6',
    'filter': '#10B981',
    'aggregate': '#EF4444',
    'join': '#F59E0B',
    'union': '#8B5CF6',
    'dataset-output': '#8B5CF6'
  }

  return colorMap[nodeType] || '#98A2B3'
}

/**
 * 根据线型获取stroke-dasharray
 */
function getStrokeDasharray(lineType: 'solid' | 'dashed' | 'dotted'): string | undefined {
  const dasharrayMap: Record<string, string> = {
    'solid': '',
    'dashed': '5 5',
    'dotted': '2 2'
  }

  return dasharrayMap[lineType] || undefined
}

// ============================================================================
// 节点创建工厂
// ============================================================================

/**
 * 创建新节点的工厂函数
 */
export function createNode(
  type: Node['type'],
  position: { x: number; y: number },
  config?: Partial<NodeConfig>
): Node {
  const now = new Date().toISOString()

  const baseNode: Omit<Node, 'config'> = {
    id: `node-${uuidv4()}`,
    type,
    label: getDefaultNodeLabel(type),
    position,
    ports: getDefaultPorts(type),
    metadata: {
      color: getDefaultNodeColor(type),
      tags: []
    },
    createdAt: now,
    updatedAt: now
  }

  return {
    ...baseNode,
    config: config || getDefaultNodeConfig(type)
  } as Node
}

/**
 * 获取节点默认标签
 */
function getDefaultNodeLabel(nodeType: string): string {
  const labelMap: Record<string, string> = {
    'dataset': 'Dataset',
    'database-source': 'Database Source',
    'sql-transform': 'SQL Transform',
    'python-transform': 'Python Transform',
    'filter': 'Filter',
    'aggregate': 'Aggregate',
    'join': 'Join',
    'union': 'Union',
    'dataset-output': 'Output'
  }

  return labelMap[nodeType] || 'Node'
}

/**
 * 获取节点默认端口
 */
function getDefaultPorts(nodeType: string): Node['ports'] {
  // 数据源节点：只有输出
  if (['dataset', 'database-source', 'file-source', 'api-source'].includes(nodeType)) {
    return {
      input: [],
      output: [
        {
          id: 'port-out',
          label: 'output',
          multiple: true,
          required: false,
          dataType: { type: 'table' }
        }
      ]
    }
  }

  // 输出节点：只有输入
  if (['dataset-output', 'database-sink', 'file-sink', 'api-sink'].includes(nodeType)) {
    return {
      input: [
        {
          id: 'port-in',
          label: 'input',
          multiple: false,
          required: true,
          dataType: { type: 'table' }
        }
      ],
      output: []
    }
  }

  // Join节点：两个输入，一个输出
  if (nodeType === 'join') {
    return {
      input: [
        {
          id: 'port-left',
          label: 'left',
          multiple: false,
          required: true,
          dataType: { type: 'table' }
        },
        {
          id: 'port-right',
          label: 'right',
          multiple: false,
          required: true,
          dataType: { type: 'table' }
        }
      ],
      output: [
        {
          id: 'port-out',
          label: 'joined',
          multiple: true,
          required: false,
          dataType: { type: 'table' }
        }
      ]
    }
  }

  // 默认：一个输入，一个输出
  return {
    input: [
      {
        id: 'port-in',
        label: 'input',
        multiple: false,
        required: true,
        dataType: { type: 'table' }
      }
    ],
    output: [
      {
        id: 'port-out',
        label: 'output',
        multiple: true,
        required: false,
        dataType: { type: 'table' }
      }
    ]
  }
}

/**
 * 获取节点默认配置
 */
function getDefaultNodeConfig(nodeType: string): NodeConfig {
  // 根据节点类型返回默认配置
  // 这里只是示例，实际应该更完善
  switch (nodeType) {
    case 'dataset':
      return {
        datasetId: '',
        datasetName: '',
        source: { type: 'foundry' },
        snapshot: { enabled: true, type: 'latest' }
      } as NodeConfig

    case 'sql-transform':
      return {
        sql: 'SELECT * FROM input',
        dialect: 'standard',
        inputAliases: { 'port-in': 'input' }
      } as NodeConfig

    case 'filter':
      return {
        mode: 'simple',
        conditions: []
      } as NodeConfig

    default:
      return {} as NodeConfig
  }
}

/**
 * 创建新边
 */
export function createEdge(
  sourceNodeId: string,
  sourcePortId: string,
  targetNodeId: string,
  targetPortId: string
): Edge {
  return {
    id: `edge-${uuidv4()}`,
    source: {
      nodeId: sourceNodeId,
      portId: sourcePortId
    },
    target: {
      nodeId: targetNodeId,
      portId: targetPortId
    },
    style: {
      type: 'solid',
      animated: false
    },
    createdAt: new Date().toISOString()
  }
}

// ============================================================================
// 验证函数
// ============================================================================

/**
 * 检查图是否包含环（DAG验证）
 */
export function hasCycle(graph: { nodes: Node[]; edges: Edge[] }): boolean {
  // 构建邻接表
  const adjList = new Map<string, string[]>()

  graph.nodes.forEach((node) => {
    adjList.set(node.id, [])
  })

  graph.edges.forEach((edge) => {
    const neighbors = adjList.get(edge.source.nodeId) || []
    neighbors.push(edge.target.nodeId)
    adjList.set(edge.source.nodeId, neighbors)
  })

  // DFS检测环
  const visited = new Set<string>()
  const recStack = new Set<string>()

  function dfs(nodeId: string): boolean {
    visited.add(nodeId)
    recStack.add(nodeId)

    const neighbors = adjList.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true
        }
      } else if (recStack.has(neighbor)) {
        return true
      }
    }

    recStack.delete(nodeId)
    return false
  }

  for (const nodeId of adjList.keys()) {
    if (!visited.has(nodeId)) {
      if (dfs(nodeId)) {
        return true
      }
    }
  }

  return false
}

/**
 * 验证边的连接是否有效
 */
export function validateEdgeConnection(
  edge: Edge,
  nodes: Node[]
): { valid: boolean; error?: string } {
  // 检查源节点和目标节点是否存在
  const sourceNode = nodes.find((n) => n.id === edge.source.nodeId)
  const targetNode = nodes.find((n) => n.id === edge.target.nodeId)

  if (!sourceNode) {
    return { valid: false, error: `Source node '${edge.source.nodeId}' not found` }
  }

  if (!targetNode) {
    return { valid: false, error: `Target node '${edge.target.nodeId}' not found` }
  }

  // 检查端口是否存在
  const sourcePort = sourceNode.ports.output.find((p) => p.id === edge.source.portId)
  const targetPort = targetNode.ports.input.find((p) => p.id === edge.target.portId)

  if (!sourcePort) {
    return { valid: false, error: `Source port '${edge.source.portId}' not found` }
  }

  if (!targetPort) {
    return { valid: false, error: `Target port '${edge.target.portId}' not found` }
  }

  // 检查数据类型兼容性
  if (sourcePort.dataType && targetPort.dataType) {
    if (sourcePort.dataType.type !== 'any' && targetPort.dataType.type !== 'any') {
      if (sourcePort.dataType.type !== targetPort.dataType.type) {
        return {
          valid: false,
          error: `Data type mismatch: ${sourcePort.dataType.type} -> ${targetPort.dataType.type}`
        }
      }
    }
  }

  return { valid: true }
}

/**
 * 获取拓扑排序（用于执行顺序）
 */
export function topologicalSort(graph: { nodes: Node[]; edges: Edge[] }): string[] | null {
  // 检查是否有环
  if (hasCycle(graph)) {
    return null
  }

  // 计算入度
  const inDegree = new Map<string, number>()
  graph.nodes.forEach((node) => {
    inDegree.set(node.id, 0)
  })

  graph.edges.forEach((edge) => {
    const degree = inDegree.get(edge.target.nodeId) || 0
    inDegree.set(edge.target.nodeId, degree + 1)
  })

  // 构建邻接表
  const adjList = new Map<string, string[]>()
  graph.nodes.forEach((node) => {
    adjList.set(node.id, [])
  })

  graph.edges.forEach((edge) => {
    const neighbors = adjList.get(edge.source.nodeId) || []
    neighbors.push(edge.target.nodeId)
    adjList.set(edge.source.nodeId, neighbors)
  })

  // Kahn算法
  const queue: string[] = []
  const result: string[] = []

  // 将所有入度为0的节点加入队列
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId)
    }
  })

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    result.push(nodeId)

    const neighbors = adjList.get(nodeId) || []
    neighbors.forEach((neighbor) => {
      const degree = inDegree.get(neighbor)! - 1
      inDegree.set(neighbor, degree)

      if (degree === 0) {
        queue.push(neighbor)
      }
    })
  }

  return result.length === graph.nodes.length ? result : null
}
