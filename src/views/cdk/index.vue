<template>
  <div class="cdk-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>CDK列表</span>
        </div>
      </template>

      <el-form :model="queryParams" :inline="true" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" @change="handleQuery" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="未使用" value="0" />
            <el-option label="已使用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="cdkList"
        stripe
        style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="password" label="卡密" min-width="200">
          <template #default="{ row }">
            <div class="password-cell">
              <span class="password-text">{{ row.password }}</span>
              <el-button type="text" size="small" @click="onCopy(row.password)">复制</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="金额" width="120">
          <template #default="{ row }">
            {{ formatMoney(row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'info'">
              {{ row.status === '1' ? '已使用' : '未使用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="useTime" label="使用时间" width="180">
          <template #default="{ row }">
            {{ row.useTime ? formatDateTime(row.useTime) : '-' }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useClipboard } from '@vueuse/core'
import { getRechargeCardList } from '@/api/anchor'

const { copy, isSupported } = useClipboard()

const loading = ref(false)
const cdkList = ref([])
const total = ref(0)

const queryParams = ref({
  page: 1,
  size: 20,
  status: ''
})

const formatMoney = (amount) => {
  if (!amount) return '0.00'
  return parseFloat(amount).toFixed(2)
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const d = new Date(dateTime)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const loadCdkList = async () => {
  loading.value = true
  try {
    const res = await getRechargeCardList(
      queryParams.value.page,
      queryParams.value.size,
      queryParams.value.status || undefined
    )
    if (res.code === 200) {
      cdkList.value = res.rows || []
      total.value = res.total || 0
    } else {
      ElMessage.error(res.msg || '获取CDK列表失败')
    }
  } catch (error) {
    console.error('获取CDK列表失败:', error)
    ElMessage.error('获取CDK列表失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.value.page = 1
  loadCdkList()
}

const resetQuery = () => {
  queryParams.value = {
    page: 1,
    size: 20,
    status: ''
  }
  loadCdkList()
}

const handleSizeChange = (size) => {
  queryParams.value.size = size
  queryParams.value.page = 1
  loadCdkList()
}

const handlePageChange = (page) => {
  queryParams.value.page = page
  loadCdkList()
}

const onCopy = (text) => {
  if (isSupported && copy(text)) {
    ElMessage.success('复制成功')
  } else {
    ElMessage.error('复制失败')
  }
}

onMounted(() => {
  loadCdkList()
})
</script>

<style scoped lang="scss">
.cdk-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .password-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .password-text {
      font-family: monospace;
      font-size: 14px;
      color: #333;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

