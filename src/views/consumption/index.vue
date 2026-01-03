<template>
  <div class="consumption-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>消费记录</span>
            <el-select
              v-model="filterUserId"
              placeholder="筛选用户"
              clearable
              filterable
              style="width: 200px; margin-left: 20px;"
              @change="handleFilterChange">
              <el-option
                v-for="user in userOptions"
                :key="user.userId"
                :label="user.nickName || user.userName"
                :value="user.userId" />
            </el-select>
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
          <div class="header-right">
            <div class="total-amount">
              <span class="label">消费金额汇总：</span>
              <span class="amount">{{ totalAmount.toFixed(2) }}元</span>
            </div>
          </div>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="recordList"
        style="width: 100%"
        :cell-style="{ padding: '16px 0' }">
        <el-table-column prop="avatar" label="用户" min-width="150">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-avatar :src="row.avatar || DEFAULT_AVATAR" :size="32" />
              <span>{{ row.nickName || row.userName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="类型" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.source === 1 ? 'success' : 'warning'">
              {{ row.source === 1 ? '开箱' : '对战' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="消费金额" min-width="150">
          <template #default="{ row }">
            <span style="color: #F54C36; font-weight: bold;">
              {{ row.amount ? row.amount.toFixed(2) : '0.00' }}元
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="消费时间" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="boxName" label="详情" min-width="150">
          <template #default="{ row }">
            <span v-if="row.source === 1">{{ row.boxName || '-' }}</span>
            <span v-else>对战ID: {{ row.fightId || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end;" />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="消费详情"
      width="600px">
      <div v-if="selectedRecord" class="detail-content">
        <div class="detail-item">
          <label>用户：</label>
          <span>{{ selectedRecord.nickName || selectedRecord.userName || '-' }}</span>
        </div>
        <div class="detail-item">
          <label>类型：</label>
          <el-tag :type="selectedRecord.source === 1 ? 'success' : 'warning'">
            {{ selectedRecord.source === 1 ? '开箱' : '对战' }}
          </el-tag>
        </div>
        <div class="detail-item">
          <label>消费金额：</label>
          <span>{{ selectedRecord.amount ? selectedRecord.amount.toFixed(2) : '0.00' }}元</span>
        </div>
        <div class="detail-item">
          <label>时间：</label>
          <span>{{ formatDate(selectedRecord.createTime) }}</span>
        </div>
        <div v-if="selectedRecord.source === 1" class="detail-item">
          <label>宝箱名称：</label>
          <span>{{ selectedRecord.boxName || '-' }}</span>
        </div>
        <div v-if="selectedRecord.source === 2" class="detail-item">
          <label>对战ID：</label>
          <span>{{ selectedRecord.fightId || '-' }}</span>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPromotionConsumptionRecords, getPromotionUsers } from '@/api/anchor'
import { DEFAULT_AVATAR } from '@/utils/constants'

const route = useRoute()

const loading = ref(false)
const recordList = ref([])
const userOptions = ref([])
const filterUserId = ref(null)
const dateRange = ref(null)
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const totalAmount = ref(0)
const showDetailDialog = ref(false)
const selectedRecord = ref(null)

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}

const getUserOptions = () => {
  getPromotionUsers(1, 1000).then(res => {
    if (res.code === 200) {
      userOptions.value = res.rows || []
    }
  })
}

const getRecordList = () => {
  loading.value = true
  getPromotionConsumptionRecords(pageNum.value, pageSize.value, filterUserId.value, dateRange.value).then(res => {
    if (res.code === 200) {
      // 新的响应结构：res.data 包含 pageData 和 totalAmount
      if (res.data) {
        recordList.value = res.data.pageData?.rows || []
        total.value = res.data.pageData?.total || 0
        totalAmount.value = res.data.totalAmount || 0
      } else {
        // 兼容旧格式（如果后端还没更新）
        recordList.value = res.rows || []
        total.value = res.total || 0
        totalAmount.value = 0
      }
    }
  }).catch(err => {
    ElMessage.error('获取消费记录失败')
  }).finally(() => {
    loading.value = false
  })
}

const handleFilterChange = () => {
  pageNum.value = 1
  getRecordList()
}

const handleDateRangeChange = () => {
  pageNum.value = 1
  getRecordList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
  getRecordList()
}

const handleCurrentChange = (val) => {
  pageNum.value = val
  getRecordList()
}

onMounted(() => {
  getUserOptions()
  
  // 如果URL中有userId参数，则筛选该用户
  if (route.query.userId) {
    filterUserId.value = parseInt(route.query.userId)
  }
  
  getRecordList()
})
</script>

<style scoped lang="scss">
.consumption-container {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
    font-size: 16px;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
      flex: 1;
      
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
    
    .header-right {
      display: flex;
      align-items: center;
      
      .total-amount {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: #f5f7fa;
        border-radius: 4px;
        
        .label {
          color: #606266;
          font-size: 14px;
        }
        
        .amount {
          color: #F54C36;
          font-weight: bold;
          font-size: 16px;
        }
      }
    }
  }
  
  .detail-content {
    .detail-item {
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      
      label {
        display: inline-block;
        width: 100px;
        color: #666;
        font-weight: bold;
      }
      
      span {
        color: #333;
      }
    }
  }
}
</style>

