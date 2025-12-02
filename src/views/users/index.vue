<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>推荐用户列表</span>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%">
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar || DEFAULT_AVATAR" />
          </template>
        </el-table-column>
        <el-table-column prop="nickName" label="昵称" />
        <el-table-column prop="userName" label="用户名" />
        <el-table-column prop="promotionTime" label="推荐时间">
          <template #default="{ row }">
            {{ formatDate(row.promotionTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewConsumption(row)">查看消费</el-button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPromotionUsers } from '@/api/anchor'
import { DEFAULT_AVATAR } from '@/utils/constants'

const router = useRouter()

const loading = ref(false)
const userList = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}

const getUserList = () => {
  loading.value = true
  getPromotionUsers(pageNum.value, pageSize.value).then(res => {
    if (res.code === 200) {
      userList.value = res.rows || []
      total.value = res.total || 0
    }
  }).catch(err => {
    ElMessage.error('获取用户列表失败')
  }).finally(() => {
    loading.value = false
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
  getUserList()
}

const handleCurrentChange = (val) => {
  pageNum.value = val
  getUserList()
}

const viewConsumption = (user) => {
  router.push({
    path: '/consumption',
    query: { userId: user.userId }
  })
}

onMounted(() => {
  getUserList()
})
</script>

<style scoped lang="scss">
.users-container {
  .card-header {
    font-weight: bold;
    font-size: 16px;
  }
}
</style>

