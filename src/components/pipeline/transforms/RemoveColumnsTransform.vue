<template>
  <div class="remove-columns-transform">
    <div class="transform-header">
      <h4 class="transform-title">REMOVE COLUMNS</h4>
      <p class="transform-desc">Remove specific columns from your dataset</p>
    </div>

    <div class="transform-body">
      <!-- Available Columns -->
      <div class="form-group">
        <label class="form-label">
          Columns to Remove
          <span class="column-count">({{ selectedColumns.length }} selected)</span>
        </label>

        <!-- Select All / Clear All -->
        <div class="selection-actions">
          <a-button size="small" type="link" @click="selectAll">
            Select All
          </a-button>
          <a-button size="small" type="link" @click="clearAll">
            Clear All
          </a-button>
        </div>

        <!-- Column List with Checkboxes -->
        <div class="column-list">
          <div v-if="availableColumns.length === 0" class="empty-state">
            <InfoCircleOutlined style="font-size: 24px; color: #98A2B3;" />
            <p>No columns available</p>
            <p class="empty-hint">Connect an input node first</p>
          </div>

          <a-checkbox-group
            v-else
            v-model:value="selectedColumns"
            class="column-checkbox-group"
          >
            <div
              v-for="column in availableColumns"
              :key="column.name"
              class="column-item"
            >
              <a-checkbox :value="column.name" class="column-checkbox">
                <div class="column-info">
                  <span class="column-name">{{ column.name }}</span>
                  <span class="column-type">{{ column.type }}</span>
                </div>
              </a-checkbox>
            </div>
          </a-checkbox-group>
        </div>
      </div>

      <!-- Preview Section -->
      <div v-if="selectedColumns.length > 0" class="preview-section">
        <div class="preview-header">
          <EyeOutlined />
          <span>Output Preview</span>
        </div>
        <div class="preview-content">
          <div class="preview-info">
            <span class="preview-label">Columns remaining:</span>
            <span class="preview-value">{{ remainingColumnCount }}</span>
          </div>
          <div v-if="remainingColumns.length > 0" class="preview-columns">
            <a-tag
              v-for="col in remainingColumns.slice(0, 10)"
              :key="col"
              color="green"
              class="column-tag"
            >
              {{ col }}
            </a-tag>
            <span v-if="remainingColumns.length > 10" class="more-columns">
              +{{ remainingColumns.length - 10 }} more
            </span>
          </div>
          <div v-else class="warning-message">
            <WarningOutlined style="margin-right: 4px;" />
            All columns will be removed!
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="transform-footer">
      <a-button @click="handleCancel">Cancel</a-button>
      <a-button
        type="primary"
        :disabled="!isValid"
        @click="handleApply"
      >
        Remove Columns
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { InfoCircleOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons-vue'

interface Column {
  name: string
  type: string
}

interface RemoveColumnsConfig {
  columns: string[]
}

const props = defineProps<{
  availableColumns: Column[]
  initialConfig?: RemoveColumnsConfig
}>()

const emit = defineEmits<{
  (e: 'apply', config: any): void
  (e: 'cancel'): void
}>()

// State
const selectedColumns = ref<string[]>(props.initialConfig?.columns || [])

// Computed properties
const remainingColumnCount = computed(() => {
  return props.availableColumns.length - selectedColumns.value.length
})

const remainingColumns = computed(() => {
  return props.availableColumns
    .map(col => col.name)
    .filter(name => !selectedColumns.value.includes(name))
})

const isValid = computed(() => {
  // Must select at least one column to remove
  if (selectedColumns.value.length === 0) return false
  // Cannot remove all columns
  if (selectedColumns.value.length === props.availableColumns.length) return false
  return true
})

// Methods
function selectAll() {
  selectedColumns.value = props.availableColumns.map(col => col.name)
}

function clearAll() {
  selectedColumns.value = []
}

function handleApply() {
  if (!isValid.value) {
    if (selectedColumns.value.length === 0) {
      message.warning('Please select at least one column to remove')
    } else {
      message.warning('Cannot remove all columns')
    }
    return
  }

  emit('apply', {
    columns: [...selectedColumns.value]
  })
  message.success(`${selectedColumns.value.length} column(s) will be removed`)
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.remove-columns-transform {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.transform-header {
  padding: 20px;
  border-bottom: 1px solid #E4E7EB;

  .transform-title {
    font-size: 18px;
    font-weight: 600;
    color: #212121;
    margin: 0 0 8px 0;
  }

  .transform-desc {
    font-size: 13px;
    color: #5F6368;
    margin: 0;
  }
}

.transform-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #212121;
  margin-bottom: 8px;

  .column-count {
    font-weight: normal;
    color: #5F6368;
    margin-left: 4px;
  }
}

.selection-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.column-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #E4E7EB;
  border-radius: 6px;
  padding: 12px;
  background: #F8F9FA;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #5F6368;

  p {
    margin: 8px 0 0 0;
  }

  .empty-hint {
    font-size: 12px;
    color: #98A2B3;
  }
}

.column-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.column-item {
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: #FFFFFF;
  }
}

.column-checkbox {
  width: 100%;

  :deep(.ant-checkbox) {
    top: 2px;
  }
}

.column-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-left: 8px;
}

.column-name {
  font-size: 13px;
  color: #212121;
  font-weight: 500;
}

.column-type {
  font-size: 11px;
  color: #5F6368;
  background: #E8EAED;
  padding: 2px 8px;
  border-radius: 10px;
}

.preview-section {
  margin-top: 24px;
  padding: 16px;
  background: #F0F7FF;
  border: 1px solid #D4E8FF;
  border-radius: 6px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1570EF;
  margin-bottom: 12px;
}

.preview-content {
  .preview-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 13px;

    .preview-label {
      color: #5F6368;
    }

    .preview-value {
      font-weight: 600;
      color: #212121;
    }
  }

  .preview-columns {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .column-tag {
    margin: 0;
  }

  .more-columns {
    font-size: 12px;
    color: #5F6368;
    padding: 0 8px;
  }

  .warning-message {
    color: #F59E0B;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
  }
}

.transform-footer {
  padding: 16px 20px;
  border-top: 1px solid #E4E7EB;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// Scrollbar styling
.column-list::-webkit-scrollbar,
.transform-body::-webkit-scrollbar {
  width: 6px;
}

.column-list::-webkit-scrollbar-track,
.transform-body::-webkit-scrollbar-track {
  background: transparent;
}

.column-list::-webkit-scrollbar-thumb,
.transform-body::-webkit-scrollbar-thumb {
  background: #D0D5DD;
  border-radius: 3px;

  &:hover {
    background: #98A2B3;
  }
}
</style>
