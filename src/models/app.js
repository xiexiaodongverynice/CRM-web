import { routerRedux } from 'dva/router';
import { parse } from 'qs';
import { message } from 'antd';
import _ from 'lodash';
import { hashHistory } from 'react-router';
import pathToRegexp from 'path-to-regexp';
import { config } from '../utils';
import * as appService from '../services/app';
import * as fieldDescribeService from '../services/object_page/fieldDescribeService';
import * as recordService from '../services/object_page/recordService';
import * as crmIntlService from '../services/crmIntlService';
import * as userPermissionUtil from '../utils/userPermissionUtil';
import * as userProfileUtil from '../utils/userProfileUtil';
import * as crmPowerSettingUtil from '../utils/crmPowerSettingUtil';
import * as crmIntlUtil from '../utils/crmIntlUtil';
import * as userService from '../services/userService';
import * as loginService from '../services/login';

import authUtil from '../utils/authUtil';
import { fetchParentSubs, fetchSubs } from '../helper';
import consoleUtil from '../utils/consoleUtil';

const { prefix } = config;
export default {
  namespace: 'App',
  state: {
    collapsed: false,
    user: {},
    menuPopoverVisible: false,
    siderFold: localStorage.getItem(`${prefix}siderFold`) === 'true',
    darkTheme: localStorage.getItem(`${prefix}darkTheme`) === 'true',
    isNavbar: document.body.clientWidth < 769,
    navOpenKeys: JSON.parse(localStorage.getItem(`${prefix}navOpenKeys`)) || [],
    menu: {},
    initLoading: false,
  },
  reducers: {
    menu(state, { payload: { menu, collapsed } }) {
      return { ...state, menu, collapsed };
    },
    showInitLoading(state) {
      return {
        ...state,
        initLoading: true,
      };
    },
    hideInitLoading(state) {
      return {
        ...state,
        initLoading: false,
      };
    },
  },
  effects: {
    *initSystemData({ payload, callBack }, { call, put }) {
      yield put({ type: 'showInitLoading' });

      consoleUtil.log('start initSystemData===>');

      consoleUtil.log('start loadDefaultLanguage.');

      const [defaultLanguageData, crmIntlData] = [
        yield call(crmIntlService.loadDefaultLanguage, {}),
        yield call(crmIntlService.loadCrmIntl, {}),
      ];
      consoleUtil.log(defaultLanguageData, crmIntlData);
      // const defaultLanguageData = yield call(crmIntlService.loadDefaultLanguage, {});
      // const crmIntlData = yield call(crmIntlService.loadCrmIntl, {});
      if (defaultLanguageData.success) {
        const result = _.get(defaultLanguageData, 'resultData');
        if (!_.isEmpty(result)) {
          // _.set(result, 'value', 'en_US');
          crmIntlUtil.changeCRM_INTL_TYPE(_.get(result, 'value', 'zh_CN'));
        }
      }
      consoleUtil.log('end loadDefaultLanguage.');

      consoleUtil.log('start loadCRMIntl.');
      if (crmIntlData.success) {
        const result = _.get(crmIntlData, 'resultData');
        crmIntlUtil.setIntlSetting(result);
      }
      consoleUtil.log('end loadCRMIntl.');

      consoleUtil.log('end initSystemData===>');

      yield put({ type: 'hideInitLoading' });
      consoleUtil.log('initSystemData success ,ready to go home');
      const { isRedirectHome = true } = payload || {};
      if (isRedirectHome) {
        yield put(routerRedux.push('/home'));
      }
    },

    *getMenu({ payload }, { call, put }) {
      const data = yield call(appService.loadMenu, payload);
      if (data.success === true) {
        yield put({
          type: 'menu',
          payload: { menu: _.get(data, 'items') },
        });
      }
    },

    *loadAllObject({ payload }, { call, put }) {
      // consoleUtil.log('start loadAllObject.');
      yield call(fieldDescribeService.loadAllObject, payload);
    },

    *loadCRMSetting({ payload }, { call, put }) {
      consoleUtil.log('start loadCRMSetting.');
      const profileId = userProfileUtil.getProfileId();
      if (!profileId) return;
      const crmpowerSettingPayload = {
        joiner: 'and',
        criterias: [{ field: 'profile', operator: '==', value: [profileId] }],
        orderBy: 'create_time',
        order: 'asc',
        objectApiName: 'crmpower_setting',
        pageSize: 1,
        pageNo: 1,
      };
      const data = yield call(recordService.queryRecordList, { dealData: crmpowerSettingPayload });
      if (data.success) {
        const result = _.get(data, 'resultData.result');
        crmPowerSettingUtil.setCrmpowerSetting(_.head(result));
        crmPowerSettingUtil.initGlobalWindowsVariables();
      }
      consoleUtil.log('end loadCRMSetting.');
    },
    *loadDefaultLanguage({ payload }, { call, put }) {
      consoleUtil.log('start loadDefaultLanguage.');

      const data = yield call(crmIntlService.loadDefaultLanguage, {});
      if (data.success) {
        const result = _.get(data, 'resultData');
        if (!_.isEmpty(result)) {
          // _.set(result, 'value', 'en_US');
          crmIntlUtil.changeCRM_INTL_TYPE(_.get(result, 'value', 'zh_CN'));
        }

        if (payload) {
          const { callback } = payload;
          if (callback) {
            callback();
          }
        }
      }
      consoleUtil.log('end loadDefaultLanguage.');
    },
    *loadCRMIntl({ payload }, { call, put }) {
      consoleUtil.log('start loadCRMIntl.');

      const data = yield call(crmIntlService.loadCrmIntl, {});
      if (data.success) {
        const result = _.get(data, 'resultData');
        crmIntlUtil.setIntlSetting(result);
        if (payload) {
          const { callback } = payload;
          if (callback) {
            callback();
          }
        }
      }
      consoleUtil.log('end loadCRMIntl.');
    },
    *loadTerritoryCustomerIds({ payload }, { call, put }) {
      consoleUtil.log('start loadTerritoryCustomerIds.');
      const userId = localStorage.getItem('userId');
      // 加载当前用户区域下的客户
      if (userId) {
        const data = yield call(userService.getTerritoryCustomerIds, { user_id: userId });
        if (data.success) {
          const resultData = data.resultData;
          localStorage.setItem(
            `territory_customer_ids_${userId}`,
            JSON.stringify(resultData.result || []),
          );
          if (payload) {
            const { callback } = payload;
            if (callback) {
              callback();
            }
          }
        }
      }
    },

    *logout({ payload }, { call, put }) {
      // clearLocalStorage();
      const token = localStorage.getItem('token');
      const from = localStorage.getItem('from');
      const portal_domain = localStorage.getItem('portal_domain');
      if (from === 'portal') {
        if (portal_domain !== 'undefined') {
          authUtil.cleanAllStorageButExclude();
          message.success(crmIntlUtil.fmtStr('message.logout success'));

          window.open(portal_domain, '_self');
        } else {
          message.error('登出地址解析失败');
          return false;
        }
      } else {
        authUtil.cleanAllStorageButExclude();
        message.success(crmIntlUtil.fmtStr('message.logout success'));
        yield call(loginService.logout, { token });
        hashHistory.push('/login');
      }
    },

    *loginWithToken({ payload }, { call, put }) {
      const { token } = payload;
      const data = yield call(loginService.loginWithToken, token);
      if (data.err && data.err instanceof Error) {
        window.logoutWhereToGo();
      }
      if (data.data.head.code === 200) {
        localStorage.setItem('token', token);
        const app_authorize = _.get(data.data.body, 'profile.app_authorize', []);
        localStorage.setItem('app_authorize', JSON.stringify(app_authorize));
        const userTerritoryList = data.data.body.userTerritoryList;
        if (userTerritoryList && userTerritoryList.length > 1) {
          localStorage.setItem('userTerritoryList', JSON.stringify(userTerritoryList));
          yield put(routerRedux.push('/choose_territory'));
        } else {
          yield loginService.fetchAndSetting(data, { payload }, { call, put });
          yield put({
            type: 'initSystemData',
            payload: {
              isRedirectHome: false,
            },
          });
          yield put({
            type: 'redirect/loginWithTokenSuccess',
            payload,
          });
        }
      } else {
        // message.error(data.data.head.msg);
        // return hashHistory.push('/login');
        window.logoutWhereToGo();
      }
    },
    *loginAsWithToken({ payload, callback }, { call, put }) {
      consoleUtil.log('loginAsWithToken==>');
      const response = yield call(loginService.loginAsWithToken, payload);
      consoleUtil.log(response);

      if (response.data.head.code === 200) {
        authUtil.backLicenseeAccount(); // 备份当前登录用户（被授权人）的store信息，方便下次可以直接切换回来，无需重新登录发送请求
        //
        const userId = response.data.body.userId;
        localStorage.setItem('token', response.data.head.token);
        localStorage.setItem('userId', response.data.body.userId);
        localStorage.setItem(
          'loginAsBy',
          JSON.stringify(_.get(response, 'data.body.loginAsBy', '{}')),
        );
        if (response.data.body.user_info) {
          localStorage.setItem('user_info', JSON.stringify(response.data.body.user_info));
        }
        //   window.FC_CRM_USERID = localStorage.getItem('userId');
        if (response.data.body.permission) {
          userPermissionUtil.setPermission(response.data.body.permission);
          userProfileUtil.setUerProfile(response.data.body.profile);
        }
        // 加载当前用户的下属
        consoleUtil.log('ready to init fetchSubs===>');
        yield fetchSubs({
          userId,
          saga: {
            call,
          },
        });
        consoleUtil.log('ready to init fetchParentSubs===>');
        yield fetchParentSubs({
          userId,
          saga: {
            call,
          },
        });
        message.success(
          crmIntlUtil.fmtStr('operation.switch_account_success', '账户数据初始化成功，切换成功'),
        );
        if (callback) {
          callback();
        }
      } else {
        message.error(response.data.head.msg);
      }
    },

    *doNothing() {
      yield 0;
    },
  },
  subscriptions: {
    // 路由监听器
    setup({ dispatch, history }) {
      // consoleUtil.log('路由监听');
      return history.listen(({ pathname, query }) => {
        const match = pathToRegexp('/login').exec(pathname);
        if (!match) {
          if (pathname === '/') {
            hashHistory.push('/home');
          } else if (
            pathname === '/reset_password' ||
            pathname === '/admin_login_as' ||
            pathname === '/redirect' ||
            pathname === '/choose_territory'
          ) {
            dispatch({ type: 'doNothing' });
          } else {
            dispatch({ type: 'getMenu' });
          }
        }
      });
    },
  },
};
