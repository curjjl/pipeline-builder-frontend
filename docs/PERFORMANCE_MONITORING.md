# Performance Monitoring Guide

## Overview

The Pipeline Builder includes a comprehensive performance monitoring system that tracks execution times, identifies bottlenecks, and helps optimize your data pipelines.

---

## Features

- ✅ **Automatic Tracking**: Pipeline and node execution times
- ✅ **Manual Instrumentation**: Track custom code sections
- ✅ **Statistics**: Min/max/average duration metrics
- ✅ **Export**: JSON and CSV export formats
- ✅ **Real-time Dashboard**: Visual performance metrics
- ✅ **Threshold Alerts**: Warnings for slow operations
- ✅ **Low Overhead**: Minimal performance impact

---

## Quick Start

### Basic Usage

```typescript
import performanceMonitor from '@/utils/performance'

// Start tracking
const metricId = performanceMonitor.start('My Operation', 'custom')

// ... perform operation ...

// End tracking
performanceMonitor.end(metricId)
```

### Measure Function

```typescript
// Synchronous function
const result = performanceMonitor.measure('Data Processing', 'transform', () => {
  // Your code here
  return processData(data)
})

// Async function
const result = await performanceMonitor.measureAsync('API Call', 'custom', async () => {
  return await fetchData()
})
```

### Using the Decorator

```typescript
import { measurePerformance } from '@/utils/performance'

class DataProcessor {
  @measurePerformance('Process Dataset', 'transform')
  async processDataset(data: any[]) {
    // Your processing logic
    return data.map(transform)
  }
}
```

---

## API Reference

### PerformanceMonitor

#### Methods

**start(name, type, metadata?): string**
- Start measuring performance
- Returns a unique metric ID
- Parameters:
  - `name`: Metric name
  - `type`: 'pipeline' | 'node' | 'transform' | 'render' | 'custom'
  - `metadata`: Optional additional data

**end(id, additionalMetadata?): PerformanceMetric | null**
- End performance measurement
- Returns completed metric
- Parameters:
  - `id`: Metric ID from start()
  - `additionalMetadata`: Optional extra data

**measure<T>(name, type, fn, metadata?): T**
- Measure synchronous function execution
- Returns function result

**measureAsync<T>(name, type, fn, metadata?): Promise<T>**
- Measure async function execution
- Returns promise with function result

**getStats(type?, name?): PerformanceStats | null**
- Get statistics for metrics
- Returns aggregate stats (total, avg, min, max)

**getMetrics(type?, limit?): PerformanceMetric[]**
- Get all completed metrics
- Optionally filter by type and limit count

**getRecentMetric(type?, name?): PerformanceMetric | null**
- Get most recent metric

**clear()**
- Clear all metrics

**export(format): string**
- Export metrics as JSON or CSV

**setEnabled(enabled)**
- Enable/disable monitoring

**formatDuration(ms): string**
- Format milliseconds as human-readable string

---

## Usage Examples

### Example 1: Track Pipeline Execution

```typescript
import performanceMonitor from '@/utils/performance'

async function runPipeline(pipeline: Pipeline) {
  const pipelineId = performanceMonitor.start('Full Pipeline', 'pipeline', {
    nodeCount: pipeline.nodes.length
  })

  try {
    for (const node of pipeline.nodes) {
      const nodeId = performanceMonitor.start(node.name, 'node', {
        nodeType: node.type
      })

      const result = await executeNode(node)

      performanceMonitor.end(nodeId, {
        rowsProcessed: result.length
      })
    }

    performanceMonitor.end(pipelineId, {
      success: true
    })
  } catch (error) {
    performanceMonitor.end(pipelineId, {
      success: false,
      error: error.message
    })
    throw error
  }
}
```

### Example 2: Transform Performance

```typescript
function applyTransform(data: any[], transform: Transform) {
  return performanceMonitor.measure(
    `Transform: ${transform.type}`,
    'transform',
    () => {
      switch (transform.type) {
        case 'filter':
          return filterData(data, transform.config)
        case 'sort':
          return sortData(data, transform.config)
        // ... more cases
      }
    },
    {
      transformType: transform.type,
      inputRows: data.length
    }
  )
}
```

### Example 3: Check Performance Threshold

```typescript
const metricId = performanceMonitor.start('Heavy Operation', 'custom')

await performHeavyOperation()

performanceMonitor.end(metricId)

// Warn if operation took longer than 1 second
performanceMonitor.checkThreshold(metricId, 1000, (metric) => {
  console.warn(`Operation ${metric.name} was slow!`)
  // Send alert, log to server, etc.
})
```

### Example 4: Get Statistics

```typescript
// Get pipeline execution stats
const pipelineStats = performanceMonitor.getStats('pipeline')
if (pipelineStats) {
  console.log(`Average pipeline time: ${pipelineStats.averageDuration}ms`)
  console.log(`Slowest pipeline: ${pipelineStats.maxDuration}ms`)
  console.log(`Total executions: ${pipelineStats.totalExecutions}`)
}

// Get stats for specific operation
const filterStats = performanceMonitor.getStats('transform', 'Filter')
```

### Example 5: Export Metrics

```typescript
// Export as JSON
const jsonData = performanceMonitor.export('json')
console.log(jsonData)

// Export as CSV for spreadsheet analysis
const csvData = performanceMonitor.export('csv')
downloadFile(csvData, 'performance-report.csv')
```

---

## Performance Dashboard

### Using the Dashboard Component

```vue
<template>
  <a-tabs>
    <a-tab-pane key="data" tab="Data">
      <!-- Your data view -->
    </a-tab-pane>
    <a-tab-pane key="performance" tab="Performance">
      <PerformanceDashboard />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
import PerformanceDashboard from '@/components/common/PerformanceDashboard.vue'
</script>
```

### Dashboard Features

- **Summary Cards**: Quick overview of each metric type
- **Recent Metrics Table**: Last 50 measurements
- **Real-time Updates**: Auto-refresh every 5 seconds
- **Export Button**: Download metrics as JSON
- **Clear Button**: Reset all metrics
- **ON/OFF Toggle**: Enable/disable monitoring

---

## Best Practices

### 1. Use Appropriate Metric Types

```typescript
// Good: Use semantic types
performanceMonitor.start('Pipeline Execution', 'pipeline')
performanceMonitor.start('Filter Transform', 'transform')
performanceMonitor.start('Node Render', 'render')

// Avoid: Using 'custom' for everything
performanceMonitor.start('Some Operation', 'custom') // Less useful for analysis
```

### 2. Add Meaningful Metadata

```typescript
// Good: Include context
performanceMonitor.start('Process Data', 'transform', {
  transformType: 'filter',
  inputRows: 10000,
  conditions: 3
})

// Limited: No context
performanceMonitor.start('Process Data', 'transform')
```

### 3. Always End Measurements

```typescript
// Good: Always end, even on error
const id = performanceMonitor.start('Operation', 'custom')
try {
  await doWork()
  performanceMonitor.end(id, { success: true })
} catch (error) {
  performanceMonitor.end(id, { success: false, error: error.message })
  throw error
}

// Bad: May not end on error
const id = performanceMonitor.start('Operation', 'custom')
await doWork()
performanceMonitor.end(id) // Never called if doWork() throws
```

### 4. Use measure() for Simple Cases

```typescript
// Good: Clean and safe
const result = performanceMonitor.measure('Operation', 'custom', () => {
  return doWork()
})

// Verbose: Manual start/end
const id = performanceMonitor.start('Operation', 'custom')
const result = doWork()
performanceMonitor.end(id)
```

### 5. Monitor Critical Paths

```typescript
// Focus on operations that impact user experience
performanceMonitor.start('Initial Data Load', 'pipeline') // Critical
performanceMonitor.start('Transform Execution', 'transform') // Critical
performanceMonitor.start('UI Render', 'render') // Critical

// Don't over-instrument trivial operations
// ❌ performanceMonitor.start('Set Variable', 'custom')
// ❌ performanceMonitor.start('Log Message', 'custom')
```

---

## Performance Optimization Tips

### Identify Slow Transforms

```typescript
const stats = performanceMonitor.getStats('transform')
if (stats && stats.maxDuration > 5000) {
  console.warn('Some transforms are taking > 5 seconds')

  // Get detailed metrics
  const slowTransforms = performanceMonitor
    .getMetrics('transform')
    .filter(m => m.duration > 5000)

  console.table(slowTransforms)
}
```

### Track Row Processing Speed

```typescript
const id = performanceMonitor.start('Filter', 'transform', {
  inputRows: data.length
})

const result = filterData(data)

const metric = performanceMonitor.end(id, {
  outputRows: result.length
})

if (metric) {
  const rowsPerSecond = (data.length / metric.duration) * 1000
  console.log(`Processing speed: ${rowsPerSecond.toFixed(0)} rows/sec`)
}
```

### Monitor Memory Impact

```typescript
if (performance.memory) {
  const beforeMemory = performance.memory.usedJSHeapSize

  const id = performanceMonitor.start('Heavy Operation', 'custom')
  await heavyOperation()
  performanceMonitor.end(id)

  const afterMemory = performance.memory.usedJSHeapSize
  const memoryIncrease = (afterMemory - beforeMemory) / 1024 / 1024

  console.log(`Memory increased by ${memoryIncrease.toFixed(2)} MB`)
}
```

---

## Troubleshooting

### Issue: Metrics Not Appearing

**Solution**: Check if monitoring is enabled
```typescript
if (!performanceMonitor.isEnabled()) {
  performanceMonitor.setEnabled(true)
}
```

### Issue: Too Many Metrics

**Solution**: The system auto-limits to 1000 metrics. Older metrics are automatically removed.

```typescript
// Manually clear if needed
performanceMonitor.clear()
```

### Issue: Performance Impact

The monitoring system has minimal overhead (~0.1ms per measurement), but if you need to disable it:

```typescript
// Disable in production
if (import.meta.env.PROD) {
  performanceMonitor.setEnabled(false)
}
```

---

## Advanced Usage

### Custom Metric Analysis

```typescript
// Get all metrics
const allMetrics = performanceMonitor.getMetrics()

// Find outliers (> 2 standard deviations)
const durations = allMetrics.map(m => m.duration || 0)
const avg = durations.reduce((a, b) => a + b, 0) / durations.length
const stdDev = Math.sqrt(
  durations.map(d => Math.pow(d - avg, 2)).reduce((a, b) => a + b, 0) / durations.length
)

const outliers = allMetrics.filter(m =>
  m.duration && Math.abs(m.duration - avg) > 2 * stdDev
)

console.log('Performance outliers:', outliers)
```

### Export to Monitoring Service

```typescript
// Send metrics to backend
async function sendMetricsToServer() {
  const metrics = performanceMonitor.getMetrics()

  await fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timestamp: Date.now(),
      metrics: metrics,
      summary: performanceMonitor.getSummary()
    })
  })

  performanceMonitor.clear()
}

// Send every 5 minutes
setInterval(sendMetricsToServer, 5 * 60 * 1000)
```

---

## See Also

- [User Guide](./USER_GUIDE.md) - General application usage
- [Testing Plan](./TESTING_PLAN.md) - Test performance benchmarks
- [Pull Request](../PULL_REQUEST.md) - Feature overview

---

**Last Updated**: 2024
