<template>
  <div class="page-container">
    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><DataAnalysis /></el-icon>
        批量盘点
      </h2>

      <el-alert
        title="演示：站点S003有1把差异(U009丢失)，查看盘点差异页面可看到详情"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-form :model="inventoryForm" label-width="100px" inline style="margin-bottom: 20px">
        <el-form-item label="盘点站点">
          <el-select v-model="inventoryForm.stationId" placeholder="请选择站点" style="width: 200px">
            <el-option
              v-for="s in stations"
              :key="s.id"
              :label="s.name"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="实盘数量">
          <el-input-number v-model="inventoryForm.actualCount" :min="0" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doInventory" :disabled="!inventoryForm.stationId">
            <el-icon><Check /></el-icon>
            执行盘点
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="inventoryForm.stationId" class="card-wrapper" style="background: #f5f7fa">
        <h4 style="margin-bottom: 15px">
          <el-icon><InfoFilled /></el-icon>
          系统库存 ({{ currentStation?.name }})
        </h4>
        <el-descriptions :column="3" border size="small" style="margin-bottom: 15px">
          <el-descriptions-item label="系统数量">
            <el-tag type="primary">{{ systemCount }} 把</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="可用雨伞">
            <el-tag type="success">{{ availableCount }} 把</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="破损雨伞">
            <el-tag type="danger">{{ damagedCount }} 把</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="维修中">
            <el-tag type="warning">{{ inRepairCount }} 把</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="借出中">
            <el-tag type="info">{{ borrowedCount }} 把</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="已丢失">
            <el-tag type="info">{{ lostCount }} 把</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-table :data="stationUmbrellas" border size="small">
          <el-table-column prop="id" label="雨伞编号" />
          <el-table-column prop="brand" label="品牌" />
          <el-table-column prop="color" label="颜色" />
          <el-table-column label="状态">
            <template #default="{ row }">
              <span :class="'status-tag status-' + row.status">
                {{ getStatusText(row.status) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><Document /></el-icon>
        盘点历史
      </h2>
      <el-table :data="inventoryRecords" border>
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
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button v-if="row.status === 'has_diff'" type="primary" size="small" @click="viewDiff(row)">
              查看差异
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="diffDialogVisible" title="盘点差异详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="盘点单号">
          {{ currentInventory?.id }}
        </el-descriptions-item>
        <el-descriptions-item label="站点">
          {{ getStationById(currentInventory?.stationId)?.name }}
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
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUmbrellaStore } from '@/stores/umbrella'

const store = useUmbrellaStore()

const stations = computed(() => store.stations)
const inventoryRecords = computed(() => store.inventoryRecords)
const getStationById = (id) => store.getStationById(id)

const inventoryForm = ref({ stationId: '', actualCount: 0 })
const diffDialogVisible = ref(false)
const currentInventory = ref(null)

const currentStation = computed(() => getStationById(inventoryForm.value.stationId))

const stationUmbrellas = computed(() => 
  store.umbrellas.filter(u => u.stationId === inventoryForm.value.stationId)
)

const systemCount = computed(() => 
  stationUmbrellas.value.filter(u => u.status !== 'borrowed' && u.status !== 'lost').length
)
const availableCount = computed(() => stationUmbrellas.value.filter(u => u.status === 'available').length)
const damagedCount = computed(() => stationUmbrellas.value.filter(u => u.status === 'damaged').length)
const inRepairCount = computed(() => stationUmbrellas.value.filter(u => u.status === 'in_repair').length)
const borrowedCount = computed(() => stationUmbrellas.value.filter(u => u.status === 'borrowed').length)
const lostCount = computed(() => stationUmbrellas.value.filter(u => u.status === 'lost').length)

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

const doInventory = () => {
  const diffUmbrellas = []
  if (inventoryForm.value.actualCount < systemCount.value) {
    diffUmbrellas.push('U' + Date.now())
  }
  
  const result = store.doInventory(
    inventoryForm.value.stationId,
    store.currentUser.id,
    inventoryForm.value.actualCount,
    diffUmbrellas
  )
  
  if (result.success) {
    if (result.inventory.status === 'has_diff') {
      ElMessage.warning(`盘点完成，发现差异 ${result.inventory.diffCount} 把`)
    } else {
      ElMessage.success('盘点完成，账实相符')
    }
    inventoryForm.value.actualCount = 0
  }
}

const viewDiff = (row) => {
  currentInventory.value = row
  diffDialogVisible.value = true
}
</script>
