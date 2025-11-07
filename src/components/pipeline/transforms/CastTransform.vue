<template>
  <div class="cast-transform">
    <div class="transform-header">
      <h3>Cast to Date</h3>
      <p>Casting strings to date requires you to specify how the strings are formatted.</p>
    </div>

    <a-form :model="formData" layout="vertical" class="transform-form">
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

      <a-form-item label="Type" required>
        <a-select v-model:value="formData.toType" placeholder="Select target type">
          <a-select-option value="String">String</a-select-option>
          <a-select-option value="Number">Number</a-select-option>
          <a-select-option value="Date">Date</a-select-option>
          <a-select-option value="Boolean">Boolean</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        v-if="formData.toType === 'Date'"
        label="Formats"
        required
      >
        <a-select
          v-model:value="formData.format"
          placeholder="Select date format"
        >
          <a-select-option value="yyyy-MM-dd">yyyy-MM-dd</a-select-option>
          <a-select-option value="yyyy-MM-dd'T'HH:mm:ss.SSSXXX">ISO 8601</a-select-option>
          <a-select-option value="MM/dd/yyyy">MM/dd/yyyy</a-select-option>
          <a-select-option value="dd/MM/yyyy">dd/MM/yyyy</a-select-option>
        </a-select>
      </a-form-item>

      <div class="form-actions">
        <a-button @click="handleCancel">Cancel</a-button>
        <a-button
          type="primary"
          @click="handleApply"
          :disabled="!formData.column || !formData.toType"
        >
          Apply
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface Column {
  name: string
  type: string
}

interface Props {
  columns: Column[]
}

defineProps<Props>()

const emit = defineEmits<{
  apply: [config: any]
  cancel: []
}>()

const formData = reactive({
  column: '',
  toType: '' as 'String' | 'Number' | 'Date' | 'Boolean' | '',
  format: 'yyyy-MM-dd'
})

function handleApply() {
  emit('apply', formData)
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.cast-transform {
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
