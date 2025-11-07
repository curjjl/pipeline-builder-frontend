/**
 * Pipeline Builder - 核心类型定义
 *
 * 此文件定义了Pipeline Builder的所有核心数据类型
 * 对应后端API的数据结构，确保前后端类型一致
 *
 * @version 1.0.0
 * @see docs/09-前后端数据规范与API设计.md
 */

// ============================================================================
// Pipeline 核心类型
// ============================================================================

/**
 * Pipeline 完整数据结构
 */
export interface Pipeline {
  // 基础信息
  id: string
  name: string
  description?: string
  version: string

  // 元信息
  metadata: PipelineMetadata

  // 图结构
  graph: PipelineGraph

  // 配置
  configuration: PipelineConfiguration

  // 执行信息（只读）
  execution?: PipelineExecution

  // 审计信息
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

/**
 * Pipeline 元信息
 */
export interface PipelineMetadata {
  category: string
  tags: string[]
  owner: string
  team?: string
  visibility: 'private' | 'team' | 'public'
  status: 'draft' | 'published' | 'deprecated'
  documentation?: {
    readme?: string
    changeLog?: string
    externalLinks?: {
      name: string
      url: string
    }[]
  }
}

/**
 * Pipeline 图结构
 */
export interface PipelineGraph {
  nodes: Node[]
  edges: Edge[]
  layout?: {
    zoom: number
    center: {
      x: number
      y: number
    }
  }
  groups?: NodeGroup[]
}

/**
 * Pipeline 配置
 */
export interface PipelineConfiguration {
  execution?: {
    mode: 'sequential' | 'parallel' | 'auto'
    timeout?: number
    retryPolicy?: {
      maxRetries: number
      retryDelay: number
      exponentialBackoff: boolean
    }
  }
  schedule?: {
    enabled: boolean
    cron: string
    timezone: string
  }
  notifications?: {
    onSuccess?: NotificationConfig[]
    onFailure?: NotificationConfig[]
  }
  environment?: Record<string, string>
  parameters?: Record<string, any>
}

export interface NotificationConfig {
  type: 'email' | 'slack' | 'webhook'
  config: Record<string, any>
}

/**
 * Pipeline 执行信息
 */
export interface PipelineExecution {
  lastExecution?: {
    executionId: string
    status: ExecutionStatus
    startedAt: string
    completedAt?: string
    duration?: number
    error?: string
  }
  statistics: {
    totalExecutions: number
    successCount: number
    failureCount: number
    averageDuration: number
  }
  health: 'healthy' | 'warning' | 'error' | 'unknown'
}

export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'stopped'

// ============================================================================
// Node 类型定义
// ============================================================================

/**
 * 节点类型枚举
 */
export type NodeType =
  // 数据源
  | 'dataset'
  | 'database-source'
  | 'api-source'
  | 'file-source'
  // 转换
  | 'sql-transform'
  | 'python-transform'
  | 'javascript-transform'
  | 'filter'
  | 'aggregate'
  | 'join'
  | 'union'
  | 'pivot'
  // 输出
  | 'dataset-output'
  | 'database-sink'
  | 'api-sink'
  | 'file-sink'
  // 控制流
  | 'condition'
  | 'loop'
  | 'group'
  // 其他
  | 'custom'

/**
 * 节点通用结构
 */
export interface Node<C = NodeConfig> {
  // 基础标识
  id: string
  type: NodeType

  // 显示信息
  label: string
  description?: string

  // 位置信息
  position: {
    x: number
    y: number
  }

  // 尺寸信息
  size?: {
    width: number
    height: number
  }

  // 端口定义
  ports: {
    input: Port[]
    output: Port[]
  }

  // 节点配置（泛型，根据type不同而不同）
  config: C

  // 元信息
  metadata: {
    color?: string
    icon?: string
    collapsed?: boolean
    tags?: string[]
  }

  // 运行时状态（只读）
  runtime?: {
    status: 'idle' | 'running' | 'completed' | 'failed'
    error?: string
    startedAt?: string
    completedAt?: string
  }

  // 审计信息
  createdAt: string
  updatedAt: string
}

/**
 * 端口定义
 */
export interface Port {
  id: string
  label?: string
  dataType?: {
    type: 'table' | 'json' | 'file' | 'stream' | 'any'
    schema?: DataSchema
  }
  multiple: boolean
  required: boolean
  position?: {
    side: 'top' | 'right' | 'bottom' | 'left'
    offset?: number
  }
}

/**
 * 数据Schema定义
 */
export interface DataSchema {
  type: 'object' | 'array'
  properties?: Record<string, DataColumn>
  items?: DataSchema
}

export interface DataColumn {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array'
  nullable?: boolean
  description?: string
  format?: string
}

// ============================================================================
// 具体节点配置类型
// ============================================================================

/**
 * 节点配置基类
 */
export type NodeConfig =
  | DatasetNodeConfig
  | SqlTransformNodeConfig
  | PythonTransformNodeConfig
  | FilterNodeConfig
  | JoinNodeConfig
  | DatabaseSourceNodeConfig
  | AggregateNodeConfig
  | UnionNodeConfig
  | DatasetOutputNodeConfig

/**
 * Dataset Node 配置
 */
export interface DatasetNodeConfig {
  datasetId: string
  datasetName: string
  source: {
    type: 'foundry' | 'external'
    path?: string
  }
  snapshot: {
    enabled: boolean
    type: 'latest' | 'specific' | 'transaction'
    value?: string
  }
  columns?: {
    mode: 'all' | 'include' | 'exclude'
    list?: string[]
  }
  schema?: DataSchema
}

/**
 * SQL Transform Node 配置
 */
export interface SqlTransformNodeConfig {
  sql: string
  dialect: 'standard' | 'spark' | 'postgres' | 'mysql'
  inputAliases: Record<string, string>
  outputSchema?: DataSchema
  validation?: {
    enabled: boolean
    checkSyntax: boolean
    checkSchema: boolean
  }
  hints?: string[]
}

/**
 * Python Transform Node 配置
 */
export interface PythonTransformNodeConfig {
  code: string
  runtime: {
    version: '3.8' | '3.9' | '3.10' | '3.11'
    requirements?: string[]
  }
  inputMappings: Record<string, string>
  outputVariable: string
  outputSchema?: DataSchema
  timeout?: number
  resources?: {
    memory?: string
    cpu?: string
  }
}

/**
 * Filter Node 配置
 */
export interface FilterNodeConfig {
  mode: 'simple' | 'advanced'
  conditions?: FilterCondition[]
  expression?: string
}

export interface FilterCondition {
  column: string
  operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with'
  value: any
  dataType?: 'string' | 'number' | 'boolean' | 'date'
}

/**
 * Join Node 配置
 */
export interface JoinNodeConfig {
  joinType: 'inner' | 'left' | 'right' | 'full' | 'cross'
  conditions: JoinCondition[]
  outputColumns?: {
    mode: 'all' | 'custom'
    columns?: ColumnMapping[]
  }
}

export interface JoinCondition {
  leftColumn: string
  rightColumn: string
  operator: '=' | '!=' | '>' | '>=' | '<' | '<='
}

export interface ColumnMapping {
  sourcePort: string
  sourceColumn: string
  outputName: string
}

/**
 * Aggregate Node 配置
 */
export interface AggregateNodeConfig {
  groupBy: string[]
  aggregations: Aggregation[]
}

export interface Aggregation {
  column: string
  function: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'first' | 'last'
  alias: string
}

/**
 * Union Node 配置
 */
export interface UnionNodeConfig {
  mode: 'all' | 'distinct'
  columnMapping?: 'position' | 'name'
}

/**
 * Database Source Node 配置
 */
export interface DatabaseSourceNodeConfig {
  connection: {
    id: string
    type: 'mysql' | 'postgresql' | 'oracle' | 'sqlserver' | 'mongodb'
  }
  query: {
    type: 'table' | 'sql' | 'stored_procedure'
    tableName?: string
    schema?: string
    sql?: string
    procedureName?: string
    parameters?: Record<string, any>
  }
  incremental?: {
    enabled: boolean
    column: string
    mode: 'append' | 'upsert'
    primaryKey?: string[]
  }
  schema?: DataSchema
}

/**
 * Dataset Output Node 配置
 */
export interface DatasetOutputNodeConfig {
  datasetId: string
  datasetName: string
  destination: {
    type: 'foundry' | 'external'
    path?: string
  }
  writeMode: 'overwrite' | 'append' | 'upsert'
  createIfNotExists: boolean
  primaryKey?: string[]
}

// ============================================================================
// Edge 类型定义
// ============================================================================

/**
 * 边（连接）数据结构
 */
export interface Edge {
  // 基础标识
  id: string

  // 连接信息
  source: {
    nodeId: string
    portId: string
  }
  target: {
    nodeId: string
    portId: string
  }

  // 显示信息
  label?: string

  // 样式信息
  style?: {
    type: 'solid' | 'dashed' | 'dotted'
    color?: string
    width?: number
    animated?: boolean
  }

  // 路由信息
  route?: {
    type: 'manhattan' | 'bezier' | 'straight' | 'custom'
    vertices?: { x: number; y: number }[]
  }

  // 数据流配置
  dataFlow?: {
    transform?: string
    validation?: {
      enabled: boolean
      schemaCheck: boolean
    }
  }

  // 审计信息
  createdAt: string
}

/**
 * 节点分组
 */
export interface NodeGroup {
  id: string
  label: string
  nodeIds: string[]
  collapsed: boolean
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  style?: {
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
  }
}

// ============================================================================
// API 响应类型
// ============================================================================

/**
 * 成功响应
 */
export interface SuccessResponse<T> {
  success: true
  data: T
  timestamp: string
  requestId: string
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    stack?: string
  }
  timestamp: string
  requestId: string
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  success: true
  data: {
    items: T[]
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
  }
  timestamp: string
  requestId: string
}

// ============================================================================
// 执行相关类型
// ============================================================================

/**
 * 执行记录
 */
export interface Execution {
  executionId: string
  pipelineId: string
  status: ExecutionStatus
  progress: number
  startedAt: string
  completedAt?: string
  stoppedAt?: string
  parameters?: Record<string, any>
  nodes: NodeExecution[]
}

export interface NodeExecution {
  nodeId: string
  status: ExecutionStatus
  startedAt?: string
  completedAt?: string
  error?: string
  metrics?: {
    rowsProcessed?: number
    bytesProcessed?: number
    duration?: number
  }
}

/**
 * 执行日志
 */
export interface ExecutionLog {
  timestamp: string
  level: 'debug' | 'info' | 'warning' | 'error'
  nodeId?: string
  message: string
  metadata?: Record<string, any>
}

/**
 * 性能指标
 */
export interface ExecutionMetrics {
  executionId: string
  nodeId?: string
  metrics: {
    cpuUsage: number
    memoryUsage: number
    rowsProcessed: number
    bytesProcessed?: number
  }
  timestamp: string
}

// ============================================================================
// 版本控制类型
// ============================================================================

/**
 * Pipeline版本
 */
export interface PipelineVersion {
  versionId: string
  pipelineId: string
  versionNumber: number
  tag?: string
  message: string
  pipelineData: Pipeline
  createdAt: string
  createdBy: string
}

// ============================================================================
// 数据预览类型
// ============================================================================

/**
 * 数据预览响应
 */
export interface DataPreview {
  schema: DataSchema
  rows: Record<string, any>[]
  totalRows: number
  truncated: boolean
}

// ============================================================================
// 验证相关类型
// ============================================================================

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings?: ValidationWarning[]
}

export interface ValidationError {
  field: string
  code: string
  message: string
}

export interface ValidationWarning {
  field: string
  code: string
  message: string
  suggestion?: string
}

// ============================================================================
// WebSocket 事件类型
// ============================================================================

/**
 * WebSocket事件映射
 */
export interface WebSocketEvents {
  // 服务端推送事件
  'execution:status': {
    executionId: string
    status: ExecutionStatus
    progress: number
    timestamp: string
  }

  'node:status': {
    executionId: string
    nodeId: string
    status: ExecutionStatus
    timestamp: string
  }

  'execution:log': ExecutionLog

  'execution:metrics': ExecutionMetrics

  'execution:error': {
    executionId: string
    nodeId?: string
    error: {
      code: string
      message: string
      stack?: string
    }
    timestamp: string
  }

  // 客户端发送事件
  'subscribe': {
    executionId: string
  }

  'unsubscribe': {
    executionId: string
  }
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 创建Pipeline请求
 */
export type CreatePipelineRequest = Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'execution'>

/**
 * 更新Pipeline请求
 */
export type UpdatePipelineRequest = Partial<Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'execution'>>

/**
 * 查询Pipeline参数
 */
export interface QueryPipelinesParams {
  page?: number
  pageSize?: number
  category?: string
  status?: PipelineMetadata['status']
  tags?: string[]
  search?: string
  sort?: string
}

/**
 * 执行Pipeline请求
 */
export interface ExecutePipelineRequest {
  parameters?: Record<string, any>
  environment?: Record<string, string>
}

/**
 * 类型守卫：检查是否是特定节点类型
 */
export function isNodeType<T extends NodeType>(node: Node, type: T): node is Node<Extract<NodeConfig, { type: T }>> {
  return node.type === type
}

/**
 * 类型守卫：检查节点配置类型
 */
export function isDatasetNode(node: Node): node is Node<DatasetNodeConfig> {
  return node.type === 'dataset'
}

export function isSqlTransformNode(node: Node): node is Node<SqlTransformNodeConfig> {
  return node.type === 'sql-transform'
}

export function isPythonTransformNode(node: Node): node is Node<PythonTransformNodeConfig> {
  return node.type === 'python-transform'
}

export function isFilterNode(node: Node): node is Node<FilterNodeConfig> {
  return node.type === 'filter'
}

export function isJoinNode(node: Node): node is Node<JoinNodeConfig> {
  return node.type === 'join'
}
