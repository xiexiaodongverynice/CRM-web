import { config, request } from '../utils';

const { api } = config;

const { security_check } = api;

// 获取列表
export function fetchByCurrentUser() {
  const url = `${security_check}/currentUser`;
  return request(
    { url
      // data: {}
    });
}
