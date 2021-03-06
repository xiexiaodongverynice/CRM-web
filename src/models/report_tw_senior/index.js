import * as reportService from '../../services/report/reportService';
import { monthFormat_, subtractOneDayIfTodayIsFirstInMonth } from '../../utils/date';
import moment from 'moment';
import { getCRM_INTL_TYPE } from '../../utils/crmIntlUtil';

const currentDate = subtractOneDayIfTodayIsFirstInMonth(moment(new Date())).format(monthFormat_);

export default {
  namespace: 'report_index_tw_senior',
  state: {
    YM: currentDate,
    level: 'REP',
    levels: ['REP', 'DSM'],
    product_line: 'TW_RX',
    productLines: ['TW_RX', 'TW_CX', 'TW_OP']
  },
  reducers: {
    updateState (state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
  effects: {
    // 下载报告
    *download ({ payload }, { select }) {
      const { YM: ym, kpi_type, level, product_line } = yield select(({ report_index_tw_senior } )=> report_index_tw_senior);
      reportService.admin_download({
        ym,
        kpi_type,
        product_line,
        userId: localStorage.getItem('userId'),
        token: localStorage.getItem('token'),
        level,
        lang: getCRM_INTL_TYPE(),   // 下载何种预研的报告
      });
    },
  },
  subscriptions: {
  },
};

