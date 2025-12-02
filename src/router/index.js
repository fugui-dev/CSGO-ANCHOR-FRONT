import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        name: 'Dashboard',
        meta: { title: '每日统计', icon: 'dashboard' }
      },
      {
        path: 'users',
        component: () => import('@/views/users/index.vue'),
        name: 'Users',
        meta: { title: '推荐用户列表', icon: 'user' }
      },
      {
        path: 'consumption',
        component: () => import('@/views/consumption/index.vue'),
        name: 'Consumption',
        meta: { title: '消费记录', icon: 'list' }
      },
      {
        path: 'cdk',
        component: () => import('@/views/cdk/index.vue'),
        name: 'CDK',
        meta: { title: 'CDK列表', icon: 'document' }
      },
      {
        path: 'performance',
        component: () => import('@/views/performance/index.vue'),
        name: 'Performance',
        meta: { title: '业绩提取记录', icon: 'data-line' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

