<template>
  <div class="groupby-transform">
    <div class="transform-header">
      <h3>Aggregate (Group By)</h3>
      <p>Group rows and apply aggregation functions.</p>
    </div>

    <a-form :model="formData" layout="vertical" class="transform-form">
      <a-form-item label="Group by columns" required>
        <a-select
          v-model:value="formData.groupBy"
          mode="multiple"
          placeholder="Select columns to group by"
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

      <a-divider>Aggregations</a-divider>

      <div class="aggregations-list">
        <div
          v-for="(agg, index) in formData.aggregations"
          :key="index"
          class="aggregation-item"
        >
          <a-form-item label="Column" required>
            <a-select
              v-model:value="agg.column"
              placeholder="Select column"
              show-search
            >
              <a-select-option
                v-for="col in numericColumns"
                :key="col.name"
                :value="col.name"
              >
                {{ col.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Function" required>
            <a-select v-model:value="agg.func" placeholder="Select function">
              <a-select-option value="sum">Sum</a-select-option>
              <a-select-option value="avg">Average</a-select-option>
              <a-select-option value="count">Count</a-select-option>
              <a-select-option value="min">Min</a-select-option>
              <a-select-option value="max">Max</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="As (output name)">
            <a-input
              v-model:value="agg.as"
              :placeholder="`${agg.func}_${agg.column}`"
            />
          </a-form-item>

          <a-button
            v-if="formData.aggregations.length > 1"
            type="text"
            danger
            size="small"
            @click="removeAggregation(index)"
          >
            <DeleteOutlined /> Remove
          </a-button>
        </div>
      </div>

      <a-button type="dashed" block @click="addAggregation">
        <PlusOutlined /> Add aggregation
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
import { reactive, computed } from 'vue'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'

interface Column {
  name: string
  type: string
}

interface Props {
  columns: Column[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  apply: [config: any]
  cancel: []
}>()

const formData = reactive({
  groupBy: [] as string[],
  aggregations: [
    { column: '', func: 'sum', as: '' }
  ]
})

const numericColumns = computed(() =>
  props.columns.filter(c => c.type === 'Number')
)

const isValid = computed(() => {
  return (
    formData.groupBy.length > 0 &&
    formData.aggregations.every(a => a.column && a.func)
  )
})

function addAggregation() {
  formData.aggregations.push({ column: '', func: 'sum', as: '' })
}

function removeAggregation(index: number) {
  formData.aggregations.splice(index, 1)
}

function handleApply() {
  emit('apply', formData)
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.groupby-transform {
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

  .aggregations-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;

    .aggregation-item {
      padding: 16px;
      border: 1px solid #E4E7EB;
      border-radius: 6px;
      background: #F5F6F7;
      position: relative;
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
