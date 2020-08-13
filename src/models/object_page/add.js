import modelExtend from 'dva-model-extend';
import pathToRegexp from 'path-to-regexp';
import { parse } from 'qs';
import * as addModel from './object_add';
import consoleUtil from '../../utils/consoleUtil';

const matchPath = (pathname) => {
  return pathToRegexp('/object_page/:object_api_name/add_page').exec(pathname)
}

export default modelExtend(addModel, {
  namespace: 'add_page',
  subscriptions: {
    setupHistory({ dispatch, history }) {
      return history.listen((location) => {
        if(matchPath(location.pathname)) {
          dispatch({
            type: 'updateState',
            payload: {
              pageType: 'add_page',
              locationPathname: location.pathname,
              locationQuery: parse(location.search),
            },
          });
        }
      });
    },

    // 路由监听器
    setup({ dispatch, history }) {
      // consoleUtil.log('路由监听');
      // state.layout = null;
      return history.listen(({ pathname, query }) => {
        const match = matchPath(pathname);
        if (match) {
          dispatch({
            type: 'fetchAll',
            payload: {
              object_api_name: match[1], layout_type: 'detail_page', record_id: match[2], query,
            },
          });
        }
      });
    },
  },
})
