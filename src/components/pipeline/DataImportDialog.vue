<template>
  <a-modal
    v-model:open="visible"
    title="Import Data"
    width="800px"
    :footer="null"
    @cancel="handleClose"
  >
    <div class="data-import-dialog">
      <!-- Import Method Selection -->
      <div class="import-method-section">
        <label class="section-label">Import Method</label>
        <a-radio-group v-model:value="importMethod" button-style="solid">
          <a-radio-button value="csv">CSV File</a-radio-button>
          <a-radio-button value="json">JSON File</a-radio-button>
          <a-radio-button value="manual">Manual Input</a-radio-button>
        </a-radio-group>
      </div>

      <!-- CSV File Upload -->
      <div v-if="importMethod === 'csv'" class="upload-section">
        <a-upload-dragger
          v-model:fileList="fileList"
          :before-upload="beforeUpload"
          :customRequest="handleUpload"
          accept=".csv,.txt"
          :max-count="1"
        >
          <p class="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text">Click or drag CSV file to this area to upload</p>
          <p class="ant-upload-hint">
            Support for CSV files with comma, semicolon, or tab delimiters
          </p>
        </a-upload-dragger>

        <!-- CSV Options -->
        <div v-if="fileList.length > 0" class="csv-options">
          <h4>CSV Options</h4>

          <div class="option-row">
            <label>Delimiter:</label>
            <a-select v-model:value="csvOptions.delimiter" style="width: 150px">
              <a-select-option value=",">Comma (,)</a-select-option>
              <a-select-option value=";">Semicolon (;)</a-select-option>
              <a-select-option value="\t">Tab (\t)</a-select-option>
              <a-select-option value="|">Pipe (|)</a-select-option>
            </a-select>
          </div>

          <div class="option-row">
            <a-checkbox v-model:checked="csvOptions.hasHeader">
              First row is header
            </a-checkbox>
          </div>

          <div class="option-row">
            <a-checkbox v-model:checked="csvOptions.skipEmptyLines">
              Skip empty lines
            </a-checkbox>
          </div>
        </div>
      </div>

      <!-- JSON File Upload -->
      <div v-else-if="importMethod === 'json'" class="upload-section">
        <a-upload-dragger
          v-model:fileList="fileList"
          :before-upload="beforeUpload"
          :customRequest="handleUpload"
          accept=".json"
          :max-count="1"
        >
          <p class="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text">Click or drag JSON file to this area to upload</p>
          <p class="ant-upload-hint">
            Support for JSON array format: [{"col1": "value1", "col2": "value2"}, ...]
          </p>
        </a-upload-dragger>
      </div>

      <!-- Manual Input -->
      <div v-else-if="importMethod === 'manual'" class="manual-input-section">
        <a-textarea
          v-model:value="manualInput"
          placeholder="Paste your data here (CSV format)&#10;Example:&#10;Name,Age,City&#10;John,25,New York&#10;Jane,30,Los Angeles"
          :rows="10"
          class="manual-input-textarea"
        />

        <div class="manual-options">
          <div class="option-row">
            <label>Delimiter:</label>
            <a-select v-model:value="csvOptions.delimiter" style="width: 150px">
              <a-select-option value=",">Comma (,)</a-select-option>
              <a-select-option value=";">Semicolon (;)</a-select-option>
              <a-select-option value="\t">Tab (\t)</a-select-option>
            </a-select>
          </div>

          <div class="option-row">
            <a-checkbox v-model:checked="csvOptions.hasHeader">
              First row is header
            </a-checkbox>
          </div>
        </div>
      </div>

      <!-- Data Preview -->
      <div v-if="previewData.length > 0" class="preview-section">
        <div class="preview-header">
          <h4>Data Preview</h4>
          <span class="preview-stats">
            {{ previewData.length }} rows × {{ previewColumns.length }} columns
          </span>
        </div>

        <div class="preview-table-wrapper">
          <table class="preview-table">
            <thead>
              <tr>
                <th v-for="col in previewColumns" :key="col" class="preview-th">
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in previewData.slice(0, 5)" :key="index">
                <td v-for="col in previewColumns" :key="col" class="preview-td">
                  {{ row[col] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="previewData.length > 5" class="preview-footer">
          Showing first 5 rows of {{ previewData.length }}
        </div>
      </div>

      <!-- Error Message -->
      <a-alert
        v-if="errorMessage"
        :message="errorMessage"
        type="error"
        show-icon
        closable
        @close="errorMessage = ''"
        style="margin-top: 16px"
      />

      <!-- Action Buttons -->
      <div class="dialog-footer">
        <a-button @click="handleClose">Cancel</a-button>
        <a-button
          type="primary"
          :disabled="!canImport"
          :loading="importing"
          @click="handleImport"
        >
          Import Data
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'import', data: { data: any[], columns: any[], name: string }): void
}>()

// State
const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const importMethod = ref<'csv' | 'json' | 'manual'>('csv')
const fileList = ref<any[]>([])
const manualInput = ref('')
const importing = ref(false)
const errorMessage = ref('')

const csvOptions = ref({
  delimiter: ',',
  hasHeader: true,
  skipEmptyLines: true
})

const previewData = ref<any[]>([])
const previewColumns = ref<string[]>([])
const fileName = ref('')

// Computed
const canImport = computed(() => {
  return previewData.value.length > 0 && previewColumns.value.length > 0
})

// Watch for manual input changes
watch(manualInput, (newVal) => {
  if (newVal && importMethod.value === 'manual') {
    parseManualInput(newVal)
  }
})

// Methods
function beforeUpload(file: File) {
  const isValidSize = file.size / 1024 / 1024 < 10 // 10MB limit
  if (!isValidSize) {
    message.error('File must be smaller than 10MB!')
    return false
  }
  return false // Prevent auto upload
}

function handleUpload(info: any) {
  const file = info.file
  fileName.value = file.name

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string

    if (importMethod.value === 'csv') {
      parseCSV(content)
    } else if (importMethod.value === 'json') {
      parseJSON(content)
    }
  }
  reader.readAsText(file)
}

function parseCSV(content: string) {
  try {
    errorMessage.value = ''
    const lines = content.split('\n').filter(line => {
      if (csvOptions.value.skipEmptyLines) {
        return line.trim() !== ''
      }
      return true
    })

    if (lines.length === 0) {
      errorMessage.value = 'File is empty'
      return
    }

    const delimiter = csvOptions.value.delimiter === '\t' ? '\t' : csvOptions.value.delimiter

    // Parse header
    let headers: string[]
    let dataStartIndex = 0

    if (csvOptions.value.hasHeader) {
      headers = parseCSVLine(lines[0], delimiter)
      dataStartIndex = 1
    } else {
      const firstLine = parseCSVLine(lines[0], delimiter)
      headers = firstLine.map((_, index) => `Column${index + 1}`)
      dataStartIndex = 0
    }

    // Parse data rows
    const data: any[] = []
    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = parseCSVLine(line, delimiter)
      const row: any = {}

      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      data.push(row)
    }

    previewData.value = data
    previewColumns.value = headers
    message.success(`Loaded ${data.length} rows`)
  } catch (error: any) {
    errorMessage.value = `Failed to parse CSV: ${error.message}`
    previewData.value = []
    previewColumns.value = []
  }
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

function parseJSON(content: string) {
  try {
    errorMessage.value = ''
    const data = JSON.parse(content)

    if (!Array.isArray(data)) {
      errorMessage.value = 'JSON must be an array of objects'
      return
    }

    if (data.length === 0) {
      errorMessage.value = 'JSON array is empty'
      return
    }

    // Extract columns from first object
    const columns = Object.keys(data[0])

    previewData.value = data
    previewColumns.value = columns
    message.success(`Loaded ${data.length} rows`)
  } catch (error: any) {
    errorMessage.value = `Failed to parse JSON: ${error.message}`
    previewData.value = []
    previewColumns.value = []
  }
}

function parseManualInput(content: string) {
  parseCSV(content)
}

function handleImport() {
  if (!canImport.value) {
    message.warning('No data to import')
    return
  }

  importing.value = true

  setTimeout(() => {
    // Generate columns with types
    const columns = previewColumns.value.map(name => ({
      name,
      type: inferColumnType(previewData.value, name)
    }))

    emit('import', {
      data: previewData.value,
      columns,
      name: fileName.value || 'Imported Data'
    })

    message.success('Data imported successfully')
    importing.value = false
    handleClose()
  }, 500)
}

function inferColumnType(data: any[], columnName: string): string {
  const sample = data.slice(0, 100) // Sample first 100 rows
  let hasNumber = false
  let hasString = false
  let hasBoolean = false

  for (const row of sample) {
    const value = row[columnName]
    if (value === null || value === undefined || value === '') continue

    if (typeof value === 'boolean' || value === 'true' || value === 'false') {
      hasBoolean = true
    } else if (!isNaN(Number(value))) {
      hasNumber = true
    } else {
      hasString = true
    }
  }

  if (hasBoolean && !hasString && !hasNumber) return 'Boolean'
  if (hasNumber && !hasString) return 'Number'
  return 'String'
}

function handleClose() {
  emit('update:open', false)
  // Reset state
  setTimeout(() => {
    fileList.value = []
    manualInput.value = ''
    previewData.value = []
    previewColumns.value = []
    errorMessage.value = ''
    fileName.value = ''
  }, 300)
}
</script>

<style scoped lang="less">
.data-import-dialog {
  .import-method-section {
    margin-bottom: 24px;

    .section-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #212121;
      margin-bottom: 12px;
    }
  }

  .upload-section {
    margin-bottom: 24px;

    :deep(.ant-upload-drag) {
      background: #FAFAFA;
      border: 2px dashed #D9D9D9;
      border-radius: 8px;

      &:hover {
        border-color: #1570EF;
      }
    }

    .ant-upload-drag-icon {
      font-size: 48px;
      color: #1570EF;
    }

    .ant-upload-text {
      font-size: 16px;
      color: #212121;
      margin-top: 8px;
    }

    .ant-upload-hint {
      font-size: 14px;
      color: #5F6368;
    }
  }

  .csv-options,
  .manual-options {
    margin-top: 20px;
    padding: 16px;
    background: #F8F9FA;
    border-radius: 6px;

    h4 {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 600;
      color: #212121;
    }

    .option-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        font-size: 13px;
        color: #5F6368;
        min-width: 80px;
      }
    }
  }

  .manual-input-section {
    .manual-input-textarea {
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }

    .manual-options {
      margin-top: 16px;
    }
  }

  .preview-section {
    margin-top: 24px;
    padding: 16px;
    background: #F8F9FA;
    border-radius: 6px;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #212121;
      }

      .preview-stats {
        font-size: 13px;
        color: #5F6368;
      }
    }

    .preview-table-wrapper {
      max-height: 300px;
      overflow: auto;
      border: 1px solid #E4E7EB;
      border-radius: 4px;
      background: #FFFFFF;
    }

    .preview-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      .preview-th {
        position: sticky;
        top: 0;
        background: #F0F0F0;
        font-weight: 600;
        color: #212121;
        padding: 8px 12px;
        text-align: left;
        border-bottom: 2px solid #E4E7EB;
        white-space: nowrap;
      }

      .preview-td {
        padding: 8px 12px;
        border-bottom: 1px solid #F0F0F0;
        color: #5F6368;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      tbody tr:hover {
        background: #F8F9FA;
      }
    }

    .preview-footer {
      margin-top: 12px;
      font-size: 12px;
      color: #5F6368;
      text-align: center;
    }
  }

  .dialog-footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

// Scrollbar styling
.preview-table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.preview-table-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.preview-table-wrapper::-webkit-scrollbar-thumb {
  background: #D0D5DD;
  border-radius: 3px;

  &:hover {
    background: #98A2B3;
  }
}
</style>
