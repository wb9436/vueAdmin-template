import request from '@/utils/request'

const BASE_URL = '/user'

export function getList(params) {
  return request({
    url: BASE_URL + '/list',
    method: 'get',
    params
  })
}

export function modifyStatus(params) {
  return request({
    url: BASE_URL + '/modifyStatus',
    method: 'post',
    params
  })
}

export function deleteUser(params) {
  return request({
    url: BASE_URL + '/delete',
    method: 'post',
    params
  })
}

export function resetPwd(params) {
  return request({
    url: BASE_URL + '/resetPwd',
    method: 'post',
    params
  })
}

export function addData(params) {
  return request({
    url: BASE_URL + '/add',
    method: 'post',
    params
  })
}

export function updateData(params) {
  return request({
    url: BASE_URL + '/update',
    method: 'post',
    params
  })
}

