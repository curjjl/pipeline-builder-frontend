<template>
  <div v-if="visible" class="node-toolbar" :style="toolbarStyle">
    <a-tooltip title="Transform">
      <a-button
        type="text"
        size="small"
        class="toolbar-btn"
        @click="emit('transform')"
      >
        <FunctionOutlined />
      </a-button>
    </a-tooltip>

    <a-tooltip title="Split">
      <a-button
        type="text"
        size="small"
        class="toolbar-btn"
        @click="emit('split')"
      >
        <ScissorOutlined />
      </a-button>
    </a-tooltip>

    <a-tooltip title="Join">
      <a-button
        type="text"
        size="small"
        class="toolbar-btn"
        @click="emit('join')"
      >
        <MergeCellsOutlined />
      </a-button>
    </a-tooltip>

    <div class="toolbar-divider"></div>

    <a-tooltip title="Delete">
      <a-button
        type="text"
        size="small"
        class="toolbar-btn danger"
        @click="emit('delete')"
      >
        <DeleteOutlined />
      </a-button>
    </a-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  FunctionOutlined,
  ScissorOutlined,
  MergeCellsOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

interface Props {
  visible: boolean
  x: number
  y: number
  width: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  transform: []
  split: []
  join: []
  delete: []
}>()

const toolbarStyle = computed(() => ({
  position: 'absolute',
  left: `${props.x + props.width / 2}px`,
  top: `${props.y - 40}px`,
  transform: 'translateX(-50%)'
}))
</script>

<style scoped lang="less">
.node-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: #FFFFFF;
  border: 1px solid #D0D5DD;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  animation: fadeInUp 0.2s ease-out;

  .toolbar-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #5F6368;
    border-radius: 4px;

    &:hover {
      background: #F5F6F7;
      color: #2D6EED;
    }

    &.danger:hover {
      background: #FCE8E6;
      color: #EA4335;
    }
  }

  .toolbar-divider {
    width: 1px;
    height: 24px;
    background: #E4E7EB;
    margin: 0 4px;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
