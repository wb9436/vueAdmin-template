import request from '@/utils/request'

const BASE_URL = '/role'

export function getList(params) {
  return request({
    url: BASE_URL + '/list',
    method: 'get',
    params
  })
}

export function getRoleMenu(params) {
  return request({
    url: BASE_URL + '/roleMenu',
    method: 'get',
    params
  })
}

export function deleteRole(params) {
  return request({
    url: BASE_URL + '/delete',
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

