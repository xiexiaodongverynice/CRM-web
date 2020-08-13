import { message } from 'antd';
import pathToRegexp from 'path-to-regexp';
import { parse } from 'qs';
import * as reportService from '../../services/report/reportService';
import { monthFormat_, subtractOneDayIfTodayIsFirstInMonth } from '../../utils/date';
import moment from 'moment';
import { getCRM_INTL_TYPE } from '../../utils/crmIntlUtil';

const currentDate = subtractOneDayIfTodayIsFirstInMonth(moment(new Date())).format(monthFormat_);

function* query({ select, put, call }) {
  const { YM: ym, kpi_type } = yield select(({ report_index_hk }) => report_index_hk);
  let data = yield call(reportService.query, {
    ym,
    kpi_type,
    userId: parseInt(localStorage.getItem('userId')),
  });
  yield put({
    type: 'updateState',
    payload: {
      result: data,
    },
  });
}

export default {
  namespace: 'report_index_hk',
  state: {
    YM: currentDate,
    result: {},
    activeTabKey: '1',
    kpi_type: 'hk',
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear(state) {
      return { YM: state.YM };
    },
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      yield query({ select, put, call });
    },
    // 查询时间变动
    *updateDate({ payload }, { call, put, select }) {
      yield put({
        type: 'updateState',
        payload,
      });
      yield query({ select, put, call });
    },
    // 下载报告
    *download({ payload }, { select }) {
      const { YM: ym, kpi_type } = yield select(({ report_index_hk }) => report_index_hk);
      reportService.download({
        ym,
        kpi_type,
        userId: localStorage.getItem('userId'),
        token: localStorage.getItem('token'),
        type: payload.type, // 报告类型
        lang: getCRM_INTL_TYPE(), // 下载何种预研的报告
      });
    },
  },
  subscriptions: {
    // 路由监听器
    setup({ dispatch, history }) {
      return history.listen((location) => {
        const { pathname, action } = location;
        const match = pathToRegexp(
          '/report_hk/(workingDetail|doctorDetail|doctorCallDetail|doctorCallRateDetail|doctorCallCoverDetail|validDoctorCallCoverDetail|doctorCallTimesDetail)?',
        ).exec(pathname);
        if (match) {
          // 为避免从详情页跳转回报告页出现图表闪烁，清空state数据项
          // dispatch({
          //   type: 'clear',
          // });
          // 数据查询，获取最新数据
          if (action === 'POP') {
            // 多个报告页面公用一个model，因此需要减少二次请求，提升加载体验（差的是一个月的数据，所以非实时数据应该也无妨）
            dispatch({
              type: 'query',
            });
          }
        }
      });
    },
  },
};
