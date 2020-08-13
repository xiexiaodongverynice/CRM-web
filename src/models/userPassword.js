import { routerRedux } from 'dva/router';
import { message } from 'antd';
import _ from 'lodash';
import * as userService from '../services/user';
import * as securityCheck from '../services/securityCheck';

export default {
  namespace: 'user_password',
  state: {
    securityCheck: {}
  },
  reducers: {
    fetchSuccess(state, { payload }) {
      return {
        state,
        ...payload
      };
    }
  },
  effects: {
    *fetchSecurityCheck({ payload }, { call, put }) {
      const response = yield call(securityCheck.fetchByCurrentUser, {});
      if (response.success) {
        yield put({
          type: 'fetchSuccess',
          payload: { securityCheck: _.get(response, 'resultData', {}) }
        });
      }
    },

    *reset({ payload }, { call, put }) {
      const { data } = yield call(userService.resetPassword, payload);
      const msg = data.head.msg;
      if (data !== undefined
        && data.head !== undefined
        && data.head.code === 200) {
        message.success('系统已向您的邮箱发送重置密码邮件，注意查收！');
        yield put(routerRedux.push('/login'));
      } else {
        message.error(msg);
      }
    },
    *change({ payload, callback }, { call, put }) {
      const { data } = yield call(userService.changePassword, payload);
      const msg = data.head.msg;
      if (data !== undefined
        && data.head !== undefined
        && data.head.code === 200) {
        if (callback)callback(true);
      } else {
        message.error(msg);
      }
    }
  },
  subscriptions: {
    // 路由监听器
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/change_password') {
          dispatch({ type: 'fetchSecurityCheck', payload: {} });
        }
      });
    }
  }
};
