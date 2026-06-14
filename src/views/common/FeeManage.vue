<template>
  <div class="page-container">
    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><Money /></el-icon>
        押金费用
      </h2>

      <el-alert
        title="演示：E002(李四)雨伞U009丢失，赔偿80元，可查看费用记录"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card>
            <el-statistic title="押金总额" :value="depositTotal" prefix="¥" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <el-statistic title="逾期费总额" :value="overdueFeeTotal" prefix="¥" value-style="{ color: '#e6a23c' }" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <el-statistic title="赔偿费总额" :value="compensateTotal" prefix="¥" value-style="{ color: '#f56c6c' }" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <el-statistic title="维修费总额" :value="repairCostTotal" prefix="¥" value-style="{ color: '#409eff' }" />
          </el-card>
        </el-col>
      </el-row>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="押金管理" name="deposit">
          <el-table :data="employees" border>
            <el-table-column prop="id" label="员工编号" />
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="department" label="部门" />
            <el-table-column prop="phone" label="手机号" />
            <el-table-column label="押金状态">
              <template #default="{ row }">
                <el-tag :type="row.depositPaid >= 50 ? 'success' : 'danger'">
                  {{ row.depositPaid >= 50 ? '已缴纳' : '未缴纳' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="depositPaid" label="已缴押金">
              <template #default="{ row }">
                ¥ {{ row.depositPaid }}
              </template>
            </el-table-column>
            <el-table-column label="黑名单">
              <template #default="{ row }">
                <el-tag :type="row.blacklist ? 'danger' : 'info'">
                  {{ row.blacklist ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  size="small" 
                  :disabled="row.depositPaid >= 50"
                  @click="showPayDeposit(row)"
                >
                  缴纳押金
                </el-button>
                <el-button 
                  type="warning" 
                  size="small"
                  :disabled="row.depositPaid === 0"
                  @click="showRefundDeposit(row)"
                >
                  退还押金
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="费用记录" name="fee">
          <el-form :model="filterForm" inline style="margin-bottom: 20px">
            <el-form-item label="费用类型">
              <el-select v-model="filterForm.type" placeholder="全部" clearable style="width: 150px">
                <el-option label="押金" value="deposit" />
                <el-option label="逾期费" value="overdue" />
                <el-option label="赔偿费" value="compensate" />
                <el-option label="维修费" value="repair" />
              </el-select>
            </el-form-item>
            <el-form-item label="员工">
              <el-select v-model="filterForm.employeeId" placeholder="全部" clearable style="width: 150px" filterable>
                <el-option
                  v-for="e in employees"
                  :key="e.id"
                  :label="e.name"
                  :value="e.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="filterForm.page = 1">查询</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="filteredFeeRecords" border>
            <el-table-column prop="id" label="记录编号" />
            <el-table-column prop="type" label="费用类型">
              <template #default="{ row }">
                <el-tag :type="getFeeTypeTag(row.type)">
                  {{ getFeeTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="员工">
              <template #default="{ row }">
                {{ getEmployeeById(row.employeeId)?.name }}
              </template>
            </el-table-column>
            <el-table-column prop="umbrellaId" label="关联雨伞" />
            <el-table-column prop="amount" label="金额">
              <template #default="{ row }">
                <span :style="{ color: row.amount > 0 ? '#f56c6c' : '#67c23a', fontWeight: 600 }">
                  {{ row.amount > 0 ? '+' : '' }}¥{{ row.amount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
            <el-table-column prop="createTime" label="记录时间" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="depositDialogVisible" :title="dialogType === 'pay' ? '缴纳押金' : '退还押金'" width="400px">
      <el-descriptions :column="1" border style="margin-bottom: 20px">
        <el-descriptions-item label="员工">
          {{ currentEmployee?.name }} ({{ currentEmployee?.department }})
        </el-descriptions-item>
        <el-descriptions-item label="当前押金">
          ¥ {{ currentEmployee?.depositPaid }}
        </el-descriptions-item>
      </el-descriptions>
      <el-form :model="depositForm" label-width="80px">
        <el-form-item v-if="dialogType === 'pay'" label="缴纳金额">
          <el-input-number v-model="depositForm.amount" :min="0" :max="50" />
        </el-form-item>
        <el-form-item v-else label="退还金额">
          <el-input-number v-model="depositForm.amount" :min="0" :max="currentEmployee?.depositPaid || 0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="depositDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDeposit">{{ dialogType === 'pay' ? '确认缴纳' : '确认退还' }}</el-button>
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

const employees = computed(() => store.employees)
const feeRecords = computed(() => store.feeRecords)
const getEmployeeById = (id) => store.getEmployeeById(id)

const activeTab = ref('deposit')
const depositDialogVisible = ref(false)
const dialogType = ref('pay')
const currentEmployee = ref(null)
const depositForm = ref({ amount: 50 })

const filterForm = ref({ type: '', employeeId: '', page: 1 })

const filteredFeeRecords = computed(() => {
  let list = [...feeRecords.value]
  if (filterForm.value.type) {
    list = list.filter(r => r.type === filterForm.value.type)
  }
  if (filterForm.value.employeeId) {
    list = list.filter(r => r.employeeId === filterForm.value.employeeId)
  }
  return list.sort((a, b) => dayjs(b.createTime).valueOf() - dayjs(a.createTime).valueOf())
})

const depositTotal = computed(() => 
  employees.value.reduce((sum, e) => sum + e.depositPaid, 0)
)
const overdueFeeTotal = computed(() => 
  feeRecords.value.filter(r => r.type === 'overdue').reduce((sum, r) => sum + r.amount, 0)
)
const compensateTotal = computed(() => 
  feeRecords.value.filter(r => r.type === 'compensate').reduce((sum, r) => sum + r.amount, 0)
)
const repairCostTotal = computed(() => 
  feeRecords.value.filter(r => r.type === 'repair').reduce((sum, r) => sum + r.amount, 0)
)

const getFeeTypeText = (type) => {
  const map = {
    deposit: '押金',
    refund: '押金退还',
    overdue: '逾期费',
    compensate: '赔偿费',
    repair: '维修费'
  }
  return map[type] || type
}

const getFeeTypeTag = (type) => {
  const map = {
    deposit: 'primary',
    refund: 'success',
    overdue: 'warning',
    compensate: 'danger',
    repair: 'info'
  }
  return map[type] || ''
}

const showPayDeposit = (row) => {
  currentEmployee.value = row
  dialogType.value = 'pay'
  depositForm.value.amount = Math.min(50, 50 - row.depositPaid)
  depositDialogVisible.value = true
}

const showRefundDeposit = (row) => {
  currentEmployee.value = row
  dialogType.value = 'refund'
  depositForm.value.amount = row.depositPaid
  depositDialogVisible.value = true
}

const confirmDeposit = () => {
  if (dialogType.value === 'pay') {
    store.updateDeposit(currentEmployee.value.id, currentEmployee.value.depositPaid + depositForm.value.amount)
    store.addFeeRecord({
      id: 'F' + Date.now(),
      type: 'deposit',
      employeeId: currentEmployee.value.id,
      umbrellaId: '',
      amount: depositForm.value.amount,
      remark: '缴纳押金',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })
    ElMessage.success(`押金缴纳成功，当前押金: ¥${currentEmployee.value.depositPaid + depositForm.value.amount}`)
  } else {
    store.updateDeposit(currentEmployee.value.id, currentEmployee.value.depositPaid - depositForm.value.amount)
    store.addFeeRecord({
      id: 'F' + Date.now(),
      type: 'refund',
      employeeId: currentEmployee.value.id,
      umbrellaId: '',
      amount: -depositForm.value.amount,
      remark: '退还押金',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })
    ElMessage.success(`押金退还成功，当前押金: ¥${currentEmployee.value.depositPaid - depositForm.value.amount}`)
  }
  depositDialogVisible.value = false
}

const resetFilter = () => {
  filterForm.value = { type: '', employeeId: '', page: 1 }
}
</script>
