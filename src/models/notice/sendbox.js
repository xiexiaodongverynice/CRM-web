import { message } from 'antd';
import pathToRegexp from 'path-to-regexp';
import { parse } from 'qs';
import * as recordService from '../../services/object_page/recordService';
import consoleUtil from '../../utils/consoleUtil';


export default {
  namespace: 'notice_sendbox',
  state: {
    noticeList: [],
  },
  reducers: {
    saveNotice(state, { payload: { noticeList, resultCount, current } }) {
      return { ...state, noticeList, resultCount, current };
    },

    removeNotice(state, { payload: { id } }) {
      const newNoticeList = state.noticeList.filter(x => x.id !== id);
      return { ...state, noticeList: newNoticeList };
    },
    updateState (state, { payload }) {
      return {
        state,
        ...payload,
      }
    },
  },
  effects: {
    *queryNoticeList({ payload }, { call, put }) {
      const data = yield call(recordService.queryRecordList, payload);
      yield put({
        type: 'saveNotice',
        payload: { 
          noticeList: data.result,
          resultCount: data.resultCount,
          current: data.pageNo
        }
      });
    },
    *deleteNotice({ payload }, { call, put }) {
      const data = yield call(recordService.deleteRecord, { ...payload, object_api_name: 'notice' });
      const { success, message: msg } = data;
      if (success) {
        message.success('删除成功');
        yield put({
          type: 'removeNotice',
          payload,
        });
      } else {
        message.error(`删除失败：${msg}`);
      }
    },
  },
  subscriptions: {

    setupHistory ({ dispatch, history }) {
      return history.listen((location) => {
        const { pathname } = location
        if(pathToRegexp('/fc_notice/sendbox').exec(pathname)) {
          dispatch({
            type: 'updateState',
            payload: {
            },
          })
        }
      })
    },


    // 路由监听器
    setup({ dispatch, history }) {
      // consoleUtil.log('路由监听');
      // state.layout = null;
      return history.listen(({ pathname, query }) => {
        const match = pathToRegexp('/fc_notice/sendbox').exec(pathname);
        if (match) {
          dispatch({
            type: 'queryNoticeList',
            payload: {
              dealData: {
                objectApiName: 'notice',
                orderBy: 'create_time',
                criterias: [
                  { field: 'owner', operator: '==', value: ['$$CurrentUserId$$'] },
                ],
                pageSize: 10,
                pageNo: 1
              }
            }
          });
        }
      });
    }
  }
};

