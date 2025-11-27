/**
 * IndexedDB Service - 管道数据持久化存储服务
 *
 * 数据库结构:
 * - pipelines: 存储管道配置
 * - datasets: 存储数据集元信息和数据
 * - transforms: 存储转换配置
 * - nodeData: 存储节点计算后的数据缓存
 */

const DB_NAME = 'PipelineBuilderDB'
const DB_VERSION = 1

// 数据库存储对象名称
const STORES = {
  PIPELINES: 'pipelines',
  DATASETS: 'datasets',
  TRANSFORMS: 'transforms',
  NODE_DATA: 'nodeData'
} as const

// 数据库实例
let db: IDBDatabase | null = null

/**
 * 初始化 IndexedDB 数据库
 */
export async function initDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      console.log('IndexedDB initialized successfully')
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // 创建 pipelines 存储对象
      if (!database.objectStoreNames.contains(STORES.PIPELINES)) {
        const pipelineStore = database.createObjectStore(STORES.PIPELINES, { keyPath: 'id' })
        pipelineStore.createIndex('name', 'name', { unique: false })
        pipelineStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        pipelineStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // 创建 datasets 存储对象
      if (!database.objectStoreNames.contains(STORES.DATASETS)) {
        const datasetStore = database.createObjectStore(STORES.DATASETS, { keyPath: 'id' })
        datasetStore.createIndex('name', 'name', { unique: false })
        datasetStore.createIndex('type', 'type', { unique: false })
      }

      // 创建 transforms 存储对象 (按 pipelineId + nodeId 组合键)
      if (!database.objectStoreNames.contains(STORES.TRANSFORMS)) {
        const transformStore = database.createObjectStore(STORES.TRANSFORMS, { keyPath: ['pipelineId', 'nodeId'] })
        transformStore.createIndex('pipelineId', 'pipelineId', { unique: false })
        transformStore.createIndex('nodeId', 'nodeId', { unique: false })
      }

      // 创建 nodeData 存储对象 (缓存节点计算结果)
      if (!database.objectStoreNames.contains(STORES.NODE_DATA)) {
        const nodeDataStore = database.createObjectStore(STORES.NODE_DATA, { keyPath: ['pipelineId', 'nodeId'] })
        nodeDataStore.createIndex('pipelineId', 'pipelineId', { unique: false })
      }

      console.log('IndexedDB schema created/upgraded')
    }
  })
}

/**
 * 获取数据库实例
 */
async function getDB(): Promise<IDBDatabase> {
  if (!db) {
    return initDatabase()
  }
  return db
}

/**
 * 通用事务执行器
 */
async function executeTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const request = operation(store)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ==================== Pipeline 操作 ====================

export interface PipelineData {
  id: string
  name: string
  description?: string
  nodes: any[]
  edges: any[]
  createdAt: string
  updatedAt: string
  version?: string
  metadata?: any
  configuration?: any
}

/**
 * 保存管道
 */
export async function savePipeline(pipeline: PipelineData): Promise<void> {
  const data = {
    ...pipeline,
    updatedAt: new Date().toISOString()
  }
  await executeTransaction(STORES.PIPELINES, 'readwrite', (store) => store.put(data))
  console.log('Pipeline saved to IndexedDB:', pipeline.id)
}

/**
 * 获取管道
 */
export async function getPipeline(id: string): Promise<PipelineData | undefined> {
  return executeTransaction(STORES.PIPELINES, 'readonly', (store) => store.get(id))
}

/**
 * 获取所有管道列表
 */
export async function getAllPipelines(): Promise<PipelineData[]> {
  return executeTransaction(STORES.PIPELINES, 'readonly', (store) => store.getAll())
}

/**
 * 删除管道
 */
export async function deletePipeline(id: string): Promise<void> {
  await executeTransaction(STORES.PIPELINES, 'readwrite', (store) => store.delete(id))
  // 同时删除相关的 transforms 和 nodeData
  await deleteTransformsByPipeline(id)
  await deleteNodeDataByPipeline(id)
  console.log('Pipeline deleted from IndexedDB:', id)
}

/**
 * 检查管道是否存在
 */
export async function pipelineExists(id: string): Promise<boolean> {
  const pipeline = await getPipeline(id)
  return !!pipeline
}

// ==================== Dataset 操作 ====================

export interface DatasetData {
  id: string
  name: string
  displayName: string
  description?: string
  type: 'builtin' | 'user'
  columns: Array<{
    name: string
    type: string
    nullable: boolean
    description?: string
  }>
  data: any[]
  rowCount: number
  createdAt: string
  updatedAt: string
}

/**
 * 保存数据集
 */
export async function saveDataset(dataset: DatasetData): Promise<void> {
  await executeTransaction(STORES.DATASETS, 'readwrite', (store) => store.put(dataset))
  console.log('Dataset saved to IndexedDB:', dataset.id)
}

/**
 * 获取数据集
 */
export async function getDataset(id: string): Promise<DatasetData | undefined> {
  return executeTransaction(STORES.DATASETS, 'readonly', (store) => store.get(id))
}

/**
 * 获取所有数据集
 */
export async function getAllDatasets(): Promise<DatasetData[]> {
  return executeTransaction(STORES.DATASETS, 'readonly', (store) => store.getAll())
}

/**
 * 删除数据集
 */
export async function deleteDataset(id: string): Promise<void> {
  await executeTransaction(STORES.DATASETS, 'readwrite', (store) => store.delete(id))
}

/**
 * 初始化内置数据集
 */
export async function initBuiltinDatasets(): Promise<void> {
  const existingDatasets = await getAllDatasets()
  const builtinIds = ['products', 'customers', 'transactions']

  // 检查是否已经初始化
  const hasBuiltin = builtinIds.every(id =>
    existingDatasets.some(ds => ds.id === id)
  )

  if (hasBuiltin) {
    console.log('Builtin datasets already initialized')
    return
  }

  // 导入模拟数据
  const {
    productsData,
    customersData,
    transactionsData,
    datasetsMeta
  } = await import('@/mock/datasets')

  const now = new Date().toISOString()

  // 获取各数据集的元信息
  const productsMeta = datasetsMeta.find(m => m.id === 'products')!
  const customersMeta = datasetsMeta.find(m => m.id === 'customers')!
  const transactionsMeta = datasetsMeta.find(m => m.id === 'transactions')!

  // Products 数据集
  await saveDataset({
    id: 'products',
    name: 'products',
    displayName: 'Products',
    description: productsMeta.description,
    type: 'builtin',
    columns: productsMeta.columns,
    data: productsData,
    rowCount: productsData.length,
    createdAt: now,
    updatedAt: now
  })

  // Customers 数据集
  await saveDataset({
    id: 'customers',
    name: 'customers',
    displayName: 'Customers',
    description: customersMeta.description,
    type: 'builtin',
    columns: customersMeta.columns,
    data: customersData,
    rowCount: customersData.length,
    createdAt: now,
    updatedAt: now
  })

  // Transactions 数据集
  await saveDataset({
    id: 'transactions',
    name: 'transactions',
    displayName: 'Transactions',
    description: transactionsMeta.description,
    type: 'builtin',
    columns: transactionsMeta.columns,
    data: transactionsData,
    rowCount: transactionsData.length,
    createdAt: now,
    updatedAt: now
  })

  console.log('Builtin datasets initialized')
}

// ==================== Transform 操作 ====================

export interface TransformData {
  pipelineId: string
  nodeId: string
  transforms: Array<{
    id: string
    type: string
    name?: string
    config?: any
    params?: any
    enabled?: boolean
  }>
  updatedAt: string
}

/**
 * 保存节点的转换配置
 */
export async function saveTransforms(pipelineId: string, nodeId: string, transforms: any[]): Promise<void> {
  const data: TransformData = {
    pipelineId,
    nodeId,
    transforms,
    updatedAt: new Date().toISOString()
  }
  await executeTransaction(STORES.TRANSFORMS, 'readwrite', (store) => store.put(data))
}

/**
 * 获取节点的转换配置
 */
export async function getTransforms(pipelineId: string, nodeId: string): Promise<any[]> {
  const data = await executeTransaction<TransformData | undefined>(
    STORES.TRANSFORMS,
    'readonly',
    (store) => store.get([pipelineId, nodeId])
  )
  return data?.transforms || []
}

/**
 * 获取管道的所有转换配置
 */
export async function getTransformsByPipeline(pipelineId: string): Promise<Map<string, any[]>> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.TRANSFORMS, 'readonly')
    const store = transaction.objectStore(STORES.TRANSFORMS)
    const index = store.index('pipelineId')
    const request = index.getAll(pipelineId)

    request.onsuccess = () => {
      const result = new Map<string, any[]>()
      for (const item of request.result as TransformData[]) {
        result.set(item.nodeId, item.transforms)
      }
      resolve(result)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * 删除节点的转换配置
 */
export async function deleteTransforms(pipelineId: string, nodeId: string): Promise<void> {
  await executeTransaction(STORES.TRANSFORMS, 'readwrite', (store) =>
    store.delete([pipelineId, nodeId])
  )
}

/**
 * 删除管道的所有转换配置
 */
async function deleteTransformsByPipeline(pipelineId: string): Promise<void> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.TRANSFORMS, 'readwrite')
    const store = transaction.objectStore(STORES.TRANSFORMS)
    const index = store.index('pipelineId')
    const request = index.openCursor(pipelineId)

    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      } else {
        resolve()
      }
    }
    request.onerror = () => reject(request.error)
  })
}

// ==================== NodeData 操作 (缓存) ====================

export interface NodeDataCache {
  pipelineId: string
  nodeId: string
  data: any[]
  columns: string[]
  rowCount: number
  updatedAt: string
}

/**
 * 保存节点数据缓存
 */
export async function saveNodeData(pipelineId: string, nodeId: string, data: any[], columns: string[]): Promise<void> {
  const cacheData: NodeDataCache = {
    pipelineId,
    nodeId,
    data,
    columns,
    rowCount: data.length,
    updatedAt: new Date().toISOString()
  }
  await executeTransaction(STORES.NODE_DATA, 'readwrite', (store) => store.put(cacheData))
}

/**
 * 获取节点数据缓存
 */
export async function getNodeData(pipelineId: string, nodeId: string): Promise<NodeDataCache | undefined> {
  return executeTransaction(STORES.NODE_DATA, 'readonly', (store) =>
    store.get([pipelineId, nodeId])
  )
}

/**
 * 获取管道的所有节点数据缓存
 */
export async function getNodeDataByPipeline(pipelineId: string): Promise<Map<string, any[]>> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.NODE_DATA, 'readonly')
    const store = transaction.objectStore(STORES.NODE_DATA)
    const index = store.index('pipelineId')
    const request = index.getAll(pipelineId)

    request.onsuccess = () => {
      const result = new Map<string, any[]>()
      for (const item of request.result as NodeDataCache[]) {
        result.set(item.nodeId, item.data)
      }
      resolve(result)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * 删除节点数据缓存
 */
export async function deleteNodeData(pipelineId: string, nodeId: string): Promise<void> {
  await executeTransaction(STORES.NODE_DATA, 'readwrite', (store) =>
    store.delete([pipelineId, nodeId])
  )
}

/**
 * 删除管道的所有节点数据缓存
 */
async function deleteNodeDataByPipeline(pipelineId: string): Promise<void> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.NODE_DATA, 'readwrite')
    const store = transaction.objectStore(STORES.NODE_DATA)
    const index = store.index('pipelineId')
    const request = index.openCursor(pipelineId)

    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      } else {
        resolve()
      }
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * 清除管道的所有节点数据缓存
 */
export async function clearPipelineCache(pipelineId: string): Promise<void> {
  await deleteNodeDataByPipeline(pipelineId)
  console.log('Pipeline cache cleared:', pipelineId)
}

// ==================== 数据库管理 ====================

/**
 * 关闭数据库连接
 */
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
    console.log('IndexedDB connection closed')
  }
}

/**
 * 清空所有数据 (用于测试/重置)
 */
export async function clearAllData(): Promise<void> {
  const database = await getDB()
  const storeNames = [STORES.PIPELINES, STORES.DATASETS, STORES.TRANSFORMS, STORES.NODE_DATA]

  for (const storeName of storeNames) {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
  console.log('All IndexedDB data cleared')
}

/**
 * 导出所有数据 (用于备份)
 */
export async function exportAllData(): Promise<{
  pipelines: PipelineData[]
  datasets: DatasetData[]
  transforms: TransformData[]
  nodeData: NodeDataCache[]
}> {
  const database = await getDB()

  const getData = (storeName: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  return {
    pipelines: await getData(STORES.PIPELINES),
    datasets: await getData(STORES.DATASETS),
    transforms: await getData(STORES.TRANSFORMS),
    nodeData: await getData(STORES.NODE_DATA)
  }
}

/**
 * 导入数据 (用于恢复)
 */
export async function importData(data: {
  pipelines?: PipelineData[]
  datasets?: DatasetData[]
  transforms?: TransformData[]
  nodeData?: NodeDataCache[]
}): Promise<void> {
  if (data.pipelines) {
    for (const pipeline of data.pipelines) {
      await savePipeline(pipeline)
    }
  }
  if (data.datasets) {
    for (const dataset of data.datasets) {
      await saveDataset(dataset)
    }
  }
  if (data.transforms) {
    for (const transform of data.transforms) {
      await saveTransforms(transform.pipelineId, transform.nodeId, transform.transforms)
    }
  }
  if (data.nodeData) {
    for (const cache of data.nodeData) {
      await saveNodeData(cache.pipelineId, cache.nodeId, cache.data, cache.columns)
    }
  }
  console.log('Data imported successfully')
}

// 默认导出
export default {
  initDatabase,
  // Pipeline
  savePipeline,
  getPipeline,
  getAllPipelines,
  deletePipeline,
  pipelineExists,
  // Dataset
  saveDataset,
  getDataset,
  getAllDatasets,
  deleteDataset,
  initBuiltinDatasets,
  // Transform
  saveTransforms,
  getTransforms,
  getTransformsByPipeline,
  deleteTransforms,
  // NodeData
  saveNodeData,
  getNodeData,
  getNodeDataByPipeline,
  deleteNodeData,
  clearPipelineCache,
  // Management
  closeDatabase,
  clearAllData,
  exportAllData,
  importData
}
