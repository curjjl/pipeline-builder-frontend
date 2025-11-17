<template>
  <div class="code-editor" :class="{ 'full-height': fullHeight }">
    <div class="editor-header">
      <div class="header-left">
        <component :is="getLanguageIcon()" class="language-icon" />
        <span class="language-label">{{ language.toUpperCase() }}</span>
      </div>
      <div class="header-right">
        <a-tooltip title="Format code">
          <a-button type="text" size="small" @click="formatCode">
            <FormatPainterOutlined />
          </a-button>
        </a-tooltip>
        <a-tooltip title="Copy code">
          <a-button type="text" size="small" @click="copyCode">
            <CopyOutlined />
          </a-button>
        </a-tooltip>
      </div>
    </div>

    <div class="editor-body">
      <div class="line-numbers" v-if="showLineNumbers">
        <div
          v-for="line in lineCount"
          :key="line"
          class="line-number"
        >
          {{ line }}
        </div>
      </div>

      <textarea
        ref="textareaRef"
        v-model="localValue"
        :placeholder="placeholder"
        :readonly="readonly"
        class="code-textarea"
        :style="{ fontFamily: 'Consolas, Monaco, monospace' }"
        @input="handleInput"
        @keydown="handleKeyDown"
        @scroll="handleScroll"
        spellcheck="false"
      />
    </div>

    <div v-if="showFooter" class="editor-footer">
      <div class="footer-left">
        <span class="footer-item">Ln {{ currentLine }}, Col {{ currentColumn }}</span>
        <span class="footer-item">{{ characterCount }} characters</span>
      </div>
      <div class="footer-right">
        <a-tag size="small" :color="hasChanges ? 'orange' : 'default'">
          {{ hasChanges ? 'Modified' : 'Saved' }}
        </a-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  CopyOutlined,
  FormatPainterOutlined,
  CodeOutlined,
  DatabaseOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'

interface Props {
  modelValue?: string
  language?: 'python' | 'sql' | 'javascript' | 'json'
  placeholder?: string
  readonly?: boolean
  showLineNumbers?: boolean
  showFooter?: boolean
  fullHeight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'python',
  placeholder: '// Enter your code here...',
  readonly: false,
  showLineNumbers: true,
  showFooter: true,
  fullHeight: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const localValue = ref(props.modelValue)
const hasChanges = ref(false)
const currentLine = ref(1)
const currentColumn = ref(1)

// 计算行数
const lineCount = computed(() => {
  return localValue.value.split('\n').length
})

// 计算字符数
const characterCount = computed(() => {
  return localValue.value.length
})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== localValue.value) {
    localValue.value = newVal
    hasChanges.value = false
  }
})

// 处理输入
function handleInput() {
  hasChanges.value = true
  emit('update:modelValue', localValue.value)
  emit('change', localValue.value)
  updateCursorPosition()
}

// 处理键盘事件
function handleKeyDown(e: KeyboardEvent) {
  // Tab键插入2个空格
  if (e.key === 'Tab') {
    e.preventDefault()
    const start = textareaRef.value!.selectionStart
    const end = textareaRef.value!.selectionEnd
    const before = localValue.value.substring(0, start)
    const after = localValue.value.substring(end)

    localValue.value = before + '  ' + after

    nextTick(() => {
      textareaRef.value!.selectionStart = textareaRef.value!.selectionEnd = start + 2
      handleInput()
    })
  }

  // 更新光标位置
  setTimeout(updateCursorPosition, 0)
}

// 更新光标位置
function updateCursorPosition() {
  if (!textareaRef.value) return

  const position = textareaRef.value.selectionStart
  const textBeforeCursor = localValue.value.substring(0, position)
  const lines = textBeforeCursor.split('\n')

  currentLine.value = lines.length
  currentColumn.value = lines[lines.length - 1].length + 1
}

// 处理滚动同步
function handleScroll() {
  const lineNumbers = document.querySelector('.line-numbers') as HTMLElement
  if (lineNumbers && textareaRef.value) {
    lineNumbers.scrollTop = textareaRef.value.scrollTop
  }
}

// 格式化代码
function formatCode() {
  try {
    if (props.language === 'json') {
      const parsed = JSON.parse(localValue.value)
      localValue.value = JSON.stringify(parsed, null, 2)
      handleInput()
      message.success('Code formatted')
    } else if (props.language === 'sql') {
      // 简单的 SQL 格式化
      localValue.value = localValue.value
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ',\n  ')
        .replace(/\s+(FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN)/gi, '\n$1')
        .trim()
      handleInput()
      message.success('Code formatted')
    } else {
      message.info('Auto-format not available for this language')
    }
  } catch (error: any) {
    message.error('Format failed: ' + error.message)
  }
}

// 复制代码
async function copyCode() {
  try {
    await navigator.clipboard.writeText(localValue.value)
    message.success('Code copied to clipboard')
  } catch (error) {
    message.error('Failed to copy code')
  }
}

// 获取语言图标
function getLanguageIcon() {
  const icons: Record<string, any> = {
    python: CodeOutlined,
    sql: DatabaseOutlined,
    javascript: CodeOutlined,
    json: FileTextOutlined
  }
  return icons[props.language] || CodeOutlined
}

// 暴露方法
defineExpose({
  focus: () => textareaRef.value?.focus(),
  getValue: () => localValue.value,
  setValue: (val: string) => {
    localValue.value = val
    hasChanges.value = false
  }
})
</script>

<style scoped lang="less">
.code-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid #E4E7EB;
  border-radius: 6px;
  background: #FFFFFF;
  overflow: hidden;

  &.full-height {
    height: 100%;
  }
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #F5F6F7;
  border-bottom: 1px solid #E4E7EB;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;

    .language-icon {
      font-size: 14px;
      color: #2D6EED;
    }

    .language-label {
      font-size: 12px;
      font-weight: 600;
      color: #5F6368;
      text-transform: uppercase;
    }
  }

  .header-right {
    display: flex;
    gap: 4px;
  }
}

.editor-body {
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #FAFAFA;
}

.line-numbers {
  width: 50px;
  background: #F5F6F7;
  border-right: 1px solid #E4E7EB;
  overflow: hidden;
  user-select: none;
  padding: 12px 0;
  text-align: right;

  .line-number {
    height: 20px;
    line-height: 20px;
    font-family: Consolas, Monaco, monospace;
    font-size: 13px;
    color: #98A2B3;
    padding-right: 12px;
  }
}

.code-textarea {
  flex: 1;
  padding: 12px;
  border: none;
  outline: none;
  resize: none;
  font-size: 13px;
  line-height: 20px;
  color: #212121;
  background: transparent;
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: auto;

  &::placeholder {
    color: #98A2B3;
  }

  &:focus {
    background: #FFFFFF;
  }

  &[readonly] {
    background: #F5F6F7;
    color: #5F6368;
    cursor: not-allowed;
  }
}

.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #F5F6F7;
  border-top: 1px solid #E4E7EB;
  font-size: 11px;
  color: #5F6368;

  .footer-left {
    display: flex;
    gap: 16px;

    .footer-item {
      font-family: Consolas, Monaco, monospace;
    }
  }
}
</style>
