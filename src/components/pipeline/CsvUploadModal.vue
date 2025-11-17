<template>
  <a-modal
    v-model:open="visible"
    :title="t('dataImport.csv.title')"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="csv-upload-modal">
      <!-- Step 1: Upload File -->
      <div v-if="step === 1" class="upload-step">
        <a-upload-dragger
          v-model:file-list="fileList"
          :before-upload="handleBeforeUpload"
          :custom-request="handleUpload"
          accept=".csv,.txt"
          :max-count="1"
          @remove="handleRemove"
        >
          <p class="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text">{{ t('dataImport.csv.dragText') }}</p>
          <p class="ant-upload-hint">
            {{ t('dataImport.csv.hint') }}
          </p>
        </a-upload-dragger>

        <div v-if="uploadError" class="upload-error">
          <a-alert
            :message="t('common.messages.error')"
            :description="uploadError"
            type="error"
            show-icon
            closable
            @close="uploadError = ''"
          />
        </div>
      </div>

      <!-- Step 2: Preview and Configure -->
      <div v-if="step === 2" class="preview-step">
        <div class="preview-header">
          <div class="preview-info">
            <FileTextOutlined style="font-size: 16px; color: #1570EF;" />
            <span class="file-name">{{ fileName }}</span>
            <a-tag color="blue">{{ rowCount }} {{ t('dataImport.csv.rows') }}</a-tag>
            <a-tag color="green">{{ columnCount }} {{ t('dataImport.csv.columns') }}</a-tag>
          </div>
          <a-button size="small" @click="step = 1">
            <EditOutlined /> {{ t('common.actions.change') }}
          </a-button>
        </div>

        <!-- Configuration Options -->
        <div class="config-section">
          <a-form layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item :label="t('dataImport.csv.datasetName')">
                  <a-input
                    v-model:value="datasetName"
                    :placeholder="t('dataImport.csv.datasetNamePlaceholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :label="t('dataImport.csv.delimiter')">
                  <a-select v-model:value="delimiter" style="width: 100%;">
                    <a-select-option value=",">{{ t('dataImport.csv.comma') }} (,)</a-select-option>
                    <a-select-option value=";">{{ t('dataImport.csv.semicolon') }} (;)</a-select-option>
                    <a-select-option value="\t">{{ t('dataImport.csv.tab') }}</a-select-option>
                    <a-select-option value="|">{{ t('dataImport.csv.pipe') }} (|)</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item>
                  <a-checkbox v-model:checked="hasHeader">
                    {{ t('dataImport.csv.firstRowHeader') }}
                  </a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item>
                  <a-checkbox v-model:checked="autoDetectTypes">
                    {{ t('dataImport.csv.autoDetectTypes') }}
                  </a-checkbox>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <!-- Data Preview Table -->
        <div class="preview-table">
          <div class="preview-table-header">
            <span>{{ t('dataImport.csv.preview') }}</span>
            <span class="preview-rows-info">
              {{ t('dataImport.csv.showing') }} {{ Math.min(10, rowCount) }} / {{ rowCount }} {{ t('dataImport.csv.rows') }}
            </span>
          </div>
          <a-table
            :columns="previewColumns"
            :data-source="previewData"
            :pagination="false"
            :scroll="{ x: 'max-content', y: 300 }"
            size="small"
          />
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <a-button @click="handleCancel">
            {{ t('common.actions.cancel') }}
          </a-button>
          <a-button type="primary" @click="handleImport" :loading="importing">
            <ImportOutlined /> {{ t('dataImport.csv.import') }}
          </a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined, FileTextOutlined, EditOutlined, ImportOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'import': [data: { name: string; data: any[]; columns: string[] }]
}>()

const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// State
const step = ref(1)
const fileList = ref<any[]>([])
const fileName = ref('')
const rawContent = ref('')
const parsedData = ref<any[]>([])
const uploadError = ref('')
const importing = ref(false)

// Configuration
const datasetName = ref('')
const delimiter = ref(',')
const hasHeader = ref(true)
const autoDetectTypes = ref(true)

// Computed
const rowCount = computed(() => parsedData.value.length)
const columnCount = computed(() => {
  if (parsedData.value.length === 0) return 0
  return Object.keys(parsedData.value[0] || {}).length
})

const previewColumns = computed(() => {
  if (parsedData.value.length === 0) return []
  const firstRow = parsedData.value[0]
  return Object.keys(firstRow).map((key, index) => ({
    title: key,
    dataIndex: key,
    key: key,
    width: 150,
    ellipsis: true
  }))
})

const previewData = computed(() => {
  return parsedData.value.slice(0, 10).map((row, index) => ({
    ...row,
    key: index
  }))
})

// Parse CSV
function parseCSV(content: string, delim: string, header: boolean): any[] {
  const lines = content.trim().split('\n')
  if (lines.length === 0) return []

  const headers: string[] = []
  let dataStartIndex = 0

  if (header && lines.length > 0) {
    // Use first line as headers
    const headerLine = lines[0].split(delim).map(h => h.trim().replace(/^["']|["']$/g, ''))
    headers.push(...headerLine)
    dataStartIndex = 1
  } else {
    // Generate column names
    const firstLine = lines[0].split(delim)
    for (let i = 0; i < firstLine.length; i++) {
      headers.push(`Column_${i + 1}`)
    }
    dataStartIndex = 0
  }

  // Parse data rows
  const result: any[] = []
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(delim).map(v => v.trim().replace(/^["']|["']$/g, ''))
    const row: any = {}

    headers.forEach((header, index) => {
      let value: any = values[index] || ''

      // Auto-detect types
      if (autoDetectTypes.value && value !== '') {
        // Try to parse as number
        const num = Number(value)
        if (!isNaN(num) && value !== '') {
          value = num
        }
        // Try to parse as boolean
        else if (value.toLowerCase() === 'true') {
          value = true
        } else if (value.toLowerCase() === 'false') {
          value = false
        }
      }

      row[header] = value
    })

    result.push(row)
  }

  return result
}

// Re-parse when configuration changes
watch([delimiter, hasHeader, autoDetectTypes], () => {
  if (rawContent.value) {
    parsedData.value = parseCSV(rawContent.value, delimiter.value, hasHeader.value)
  }
})

function handleBeforeUpload(file: File) {
  const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.txt')
  if (!isCSV) {
    message.error(t('dataImport.csv.invalidFileType'))
    return false
  }

  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error(t('dataImport.csv.fileTooLarge'))
    return false
  }

  return true
}

function handleUpload(options: any) {
  const { file } = options
  fileName.value = file.name
  datasetName.value = file.name.replace(/\.[^/.]+$/, '') // Remove extension

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      rawContent.value = content

      // Parse CSV
      parsedData.value = parseCSV(content, delimiter.value, hasHeader.value)

      if (parsedData.value.length === 0) {
        uploadError.value = t('dataImport.csv.emptyFile')
        return
      }

      // Move to preview step
      step.value = 2
      uploadError.value = ''
      message.success(t('dataImport.csv.uploadSuccess'))
    } catch (error: any) {
      uploadError.value = error.message || t('dataImport.csv.parseError')
      message.error(t('dataImport.csv.parseError'))
    }
  }
  reader.onerror = () => {
    uploadError.value = t('dataImport.csv.readError')
    message.error(t('dataImport.csv.readError'))
  }
  reader.readAsText(file)
}

function handleRemove() {
  rawContent.value = ''
  parsedData.value = []
  fileName.value = ''
  datasetName.value = ''
  step.value = 1
}

function handleCancel() {
  visible.value = false
  setTimeout(() => {
    step.value = 1
    fileList.value = []
    rawContent.value = ''
    parsedData.value = []
    uploadError.value = ''
    fileName.value = ''
    datasetName.value = ''
  }, 300)
}

function handleImport() {
  if (!datasetName.value.trim()) {
    message.warning(t('dataImport.csv.nameRequired'))
    return
  }

  if (parsedData.value.length === 0) {
    message.warning(t('dataImport.csv.noData'))
    return
  }

  importing.value = true

  // Simulate async import
  setTimeout(() => {
    emit('import', {
      name: datasetName.value,
      data: parsedData.value,
      columns: Object.keys(parsedData.value[0] || {})
    })

    message.success(t('dataImport.csv.importSuccess', { name: datasetName.value }))
    importing.value = false
    handleCancel()
  }, 500)
}
</script>

<style scoped lang="less">
.csv-upload-modal {
  min-height: 300px;
}

.upload-step {
  padding: 20px 0;
}

.upload-error {
  margin-top: 20px;
}

.preview-step {
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #F8F9FA;
    border-radius: 6px;
    margin-bottom: 20px;

    .preview-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .file-name {
        font-weight: 600;
        color: #212121;
      }
    }
  }

  .config-section {
    margin-bottom: 20px;
    padding: 16px;
    background: #FAFAFA;
    border-radius: 6px;
  }

  .preview-table {
    margin-bottom: 20px;

    .preview-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #F1F3F4;
      border-radius: 4px 4px 0 0;
      font-weight: 600;
      color: #212121;

      .preview-rows-info {
        font-size: 12px;
        color: #5F6368;
        font-weight: 400;
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid #E4E7EB;
  }
}
</style>
