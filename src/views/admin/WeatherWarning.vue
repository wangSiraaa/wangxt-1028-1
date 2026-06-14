<template>
  <div class="page-container">
    <div class="card-wrapper">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
        <h2 class="page-title" style="margin: 0">
          <el-icon><Warning /></el-icon>
          天气预警
        </h2>
        <el-button type="danger" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          发布预警
        </el-button>
      </div>

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
            </el-descriptions>
            <div style="margin-top: 15px; text-align: right">
              <el-button v-if="warning.status === 'active'" type="info" size="small" @click="cancelWarning(warning)">
                取消预警
              </el-button>
              <el-tag v-else type="info">已取消</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-col>

      <el-empty v-if="weatherWarnings.length === 0" description="暂无天气预警" />
    </div>

    <div class="card-wrapper">
      <h3 style="margin-bottom: 15px">
        <el-icon><OfficeBuilding /></el-icon>
        站点预警状态
      </h3>
      <el-table :data="stations" border>
        <el-table-column prop="id" label="站点编号" width="100" />
        <el-table-column prop="name" label="站点名称" width="150" />
        <el-table-column prop="location" label="位置" />
        <el-table-column label="预警状态" width="150">
          <template #default="{ row }">
            <el-tag v-if="row.weatherWarning" type="danger">
              <el-icon><Warning /></el-icon>
              {{ row.warningMsg }}
            </el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="addDialogVisible" title="发布天气预警" width="500px">
      <el-form :model="warningForm" label-width="100px">
        <el-form-item label="关联站点">
          <el-select v-model="warningForm.stationId" placeholder="请选择站点" style="width: 100%">
            <el-option
              v-for="s in stations"
              :key="s.id"
              :label="s.name"
              :value="s.id"
            />
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
          <el-input
            v-model="warningForm.msg"
            type="textarea"
            :rows="3"
            placeholder="请输入预警内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="publishWarning">发布预警</el-button>
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
const weatherWarnings = computed(() => store.weatherWarnings)
const getStationById = (id) => store.getStationById(id)

const addDialogVisible = ref(false)
const warningForm = ref({
  stationId: '',
  type: 'rainstorm',
  level: 'yellow',
  msg: ''
})

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

const showAddDialog = () => {
  warningForm.value = {
    stationId: '',
    type: 'rainstorm',
    level: 'yellow',
    msg: ''
  }
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

  ElMessage.success('预警发布成功，已推送消息给所有员工')
  addDialogVisible.value = false
}

const cancelWarning = (warning) => {
  warning.status = 'inactive'
  const station = getStationById(warning.stationId)
  if (station) {
    station.weatherWarning = false
    station.warningMsg = ''
  }
  ElMessage.success('预警已取消')
}
</script>

<style scoped lang="scss">
.warning-card {
  color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;

  &.warning-blue {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.warning-yellow {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &.warning-orange {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }

  &.warning-red {
    background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%);
  }

  :deep(.el-descriptions) {
    --el-text-color-primary: #fff;
    --el-border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  :deep(.el-descriptions__label) {
    color: rgba(255, 255, 255, 0.8) !important;
  }

  :deep(.el-descriptions__body) {
    color: #fff;
  }
}
</style>
