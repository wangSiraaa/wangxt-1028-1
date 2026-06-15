<template>
  <div class="page-container">
    <el-card shadow="hover" class="card-wrapper">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
        <h2 class="page-title" style="margin: 0">
          <el-icon><Warning /></el-icon>
          天气预警与应急库存
        </h2>
        <div style="display: flex; gap: 10px">
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            发布预警
          </el-button>
        </div>
      </div>

      <el-alert
        title="场景演示1：暴雨预警应急库存保留"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        <template #default>
          S003(C栋宿舍楼站点)当前处于暴雨黄色预警状态，已保留应急库存(雨伞U006/U007/U013标记为emergency_reserve)，普通员工无法借出，仅行政可调拨。可点击下方"释放应急库存"解除保留。
          <div style="margin-top: 8px">
            <el-button type="warning" size="small" @click="runDemo">
              <el-icon><VideoPlay /></el-icon>
              一键演示暴雨库存保留
            </el-button>
            <el-button type="primary" size="small" @click="goToBorrowTest" style="margin-left: 10px">
              <el-icon><Sell /></el-icon>
              切换员工端验证借伞拦截
            </el-button>
          </div>
        </template>
      </el-alert>

      <el-row :gutter="20">
        <el-col :span="12" v-for="warning in weatherWarnings" :key="warning.id">
          <el-card shadow="hover" :class="'warning-card warning-' + warning.level">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px">
              <el-icon size="48"><WarningFilled /></el-icon>
              <div>
                <div style="font-size: 18px; font-weight: 600">{{ warning.msg }}</div>
                <div style="color: rgba(255,255,255,0.8); font-size: 12px">{{ warning.publishTime }}</div>
              </div>
              <el-tag style="margin-left: auto" :type="getLevelType(warning.level)">
                {{ getLevelText(warning.level) }}
              </el-tag>
            </div>
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="预警类型">
                {{ getTypeText(warning.type) }}
              </el-descriptions-item>
              <el-descriptions-item label="关联站点">
                {{ getStationById(warning.stationId)?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="应急库存保留">
                <el-tag v-if="warning.reserveCount" type="info">
                  保留 {{ warning.reserveCount }} 把
                </el-tag>
                <span v-else style="color: rgba(255,255,255,0.7)">未设置</span>
              </el-descriptions-item>
            </el-descriptions>
            <div style="margin-top: 15px; display: flex; gap: 8px; flex-wrap: wrap">
              <el-button
                v-if="warning.status === 'active' && !warning.reserveCount"
                size="small"
                type="info"
                @click="showReserveDialog(warning)"
              >
                设置应急库存
              </el-button>
              <el-button
                v-if="warning.status === 'active'"
                size="small"
                type="info"
                plain
                @click="cancelWarning(warning)"
              >
                取消预警
              </el-button>
              <el-tag v-else type="info">已取消</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="weatherWarnings.length === 0" description="暂无天气预警" />
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="14">
        <el-card shadow="hover" class="card-wrapper">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
            <h3 style="margin: 0">
              <el-icon><OfficeBuilding /></el-icon>
              站点预警与应急库存状态
            </h3>
          </div>
          <el-table :data="stations" border>
            <el-table-column prop="id" label="编号" width="80" />
            <el-table-column prop="name" label="站点名称" width="150" />
            <el-table-column label="预警状态" width="120">
              <template #default="{ row }">
                <el-tag v-if="row.weatherWarning" type="danger">
                  <el-icon><Warning /></el-icon>预警
                </el-tag>
                <el-tag v-else type="success">正常</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="可用/应急/容量" width="160">
              <template #default="{ row }">
                <span>{{ getAvailableCount(row.id) }}/{{ getEmergencyCount(row.id) }}/{{ row.capacity }}</span>
              </template>
            </el-table-column>
            <el-table-column label="离线状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.offline" type="danger" effect="dark">离线</el-tag>
                <el-tag v-else type="success">在线</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="{ row }">
                <el-button size="small" :type="row.offline ? 'success' : 'warning'" @click="toggleStationOffline(row)">
                  {{ row.offline ? '恢复在线' : '标记离线' }}
                </el-button>
                <el-button
                  v-if="getEmergencyReserveByStation(row.id)?.status === 'active'"
                  size="small"
                  type="danger"
                  plain
                  @click="releaseStationReserve(row.id)"
                >
                  释放库存
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card shadow="hover" class="card-wrapper">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
            <h3 style="margin: 0">
              <el-icon><List /></el-icon>
              应急库存记录
            </h3>
          </div>
          <el-table :data="emergencyReserve" border size="small">
            <el-table-column prop="id" label="编号" width="90" />
            <el-table-column label="站点" width="110">
              <template #default="{ row }">{{ getStationById(row.stationId)?.name }}</template>
            </el-table-column>
            <el-table-column prop="reserveCount" label="数量" width="60" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'warning' : 'info'" size="small">
                  {{ row.status === 'active' ? '保留中' : '已释放' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'active'"
                  size="small"
                  type="danger"
                  link
                  @click="releaseReserve(row.id)"
                >
                  释放
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="addDialogVisible" title="发布天气预警" width="500px">
      <el-form :model="warningForm" label-width="100px">
        <el-form-item label="关联站点">
          <el-select v-model="warningForm.stationId" placeholder="请选择站点" style="width: 100%">
            <el-option v-for="s in stations" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警类型">
          <el-select v-model="warningForm.type" placeholder="请选择预警类型" style="width: 100%">
            <el-option label="暴雨" value="rainstorm" />
            <el-option label="高温" value="high_temp" />
            <el-option label="大风" value="strong_wind" />
            <el-option label="雷电" value="thunder" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警级别">
          <el-radio-group v-model="warningForm.level">
            <el-radio value="blue">蓝色</el-radio>
            <el-radio value="yellow">黄色</el-radio>
            <el-radio value="orange">橙色</el-radio>
            <el-radio value="red">红色</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="预警内容">
          <el-input v-model="warningForm.msg" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="应急保留">
          <el-input-number v-model="warningForm.reserveCount" :min="0" :max="50" />
          <span style="color: #909399; font-size: 12px; margin-left: 10px">把（0表示不设置）</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="publishWarning">发布预警</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reserveDialogVisible" title="设置应急库存保留" width="450px">
      <el-descriptions :column="1" border style="margin-bottom: 15px">
        <el-descriptions-item label="站点">
          {{ getStationById(currentReserveWarning?.stationId)?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="预警">
          {{ currentReserveWarning?.msg }}
        </el-descriptions-item>
        <el-descriptions-item label="当前可用雨伞">
          <b style="color: #67c23a">{{ getAvailableCount(currentReserveWarning?.stationId) }} 把</b>
        </el-descriptions-item>
      </el-descriptions>
      <el-form label-width="100px">
        <el-form-item label="保留数量">
          <el-input-number v-model="reserveForm.count" :min="1" :max="getAvailableCount(currentReserveWarning?.stationId)" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="reserveForm.description" type="textarea" :rows="2" placeholder="应急库存用途说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reserveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReserve">确认保留</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUmbrellaStore } from '@/stores/umbrella'
import dayjs from 'dayjs'

const store = useUmbrellaStore()
const router = useRouter()

const stations = computed(() => store.stations)
const weatherWarnings = computed(() => store.weatherWarnings)
const emergencyReserve = computed(() => store.emergencyReserve)
const getStationById = (id) => store.getStationById(id)

const addDialogVisible = ref(false)
const warningForm = ref({
  stationId: '',
  type: 'rainstorm',
  level: 'yellow',
  msg: '',
  reserveCount: 0
})

const reserveDialogVisible = ref(false)
const currentReserveWarning = ref(null)
const reserveForm = ref({ count: 5, description: '' })

const getLevelType = (level) => {
  const map = { blue: 'info', yellow: 'warning', orange: 'warning', red: 'danger' }
  return map[level] || 'info'
}
const getLevelText = (level) => {
  const map = { blue: '蓝色预警', yellow: '黄色预警', orange: '橙色预警', red: '红色预警' }
  return map[level] || level
}
const getTypeText = (type) => {
  const map = { rainstorm: '暴雨', high_temp: '高温', strong_wind: '大风', thunder: '雷电' }
  return map[type] || type
}
const getAvailableCount = (stationId) => store.getAvailableUmbrellasByStation(stationId).length
const getEmergencyCount = (stationId) =>
  store.umbrellas.filter(u => u.stationId === stationId && u.status === 'emergency_reserve').length
const getEmergencyReserveByStation = (stationId) =>
  emergencyReserve.value.find(r => r.stationId === stationId && r.status === 'active')

const showAddDialog = () => {
  warningForm.value = { stationId: '', type: 'rainstorm', level: 'yellow', msg: '', reserveCount: 0 }
  addDialogVisible.value = true
}

const publishWarning = () => {
  if (!warningForm.value.stationId || !warningForm.value.msg) {
    ElMessage.error('请填写完整信息')
    return
  }
  const newWarning = {
    id: 'W' + Date.now(),
    ...warningForm.value,
    publishTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    status: 'active'
  }
  store.weatherWarnings.push(newWarning)

  const station = getStationById(warningForm.value.stationId)
  if (station) {
    station.weatherWarning = true
    station.warningMsg = warningForm.value.msg
  }

  if (warningForm.value.reserveCount > 0) {
    store.createEmergencyReserve(
      newWarning.id,
      warningForm.value.stationId,
      warningForm.value.reserveCount,
      store.currentUser.name,
      `${getLevelText(warningForm.value.level)}应急库存`
    )
  }

  store.employees.forEach(emp => {
    if (!emp.blacklist) {
      store.reminders.push({
        id: 'M' + Date.now() + Math.random(),
        employeeId: emp.id,
        type: 'weather',
        content: warningForm.value.msg,
        sendTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        read: false
      })
    }
  })

  ElMessage.success('预警发布成功' + (warningForm.value.reserveCount > 0 ? `，已保留${warningForm.value.reserveCount}把应急雨伞` : ''))
  addDialogVisible.value = false
}

const cancelWarning = (warning) => {
  warning.status = 'inactive'
  const station = getStationById(warning.stationId)
  if (station) {
    station.weatherWarning = false
    station.warningMsg = ''
  }
  const reserve = emergencyReserve.value.find(r => r.warningId === warning.id && r.status === 'active')
  if (reserve) store.releaseEmergencyReserve(reserve.id)
  ElMessage.success('预警已取消，应急库存已释放')
}

const showReserveDialog = (warning) => {
  currentReserveWarning.value = warning
  reserveForm.value = { count: Math.min(5, getAvailableCount(warning.stationId)), description: '应急库存保留' }
  reserveDialogVisible.value = true
}

const submitReserve = () => {
  const result = store.createEmergencyReserve(
    currentReserveWarning.value.id,
    currentReserveWarning.value.stationId,
    reserveForm.value.count,
    store.currentUser.name,
    reserveForm.value.description
  )
  if (result.success) {
    currentReserveWarning.value.reserveCount = reserveForm.value.count
    ElMessage.success(result.message)
    reserveDialogVisible.value = false
  } else {
    ElMessage.error(result.message)
  }
}

const releaseReserve = (reserveId) => {
  const result = store.releaseEmergencyReserve(reserveId)
  ElMessage.success(result.message)
}

const releaseStationReserve = (stationId) => {
  const reserve = getEmergencyReserveByStation(stationId)
  if (reserve) {
    store.releaseEmergencyReserve(reserve.id)
    ElMessage.success('应急库存已释放')
  }
}

const toggleStationOffline = (row) => {
  const result = store.setStationOffline(row.id, !row.offline)
  ElMessage.success(result.message)
}

const runDemo = () => {
  store.runDemoScenario('storm_reserve')
  ElMessage.success('暴雨应急库存保留场景已初始化：S003站点3把雨伞已标记为emergency_reserve')
}

const goToBorrowTest = () => {
  store.currentRole = 'employee'
  router.push('/borrow')
}
</script>

<style scoped lang="scss">
.warning-card {
  color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  &.warning-blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  &.warning-yellow { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
  &.warning-orange { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
  &.warning-red { background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%); }
  :deep(.el-descriptions) {
    --el-text-color-primary: #fff;
    --el-border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  :deep(.el-descriptions__label) { color: rgba(255, 255, 255, 0.8) !important; }
  :deep(.el-descriptions__body) { color: #fff; }
}
</style>
