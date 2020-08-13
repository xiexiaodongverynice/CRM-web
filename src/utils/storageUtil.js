import _ from 'lodash';
// import * as userPermissionUtil from './userPermissionUtil';
// import * as userInfoUtil from './userInfoUtil';
// import * as userProfileUtil from './userProfileUtil';

function initLoginLocalStorage(response) {
  // const { resultData, token } = response;
  // set('token', token);
  // set('__USER__ID__', resultData.userId);
  // if (resultData.permission) {
  //   userPermissionUtil.setPermission(resultData.permission);
  //   userProfileUtil.setUerProfile(resultData.profile);
  //   userInfoUtil.setUerInfo(resultData.user_info);
  // }

  // localStorage.setItem('token', result.token);
  // localStorage.setItem('userInfo', JSON.stringify(_.get(result, 'resultData.userInfo', {})));
  // localStorage.setItem('userId', _.get(result, 'resultData.userInfo.id'));
}
function cleanLoginLocalStorage() {
  clear();
  // userPermissionUtil.cleanLocalStorage();
  // userProfileUtil.cleanLocalStorage();
  // userInfoUtil.cleanLocalStorage();
  // localStorage.removeItem('token');
  // localStorage.removeItem('userInfo');
  // localStorage.removeItem('userId');
}


function get(key, defaultValue = null) {
  const value = localStorage.getItem(key);
  return value !== null && value !== '' ? JSON.parse(value) : defaultValue;
}


function set(key, value) {
  return localStorage.setItem(key, JSON.stringify(value));
}
function clear() {
  return localStorage.clear();
}

function remove(key) {
  return localStorage.removeItem(key);
}

function multiGet(...keys) {
}

function multiRemove(...keys) {
}

export default {
  initLoginLocalStorage,
  cleanLoginLocalStorage,
  clear,
  get,
  set,
  remove,
  multiGet,
  multiRemove
};
