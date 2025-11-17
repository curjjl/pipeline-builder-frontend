/**
 * 结构化日志系统
 * 支持多级别日志、过滤、搜索和导出
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  id: string
  timestamp: number
  level: LogLevel
  message: string
  context?: Record<string, any>
  nodeId?: string
  nodeName?: string
  pipelineId?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private listeners: Array<(log: LogEntry) => void> = []

  // 添加日志
  log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      level,
      message,
      context
    }

    this.logs.push(entry)

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // 通知监听器
    this.listeners.forEach(listener => listener(entry))

    // 控制台输出
    this.consoleLog(entry)

    return entry
  }

  debug(message: string, context?: Record<string, any>) {
    return this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, any>) {
    return this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    return this.log('warn', message, context)
  }

  error(message: string, context?: Record<string, any>) {
    return this.log('error', message, context)
  }

  // 获取所有日志
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  // 按级别过滤
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  // 搜索日志
  search(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase()
    return this.logs.filter(log =>
      log.message.toLowerCase().includes(lowerQuery) ||
      log.nodeName?.toLowerCase().includes(lowerQuery) ||
      (log.context && JSON.stringify(log.context).toLowerCase().includes(lowerQuery))
    )
  }

  // 清除日志
  clear() {
    this.logs = []
  }

  // 导出日志
  export(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2)
    } else {
      // CSV format
      const headers = ['Timestamp', 'Level', 'Message', 'Node', 'Context']
      const rows = this.logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.level,
        log.message,
        log.nodeName || '',
        JSON.stringify(log.context || {})
      ])

      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
    }
  }

  // 添加监听器
  addListener(listener: (log: LogEntry) => void) {
    this.listeners.push(listener)
  }

  // 移除监听器
  removeListener(listener: (log: LogEntry) => void) {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  // 控制台输出
  private consoleLog(entry: LogEntry) {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`

    const style = this.getConsoleStyle(entry.level)

    if (entry.context) {
      console.log(`%c${prefix} ${entry.message}`, style, entry.context)
    } else {
      console.log(`%c${prefix} ${entry.message}`, style)
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      debug: 'color: #98A2B3',
      info: 'color: #2D6EED',
      warn: 'color: #F59E0B; font-weight: bold',
      error: 'color: #EF4444; font-weight: bold'
    }
    return styles[level]
  }
}

// 单例
export const logger = new Logger()

// 便捷导出
export default logger
