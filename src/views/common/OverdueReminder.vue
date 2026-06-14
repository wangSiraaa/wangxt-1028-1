<template>
  <div class="page-container">
    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><AlarmClock /></el-icon>
        逾期催还
      </h2>

      <el-alert
        title="演示：员工E004(王五)有1把逾期雨伞B004，逾期3天，逾期费15元"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-statistic title="逾期总数量" :value="overdueCount" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="涉及员工" :value="overdueEmployees.length" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="逾期总金额" :value="overdueFeeTotal" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="最长逾期天数" :value="maxOverdueDays" />
        </el-col>
      </el-row>

      <el-table :data="overdueRecords" border>
        <el-table-column prop="id" label="借还单号" />
        <el-table-column prop="umbrellaId" label="雨伞编号" />
        <el-table-column label="员工">
          <template #default="{ row }">
            {{ getEmployeeById(row.employeeId)?.name }}
            <el-tag size="small" style="margin-left: 8px">
              {{ getEmployeeById(row.employeeId)?.department }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="borrowStationId" label="借出站">
          <template #default="{ row }">
            {{ getStationById(row.borrowStationId)?.name }}
          </template>
        </el-table-column>
        <el-table-column prop="borrowTime" label="借出时间" />
        <el-table-column prop="shouldReturnTime" label="应还时间" />
        <el-table-column label="逾期天数">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 600">
              {{ getOverdueDays(row.shouldReturnTime) }} 天
            </span>
          </template>
        </el-table-column>
        <el-table-column label="逾期费用">
          <template #default="{ row }">
            <span style="color: #e6a23c; font-weight: 600">
              ¥ {{ getOverdueFee(row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag type="danger" effect="dark">逾期中</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="sendReminder(row)">
              <el-icon><Message /></el-icon>
              发送催还
            </el-button>
            <el-button type="danger" size="small" @click="addToBlacklist(row)">
              <el-icon><Warning /></el-icon>
              加入黑名单
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><Promotion /></el-icon>
        催还历史
      </h2>
      <el-table :data="reminders" border>
        <el-table-column prop="id" label="消息编号" />
        <el-table-column label="接收人">
          <template #default="{ row }">
            {{ getEmployeeById(row.employeeId)?.name }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="消息标题" />
        <el-table-column prop="content" label="消息内容" />
        <el-table-column prop="createTime" label="发送时间" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.isRead ? 'success' : 'warning'">
              {{ row.isRead ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="reminderDialogVisible" title="发送催还通知" width="400px">
      <el-form :model="reminderForm" label-width="80px">
        <el-form-item label="催还方式">
          <el-radio-group v-model="reminderForm.method">
            <el-radio value="message">站内消息</el-radio>
            <el-radio value="sms">短信</el-radio>
            <el-radio value="email">邮件</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="催还内容">
          <el-input
            v-model="reminderForm.content"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reminderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSend">确认发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { useUmbrellaStore } from '@/stores/umbrella'

const store = useUmbrellaStore()

const getEmployeeById = (id) => store.getEmployeeById(id)
const getStationById = (id) => store.getStationById(id)
const overdueRecords = computed(() => store.overdueRecords)
const reminders = computed(() => store.reminders)

const overdueCount = computed(() => overdueRecords.value.length)
const overdueEmployees = computed(() => {
  const ids = new Set(overdueRecords.value.map(r => r.employeeId))
  return Array.from(ids)
})
const overdueFeeTotal = computed(() => 
  overdueRecords.value.reduce((sum, r) => sum + getOverdueFee(r), 0)
)
const maxOverdueDays = computed(() => {
  if (overdueRecords.value.length === 0) return 0
  return Math.max(...overdueRecords.value.map(r => getOverdueDays(r.shouldReturnTime)))
})

const reminderDialogVisible = ref(false)
const currentRecord = ref(null)
const reminderForm = ref({ method: 'message', content: '' })

const getOverdueDays = (shouldReturnTime) => {
  return dayjs().diff(dayjs(shouldReturnTime), 'day')
}

const getOverdueFee = (record) => {
  const days = getOverdueDays(record.shouldReturnTime)
  return Math.max(0, days * 5)
}

const sendReminder = (row) => {
  currentRecord.value = row
  const emp = getEmployeeById(row.employeeId)
  const fee = getOverdueFee(row)
  reminderForm.value.content = 
    `${emp.name}您好，您的雨伞${row.umbrellaId}已逾期${getOverdueDays(row.shouldReturnTime)}天，` +
    `产生逾期费${fee}元，请尽快归还。`
  reminderDialogVisible.value = true
}

const confirmSend = () => {
  const emp = getEmployeeById(currentRecord.value.employeeId)
  store.addReminder({
    id: 'MSG' + Date.now(),
    employeeId: currentRecord.value.employeeId,
    type: 'overdue',
    title: '雨伞逾期催还通知',
    content: reminderForm.value.content,
    isRead: false,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  })
  ElMessage.success(`已向${emp.name}发送催还${reminderForm.value.method === 'sms' ? '短信' : reminderForm.value.method === 'email' ? '邮件' : '消息'}`)
  reminderDialogVisible.value = false
}

const addToBlacklist = (row) => {
  const emp = getEmployeeById(row.employeeId)
  ElMessageBox.confirm(
    `确定将${emp.name}加入黑名单吗？加入后将无法再借用雨伞。`,
    '确认操作',
    { type: 'warning' }
  ).then(() => {
    store.setBlacklist(row.employeeId, true)
    ElMessage.success(`已将${emp.name}加入黑名单`)
  }).catch(() => {})
}
</script>
