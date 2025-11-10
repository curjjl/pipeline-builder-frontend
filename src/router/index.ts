import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    redirect: '/pipelines',
    children: [
      {
        path: 'pipelines',
        name: 'PipelineList',
        component: () => import('@/views/pipeline/PipelineList.vue'),
        meta: {
          title: '管道列表'
        }
      },
      {
        path: 'executions',
        name: 'ExecutionList',
        component: () => import('@/views/execution/ExecutionList.vue'),
        meta: {
          title: '执行历史'
        }
      }
    ]
  },
  // PipelineEditor uses full-screen layout without DefaultLayout
  {
    path: '/pipelines/:id/edit',
    name: 'PipelineEditor',
    component: () => import('@/views/pipeline/PipelineEditor.vue'),
    props: true,
    meta: {
      title: '编辑管道',
      fullscreen: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Pipeline Builder`
  } else {
    document.title = 'Pipeline Builder'
  }
  next()
})

export default router
