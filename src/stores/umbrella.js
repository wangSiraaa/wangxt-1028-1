import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export const useUmbrellaStore = defineStore('umbrella', () => {
  const currentUser = ref({ id: 'E001', name: '张三', department: '研发部', phone: '13800138001', role: 'employee' })

  const stations = ref([
    { id: 'S001', name: 'A栋办公楼站点', location: 'A栋1楼大厅', capacity: 20, currentCount: 15, qrCode: 'UMB-S001-001', deposit: 50, overdueFee: 1, admin: '张行政', status: 'normal', createTime: '2024-01-01', weatherWarning: false, offline: false, area: 'A区', reachableBy: ['E001', 'E002', 'E003', 'E004', 'E005', 'E006'] },
    { id: 'S002', name: 'B栋研发楼站点', location: 'B栋1楼入口', capacity: 15, currentCount: 0, qrCode: 'UMB-S002-001', deposit: 50, overdueFee: 1, admin: '李行政', status: 'normal', createTime: '2024-01-02', weatherWarning: false, offline: false, area: 'B区', reachableBy: ['E001', 'E002', 'E005', 'E006'] },
    { id: 'S003', name: 'C栋宿舍楼站点', location: 'C栋1楼服务台', capacity: 25, currentCount: 25, qrCode: 'UMB-S003-001', deposit: 50, overdueFee: 1, admin: '王行政', status: 'normal', createTime: '2024-01-03', weatherWarning: true, warningMsg: '暴雨预警，请注意携带雨伞', offline: false, area: 'C区', reachableBy: ['E001', 'E003', 'E004'] },
    { id: 'S004', name: '园区大门站点', location: '园区正门保安亭旁', capacity: 30, currentCount: 10, qrCode: 'UMB-S004-001', deposit: 50, overdueFee: 1, admin: '赵行政', status: 'normal', createTime: '2024-01-04', weatherWarning: false, offline: false, area: '大门区', reachableBy: ['E001', 'E002', 'E003', 'E004', 'E005', 'E006'] },
    { id: 'S005', name: '餐厅门口站点', location: '员工餐厅正门', capacity: 20, currentCount: 18, qrCode: 'UMB-S005-001', deposit: 50, overdueFee: 1, admin: '张行政', status: 'normal', createTime: '2024-01-05', weatherWarning: false, offline: false, area: '餐饮区', reachableBy: ['E001', 'E002', 'E003', 'E004', 'E005', 'E006'] }
  ])

  const emergencyReserve = ref([
    { id: 'ER001', stationId: 'S003', warningId: 'W001', reserveCount: 10, operator: '张行政', createTime: '2024-06-13 08:30:00', status: 'active', description: '暴雨黄色预警应急库存保留' }
  ])

  const activityLocks = ref([
    { id: 'AL001', activityName: '2024年中总结大会', stationId: 'S001', umbrellaCount: 5, operator: '张行政', createTime: '2024-06-12 14:00:00', expireTime: '2024-06-20 18:00:00', status: 'active', lockedUmbrellas: ['U001', 'U002', 'U004', 'U015'], participants: [] },
    { id: 'AL002', activityName: '新员工入职培训', stationId: 'S004', umbrellaCount: 3, operator: '李行政', createTime: '2024-06-13 09:00:00', expireTime: '2024-06-14 18:00:00', status: 'active', lockedUmbrellas: [], participants: [] }
  ])

  const umbrellas = ref([
    { id: 'U001', stationId: 'S001', status: 'activity_locked', lockId: 'AL001', qrCode: 'UMB-U001', brand: '天堂伞', color: '黑色', purchaseDate: '2024-01-01', purchasePrice: 80 },
    { id: 'U002', stationId: 'S001', status: 'activity_locked', lockId: 'AL001', qrCode: 'UMB-U002', brand: '天堂伞', color: '蓝色', purchaseDate: '2024-01-01', purchasePrice: 80 },
    { id: 'U003', stationId: 'S001', status: 'damaged', qrCode: 'UMB-U003', brand: '天堂伞', color: '红色', purchaseDate: '2024-01-01', purchasePrice: 80, damageDesc: '伞骨断裂', damageTime: '2024-06-10 10:00:00', damageReporter: '保洁B002' },
    { id: 'U004', stationId: 'S001', status: 'activity_locked', lockId: 'AL001', qrCode: 'UMB-U004', brand: '天堂伞', color: '绿色', purchaseDate: '2024-01-02', purchasePrice: 80 },
    { id: 'U005', stationId: 'S001', status: 'recheck', qrCode: 'UMB-U005', brand: '天堂伞', color: '黑色', purchaseDate: '2024-01-02', purchasePrice: 80, damageDesc: '伞面破损', damageTime: '2024-06-08 14:00:00', repairTime: '2024-06-12 16:00:00', repairer: '维修员W001', repairCost: 20, repairDesc: '更换伞面' },
    { id: 'U006', stationId: 'S003', status: 'emergency_reserve', reserveId: 'ER001', qrCode: 'UMB-U006', brand: '红叶伞', color: '紫色', purchaseDate: '2024-01-03', purchasePrice: 75 },
    { id: 'U007', stationId: 'S003', status: 'emergency_reserve', reserveId: 'ER001', qrCode: 'UMB-U007', brand: '红叶伞', color: '黑色', purchaseDate: '2024-01-03', purchasePrice: 75 },
    { id: 'U008', stationId: 'S004', status: 'borrowed', qrCode: 'UMB-U008', brand: '红叶伞', color: '蓝色', purchaseDate: '2024-01-04', purchasePrice: 75 },
    { id: 'U009', stationId: 'S004', status: 'lost', qrCode: 'UMB-U009', brand: '红叶伞', color: '灰色', purchaseDate: '2024-01-04', purchasePrice: 75, lostTime: '2024-06-05', compensator: 'E002', compensateAmount: 80, compensateTime: '2024-06-06' },
    { id: 'U010', stationId: 'S005', status: 'rebind_qr', oldQrCode: 'UMB-U010-OLD', qrCode: 'UMB-U010-NEW', brand: '天堂伞', color: '黑色', purchaseDate: '2024-01-05', purchasePrice: 80 },
    { id: 'U011', stationId: 'S004', status: 'borrowed', qrCode: 'UMB-U011', brand: '红叶伞', color: '红色', purchaseDate: '2024-01-04', purchasePrice: 75 },
    { id: 'U012', stationId: 'S005', status: 'available', qrCode: 'UMB-U012', brand: '天堂伞', color: '蓝色', purchaseDate: '2024-01-05', purchasePrice: 80 },
    { id: 'U013', stationId: 'S003', status: 'emergency_reserve', reserveId: 'ER001', qrCode: 'UMB-U013', brand: '红叶伞', color: '黑色', purchaseDate: '2024-01-03', purchasePrice: 75 },
    { id: 'U014', stationId: 'S005', status: 'available', qrCode: 'UMB-U014', brand: '天堂伞', color: '紫色', purchaseDate: '2024-01-05', purchasePrice: 80 },
    { id: 'U015', stationId: 'S001', status: 'activity_locked', lockId: 'AL001', qrCode: 'UMB-U015', brand: '天堂伞', color: '黑色', purchaseDate: '2024-01-05', purchasePrice: 80 },
    { id: 'U016', stationId: 'S003', status: 'available', qrCode: 'UMB-U016', brand: '红叶伞', color: '蓝色', purchaseDate: '2024-01-06', purchasePrice: 75 },
    { id: 'U017', stationId: 'S003', status: 'available', qrCode: 'UMB-U017', brand: '红叶伞', color: '红色', purchaseDate: '2024-01-06', purchasePrice: 75 },
    { id: 'U018', stationId: 'S001', status: 'available', qrCode: 'UMB-U018', brand: '天堂伞', color: '白色', purchaseDate: '2024-01-07', purchasePrice: 85 },
    { id: 'U019', stationId: 'S001', status: 'in_repair', qrCode: 'UMB-U019', brand: '天堂伞', color: '黄色', purchaseDate: '2024-01-07', purchasePrice: 80, damageDesc: '伞柄损坏', damageTime: '2024-06-12 09:00:00' },
    { id: 'U020', stationId: 'S004', status: 'available', qrCode: 'UMB-U020', brand: '红叶伞', color: '绿色', purchaseDate: '2024-01-08', purchasePrice: 75 }
  ])

  const employees = ref([
    { id: 'E001', name: '张三', department: '研发部', phone: '13800138001', status: 'normal', blacklist: false, depositPaid: 50, workArea: 'A区' },
    { id: 'E002', name: '李四', department: '市场部', phone: '13800138002', status: 'normal', blacklist: false, depositPaid: 50, workArea: '大门区' },
    { id: 'E003', name: '王五', department: '人事部', phone: '13800138003', status: 'normal', blacklist: true, depositPaid: 0, blacklistReason: '恶意损坏雨伞3次', workArea: 'C区' },
    { id: 'E004', name: '赵六', department: '财务部', phone: '13800138004', status: 'normal', blacklist: false, depositPaid: 50, workArea: 'C区' },
    { id: 'E005', name: '钱七', department: '研发部', phone: '13800138005', status: 'normal', blacklist: false, depositPaid: 50, workArea: 'B区' },
    { id: 'E006', name: '孙八', department: '市场部', phone: '13800138006', status: 'normal', blacklist: false, depositPaid: 50, workArea: 'B区' }
  ])

  const borrowRecords = ref([
    { id: 'B001', umbrellaId: 'U008', employeeId: 'E004', borrowStation: 'S004', borrowTime: '2024-06-10 09:00:00', expectReturnTime: '2024-06-10 18:00:00', status: 'borrowed', overdue: true, offlineRecord: false },
    { id: 'B002', umbrellaId: 'U011', employeeId: 'E001', borrowStation: 'S004', borrowTime: '2024-06-13 08:30:00', expectReturnTime: '2024-06-13 18:00:00', status: 'borrowed', overdue: false, offlineRecord: false }
  ])

  const offlineRecords = ref([
    { id: 'OFF001', type: 'borrow', employeeId: 'E002', umbrellaId: 'U020', stationId: 'S004', recordTime: '2024-06-14 07:45:00', synced: false, syncTime: null, data: { expectReturnTime: '2024-06-14 18:00:00' } },
    { id: 'OFF002', type: 'return', recordId: 'B001', stationId: 'S005', umbrellaId: 'U008', employeeId: 'E004', recordTime: '2024-06-14 08:15:00', synced: false, syncTime: null, data: {} }
  ])

  const transferRecords = ref([
    { id: 'T001', fromStation: 'S001', toStation: 'S002', umbrellaCount: 5, operator: '张行政', status: 'completed', createTime: '2024-06-05 10:00:00', completeTime: '2024-06-05 11:30:00', umbrellas: [] },
    { id: 'T002', fromStation: 'S003', toStation: 'S001', umbrellaCount: 3, operator: '李行政', status: 'pending', createTime: '2024-06-12 14:00:00', umbrellas: [] },
    { id: 'T003', fromStation: 'S005', toStation: 'S002', umbrellaCount: 2, operator: '王行政', status: 'in_progress', createTime: '2024-06-13 09:00:00', umbrellas: [] }
  ])

  const repairRecords = ref([
    { id: 'R001', umbrellaId: 'U005', reporter: '保洁B001', damageDesc: '伞面破损', reportTime: '2024-06-08 14:00:00', repairer: '维修员W001', repairTime: '2024-06-12 16:00:00', repairCost: 20, repairDesc: '更换伞面', recheckTime: '2024-06-13 10:00:00', rechecker: '张行政', recheckResult: 'pending', status: 'pending_recheck' },
    { id: 'R002', umbrellaId: 'U003', reporter: '保洁B002', damageDesc: '伞骨断裂', reportTime: '2024-06-10 10:00:00', status: 'pending_repair' },
    { id: 'R003', umbrellaId: 'U019', reporter: '保洁B001', damageDesc: '伞柄损坏', reportTime: '2024-06-12 09:00:00', repairer: '维修员W002', repairTime: '2024-06-13 14:00:00', repairCost: 15, repairDesc: '更换伞柄组件', status: 'repairing' },
    { id: 'R004', umbrellaId: 'U010', reporter: '保洁B003', damageDesc: '二维码模糊无法扫描', reportTime: '2024-06-11 15:00:00', repairer: '维修员W001', repairTime: '2024-06-12 11:00:00', repairCost: 5, repairDesc: '重新打印并粘贴二维码标签', rebindTime: '2024-06-13 09:30:00', oldQrCode: 'UMB-U010-OLD', newQrCode: 'UMB-U010-NEW', status: 'pending_restore' }
  ])

  const inventoryRecords = ref([
    { id: 'I001', stationId: 'S001', operator: '保洁B001', inventoryTime: '2024-06-01 10:00:00', systemCount: 12, actualCount: 12, diffCount: 0, status: 'normal' },
    { id: 'I002', stationId: 'S003', operator: '保洁B002', inventoryTime: '2024-06-07 14:00:00', systemCount: 22, actualCount: 21, diffCount: -1, diffUmbrellas: ['U009'], status: 'has_diff' }
  ])

  const feeRecords = ref([
    { id: 'F001', employeeId: 'E002', type: 'deposit', amount: 50, status: 'paid', payTime: '2024-01-15 10:00:00', operator: '张行政' },
    { id: 'F002', employeeId: 'E004', type: 'deposit', amount: 50, status: 'paid', payTime: '2024-01-20 14:00:00', operator: '李行政' },
    { id: 'F003', employeeId: 'E002', type: 'overdue', amount: 1, status: 'paid', payTime: '2024-06-11 09:00:00', relatedRecord: 'B004', operator: '王行政' },
    { id: 'F004', employeeId: 'E002', type: 'compensate', amount: 80, status: 'paid', payTime: '2024-06-06 10:00:00', relatedUmbrella: 'U009', operator: '赵行政' }
  ])

  const weatherWarnings = ref([
    { id: 'W001', stationId: 'S003', type: 'rainstorm', level: 'yellow', msg: '暴雨黄色预警，预计今日有大到暴雨', publishTime: '2024-06-13 08:00:00', status: 'active', reserveCount: 10 }
  ])

  const reminders = ref([
    { id: 'M001', employeeId: 'E004', umbrellaId: 'U008', type: 'overdue', content: '您借的雨伞已逾期，请尽快归还', sendTime: '2024-06-11 09:00:00', read: false },
    { id: 'M002', employeeId: 'E001', umbrellaId: 'U011', type: 'weather', content: '今日有雨，记得带伞。C栋宿舍楼站点已保留应急库存', sendTime: '2024-06-13 07:30:00', read: false }
  ])

  const playbackLogs = ref([])

  const availableUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'available'))
  const damagedUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'damaged'))
  const inRepairUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'in_repair' || u.status === 'repairing'))
  const recheckUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'recheck'))
  const rebindUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'rebind_qr'))
  const borrowedUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'borrowed'))
  const lostUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'lost'))
  const emergencyUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'emergency_reserve'))
  const activityLockedUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'activity_locked'))

  const overdueRecords = computed(() => borrowRecords.value.filter(r => r.status === 'borrowed' && r.overdue))
  const pendingTransfers = computed(() => transferRecords.value.filter(t => t.status === 'pending'))
  const pendingRepairs = computed(() => repairRecords.value.filter(r => r.status === 'pending_repair'))
  const repairingRecords = computed(() => repairRecords.value.filter(r => r.status === 'repairing'))
  const pendingRecheck = computed(() => repairRecords.value.filter(r => r.status === 'pending_recheck'))
  const pendingRebind = computed(() => repairRecords.value.filter(r => r.status === 'pending_rebind'))
  const pendingRestore = computed(() => repairRecords.value.filter(r => r.status === 'pending_restore'))
  const unsyncedOfflineRecords = computed(() => offlineRecords.value.filter(r => !r.synced))
  const activeActivityLocks = computed(() => activityLocks.value.filter(l => l.status === 'active'))
  const activeEmergencyReserve = computed(() => emergencyReserve.value.filter(r => r.status === 'active'))

  const getStationById = (id) => stations.value.find(s => s.id === id)
  const getUmbrellaById = (id) => umbrellas.value.find(u => u.id === id)
  const getEmployeeById = (id) => employees.value.find(e => e.id === id)
  const getActivityLockById = (id) => activityLocks.value.find(l => l.id === id)
  const getEmergencyReserveById = (id) => emergencyReserve.value.find(r => r.id === id)
  const getWarningById = (id) => weatherWarnings.value.find(w => w.id === id)

  const getAvailableUmbrellasByStation = (stationId) => {
    return umbrellas.value.filter(u => u.stationId === stationId && u.status === 'available')
  }

  const getBorrowedByEmployee = (employeeId) => {
    return borrowRecords.value.filter(r => r.employeeId === employeeId && r.status === 'borrowed')
  }

  const getOverdueByEmployee = (employeeId) => {
    return borrowRecords.value.filter(r => r.employeeId === employeeId && r.status === 'borrowed' && r.overdue)
  }

  const isStationReachable = (stationId, employeeId) => {
    const station = getStationById(stationId)
    if (!station) return false
    if (!station.reachableBy || station.reachableBy.length === 0) return true
    return station.reachableBy.includes(employeeId)
  }

  const getAvailableSlots = (stationId) => {
    const station = getStationById(stationId)
    if (!station) return 0
    return station.capacity - station.currentCount
  }

  const checkCanBorrow = (employeeId, stationId = null) => {
    const employee = getEmployeeById(employeeId)
    if (!employee) return { can: false, reason: '员工不存在' }
    if (employee.blacklist) return { can: false, reason: '您已被加入黑名单，禁止借伞' }
    if (employee.depositPaid < 50) return { can: false, reason: '请先缴纳押金' }
    const overdue = getOverdueByEmployee(employeeId)
    if (overdue.length > 0) return { can: false, reason: '您有逾期未还的雨伞，请先归还' }
    const borrowed = getBorrowedByEmployee(employeeId)
    if (borrowed.length >= 2) return { can: false, reason: '每人最多同时借2把雨伞' }
    if (stationId) {
      const station = getStationById(stationId)
      if (station?.offline) return { can: false, reason: '该站点当前离线，操作将在恢复后同步', canOffline: true }
      if (!isStationReachable(stationId, employeeId)) return { can: false, reason: '您当前不具备该站点的使用权限，请联系行政' }
    }
    return { can: true }
  }

  const borrowUmbrella = (umbrellaId, employeeId, stationId, isOffline = false) => {
    const check = checkCanBorrow(employeeId, stationId)
    if (!check.can && !check.canOffline) {
      return { success: false, message: check.reason }
    }

    const umbrella = getUmbrellaById(umbrellaId)
    if (!umbrella) return { success: false, message: '雨伞不存在' }

    if (umbrella.status === 'emergency_reserve') {
      return { success: false, message: '该雨伞为应急库存保留，仅行政人员可调拨' }
    }
    if (umbrella.status === 'activity_locked') {
      const lock = getActivityLockById(umbrella.lockId)
      return { success: false, message: `该雨伞已被"${lock?.activityName || '活动'}"锁定，无法借出` }
    }
    if (umbrella.status !== 'available') {
      return { success: false, message: '该雨伞当前不可借出' }
    }

    const station = getStationById(stationId)
    if (!station) return { success: false, message: '站点不存在' }

    if (isOffline || station.offline) {
      const offlineRec = {
        id: 'OFF' + Date.now(),
        type: 'borrow',
        employeeId,
        umbrellaId,
        stationId,
        recordTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        synced: false,
        syncTime: null,
        data: { expectReturnTime: dayjs().hour(18).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss') }
      }
      offlineRecords.value.push(offlineRec)
      umbrella.status = 'borrowed'
      station.currentCount--
      return { success: true, message: '站点离线，借伞记录已缓存，恢复后将自动同步', offline: true, record: offlineRec }
    }

    umbrella.status = 'borrowed'
    station.currentCount--

    const newRecord = {
      id: 'B' + Date.now(),
      umbrellaId,
      employeeId,
      borrowStation: stationId,
      borrowTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      expectReturnTime: dayjs().hour(18).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss'),
      status: 'borrowed',
      overdue: false,
      offlineRecord: false
    }
    borrowRecords.value.push(newRecord)
    return { success: true, message: '借伞成功', record: newRecord }
  }

  const returnUmbrella = (recordId, stationId, isOffline = false) => {
    const record = borrowRecords.value.find(r => r.id === recordId)
    if (!record || record.status !== 'borrowed') {
      return { success: false, message: '借伞记录不存在或已归还' }
    }

    const station = getStationById(stationId)
    if (!station) return { success: false, message: '站点不存在' }

    if (isOffline || station.offline) {
      const offlineRec = {
        id: 'OFF' + Date.now(),
        type: 'return',
        recordId,
        stationId,
        umbrellaId: record.umbrellaId,
        employeeId: record.employeeId,
        recordTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        synced: false,
        syncTime: null,
        data: {}
      }
      offlineRecords.value.push(offlineRec)
      const umbrella = getUmbrellaById(record.umbrellaId)
      if (umbrella) {
        umbrella.status = 'available'
        umbrella.stationId = stationId
      }
      station.currentCount++
      return { success: true, message: '站点离线，还伞记录已缓存，恢复后将自动同步', offline: true, record: offlineRec }
    }

    if (station.currentCount >= station.capacity) {
      const otherStations = getRecommendReturnStations(stationId, record.employeeId)
      return {
        success: false,
        message: '该站点已满，请选择其他站点归还',
        recommendStations: otherStations
      }
    }

    const umbrella = getUmbrellaById(record.umbrellaId)
    const now = dayjs()
    const expected = dayjs(record.expectReturnTime)
    const overdueDays = Math.max(0, now.diff(expected, 'day'))
    const overdueFee = overdueDays * station.overdueFee

    umbrella.status = 'available'
    umbrella.stationId = stationId
    station.currentCount++

    record.status = 'returned'
    record.returnStation = stationId
    record.returnTime = now.format('YYYY-MM-DD HH:mm:ss')
    record.overdue = overdueDays > 0
    record.overdueDays = overdueDays
    record.overdueFee = overdueFee

    if (overdueFee > 0) {
      feeRecords.value.push({
        id: 'F' + Date.now(),
        employeeId: record.employeeId,
        type: 'overdue',
        amount: overdueFee,
        status: 'unpaid',
        relatedRecord: record.id
      })
    }

    reminders.value.push({
      id: 'M' + Date.now(),
      employeeId: record.employeeId,
      umbrellaId: record.umbrellaId,
      type: overdueFee > 0 ? 'overdue_fee' : 'return',
      content: overdueFee > 0 ? `归还成功，产生逾期费${overdueFee}元` : '归还成功',
      sendTime: now.format('YYYY-MM-DD HH:mm:ss'),
      read: false
    })

    return { success: true, message: '归还成功', record, overdueFee }
  }

  const getRecommendReturnStations = (fromStationId, employeeId) => {
    const currentStation = getStationById(fromStationId)
    const employee = getEmployeeById(employeeId)
    const employeeWorkArea = employee?.workArea

    const candidates = stations.value
      .filter(s => s.id !== fromStationId && !s.offline)
      .map(s => {
        const slots = getAvailableSlots(s.id)
        const reachable = isStationReachable(s.id, employeeId)
        const sameArea = s.area === employeeWorkArea
        const dist = getDistance(s.id, fromStationId)
        const factors = {
          reachable: reachable ? 100 : 0,
          sameArea: sameArea ? 50 : 0,
          slots: slots > 5 ? 30 : slots > 0 ? slots * 5 : 0,
          distance: -(dist * 0.1)
        }
        const score = factors.reachable + factors.sameArea + factors.slots + factors.distance
        return {
          id: s.id,
          name: s.name,
          location: s.location,
          available: slots,
          reachable,
          sameArea,
          distance: dist,
          score,
          factors,
          station: s
        }
      })
      .filter(s => s.available > 0 && s.reachable)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    return candidates
  }

  const distanceMap = {
    'S001-S002': 200, 'S001-S003': 350, 'S001-S004': 500, 'S001-S005': 400,
    'S002-S003': 150, 'S002-S004': 300, 'S002-S005': 250,
    'S003-S004': 180, 'S003-S005': 220,
    'S004-S005': 280
  }

  const getDistance = (s1, s2) => {
    if (s1 === s2) return 0
    const key = [s1, s2].sort().join('-')
    return distanceMap[key] || 999
  }

  const reportDamage = (umbrellaId, reporter, damageDesc) => {
    const umbrella = getUmbrellaById(umbrellaId)
    if (umbrella) {
      umbrella.status = 'damaged'
      umbrella.damageDesc = damageDesc
      umbrella.damageTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      umbrella.damageReporter = reporter

      repairRecords.value.push({
        id: 'R' + Date.now(),
        umbrellaId,
        reporter,
        damageDesc,
        reportTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        status: 'pending_repair'
      })
      return { success: true, message: '破损登记成功，雨伞已标记为待维修' }
    }
    return { success: false, message: '雨伞不存在' }
  }

  const reportLost = (umbrellaId, employeeId, compensateAmount) => {
    const umbrella = getUmbrellaById(umbrellaId)
    if (!umbrella) return { success: false, message: '雨伞不存在' }

    umbrella.status = 'lost'
    umbrella.lostTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    umbrella.compensator = employeeId
    umbrella.compensateAmount = compensateAmount

    feeRecords.value.push({
      id: 'F' + Date.now(),
      employeeId,
      type: 'compensate',
      amount: compensateAmount,
      status: 'unpaid',
      relatedUmbrella: umbrellaId
    })
    return { success: true, message: '丢失登记成功，请赔偿' + compensateAmount + '元' }
  }

  const startRepair = (repairId, repairer) => {
    const repair = repairRecords.value.find(r => r.id === repairId)
    if (!repair || repair.status !== 'pending_repair') {
      return { success: false, message: '维修记录不存在或状态不对' }
    }
    const umbrella = getUmbrellaById(repair.umbrellaId)
    if (umbrella) umbrella.status = 'in_repair'
    repair.repairer = repairer
    repair.startTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    repair.status = 'repairing'
    return { success: true, message: '维修已开始' }
  }

  const completeRepair = (repairId, repairCost, repairDesc) => {
    const repair = repairRecords.value.find(r => r.id === repairId)
    if (!repair || repair.status !== 'repairing') {
      return { success: false, message: '维修记录不存在或非维修中状态' }
    }

    const umbrella = getUmbrellaById(repair.umbrellaId)
    if (umbrella) {
      umbrella.status = 'recheck'
      umbrella.repairTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      umbrella.repairCost = repairCost
      umbrella.repairDesc = repairDesc
    }

    repair.repairTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    repair.repairCost = repairCost
    repair.repairDesc = repairDesc
    repair.recheckTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    repair.status = 'pending_recheck'

    return { success: true, message: '维修完成，请安排复检' }
  }

  const recheckRepair = (repairId, rechecker, result, remark = '') => {
    const repair = repairRecords.value.find(r => r.id === repairId)
    if (!repair || repair.status !== 'pending_recheck') {
      return { success: false, message: '维修记录不存在或无需复检' }
    }

    repair.rechecker = rechecker
    repair.recheckResult = result
    repair.recheckRemark = remark
    repair.recheckTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

    const umbrella = getUmbrellaById(repair.umbrellaId)

    if (result === 'pass') {
      if (repair.damageDesc && (repair.damageDesc.includes('二维码') || repair.damageDesc.includes('扫码'))) {
        repair.status = 'pending_rebind'
        if (umbrella) umbrella.status = 'rebind_qr'
        return { success: true, message: '复检通过，请安排重新绑定二维码' }
      } else {
        repair.status = 'completed'
        repair.acceptTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        if (umbrella) umbrella.status = 'available'
        return { success: true, message: '复检通过，雨伞已恢复可用状态' }
      }
    } else {
      repair.status = 'repairing'
      if (umbrella) umbrella.status = 'in_repair'
      return { success: true, message: '复检未通过，已退回维修环节' }
    }
  }

  const rebindQrCode = (repairId, newQrCode) => {
    const repair = repairRecords.value.find(r => r.id === repairId)
    if (!repair || repair.status !== 'pending_rebind') {
      return { success: false, message: '维修记录不存在或无需绑定二维码' }
    }

    const umbrella = getUmbrellaById(repair.umbrellaId)
    if (umbrella) {
      umbrella.oldQrCode = umbrella.qrCode
      umbrella.qrCode = newQrCode
      umbrella.status = 'rebind_qr'
    }

    repair.oldQrCode = umbrella?.oldQrCode
    repair.newQrCode = newQrCode
    repair.rebindTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    repair.status = 'pending_restore'

    return { success: true, message: '二维码已重新绑定，请确认回站点' }
  }

  const restoreToStation = (repairId, stationId) => {
    const repair = repairRecords.value.find(r => r.id === repairId)
    if (!repair || repair.status !== 'pending_restore') {
      return { success: false, message: '维修记录不存在或无需回库' }
    }

    const station = getStationById(stationId)
    if (!station) return { success: false, message: '目标站点不存在' }
    if (station.currentCount >= station.capacity) {
      return { success: false, message: '目标站点已满，无法入库' }
    }

    const umbrella = getUmbrellaById(repair.umbrellaId)
    if (umbrella) {
      umbrella.stationId = stationId
      umbrella.status = 'available'
    }

    station.currentCount++

    repair.restoreTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    repair.restoreStation = stationId
    repair.status = 'completed'
    repair.acceptTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

    return { success: true, message: `雨伞已成功回到${station.name}，可正常借出` }
  }

  const acceptRepair = (repairId, type, acceptor, remark = '') => {
    const repair = repairRecords.value.find(r => r.id === repairId)
    if (!repair) return { success: false, message: '维修记录不存在' }

    if (repair.status === 'pending_recheck') {
      return recheckRepair(repairId, acceptor, type === 'pass' ? 'pass' : 'fail', remark)
    }

    if (repair.status === 'pending_accept') {
      repair.acceptTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      repair.acceptor = acceptor
      repair.acceptResult = type
      repair.acceptRemark = remark

      const umbrella = getUmbrellaById(repair.umbrellaId)
      if (type === 'pass') {
        repair.status = 'completed'
        if (umbrella) umbrella.status = 'available'
      } else {
        repair.status = 'repairing'
        if (umbrella) umbrella.status = 'in_repair'
      }
      return { success: true, message: type === 'pass' ? '验收通过' : '已驳回维修' }
    }

    return { success: false, message: '当前状态不支持此操作' }
  }

  const createEmergencyReserve = (warningId, stationId, reserveCount, operator, description) => {
    const station = getStationById(stationId)
    if (!station) return { success: false, message: '站点不存在' }

    const availables = getAvailableUmbrellasByStation(stationId)
    if (availables.length < reserveCount) {
      return { success: false, message: `可用雨伞不足，仅${availables.length}把，无法保留${reserveCount}把` }
    }

    const reserve = {
      id: 'ER' + Date.now(),
      stationId,
      warningId,
      reserveCount,
      operator,
      description,
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: 'active'
    }

    const locked = availables.slice(0, reserveCount)
    locked.forEach(u => {
      u.status = 'emergency_reserve'
      u.reserveId = reserve.id
    })

    emergencyReserve.value.push(reserve)
    return { success: true, message: `成功保留${reserveCount}把应急雨伞`, reserve }
  }

  const releaseEmergencyReserve = (reserveId) => {
    const reserve = getEmergencyReserveById(reserveId)
    if (!reserve) return { success: false, message: '应急库存记录不存在' }

    umbrellas.value.forEach(u => {
      if (u.reserveId === reserveId && u.status === 'emergency_reserve') {
        u.status = 'available'
        delete u.reserveId
      }
    })

    reserve.status = 'released'
    reserve.releaseTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    return { success: true, message: '应急库存已释放' }
  }

  const createActivityLock = (activityName, stationId, umbrellaCount, operator, expireTime, participantIds = []) => {
    const station = getStationById(stationId)
    if (!station) return { success: false, message: '站点不存在' }

    const availables = getAvailableUmbrellasByStation(stationId)
    if (availables.length < umbrellaCount) {
      return { success: false, message: `可用雨伞不足，仅${availables.length}把，无法锁定${umbrellaCount}把` }
    }

    const lock = {
      id: 'AL' + Date.now(),
      activityName,
      stationId,
      umbrellaCount,
      operator,
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      expireTime,
      status: 'active',
      lockedUmbrellas: [],
      participants: participantIds
    }

    const locked = availables.slice(0, umbrellaCount)
    locked.forEach(u => {
      u.status = 'activity_locked'
      u.lockId = lock.id
      lock.lockedUmbrellas.push(u.id)
    })

    activityLocks.value.push(lock)
    return { success: true, message: `活动批量锁定${umbrellaCount}把雨伞成功`, lock }
  }

  const releaseActivityLock = (lockId) => {
    const lock = getActivityLockById(lockId)
    if (!lock) return { success: false, message: '活动锁定记录不存在' }

    umbrellas.value.forEach(u => {
      if (u.lockId === lockId && u.status === 'activity_locked') {
        u.status = 'available'
        delete u.lockId
      }
    })

    lock.status = 'released'
    lock.releaseTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    return { success: true, message: '活动锁定已解除' }
  }

  const activityBorrowForParticipants = (lockId, employeeIds = []) => {
    const lock = getActivityLockById(lockId)
    if (!lock) return { success: false, message: '活动锁定不存在' }
    if (lock.status !== 'active') return { success: false, message: '活动锁定已失效' }

    const locked = umbrellas.value.filter(u => u.lockId === lockId && u.status === 'activity_locked')
    const borrowCount = Math.min(employeeIds.length, locked.length)
    const results = []

    for (let i = 0; i < borrowCount; i++) {
      const emp = getEmployeeById(employeeIds[i])
      const umbrella = locked[i]
      if (!emp || !umbrella) continue

      const check = checkCanBorrow(employeeIds[i])
      if (!check.can) {
        results.push({ employeeId: employeeIds[i], success: false, message: check.reason })
        continue
      }

      umbrella.status = 'borrowed'
      const station = getStationById(lock.stationId)
      if (station) station.currentCount--

      const record = {
        id: 'B' + Date.now() + i,
        umbrellaId: umbrella.id,
        employeeId: employeeIds[i],
        borrowStation: lock.stationId,
        borrowTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        expectReturnTime: dayjs().hour(20).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss'),
        status: 'borrowed',
        overdue: false,
        activityId: lockId
      }
      borrowRecords.value.push(record)
      lock.participants.push(employeeIds[i])
      results.push({ employeeId: employeeIds[i], employeeName: emp.name, umbrellaId: umbrella.id, success: true })
    }

    return {
      success: true,
      message: `活动批量借伞：成功${results.filter(r => r.success).length}把，失败${results.filter(r => !r.success).length}把`,
      results
    }
  }

  const setStationOffline = (stationId, offline = true) => {
    const station = getStationById(stationId)
    if (!station) return { success: false, message: '站点不存在' }
    station.offline = offline
    return { success: true, message: offline ? `站点${station.name}已标记为离线` : `站点${station.name}已恢复在线` }
  }

  const syncOfflineRecords = (stationId = null) => {
    const targets = stationId
      ? unsyncedOfflineRecords.value.filter(r => r.stationId === stationId)
      : unsyncedOfflineRecords.value

    if (targets.length === 0) {
      return { success: true, message: '没有需要同步的离线记录', count: 0 }
    }

    const sorted = [...targets].sort((a, b) => dayjs(a.recordTime).valueOf() - dayjs(b.recordTime).valueOf())
    const logs = []

    sorted.forEach(rec => {
      rec.synced = true
      rec.syncTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

      if (rec.type === 'borrow') {
        const station = getStationById(rec.stationId)
        const exists = borrowRecords.value.find(b => b.umbrellaId === rec.umbrellaId && b.status === 'borrowed')
        if (!exists) {
          const newRec = {
            id: 'B' + Date.now() + Math.random(),
            umbrellaId: rec.umbrellaId,
            employeeId: rec.employeeId,
            borrowStation: rec.stationId,
            borrowTime: rec.recordTime,
            expectReturnTime: rec.data?.expectReturnTime || dayjs(rec.recordTime).hour(18).minute(0).format('YYYY-MM-DD HH:mm:ss'),
            status: 'borrowed',
            overdue: dayjs().isAfter(dayjs(rec.data?.expectReturnTime)),
            offlineRecord: true,
            offlineId: rec.id
          }
          borrowRecords.value.push(newRec)
          logs.push(`[回放] ${rec.recordTime} 员工${rec.employeeId}从${station?.name}借走雨伞${rec.umbrellaId}`)
        }
      } else if (rec.type === 'return') {
        const borrow = borrowRecords.value.find(b => b.id === rec.recordId)
        const station = getStationById(rec.stationId)
        if (borrow && borrow.status === 'borrowed') {
          borrow.status = 'returned'
          borrow.returnStation = rec.stationId
          borrow.returnTime = rec.recordTime
          borrow.offlineRecord = true
          borrow.offlineId = rec.id

          const umbrella = getUmbrellaById(rec.umbrellaId)
          if (umbrella) {
            umbrella.status = 'available'
            umbrella.stationId = rec.stationId
          }
          if (station) station.currentCount++
          logs.push(`[回放] ${rec.recordTime} 员工${rec.employeeId}在${station?.name}归还雨伞${rec.umbrellaId}`)
        }
      }
    })

    playbackLogs.value.push({
      id: 'PB' + Date.now(),
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      stationId,
      count: sorted.length,
      logs
    })

    return { success: true, message: `已按时间顺序回放${sorted.length}条离线记录`, count: sorted.length, logs, lastPlayback: playbackLogs.value[playbackLogs.value.length - 1] }
  }

  const createTransfer = (fromStation, toStation, umbrellaCount, operator) => {
    const from = getStationById(fromStation)
    const to = getStationById(toStation)
    if (!from || !to) return { success: false, message: '站点不存在' }

    const available = getAvailableUmbrellasByStation(fromStation)
    if (available.length < umbrellaCount) {
      return { success: false, message: '源站点可用雨伞不足' }
    }

    const newTransfer = {
      id: 'T' + Date.now(),
      fromStation,
      toStation,
      umbrellaCount,
      operator,
      status: 'pending',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      umbrellas: []
    }
    transferRecords.value.push(newTransfer)
    return { success: true, message: '调拨任务创建成功', transfer: newTransfer }
  }

  const startTransfer = (transferId, umbrellasToTransfer) => {
    const transfer = transferRecords.value.find(t => t.id === transferId)
    if (!transfer || transfer.status !== 'pending') {
      return { success: false, message: '调拨任务不存在或已处理' }
    }

    const from = getStationById(transfer.fromStation)
    const to = getStationById(transfer.toStation)

    umbrellasToTransfer.forEach(uid => {
      const u = getUmbrellaById(uid)
      if (u) {
        u.stationId = transfer.toStation
      }
    })

    from.currentCount -= umbrellasToTransfer.length
    to.currentCount += umbrellasToTransfer.length

    transfer.status = 'completed'
    transfer.umbrellas = umbrellasToTransfer
    transfer.completeTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

    return { success: true, message: '调拨完成，站点容量已更新' }
  }

  const doInventory = (stationId, operator, actualCount, diffUmbrellas = []) => {
    const station = getStationById(stationId)
    const systemUmbrellas = umbrellas.value.filter(u => u.stationId === stationId && u.status !== 'borrowed' && u.status !== 'lost' && u.status !== 'in_repair')
    const systemCount = systemUmbrellas.length
    const diffCount = actualCount - systemCount

    const newInventory = {
      id: 'I' + Date.now(),
      stationId,
      operator,
      inventoryTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      systemCount,
      actualCount,
      diffCount,
      diffUmbrellas,
      status: diffCount === 0 ? 'normal' : 'has_diff'
    }
    inventoryRecords.value.push(newInventory)
    return { success: true, inventory: newInventory }
  }

  const updateStation = (stationId, data) => {
    const station = getStationById(stationId)
    if (station) {
      Object.assign(station, data)
      return { success: true, message: '站点信息更新成功' }
    }
    return { success: false, message: '站点不存在' }
  }

  const switchRole = (role, userId) => {
    if (role === 'employee') {
      const emp = getEmployeeById(userId)
      if (emp) currentUser.value = { ...emp, role: 'employee' }
    } else if (role === 'admin') {
      currentUser.value = { id: 'A001', name: '张行政', department: '行政部', phone: '13900139001', role: 'admin' }
    } else if (role === 'cleaner') {
      currentUser.value = { id: 'B001', name: '李保洁', department: '保洁部', phone: '13700137001', role: 'cleaner' }
    }
  }

  const updateDeposit = (employeeId, amount) => {
    const emp = getEmployeeById(employeeId)
    if (emp) {
      emp.depositPaid = amount
      return { success: true, message: '押金更新成功' }
    }
    return { success: false, message: '员工不存在' }
  }

  const addFeeRecord = (record) => {
    feeRecords.value.push(record)
    return { success: true }
  }

  const getRepairStatusText = (status) => {
    const map = {
      pending_repair: '待维修',
      repairing: '维修中',
      pending_recheck: '待复检',
      pending_rebind: '待绑定二维码',
      pending_restore: '待回库',
      completed: '已完成',
      rejected: '已驳回'
    }
    return map[status] || status
  }

  const getUmbrellaStatusText = (status) => {
    const map = {
      available: '可借',
      borrowed: '借出',
      damaged: '破损',
      in_repair: '维修中',
      recheck: '待复检',
      rebind_qr: '待绑定二维码',
      lost: '丢失',
      emergency_reserve: '应急库存',
      activity_locked: '活动锁定'
    }
    return map[status] || status
  }

  const getUmbrellaStatusType = (status) => {
    const map = {
      available: 'success',
      borrowed: 'primary',
      damaged: 'danger',
      in_repair: 'warning',
      recheck: 'warning',
      rebind_qr: 'warning',
      lost: 'info',
      emergency_reserve: 'danger',
      activity_locked: 'warning'
    }
    return map[status] || 'info'
  }

  const runDemoScenario = (scenario) => {
    if (scenario === 'storm_reserve') {
      const s003 = getStationById('S003')
      if (s003 && !s003.weatherWarning) {
        s003.weatherWarning = true
        s003.warningMsg = '暴雨黄色预警，预计今日有大到暴雨'
        const existing = weatherWarnings.value.find(w => w.stationId === 'S003')
        if (!existing) {
          weatherWarnings.value.push({
            id: 'W001',
            stationId: 'S003',
            type: 'rainstorm',
            level: 'yellow',
            msg: '暴雨黄色预警，预计今日有大到暴雨',
            publishTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            status: 'active',
            reserveCount: 10
          })
        }
        const existingReserve = emergencyReserve.value.find(r => r.stationId === 'S003' && r.status === 'active')
        if (!existingReserve) {
          createEmergencyReserve('W001', 'S003', 3, '张行政', '暴雨黄色预警应急库存保留')
        }
      }
      return { success: true, message: '暴雨预警演示已就绪：S003站点已标记暴雨预警并保留应急库存，切换到员工端测试借伞拦截' }
    }

    if (scenario === 'activity_borrow') {
      const existing = activityLocks.value.find(l => l.status === 'active' && l.stationId === 'S001')
      if (!existing) {
        createActivityLock('2024年中总结大会', 'S001', 2, '张行政', dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss'), [])
      }
      return { success: true, message: '活动锁定演示已就绪：S001站点已锁定2把雨伞，切换到员工端测试借伞拦截' }
    }

    if (scenario === 'offline_borrow') {
      const s004 = getStationById('S004')
      if (s004 && !s004.offline) {
        s004.offline = true
      }
      const availAtS004 = umbrellas.value.filter(u => u.stationId === 'S004' && u.status === 'available')
      if (availAtS004.length > 0) {
        offlineRecords.value.push({
          id: 'OFF_DEMO_1',
          type: 'borrow',
          employeeId: 'E002',
          umbrellaId: availAtS004[0].id,
          stationId: 'S004',
          recordTime: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
          synced: false,
          syncTime: null,
          data: { expectReturnTime: dayjs().hour(18).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss') }
        })
        availAtS004[0].status = 'borrowed'
        s004.currentCount--
      }
      return { success: true, message: '离线借伞演示已就绪：S004站点已标记离线，E002(李四)扫码借伞已缓存，恢复后可同步回放' }
    }

    if (scenario === 'damage_repair') {
      const availAtS001 = umbrellas.value.filter(u => u.stationId === 'S001' && u.status === 'available')
      if (availAtS001.length > 0) {
        const demoUmbrella = availAtS001[0]
        reportDamage(demoUmbrella.id, '保洁B001', '演示：伞面轻微破损')
        const repair = repairRecords.value.find(r => r.umbrellaId === demoUmbrella.id && r.status === 'pending_repair')
        if (repair) {
          startRepair(repair.id, '维修员W001')
          completeRepair(repair.id, 15, '演示：更换伞面')
        }
      }
      return { success: true, message: '破损维修演示已就绪：S001站点一把雨伞已走完登记→维修→待复检流程，可继续推进复检→绑码→回库' }
    }

    return { success: false, message: '未知演示场景' }
  }

  return {
    currentUser,
    stations,
    umbrellas,
    employees,
    borrowRecords,
    transferRecords,
    repairRecords,
    inventoryRecords,
    feeRecords,
    weatherWarnings,
    reminders,
    emergencyReserve,
    activityLocks,
    offlineRecords,
    playbackLogs,
    availableUmbrellas,
    damagedUmbrellas,
    inRepairUmbrellas,
    recheckUmbrellas,
    rebindUmbrellas,
    borrowedUmbrellas,
    lostUmbrellas,
    emergencyUmbrellas,
    activityLockedUmbrellas,
    overdueRecords,
    pendingTransfers,
    pendingRepairs,
    repairingRecords,
    pendingRecheck,
    pendingRebind,
    pendingRestore,
    unsyncedOfflineRecords,
    activeActivityLocks,
    activeEmergencyReserve,
    getStationById,
    getUmbrellaById,
    getEmployeeById,
    getActivityLockById,
    getEmergencyReserveById,
    getWarningById,
    getAvailableUmbrellasByStation,
    getBorrowedByEmployee,
    getOverdueByEmployee,
    isStationReachable,
    getAvailableSlots,
    checkCanBorrow,
    borrowUmbrella,
    returnUmbrella,
    getRecommendReturnStations,
    getDistance,
    reportDamage,
    reportLost,
    startRepair,
    completeRepair,
    recheckRepair,
    rebindQrCode,
    restoreToStation,
    acceptRepair,
    createEmergencyReserve,
    releaseEmergencyReserve,
    createActivityLock,
    releaseActivityLock,
    activityBorrowForParticipants,
    setStationOffline,
    syncOfflineRecords,
    createTransfer,
    startTransfer,
    doInventory,
    updateStation,
    switchRole,
    updateDeposit,
    addFeeRecord,
    getRepairStatusText,
    getUmbrellaStatusText,
    getUmbrellaStatusType,
    runDemoScenario
  }
})
