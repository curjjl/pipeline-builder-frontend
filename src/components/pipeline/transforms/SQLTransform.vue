<template>
  <div class="sql-transform">
    <div class="transform-header">
      <h4>SQL Transform</h4>
      <p class="transform-desc">
        Write SQL query to transform your data. The input table is available as <code>input_table</code>.
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
          <a-select-option value="select_all">Select All</a-select-option>
          <a-select-option value="select_columns">Select Columns</a-select-option>
          <a-select-option value="where_clause">Filter with WHERE</a-select-option>
          <a-select-option value="group_by">Group By & Aggregate</a-select-option>
          <a-select-option value="join">Join Tables</a-select-option>
          <a-select-option value="order_by">Order By</a-select-option>
        </a-select>
      </div>

      <!-- SQL 编辑器 -->
      <div class="code-section">
        <label class="section-label">SQL Query</label>
        <CodeEditor
          v-model="sqlQuery"
          language="sql"
          :placeholder="defaultSQL"
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
                @click="insertColumn(col.name)"
              >
                {{ col.name }}: {{ col.type }}
              </a-tag>
            </div>
            <div class="columns-hint">
              💡 Click on a column to insert it into your query
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <!-- SQL 语法提示 -->
      <a-alert
        type="info"
        show-icon
        class="help-alert"
      >
        <template #message>
          <div class="help-content">
            <strong>SQL Syntax:</strong>
            <ul>
              <li>Table name: <code>input_table</code></li>
              <li>Select: <code>SELECT column1, column2 FROM input_table</code></li>
              <li>Filter: <code>WHERE condition</code></li>
              <li>Aggregate: <code>GROUP BY column HAVING condition</code></li>
              <li>Sort: <code>ORDER BY column ASC/DESC</code></li>
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

const sqlQuery = ref('')
const selectedTemplate = ref<string>()

const defaultSQL = `-- Write your SQL query here
-- Table: input_table

SELECT *
FROM input_table
LIMIT 100`

// SQL 模板
const templates: Record<string, string> = {
  select_all: `SELECT *
FROM input_table`,

  select_columns: `SELECT
  column1,
  column2,
  column3
FROM input_table`,

  where_clause: `SELECT *
FROM input_table
WHERE amount > 100
  AND status = 'active'`,

  group_by: `SELECT
  category,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM input_table
GROUP BY category
HAVING COUNT(*) > 5
ORDER BY total_amount DESC`,

  join: `SELECT
  a.*,
  b.additional_column
FROM input_table a
LEFT JOIN other_table b
  ON a.key_column = b.key_column`,

  order_by: `SELECT *
FROM input_table
ORDER BY created_date DESC, amount ASC
LIMIT 100`
}

// 应用模板
function applyTemplate() {
  if (selectedTemplate.value && templates[selectedTemplate.value]) {
    sqlQuery.value = templates[selectedTemplate.value]
  }
}

// 插入列名
function insertColumn(columnName: string) {
  // 在光标位置插入列名
  sqlQuery.value += (sqlQuery.value ? ', ' : '') + columnName
}

// 应用转换
function handleApply() {
  const config = {
    query: sqlQuery.value || defaultSQL,
    language: 'sql'
  }
  emit('apply', config)
}

// 取消
function handleCancel() {
  emit('cancel')
}
</script>

<style scoped lang="less">
.sql-transform {
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
    margin-bottom: 12px;

    .column-tag {
      font-family: Consolas, Monaco, monospace;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(45, 110, 237, 0.3);
      }
    }
  }

  .columns-hint {
    font-size: 11px;
    color: #98A2B3;
    font-style: italic;
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
