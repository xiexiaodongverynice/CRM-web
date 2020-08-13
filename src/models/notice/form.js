/**
 * Created by xinli on 2017/9/5.
 */
import { message } from 'antd';
import { hashHistory } from 'react-router';
import pathToRegexp from 'path-to-regexp';
import * as recordService from '../../services/object_page/recordService';
import consoleUtil from '../../utils/consoleUtil';


export default {
  namespace: 'notice_form',
  state: {
    notice: {},
  },
  reducers: {
    saveNotice(state, { payload: { notice } }) {
      return { ...state, notice };
    },
  },
  effects: {
    *loadNoticeById({ payload }, { call, put }) {
      const data = yield call(recordService.loadRecord, payload);
      yield put({
        type: 'saveNotice',
        payload: { notice: data },
      });
    },

    *createOrUpdate({ payload }, { call, put }) {
      const data = yield call(recordService.createOrUpdate, { object_api_name: 'notice', dealData: payload });
      yield put({
        type: 'saveNotice',
        payload: {
          notice: data,
        },
      });
      message.success('发布成功');
      hashHistory.push('/fc_notice');
    },

    updateState(state, { payload }) {
      return {
        state,
        ...payload,
      };
    },

  },
  subscriptions: {

    setupHistory({ dispatch, history }) {
      return history.listen((location) => {
        const { pathname } = location
        if(pathToRegexp('/fc_notice/view').exec(pathname) || pathToRegexp('/fc_notice/add').exec(pathname)){
          dispatch({
            type: 'updateState',
            payload: {

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
        if (pathToRegexp('/fc_notice/view').exec(pathname)) {
          dispatch({ type: 'loadNoticeById', payload: { object_api_name: 'notice', record_id: query.id } });
        }

        if (pathToRegexp('/fc_notice/add').exec(pathname)) {
          dispatch({
            type: 'saveNotice',
            payload: {
              notice: {},
            },
          });
        }
      });
    },
  },
};
