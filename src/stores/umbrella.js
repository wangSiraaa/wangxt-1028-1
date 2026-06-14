import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export const useUmbrellaStore = defineStore('umbrella', () => {
  const currentUser = ref({ id: 'E001', name: '张三', department: '研发部', phone: '13800138001', role: 'employee' })

  const stations = ref([
    { id: 'S001', name: 'A栋办公楼站点', location: 'A栋1楼大厅', capacity: 20, currentCount: 15, qrCode: 'UMB-S001-001', deposit: 50, overdueFee: 1, admin: '张行政', status: 'normal', createTime: '2024-01-01', weatherWarning: false },
    { id: 'S002', name: 'B栋研发楼站点', location: 'B栋1楼入口', capacity: 15, currentCount: 0, qrCode: 'UMB-S002-001', deposit: 50, overdueFee: 1, admin: '李行政', status: 'normal', createTime: '2024-01-02', weatherWarning: false },
    { id: 'S003', name: 'C栋宿舍楼站点', location: 'C栋1楼服务台', capacity: 25, currentCount: 25, qrCode: 'UMB-S003-001', deposit: 50, overdueFee: 1, admin: '王行政', status: 'normal', createTime: '2024-01-03', weatherWarning: true, warningMsg: '暴雨预警，请注意携带雨伞' },
    { id: 'S004', name: '园区大门站点', location: '园区正门保安亭旁', capacity: 30, currentCount: 10, qrCode: 'UMB-S004-001', deposit: 50, overdueFee: 1, admin: '赵行政', status: 'normal', createTime: '2024-01-04', weatherWarning: false },
    { id: 'S005', name: '餐厅门口站点', location: '员工餐厅正门', capacity: 20, currentCount: 18, qrCode: 'UMB-S005-001', deposit: 50, overdueFee: 1, admin: '张行政', status: 'normal', createTime: '2024-01-05', weatherWarning: false }
  ])

  const umbrellas = ref([
    { id: 'U001', stationId: 'S001', status: 'available', qrCode: 'UMB-U001', brand: '天堂伞', color: '黑色', purchaseDate: '2024-01-01', purchasePrice: 80 },
    { id: 'U002', stationId: 'S001', status: 'available', qrCode: 'UMB-U002', brand: '天堂伞', color: '蓝色', purchaseDate: '2024-01-01', purchasePrice: 80 },
    { id: 'U003', stationId: 'S001', status: 'damaged', qrCode: 'UMB-U003', brand: '天堂伞', color: '红色', purchaseDate: '2024-01-01', purchasePrice: 80, damageDesc: '伞骨断裂', damageTime: '2024-06-10', damageReporter: '保洁B001' },
    { id: 'U004', stationId: 'S001', status: 'available', qrCode: 'UMB-U004', brand: '天堂伞', color: '绿色', purchaseDate: '2024-01-02', purchasePrice: 80 },
    { id: 'U005', stationId: 'S001', status: 'in_repair', qrCode: 'UMB-U005', brand: '天堂伞', color: '黑色', purchaseDate: '2024-01-02', purchasePrice: 80, damageDesc: '伞面破损', damageTime: '2024-06-08', repairTime: '2024-06-12', repairer: '维修员W001', repairCost: 20, repairDesc: '更换伞面' },
    { id: 'U006', stationId: 'S003', status: 'available', qrCode: 'UMB-U006', brand: '红叶伞', color: '紫色', purchaseDate: '2024-01-03', purchasePrice: 75 },
    { id: 'U007', stationId: 'S003', status: 'available', qrCode: 'UMB-U007', brand: '红叶伞', color: '黑色', purchaseDate: '2024-01-03', purchasePrice: 75 },
    { id: 'U008', stationId: 'S004', status: 'borrowed', qrCode: 'UMB-U008', brand: '红叶伞', color: '蓝色', purchaseDate: '2024-01-04', purchasePrice: 75 },
    { id: 'U009', stationId: 'S004', status: 'lost', qrCode: 'UMB-U009', brand: '红叶伞', color: '灰色', purchaseDate: '2024-01-04', purchasePrice: 75, lostTime: '2024-06-05', compensator: 'E002', compensateAmount: 80, compensateTime: '2024-06-06' },
    { id: 'U010', stationId: 'S005', status: 'available', qrCode: 'UMB-U010', brand: '天堂伞', color: '黑色', purchaseDate: '2024-01-05', purchasePrice: 80 },
    { id: 'U011', stationId: 'S004', status: 'borrowed', qrCode: 'UMB-U011', brand: '红叶伞', color: '红色', purchaseDate: '2024-01-04', purchasePrice: 75 },
    { id: 'U012', stationId: 'S005', status: 'available', qrCode: 'UMB-U012', brand: '天堂伞', color: '蓝色', purchaseDate: '2024-01-05', purchasePrice: 80 },
    { id: 'U013', stationId: 'S003', status: 'available', qrCode: 'UMB-U013', brand: '红叶伞', color: '黑色', purchaseDate: '2024-01-03', purchasePrice: 75 },
    { id: 'U014', stationId: 'S005', status: 'available', qrCode: 'UMB-U014', brand: '天堂伞', color: '紫色', purchaseDate: '2024-01-05', purchasePrice: 80 },
    { id: 'U015', stationId: 'S001', status: 'available', qrCode: 'UMB-U015', brand: '天堂伞', color: '黑色', purchaseDate: '2024-01-05', purchasePrice: 80 }
  ])

  const employees = ref([
    { id: 'E001', name: '张三', department: '研发部', phone: '13800138001', status: 'normal', blacklist: false, depositPaid: 50 },
    { id: 'E002', name: '李四', department: '市场部', phone: '13800138002', status: 'normal', blacklist: false, depositPaid: 50 },
    { id: 'E003', name: '王五', department: '人事部', phone: '13800138003', status: 'normal', blacklist: true, depositPaid: 0, blacklistReason: '恶意损坏雨伞3次' },
    { id: 'E004', name: '赵六', department: '财务部', phone: '13800138004', status: 'normal', blacklist: false, depositPaid: 50 },
    { id: 'E005', name: '钱七', department: '研发部', phone: '13800138005', status: 'normal', blacklist: false, depositPaid: 50 },
    { id: 'E006', name: '孙八', department: '市场部', phone: '13800138006', status: 'normal', blacklist: false, depositPaid: 50 }
  ])

  const borrowRecords = ref([
    { id: 'B001', umbrellaId: 'U008', employeeId: 'E004', borrowStation: 'S004', borrowTime: '2024-06-10 09:00:00', expectReturnTime: '2024-06-10 18:00:00', status: 'borrowed', overdue: true },
    { id: 'B002', umbrellaId: 'U011', employeeId: 'E001', borrowStation: 'S004', borrowTime: '2024-06-13 08:30:00', expectReturnTime: '2024-06-13 18:00:00', status: 'borrowed', overdue: false },
    { id: 'B003', umbrellaId: 'U001', employeeId: 'E002', borrowStation: 'S001', borrowTime: '2024-06-08 10:00:00', expectReturnTime: '2024-06-08 18:00:00', returnStation: 'S001', returnTime: '2024-06-08 17:30:00', status: 'returned', overdue: false, overdueDays: 0, overdueFee: 0 },
    { id: 'B004', umbrellaId: 'U002', employeeId: 'E005', borrowStation: 'S001', borrowTime: '2024-06-09 07:00:00', expectReturnTime: '2024-06-09 18:00:00', returnStation: 'S005', returnTime: '2024-06-10 09:00:00', status: 'returned', overdue: true, overdueDays: 1, overdueFee: 1 }
  ])

  const transferRecords = ref([
    { id: 'T001', fromStation: 'S001', toStation: 'S002', umbrellaCount: 5, operator: '张行政', status: 'completed', createTime: '2024-06-05 10:00:00', completeTime: '2024-06-05 11:30:00', umbrellas: ['U001', 'U002'] },
    { id: 'T002', fromStation: 'S003', toStation: 'S001', umbrellaCount: 3, operator: '李行政', status: 'pending', createTime: '2024-06-12 14:00:00', umbrellas: [] },
    { id: 'T003', fromStation: 'S005', toStation: 'S002', umbrellaCount: 2, operator: '王行政', status: 'in_progress', createTime: '2024-06-13 09:00:00', umbrellas: ['U010'] }
  ])

  const repairRecords = ref([
    { id: 'R001', umbrellaId: 'U005', reporter: '保洁B001', damageDesc: '伞面破损', reportTime: '2024-06-08 14:00:00', repairer: '维修员W001', repairTime: '2024-06-12 16:00:00', repairCost: 20, repairDesc: '更换伞面', status: 'pending_accept' },
    { id: 'R002', umbrellaId: 'U003', reporter: '保洁B002', damageDesc: '伞骨断裂', reportTime: '2024-06-10 10:00:00', status: 'pending_repair' }
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
    { id: 'W001', stationId: 'S003', type: 'rainstorm', level: 'yellow', msg: '暴雨黄色预警', publishTime: '2024-06-13 08:00:00', status: 'active' }
  ])

  const reminders = ref([
    { id: 'M001', employeeId: 'E004', umbrellaId: 'U008', type: 'overdue', content: '您借的雨伞已逾期，请尽快归还', sendTime: '2024-06-11 09:00:00', read: false },
    { id: 'M002', employeeId: 'E001', umbrellaId: 'U011', type: 'weather', content: '今日有雨，记得带伞', sendTime: '2024-06-13 07:30:00', read: false }
  ])

  const availableUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'available'))
  const damagedUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'damaged'))
  const inRepairUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'in_repair'))
  const borrowedUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'borrowed'))
  const lostUmbrellas = computed(() => umbrellas.value.filter(u => u.status === 'lost'))

  const overdueRecords = computed(() => borrowRecords.value.filter(r => r.status === 'borrowed' && r.overdue))
  const pendingTransfers = computed(() => transferRecords.value.filter(t => t.status === 'pending'))
  const pendingRepairs = computed(() => repairRecords.value.filter(r => r.status === 'pending_repair'))
  const pendingRepairAccept = computed(() => repairRecords.value.filter(r => r.status === 'pending_accept'))

  const getStationById = (id) => stations.value.find(s => s.id === id)
  const getUmbrellaById = (id) => umbrellas.value.find(u => u.id === id)
  const getEmployeeById = (id) => employees.value.find(e => e.id === id)
  const getAvailableUmbrellasByStation = (stationId) => umbrellas.value.filter(u => u.stationId === stationId && u.status === 'available')
  const getBorrowedByEmployee = (employeeId) => borrowRecords.value.filter(r => r.employeeId === employeeId && r.status === 'borrowed')
  const getOverdueByEmployee = (employeeId) => borrowRecords.value.filter(r => r.employeeId === employeeId && r.status === 'borrowed' && r.overdue)

  const checkCanBorrow = (employeeId) => {
    const employee = getEmployeeById(employeeId)
    if (!employee) return { can: false, reason: '员工不存在' }
    if (employee.blacklist) return { can: false, reason: '您已被加入黑名单，禁止借伞' }
    if (employee.depositPaid < 50) return { can: false, reason: '请先缴纳押金' }
    const overdue = getOverdueByEmployee(employeeId)
    if (overdue.length > 0) return { can: false, reason: '您有逾期未还的雨伞，请先归还' }
    const borrowed = getBorrowedByEmployee(employeeId)
    if (borrowed.length >= 2) return { can: false, reason: '每人最多同时借2把雨伞' }
    return { can: true }
  }

  const borrowUmbrella = (umbrellaId, employeeId, stationId) => {
    const check = checkCanBorrow(employeeId)
    if (!check.can) return { success: false, message: check.reason }

    const umbrella = getUmbrellaById(umbrellaId)
    if (!umbrella || umbrella.status !== 'available') {
      return { success: false, message: '该雨伞不可借出' }
    }

    const station = getStationById(stationId)
    if (!station) return { success: false, message: '站点不存在' }

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
      overdue: false
    }
    borrowRecords.value.push(newRecord)
    return { success: true, message: '借伞成功', record: newRecord }
  }

  const returnUmbrella = (recordId, stationId) => {
    const record = borrowRecords.value.find(r => r.id === recordId)
    if (!record || record.status !== 'borrowed') {
      return { success: false, message: '借伞记录不存在或已归还' }
    }

    const station = getStationById(stationId)
    if (!station) return { success: false, message: '站点不存在' }

    if (station.currentCount >= station.capacity) {
      const otherStations = stations.value.filter(s => s.id !== stationId && s.currentCount < s.capacity)
      return {
        success: false,
        message: '该站点已满，请选择其他站点归还',
        recommendStations: otherStations.map(s => ({ id: s.id, name: s.name, location: s.location, available: s.capacity - s.currentCount }))
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
      return { success: true, message: '破损登记成功' }
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

  const completeRepair = (repairId, repairer, repairCost, repairDesc) => {
    const repair = repairRecords.value.find(r => r.id === repairId)
    if (!repair || repair.status !== 'pending_repair') {
      return { success: false, message: '维修记录不存在或已处理' }
    }

    const umbrella = getUmbrellaById(repair.umbrellaId)
    if (umbrella) {
      umbrella.status = 'in_repair'
      umbrella.repairTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      umbrella.repairer = repairer
      umbrella.repairCost = repairCost
      umbrella.repairDesc = repairDesc
    }

    repair.repairer = repairer
    repair.repairTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    repair.repairCost = repairCost
    repair.repairDesc = repairDesc
    repair.status = 'pending_accept'

    return { success: true, message: '维修完成，等待验收' }
  }

  const acceptRepair = (repairId) => {
    const repair = repairRecords.value.find(r => r.id === repairId)
    if (!repair || repair.status !== 'pending_accept') {
      return { success: false, message: '维修记录不存在或无需验收' }
    }

    const umbrella = getUmbrellaById(repair.umbrellaId)
    if (umbrella) {
      umbrella.status = 'available'
    }

    repair.status = 'completed'
    repair.acceptTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

    return { success: true, message: '维修验收通过' }
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
    const systemUmbrellas = umbrellas.value.filter(u => u.stationId === stationId && u.status !== 'borrowed' && u.status !== 'lost')
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
    availableUmbrellas,
    damagedUmbrellas,
    inRepairUmbrellas,
    borrowedUmbrellas,
    lostUmbrellas,
    overdueRecords,
    pendingTransfers,
    pendingRepairs,
    pendingRepairAccept,
    getStationById,
    getUmbrellaById,
    getEmployeeById,
    getAvailableUmbrellasByStation,
    getBorrowedByEmployee,
    getOverdueByEmployee,
    checkCanBorrow,
    borrowUmbrella,
    returnUmbrella,
    reportDamage,
    reportLost,
    completeRepair,
    acceptRepair,
    createTransfer,
    startTransfer,
    doInventory,
    updateStation,
    switchRole
  }
})
