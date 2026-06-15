<template>
  <div class="page-container">
    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><Location /></el-icon>
        满站推荐
      </h2>

      <el-alert
        title="演示：归还时选择已满站点S003（C栋宿舍楼站点 25/25），自动推荐有空位的站点"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          所有站点容量状态统一使用 currentCount / capacity 口径判断，与借还页面保持一致
        </template>
      </el-alert>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="card-wrapper" style="background: #f5f7fa">
            <h3 style="margin-bottom: 15px">
              <el-icon><WarningFilled /></el-icon>
              已满站点
            </h3>
            <el-table :data="fullStations" border size="small">
              <el-table-column prop="name" label="站点名称" />
              <el-table-column label="容量">
                <template #default="{ row }">
                  <span style="color: #f56c6c; font-weight: 600">
                    {{ row.currentCount }} / {{ row.capacity }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="空位">
                <template #default="{ row }">
                  <span style="color: #f56c6c; font-weight: 600">0</span>
                </template>
              </el-table-column>
              <el-table-column label="状态">
                <template #default>
                  <el-tag type="danger">已饱和</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>

        <el-col :span="16">
          <div class="card-wrapper" style="background: #f5f7fa">
            <h3 style="margin-bottom: 15px">
              <el-icon><Select /></el-icon>
              选择要归还的站点
            </h3>
            <el-form :model="form" label-width="100px" inline>
              <el-form-item label="当前站点">
                <el-select v-model="form.fromStationId" placeholder="请选择站点" style="width: 200px" @change="onFromStationChange">
                  <el-option
                    v-for="s in stations"
                    :key="s.id"
                    :label="s.name"
                    :value="s.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="雨伞编号">
                <el-select v-model="form.umbrellaId" placeholder="请选择雨伞" style="width: 200px" filterable>
                  <el-option
                    v-for="u in borrowableUmbrellas"
                    :key="u.id"
                    :label="u.id + ' - ' + u.brand + '(' + u.color + ')'"
                    :value="u.id"
                  />
                </el-select>
              </el-form-item>
            </el-form>

            <div v-if="form.fromStationId && isFullStation(form.fromStationId)" class="recommend-box">
              <div class="recommend-title">
                <el-icon color="#f56c6c"><Warning /></el-icon>
                <span style="color: #f56c6c; font-weight: 600">
                  {{ getStationById(form.fromStationId)?.name }} 已饱和
                </span>
              </div>
              <div class="recommend-desc">
                该站点已没有空余位置，请选择以下推荐站点归还
              </div>
              <el-row :gutter="15">
                <el-col :span="8" v-for="s in recommendedStations" :key="s.id">
                  <el-card class="station-card" :body-style="{ padding: '15px' }" shadow="hover">
                    <template #header>
                      <div style="display: flex; justify-content: space-between; align-items: center">
                        <span style="font-weight: 600">{{ s.name }}</span>
                        <el-tag type="success">{{ s.currentCount }} / {{ s.capacity }}</el-tag>
                      </div>
                    </template>
                    <p><el-icon><Location /></el-icon> {{ s.location }}</p>
                    <p><el-icon><Clock /></el-icon> 距离: <b>{{ getDistance(s.id, form.fromStationId) }}米</b></p>
                    <p><el-icon><Umbrella /></el-icon> 空位: <b style="color: #67c23a">{{ s.capacity - s.currentCount }} 把</b></p>
                    <el-button type="primary" size="small" style="width: 100%; margin-top: 10px" @click="selectStation(s)">
                      选择此站点
                    </el-button>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <div v-else-if="form.fromStationId" class="recommend-box" style="border-color: #67c23a">
              <div class="recommend-title">
                <el-icon color="#67c23a"><CircleCheck /></el-icon>
                <span style="color: #67c23a; font-weight: 600">
                  {{ getStationById(form.fromStationId)?.name }} 有空位
                </span>
              </div>
              <div class="recommend-desc">
                该站点还有空余位置，可以直接归还
              </div>
              <el-button type="success" @click="returnUmbrella">
                <el-icon><Check /></el-icon>
                在此站点归还
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><MapLocation /></el-icon>
        站点实时状态
      </h2>
      <el-row :gutter="20">
        <el-col :span="6" v-for="s in stations" :key="s.id">
          <el-card :body-style="{ padding: '15px' }">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span style="font-weight: 600">{{ s.name }}</span>
                <el-tag :type="isFullStation(s.id) ? 'danger' : isAlmostFull(s.id) ? 'warning' : 'success'">
                  {{ isFullStation(s.id) ? '已饱和' : isAlmostFull(s.id) ? '紧张' : '充足' }}
                </el-tag>
              </div>
            </template>
            <p><el-icon><Location /></el-icon> {{ s.location }}</p>
            <p><el-icon><Umbrella /></el-icon> 容量: {{ s.capacity }} 把</p>
            <p><el-icon><Checked /></el-icon> 已占用: {{ s.currentCount }} 把</p>
            <p style="color: #909399; margin-top: 10px">
              空位: <b :style="{ color: (s.capacity - s.currentCount) === 0 ? '#f56c6c' : '#67c23a' }">
                {{ s.capacity - s.currentCount }} 把
              </b>
            </p>
            <el-progress 
              :percentage="Math.round(s.currentCount / s.capacity * 100)" 
              :status="isFullStation(s.id) ? 'exception' : isAlmostFull(s.id) ? 'warning' : ''"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUmbrellaStore } from '@/stores/umbrella'

const store = useUmbrellaStore()

const stations = computed(() => store.stations)
const getStationById = (id) => store.getStationById(id)
const borrowableUmbrellas = computed(() => 
  store.umbrellas.filter(u => u.status === 'borrowed')
)

const form = ref({ fromStationId: 'S003', umbrellaId: '' })

const fullStations = computed(() => stations.value.filter(s => isFullStation(s.id)))

const isFullStation = (stationId) => {
  const s = getStationById(stationId)
  if (!s) return false
  return s.currentCount >= s.capacity
}

const isAlmostFull = (stationId) => {
  const s = getStationById(stationId)
  if (!s) return false
  return s.currentCount >= s.capacity * 0.8 && s.currentCount < s.capacity
}

const recommendedStations = computed(() => {
  if (!form.value.fromStationId) return []
  const currentId = form.value.fromStationId
  return stations.value
    .filter(s => s.id !== currentId && !isFullStation(s.id))
    .sort((a, b) => {
      const distA = getDistance(a.id, currentId)
      const distB = getDistance(b.id, currentId)
      return distA - distB
    })
    .slice(0, 3)
})

const distanceMap = {
  'S001-S002': 200, 'S001-S003': 350, 'S001-S004': 500, 'S001-S005': 400,
  'S002-S003': 150, 'S002-S004': 300, 'S002-S005': 250,
  'S003-S004': 180, 'S003-S005': 220,
  'S004-S005': 280
}

const getDistance = (s1, s2) => {
  if (s1 === s2) return 0
  const key = [s1, s2].sort().join('-')
  return distanceMap[key] || 999
}

const onFromStationChange = () => {
  form.value.umbrellaId = ''
}

const selectStation = (station) => {
  form.value.fromStationId = station.id
  ElMessage.success(`已选择${station.name}作为归还站点`)
}

const returnUmbrella = () => {
  if (!form.value.umbrellaId) {
    ElMessage.error('请选择要归还的雨伞')
    return
  }
  ElMessage.success(`雨伞${form.value.umbrellaId}已成功归还到${getStationById(form.value.fromStationId)?.name}`)
  form.value.umbrellaId = ''
}
</script>

<style lang="scss" scoped>
.recommend-box {
  border: 2px dashed #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  background: #fff;
}

.recommend-title {
  font-size: 16px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommend-desc {
  color: #909399;
  margin-bottom: 15px;
}

.station-card {
  margin-bottom: 15px;
}
</style>
