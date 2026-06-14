<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="card-wrapper">
          <h2 class="page-title">
            <el-icon><Edit /></el-icon>
            破损登记
          </h2>

          <el-alert
            title="演示：登记破损后雨伞状态变为破损，无法再借出"
            type="warning"
            :closable="false"
            style="margin-bottom: 20px"
          />

          <el-form :model="damageForm" label-width="100px">
            <el-form-item label="选择站点">
              <el-select v-model="damageForm.stationId" placeholder="请选择站点" style="width: 100%" @change="onStationChange">
                <el-option
                  v-for="s in stations"
                  :key="s.id"
                  :label="s.name"
                  :value="s.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="选择雨伞" v-if="damageForm.stationId">
              <el-select v-model="damageForm.umbrellaId" placeholder="请选择雨伞" style="width: 100%">
                <el-option
                  v-for="u in stationUmbrellas"
                  :key="u.id"
                  :label="u.id + ' - ' + u.brand + '(' + u.color + ')'"
                  :value="u.id"
                  :disabled="u.status === 'damaged' || u.status === 'in_repair' || u.status === 'lost'"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="破损描述">
              <el-input
                v-model="damageForm.damageDesc"
                type="textarea"
                :rows="3"
                placeholder="请描述破损情况"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitDamage" :disabled="!damageForm.umbrellaId || !damageForm.damageDesc">
                <el-icon><Check /></el-icon>
                提交登记
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="card-wrapper">
          <h2 class="page-title">
            <el-icon><Delete /></el-icon>
            丢失赔偿
          </h2>

          <el-alert
            title="演示：雨伞U009已丢失，员工E002(李四)赔偿80元"
            type="error"
            :closable="false"
            style="margin-bottom: 20px"
          >
            <template #default>
              在费用管理页面可查看赔偿记录
            </template>
          </el-alert>

          <el-form :model="lostForm" label-width="100px">
            <el-form-item label="雨伞编号">
              <el-select v-model="lostForm.umbrellaId" placeholder="请选择雨伞" style="width: 100%" filterable>
                <el-option
                  v-for="u in borrowableUmbrellas"
                  :key="u.id"
                  :label="u.id + ' - ' + u.brand + '(' + u.color + ')'"
                  :value="u.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="赔偿员工">
              <el-select v-model="lostForm.employeeId" placeholder="请选择员工" style="width: 100%" filterable>
                <el-option
                  v-for="e in employees"
                  :key="e.id"
                  :label="e.id + ' - ' + e.name + '(' + e.department + ')'"
                  :value="e.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="赔偿金额">
              <el-input-number v-model="lostForm.compensateAmount" :min="0" :step="10" />
              <span style="color: #909399; font-size: 12px; margin-left: 10px">
                雨伞原价: {{ selectedUmbrellaPrice }}元
              </span>
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="submitLost" :disabled="!lostForm.umbrellaId || !lostForm.employeeId">
                <el-icon><Money /></el-icon>
                登记丢失
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="card-wrapper">
          <h2 class="page-title">
            <el-icon><Tools /></el-icon>
            维修记录
          </h2>
          <el-tabs v-model="repairTab">
            <el-tab-pane label="待维修" name="pending">
              <el-table :data="pendingRepairs" border>
                <el-table-column prop="id" label="记录编号" />
                <el-table-column prop="umbrellaId" label="雨伞编号" />
                <el-table-column prop="damageDesc" label="破损描述" />
                <el-table-column prop="reporter" label="登记人" />
                <el-table-column prop="reportTime" label="登记时间" />
                <el-table-column label="操作">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="showRepairDialog(row)">
                      完成维修
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="pendingRepairs.length === 0" description="暂无待维修记录" />
            </el-tab-pane>
            <el-tab-pane label="待验收" name="accept">
              <el-table :data="acceptRepairs" border>
                <el-table-column prop="id" label="记录编号" />
                <el-table-column prop="umbrellaId" label="雨伞编号" />
                <el-table-column prop="damageDesc" label="破损描述" />
                <el-table-column prop="repairer" label="维修员" />
                <el-table-column prop="repairCost" label="维修费用" />
                <el-table-column prop="repairDesc" label="维修说明" />
                <el-table-column label="状态">
                  <template #default>
                    <el-tag type="warning">待验收</el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="acceptRepairs.length === 0" description="暂无待验收记录" />
            </el-tab-pane>
            <el-tab-pane label="已完成" name="completed">
              <el-table :data="completedRepairs" border>
                <el-table-column prop="id" label="记录编号" />
                <el-table-column prop="umbrellaId" label="雨伞编号" />
                <el-table-column prop="damageDesc" label="破损描述" />
                <el-table-column prop="repairer" label="维修员" />
                <el-table-column prop="repairCost" label="维修费用" />
                <el-table-column prop="repairTime" label="维修时间" />
                <el-table-column prop="acceptTime" label="验收时间" />
              </el-table>
              <el-empty v-if="completedRepairs.length === 0" description="暂无已完成记录" />
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="card-wrapper">
          <h2 class="page-title">
            <el-icon><Warning /></el-icon>
            破损雨伞列表
          </h2>
          <el-table :data="damagedUmbrellas" border>
            <el-table-column prop="id" label="雨伞编号" />
            <el-table-column prop="brand" label="品牌" />
            <el-table-column prop="color" label="颜色" />
            <el-table-column prop="damageDesc" label="破损描述" />
            <el-table-column prop="damageTime" label="破损时间" />
            <el-table-column prop="damageReporter" label="登记人" />
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'damaged' ? 'danger' : 'warning'">
                  {{ row.status === 'damaged' ? '待维修' : '维修中' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="repairDialogVisible" title="完成维修" width="400px">
      <el-form :model="repairForm" label-width="100px">
        <el-form-item label="雨伞编号">
          <el-tag>{{ currentRepair?.umbrellaId }}</el-tag>
        </el-form-item>
        <el-form-item label="维修员">
          <el-input v-model="repairForm.repairer" placeholder="请输入维修员" />
        </el-form-item>
        <el-form-item label="维修费用">
          <el-input-number v-model="repairForm.repairCost" :min="0" :step="5" />
        </el-form-item>
        <el-form-item label="维修说明">
          <el-input
            v-model="repairForm.repairDesc"
            type="textarea"
            :rows="2"
            placeholder="请输入维修说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="repairDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="completeRepair">完成维修</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUmbrellaStore } from '@/stores/umbrella'

const store = useUmbrellaStore()

const stations = computed(() => store.stations)
const employees = computed(() => store.employees)
const damagedUmbrellas = computed(() => [...store.damagedUmbrellas, ...store.inRepairUmbrellas])
const borrowableUmbrellas = computed(() => 
  store.umbrellas.filter(u => u.status === 'available' || u.status === 'borrowed')
)
const pendingRepairs = computed(() => store.repairRecords.filter(r => r.status === 'pending_repair'))
const acceptRepairs = computed(() => store.repairRecords.filter(r => r.status === 'pending_accept'))
const completedRepairs = computed(() => store.repairRecords.filter(r => r.status === 'completed'))

const repairTab = ref('pending')
const stationUmbrellas = ref([])
const currentRepair = ref(null)
const repairDialogVisible = ref(false)

const damageForm = ref({ stationId: '', umbrellaId: '', damageDesc: '' })
const lostForm = ref({ umbrellaId: '', employeeId: '', compensateAmount: 80 })
const repairForm = ref({ repairer: '', repairCost: 20, repairDesc: '' })

const selectedUmbrellaPrice = computed(() => {
  if (!lostForm.value.umbrellaId) return 0
  const u = store.getUmbrellaById(lostForm.value.umbrellaId)
  return u?.purchasePrice || 0
})

const onStationChange = (stationId) => {
  damageForm.value.umbrellaId = ''
  stationUmbrellas.value = store.umbrellas.filter(u => u.stationId === stationId)
}

const submitDamage = () => {
  const result = store.reportDamage(
    damageForm.value.umbrellaId,
    store.currentUser.id,
    damageForm.value.damageDesc
  )
  if (result.success) {
    ElMessage.success(result.message)
    damageForm.value = { stationId: '', umbrellaId: '', damageDesc: '' }
    stationUmbrellas.value = []
  } else {
    ElMessage.error(result.message)
  }
}

const submitLost = () => {
  const result = store.reportLost(
    lostForm.value.umbrellaId,
    lostForm.value.employeeId,
    lostForm.value.compensateAmount
  )
  if (result.success) {
    ElMessage.success(result.message)
    lostForm.value = { umbrellaId: '', employeeId: '', compensateAmount: 80 }
  } else {
    ElMessage.error(result.message)
  }
}

const showRepairDialog = (row) => {
  currentRepair.value = row
  repairForm.value = { repairer: '维修员W001', repairCost: 20, repairDesc: '' }
  repairDialogVisible.value = true
}

const completeRepair = () => {
  if (!repairForm.value.repairer || !repairForm.value.repairDesc) {
    ElMessage.error('请填写完整信息')
    return
  }
  const result = store.completeRepair(
    currentRepair.value.id,
    repairForm.value.repairer,
    repairForm.value.repairCost,
    repairForm.value.repairDesc
  )
  if (result.success) {
    ElMessage.success(result.message)
    repairDialogVisible.value = false
  } else {
    ElMessage.error(result.message)
  }
}
</script>
