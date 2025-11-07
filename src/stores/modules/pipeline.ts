import { defineStore } from 'pinia'
import { getDatasetData, getDatasetMeta } from '@/mock/datasets'
import { applyTransforms, type Transform, type TransformResult } from '@/utils/transform'

export interface Node {
  id: string
  type: 'dataset' | 'transform' | 'join' | 'output'
  name: string
  x: number
  y: number
  data: any
}

export interface Edge {
  id: string
  source: string
  target: string
  sourcePort?: string
  targetPort?: string
}

export interface Pipeline {
  id: string
  name: string
  description?: string
  nodes: Node[]
  edges: Edge[]
  createdAt: string
  updatedAt: string
}

interface PipelineState {
  currentPipeline: Pipeline | null
  nodes: Node[]
  edges: Edge[]
  selectedNodes: string[]
  selectedEdges: string[]
  isDirty: boolean
  nodeDataCache: Map<string, any[]>
  transformCache: Map<string, Transform[]>
}

export const usePipelineStore = defineStore('pipeline', {
  state: (): PipelineState => ({
    currentPipeline: null,
    nodes: [],
    edges: [],
    selectedNodes: [],
    selectedEdges: [],
    isDirty: false,
    nodeDataCache: new Map(),
    transformCache: new Map()
  }),

  getters: {
    nodeCount(): number {
      return this.nodes.length
    },

    edgeCount(): number {
      return this.edges.length
    },

    getNodeById: (state) => (id: string) => {
      return state.nodes.find(n => n.id === id)
    },

    getSelectedNode(): Node | undefined {
      if (this.selectedNodes.length === 0) return undefined
      return this.nodes.find(n => n.id === this.selectedNodes[0])
    },

    // 获取节点的输入节点
    getNodeInputs: (state) => (nodeId: string): Node[] => {
      const inputEdges = state.edges.filter(e => e.target === nodeId)
      return inputEdges
        .map(e => state.nodes.find(n => n.id === e.source))
        .filter((n): n is Node => n !== undefined)
    },

    // 获取节点的输出节点
    getNodeOutputs: (state) => (nodeId: string): Node[] => {
      const outputEdges = state.edges.filter(e => e.source === nodeId)
      return outputEdges
        .map(e => state.nodes.find(n => n.id === e.target))
        .filter((n): n is Node => n !== undefined)
    }
  },

  actions: {
    // 确保 Map 对象正确初始化（处理持久化问题）
    ensureMapsInitialized() {
      if (!(this.nodeDataCache instanceof Map)) {
        this.nodeDataCache = new Map(Object.entries(this.nodeDataCache || {}))
      }
      if (!(this.transformCache instanceof Map)) {
        this.transformCache = new Map(Object.entries(this.transformCache || {}))
      }
    },

    setPipeline(pipeline: Pipeline) {
      this.currentPipeline = pipeline
      this.nodes = pipeline.nodes || []
      this.edges = pipeline.edges || []
      this.isDirty = false
      this.ensureMapsInitialized()
      this.nodeDataCache.clear()
      this.transformCache.clear()
    },

    addNode(node: Node) {
      this.nodes.push(node)
      this.isDirty = true

      // 如果是数据集节点，加载数据
      if (node.type === 'dataset' && node.data.datasetId) {
        const data = getDatasetData(node.data.datasetId)
        this.nodeDataCache.set(node.id, data)
      }
    },

    removeNode(id: string) {
      const index = this.nodes.findIndex(n => n.id === id)
      if (index > -1) {
        this.nodes.splice(index, 1)
        // 同时删除相关的边
        this.edges = this.edges.filter(e => e.source !== id && e.target !== id)
        // 清理缓存
        this.nodeDataCache.delete(id)
        this.transformCache.delete(id)
        this.isDirty = true
      }
    },

    updateNode(id: string, updates: Partial<Node>) {
      const node = this.nodes.find(n => n.id === id)
      if (node) {
        Object.assign(node, updates)
        this.isDirty = true

        // 如果更新了转换节点，清除下游节点的缓存
        this.clearDownstreamCache(id)
      }
    },

    addEdge(edge: Edge) {
      // 检查是否已存在相同的边
      const exists = this.edges.some(
        e => e.source === edge.source && e.target === edge.target
      )
      if (!exists) {
        this.edges.push(edge)
        this.isDirty = true

        // 清除目标节点的缓存
        this.nodeDataCache.delete(edge.target)
      }
    },

    removeEdge(id: string) {
      const index = this.edges.findIndex(e => e.id === id)
      if (index > -1) {
        const edge = this.edges[index]
        this.edges.splice(index, 1)
        // 清除目标节点的缓存
        this.nodeDataCache.delete(edge.target)
        this.isDirty = true
      }
    },

    setSelectedNodes(ids: string[]) {
      this.selectedNodes = ids
    },

    setSelectedEdges(ids: string[]) {
      this.selectedEdges = ids
    },

    clearSelection() {
      this.selectedNodes = []
      this.selectedEdges = []
    },

    // 获取节点数据（带缓存）
    async getNodeData(nodeId: string): Promise<any[]> {
      // 确保 Maps 正确初始化
      this.ensureMapsInitialized()

      // 检查缓存
      if (this.nodeDataCache.has(nodeId)) {
        return this.nodeDataCache.get(nodeId)!
      }

      const node = this.getNodeById(nodeId)
      if (!node) return []

      let data: any[] = []

      switch (node.type) {
        case 'dataset':
          // 数据集节点：直接从mock数据加载
          data = getDatasetData(node.data.datasetId)
          break

        case 'transform':
          // 转换节点：获取输入数据并应用转换
          const inputNodes = this.getNodeInputs(nodeId)
          if (inputNodes.length > 0) {
            const inputData = await this.getNodeData(inputNodes[0].id)
            const transforms = this.transformCache.get(nodeId) || []
            const result = applyTransforms(inputData, transforms)
            data = result.data
          }
          break

        case 'join':
          // 连接节点：获取多个输入并执行join
          // TODO: 实现join逻辑
          break

        case 'output':
          // 输出节点：获取输入数据
          const outputInputs = this.getNodeInputs(nodeId)
          if (outputInputs.length > 0) {
            data = await this.getNodeData(outputInputs[0].id)
          }
          break
      }

      // 缓存结果
      this.nodeDataCache.set(nodeId, data)
      return data
    },

    // 添加转换到节点
    addTransform(nodeId: string, transform: Transform) {
      this.ensureMapsInitialized()
      const transforms = this.transformCache.get(nodeId) || []
      transforms.push(transform)
      this.transformCache.set(nodeId, transforms)

      // 清除缓存
      this.clearDownstreamCache(nodeId)
      this.isDirty = true
    },

    // 更新节点的转换
    updateTransform(nodeId: string, transformId: string, updates: Partial<Transform>) {
      this.ensureMapsInitialized()
      const transforms = this.transformCache.get(nodeId) || []
      const transform = transforms.find(t => t.id === transformId)
      if (transform) {
        Object.assign(transform, updates)
        this.clearDownstreamCache(nodeId)
        this.isDirty = true
      }
    },

    // 删除转换
    removeTransform(nodeId: string, transformId: string) {
      this.ensureMapsInitialized()
      const transforms = this.transformCache.get(nodeId) || []
      const index = transforms.findIndex(t => t.id === transformId)
      if (index > -1) {
        transforms.splice(index, 1)
        this.transformCache.set(nodeId, transforms)
        this.clearDownstreamCache(nodeId)
        this.isDirty = true
      }
    },

    // 获取节点的转换列表
    getNodeTransforms(nodeId: string): Transform[] {
      this.ensureMapsInitialized()
      return this.transformCache.get(nodeId) || []
    },

    // 清除下游节点的缓存
    clearDownstreamCache(nodeId: string) {
      this.ensureMapsInitialized()
      const visited = new Set<string>()
      const queue = [nodeId]

      while (queue.length > 0) {
        const currentId = queue.shift()!
        if (visited.has(currentId)) continue
        visited.add(currentId)

        this.nodeDataCache.delete(currentId)

        const outputs = this.getNodeOutputs(currentId)
        outputs.forEach(node => queue.push(node.id))
      }
    },

    // 清空所有数据
    clear() {
      this.currentPipeline = null
      this.nodes = []
      this.edges = []
      this.selectedNodes = []
      this.selectedEdges = []
      this.isDirty = false
      this.nodeDataCache.clear()
      this.transformCache.clear()
    },

    // 保存Pipeline
    async savePipeline(): Promise<void> {
      if (!this.currentPipeline) {
        throw new Error('No pipeline to save')
      }

      this.currentPipeline.nodes = this.nodes
      this.currentPipeline.edges = this.edges
      this.currentPipeline.updatedAt = new Date().toISOString()

      // TODO: 调用API保存
      console.log('Saving pipeline:', this.currentPipeline)

      this.isDirty = false
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'pipeline',
        storage: localStorage,
        paths: ['currentPipeline', 'nodes', 'edges']
      }
    ]
  }
})
