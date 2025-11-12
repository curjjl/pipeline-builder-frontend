<template>
  <div class="join-panel">
    <div class="panel-header">
      <div class="header-left">
        <h3>Join Configuration</h3>
        <a-tag v-if="isConfigured" color="success">Applied</a-tag>
        <a-tag v-else color="default">Not configured</a-tag>
      </div>
      <a-button type="text" @click="handleClose">
        <CloseOutlined />
      </a-button>
    </div>

    <div class="panel-content">
      <!-- Join Type Selection -->
      <div class="form-section">
        <label class="required">Join type</label>
        <a-radio-group v-model:value="config.type" @change="handleConfigChange">
          <a-radio value="inner">Inner join</a-radio>
          <a-radio value="left">Left join</a-radio>
          <a-radio value="right">Right join</a-radio>
          <a-radio value="outer">Full outer join</a-radio>
        </a-radio-group>
        <div class="help-text">
          {{ joinTypeDescription }}
        </div>
      </div>

      <!-- Input Tables -->
      <div class="form-section">
        <div class="section-header-with-action">
          <label>Input tables</label>
          <a-button type="link" size="small" @click="handleSwapTables">
            <SwapOutlined /> Swap
          </a-button>
        </div>
        <div class="input-tables">
          <div class="table-info">
            <DatabaseOutlined />
            <span>{{ leftTableName }}</span>
          </div>
          <div class="table-info">
            <DatabaseOutlined />
            <span>{{ rightTableName }}</span>
          </div>
        </div>
      </div>

      <!-- Match Conditions -->
      <div class="form-section">
        <label class="required">Match condition</label>
        <div class="match-conditions">
          <div
            v-for="(condition, index) in config.matchConditions"
            :key="index"
            class="match-condition"
          >
            <a-select
              v-model:value="condition.leftColumn"
              placeholder="Select left column"
              style="flex: 1"
              @change="handleConfigChange"
            >
              <a-select-option
                v-for="col in leftColumns"
                :key="col.name"
                :value="col.name"
              >
                {{ col.name }}
              </a-select-option>
            </a-select>

            <span class="operator">is equal to</span>

            <a-select
              v-model:value="condition.rightColumn"
              placeholder="Select right column"
              style="flex: 1"
              @change="handleConfigChange"
            >
              <a-select-option
                v-for="col in rightColumns"
                :key="col.name"
                :value="col.name"
              >
                {{ col.name }}
              </a-select-option>
            </a-select>

            <a-button
              v-if="config.matchConditions.length > 1"
              type="text"
              danger
              @click="removeMatchCondition(index)"
            >
              <DeleteOutlined />
            </a-button>
          </div>
        </div>

        <a-button
          type="link"
          class="add-condition-btn"
          @click="addMatchCondition"
        >
          <PlusCircleOutlined /> Add match condition
        </a-button>
      </div>

      <!-- Advanced Options Toggle -->
      <div class="advanced-toggle">
        <a-button type="link" @click="showAdvanced = !showAdvanced">
          {{ showAdvanced ? 'Hide advanced' : 'Show advanced' }}
          <DownOutlined v-if="!showAdvanced" />
          <UpOutlined v-else />
        </a-button>
      </div>

      <!-- Advanced Options -->
      <div v-if="showAdvanced" class="advanced-options">
        <!-- Column Prefixes -->
        <div class="form-section">
          <div class="prefix-section">
            <div class="prefix-column">
              <div class="prefix-header">
                <label>{{ leftTableName }}</label>
              </div>
              <div class="prefix-input">
                <span class="prefix-label">Prefix:</span>
                <a-input
                  v-model:value="config.leftPrefix"
                  placeholder="Optional prefix"
                  size="small"
                  @change="handleConfigChange"
                />
              </div>
            </div>

            <div class="prefix-column">
              <div class="prefix-header">
                <label>{{ rightTableName }}</label>
              </div>
              <div class="prefix-input">
                <span class="prefix-label">Prefix:</span>
                <a-input
                  v-model:value="config.rightPrefix"
                  placeholder="Optional prefix"
                  size="small"
                  @change="handleConfigChange"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Column Selection -->
        <div class="form-section">
          <div class="column-selection">
            <div class="column-list">
              <div class="list-header">
                <span class="list-title">Select columns</span>
                <span class="selection-count">
                  {{ selectedLeftColumnsCount }} of {{ leftColumns.length }} columns selected
                </span>
              </div>
              <div class="column-items">
                <div
                  v-for="col in leftColumns"
                  :key="col.name"
                  class="column-item"
                >
                  <a-checkbox
                    v-model:checked="config.selectedLeftColumns[col.name]"
                    @change="handleConfigChange"
                  >
                    {{ col.name }}
                  </a-checkbox>
                  <span class="column-type">{{ col.type }}</span>
                  <CheckOutlined v-if="config.selectedLeftColumns[col.name]" class="check-icon" />
                </div>
              </div>
            </div>

            <div class="column-list">
              <div class="list-header">
                <span class="list-title">{{ rightTableName }}</span>
                <span class="selection-count">
                  {{ selectedRightColumnsCount }} of {{ rightColumns.length }} selected
                </span>
              </div>
              <div class="column-items">
                <div
                  v-for="col in rightColumns"
                  :key="col.name"
                  class="column-item"
                >
                  <a-checkbox
                    v-model:checked="config.selectedRightColumns[col.name]"
                    @change="handleConfigChange"
                  >
                    {{ col.name }}
                  </a-checkbox>
                  <span class="column-type">{{ col.type }}</span>
                  <CheckOutlined v-if="config.selectedRightColumns[col.name]" class="check-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Messages -->
      <a-alert
        v-if="!isValid"
        :message="validationMessage"
        type="warning"
        show-icon
        style="margin-top: 16px"
      />
    </div>

    <!-- Action Buttons -->
    <div class="panel-footer">
      <a-button @click="handleClose">Cancel</a-button>
      <a-button
        type="primary"
        :disabled="!isValid"
        @click="handleApply"
      >
        Apply Join
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  CloseOutlined,
  SwapOutlined,
  DatabaseOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  UpOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'
import type { Node } from '@/stores/modules/pipeline'
import type { Column } from '@/types/pipeline'
import { usePipelineStore } from '@/stores/modules/pipeline'

interface MatchCondition {
  leftColumn: string
  rightColumn: string
}

interface JoinConfig {
  type: 'inner' | 'left' | 'right' | 'outer'
  matchConditions: MatchCondition[]
  leftPrefix: string
  rightPrefix: string
  selectedLeftColumns: Record<string, boolean>
  selectedRightColumns: Record<string, boolean>
}

interface Props {
  node: Node
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'apply', config: JoinConfig): void
}>()

const pipelineStore = usePipelineStore()
const showAdvanced = ref(false)

// Configuration state
const config = ref<JoinConfig>({
  type: 'inner',
  matchConditions: [{ leftColumn: '', rightColumn: '' }],
  leftPrefix: '',
  rightPrefix: '',
  selectedLeftColumns: {},
  selectedRightColumns: {}
})

// Get input nodes and their columns
const leftNode = computed(() => {
  const edges = pipelineStore.edges.filter(e => e.target === props.node.id)
  if (edges.length >= 1) {
    const sourceId = edges[0].source
    return pipelineStore.nodes.find(n => n.id === sourceId)
  }
  return null
})

const rightNode = computed(() => {
  const edges = pipelineStore.edges.filter(e => e.target === props.node.id)
  if (edges.length >= 2) {
    const sourceId = edges[1].source
    return pipelineStore.nodes.find(n => n.id === sourceId)
  }
  return null
})

const leftTableName = computed(() => leftNode.value?.name || 'Left Table')
const rightTableName = computed(() => rightNode.value?.name || 'Right Table')

const leftColumns = computed((): Column[] => {
  if (!leftNode.value) return []
  return leftNode.value.data?.columns || []
})

const rightColumns = computed((): Column[] => {
  if (!rightNode.value) return []
  return rightNode.value.data?.columns || []
})

// Join type description
const joinTypeDescription = computed(() => {
  const descriptions = {
    inner: 'Returns only matching rows from both tables',
    left: 'Returns all rows from left table and matching rows from right table',
    right: 'Returns all rows from right table and matching rows from left table',
    outer: 'Returns all rows from both tables'
  }
  return descriptions[config.value.type]
})

// Column selection counts
const selectedLeftColumnsCount = computed(() => {
  return Object.values(config.value.selectedLeftColumns).filter(Boolean).length
})

const selectedRightColumnsCount = computed(() => {
  return Object.values(config.value.selectedRightColumns).filter(Boolean).length
})

// Check if configuration is complete
const isConfigured = computed(() => {
  return props.node.data?.joinConfig != null
})

// Validation
const isValid = computed(() => {
  // Check if at least one match condition is complete
  const hasValidCondition = config.value.matchConditions.some(
    c => c.leftColumn && c.rightColumn
  )
  return hasValidCondition
})

const validationMessage = computed(() => {
  if (!config.value.matchConditions.some(c => c.leftColumn && c.rightColumn)) {
    return 'Please configure at least one match condition'
  }
  return ''
})

// Initialize column selection
function initializeColumnSelection() {
  // Select all columns by default
  leftColumns.value.forEach(col => {
    config.value.selectedLeftColumns[col.name] = true
  })
  rightColumns.value.forEach(col => {
    config.value.selectedRightColumns[col.name] = true
  })
}

// Load existing configuration
function loadConfiguration() {
  if (props.node.data?.joinConfig) {
    const savedConfig = props.node.data.joinConfig
    config.value = {
      ...config.value,
      ...savedConfig
    }
  }
}

// Handlers
function handleConfigChange() {
  // Configuration changed
}

function addMatchCondition() {
  config.value.matchConditions.push({ leftColumn: '', rightColumn: '' })
}

function removeMatchCondition(index: number) {
  config.value.matchConditions.splice(index, 1)
}

function handleSwapTables() {
  // Swap all left and right values
  const tempPrefix = config.value.leftPrefix
  config.value.leftPrefix = config.value.rightPrefix
  config.value.rightPrefix = tempPrefix

  const tempColumns = config.value.selectedLeftColumns
  config.value.selectedLeftColumns = config.value.selectedRightColumns
  config.value.selectedRightColumns = tempColumns

  // Swap match conditions
  config.value.matchConditions.forEach(condition => {
    const temp = condition.leftColumn
    condition.leftColumn = condition.rightColumn
    condition.rightColumn = temp
  })
}

function handleApply() {
  if (!isValid.value) return
  emit('apply', { ...config.value })
}

function handleClose() {
  emit('close')
}

// Initialize on mount
onMounted(() => {
  loadConfiguration()
  initializeColumnSelection()
})
</script>

<style scoped lang="less">
.join-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.form-section {
  margin-bottom: 24px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;

    &.required::after {
      content: ' *';
      color: #ef4444;
    }
  }

  .help-text {
    margin-top: 8px;
    font-size: 13px;
    color: #6b7280;
    font-style: italic;
  }
}

.section-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  label {
    margin: 0;
  }
}

.input-tables {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .table-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 14px;
    color: #374151;
  }
}

.match-conditions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.match-condition {
  display: flex;
  align-items: center;
  gap: 12px;

  .operator {
    font-size: 13px;
    color: #6b7280;
    white-space: nowrap;
  }
}

.add-condition-btn {
  margin-top: 8px;
  padding-left: 0;
}

.advanced-toggle {
  padding: 16px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.advanced-options {
  padding-top: 20px;
}

.prefix-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  .prefix-column {
    .prefix-header {
      margin-bottom: 8px;

      label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }
    }

    .prefix-input {
      display: flex;
      align-items: center;
      gap: 8px;

      .prefix-label {
        font-size: 13px;
        color: #6b7280;
        white-space: nowrap;
      }
    }
  }
}

.column-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  .column-list {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;

    .list-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;

      .list-title {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }

      .selection-count {
        font-size: 12px;
        color: #6b7280;
      }
    }

    .column-items {
      max-height: 300px;
      overflow-y: auto;

      .column-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-bottom: 1px solid #f3f4f6;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: #f9fafb;
        }

        :deep(.ant-checkbox-wrapper) {
          flex: 1;
          font-size: 13px;
        }

        .column-type {
          font-size: 12px;
          color: #9ca3af;
          margin-left: auto;
        }

        .check-icon {
          color: #10b981;
          font-size: 14px;
        }
      }
    }
  }
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}
</style>
