import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/company/list',
    method:'get',
    params:params
  })
}
export function fetchCstList(params) {
  return request({
    url:'/cstIncome/list',
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
    url:'/cstIncome/delete',
    method:'post',
    params:params
  })
}


export function upsertCstIncome(data) {
  return request({
    url:'/cstIncome/upsert',
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

