<template>
  <div class="node-search-panel" :class="{ collapsed: isCollapsed }">
    <!-- 搜索头部 -->
    <div class="search-header">
      <div v-if="!isCollapsed" class="header-title">
        <SearchOutlined class="header-icon" />
        <span>Search Nodes</span>
      </div>
      <a-button
        type="text"
        size="small"
        @click="isCollapsed = !isCollapsed"
        class="collapse-btn"
      >
        <RightOutlined v-if="isCollapsed" />
        <LeftOutlined v-else />
      </a-button>
    </div>

    <!-- 搜索内容 -->
    <div v-if="!isCollapsed" class="search-content">
      <!-- 搜索输入框 -->
      <a-input
        v-model:value="searchText"
        placeholder="Search by name, type, or data..."
        size="large"
        allow-clear
        @input="handleSearch"
        @keydown.enter="jumpToNext"
        @keydown.esc="handleClear"
        class="search-input"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
        <template #suffix>
          <div v-if="searchResults.length > 0" class="search-counter">
            {{ currentIndex + 1 }} / {{ searchResults.length }}
          </div>
        </template>
      </a-input>

      <!-- 搜索选项 -->
      <div class="search-options">
        <a-checkbox v-model:checked="options.caseSensitive" @change="handleSearch">
          Case sensitive
        </a-checkbox>
        <a-checkbox v-model:checked="options.wholeWord" @change="handleSearch">
          Whole word
        </a-checkbox>
        <a-checkbox v-model:checked="options.regex" @change="handleSearch">
          Regex
        </a-checkbox>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchText && searchResults.length > 0" class="search-results">
        <div class="results-header">
          <span>{{ searchResults.length }} results found</span>
          <div class="results-nav">
            <a-button
              type="text"
              size="small"
              @click="jumpToPrevious"
              :disabled="searchResults.length === 0"
            >
              <UpOutlined />
            </a-button>
            <a-button
              type="text"
              size="small"
              @click="jumpToNext"
              :disabled="searchResults.length === 0"
            >
              <DownOutlined />
            </a-button>
          </div>
        </div>

        <!-- 结果列表 -->
        <div class="results-list">
          <div
            v-for="(result, index) in searchResults"
            :key="result.node.id"
            class="result-item"
            :class="{ active: index === currentIndex }"
            @click="jumpToResult(index)"
          >
            <div class="result-icon">
              <component :is="getNodeIcon(result.node.type)" />
            </div>
            <div class="result-info">
              <div class="result-name" v-html="highlightText(result.node.name)"></div>
              <div class="result-type">{{ result.node.type }}</div>
            </div>
            <div v-if="result.matchType" class="result-match">
              <a-tag size="small" :color="getMatchColor(result.matchType)">
                {{ result.matchType }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 无结果提示 -->
      <div v-else-if="searchText && searchResults.length === 0" class="no-results">
        <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" description="No nodes found" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Empty } from 'ant-design-vue'
import {
  SearchOutlined,
  LeftOutlined,
  RightOutlined,
  UpOutlined,
  DownOutlined,
  DatabaseOutlined,
  FunctionOutlined,
  MergeCellsOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import type { Node } from '@/stores/modules/pipeline'

interface SearchResult {
  node: Node
  matchType: 'name' | 'type' | 'data' | null
}

interface SearchOptions {
  caseSensitive: boolean
  wholeWord: boolean
  regex: boolean
}

interface Props {
  nodes?: Node[]
}

const props = withDefaults(defineProps<Props>(), {
  nodes: () => []
})

const emit = defineEmits<{
  highlight: [nodeId: string]
  focus: [nodeId: string]
  clear: []
}>()

const isCollapsed = ref(false)
const searchText = ref('')
const searchResults = ref<SearchResult[]>([])
const currentIndex = ref(0)
const options = ref<SearchOptions>({
  caseSensitive: false,
  wholeWord: false,
  regex: false
})

// 搜索节点
function handleSearch() {
  if (!searchText.value.trim()) {
    searchResults.value = []
    currentIndex.value = 0
    emit('clear')
    return
  }

  const results: SearchResult[] = []
  const query = searchText.value.trim()

  try {
    // 创建搜索模式
    let pattern: RegExp
    if (options.value.regex) {
      pattern = new RegExp(query, options.value.caseSensitive ? '' : 'i')
    } else {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const wholeWordPattern = options.value.wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery
      pattern = new RegExp(wholeWordPattern, options.value.caseSensitive ? '' : 'i')
    }

    // 搜索所有节点
    props.nodes.forEach(node => {
      let matchType: SearchResult['matchType'] = null

      // 搜索节点名称
      if (pattern.test(node.name)) {
        matchType = 'name'
      }
      // 搜索节点类型
      else if (pattern.test(node.type)) {
        matchType = 'type'
      }
      // 搜索节点数据
      else if (node.data && typeof node.data === 'object') {
        const dataStr = JSON.stringify(node.data)
        if (pattern.test(dataStr)) {
          matchType = 'data'
        }
      }

      if (matchType) {
        results.push({ node, matchType })
      }
    })

    searchResults.value = results
    currentIndex.value = 0

    // 如果有结果，高亮第一个
    if (results.length > 0) {
      highlightCurrent()
    }
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  }
}

// 跳转到上一个结果
function jumpToPrevious() {
  if (searchResults.value.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + searchResults.value.length) % searchResults.value.length
  highlightCurrent()
}

// 跳转到下一个结果
function jumpToNext() {
  if (searchResults.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % searchResults.value.length
  highlightCurrent()
}

// 跳转到指定结果
function jumpToResult(index: number) {
  currentIndex.value = index
  highlightCurrent()
}

// 高亮当前结果
function highlightCurrent() {
  if (searchResults.value.length === 0) return
  const result = searchResults.value[currentIndex.value]
  emit('highlight', result.node.id)
  emit('focus', result.node.id)
}

// 清除搜索
function handleClear() {
  searchText.value = ''
  searchResults.value = []
  currentIndex.value = 0
  emit('clear')
}

// 高亮文本
function highlightText(text: string): string {
  if (!searchText.value.trim()) return text

  try {
    const query = searchText.value.trim()
    const escapedQuery = options.value.regex
      ? query
      : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`(${escapedQuery})`, options.value.caseSensitive ? 'g' : 'gi')
    return text.replace(pattern, '<mark>$1</mark>')
  } catch {
    return text
  }
}

// 获取节点图标
function getNodeIcon(type: string) {
  const iconMap: Record<string, any> = {
    dataset: DatabaseOutlined,
    transform: FunctionOutlined,
    join: MergeCellsOutlined,
    output: SaveOutlined
  }
  return iconMap[type] || DatabaseOutlined
}

// 获取匹配类型颜色
function getMatchColor(matchType: string): string {
  const colorMap: Record<string, string> = {
    name: 'blue',
    type: 'purple',
    data: 'orange'
  }
  return colorMap[matchType] || 'default'
}

// 监听节点变化，自动重新搜索
watch(() => props.nodes, () => {
  if (searchText.value) {
    handleSearch()
  }
}, { deep: true })
</script>

<style scoped lang="less">
.node-search-panel {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 320px;
  background: #FFFFFF;
  border: 1px solid #E4E7EB;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 999;
  transition: all 0.3s ease;

  &.collapsed {
    width: 48px;

    .search-header {
      justify-content: center;
    }
  }
}

.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #E4E7EB;

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #212121;

    .header-icon {
      font-size: 16px;
      color: #2D6EED;
    }
  }

  .collapse-btn {
    padding: 4px;
    color: #5F6368;

    &:hover {
      color: #2D6EED;
      background: #F5F6F7;
    }
  }
}

.search-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input {
  :deep(.ant-input) {
    font-size: 14px;
  }

  .search-counter {
    font-size: 12px;
    color: #5F6368;
    padding: 2px 8px;
    background: #F5F6F7;
    border-radius: 10px;
    font-weight: 500;
  }
}

.search-options {
  display: flex;
  flex-direction: column;
  gap: 8px;

  :deep(.ant-checkbox-wrapper) {
    font-size: 13px;
    color: #5F6368;
  }
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #5F6368;
  padding-bottom: 8px;
  border-bottom: 1px solid #E4E7EB;

  .results-nav {
    display: flex;
    gap: 4px;
  }
}

.results-list {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid #E4E7EB;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #2D6EED;
    background: #F5F6F7;
  }

  &.active {
    border-color: #2D6EED;
    background: #E8F0FE;
    box-shadow: 0 0 0 2px rgba(45, 110, 237, 0.1);
  }

  .result-icon {
    font-size: 16px;
    color: #5F6368;
  }

  .result-info {
    flex: 1;
    min-width: 0;

    .result-name {
      font-size: 13px;
      font-weight: 500;
      color: #212121;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      :deep(mark) {
        background: #FEF3C7;
        color: #92400E;
        padding: 0 2px;
        border-radius: 2px;
      }
    }

    .result-type {
      font-size: 11px;
      color: #5F6368;
      text-transform: capitalize;
    }
  }

  .result-match {
    flex-shrink: 0;
  }
}

.no-results {
  padding: 20px 0;
}
</style>
