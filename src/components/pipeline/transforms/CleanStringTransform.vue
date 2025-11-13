<template>
  <div class="clean-string-transform">
    <div class="transform-header">
      <h3>CLEAN STRING</h3>
      <p class="description">Clean and normalize string values by removing whitespace and converting empty strings</p>
    </div>

    <div class="transform-form">
      <!-- Expression (Column Selection) -->
      <div class="form-item">
        <label class="required">Expression</label>
        <a-select
          v-model:value="config.column"
          placeholder="Select column to clean"
          :options="columnOptions"
          style="width: 100%"
          show-search
          :filter-option="filterOption"
        >
          <template #option="{ label, type }">
            <div class="column-option">
              <FileTextOutlined v-if="type === 'string'" style="color: #1890ff" />
              <span class="column-name">{{ label }}</span>
              <span class="column-type">{{ type }}</span>
            </div>
          </template>
        </a-select>
      </div>

      <!-- Clean Actions -->
      <div class="form-item">
        <label class="required">Clean actions</label>
        <div class="clean-actions-list">
          <a-checkbox
            v-model:checked="config.convertEmptyToNull"
            class="clean-action-item"
          >
            Convert empty strings to null
          </a-checkbox>
          <a-checkbox
            v-model:checked="config.reduceWhitespace"
            class="clean-action-item"
          >
            Reduce sequences of multiple whitespace characters to a single whitespace
          </a-checkbox>
          <a-checkbox
            v-model:checked="config.trimWhitespace"
            class="clean-action-item"
          >
            Trims whitespace at beginning and end of string
          </a-checkbox>
        </div>
      </div>

      <!-- Output Column Preview -->
      <div v-if="config.column" class="output-preview">
        <div class="preview-label">Output column</div>
        <div class="preview-value">
          <ArrowRightOutlined class="arrow-icon" />
          <span class="column-name">{{ config.column }}</span>
          <a-tag color="blue">Replace</a-tag>
        </div>
      </div>

      <!-- Configuration Summary -->
      <div v-if="isValid" class="config-summary">
        <CheckCircleOutlined style="color: #52c41a; margin-right: 8px" />
        <div class="summary-content">
          <div class="summary-title">Configuration Summary</div>
          <ul class="summary-list">
            <li>Column: <strong>{{ config.column }}</strong></li>
            <li>Actions: <strong>{{ selectedActionsCount }}</strong> selected</li>
            <li v-if="config.convertEmptyToNull">✓ Convert empty strings to null</li>
            <li v-if="config.reduceWhitespace">✓ Reduce multiple whitespace</li>
            <li v-if="config.trimWhitespace">✓ Trim whitespace</li>
          </ul>
        </div>
      </div>

      <!-- Validation Messages -->
      <a-alert
        v-if="!config.column"
        message="Please select a column to clean"
        type="warning"
        show-icon
        style="margin-top: 16px"
      />
      <a-alert
        v-if="config.column && selectedActionsCount === 0"
        message="Please select at least one clean action"
        type="warning"
        show-icon
        style="margin-top: 16px"
      />
    </div>

    <!-- Action Buttons -->
    <div class="transform-actions">
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
import { ref, computed, watch } from 'vue'
import { FileTextOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import type { Column } from '@/types/pipeline'

interface Props {
  availableColumns: Column[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'apply', config: any): void
  (e: 'cancel'): void
}>()

// Configuration state
const config = ref({
  column: '',
  convertEmptyToNull: true,
  reduceWhitespace: true,
  trimWhitespace: true
})

// Column options for dropdown
const columnOptions = computed(() => {
  return props.availableColumns
    .filter(col => col.type === 'string' || col.type === 'String')
    .map(col => ({
      label: col.name,
      value: col.name,
      type: col.type
    }))
})

// Filter function for search
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

// Count selected actions
const selectedActionsCount = computed(() => {
  let count = 0
  if (config.value.convertEmptyToNull) count++
  if (config.value.reduceWhitespace) count++
  if (config.value.trimWhitespace) count++
  return count
})

// Validation
const isValid = computed(() => {
  return config.value.column && selectedActionsCount.value > 0
})

// Handlers
function handleApply() {
  if (!isValid.value) return

  emit('apply', {
    column: config.value.column,
    convertEmptyToNull: config.value.convertEmptyToNull,
    reduceWhitespace: config.value.reduceWhitespace,
    trimWhitespace: config.value.trimWhitespace
  })
}

function handleCancel() {
  emit('cancel')
}

// Watch for column changes
watch(() => props.availableColumns, () => {
  // If current column is not in new columns list, reset
  if (config.value.column) {
    const exists = props.availableColumns.some(col => col.name === config.value.column)
    if (!exists) {
      config.value.column = ''
    }
  }
}, { immediate: true })
</script>

<style scoped lang="less">
.clean-string-transform {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  background: #ffffff;
}

.transform-header {
  margin-bottom: 24px;

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .description {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
  }
}

.transform-form {
  flex: 1;
  overflow-y: auto;
}

.form-item {
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
}

.column-option {
  display: flex;
  align-items: center;
  gap: 8px;

  .column-name {
    flex: 1;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
  }

  .column-type {
    font-size: 12px;
    color: #9ca3af;
  }
}

.clean-actions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;

  .clean-action-item {
    margin: 0;
    font-size: 14px;
    color: #374151;

    :deep(.ant-checkbox) {
      top: 0;
    }
  }
}

.output-preview {
  margin-top: 24px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;

  .preview-label {
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 500;
    color: #0369a1;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .preview-value {
    display: flex;
    align-items: center;
    gap: 8px;

    .arrow-icon {
      color: #0284c7;
    }

    .column-name {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 14px;
      font-weight: 500;
      color: #1e293b;
    }
  }
}

.config-summary {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding: 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;

  .summary-content {
    flex: 1;

    .summary-title {
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #15803d;
    }

    .summary-list {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: #166534;

      li {
        margin-bottom: 4px;

        strong {
          font-weight: 600;
          color: #14532d;
        }
      }
    }
  }
}

.transform-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
</style>
