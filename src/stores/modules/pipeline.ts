import { defineStore } from 'pinia'
import { getDatasetData, getDatasetMeta } from '@/mock/datasets'
import { applyTransforms, joinDatasets, type Transform, type TransformResult } from '@/utils/transform'

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
          const joinInputs = this.getNodeInputs(nodeId)
          if (joinInputs.length >= 2) {
            const leftData = await this.getNodeData(joinInputs[0].id)
            const rightData = await this.getNodeData(joinInputs[1].id)

            // 从节点配置中获取join参数
            const joinConfig = node.data.joinConfig || {
              type: 'inner',
              leftKey: Object.keys(leftData[0] || {})[0],
              rightKey: Object.keys(rightData[0] || {})[0]
            }

            data = joinDatasets(
              leftData,
              rightData,
              joinConfig.leftKey,
              joinConfig.rightKey,
              joinConfig.type
            )
          }
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

    // 执行Pipeline - 计算所有节点的数据
    async executePipeline(): Promise<{ success: boolean; message: string; results?: Map<string, any[]> }> {
      try {
        if (this.nodes.length === 0) {
          return { success: false, message: 'Pipeline is empty' }
        }

        // 清除所有缓存以重新计算
        this.nodeDataCache.clear()

        // 获取所有节点并按拓扑排序
        const sortedNodes = this.topologicalSort()
        if (!sortedNodes) {
          return { success: false, message: 'Pipeline contains cycles' }
        }

        const results = new Map<string, any[]>()

        // 按顺序执行每个节点
        for (const nodeId of sortedNodes) {
          const data = await this.getNodeData(nodeId)
          results.set(nodeId, data)
        }

        return {
          success: true,
          message: `Pipeline executed successfully. Processed ${sortedNodes.length} nodes.`,
          results
        }
      } catch (error: any) {
        return {
          success: false,
          message: `Pipeline execution failed: ${error.message}`
        }
      }
    },

    // 拓扑排序（用于确定执行顺序）
    topologicalSort(): string[] | null {
      const inDegree = new Map<string, number>()
      const adjList = new Map<string, string[]>()

      // 初始化
      this.nodes.forEach(node => {
        inDegree.set(node.id, 0)
        adjList.set(node.id, [])
      })

      // 构建图
      this.edges.forEach(edge => {
        adjList.get(edge.source)!.push(edge.target)
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
      })

      // 找到所有入度为0的节点
      const queue: string[] = []
      inDegree.forEach((degree, nodeId) => {
        if (degree === 0) {
          queue.push(nodeId)
        }
      })

      const result: string[] = []

      while (queue.length > 0) {
        const nodeId = queue.shift()!
        result.push(nodeId)

        // 减少邻居节点的入度
        adjList.get(nodeId)!.forEach(neighbor => {
          const newDegree = inDegree.get(neighbor)! - 1
          inDegree.set(neighbor, newDegree)
          if (newDegree === 0) {
            queue.push(neighbor)
          }
        })
      }

      // 如果结果数量不等于节点数量，说明存在环
      if (result.length !== this.nodes.length) {
        return null
      }

      return result
    },

    // 保存Pipeline
    async savePipeline(): Promise<void> {
      if (!this.currentPipeline) {
        throw new Error('No pipeline to save')
      }

      this.currentPipeline.nodes = this.nodes
      this.currentPipeline.edges = this.edges
      this.currentPipeline.updatedAt = new Date().toISOString()

      // 保存到localStorage（模拟后端）
      const pipelineData = {
        ...this.currentPipeline,
        nodeDataCache: Object.fromEntries(this.nodeDataCache),
        transformCache: Object.fromEntries(this.transformCache)
      }

      localStorage.setItem(`pipeline_${this.currentPipeline.id}`, JSON.stringify(pipelineData))
      console.log('Pipeline saved:', pipelineData)

      this.isDirty = false
    },

    // 加载Pipeline
    async loadPipeline(id: string): Promise<boolean> {
      try {
        const data = localStorage.getItem(`pipeline_${id}`)
        if (!data) {
          return false
        }

        const pipelineData = JSON.parse(data)

        this.setPipeline({
          id: pipelineData.id,
          name: pipelineData.name,
          description: pipelineData.description,
          nodes: pipelineData.nodes,
          edges: pipelineData.edges,
          createdAt: pipelineData.createdAt,
          updatedAt: pipelineData.updatedAt
        })

        // 恢复缓存
        if (pipelineData.nodeDataCache) {
          this.nodeDataCache = new Map(Object.entries(pipelineData.nodeDataCache))
        }
        if (pipelineData.transformCache) {
          this.transformCache = new Map(Object.entries(pipelineData.transformCache))
        }

        return true
      } catch (error) {
        console.error('Failed to load pipeline:', error)
        return false
      }
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
