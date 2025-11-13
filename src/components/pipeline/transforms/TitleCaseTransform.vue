<template>
  <div class="title-case-transform">
    <div class="transform-header">
      <h3>TITLE CASE</h3>
      <p class="description">Convert text to title case where the first letter of each word is capitalized</p>
    </div>

    <div class="transform-form">
      <!-- Expression (Column Selection) -->
      <div class="form-item">
        <label class="required">Expression</label>
        <a-select
          v-model:value="config.column"
          placeholder="Select column to convert"
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

      <!-- Preview Example -->
      <div v-if="config.column" class="preview-example">
        <div class="example-label">Example transformation</div>
        <div class="example-content">
          <div class="example-before">
            <span class="label">Before:</span>
            <code>{{ exampleBefore }}</code>
          </div>
          <ArrowRightOutlined class="arrow-icon" />
          <div class="example-after">
            <span class="label">After:</span>
            <code>{{ exampleAfter }}</code>
          </div>
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
            <li>Transform: <strong>Title Case</strong></li>
            <li>Each word will be capitalized</li>
          </ul>
        </div>
      </div>

      <!-- Validation Messages -->
      <a-alert
        v-if="!config.column"
        message="Please select a column to convert to title case"
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
  column: ''
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

// Example transformation
const exampleBefore = computed(() => {
  return 'gold'
})

const exampleAfter = computed(() => {
  return 'Gold'
})

// Validation
const isValid = computed(() => {
  return !!config.value.column
})

// Handlers
function handleApply() {
  if (!isValid.value) return

  emit('apply', {
    column: config.value.column
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
.title-case-transform {
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

.preview-example {
  margin-bottom: 24px;
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 6px;

  .example-label {
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #92400e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .example-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .example-before,
    .example-after {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .label {
        font-size: 11px;
        font-weight: 500;
        color: #78350f;
        text-transform: uppercase;
      }

      code {
        padding: 6px 12px;
        background: #ffffff;
        border: 1px solid #fbbf24;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
        color: #1e293b;
      }
    }

    .arrow-icon {
      color: #d97706;
      font-size: 16px;
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
