<template>
  <div class="filter-transform">
    <div class="transform-header">
      <h3>Filter</h3>
      <p>Filter rows based on comparisons for selected columns.</p>
    </div>

    <a-form :model="formData" layout="vertical" class="transform-form">
      <a-form-item label="Keep rows" required>
        <a-select v-model:value="formData.matchType">
          <a-select-option value="all">that match all conditions</a-select-option>
          <a-select-option value="any">that match any condition</a-select-option>
        </a-select>
      </a-form-item>

      <!-- 条件列表 -->
      <div class="conditions-list">
        <div
          v-for="(condition, index) in formData.conditions"
          :key="index"
          class="condition-item"
        >
          <a-form-item label="Column" required>
            <a-select
              v-model:value="condition.column"
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

          <a-form-item label="Operator" required>
            <a-select v-model:value="condition.operator" placeholder="Select operator">
              <a-select-option value="equals">is equal to</a-select-option>
              <a-select-option value="not equals">is not equal to</a-select-option>
              <a-select-option value="contains">contains</a-select-option>
              <a-select-option value="not contains">does not contain</a-select-option>
              <a-select-option value="starts with">starts with</a-select-option>
              <a-select-option value="ends with">ends with</a-select-option>
              <a-select-option value=">">is greater than</a-select-option>
              <a-select-option value="<">is less than</a-select-option>
              <a-select-option value=">=">is greater than or equal to</a-select-option>
              <a-select-option value="<=">is less than or equal to</a-select-option>
              <a-select-option value="is null">is null</a-select-option>
              <a-select-option value="is not null">is not null</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item
            v-if="!['is null', 'is not null'].includes(condition.operator)"
            label="Value"
            required
          >
            <a-input v-model:value="condition.value" placeholder="Enter value" />
          </a-form-item>

          <a-button
            v-if="formData.conditions.length > 1"
            type="text"
            danger
            size="small"
            class="remove-btn"
            @click="removeCondition(index)"
          >
            <DeleteOutlined /> Remove
          </a-button>
        </div>
      </div>

      <a-button type="dashed" block @click="addCondition">
        <PlusOutlined /> Add condition
      </a-button>

      <div class="form-actions">
        <a-button @click="handleCancel">Cancel</a-button>
        <a-button type="primary" @click="handleApply" :disabled="!isValid">
          Apply
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, toRefs } from 'vue'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'

interface Column {
  name: string
  type: string
}

interface Condition {
  column: string
  operator: string
  value: any
}

interface Props {
  columns: Column[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  apply: [config: any]
  cancel: []
}>()

// Use props.columns directly - expose to template
const { columns } = toRefs(props)


const formData = reactive<{
  matchType: 'all' | 'any'
  conditions: Condition[]
}>({
  matchType: 'all',
  conditions: [
    { column: '', operator: 'equals', value: '' }
  ]
})

const isValid = computed(() => {
  return formData.conditions.every(c =>
    c.column &&
    c.operator &&
    (['is null', 'is not null'].includes(c.operator) || c.value)
  )
})

function addCondition() {
  formData.conditions.push({
    column: '',
    operator: 'equals',
    value: ''
  })
}

function removeCondition(index: number) {
  formData.conditions.splice(index, 1)
}

function handleApply() {
  emit('apply', {
    matchType: formData.matchType,
    conditions: formData.conditions
  })
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.filter-transform {
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

  .transform-form {
    .conditions-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 16px;

      .condition-item {
        padding: 16px;
        border: 1px solid #E4E7EB;
        border-radius: 6px;
        background: #F5F6F7;
        position: relative;

        .remove-btn {
          position: absolute;
          top: 8px;
          right: 8px;
        }
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
}
</style>
