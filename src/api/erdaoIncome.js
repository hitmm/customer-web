import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/erdaoManage/list',
    method:'get',
    params:params
  })
}

export function fetchCstList(params) {
  return request({
    url:'/erdaoIncome/list',
    method:'get',
    params:params
  })
}

export function doDelete(id) {
  let params = new URLSearchParams();
  params.append('id', id);
  return request({
    url:'/erdaoManage/delete',
    method:'post',
    params:params
  })
}

export function doDeleteCstIncome(id) {
  let params = new URLSearchParams();
  params.append('id', id);
  return request({
    url:'/erdaoIncome/delete',
    method:'post',
    params:params
  })
}


export function upsertCstIncome(data) {
  return request({
    url:'/erdaoIncome/upsert',
    method:'post',
    data:data
  })
}

export function upsert(data) {
  return request({
    url:'/erdaoManage/upsert',
    method:'post',
    data:data
  })
}

