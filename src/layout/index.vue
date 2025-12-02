<template>
  <div class="app-wrapper">
    <div class="sidebar-container">
      <div class="logo">
        <h2>主播管理系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF">
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <span>每日统计</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>推荐用户列表</span>
        </el-menu-item>
        <el-menu-item index="/consumption">
          <el-icon><List /></el-icon>
          <span>消费记录</span>
        </el-menu-item>
        <el-menu-item index="/cdk">
          <el-icon><Document /></el-icon>
          <span>CDK列表</span>
        </el-menu-item>
        <el-menu-item index="/performance">
          <el-icon><TrendCharts /></el-icon>
          <span>业绩提取记录</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="main-container">
      <div class="navbar">
        <div class="navbar-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <img :src="userStore.avatar || DEFAULT_AVATAR" class="avatar" />
              <span>{{ userStore.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="app-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { House, User, List, Document, TrendCharts, ArrowDown } from '@element-plus/icons-vue'
import { DEFAULT_AVATAR } from '@/utils/constants'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => {
  const { path } = route
  return path
})

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout().then(() => {
        router.push('/login')
      })
    })
  }
}
</script>

<style scoped lang="scss">
.app-wrapper {
  display: flex;
  height: 100vh;
  
  .sidebar-container {
    width: 200px;
    background-color: #304156;
    
    .logo {
      height: 60px;
      line-height: 60px;
      text-align: center;
      background-color: #2b2f3a;
      
      h2 {
        color: #fff;
        font-size: 18px;
        margin: 0;
      }
    }
    
    .sidebar-menu {
      border: none;
      height: calc(100vh - 60px);
      overflow-y: auto;
    }
  }
  
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .navbar {
      height: 60px;
      background-color: #fff;
      box-shadow: 0 1px 4px rgba(0,21,41,.08);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 20px;
      
      .navbar-right {
        .user-info {
          display: flex;
          align-items: center;
          cursor: pointer;
          
          .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-right: 8px;
          }
        }
      }
    }
    
    .app-main {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background-color: #f5f5f5;
    }
  }
}
</style>

