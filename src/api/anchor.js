import request from '@/utils/request'

// 获取推荐用户列表
export function getPromotionUsers(page, size) {
  return request({
    url: `/api/user/promotionUsers/${page}/${size}`,
    method: 'get'
  })
}

// 获取推荐用户消费记录（开箱+对战）
export function getPromotionConsumptionRecords(page, size, userId = null, dateRange = null) {
  const params = {
    page,
    size
  }
  if (userId) {
    params.userId = userId
  }
  if (dateRange && dateRange.length === 2) {
    params.startDate = dateRange[0]
    params.endDate = dateRange[1]
  }
  return request({
    url: '/api/user/promotionConsumptionRecords',
    method: 'get',
    params
  })
}

// 获取可用余额
export function getAvailableBalance() {
  return request({
    url: '/api/user/availableBalance',
    method: 'get'
  })
}

// 生成CDK信息
export function generateCardInfo() {
  return request({
    url: '/api/user/generateCardInfo',
    method: 'post'
  })
}

// 创建CDK（根据所有未使用的消费记录自动生成）
export function createGenerateCard() {
  return request({
    url: '/api/user/createGenerateCard',
    method: 'post',
    data: {}
  })
}

// 获取统计数据
export function getPromotionStatistics() {
  return request({
    url: '/api/user/promotionStatistics',
    method: 'get'
  })
}

// 获取主播每日统计数据列表
export function getAnchorDailyStatistics(startDate, endDate) {
  return request({
    url: '/api/user/anchorDailyStatistics',
    method: 'get',
    params: {
      startDate,
      endDate
    }
  })
}

// 获取指定日期的可用CDK余额
export function getAvailableCdkBalance(statDate) {
  return request({
    url: '/api/user/availableCdkBalance',
    method: 'get',
    params: {
      statDate
    }
  })
}

// 生成CDK（支持自定义数量和金额）
export function createGenerateCardCustom(data) {
  return request({
    url: '/api/user/createGenerateCardCustom',
    method: 'post',
    data
  })
}

// 获取CDK列表
export function getRechargeCardList(page, size, status) {
  return request({
    url: '/api/user/rechargeCardList',
    method: 'get',
    params: {
      page,
      size,
      status
    }
  })
}

// 获取业绩提取记录列表
export function getAnchorPerformanceExtractRecords() {
  return request({
    url: '/api/user/anchorPerformanceExtractRecords',
    method: 'get'
  })
}

