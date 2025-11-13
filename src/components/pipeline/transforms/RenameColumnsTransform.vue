<template>
  <div class="rename-columns-transform">
    <div class="transform-header">
      <h4 class="transform-title">RENAME COLUMNS</h4>
      <p class="transform-desc">Change column names in your dataset</p>
    </div>

    <div class="transform-body">
      <!-- Add Rename Rule Button -->
      <div class="add-rule-section">
        <a-button type="dashed" block @click="addRenameRule">
          <PlusOutlined />
          Add Rename Rule
        </a-button>
      </div>

      <!-- Rename Rules List -->
      <div v-if="renameRules.length === 0" class="empty-state">
        <InfoCircleOutlined style="font-size: 24px; color: #98A2B3;" />
        <p>No rename rules defined</p>
        <p class="empty-hint">Click "Add Rename Rule" to get started</p>
      </div>

      <div v-else class="rules-list">
        <div
          v-for="(rule, index) in renameRules"
          :key="rule.id"
          class="rename-rule"
        >
          <div class="rule-header">
            <span class="rule-number">{{ index + 1 }}</span>
            <a-button
              type="text"
              size="small"
              danger
              @click="removeRule(index)"
            >
              <DeleteOutlined />
            </a-button>
          </div>

          <div class="rule-content">
            <!-- From Column -->
            <div class="form-group">
              <label class="form-label">From Column</label>
              <a-select
                v-model:value="rule.from"
                placeholder="Select column"
                style="width: 100%"
                show-search
                :filter-option="filterColumn"
              >
                <a-select-option
                  v-for="column in availableColumns"
                  :key="column.name"
                  :value="column.name"
                  :disabled="isColumnUsed(column.name, index)"
                >
                  <div class="column-option">
                    <span class="column-name">{{ column.name }}</span>
                    <span class="column-type">{{ column.type }}</span>
                  </div>
                </a-select-option>
              </a-select>
            </div>

            <!-- Arrow Icon -->
            <div class="arrow-icon">
              <ArrowRightOutlined />
            </div>

            <!-- To Column -->
            <div class="form-group">
              <label class="form-label">To Column Name</label>
              <a-input
                v-model:value="rule.to"
                placeholder="Enter new column name"
                :status="getValidationStatus(rule)"
              />
              <div v-if="rule.to && !isValidColumnName(rule.to)" class="error-hint">
                Column name must start with a letter and contain only letters, numbers, and underscores
              </div>
              <div v-else-if="rule.to && isDuplicateNewName(rule.to, index)" class="error-hint">
                This column name is already used
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <div v-if="hasValidRules" class="preview-section">
        <div class="preview-header">
          <EyeOutlined />
          <span>Rename Preview</span>
        </div>
        <div class="preview-content">
          <div class="preview-list">
            <div
              v-for="rule in validRules"
              :key="rule.id"
              class="preview-item"
            >
              <span class="preview-from">{{ rule.from }}</span>
              <ArrowRightOutlined class="preview-arrow" />
              <span class="preview-to">{{ rule.to }}</span>
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
        Apply Transform
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  InfoCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'
import type { Transform } from '@/utils/transform'

interface Column {
  name: string
  type: string
}

interface RenameRule {
  id: string
  from: string
  to: string
}

interface RenameColumnsConfig {
  renames: Array<{ from: string; to: string }>
}

const props = defineProps<{
  availableColumns: Column[]
  initialConfig?: RenameColumnsConfig
}>()

const emit = defineEmits<{
  (e: 'apply', config: any): void
  (e: 'cancel'): void
}>()

// State
const renameRules = ref<RenameRule[]>([])

// Initialize from config
if (props.initialConfig?.renames) {
  renameRules.value = props.initialConfig.renames.map((r, i) => ({
    id: `rule-${i}`,
    from: r.from,
    to: r.to
  }))
}

// Computed
const validRules = computed(() => {
  return renameRules.value.filter(rule =>
    rule.from &&
    rule.to &&
    isValidColumnName(rule.to) &&
    !isDuplicateNewName(rule.to, renameRules.value.indexOf(rule))
  )
})

const hasValidRules = computed(() => validRules.value.length > 0)

const isValid = computed(() => {
  if (renameRules.value.length === 0) return false
  if (validRules.value.length === 0) return false

  // Check all rules have both from and to
  return renameRules.value.every(rule => rule.from && rule.to)
})

// Methods
function addRenameRule() {
  renameRules.value.push({
    id: `rule-${Date.now()}`,
    from: '',
    to: ''
  })
}

function removeRule(index: number) {
  renameRules.value.splice(index, 1)
}

function isColumnUsed(columnName: string, currentIndex: number): boolean {
  return renameRules.value.some((rule, index) =>
    index !== currentIndex && rule.from === columnName
  )
}

function isValidColumnName(name: string): boolean {
  // Must start with letter, contain only letters, numbers, and underscores
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)
}

function isDuplicateNewName(newName: string, currentIndex: number): boolean {
  // Check if new name conflicts with other new names
  const otherNewNames = renameRules.value
    .filter((_, index) => index !== currentIndex)
    .map(r => r.to)

  if (otherNewNames.includes(newName)) return true

  // Check if new name conflicts with existing columns that aren't being renamed
  const columnsBeingRenamed = renameRules.value.map(r => r.from)
  const unchangedColumns = props.availableColumns
    .map(c => c.name)
    .filter(name => !columnsBeingRenamed.includes(name))

  return unchangedColumns.includes(newName)
}

function getValidationStatus(rule: RenameRule): string {
  if (!rule.to) return ''
  if (!isValidColumnName(rule.to)) return 'error'
  if (isDuplicateNewName(rule.to, renameRules.value.indexOf(rule))) return 'error'
  return ''
}

function filterColumn(input: string, option: any): boolean {
  const columnName = option.value.toLowerCase()
  const searchText = input.toLowerCase()
  return columnName.includes(searchText)
}

function handleApply() {
  if (!isValid.value) {
    message.warning('Please complete all rename rules')
    return
  }

  emit('apply', {
    renames: validRules.value.map(rule => ({
      from: rule.from,
      to: rule.to
    }))
  })
  message.success(`${validRules.value.length} column(s) renamed`)
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.rename-columns-transform {
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

.add-rule-section {
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #5F6368;

  p {
    margin: 12px 0 0 0;
  }

  .empty-hint {
    font-size: 12px;
    color: #98A2B3;
  }
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rename-rule {
  padding: 16px;
  background: #F8F9FA;
  border: 1px solid #E4E7EB;
  border-radius: 8px;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .rule-number {
    font-size: 12px;
    font-weight: 600;
    color: #FFFFFF;
    background: #1570EF;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.rule-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: start;
}

.arrow-icon {
  padding-top: 30px;
  color: #5F6368;
  font-size: 16px;
}

.form-group {
  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #5F6368;
    margin-bottom: 6px;
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

.error-hint {
  margin-top: 4px;
  font-size: 11px;
  color: #F04438;
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

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #FFFFFF;
  border-radius: 4px;
  font-size: 13px;

  .preview-from {
    flex: 1;
    color: #5F6368;
    font-weight: 500;
  }

  .preview-arrow {
    color: #98A2B3;
  }

  .preview-to {
    flex: 1;
    color: #1570EF;
    font-weight: 600;
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
