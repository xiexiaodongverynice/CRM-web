import { routerRedux } from 'dva/router';
import _ from 'lodash';
import { message } from 'antd';
import * as loginService from '../services/login';
import * as userPermissionUtil from '../utils/userPermissionUtil';
import * as userProfileUtil from '../utils/userProfileUtil';
import * as fieldDescribeService from '../services/object_page/fieldDescribeService';
import * as userService from '../services/userService';
import getLogo from '../services/logo';
import { fetchSubs, fetchParentSubs } from '../helper';
import * as crmIntlUtil from '../utils/crmIntlUtil';
import consoleUtil from '../utils/consoleUtil';

export default {
  namespace: 'admin_login_as',
  state: {
    loginLoading: false,
    errMessage: '',
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
  effects: {
    *loginAs({ payload, callBack }, { call, put }) {
      consoleUtil.debug('loginAs', payload);
      yield put({ type: 'showLoginLoading' });
      const data = yield call(loginService.loginAs, payload);
      yield put({ type: 'hideLoginLoading' });
      if (data.data.head.code === 200) {
        // message.success('欢迎回来');
        // localStorage.setItem('token', data.data.head.token);
        // localStorage.setItem('userId', data.data.body.userId);
        // localStorage.setItem('loginAsBy', JSON.stringify(_.get(data, 'data.body.loginAsBy', '{}')));
        // localStorage.setItem('user_info', JSON.stringify(data.data.body.user_info));
        // localStorage.setItem('loginName', data.data.body.user_info.account);
        // window.FC_CRM_USERID = localStorage.getItem('userId');
        // if (data.data.body.permission) {
        //   userPermissionUtil.setPermission(data.data.body.permission);
        //   userProfileUtil.setUerProfile(data.data.body.profile);
        // }
        //
        // const objectAllDescribe = yield call(fieldDescribeService.loadAllObject, payload);
        // const userId = localStorage.getItem('userId');
        // if (objectAllDescribe.status === 200) {
        //   localStorage.setItem(`object_all_describe_${userId}`, JSON.stringify(objectAllDescribe));
        // }
        //
        // // 加载当前用户的下属
        // yield fetchSubs({
        //   userId,
        //   saga: {
        //     call
        //   }
        // })
        //
        // yield fetchParentSubs({
        //   userId,
        //   saga: {
        //     call
        //   }
        // })
        //
        // // 加载当前用户区域下的客户
        // // const territoryCustomerIds = yield call(userService.getTerritoryCustomerIds, {user_id: userId});
        // // if(territoryCustomerIds.status === 200) {
        // //   localStorage.setItem(`territory_customer_ids_${userId}`, JSON.stringify(territoryCustomerIds.result || []))
        // // }
        // // 获取logo
        // const logo = yield call(getLogo, { apiName: 'logo_setting' });
        // if (logo.status === 200) {
        //   if (_.has(logo, 'value')) {
        //     localStorage.setItem('logo', logo.value);
        //   }
        // }
        // yield put({ type: 'App/loadTerritoryCustomerIds' }); // 2018-02-05 14点52分 后台处理这块内容，去掉
        // yield put({ type: 'App/loadCRMSetting' });
        // yield put({ type: 'App/loadDefaultLanguage' });
        // yield put({ type: 'App/loadCRMIntl' });
        // yield put(routerRedux.push('/home'));

        message.success(crmIntlUtil.fmtStr('message.login success'));
        localStorage.setItem('token', data.data.head.token);

        const userTerritoryList = data.data.body.userTerritoryList;
        if (userTerritoryList && userTerritoryList.length > 1) {
          const app_authorize = _.get(data, 'data.body.loginAsBy.profile.app_authorize', []);
          localStorage.setItem('app_authorize', JSON.stringify(app_authorize));
          localStorage.setItem(
            'loginAsBy',
            JSON.stringify(_.get(data, 'data.body.loginAsBy', '{}')),
          );
          localStorage.setItem('userTerritoryList', JSON.stringify(userTerritoryList));
          yield put(routerRedux.push('/choose_territory'));
        } else {
          const app_authorize = _.get(data, 'data.body.profile.app_authorize', []);
          localStorage.setItem('app_authorize', JSON.stringify(app_authorize));
          if (callBack) callBack();
          localStorage.setItem('userTerritory', data.data.body.active_territory);
          window.CURRENT_ACTIVE_TERRITORY = localStorage.getItem('userTerritory');
          yield loginService.fetchAndSetting(data, { payload }, { call, put });
          yield put({ type: 'App/loadTerritoryCustomerIds' }); // 2018-02-05 14点52分 后台处理这块内容，去掉
        }
        // if (callBack)callBack()
      } else {
        // message.error(data.data.head.msg);
        yield put({ type: 'showMessage', message: data.data.head.msg });
      }
    },
  },
  subscriptions: {
    // 路由监听器
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/reset_password') {
        }
      });
    },
  },
};
