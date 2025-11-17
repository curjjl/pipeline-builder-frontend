<template>
  <div class="log-viewer">
    <div class="log-header">
      <div class="header-left">
        <FileTextOutlined class="header-icon" />
        <span>Pipeline Logs</span>
        <a-tag :color="getLevelColor('all')">{{ logs.length }} total</a-tag>
      </div>
      <div class="header-right">
        <a-input-search
          v-model:value="searchQuery"
          placeholder="Search logs..."
          style="width: 200px"
          size="small"
          allow-clear
        />
        <a-button size="small" @click="exportLogs('json')">
          <DownloadOutlined /> Export
        </a-button>
        <a-button size="small" @click="clearLogs">
          <DeleteOutlined /> Clear
        </a-button>
      </div>
    </div>

    <div class="log-filters">
      <a-radio-group v-model:value="selectedLevel" size="small" button-style="solid">
        <a-radio-button value="all">All</a-radio-button>
        <a-radio-button value="debug">Debug</a-radio-button>
        <a-radio-button value="info">Info</a-radio-button>
        <a-radio-button value="warn">Warn</a-radio-button>
        <a-radio-button value="error">Error</a-radio-button>
      </a-radio-group>
    </div>

    <div class="log-list">
      <div
        v-for="log in filteredLogs"
        :key="log.id"
        class="log-entry"
        :class="`log-${log.level}`"
      >
        <div class="log-time">{{ formatTime(log.timestamp) }}</div>
        <a-tag :color="getLevelColor(log.level)" class="log-level">
          {{ log.level.toUpperCase() }}
        </a-tag>
        <div class="log-message">{{ log.message }}</div>
        <div v-if="log.nodeName" class="log-node">{{ log.nodeName }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { FileTextOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import logger, { type LogEntry, type LogLevel } from '@/utils/logger'

const logs = ref<LogEntry[]>([])
const searchQuery = ref('')
const selectedLevel = ref<LogLevel | 'all'>('all')

// 过滤日志
const filteredLogs = computed(() => {
  let result = logs.value

  // 按级别过滤
  if (selectedLevel.value !== 'all') {
    result = result.filter(log => log.level === selectedLevel.value)
  }

  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(log =>
      log.message.toLowerCase().includes(query) ||
      log.nodeName?.toLowerCase().includes(query)
    )
  }

  return result.reverse() // 最新的在前
})

// 格式化时间
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString()
}

// 获取级别颜色
function getLevelColor(level: LogLevel | 'all'): string {
  const colors: Record<string, string> = {
    all: 'default',
    debug: 'default',
    info: 'blue',
    warn: 'orange',
    error: 'red'
  }
  return colors[level] || 'default'
}

// 导出日志
function exportLogs(format: 'json' | 'csv' = 'json') {
  const content = logger.export(format)
  const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `pipeline-logs-${Date.now()}.${format}`
  link.click()
  URL.revokeObjectURL(url)
  message.success('Logs exported')
}

// 清除日志
function clearLogs() {
  logger.clear()
  logs.value = []
  message.success('Logs cleared')
}

// 日志监听器
function handleNewLog(log: LogEntry) {
  logs.value.push(log)
}

// 生命周期
onMounted(() => {
  logs.value = logger.getLogs()
  logger.addListener(handleNewLog)
})

onUnmounted(() => {
  logger.removeListener(handleNewLog)
})
</script>

<style scoped lang="less">
.log-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FFFFFF;
}

.log-header {
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

.log-filters {
  padding: 12px 16px;
  border-bottom: 1px solid #E4E7EB;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background: #FAFAFA;
}

.log-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #FFFFFF;
  border: 1px solid #E4E7EB;
  border-radius: 4px;
  margin-bottom: 6px;
  font-size: 12px;

  .log-time {
    font-family: Consolas, Monaco, monospace;
    color: #98A2B3;
    flex-shrink: 0;
  }

  .log-level {
    flex-shrink: 0;
  }

  .log-message {
    flex: 1;
    color: #212121;
  }

  .log-node {
    font-size: 11px;
    color: #5F6368;
    padding: 2px 8px;
    background: #F5F6F7;
    border-radius: 10px;
    flex-shrink: 0;
  }

  &.log-error {
    border-left: 3px solid #EF4444;
  }

  &.log-warn {
    border-left: 3px solid #F59E0B;
  }
}
</style>
