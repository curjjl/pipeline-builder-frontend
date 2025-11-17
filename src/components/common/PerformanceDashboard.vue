<template>
  <div class="performance-dashboard">
    <div class="dashboard-header">
      <div class="header-left">
        <DashboardOutlined class="header-icon" />
        <span>Performance Metrics</span>
        <a-switch
          v-model:checked="monitoringEnabled"
          size="small"
          @change="toggleMonitoring"
        >
          <template #checkedChildren>ON</template>
          <template #uncheckedChildren>OFF</template>
        </a-switch>
      </div>
      <div class="header-right">
        <a-button size="small" @click="refreshMetrics">
          <ReloadOutlined /> Refresh
        </a-button>
        <a-button size="small" @click="exportMetrics">
          <DownloadOutlined /> Export
        </a-button>
        <a-button size="small" @click="clearMetrics">
          <DeleteOutlined /> Clear
        </a-button>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div v-for="(stats, type) in summary" :key="type" class="metric-card">
          <div class="card-header">
            <component :is="getTypeIcon(type)" class="type-icon" />
            <span class="type-name">{{ formatTypeName(type) }}</span>
          </div>
          <div v-if="stats" class="card-stats">
            <div class="stat-item">
              <span class="stat-label">Total</span>
              <span class="stat-value">{{ stats.totalExecutions }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Avg</span>
              <span class="stat-value">{{ formatDuration(stats.averageDuration) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Min</span>
              <span class="stat-value">{{ formatDuration(stats.minDuration) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Max</span>
              <span class="stat-value">{{ formatDuration(stats.maxDuration) }}</span>
            </div>
          </div>
          <div v-else class="card-empty">
            No data
          </div>
        </div>
      </div>

      <!-- Recent Metrics Table -->
      <div class="recent-metrics">
        <h4>Recent Measurements</h4>
        <a-table
          :dataSource="recentMetrics"
          :columns="tableColumns"
          :pagination="{ pageSize: 10 }"
          size="small"
          :scroll="{ x: 800 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <a-tag :color="getTypeColor(record.type)">
                {{ record.type }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'duration'">
              <span :class="getDurationClass(record.duration)">
                {{ formatDuration(record.duration) }}
              </span>
            </template>
            <template v-else-if="column.key === 'timestamp'">
              {{ formatTimestamp(record.startTime) }}
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  DashboardOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  NodeIndexOutlined,
  FunctionOutlined,
  BgColorsOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue'
import performanceMonitor, { type PerformanceMetric, type PerformanceStats } from '@/utils/performance'

const monitoringEnabled = ref(true)
const recentMetrics = ref<PerformanceMetric[]>([])
const summary = ref<Record<string, PerformanceStats | null>>({})

const tableColumns = [
  { title: 'Time', key: 'timestamp', width: 120 },
  { title: 'Type', key: 'type', width: 100 },
  { title: 'Name', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: 'Duration', key: 'duration', width: 120, sorter: (a: any, b: any) => a.duration - b.duration }
]

// 刷新指标
function refreshMetrics() {
  recentMetrics.value = performanceMonitor.getMetrics(undefined, 50)
  summary.value = performanceMonitor.getSummary()
}

// 切换监控
function toggleMonitoring(enabled: boolean) {
  performanceMonitor.setEnabled(enabled)
  message.success(enabled ? 'Performance monitoring enabled' : 'Performance monitoring disabled')
}

// 导出指标
function exportMetrics() {
  const json = performanceMonitor.export('json')
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `performance-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
  message.success('Performance metrics exported')
}

// 清除指标
function clearMetrics() {
  performanceMonitor.clear()
  refreshMetrics()
  message.success('Performance metrics cleared')
}

// 格式化类型名称
function formatTypeName(type: string): string {
  const names: Record<string, string> = {
    pipeline: 'Pipeline',
    node: 'Node',
    transform: 'Transform',
    render: 'Render',
    custom: 'Custom'
  }
  return names[type] || type
}

// 获取类型图标
function getTypeIcon(type: string) {
  const icons: Record<string, any> = {
    pipeline: ThunderboltOutlined,
    node: NodeIndexOutlined,
    transform: FunctionOutlined,
    render: BgColorsOutlined,
    custom: AppstoreOutlined
  }
  return icons[type] || AppstoreOutlined
}

// 获取类型颜色
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    pipeline: 'blue',
    node: 'green',
    transform: 'purple',
    render: 'orange',
    custom: 'default'
  }
  return colors[type] || 'default'
}

// 格式化持续时间
function formatDuration(ms: number | undefined): string {
  if (ms === undefined) return 'N/A'
  return performanceMonitor.formatDuration(ms)
}

// 获取持续时间类名
function getDurationClass(ms: number | undefined): string {
  if (ms === undefined) return ''
  if (ms < 100) return 'duration-fast'
  if (ms < 1000) return 'duration-normal'
  return 'duration-slow'
}

// 格式化时间戳
function formatTimestamp(startTime: number): string {
  return new Date(startTime).toLocaleTimeString()
}

// 自动刷新
let refreshInterval: number

onMounted(() => {
  refreshMetrics()
  monitoringEnabled.value = performanceMonitor.isEnabled()

  // 每5秒刷新一次
  refreshInterval = window.setInterval(() => {
    refreshMetrics()
  }, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped lang="less">
.performance-dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FFFFFF;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #E4E7EB;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-icon {
      font-size: 16px;
      color: #2D6EED;
    }

    span {
      font-size: 14px;
      font-weight: 600;
      color: #212121;
    }
  }

  .header-right {
    display: flex;
    gap: 8px;
  }
}

.dashboard-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: #F5F6F7;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #E4E7EB;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .type-icon {
      font-size: 16px;
      color: #2D6EED;
    }

    .type-name {
      font-size: 13px;
      font-weight: 600;
      color: #212121;
    }
  }

  .card-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .stat-label {
        font-size: 11px;
        color: #98A2B3;
        text-transform: uppercase;
      }

      .stat-value {
        font-size: 13px;
        font-weight: 600;
        color: #212121;
        font-family: Consolas, Monaco, monospace;
      }
    }
  }

  .card-empty {
    font-size: 12px;
    color: #98A2B3;
    text-align: center;
    padding: 12px 0;
  }
}

.recent-metrics {
  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #212121;
    margin-bottom: 12px;
  }

  :deep(.ant-table) {
    font-size: 12px;

    .duration-fast {
      color: #10B981;
      font-weight: 600;
    }

    .duration-normal {
      color: #F59E0B;
      font-weight: 600;
    }

    .duration-slow {
      color: #EF4444;
      font-weight: 600;
    }
  }
}
</style>
