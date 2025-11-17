import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import logger, { type LogEntry, type LogLevel } from '../logger'

describe('Logger', () => {
  beforeEach(() => {
    // Clear logs before each test
    logger.clear()

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('log creation', () => {
    it('should create a debug log entry', () => {
      const entry = logger.debug('Test debug message')

      expect(entry).toBeDefined()
      expect(entry.level).toBe('debug')
      expect(entry.message).toBe('Test debug message')
      expect(entry.id).toMatch(/^log-/)
      expect(entry.timestamp).toBeTypeOf('number')
    })

    it('should create an info log entry', () => {
      const entry = logger.info('Test info message')

      expect(entry.level).toBe('info')
      expect(entry.message).toBe('Test info message')
    })

    it('should create a warn log entry', () => {
      const entry = logger.warn('Test warning message')

      expect(entry.level).toBe('warn')
      expect(entry.message).toBe('Test warning message')
    })

    it('should create an error log entry', () => {
      const entry = logger.error('Test error message')

      expect(entry.level).toBe('error')
      expect(entry.message).toBe('Test error message')
    })

    it('should include context when provided', () => {
      const context = { userId: 123, action: 'login' }
      const entry = logger.info('User logged in', context)

      expect(entry.context).toEqual(context)
    })

    it('should include node information when provided', () => {
      const entry = logger.log('info', 'Processing node', {
        nodeId: 'node-1',
        nodeName: 'Filter Transform'
      })

      expect(entry.context?.nodeId).toBe('node-1')
      expect(entry.context?.nodeName).toBe('Filter Transform')
    })
  })

  describe('log retrieval', () => {
    beforeEach(() => {
      logger.debug('Debug message')
      logger.info('Info message')
      logger.warn('Warning message')
      logger.error('Error message')
    })

    it('should retrieve all logs', () => {
      const logs = logger.getLogs()

      expect(logs).toHaveLength(4)
      expect(logs[0].level).toBe('debug')
      expect(logs[3].level).toBe('error')
    })

    it('should filter logs by level', () => {
      const debugLogs = logger.getLogsByLevel('debug')
      const errorLogs = logger.getLogsByLevel('error')

      expect(debugLogs).toHaveLength(1)
      expect(debugLogs[0].message).toBe('Debug message')

      expect(errorLogs).toHaveLength(1)
      expect(errorLogs[0].message).toBe('Error message')
    })

    it('should return empty array for non-existent level', () => {
      logger.clear()
      logger.info('Only info')

      const errorLogs = logger.getLogsByLevel('error')
      expect(errorLogs).toHaveLength(0)
    })
  })

  describe('log search', () => {
    beforeEach(() => {
      logger.clear()
      logger.info('Processing data')
      logger.warn('Data validation failed')
      logger.error('Connection timeout error')
    })

    it('should search logs by message content', () => {
      const results = logger.search('data')

      expect(results).toHaveLength(2)
      expect(results.some(log => log.message.includes('Processing data'))).toBe(true)
      expect(results.some(log => log.message.includes('validation failed'))).toBe(true)
    })

    it('should search case-insensitively', () => {
      const results = logger.search('DATA')

      expect(results).toHaveLength(2)
    })

    it('should search in node names', () => {
      logger.clear()
      logger.log('info', 'Node executed', { nodeName: 'Filter Transform' })
      logger.log('info', 'Node executed', { nodeName: 'Sort Transform' })

      const results = logger.search('filter')

      expect(results).toHaveLength(1)
      expect(results[0].context?.nodeName).toBe('Filter Transform')
    })

    it('should search in context', () => {
      logger.clear()
      logger.info('Operation completed', { operation: 'export', format: 'csv' })

      const results = logger.search('csv')

      expect(results).toHaveLength(1)
    })

    it('should return empty array when no matches', () => {
      const results = logger.search('nonexistent')

      expect(results).toHaveLength(0)
    })
  })

  describe('log management', () => {
    it('should clear all logs', () => {
      logger.info('Message 1')
      logger.info('Message 2')
      logger.info('Message 3')

      expect(logger.getLogs()).toHaveLength(3)

      logger.clear()

      expect(logger.getLogs()).toHaveLength(0)
    })

    it('should enforce max log limit', () => {
      // Create more than maxLogs (1000)
      for (let i = 0; i < 1100; i++) {
        logger.info(`Message ${i}`)
      }

      const logs = logger.getLogs()
      expect(logs.length).toBeLessThanOrEqual(1000)

      // Should keep the most recent logs
      const lastLog = logs[logs.length - 1]
      expect(lastLog.message).toBe('Message 1099')
    })
  })

  describe('log export', () => {
    beforeEach(() => {
      logger.info('First message', { key: 'value1' })
      logger.warn('Second message', { key: 'value2' })
    })

    it('should export logs as JSON', () => {
      const json = logger.export('json')

      expect(json).toBeTruthy()
      const parsed = JSON.parse(json)

      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toHaveLength(2)
      expect(parsed[0].message).toBe('First message')
      expect(parsed[1].message).toBe('Second message')
    })

    it('should export logs as CSV', () => {
      const csv = logger.export('csv')

      expect(csv).toBeTruthy()
      expect(csv).toContain('Timestamp,Level,Message,Node,Context')
      expect(csv).toContain('info')
      expect(csv).toContain('warn')
      expect(csv).toContain('First message')
      expect(csv).toContain('Second message')
    })

    it('should handle empty logs in export', () => {
      logger.clear()

      const json = logger.export('json')
      expect(JSON.parse(json)).toEqual([])

      const csv = logger.export('csv')
      expect(csv).toContain('Timestamp,Level,Message,Node,Context')
    })

    it('should properly escape CSV values', () => {
      logger.clear()
      logger.info('Message with "quotes" and, commas')

      const csv = logger.export('csv')
      expect(csv).toContain('"Message with "quotes" and, commas"')
    })
  })

  describe('log listeners', () => {
    it('should notify listeners when new log is created', () => {
      const listener = vi.fn()
      logger.addListener(listener)

      logger.info('Test message')

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: 'Test message'
        })
      )
    })

    it('should support multiple listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      logger.addListener(listener1)
      logger.addListener(listener2)

      logger.warn('Warning')

      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })

    it('should remove listeners', () => {
      const listener = vi.fn()

      logger.addListener(listener)
      logger.info('Before removal')

      logger.removeListener(listener)
      logger.info('After removal')

      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should handle removing non-existent listener', () => {
      const listener = vi.fn()

      expect(() => {
        logger.removeListener(listener)
      }).not.toThrow()
    })
  })

  describe('console output', () => {
    it('should log to console with correct format', () => {
      logger.info('Console test')

      expect(console.log).toHaveBeenCalled()
      const call = vi.mocked(console.log).mock.calls[0]

      expect(call[0]).toContain('[INFO]')
      expect(call[0]).toContain('Console test')
    })

    it('should log context to console when provided', () => {
      const context = { userId: 123 }
      logger.info('With context', context)

      expect(console.log).toHaveBeenCalled()
      const call = vi.mocked(console.log).mock.calls[0]

      expect(call[2]).toEqual(context)
    })
  })

  describe('unique log IDs', () => {
    it('should generate unique IDs for each log', () => {
      const log1 = logger.info('Message 1')
      const log2 = logger.info('Message 2')
      const log3 = logger.info('Message 3')

      expect(log1.id).not.toBe(log2.id)
      expect(log2.id).not.toBe(log3.id)
      expect(log1.id).not.toBe(log3.id)
    })

    it('should include timestamp in ID', () => {
      const log = logger.info('Test')

      expect(log.id).toMatch(/^log-\d+-/)
    })
  })

  describe('timestamp accuracy', () => {
    it('should use accurate timestamps', () => {
      const beforeTime = Date.now()
      const log = logger.info('Timestamp test')
      const afterTime = Date.now()

      expect(log.timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(log.timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('should have chronological timestamps', () => {
      const log1 = logger.info('First')
      const log2 = logger.info('Second')
      const log3 = logger.info('Third')

      expect(log2.timestamp).toBeGreaterThanOrEqual(log1.timestamp)
      expect(log3.timestamp).toBeGreaterThanOrEqual(log2.timestamp)
    })
  })
})
