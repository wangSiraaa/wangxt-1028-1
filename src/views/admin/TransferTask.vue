<template>
  <div class="page-container">
    <div class="card-wrapper">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
        <h2 class="page-title" style="margin: 0">
          <el-icon><Switch /></el-icon>
          调拨任务
        </h2>
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          创建调拨
        </el-button>
      </div>

      <el-alert
        title="调拨演示：完成调拨后站点容量会马上变化"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          选择待处理的调拨任务T002，执行调拨后可观察S003和S001的容量变化
        </template>
      </el-alert>

      <el-table :data="transferRecords" border>
        <el-table-column prop="id" label="任务编号" width="120" />
        <el-table-column label="源站点" width="150">
          <template #default="{ row }">
            {{ getStationById(row.fromStation)?.name }}
          </template>
        </el-table-column>
        <el-table-column label="目标站点" width="150">
          <template #default="{ row }">
            {{ getStationById(row.toStation)?.name }}
          </template>
        </el-table-column>
        <el-table-column prop="umbrellaCount" label="调拨数量" width="100" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="completeTime" label="完成时间" width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="primary"
              size="small"
              @click="executeTransfer(row)"
            >
              执行调拨
            </el-button>
            <el-button
              v-if="row.status === 'completed'"
              type="info"
              size="small"
              @click="viewDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="createDialogVisible" title="创建调拨任务" width="500px">
      <el-form :model="transferForm" label-width="100px">
        <el-form-item label="源站点">
          <el-select v-model="transferForm.fromStation" placeholder="请选择源站点" style="width: 100%">
            <el-option
              v-for="s in stations"
              :key="s.id"
              :label="s.name + ' (可用: ' + getAvailableUmbrellasByStation(s.id).length + ')'"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标站点">
          <el-select v-model="transferForm.toStation" placeholder="请选择目标站点" style="width: 100%">
            <el-option
              v-for="s in stations"
              :key="s.id"
              :label="s.name + ' (空位: ' + (s.capacity - s.currentCount) + ')'"
              :value="s.id"
              :disabled="s.id === transferForm.fromStation"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调拨数量">
          <el-input-number
            v-model="transferForm.umbrellaCount"
            :min="1"
            :max="maxTransferCount"
          />
          <span style="color: #909399; font-size: 12px; margin-left: 10px">
            最多可调拨 {{ maxTransferCount }} 把
          </span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createTransfer">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="executeDialogVisible" title="执行调拨" width="600px">
      <el-alert
        title="请选择要调拨的雨伞"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-form label-width="100px">
        <el-form-item label="源站点">
          <span>{{ getStationById(currentTransfer?.fromStation)?.name }}</span>
        </el-form-item>
        <el-form-item label="目标站点">
          <span>{{ getStationById(currentTransfer?.toStation)?.name }}</span>
        </el-form-item>
        <el-form-item label="调拨数量">
          <span>{{ currentTransfer?.umbrellaCount }} 把</span>
        </el-form-item>
      </el-form>
      <el-table
        :data="availableUmbrellas"
        @selection-change="handleSelectionChange"
        border
        style="margin-bottom: 20px"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="雨伞编号" />
        <el-table-column prop="brand" label="品牌" />
        <el-table-column prop="color" label="颜色" />
      </el-table>
      <div style="text-align: right">
        已选择 {{ selectedUmbrellas.length }} / {{ currentTransfer?.umbrellaCount }} 把
      </div>
      <template #footer>
        <el-button @click="executeDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="selectedUmbrellas.length !== currentTransfer?.umbrellaCount"
          @click="confirmTransfer"
        >
          确认调拨
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="调拨详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="任务编号">{{ currentTransfer?.id }}</el-descriptions-item>
        <el-descriptions-item label="源站点">
          {{ getStationById(currentTransfer?.fromStation)?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="目标站点">
          {{ getStationById(currentTransfer?.toStation)?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="调拨雨伞">
          <el-tag v-for="u in currentTransfer?.umbrellas" :key="u" style="margin-right: 5px">
            {{ u }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentTransfer?.operator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentTransfer?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ currentTransfer?.completeTime }}</el-descriptions-item>
      </el-descriptions>
      <el-alert
        v-if="capacityChanged"
        title="调拨后站点容量已变化"
        type="success"
        :closable="false"
        style="margin-top: 20px"
      >
        <template #default>
          {{ getStationById(currentTransfer?.fromStation)?.name }}: -{{ currentTransfer?.umbrellaCount }}
          {{ getStationById(currentTransfer?.toStation)?.name }}: +{{ currentTransfer?.umbrellaCount }}
        </template>
      </el-alert>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUmbrellaStore } from '@/stores/umbrella'

const store = useUmbrellaStore()

const stations = computed(() => store.stations)
const transferRecords = computed(() => store.transferRecords)
const getStationById = (id) => store.getStationById(id)
const getAvailableUmbrellasByStation = (id) => store.getAvailableUmbrellasByStation(id)

const createDialogVisible = ref(false)
const executeDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const capacityChanged = ref(false)
const currentTransfer = ref(null)
const selectedUmbrellas = ref([])
const availableUmbrellas = ref([])

const transferForm = ref({
  fromStation: '',
  toStation: '',
  umbrellaCount: 1
})

const maxTransferCount = computed(() => {
  if (!transferForm.value.fromStation) return 0
  return getAvailableUmbrellasByStation(transferForm.value.fromStation).length
})

watch(() => transferForm.value.fromStation, () => {
  transferForm.value.toStation = ''
  transferForm.value.umbrellaCount = 1
})

const getStatusType = (status) => {
  const map = { pending: 'warning', in_progress: 'primary', completed: 'success' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { pending: '待处理', in_progress: '进行中', completed: '已完成' }
  return map[status] || status
}

const showCreateDialog = () => {
  transferForm.value = { fromStation: '', toStation: '', umbrellaCount: 1 }
  createDialogVisible.value = true
}

const createTransfer = () => {
  if (!transferForm.value.fromStation || !transferForm.value.toStation) {
    ElMessage.error('请选择源站点和目标站点')
    return
  }
  const result = store.createTransfer(
    transferForm.value.fromStation,
    transferForm.value.toStation,
    transferForm.value.umbrellaCount,
    store.currentUser.name
  )
  if (result.success) {
    ElMessage.success(result.message)
    createDialogVisible.value = false
  } else {
    ElMessage.error(result.message)
  }
}

const executeTransfer = (row) => {
  currentTransfer.value = row
  selectedUmbrellas.value = []
  availableUmbrellas.value = getAvailableUmbrellasByStation(row.fromStation)
  executeDialogVisible.value = true
}

const handleSelectionChange = (selection) => {
  selectedUmbrellas.value = selection.map(s => s.id)
}

const confirmTransfer = () => {
  const result = store.startTransfer(currentTransfer.value.id, selectedUmbrellas.value)
  if (result.success) {
    ElMessage.success(result.message)
    capacityChanged.value = true
    executeDialogVisible.value = false
    currentTransfer.value = store.transferRecords.find(t => t.id === currentTransfer.value.id)
    setTimeout(() => {
      detailDialogVisible.value = true
    }, 500)
  } else {
    ElMessage.error(result.message)
  }
}

const viewDetail = (row) => {
  currentTransfer.value = row
  capacityChanged.value = true
  detailDialogVisible.value = true
}
</script>
