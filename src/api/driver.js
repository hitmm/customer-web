import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/driverInfo/list',
    method:'get',
    params:params
  })
}

export function fetchCstList(params) {
  return request({
    url:'/carryDetail/list',
    method:'get',
    params:params
  })
}

export function doDelete(id) {
  let params = new URLSearchParams();
  params.append('id', id);
  return request({
    url:'/driverInfo/delete',
    method:'post',
    params:params
  })
}

export function doDeleteCstIncome(id) {
  let params = new URLSearchParams();
  params.append('id', id);
  return request({
    url:'/carryDetail/delete',
    method:'post',
    params:params
  })
}


export function upsertCstIncome(data) {
  return request({
    url:'/carryDetail/upsert',
    method:'post',
    data:data
  })
}

export function upsert(data) {
  return request({
    url:'/driverInfo/upsert',
    method:'post',
    data:data
  })
}

