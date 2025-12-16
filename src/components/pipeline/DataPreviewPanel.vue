<template>
  <div class="data-preview-panel">
    <!-- 左侧：节点信息 -->
    <div class="panel-sidebar">
      <div class="sidebar-section">
        <h3>About</h3>
        <div v-if="node" class="node-info">
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">{{ node.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Type:</span>
            <span class="info-value">{{ getNodeTypeLabel(node.type) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Updated:</span>
            <span class="info-value">{{ formatDate(new Date()) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Created:</span>
            <span class="info-value">{{ formatDate(new Date()) }}</span>
          </div>
        </div>

        <a-textarea
          v-model:value="description"
          placeholder="Enter description..."
          :rows="3"
          class="description-input"
        />
      </div>

      <div class="sidebar-section">
        <h3>Columns</h3>
        <a-input-search
          v-model:value="columnSearch"
          placeholder="Search 5 columns..."
          size="small"
          class="column-search"
        />
        <div class="column-list">
          <div
            v-for="col in filteredColumns"
            :key="col.name"
            class="column-item"
            :class="{ selected: selectedColumn === col.name }"
            @click="selectedColumn = col.name"
          >
            <component :is="getColumnIcon(col.type)" class="column-icon" />
            <span class="column-name">{{ col.name }}</span>
            <span class="column-type-tag">{{ col.type }}</span>
          </div>
        </div>
      </div>

      <div class="sidebar-section">
        <h3>Schedules</h3>
        <a-empty :image="false" description="No schedules" style="margin: 20px 0" />
      </div>
    </div>

    <!-- 右侧：数据表格 -->
    <div class="panel-content">
      <!-- 工具栏 -->
      <div class="data-toolbar">
        <!-- 数据集选择器 -->
        <div v-if="mode === 'input'" class="dataset-selector">
          <a-select
            v-model:value="selectedDataset"
            size="small"
            style="width: 200px"
            @change="handleDatasetChange"
          >
            <a-select-option value="products">
              <DatabaseOutlined /> products
            </a-select-option>
            <a-select-option value="customers">
              <DatabaseOutlined /> customers
            </a-select-option>
            <a-select-option value="transactions">
              <DatabaseOutlined /> transactions
            </a-select-option>
          </a-select>
        </div>

        <div class="toolbar-spacer"></div>

        <!-- 导出按钮组 -->
        <div class="export-actions">
          <a-dropdown :trigger="['click']">
            <a-button size="small" type="default">
              <DownloadOutlined />
              Export
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu @click="handleExport">
                <a-menu-item key="csv">
                  <FileTextOutlined />
                  Export as CSV
                </a-menu-item>
                <a-menu-item key="excel">
                  <FileExcelOutlined />
                  Export as Excel
                </a-menu-item>
                <a-menu-item key="json">
                  <FileOutlined />
                  Export as JSON
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <a-tooltip title="Rows count">
            <a-tag class="row-count-tag">
              {{ tableData.length }} rows
            </a-tag>
          </a-tooltip>
        </div>
      </div>

      <!-- 数据表格 -->
      <DataTable
        ref="tableRef"
        :data="tableData"
        :columns="tableColumns"
        :loading="loading"
        :height="tableHeight"
        @column:sort="handleSort"
        @column:filter="handleFilter"
        @column:transform="handleTransform"
      />

      <!-- 统计信息 -->
      <div v-if="selectedColumn" class="column-stats">
        <h4>Column Statistics: {{ selectedColumn }}</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Normal:</span>
            <span class="stat-value">{{ columnStats.normal }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Null:</span>
            <span class="stat-value">{{ columnStats.null }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Empty:</span>
            <span class="stat-value">{{ columnStats.empty }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Whitespace:</span>
            <span class="stat-value">{{ columnStats.whitespace }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mini Graph (右下角) -->
    <div class="mini-graph">
      <a-tooltip title="Show mini graph">
        <DatabaseOutlined />
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  DatabaseOutlined,
  FileTextOutlined,
  NumberOutlined,
  CalendarOutlined,
  CheckOutlined,
  DownloadOutlined,
  DownOutlined,
  FileExcelOutlined,
  FileOutlined
} from '@ant-design/icons-vue'
import DataTable from './DataTable.vue'
import type { Node } from '@/stores/modules/pipeline'
import { usePipelineStore } from '@/stores/modules/pipeline'
import { getDatasetDataById, getDatasetMetaById } from '@/mock/datasets'
import { exportData } from '@/utils/export'

interface Props {
  node?: Node
  mode?: 'input' | 'output' | 'preview'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview'
})

const emit = defineEmits<{
  'column:transform': [column: string]
}>()

const pipelineStore = usePipelineStore()

const tableRef = ref()
const loading = ref(false)
const description = ref('')
const columnSearch = ref('')
const selectedColumn = ref('')
const selectedDataset = ref('products')

// 表格数据
const tableData = ref<any[]>([])
const tableColumns = ref<any[]>([])

// 表格高度
const tableHeight = computed(() => {
  return selectedColumn.value ? 300 : 400
})

// 过滤后的列
const filteredColumns = computed(() => {
  if (!columnSearch.value) return tableColumns.value

  const search = columnSearch.value.toLowerCase()
  return tableColumns.value.filter(col =>
    col.name.toLowerCase().includes(search)
  )
})

// 列统计信息
const columnStats = computed(() => {
  if (!selectedColumn.value || tableData.value.length === 0) {
    return { normal: 0, null: 0, empty: 0, whitespace: 0 }
  }

  const values = tableData.value.map(row => row[selectedColumn.value])
  return {
    normal: values.filter(v => v != null && v !== '' && String(v).trim() !== '').length,
    null: values.filter(v => v == null).length,
    empty: values.filter(v => v === '').length,
    whitespace: values.filter(v => v != null && v !== '' && String(v).trim() === '').length
  }
})

// 获取节点类型标签
function getNodeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    dataset: 'Dataset',
    transform: 'Transform',
    join: 'Join',
    output: 'Output'
  }
  return labels[type] || type
}

// 获取列图标
function getColumnIcon(type: string) {
  const icons: Record<string, any> = {
    String: FileTextOutlined,
    Number: NumberOutlined,
    Date: CalendarOutlined,
    Boolean: CheckOutlined
  }
  return icons[type] || FileTextOutlined
}

// 格式化日期
function formatDate(date: Date): string {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// 加载数据
async function loadData() {
  loading.value = true

  try {
    if (props.node) {
      // 从store获取节点数据
      const data = await pipelineStore.getNodeData(props.node.id)

      // 验证数据有效性
      if (!data) {
        message.warning('No data available for this node')
        tableData.value = []
        tableColumns.value = []
        return
      }

      tableData.value = data

      // 检测列
      if (data.length > 0) {
        const firstRow = data[0]
        tableColumns.value = Object.keys(firstRow).map(key => ({
          name: key,
          type: detectType(firstRow[key])
        }))
      }
    } else if (props.mode === 'input') {
      // 输入表格模式：加载指定数据集
      const data = getDatasetDataById(selectedDataset.value)
      const meta = getDatasetMetaById(selectedDataset.value)

      // 验证数据集存在
      if (!data || !meta) {
        message.error(`Dataset not found: ${selectedDataset.value}`)
        tableData.value = []
        tableColumns.value = []
        return
      }

      tableData.value = data
      tableColumns.value = meta.columns
    }
  } catch (error: any) {
    message.error('Failed to load data: ' + error.message)
    tableData.value = []
    tableColumns.value = []
  } finally {
    loading.value = false
  }
}

// 检测数据类型
function detectType(value: any): 'String' | 'Number' | 'Date' | 'Boolean' {
  if (typeof value === 'boolean') return 'Boolean'
  if (typeof value === 'number') return 'Number'
  if (value instanceof Date || /^\d{4}-\d{2}-\d{2}/.test(value)) return 'Date'
  return 'String'
}

// 数据集变化
function handleDatasetChange() {
  loadData()
}

// 排序
function handleSort(payload: { column: string; order: 'asc' | 'desc' }) {
  console.log('Sort:', payload)
}

// 筛选
function handleFilter(column: string) {
  console.log('Filter:', column)
}

// 转换
function handleTransform(column: string) {
  emit('column:transform', column)
}

// 导出数据
function handleExport({ key }: { key: string }) {
  try {
    if (!tableData.value || tableData.value.length === 0) {
      message.warning('No data to export')
      return
    }

    // 准备列信息
    const columns = tableColumns.value.map(col => ({
      name: col.title || col.dataIndex,
      dataIndex: col.dataIndex
    }))

    // 生成文件名
    const nodeName = props.node?.name || 'data'
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const filename = `${nodeName}_${timestamp}`

    // 导出数据
    exportData(tableData.value, columns, {
      format: key as 'csv' | 'excel' | 'json',
      filename
    })

    message.success(`Successfully exported ${tableData.value.length} rows as ${key.toUpperCase()}`)
  } catch (error: any) {
    message.error(`Export failed: ${error.message}`)
    console.error('Export error:', error)
  }
}

// 监听节点变化
watch(
  () => props.node,
  () => {
    if (props.node) {
      loadData()
    }
  },
  { immediate: true }
)

// 初始加载
if (props.mode === 'input') {
  loadData()
}
</script>

<style scoped lang="less">
.data-preview-panel {
  display: flex;
  height: 100%;
  background: #FFFFFF;
  position: relative;
}

.panel-sidebar {
  width: 240px;
  border-right: 1px solid #E4E7EB;
  overflow-y: auto;
  flex-shrink: 0;

  .sidebar-section {
    padding: 16px;
    border-bottom: 1px solid #E4E7EB;

    h3 {
      font-size: 13px;
      font-weight: 600;
      color: #212121;
      margin: 0 0 12px 0;
    }

    .node-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;

      .info-item {
        display: flex;
        justify-content: space-between;
        font-size: 12px;

        .info-label {
          color: #5F6368;
        }

        .info-value {
          color: #212121;
          font-weight: 500;
        }
      }
    }

    .description-input {
      font-size: 12px;
      margin-top: 8px;
    }

    .column-search {
      margin-bottom: 12px;
    }

    .column-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 300px;
      overflow-y: auto;

      .column-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.15s;

        &:hover {
          background: #F5F6F7;
        }

        &.selected {
          background: #E8F0FE;

          .column-name {
            color: #2D6EED;
            font-weight: 500;
          }
        }

        .column-icon {
          width: 14px;
          height: 14px;
          color: #5F6368;
          flex-shrink: 0;
        }

        .column-name {
          flex: 1;
          color: #212121;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .column-type-tag {
          font-size: 10px;
          color: #80868B;
          background: #E8EAED;
          padding: 2px 4px;
          border-radius: 2px;
          flex-shrink: 0;
        }
      }
    }
  }
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .data-toolbar {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #E4E7EB;
    background: #FFFFFF;
    gap: 12px;

    .dataset-selector {
      // 数据集选择器样式已内联
    }

    .toolbar-spacer {
      flex: 1;
    }

    .export-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .row-count-tag {
        font-size: 12px;
        padding: 2px 10px;
        border-radius: 12px;
        background: #F5F6F7;
        border: 1px solid #E4E7EB;
        color: #5F6368;
        font-weight: 500;
      }
    }
  }

  .column-stats {
    padding: 16px;
    border-top: 1px solid #E4E7EB;
    background: #F5F6F7;

    h4 {
      font-size: 13px;
      font-weight: 600;
      color: #212121;
      margin: 0 0 12px 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .stat-label {
          font-size: 11px;
          color: #5F6368;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 16px;
          color: #212121;
          font-weight: 600;
        }
      }
    }
  }
}

.mini-graph {
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 40px;
  height: 40px;
  background: #FFFFFF;
  border: 1px solid #D0D5DD;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    border-color: #2D6EED;
    color: #2D6EED;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}
</style>
