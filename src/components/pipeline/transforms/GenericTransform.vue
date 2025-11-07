<template>
  <div class="generic-transform">
    <div class="transform-header">
      <h3>{{ transform.name }}</h3>
      <p v-if="transform.description">{{ transform.description }}</p>
    </div>

    <a-form :model="formData" layout="vertical" class="transform-form">
      <a-alert
        message="This transform is using a generic configuration form."
        type="info"
        show-icon
        style="margin-bottom: 16px"
      />

      <!-- 通用配置：选择列 -->
      <a-form-item label="Column" required>
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

      <!-- 通用配置：输入值 -->
      <a-form-item
        v-if="needsValue"
        label="Value"
      >
        <a-input v-model:value="formData.value" placeholder="Enter value" />
      </a-form-item>

      <div class="form-actions">
        <a-button @click="handleCancel">Cancel</a-button>
        <a-button
          type="primary"
          @click="handleApply"
          :disabled="!formData.column"
        >
          Apply
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

interface Column {
  name: string
  type: string
}

interface Transform {
  key: string
  name: string
  description?: string
}

interface Props {
  transform: Transform
  columns: Column[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  apply: [config: any]
  cancel: []
}>()

const formData = reactive({
  column: '',
  value: ''
})

// 判断是否需要值输入
const needsValue = computed(() => {
  const noValueTransforms = ['distinct', 'trim']
  return !noValueTransforms.includes(props.transform.key)
})

function handleApply() {
  emit('apply', formData)
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.generic-transform {
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
