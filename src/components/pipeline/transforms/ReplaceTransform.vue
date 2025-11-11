<template>
  <div class="replace-transform">
    <div class="transform-header">
      <h4 class="transform-title">Replace Values</h4>
      <p class="transform-desc">Find and replace values in columns</p>
    </div>

    <div class="transform-body">
      <!-- Column Selection -->
      <div class="form-group">
        <label class="form-label">Column</label>
        <a-select
          v-model:value="config.column"
          placeholder="Select column"
          style="width: 100%"
          show-search
          :filter-option="filterColumn"
        >
          <a-select-option
            v-for="column in availableColumns"
            :key="column.name"
            :value="column.name"
          >
            <div class="column-option">
              <span class="column-name">{{ column.name }}</span>
              <span class="column-type">{{ column.type }}</span>
            </div>
          </a-select-option>
        </a-select>
      </div>

      <!-- Replace Mode -->
      <div class="form-group">
        <label class="form-label">Replace Mode</label>
        <a-radio-group v-model:value="config.mode" button-style="solid" size="small">
          <a-radio-button value="exact">Exact Match</a-radio-button>
          <a-radio-button value="contains">Contains</a-radio-button>
          <a-radio-button value="regex">Regex</a-radio-button>
        </a-radio-group>
        <div class="form-hint">
          {{ getModeDescription(config.mode) }}
        </div>
      </div>

      <!-- Find Value -->
      <div class="form-group">
        <label class="form-label">
          {{ config.mode === 'regex' ? 'Pattern' : 'Find' }}
        </label>
        <a-input
          v-model:value="config.findValue"
          :placeholder="config.mode === 'regex' ? 'Enter regex pattern' : 'Value to find'"
          :status="findValueStatus"
        />
        <div v-if="config.mode === 'regex' && config.findValue" class="form-hint">
          <InfoCircleOutlined style="margin-right: 4px;" />
          {{ isValidRegex(config.findValue) ? 'Valid regex pattern' : 'Invalid regex pattern' }}
        </div>
      </div>

      <!-- Replace With -->
      <div class="form-group">
        <label class="form-label">Replace With</label>
        <a-input
          v-model:value="config.replaceValue"
          placeholder="New value"
        />
        <div class="form-hint">
          Leave empty to replace with null
        </div>
      </div>

      <!-- Case Sensitive (for non-regex modes) -->
      <div v-if="config.mode !== 'regex'" class="form-group">
        <a-checkbox v-model:checked="config.caseSensitive">
          Case sensitive matching
        </a-checkbox>
      </div>

      <!-- Preview Section -->
      <div v-if="config.column && config.findValue" class="preview-section">
        <div class="preview-header">
          <CheckCircleOutlined />
          <span>Configuration Summary</span>
        </div>
        <div class="preview-content">
          <div class="preview-item">
            <span class="preview-label">Column:</span>
            <span class="preview-value">{{ config.column }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Mode:</span>
            <span class="preview-value">{{ getModeName(config.mode) }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Find:</span>
            <code class="preview-code">{{ config.findValue }}</code>
          </div>
          <div class="preview-item">
            <span class="preview-label">Replace:</span>
            <code class="preview-code">{{ config.replaceValue || '(null)' }}</code>
          </div>
          <div v-if="config.mode !== 'regex'" class="preview-item">
            <span class="preview-label">Case Sensitive:</span>
            <span class="preview-value">{{ config.caseSensitive ? 'Yes' : 'No' }}</span>
          </div>
        </div>
      </div>

      <!-- Example Section -->
      <div class="example-section">
        <div class="example-header">
          <InfoCircleOutlined />
          <span>Examples</span>
        </div>
        <div class="example-content">
          <div class="example-item">
            <div class="example-mode">Exact Match:</div>
            <div class="example-text">Find "apple" → Replace with "orange"</div>
            <div class="example-result">Only exact matches are replaced</div>
          </div>
          <div class="example-item">
            <div class="example-mode">Contains:</div>
            <div class="example-text">Find "app" → Replace with "application"</div>
            <div class="example-result">"apple" becomes "applicationle"</div>
          </div>
          <div class="example-item">
            <div class="example-mode">Regex:</div>
            <div class="example-text">Pattern "\\d+" → Replace with "NUMBER"</div>
            <div class="example-result">"abc123" becomes "abcNUMBER"</div>
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
        Apply Replace
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

interface ReplaceConfig {
  column: string
  mode: 'exact' | 'contains' | 'regex'
  findValue: string
  replaceValue: string
  caseSensitive: boolean
}

const props = defineProps<{
  availableColumns: Column[]
  initialConfig?: ReplaceConfig
}>()

const emit = defineEmits<{
  (e: 'apply', config: any): void
  (e: 'cancel'): void
}>()

// State
const config = ref<ReplaceConfig>({
  column: props.initialConfig?.column || '',
  mode: props.initialConfig?.mode || 'exact',
  findValue: props.initialConfig?.findValue || '',
  replaceValue: props.initialConfig?.replaceValue || '',
  caseSensitive: props.initialConfig?.caseSensitive ?? true
})

// Computed
const findValueStatus = computed(() => {
  if (!config.value.findValue) return ''
  if (config.value.mode === 'regex' && !isValidRegex(config.value.findValue)) {
    return 'error'
  }
  return ''
})

const isValid = computed(() => {
  if (!config.value.column) return false
  if (!config.value.findValue) return false
  if (config.value.mode === 'regex' && !isValidRegex(config.value.findValue)) return false
  return true
})

// Methods
function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern)
    return true
  } catch (e) {
    return false
  }
}

function filterColumn(input: string, option: any): boolean {
  const columnName = option.value.toLowerCase()
  const searchText = input.toLowerCase()
  return columnName.includes(searchText)
}

function getModeDescription(mode: string): string {
  const descriptions = {
    exact: 'Replace only if the entire value matches exactly',
    contains: 'Replace all occurrences within values',
    regex: 'Use regular expression pattern matching'
  }
  return descriptions[mode as keyof typeof descriptions] || ''
}

function getModeName(mode: string): string {
  const names = {
    exact: 'Exact Match',
    contains: 'Contains',
    regex: 'Regular Expression'
  }
  return names[mode as keyof typeof names] || mode
}

function handleApply() {
  if (!isValid.value) {
    message.warning('Please complete all required fields')
    return
  }

  emit('apply', {
    column: config.value.column,
    mode: config.value.mode,
    findValue: config.value.findValue,
    replaceValue: config.value.replaceValue,
    caseSensitive: config.value.caseSensitive
  })
  message.success('Replace transform applied')
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.replace-transform {
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

    &:last-child {
      margin-bottom: 0;
    }

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
  .example-item {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #E4E7EB;

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .example-mode {
      font-weight: 600;
      font-size: 12px;
      color: #1570EF;
      margin-bottom: 4px;
    }

    .example-text {
      font-size: 12px;
      color: #212121;
      font-family: 'Courier New', monospace;
      margin-bottom: 4px;
    }

    .example-result {
      font-size: 11px;
      color: #5F6368;
      font-style: italic;
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
