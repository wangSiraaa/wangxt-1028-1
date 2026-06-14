import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/borrow'
  },
  {
    path: '/borrow',
    name: 'Borrow',
    component: () => import('@/views/employee/Borrow.vue'),
    meta: { title: '员工借伞', role: 'employee' }
  },
  {
    path: '/my-umbrellas',
    name: 'MyUmbrellas',
    component: () => import('@/views/employee/MyUmbrellas.vue'),
    meta: { title: '我的雨伞', role: 'employee' }
  },
  {
    path: '/station-manage',
    name: 'StationManage',
    component: () => import('@/views/admin/StationManage.vue'),
    meta: { title: '站点维护', role: 'admin' }
  },
  {
    path: '/transfer',
    name: 'TransferTask',
    component: () => import('@/views/admin/TransferTask.vue'),
    meta: { title: '调拨任务', role: 'admin' }
  },
  {
    path: '/weather-warning',
    name: 'WeatherWarning',
    component: () => import('@/views/admin/WeatherWarning.vue'),
    meta: { title: '天气预警', role: 'admin' }
  },
  {
    path: '/damage-register',
    name: 'DamageRegister',
    component: () => import('@/views/cleaner/DamageRegister.vue'),
    meta: { title: '破损登记', role: 'cleaner' }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/views/cleaner/Inventory.vue'),
    meta: { title: '批量盘点', role: 'cleaner' }
  },
  {
    path: '/overdue-reminder',
    name: 'OverdueReminder',
    component: () => import('@/views/common/OverdueReminder.vue'),
    meta: { title: '逾期催还' }
  },
  {
    path: '/repair-accept',
    name: 'RepairAccept',
    component: () => import('@/views/common/RepairAccept.vue'),
    meta: { title: '维修验收' }
  },
  {
    path: '/full-station',
    name: 'FullStation',
    component: () => import('@/views/common/FullStation.vue'),
    meta: { title: '满站推荐' }
  },
  {
    path: '/fee-manage',
    name: 'FeeManage',
    component: () => import('@/views/common/FeeManage.vue'),
    meta: { title: '押金费用' }
  },
  {
    path: '/inventory-diff',
    name: 'InventoryDiff',
    component: () => import('@/views/common/InventoryDiff.vue'),
    meta: { title: '盘点差异' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
