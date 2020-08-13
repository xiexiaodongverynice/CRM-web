import { message } from 'antd';
import pathToRegexp from 'path-to-regexp';
import { parse } from 'qs';
import _ from 'lodash';
import * as recordService from '../../services/object_page/recordService';
import * as encryptJwtService from '../../services/encryptJwtService';
import config from '../../utils/config';
import consoleUtil from '../../utils/consoleUtil';

const { baseURL } = config;

const matchPath = (pathname) => {
  const match = pathToRegexp('/coach_feedback/:coach_feedback_id/coach_fill_page').exec(pathname);
  return match
}


export default {
  namespace: 'coach_fill_page',
  state: {
    loading: true,
    coachRecordData: {},
    secretJwtData: '',
    coachId: '',
    pageType: 'coach_fill_page',
  },
  reducers: {
    buildPageSuccess(state, { payload: { coachId, coachRecordData, secretJwtData } }) {
      return { ...state, coachId, coachRecordData, secretJwtData };
    },
    updateState (state, { payload }) {
      return {
        state,
        ...payload,
      }
    },
  },
  effects: {
    *fetchAll({ payload }, { call, put }) {
      const { coach_feedback_id, query } = payload;
      const coachPayload = {
        joiner: 'and',
        criterias: [
          { field: 'type', operator: '==', value: [query.recordType] },
        ],
        objectApiName: 'coach',
      };
      const coachList = yield call(recordService.queryRecordList, { dealData: coachPayload });
      //consoleUtil.log('coachList', coachList);
      const secretData = {
        org: 'mundi',
        app: 'crmpower',
        data: {
          version: query.version,
          coach_feedback_id,
          callback: baseURL,
          update: {},
          token: localStorage.getItem('token'),
        },
        module: 'coach',
        source: 'web',
      };

      const secretJwtData = yield call(encryptJwtService.encryptJwt, { dealData: secretData });
      let coachData = null;
      const coachResult = _.get(coachList, 'result');
      // 06/02/2018 - TAG: 已确定result的数据结构为数组
      if(_.isArray(coachResult)){
        const userProfileId = _.toString(_.get(JSON.parse(localStorage.getItem('userProfile')), 'id'));
        // 06/02/2018 - TAG: 遍历辅导问卷
        coachResult.forEach(coach => {
          // 06/02/2018 - TAG: 如果已经查询到辅导问卷则跳过
          if(_.isNull(coachData)){
            // 06/02/2018 - TAG: 获取辅导问卷的profileIds
            const coachProfileArray = _.get(coach, 'profile');
            if (!_.isEmpty(coachProfileArray)) {
              const exist =  _.indexOf(coachProfileArray, userProfileId);
              if (exist !== -1) {
                // 06/02/2018 - TAG: 匹配到profile，则匹配到辅导问卷
                coachData = coach;
              }
            }
          }
        });
      }
      yield put({
        type: 'buildPageSuccess',
        payload: { coachId: coach_feedback_id, coachRecordData: coachData, secretJwtData: _.get(secretJwtData, 'result') },
      });
    },
  },
  subscriptions: {

    setupHistory ({ dispatch, history }) {
      return history.listen((location) => {
        const match = matchPath(location.pathname)
        if(match) {
          dispatch({
            type: 'updateState',
            payload: {
              pageType: 'coach_fill_page',
              locationPathname: location.pathname,
              locationQuery: parse(location.search),
            },
          })
        }
      })
    },

    // 路由监听器
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        const match = matchPath(pathname)
        if (match) {
          dispatch({ type: 'fetchAll',
            payload: {
              coach_feedback_id: match[1],
              query,
            } });
        }
      });
    },
  },
};
