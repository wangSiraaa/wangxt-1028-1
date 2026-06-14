<template>
  <div class="page-container">
    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><CircleCheck /></el-icon>
        维修验收
      </h2>

      <el-alert
        title="演示：R002维修记录待验收，雨伞U008损坏支架已修复"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-tabs v-model="activeTab">
        <el-tab-pane label="待验收" name="pending">
          <el-table :data="pendingAcceptRepairs" border>
            <el-table-column prop="id" label="维修单号" />
            <el-table-column prop="umbrellaId" label="雨伞编号" />
            <el-table-column label="雨伞信息">
              <template #default="{ row }">
                {{ getUmbrellaById(row.umbrellaId)?.brand }} - 
                {{ getUmbrellaById(row.umbrellaId)?.color }}
              </template>
            </el-table-column>
            <el-table-column prop="damageDesc" label="破损描述" />
            <el-table-column prop="repairer" label="维修员" />
            <el-table-column prop="repairCost" label="维修费用" />
            <el-table-column prop="repairDesc" label="维修说明" />
            <el-table-column prop="repairTime" label="维修完成时间" />
            <el-table-column label="状态">
              <template #default>
                <el-tag type="warning">待验收</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="showAcceptDialog(row, 'pass')">
                  <el-icon><Check /></el-icon>
                  通过验收
                </el-button>
                <el-button type="danger" size="small" @click="showAcceptDialog(row, 'reject')">
                  <el-icon><Close /></el-icon>
                  驳回
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="pendingAcceptRepairs.length === 0" description="暂无待验收记录" />
        </el-tab-pane>

        <el-tab-pane label="已验收" name="completed">
          <el-table :data="completedRepairs" border>
            <el-table-column prop="id" label="维修单号" />
            <el-table-column prop="umbrellaId" label="雨伞编号" />
            <el-table-column prop="damageDesc" label="破损描述" />
            <el-table-column prop="repairer" label="维修员" />
            <el-table-column prop="repairCost" label="维修费用" />
            <el-table-column prop="acceptTime" label="验收时间" />
            <el-table-column prop="acceptor" label="验收人" />
            <el-table-column label="验收结果">
              <template #default="{ row }">
                <el-tag :type="row.acceptResult === 'pass' ? 'success' : 'danger'">
                  {{ row.acceptResult === 'pass' ? '验收通过' : '验收驳回' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="acceptRemark" label="验收备注" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><TrendCharts /></el-icon>
        维修统计
      </h2>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card>
            <el-statistic title="待验收" :value="pendingAcceptRepairs.length" value-style="{ color: '#e6a23c' }" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <el-statistic title="本月已验收" :value="completedThisMonth" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <el-statistic title="本月维修费用" :value="repairCostThisMonth" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <el-statistic title="维修及时率" :value="repairTimelyRate" suffix="%" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="acceptDialogVisible" :title="acceptType === 'pass' ? '通过验收' : '驳回维修'" width="400px">
      <el-descriptions :column="1" border style="margin-bottom: 20px">
        <el-descriptions-item label="雨伞编号">
          {{ currentAccept?.umbrellaId }}
        </el-descriptions-item>
        <el-descriptions-item label="破损描述">
          {{ currentAccept?.damageDesc }}
        </el-descriptions-item>
        <el-descriptions-item label="维修说明">
          {{ currentAccept?.repairDesc }}
        </el-descriptions-item>
        <el-descriptions-item label="维修费用">
          ¥ {{ currentAccept?.repairCost }}
        </el-descriptions-item>
      </el-descriptions>
      <el-form :model="acceptForm" label-width="80px">
        <el-form-item label="验收备注">
          <el-input
            v-model="acceptForm.remark"
            type="textarea"
            :rows="2"
            :placeholder="acceptType === 'pass' ? '请输入验收意见（选填）' : '请输入驳回原因（必填）'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="acceptDialogVisible = false">取消</el-button>
        <el-button :type="acceptType === 'pass' ? 'primary' : 'danger'" @click="confirmAccept">
          {{ acceptType === 'pass' ? '确认通过' : '确认驳回' }}
        </el-button>
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

const getUmbrellaById = (id) => store.getUmbrellaById(id)
const pendingAcceptRepairs = computed(() => store.repairRecords.filter(r => r.status === 'pending_accept'))
const completedRepairs = computed(() => store.repairRecords.filter(r => r.status === 'completed' || r.status === 'rejected'))

const activeTab = ref('pending')
const acceptDialogVisible = ref(false)
const acceptType = ref('pass')
const currentAccept = ref(null)
const acceptForm = ref({ remark: '' })

const completedThisMonth = computed(() => 
  completedRepairs.value.filter(r => 
    r.acceptTime && dayjs(r.acceptTime).format('YYYY-MM') === dayjs().format('YYYY-MM')
  ).length
)
const repairCostThisMonth = computed(() => 
  completedRepairs.value
    .filter(r => r.acceptResult === 'pass' && r.acceptTime && dayjs(r.acceptTime).format('YYYY-MM') === dayjs().format('YYYY-MM'))
    .reduce((sum, r) => sum + r.repairCost, 0)
)
const repairTimelyRate = computed(() => {
  if (completedRepairs.value.length === 0) return 0
  const onTime = completedRepairs.value.filter(r => r.acceptResult === 'pass').length
  return Math.round((onTime / completedRepairs.value.length) * 100)
})

const showAcceptDialog = (row, type) => {
  currentAccept.value = row
  acceptType.value = type
  acceptForm.value.remark = ''
  acceptDialogVisible.value = true
}

const confirmAccept = () => {
  if (acceptType.value === 'reject' && !acceptForm.value.remark) {
    ElMessage.error('请输入驳回原因')
    return
  }
  
  const result = store.acceptRepair(
    currentAccept.value.id,
    acceptType.value,
    store.currentUser.id,
    acceptForm.value.remark
  )
  
  if (result.success) {
    ElMessage.success(acceptType.value === 'pass' ? '验收通过，雨伞已恢复可用' : '已驳回维修')
    acceptDialogVisible.value = false
  } else {
    ElMessage.error(result.message)
  }
}
</script>
