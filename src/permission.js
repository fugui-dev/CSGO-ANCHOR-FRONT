import router from './router'
import { getToken } from './utils/auth'
import { useUserStore } from './store/user'
import { ElMessage } from 'element-plus'

const whiteList = ['/login'] // 白名单

router.beforeEach((to, from, next) => {
  const token = getToken()
  const userStore = useUserStore()
  
  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 检查用户信息是否已加载
      if (!userStore.userId) {
        userStore.getInfo().then(() => {
          // 检查是否为主播
          if (!userStore.isAnchor) {
            ElMessage.error('您不是主播，无法访问此系统')
            userStore.logout().then(() => {
              next('/login')
            })
          } else {
            next()
          }
        }).catch(() => {
          userStore.logout().then(() => {
            next('/login')
          })
        })
      } else {
        // 检查是否为主播
        if (!userStore.isAnchor) {
          ElMessage.error('您不是主播，无法访问此系统')
          userStore.logout().then(() => {
            next('/login')
          })
        } else {
          next()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
    }
  }
})

