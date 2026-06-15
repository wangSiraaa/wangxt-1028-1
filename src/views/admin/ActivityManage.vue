<template>
  <div class="page-container">
    <el-card shadow="hover" class="card-wrapper">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
        <h2 class="page-title" style="margin: 0">
          <el-icon><Calendar /></el-icon>
          活动雨伞管理
        </h2>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          新建活动锁定
        </el-button>
      </div>

      <el-alert
        title="场景演示2：活动批量借伞"
        type="success"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        <template #default>
          S001(A栋办公楼站点)已被"2024年中总结大会"锁定5把雨伞（U001/U002/U004/U015等），普通员工无法借出；行政可在下方一键批量分配给参会员工。
        </template>
      </el-alert>

      <el-table :data="activityLocks" border>
        <el-table-column prop="id" label="编号" width="100" />
        <el-table-column prop="activityName" label="活动名称" width="180" />
        <el-table-column label="站点" width="150">
          <template #default="{ row }">
            {{ getStationById(row.stationId)?.name }}
          </template>
        </el-table-column>
        <el-table-column label="锁定数量" width="100">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.umbrellaCount }} 把</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已借出" width="100">
          <template #default="{ row }">
            <el-tag type="success">{{ row.participants?.length || 0 }} 把</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="expireTime" label="到期时间" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '生效中' : '已释放' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              :disabled="row.status !== 'active'"
              @click="showBorrowDialog(row)"
            >
              批量分配
            </el-button>
            <el-button
              size="small"
              type="info"
              @click="showDetailDialog(row)"
            >
              详情
            </el-button>
            <el-button
              size="small"
              type="danger"
              :disabled="row.status !== 'active'"
              @click="releaseLock(row.id)"
            >
              释放
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover" class="card-wrapper">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
            <h3 style="margin: 0">
              <el-icon><Lock /></el-icon>
              活动锁定雨伞清单
            </h3>
          </div>
          <el-table :data="activityLockedUmbrellas" border size="small">
            <el-table-column prop="id" label="雨伞编号" width="100" />
            <el-table-column label="品牌" width="100">
              <template #default="{ row }">{{ row.brand }}</template>
            </el-table-column>
            <el-table-column label="颜色" width="80">
              <template #default="{ row }">
                <el-tag :color="row.color" style="color: #fff">{{ row.color }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="所属活动" width="180">
              <template #default="{ row }">
                {{ getActivityLockById(row.lockId)?.activityName }}
              </template>
            </el-table-column>
            <el-table-column label="所在站点">
              <template #default="{ row }">
                {{ getStationById(row.stationId)?.name }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="card-wrapper">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
            <h3 style="margin: 0">
              <el-icon><User /></el-icon>
              雨伞状态总览
            </h3>
          </div>
          <el-row :gutter="12">
            <el-col :span="8">
              <el-card shadow="hover" style="text-align: center">
                <el-statistic title="可借雨伞" :value="availableUmbrellas.length" value-style="{ color: '#67c23a' }" />
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" style="text-align: center">
                <el-statistic title="活动锁定" :value="activityLockedUmbrellas.length" value-style="{ color: '#e6a23c' }" />
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" style="text-align: center">
                <el-statistic title="应急保留" :value="emergencyUmbrellas.length" value-style="{ color: '#f56c6c' }" />
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="addDialogVisible" title="新建活动雨伞锁定" width="550px">
      <el-form :model="lockForm" label-width="100px">
        <el-form-item label="活动名称">
          <el-input v-model="lockForm.activityName" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="锁定站点">
          <el-select v-model="lockForm.stationId" placeholder="请选择站点" style="width: 100%">
            <el-option v-for="s in stations" :key="s.id" :label="s.name + ' (可用: ' + getAvailableUmbrellasByStation(s.id).length + ')'" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="锁定数量">
          <el-input-number v-model="lockForm.umbrellaCount" :min="1" :max="50" />
          <span style="color: #909399; font-size: 12px; margin-left: 10px">把</span>
        </el-form-item>
        <el-form-item label="到期时间">
          <el-date-picker
            v-model="lockForm.expireTime"
            type="datetime"
            placeholder="选择到期时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitLock">确认锁定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="活动锁定详情" width="600px">
      <el-descriptions :column="1" border style="margin-bottom: 15px">
        <el-descriptions-item label="活动名称">{{ currentLock?.activityName }}</el-descriptions-item>
        <el-descriptions-item label="站点">{{ getStationById(currentLock?.stationId)?.name }}</el-descriptions-item>
        <el-descriptions-item label="锁定数量">{{ currentLock?.umbrellaCount }} 把</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentLock?.operator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentLock?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="到期时间">{{ currentLock?.expireTime }}</el-descriptions-item>
      </el-descriptions>
      <h4 style="margin-bottom: 10px">锁定雨伞清单：</h4>
      <el-table :data="lockedUmbrellaList" border size="small">
        <el-table-column prop="id" label="雨伞编号" />
        <el-table-column prop="brand" label="品牌" />
        <el-table-column prop="color" label="颜色" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getUmbrellaStatusType(row.status)">
              {{ getUmbrellaStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <h4 style="margin: 15px 0 10px">已分配员工：</h4>
      <el-table v-if="currentLock?.participants?.length > 0" :data="participantList" border size="small">
        <el-table-column prop="id" label="员工编号" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="department" label="部门" />
      </el-table>
      <el-empty v-else description="暂未分配给员工" :image-size="60" />
    </el-dialog>

    <el-dialog v-model="borrowDialogVisible" title="活动批量分配雨伞" width="600px">
      <el-alert
        :title="'为【' + currentBorrowLock?.activityName + '】批量分配雨伞给参会员工'"
        type="info"
        :closable="false"
        style="margin-bottom: 15px"
      />
      <el-descriptions :column="2" border style="margin-bottom: 15px" size="small">
        <el-descriptions-item label="站点">{{ getStationById(currentBorrowLock?.stationId)?.name }}</el-descriptions-item>
        <el-descriptions-item label="剩余可分配">
          <b style="color: #67c23a">{{ remainLockCount }} 把</b>
        </el-descriptions-item>
      </el-descriptions>
      <el-form label-width="80px">
        <el-form-item label="选择员工">
          <el-select
            v-model="selectedEmployees"
            multiple
            filterable
            placeholder="请选择要分配雨伞的员工"
            style="width: 100%"
          >
            <el-option
              v-for="e in availableEmployees"
              :key="e.id"
              :label="e.id + ' - ' + e.name + '(' + e.department + ')'"
              :value="e.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="borrowDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="selectedEmployees.length === 0" @click="submitBorrow">
          确认分配（{{ selectedEmployees.length }}人）
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUmbrellaStore } from '@/stores/umbrella'
import dayjs from 'dayjs'

const store = useUmbrellaStore()

const stations = computed(() => store.stations)
const activityLocks = computed(() => store.activityLocks)
const activityLockedUmbrellas = computed(() => store.activityLockedUmbrellas)
const availableUmbrellas = computed(() => store.availableUmbrellas)
const emergencyUmbrellas = computed(() => store.emergencyUmbrellas)
const employees = computed(() => store.employees)
const getStationById = (id) => store.getStationById(id)
const getActivityLockById = (id) => store.getActivityLockById(id)
const getAvailableUmbrellasByStation = (id) => store.getAvailableUmbrellasByStation(id)
const getUmbrellaStatusText = (s) => store.getUmbrellaStatusText(s)
const getUmbrellaStatusType = (s) => store.getUmbrellaStatusType(s)

const addDialogVisible = ref(false)
const lockForm = ref({
  activityName: '',
  stationId: '',
  umbrellaCount: 3,
  expireTime: dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss')
})

const detailDialogVisible = ref(false)
const currentLock = ref(null)
const lockedUmbrellaList = computed(() => {
  if (!currentLock.value) return []
  return store.umbrellas.filter(u => u.lockId === currentLock.value.id)
})
const participantList = computed(() => {
  if (!currentLock.value?.participants) return []
  return currentLock.value.participants.map(id => store.getEmployeeById(id)).filter(Boolean)
})

const borrowDialogVisible = ref(false)
const currentBorrowLock = ref(null)
const selectedEmployees = ref([])
const remainLockCount = computed(() => {
  if (!currentBorrowLock.value) return 0
  const locked = store.umbrellas.filter(u => u.lockId === currentBorrowLock.value.id && u.status === 'activity_locked')
  return locked.length
})
const availableEmployees = computed(() => {
  return employees.value.filter(e => !e.blacklist && e.depositPaid >= 50)
})

const showAddDialog = () => {
  lockForm.value = {
    activityName: '',
    stationId: stations.value[0]?.id || '',
    umbrellaCount: 3,
    expireTime: dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss')
  }
  addDialogVisible.value = true
}

const submitLock = () => {
  if (!lockForm.value.activityName || !lockForm.value.stationId) {
    ElMessage.error('请填写完整信息')
    return
  }
  const result = store.createActivityLock(
    lockForm.value.activityName,
    lockForm.value.stationId,
    lockForm.value.umbrellaCount,
    store.currentUser.name,
    lockForm.value.expireTime
  )
  if (result.success) {
    ElMessage.success(result.message)
    addDialogVisible.value = false
  } else {
    ElMessage.error(result.message)
  }
}

const showDetailDialog = (row) => {
  currentLock.value = row
  detailDialogVisible.value = true
}

const showBorrowDialog = (row) => {
  currentBorrowLock.value = row
  selectedEmployees.value = []
  borrowDialogVisible.value = true
}

const submitBorrow = () => {
  if (selectedEmployees.value.length === 0) {
    ElMessage.error('请至少选择一位员工')
    return
  }
  if (selectedEmployees.value.length > remainLockCount.value) {
    ElMessage.error(`雨伞不足，仅剩${remainLockCount.value}把可分配`)
    return
  }
  const result = store.activityBorrowForParticipants(currentBorrowLock.value.id, selectedEmployees.value)
  if (result.success) {
    ElMessage.success(result.message)
    borrowDialogVisible.value = false
  } else {
    ElMessage.error(result.message)
  }
}

const releaseLock = (lockId) => {
  const result = store.releaseActivityLock(lockId)
  ElMessage.success(result.message)
}
</script>
