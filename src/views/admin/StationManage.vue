<template>
  <div class="page-container">
    <div class="card-wrapper">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
        <h2 class="page-title" style="margin: 0">
          <el-icon><OfficeBuilding /></el-icon>
          站点维护
        </h2>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          新增站点
        </el-button>
      </div>

      <el-table :data="stations" border>
        <el-table-column prop="id" label="站点编号" width="100" />
        <el-table-column prop="name" label="站点名称" width="150" />
        <el-table-column prop="location" label="位置" />
        <el-table-column label="容量" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round(row.currentCount / row.capacity * 100)"
              :status="row.currentCount >= row.capacity ? 'exception' : ''"
            />
            <div style="text-align: center; font-size: 12px">{{ row.currentCount }} / {{ row.capacity }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="qrCode" label="二维码" width="150">
          <template #default="{ row }">
            <el-tag type="info">{{ row.qrCode }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deposit" label="押金(元)" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 600">¥{{ row.deposit }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="overdueFee" label="逾期费(元/天)" width="120">
          <template #default="{ row }">
            <span style="color: #e6a23c">¥{{ row.overdueFee }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="admin" label="管理员" width="100" />
        <el-table-column label="天气预警" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.weatherWarning" type="danger">
              <el-icon><Warning /></el-icon>
            </el-tag>
            <el-tag v-else type="info">无</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editStation(row)">编辑</el-button>
            <el-button type="success" size="small" @click="showQrCode(row)">二维码</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑站点' : '新增站点'" width="600px">
      <el-form :model="stationForm" label-width="120px">
        <el-form-item label="站点名称">
          <el-input v-model="stationForm.name" placeholder="请输入站点名称" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="stationForm.location" placeholder="请输入位置" />
        </el-form-item>
        <el-form-item label="总容量">
          <el-input-number v-model="stationForm.capacity" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="当前数量">
          <el-input-number v-model="stationForm.currentCount" :min="0" :max="stationForm.capacity" />
        </el-form-item>
        <el-form-item label="二维码">
          <el-input v-model="stationForm.qrCode" placeholder="请输入二维码编号" />
        </el-form-item>
        <el-form-item label="押金(元)">
          <el-input-number v-model="stationForm.deposit" :min="0" :step="10" />
        </el-form-item>
        <el-form-item label="逾期费(元/天)">
          <el-input-number v-model="stationForm.overdueFee" :min="0" :step="0.5" />
        </el-form-item>
        <el-form-item label="管理员">
          <el-input v-model="stationForm.admin" placeholder="请输入管理员" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStation">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="qrDialogVisible" title="站点二维码" width="300px">
      <div style="text-align: center">
        <div style="width: 200px; height: 200px; margin: 0 auto; background: #fff; border: 1px solid #e4e7ed; display: flex; align-items: center; justify-content: center;">
          <div style="text-align: center">
            <el-icon size="64" color="#409eff"><Picture /></el-icon>
            <div style="margin-top: 10px; font-size: 14px">{{ qrCodeContent }}</div>
          </div>
        </div>
        <div style="margin-top: 20px; color: #909399">扫码可访问该站点</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUmbrellaStore } from '@/stores/umbrella'

const store = useUmbrellaStore()

const stations = computed(() => store.stations)

const editDialogVisible = ref(false)
const isEdit = ref(false)
const stationForm = ref({
  id: '',
  name: '',
  location: '',
  capacity: 20,
  currentCount: 0,
  qrCode: '',
  deposit: 50,
  overdueFee: 1,
  admin: ''
})

const qrDialogVisible = ref(false)
const qrCodeContent = ref('')

const showAddDialog = () => {
  isEdit.value = false
  stationForm.value = {
    id: 'S' + Date.now(),
    name: '',
    location: '',
    capacity: 20,
    currentCount: 0,
    qrCode: 'UMB-' + Date.now(),
    deposit: 50,
    overdueFee: 1,
    admin: ''
  }
  editDialogVisible.value = true
}

const editStation = (row) => {
  isEdit.value = true
  stationForm.value = { ...row }
  editDialogVisible.value = true
}

const saveStation = () => {
  if (!stationForm.value.name) {
    ElMessage.error('请输入站点名称')
    return
  }
  if (isEdit.value) {
    const result = store.updateStation(stationForm.value.id, stationForm.value)
    if (result.success) {
      ElMessage.success(result.message)
      editDialogVisible.value = false
    }
  } else {
    store.stations.push({ ...stationForm.value, status: 'normal', createTime: new Date().toLocaleDateString(), weatherWarning: false })
    ElMessage.success('新增成功')
    editDialogVisible.value = false
  }
}

const showQrCode = (row) => {
  qrCodeContent.value = row.qrCode
  qrDialogVisible.value = true
}
</script>
