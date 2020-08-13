import { routerRedux } from 'dva/router';
import _ from 'lodash';
import * as loginService from '../services/login';
import * as userProfileUtil from '../utils/userProfileUtil';
import * as userPermissionUtil from '../utils/userPermissionUtil';
import { fetchSubs } from '../helper';
import windowUtil from '../utils/windowUtil';

export default {
  namespace: 'switch_territory',
  state: { territoryLoading: false },
  effects: {
    *SwitchTerritory({ payload, callBack }, { call, put }) {
      const data = yield call(loginService.change_territory, payload);
      const app_authorize = _.get(data, 'data.body.profile.app_authorize', []);
      localStorage.setItem('app_authorize', JSON.stringify(app_authorize));
      if (data.data.body.user_info) {
        localStorage.setItem('user_info', JSON.stringify(data.data.body.user_info));
        //*  切换岗位后重新获取下属数据
        yield fetchSubs({
          userId: window.FC_CRM_USERID,
          saga: {
            call,
          },
        });
        windowUtil.initGlobalCRMProperties();
      }
      if (data.data.body.permission) {
        userPermissionUtil.setPermission(data.data.body.permission);
        userProfileUtil.setUerProfile(data.data.body.profile);
      }
      yield put({
        type: 'App/loadCRMSetting',
      });
      yield put({
        type: 'App/initSystemData',
      });
      if (callBack) callBack();
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {},
  },
};
