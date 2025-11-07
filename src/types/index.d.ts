// 通用类型定义

export interface BaseResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResponse<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// Pipeline 相关类型
export interface Pipeline {
  id: string
  name: string
  description?: string
  nodes: Node[]
  edges: Edge[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Node {
  id: string
  type: string
  label: string
  x: number
  y: number
  data: Record<string, any>
}

export interface Edge {
  id: string
  source: string
  target: string
  sourcePort?: string
  targetPort?: string
}

// 执行相关类型
export interface Execution {
  id: string
  pipelineId: string
  status: ExecutionStatus
  startTime: string
  endTime?: string
  totalTasks: number
  completedTasks: number
  failedTasks: number
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped'

export interface ExecutionLog {
  id: string
  level: LogLevel
  message: string
  timestamp: string
}

export type LogLevel = 'debug' | 'info' | 'warning' | 'error'

// 用户相关类型
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: UserRole
}

export type UserRole = 'admin' | 'developer' | 'viewer'
