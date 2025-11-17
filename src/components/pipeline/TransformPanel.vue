<template>
  <div class="transform-panel">
    <!-- 顶部：已应用的Transforms标签栏 -->
    <div v-if="appliedTransforms && appliedTransforms.length > 0" class="applied-transforms-bar">
      <div class="applied-transforms-container">
        <a-tag
          v-for="(transform, index) in appliedTransforms"
          :key="index"
          color="purple"
          closable
          class="transform-tag"
          @close="handleRemoveTransform(index)"
        >
          {{ transform.name || transform.type }}
        </a-tag>
      </div>
    </div>

    <!-- 主内容区域（三栏布局） -->
    <div class="transform-content">
      <!-- 左侧：转换分类 -->
      <div class="transform-categories">
      <div class="search-box">
        <a-input
          v-model:value="searchText"
          :placeholder="t('transform.panel.searchPlaceholder')"
          size="small"
          class="category-search"
          allow-clear
        >
          <template #suffix>
            <a-button
              v-if="searchText"
              type="text"
              size="small"
              @click="searchText = ''"
              class="clear-btn"
            >
              {{ t('transform.panel.clear') }}
            </a-button>
          </template>
        </a-input>
      </div>

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
        <span>{{ t('transform.panel.chooseTransform') }}</span>
        <a-button type="link" size="small" @click="handleClear">
          {{ t('transform.panel.clear') }}
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
        <a-empty :description="t('transform.panel.selectToConfig')" />
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

        <!-- Clean String 转换 -->
        <CleanStringTransform
          v-else-if="selectedTransform === 'cleanString'"
          :available-columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- Title Case 转换 -->
        <TitleCaseTransform
          v-else-if="selectedTransform === 'titleCase'"
          :available-columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- Python 转换 -->
        <PythonTransform
          v-else-if="selectedTransform === 'python'"
          :available-columns="availableColumns"
          @apply="handleApply"
          @cancel="handleCancel"
        />

        <!-- SQL 转换 -->
        <SQLTransform
          v-else-if="selectedTransform === 'sql'"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
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
import CleanStringTransform from './transforms/CleanStringTransform.vue'
import TitleCaseTransform from './transforms/TitleCaseTransform.vue'
import PythonTransform from './transforms/PythonTransform.vue'
import SQLTransform from './transforms/SQLTransform.vue'
import GenericTransform from './transforms/GenericTransform.vue'
import type { Node } from '@/stores/modules/pipeline'

interface Props {
  node?: Node
  columns?: any[]
  appliedTransforms?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  appliedTransforms: () => []
})

const emit = defineEmits<{
  apply: [transform: any]
  cancel: []
  close: []
  removeTransform: [index: number]
}>()

const { t } = useI18n()

const searchText = ref('')
const activeCategory = ref('all')
const selectedTransform = ref<string>('')
const selectedTransformData = ref<any>(null)

// 转换分类
const categories = computed(() => [
  { key: 'all', label: t('transform.categories.all') },
  { key: 'popular', label: t('transform.categories.popular') },
  { key: 'functions', label: t('transform.categories.functions') },
  { key: 'udfs', label: t('transform.categories.udfs') },
  { key: 'aggregate', label: t('transform.categories.aggregate') },
  { key: 'array', label: t('transform.categories.array') },
  { key: 'binary', label: t('transform.categories.binary') },
  { key: 'boolean', label: t('transform.categories.boolean') },
  { key: 'cast', label: t('transform.categories.cast') },
  { key: 'data-prep', label: t('transform.categories.dataPrep') },
  { key: 'datetime', label: t('transform.categories.datetime') }
])

// 可用的转换列表
const transforms = computed(() => [
  {
    key: 'filter',
    name: t('transform.types.filter'),
    category: ['all', 'popular', 'data-prep'],
    description: t('transform.descriptions.filter')
  },
  {
    key: 'group-by',
    name: t('transform.types.aggregate'),
    category: ['all', 'popular', 'aggregate'],
    description: t('transform.descriptions.aggregate')
  },
  {
    key: 'sort',
    name: t('transform.types.sort'),
    category: ['all', 'data-prep'],
    description: t('transform.descriptions.sort')
  },
  {
    key: 'cast',
    name: t('transform.types.cast'),
    category: ['all', 'cast'],
    description: t('transform.descriptions.cast')
  },
  {
    key: 'selectColumns',
    name: t('transform.types.selectColumns'),
    category: ['all', 'data-prep'],
    description: t('transform.descriptions.selectColumns')
  },
  {
    key: 'renameColumns',
    name: t('transform.types.renameColumns'),
    category: ['all', 'data-prep'],
    description: t('transform.descriptions.renameColumns')
  },
  {
    key: 'removeColumns',
    name: t('transform.types.removeColumns'),
    category: ['all', 'data-prep'],
    description: t('transform.descriptions.removeColumns')
  },
  {
    key: 'trimWhitespace',
    name: t('transform.types.trimWhitespace'),
    category: ['all', 'data-prep'],
    description: t('transform.descriptions.trimWhitespace')
  },
  {
    key: 'replaceValues',
    name: t('transform.types.replaceValues'),
    category: ['all', 'data-prep'],
    description: t('transform.descriptions.replaceValues')
  },
  {
    key: 'splitColumns',
    name: t('transform.types.splitColumn'),
    category: ['all', 'data-prep'],
    description: t('transform.descriptions.splitColumn')
  },
  {
    key: 'cleanString',
    name: t('transform.types.cleanString'),
    category: ['all', 'popular', 'data-prep'],
    description: t('transform.descriptions.cleanString')
  },
  {
    key: 'titleCase',
    name: t('transform.types.titleCase'),
    category: ['all', 'data-prep'],
    description: t('transform.descriptions.titleCase')
  },
  {
    key: 'distinct',
    name: t('transform.types.distinct'),
    category: ['all', 'data-prep'],
    description: t('transform.descriptions.distinct')
  },
  {
    key: 'addColumn',
    name: t('transform.types.addColumn'),
    category: ['all', 'data-prep'],
    description: t('transform.descriptions.addColumn')
  },
  {
    key: 'fill-null',
    name: 'Fill null',
    category: ['all', 'data-prep'],
    description: 'Fill null values with a default value.'
  },
  {
    key: 'python',
    name: 'Python Code',
    category: ['all', 'popular', 'udfs', 'functions'],
    description: 'Write custom Python code to transform data using pandas.'
  },
  {
    key: 'sql',
    name: 'SQL Query',
    category: ['all', 'popular', 'udfs', 'functions'],
    description: 'Write SQL queries to transform and filter data.'
  }
])

// 过滤后的转换列表
const filteredTransforms = computed(() => {
  let result = transforms.value

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
  // First try to use columns from props (passed from PipelineEditor)
  if (props.columns && props.columns.length > 0) {
    return props.columns
  }

  // Fallback to node data if available
  if (props.node?.data?.columns) {
    return props.node.data.columns
  }

  return []
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
  emit('close')
}

// 移除已应用的transform
function handleRemoveTransform(index: number) {
  emit('removeTransform', index)
}
</script>

<style scoped lang="less">
.transform-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FFFFFF;
}

// 顶部已应用的Transforms标签栏
.applied-transforms-bar {
  padding: 12px 16px;
  background: #F8F9FA;
  border-bottom: 1px solid #E4E7EB;

  .applied-transforms-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .transform-tag {
      font-size: 13px;
      padding: 4px 12px;
      border-radius: 16px;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}

// 主内容区域（三栏布局）
.transform-content {
  display: flex;
  flex: 1;
  min-height: 0;
}

.transform-categories {
  width: 200px;
  background: #F5F6F7;
  border-right: 1px solid #E4E7EB;
  display: flex;
  flex-direction: column;

  .search-box {
    padding: 12px;

    .category-search {
      width: 100%;
    }

    .clear-btn {
      color: #2D6EED;
      padding: 0 4px;
      font-size: 12px;

      &:hover {
        color: #1557D0;
      }
    }
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
