<template>
  <div class="page-container">
    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><Location /></el-icon>
        满站推荐
      </h2>

      <el-alert
        title="推荐算法升级：综合可达区域、剩余空位、距离多维度打分"
        type="success"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        <template #default>
          推荐排序不再只看距离，而是综合打分：<b>员工可达区域(+100)</b> + <b>同区域(+50)</b> + <b>空位数量(0-30)</b> - <b>距离×0.1</b>，自动过滤不可达站点。
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
                <template #default>
                  <span style="color: #f56c6c; font-weight: 600">0</span>
                </template>
              </el-table-column>
              <el-table-column label="状态">
                <template #default>
                  <el-tag type="danger">已饱和</el-tag>
                </template>
              </el-table-column>
            </el-table>

            <el-divider />

            <h4 style="margin-bottom: 10px">
              <el-icon><User /></el-icon>
              推荐参数
            </h4>
            <el-form label-width="100px" size="small">
              <el-form-item label="当前员工">
                <el-select v-model="form.employeeId" style="width: 100%" @change="onEmployeeChange">
                  <el-option
                    v-for="e in employees"
                    :key="e.id"
                    :label="e.id + ' - ' + e.name"
                    :value="e.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="可达区域">
                <el-tag v-for="a in currentEmployeeAreas" :key="a" style="margin-right: 5px">{{ a }}</el-tag>
                <span v-if="currentEmployeeAreas.length === 0" style="color: #909399">无权限区域</span>
              </el-form-item>
            </el-form>
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
                该站点已没有空余位置，以下是为 <b>{{ getEmployeeById(form.employeeId)?.name }}</b> 推荐的可归还站点（综合可达区域、空位、距离）：
              </div>
              <el-row :gutter="15">
                <el-col :span="8" v-for="(item, idx) in recommendedStations" :key="item.id">
                  <el-card class="station-card" :body-style="{ padding: '15px' }" shadow="hover">
                    <template #header>
                      <div style="display: flex; justify-content: space-between; align-items: center">
                        <div>
                          <span style="font-weight: 600">{{ item.name }}</span>
                          <el-tag v-if="idx === 0" type="success" effect="dark" style="margin-left: 6px">最优</el-tag>
                        </div>
                        <el-tag type="success">{{ item.station.currentCount }} / {{ item.station.capacity }}</el-tag>
                      </div>
                    </template>
                    <p><el-icon><Location /></el-icon> {{ item.location }}</p>
                    <p><el-icon><Clock /></el-icon> 距离: <b>{{ item.distance }}米</b></p>
                    <p><el-icon><Umbrella /></el-icon> 空位: <b style="color: #67c23a">{{ item.available }} 把</b></p>
                    <p>
                      <el-icon><Lock /></el-icon> 可达性:
                      <el-tag v-if="item.reachable" type="success">可达</el-tag>
                      <el-tag v-else type="info" effect="dark">不可达</el-tag>
                    </p>
                    <p>
                      <el-icon><Medal /></el-icon> 综合得分: <b style="color: #409eff; font-size: 16px">{{ item.score.toFixed(1) }}</b>
                    </p>

                    <el-divider style="margin: 10px 0" />
                    <div style="font-size: 12px; color: #909399">
                      <div>打分详情:</div>
                      <div v-for="(v, k) in item.factors" :key="k" style="margin-top: 4px">
                        {{ factorLabels[k] }}: {{ v > 0 ? '+' : '' }}{{ v.toFixed(1) }}
                      </div>
                    </div>

                    <el-button type="primary" size="small" style="width: 100%; margin-top: 10px" @click="selectStation(item.station)">
                      选择此站点
                    </el-button>
                  </el-card>
                </el-col>
              </el-row>

              <el-empty v-if="recommendedStations.length === 0" description="没有符合条件的可归还站点" />
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
            <p><el-icon><Place /></el-icon> 区域: <el-tag size="small">{{ s.area }}</el-tag></p>
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
const employees = computed(() => store.employees)
const getStationById = (id) => store.getStationById(id)
const getEmployeeById = (id) => store.getEmployeeById(id)
const borrowableUmbrellas = computed(() =>
  store.umbrellas.filter(u => u.status === 'borrowed')
)

const form = ref({ fromStationId: 'S003', umbrellaId: '', employeeId: 'E001' })

const fullStations = computed(() => stations.value.filter(s => isFullStation(s.id)))

const currentEmployeeAreas = computed(() => {
  const emp = getEmployeeById(form.value.employeeId)
  return emp?.accessibleAreas || []
})

const factorLabels = {
  reachable: '可达区域加分',
  sameArea: '同区域加分',
  slots: '空位加分',
  distance: '距离扣分'
}

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
  if (!form.value.fromStationId || !form.value.employeeId) return []
  const results = store.getRecommendReturnStations(form.value.fromStationId, form.value.employeeId)
  return results.slice(0, 3)
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

const onEmployeeChange = () => {
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
