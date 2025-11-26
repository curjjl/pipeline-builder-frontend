<template>
  <div ref="containerRef" class="graph-canvas">
    <!-- 选中节点计数指示器 -->
    <transition name="fade">
      <div v-if="selectedCount > 0" class="selection-indicator">
        <span class="selection-count">{{ selectedCount }}</span>
        <span class="selection-label">{{ selectedCount === 1 ? 'item' : 'items' }} selected</span>
      </div>
    </transition>

    <!-- ✅ 新增：多选操作浮动工具栏 -->
    <transition name="slide-down">
      <div v-if="selectedCount > 1" class="multi-select-toolbar">
        <div class="toolbar-group">
          <button class="toolbar-action-btn" @click="handleToolbarAlign('left')" title="左对齐">
            <span class="icon">⫴</span>
          </button>
          <button class="toolbar-action-btn" @click="handleToolbarAlign('center-v')" title="垂直居中">
            <span class="icon">⊞</span>
          </button>
          <button class="toolbar-action-btn" @click="handleToolbarAlign('right')" title="右对齐">
            <span class="icon">⫵</span>
          </button>
        </div>
        <div class="toolbar-divider"></div>
        <div class="toolbar-group">
          <button class="toolbar-action-btn" @click="handleToolbarAlign('top')" title="顶对齐">
            <span class="icon">⫶</span>
          </button>
          <button class="toolbar-action-btn" @click="handleToolbarAlign('center-h')" title="水平居中">
            <span class="icon">⊟</span>
          </button>
          <button class="toolbar-action-btn" @click="handleToolbarAlign('bottom')" title="底对齐">
            <span class="icon">⫷</span>
          </button>
        </div>
        <div class="toolbar-divider"></div>
        <div class="toolbar-group" v-if="selectedCount > 2">
          <button class="toolbar-action-btn" @click="handleToolbarDistribute('horizontal')" title="水平分布">
            <span class="icon">⇿</span>
          </button>
          <button class="toolbar-action-btn" @click="handleToolbarDistribute('vertical')" title="垂直分布">
            <span class="icon">⇵</span>
          </button>
        </div>
        <div class="toolbar-divider"></div>
        <div class="toolbar-group">
          <button class="toolbar-action-btn danger" @click="handleToolbarDelete" title="删除选中节点">
            <span class="icon">×</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- ✅ 新增：Toast 提示 -->
    <transition name="toast">
      <div v-if="toastVisible" :class="['canvas-toast', `toast-${toastType}`]">
        <span class="toast-icon">
          {{ toastType === 'success' ? '✓' : toastType === 'error' ? '✗' : toastType === 'warning' ? '⚠' : 'ℹ' }}
        </span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- ✅ 新增：导航工具栏 -->
    <div class="canvas-toolbar">
      <!-- 缩放显示 -->
      <div class="zoom-display">{{ currentZoom }}%</div>

      <!-- 工具按钮 -->
      <div class="toolbar-divider"></div>
      <button class="toolbar-btn" @click="handleZoomIn" title="放大 (Ctrl+=)">
        <span class="icon">+</span>
      </button>

      <button class="toolbar-btn" @click="handleZoomOut" title="缩小 (Ctrl+-)">
        <span class="icon">−</span>
      </button>

      <div class="toolbar-divider"></div>
      <button class="toolbar-btn" @click="handleZoomToFit" title="适应窗口 (Ctrl+1)">
        <span class="icon">⊡</span>
      </button>

      <button class="toolbar-btn" @click="handleZoomToActual" title="实际大小 (Ctrl+0)">
        <span class="icon">1:1</span>
      </button>

      <button class="toolbar-btn" @click="handleCenter" title="居中显示">
        <span class="icon">⊙</span>
      </button>
    </div>
  </div>
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
  showGrid?: boolean  // ✅ 新增：是否显示网格
}

const props = withDefaults(defineProps<Props>(), {
  nodes: () => [],
  edges: () => [],
  showMinimap: true,
  showGrid: true      // ✅ 默认显示网格
})

const emit = defineEmits<{
  'node:click': [node: Node]
  'node:dblclick': [node: Node]
  'node:contextmenu': [payload: { node: Node; event: MouseEvent }]
  'node:rename': [payload: { node: Node; name: string }]
  'edge:click': [edge: Edge]
  'edge:contextmenu': [payload: { edge: Edge; event: MouseEvent }]
  'canvas:click': []
  'canvas:contextmenu': [payload: { event: MouseEvent }]
  'node:added': [node: Node]
  'edge:added': [edge: Edge]
  'edge:removed': [edge: Edge]
  'node:moved': [payload: { node: Node; position: { x: number; y: number } }]
  'nodes:copied': [count: number]
  'nodes:pasted': [count: number]
  'scale:changed': [scale: number]
}>()

const containerRef = ref<HTMLDivElement>()
const selectedCount = ref(0)
const pasteCount = ref(0)
const lastCopiedCells = ref<any[]>([])
const currentZoom = ref(100)  // ✅ 新增：当前缩放比例
const toastMessage = ref('')  // ✅ 新增：Toast 消息
const toastType = ref<'success' | 'info' | 'warning' | 'error'>('info')
const toastVisible = ref(false)
let toastTimer: number | null = null
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
      visible: props.showGrid,  // ✅ 优化：支持可选网格显示
      size: 20,                 // ✅ 优化：网格大小改为20px（更适合吸附）
      type: 'dot',              // 网格类型：dot（点）或 mesh（网格线）
      args: {
        color: '#D0D5DD',       // 网格颜色
        thickness: 1            // 网格线粗细
      }
    },
    panning: {
      enabled: true,
      modifiers: ['space', 'ctrl', 'meta']  // 按住空格/Ctrl/Command键拖拽画布，或使用鼠标中键
    },
    autoResize: true,  // 启用自动调整大小，响应容器尺寸变化
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta'],
      minScale: 0.2,
      maxScale: 2
    },
    // ✅ 新增：网格吸附配置
    snapline: {
      enabled: true,
      sharp: true,
      clean: true,  // 吸附后清除辅助线
      tolerance: 10  // 吸附容差（像素）
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

        // ✅ 优化：防止循环依赖（高效实现 O(V+E)）
        const wouldCreateCycle = (source: string, target: string): boolean => {
          // 构建邻接表以提高查找效率（O(E) 而非每个节点 O(E)）
          const adjMap = new Map<string, string[]>()
          edges.forEach(edge => {
            const sourceId = edge.getSourceCellId()
            if (!adjMap.has(sourceId)) {
              adjMap.set(sourceId, [])
            }
            adjMap.get(sourceId)!.push(edge.getTargetCellId())
          })

          // BFS 检查 target 是否能到达 source
          const visited = new Set<string>([target])
          const queue = [target]

          while (queue.length > 0) {
            const current = queue.shift()!
            const neighbors = adjMap.get(current) || []

            for (const neighbor of neighbors) {
              if (neighbor === source) {
                return true // 检测到循环
              }
              if (!visited.has(neighbor)) {
                visited.add(neighbor)
                queue.push(neighbor)
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
        clean: true,  // ✅ 新增：吸附后自动清除辅助线
        tolerance: 10,  // ✅ 新增：吸附容差
        className: 'snapline'
      })
    )
    .use(
      new Selection({
        enabled: true,
        multiple: true,
        movable: true,
        showNodeSelectionBox: true,
        modifiers: ['shift', 'ctrl', 'meta'],  // 支持 Shift/Ctrl/Cmd 多选
        rubberEdge: true,
        rubberNode: true,
        strict: false,
        selectCellOnMoved: true,
        // 增强视觉效果
        className: 'x6-selection-enhanced',
        rubberband: {
          enabled: true,
          modifiers: 'shift',
          className: 'x6-rubberband-enhanced'
        },
        // 过滤器：只选择可见的节点和边
        filter: (cell) => {
          return cell.isVisible()
        },
        // 多选模式配置
        multipleSelectionModifiers: ['ctrl', 'meta']  // Ctrl/Cmd 点击切换选择
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
    pasteCount.value = 0  // 重置粘贴计数
  })

  // 画布右键菜单
  graph.on('blank:contextmenu', ({ e }) => {
    e.preventDefault()
    emit('canvas:contextmenu', { event: e as MouseEvent })
  })

  // 缩放变化监听
  graph.on('scale', ({ sx }) => {
    const zoom = Math.round(sx * 100)
    currentZoom.value = zoom  // ✅ 更新缩放显示
    emit('scale:changed', zoom)
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
      // ✅ 优化：恢复到半透明状态（而非完全隐藏）
      const ports = node.getPorts()
      ports.forEach(port => {
        node.setPortProp(port.id!, 'attrs/circle/opacity', 0.3)  // 半透明
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

    // ✅ 优化：取消选中时恢复到半透明状态
    const ports = node.getPorts()
    ports.forEach(port => {
      node.setPortProp(port.id!, 'attrs/circle/opacity', 0.3)  // 半透明
      node.setPortProp(port.id!, 'attrs/circle/stroke', '#5F6368')
      node.setPortProp(port.id!, 'attrs/circle/strokeWidth', 2)
    })
  })

  // 选择变化事件 - 更新选中计数
  graph.on('selection:changed', ({ selected }) => {
    selectedCount.value = selected.length
  })

  // ✅ 新增：历史记录变化事件 - Toast 提示
  graph.on('history:undo', () => {
    showToast('Undo', 'info')
  })

  graph.on('history:redo', () => {
    showToast('Redo', 'info')
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
      // ✅ 优化：否则恢复到半透明状态
      node.setPortProp(port, 'attrs/circle/opacity', 0.3)  // 半透明
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
              // ✅ 优化：先触发事件通知父组件，让父组件处理数据同步后再删除视图
              const edgeData = edge.getData() as Edge
              emit('edge:removed', edgeData)
              // 延迟删除，给父组件时间处理（避免数据不同步）
              setTimeout(() => {
                if (view.cell && !view.cell.removed) {
                  view.cell.remove()
                }
              }, 10)
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
  // 复制（✅ 优化：添加操作提示）
  graph.bindKey(['ctrl+c', 'meta+c'], () => {
    const cells = graph!.getSelectedCells()
    if (cells.length) {
      graph!.copy(cells)
      lastCopiedCells.value = cells
      pasteCount.value = 0  // 重置粘贴计数

      // 触发复制事件
      const nodeCount = cells.filter(cell => cell.isNode()).length
      if (nodeCount > 0) {
        emit('nodes:copied', nodeCount)
        // ✅ 显示操作提示
        showToast(`Copied ${nodeCount} node${nodeCount > 1 ? 's' : ''}`, 'success')
      }
    }
    return false
  })

  // 粘贴（✅ 优化：智能偏移防重叠）
  graph.bindKey(['ctrl+v', 'meta+v'], () => {
    if (!graph!.isClipboardEmpty()) {
      // ✅ 智能偏移算法：检测重叠并自动调整
      pasteCount.value++
      let offset = 30 + (pasteCount.value - 1) * 20

      // 获取所有现有节点的位置
      const existingNodes = graph!.getNodes()
      const existingPositions = existingNodes.map(node => {
        const pos = node.getPosition()
        return { x: pos.x, y: pos.y }
      })

      // 如果检测到可能重叠，增加偏移量
      const hasOverlap = existingPositions.some(pos => {
        return existingPositions.filter(p =>
          Math.abs(p.x - pos.x) < 50 && Math.abs(p.y - pos.y) < 50
        ).length > 1
      })

      if (hasOverlap && pasteCount.value > 1) {
        offset = 40 + (pasteCount.value - 1) * 30  // 增加偏移量
      }

      const cells = graph!.paste({ offset })
      graph!.cleanSelection()
      graph!.select(cells)

      // 添加粘贴闪烁动画
      cells.filter(cell => cell.isNode()).forEach(node => {
        const originalStroke = node.attr('body/stroke')
        const originalStrokeWidth = node.attr('body/strokeWidth')

        // 闪烁动画
        node.attr('body/stroke', '#10B981')
        node.attr('body/strokeWidth', 3)

        setTimeout(() => {
          node.attr('body/stroke', '#2D6EED')
          node.attr('body/strokeWidth', 2)
        }, 200)

        setTimeout(() => {
          node.attr('body/stroke', '#10B981')
          node.attr('body/strokeWidth', 3)
        }, 400)

        setTimeout(() => {
          // 恢复为选中状态
          node.attr('body/stroke', '#2D6EED')
          node.attr('body/strokeWidth', 2)
        }, 600)
      })

      // 触发粘贴事件
      const nodeCount = cells.filter(cell => cell.isNode()).length
      if (nodeCount > 0) {
        emit('nodes:pasted', nodeCount)
        // ✅ 显示操作提示
        showToast(`Pasted ${nodeCount} node${nodeCount > 1 ? 's' : ''}`, 'success')
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

  // 删除（✅ 优化：添加操作提示）
  graph.bindKey(['delete', 'backspace'], () => {
    const cells = graph!.getSelectedCells()
    if (cells.length) {
      const nodeCount = cells.filter(cell => cell.isNode()).length
      const edgeCount = cells.filter(cell => cell.isEdge()).length
      graph!.removeCells(cells)

      // ✅ 显示操作提示
      let message = ''
      if (nodeCount > 0 && edgeCount > 0) {
        message = `Deleted ${nodeCount} node${nodeCount > 1 ? 's' : ''} and ${edgeCount} edge${edgeCount > 1 ? 's' : ''}`
      } else if (nodeCount > 0) {
        message = `Deleted ${nodeCount} node${nodeCount > 1 ? 's' : ''}`
      } else if (edgeCount > 0) {
        message = `Deleted ${edgeCount} edge${edgeCount > 1 ? 's' : ''}`
      }
      if (message) {
        showToast(message, 'info')
      }
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

  // 复制选中节点 (Ctrl+D)
  graph.bindKey(['ctrl+d', 'meta+d'], () => {
    const cells = graph!.getSelectedCells()
    if (cells.length) {
      graph!.copy(cells)
      const pastedCells = graph!.paste({ offset: 30 })
      graph!.cleanSelection()
      graph!.select(pastedCells)

      // 触发事件
      const nodeCount = pastedCells.filter(cell => cell.isNode()).length
      if (nodeCount > 0) {
        emit('nodes:pasted', nodeCount)
        pastedCells.filter(cell => cell.isNode()).forEach(node => {
          const nodeData = node.getData()
          if (nodeData) {
            emit('node:added', nodeData)
          }
        })
      }
    }
    return false
  })

  // 重置缩放到 100% (Ctrl+0)
  graph.bindKey(['ctrl+0', 'meta+0'], () => {
    graph!.zoomTo(1)
    graph!.centerContent()
    return false
  })

  // 缩放到适应窗口 (Ctrl+1)
  graph.bindKey(['ctrl+1', 'meta+1'], () => {
    graph!.zoomToFit({ padding: 20, maxScale: 1 })
    return false
  })

  // 放大 (Ctrl+=)
  graph.bindKey(['ctrl+=', 'meta+=', 'ctrl+shift+=', 'meta+shift+='], () => {
    graph!.zoom(0.1)
    return false
  })

  // 缩小 (Ctrl+-)
  graph.bindKey(['ctrl+-', 'meta+-'], () => {
    graph!.zoom(-0.1)
    return false
  })

  // F2 重命名节点
  graph.bindKey('f2', () => {
    const cells = graph!.getSelectedCells()
    if (cells.length === 1 && cells[0].isNode()) {
      const nodeData = cells[0].getData() as Node
      if (nodeData) {
        emit('node:dblclick', nodeData)  // 触发双击事件来打开重命名
      }
    }
    return false
  })

  // ✅ 新增：方向键移动节点（微调）
  graph.bindKey('up', () => {
    moveSelectedNodes(0, -10)
    return false
  })

  graph.bindKey('down', () => {
    moveSelectedNodes(0, 10)
    return false
  })

  graph.bindKey('left', () => {
    moveSelectedNodes(-10, 0)
    return false
  })

  graph.bindKey('right', () => {
    moveSelectedNodes(10, 0)
    return false
  })

  // ✅ 新增：Shift + 方向键移动节点（大幅移动）
  graph.bindKey('shift+up', () => {
    moveSelectedNodes(0, -50)
    return false
  })

  graph.bindKey('shift+down', () => {
    moveSelectedNodes(0, 50)
    return false
  })

  graph.bindKey('shift+left', () => {
    moveSelectedNodes(-50, 0)
    return false
  })

  graph.bindKey('shift+right', () => {
    moveSelectedNodes(50, 0)
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
      name: 'orth',  // ✅ 统一使用正交路由，与 connecting 配置一致
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
    attrs: {
      line: {
        stroke: '#5F6368',
        strokeWidth: 2,
        strokeLinecap: 'round',
        targetMarker: {
          name: 'circle',  // ✅ 统一使用圆形箭头
          r: 4,
          fill: '#5F6368'
        }
      }
    },
    zIndex: 0
  })

  return edge
}

// ✅ 新增：移动选中的节点
const moveSelectedNodes = (dx: number, dy: number) => {
  if (!graph) return

  const selectedNodes = graph.getSelectedCells().filter(cell => cell.isNode())
  if (selectedNodes.length === 0) return

  selectedNodes.forEach(node => {
    const position = node.getPosition()
    node.setPosition(position.x + dx, position.y + dy)
  })

  // 触发移动事件
  selectedNodes.forEach(node => {
    const nodeData = node.getData() as Node
    const position = node.getPosition()
    emit('node:moved', { node: nodeData, position })
  })

  // Toast 提示
  if (selectedNodes.length > 0) {
    const direction = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down'
    const distance = Math.abs(dx || dy)
    showToast(`Moved ${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''} ${direction} by ${distance}px`, 'info')
  }
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

// 设置导航模式（已优化：两种模式可同时启用，用修饰键区分）
const setNavigationMode = (mode: 'panning' | 'select') => {
  if (!graph) return

  // ✅ 优化：同时启用平移和框选，用不同修饰键区分
  // - 平移：Space/Ctrl/Meta + 拖拽
  // - 框选：Shift + 拖拽
  // 这样用户可以灵活切换，不会互相冲突

  if (mode === 'panning') {
    // 平移模式为主：强调平移，框选仍然可用
    graph.enablePanning()
    graph.enableRubberband()  // ✅ 保持框选可用
  } else {
    // 选择模式为主：强调框选，平移仍然可用
    graph.enablePanning()     // ✅ 保持平移可用
    graph.enableRubberband()
  }
}

// 获取当前缩放比例
const getZoom = (): number => {
  if (!graph) return 100
  return Math.round(graph.zoom() * 100)
}

// 设置缩放比例
const setZoom = (scale: number) => {
  if (!graph) return
  graph.zoomTo(scale / 100)
}

// 对齐节点
const alignNodes = (direction: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v') => {
  if (!graph) return

  const selectedNodes = graph.getSelectedCells().filter(cell => cell.isNode())
  if (selectedNodes.length < 2) return

  const boxes = selectedNodes.map(node => ({
    node,
    bbox: node.getBBox()
  }))

  switch (direction) {
    case 'left': {
      const minX = Math.min(...boxes.map(b => b.bbox.x))
      boxes.forEach(({ node, bbox }) => {
        node.setPosition(minX, bbox.y)
      })
      break
    }
    case 'right': {
      const maxX = Math.max(...boxes.map(b => b.bbox.x + b.bbox.width))
      boxes.forEach(({ node, bbox }) => {
        node.setPosition(maxX - bbox.width, bbox.y)
      })
      break
    }
    case 'top': {
      const minY = Math.min(...boxes.map(b => b.bbox.y))
      boxes.forEach(({ node, bbox }) => {
        node.setPosition(bbox.x, minY)
      })
      break
    }
    case 'bottom': {
      const maxY = Math.max(...boxes.map(b => b.bbox.y + b.bbox.height))
      boxes.forEach(({ node, bbox }) => {
        node.setPosition(bbox.x, maxY - bbox.height)
      })
      break
    }
    case 'center-h': {
      const centerY = boxes.reduce((sum, b) => sum + b.bbox.y + b.bbox.height / 2, 0) / boxes.length
      boxes.forEach(({ node, bbox }) => {
        node.setPosition(bbox.x, centerY - bbox.height / 2)
      })
      break
    }
    case 'center-v': {
      const centerX = boxes.reduce((sum, b) => sum + b.bbox.x + b.bbox.width / 2, 0) / boxes.length
      boxes.forEach(({ node, bbox }) => {
        node.setPosition(centerX - bbox.width / 2, bbox.y)
      })
      break
    }
  }

  // 触发移动事件
  selectedNodes.forEach(node => {
    const nodeData = node.getData() as Node
    const position = node.getPosition()
    emit('node:moved', { node: nodeData, position })
  })
}

// 分布节点
const distributeNodes = (direction: 'horizontal' | 'vertical') => {
  if (!graph) return

  const selectedNodes = graph.getSelectedCells().filter(cell => cell.isNode())
  if (selectedNodes.length < 3) return

  const boxes = selectedNodes.map(node => ({
    node,
    bbox: node.getBBox()
  }))

  if (direction === 'horizontal') {
    // 按 x 坐标排序
    boxes.sort((a, b) => a.bbox.x - b.bbox.x)
    const first = boxes[0].bbox.x
    const last = boxes[boxes.length - 1].bbox.x
    const spacing = (last - first) / (boxes.length - 1)

    boxes.forEach(({ node, bbox }, index) => {
      if (index > 0 && index < boxes.length - 1) {
        node.setPosition(first + spacing * index, bbox.y)
      }
    })
  } else {
    // 按 y 坐标排序
    boxes.sort((a, b) => a.bbox.y - b.bbox.y)
    const first = boxes[0].bbox.y
    const last = boxes[boxes.length - 1].bbox.y
    const spacing = (last - first) / (boxes.length - 1)

    boxes.forEach(({ node, bbox }, index) => {
      if (index > 0 && index < boxes.length - 1) {
        node.setPosition(bbox.x, first + spacing * index)
      }
    })
  }

  // 触发移动事件
  selectedNodes.forEach(node => {
    const nodeData = node.getData() as Node
    const position = node.getPosition()
    emit('node:moved', { node: nodeData, position })
  })
}

// 高亮上下游节点
const highlightRelatedNodes = (nodeId: string, direction: 'upstream' | 'downstream' | 'both') => {
  if (!graph) return

  const edges = graph.getEdges()
  const relatedIds = new Set<string>()

  const findUpstream = (id: string) => {
    edges.forEach(edge => {
      if (edge.getTargetCellId() === id) {
        const sourceId = edge.getSourceCellId()
        if (!relatedIds.has(sourceId)) {
          relatedIds.add(sourceId)
          findUpstream(sourceId)
        }
      }
    })
  }

  const findDownstream = (id: string) => {
    edges.forEach(edge => {
      if (edge.getSourceCellId() === id) {
        const targetId = edge.getTargetCellId()
        if (!relatedIds.has(targetId)) {
          relatedIds.add(targetId)
          findDownstream(targetId)
        }
      }
    })
  }

  if (direction === 'upstream' || direction === 'both') {
    findUpstream(nodeId)
  }
  if (direction === 'downstream' || direction === 'both') {
    findDownstream(nodeId)
  }

  // 高亮相关节点
  graph.getNodes().forEach(node => {
    if (relatedIds.has(node.id)) {
      node.attr('body/stroke', '#10B981')
      node.attr('body/strokeWidth', 3)
    } else if (node.id !== nodeId) {
      node.attr('body/opacity', 0.3)
    }
  })

  // 高亮相关边
  edges.forEach(edge => {
    const sourceId = edge.getSourceCellId()
    const targetId = edge.getTargetCellId()
    if (relatedIds.has(sourceId) || relatedIds.has(targetId) || sourceId === nodeId || targetId === nodeId) {
      if ((direction === 'upstream' || direction === 'both') && relatedIds.has(sourceId)) {
        edge.attr('line/stroke', '#10B981')
        edge.attr('line/strokeWidth', 3)
      } else if ((direction === 'downstream' || direction === 'both') && relatedIds.has(targetId)) {
        edge.attr('line/stroke', '#3B82F6')
        edge.attr('line/strokeWidth', 3)
      }
    } else {
      edge.attr('line/opacity', 0.2)
    }
  })
}

// 清除高亮
const clearHighlight = () => {
  if (!graph) return

  graph.getNodes().forEach(node => {
    node.attr('body/opacity', 1)
    const selectedCells = graph!.getSelectedCells()
    const isSelected = selectedCells.some(cell => cell.id === node.id)
    if (isSelected) {
      node.attr('body/stroke', '#2D6EED')
      node.attr('body/strokeWidth', 2)
    } else {
      node.attr('body/stroke', '#D0D5DD')
      node.attr('body/strokeWidth', 1)
    }
  })

  graph.getEdges().forEach(edge => {
    edge.attr('line/opacity', 1)
    edge.attr('line/stroke', '#98A2B3')
    edge.attr('line/strokeWidth', 2)
  })
}

// ✅ 新增：切换网格显示
const toggleGrid = (visible: boolean) => {
  if (!graph) return
  graph.drawGrid({ type: 'dot', args: { color: '#D0D5DD', thickness: 1 } })
  if (visible) {
    graph.showGrid()
  } else {
    graph.hideGrid()
  }
}

// ✅ 新增：工具栏操作方法
const handleZoomIn = () => {
  if (!graph) return
  graph.zoom(0.1)
}

const handleZoomOut = () => {
  if (!graph) return
  graph.zoom(-0.1)
}

const handleZoomToFit = () => {
  if (!graph) return
  graph.zoomToFit({ padding: 20, maxScale: 1 })
}

const handleZoomToActual = () => {
  if (!graph) return
  graph.zoomTo(1)
  graph.centerContent()
}

const handleCenter = () => {
  if (!graph) return
  graph.centerContent()
}

// ✅ 新增：Toast 提示函数
const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true

  // 清除之前的定时器
  if (toastTimer) {
    clearTimeout(toastTimer)
  }

  // 2秒后自动隐藏
  toastTimer = window.setTimeout(() => {
    toastVisible.value = false
  }, 2000)
}

// ✅ 新增：多选工具栏 - 对齐操作
const handleToolbarAlign = (direction: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v') => {
  alignNodes(direction)
  const labels: Record<string, string> = {
    'left': 'left',
    'right': 'right',
    'top': 'top',
    'bottom': 'bottom',
    'center-h': 'horizontally',
    'center-v': 'vertically'
  }
  showToast(`Aligned ${selectedCount.value} nodes ${labels[direction]}`, 'success')
}

// ✅ 新增：多选工具栏 - 分布操作
const handleToolbarDistribute = (direction: 'horizontal' | 'vertical') => {
  distributeNodes(direction)
  showToast(`Distributed ${selectedCount.value} nodes ${direction}ly`, 'success')
}

// ✅ 新增：多选工具栏 - 删除操作
const handleToolbarDelete = () => {
  if (!graph) return
  const cells = graph.getSelectedCells()
  if (cells.length > 0) {
    const nodeCount = cells.filter(cell => cell.isNode()).length
    graph.removeCells(cells)
    showToast(`Deleted ${nodeCount} node${nodeCount > 1 ? 's' : ''}`, 'info')
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
  refreshGraph,
  setNavigationMode,
  getZoom,
  setZoom,
  alignNodes,
  distributeNodes,
  highlightRelatedNodes,
  clearHighlight,
  toggleGrid  // ✅ 新增：网格切换方法
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

  // 框选框样式 - 增强版
  :deep(.x6-selection-box),
  :deep(.x6-selection-enhanced) {
    border: 2px solid #2D6EED !important;
    background: rgba(45, 110, 237, 0.08) !important;
    box-shadow: 0 0 0 1px rgba(45, 110, 237, 0.2),
                0 2px 8px rgba(45, 110, 237, 0.15) !important;
    border-radius: 4px !important;
    animation: selection-pulse 1.5s ease-in-out infinite;
  }

  // 框选拖拽框样式 - 增强版
  :deep(.x6-widget-selection-rubberband),
  :deep(.x6-rubberband-enhanced) {
    border: 2px dashed #2D6EED !important;
    background: rgba(45, 110, 237, 0.12) !important;
    box-shadow: 0 0 0 1px rgba(45, 110, 237, 0.3),
                0 4px 12px rgba(45, 110, 237, 0.2) !important;
    border-radius: 2px !important;
    opacity: 0.95 !important;
  }

  // 选中节点脉冲动画
  @keyframes selection-pulse {
    0%, 100% {
      box-shadow: 0 0 0 1px rgba(45, 110, 237, 0.2),
                  0 2px 8px rgba(45, 110, 237, 0.15);
    }
    50% {
      box-shadow: 0 0 0 2px rgba(45, 110, 237, 0.3),
                  0 4px 12px rgba(45, 110, 237, 0.25);
    }
  }

  :deep(.snapline) {
    stroke: #2D6EED;
    stroke-dasharray: 5, 5;
    stroke-width: 1.5;
  }

  // ✅ 新增：Toast 提示样式
  .canvas-toast {
    position: absolute;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #FFFFFF;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(0, 0, 0, 0.05);
    z-index: 1100;
    pointer-events: none;
    font-size: 14px;
    min-width: 200px;

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .toast-message {
      color: #344054;
      font-weight: 500;
    }

    &.toast-success {
      .toast-icon {
        background: #D1FAE5;
        color: #10B981;
      }
    }

    &.toast-info {
      .toast-icon {
        background: #DBEAFE;
        color: #3B82F6;
      }
    }

    &.toast-warning {
      .toast-icon {
        background: #FEF3C7;
        color: #F59E0B;
      }
    }

    &.toast-error {
      .toast-icon {
        background: #FEE2E2;
        color: #EF4444;
      }
    }
  }

  // Toast 动画
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }

  .toast-enter-from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }

  .toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }

  // ✅ 优化：选中计数指示器（改到底部左侧，避免遮挡节点）
  .selection-indicator {
    position: absolute;
    bottom: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #FFFFFF;
    border: 1px solid #2D6EED;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(45, 110, 237, 0.2),
                0 0 0 3px rgba(45, 110, 237, 0.08);
    z-index: 100;
    pointer-events: none;
    animation: slide-up 0.3s ease-out;

    .selection-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 8px;
      background: #2D6EED;
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 600;
      border-radius: 12px;
    }

    .selection-label {
      font-size: 13px;
      color: #5F6368;
      font-weight: 500;
    }
  }

  // ✅ 新增：多选操作浮动工具栏样式
  .multi-select-toolbar {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    border: 1px solid #E5E7EB;

    .toolbar-group {
      display: flex;
      gap: 2px;
    }

    .toolbar-divider {
      width: 1px;
      height: 24px;
      background: #E5E7EB;
      margin: 0 4px;
    }

    .toolbar-action-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      color: #4B5563;

      .icon {
        font-size: 18px;
        line-height: 1;
      }

      &:hover {
        background: #F3F4F6;
        color: #2D6EED;
      }

      &:active {
        background: #E5E7EB;
        transform: scale(0.95);
      }

      &.danger {
        &:hover {
          background: #FEE2E2;
          color: #DC2626;
        }
      }
    }
  }

  // 淡入淡出动画
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .fade-enter-from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }

  .fade-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }

  // ✅ 新增：slide-down动画（用于多选工具栏）
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.3s ease;
  }

  .slide-down-enter-from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }

  .slide-down-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }

  // ✅ 优化：改为上滑动画（底部出现）
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

  // ✅ 新增：导航工具栏样式
  .canvas-toolbar {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px;
    background: #FFFFFF;
    border: 1px solid #D0D5DD;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08),
                0 0 0 1px rgba(0, 0, 0, 0.04);
    z-index: 100;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12),
                  0 0 0 1px rgba(0, 0, 0, 0.06);
    }

    .zoom-display {
      min-width: 48px;
      padding: 0 8px;
      font-size: 13px;
      font-weight: 600;
      color: #344054;
      text-align: center;
      user-select: none;
    }

    .toolbar-divider {
      width: 1px;
      height: 20px;
      background: #E4E7EC;
      margin: 0 4px;
    }

    .toolbar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #475467;
      font-size: 16px;
      font-weight: 500;
      user-select: none;

      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        line-height: 1;
      }

      &:hover {
        background: #F2F4F7;
        color: #344054;
      }

      &:active {
        background: #E4E7EC;
        transform: scale(0.95);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        &:hover {
          background: transparent;
        }
      }
    }
  }
}
</style>
