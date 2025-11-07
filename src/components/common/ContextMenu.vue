<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="context-menu-overlay"
      @click="handleClose"
      @contextmenu.prevent
    >
      <div
        class="context-menu"
        :style="{ top: y + 'px', left: x + 'px' }"
        @click.stop
      >
        <template v-for="(item, index) in items" :key="index">
          <div v-if="item.type === 'divider'" class="menu-divider"></div>

          <div
            v-else-if="item.children"
            class="menu-item"
            :class="{ disabled: item.disabled }"
            @mouseenter="handleItemMouseEnter(item)"
            @mouseleave="handleItemMouseLeave()"
          >
            <component :is="getIcon(item.icon)" v-if="item.icon" class="item-icon" />
            <span class="item-label">{{ item.label }}</span>
            <RightOutlined class="submenu-arrow" />

            <!-- 子菜单 -->
            <div
              v-if="activeSubmenu === item.key"
              class="submenu"
              @click.stop
            >
              <div
                v-for="child in item.children"
                :key="child.key"
                class="menu-item"
                :class="{ disabled: child.disabled }"
                @click="handleSelect(child.key)"
              >
                <component :is="getIcon(child.icon)" v-if="child.icon" class="item-icon" />
                <span class="item-label">{{ child.label }}</span>
              </div>
            </div>
          </div>

          <div
            v-else
            class="menu-item"
            :class="{ disabled: item.disabled }"
            @click="handleSelect(item.key)"
          >
            <component :is="getIcon(item.icon)" v-if="item.icon" class="item-icon" />
            <span class="item-label">{{ item.label }}</span>
          </div>
        </template>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  ThunderboltOutlined,
  EditOutlined,
  CopyOutlined,
  SnippetsOutlined,
  DeleteOutlined,
  FunctionOutlined,
  PlusCircleOutlined,
  ScissorOutlined,
  MergeCellsOutlined,
  EyeOutlined,
  RightOutlined
} from '@ant-design/icons-vue'

export interface MenuItem {
  key: string
  label: string
  icon?: string
  disabled?: boolean
  type?: 'divider'
  children?: MenuItem[]
}

interface Props {
  x: number
  y: number
  items: MenuItem[]
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true
})

const emit = defineEmits(['select', 'close'])

const activeSubmenu = ref<string | null>(null)

const getIcon = (iconName?: string) => {
  const iconMap: Record<string, any> = {
    thunderbolt: ThunderboltOutlined,
    edit: EditOutlined,
    copy: CopyOutlined,
    snippets: SnippetsOutlined,
    delete: DeleteOutlined,
    function: FunctionOutlined,
    'plus-circle': PlusCircleOutlined,
    scissor: ScissorOutlined,
    'merge-cells': MergeCellsOutlined,
    eye: EyeOutlined
  }
  return iconName ? iconMap[iconName] : null
}

const handleSelect = (key: string) => {
  emit('select', key)
  handleClose()
}

const handleClose = () => {
  emit('close')
}

const handleItemMouseEnter = (item: MenuItem) => {
  if (item.children) {
    activeSubmenu.value = item.key
  }
}

const handleItemMouseLeave = () => {
  // 延迟关闭子菜单，给用户时间移动到子菜单
  setTimeout(() => {
    activeSubmenu.value = null
  }, 100)
}

// 点击外部关闭
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      document.addEventListener('click', handleClose)
    } else {
      document.removeEventListener('click', handleClose)
    }
  }
)
</script>

<style scoped lang="less">
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.context-menu {
  position: fixed;
  background: #FFFFFF;
  border: 1px solid #D0D5DD;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 200px;
  z-index: 1001;
  animation: fadeIn 0.15s ease-out;

  .menu-item {
    padding: 8px 16px;
    font-size: 13px;
    color: #212121;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: background 0.15s;
    position: relative;

    .item-icon {
      width: 16px;
      height: 16px;
      color: #5F6368;
      flex-shrink: 0;
    }

    .item-label {
      flex: 1;
    }

    .submenu-arrow {
      width: 12px;
      height: 12px;
      color: #5F6368;
      flex-shrink: 0;
    }

    &:hover:not(.disabled) {
      background: #F5F6F7;

      .item-icon,
      .submenu-arrow {
        color: #2D6EED;
      }
    }

    &.disabled {
      color: #BABEC4;
      cursor: not-allowed;

      .item-icon {
        color: #BABEC4;
      }
    }
  }

  .menu-divider {
    height: 1px;
    background: #E4E7EB;
    margin: 4px 0;
  }

  .submenu {
    position: absolute;
    left: 100%;
    top: 0;
    background: #FFFFFF;
    border: 1px solid #D0D5DD;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 4px 0;
    min-width: 180px;
    margin-left: 4px;
    animation: fadeIn 0.15s ease-out;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
