import request from '@/utils/request'

export function createId() {
  return request({
    url:'/product/createId',
    method:'get'
  })
}
