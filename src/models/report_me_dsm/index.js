// 25/01/2018 - TAG: 以下代码基本同report_me,但不可合并，以免后续需求有变更
import { message } from 'antd';
import pathToRegexp from 'path-to-regexp';
import { parse } from 'qs';
import * as reportService from '../../services/report/reportService';
import * as userService from '../../services/userService';
import { monthFormat_ } from '../../utils/date';
import moment from 'moment';
import { getCRM_INTL_TYPE } from '../../utils/crmIntlUtil';
import { buildTreeData } from '../helpers/dataHeler';

const currentDate = moment(new Date()).format(monthFormat_);

function* query({select, put, call}){
  yield put({
    type: 'updateState',
    payload: {
      loading: true,
    }
  })
  const { YM: ym, kpi_type, kpiUserId } = yield select(({ report_index_me_dsm } )=> report_index_me_dsm);
  const data = yield call(reportService.query, {
    ym,
    kpi_type,
    userId: kpiUserId,
  });
  if(data) {
    yield put({
      type: 'updateState',
      payload: {
        result: data,
      },
    });
  }
  yield put({
    type: 'updateState',
    payload: {
      loading: false,
    }
  })
};

/**
 * 获取下属， 包含了虚线下级和岗位下级
 */
function* querySubordinates({select, put, call}) {
  const user_id = localStorage.getItem('userId');
  const data = yield call(userService.getSubordinates, {
    user_id,
  });
  if(data) {
    yield put({
      type: 'updateState',
      payload: {
        subordinates: buildTreeData([{
          name: JSON.parse(localStorage.getItem('user_info')).name,
          id: localStorage.getItem('userId'),
        }, ...data.result]),
      }
    })
  }
};

export default {
  namespace: 'report_index_me_dsm',
  state: {
    YM: currentDate,
    kpi_type: 'me_dsm',
    result: {},
    subordinates: [],
    kpiUserId: parseInt(localStorage.getItem('userId')),
    kpiUserLevel: 0,

    loading: false,
  },
  reducers: {
    updateState (state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    clear (state) {
      return {YM: state.YM};
    }
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      yield query({select, put, call});
    },
    *querySubordinates({payload}, { call, put, select }) {
      yield querySubordinates({select, call, put});
    },
    // 查询时间变动
    *updateDate({ payload }, { call, put, select }) {
      yield put({
        type: 'updateState',
        payload,
      });
      yield query({select, put, call});
    },
    // 下载报告
    *download ({ payload }, { select }) {
      const { YM: ym, kpi_type, kpiUserId } = yield select(({ report_index_me_dsm } )=> report_index_me_dsm);
      reportService.download({
        ym,
        kpi_type,
        userId: kpiUserId,
        token: localStorage.getItem('token'),
        type: payload.type,                                       // 报告类型
        lang: getCRM_INTL_TYPE(),   // 下载何种语言的报告
      });
    }
  },
  subscriptions: {
    // 路由监听器
    setup({ dispatch, history }) {
      return history.listen((location) => {
        const { pathname, action } = location;
        const match = pathToRegexp('/report_me_dsm').exec(pathname);
        if (match) {
          // 为避免从详情页跳转回报告页出现图表闪烁，清空state数据项
          // dispatch({
          //   type: 'clear',
          // });
          // 数据查询，获取最新数据
          if(action === 'POP'){ // 多个报告页面公用一个model，因此需要减少二次请求，提升加载体验（差的是一个月的数据，所以非实时数据应该也无妨）
            dispatch({
              type: 'query',
            });
            dispatch({
              type: 'querySubordinates'
            })
          }
        }
      });
    },
  },
};
