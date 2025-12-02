<template>
  <div class="performance-extract-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>业绩提取记录</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="extractRecords"
        stripe
        style="width: 100%">
        <el-table-column prop="createTime" label="提取时间" min-width="160" fixed="left">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="extractType" label="提取类型" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.extractType === 1 ? 'success' : 'warning'">
              {{ row.extractType === 1 ? '流水业绩' : '充值业绩' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="extractAmount" label="提取金额" min-width="120">
          <template #default="{ row }">
            <span class="extract-amount">{{ formatMoney(row.extractAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="statDateStart" label="统计开始日期" min-width="140">
          <template #default="{ row }">
            {{ formatDate(row.statDateStart) }}
          </template>
        </el-table-column>
        <el-table-column prop="statDateEnd" label="统计结束日期" min-width="140">
          <template #default="{ row }">
            {{ formatDate(row.statDateEnd) }}
          </template>
        </el-table-column>
        <el-table-column prop="finalCredits" label="提取后弹药余额" min-width="140">
          <template #default="{ row }">
            {{ formatMoney(row.finalCredits) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAnchorPerformanceExtractRecords } from '@/api/anchor'

const loading = ref(false)
const extractRecords = ref([])

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formatMoney = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return parseFloat(amount).toFixed(2)
}

const loadExtractRecords = async () => {
  loading.value = true
  try {
    const res = await getAnchorPerformanceExtractRecords()
    if (res.code === 200) {
      extractRecords.value = res.data || []
    } else {
      ElMessage.error(res.msg || '获取提取记录失败')
    }
  } catch (error) {
    console.error('获取提取记录失败:', error)
    ElMessage.error('获取提取记录失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadExtractRecords()
})
</script>

<style scoped lang="scss">
.performance-extract-list {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .extract-amount {
    color: #67C23A;
    font-weight: bold;
    font-size: 16px;
  }
}
</style>

