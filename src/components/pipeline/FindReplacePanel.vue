<template>
  <a-modal
    v-model:open="visible"
    title="Find and Replace"
    :width="600"
    :footer="null"
    @cancel="handleClose"
  >
    <div class="find-replace-panel">
      <!-- Find Section -->
      <div class="section">
        <label class="section-label">Find</label>
        <a-input
          v-model:value="findText"
          placeholder="Enter text to find..."
          size="large"
          @keydown.enter="handleFind"
        >
          <template #suffix>
            <span class="match-count">{{ matches.length }} matches</span>
          </template>
        </a-input>
      </div>

      <!-- Replace Section -->
      <div class="section">
        <label class="section-label">Replace with</label>
        <a-input
          v-model:value="replaceText"
          placeholder="Enter replacement text..."
          size="large"
          @keydown.enter="handleReplaceAll"
        />
      </div>

      <!-- Options -->
      <div class="options-section">
        <a-checkbox v-model:checked="caseSensitive">Case sensitive</a-checkbox>
        <a-checkbox v-model:checked="wholeWord">Match whole word</a-checkbox>
        <a-checkbox v-model:checked="regex">Regular expression</a-checkbox>
      </div>

      <!-- Search Scope -->
      <div class="scope-section">
        <label class="section-label">Search in</label>
        <a-checkbox-group v-model:value="searchScope">
          <a-checkbox value="names">Node names</a-checkbox>
          <a-checkbox value="transforms">Transform configs</a-checkbox>
          <a-checkbox value="columns">Column names</a-checkbox>
        </a-checkbox-group>
      </div>

      <!-- Results -->
      <div v-if="matches.length > 0" class="results-section">
        <div class="results-header">
          <span>{{ matches.length }} matches found</span>
          <div class="results-nav">
            <a-button size="small" @click="previousMatch" :disabled="matches.length === 0">
              <UpOutlined />
            </a-button>
            <span class="current-match">{{ currentMatchIndex + 1 }} / {{ matches.length }}</span>
            <a-button size="small" @click="nextMatch" :disabled="matches.length === 0">
              <DownOutlined />
            </a-button>
          </div>
        </div>

        <div class="results-list">
          <div
            v-for="(match, index) in matches"
            :key="match.id"
            class="result-item"
            :class="{ active: index === currentMatchIndex }"
            @click="selectMatch(index)"
          >
            <div class="result-node">{{ match.nodeName }}</div>
            <div class="result-location">{{ match.location }}</div>
            <div class="result-preview">{{ match.preview }}</div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <a-space>
          <a-button @click="handleFind">
            <SearchOutlined /> Find
          </a-button>
          <a-button @click="handleReplace" :disabled="matches.length === 0">
            Replace
          </a-button>
          <a-button type="primary" @click="handleReplaceAll" :disabled="matches.length === 0">
            Replace All
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue'
import type { Node } from '@/stores/modules/pipeline'

interface Match {
  id: string
  nodeId: string
  nodeName: string
  location: string
  field: string
  value: string
  preview: string
}

interface Props {
  visible?: boolean
  nodes?: Node[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  nodes: () => []
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  replace: [matches: Match[], replaceText: string]
  close: []
}>()

const findText = ref('')
const replaceText = ref('')
const caseSensitive = ref(false)
const wholeWord = ref(false)
const regex = ref(false)
const searchScope = ref<string[]>(['names', 'transforms', 'columns'])
const matches = ref<Match[]>([])
const currentMatchIndex = ref(0)

// Watch find text changes
watch(findText, () => {
  if (findText.value) {
    handleFind()
  } else {
    matches.value = []
  }
})

// Find matches
function handleFind() {
  if (!findText.value.trim()) {
    matches.value = []
    return
  }

  const results: Match[] = []
  const pattern = createSearchPattern()

  props.nodes.forEach(node => {
    // Search in node names
    if (searchScope.value.includes('names')) {
      if (pattern.test(node.name)) {
        results.push({
          id: `${node.id}-name`,
          nodeId: node.id,
          nodeName: node.name,
          location: 'Node Name',
          field: 'name',
          value: node.name,
          preview: node.name
        })
      }
    }

    // Search in transforms
    if (searchScope.value.includes('transforms') && node.data?.transforms) {
      node.data.transforms.forEach((transform: any, index: number) => {
        const transformStr = JSON.stringify(transform)
        if (pattern.test(transformStr)) {
          results.push({
            id: `${node.id}-transform-${index}`,
            nodeId: node.id,
            nodeName: node.name,
            location: `Transform ${index + 1}`,
            field: 'transform',
            value: transformStr,
            preview: transform.type || 'Unknown transform'
          })
        }
      })
    }

    // Search in columns
    if (searchScope.value.includes('columns') && node.data?.columns) {
      node.data.columns.forEach((col: any) => {
        if (pattern.test(col.name)) {
          results.push({
            id: `${node.id}-column-${col.name}`,
            nodeId: node.id,
            nodeName: node.name,
            location: 'Column',
            field: 'column',
            value: col.name,
            preview: col.name
          })
        }
      })
    }
  })

  matches.value = results
  currentMatchIndex.value = 0

  if (results.length > 0) {
    message.success(`Found ${results.length} matches`)
  } else {
    message.info('No matches found')
  }
}

// Create search pattern
function createSearchPattern(): RegExp {
  try {
    let pattern = findText.value

    if (!regex.value) {
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    if (wholeWord.value) {
      pattern = `\\b${pattern}\\b`
    }

    return new RegExp(pattern, caseSensitive.value ? 'g' : 'gi')
  } catch (error) {
    message.error('Invalid search pattern')
    return /(?!)/  // Never matches
  }
}

// Navigate matches
function nextMatch() {
  if (matches.value.length > 0) {
    currentMatchIndex.value = (currentMatchIndex.value + 1) % matches.value.length
  }
}

function previousMatch() {
  if (matches.value.length > 0) {
    currentMatchIndex.value = (currentMatchIndex.value - 1 + matches.value.length) % matches.value.length
  }
}

function selectMatch(index: number) {
  currentMatchIndex.value = index
}

// Replace current match
function handleReplace() {
  if (matches.value.length === 0) return

  const currentMatch = matches.value[currentMatchIndex.value]
  emit('replace', [currentMatch], replaceText.value)

  // Remove this match and move to next
  matches.value.splice(currentMatchIndex.value, 1)
  if (currentMatchIndex.value >= matches.value.length) {
    currentMatchIndex.value = Math.max(0, matches.value.length - 1)
  }

  message.success('Replaced 1 match')
}

// Replace all matches
function handleReplaceAll() {
  if (matches.value.length === 0) return

  const count = matches.value.length
  emit('replace', matches.value, replaceText.value)
  matches.value = []
  message.success(`Replaced ${count} matches`)
}

// Close panel
function handleClose() {
  emit('update:visible', false)
  emit('close')
}
</script>

<style scoped lang="less">
.find-replace-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section {
  .section-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #212121;
    margin-bottom: 8px;
  }

  .match-count {
    font-size: 11px;
    color: #5F6368;
    padding: 2px 8px;
    background: #F5F6F7;
    border-radius: 10px;
  }
}

.options-section,
.scope-section {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .section-label {
    font-size: 13px;
    font-weight: 600;
    color: #212121;
    margin-bottom: 4px;
  }
}

.results-section {
  border: 1px solid #E4E7EB;
  border-radius: 6px;
  overflow: hidden;
  max-height: 300px;

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #F5F6F7;
    border-bottom: 1px solid #E4E7EB;
    font-size: 12px;
    color: #5F6368;

    .results-nav {
      display: flex;
      align-items: center;
      gap: 8px;

      .current-match {
        font-family: Consolas, Monaco, monospace;
        font-size: 11px;
      }
    }
  }

  .results-list {
    max-height: 250px;
    overflow-y: auto;
  }
}

.result-item {
  padding: 10px 12px;
  border-bottom: 1px solid #E4E7EB;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #F5F6F7;
  }

  &.active {
    background: #E8F0FE;
    border-left: 3px solid #2D6EED;
  }

  .result-node {
    font-size: 13px;
    font-weight: 600;
    color: #212121;
    margin-bottom: 4px;
  }

  .result-location {
    font-size: 11px;
    color: #98A2B3;
    margin-bottom: 4px;
  }

  .result-preview {
    font-size: 12px;
    color: #5F6368;
    font-family: Consolas, Monaco, monospace;
  }
}

.actions-section {
  padding-top: 8px;
  border-top: 1px solid #E4E7EB;
}
</style>
