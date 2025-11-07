<template>
  <div class="pipeline-editor">
    <!-- Top navigation -->
    <div class="top-nav">
      <div class="nav-left">
        <div class="logo">P</div>
        <div class="breadcrumb">
          <span class="breadcrumb-item">Pipeline Builder</span>
          <RightOutlined class="separator" />
          <span class="breadcrumb-item active">{{ pipelineName }}</span>
        </div>
      </div>

      <div class="nav-tabs">
        <a-button
          :class="['tab-btn', { active: currentTab === 'graph' }]"
          @click="currentTab = 'graph'"
        >
          <NodeIndexOutlined /> Graph
        </a-button>
        <a-button
          :class="['tab-btn', { active: currentTab === 'proposals' }]"
          @click="currentTab = 'proposals'"
        >
          <BulbOutlined /> Proposals
        </a-button>
        <a-button
          :class="['tab-btn', { active: currentTab === 'history' }]"
          @click="currentTab = 'history'"
        >
          <HistoryOutlined /> History
        </a-button>
      </div>

      <div class="nav-actions">
        <a-button @click="handleSave">
          <SaveOutlined /> Save
        </a-button>
        <a-button type="primary" @click="handleDeploy">
          <RocketOutlined /> Deploy
        </a-button>
        <a-dropdown>
          <a-button>
            <MoreOutlined />
          </a-button>
          <template #overlay>
            <a-menu @click="handleMoreAction">
              <a-menu-item key="export">Export</a-menu-item>
              <a-menu-item key="duplicate">Duplicate</a-menu-item>
              <a-menu-item key="settings">Settings</a-menu-item>
              <a-menu-divider />
              <a-menu-item key="delete" danger>Delete</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- Toolbar - Palantir Style -->
    <div class="toolbar">
      <div class="toolbar-section">
        <span class="toolbar-label">Tools</span>
        <a-button class="toolbar-btn" :class="{ active: currentTool === 'move' }" @click="currentTool = 'move'">
          <DragOutlined />
        </a-button>
        <a-button class="toolbar-btn" :class="{ active: currentTool === 'select' }" @click="currentTool = 'select'">
          <SelectOutlined />
        </a-button>
      </div>

      <a-divider type="vertical" style="height: 32px; margin: 0 12px;" />

      <div class="toolbar-section">
        <span class="toolbar-label">Select</span>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Remove</span>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Layout</span>
      </div>

      <a-divider type="vertical" style="height: 32px; margin: 0 12px;" />

      <div class="toolbar-section">
        <a-dropdown trigger="click">
          <a-button class="toolbar-dropdown-btn">
            <DownloadOutlined style="margin-right: 6px;" />
            Add data
            <DownOutlined style="margin-left: 6px; font-size: 10px;" />
          </a-button>
          <template #overlay>
            <a-menu @click="handleAddData" class="add-data-menu">
              <a-menu-item key="products">
                <DatabaseOutlined style="margin-right: 8px;" />
                <span>Products</span>
                <span style="color: #98A2B3; margin-left: 8px;">(12 rows)</span>
              </a-menu-item>
              <a-menu-item key="customers">
                <DatabaseOutlined style="margin-right: 8px;" />
                <span>Customers</span>
                <span style="color: #98A2B3; margin-left: 8px;">(10 rows)</span>
              </a-menu-item>
              <a-menu-item key="transactions">
                <DatabaseOutlined style="margin-right: 8px;" />
                <span>Transactions</span>
                <span style="color: #98A2B3; margin-left: 8px;">(15 rows)</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <a-divider type="vertical" style="height: 32px; margin: 0 12px;" />

      <div class="toolbar-section">
        <span class="toolbar-label">Transform</span>
        <a-button class="toolbar-icon-btn" @click="showTransformPanel" :disabled="!selectedNode">
          <FilterOutlined />
        </a-button>
        <a-button class="toolbar-icon-btn" @click="handleAddJoin">
          <MergeCellsOutlined />
        </a-button>
        <a-button class="toolbar-icon-btn" @click="handleAddOutputNode">
          <ExportOutlined />
        </a-button>
      </div>

      <a-divider type="vertical" style="height: 32px; margin: 0 12px;" />

      <div class="toolbar-section">
        <span class="toolbar-label">Edit</span>
        <a-button class="toolbar-icon-btn" @click="handleUndo" :disabled="!canUndo">
          <UndoOutlined />
        </a-button>
        <a-button class="toolbar-icon-btn" @click="handleRedo" :disabled="!canRedo">
          <RedoOutlined />
        </a-button>
      </div>

      <div style="flex: 1;"></div>

      <div class="toolbar-section">
        <a-button type="primary" @click="handleRunPipeline" style="margin-right: 8px;">
          <PlayCircleOutlined /> Run
        </a-button>
      </div>
    </div>

    <!-- Main content area -->
    <div class="main-content">
      <!-- Canvas area -->
      <div class="canvas-area">
        <GraphCanvas
          ref="canvasRef"
          :nodes="nodes"
          :edges="edges"
          @node:click="handleNodeClick"
          @node:dblclick="handleNodeDoubleClick"
          @node:contextmenu="handleNodeContextMenu"
          @edge:added="handleEdgeAdded"
          @edge:contextmenu="handleEdgeContextMenu"
          @canvas:click="handleCanvasClick"
        />

        <!-- Zoom controls -->
        <div class="zoom-controls">
          <a-button size="small" @click="handleZoom('in')">
            <PlusOutlined />
          </a-button>
          <span class="zoom-level">{{ zoomLevel }}%</span>
          <a-button size="small" @click="handleZoom('out')">
            <MinusOutlined />
          </a-button>
          <a-button size="small" @click="handleZoom('fit')">
            <CompressOutlined />
          </a-button>
        </div>

        <!-- Hint bubble -->
        <div v-if="showHint" class="hint-bubble">
          <div class="hint-content">
            <InfoCircleOutlined />
            <span>Click a dataset node to transform your data.</span>
            <CloseOutlined class="hint-close" @click="showHint = false" />
          </div>
        </div>
      </div>

      <!-- Right panel -->
      <div
        class="right-panel"
        :style="{ width: rightPanelWidth + 'px' }"
      >
        <div
          class="resize-handle resize-handle-left"
          @mousedown="startResize('right')"
        ></div>

        <div class="panel-header">
          <h2>Pipeline outputs</h2>
        </div>

        <div class="panel-content">
          <p class="panel-desc">
            Pipeline outputs are the artifacts your pipeline builds. They can be datasets,
            reports, or other resources that downstream processes depend on.
          </p>

          <a-empty
            v-if="outputs.length === 0"
            description="No outputs configured"
          >
            <a-button type="primary" block @click="handleAddOutput">
              <PlusOutlined /> Add pipeline output
            </a-button>
          </a-empty>

          <div v-else class="outputs-list">
            <div
              v-for="output in outputs"
              :key="output.id"
              class="output-item"
            >
              <div class="output-icon">
                <DatabaseOutlined />
              </div>
              <div class="output-info">
                <div class="output-name">{{ output.name }}</div>
                <div class="output-type">{{ output.type }}</div>
              </div>
              <a-button type="text" size="small" @click="removeOutput(output.id)">
                <DeleteOutlined />
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom panel -->
    <div
      v-if="bottomPanelVisible"
      class="bottom-panel"
      :style="{ height: bottomPanelHeight + 'px' }"
    >
      <div
        class="resize-handle resize-handle-top"
        @mousedown="startResize('bottom')"
      ></div>

      <div class="panel-header">
        <a-tabs v-model:activeKey="bottomTab" @change="handleBottomTabChange">
          <a-tab-pane key="input" tab="Input table">
            <template #tab>
              <span><TableOutlined /> Input table</span>
            </template>
          </a-tab-pane>

          <a-tab-pane key="output" tab="Output table">
            <template #tab>
              <span><ExportOutlined /> Output table</span>
            </template>
          </a-tab-pane>

          <a-tab-pane key="preview" tab="Selection preview" :disabled="!selectedNode">
            <template #tab>
              <span><EyeOutlined /> Selection preview</span>
            </template>
          </a-tab-pane>

          <a-tab-pane key="transformations" tab="Transformations" :disabled="!selectedNode">
            <template #tab>
              <span><FunctionOutlined /> Transformations</span>
            </template>
          </a-tab-pane>

          <a-tab-pane key="suggestions" tab="Suggestions">
            <template #tab>
              <span><BulbOutlined /> Suggestions</span>
            </template>
          </a-tab-pane>
        </a-tabs>

        <a-button type="text" size="small" @click="bottomPanelVisible = false">
          <CloseOutlined />
        </a-button>
      </div>

      <div class="panel-body">
        <!-- Input table -->
        <div v-show="bottomTab === 'input'" class="tab-content">
          <DataPreviewPanel mode="input" />
        </div>

        <!-- Output table -->
        <div v-show="bottomTab === 'output'" class="tab-content">
          <DataPreviewPanel mode="output" />
        </div>

        <!-- Selection preview -->
        <div v-show="bottomTab === 'preview'" class="tab-content">
          <DataPreviewPanel
            v-if="selectedNode"
            :node="selectedNode"
            mode="preview"
          />
        </div>

        <!-- Transformations -->
        <div v-show="bottomTab === 'transformations'" class="tab-content">
          <TransformPanel
            v-if="selectedNode"
            :node="selectedNode"
            :columns="selectedNodeColumns"
            @apply="handleApplyTransform"
            @cancel="handleCancelTransform"
          />
        </div>

        <!-- Suggestions -->
        <div v-show="bottomTab === 'suggestions'" class="tab-content">
          <div class="suggestions-content">
            <a-empty description="No suggestions available">
              <p class="suggestion-hint">
                Suggestions will appear here as you build your pipeline.
              </p>
            </a-empty>
          </div>
        </div>
      </div>
    </div>

    <!-- Context menu -->
    <ContextMenu
      v-if="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @select="handleContextMenuSelect"
      @close="contextMenuVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  NodeIndexOutlined,
  BulbOutlined,
  HistoryOutlined,
  SaveOutlined,
  RocketOutlined,
  MoreOutlined,
  DatabaseOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  CompressOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  TableOutlined,
  ExportOutlined,
  EyeOutlined,
  FunctionOutlined,
  RightOutlined,
  DragOutlined,
  SelectOutlined,
  DownloadOutlined,
  DownOutlined,
  FilterOutlined,
  MergeCellsOutlined,
  UndoOutlined,
  RedoOutlined
} from '@ant-design/icons-vue'

import { usePipelineStore } from '@/stores/modules/pipeline'
import { getAllDatasets, getDatasetMeta } from '@/mock/datasets'
import type { Node, Edge } from '@/stores/modules/pipeline'
import { graphToPipeline } from '@/utils/pipelineTransform'

import GraphCanvas from '@/components/pipeline/GraphCanvas.vue'
import ToolButton from '@/components/common/ToolButton.vue'
import ContextMenu from '@/components/common/ContextMenu.vue'
import DataPreviewPanel from '@/components/pipeline/DataPreviewPanel.vue'
import TransformPanel from '@/components/pipeline/TransformPanel.vue'

const route = useRoute()
const pipelineStore = usePipelineStore()

// Basic state
const pipelineName = ref('My Pipeline')
const currentTab = ref('graph')
const currentTool = ref('select')
const canvasRef = ref()
const zoomLevel = ref(100)
const showHint = ref(true)

// Nodes and edges
const nodes = computed(() => pipelineStore.nodes)
const edges = computed(() => pipelineStore.edges)
const selectedNode = computed(() => {
  const selectedIds = pipelineStore.selectedNodes
  if (selectedIds.length === 1) {
    return pipelineStore.nodes.find(n => n.id === selectedIds[0])
  }
  return null
})

// Selected node columns
const selectedNodeColumns = computed(() => {
  if (!selectedNode.value) return []

  if (selectedNode.value.type === 'dataset') {
    const datasetId = selectedNode.value.data?.datasetId
    const meta = getDatasetMeta(datasetId)
    return meta?.columns || []
  }

  return []
})

// Outputs list
const outputs = ref<any[]>([])

// Right panel
const rightPanelWidth = ref(280)

// Bottom panel
const bottomPanelVisible = ref(true)
const bottomPanelHeight = ref(350)
const bottomTab = ref('input')

// Context menu
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuItems = ref<any[]>([])
const contextMenuTarget = ref<any>(null)

// Undo/Redo
const canUndo = ref(false)
const canRedo = ref(false)

// Node ID counter
let nodeIdCounter = 1

// ==================== Event Handlers ====================

// Add dataset node
function handleAddData({ key }: { key: string }) {
  const dataset = getAllDatasets().find(d => d.id === key)
  if (!dataset) return

  const node: Node = {
    id: `node-${nodeIdCounter++}`,
    type: 'dataset',
    name: dataset.displayName,
    x: 100 + Math.random() * 100,
    y: 100 + Math.random() * 100,
    data: {
      datasetId: dataset.id,
      columnCount: dataset.columns.length
    }
  }

  pipelineStore.addNode(node)
  message.success(`Added dataset: ${dataset.displayName}`)
}

// Add join node
function handleAddJoin() {
  const node: Node = {
    id: `node-${nodeIdCounter++}`,
    type: 'join',
    name: 'Join',
    x: 200 + Math.random() * 100,
    y: 200 + Math.random() * 100,
    data: {
      joinConfig: {
        type: 'inner',
        leftKey: '',
        rightKey: ''
      }
    }
  }

  pipelineStore.addNode(node)
  message.success('Added Join node')
}

// Add output node to canvas
function handleAddOutputNode() {
  const node: Node = {
    id: `node-${nodeIdCounter++}`,
    type: 'output',
    name: 'Output',
    x: 300 + Math.random() * 100,
    y: 300 + Math.random() * 100,
    data: {
      outputName: 'result_dataset'
    }
  }

  pipelineStore.addNode(node)
  message.success('Added Output node')
}

// Show transform panel
function showTransformPanel() {
  if (!selectedNode.value) {
    message.warning('Please select a node first')
    return
  }

  bottomPanelVisible.value = true
  bottomTab.value = 'transformations'
}

// Node click
function handleNodeClick(node: Node) {
  pipelineStore.setSelectedNodes([node.id])
  bottomPanelVisible.value = true
  bottomTab.value = 'preview'
}

// Node double click
function handleNodeDoubleClick(node: Node) {
  pipelineStore.setSelectedNodes([node.id])
  bottomPanelVisible.value = true
  bottomTab.value = 'transformations'
}

// Node context menu
function handleNodeContextMenu({ node, x, y }: { node: Node; x: number; y: number }) {
  contextMenuTarget.value = node
  contextMenuX.value = x
  contextMenuY.value = y
  contextMenuItems.value = [
    {
      key: 'preview',
      label: 'Preview data',
      icon: 'eye'
    },
    {
      key: 'transform',
      label: 'Add transformation',
      icon: 'function'
    },
    {
      type: 'divider'
    },
    {
      key: 'duplicate',
      label: 'Duplicate',
      icon: 'copy'
    },
    {
      key: 'rename',
      label: 'Rename',
      icon: 'edit'
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'delete',
      danger: true
    }
  ]
  contextMenuVisible.value = true
}

// Edge added
function handleEdgeAdded(edge: Edge) {
  pipelineStore.addEdge(edge)
  message.success('Nodes connected')
}

// Edge context menu
function handleEdgeContextMenu({ edge, x, y }: { edge: Edge; x: number; y: number }) {
  contextMenuTarget.value = edge
  contextMenuX.value = x
  contextMenuY.value = y
  contextMenuItems.value = [
    {
      key: 'delete',
      label: 'Delete connection',
      icon: 'delete',
      danger: true
    }
  ]
  contextMenuVisible.value = true
}

// Canvas click
function handleCanvasClick() {
  pipelineStore.setSelectedNodes([])
  contextMenuVisible.value = false
}

// Context menu select
function handleContextMenuSelect(key: string) {
  const target = contextMenuTarget.value

  if (!target) return

  switch (key) {
    case 'preview':
      handleNodeClick(target)
      break
    case 'transform':
      handleNodeDoubleClick(target)
      break
    case 'duplicate':
      duplicateNode(target)
      break
    case 'rename':
      renameNode(target)
      break
    case 'delete':
      if (target.source) {
        // Edge
        pipelineStore.removeEdge(target.id)
        message.success('Connection deleted')
      } else {
        // Node
        pipelineStore.removeNode(target.id)
        message.success('Node deleted')
      }
      break
  }

  contextMenuVisible.value = false
}

// Duplicate node
function duplicateNode(node: Node) {
  const newNode: Node = {
    ...node,
    id: `node-${nodeIdCounter++}`,
    name: `${node.name} (copy)`,
    x: node.x + 50,
    y: node.y + 50
  }
  pipelineStore.addNode(newNode)
  message.success('Node duplicated')
}

// Rename node
function renameNode(node: Node) {
  const newName = prompt('Enter new name:', node.name)
  if (newName && newName !== node.name) {
    pipelineStore.updateNode(node.id, { name: newName })
    message.success('Node renamed')
  }
}

// Apply transform
async function handleApplyTransform(transform: any) {
  if (!selectedNode.value) return

  try {
    await pipelineStore.addTransform(selectedNode.value.id, transform)
    message.success(`Transform "${transform.name || transform.type}" applied`)

    bottomTab.value = 'preview'
  } catch (error: any) {
    message.error(`Failed to apply transform: ${error.message}`)
  }
}

// Cancel transform
function handleCancelTransform() {
  bottomTab.value = 'preview'
}

// Bottom tab change
function handleBottomTabChange(key: string) {
  if (!selectedNode.value && ['preview', 'transformations'].includes(key)) {
    message.warning('Please select a node first')
    bottomTab.value = 'input'
  }
}

// Zoom
function handleZoom(type: 'in' | 'out' | 'fit') {
  if (!canvasRef.value) return

  switch (type) {
    case 'in':
      canvasRef.value.zoom(0.1)
      zoomLevel.value = Math.min(200, zoomLevel.value + 10)
      break
    case 'out':
      canvasRef.value.zoom(-0.1)
      zoomLevel.value = Math.max(10, zoomLevel.value - 10)
      break
    case 'fit':
      canvasRef.value.centerContent()
      zoomLevel.value = 100
      break
  }
}

// Save
async function handleSave() {
  try {
    // Get current graph data from GraphCanvas
    const graph = canvasRef.value?.getGraph()

    if (!graph) {
      message.error('Unable to get graph data')
      return
    }

    // Convert X6 Graph to Pipeline JSON format
    const pipelineData = graphToPipeline(graph, {
      name: pipelineName.value,
      description: 'Pipeline created in Pipeline Builder',
      version: '1.0.0',
      metadata: {
        category: 'data-processing',
        tags: [],
        owner: 'current-user',
        visibility: 'private',
        status: 'draft'
      },
      configuration: {
        execution: {
          mode: 'auto'
        }
      }
    })

    // Output complete Pipeline data structure to console
    console.log('====================================')
    console.log('Pipeline Save - Complete Data Structure')
    console.log('====================================')
    console.log('Pipeline Data:', pipelineData)
    console.log('------------------------------------')
    console.log('Nodes Count:', pipelineData.graph.nodes.length)
    console.log('Edges Count:', pipelineData.graph.edges.length)
    console.log('------------------------------------')
    console.log('Nodes Detail:')
    pipelineData.graph.nodes.forEach((node, index) => {
      console.log(`  [${index + 1}] ${node.label} (${node.type})`, node)
    })
    console.log('------------------------------------')
    console.log('Edges Detail:')
    pipelineData.graph.edges.forEach((edge, index) => {
      console.log(`  [${index + 1}] ${edge.source.nodeId} -> ${edge.target.nodeId}`, edge)
    })
    console.log('====================================')
    console.log('JSON Format:')
    console.log(JSON.stringify(pipelineData, null, 2))
    console.log('====================================')

    // Save to store
    await pipelineStore.savePipeline()
    message.success('Pipeline saved successfully!')
  } catch (error) {
    console.error('Error saving pipeline:', error)
    message.error('Failed to save pipeline')
  }
}

// Deploy
function handleDeploy() {
  message.info('Deploy functionality not implemented')
}

// More actions
function handleMoreAction({ key }: { key: string }) {
  message.info(`Action: ${key}`)
}

// Undo
function handleUndo() {
  message.info('Undo')
}

// Redo
function handleRedo() {
  message.info('Redo')
}

// Run pipeline
async function handleRunPipeline() {
  message.loading({ content: 'Running pipeline...', key: 'run' })

  try {
    const result = await pipelineStore.executePipeline()

    if (result.success) {
      message.success({ content: result.message, key: 'run' })

      // Log execution results
      console.log('====================================')
      console.log('Pipeline Execution Results')
      console.log('====================================')
      if (result.results) {
        result.results.forEach((data, nodeId) => {
          const node = pipelineStore.getNodeById(nodeId)
          console.log(`Node: ${node?.name || nodeId}`)
          console.log(`Rows: ${data.length}`)
          console.log('Sample data:', data.slice(0, 3))
          console.log('------------------------------------')
        })
      }
      console.log('====================================')
    } else {
      message.error({ content: result.message, key: 'run' })
      console.error('Pipeline execution failed:', result.message)
    }
  } catch (error: any) {
    message.error({ content: 'Pipeline execution failed', key: 'run' })
    console.error('Pipeline execution error:', error)
  }
}

// Add output
function handleAddOutput() {
  const output = {
    id: `output-${Date.now()}`,
    name: 'New Output',
    type: 'Dataset'
  }
  outputs.value.push(output)
}

// Remove output
function removeOutput(id: string) {
  outputs.value = outputs.value.filter(o => o.id !== id)
}

// ==================== Panel Resize ====================

let resizing = false
let resizeType: 'right' | 'bottom' = 'right'
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0

function startResize(type: 'right' | 'bottom') {
  resizing = true
  resizeType = type

  if (type === 'right') {
    startX = event ? (event as MouseEvent).clientX : 0
    startWidth = rightPanelWidth.value
  } else {
    startY = event ? (event as MouseEvent).clientY : 0
    startHeight = bottomPanelHeight.value
  }

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(e: MouseEvent) {
  if (!resizing) return

  if (resizeType === 'right') {
    const deltaX = startX - e.clientX
    rightPanelWidth.value = Math.max(200, Math.min(600, startWidth + deltaX))
  } else {
    const deltaY = startY - e.clientY
    bottomPanelHeight.value = Math.max(200, Math.min(800, startHeight + deltaY))
  }
}

function stopResize() {
  resizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// ==================== Lifecycle ====================

onMounted(async () => {
  const pipelineId = route.params.id as string

  if (pipelineId) {
    // Try to load existing pipeline
    const loaded = await pipelineStore.loadPipeline(pipelineId)
    if (loaded) {
      message.success('Pipeline loaded')
      return
    }
  }

  // Initialize a new pipeline if not loaded
  if (!pipelineStore.currentPipeline) {
    pipelineStore.setPipeline({
      id: pipelineId || `pipeline_${Date.now()}`,
      name: pipelineName.value,
      description: 'A new data pipeline',
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped lang="less">
.pipeline-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F5F6F7;
  overflow: hidden;
}

// ==================== Top Navigation ====================
.top-nav {
  height: 48px;
  background: #FFFFFF;
  border-bottom: 1px solid #E4E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;

  .nav-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #2D6EED 0%, #1E4FC2 100%);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      color: #FFFFFF;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;

      .breadcrumb-item {
        color: #5F6368;

        &.active {
          color: #212121;
          font-weight: 500;
        }
      }

      .separator {
        font-size: 12px;
        color: #D0D5DD;
      }
    }
  }

  .nav-tabs {
    display: flex;
    gap: 4px;

    .tab-btn {
      height: 32px;
      padding: 0 16px;
      border: none;
      background: transparent;
      color: #5F6368;
      font-size: 13px;
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        background: #F5F6F7;
        color: #212121;
      }

      &.active {
        background: #E8F0FE;
        color: #2D6EED;
        font-weight: 500;
      }
    }
  }

  .nav-actions {
    display: flex;
    gap: 8px;
  }
}

// ==================== Toolbar ====================
.toolbar {
  height: 48px;
  background: #E8EAED;
  border-bottom: 1px solid #D4D7DC;
  display: flex;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
  gap: 0;

  .toolbar-section {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .toolbar-label {
    font-size: 12px;
    color: #5F6368;
    font-weight: 500;
    margin-right: 4px;
  }

  .toolbar-btn {
    height: 32px;
    min-width: 32px;
    padding: 4px 8px;
    border: 1px solid transparent;
    background: transparent;
    color: #5F6368;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: #D4D7DC;
      border-color: #BFC3C9;
    }

    &.active {
      background: #FFFFFF;
      border-color: #C4C7CC;
      color: #202124;
    }
  }

  .toolbar-dropdown-btn {
    height: 32px;
    padding: 4px 12px;
    border: 1px solid #BFC3C9;
    background: #FFFFFF;
    color: #202124;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 400;
    transition: all 0.2s;
    display: flex;
    align-items: center;

    &:hover {
      border-color: #98A2B3;
      background: #F8F9FA;
    }
  }

  .toolbar-icon-btn {
    height: 32px;
    width: 32px;
    min-width: 32px;
    padding: 0;
    border: 1px solid transparent;
    background: transparent;
    color: #5F6368;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #D4D7DC;
      border-color: #BFC3C9;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

// ==================== Add Data Menu ====================
.add-data-menu {
  :deep(.ant-dropdown-menu-item) {
    padding: 10px 16px;
    font-size: 13px;
    color: #202124;
    display: flex;
    align-items: center;
    transition: background-color 0.2s;

    &:hover {
      background-color: #F1F3F4;
    }

    .anticon {
      font-size: 16px;
      color: #4285F4;
    }
  }
}

// ==================== Main Content ====================
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.canvas-area {
  flex: 1;
  position: relative;
  background: #ECEEF1;
  overflow: hidden;
}

.zoom-controls {
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1px solid #E4E7EB;
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .zoom-level {
    min-width: 50px;
    text-align: center;
    font-size: 13px;
    color: #5F6368;
    font-weight: 500;
  }
}

.hint-bubble {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 400px;

  .hint-content {
    background: #2D6EED;
    color: #FFFFFF;
    padding: 12px 16px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    box-shadow: 0 4px 12px rgba(45, 110, 237, 0.3);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #2D6EED;
    }

    .hint-close {
      margin-left: auto;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }
    }
  }
}

// ==================== Right Panel ====================
.right-panel {
  width: 280px;
  background: #FFFFFF;
  border-left: 1px solid #E4E7EB;
  display: flex;
  flex-direction: column;
  position: relative;
  flex-shrink: 0;

  .resize-handle-left {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: ew-resize;
    z-index: 10;

    &:hover {
      background: #2D6EED;
    }
  }

  .panel-header {
    padding: 20px;
    border-bottom: 1px solid #E4E7EB;

    h2 {
      font-size: 16px;
      font-weight: 600;
      color: #212121;
      margin: 0;
    }
  }

  .panel-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;

    .panel-desc {
      font-size: 13px;
      color: #5F6368;
      line-height: 1.6;
      margin-bottom: 20px;
    }
  }

  .outputs-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .output-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #F5F6F7;
      border: 1px solid #E4E7EB;
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        border-color: #2D6EED;
        background: #E8F0FE;
      }

      .output-icon {
        width: 32px;
        height: 32px;
        background: #2D6EED;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFFFFF;
        font-size: 16px;
      }

      .output-info {
        flex: 1;

        .output-name {
          font-size: 13px;
          font-weight: 500;
          color: #212121;
        }

        .output-type {
          font-size: 12px;
          color: #5F6368;
        }
      }
    }
  }
}

// ==================== Bottom Panel ====================
.bottom-panel {
  height: 350px;
  background: #FFFFFF;
  border-top: 1px solid #E4E7EB;
  display: flex;
  flex-direction: column;
  position: relative;
  flex-shrink: 0;

  .resize-handle-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    cursor: ns-resize;
    z-index: 10;

    &:hover {
      background: #2D6EED;
    }
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #E4E7EB;
    padding-right: 12px;

    :deep(.ant-tabs) {
      flex: 1;

      .ant-tabs-nav {
        margin: 0;

        .ant-tabs-tab {
          padding: 12px 20px;
          font-size: 13px;

          &:hover {
            color: #2D6EED;
          }

          &.ant-tabs-tab-active {
            .ant-tabs-tab-btn {
              color: #2D6EED;
              font-weight: 500;
            }
          }
        }

        .ant-tabs-ink-bar {
          background: #2D6EED;
        }
      }
    }
  }

  .panel-body {
    flex: 1;
    overflow: hidden;

    .tab-content {
      height: 100%;
      overflow-y: auto;
    }

    .suggestions-content {
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;

      .suggestion-hint {
        font-size: 13px;
        color: #5F6368;
        margin-top: 12px;
      }
    }
  }
}
</style>
