import fetch from 'dva/fetch';
import * as userPermissionUtil from '../utils/userPermissionUtil';
import * as userProfileUtil from '../utils/userProfileUtil';
import * as crmPowerSettingUtil from '../utils/crmPowerSettingUtil';
import * as crmIntlUtil from '../utils/crmIntlUtil';

function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  if (options.method === 'POST' || options.method === 'PUT') {
    const value = options.body;
    options.body = JSON.stringify(value);
  }
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => ({ data }))
    .catch(err => ({ err }));
}

/**
 * 清除缓存
 */
// export const clearLocalStorage = () => {
//   const userId = localStorage.getItem('userId');
//   localStorage.removeItem(`RelatedCollect_${userId}_customer`);
//   localStorage.removeItem(`object_all_describe_${userId}`);
//   localStorage.removeItem('token');
//   localStorage.removeItem('userId');
//   localStorage.removeItem('loginName');
//   localStorage.removeItem('user_info');
//   localStorage.removeItem('loginAsBy');
//   localStorage.removeItem(`subordinates_${userId}`);
//   localStorage.removeItem(`parent_subordinates_${userId}`);
//   localStorage.removeItem(`subordinateResults_${userId}`);
//   localStorage.removeItem(`parent_subordinateResults_${userId}`);
//   localStorage.removeItem(`territory_customer_ids_${userId}`);
//   localStorage.removeItem('logo');
//
//   userProfileUtil.cleanLocalStorage();
//   userPermissionUtil.cleanLocalStorage();
//   crmPowerSettingUtil.cleanLocalStorage();
//   crmIntlUtil.cleanLocalStorage();
//
//   delete window.FC_CRM_USERID;
//   delete window.FC_CRM_SUBORDINATES;
//   delete window.FC_CRM_PARENT_SUBORDINATES;
//   delete window.FC_CRM_TERRITORY_CUSTOMER_IDS;
//   delete window.CALLBACK_FROM_STORE;
// };

/**
 * 登录前清除其他用户残留的信息，防止localstorage超出限制后，无法登录
 */
export const clearOtherLocalStoragesOfUsers = () => {
  _.range(0, localStorage.length).forEach(index => {
    const key = localStorage.key(index);
    if(_.startsWith(key, "object_all_describe_")) {
        localStorage.removeItem(key);
    }
  });
}
