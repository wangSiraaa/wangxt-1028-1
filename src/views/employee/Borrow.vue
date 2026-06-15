<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="weather-warning" v-if="activeWarning">
          <el-icon size="20"><Warning /></el-icon>
          <span>{{ activeWarning.msg }}</span>
        </div>

        <div class="card-wrapper">
          <h2 class="page-title">
            <el-icon><Sell /></el-icon>
            扫码借伞
          </h2>

          <el-form :model="borrowForm" label-width="100px">
            <el-form-item label="当前用户">
              <el-tag size="large">{{ currentUser.name }}</el-tag>
              <el-tag v-if="borrowCheck.can" type="success" style="margin-left: 10px">可借伞</el-tag>
              <el-tag v-else type="danger" style="margin-left: 10px">{{ borrowCheck.reason }}</el-tag>
            </el-form-item>

            <el-form-item label="选择站点">
              <el-select v-model="borrowForm.stationId" placeholder="请选择站点" style="width: 100%" @change="onStationChange">
                <el-option
                  v-for="station in allStations"
                  :key="station.id"
                  :label="station.name + ' (可用: ' + getAvailableUmbrellasByStation(station.id).length + ')' + (station.offline ? ' [离线]' : '')"
                  :value="station.id"
                >
                  <span>{{ station.name }} (可用: {{ getAvailableUmbrellasByStation(station.id).length }})</span>
                  <el-tag v-if="station.offline" type="danger" size="small" style="margin-left: 8px">离线</el-tag>
                  <el-tag v-if="station.weatherWarning" type="warning" size="small" style="margin-left: 8px">预警</el-tag>
                </el-option>
              </el-select>
            </el-form-item>

            <el-alert
              v-if="selectedStationOffline"
              title="该站点当前离线"
              type="warning"
              :closable="false"
              show-icon
              style="margin-bottom: 15px"
            >
              <template #default>
                离线站点扫码借伞操作将缓存到本地，站点恢复在线后自动同步回放，不会丢单。
              </template>
            </el-alert>

            <el-alert
              v-if="selectedStationWarning"
              :title="'该站点有暴雨预警，已保留应急库存'"
              type="warning"
              :closable="false"
              show-icon
              style="margin-bottom: 15px"
            >
              <template #default>
                应急库存雨伞仅行政可调拨，普通员工无法借出。
              </template>
            </el-alert>

            <el-form-item label="选择雨伞" v-if="borrowForm.stationId">
              <el-radio-group v-model="borrowForm.umbrellaId">
                <el-radio
                  v-for="umbrella in stationAllUmbrellas"
                  :key="umbrella.id"
                  :value="umbrella.id"
                  :disabled="umbrella.status !== 'available'"
                  style="display: block; margin-bottom: 10px"
                >
                  <el-card shadow="hover" :class="getUmbrellaCardClass(umbrella)">
                    <div style="display: flex; align-items: center; gap: 15px">
                      <el-avatar :size="50" :style="{ backgroundColor: umbrella.color }">
                        <el-icon size="28"><Umbrella /></el-icon>
                      </el-avatar>
                      <div>
                        <div style="font-weight: 600">{{ umbrella.id }} - {{ umbrella.brand }}</div>
                        <div style="color: #909399; font-size: 12px">
                          颜色: {{ umbrella.color }} |
                          <el-tag :type="getUmbrellaStatusType(umbrella.status)" size="small">
                            {{ getUmbrellaStatusText(umbrella.status) }}
                          </el-tag>
                        </div>
                        <div v-if="umbrella.status === 'damaged'" style="color: #f56c6c; font-size: 12px; margin-top: 4px">
                          破损原因: {{ umbrella.damageDesc }}
                        </div>
                        <div v-if="umbrella.status === 'emergency_reserve'" style="color: #f56c6c; font-size: 12px; margin-top: 4px">
                          <el-icon><Warning /></el-icon>
                          应急库存保留，仅行政可调拨
                        </div>
                        <div v-if="umbrella.status === 'activity_locked'" style="color: #e6a23c; font-size: 12px; margin-top: 4px">
                          <el-icon><Lock /></el-icon>
                          已被"{{ getActivityLockById(umbrella.lockId)?.activityName || '活动' }}"锁定，无法借出
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :disabled="!borrowForm.umbrellaId"
                @click="handleBorrow"
                style="width: 100%"
              >
                <el-icon><Camera /></el-icon>
                {{ selectedStationOffline ? '离线扫码借伞' : '扫码借伞' }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="card-wrapper">
          <h2 class="page-title">
            <el-icon><WarningFilled /></el-icon>
            业务规则演示
          </h2>
          <el-alert
            title="应急库存拦截"
            type="error"
            :closable="false"
            style="margin-bottom: 10px"
          >
            <template #default>
              暴雨预警站点S003的应急库存雨伞标记为emergency_reserve，普通员工无法借出，仅行政可调拨
            </template>
          </el-alert>
          <el-alert
            title="活动锁定拦截"
            type="warning"
            :closable="false"
            style="margin-bottom: 10px"
          >
            <template #default>
              活动锁定的雨伞标记为activity_locked，普通员工无法按平时规则借出，需行政批量分配
            </template>
          </el-alert>
          <el-alert
            title="离线借伞不丢单"
            type="info"
            :closable="false"
            style="margin-bottom: 10px"
          >
            <template #default>
              站点离线时扫码借伞操作缓存到本地，恢复在线后按时间顺序回放同步
            </template>
          </el-alert>
          <el-alert
            title="逾期/黑名单禁止借"
            type="error"
            :closable="false"
            style="margin-bottom: 10px"
          >
            <template #default>
              <el-button size="small" type="warning" @click="testBlacklist">切换到黑名单用户(E003)测试</el-button>
              <el-button size="small" type="warning" @click="testOverdue" style="margin-left: 10px">切换到逾期用户(E004)测试</el-button>
            </template>
          </el-alert>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="card-wrapper">
          <h2 class="page-title">
            <el-icon><Goods /></el-icon>
            我要还伞
          </h2>

          <el-table :data="myBorrowed" v-if="myBorrowed.length > 0" style="margin-bottom: 20px">
            <el-table-column prop="umbrellaId" label="雨伞编号" />
            <el-table-column prop="borrowTime" label="借出时间" />
            <el-table-column prop="expectReturnTime" label="预计归还">
              <template #default="{ row }">
                <span :style="{ color: row.overdue ? '#f56c6c' : '' }">
                  {{ row.expectReturnTime }}
                  <el-tag v-if="row.overdue" type="danger" size="small" style="margin-left: 5px">已逾期</el-tag>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="showReturnDialog(row)">归还</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="您当前没有待归还的雨伞" />
        </div>

        <div class="card-wrapper">
          <h2 class="page-title">
            <el-icon><OfficeBuilding /></el-icon>
            站点状态
          </h2>
          <el-row :gutter="10">
            <el-col :span="12" v-for="station in allStations" :key="station.id">
              <el-card shadow="hover" style="margin-bottom: 10px" :class="{ 'offline-station': station.offline }">
                <div style="font-weight: 600; margin-bottom: 8px">
                  {{ station.name }}
                  <el-tag v-if="station.offline" type="danger" size="small" style="margin-left: 5px">离线</el-tag>
                  <el-tag v-if="station.weatherWarning" type="warning" size="small" style="margin-left: 5px">预警</el-tag>
                </div>
                <div style="font-size: 12px; color: #909399; margin-bottom: 8px">{{ station.location }}</div>
                <el-progress
                  :percentage="Math.round(station.currentCount / station.capacity * 100)"
                  :status="station.currentCount >= station.capacity ? 'exception' : station.currentCount === 0 ? 'warning' : ''"
                />
                <div style="text-align: center; margin-top: 8px; font-size: 12px">
                  {{ station.currentCount }} / {{ station.capacity }}
                  <span v-if="getEmergencyCount(station.id) > 0" style="color: #f56c6c; margin-left: 5px">
                    (应急{{ getEmergencyCount(station.id) }})
                  </span>
                  <span v-if="getActivityLockedCount(station.id) > 0" style="color: #e6a23c; margin-left: 5px">
                    (锁定{{ getActivityLockedCount(station.id) }})
                  </span>
                  <span v-if="station.currentCount >= station.capacity" style="color: #f56c6c; margin-left: 5px">(已满)</span>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="returnDialogVisible" title="归还雨伞" width="500px">
      <el-form :model="returnForm" label-width="100px">
        <el-form-item label="雨伞编号">
          <el-tag>{{ returnForm.record?.umbrellaId }}</el-tag>
        </el-form-item>
        <el-form-item label="借出站点">
          <span>{{ getStationById(returnForm.record?.borrowStation)?.name }}</span>
        </el-form-item>
        <el-form-item label="归还站点">
          <el-select v-model="returnForm.stationId" placeholder="请选择归还站点" style="width: 100%">
            <el-option
              v-for="station in allStations"
              :key="station.id"
              :label="station.name + ' (剩余空位: ' + (station.capacity - station.currentCount) + ')' + (station.offline ? ' [离线]' : '')"
              :value="station.id"
            />
          </el-select>
        </el-form-item>
        <el-alert
          v-if="recommendStations.length > 0"
          title="该站点已满，推荐以下站点"
          type="warning"
          :closable="false"
          style="margin-top: 10px"
        >
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item
              v-for="s in recommendStations"
              :key="s.id"
              :label="s.name"
            >
              {{ s.location }}，可还{{ s.available }}把
              <el-tag v-if="!s.reachable" type="danger" size="small" style="margin-left: 5px">不可达</el-tag>
              <el-button type="primary" size="small" @click="returnForm.stationId = s.id" style="margin-left: 10px">选择</el-button>
            </el-descriptions-item>
          </el-descriptions>
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="returnDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!returnForm.stationId" @click="handleReturn">确认归还</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUmbrellaStore } from '@/stores/umbrella'

const store = useUmbrellaStore()

const currentUser = computed(() => store.currentUser)
const allStations = computed(() => store.stations)
const activeWarning = computed(() => store.weatherWarnings.find(w => w.status === 'active'))
const borrowCheck = computed(() => store.checkCanBorrow(currentUser.value.id))
const myBorrowed = computed(() => store.getBorrowedByEmployee(currentUser.value.id))

const borrowForm = ref({ stationId: '', umbrellaId: '' })
const stationAllUmbrellas = ref([])
const returnDialogVisible = ref(false)
const returnForm = ref({ record: null, stationId: '' })
const recommendStations = ref([])

const getAvailableUmbrellasByStation = (stationId) => store.getAvailableUmbrellasByStation(stationId)
const getStationById = (id) => store.getStationById(id)
const getActivityLockById = (id) => store.getActivityLockById(id)
const getUmbrellaStatusText = (s) => store.getUmbrellaStatusText(s)
const getUmbrellaStatusType = (s) => store.getUmbrellaStatusType(s)

const selectedStationOffline = computed(() => {
  if (!borrowForm.value.stationId) return false
  return getStationById(borrowForm.value.stationId)?.offline || false
})

const selectedStationWarning = computed(() => {
  if (!borrowForm.value.stationId) return false
  const station = getStationById(borrowForm.value.stationId)
  return station?.weatherWarning || false
})

const getEmergencyCount = (stationId) =>
  store.umbrellas.filter(u => u.stationId === stationId && u.status === 'emergency_reserve').length

const getActivityLockedCount = (stationId) =>
  store.umbrellas.filter(u => u.stationId === stationId && u.status === 'activity_locked').length

const getUmbrellaCardClass = (umbrella) => {
  if (umbrella.status === 'available') return ''
  if (umbrella.status === 'emergency_reserve') return 'emergency-card'
  if (umbrella.status === 'activity_locked') return 'activity-card'
  return 'disabled-card'
}

const onStationChange = (stationId) => {
  borrowForm.value.umbrellaId = ''
  const available = store.getAvailableUmbrellasByStation(stationId)
  const emergency = store.umbrellas.filter(u => u.stationId === stationId && u.status === 'emergency_reserve')
  const activityLocked = store.umbrellas.filter(u => u.stationId === stationId && u.status === 'activity_locked')
  const damaged = store.umbrellas.filter(u => u.stationId === stationId && u.status === 'damaged')
  stationAllUmbrellas.value = [...available, ...emergency, ...activityLocked, ...damaged]
}

const handleBorrow = () => {
  const isOffline = selectedStationOffline.value
  const result = store.borrowUmbrella(
    borrowForm.value.umbrellaId,
    currentUser.value.id,
    borrowForm.value.stationId,
    isOffline
  )
  if (result.success) {
    ElMessage.success(result.message)
    borrowForm.value.umbrellaId = ''
    onStationChange(borrowForm.value.stationId)
  } else {
    ElMessage.error(result.message)
  }
}

const showReturnDialog = (record) => {
  returnForm.value = { record, stationId: '' }
  recommendStations.value = []
  returnDialogVisible.value = true
}

watch(() => returnForm.value.stationId, (newVal) => {
  if (newVal && returnForm.value.record) {
    const station = getStationById(newVal)
    if (station && station.currentCount >= station.capacity) {
      const result = store.returnUmbrella(returnForm.value.record.id, newVal)
      if (!result.success && result.recommendStations) {
        recommendStations.value = result.recommendStations
        ElMessage.warning(result.message)
      }
    } else {
      recommendStations.value = []
    }
  }
})

const handleReturn = () => {
  const station = getStationById(returnForm.value.stationId)
  const isOffline = station?.offline || false
  const result = store.returnUmbrella(returnForm.value.record.id, returnForm.value.stationId, isOffline)
  if (result.success) {
    ElMessage.success(result.message + (result.overdueFee > 0 ? `，逾期费${result.overdueFee}元` : ''))
    returnDialogVisible.value = false
  } else if (result.recommendStations) {
    recommendStations.value = result.recommendStations
    ElMessage.warning(result.message)
  } else {
    ElMessage.error(result.message)
  }
}

const testBlacklist = () => {
  store.switchRole('employee', 'E003')
  ElMessage.info('已切换到黑名单用户E003(王五)，测试黑名单禁止借伞规则')
}

const testOverdue = () => {
  store.switchRole('employee', 'E004')
  ElMessage.info('已切换到逾期用户E004(赵六)，测试逾期禁止借伞规则')
}
</script>

<style scoped lang="scss">
.disabled-card {
  opacity: 0.5;
  background: #f5f7fa;
}

.emergency-card {
  opacity: 0.6;
  background: #fef0f0;
  border: 1px dashed #f56c6c;
}

.activity-card {
  opacity: 0.6;
  background: #fdf6ec;
  border: 1px dashed #e6a23c;
}

.offline-station {
  border: 2px dashed #f56c6c;
}
</style>
