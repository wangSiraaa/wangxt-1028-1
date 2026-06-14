<template>
  <div class="page-container">
    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><DataAnalysis /></el-icon>
        盘点差异
      </h2>

      <el-alert
        title="演示：站点S003盘点差异1把，U009已登记丢失"
        type="error"
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card>
            <el-statistic title="盘点总次数" :value="inventoryRecords.length" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <el-statistic title="有差异次数" :value="diffCount" value-style="{ color: '#f56c6c' }" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <el-statistic title="差异总数量" :value="totalDiff" :prefix="totalDiff > 0 ? '+' : ''" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <el-statistic title="账实相符率" :value="matchRate" suffix="%" />
          </el-card>
        </el-col>
      </el-row>

      <el-form :model="filterForm" inline style="margin-bottom: 20px">
        <el-form-item label="盘点站点">
          <el-select v-model="filterForm.stationId" placeholder="全部" clearable style="width: 200px">
            <el-option
              v-for="s in stations"
              :key="s.id"
              :label="s.name"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="盘点状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="正常" value="normal" />
            <el-option label="有差异" value="has_diff" />
          </el-select>
        </el-form-item>
        <el-form-item label="盘点时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doFilter">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="filteredRecords" border>
        <el-table-column prop="id" label="盘点单号" />
        <el-table-column label="站点">
          <template #default="{ row }">
            {{ getStationById(row.stationId)?.name }}
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" />
        <el-table-column prop="inventoryTime" label="盘点时间" />
        <el-table-column prop="systemCount" label="系统数量" />
        <el-table-column prop="actualCount" label="实盘数量" />
        <el-table-column label="差异">
          <template #default="{ row }">
            <span :style="{ color: row.diffCount > 0 ? '#67c23a' : row.diffCount < 0 ? '#f56c6c' : '#909399', fontWeight: 600 }">
              {{ row.diffCount > 0 ? '+' : '' }}{{ row.diffCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'danger'">
              {{ row.status === 'normal' ? '正常' : '有差异' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="差异雨伞" v-if="hasDiffUmbrellas">
          <template #default="{ row }">
            <el-tag
              v-for="u in row.diffUmbrellas"
              :key="u"
              type="danger"
              style="margin-right: 5px"
            >
              {{ u }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="处理状态">
          <template #default="{ row }">
            <el-tag :type="row.processed ? 'success' : 'warning'">
              {{ row.processed ? '已处理' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'has_diff' && !row.processed" 
              type="primary" 
              size="small" 
              @click="handleDiff(row)"
            >
              处理差异
            </el-button>
            <el-button type="info" size="small" @click="viewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><TrendCharts /></el-icon>
        盘点趋势
      </h2>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>各站点盘点次数</template>
            <el-table :data="stationInventoryStats" border size="small">
              <el-table-column label="站点">
                <template #default="{ row }">
                  {{ getStationById(row.stationId)?.name }}
                </template>
              </el-table-column>
              <el-table-column prop="total" label="总次数" />
              <el-table-column prop="normal" label="正常次数" />
              <el-table-column prop="hasDiff" label="差异次数" />
              <el-table-column label="差异率">
                <template #default="{ row }">
                  {{ row.total > 0 ? Math.round((row.hasDiff / row.total) * 100) : 0 }}%
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>差异原因分布</template>
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="丢失">
                <el-tag type="danger">{{ diffReasonStats.lost }} 次</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="被盗">
                <el-tag type="danger">{{ diffReasonStats.stolen }} 次</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="记录错误">
                <el-tag type="warning">{{ diffReasonStats.recordError }} 次</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="调拨未更新">
                <el-tag type="info">{{ diffReasonStats.transfer }} 次</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="detailDialogVisible" title="盘点详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="盘点单号">
          {{ currentInventory?.id }}
        </el-descriptions-item>
        <el-descriptions-item label="站点">
          {{ getStationById(currentInventory?.stationId)?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="操作人">
          {{ currentInventory?.operator }}
        </el-descriptions-item>
        <el-descriptions-item label="盘点时间">
          {{ currentInventory?.inventoryTime }}
        </el-descriptions-item>
        <el-descriptions-item label="系统数量">
          {{ currentInventory?.systemCount }} 把
        </el-descriptions-item>
        <el-descriptions-item label="实盘数量">
          {{ currentInventory?.actualCount }} 把
        </el-descriptions-item>
        <el-descriptions-item label="差异数量">
          <span :style="{ color: currentInventory?.diffCount > 0 ? '#67c23a' : '#f56c6c', fontWeight: 600 }">
            {{ currentInventory?.diffCount > 0 ? '+' : '' }}{{ currentInventory?.diffCount }} 把
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="差异雨伞" v-if="currentInventory?.diffUmbrellas?.length > 0">
          <el-tag
            v-for="u in currentInventory?.diffUmbrellas"
            :key="u"
            type="danger"
            style="margin-right: 5px"
          >
            {{ u }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag :type="currentInventory?.processed ? 'success' : 'warning'">
            {{ currentInventory?.processed ? '已处理' : '待处理' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="handleDialogVisible" title="处理差异" width="400px">
      <el-form :model="handleForm" label-width="100px">
        <el-form-item label="处理方式">
          <el-radio-group v-model="handleForm.method">
            <el-radio value="lost">登记丢失</el-radio>
            <el-radio value="found">找回雨伞</el-radio>
            <el-radio value="ignore">忽略差异</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input
            v-model="handleForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入处理说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmHandle">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useUmbrellaStore } from '@/stores/umbrella'

const store = useUmbrellaStore()

const stations = computed(() => store.stations)
const inventoryRecords = computed(() => store.inventoryRecords)
const getStationById = (id) => store.getStationById(id)

const filterForm = ref({ stationId: '', status: '', dateRange: [] })
const filteredRecords = computed(() => inventoryRecords.value)

const diffCount = computed(() => inventoryRecords.value.filter(r => r.status === 'has_diff').length)
const totalDiff = computed(() => inventoryRecords.value.reduce((sum, r) => sum + r.diffCount, 0))
const matchRate = computed(() => {
  if (inventoryRecords.value.length === 0) return 100
  const normal = inventoryRecords.value.filter(r => r.status === 'normal').length
  return Math.round((normal / inventoryRecords.value.length) * 100)
})

const hasDiffUmbrellas = computed(() => 
  filteredRecords.value.some(r => r.diffUmbrellas && r.diffUmbrellas.length > 0)
)

const stationInventoryStats = computed(() => {
  const stats = {}
  stations.value.forEach(s => {
    stats[s.id] = { stationId: s.id, total: 0, normal: 0, hasDiff: 0 }
  })
  inventoryRecords.value.forEach(r => {
    if (!stats[r.stationId]) {
      stats[r.stationId] = { stationId: r.stationId, total: 0, normal: 0, hasDiff: 0 }
    }
    stats[r.stationId].total++
    if (r.status === 'normal') {
      stats[r.stationId].normal++
    } else {
      stats[r.stationId].hasDiff++
    }
  })
  return Object.values(stats)
})

const diffReasonStats = ref({
  lost: 2,
  stolen: 0,
  recordError: 0,
  transfer: 1
})

const detailDialogVisible = ref(false)
const handleDialogVisible = ref(false)
const currentInventory = ref(null)
const handleForm = ref({ method: 'lost', remark: '' })

const doFilter = () => {
  ElMessage.success('查询完成')
}

const resetFilter = () => {
  filterForm.value = { stationId: '', status: '', dateRange: [] }
}

const viewDetail = (row) => {
  currentInventory.value = row
  detailDialogVisible.value = true
}

const handleDiff = (row) => {
  currentInventory.value = row
  handleForm.value = { method: 'lost', remark: '' }
  handleDialogVisible.value = true
}

const confirmHandle = () => {
  if (!handleForm.value.remark) {
    ElMessage.error('请输入处理说明')
    return
  }
  
  const idx = inventoryRecords.value.findIndex(r => r.id === currentInventory.value.id)
  if (idx !== -1) {
    inventoryRecords.value[idx].processed = true
    inventoryRecords.value[idx].processMethod = handleForm.value.method
    inventoryRecords.value[idx].processRemark = handleForm.value.remark
    inventoryRecords.value[idx].processTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  
  if (handleForm.value.method === 'lost' && currentInventory.value.diffUmbrellas) {
    currentInventory.value.diffUmbrellas.forEach(u => {
      const umbrella = store.getUmbrellaById(u)
      if (umbrella) {
        umbrella.status = 'lost'
      }
    })
  }
  
  ElMessage.success('差异处理完成')
  handleDialogVisible.value = false
}
</script>
