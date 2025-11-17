<template>
  <div class="python-transform">
    <div class="transform-header">
      <h4>Python Transform</h4>
      <p class="transform-desc">
        Write Python code to transform your data. The input DataFrame is available as <code>df</code>.
      </p>
    </div>

    <div class="transform-content">
      <!-- 模板选择 -->
      <div class="template-section">
        <label class="section-label">Quick Start Templates</label>
        <a-select
          v-model:value="selectedTemplate"
          placeholder="Choose a template..."
          style="width: 100%"
          @change="applyTemplate"
          allow-clear
        >
          <a-select-option value="add_column">Add Column</a-select-option>
          <a-select-option value="filter_rows">Filter Rows</a-select-option>
          <a-select-option value="aggregate">Aggregate Data</a-select-option>
          <a-select-option value="merge">Merge/Join Data</a-select-option>
          <a-select-option value="pivot">Pivot Table</a-select-option>
        </a-select>
      </div>

      <!-- 代码编辑器 -->
      <div class="code-section">
        <label class="section-label">Python Code</label>
        <CodeEditor
          v-model="pythonCode"
          language="python"
          :placeholder="defaultCode"
          :show-line-numbers="true"
          :show-footer="true"
          :full-height="false"
          style="height: 400px"
        />
      </div>

      <!-- 可用列信息 -->
      <div class="columns-info">
        <a-collapse>
          <a-collapse-panel key="1" header="Available Columns">
            <div class="columns-list">
              <a-tag
                v-for="col in availableColumns"
                :key="col.name"
                color="blue"
                class="column-tag"
              >
                {{ col.name }}: {{ col.type }}
              </a-tag>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <!-- 提示信息 -->
      <a-alert
        type="info"
        show-icon
        class="help-alert"
      >
        <template #message>
          <div class="help-content">
            <strong>Usage:</strong>
            <ul>
              <li>Input DataFrame: <code>df</code></li>
              <li>Return transformed DataFrame: <code>result = df.copy()</code></li>
              <li>Available libraries: <code>pandas</code>, <code>numpy</code></li>
            </ul>
          </div>
        </template>
      </a-alert>
    </div>

    <!-- 操作按钮 -->
    <div class="transform-actions">
      <a-button @click="handleCancel">
        Cancel
      </a-button>
      <a-button type="primary" @click="handleApply">
        Apply Transform
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CodeEditor from '@/components/common/CodeEditor.vue'

interface Column {
  name: string
  type: string
}

interface Props {
  availableColumns?: Column[]
}

const props = withDefaults(defineProps<Props>(), {
  availableColumns: () => []
})

const emit = defineEmits<{
  apply: [config: any]
  cancel: []
}>()

const pythonCode = ref('')
const selectedTemplate = ref<string>()

const defaultCode = `# Transform your data using pandas
# Input: df (pandas DataFrame)
# Output: return transformed DataFrame

# Example:
# df['new_column'] = df['existing_column'] * 2
# return df`

// 代码模板
const templates: Record<string, string> = {
  add_column: `# Add a new calculated column
df['total_price'] = df['quantity'] * df['unit_price']
return df`,

  filter_rows: `# Filter rows based on condition
filtered_df = df[df['amount'] > 100]
return filtered_df`,

  aggregate: `# Aggregate data by group
result = df.groupby('category').agg({
    'amount': ['sum', 'mean', 'count']
}).reset_index()
return result`,

  merge: `# Merge with another DataFrame
# merged_df = df.merge(other_df, on='key_column', how='left')
# return merged_df
return df`,

  pivot: `# Create pivot table
pivot_df = df.pivot_table(
    values='amount',
    index='category',
    columns='date',
    aggfunc='sum'
).reset_index()
return pivot_df`
}

// 应用模板
function applyTemplate() {
  if (selectedTemplate.value && templates[selectedTemplate.value]) {
    pythonCode.value = templates[selectedTemplate.value]
  }
}

// 应用转换
function handleApply() {
  const config = {
    code: pythonCode.value || defaultCode,
    language: 'python'
  }
  emit('apply', config)
}

// 取消
function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.python-transform {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.transform-header {
  margin-bottom: 20px;

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #212121;
    margin: 0 0 8px 0;
  }

  .transform-desc {
    font-size: 13px;
    color: #5F6368;
    margin: 0;

    code {
      padding: 2px 6px;
      background: #F5F6F7;
      border-radius: 3px;
      font-family: Consolas, Monaco, monospace;
      font-size: 12px;
      color: #2D6EED;
    }
  }
}

.transform-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-section,
.code-section {
  .section-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #212121;
    margin-bottom: 8px;
  }
}

.columns-info {
  .columns-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .column-tag {
      font-family: Consolas, Monaco, monospace;
      font-size: 12px;
    }
  }
}

.help-alert {
  :deep(.ant-alert-message) {
    .help-content {
      ul {
        margin: 8px 0 0 0;
        padding-left: 20px;

        li {
          margin: 4px 0;
          font-size: 12px;

          code {
            padding: 2px 6px;
            background: #E8F0FE;
            border-radius: 3px;
            font-family: Consolas, Monaco, monospace;
            font-size: 11px;
            color: #1557D0;
          }
        }
      }
    }
  }
}

.transform-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #E4E7EB;
  margin-top: auto;
}
</style>
