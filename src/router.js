import React from 'react';
// import { Router } from 'dva/router';
import { Router, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';
// import { LocaleProvider, message, Spin } from 'antd';
//
// import { addLocaleData, IntlProvider } from 'react-intl';
// import * as crmIntlUtil from './utils/crmIntlUtil';
import consoleUtil from './utils/consoleUtil';
import { registerModel } from './support';

// const appLocale = window.appLocale;
// addLocaleData(appLocale.data);L

function RouterConfig({ history, app }) {
  const routes = [
    {
      path: '/',
      name: 'IndexPage',
      getComponent(nextState, cb) {
        require.ensure([], (require) => {
          registerModel(app, require('./models/app'));
          cb(null, require('./routes/app'));
        });
      },
      childRoutes: [
        {
          path: '/login',
          name: 'LoginPage',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/login'));
              cb(null, require('./routes/login/login'));
            });
          },
        },
        {
          path: '/admin_login_as',
          name: 'admin_login_as',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/adminLoginAs'));
              cb(null, require('./routes/login/adminLoginAs'));
            });
          },
        },
        {
          path: '/choose_territory',
          name: 'choose_territory',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/choose_territory'));
              cb(null, require('./routes/choose_territory/index.js'));
            });
          },
        },
        {
          path: '/redirect',
          name: 'redirect',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/redirect'));
              cb(null, require('./routes/redirect/index'));
            });
          },
        },
        {
          path: '/reset_password',
          name: 'reset_password',
          breadcrumbName: '忘记密码',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/userPassword'));
              cb(null, require('./routes/user_password/resetPassword'));
            });
          },
        },
        {
          path: '/change_territory',
          name: 'change_territory',
          breadcrumbName: '岗位选择',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/switch_territory'));
              cb(null, require('./routes/choose_territory/change_territory.js'));
            });
          },
        },
        {
          path: '/change_password',
          name: 'change_password',
          breadcrumbName: '修改密码',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/userPassword'));
              cb(null, require('./routes/user_password/changePassword'));
            });
          },
        },
        {
          path: '/home',
          name: 'home',
          breadcrumbName: '首页',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/home'));
              cb(null, require('./routes/home/home'));
            });
          },
        },
        {
          path: 'object_page/:object_api_name/index_page',
          name: 'object_page',
          breadcrumbName: '首页布局渲染',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/object_page/index'));
              cb(null, require('./routes/object_page/index'));
            });
          },
        },
        {
          path: 'object_page/:object_api_name/:record_id/edit_page',
          name: 'object_page',
          breadcrumbName: '编辑渲染',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/object_page/edit'));
              cb(null, require('./routes/object_page/edit'));
            });
          },
        },
        {
          path: 'object_page/:object_api_name/add_page',
          name: 'object_page',
          breadcrumbName: '新增渲染',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/object_page/add'));
              cb(null, require('./routes/object_page/add'));
            });
          },
        },
        {
          path: 'object_page/:object_api_name/:record_id/detail_page',
          name: 'detail_page',
          breadcrumbName: '详情渲染',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/object_page/detail'));
              cb(null, require('./routes/object_page/detail'));
            });
          },
        },
        {
          path: 'report',
          name: 'report',
          breadcrumbName: '报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report/index'));
              cb(null, require('./routes/report/index'));
            });
          },
        },
        {
          path: 'report/workingDetail',
          name: 'workingDetail',
          breadcrumbName: '区域内工作天数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report/index'));
              cb(null, require('./routes/report/workingDetail'));
            });
          },
        },
        {
          path: 'report/doctorDetail',
          name: 'doctorDetail',
          breadcrumbName: '目标医生数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report/index'));
              cb(null, require('./routes/report/doctorDetail'));
            });
          },
        },
        {
          path: 'report/doctorCallDetail',
          name: 'doctorCallDetail',
          breadcrumbName: '日均拜访详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report/index'));
              cb(null, require('./routes/report/doctorCallDetail'));
            });
          },
        },
        {
          path: 'report/doctorCallRateDetail',
          name: 'doctorCallRateDetail',
          breadcrumbName: '拜访频率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report/index'));
              cb(null, require('./routes/report/doctorCallRateDetail'));
            });
          },
        },
        {
          path: 'report/doctorCallCoverDetail',
          name: 'doctorCallCoverDetail',
          breadcrumbName: '医生覆盖率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report/index'));
              cb(null, require('./routes/report/doctorCallCoverDetail'));
            });
          },
        },
        {
          path: 'report/validDoctorCallCoverDetail',
          name: 'validDoctorCallCoverDetail',
          breadcrumbName: '有效拜访覆盖率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report/index'));
              cb(null, require('./routes/report/validDoctorCallCoverDetail'));
            });
          },
        },
        {
          path: 'report/eventDetail',
          name: 'eventDetail',
          breadcrumbName: '会议活动次数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report/index'));
              cb(null, require('./routes/report/eventDetail'));
            });
          },
        },
        {
          path: 'report/coachDetail',
          name: 'coachDetail',
          breadcrumbName: '辅导次数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report/index'));
              cb(null, require('./routes/report/coachDetail'));
            });
          },
        },
        {
          path: 'report_team',
          name: 'report_team',
          breadcrumbName: '报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_team/index'));
              cb(null, require('./routes/report_team/index'));
            });
          },
        },
        {
          path: 'report_team/workingDetail',
          name: 'workingDetail',
          breadcrumbName: '区域内工作天数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_team/index'));
              cb(null, require('./routes/report_team/workingDetail'));
            });
          },
        },
        {
          path: 'report_team/doctorDetail',
          name: 'doctorDetail',
          breadcrumbName: '目标医生数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_team/index'));
              cb(null, require('./routes/report_team/doctorDetail'));
            });
          },
        },
        {
          path: 'report_team/doctorCallDetail',
          name: 'doctorCallDetail',
          breadcrumbName: '日均拜访详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_team/index'));
              cb(null, require('./routes/report_team/doctorCallDetail'));
            });
          },
        },
        {
          path: 'report_team/doctorCallRateDetail',
          name: 'doctorCallRateDetail',
          breadcrumbName: '拜访频率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_team/index'));
              cb(null, require('./routes/report_team/doctorCallRateDetail'));
            });
          },
        },
        {
          path: 'report_team/doctorCallCoverDetail',
          name: 'doctorCallCoverDetail',
          breadcrumbName: '医生覆盖率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_team/index'));
              cb(null, require('./routes/report_team/doctorCallCoverDetail'));
            });
          },
        },
        {
          path: 'report_team/validDoctorCallCoverDetail',
          name: 'validDoctorCallCoverDetail',
          breadcrumbName: '有效拜访覆盖率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_team/index'));
              cb(null, require('./routes/report_team/validDoctorCallCoverDetail'));
            });
          },
        },
        {
          path: 'report_team/eventDetail',
          name: 'eventDetail',
          breadcrumbName: '会议活动次数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_team/index'));
              cb(null, require('./routes/report_team/eventDetail'));
            });
          },
        },
        {
          path: 'report_team/coachDetail',
          name: 'coachDetail',
          breadcrumbName: '辅导次数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_team/index'));
              cb(null, require('./routes/report_team/coachDetail'));
            });
          },
        },
        {
          path: 'report_me',
          name: 'report_me',
          breadcrumbName: 'ME报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_me/index'));
              cb(null, require('./routes/report_me/index'));
            });
          },
        },
        {
          path: 'report_me/eventSummaryDetail',
          name: 'report_me_event_summary_detail',
          breadcrumbName: 'ME报告-活动执行汇总报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_me/index'));
              cb(null, require('./routes/report_me/summary'));
            });
          },
        },
        {
          path: 'report_me/eventSupportDetail',
          name: 'report_me_event_support_detail',
          breadcrumbName: 'ME报告-活动支持统计报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_me/index'));
              cb(null, require('./routes/report_me/support').default);
            });
          },
        },
        {
          path: 'report_me_country',
          name: 'report_me_country',
          breadcrumbName: 'ME全国报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_me_country/index'));
              cb(null, require('./routes/report_me_country/index'));
            });
          },
        },
        {
          path: 'report_me_dsm',
          name: 'report_me_dsm',
          breadcrumbName: 'ME区域经理报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_me_dsm/index'));
              cb(null, require('./routes/report_me_dsm/index'));
            });
          },
        },
        {
          path: 'report_hk',
          name: 'report_hk',
          breadcrumbName: '报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_hk/index'));
              cb(null, require('./routes/report_hk/index'));
            });
          },
        },
        {
          path: 'report_hk/workingDetail',
          name: 'report_hk_workingDetail',
          breadcrumbName: '区域内工作天数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_hk/index'));
              cb(null, require('./routes/report_hk/workingDetail'));
            });
          },
        },
        {
          path: 'report_hk/doctorDetail',
          name: 'report_hk_doctorDetail',
          breadcrumbName: '目标医生数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_hk/index'));
              cb(null, require('./routes/report_hk/doctorDetail'));
            });
          },
        },
        {
          path: 'report_hk/doctorCallDetail',
          name: 'report_hk_doctorCallDetail',
          breadcrumbName: '日均拜访详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_hk/index'));
              cb(null, require('./routes/report_hk/doctorCallDetail'));
            });
          },
        },
        {
          path: 'report_hk/doctorCallRateDetail',
          name: 'report_hk_doctorCallRateDetail',
          breadcrumbName: '拜访频率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_hk/index'));
              cb(null, require('./routes/report_hk/doctorCallRateDetail'));
            });
          },
        },
        {
          path: 'report_hk/doctorCallCoverDetail',
          name: 'report_hk_doctorCallCoverDetail',
          breadcrumbName: '医生覆盖率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_hk/index'));
              cb(null, require('./routes/report_hk/doctorCallCoverDetail'));
            });
          },
        },
        {
          path: 'report_hk/validDoctorCallCoverDetail',
          name: 'report_hk_validDoctorCallCoverDetail',
          breadcrumbName: '有效拜访覆盖率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_hk/index'));
              cb(null, require('./routes/report_hk/validDoctorCallCoverDetail'));
            });
          },
        },
        {
          path: 'report_hk/doctorCallTimesDetail',
          name: 'report_hk_doctorCallTimesDetail',
          breadcrumbName: '客户拜访频次报告详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_hk/index'));
              cb(null, require('./routes/report_hk/doctorCallTimesDetail'));
            });
          },
        },
        {
          path: 'report_hk/coachDetail',
          name: 'report_hk_coachDetail',
          breadcrumbName: '辅导次数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_hk/index'));
              cb(null, require('./routes/report_hk/coachDetail'));
            });
          },
        },
        {
          path: 'report_hk_senior',
          name: 'report_hk_senior',
          breadcrumbName: '报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_hk_senior/index'));
              cb(null, require('./routes/report_hk_senior/index'));
            });
          },
        },
        {
          path: 'report_tw_senior',
          name: 'report_tw_senior',
          breadcrumbName: '报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_tw_senior/index'));
              cb(null, require('./routes/report_tw_senior/index'));
            });
          },
        },
        {
          path: 'report_senior',
          name: 'report_senior',
          breadcrumbName: '报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_senior/index'));
              cb(null, require('./routes/report_senior/index'));
            });
          },
        },
        {
          path: 'report_tw',
          name: 'report_tw',
          breadcrumbName: '报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_tw/index'));
              cb(null, require('./routes/report_tw/index'));
            });
          },
        },
        {
          path: 'report_tw/workingDetail',
          name: 'workingDetail',
          breadcrumbName: '区域内工作天数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_tw/index'));
              cb(null, require('./routes/report_tw/workingDetail'));
            });
          },
        },
        {
          path: 'report_tw/doctorDetail',
          name: 'doctorDetail',
          breadcrumbName: '目标医生数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_tw/index'));
              cb(null, require('./routes/report_tw/doctorDetail'));
            });
          },
        },
        {
          path: 'report_tw/doctorCallDetail',
          name: 'doctorCallDetail',
          breadcrumbName: '日均拜访详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_tw/index'));
              cb(null, require('./routes/report_tw/doctorCallDetail'));
            });
          },
        },
        {
          path: 'report_tw/doctorCallRateDetail',
          name: 'doctorCallRateDetail',
          breadcrumbName: '拜访频率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_tw/index'));
              cb(null, require('./routes/report_tw/doctorCallRateDetail'));
            });
          },
        },
        {
          path: 'report_tw/doctorCallCoverDetail',
          name: 'doctorCallCoverDetail',
          breadcrumbName: '医生覆盖率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_tw/index'));
              cb(null, require('./routes/report_tw/doctorCallCoverDetail'));
            });
          },
        },
        {
          path: 'report_tw/validDoctorCallCoverDetail',
          name: 'validDoctorCallCoverDetail',
          breadcrumbName: '有效拜访覆盖率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_tw/index'));
              cb(null, require('./routes/report_tw/validDoctorCallCoverDetail'));
            });
          },
        },
        {
          path: 'report_tw/eventDetail',
          name: 'eventDetail',
          breadcrumbName: '会议活动次数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_tw/index'));
              cb(null, require('./routes/report_tw/eventDetail'));
            });
          },
        },
        {
          path: 'report_tw/coachDetail',
          name: 'coachDetail',
          breadcrumbName: '辅导次数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_tw/index'));
              cb(null, require('./routes/report_tw/coachDetail'));
            });
          },
        },
        {
          path: 'report_all_product',
          name: 'report_me',
          breadcrumbName: '全产品报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_all_product/index'));
              cb(null, require('./routes/report_all_product/index'));
            });
          },
        },
        {
          path: 'report_all_product/workingDetail',
          name: 'workingDetail',
          breadcrumbName: '区域内工作天数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_all_product/index'));
              cb(null, require('./routes/report_all_product/workingDetail'));
            });
          },
        },
        {
          path: 'report_all_product/customerNumDetail',
          name: 'customerNumDetail',
          breadcrumbName: '客户数详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_all_product/index'));
              cb(null, require('./routes/report_all_product/customerNumDetail'));
            });
          },
        },
        {
          path: 'report_all_product/callRateDetail',
          name: 'callRateDetail',
          breadcrumbName: '拜访频率详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_all_product/index'));
              cb(null, require('./routes/report_all_product/callRateDetail'));
            });
          },
        },
        {
          path: 'report_all_product/eventDetail',
          name: 'eventDetail',
          breadcrumbName: '推广活动详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_all_product/index'));
              cb(null, require('./routes/report_all_product/eventDetail'));
            });
          },
        },
        {
          path: 'report_all_product/coachDetail',
          name: 'coachDetail',
          breadcrumbName: '辅导报告详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/report_all_product/index'));
              cb(null, require('./routes/report_all_product/coachDetail'));
            });
          },
        },
        {
          path: 'fc_calendar',
          name: 'calendar_page',
          breadcrumbName: '日历',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/calendar_page/index'));
              cb(null, require('./routes/calendar_page/index'));
            });
          },
        },
        {
          path: 'fc_notice',
          name: 'notice_page',
          breadcrumbName: '公告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/notice/index'));
              cb(null, require('./routes/notice/index'));
            });
          },
        },
        {
          path: 'fc_architecture',
          name: 'architecture_page',
          breadcrumbName: '业务数据',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/architecture/index'));
              cb(null, require('./routes/architecture/index'));
            });
          },
        },
        {
          path: 'fc_custom_report',
          name: 'data_export_index',
          breadcrumbName: '自定义报告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/data_export/export_script'));
              registerModel(app, require('./models/data_export/export_history'));
              registerModel(app, require('./models/data_export/table'));
              registerModel(app, require('./models/data_export/index'));
              cb(null, require('./routes/data_export/index'));
            });
          },
        },
        {
          path: 'fc_notice/sendbox',
          name: 'notice_sendbox',
          breadcrumbName: '我发布的公告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/notice/sendbox'));
              cb(null, require('./routes/notice/sendbox'));
            });
          },
        },
        {
          path: 'fc_notice/add',
          name: 'notice_add',
          breadcrumbName: '新建公告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/notice/form'));
              cb(null, require('./routes/notice/add'));
            });
          },
        },
        {
          path: 'fc_notice/view',
          name: 'notice_view',
          breadcrumbName: '新建公告',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/notice/form'));
              cb(null, require('./routes/notice/view'));
            });
          },
        },
        {
          path: '/segmentation_history/:segmentation_history_id/segmentation_fill_page',
          name: 'segmentation_fill_page',
          breadcrumbName: '填写定级问卷',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(
                app,
                require('./models/segmentation_history_page/segmentation_fill_page'),
              );
              cb(null, require('./routes/segmentation_history_page/segmentation_fill_page'));
            });
          },
        },
        {
          path: '/segmentation_history/:segmentation_history_id/segmentation_detail_page',
          name: 'segmentation_detail_page',
          breadcrumbName: '定级问卷详情',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(
                app,
                require('./models/segmentation_history_page/segmentation_detail_page'),
              );
              cb(null, require('./routes/segmentation_history_page/segmentation_detail_page'));
            });
          },
        },
        {
          path: '/coach_feedback/:coach_feedback_id/coach_fill_page',
          name: 'coach_fill_page',
          breadcrumbName: '填写辅导问卷',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/coach_feedback_page/coach_fill_page'));
              cb(null, require('./routes/coach_feedback_question_page/coach_fill_page'));
            });
          },
        },
        {
          path: '/external_page/:object_api_name/index_page',
          name: 'external_page',
          breadcrumbName: '外部链接页面',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              registerModel(app, require('./models/external_page/index'));
              cb(null, require('./routes/external_page/index'));
            });
          },
        },
        {
          path: '/rich_text_page/:object_api_name/:recordId',
          name: 'rich_text_page',
          breadcrumbName: '富文本页面',
          getComponent(nextState, cb) {
            require.ensure([], (require) => {
              // registerModel(app, require('./models/object_page/edit'));
              cb(null, require('./routes/rice_text_page/index'));
            });
          },
        },
      ],
    },
  ];
  const appHistory = useRouterHistory(createHashHistory)({ queryKey: true });

  consoleUtil.log('route appLocale==>', window.appLocale);
  // return (
  //   <LocaleProvider locale={window.appLocale.antd}>
  //     <IntlProvider
  //       locale={window.appLocale.locale}
  //       messages={window.appLocale.messages}
  //     // formats={appLocale.formats}
  //     >
  //       <Router history={appHistory} routes={routes} />
  //     </IntlProvider>
  //   </LocaleProvider>
  // )
  return <Router history={appHistory} routes={routes} />;
}
export default RouterConfig;
