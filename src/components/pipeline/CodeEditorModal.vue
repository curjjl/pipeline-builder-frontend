<template>
  <a-modal
    v-model:open="visible"
    :title="t('codeEditor.title')"
    width="90%"
    :style="{ top: '20px', maxWidth: '1400px' }"
    :footer="null"
    :destroyOnClose="true"
    @cancel="handleCancel"
  >
    <div class="code-editor-modal">
      <!-- Toolbar -->
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <a-select
            v-model:value="language"
            style="width: 150px"
            size="large"
            @change="handleLanguageChange"
          >
            <a-select-option value="sql">
              <DatabaseOutlined /> SQL
            </a-select-option>
            <a-select-option value="python">
              <CodeOutlined /> Python
            </a-select-option>
            <a-select-option value="javascript">
              <CodeOutlined /> JavaScript
            </a-select-option>
          </a-select>

          <a-divider type="vertical" style="height: 32px" />

          <a-space>
            <a-tooltip :title="t('codeEditor.format')">
              <a-button @click="handleFormat" size="large">
                <FormatPainterOutlined />
              </a-button>
            </a-tooltip>

            <a-tooltip :title="t('codeEditor.validate')">
              <a-button @click="handleValidate" size="large">
                <CheckCircleOutlined />
              </a-button>
            </a-tooltip>

            <a-tooltip :title="t('codeEditor.fullscreen')">
              <a-button @click="toggleFullscreen" size="large">
                <FullscreenOutlined v-if="!isFullscreen" />
                <FullscreenExitOutlined v-else />
              </a-button>
            </a-tooltip>
          </a-space>
        </div>

        <div class="toolbar-right">
          <a-space>
            <a-tag v-if="validationStatus" :color="validationStatus === 'valid' ? 'success' : 'error'">
              {{ validationStatus === 'valid' ? t('codeEditor.valid') : t('codeEditor.invalid') }}
            </a-tag>
            <span class="line-info">{{ t('codeEditor.lines', { count: lineCount }) }}</span>
          </a-space>
        </div>
      </div>

      <!-- Editor Container -->
      <div class="editor-container" :class="{ 'fullscreen': isFullscreen }">
        <div ref="editorRef" class="monaco-editor"></div>
      </div>

      <!-- Bottom Info Panel -->
      <div class="editor-info" v-if="validationMessage">
        <a-alert
          :type="validationStatus === 'valid' ? 'success' : 'error'"
          :message="validationMessage"
          show-icon
          closable
          @close="validationMessage = ''"
        />
      </div>

      <!-- Code Snippets Sidebar (Optional) -->
      <div class="snippets-sidebar" v-if="showSnippets && language === 'sql'">
        <h4>{{ t('codeEditor.snippets') }}</h4>
        <div class="snippet-list">
          <div
            v-for="snippet in sqlSnippets"
            :key="snippet.label"
            class="snippet-item"
            @click="insertSnippet(snippet.code)"
          >
            <div class="snippet-label">{{ snippet.label }}</div>
            <div class="snippet-desc">{{ snippet.description }}</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="modal-actions">
        <a-button @click="handleCancel" size="large">
          {{ t('common.actions.cancel') }}
        </a-button>
        <a-button
          type="primary"
          @click="handleSave"
          size="large"
          :disabled="!isCodeValid"
        >
          <SaveOutlined />
          {{ t('common.actions.save') }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  DatabaseOutlined,
  CodeOutlined,
  FormatPainterOutlined,
  CheckCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import * as monaco from 'monaco-editor'

const { t } = useI18n()

interface Props {
  open?: boolean
  initialCode?: string
  initialLanguage?: 'sql' | 'python' | 'javascript'
  readOnly?: boolean
  showSnippets?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  initialCode: '',
  initialLanguage: 'sql',
  readOnly: false,
  showSnippets: true
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [code: string, language: string]
}>()

const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// State
const editorRef = ref<HTMLElement>()
const language = ref(props.initialLanguage)
const editorInstance = ref<monaco.editor.IStandaloneCodeEditor>()
const isFullscreen = ref(false)
const validationStatus = ref<'valid' | 'invalid' | null>(null)
const validationMessage = ref('')
const lineCount = ref(0)

// Computed
const isCodeValid = computed(() => {
  return validationStatus.value !== 'invalid'
})

// SQL Snippets
const sqlSnippets = [
  {
    label: 'SELECT *',
    description: 'Select all columns',
    code: 'SELECT * FROM table_name'
  },
  {
    label: 'JOIN',
    description: 'Join two tables',
    code: 'SELECT *\nFROM table1 t1\nJOIN table2 t2 ON t1.id = t2.id'
  },
  {
    label: 'GROUP BY',
    description: 'Group and aggregate',
    code: 'SELECT column, COUNT(*)\nFROM table_name\nGROUP BY column'
  },
  {
    label: 'WHERE',
    description: 'Filter rows',
    code: 'SELECT *\nFROM table_name\nWHERE condition'
  }
]

// Initialize editor
onMounted(() => {
  if (editorRef.value) {
    nextTick(() => {
      initializeEditor()
    })
  }
})

onBeforeUnmount(() => {
  if (editorInstance.value) {
    editorInstance.value.dispose()
  }
})

// Watch for modal open/close
watch(() => props.open, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (!editorInstance.value && editorRef.value) {
        initializeEditor()
      } else if (editorInstance.value) {
        editorInstance.value.setValue(props.initialCode || '')
        editorInstance.value.layout()
      }
    })
  }
})

function initializeEditor() {
  if (!editorRef.value) return

  // Configure Monaco environment
  monaco.editor.defineTheme('palantir-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
      { token: 'string', foreground: 'A31515' },
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'number', foreground: '098658' }
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#000000',
      'editor.lineHighlightBackground': '#F8F9FA',
      'editor.selectionBackground': '#ADD6FF',
      'editorLineNumber.foreground': '#98A2B3'
    }
  })

  // Create editor instance
  editorInstance.value = monaco.editor.create(editorRef.value, {
    value: props.initialCode || '',
    language: language.value,
    theme: 'palantir-light',
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: true,
    scrollBeyondLastLine: false,
    readOnly: props.readOnly,
    minimap: {
      enabled: true
    },
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    formatOnPaste: true,
    formatOnType: true,
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    matchBrackets: 'always',
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoIndent: 'full'
  })

  // Listen to content changes
  editorInstance.value.onDidChangeModelContent(() => {
    updateLineCount()
    validationStatus.value = null
    validationMessage.value = ''
  })

  updateLineCount()
}

function updateLineCount() {
  if (editorInstance.value) {
    lineCount.value = editorInstance.value.getModel()?.getLineCount() || 0
  }
}

function handleLanguageChange() {
  if (editorInstance.value) {
    const model = editorInstance.value.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, language.value)
    }
  }
}

function handleFormat() {
  if (editorInstance.value) {
    editorInstance.value.getAction('editor.action.formatDocument')?.run()
    message.success(t('codeEditor.formatted'))
  }
}

function handleValidate() {
  if (!editorInstance.value) return

  const code = editorInstance.value.getValue()

  if (!code.trim()) {
    validationStatus.value = 'invalid'
    validationMessage.value = t('codeEditor.emptyCode')
    return
  }

  // Basic validation (can be enhanced with actual parsers)
  try {
    if (language.value === 'sql') {
      validateSQL(code)
    } else if (language.value === 'python') {
      validatePython(code)
    } else if (language.value === 'javascript') {
      validateJavaScript(code)
    }

    validationStatus.value = 'valid'
    validationMessage.value = t('codeEditor.validationSuccess')
    message.success(t('codeEditor.validationSuccess'))
  } catch (error: any) {
    validationStatus.value = 'invalid'
    validationMessage.value = error.message
    message.error(t('codeEditor.validationFailed'))
  }
}

function validateSQL(code: string) {
  // Basic SQL validation
  const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP BY', 'ORDER BY', 'INSERT', 'UPDATE', 'DELETE']
  const upperCode = code.toUpperCase()

  if (!keywords.some(keyword => upperCode.includes(keyword))) {
    throw new Error(t('codeEditor.invalidSQL'))
  }

  // Check for balanced parentheses
  const openCount = (code.match(/\(/g) || []).length
  const closeCount = (code.match(/\)/g) || []).length
  if (openCount !== closeCount) {
    throw new Error(t('codeEditor.unmatchedParentheses'))
  }
}

function validatePython(code: string) {
  // Basic Python validation
  if (code.includes('import ') && !code.includes('def ') && !code.includes('class ')) {
    // Just imports, might be incomplete
  }

  // Check indentation consistency (basic check)
  const lines = code.split('\n')
  const indents = lines
    .filter(line => line.trim())
    .map(line => line.match(/^\s*/)?.[0].length || 0)

  // Very basic check - just ensure we have some code
  if (code.trim().length < 10) {
    throw new Error(t('codeEditor.codeTooShort'))
  }
}

function validateJavaScript(code: string) {
  // Try to parse JavaScript
  try {
    new Function(code)
  } catch (error: any) {
    throw new Error(`${t('codeEditor.syntaxError')}: ${error.message}`)
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  nextTick(() => {
    if (editorInstance.value) {
      editorInstance.value.layout()
    }
  })
}

function insertSnippet(code: string) {
  if (editorInstance.value) {
    const position = editorInstance.value.getPosition()
    if (position) {
      editorInstance.value.executeEdits('', [
        {
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: code
        }
      ])
      editorInstance.value.focus()
    }
  }
}

function handleSave() {
  if (!editorInstance.value) return

  const code = editorInstance.value.getValue()

  if (!code.trim()) {
    message.warning(t('codeEditor.emptyCode'))
    return
  }

  emit('save', code, language.value)
  message.success(t('codeEditor.saved'))
  visible.value = false
}

function handleCancel() {
  visible.value = false
}
</script>

<style scoped lang="less">
.code-editor-modal {
  display: flex;
  flex-direction: column;
  height: 75vh;
  min-height: 500px;

  .editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #F8F9FA;
    border: 1px solid #E4E7EB;
    border-radius: 6px 6px 0 0;
    margin-bottom: 0;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .line-info {
        font-size: 13px;
        color: #5F6368;
      }
    }
  }

  .editor-container {
    flex: 1;
    border: 1px solid #E4E7EB;
    border-top: none;
    overflow: hidden;
    position: relative;

    &.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      border-radius: 0;
    }

    .monaco-editor {
      height: 100%;
      width: 100%;
    }
  }

  .editor-info {
    margin-top: 12px;
  }

  .snippets-sidebar {
    width: 280px;
    background: #F8F9FA;
    border: 1px solid #E4E7EB;
    border-radius: 6px;
    padding: 16px;
    margin-top: 12px;
    max-height: 300px;
    overflow-y: auto;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #212121;
      margin: 0 0 12px 0;
    }

    .snippet-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .snippet-item {
        padding: 10px 12px;
        background: #FFFFFF;
        border: 1px solid #E4E7EB;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: #4285F4;
          box-shadow: 0 2px 4px rgba(66, 133, 244, 0.1);
        }

        .snippet-label {
          font-size: 13px;
          font-weight: 600;
          color: #212121;
          margin-bottom: 4px;
        }

        .snippet-desc {
          font-size: 12px;
          color: #5F6368;
        }
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid #E4E7EB;
    margin-top: 20px;
  }
}
</style>
