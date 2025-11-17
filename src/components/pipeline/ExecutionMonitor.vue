<template>
  <transition name="slide-up">
    <div v-if="isVisible" class="execution-monitor">
      <div class="monitor-header">
        <div class="header-left">
          <component
            :is="getStatusIcon()"
            :class="['status-icon', statusClass]"
            :spin="executionStatus === 'running'"
          />
          <span class="monitor-title">{{ title }}</span>
        </div>
        <div class="header-right">
          <span class="execution-time">{{ formattedDuration }}</span>
          <a-button
            type="text"
            size="small"
            @click="toggleExpanded"
            class="expand-btn"
          >
            <DownOutlined v-if="!isExpanded" />
            <UpOutlined v-else />
          </a-button>
          <a-button
            type="text"
            size="small"
            @click="handleClose"
            class="close-btn"
          >
            <CloseOutlined />
          </a-button>
        </div>
      </div>

      <!-- 整体进度条 -->
      <div v-if="executionStatus === 'running'" class="progress-section">
        <a-progress
          :percent="overallProgress"
          :status="progressStatus"
          :strokeColor="{
            '0%': '#2D6EED',
            '100%': '#10B981'
          }"
          :show-info="true"
        />
        <div class="progress-info">
          {{ completedNodes }} / {{ totalNodes }} nodes completed
        </div>
      </div>

      <!-- 展开的节点列表 -->
      <transition name="expand">
        <div v-if="isExpanded" class="nodes-section">
          <div
            v-for="node in nodeExecutions"
            :key="node.id"
            class="node-item"
            :class="node.status"
          >
            <div class="node-info">
              <component :is="getNodeStatusIcon(node.status)" class="node-status-icon" />
              <span class="node-name">{{ node.name }}</span>
            </div>
            <div class="node-meta">
              <span v-if="node.duration" class="node-duration">
                {{ formatDuration(node.duration) }}
              </span>
              <a-tag
                v-if="node.rows !== undefined"
                size="small"
                :color="node.status === 'success' ? 'green' : 'default'"
              >
                {{ node.rows }} rows
              </a-tag>
            </div>
          </div>
        </div>
      </transition>

      <!-- 错误信息 -->
      <div v-if="error" class="error-section">
        <a-alert
          type="error"
          :message="error.title"
          :description="error.message"
          show-icon
          closable
          @close="clearError"
        />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DownOutlined,
  UpOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  MinusCircleOutlined
} from '@ant-design/icons-vue'

interface NodeExecution {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  duration?: number
  rows?: number
  error?: string
}

interface ExecutionError {
  title: string
  message: string
  nodeId?: string
}

interface Props {
  visible?: boolean
  status?: 'idle' | 'running' | 'success' | 'error'
  nodeExecutions?: NodeExecution[]
  startTime?: number
  endTime?: number
  error?: ExecutionError | null
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  status: 'idle',
  nodeExecutions: () => [],
  startTime: 0,
  endTime: 0,
  error: null
})

const emit = defineEmits<{
  close: []
  'clear-error': []
}>()

const isExpanded = ref(false)
const currentTime = ref(Date.now())

// 定时更新当前时间
let timer: number
watch(() => props.status, (newStatus) => {
  if (newStatus === 'running') {
    timer = window.setInterval(() => {
      currentTime.value = Date.now()
    }, 100)
  } else {
    if (timer) {
      clearInterval(timer)
    }
  }
}, { immediate: true })

// 是否可见
const isVisible = computed(() => props.visible)

// 执行状态
const executionStatus = computed(() => props.status)

// 标题
const title = computed(() => {
  switch (props.status) {
    case 'running':
      return 'Executing Pipeline...'
    case 'success':
      return 'Pipeline Completed Successfully'
    case 'error':
      return 'Pipeline Execution Failed'
    default:
      return 'Pipeline Execution'
  }
})

// 状态类
const statusClass = computed(() => {
  return `status-${props.status}`
})

// 总节点数
const totalNodes = computed(() => props.nodeExecutions.length)

// 已完成节点数
const completedNodes = computed(() => {
  return props.nodeExecutions.filter(n =>
    n.status === 'success' || n.status === 'error'
  ).length
})

// 整体进度
const overallProgress = computed(() => {
  if (totalNodes.value === 0) return 0
  return Math.round((completedNodes.value / totalNodes.value) * 100)
})

// 进度状态
const progressStatus = computed(() => {
  if (props.status === 'error') return 'exception'
  if (props.status === 'success') return 'success'
  return 'active'
})

// 执行时长
const duration = computed(() => {
  if (!props.startTime) return 0
  const endTime = props.endTime || currentTime.value
  return endTime - props.startTime
})

// 格式化时长
const formattedDuration = computed(() => {
  return formatDuration(duration.value)
})

// 格式化时长函数
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${seconds}s`
}

// 获取状态图标
function getStatusIcon() {
  switch (props.status) {
    case 'running':
      return LoadingOutlined
    case 'success':
      return CheckCircleOutlined
    case 'error':
      return CloseCircleOutlined
    default:
      return ClockCircleOutlined
  }
}

// 获取节点状态图标
function getNodeStatusIcon(status: NodeExecution['status']) {
  switch (status) {
    case 'pending':
      return MinusCircleOutlined
    case 'running':
      return PlayCircleOutlined
    case 'success':
      return CheckCircleOutlined
    case 'error':
      return CloseCircleOutlined
    default:
      return MinusCircleOutlined
  }
}

// 切换展开状态
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

// 关闭监控器
function handleClose() {
  emit('close')
}

// 清除错误
function clearError() {
  emit('clear-error')
}
</script>

<style scoped lang="less">
.execution-monitor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 420px;
  background: #FFFFFF;
  border: 1px solid #E4E7EB;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.monitor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #F5F6F7;
  border-bottom: 1px solid #E4E7EB;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .status-icon {
      font-size: 18px;

      &.status-running {
        color: #2D6EED;
      }

      &.status-success {
        color: #10B981;
      }

      &.status-error {
        color: #EF4444;
      }

      &.status-idle {
        color: #98A2B3;
      }
    }

    .monitor-title {
      font-size: 14px;
      font-weight: 600;
      color: #212121;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;

    .execution-time {
      font-size: 12px;
      font-family: Consolas, Monaco, monospace;
      color: #5F6368;
      padding: 2px 8px;
      background: #FFFFFF;
      border-radius: 4px;
    }

    .expand-btn,
    .close-btn {
      color: #5F6368;

      &:hover {
        color: #2D6EED;
      }
    }
  }
}

.progress-section {
  padding: 16px;
  background: #FFFFFF;

  .progress-info {
    margin-top: 8px;
    font-size: 12px;
    color: #5F6368;
    text-align: center;
  }
}

.nodes-section {
  max-height: 300px;
  overflow-y: auto;
  background: #FAFAFA;
  border-top: 1px solid #E4E7EB;
}

.node-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #E4E7EB;
  transition: background 0.2s;

  &:hover {
    background: #F5F6F7;
  }

  &:last-child {
    border-bottom: none;
  }

  .node-info {
    display: flex;
    align-items: center;
    gap: 10px;

    .node-status-icon {
      font-size: 14px;
    }

    .node-name {
      font-size: 13px;
      color: #212121;
    }
  }

  .node-meta {
    display: flex;
    align-items: center;
    gap: 8px;

    .node-duration {
      font-size: 11px;
      font-family: Consolas, Monaco, monospace;
      color: #98A2B3;
    }
  }

  &.pending {
    .node-status-icon {
      color: #98A2B3;
    }
  }

  &.running {
    background: #E8F0FE;

    .node-status-icon {
      color: #2D6EED;
    }
  }

  &.success {
    .node-status-icon {
      color: #10B981;
    }
  }

  &.error {
    background: #FEE2E2;

    .node-status-icon {
      color: #EF4444;
    }
  }
}

.error-section {
  padding: 12px 16px;
  background: #FFFFFF;
  border-top: 1px solid #E4E7EB;
}

// 动画
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
