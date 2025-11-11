<template>
  <div class="transform-config-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="header-left">
        <FunctionOutlined class="header-icon" />
        <h3>Transform Configuration</h3>
      </div>
      <a-button type="text" size="small" @click="handleClose">
        <CloseOutlined />
      </a-button>
    </div>

    <!-- Node Info -->
    <div class="node-info-section" v-if="node">
      <div class="info-row">
        <span class="info-label">Node:</span>
        <span class="info-value">{{ node.name }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Type:</span>
        <a-tag color="purple">Transform</a-tag>
      </div>
    </div>

    <a-divider style="margin: 12px 0" />

    <!-- Transform Type Selection -->
    <div class="config-section">
      <label class="section-label">Transformation Type</label>
      <a-select
        v-model:value="transformConfig.type"
        style="width: 100%"
        size="large"
        @change="handleTypeChange"
      >
        <a-select-option value="filter">
          <FilterOutlined style="margin-right: 8px" />
          Filter Rows
        </a-select-option>
        <a-select-option value="select">
          <CheckSquareOutlined style="margin-right: 8px" />
          Select Columns
        </a-select-option>
        <a-select-option value="clean">
          <ClearOutlined style="margin-right: 8px" />
          Clean Data
        </a-select-option>
        <a-select-option value="rename">
          <EditOutlined style="margin-right: 8px" />
          Rename Columns
        </a-select-option>
        <a-select-option value="aggregate">
          <GroupOutlined style="margin-right: 8px" />
          Aggregate
        </a-select-option>
        <a-select-option value="sort">
          <SortAscendingOutlined style="margin-right: 8px" />
          Sort
        </a-select-option>
      </a-select>
    </div>

    <!-- Dynamic Configuration Based on Type -->
    <div class="config-content">
      <!-- Filter Configuration -->
      <div v-if="transformConfig.type === 'filter'" class="transform-type-config">
        <h4 class="config-title">Filter Conditions</h4>
        <p class="config-desc">Keep only rows that match the following conditions</p>

        <div
          v-for="(condition, index) in filterConditions"
          :key="index"
          class="condition-row"
        >
          <a-select
            v-model:value="condition.column"
            placeholder="Select column"
            style="flex: 1"
          >
            <a-select-option
              v-for="col in availableColumns"
              :key="col.name"
              :value="col.name"
            >
              {{ col.name }} ({{ col.type }})
            </a-select-option>
          </a-select>

          <a-select v-model:value="condition.operator" style="width: 120px">
            <a-select-option value="equals">Equals</a-select-option>
            <a-select-option value="not_equals">Not Equals</a-select-option>
            <a-select-option value="contains">Contains</a-select-option>
            <a-select-option value="greater_than">Greater Than</a-select-option>
            <a-select-option value="less_than">Less Than</a-select-option>
            <a-select-option value="is_null">Is Null</a-select-option>
            <a-select-option value="not_null">Not Null</a-select-option>
          </a-select>

          <a-input
            v-if="!['is_null', 'not_null'].includes(condition.operator)"
            v-model:value="condition.value"
            placeholder="Value"
            style="flex: 1"
          />

          <a-button
            type="text"
            danger
            @click="removeCondition(index)"
            :disabled="filterConditions.length === 1"
          >
            <DeleteOutlined />
          </a-button>
        </div>

        <a-button block @click="addCondition" style="margin-top: 12px">
          <PlusOutlined /> Add Condition
        </a-button>
      </div>

      <!-- Select Columns Configuration -->
      <div v-else-if="transformConfig.type === 'select'" class="transform-type-config">
        <h4 class="config-title">Select Columns</h4>
        <p class="config-desc">Choose which columns to keep in the output</p>

        <a-checkbox-group
          v-model:value="selectedColumns"
          style="width: 100%"
        >
          <div class="columns-list">
            <div
              v-for="col in availableColumns"
              :key="col.name"
              class="column-checkbox-item"
            >
              <a-checkbox :value="col.name">
                <component :is="getColumnIcon(col.type)" class="column-type-icon" />
                {{ col.name }}
                <a-tag size="small" :color="getColumnTypeColor(col.type)">
                  {{ col.type }}
                </a-tag>
              </a-checkbox>
            </div>
          </div>
        </a-checkbox-group>

        <div class="selection-summary">
          Selected: {{ selectedColumns.length }} / {{ availableColumns.length }} columns
        </div>
      </div>

      <!-- Clean Data Configuration -->
      <div v-else-if="transformConfig.type === 'clean'" class="transform-type-config">
        <h4 class="config-title">Data Cleaning Options</h4>
        <p class="config-desc">Apply common data cleaning operations</p>

        <div class="clean-options">
          <a-checkbox v-model:checked="cleanOptions.removeNulls">
            Remove rows with null values
          </a-checkbox>
          <a-checkbox v-model:checked="cleanOptions.removeDuplicates">
            Remove duplicate rows
          </a-checkbox>
          <a-checkbox v-model:checked="cleanOptions.trimWhitespace">
            Trim whitespace from text columns
          </a-checkbox>
          <a-checkbox v-model:checked="cleanOptions.standardizeCase">
            Standardize text case (lowercase)
          </a-checkbox>
        </div>

        <div class="clean-column-selection" v-if="cleanOptions.removeNulls">
          <label class="section-label">Columns to check for nulls:</label>
          <a-select
            v-model:value="cleanOptions.nullCheckColumns"
            mode="multiple"
            placeholder="Select columns"
            style="width: 100%"
          >
            <a-select-option
              v-for="col in availableColumns"
              :key="col.name"
              :value="col.name"
            >
              {{ col.name }}
            </a-select-option>
          </a-select>
        </div>
      </div>

      <!-- Rename Columns Configuration -->
      <div v-else-if="transformConfig.type === 'rename'" class="transform-type-config">
        <h4 class="config-title">Rename Columns</h4>
        <p class="config-desc">Change column names</p>

        <div
          v-for="(rename, index) in renameColumns"
          :key="index"
          class="rename-row"
        >
          <a-select
            v-model:value="rename.from"
            placeholder="Original name"
            style="flex: 1"
          >
            <a-select-option
              v-for="col in availableColumns"
              :key="col.name"
              :value="col.name"
            >
              {{ col.name }}
            </a-select-option>
          </a-select>

          <ArrowRightOutlined style="margin: 0 12px; color: #98A2B3;" />

          <a-input
            v-model:value="rename.to"
            placeholder="New name"
            style="flex: 1"
          />

          <a-button
            type="text"
            danger
            @click="removeRename(index)"
            :disabled="renameColumns.length === 1"
          >
            <DeleteOutlined />
          </a-button>
        </div>

        <a-button block @click="addRename" style="margin-top: 12px">
          <PlusOutlined /> Add Rename
        </a-button>
      </div>

      <!-- Aggregate Configuration -->
      <div v-else-if="transformConfig.type === 'aggregate'" class="transform-type-config">
        <h4 class="config-title">Aggregate Data</h4>
        <p class="config-desc">Group and aggregate rows</p>

        <div class="aggregate-config">
          <label class="section-label">Group By:</label>
          <a-select
            v-model:value="aggregateConfig.groupBy"
            mode="multiple"
            placeholder="Select columns to group by"
            style="width: 100%"
          >
            <a-select-option
              v-for="col in availableColumns"
              :key="col.name"
              :value="col.name"
            >
              {{ col.name }}
            </a-select-option>
          </a-select>

          <label class="section-label" style="margin-top: 16px">Aggregations:</label>
          <div
            v-for="(agg, index) in aggregateConfig.aggregations"
            :key="index"
            class="aggregate-row"
          >
            <a-select v-model:value="agg.column" placeholder="Column" style="flex: 1">
              <a-select-option
                v-for="col in availableColumns"
                :key="col.name"
                :value="col.name"
              >
                {{ col.name }}
              </a-select-option>
            </a-select>

            <a-select v-model:value="agg.function" style="width: 120px">
              <a-select-option value="count">Count</a-select-option>
              <a-select-option value="sum">Sum</a-select-option>
              <a-select-option value="avg">Average</a-select-option>
              <a-select-option value="min">Min</a-select-option>
              <a-select-option value="max">Max</a-select-option>
            </a-select>

            <a-button type="text" danger @click="removeAggregation(index)">
              <DeleteOutlined />
            </a-button>
          </div>

          <a-button block @click="addAggregation" style="margin-top: 12px">
            <PlusOutlined /> Add Aggregation
          </a-button>
        </div>
      </div>

      <!-- Sort Configuration -->
      <div v-else-if="transformConfig.type === 'sort'" class="transform-type-config">
        <h4 class="config-title">Sort Data</h4>
        <p class="config-desc">Order rows by column values</p>

        <div
          v-for="(sort, index) in sortConfig"
          :key="index"
          class="sort-row"
        >
          <a-select v-model:value="sort.column" placeholder="Column" style="flex: 1">
            <a-select-option
              v-for="col in availableColumns"
              :key="col.name"
              :value="col.name"
            >
              {{ col.name }}
            </a-select-option>
          </a-select>

          <a-select v-model:value="sort.order" style="width: 140px">
            <a-select-option value="asc">
              <SortAscendingOutlined /> Ascending
            </a-select-option>
            <a-select-option value="desc">
              <SortDescendingOutlined /> Descending
            </a-select-option>
          </a-select>

          <a-button
            type="text"
            danger
            @click="removeSort(index)"
            :disabled="sortConfig.length === 1"
          >
            <DeleteOutlined />
          </a-button>
        </div>

        <a-button block @click="addSort" style="margin-top: 12px">
          <PlusOutlined /> Add Sort
        </a-button>
      </div>
    </div>

    <!-- Actions -->
    <div class="panel-actions">
      <a-button @click="handleClose" style="margin-right: 8px">
        Cancel
      </a-button>
      <a-button type="primary" @click="handleApply" :loading="applying">
        Apply Transform
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  FunctionOutlined,
  CloseOutlined,
  FilterOutlined,
  CheckSquareOutlined,
  ClearOutlined,
  EditOutlined,
  GroupOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  NumberOutlined,
  FontSizeOutlined,
  CalendarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'
import type { Node } from '@/stores/modules/pipeline'

interface Props {
  node?: Node
  columns?: Array<{ name: string; type: string }>
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => []
})

const emit = defineEmits<{
  close: []
  apply: [config: any]
}>()

// Debug: Log props changes
console.log('=== TransformConfigPanel Mounted ===')
console.log('Node:', props.node)
console.log('Columns:', props.columns)

watch(() => props.node, (newVal) => {
  console.log('Node prop changed:', newVal)
})

watch(() => props.columns, (newVal) => {
  console.log('Columns prop changed:', newVal)
})

// Transform configuration
const transformConfig = ref({
  type: 'filter' as string
})

const applying = ref(false)

// Available columns
const availableColumns = computed(() => props.columns)

// Filter conditions
const filterConditions = ref([
  { column: '', operator: 'equals', value: '' }
])

// Selected columns
const selectedColumns = ref<string[]>([])

// Clean options
const cleanOptions = ref({
  removeNulls: false,
  removeDuplicates: false,
  trimWhitespace: false,
  standardizeCase: false,
  nullCheckColumns: [] as string[]
})

// Rename columns
const renameColumns = ref([
  { from: '', to: '' }
])

// Aggregate config
const aggregateConfig = ref({
  groupBy: [] as string[],
  aggregations: [
    { column: '', function: 'count' }
  ]
})

// Sort config
const sortConfig = ref([
  { column: '', order: 'asc' }
])

// Initialize selected columns when columns prop changes
watch(
  () => props.columns,
  (newColumns) => {
    if (newColumns.length > 0 && selectedColumns.value.length === 0) {
      selectedColumns.value = newColumns.map(col => col.name)
    }
  },
  { immediate: true }
)

// Handle type change
function handleTypeChange() {
  // Reset configurations when type changes
}

// Filter conditions management
function addCondition() {
  filterConditions.value.push({ column: '', operator: 'equals', value: '' })
}

function removeCondition(index: number) {
  filterConditions.value.splice(index, 1)
}

// Rename management
function addRename() {
  renameColumns.value.push({ from: '', to: '' })
}

function removeRename(index: number) {
  renameColumns.value.splice(index, 1)
}

// Aggregation management
function addAggregation() {
  aggregateConfig.value.aggregations.push({ column: '', function: 'count' })
}

function removeAggregation(index: number) {
  aggregateConfig.value.aggregations.splice(index, 1)
}

// Sort management
function addSort() {
  sortConfig.value.push({ column: '', order: 'asc' })
}

function removeSort(index: number) {
  sortConfig.value.splice(index, 1)
}

// Get column icon
function getColumnIcon(type: string) {
  const iconMap: Record<string, any> = {
    'String': FontSizeOutlined,
    'Number': NumberOutlined,
    'Integer': NumberOutlined,
    'Boolean': CheckCircleOutlined,
    'Date': CalendarOutlined,
    'DateTime': CalendarOutlined
  }
  return iconMap[type] || FontSizeOutlined
}

// Get column type color
function getColumnTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    'String': 'blue',
    'Number': 'green',
    'Integer': 'green',
    'Boolean': 'purple',
    'Date': 'orange',
    'DateTime': 'orange'
  }
  return colorMap[type] || 'default'
}

// Handle close
function handleClose() {
  emit('close')
}

// Handle apply
async function handleApply() {
  applying.value = true

  try {
    // Build configuration based on type
    let config: any = {
      type: transformConfig.value.type
    }

    switch (transformConfig.value.type) {
      case 'filter':
        config.conditions = filterConditions.value.filter(c => c.column && c.operator)
        break
      case 'select':
        config.columns = selectedColumns.value
        break
      case 'clean':
        config.options = cleanOptions.value
        break
      case 'rename':
        config.renames = renameColumns.value.filter(r => r.from && r.to)
        break
      case 'aggregate':
        config.groupBy = aggregateConfig.value.groupBy
        config.aggregations = aggregateConfig.value.aggregations.filter(a => a.column)
        break
      case 'sort':
        config.sorts = sortConfig.value.filter(s => s.column)
        break
    }

    emit('apply', config)
    message.success('Transform applied successfully')
  } catch (error: any) {
    message.error('Failed to apply transform: ' + error.message)
  } finally {
    applying.value = false
  }
}
</script>

<style scoped lang="less">
.transform-config-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #E4E7EB;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-icon {
      font-size: 20px;
      color: #9334E6;
    }

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #212121;
    }
  }
}

.node-info-section {
  padding: 16px 20px;
  background: #F8F9FA;
  border-bottom: 1px solid #E4E7EB;

  .info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      font-size: 13px;
      color: #5F6368;
      min-width: 60px;
    }

    .info-value {
      font-size: 13px;
      font-weight: 500;
      color: #212121;
    }
  }
}

.config-section {
  padding: 16px 20px;
  flex-shrink: 0;

  .section-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #212121;
    margin-bottom: 8px;
  }
}

.config-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;

  .transform-type-config {
    .config-title {
      font-size: 14px;
      font-weight: 600;
      color: #212121;
      margin: 0 0 8px 0;
    }

    .config-desc {
      font-size: 13px;
      color: #5F6368;
      margin-bottom: 20px;
    }
  }

  // Filter conditions
  .condition-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  // Columns list
  .columns-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;

    .column-checkbox-item {
      padding: 8px 12px;
      border: 1px solid #E4E7EB;
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        border-color: #4285F4;
        background: #F8F9FA;
      }

      .column-type-icon {
        margin-right: 8px;
        color: #5F6368;
      }
    }
  }

  .selection-summary {
    padding: 12px;
    background: #F8F9FA;
    border-radius: 6px;
    font-size: 13px;
    color: #5F6368;
    text-align: center;
  }

  // Clean options
  .clean-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .clean-column-selection {
    margin-top: 16px;
  }

  // Rename rows
  .rename-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  // Aggregate config
  .aggregate-config {
    .section-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #212121;
      margin-bottom: 8px;
    }
  }

  .aggregate-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  // Sort rows
  .sort-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
}

.panel-actions {
  padding: 16px 20px;
  border-top: 1px solid #E4E7EB;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
</style>
