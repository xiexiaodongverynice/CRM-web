import { message } from 'antd';
import pathToRegexp from 'path-to-regexp';
import { parse } from 'qs';
import moment from 'moment';
import _ from 'lodash';
import * as calendarService from '../../services/calendar_page/calendarService';

const matchPath = (pathname) => {
  const match = pathToRegexp('/fc_calendar').exec(pathname);
  return match;
}

export default {
  namespace: 'calendar_page',
  state: {
    loading: false,
    currentDate:moment(),
    defaultView:'month',
    calendarLayout: null,
  },
  reducers: {
    buildPageSuccess(state, { payload: { calendarLayout,defaultView } }) {
      return { ...state, calendarLayout,defaultView, };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
  },
  effects: {
    *fetchAll({ payload }, { call, put }) {
      const calendarSettingData = yield call(calendarService.loadCalendarLayout, payload);
      // const calendarSettingData = {
      //   value: require('../../../mock/call_templdate_calendar').default,
      //   success: true,
      // };
      const defaultView = payload.defaultView;
      let calendarLayout = [];
      if(calendarSettingData.success){
        calendarLayout = JSON.parse(_.get(calendarSettingData,'value','[]'));
      }
      yield put({
        type: 'buildPageSuccess',
        payload: { calendarLayout,defaultView},
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
              pageType: 'calendar_page',
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
        const defaultView = _.get(query,'defaultView','month');
        if (match) {
          dispatch({ type: 'fetchAll', payload: { date: moment(),defaultView } });
        }
      });
    },
  },
};
