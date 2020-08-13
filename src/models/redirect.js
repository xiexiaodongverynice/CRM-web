import { hashHistory } from 'react-router';
import pathToRegexp from 'path-to-regexp';
import _ from 'lodash';
// import { clearLocalStorage } from '../utils/login';
import { joinParams } from '../utils/custom_util';
import { cachedModels } from '../router_model_cache';
import authUtil from '../utils/authUtil';

export default {
  namespace: 'redirect',
  state: {},
  effects: {
    /**
     * 登录成功后设置token
     * @param {*} param0
     * @param {*} param1
     */
    *loginWithTokenSuccess({ payload }, { put }) {
      const { page, query } = payload;
      window.location.href = `#${page}?${joinParams(query)}`;
    },
  },
  subscriptions: {
    // 路由监听器
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        const match = pathToRegexp('/redirect').exec(pathname);
        if (!match) return;
        const { token, page, portal_domain, from } = query;
        setTimeout(() => {
          localStorage.setItem('portal_domain', portal_domain);
          localStorage.setItem('from', from);
        }, 100);

        query = _.omit(query, ['page']);
        if (!token) {
          window.logoutWhereToGo();
        }
        /**
         * 传递token的话，不需要登录
         * 验证本地token与地址栏上的token是否一致，如果不一致，则需要重新登录
         */
        if (localStorage.getItem('token') !== token || localStorage.getItem('from') === 'portal') {
          authUtil.cleanAllStorageButExclude();
          /**
           * 首次登陆，App模块可能没有加载完成，需要等待一段时间，否则无法dispatch
           */
          const checkAppModelInterval = setInterval(() => {
            /**
             * 检查App模块是否已经加载完毕并且指定的effect是否存在
             */
            if (_.get(cachedModels, 'App.effects.loginWithToken')) {
              dispatch({
                type: 'App/loginWithToken',
                payload: {
                  token,
                  page,
                  query,
                },
              });
              clearInterval(checkAppModelInterval);
            }
          }, 10);
        } else {
          dispatch({
            type: 'loginWithTokenSuccess',
            payload: {
              token,
              page,
              query,
            },
          });
        }
      });
    },
  },
};
