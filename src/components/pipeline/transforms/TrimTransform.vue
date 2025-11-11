<template>
  <div class="trim-transform">
    <div class="transform-header">
      <h4 class="transform-title">Trim Whitespace</h4>
      <p class="transform-desc">Remove leading and trailing whitespace from text columns</p>
    </div>

    <div class="transform-body">
      <!-- Trim Mode Selection -->
      <div class="form-group">
        <label class="form-label">Trim Mode</label>
        <a-radio-group v-model:value="config.mode" button-style="solid" size="small">
          <a-radio-button value="both">Both Sides</a-radio-button>
          <a-radio-button value="start">Start Only</a-radio-button>
          <a-radio-button value="end">End Only</a-radio-button>
        </a-radio-group>
        <div class="form-hint">
          {{ getModeDescription(config.mode) }}
        </div>
      </div>

      <!-- Column Selection -->
      <div class="form-group">
        <label class="form-label">
          Columns to Trim
          <span class="column-count">({{ selectedColumns.length }} selected)</span>
        </label>

        <!-- Selection Actions -->
        <div class="selection-actions">
          <a-button size="small" type="link" @click="selectAllStringColumns">
            Select All Text Columns
          </a-button>
          <a-button size="small" type="link" @click="clearAll">
            Clear All
          </a-button>
        </div>

        <!-- Column List -->
        <div class="column-list">
          <div v-if="stringColumns.length === 0" class="empty-state">
            <InfoCircleOutlined style="font-size: 24px; color: #98A2B3;" />
            <p>No text columns available</p>
            <p class="empty-hint">Trim only works on String columns</p>
          </div>

          <a-checkbox-group
            v-else
            v-model:value="selectedColumns"
            class="column-checkbox-group"
          >
            <div
              v-for="column in stringColumns"
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
          <CheckCircleOutlined />
          <span>Configuration Summary</span>
        </div>
        <div class="preview-content">
          <div class="preview-item">
            <span class="preview-label">Mode:</span>
            <span class="preview-value">{{ getModeName(config.mode) }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Columns:</span>
            <span class="preview-value">{{ selectedColumns.length }} column(s)</span>
          </div>
          <div class="preview-columns">
            <a-tag
              v-for="col in selectedColumns"
              :key="col"
              color="blue"
              class="column-tag"
            >
              {{ col }}
            </a-tag>
          </div>
        </div>
      </div>

      <!-- Example Section -->
      <div class="example-section">
        <div class="example-header">
          <InfoCircleOutlined />
          <span>Example</span>
        </div>
        <div class="example-content">
          <div class="example-row">
            <span class="example-label">Input:</span>
            <code class="example-code">"  Hello World  "</code>
          </div>
          <div class="example-row">
            <span class="example-label">Output:</span>
            <code class="example-code">{{ getExampleOutput() }}</code>
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
        Apply Trim
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'

interface Column {
  name: string
  type: string
}

interface TrimConfig {
  mode: 'both' | 'start' | 'end'
  columns: string[]
}

const props = defineProps<{
  availableColumns: Column[]
  initialConfig?: TrimConfig
}>()

const emit = defineEmits<{
  (e: 'apply', config: any): void
  (e: 'cancel'): void
}>()

// State
const config = ref<TrimConfig>({
  mode: props.initialConfig?.mode || 'both',
  columns: props.initialConfig?.columns || []
})

const selectedColumns = ref<string[]>(props.initialConfig?.columns || [])

// Computed
const stringColumns = computed(() => {
  return props.availableColumns.filter(col =>
    col.type === 'String' || col.type === 'string' || col.type === 'TEXT'
  )
})

const isValid = computed(() => {
  return selectedColumns.value.length > 0
})

// Methods
function selectAllStringColumns() {
  selectedColumns.value = stringColumns.value.map(col => col.name)
}

function clearAll() {
  selectedColumns.value = []
}

function getModeDescription(mode: string): string {
  const descriptions = {
    both: 'Remove whitespace from both the beginning and end',
    start: 'Remove whitespace only from the beginning',
    end: 'Remove whitespace only from the end'
  }
  return descriptions[mode as keyof typeof descriptions] || ''
}

function getModeName(mode: string): string {
  const names = {
    both: 'Trim Both Sides',
    start: 'Trim Start Only',
    end: 'Trim End Only'
  }
  return names[mode as keyof typeof names] || mode
}

function getExampleOutput(): string {
  const examples = {
    both: '"Hello World"',
    start: '"Hello World  "',
    end: '"  Hello World"'
  }
  return examples[config.value.mode as keyof typeof examples] || ''
}

function handleApply() {
  if (!isValid.value) {
    message.warning('Please select at least one column')
    return
  }

  emit('apply', {
    mode: config.value.mode,
    columns: [...selectedColumns.value]
  })
  message.success(`Trim will be applied to ${selectedColumns.value.length} column(s)`)
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.trim-transform {
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

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #5F6368;
}

.selection-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.column-list {
  max-height: 300px;
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
  .preview-item {
    display: flex;
    margin-bottom: 8px;
    font-size: 13px;

    .preview-label {
      color: #5F6368;
      min-width: 80px;
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
    margin-top: 12px;
  }

  .column-tag {
    margin: 0;
  }
}

.example-section {
  margin-top: 24px;
  padding: 16px;
  background: #F9FAFB;
  border: 1px solid #E4E7EB;
  border-radius: 6px;
}

.example-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #5F6368;
  margin-bottom: 12px;
}

.example-content {
  .example-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;

    &:last-child {
      margin-bottom: 0;
    }

    .example-label {
      color: #5F6368;
      min-width: 60px;
      font-weight: 500;
    }

    .example-code {
      background: #FFFFFF;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #212121;
      border: 1px solid #E4E7EB;
    }
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
