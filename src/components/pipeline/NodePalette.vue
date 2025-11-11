<template>
  <div class="node-palette" :class="{ collapsed: isCollapsed }">
    <!-- Collapse Toggle Button -->
    <div class="palette-toggle" @click="toggleCollapse">
      <RightOutlined v-if="isCollapsed" />
      <LeftOutlined v-else />
    </div>

    <!-- Palette Content -->
    <div v-show="!isCollapsed" class="palette-content">
      <!-- Header -->
      <div class="palette-header">
        <h3 class="palette-title">Nodes</h3>
        <a-input-search
          v-model:value="searchText"
          placeholder="Search nodes..."
          size="small"
          class="palette-search"
        />
      </div>

      <!-- Node Categories -->
      <div class="palette-body">
        <!-- Data Sources Category -->
        <div class="node-category">
          <div
            class="category-header"
            @click="toggleCategory('datasources')"
          >
            <DownOutlined
              :class="['category-icon', { expanded: expandedCategories.includes('datasources') }]"
            />
            <DatabaseOutlined class="category-icon-left" />
            <span class="category-title">Data Sources</span>
            <span class="category-count">{{ dataSources.length }}</span>
          </div>
          <div v-show="expandedCategories.includes('datasources')" class="category-content">
            <div
              v-for="node in filteredDataSources"
              :key="node.type"
              class="node-item"
              draggable="true"
              @dragstart="handleDragStart($event, node)"
              @dragend="handleDragEnd"
            >
              <div class="node-icon" :style="{ background: node.color + '20', color: node.color }">
                <component :is="node.icon" />
              </div>
              <div class="node-info">
                <div class="node-name">{{ node.name }}</div>
                <div class="node-desc">{{ node.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transforms Category -->
        <div class="node-category">
          <div
            class="category-header"
            @click="toggleCategory('transforms')"
          >
            <DownOutlined
              :class="['category-icon', { expanded: expandedCategories.includes('transforms') }]"
            />
            <FilterOutlined class="category-icon-left" />
            <span class="category-title">Transforms</span>
            <span class="category-count">{{ transforms.length }}</span>
          </div>
          <div v-show="expandedCategories.includes('transforms')" class="category-content">
            <div
              v-for="node in filteredTransforms"
              :key="node.type"
              class="node-item"
              draggable="true"
              @dragstart="handleDragStart($event, node)"
              @dragend="handleDragEnd"
            >
              <div class="node-icon" :style="{ background: node.color + '20', color: node.color }">
                <component :is="node.icon" />
              </div>
              <div class="node-info">
                <div class="node-name">{{ node.name }}</div>
                <div class="node-desc">{{ node.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Outputs Category -->
        <div class="node-category">
          <div
            class="category-header"
            @click="toggleCategory('outputs')"
          >
            <DownOutlined
              :class="['category-icon', { expanded: expandedCategories.includes('outputs') }]"
            />
            <ExportOutlined class="category-icon-left" />
            <span class="category-title">Outputs</span>
            <span class="category-count">{{ outputs.length }}</span>
          </div>
          <div v-show="expandedCategories.includes('outputs')" class="category-content">
            <div
              v-for="node in filteredOutputs"
              :key="node.type"
              class="node-item"
              draggable="true"
              @dragstart="handleDragStart($event, node)"
              @dragend="handleDragEnd"
            >
              <div class="node-icon" :style="{ background: node.color + '20', color: node.color }">
                <component :is="node.icon" />
              </div>
              <div class="node-info">
                <div class="node-name">{{ node.name }}</div>
                <div class="node-desc">{{ node.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  DatabaseOutlined,
  FilterOutlined,
  ExportOutlined,
  MergeCellsOutlined,
  LeftOutlined,
  RightOutlined,
  DownOutlined,
  FunctionOutlined
} from '@ant-design/icons-vue'

const isCollapsed = ref(false)
const searchText = ref('')
const expandedCategories = ref<string[]>(['datasources', 'transforms', 'outputs'])

interface NodeDefinition {
  type: string
  name: string
  description: string
  icon: any
  color: string
  category: string
}

// Node definitions
const dataSources = ref<NodeDefinition[]>([
  {
    type: 'dataset',
    name: 'Dataset',
    description: 'Load data from a source',
    icon: DatabaseOutlined,
    color: '#4285F4',
    category: 'datasources'
  }
])

const transforms = ref<NodeDefinition[]>([
  {
    type: 'transform',
    name: 'Transform',
    description: 'Apply data transformations',
    icon: FilterOutlined,
    color: '#1570EF',
    category: 'transforms'
  },
  {
    type: 'join',
    name: 'Join',
    description: 'Join two datasets',
    icon: MergeCellsOutlined,
    color: '#F59E0B',
    category: 'transforms'
  },
  {
    type: 'function',
    name: 'Function',
    description: 'Custom Python/SQL code',
    icon: FunctionOutlined,
    color: '#10B981',
    category: 'transforms'
  }
])

const outputs = ref<NodeDefinition[]>([
  {
    type: 'output',
    name: 'Output',
    description: 'Save processed data',
    icon: ExportOutlined,
    color: '#8B5CF6',
    category: 'outputs'
  }
])

// Filtered nodes based on search
const filteredDataSources = computed(() => {
  if (!searchText.value) return dataSources.value
  const search = searchText.value.toLowerCase()
  return dataSources.value.filter(n =>
    n.name.toLowerCase().includes(search) ||
    n.description.toLowerCase().includes(search)
  )
})

const filteredTransforms = computed(() => {
  if (!searchText.value) return transforms.value
  const search = searchText.value.toLowerCase()
  return transforms.value.filter(n =>
    n.name.toLowerCase().includes(search) ||
    n.description.toLowerCase().includes(search)
  )
})

const filteredOutputs = computed(() => {
  if (!searchText.value) return outputs.value
  const search = searchText.value.toLowerCase()
  return outputs.value.filter(n =>
    n.name.toLowerCase().includes(search) ||
    n.description.toLowerCase().includes(search)
  )
})

const emit = defineEmits<{
  (e: 'node-drag-start', nodeType: NodeDefinition): void
  (e: 'node-drag-end'): void
}>()

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function toggleCategory(category: string) {
  const index = expandedCategories.value.indexOf(category)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(category)
  }
}

function handleDragStart(event: DragEvent, node: NodeDefinition) {
  if (!event.dataTransfer) return

  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/x-node-type', node.type)
  event.dataTransfer.setData('application/x-node-data', JSON.stringify(node))

  // Create drag image
  const dragImage = (event.target as HTMLElement).cloneNode(true) as HTMLElement
  dragImage.style.opacity = '0.5'
  document.body.appendChild(dragImage)
  event.dataTransfer.setDragImage(dragImage, 0, 0)
  setTimeout(() => document.body.removeChild(dragImage), 0)

  emit('node-drag-start', node)
}

function handleDragEnd() {
  emit('node-drag-end')
}
</script>

<style scoped lang="less">
.node-palette {
  position: relative;
  width: 280px;
  height: 100%;
  background: #FFFFFF;
  border-right: 1px solid #E4E7EB;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  flex-shrink: 0;

  &.collapsed {
    width: 48px;
  }
}

.palette-toggle {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: #FFFFFF;
  border: 1px solid #E4E7EB;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;

  &:hover {
    background: #F8F9FA;
    color: #2D6EED;
  }
}

.palette-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.palette-header {
  padding: 16px;
  border-bottom: 1px solid #E4E7EB;
  flex-shrink: 0;
}

.palette-title {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  margin: 0 0 12px 0;
}

.palette-search {
  width: 100%;
}

.palette-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.node-category {
  margin-bottom: 8px;
}

.category-header {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #F8F9FA;
  }

  .category-icon {
    font-size: 10px;
    color: #5F6368;
    transition: transform 0.2s;

    &.expanded {
      transform: rotate(0deg);
    }

    &:not(.expanded) {
      transform: rotate(-90deg);
    }
  }

  .category-icon-left {
    font-size: 14px;
    color: #5F6368;
  }

  .category-title {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    color: #212121;
  }

  .category-count {
    font-size: 12px;
    color: #5F6368;
    background: #F5F6F7;
    padding: 2px 8px;
    border-radius: 10px;
  }
}

.category-content {
  padding: 4px 0;
}

.node-item {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    background: #F8F9FA;
  }

  &:active {
    cursor: grabbing;
    opacity: 0.7;
  }

  .node-icon {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .node-info {
    flex: 1;
    min-width: 0;
  }

  .node-name {
    font-size: 13px;
    font-weight: 500;
    color: #212121;
    margin-bottom: 2px;
  }

  .node-desc {
    font-size: 11px;
    color: #5F6368;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// Scrollbar styling
.palette-body::-webkit-scrollbar {
  width: 6px;
}

.palette-body::-webkit-scrollbar-track {
  background: transparent;
}

.palette-body::-webkit-scrollbar-thumb {
  background: #D0D5DD;
  border-radius: 3px;

  &:hover {
    background: #98A2B3;
  }
}
</style>
