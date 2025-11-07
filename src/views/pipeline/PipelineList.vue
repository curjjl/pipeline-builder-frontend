<template>
  <div class="pipeline-list">
    <div class="page-header">
      <h2>管道列表</h2>
      <a-button type="primary" @click="handleCreate">
        <PlusOutlined />
        创建管道
      </a-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { Pipeline } from '@/types'

const router = useRouter()
const loading = ref(false)
const pipelines = ref<Pipeline[]>([])

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

function handleCreate() {
  router.push('/pipelines/new/edit')
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
