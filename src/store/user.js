import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { login, getInfo, logout } from '@/api/login'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    name: '',
    avatar: '',
    userId: null,
    userType: null
  }),
  
  getters: {
    isAnchor: (state) => {
      return state.userType === '01'
    }
  },
  
  actions: {
    // 登录
    login(userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      return new Promise((resolve, reject) => {
        login(username, password).then(response => {
          const token = response.token
          setToken(token)
          this.token = token
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          const data = response.data
          if (!data) {
            reject('验证失败，请重新登录')
          }
          
          // 检查是否为主播
          if (data.userType !== '01') {
            ElMessage.error('您不是主播，无法访问此系统')
            reject('权限不足')
            return
          }
          
          this.name = data.userName || data.nickName
          this.avatar = data.avatar
          this.userId = data.userId
          this.userType = data.userType
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    
    // 退出登录
    logout() {
      return new Promise((resolve, reject) => {
        logout().then(() => {
          this.token = ''
          this.name = ''
          this.avatar = ''
          this.userId = null
          this.userType = null
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    
    // 重置token
    resetToken() {
      return new Promise(resolve => {
        this.token = ''
        this.name = ''
        this.avatar = ''
        this.userId = null
        this.userType = null
        removeToken()
        resolve()
      })
    }
  }
})

