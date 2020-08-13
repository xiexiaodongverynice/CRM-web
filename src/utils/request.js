import axios from 'axios';
import qs from 'qs';
import jsonp from 'jsonp';
import lodash from 'lodash';
import pathToRegexp from 'path-to-regexp';
import { hashHistory } from 'dva/router';
// import { message } from 'antd';
import * as message from '../services/msg';
import * as crmIntlUtil from './crmIntlUtil';
import { YQL, CORS, MOCK, baseURL, FS } from './config';

axios.defaults.baseURL = baseURL;

const defaultConfig = {
  timeout: 300000,
};

const fetch = (options) => {
  const header = {
    'content-type': 'application/json;charset=UTF-8',
    'Accept-Language': lodash.replace(window.APP_INTL_TYPE, '_', '-'),
  };
  const { method = 'get', fetchType } = options;
  const { data } = options;
  let url = options.url;

  const finalConfig = Object.assign({}, defaultConfig, options);
  const cloneData = lodash.cloneDeep(data);

  try {
    let domin = '';
    if (url.match(/[a-zA-z]+:\/\/[^/]*/)) {
      domin = url.match(/[a-zA-z]+:\/\/[^/]*/)[0];
      url = url.slice(domin.length);
    }
    const match = pathToRegexp.parse(url);
    url = pathToRegexp.compile(url)(data);
    for (const item of match) {
      if (item instanceof Object && item.name in cloneData) {
        delete cloneData[item.name];
      }
    }
    url = domin + url;
  } catch (e) {
    message.error(e.message);
  }

  // if (fetchType === 'JSONP') {
  //   return new Promise((resolve, reject) => {
  //     jsonp(url, {
  //       param: `${qs.stringify(data)}&callback`,
  //       name: `jsonp_${new Date().getTime()}`,
  //       timeout: 4000,
  //     }, (error, result) => {
  //       if (error) {
  //         reject(error);
  //       }
  //       resolve({ statusText: 'OK', status: 200, data: result });
  //     });
  //   });
  // } else if (fetchType === 'YQL') {
  //   url = `http://query.yahooapis.com/v1/public/yql?q=select * from json where url='${options.url}?${qs.stringify(options.data)}'&format=json`;
  //   data = null;
  // } else if (fetchType === 'MOCK') {
  //   url = options.url;
  //   data = null;
  // }
  if (fetchType === 'FS') {
    axios.defaults.baseURL = '';
  } else {
    axios.defaults.baseURL = baseURL;
  }
  const value = {};
  value.head = { token: localStorage.getItem('token') };
  value.body = cloneData;
  console.log('values ======>', value);
  const bodyData = JSON.stringify(value);
  const paramsData = lodash.defaults(cloneData, value.head);
  switch (method.toLowerCase()) {
    case 'get':
      return axios.get(url, {
        params: paramsData,
        // 28/02/2018 - TAG: headers放到这里才会被传递
        headers: header,
        timeout: finalConfig.timeout,
      });
    case 'delete':
      url = `${url}?token=${value.head.token}`;
      return axios.delete(
        url,
        {
          data: paramsData,
        },
        { headers: header, timeout: finalConfig.timeout },
      );
    case 'post':
      return axios.post(url, bodyData, { headers: header, timeout: finalConfig.timeout });
    case 'put':
      return axios.put(url, bodyData, { headers: header, timeout: finalConfig.timeout });
    case 'patch':
      return axios.patch(url, bodyData, { headers: header, timeout: finalConfig.timeout });
    default:
      return axios(options, { headers: header, timeout: finalConfig.timeout });
  }
};

export default function request(options) {
  // debugger;
  if (options.url && options.url.indexOf('//') > -1) {
    const origin = `${options.url.split('//')[0]}//${options.url.split('//')[1].split('/')[0]}`;
    if (window.location.origin !== origin) {
      if (CORS && CORS.indexOf(origin) > -1) {
        lodash.set(options, 'fetchType', 'CORS');
      }
      if (MOCK && MOCK.indexOf(origin) > -1) {
        lodash.set(options, 'fetchType', 'MOCK');
      } else if (YQL && YQL.indexOf(origin) > -1) {
        lodash.set(options, 'fetchType', 'YQL');
      } else if (FS && (origin.indexOf(FS) > -1 || FS.indexOf(origin) > -1)) {
        lodash.set(options, 'fetchType', 'FS');
      } else {
        // lodash.set(options, 'fetchType', 'JSONP');
      }
    }
  }

  return fetch(options)
    .then((response) => {
      const { status } = response;
      const data =
        options.fetchType === 'YQL' ? response.data.query.results.json : response.data.body;

      if (response.data) {
        if (options.fetchType === 'FS') {
          return {
            success: true,
            message: 'success',
            status: response.status,
            resultData: response.data,
          };
        } else {
          if (response.data.head.code === 200 || response.data.head.code === 201) {
            return {
              success: true,
              message: response.data.head.msg,
              status,
              ...data,
              resultData: data,
            };
          } else if (response.data.head.code === 401) {
            message.error('用户登录信息过期或未登录，请重新登录！', 3);
            // hashHistory.push('/login');
            window.logoutWhereToGo();
            return { success: false, message: response.data.head.msg };
          } else if (response.data.head.code === 400 || response.data.head.code === 500) {
            message.error(response.data.head.msg);
            return { success: false, message: response.data.head.msg };
          } else {
            message.error('与服务器通讯失败，请刷新页面或联系管理员');
            return { success: false };
          }
        }
      }
    })
    .catch((error) => {
      const { response, code } = error;
      let msg;
      let status;
      let otherData = {};

      if (response) {
        const { data, statusText } = response;
        otherData = data;
        status = response.status;
        msg = data.message || statusText;
      } else {
        status = 600;
        msg = 'Network Error';
      }

      if (lodash.isEqual(code, 'ECONNABORTED')) {
        msg = lodash.get(error, 'message');
        /**
         * 网络请求超时
         */
        if (lodash.indexOf(msg, 'timeout of')) {
          msg = crmIntlUtil.fmtWithTemplate(
            'message.http_timeout',
            '服务接口请求超时,最长请求时间限制:{{timeout}}ms',
            { timeout: defaultConfig.timeout },
          );
        }
        message.error(msg);
      }
      return { success: false, status, message: msg, ...otherData, resultData: otherData };
    });
}
