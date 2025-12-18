<template>
  <div class="pipeline-list">
    <div class="page-header">
      <h2>管道列表</h2>
      <a-space>
        <a-button type="primary" @click="showCreateModal = true">
          <PlusOutlined />
          创建管道
        </a-button>
      </a-space>
    </div>

    <a-empty v-if="!loading && pipelines.length === 0" description="暂无管道，点击「创建管道」开始" />

    <a-table
      v-else
      :columns="columns"
      :data-source="pipelines"
      :loading="loading"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" size="small" @click="handleRun(record)">运行</a-button>
            <a-popconfirm
              title="确定要删除这个管道吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-else-if="column.key === 'updatedAt'">
          {{ formatDate(record.updatedAt) }}
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDate(record.createdAt) }}
        </template>
      </template>
    </a-table>

    <!-- Create Pipeline Modal -->
    <CreatePipelineModal
      v-model:open="showCreateModal"
      @create="handleCreatePipeline"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { Pipeline } from '@/types'
import CreatePipelineModal from '@/components/pipeline/CreatePipelineModal.vue'
import { usePipelineStore } from '@/stores/modules/pipeline'
import type { PipelineData } from '@/utils/indexedDB'

const router = useRouter()
const pipelineStore = usePipelineStore()
const loading = ref(false)
const pipelines = ref<PipelineData[]>([])
const showCreateModal = ref(false)

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt'
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt'
  },
  {
    title: '操作',
    key: 'action',
    width: 200
  }
]

onMounted(() => {
  loadPipelines()
})

// 格式化日期
function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 从 IndexedDB 加载管道列表
async function loadPipelines() {
  loading.value = true
  try {
    pipelines.value = await pipelineStore.getAllPipelines()
  } catch (error) {
    console.error('Failed to load pipelines:', error)
    message.error('加载管道列表失败')
  } finally {
    loading.value = false
  }
}

function handleCreatePipeline(data: any) {
  console.log('Creating pipeline with data:', data)
  // Navigate to pipeline editor with the creation data
  router.push({
    path: '/pipelines/new/edit',
    query: {
      type: data.type,
      name: data.name,
      description: data.description,
      location: data.location
    }
  })
}

function handleEdit(record: PipelineData) {
  router.push(`/pipelines/${record.id}/edit`)
}

function handleRun(record: PipelineData) {
  message.info('运行功能开发中...')
  console.log('Run pipeline:', record.id)
}

async function handleDelete(record: PipelineData) {
  try {
    await pipelineStore.deletePipeline(record.id)
    message.success('删除成功')
    // 重新加载列表
    await loadPipelines()
  } catch (error) {
    console.error('Delete pipeline error:', error)
    message.error('删除失败')
  }
}
</script>

<style scoped lang="less">
.pipeline-list {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      margin: 0;
    }
  }
}
</style>
