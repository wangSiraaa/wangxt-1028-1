<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="10">
        <div class="card-wrapper">
          <h2 class="page-title">
            <el-icon><Edit /></el-icon>
            破损登记
          </h2>

          <el-alert
            title="场景演示4：破损维修全流程回库"
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 20px"
          >
            <template #default>
              U005(伞面破损) → 已维修待复检；U019(伞柄损坏) → 维修中；U003(伞骨断裂) → 待维修；U010(二维码模糊) → 待绑定二维码。可在下方推进各雨伞状态，演示从破损登记到回库的完整流程。
              <div style="margin-top: 8px">
                <el-button type="warning" size="small" @click="runFullDemo">
                  <el-icon><VideoPlay /></el-icon>
                  一键演示全流程
                </el-button>
              </div>
            </template>
          </el-alert>

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
              <el-select v-model="damageForm.umbrellaId" placeholder="请选择雨伞" style="width: 100%" filterable>
                <el-option
                  v-for="u in stationUmbrellas"
                  :key="u.id"
                  :label="u.id + ' - ' + u.brand + '(' + u.color + ')'"
                  :value="u.id"
                  :disabled="u.status === 'damaged' || u.status === 'in_repair' || u.status === 'lost' || u.status === 'recheck' || u.status === 'rebind_qr'"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="破损描述">
              <el-input
                v-model="damageForm.damageDesc"
                type="textarea"
                :rows="3"
                placeholder="请描述破损情况，如：伞骨断裂、伞面破损、二维码模糊等"
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

      <el-col :span="14">
        <div class="card-wrapper">
          <h2 class="page-title">
            <el-icon><Tools /></el-icon>
            维修状态流转
          </h2>

          <el-steps :active="6" finish-status="success" align-center style="margin-bottom: 25px">
            <el-step title="破损登记" description="保洁发现并登记" />
            <el-step title="开始维修" description="维修员接单" />
            <el-step title="维修完成" description="维修员处理" />
            <el-step title="行政复检" description="检查维修质量" />
            <el-step title="绑定二维码" description="如二维码损坏需重绑" />
            <el-step title="回库上架" description="雨伞回到站点可借" />
          </el-steps>

          <el-tabs v-model="repairTab">
            <el-tab-pane label="待维修" name="pending_repair">
              <el-table :data="pendingRepairs" border>
                <el-table-column prop="id" label="记录编号" width="100" />
                <el-table-column prop="umbrellaId" label="雨伞编号" width="100" />
                <el-table-column prop="damageDesc" label="破损描述" />
                <el-table-column prop="reporter" label="登记人" width="100" />
                <el-table-column prop="reportTime" label="登记时间" width="160" />
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="startRepair(row)">
                      开始维修
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="pendingRepairs.length === 0" description="暂无待维修记录" />
            </el-tab-pane>

            <el-tab-pane label="维修中" name="repairing">
              <el-table :data="repairingRecords" border>
                <el-table-column prop="id" label="记录编号" width="100" />
                <el-table-column prop="umbrellaId" label="雨伞编号" width="100" />
                <el-table-column prop="damageDesc" label="破损描述" />
                <el-table-column prop="repairer" label="维修员" width="100" />
                <el-table-column prop="startTime" label="开始时间" width="160" />
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="showCompleteDialog(row)">
                      完成维修
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="repairingRecords.length === 0" description="暂无维修中记录" />
            </el-tab-pane>

            <el-tab-pane label="待复检" name="pending_recheck">
              <el-table :data="pendingRecheck" border>
                <el-table-column prop="id" label="记录编号" width="100" />
                <el-table-column prop="umbrellaId" label="雨伞编号" width="100" />
                <el-table-column prop="damageDesc" label="破损描述" />
                <el-table-column prop="repairer" label="维修员" width="100" />
                <el-table-column prop="repairCost" label="费用" width="80" />
                <el-table-column prop="repairDesc" label="维修说明" />
                <el-table-column label="操作" width="160">
                  <template #default="{ row }">
                    <el-button type="success" size="small" @click="recheck(row, 'pass')">通过</el-button>
                    <el-button type="danger" size="small" @click="recheck(row, 'fail')">驳回</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="pendingRecheck.length === 0" description="暂无待复检记录" />
            </el-tab-pane>

            <el-tab-pane label="待绑二维码" name="pending_rebind">
              <el-table :data="pendingRebind" border>
                <el-table-column prop="id" label="记录编号" width="100" />
                <el-table-column prop="umbrellaId" label="雨伞编号" width="100" />
                <el-table-column prop="damageDesc" label="破损描述" />
                <el-table-column prop="rechecker" label="复检人" width="100" />
                <el-table-column label="操作" width="140">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="showRebindDialog(row)">
                      绑定二维码
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="pendingRebind.length === 0" description="暂无待绑定二维码记录" />
            </el-tab-pane>

            <el-tab-pane label="待回库" name="pending_restore">
              <el-table :data="pendingRestore" border>
                <el-table-column prop="id" label="记录编号" width="100" />
                <el-table-column prop="umbrellaId" label="雨伞编号" width="100" />
                <el-table-column prop="damageDesc" label="破损描述" />
                <el-table-column label="新二维码" width="150">
                  <template #default="{ row }">
                    <el-tag type="info">{{ row.newQrCode }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="140">
                  <template #default="{ row }">
                    <el-button type="success" size="small" @click="showRestoreDialog(row)">
                      回库上架
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="pendingRestore.length === 0" description="暂无待回库记录" />
            </el-tab-pane>

            <el-tab-pane label="已完成" name="completed">
              <el-table :data="completedRepairs" border>
                <el-table-column prop="id" label="记录编号" width="100" />
                <el-table-column prop="umbrellaId" label="雨伞编号" width="100" />
                <el-table-column prop="damageDesc" label="破损描述" />
                <el-table-column prop="repairer" label="维修员" width="100" />
                <el-table-column prop="repairCost" label="费用" width="80" />
                <el-table-column label="回库站点" width="150">
                  <template #default="{ row }">
                    {{ getStationById(row.restoreStation)?.name }}
                  </template>
                </el-table-column>
                <el-table-column prop="acceptTime" label="完成时间" width="160" />
              </el-table>
              <el-empty v-if="completedRepairs.length === 0" description="暂无已完成记录" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="completeDialogVisible" title="完成维修" width="450px">
      <el-form :model="repairForm" label-width="100px">
        <el-form-item label="雨伞编号">
          <el-tag>{{ currentRepair?.umbrellaId }}</el-tag>
        </el-form-item>
        <el-form-item label="维修员">
          <el-input v-model="repairForm.repairer" placeholder="请输入维修员编号或姓名" />
        </el-form-item>
        <el-form-item label="维修费用">
          <el-input-number v-model="repairForm.repairCost" :min="0" :step="5" />
          <span style="margin-left: 8px">元</span>
        </el-form-item>
        <el-form-item label="维修说明">
          <el-input
            v-model="repairForm.repairDesc"
            type="textarea"
            :rows="3"
            placeholder="请描述维修内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="completeRepair">完成维修</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rebindDialogVisible" title="重新绑定二维码" width="450px">
      <el-form :model="rebindForm" label-width="100px">
        <el-form-item label="雨伞编号">
          <el-tag>{{ currentRebind?.umbrellaId }}</el-tag>
        </el-form-item>
        <el-form-item label="旧二维码">
          <el-tag type="info">{{ currentRebind?.oldQrCode || getUmbrellaById(currentRebind?.umbrellaId)?.qrCode }}</el-tag>
        </el-form-item>
        <el-form-item label="新二维码">
          <el-input v-model="rebindForm.newQrCode" placeholder="请输入新二维码编号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rebindDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRebind">确认绑定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="restoreDialogVisible" title="回库上架" width="500px">
      <el-descriptions :column="1" border style="margin-bottom: 15px">
        <el-descriptions-item label="雨伞编号">{{ currentRestore?.umbrellaId }}</el-descriptions-item>
        <el-descriptions-item label="新二维码">{{ currentRestore?.newQrCode }}</el-descriptions-item>
        <el-descriptions-item label="维修说明">{{ currentRestore?.repairDesc }}</el-descriptions-item>
      </el-descriptions>
      <el-form label-width="100px">
        <el-form-item label="回库站点">
          <el-select v-model="restoreForm.stationId" placeholder="请选择回库站点" style="width: 100%">
            <el-option
              v-for="s in availableStations"
              :key="s.id"
              :label="s.name + ' (空位: ' + (s.capacity - s.currentCount) + ')'"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="restoreDialogVisible = false">取消</el-button>
        <el-button type="success" :disabled="!restoreForm.stationId" @click="submitRestore">
          确认回库
        </el-button>
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
const repairRecords = computed(() => store.repairRecords)
const getStationById = (id) => store.getStationById(id)
const getUmbrellaById = (id) => store.getUmbrellaById(id)

const pendingRepairs = computed(() => repairRecords.value.filter(r => r.status === 'pending_repair'))
const repairingRecords = computed(() => repairRecords.value.filter(r => r.status === 'repairing'))
const pendingRecheck = computed(() => repairRecords.value.filter(r => r.status === 'pending_recheck'))
const pendingRebind = computed(() => repairRecords.value.filter(r => r.status === 'pending_rebind'))
const pendingRestore = computed(() => repairRecords.value.filter(r => r.status === 'pending_restore'))
const completedRepairs = computed(() => repairRecords.value.filter(r => r.status === 'completed'))

const borrowableUmbrellas = computed(() =>
  store.umbrellas.filter(u => u.status === 'available' || u.status === 'borrowed')
)

const availableStations = computed(() =>
  stations.value.filter(s => s.currentCount < s.capacity)
)

const repairTab = ref('pending_repair')
const stationUmbrellas = ref([])
const damageForm = ref({ stationId: '', umbrellaId: '', damageDesc: '' })
const lostForm = ref({ umbrellaId: '', employeeId: '', compensateAmount: 80 })

const completeDialogVisible = ref(false)
const currentRepair = ref(null)
const repairForm = ref({ repairer: '', repairCost: 20, repairDesc: '' })

const rebindDialogVisible = ref(false)
const currentRebind = ref(null)
const rebindForm = ref({ newQrCode: '' })

const restoreDialogVisible = ref(false)
const currentRestore = ref(null)
const restoreForm = ref({ stationId: '' })

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

const startRepair = (row) => {
  const result = store.startRepair(row.id, '维修员W001')
  if (result.success) {
    ElMessage.success(result.message)
  } else {
    ElMessage.error(result.message)
  }
}

const showCompleteDialog = (row) => {
  currentRepair.value = row
  repairForm.value = { repairer: row.repairer || '维修员W001', repairCost: 20, repairDesc: '' }
  completeDialogVisible.value = true
}

const completeRepair = () => {
  if (!repairForm.value.repairer || !repairForm.value.repairDesc) {
    ElMessage.error('请填写完整信息')
    return
  }
  const result = store.completeRepair(
    currentRepair.value.id,
    repairForm.value.repairCost,
    repairForm.value.repairDesc
  )
  if (result.success) {
    ElMessage.success(result.message)
    completeDialogVisible.value = false
    repairTab.value = 'pending_recheck'
  } else {
    ElMessage.error(result.message)
  }
}

const recheck = (row, result) => {
  const res = store.recheckRepair(
    row.id,
    '行政张行政',
    result,
    result === 'pass' ? '复检通过' : '复检未通过，需重新维修'
  )
  if (res.success) {
    ElMessage.success(res.message)
    if (result === 'pass') {
      if (row.damageDesc && (row.damageDesc.includes('二维码') || row.damageDesc.includes('扫码'))) {
        repairTab.value = 'pending_rebind'
      } else {
        repairTab.value = 'completed'
      }
    } else {
      repairTab.value = 'repairing'
    }
  } else {
    ElMessage.error(res.message)
  }
}

const showRebindDialog = (row) => {
  currentRebind.value = row
  rebindForm.value = { newQrCode: 'UMB-' + row.umbrellaId + '-NEW' + Date.now() }
  rebindDialogVisible.value = true
}

const submitRebind = () => {
  if (!rebindForm.value.newQrCode) {
    ElMessage.error('请输入新二维码编号')
    return
  }
  const result = store.rebindQrCode(currentRebind.value.id, rebindForm.value.newQrCode)
  if (result.success) {
    ElMessage.success(result.message)
    rebindDialogVisible.value = false
    repairTab.value = 'pending_restore'
  } else {
    ElMessage.error(result.message)
  }
}

const showRestoreDialog = (row) => {
  currentRestore.value = row
  restoreForm.value = { stationId: availableStations.value[0]?.id || '' }
  restoreDialogVisible.value = true
}

const submitRestore = () => {
  const result = store.restoreToStation(currentRestore.value.id, restoreForm.value.stationId)
  if (result.success) {
    ElMessage.success(result.message)
    restoreDialogVisible.value = false
    repairTab.value = 'completed'
  } else {
    ElMessage.error(result.message)
  }
}

const runFullDemo = () => {
  store.runDemoScenario('damage_repair')
  const pendings = repairRecords.value.filter(r => r.status === 'pending_repair')
  if (pendings.length > 0) {
    const rec = pendings[0]
    store.startRepair(rec.id, '维修员W001')
    store.completeRepair(rec.id, 25, '已更换伞骨，修复完成')
    store.recheckRepair(rec.id, '行政张行政', 'pass', '复检通过，质量合格')
    if (rec.damageDesc && (rec.damageDesc.includes('二维码') || rec.damageDesc.includes('扫码'))) {
      store.rebindQrCode(rec.id, 'UMB-' + rec.umbrellaId + '-NEW' + Date.now())
    }
    const restoreRec = repairRecords.value.find(r => r.id === rec.id && r.status === 'pending_restore')
    if (restoreRec) {
      const station = availableStations.value[0]
      if (station) {
        store.restoreToStation(restoreRec.id, station.id)
      }
    }
    repairTab.value = 'completed'
    ElMessage.success(`全流程演示完成：${rec.umbrellaId} 破损登记→维修→复检→${rec.damageDesc?.includes('二维码') ? '重绑二维码→' : ''}回库上架`)
  } else {
    const available = store.umbrellas.filter(u => u.status === 'available')
    if (available.length === 0) {
      ElMessage.warning('没有可用雨伞可演示，请先重置数据')
      return
    }
    const u = available[0]
    store.reportDamage(u.id, store.currentUser.id, '伞骨断裂-演示用')
    const newRec = repairRecords.value.find(r => r.umbrellaId === u.id && r.status === 'pending_repair')
    if (newRec) {
      store.startRepair(newRec.id, '维修员W001')
      store.completeRepair(newRec.id, 25, '已更换伞骨')
      store.recheckRepair(newRec.id, '行政张行政', 'pass', '复检通过')
      const restoreRec = repairRecords.value.find(r => r.id === newRec.id && r.status === 'pending_restore')
      if (restoreRec) {
        const station = availableStations.value[0]
        if (station) store.restoreToStation(restoreRec.id, station.id)
      }
      repairTab.value = 'completed'
      ElMessage.success(`全流程演示完成：${u.id} 破损登记→维修→复检→回库上架`)
    }
  }
}
</script>
