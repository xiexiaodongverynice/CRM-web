import { routerRedux } from 'dva/router';
import { message } from 'antd';
import _ from 'lodash';
import * as loginService from '../services/login';
import * as userService from '../services/userService';
import * as fieldDescribeService from '../services/object_page/fieldDescribeService';
import * as userPermissionUtil from '../utils/userPermissionUtil';
import * as userProfileUtil from '../utils/userProfileUtil';
import * as crmIntlUtil from '../utils/crmIntlUtil';
import getLogo from '../services/logo';

export default {
  namespace: 'login',
  state: {
    loginLoading: false,
    errMessage: '',
  },
  effects: {
    *login({ payload, callBack }, { call, put }) {
      yield put({ type: 'showLoginLoading' });
      const data = yield call(loginService.login, payload);
      yield put({ type: 'hideLoginLoading' });
      if (data.data.head.code === 200) {
        yield put({ type: 'showLoginLoading' });
        message.success(crmIntlUtil.fmtStr('message.login success'));
        localStorage.setItem('token', data.data.head.token);
        const app_authorize = _.get(data.data.body, 'profile.app_authorize', []);
        localStorage.setItem('app_authorize', JSON.stringify(app_authorize));
        const userTerritoryList = data.data.body.userTerritoryList;
        if (userTerritoryList && userTerritoryList.length > 1) {
          localStorage.setItem('userTerritoryList', JSON.stringify(userTerritoryList));
          yield put(routerRedux.push('/choose_territory'));
          yield put({ type: 'hideLoginLoading' });
        } else {
          yield loginService.fetchAndSetting(data, { payload }, { call, put });
          if (callBack) callBack();
          localStorage.setItem('userTerritory', data.data.body.active_territory);
          window.CURRENT_ACTIVE_TERRITORY = localStorage.getItem('userTerritory');
          yield put({ type: 'hideLoginLoading' });
        }
        // yield fetchAndSetting(data, { payload }, { call, put });
        // yield put(routerRedux.push('/home'));
      } else {
        yield put({ type: 'showMessage', message: data.data.head.msg });
        // message.error(data.data.head.msg);
      }
    },
  },
  reducers: {
    showLoginLoading(state) {
      return {
        ...state,
        loginLoading: true,
        errMessage: '',
      };
    },
    hideLoginLoading(state) {
      return {
        ...state,
        loginLoading: false,
      };
    },
    showMessage(state, data) {
      return {
        ...state,
        loginLoading: false,
        errMessage: data.message,
      };
    },
  },
};
