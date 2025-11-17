<template>
  <a-modal
    v-model:open="visible"
    :title="t('dataExport.title')"
    width="700px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="data-export-modal">
      <!-- Export Format Selection -->
      <div class="format-section">
        <label class="section-label">{{ t('dataExport.format') }}</label>
        <a-radio-group v-model:value="exportFormat" button-style="solid" size="large">
          <a-radio-button value="csv">
            <FileTextOutlined />
            CSV
          </a-radio-button>
          <a-radio-button value="excel">
            <FileExcelOutlined />
            Excel
          </a-radio-button>
          <a-radio-button value="json">
            <FileOutlined />
            JSON
          </a-radio-button>
        </a-radio-group>
      </div>

      <!-- Data Info -->
      <div v-if="data.length > 0" class="data-info">
        <a-alert type="info" show-icon>
          <template #message>
            <span>{{ t('dataExport.dataInfo', { rows: data.length, columns: columns.length }) }}</span>
          </template>
        </a-alert>
      </div>

      <!-- File Name Input -->
      <div class="filename-section">
        <label class="section-label">{{ t('dataExport.fileName') }}</label>
        <a-input
          v-model:value="fileName"
          :placeholder="t('dataExport.fileNamePlaceholder')"
          size="large"
        >
          <template #suffix>
            <span class="file-extension">.{{ exportFormat === 'excel' ? 'xlsx' : exportFormat }}</span>
          </template>
        </a-input>
      </div>

      <!-- CSV Options -->
      <div v-if="exportFormat === 'csv'" class="options-section">
        <a-collapse>
          <a-collapse-panel key="1" :header="t('dataExport.advancedOptions')">
            <a-form layout="vertical">
              <a-form-item :label="t('dataExport.delimiter')">
                <a-select v-model:value="csvOptions.delimiter">
                  <a-select-option value=",">{{ t('dataImport.csv.comma') }} (,)</a-select-option>
                  <a-select-option value=";">{{ t('dataImport.csv.semicolon') }} (;)</a-select-option>
                  <a-select-option value="\t">{{ t('dataImport.csv.tab') }}</a-select-option>
                  <a-select-option value="|">{{ t('dataImport.csv.pipe') }} (|)</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item>
                <a-checkbox v-model:checked="csvOptions.includeHeader">
                  {{ t('dataExport.includeHeader') }}
                </a-checkbox>
              </a-form-item>
              <a-form-item>
                <a-checkbox v-model:checked="csvOptions.quoteStrings">
                  {{ t('dataExport.quoteStrings') }}
                </a-checkbox>
              </a-form-item>
            </a-form>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <!-- Excel Options -->
      <div v-if="exportFormat === 'excel'" class="options-section">
        <a-collapse>
          <a-collapse-panel key="1" :header="t('dataExport.advancedOptions')">
            <a-form layout="vertical">
              <a-form-item :label="t('dataExport.sheetName')">
                <a-input v-model:value="excelOptions.sheetName" />
              </a-form-item>
              <a-form-item>
                <a-checkbox v-model:checked="excelOptions.freezeHeader">
                  {{ t('dataExport.freezeHeader') }}
                </a-checkbox>
              </a-form-item>
              <a-form-item>
                <a-checkbox v-model:checked="excelOptions.autoFilter">
                  {{ t('dataExport.autoFilter') }}
                </a-checkbox>
              </a-form-item>
            </a-form>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <!-- JSON Options -->
      <div v-if="exportFormat === 'json'" class="options-section">
        <a-collapse>
          <a-collapse-panel key="1" :header="t('dataExport.advancedOptions')">
            <a-form layout="vertical">
              <a-form-item>
                <a-checkbox v-model:checked="jsonOptions.pretty">
                  {{ t('dataExport.prettyPrint') }}
                </a-checkbox>
              </a-form-item>
            </a-form>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <!-- Data Preview -->
      <div class="preview-section">
        <div class="preview-header">
          <span class="preview-title">{{ t('dataExport.preview') }}</span>
          <span class="preview-info">
            {{ t('dataExport.showingRows', { count: Math.min(5, data.length) }) }}
          </span>
        </div>
        <div class="preview-table-wrapper">
          <a-table
            :columns="previewColumns"
            :data-source="previewData"
            :pagination="false"
            :scroll="{ x: 'max-content', y: 200 }"
            size="small"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="modal-actions">
        <a-button @click="handleCancel" size="large">
          {{ t('common.actions.cancel') }}
        </a-button>
        <a-button
          type="primary"
          @click="handleExport"
          :loading="exporting"
          :disabled="!canExport"
          size="large"
        >
          <DownloadOutlined />
          {{ t('dataExport.export') }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined,
  FileExcelOutlined,
  FileOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import * as XLSX from 'xlsx'

const { t } = useI18n()

interface Props {
  open?: boolean
  data?: any[]
  columns?: string[]
  defaultFileName?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  data: () => [],
  columns: () => [],
  defaultFileName: 'export'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'exported': [fileName: string]
}>()

const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// State
const exportFormat = ref<'csv' | 'excel' | 'json'>('csv')
const fileName = ref('')
const exporting = ref(false)

// Options
const csvOptions = ref({
  delimiter: ',',
  includeHeader: true,
  quoteStrings: true
})

const excelOptions = ref({
  sheetName: 'Sheet1',
  freezeHeader: true,
  autoFilter: true
})

const jsonOptions = ref({
  pretty: true
})

// Watch for props changes
watch(() => props.open, (newVal) => {
  if (newVal) {
    fileName.value = props.defaultFileName || 'export'
  }
})

// Computed
const canExport = computed(() => {
  return props.data.length > 0 && fileName.value.trim() !== ''
})

const previewColumns = computed(() => {
  return props.columns.map(col => ({
    title: col,
    dataIndex: col,
    key: col,
    width: 150,
    ellipsis: true
  }))
})

const previewData = computed(() => {
  return props.data.slice(0, 5).map((row, index) => ({
    ...row,
    key: index
  }))
})

// Export Functions
function handleExport() {
  if (!canExport.value) {
    message.warning(t('dataExport.noData'))
    return
  }

  exporting.value = true

  try {
    switch (exportFormat.value) {
      case 'csv':
        exportAsCSV()
        break
      case 'excel':
        exportAsExcel()
        break
      case 'json':
        exportAsJSON()
        break
    }

    message.success(t('dataExport.success', { fileName: getFullFileName() }))
    emit('exported', getFullFileName())
    handleCancel()
  } catch (error: any) {
    message.error(t('dataExport.error', { error: error.message }))
  } finally {
    exporting.value = false
  }
}

function getFullFileName(): string {
  const ext = exportFormat.value === 'excel' ? 'xlsx' : exportFormat.value
  return `${fileName.value}.${ext}`
}

function exportAsCSV() {
  const { delimiter, includeHeader, quoteStrings } = csvOptions.value
  let csvContent = ''

  // Add header
  if (includeHeader) {
    csvContent += props.columns.map(col =>
      quoteStrings ? `"${col}"` : col
    ).join(delimiter) + '\n'
  }

  // Add data rows
  props.data.forEach(row => {
    const values = props.columns.map(col => {
      let value = row[col]
      if (value === null || value === undefined) {
        value = ''
      } else {
        value = String(value)
      }

      if (quoteStrings || value.includes(delimiter) || value.includes('\n') || value.includes('"')) {
        value = `"${value.replace(/"/g, '""')}"`
      }

      return value
    })
    csvContent += values.join(delimiter) + '\n'
  })

  downloadFile(csvContent, getFullFileName(), 'text/csv;charset=utf-8;')
}

function exportAsExcel() {
  const { sheetName, freezeHeader, autoFilter } = excelOptions.value

  // Create a new workbook
  const wb = XLSX.utils.book_new()

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(props.data, {
    header: props.columns
  })

  // Apply freeze header
  if (freezeHeader) {
    ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft' }
  }

  // Apply auto filter
  if (autoFilter && props.data.length > 0) {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) }
  }

  // Set column widths based on content
  const colWidths = props.columns.map(col => {
    const maxLength = Math.max(
      col.length,
      ...props.data.slice(0, 100).map(row => String(row[col] || '').length)
    )
    return { wch: Math.min(maxLength + 2, 50) }
  })
  ws['!cols'] = colWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Write file
  XLSX.writeFile(wb, getFullFileName())
}

function exportAsJSON() {
  const { pretty } = jsonOptions.value
  const jsonContent = pretty
    ? JSON.stringify(props.data, null, 2)
    : JSON.stringify(props.data)

  downloadFile(jsonContent, getFullFileName(), 'application/json;charset=utf-8;')
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function handleCancel() {
  visible.value = false
}
</script>

<style scoped lang="less">
.data-export-modal {
  .section-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #212121;
    margin-bottom: 12px;
  }

  .format-section {
    margin-bottom: 24px;

    :deep(.ant-radio-group) {
      display: flex;
      gap: 8px;

      .ant-radio-button-wrapper {
        flex: 1;
        text-align: center;
        height: 48px;
        line-height: 48px;
        border-radius: 6px;
        font-weight: 500;

        .anticon {
          margin-right: 8px;
          font-size: 16px;
        }
      }
    }
  }

  .data-info {
    margin-bottom: 20px;
  }

  .filename-section {
    margin-bottom: 20px;

    .file-extension {
      color: #5F6368;
      font-size: 13px;
      font-weight: 500;
    }
  }

  .options-section {
    margin-bottom: 20px;

    :deep(.ant-collapse) {
      background: #F8F9FA;
      border: 1px solid #E4E7EB;
      border-radius: 6px;

      .ant-collapse-header {
        font-weight: 500;
        color: #212121;
      }

      .ant-collapse-content-box {
        padding-top: 16px;
      }
    }
  }

  .preview-section {
    margin-bottom: 24px;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #F1F3F4;
      border-radius: 4px 4px 0 0;
      margin-bottom: 0;

      .preview-title {
        font-weight: 600;
        color: #212121;
      }

      .preview-info {
        font-size: 12px;
        color: #5F6368;
      }
    }

    .preview-table-wrapper {
      border: 1px solid #E4E7EB;
      border-radius: 0 0 4px 4px;
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
