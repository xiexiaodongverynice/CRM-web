import _ from 'lodash';
import request from '../utils/login';
import { ssoURL } from '../utils/config';
import * as loginService from '../services/login';
import * as userService from '../services/userService';
import * as fieldDescribeService from '../services/object_page/fieldDescribeService';
import * as userPermissionUtil from '../utils/userPermissionUtil';
import * as userProfileUtil from '../utils/userProfileUtil';
import * as crmIntlUtil from '../utils/crmIntlUtil';
import consoleUtil from '../utils/consoleUtil';
import getLogo from '../services/logo';
import { fetchSubs, fetchParentSubs } from '../helper';
// import storageUtil from '../utils/storageUtil';

const userAgent = window.navigator.userAgent,
  rMsie = /(msie\s|trident.*rv:)([\w.]+)/,
  rFirefox = /(firefox)\/([\w.]+)/,
  rOpera = /(opera).+version\/([\w.]+)/,
  rChrome = /(chrome)\/([\w.]+)/,
  rSafari = /version\/([\w.]+).*(safari)/;
function uaMatch(ua) {
  let match = rMsie.exec(ua);
  if (match != null) {
    return { browser: 'IE', version: match[2] || '0' };
  }
  match = rFirefox.exec(ua);
  if (match != null) {
    return { browser: match[1] || '', version: match[2] || '0' };
  }
  match = rOpera.exec(ua);
  if (match != null) {
    return { browser: match[1] || '', version: match[2] || '0' };
  }
  match = rChrome.exec(ua);
  if (match != null) {
    return { browser: match[1] || '', version: match[2] || '0' };
  }
  match = rSafari.exec(ua);
  if (match != null) {
    return { browser: match[2] || '', version: match[1] || '0' };
  }
  if (match != null) {
    return { browser: '', version: '0' };
  }
}

export function login(values) {
  const browserMatch = uaMatch(userAgent.toLowerCase());
  _.set(values, 'deviceType', 'PC');
  _.set(values, 'browserType', browserMatch.browser);
  _.set(values, 'browserVersion', browserMatch.version);
  return request(`${ssoURL}/login`, {
    method: 'POST',
    body: values,
  });
}

export function change_territory(values) {
  const token = localStorage.getItem('token');
  return request(`${ssoURL}/change_auth_territory`, {
    method: 'POST',
    body: {
      body: values,
      head: {
        token,
      },
    },
  });
}

export function loginAs(value) {
  const browserMatch = uaMatch(userAgent.toLowerCase());
  _.set(value, 'deviceType', 'PC');
  _.set(value, 'browserType', browserMatch.browser);
  _.set(value, 'browserVersion', browserMatch.version);
  return request(`${ssoURL}/loginAs`, {
    method: 'POST',
    body: {
      body: value,
    },
  });
}

/**
 * 通过token进行登录
 * @param {token} token
 */
export function loginWithToken(token) {
  const browserMatch = uaMatch(userAgent.toLowerCase());
  return request(`${ssoURL}/loginWithToken`, {
    method: 'POST',
    body: {
      deviceType: 'PC',
      browserType: browserMatch.browser,
      browserVersion: browserMatch.version,
    },
    headers: {
      token,
    },
  });
}

/**
 * 通过token进行登录授权人账户
 * @param {token} token
 */
export function loginAsWithToken(payload) {
  const { licensor } = payload;
  const token = localStorage.getItem('token');
  const browserMatch = uaMatch(userAgent.toLowerCase());
  return request(`${ssoURL}/loginAsWithToken`, {
    method: 'POST',
    body: {
      body: {
        deviceType: 'PC',
        browserType: browserMatch.browser,
        browserVersion: browserMatch.version,
        loginAsName: licensor,
      },
      head: {
        token,
      },
    },
  });
}

export async function logout(params) {
  const userLogout = `${ssoURL}/logout`;
  return request(userLogout, {
    method: 'POST',
    body: {
      body: params
    }
  });
}

export function* fetchAndSetting(data, { payload }, { put, call }) {
  consoleUtil.log('start fetchAndSetting==>');
  const userId = data.data.body.userId;
  localStorage.removeItem(`object_all_describe_${userId}`);
  localStorage.setItem('userId', userId);
  if (data.data.body.loginAsBy) {
    localStorage.setItem('loginAsBy', JSON.stringify(data.data.body.loginAsBy));
  }
  if (data.data.body.user_info ? data.data.body.user_info.account : false) {
    localStorage.setItem('loginName', data.data.body.user_info.account);
  }
  if (data.data.body.user_info) {
    localStorage.setItem('user_info', JSON.stringify(data.data.body.user_info));
  }
  window.FC_CRM_USERID = localStorage.getItem('userId');
  if (data.data.body.permission) {
    userPermissionUtil.setPermission(data.data.body.permission);
    userProfileUtil.setUerProfile(data.data.body.profile);
  }

  const objectAllDescribe = yield call(fieldDescribeService.loadAllObject, payload);
  if (objectAllDescribe.status === 200) {
    // const userId = localStorage.getItem('userId');
    window.objectAllDescribe = JSON.stringify(objectAllDescribe);
    localStorage.setItem(`object_all_describe_${userId}`, JSON.stringify(objectAllDescribe));
  }

  yield put({ type: 'App/loadCRMSetting' });

  // 加载当前用户的下属
  yield fetchSubs({
    userId,
    saga: {
      call,
    },
  });

  yield fetchParentSubs({
    userId,
    saga: {
      call,
    },
  });
  // // 加载当前用户区域下的客户
  // const territoryCustomerIds = yield call(userService.getTerritoryCustomerIds, {user_id: userId});
  // if(territoryCustomerIds.status === 200) {
  //   localStorage.setItem(`territory_customer_ids_${userId}`, JSON.stringify(territoryCustomerIds.result || []))
  // }

  // 获取logo
  const logo = yield call(getLogo, { apiName: 'logo_setting' });
  if (logo.status === 200) {
    if (_.has(logo, 'value')) {
      localStorage.setItem('logo', logo.value);
    }
  }

  yield put({ type: 'App/loadTerritoryCustomerIds' }); // 2018-02-05 14点52分 后台处理这块内容，去掉

  consoleUtil.log('end fetchAndSetting==>');
  // yield put({ type: 'App/loadDefaultLanguage' });
  // yield put({ type: 'App/loadCRMIntl' });
}
