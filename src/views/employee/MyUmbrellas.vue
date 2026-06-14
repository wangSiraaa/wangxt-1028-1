<template>
  <div class="page-container">
    <div class="card-wrapper">
      <h2 class="page-title">
        <el-icon><User /></el-icon>
        我的雨伞
      </h2>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="正在借用" name="borrowed">
          <el-table :data="borrowedRecords">
            <el-table-column prop="id" label="记录编号" />
            <el-table-column prop="umbrellaId" label="雨伞编号" />
            <el-table-column label="雨伞信息">
              <template #default="{ row }">
                <span v-if="getUmbrellaById(row.umbrellaId)">
                  {{ getUmbrellaById(row.umbrellaId).brand }} - {{ getUmbrellaById(row.umbrellaId).color }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="借出站点">
              <template #default="{ row }">
                {{ getStationById(row.borrowStation)?.name }}
              </template>
            </el-table-column>
            <el-table-column prop="borrowTime" label="借出时间" />
            <el-table-column prop="expectReturnTime" label="预计归还">
              <template #default="{ row }">
                <el-tag :type="row.overdue ? 'danger' : 'info'">
                  {{ row.expectReturnTime }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="row.overdue ? 'danger' : 'warning'">
                  {{ row.overdue ? '已逾期' : '借用中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="goReturn(row)">去归还</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="borrowedRecords.length === 0" description="暂无正在借用的雨伞" />
        </el-tab-pane>

        <el-tab-pane label="历史记录" name="history">
          <el-table :data="historyRecords">
            <el-table-column prop="id" label="记录编号" />
            <el-table-column prop="umbrellaId" label="雨伞编号" />
            <el-table-column label="借出站点">
              <template #default="{ row }">
                {{ getStationById(row.borrowStation)?.name }}
              </template>
            </el-table-column>
            <el-table-column label="归还站点">
              <template #default="{ row }">
                {{ getStationById(row.returnStation)?.name }}
              </template>
            </el-table-column>
            <el-table-column prop="borrowTime" label="借出时间" />
            <el-table-column prop="returnTime" label="归还时间" />
            <el-table-column label="逾期">
              <template #default="{ row }">
                <el-tag v-if="row.overdue" type="danger">{{ row.overdueDays }}天</el-tag>
                <el-tag v-else type="success">否</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="逾期费">
              <template #default="{ row }">
                <span :style="{ color: row.overdueFee > 0 ? '#f56c6c' : '#67c23a' }">
                  {{ row.overdueFee > 0 ? row.overdueFee + '元' : '0元' }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="我的消息" name="messages">
          <el-table :data="myMessages">
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getMessageType(row.type)">
                  {{ getMessageTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" />
            <el-table-column prop="sendTime" label="发送时间" />
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="row.read ? 'info' : 'warning'">
                  {{ row.read ? '已读' : '未读' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUmbrellaStore } from '@/stores/umbrella'

const router = useRouter()
const store = useUmbrellaStore()

const currentUser = computed(() => store.currentUser)
const activeTab = ref('borrowed')

const borrowedRecords = computed(() => 
  store.borrowRecords.filter(r => r.employeeId === currentUser.value.id && r.status === 'borrowed')
)

const historyRecords = computed(() =>
  store.borrowRecords.filter(r => r.employeeId === currentUser.value.id && r.status === 'returned')
)

const myMessages = computed(() =>
  store.reminders.filter(r => r.employeeId === currentUser.value.id).reverse()
)

const getStationById = (id) => store.getStationById(id)
const getUmbrellaById = (id) => store.getUmbrellaById(id)

const getMessageType = (type) => {
  const map = { overdue: 'danger', weather: 'warning', return: 'success', overdue_fee: 'danger' }
  return map[type] || 'info'
}

const getMessageTypeText = (type) => {
  const map = { overdue: '逾期提醒', weather: '天气提醒', return: '归还成功', overdue_fee: '逾期费用' }
  return map[type] || '系统消息'
}

const goReturn = (record) => {
  router.push({ path: '/borrow' })
}
</script>
