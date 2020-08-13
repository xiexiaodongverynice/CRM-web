import modelExtend from 'dva-model-extend';
import pathToRegexp from 'path-to-regexp';
import { parse } from 'qs';
import * as detailModel from './object_detail';
import consoleUtil from '../../utils/consoleUtil';

const matchPath = (pathname) => {
  const match = pathToRegexp('/object_page/:object_api_name/:record_id/detail_page').exec(pathname);
  return match;
}

export default modelExtend(detailModel, {
  namespace: 'detail_page',
  subscriptions: {
    setupHistory({ dispatch, history }) {
      return history.listen((location) => {
        if (matchPath(location.pathname)) {
          consoleUtil.log('setupHistory,query', location);
          dispatch({
            type: 'updateState',
            payload: {
              pageType: 'detail_page',
              locationPathname: location.pathname,
              locationQuery: parse(location.search),
              recordType: _.get(location, 'query.recordType'),
            },
          });
        }
      });
    },
    // 路由监听器
    setup({ dispatch, history }) {
      // state.layout = null;
      return history.listen(({ pathname, query }) => {
        consoleUtil.log('路由监听');
        const match = matchPath(pathname);
        if (match) {
          // dispatch({ type: 'fetchDescribe', payload: { object_api_name: match[1] } });
          dispatch({
            type: 'fetchAll',
            payload: {
              object_api_name: match[1],
              layout_type: 'detail_page',
              record_id: match[2],
              query,
              recordType: _.get(query, 'recordType'),
            },
          });
        }
      });
    },
  },
})
