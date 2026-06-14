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
                  v-for="station in availableStations"
                  :key="station.id"
                  :label="station.name + ' (可用: ' + (getAvailableUmbrellasByStation(station.id).length) + ')'"
                  :value="station.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="选择雨伞" v-if="borrowForm.stationId">
              <el-radio-group v-model="borrowForm.umbrellaId">
                <el-radio
                  v-for="umbrella in stationUmbrellas"
                  :key="umbrella.id"
                  :value="umbrella.id"
                  :disabled="umbrella.status !== 'available'"
                  style="display: block; margin-bottom: 10px"
                >
                  <el-card shadow="hover" :class="{ 'disabled-card': umbrella.status !== 'available' }">
                    <div style="display: flex; align-items: center; gap: 15px">
                      <el-avatar :size="50" :style="{ backgroundColor: umbrella.color }">
                        <el-icon size="28"><Umbrella /></el-icon>
                      </el-avatar>
                      <div>
                        <div style="font-weight: 600">{{ umbrella.id }} - {{ umbrella.brand }}</div>
                        <div style="color: #909399; font-size: 12px">
                          颜色: {{ umbrella.color }} | 
                          <span :class="'status-tag status-' + umbrella.status">
                            {{ getStatusText(umbrella.status) }}
                          </span>
                        </div>
                        <div v-if="umbrella.status === 'damaged'" style="color: #f56c6c; font-size: 12px; margin-top: 4px">
                          破损原因: {{ umbrella.damageDesc }}
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
                :disabled="!borrowCheck.can || !borrowForm.umbrellaId"
                @click="handleBorrow"
                style="width: 100%"
              >
                <el-icon><Camera /></el-icon>
                扫码借伞
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
            title="破损雨伞不可借"
            type="error"
            :closable="false"
            style="margin-bottom: 10px"
          >
            <template #default>
              雨伞U003(红色)状态为"已破损"，已被禁用，无法借出
            </template>
          </el-alert>
          <el-alert
            title="逾期/黑名单禁止借"
            type="warning"
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
            <el-col :span="12" v-for="station in stations" :key="station.id">
              <el-card shadow="hover" style="margin-bottom: 10px">
                <div style="font-weight: 600; margin-bottom: 8px">{{ station.name }}</div>
                <div style="font-size: 12px; color: #909399; margin-bottom: 8px">{{ station.location }}</div>
                <el-progress
                  :percentage="Math.round(station.currentCount / station.capacity * 100)"
                  :status="station.currentCount >= station.capacity ? 'exception' : station.currentCount === 0 ? 'warning' : ''"
                />
                <div style="text-align: center; margin-top: 8px; font-size: 12px">
                  {{ station.currentCount }} / {{ station.capacity }}
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
              v-for="station in stations"
              :key="station.id"
              :label="station.name + ' (剩余空位: ' + (station.capacity - station.currentCount) + ')'"
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
const stations = computed(() => store.stations)
const availableStations = computed(() => store.stations.filter(s => s.currentCount > 0))
const activeWarning = computed(() => store.weatherWarnings.find(w => w.status === 'active'))
const borrowCheck = computed(() => store.checkCanBorrow(currentUser.value.id))
const myBorrowed = computed(() => store.getBorrowedByEmployee(currentUser.value.id))

const borrowForm = ref({ stationId: '', umbrellaId: '' })
const stationUmbrellas = ref([])
const returnDialogVisible = ref(false)
const returnForm = ref({ record: null, stationId: '' })
const recommendStations = ref([])

const getAvailableUmbrellasByStation = (stationId) => store.getAvailableUmbrellasByStation(stationId)
const getStationById = (id) => store.getStationById(id)

const getStatusText = (status) => {
  const map = {
    available: '可借',
    borrowed: '借出',
    damaged: '破损',
    in_repair: '维修中',
    lost: '丢失'
  }
  return map[status] || status
}

const onStationChange = (stationId) => {
  borrowForm.value.umbrellaId = ''
  const available = store.getAvailableUmbrellasByStation(stationId)
  const damaged = store.umbrellas.filter(u => u.stationId === stationId && u.status === 'damaged')
  stationUmbrellas.value = [...available, ...damaged]
}

const handleBorrow = () => {
  const result = store.borrowUmbrella(
    borrowForm.value.umbrellaId,
    currentUser.value.id,
    borrowForm.value.stationId
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
  const result = store.returnUmbrella(returnForm.value.record.id, returnForm.value.stationId)
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
</style>
