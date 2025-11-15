<template>
  <div ref="containerRef" class="graph-canvas"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Graph, Node as X6Node, Edge as X6Edge } from '@antv/x6'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Selection } from '@antv/x6-plugin-selection'
import { Clipboard } from '@antv/x6-plugin-clipboard'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { History } from '@antv/x6-plugin-history'
import { MiniMap } from '@antv/x6-plugin-minimap'
import type { Node, Edge } from '@/stores/modules/pipeline'
import { registerDatasetNode, registerTransformNode, registerJoinNode, registerOutputNode } from './nodes/register'

interface Props {
  nodes?: Node[]
  edges?: Edge[]
  showMinimap?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  nodes: () => [],
  edges: () => [],
  showMinimap: true
})

const emit = defineEmits<{
  'node:click': [node: Node]
  'node:dblclick': [node: Node]
  'node:contextmenu': [payload: { node: Node; event: MouseEvent }]
  'node:rename': [payload: { node: Node; name: string }]
  'edge:click': [edge: Edge]
  'edge:contextmenu': [payload: { edge: Edge; event: MouseEvent }]
  'canvas:click': []
  'node:added': [node: Node]
  'edge:added': [edge: Edge]
  'edge:removed': [edge: Edge]
  'node:moved': [payload: { node: Node; position: { x: number; y: number } }]
  'nodes:copied': [count: number]
  'nodes:pasted': [count: number]
}>()

const containerRef = ref<HTMLDivElement>()
let graph: Graph | null = null

// 初始化图编辑器
const initGraph = () => {
  if (!containerRef.value) return

  // 注册自定义节点
  registerDatasetNode()
  registerTransformNode()
  registerJoinNode()
  registerOutputNode()

  graph = new Graph({
    container: containerRef.value,
    background: {
      color: '#F1F3F4'
    },
    grid: {
      visible: false
    },
    panning: {
      enabled: true,
      modifiers: ['ctrl', 'meta']  // 按住Ctrl/Command键拖拽画布
    },
    autoResize: true,  // 启用自动调整大小，响应容器尺寸变化
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta'],
      minScale: 0.2,
      maxScale: 2
    },
    connecting: {
      router: {
        name: 'orth',
        args: {
          padding: 10
        }
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8
        }
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      snap: {
        radius: 20
      },
      allowBlank: false,
      allowLoop: false,
      allowNode: false,
      createEdge() {
        return graph!.createEdge({
          shape: 'edge',
          attrs: {
            line: {
              stroke: '#5F6368',
              strokeWidth: 2,
              strokeLinecap: 'round',
              targetMarker: {
                name: 'circle',
                r: 4,
                fill: '#5F6368'
              }
            }
          },
          zIndex: 1
        })
      },
      validateConnection({ sourceCell, targetCell, sourceMagnet, targetMagnet }) {
        // 不能连接到自己
        if (sourceCell === targetCell) {
          return false
        }

        // 必须从输出端口连接到输入端口
        if (!sourceMagnet || !targetMagnet) {
          return false
        }

        // 检查是否已存在连接
        const edges = graph!.getEdges()
        const hasConnection = edges.some(
          edge =>
            edge.getSourceCellId() === sourceCell?.id &&
            edge.getTargetCellId() === targetCell?.id
        )
        if (hasConnection) {
          return false
        }

        // Get node types from data
        const sourceNodeData = sourceCell?.getData()
        const targetNodeData = targetCell?.getData()

        // Dataset nodes cannot accept input connections (they are data sources)
        if (targetNodeData?.type === 'dataset') {
          return false
        }

        // Output nodes cannot be sources (they are endpoints)
        if (sourceNodeData?.type === 'output') {
          return false
        }

        // Prevent circular dependencies (basic check)
        const wouldCreateCycle = (source: string, target: string): boolean => {
          const downstreamNodes = new Set<string>([target])
          const toCheck = [target]

          while (toCheck.length > 0) {
            const current = toCheck.pop()!
            const outgoingEdges = edges.filter(e => e.getSourceCellId() === current)

            for (const edge of outgoingEdges) {
              const downstream = edge.getTargetCellId()
              if (downstream === source) {
                return true // Cycle detected
              }
              if (!downstreamNodes.has(downstream)) {
                downstreamNodes.add(downstream)
                toCheck.push(downstream)
              }
            }
          }

          return false
        }

        if (wouldCreateCycle(sourceCell!.id, targetCell!.id)) {
          return false
        }

        return true
      }
    },
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#2D6EED',
            stroke: '#2D6EED'
          }
        }
      }
    },
    interacting: {
      nodeMovable: true
    }
  })

  // 注册插件
  graph
    .use(
      new Snapline({
        enabled: true,
        sharp: true,
        className: 'snapline'
      })
    )
    .use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
        modifiers: 'shift',
        rubberEdge: true,
        rubberNode: true,
        strict: false,
        selectCellOnMoved: true
      })
    )
    .use(
      new Clipboard({
        enabled: true
      })
    )
    .use(
      new Keyboard({
        enabled: true
      })
    )
    .use(
      new History({
        enabled: true
      })
    )

  // 小地图插件（可选）
  if (props.showMinimap) {
    const minimapContainer = document.createElement('div')
    minimapContainer.className = 'minimap-container'
    containerRef.value?.appendChild(minimapContainer)

    graph.use(
      new MiniMap({
        container: minimapContainer,
        width: 200,
        height: 150,
        padding: 10
      })
    )
  }

  // 绑定事件
  bindEvents()

  // 初始化节点和边
  if (props.nodes.length > 0) {
    props.nodes.forEach(addNode)
  }
  if (props.edges.length > 0) {
    props.edges.forEach(addEdge)
  }
}

// 绑定事件
const bindEvents = () => {
  if (!graph) return

  // 节点点击
  graph.on('node:click', ({ node, e }) => {
    const nodeData = node.getData() as Node
    if (nodeData) {
      emit('node:click', nodeData)
    }
  })

  // 节点双击
  graph.on('node:dblclick', ({ node }) => {
    const nodeData = node.getData() as Node
    if (nodeData) {
      emit('node:dblclick', nodeData)
    }
  })

  // 节点右键
  graph.on('node:contextmenu', ({ node, e }) => {
    e.preventDefault()
    const nodeData = node.getData() as Node
    if (nodeData) {
      emit('node:contextmenu', { node: nodeData, event: e as MouseEvent })
    }
  })

  // 边点击
  graph.on('edge:click', ({ edge }) => {
    const edgeData = edge.getData() as Edge
    if (edgeData) {
      emit('edge:click', edgeData)
    }
  })

  // 边右键
  graph.on('edge:contextmenu', ({ edge, e }) => {
    e.preventDefault()
    const edgeData = edge.getData() as Edge
    if (edgeData) {
      emit('edge:contextmenu', { edge: edgeData, event: e as MouseEvent })
    }
  })

  // 画布点击
  graph.on('blank:click', () => {
    emit('canvas:click')
    graph?.cleanSelection()
  })

  // 连接创建
  graph.on('edge:connected', ({ edge }) => {
    const edgeData: Edge = {
      id: edge.id,
      source: edge.getSourceCellId(),
      target: edge.getTargetCellId()
    }
    edge.setData(edgeData)
    emit('edge:added', edgeData)
  })

  // 节点悬停效果
  graph.on('node:mouseenter', ({ node }) => {
    // 显示端口并放大
    const ports = node.getPorts()
    ports.forEach(port => {
      node.setPortProp(port.id!, 'attrs/circle/opacity', 1)
      node.setPortProp(port.id!, 'attrs/circle/r', 7)
      node.setPortProp(port.id!, 'attrs/circle/stroke', '#2D6EED')
      node.setPortProp(port.id!, 'attrs/circle/strokeWidth', 2.5)
    })

    // 添加边框工具
    if (!node.hasTools()) {
      node.addTools([
        {
          name: 'boundary',
          args: {
            attrs: {
              fill: '#2D6EED',
              stroke: '#2D6EED',
              'stroke-width': 2,
              'fill-opacity': 0.1
            }
          }
        }
      ])
    }
  })

  graph.on('node:mouseleave', ({ node }) => {
    // 检查节点是否被选中
    const selectedCells = graph!.getSelectedCells()
    const isSelected = selectedCells.some(cell => cell.id === node.id)

    if (!isSelected) {
      // 隐藏端口
      const ports = node.getPorts()
      ports.forEach(port => {
        node.setPortProp(port.id!, 'attrs/circle/opacity', 0)
        node.setPortProp(port.id!, 'attrs/circle/r', 6)
        node.setPortProp(port.id!, 'attrs/circle/stroke', '#5F6368')
        node.setPortProp(port.id!, 'attrs/circle/strokeWidth', 2)
      })
      node.removeTools()
    }
  })

  // 节点拖拽开始
  graph.on('node:change:position', ({ node, options }) => {
    // 只在用户拖拽时添加阴影（不是程序化移动）
    if (options.ui) {
      // 检查是否已经有阴影，避免重复添加
      const currentFilter = node.attr('body/filter')
      if (!currentFilter) {
        node.attr('body/filter', {
          name: 'dropShadow',
          args: {
            dx: 0,
            dy: 4,
            blur: 8,
            color: 'rgba(0, 0, 0, 0.2)'
          }
        })
      }
    }
  })

  // 节点拖拽结束
  graph.on('node:moved', ({ node }) => {
    // 移除拖拽阴影（设置为null）
    node.attr('body/filter', null)

    const nodeData = node.getData() as Node
    const position = node.getPosition()
    emit('node:moved', { node: nodeData, position })
  })

  // 节点选中
  graph.on('node:selected', ({ node }) => {
    node.attr('body/stroke', '#2D6EED')
    node.attr('body/strokeWidth', 2)

    // 选中时保持端口可见
    const ports = node.getPorts()
    ports.forEach(port => {
      node.setPortProp(port.id!, 'attrs/circle/opacity', 1)
      node.setPortProp(port.id!, 'attrs/circle/stroke', '#2D6EED')
      node.setPortProp(port.id!, 'attrs/circle/strokeWidth', 2.5)
    })
  })

  graph.on('node:unselected', ({ node }) => {
    node.attr('body/stroke', '#D0D5DD')
    node.attr('body/strokeWidth', 1)
    node.removeTools()

    // 取消选中时隐藏端口
    const ports = node.getPorts()
    ports.forEach(port => {
      node.setPortProp(port.id!, 'attrs/circle/opacity', 0)
      node.setPortProp(port.id!, 'attrs/circle/stroke', '#5F6368')
      node.setPortProp(port.id!, 'attrs/circle/strokeWidth', 2)
    })
  })

  // 端口悬停高亮效果
  graph.on('node:port:mouseenter', ({ node, port }) => {
    // 高亮悬停的端口
    node.setPortProp(port, 'attrs/circle/opacity', 1)
    node.setPortProp(port, 'attrs/circle/r', 8)
    node.setPortProp(port, 'attrs/circle/stroke', '#4285F4')
    node.setPortProp(port, 'attrs/circle/strokeWidth', 3)
    node.setPortProp(port, 'attrs/circle/fill', '#E8F0FE')
  })

  graph.on('node:port:mouseleave', ({ node, port }) => {
    // 检查节点是否被选中或鼠标是否在节点上
    const selectedCells = graph!.getSelectedCells()
    const isSelected = selectedCells.some(cell => cell.id === node.id)

    // 如果节点被选中或鼠标仍在节点上，保持端口可见但不放大
    if (isSelected) {
      node.setPortProp(port, 'attrs/circle/opacity', 1)
      node.setPortProp(port, 'attrs/circle/r', 7)
      node.setPortProp(port, 'attrs/circle/stroke', '#2D6EED')
      node.setPortProp(port, 'attrs/circle/strokeWidth', 2.5)
      node.setPortProp(port, 'attrs/circle/fill', '#FFFFFF')
    } else {
      // 否则恢复默认状态
      node.setPortProp(port, 'attrs/circle/opacity', 0)
      node.setPortProp(port, 'attrs/circle/r', 6)
      node.setPortProp(port, 'attrs/circle/stroke', '#5F6368')
      node.setPortProp(port, 'attrs/circle/strokeWidth', 2)
      node.setPortProp(port, 'attrs/circle/fill', '#FFFFFF')
    }
  })

  // 边悬停效果
  graph.on('edge:mouseenter', ({ edge }) => {
    edge.attr('line/stroke', '#4285F4')
    edge.attr('line/strokeWidth', 3)
    edge.attr('line/targetMarker/fill', '#4285F4')

    // 添加边工具按钮
    if (!edge.hasTools()) {
      edge.addTools([
        {
          name: 'vertices', // 顶点工具
          args: {
            attrs: {
              fill: '#FFFFFF',
              stroke: '#4285F4',
              'stroke-width': 2,
              r: 5
            }
          }
        },
        {
          name: 'button-remove', // 删除按钮
          args: {
            distance: '50%',
            offset: { x: 0, y: -15 },
            onClick({ view }: any) {
              const edgeData = edge.getData() as Edge
              emit('edge:removed', edgeData)
              view.cell.remove()
            }
          }
        }
      ])
    }
  })

  graph.on('edge:mouseleave', ({ edge }) => {
    // 检查边是否被选中
    const selectedCells = graph!.getSelectedCells()
    const isSelected = selectedCells.some(cell => cell.id === edge.id)

    if (!isSelected) {
      edge.attr('line/stroke', '#5F6368')
      edge.attr('line/strokeWidth', 2)
      edge.attr('line/targetMarker/fill', '#5F6368')
      edge.removeTools()
    }
  })

  // 边选中
  graph.on('edge:selected', ({ edge }) => {
    edge.attr('line/stroke', '#4285F4')
    edge.attr('line/strokeWidth', 3)
    edge.attr('line/targetMarker/fill', '#4285F4')

    // 选中时添加工具
    if (!edge.hasTools()) {
      edge.addTools([
        {
          name: 'vertices',
          args: {
            attrs: {
              fill: '#FFFFFF',
              stroke: '#4285F4',
              'stroke-width': 2,
              r: 5
            }
          }
        }
      ])
    }
  })

  graph.on('edge:unselected', ({ edge }) => {
    edge.attr('line/stroke', '#5F6368')
    edge.attr('line/strokeWidth', 2)
    edge.attr('line/targetMarker/fill', '#5F6368')
    edge.removeTools()
  })

  // 键盘快捷键
  // 复制
  graph.bindKey(['ctrl+c', 'meta+c'], () => {
    const cells = graph!.getSelectedCells()
    if (cells.length) {
      graph!.copy(cells)

      // 触发复制事件
      const nodeCount = cells.filter(cell => cell.isNode()).length
      if (nodeCount > 0) {
        emit('nodes:copied', nodeCount)
      }
    }
    return false
  })

  // 粘贴
  graph.bindKey(['ctrl+v', 'meta+v'], () => {
    if (!graph!.isClipboardEmpty()) {
      const cells = graph!.paste({ offset: 40 })
      graph!.cleanSelection()
      graph!.select(cells)

      // 触发粘贴事件
      const nodeCount = cells.filter(cell => cell.isNode()).length
      if (nodeCount > 0) {
        emit('nodes:pasted', nodeCount)
      }

      // 为粘贴的节点更新数据和发送事件
      cells.filter(cell => cell.isNode()).forEach(node => {
        const nodeData = node.getData()
        if (nodeData) {
          emit('node:added', nodeData)
        }
      })
    }
    return false
  })

  // 删除
  graph.bindKey(['delete', 'backspace'], () => {
    const cells = graph!.getSelectedCells()
    if (cells.length) {
      graph!.removeCells(cells)
    }
    return false
  })

  // 撤销
  graph.bindKey(['ctrl+z', 'meta+z'], () => {
    if (graph!.canUndo()) {
      graph!.undo()
    }
    return false
  })

  // 重做
  graph.bindKey(['ctrl+y', 'meta+y', 'ctrl+shift+z', 'meta+shift+z'], () => {
    if (graph!.canRedo()) {
      graph!.redo()
    }
    return false
  })

  // 全选
  graph.bindKey(['ctrl+a', 'meta+a'], () => {
    const nodes = graph!.getNodes()
    if (nodes.length) {
      graph!.select(nodes)
    }
    return false
  })

  // 取消选择
  graph.bindKey(['escape', 'esc'], () => {
    graph!.cleanSelection()
    return false
  })

  // 保存（触发自定义事件，由父组件处理）
  graph.bindKey(['ctrl+s', 'meta+s'], () => {
    // 阻止浏览器默认保存行为
    return false
  })
}

// 添加节点
const addNode = (nodeData: Node): X6Node | null => {
  if (!graph) return null

  // Get node shape based on type
  const getNodeShape = (type: string): string => {
    const shapeMap: Record<string, string> = {
      'dataset': 'dataset-node',
      'transform': 'transform-node',
      'join': 'join-node',
      'output': 'output-node'
    }
    return shapeMap[type] || 'transform-node'
  }

  // Prepare meta text based on node type
  let metaText = ''
  if (nodeData.type === 'dataset') {
    const rowCount = nodeData.data?.rowCount || 0
    const columnCount = nodeData.data?.columnCount || 0
    if (rowCount > 0) {
      metaText = `${rowCount.toLocaleString()} rows · ${columnCount} columns`
    } else {
      metaText = `${columnCount} columns`
    }
  } else if (nodeData.type === 'transform') {
    // Display column count for transform nodes
    const columnCount = nodeData.data?.columnCount || 0
    if (columnCount > 0) {
      metaText = `${columnCount} columns`
    } else {
      metaText = 'Not configured'
    }
  } else if (nodeData.type === 'join') {
    metaText = nodeData.data?.joinConfig?.type ? `${nodeData.data.joinConfig.type} join` : 'Inner join'
  } else if (nodeData.type === 'output') {
    metaText = nodeData.data?.outputName || 'Save to dataset'
  }

  const node = graph.addNode({
    id: nodeData.id,
    shape: getNodeShape(nodeData.type),
    x: nodeData.x,
    y: nodeData.y,
    data: nodeData
  })

  // Update text content after node creation to avoid overriding default attrs
  node.attr('label/text', nodeData.name)
  node.attr('meta/text', metaText)

  return node
}

// 添加边
const addEdge = (edgeData: Edge): X6Edge | null => {
  if (!graph) return null

  const edge = graph.addEdge({
    id: edgeData.id,
    source: { cell: edgeData.source, port: edgeData.sourcePort || 'port-out' },
    target: { cell: edgeData.target, port: edgeData.targetPort || 'port-in' },
    data: edgeData,
    router: {
      name: 'manhattan',
      args: {
        padding: 10,
        step: 10
      }
    },
    connector: {
      name: 'rounded',
      args: {
        radius: 8
      }
    },
    attrs: {
      line: {
        stroke: '#98A2B3',
        strokeWidth: 2,
        strokeLinecap: 'round',
        targetMarker: {
          name: 'block',
          width: 8,
          height: 6,
          fill: '#98A2B3'
        }
      }
    },
    zIndex: 0
  })

  return edge
}

// 缩放控制
const zoom = (type: 'in' | 'out' | 'fit') => {
  if (!graph) return

  switch (type) {
    case 'in':
      graph.zoom(0.1)
      break
    case 'out':
      graph.zoom(-0.1)
      break
    case 'fit':
      graph.zoomToFit({ padding: 20, maxScale: 1 })
      break
  }
}

// 居中显示
const centerContent = () => {
  if (!graph) return
  graph.centerContent()
}

// 清空画布
const clearCanvas = () => {
  if (!graph) return
  graph.clearCells()
}

// 获取节点
const getNode = (id: string): X6Node | null => {
  if (!graph) return null
  return graph.getCellById(id) as X6Node
}

// 更新节点数据
const updateNodeData = (id: string, data: Partial<Node>) => {
  const node = getNode(id)
  if (node) {
    const currentData = node.getData() as Node
    const updatedData = { ...currentData, ...data }
    node.setData(updatedData)

    // 更新节点显示
    if (data.name) {
      node.attr('label/text', data.name)
    }

    // 更新元信息
    if (data.data) {
      let metaText = ''
      if (updatedData.type === 'dataset') {
        const rowCount = updatedData.data?.rowCount || 0
        const columnCount = updatedData.data?.columnCount || 0
        if (rowCount > 0) {
          metaText = `${rowCount.toLocaleString()} rows · ${columnCount} columns`
        } else {
          metaText = `${columnCount} columns`
        }
      } else if (updatedData.type === 'transform') {
        // Display column count for transform nodes
        const columnCount = updatedData.data?.columnCount || 0
        if (columnCount > 0) {
          metaText = `${columnCount} columns`
        } else {
          metaText = 'Not configured'
        }
      } else if (updatedData.type === 'join') {
        metaText = updatedData.data?.joinConfig?.type ? `${updatedData.data.joinConfig.type} join` : 'Inner join'
      } else if (updatedData.type === 'output') {
        metaText = updatedData.data?.outputName || 'Save to dataset'
      }

      node.attr('meta/text', metaText)
    }
  }
}

// 监听props变化
watch(
  () => props.nodes,
  (newNodes, oldNodes) => {
    if (!graph) return

    // 简单的同步策略：清空后重新添加
    // 实际应用中可以做更精细的diff
    graph.clearCells()
    newNodes.forEach(addNode)
    props.edges.forEach(addEdge)
  },
  { deep: true }
)

// 生命周期
onMounted(async () => {
  await nextTick()
  try {
    initGraph()
  } catch (error) {
    console.error('Failed to initialize graph:', error)
  }
})

onUnmounted(() => {
  if (graph) {
    graph.dispose()
    graph = null
  }
})

// Auto layout - 自动排列节点
const autoLayout = () => {
  if (!graph) return

  const nodes = graph.getNodes()
  const edges = graph.getEdges()

  if (nodes.length === 0) return

  // Build adjacency list for topological sort
  const inDegree = new Map<string, number>()
  const adjacencyList = new Map<string, string[]>()

  nodes.forEach(node => {
    inDegree.set(node.id, 0)
    adjacencyList.set(node.id, [])
  })

  edges.forEach(edge => {
    const source = edge.getSourceCellId()
    const target = edge.getTargetCellId()
    adjacencyList.get(source)?.push(target)
    inDegree.set(target, (inDegree.get(target) || 0) + 1)
  })

  // Topological sort to determine layers
  const layers: string[][] = []
  const queue: string[] = []

  // Start with nodes that have no incoming edges
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId)
    }
  })

  while (queue.length > 0) {
    const currentLayer: string[] = [...queue]
    layers.push(currentLayer)
    queue.length = 0

    currentLayer.forEach(nodeId => {
      const neighbors = adjacencyList.get(nodeId) || []
      neighbors.forEach(neighbor => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1
        inDegree.set(neighbor, newDegree)
        if (newDegree === 0) {
          queue.push(neighbor)
        }
      })
    })
  }

  // Layout configuration
  const horizontalSpacing = 300 // Space between columns
  const verticalSpacing = 120   // Space between nodes in same column
  const startX = 100
  const startY = 100

  // Position nodes by layer
  layers.forEach((layer, layerIndex) => {
    const x = startX + layerIndex * horizontalSpacing
    layer.forEach((nodeId, nodeIndex) => {
      const node = graph.getCellById(nodeId)
      if (node) {
        const totalHeight = (layer.length - 1) * verticalSpacing
        const y = startY + nodeIndex * verticalSpacing - totalHeight / 2
        node.setPosition({ x, y }, { ui: false })

        // Emit moved event for state sync
        const nodeData = node.getData()
        emit('node:moved', { node: nodeData, position: { x, y } })
      }
    })
  })

  // Center the layout
  setTimeout(() => {
    graph.centerContent()
    graph.zoomToFit({ padding: 50, maxScale: 1 })
  }, 100)
}

// Refresh graph from current props (useful for undo/redo)
const refreshGraph = () => {
  if (!graph) return

  // Clear existing cells
  graph.clearCells()

  // Re-add all nodes and edges from props
  if (props.nodes.length > 0) {
    props.nodes.forEach(addNode)
  }
  if (props.edges.length > 0) {
    props.edges.forEach(addEdge)
  }
}

// 暴露方法
defineExpose({
  zoom,
  centerContent,
  clearCanvas,
  getNode,
  updateNodeData,
  getGraph: () => graph,
  autoLayout,
  refreshGraph
})
</script>

<style scoped lang="less">
.graph-canvas {
  width: 100%;
  height: 100%;
  position: relative;

  :deep(.x6-graph) {
    box-shadow: none !important;
  }

  :deep(.x6-node) {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  :deep(.x6-edge) {
    // 连线过渡效果
    .x6-edge-line {
      transition: stroke 0.2s ease, stroke-width 0.2s ease;
    }
  }

  :deep(.x6-port-body) {
    transition: all 0.2s ease;

    &:hover {
      r: 6;
      fill: #2D6EED;
      stroke: #2D6EED;
    }
  }

  :deep(.x6-edge) {
    cursor: pointer;

    .x6-edge-line {
      transition: all 0.2s ease;
    }

    &:hover .x6-edge-line {
      stroke: #2D6EED;
      stroke-width: 3;
    }

    &.x6-edge-selected .x6-edge-line {
      stroke: #2D6EED;
      stroke-width: 3;
    }
  }

  :deep(.x6-selection-box) {
    border: 2px dashed #2D6EED;
    background: rgba(45, 110, 237, 0.1);
  }

  :deep(.snapline) {
    stroke: #2D6EED;
    stroke-dasharray: 5, 5;
    stroke-width: 1.5;
  }

  // 小地图样式
  :deep(.minimap-container) {
    position: absolute;
    right: 20px;
    bottom: 80px;
    border: 1px solid #D0D5DD;
    border-radius: 6px;
    background: #FFFFFF;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 100;

    .x6-graph {
      background: #F5F6F7;
    }
  }

  // 工具按钮样式
  :deep(.x6-edge-tool) {
    cursor: pointer;

    .x6-edge-tool-remove {
      fill: #FFFFFF;
      stroke: #EA4335;

      &:hover {
        fill: #EA4335;
      }
    }
  }

  :deep(.x6-node-tool) {
    .x6-node-tool-boundary {
      stroke: #2D6EED;
      stroke-width: 2;
      fill: rgba(45, 110, 237, 0.05);
      rx: 6;
      ry: 6;
    }
  }
}
</style>
