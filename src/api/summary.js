import request from '@/utils/request'
export function fetchDetail() {
  return request({
    url:'/summary/detailInfo',
    method:'get'
  })
}

export function fetchInfo(params) {
  return request({
    url:'/summary/info',
    method:'get',
    params:params
  })
}

