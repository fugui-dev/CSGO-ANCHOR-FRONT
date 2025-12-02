import request from '@/utils/request'

// 登录
export function login(username, password) {
  const data = {
    username,
    password
  }
  return request({
    url: '/api/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getInfo() {
  return request({
    url: '/api/getInfo',
    method: 'get'
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/api/logout',
    method: 'post'
  })
}

