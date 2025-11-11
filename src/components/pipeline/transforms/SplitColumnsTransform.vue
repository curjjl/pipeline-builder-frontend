<template>
  <div class="split-columns-transform">
    <div class="transform-header">
      <h4 class="transform-title">Split Column</h4>
      <p class="transform-desc">Split a column into multiple columns based on a delimiter</p>
    </div>

    <div class="transform-body">
      <!-- Source Column -->
      <div class="form-group">
        <label class="form-label">Source Column</label>
        <a-select
          v-model:value="config.column"
          placeholder="Select column to split"
          style="width: 100%"
          show-search
          :filter-option="filterColumn"
        >
          <a-select-option
            v-for="column in stringColumns"
            :key="column.name"
            :value="column.name"
          >
            <div class="column-option">
              <span class="column-name">{{ column.name }}</span>
              <span class="column-type">{{ column.type }}</span>
            </div>
          </a-select-option>
        </a-select>
        <div v-if="stringColumns.length === 0" class="form-hint warning">
          <WarningOutlined style="margin-right: 4px;" />
          No text columns available
        </div>
      </div>

      <!-- Delimiter -->
      <div class="form-group">
        <label class="form-label">Delimiter</label>
        <a-radio-group v-model:value="delimiterType" button-style="solid" size="small" style="margin-bottom: 8px;">
          <a-radio-button value="preset">Preset</a-radio-button>
          <a-radio-button value="custom">Custom</a-radio-button>
        </a-radio-group>

        <a-select
          v-if="delimiterType === 'preset'"
          v-model:value="config.delimiter"
          style="width: 100%"
        >
          <a-select-option value=",">Comma (,)</a-select-option>
          <a-select-option value=";">Semicolon (;)</a-select-option>
          <a-select-option value="|">Pipe (|)</a-select-option>
          <a-select-option value=" ">Space ( )</a-select-option>
          <a-select-option value="\t">Tab (\t)</a-select-option>
          <a-select-option value="-">Hyphen (-)</a-select-option>
          <a-select-option value="_">Underscore (_)</a-select-option>
        </a-select>

        <a-input
          v-else
          v-model:value="config.delimiter"
          placeholder="Enter custom delimiter"
        />
      </div>

      <!-- Number of Columns -->
      <div class="form-group">
        <label class="form-label">Number of Columns to Create</label>
        <a-input-number
          v-model:value="config.numColumns"
          :min="2"
          :max="10"
          style="width: 100%"
        />
        <div class="form-hint">
          Specify how many columns to create (2-10)
        </div>
      </div>

      <!-- Column Names -->
      <div class="form-group">
        <label class="form-label">New Column Names</label>
        <div class="column-names-list">
          <a-input
            v-for="(name, index) in columnNames"
            :key="index"
            v-model:value="columnNames[index]"
            :placeholder="`Column ${index + 1}`"
            :status="getColumnNameStatus(name, index)"
            style="margin-bottom: 8px;"
          />
        </div>
        <div v-if="hasInvalidColumnNames" class="form-hint error">
          <WarningOutlined style="margin-right: 4px;" />
          Column names must be unique and start with a letter
        </div>
      </div>

      <!-- Options -->
      <div class="form-group">
        <a-checkbox v-model:checked="config.removeSource">
          Remove source column after split
        </a-checkbox>
      </div>

      <!-- Preview Section -->
      <div v-if="config.column && config.delimiter" class="preview-section">
        <div class="preview-header">
          <CheckCircleOutlined />
          <span>Configuration Summary</span>
        </div>
        <div class="preview-content">
          <div class="preview-item">
            <span class="preview-label">Source:</span>
            <span class="preview-value">{{ config.column }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Delimiter:</span>
            <code class="preview-code">{{ getDelimiterDisplay(config.delimiter) }}</code>
          </div>
          <div class="preview-item">
            <span class="preview-label">New Columns:</span>
            <span class="preview-value">{{ config.numColumns }}</span>
          </div>
          <div class="column-names-preview">
            <a-tag
              v-for="(name, index) in validColumnNames"
              :key="index"
              color="blue"
              class="column-tag"
            >
              {{ name || `Column ${index + 1}` }}
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
            <code class="example-code">"{{ getExampleInput() }}"</code>
          </div>
          <div class="example-row">
            <span class="example-label">Output:</span>
            <div class="example-output">
              <div v-for="(part, index) in getExampleOutput()" :key="index" class="example-part">
                <span class="part-name">{{ columnNames[index] || `Column ${index + 1}` }}:</span>
                <code class="part-value">"{{ part }}"</code>
              </div>
            </div>
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
        Apply Split
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { InfoCircleOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons-vue'

interface Column {
  name: string
  type: string
}

interface SplitColumnsConfig {
  column: string
  delimiter: string
  numColumns: number
  columnNames: string[]
  removeSource: boolean
}

const props = defineProps<{
  availableColumns: Column[]
  initialConfig?: SplitColumnsConfig
}>()

const emit = defineEmits<{
  (e: 'apply', config: any): void
  (e: 'cancel'): void
}>()

// State
const config = ref<SplitColumnsConfig>({
  column: props.initialConfig?.column || '',
  delimiter: props.initialConfig?.delimiter || ',',
  numColumns: props.initialConfig?.numColumns || 2,
  columnNames: props.initialConfig?.columnNames || [],
  removeSource: props.initialConfig?.removeSource ?? true
})

const delimiterType = ref<'preset' | 'custom'>('preset')
const columnNames = ref<string[]>([])

// Initialize column names
watch(() => config.value.numColumns, (newVal) => {
  const current = columnNames.value.length
  if (newVal > current) {
    columnNames.value.push(...Array(newVal - current).fill(''))
  } else if (newVal < current) {
    columnNames.value = columnNames.value.slice(0, newVal)
  }
}, { immediate: true })

// Computed
const stringColumns = computed(() => {
  return props.availableColumns.filter(col =>
    col.type === 'String' || col.type === 'string' || col.type === 'TEXT'
  )
})

const validColumnNames = computed(() => {
  return columnNames.value.filter(name => name && isValidColumnName(name))
})

const hasInvalidColumnNames = computed(() => {
  const names = columnNames.value.filter(n => n.trim() !== '')
  if (names.length === 0) return false

  // Check for duplicates
  const uniqueNames = new Set(names)
  if (uniqueNames.size !== names.length) return true

  // Check if any name is invalid
  return names.some(name => !isValidColumnName(name))
})

const isValid = computed(() => {
  if (!config.value.column) return false
  if (!config.value.delimiter) return false
  if (config.value.numColumns < 2) return false
  if (hasInvalidColumnNames.value) return false
  return true
})

// Methods
function isValidColumnName(name: string): boolean {
  if (!name) return false
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)
}

function getColumnNameStatus(name: string, index: number): string {
  if (!name) return ''
  if (!isValidColumnName(name)) return 'error'

  // Check duplicates
  const filtered = columnNames.value.filter(n => n === name)
  if (filtered.length > 1) return 'error'

  return ''
}

function filterColumn(input: string, option: any): boolean {
  const columnName = option.value.toLowerCase()
  const searchText = input.toLowerCase()
  return columnName.includes(searchText)
}

function getDelimiterDisplay(delimiter: string): string {
  const displays: Record<string, string> = {
    ',': 'Comma (,)',
    ';': 'Semicolon (;)',
    '|': 'Pipe (|)',
    ' ': 'Space',
    '\t': 'Tab',
    '-': 'Hyphen (-)',
    '_': 'Underscore (_)'
  }
  return displays[delimiter] || delimiter
}

function getExampleInput(): string {
  const examples: Record<string, string> = {
    ',': 'apple,banana,cherry',
    ';': 'apple;banana;cherry',
    '|': 'apple|banana|cherry',
    ' ': 'apple banana cherry',
    '\t': 'apple\\tbanana\\tcherry',
    '-': 'apple-banana-cherry',
    '_': 'apple_banana_cherry'
  }
  return examples[config.value.delimiter] || `apple${config.value.delimiter}banana${config.value.delimiter}cherry`
}

function getExampleOutput(): string[] {
  const input = getExampleInput().replace('\\t', '\t')
  return input.split(config.value.delimiter).slice(0, config.value.numColumns)
}

function handleApply() {
  if (!isValid.value) {
    message.warning('Please complete all required fields')
    return
  }

  // Generate default names for empty columns
  const finalColumnNames = columnNames.value.map((name, index) =>
    name.trim() || `${config.value.column}_${index + 1}`
  )

  emit('apply', {
    column: config.value.column,
    delimiter: config.value.delimiter,
    numColumns: config.value.numColumns,
    columnNames: finalColumnNames,
    removeSource: config.value.removeSource
  })
  message.success(`Column "${config.value.column}" will be split into ${config.value.numColumns} columns`)
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.split-columns-transform {
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
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #212121;
  margin-bottom: 6px;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #5F6368;
  display: flex;
  align-items: center;

  &.warning {
    color: #F59E0B;
  }

  &.error {
    color: #F04438;
  }
}

.column-option {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .column-name {
    font-size: 13px;
    color: #212121;
  }

  .column-type {
    font-size: 11px;
    color: #5F6368;
    background: #E8EAED;
    padding: 2px 6px;
    border-radius: 8px;
  }
}

.column-names-list {
  display: flex;
  flex-direction: column;
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
      min-width: 120px;
    }

    .preview-value {
      font-weight: 600;
      color: #212121;
    }

    .preview-code {
      background: #FFFFFF;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #212121;
      border: 1px solid #D4E8FF;
    }
  }

  .column-names-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;

    .column-tag {
      margin: 0;
    }
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
    margin-bottom: 12px;
    font-size: 13px;

    &:last-child {
      margin-bottom: 0;
    }

    .example-label {
      color: #5F6368;
      font-weight: 500;
      display: block;
      margin-bottom: 6px;
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

  .example-output {
    margin-left: 12px;

    .example-part {
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;

      .part-name {
        font-weight: 500;
        color: #1570EF;
        font-size: 12px;
        min-width: 100px;
      }

      .part-value {
        background: #FFFFFF;
        padding: 2px 8px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #212121;
        border: 1px solid #E4E7EB;
      }
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
.transform-body::-webkit-scrollbar {
  width: 6px;
}

.transform-body::-webkit-scrollbar-track {
  background: transparent;
}

.transform-body::-webkit-scrollbar-thumb {
  background: #D0D5DD;
  border-radius: 3px;

  &:hover {
    background: #98A2B3;
  }
}
</style>
