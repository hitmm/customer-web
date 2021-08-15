import request from '@/utils/request'

export function createPrdId() {
  return request({
    url:'/providerInfo/createId',
    method:'get'
  })
}

export function fetchList(params) {
  return request({
    url:'/providerInfo/list',
    method:'get',
    params:params
  })
}

export function createPayId(count) {
  if(count == null){
    count = 2;
  }
  return request({
    url:'/providerPay/createId?count='+count,
    method:'get',
  })
}

export function fetchItemList(params) {
  return request({
    url:'/providerPay/list',
    method:'get',
    params:params
  })
}

export function doDeleteProvider(id) {
  let params = new URLSearchParams();
  params.append('id', id);
  return request({
    url:'/providerInfo/delete',
    method:'post',
    params:params
  })
}

export function doDeleteItem(id) {
  let params = new URLSearchParams();
  params.append('id', id);
  return request({
    url:'/providerPay/delete',
    method:'post',
    params:params
  })
}

export function upsertIncome(data) {
  return request({
    url:'/providerPay/incomeUpsert',
    method:'post',
    data:data
  })
}

export function upsertOutcome(data) {
  return request({
    url:'/providerPay/outcomeUpsert',
    method:'post',
    data:data
  })
}

export function upsert(data) {
  return request({
    url:'/providerInfo/upsert',
    method:'post',
    data:data
  })
}

