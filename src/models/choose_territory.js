import _ from 'lodash';
// import { routerRedux } from 'dva/router';
import * as loginService from '../services/login';
// import { fetchAndSetting } from '../services/login';
// import storageUtil from '../utils/storageUtil';

export default {
  namespace: 'choose_territory',
  state: { territoryLoading: false },
  effects: {
    *ChooseTerritory({ payload, callBack }, { call, put }) {
      yield put({ type: 'showTerritoryLoading' });
      const data = yield call(loginService.change_territory, payload);
      if (_.get(data, 'data.isSucceed', false)) {
        const app_authorize = _.get(data, 'data.body.profile.app_authorize', []);
        localStorage.setItem('app_authorize', JSON.stringify(app_authorize));
        yield loginService.fetchAndSetting(data, { payload }, { call, put });
        yield put({ type: 'hideTerritoryLoading' });
        yield put({
          type: 'App/initSystemData',
        });
        if (callBack) callBack();
      } else {
        yield put({ type: 'hideTerritoryLoading' });
      }
      // if (data.data.body.user_info) {
      //   localStorage.setItem('user_info', JSON.stringify(data.data.body.user_info));
      // }
      // if (data.data.body.permission) {
      //   userPermissionUtil.setPermission(data.data.body.permission);
      //   userProfileUtil.setUerProfile(data.data.body.profile);
      // }
    },
  },
  reducers: {
    showTerritoryLoading(state) {
      return {
        ...state,
        territoryLoading: true,
      };
    },
    hideTerritoryLoading(state) {
      return {
        ...state,
        territoryLoading: false,
      };
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {},
  },
};
