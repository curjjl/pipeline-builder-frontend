<template>
  <div class="sort-transform">
    <div class="transform-header">
      <h3>SORT</h3>
      <p>Sort rows by column values.</p>
    </div>

    <a-form :model="formData" layout="vertical" class="transform-form">
      <a-form-item label="Sort by column" required>
        <a-select
          v-model:value="formData.column"
          placeholder="Select column"
          show-search
        >
          <a-select-option
            v-for="col in columns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Order" required>
        <a-radio-group v-model:value="formData.order">
          <a-radio value="asc">Ascending</a-radio>
          <a-radio value="desc">Descending</a-radio>
        </a-radio-group>
      </a-form-item>

      <div class="form-actions">
        <a-button @click="handleCancel">Cancel</a-button>
        <a-button type="primary" @click="handleApply" :disabled="!formData.column">
          Apply
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'

interface Column {
  name: string
  type: string
}

interface Props {
  columns: Column[]
  initialConfig?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  apply: [config: any]
  cancel: []
}>()

const formData = reactive({
  column: '',
  order: 'asc' as 'asc' | 'desc'
})

// Load initial configuration if provided
function loadInitialConfig() {
  if (props.initialConfig) {
    console.log('SortTransform loading initial config:', props.initialConfig)
    if (props.initialConfig.column) {
      formData.column = props.initialConfig.column
    }
    if (props.initialConfig.order) {
      formData.order = props.initialConfig.order
    }
  }
}

// Load config on mount
onMounted(() => {
  loadInitialConfig()
})

// Watch for changes to initialConfig
watch(() => props.initialConfig, () => {
  loadInitialConfig()
}, { deep: true })

function handleApply() {
  emit('apply', formData)
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.sort-transform {
  padding: 20px;

  .transform-header {
    margin-bottom: 24px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #212121;
      margin: 0 0 8px 0;
    }

    p {
      font-size: 13px;
      color: #5F6368;
      margin: 0;
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #E4E7EB;
  }
}
</style>
