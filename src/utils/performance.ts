/**
 * 性能监控工具
 * 用于跟踪和分析应用性能
 */

export interface PerformanceMetric {
  id: string
  name: string
  type: 'pipeline' | 'node' | 'transform' | 'render' | 'custom'
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

export interface PerformanceStats {
  totalExecutions: number
  averageDuration: number
  minDuration: number
  maxDuration: number
  lastDuration: number
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private completedMetrics: PerformanceMetric[] = []
  private maxMetrics = 1000 // 最多保留1000条记录
  private enabled = true

  /**
   * 开始性能测量
   */
  start(name: string, type: PerformanceMetric['type'], metadata?: Record<string, any>): string {
    if (!this.enabled) return ''

    const id = `${type}-${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const metric: PerformanceMetric = {
      id,
      name,
      type,
      startTime: performance.now(),
      metadata
    }

    this.metrics.set(id, metric)
    return id
  }

  /**
   * 结束性能测量
   */
  end(id: string, additionalMetadata?: Record<string, any>): PerformanceMetric | null {
    if (!this.enabled || !id) return null

    const metric = this.metrics.get(id)
    if (!metric) {
      console.warn(`[Performance] Metric not found: ${id}`)
      return null
    }

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata }
    }

    // 移动到已完成列表
    this.metrics.delete(id)
    this.completedMetrics.push(metric)

    // 限制数量
    if (this.completedMetrics.length > this.maxMetrics) {
      this.completedMetrics = this.completedMetrics.slice(-this.maxMetrics)
    }

    return metric
  }

  /**
   * 测量同步函数执行时间
   */
  measure<T>(name: string, type: PerformanceMetric['type'], fn: () => T, metadata?: Record<string, any>): T {
    const id = this.start(name, type, metadata)
    try {
      const result = fn()
      this.end(id)
      return result
    } catch (error) {
      this.end(id, { error: true })
      throw error
    }
  }

  /**
   * 测量异步函数执行时间
   */
  async measureAsync<T>(
    name: string,
    type: PerformanceMetric['type'],
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const id = this.start(name, type, metadata)
    try {
      const result = await fn()
      this.end(id)
      return result
    } catch (error) {
      this.end(id, { error: true })
      throw error
    }
  }

  /**
   * 获取指定类型的统计信息
   */
  getStats(type?: PerformanceMetric['type'], name?: string): PerformanceStats | null {
    let metrics = this.completedMetrics

    if (type) {
      metrics = metrics.filter(m => m.type === type)
    }

    if (name) {
      metrics = metrics.filter(m => m.name === name)
    }

    if (metrics.length === 0) return null

    const durations = metrics.map(m => m.duration || 0)
    const totalExecutions = metrics.length
    const totalDuration = durations.reduce((sum, d) => sum + d, 0)
    const averageDuration = totalDuration / totalExecutions
    const minDuration = Math.min(...durations)
    const maxDuration = Math.max(...durations)
    const lastDuration = durations[durations.length - 1]

    return {
      totalExecutions,
      averageDuration,
      minDuration,
      maxDuration,
      lastDuration
    }
  }

  /**
   * 获取所有已完成的指标
   */
  getMetrics(type?: PerformanceMetric['type'], limit?: number): PerformanceMetric[] {
    let metrics = [...this.completedMetrics]

    if (type) {
      metrics = metrics.filter(m => m.type === type)
    }

    if (limit) {
      metrics = metrics.slice(-limit)
    }

    return metrics
  }

  /**
   * 获取最近的指标
   */
  getRecentMetric(type?: PerformanceMetric['type'], name?: string): PerformanceMetric | null {
    const metrics = this.getMetrics(type).filter(m => !name || m.name === name)
    return metrics.length > 0 ? metrics[metrics.length - 1] : null
  }

  /**
   * 获取正在进行的测量
   */
  getActiveMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  /**
   * 清除所有指标
   */
  clear() {
    this.metrics.clear()
    this.completedMetrics = []
  }

  /**
   * 导出性能报告
   */
  export(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        timestamp: new Date().toISOString(),
        metrics: this.completedMetrics,
        summary: {
          pipeline: this.getStats('pipeline'),
          node: this.getStats('node'),
          transform: this.getStats('transform'),
          render: this.getStats('render'),
          custom: this.getStats('custom')
        }
      }, null, 2)
    } else {
      // CSV format
      const headers = ['Timestamp', 'Type', 'Name', 'Duration (ms)', 'Metadata']
      const rows = this.completedMetrics.map(m => [
        new Date(m.startTime).toISOString(),
        m.type,
        m.name,
        (m.duration || 0).toFixed(2),
        JSON.stringify(m.metadata || {})
      ])

      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
    }
  }

  /**
   * 启用/禁用性能监控
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * 获取性能摘要
   */
  getSummary(): Record<string, PerformanceStats | null> {
    return {
      pipeline: this.getStats('pipeline'),
      node: this.getStats('node'),
      transform: this.getStats('transform'),
      render: this.getStats('render'),
      custom: this.getStats('custom')
    }
  }

  /**
   * 格式化持续时间
   */
  formatDuration(ms: number): string {
    if (ms < 1) return `${ms.toFixed(2)}ms`
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
    return `${Math.floor(ms / 60000)}m ${((ms % 60000) / 1000).toFixed(0)}s`
  }

  /**
   * 记录性能警告（超过阈值）
   */
  checkThreshold(metricId: string, thresholdMs: number, callback?: (metric: PerformanceMetric) => void) {
    const metric = this.metrics.get(metricId)
    if (!metric || !metric.endTime) return

    if (metric.duration && metric.duration > thresholdMs) {
      console.warn(
        `[Performance Warning] ${metric.name} took ${this.formatDuration(metric.duration)} ` +
        `(threshold: ${this.formatDuration(thresholdMs)})`
      )

      if (callback) {
        callback(metric)
      }
    }
  }
}

// 单例
export const performanceMonitor = new PerformanceMonitor()

// 便捷方法
export default performanceMonitor

/**
 * 装饰器：自动测量函数性能
 */
export function measurePerformance(name: string, type: PerformanceMetric['type'] = 'custom') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const metricName = name || `${target.constructor.name}.${propertyKey}`
      return await performanceMonitor.measureAsync(metricName, type, () => originalMethod.apply(this, args))
    }

    return descriptor
  }
}

/**
 * 工具函数：测量代码块性能
 */
export async function withPerformanceTracking<T>(
  name: string,
  type: PerformanceMetric['type'],
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceMonitor.measureAsync(name, type, fn, metadata)
}
