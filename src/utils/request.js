import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken } from './auth'
import { useUserStore } from '@/store/user'
import router from '@/router'

// 创建axios实例
const service = axios.create({
  baseURL: '/prod-api', // api的base_url
  timeout: 30000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的状态码不是200，则视为错误
    if (res.code !== 200) {
      ElMessage({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      
      // 50008: 非法的token; 50012: 其他客户端登录了; 50014: Token 过期了;
      if (res.code === 401 || res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // 重新登录
        ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 点击重新登录
          const userStore = useUserStore()
          userStore.resetToken().then(() => {
            router.push('/login')
          })
        }).catch(() => {
          // 点击取消，也跳转到登录页
          const userStore = useUserStore()
          userStore.resetToken().then(() => {
            router.push('/login')
          })
        })
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error)
    
    // 处理 HTTP 状态码 401（未授权）
    if (error.response && error.response.status === 401) {
      ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 点击重新登录
        const userStore = useUserStore()
        userStore.resetToken().then(() => {
          router.push('/login')
        })
      }).catch(() => {
        // 点击取消，也跳转到登录页
        const userStore = useUserStore()
        userStore.resetToken().then(() => {
          router.push('/login')
        })
      })
    } else {
      ElMessage({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
    }
    
    return Promise.reject(error)
  }
)

export default service

