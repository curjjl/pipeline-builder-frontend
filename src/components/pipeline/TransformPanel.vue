<template>
  <div class="transform-panel">
    <!-- 左侧：转换分类 -->
    <div class="transform-categories">
      <a-input-search
        v-model:value="searchText"
        placeholder="Search transforms and columns..."
        size="small"
        class="category-search"
      />

      <div class="category-list">
        <div
          v-for="category in categories"
          :key="category.key"
          class="category-item"
          :class="{ active: activeCategory === category.key }"
          @click="activeCategory = category.key"
        >
          {{ category.label }}
        </div>
      </div>
    </div>

    <!-- 中间：转换列表 -->
    <div class="transform-list">
      <div class="transform-list-header">
        <span>Choose a transform to use</span>
        <a-button type="link" size="small" @click="handleClear">
          Clear
        </a-button>
      </div>

      <div class="transform-items">
        <div
          v-for="transform in filteredTransforms"
          :key="transform.key"
          class="transform-item"
          :class="{ active: selectedTransform === transform.key }"
          @click="selectTransform(transform)"
        >
          <div class="transform-name">{{ transform.name }}</div>
          <div v-if="transform.description" class="transform-desc">
            {{ transform.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：转换配置 -->
    <div class="transform-config">
      <div v-if="!selectedTransform" class="config-empty">
        <a-empty description="Select a transform to configure" />
      </div>

      <div v-else class="config-content">
        <!-- Filter 转换 -->
        <FilterTransform
          v-if="selectedTransform === 'filter'"
          :columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- GroupBy 转换 -->
        <GroupByTransform
          v-else-if="selectedTransform === 'group-by'"
          :columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- Sort 转换 -->
        <SortTransform
          v-else-if="selectedTransform === 'sort'"
          :columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- Cast 转换 -->
        <CastTransform
          v-else-if="selectedTransform === 'cast'"
          :columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- Select Columns 转换 -->
        <SelectColumnsTransform
          v-else-if="selectedTransform === 'selectColumns'"
          :available-columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- Rename Columns 转换 -->
        <RenameColumnsTransform
          v-else-if="selectedTransform === 'renameColumns'"
          :available-columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- Add Column 转换 -->
        <AddColumnTransform
          v-else-if="selectedTransform === 'addColumn'"
          :available-columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- Remove Columns 转换 -->
        <RemoveColumnsTransform
          v-else-if="selectedTransform === 'removeColumns'"
          :available-columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- Trim Whitespace 转换 -->
        <TrimTransform
          v-else-if="selectedTransform === 'trimWhitespace'"
          :available-columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- Replace Values 转换 -->
        <ReplaceTransform
          v-else-if="selectedTransform === 'replaceValues'"
          :available-columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- Split Columns 转换 -->
        <SplitColumnsTransform
          v-else-if="selectedTransform === 'splitColumns'"
          :available-columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- 通用转换配置 -->
        <GenericTransform
          v-else
          :transform="selectedTransformData"
          :columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FilterTransform from './transforms/FilterTransform.vue'
import GroupByTransform from './transforms/GroupByTransform.vue'
import SortTransform from './transforms/SortTransform.vue'
import CastTransform from './transforms/CastTransform.vue'
import SelectColumnsTransform from './transforms/SelectColumnsTransform.vue'
import RenameColumnsTransform from './transforms/RenameColumnsTransform.vue'
import AddColumnTransform from './transforms/AddColumnTransform.vue'
import RemoveColumnsTransform from './transforms/RemoveColumnsTransform.vue'
import TrimTransform from './transforms/TrimTransform.vue'
import ReplaceTransform from './transforms/ReplaceTransform.vue'
import SplitColumnsTransform from './transforms/SplitColumnsTransform.vue'
import GenericTransform from './transforms/GenericTransform.vue'
import type { Node } from '@/stores/modules/pipeline'

interface Props {
  node?: Node
}

const props = defineProps<Props>()

const emit = defineEmits<{
  apply: [transform: any]
  cancel: []
}>()

const searchText = ref('')
const activeCategory = ref('all')
const selectedTransform = ref<string>('')
const selectedTransformData = ref<any>(null)

// 转换分类
const categories = [
  { key: 'all', label: 'All' },
  { key: 'popular', label: 'Popular' },
  { key: 'functions', label: 'Custom functions' },
  { key: 'udfs', label: 'UDFs' },
  { key: 'aggregate', label: 'Aggregate' },
  { key: 'array', label: 'Array' },
  { key: 'binary', label: 'Binary' },
  { key: 'boolean', label: 'Boolean' },
  { key: 'cast', label: 'Cast' },
  { key: 'data-prep', label: 'Data preparation' },
  { key: 'datetime', label: 'Datetime' }
]

// 可用的转换列表
const transforms = [
  {
    key: 'filter',
    name: 'Filter',
    category: ['all', 'popular', 'data-prep'],
    description: 'Filter rows based on comparisons for selected columns.'
  },
  {
    key: 'group-by',
    name: 'Aggregate',
    category: ['all', 'popular', 'aggregate'],
    description: 'Group rows and apply aggregation functions.'
  },
  {
    key: 'sort',
    name: 'Sort',
    category: ['all', 'data-prep'],
    description: 'Sort rows by column values.'
  },
  {
    key: 'cast',
    name: 'Cast',
    category: ['all', 'cast'],
    description: 'Cast column to different type.'
  },
  {
    key: 'selectColumns',
    name: 'Select columns',
    category: ['all', 'data-prep'],
    description: 'Select specific columns to keep or exclude.'
  },
  {
    key: 'renameColumns',
    name: 'Rename columns',
    category: ['all', 'data-prep'],
    description: 'Rename one or more columns.'
  },
  {
    key: 'removeColumns',
    name: 'Remove columns',
    category: ['all', 'data-prep'],
    description: 'Remove one or more columns from the dataset.'
  },
  {
    key: 'trimWhitespace',
    name: 'Trim whitespace',
    category: ['all', 'data-prep'],
    description: 'Remove leading/trailing whitespace from text columns.'
  },
  {
    key: 'replaceValues',
    name: 'Replace values',
    category: ['all', 'data-prep'],
    description: 'Find and replace values using exact match, contains, or regex.'
  },
  {
    key: 'splitColumns',
    name: 'Split column',
    category: ['all', 'data-prep'],
    description: 'Split a column into multiple columns based on delimiter.'
  },
  {
    key: 'distinct',
    name: 'Distinct',
    category: ['all', 'data-prep'],
    description: 'Remove duplicate rows.'
  },
  {
    key: 'addColumn',
    name: 'Add column',
    category: ['all', 'data-prep'],
    description: 'Add a new calculated column with expressions.'
  },
  {
    key: 'fill-null',
    name: 'Fill null',
    category: ['all', 'data-prep'],
    description: 'Fill null values with a default value.'
  }
]

// 过滤后的转换列表
const filteredTransforms = computed(() => {
  let result = transforms

  // 按分类过滤
  if (activeCategory.value !== 'all') {
    result = result.filter(t => t.category.includes(activeCategory.value))
  }

  // 按搜索文本过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(t =>
      t.name.toLowerCase().includes(search) ||
      t.description?.toLowerCase().includes(search)
    )
  }

  return result
})

// 可用列
const availableColumns = computed(() => {
  if (!props.node) return []

  // 从节点数据中获取列信息
  // 这里假设节点数据包含columns信息
  return props.node.data?.columns || []
})

// 选择转换
function selectTransform(transform: any) {
  selectedTransform.value = transform.key
  selectedTransformData.value = transform
}

// 清除选择
function handleClear() {
  searchText.value = ''
}

// 应用转换
function handleApply(transformConfig: any) {
  emit('apply', {
    id: Date.now().toString(),
    type: selectedTransform.value,
    name: selectedTransformData.value?.name || 'Transform',
    params: transformConfig,
    enabled: true
  })

  // 重置选择
  selectedTransform.value = ''
  selectedTransformData.value = null
}

// 取消
function handleCancel() {
  selectedTransform.value = ''
  selectedTransformData.value = null
  emit('cancel')
}
</script>

<style scoped lang="less">
.transform-panel {
  display: flex;
  height: 100%;
  background: #FFFFFF;
}

.transform-categories {
  width: 200px;
  background: #F5F6F7;
  border-right: 1px solid #E4E7EB;
  display: flex;
  flex-direction: column;

  .category-search {
    margin: 12px;
  }

  .category-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 8px;

    .category-item {
      padding: 8px 12px;
      font-size: 13px;
      color: #5F6368;
      cursor: pointer;
      border-radius: 4px;
      border-left: 3px solid transparent;
      transition: all 0.15s;

      &:hover {
        background: #ECEEF1;
        color: #212121;
      }

      &.active {
        background: #E8F0FE;
        color: #2D6EED;
        border-left-color: #2D6EED;
        font-weight: 500;
      }
    }
  }
}

.transform-list {
  width: 280px;
  border-right: 1px solid #E4E7EB;
  display: flex;
  flex-direction: column;

  .transform-list-header {
    padding: 12px 16px;
    border-bottom: 1px solid #E4E7EB;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #5F6368;
  }

  .transform-items {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    .transform-item {
      padding: 12px;
      border: 1px solid #E4E7EB;
      border-radius: 4px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        border-color: #2D6EED;
        background: #F5F6F7;
      }

      &.active {
        border-color: #2D6EED;
        background: #E8F0FE;

        .transform-name {
          color: #2D6EED;
          font-weight: 500;
        }
      }

      .transform-name {
        font-size: 14px;
        color: #212121;
        margin-bottom: 4px;
      }

      .transform-desc {
        font-size: 12px;
        color: #5F6368;
        line-height: 1.4;
      }
    }
  }
}

.transform-config {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .config-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .config-content {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
