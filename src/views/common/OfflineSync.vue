<template>
  <div class="page-container">
    <el-card shadow="hover" class="card-wrapper">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
        <h2 class="page-title" style="margin: 0">
          <el-icon><Connection /></el-icon>
          离线同步与回放
        </h2>
        <div style="display: flex; gap: 10px">
          <el-button type="warning" @click="simulateOfflineBorrow">
            <el-icon><VideoPlay /></el-icon>
            模拟离线借伞
          </el-button>
          <el-button type="info" @click="simulateOfflineReturn">
            <el-icon><VideoPlay /></el-icon>
            模拟离线还伞
          </el-button>
          <el-select v-model="selectedStation" placeholder="选择站点" clearable style="width: 200px">
            <el-option v-for="s in stations" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
          <el-button type="primary" @click="syncNow" :disabled="unsyncedCount === 0">
            <el-icon><Refresh /></el-icon>
            立即同步回放
          </el-button>
        </div>
      </div>

      <el-alert
        title="场景演示3：站点离线借还与时间回放"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        <template #default>
          站点离线时扫码借伞操作缓存到本地，不会丢单；恢复在线后按时间顺序回放同步。
          当前有 <b>{{ unsyncedCount }}</b> 条离线操作记录待同步。点击"模拟离线借伞/还伞"添加记录，再点"立即同步回放"查看时间顺序回放效果。
        </template>
      </el-alert>

      <el-steps :active="currentStep" finish-status="success" align-center style="margin-bottom: 25px">
        <el-step title="站点离线" description="标记站点为离线状态" />
        <el-step title="离线操作" description="扫码借/还伞缓存到本地" />
        <el-step title="恢复在线" description="站点网络恢复" />
        <el-step title="同步回放" description="按时间顺序回放离线记录" />
      </el-steps>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card shadow="hover" style="text-align: center">
            <el-statistic title="待同步记录" :value="unsyncedCount" value-style="{ color: '#f56c6c' }" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" style="text-align: center">
            <el-statistic title="已同步记录" :value="syncedCount" value-style="{ color: '#67c23a' }" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" style="text-align: center">
            <el-statistic title="离线站点" :value="offlineStations.length" value-style="{ color: '#e6a23c' }" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" style="text-align: center">
            <el-statistic title="回放次数" :value="playbackLogs.length" value-style="{ color: '#409eff' }" />
          </el-card>
        </el-col>
      </el-row>

      <h3 style="margin-bottom: 15px">
        <el-icon><OfficeBuilding /></el-icon>
        站点在线状态
      </h3>
      <el-table :data="stations" border style="margin-bottom: 20px">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="站点名称" width="180" />
        <el-table-column prop="location" label="位置" />
        <el-table-column label="在线状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.offline" type="danger" effect="dark">
              <el-icon><Link /></el-icon>
              离线
            </el-tag>
            <el-tag v-else type="success">
              <el-icon><Connection /></el-icon>
              在线
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="容量使用" width="160">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round(row.currentCount / row.capacity * 100)"
              :status="row.currentCount >= row.capacity ? 'exception' : ''"
            />
            <div style="text-align: center; font-size: 12px">{{ row.currentCount }} / {{ row.capacity }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button size="small" :type="row.offline ? 'success' : 'warning'" @click="toggleOffline(row)">
              {{ row.offline ? '恢复在线' : '标记离线' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="14">
        <el-card shadow="hover" class="card-wrapper">
          <h3 style="margin-bottom: 15px">
            <el-icon><List /></el-icon>
            离线记录（按时间升序）
          </h3>
          <el-table :data="sortedOfflineRecords" border>
            <el-table-column prop="id" label="记录编号" width="110" />
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 'borrow' ? 'primary' : 'success'">
                  {{ row.type === 'borrow' ? '借伞' : '还伞' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="员工" width="120">
              <template #default="{ row }">
                {{ getEmployeeById(row.employeeId)?.name || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="umbrellaId" label="雨伞编号" width="110" />
            <el-table-column label="站点" width="150">
              <template #default="{ row }">
                {{ getStationById(row.stationId)?.name }}
              </template>
            </el-table-column>
            <el-table-column prop="recordTime" label="操作时间" width="170" />
            <el-table-column label="同步状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.synced" type="success">已同步</el-tag>
                <el-tag v-else type="warning" effect="dark">待同步</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="同步时间" width="170">
              <template #default="{ row }">
                {{ row.syncTime || '-' }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="offlineRecords.length === 0" description="暂无离线记录，点击上方按钮模拟离线借还" />
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card shadow="hover" class="card-wrapper">
          <h3 style="margin-bottom: 15px">
            <el-icon><VideoPlay /></el-icon>
            同步回放日志
          </h3>
          <el-timeline v-if="lastPlayback" style="margin-top: 10px">
            <el-timeline-item
              v-for="(log, index) in lastPlayback.logs"
              :key="index"
              :timestamp="lastPlayback.time"
              placement="top"
              :type="index === 0 ? 'primary' : 'success'"
            >
              {{ log }}
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无回放记录，请先执行同步" :image-size="60" />

          <el-divider />

          <h4 style="margin-bottom: 10px">
            <el-icon><Clock /></el-icon>
            历史回放
          </h4>
          <el-table :data="playbackLogs" border size="small">
            <el-table-column prop="id" label="编号" width="120" />
            <el-table-column prop="time" label="回放时间" width="170" />
            <el-table-column label="记录数" width="80">
              <template #default="{ row }">
                <el-tag type="info">{{ row.count }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="playbackLogs.length === 0" description="暂无历史回放" :image-size="60" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUmbrellaStore } from '@/stores/umbrella'
import dayjs from 'dayjs'

const store = useUmbrellaStore()

const stations = computed(() => store.stations)
const offlineRecords = computed(() => store.offlineRecords)
const playbackLogs = computed(() => store.playbackLogs)
const getStationById = (id) => store.getStationById(id)
const getEmployeeById = (id) => store.getEmployeeById(id)

const selectedStation = ref('')

const unsyncedCount = computed(() => {
  if (selectedStation.value) {
    return store.offlineRecords.filter(r => r.stationId === selectedStation.value && !r.synced).length
  }
  return store.unsyncedOfflineRecords.length
})

const syncedCount = computed(() => {
  return store.offlineRecords.filter(r => r.synced).length
})

const offlineStations = computed(() => stations.value.filter(s => s.offline))

const currentStep = computed(() => {
  if (offlineStations.value.length === 0) return 0
  if (unsyncedCount.value === 0 && offlineStations.value.length > 0) return 1
  if (unsyncedCount.value > 0 && offlineStations.value.length > 0) return 2
  return 1
})

const sortedOfflineRecords = computed(() => {
  let list = [...offlineRecords.value]
  if (selectedStation.value) {
    list = list.filter(r => r.stationId === selectedStation.value)
  }
  return list.sort((a, b) => new Date(a.recordTime) - new Date(b.recordTime))
})

const lastPlayback = computed(() => {
  if (playbackLogs.value.length === 0) return null
  return playbackLogs.value[playbackLogs.value.length - 1]
})

const toggleOffline = (row) => {
  const result = store.setStationOffline(row.id, !row.offline)
  ElMessage.success(result.message)
}

const syncNow = () => {
  const result = store.syncOfflineRecords(selectedStation.value || null)
  if (result.success) {
    ElMessage.success(result.message)
  } else {
    ElMessage.error(result.message)
  }
}

const simulateOfflineBorrow = () => {
  const onlineStations = stations.value.filter(s => !s.offline)
  if (onlineStations.length === 0) {
    ElMessage.warning('没有在线站点可操作，请先将某个站点标记离线')
    return
  }
  const targetStation = onlineStations[0]
  const available = store.umbrellas.filter(u => u.stationId === targetStation.id && u.status === 'available')
  if (available.length === 0) {
    ElMessage.warning(`${targetStation.name}没有可用雨伞`)
    return
  }
  const umbrella = available[0]
  const employee = store.employees.find(e => !e.blacklist && e.depositPaid >= 50)
  if (!employee) {
    ElMessage.warning('没有可用员工')
    return
  }
  targetStation.offline = true
  const result = store.borrowUmbrella(umbrella.id, employee.id, targetStation.id, true)
  if (result.success) {
    ElMessage.success(`模拟成功：${employee.name}在离线站点${targetStation.name}借走${umbrella.id}，记录已缓存`)
  } else {
    ElMessage.error(result.message)
  }
}

const simulateOfflineReturn = () => {
  const borrowed = store.borrowRecords.filter(r => r.status === 'borrowed')
  if (borrowed.length === 0) {
    ElMessage.warning('没有待归还的借伞记录')
    return
  }
  const record = borrowed[0]
  const onlineStations = stations.value.filter(s => !s.offline && s.id !== record.borrowStation)
  const targetStation = onlineStations.length > 0 ? onlineStations[0] : stations.value[0]
  targetStation.offline = true
  const result = store.returnUmbrella(record.id, targetStation.id, true)
  if (result.success) {
    ElMessage.success(`模拟成功：在离线站点${targetStation.name}归还${record.umbrellaId}，记录已缓存`)
  } else {
    ElMessage.error(result.message)
  }
}
</script>
