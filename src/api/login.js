import request from '@/utils/request'

const BASE_URL = '/user'

export function login(username, password) {
  return request({
    url: BASE_URL + '/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function getInfo(token) {
  return request({
    url: BASE_URL + '/info',
    method: 'get',
    params: { token }
  })
}

export function logout(token) {
  return request({
    url: BASE_URL + '/logout',
    method: 'post',
    params: { token }
  })
}
