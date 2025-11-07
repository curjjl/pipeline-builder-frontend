<template>
  <div class="data-table-container">
    <!-- 表格工具栏 -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <span class="table-info">
          Showing {{ displayedData.length }} rows
        </span>
        <span class="table-info">
          {{ columns.length }} columns
        </span>
      </div>

      <div class="toolbar-right">
        <a-input-search
          v-model:value="searchText"
          placeholder="Search columns..."
          size="small"
          style="width: 200px"
          @change="handleSearch"
        />
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-wrapper">
      <a-table
        :columns="tableColumns"
        :data-source="displayedData"
        :scroll="{ x: 'max-content', y: tableHeight }"
        :pagination="paginationConfig"
        size="small"
        :row-key="getRowKey"
        :loading="loading"
        @change="handleTableChange"
      >
        <!-- 自定义列头 -->
        <template #headerCell="{ column }">
          <div class="column-header">
            <span class="column-name">{{ column.title }}</span>
            <span class="column-type">{{ column.dataType }}</span>
            <a-dropdown :trigger="['click']">
              <DownOutlined class="column-menu-icon" @click.stop />
              <template #overlay>
                <a-menu @click="(e) => handleColumnMenu(e.key, column)">
                  <a-menu-item key="sort-asc">
                    <SortAscendingOutlined /> Sort ascending
                  </a-menu-item>
                  <a-menu-item key="sort-desc">
                    <SortDescendingOutlined /> Sort descending
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="filter">
                    <FilterOutlined /> Filter
                  </a-menu-item>
                  <a-menu-item key="hide">
                    <EyeInvisibleOutlined /> Hide column
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="copy">
                    <CopyOutlined /> Copy column name
                  </a-menu-item>
                  <a-menu-item key="transform">
                    <FunctionOutlined /> Transform column
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </template>

        <!-- 自定义单元格 -->
        <template #bodyCell="{ column, text, record }">
          <div class="table-cell" :title="text">
            {{ formatCellValue(text, column.dataType) }}
          </div>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  DownOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  FilterOutlined,
  EyeInvisibleOutlined,
  CopyOutlined,
  FunctionOutlined
} from '@ant-design/icons-vue'

interface Column {
  name: string
  type: 'String' | 'Number' | 'Date' | 'Boolean'
}

interface Props {
  data: any[]
  columns?: Column[]
  loading?: boolean
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  loading: false,
  height: 400
})

const emit = defineEmits<{
  'column:sort': [payload: { column: string; order: 'asc' | 'desc' }]
  'column:filter': [column: string]
  'column:transform': [column: string]
}>()

const searchText = ref('')
const sortColumn = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')
const hiddenColumns = ref<Set<string>>(new Set())

// 表格高度
const tableHeight = computed(() => props.height - 50)

// 检测列
const detectedColumns = computed<Column[]>(() => {
  if (props.columns.length > 0) {
    return props.columns
  }

  if (props.data.length === 0) {
    return []
  }

  const firstRow = props.data[0]
  return Object.keys(firstRow).map(key => ({
    name: key,
    type: detectType(firstRow[key])
  }))
})

// 表格列配置
const tableColumns = computed(() => {
  return detectedColumns.value
    .filter(col => !hiddenColumns.value.has(col.name))
    .map(col => ({
      title: col.name,
      dataIndex: col.name,
      key: col.name,
      dataType: col.type,
      width: 150,
      ellipsis: true,
      sorter: true
    }))
})

// 显示的数据
const displayedData = computed(() => {
  let result = [...props.data]

  // 搜索过滤
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    result = result.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchLower)
      )
    )
  }

  // 排序
  if (sortColumn.value) {
    result.sort((a, b) => {
      const aVal = a[sortColumn.value]
      const bVal = b[sortColumn.value]

      let comparison = 0
      if (aVal < bVal) comparison = -1
      if (aVal > bVal) comparison = 1

      return sortOrder.value === 'desc' ? -comparison : comparison
    })
  }

  return result
})

// 分页配置
const paginationConfig = computed(() => ({
  pageSize: 50,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `Total ${total} rows`,
  pageSizeOptions: ['20', '50', '100', '200']
}))

// 检测数据类型
function detectType(value: any): 'String' | 'Number' | 'Date' | 'Boolean' {
  if (typeof value === 'boolean') return 'Boolean'
  if (typeof value === 'number') return 'Number'
  if (value instanceof Date || /^\d{4}-\d{2}-\d{2}/.test(value)) return 'Date'
  return 'String'
}

// 格式化单元格值
function formatCellValue(value: any, type: string): string {
  if (value == null || value === '') {
    return '—'
  }

  switch (type) {
    case 'Number':
      return typeof value === 'number' ? value.toLocaleString() : value
    case 'Date':
      if (value instanceof Date) {
        return value.toLocaleDateString()
      }
      return value
    case 'Boolean':
      return value ? 'true' : 'false'
    default:
      return String(value)
  }
}

// 搜索处理
function handleSearch() {
  // 搜索由computed自动处理
}

// 获取行键
function getRowKey(record: any) {
  // 尝试使用常见的 ID 字段
  if (record.id) return String(record.id)
  if (record._id) return String(record._id)
  if (record.key) return String(record.key)

  // 使用所有字段的组合作为唯一键
  return JSON.stringify(record)
}

// 表格变化处理
function handleTableChange(pagination: any, filters: any, sorter: any) {
  if (sorter.columnKey) {
    sortColumn.value = sorter.columnKey
    sortOrder.value = sorter.order === 'descend' ? 'desc' : 'asc'

    emit('column:sort', {
      column: sorter.columnKey,
      order: sortOrder.value
    })
  }
}

// 列菜单处理
function handleColumnMenu(key: string, column: any) {
  switch (key) {
    case 'sort-asc':
      sortColumn.value = column.dataIndex
      sortOrder.value = 'asc'
      emit('column:sort', { column: column.dataIndex, order: 'asc' })
      break

    case 'sort-desc':
      sortColumn.value = column.dataIndex
      sortOrder.value = 'desc'
      emit('column:sort', { column: column.dataIndex, order: 'desc' })
      break

    case 'filter':
      emit('column:filter', column.dataIndex)
      break

    case 'hide':
      hiddenColumns.value.add(column.dataIndex)
      message.success(`Column "${column.title}" hidden`)
      break

    case 'copy':
      navigator.clipboard.writeText(column.dataIndex)
      message.success('Column name copied')
      break

    case 'transform':
      emit('column:transform', column.dataIndex)
      break
  }
}

// 列属性
const columns = computed(() => detectedColumns.value)

// 暴露方法
defineExpose({
  columns,
  showColumn: (name: string) => hiddenColumns.value.delete(name),
  hideColumn: (name: string) => hiddenColumns.value.add(name),
  resetHiddenColumns: () => hiddenColumns.value.clear()
})
</script>

<style scoped lang="less">
.data-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FFFFFF;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #E4E7EB;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .table-info {
      font-size: 13px;
      color: #5F6368;
    }
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.table-wrapper {
  flex: 1;
  overflow: hidden;

  :deep(.ant-table) {
    font-size: 13px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #F5F6F7;
    border-bottom: 1px solid #E4E7EB;
    padding: 12px 16px;
    font-size: 12px;
    font-weight: 600;
    color: #5F6368;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:hover {
      background: #ECEEF1;
    }
  }

  :deep(.ant-table-tbody > tr) {
    &:hover > td {
      background: #F5F6F7;
    }

    > td {
      border-bottom: 1px solid #E4E7EB;
      padding: 12px 16px;
    }
  }

  .column-header {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    .column-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .column-type {
      font-size: 10px;
      color: #80868B;
      background: #E8EAED;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
      font-weight: 500;
    }

    .column-menu-icon {
      font-size: 10px;
      color: #98A2B3;
      transition: color 0.2s;

      &:hover {
        color: #2D6EED;
      }
    }
  }

  .table-cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #212121;
  }
}
</style>
