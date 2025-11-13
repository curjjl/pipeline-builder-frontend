<template>
  <div class="filter-transform">
    <div class="transform-header">
      <h3>{{ t('transform.filter.title') }}</h3>
      <p>{{ t('transform.filter.description') }}</p>
    </div>

    <a-form :model="formData" layout="vertical" class="transform-form">
      <a-form-item :label="t('transform.filter.keepRows')" required>
        <a-select v-model:value="formData.matchType">
          <a-select-option value="all">{{ t('transform.filter.matchAll') }}</a-select-option>
          <a-select-option value="any">{{ t('transform.filter.matchAny') }}</a-select-option>
        </a-select>
      </a-form-item>

      <!-- 条件列表 -->
      <div class="conditions-list">
        <div
          v-for="(condition, index) in formData.conditions"
          :key="index"
          class="condition-item"
        >
          <a-form-item :label="t('transform.filter.column')" required>
            <a-select
              v-model:value="condition.column"
              :placeholder="t('transform.filter.selectColumn')"
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

          <a-form-item :label="t('transform.filter.operator')" required>
            <a-select v-model:value="condition.operator" :placeholder="t('transform.filter.selectOperator')">
              <a-select-option value="equals">{{ t('transform.filter.operators.equals') }}</a-select-option>
              <a-select-option value="not equals">{{ t('transform.filter.operators.notEquals') }}</a-select-option>
              <a-select-option value="contains">{{ t('transform.filter.operators.contains') }}</a-select-option>
              <a-select-option value="not contains">{{ t('transform.filter.operators.notContains') }}</a-select-option>
              <a-select-option value="starts with">{{ t('transform.filter.operators.startsWith') }}</a-select-option>
              <a-select-option value="ends with">{{ t('transform.filter.operators.endsWith') }}</a-select-option>
              <a-select-option value=">">{{ t('transform.filter.operators.greaterThan') }}</a-select-option>
              <a-select-option value="<">{{ t('transform.filter.operators.lessThan') }}</a-select-option>
              <a-select-option value=">=">{{ t('transform.filter.operators.greaterThanOrEqual') }}</a-select-option>
              <a-select-option value="<=">{{ t('transform.filter.operators.lessThanOrEqual') }}</a-select-option>
              <a-select-option value="is null">{{ t('transform.filter.operators.isNull') }}</a-select-option>
              <a-select-option value="is not null">{{ t('transform.filter.operators.isNotNull') }}</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item
            v-if="!['is null', 'is not null'].includes(condition.operator)"
            :label="t('transform.filter.value')"
            required
          >
            <a-input v-model:value="condition.value" :placeholder="t('transform.filter.enterValue')" />
          </a-form-item>

          <a-button
            v-if="formData.conditions.length > 1"
            type="text"
            danger
            size="small"
            class="remove-btn"
            @click="removeCondition(index)"
          >
            <DeleteOutlined /> {{ t('transform.filter.remove') }}
          </a-button>
        </div>
      </div>

      <a-button type="dashed" block @click="addCondition">
        <PlusOutlined /> {{ t('transform.filter.addCondition') }}
      </a-button>

      <div class="form-actions">
        <a-button @click="handleCancel">{{ t('transform.common.cancel') }}</a-button>
        <a-button type="primary" @click="handleApply" :disabled="!isValid">
          {{ t('transform.common.apply') }}
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'

const { t } = useI18n()

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
