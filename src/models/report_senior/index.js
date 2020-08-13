import * as reportService from '../../services/report/reportService';
import { monthFormat_, subtractOneDayIfTodayIsFirstInMonth } from '../../utils/date';
import moment from 'moment';
import { getCRM_INTL_TYPE } from '../../utils/crmIntlUtil';

const currentDate = subtractOneDayIfTodayIsFirstInMonth(moment(new Date())).format(monthFormat_);

export default {
  namespace: 'report_index_senior',
  state: {
    YM: currentDate,
    level: 'REP',
    levels: ['REP', 'DSM', 'RSM'],
    product_line: '癌痛',
    productLines: ['癌痛', '非癌痛', '术后痛'],
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
      const { YM: ym, kpi_type, level, product_line } = yield select(({ report_index_senior } )=> report_index_senior);
      reportService.admin_download({
        ym,
        kpi_type,
        product_line,
        userId: localStorage.getItem('userId'),
        token: localStorage.getItem('token'),
        level,
        lang: getCRM_INTL_TYPE(),   // 下载何种语言的报告
      });
    },
    *download_all_product ({ payload }, { select }) {
      const { YM: ym, kpi_type, level } = yield select(({ report_index_senior } )=> report_index_senior);
      reportService.admin_download({
        ym,
        kpi_type,
        product_line: '全产品',
        userId: localStorage.getItem('userId'),
        token: localStorage.getItem('token'),
        level,
        lang: getCRM_INTL_TYPE(),   // 下载何种语言的报告
      });
    },
    *download_grafalon ({ payload }, { select }) {
      const { YM: ym, kpi_type, level } = yield select(({ report_index_senior } )=> report_index_senior);
      reportService.admin_download({
        ym,
        kpi_type,
        product_line: 'Grafalon', 
        userId: localStorage.getItem('userId'),
        token: localStorage.getItem('token'),
        level,
        lang: getCRM_INTL_TYPE(),   // 下载何种语言的报告
      });
    },
  },
  subscriptions: {
  },
};

