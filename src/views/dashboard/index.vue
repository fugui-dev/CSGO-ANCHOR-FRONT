<template>
  <div class="statistics-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>每日统计数据</span>
            <div class="date-picker-wrapper">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleDateRangeChange"
              />
            </div>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="statisticsList"
        stripe
        style="width: 100%">
        <el-table-column prop="statDate" label="统计日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.statDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="rechargeAmount" label="充值数量" min-width="120">
          <template #default="{ row }">
            {{ formatMoney(row.rechargeAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="rechargePerformance" label="充值业绩" min-width="120">
          <template #default="{ row }">
            {{ formatMoney(row.rechargePerformance || 0) }}
          </template>
        </el-table-column>
        <el-table-column prop="consumeAmount" label="消费数量" min-width="120">
          <template #default="{ row }">
            {{ formatMoney(row.consumeAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="newSubordinateCount" label="下级新增数量" min-width="130" />
        <el-table-column prop="commissionAmount" label="流水业绩" min-width="120">
          <template #default="{ row }">
            {{ formatMoney(row.commissionAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 详情弹框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="每日统计详情"
      width="600px">
      <div v-if="currentRow" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="统计日期">{{ formatDate(currentRow.statDate) }}</el-descriptions-item>
          <el-descriptions-item label="充值数量">{{ formatMoney(currentRow.rechargeAmount) }}</el-descriptions-item>
          <el-descriptions-item label="充值业绩">{{ formatMoney(currentRow.rechargePerformance || 0) }}</el-descriptions-item>
          <el-descriptions-item label="消费数量">{{ formatMoney(currentRow.consumeAmount) }}</el-descriptions-item>
          <el-descriptions-item label="已使用金额">{{ formatMoney(currentRow.usedCdkAmount || 0) }}</el-descriptions-item>
          <el-descriptions-item label="下级新增数量">{{ currentRow.newSubordinateCount }}</el-descriptions-item>
          <el-descriptions-item label="流水业绩">{{ formatMoney(currentRow.commissionAmount) }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="isToday(currentRow.statDate)" class="cdk-section">
          <h3>生成CDK</h3>
          <div class="cdk-info">
            <div class="info-item">
              <label>可用余额：</label>
              <span class="balance">{{ formatMoney(availableBalance) }}</span>
          </div>
            <el-form :model="cdkForm" label-width="120px" style="margin-top: 20px;">
              <el-form-item label="生成数量">
                <el-input-number
                  v-model="cdkForm.quantity"
                  :min="1"
                  :max="100"
                  placeholder="请输入生成数量"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="每张卡金额">
                <el-input-number
                  v-model="cdkForm.amount"
                  :min="0.01"
                  :precision="2"
                  :step="0.01"
                  placeholder="请输入每张卡金额（最低50元）"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleGenerateCDK" :loading="generatingCDK">生成CDK</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div v-else class="cdk-section">
          <el-alert
            title="提示"
            type="info"
            :closable="false"
            show-icon>
            <template #default>
              <p>只能使用当天的统计数据生成CDK，历史日期的业绩已自动结算。</p>
            </template>
          </el-alert>
        </div>

        <div v-if="generatedPasswords.length > 0" class="cdk-result">
          <h3>生成的CDK密码：</h3>
          <div class="password-list">
            <div v-for="(password, index) in generatedPasswords" :key="index" class="password-item">
              <span>{{ password }}</span>
              <el-button type="text" @click="onCopy(password)">复制</el-button>
        </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useClipboard } from '@vueuse/core'
import { getAnchorDailyStatistics, getAvailableCdkBalance, createGenerateCardCustom } from '@/api/anchor'

const { copy, isSupported } = useClipboard()

const loading = ref(false)
const statisticsList = ref([])
const dateRange = ref(null)

const detailDialogVisible = ref(false)
const currentRow = ref(null)
const availableBalance = ref(0)
const generatingCDK = ref(false)
const generatedPasswords = ref([])

const cdkForm = ref({
  quantity: 1,
  amount: 0
})

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatMoney = (amount) => {
  if (!amount) return '0.00'
  return parseFloat(amount).toFixed(2)
}

// 判断日期是否是今天
const isToday = (date) => {
  if (!date) return false
  const today = new Date()
  const targetDate = new Date(date)
  today.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)
  return today.getTime() === targetDate.getTime()
}

const handleDateRangeChange = () => {
  loadStatistics()
}

const loadStatistics = async () => {
  loading.value = true
  try {
    const params = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await getAnchorDailyStatistics(params.startDate, params.endDate)
    if (res.code === 200) {
      statisticsList.value = res.data || []
    } else {
      ElMessage.error(res.msg || '获取统计数据失败')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

const handleViewDetail = async (row) => {
  currentRow.value = row
  detailDialogVisible.value = true
  generatedPasswords.value = []
  cdkForm.value = {
    quantity: 1,
    amount: 0
  }

  // 获取该日期的可用CDK余额
  try {
    const statDate = formatDate(row.statDate)
    const res = await getAvailableCdkBalance(statDate)
    if (res.code === 200 && res.data) {
      // 直接使用接口返回的可用余额（已扣除已使用CDK金额和已提取流水业绩）
      availableBalance.value = parseFloat(res.data.rechargeTotal || 0)
      if (availableBalance.value < 0) {
        availableBalance.value = 0
      }
      // 默认设置每张卡金额为可用余额的10%（如果可用余额大于0），但最低为50
      if (availableBalance.value > 0) {
        const defaultAmount = parseFloat((availableBalance.value * 0.1).toFixed(2))
        cdkForm.value.amount = defaultAmount >= 50 ? defaultAmount : 50
      } else {
        cdkForm.value.amount = 50
      }
    } else {
      ElMessage.warning(res.msg || '获取可用余额失败')
      // 如果接口失败，设置为0
      availableBalance.value = 0
      cdkForm.value.amount = 50
    }
  } catch (error) {
    console.error('获取可用余额失败:', error)
    ElMessage.error('获取可用余额失败')
    // 如果接口失败，设置为0
    availableBalance.value = 0
    cdkForm.value.amount = 50
  }
}

const handleGenerateCDK = async () => {
  if (!currentRow.value) {
    return
  }

  if (!cdkForm.value.quantity || cdkForm.value.quantity <= 0) {
    ElMessage.warning('请输入生成数量')
    return
  }

  if (!cdkForm.value.amount || cdkForm.value.amount <= 0) {
    ElMessage.warning('请输入每张卡金额')
    return
  }
  
  if (cdkForm.value.amount < 50) {
    ElMessage.warning('最低额度为50')
    return
  }

  const totalAmount = cdkForm.value.amount * cdkForm.value.quantity
  if (totalAmount > availableBalance.value) {
    ElMessage.warning(`总金额${totalAmount.toFixed(2)}超过可用余额${formatMoney(availableBalance.value)}`)
    return
  }
  
  generatingCDK.value = true
  try {
    const statDate = formatDate(currentRow.value.statDate)
    const res = await createGenerateCardCustom({
      statDate: statDate,
      quantity: cdkForm.value.quantity,
      amount: cdkForm.value.amount
    })
    if (res.code === 200) {
      generatedPasswords.value = res.data || []
      ElMessage.success(`成功生成${generatedPasswords.value.length}张CDK`)
      // 重新加载统计数据列表
      await loadStatistics()
      // 从最新的统计数据中找到对应的行，更新currentRow
      const currentStatDate = formatDate(currentRow.value.statDate)
      const updatedRow = statisticsList.value.find(item => formatDate(item.statDate) === currentStatDate)
      if (updatedRow) {
        currentRow.value = updatedRow
      }
      // 重新获取可用余额
      await handleViewDetail(currentRow.value)
    } else {
      ElMessage.error(res.msg || '生成CDK失败')
    }
  } catch (error) {
    console.error('生成CDK失败:', error)
    ElMessage.error('生成CDK失败')
  } finally {
    generatingCDK.value = false
  }
}

const onCopy = (text) => {
  if (isSupported && copy(text)) {
    ElMessage.success('复制成功')
  } else {
    ElMessage.error('复制失败')
  }
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped lang="scss">
.statistics-list {
  .card-header {
    display: flex;
    align-items: center;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
      width: 100%;
      
      .date-picker-wrapper {
        width: 33.33%;
        
        :deep(.el-date-editor) {
          width: 100%;
          height: 40px;
          
          .el-input__wrapper {
            height: 40px;
          }
          
          .el-input__inner {
            height: 40px;
            line-height: 40px;
          }
        }
      }
    }
  }
  
  .detail-content {
    .cdk-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;

      h3 {
        margin-bottom: 15px;
        font-size: 16px;
        color: #333;
  }
  
  .cdk-info {
        .info-item {
          margin-bottom: 15px;
      
      label {
        display: inline-block;
            width: 100px;
        color: #666;
        font-weight: bold;
      }
      
          .balance {
            font-size: 20px;
            font-weight: bold;
            color: #F54C36;
          }
        }
      }
      }
      
    .cdk-result {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;

      h3 {
      margin-bottom: 15px;
        font-size: 16px;
        color: #333;
      }

      .password-list {
        max-height: 300px;
        overflow-y: auto;

        .password-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          margin-bottom: 10px;
          background-color: #f5f7fa;
          border-radius: 4px;
      
      span {
            font-family: monospace;
            font-size: 14px;
        color: #333;
          }
        }
      }
    }
  }
}
</style>
