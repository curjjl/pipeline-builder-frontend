<template>
  <div class="pipeline-list">
    <div class="page-header">
      <h2>管道列表</h2>
      <a-space>
        <a-button @click="handleLoadDemo">
          <RocketOutlined />
          加载演示Pipeline
        </a-button>
        <a-button type="primary" @click="showCreateModal = true">
          <PlusOutlined />
          创建管道
        </a-button>
      </a-space>
    </div>

    <a-table :columns="columns" :data-source="pipelines" :loading="loading" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" size="small" @click="handleRun(record)">运行</a-button>
            <a-button type="link" danger size="small" @click="handleDelete(record)">删除</a-button>
          </a-space>
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
import { PlusOutlined, RocketOutlined } from '@ant-design/icons-vue'
import type { Pipeline } from '@/types'
import CreatePipelineModal from '@/components/pipeline/CreatePipelineModal.vue'
import { getCompleteDemoConfig, exportPipelineSchema } from '@/utils/demoData'
import { usePipelineStore } from '@/stores/modules/pipeline'

const router = useRouter()
const pipelineStore = usePipelineStore()
const loading = ref(false)
const pipelines = ref<Pipeline[]>([])
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
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt'
  },
  {
    title: '创建人',
    dataIndex: 'createdBy',
    key: 'createdBy'
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

async function loadPipelines() {
  loading.value = true
  try {
    // TODO: 调用 API 加载数据
    // pipelines.value = await pipelineApi.list()

    // 模拟数据
    pipelines.value = [
      {
        id: '1',
        name: '示例管道',
        description: '这是一个示例管道',
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin'
      }
    ]
  } catch (error) {
    console.error('Failed to load pipelines:', error)
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

function handleEdit(record: Pipeline) {
  router.push(`/pipelines/${record.id}/edit`)
}

function handleRun(record: Pipeline) {
  console.log('Run pipeline:', record.id)
}

function handleDelete(record: Pipeline) {
  console.log('Delete pipeline:', record.id)
}

/**
 * 加载演示Pipeline
 */
async function handleLoadDemo() {
  try {
    // 获取演示配置
    const { pipeline, transforms } = getCompleteDemoConfig()

    // 加载到store
    pipelineStore.setPipeline(pipeline)

    // 加载Transform配置
    transforms.forEach((transformList, nodeId) => {
      transformList.forEach(transform => {
        pipelineStore.addTransform(nodeId, transform)
      })
    })

    // 保存到localStorage
    await pipelineStore.savePipeline()

    message.success('演示Pipeline已加载！')

    // 导航到编辑器
    router.push(`/pipelines/${pipeline.id}/edit`)
  } catch (error: any) {
    message.error(`加载演示失败: ${error.message}`)
    console.error('Load demo error:', error)
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
