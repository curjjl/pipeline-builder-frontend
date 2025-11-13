<template>
  <div class="add-column-transform">
    <div class="transform-header">
      <h4 class="transform-title">ADD COLUMN</h4>
      <p class="transform-desc">Create a new calculated column from existing data</p>
    </div>

    <div class="transform-body">
      <!-- Column Name -->
      <div class="form-group">
        <label class="form-label required">New Column Name</label>
        <a-input
          v-model:value="config.columnName"
          placeholder="Enter column name (e.g., total_price)"
          :status="columnNameStatus"
          @blur="validateColumnName"
        />
        <div v-if="columnNameError" class="error-hint">
          {{ columnNameError }}
        </div>
        <div v-else class="form-hint">
          Must start with a letter and contain only letters, numbers, and underscores
        </div>
      </div>

      <!-- Expression Type -->
      <div class="form-group">
        <label class="form-label required">Expression Type</label>
        <a-radio-group v-model:value="config.expressionType" button-style="solid" size="small">
          <a-radio-button value="simple">Simple Calculation</a-radio-button>
          <a-radio-button value="formula">Custom Formula</a-radio-button>
        </a-radio-group>
      </div>

      <!-- Simple Calculation -->
      <div v-if="config.expressionType === 'simple'" class="calculation-section">
        <div class="calculation-grid">
          <!-- First Operand -->
          <div class="form-group">
            <label class="form-label">First Value</label>
            <a-select
              v-model:value="config.operand1"
              placeholder="Select column or value"
              show-search
              allow-clear
            >
              <a-select-opt-group label="Columns">
                <a-select-option
                  v-for="col in availableColumns"
                  :key="col.name"
                  :value="`column:${col.name}`"
                >
                  <div class="column-option">
                    <DatabaseOutlined />
                    <span>{{ col.name }}</span>
                    <span class="column-type">{{ col.type }}</span>
                  </div>
                </a-select-option>
              </a-select-opt-group>
              <a-select-opt-group label="Custom Value">
                <a-select-option value="custom">
                  <EditOutlined />
                  Enter custom value...
                </a-select-option>
              </a-select-opt-group>
            </a-select>

            <!-- Custom Value Input -->
            <a-input
              v-if="config.operand1 === 'custom'"
              v-model:value="config.customValue1"
              placeholder="Enter value (e.g., 100)"
              class="custom-input"
            />
          </div>

          <!-- Operator -->
          <div class="form-group">
            <label class="form-label">Operator</label>
            <a-select v-model:value="config.operator" style="width: 100%">
              <a-select-option value="+">+ (Add)</a-select-option>
              <a-select-option value="-">- (Subtract)</a-select-option>
              <a-select-option value="*">× (Multiply)</a-select-option>
              <a-select-option value="/">÷ (Divide)</a-select-option>
              <a-select-option value="%">% (Modulo)</a-select-option>
            </a-select>
          </div>

          <!-- Second Operand -->
          <div class="form-group">
            <label class="form-label">Second Value</label>
            <a-select
              v-model:value="config.operand2"
              placeholder="Select column or value"
              show-search
              allow-clear
            >
              <a-select-opt-group label="Columns">
                <a-select-option
                  v-for="col in availableColumns"
                  :key="col.name"
                  :value="`column:${col.name}`"
                >
                  <div class="column-option">
                    <DatabaseOutlined />
                    <span>{{ col.name }}</span>
                    <span class="column-type">{{ col.type }}</span>
                  </div>
                </a-select-option>
              </a-select-opt-group>
              <a-select-opt-group label="Custom Value">
                <a-select-option value="custom">
                  <EditOutlined />
                  Enter custom value...
                </a-select-option>
              </a-select-opt-group>
            </a-select>

            <!-- Custom Value Input -->
            <a-input
              v-if="config.operand2 === 'custom'"
              v-model:value="config.customValue2"
              placeholder="Enter value (e.g., 2)"
              class="custom-input"
            />
          </div>
        </div>

        <!-- Expression Preview -->
        <div v-if="simpleExpressionPreview" class="expression-preview">
          <FunctionOutlined />
          <code>{{ simpleExpressionPreview }}</code>
        </div>
      </div>

      <!-- Custom Formula -->
      <div v-else class="formula-section">
        <div class="form-group">
          <label class="form-label required">Formula Expression</label>
          <a-textarea
            v-model:value="config.formula"
            placeholder="Enter JavaScript expression (e.g., row.price * row.quantity)"
            :rows="4"
            :status="formulaStatus"
          />
          <div class="form-hint">
            <InfoCircleOutlined />
            <span>Use <code>row.columnName</code> to reference columns. Example: <code>row.price * 1.1</code></span>
          </div>
        </div>

        <!-- Available Columns Reference -->
        <div class="columns-reference">
          <div class="reference-header">Available Columns:</div>
          <div class="reference-chips">
            <a-tag
              v-for="col in availableColumns"
              :key="col.name"
              color="blue"
              class="column-chip"
              @click="insertColumnRef(col.name)"
            >
              row.{{ col.name }}
            </a-tag>
          </div>
        </div>
      </div>

      <!-- Data Type -->
      <div class="form-group">
        <label class="form-label">Output Data Type</label>
        <a-select v-model:value="config.dataType" style="width: 200px">
          <a-select-option value="auto">Auto Detect</a-select-option>
          <a-select-option value="string">String</a-select-option>
          <a-select-option value="number">Number</a-select-option>
          <a-select-option value="boolean">Boolean</a-select-option>
        </a-select>
        <div class="form-hint">
          Choose "Auto Detect" to automatically determine the data type
        </div>
      </div>

      <!-- Preview Section -->
      <div v-if="finalExpression" class="preview-section">
        <div class="preview-header">
          <CheckCircleOutlined />
          <span>Configuration Summary</span>
        </div>
        <div class="preview-content">
          <div class="preview-item">
            <span class="preview-label">New Column:</span>
            <span class="preview-value">{{ config.columnName }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Expression:</span>
            <code class="preview-code">{{ finalExpression }}</code>
          </div>
          <div class="preview-item">
            <span class="preview-label">Data Type:</span>
            <span class="preview-value">{{ config.dataType }}</span>
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
        Add Column
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  FunctionOutlined,
  DatabaseOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import type { Transform } from '@/utils/transform'

interface Column {
  name: string
  type: string
}

interface AddColumnConfig {
  columnName: string
  expressionType: 'simple' | 'formula'
  operand1: string
  operator: string
  operand2: string
  customValue1: string
  customValue2: string
  formula: string
  dataType: string
}

const props = defineProps<{
  availableColumns: Column[]
  initialConfig?: Partial<AddColumnConfig>
}>()

const emit = defineEmits<{
  (e: 'apply', config: any): void
  (e: 'cancel'): void
}>()

// State
const config = ref<AddColumnConfig>({
  columnName: props.initialConfig?.columnName || '',
  expressionType: props.initialConfig?.expressionType || 'simple',
  operand1: props.initialConfig?.operand1 || '',
  operator: props.initialConfig?.operator || '+',
  operand2: props.initialConfig?.operand2 || '',
  customValue1: props.initialConfig?.customValue1 || '',
  customValue2: props.initialConfig?.customValue2 || '',
  formula: props.initialConfig?.formula || '',
  dataType: props.initialConfig?.dataType || 'auto'
})

const columnNameError = ref('')

// Computed
const columnNameStatus = computed(() => {
  return columnNameError.value ? 'error' : ''
})

const formulaStatus = computed(() => {
  if (config.value.expressionType === 'formula' && !config.value.formula) {
    return 'error'
  }
  return ''
})

const simpleExpressionPreview = computed(() => {
  if (config.value.expressionType !== 'simple') return ''

  const op1 = getOperandDisplay(config.value.operand1, config.value.customValue1)
  const op2 = getOperandDisplay(config.value.operand2, config.value.customValue2)

  if (!op1 || !op2) return ''

  return `${op1} ${config.value.operator} ${op2}`
})

const finalExpression = computed(() => {
  if (config.value.expressionType === 'simple') {
    return simpleExpressionPreview.value
  } else {
    return config.value.formula
  }
})

const isValid = computed(() => {
  if (!config.value.columnName) return false
  if (!isValidColumnName(config.value.columnName)) return false
  if (isDuplicateColumn(config.value.columnName)) return false

  if (config.value.expressionType === 'simple') {
    if (!config.value.operand1 || !config.value.operand2) return false
    if (config.value.operand1 === 'custom' && !config.value.customValue1) return false
    if (config.value.operand2 === 'custom' && !config.value.customValue2) return false
  } else {
    if (!config.value.formula) return false
  }

  return true
})

// Methods
function isValidColumnName(name: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)
}

function isDuplicateColumn(name: string): boolean {
  return props.availableColumns.some(col => col.name === name)
}

function validateColumnName() {
  if (!config.value.columnName) {
    columnNameError.value = 'Column name is required'
  } else if (!isValidColumnName(config.value.columnName)) {
    columnNameError.value = 'Column name must start with a letter and contain only letters, numbers, and underscores'
  } else if (isDuplicateColumn(config.value.columnName)) {
    columnNameError.value = 'A column with this name already exists'
  } else {
    columnNameError.value = ''
  }
}

function getOperandDisplay(operand: string, customValue: string): string {
  if (!operand) return ''
  if (operand === 'custom') return customValue || ''
  if (operand.startsWith('column:')) {
    return `row.${operand.substring(7)}`
  }
  return operand
}

function insertColumnRef(columnName: string) {
  const ref = `row.${columnName}`
  if (config.value.formula) {
    config.value.formula += ` ${ref}`
  } else {
    config.value.formula = ref
  }
}

function handleApply() {
  validateColumnName()

  if (!isValid.value) {
    message.warning('Please complete all required fields')
    return
  }

  let expression = ''

  if (config.value.expressionType === 'simple') {
    const op1 = getOperandDisplay(config.value.operand1, config.value.customValue1)
    const op2 = getOperandDisplay(config.value.operand2, config.value.customValue2)
    expression = `${op1} ${config.value.operator} ${op2}`
  } else {
    expression = config.value.formula
  }

  emit('apply', {
    columnName: config.value.columnName,
    expression,
    dataType: config.value.dataType
  })
  message.success(`Column "${config.value.columnName}" added`)
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.add-column-transform {
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

  .form-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #212121;
    margin-bottom: 8px;

    &.required::after {
      content: ' *';
      color: #F04438;
    }
  }

  .form-hint {
    margin-top: 6px;
    font-size: 12px;
    color: #5F6368;
    display: flex;
    align-items: flex-start;
    gap: 6px;

    code {
      background: #F8F9FA;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
    }
  }
}

.error-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #F04438;
}

.calculation-section {
  margin: 20px 0;
}

.calculation-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: start;
}

.custom-input {
  margin-top: 8px;
}

.column-option {
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-size: 13px;
  }

  .column-type {
    margin-left: auto;
    font-size: 11px;
    color: #5F6368;
    background: #E8EAED;
    padding: 2px 6px;
    border-radius: 8px;
  }
}

.expression-preview {
  margin-top: 16px;
  padding: 12px;
  background: #F0F7FF;
  border: 1px solid #D4E8FF;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1570EF;

  code {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    font-weight: 500;
  }
}

.formula-section {
  margin: 20px 0;
}

.columns-reference {
  margin-top: 16px;
  padding: 12px;
  background: #F8F9FA;
  border-radius: 6px;

  .reference-header {
    font-size: 12px;
    font-weight: 500;
    color: #5F6368;
    margin-bottom: 8px;
  }

  .reference-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .column-chip {
    margin: 0;
    cursor: pointer;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 11px;

    &:hover {
      opacity: 0.8;
    }
  }
}

.preview-section {
  margin-top: 24px;
  padding: 16px;
  background: #F0FDF4;
  border: 1px solid #D1FAE5;
  border-radius: 6px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #10B981;
  margin-bottom: 12px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;

  .preview-label {
    color: #5F6368;
    min-width: 100px;
  }

  .preview-value {
    font-weight: 600;
    color: #212121;
  }

  .preview-code {
    font-family: 'Monaco', 'Courier New', monospace;
    background: #FFFFFF;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #10B981;
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
