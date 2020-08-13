import _ from 'lodash';
import request from '../utils/login';
import { ssoURL } from '../utils/config';

// 忘记密码
export function resetPassword(payload) {
  const url = `${ssoURL}/resetMyPwd`;
  return request(
    url, {
      method: 'POST',
      body: payload,
    });
}

// 修改密码
export function changePassword(payload) {
  const url = `${ssoURL}/updateMyPwd`;
  return request(
    url, {
      method: 'POST',
      body: payload,
    });
}
