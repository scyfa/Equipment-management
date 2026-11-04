import { createRouter, createWebHashHistory } from 'vue-router'
import { authState, consoleHome } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/HomeView.vue') },
      { path: 'tenders', name: 'tenders', component: () => import('@/views/TenderListView.vue') },
      {
        path: 'tenders/:id',
        name: 'tender-detail',
        component: () => import('@/views/TenderDetailView.vue')
      },
      { path: 'messages', name: 'messages', component: () => import('@/views/MessageBoardView.vue') },
      { path: 'help', name: 'help', component: () => import('@/views/HelpView.vue') }
    ]
  },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
  {
    path: '/console',
    component: () => import('@/layouts/ConsoleLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'console', redirect: () => consoleHome(authState.user?.role) },

      /* ---------------- 招标单位 ---------------- */
      {
        path: 'tenderer/tenders',
        name: 'tenderer-tenders',
        component: () => import('@/views/console/tenderer/TenderManageView.vue'),
        meta: { roles: ['tenderer'] }
      },
      {
        path: 'tenderer/tenders/new',
        name: 'tenderer-tender-new',
        component: () => import('@/views/console/tenderer/TenderFormView.vue'),
        meta: { roles: ['tenderer'] }
      },
      {
        path: 'tenderer/tenders/:id/edit',
        name: 'tenderer-tender-edit',
        component: () => import('@/views/console/tenderer/TenderFormView.vue'),
        meta: { roles: ['tenderer'] }
      },
      {
        path: 'tenderer/bids',
        name: 'tenderer-bids',
        component: () => import('@/views/console/tenderer/BidReceivedView.vue'),
        meta: { roles: ['tenderer'] }
      },
      {
        path: 'tenderer/suppliers',
        name: 'tenderer-suppliers',
        component: () => import('@/views/console/tenderer/SupplierDirectoryView.vue'),
        meta: { roles: ['tenderer'] }
      },

      /* ---------------- 设备厂家 ---------------- */
      {
        path: 'supplier/bids',
        name: 'supplier-bids',
        component: () => import('@/views/console/supplier/MyBidView.vue'),
        meta: { roles: ['supplier'] }
      },
      {
        path: 'supplier/messages',
        name: 'supplier-messages',
        component: () => import('@/views/console/supplier/MyMessageView.vue'),
        meta: { roles: ['supplier'] }
      },

      /* ---------------- 管理员 ---------------- */
      {
        path: 'admin',
        name: 'admin-overview',
        component: () => import('@/views/console/admin/AdminOverviewView.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'admin/suppliers',
        name: 'admin-suppliers',
        component: () => import('@/views/console/admin/SupplierManageView.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'admin/tenderers',
        name: 'admin-tenderers',
        component: () => import('@/views/console/admin/TendererManageView.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'admin/messages',
        name: 'admin-messages',
        component: () => import('@/views/console/admin/MessageManageView.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'admin/tenders',
        name: 'admin-tenders',
        component: () => import('@/views/console/admin/AdminTenderView.vue'),
        meta: { roles: ['admin'] }
      },

      /* ---------------- 通用 ---------------- */
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/console/ProfileView.vue')
      }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !authState.user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.roles && authState.user && !to.meta.roles.includes(authState.user.role)) {
    return consoleHome(authState.user.role)
  }
  if ((to.name === 'login' || to.name === 'register') && authState.user) {
    return consoleHome(authState.user.role)
  }
  return true
})

export default router
