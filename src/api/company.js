import request from '@/utils/request'
export function createComId() {
  return request({
    url:'/company/createId',
    method:'get'
  })
}
export function createCustomerIncomeId() {
  return request({
    url:'/customer/createId',
    method:'get'
  })
}
export function fetchList(params) {
  return request({
    url:'/company/list',
    method:'get',
    params:params
  })
}

export function fetchCstList(params) {
  return request({
    url:'/customer/list',
    method:'get',
    params:params
  })
}

export function getTodayMoney(params) {
  return request({
    url:'/company/list',
    method:'get',
    params:params
  })
}

export function doDelete(id) {
  let params = new URLSearchParams();
  params.append('id', id);
  return request({
    url:'/company/delete',
    method:'post',
    params:params
  })
}

export function doDeleteCstIncome(id) {
  let params = new URLSearchParams();
  params.append('id', id);
  return request({
    url:'/customer/delete',
    method:'post',
    params:params
  })
}


export function upsertCstIncome(data) {
  return request({
    url:'/customer/upsert',
    method:'post',
    data:data
  })
}

export function upsert(data) {
  return request({
    url:'/company/upsert',
    method:'post',
    data:data
  })
}

