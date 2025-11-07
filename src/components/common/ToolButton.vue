<template>
  <button
    class="tool-button"
    :class="{ active, disabled }"
    @click="handleClick"
  >
    <div class="tool-icon">
      <component :is="iconComponent" v-if="iconComponent" />
      <span v-else class="icon-placeholder">{{ icon }}</span>
    </div>
    <div class="tool-label">{{ label }}</div>
    <DownOutlined v-if="dropdown" class="dropdown-icon" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ToolOutlined,
  SelectOutlined,
  DeleteOutlined,
  LayoutOutlined,
  FontSizeOutlined,
  PlusOutlined,
  BlockOutlined,
  FunctionOutlined,
  ApiOutlined,
  EditOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

interface Props {
  icon?: string
  label: string
  active?: boolean
  disabled?: boolean
  dropdown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
  dropdown: false
})

const emit = defineEmits(['click'])

const iconComponent = computed(() => {
  const iconMap: Record<string, any> = {
    tool: ToolOutlined,
    select: SelectOutlined,
    remove: DeleteOutlined,
    layout: LayoutOutlined,
    text: FontSizeOutlined,
    add: PlusOutlined,
    reusable: BlockOutlined,
    transform: FunctionOutlined,
    api: ApiOutlined,
    edit: EditOutlined
  }
  return props.icon ? iconMap[props.icon] : null
})

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<style scoped lang="less">
.tool-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  min-width: 60px;

  .tool-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #5F6368;
    font-size: 18px;
    transition: color 0.15s;

    .icon-placeholder {
      font-size: 14px;
      font-weight: 600;
    }
  }

  .tool-label {
    font-size: 11px;
    color: #5F6368;
    transition: color 0.15s;
    white-space: nowrap;
  }

  .dropdown-icon {
    position: absolute;
    top: 8px;
    right: 4px;
    font-size: 10px;
    color: #5F6368;
  }

  &:hover:not(.disabled) {
    background: #E8EAED;

    .tool-icon,
    .tool-label,
    .dropdown-icon {
      color: #2D6EED;
    }
  }

  &.active {
    background: #E8F0FE;

    .tool-icon,
    .tool-label,
    .dropdown-icon {
      color: #2D6EED;
      font-weight: 500;
    }
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
}
</style>
