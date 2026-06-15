<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <el-icon size="28"><Umbrella /></el-icon>
        <span>共享雨伞管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409eff"
      >
        <template v-if="currentUser.role === 'employee'">
          <el-menu-item index="/borrow">
            <el-icon><Sell /></el-icon>
            <span>扫码借伞</span>
          </el-menu-item>
          <el-menu-item index="/my-umbrellas">
            <el-icon><User /></el-icon>
            <span>我的雨伞</span>
          </el-menu-item>
        </template>

        <template v-if="currentUser.role === 'admin'">
          <el-menu-item index="/station-manage">
            <el-icon><OfficeBuilding /></el-icon>
            <span>站点维护</span>
          </el-menu-item>
          <el-menu-item index="/transfer">
            <el-icon><Switch /></el-icon>
            <span>调拨任务</span>
          </el-menu-item>
          <el-menu-item index="/weather-warning">
            <el-icon><Warning /></el-icon>
            <span>天气预警</span>
          </el-menu-item>
          <el-menu-item index="/activity-manage">
            <el-icon><Calendar /></el-icon>
            <span>活动管理</span>
          </el-menu-item>
          <el-menu-item index="/offline-sync">
            <el-icon><Connection /></el-icon>
            <span>离线同步</span>
          </el-menu-item>
        </template>

        <template v-if="currentUser.role === 'cleaner'">
          <el-menu-item index="/damage-register">
            <el-icon><Edit /></el-icon>
            <span>破损登记</span>
          </el-menu-item>
          <el-menu-item index="/inventory">
            <el-icon><DataAnalysis /></el-icon>
            <span>批量盘点</span>
          </el-menu-item>
        </template>

        <el-sub-menu index="common">
          <template #title>
            <el-icon><Menu /></el-icon>
            <span>公共功能</span>
          </template>
          <el-menu-item index="/overdue-reminder">逾期催还</el-menu-item>
          <el-menu-item index="/repair-accept">维修验收</el-menu-item>
          <el-menu-item index="/full-station">满站推荐</el-menu-item>
          <el-menu-item index="/fee-manage">押金费用</el-menu-item>
          <el-menu-item index="/inventory-diff">盘点差异</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-radio-group v-model="selectedRole" size="small" @change="handleRoleChange">
            <el-radio-button value="employee">员工端</el-radio-button>
            <el-radio-button value="admin">行政端</el-radio-button>
            <el-radio-button value="cleaner">保洁端</el-radio-button>
          </el-radio-group>
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32">{{ currentUser.name.charAt(0) }}</el-avatar>
              <span>{{ currentUser.name }}</span>
              <el-tag size="small" :type="roleTagType">{{ roleName }}</el-tag>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <slot></slot>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUmbrellaStore } from '@/stores/umbrella'

const route = useRoute()
const router = useRouter()
const store = useUmbrellaStore()

const currentUser = computed(() => store.currentUser)
const selectedRole = ref(currentUser.value.role)
const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title || '')

const roleName = computed(() => {
  const map = { employee: '员工', admin: '行政', cleaner: '保洁' }
  return map[currentUser.value.role] || ''
})

const roleTagType = computed(() => {
  const map = { employee: 'success', admin: 'primary', cleaner: 'warning' }
  return map[currentUser.value.role] || 'info'
})

const handleRoleChange = (role) => {
  store.switchRole(role, 'E001')
  if (role === 'employee') {
    router.push('/borrow')
  } else if (role === 'admin') {
    router.push('/station-manage')
  } else if (role === 'cleaner') {
    router.push('/damage-register')
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.aside {
  background: #001529;
  color: #fff;
  overflow: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  :deep(.el-menu) {
    border-right: none;
  }
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
}

.main {
  background: #f5f7fa;
  overflow-y: auto;
  padding: 20px;
}
</style>
