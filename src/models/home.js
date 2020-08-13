import { color } from '../utils/theme';
import * as homeService from '../services/homeService';
import consoleUtil from '../utils/consoleUtil';

export default {
  namespace: 'home',
  state: {
    kpi_result: [],
  },
  reducers: {
    home(state, { payload: kpi_result }) {
      // consoleUtil.log('kpi_result',kpi_result);
      return { ...state, kpi_result };
    },
    updateState(state, { payload }) {
      return {
        state,
        ...payload,
      };
    },
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      if (!fc_hasFunctionPrivilege('query_kpi')) {
        yield put({
          type: 'home',
          payload: [],
        });
      } else {
        const data = yield call(homeService.getKpi, { userId: localStorage.getItem('userId') });
        if (data.success) {
          yield put({
            type: 'home',
            payload: data.kpi_result,
          });
        }
      }
    },
  },
  subscriptions: {
    setupHistory({ dispatch, history }) {
      return history.listen((location) => {
        // window.CALLBACK_FROM_STORE = [];
        dispatch({
          type: 'updateState',
          payload: {
            pageType: 'home',
            kpi_result: [],
          },
        });
      });
    },
    // 路由监听器
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/home') {
          dispatch({ type: 'fetch', payload: query });
        }
      });
    },
  },
};
