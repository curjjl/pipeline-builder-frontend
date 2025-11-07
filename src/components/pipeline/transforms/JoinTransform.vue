<template>
  <div class="join-transform">
    <div class="form-section">
      <label>Join Type</label>
      <a-select
        v-model:value="localConfig.type"
        style="width: 100%"
        @change="handleConfigChange"
      >
        <a-select-option value="inner">Inner Join</a-select-option>
        <a-select-option value="left">Left Join</a-select-option>
        <a-select-option value="right">Right Join</a-select-option>
        <a-select-option value="outer">Full Outer Join</a-select-option>
      </a-select>
    </div>

    <div class="form-section">
      <label>Left Table Key</label>
      <a-select
        v-model:value="localConfig.leftKey"
        style="width: 100%"
        placeholder="Select key column"
        @change="handleConfigChange"
      >
        <a-select-option
          v-for="col in leftColumns"
          :key="col"
          :value="col"
        >
          {{ col }}
        </a-select-option>
      </a-select>
    </div>

    <div class="form-section">
      <label>Right Table Key</label>
      <a-select
        v-model:value="localConfig.rightKey"
        style="width: 100%"
        placeholder="Select key column"
        @change="handleConfigChange"
      >
        <a-select-option
          v-for="col in rightColumns"
          :key="col"
          :value="col"
        >
          {{ col }}
        </a-select-option>
      </a-select>
    </div>

    <div class="join-preview" v-if="previewInfo">
      <a-alert
        :message="previewInfo"
        type="info"
        show-icon
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface JoinConfig {
  type: 'inner' | 'left' | 'right' | 'outer'
  leftKey: string
  rightKey: string
}

interface Props {
  config?: JoinConfig
  leftColumns?: string[]
  rightColumns?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({
    type: 'inner',
    leftKey: '',
    rightKey: ''
  }),
  leftColumns: () => [],
  rightColumns: () => []
})

const emit = defineEmits<{
  'update:config': [config: JoinConfig]
}>()

const localConfig = ref<JoinConfig>({
  type: props.config.type || 'inner',
  leftKey: props.config.leftKey || '',
  rightKey: props.config.rightKey || ''
})

watch(
  () => props.config,
  (newConfig) => {
    if (newConfig) {
      localConfig.value = { ...newConfig }
    }
  },
  { deep: true }
)

const previewInfo = computed(() => {
  const { type, leftKey, rightKey } = localConfig.value
  if (!leftKey || !rightKey) return ''

  const typeDescriptions: Record<string, string> = {
    inner: 'Returns only matching rows from both tables',
    left: 'Returns all rows from left table and matching rows from right table',
    right: 'Returns all rows from right table and matching rows from left table',
    outer: 'Returns all rows from both tables'
  }

  return `${typeDescriptions[type]} where ${leftKey} = ${rightKey}`
})

function handleConfigChange() {
  emit('update:config', { ...localConfig.value })
}
</script>

<style scoped lang="less">
.join-transform {
  padding: 16px;
}

.form-section {
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #344054;
  }
}

.join-preview {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #EAECF0;
}
</style>
