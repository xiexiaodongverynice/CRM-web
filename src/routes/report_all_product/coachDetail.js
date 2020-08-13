import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button, DatePicker } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from './index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { handleResult, mapStateToProps, getUserRole, getDatas, rowClassNameForSM } from './helpers';
import { UserDetail, DateMonthDropDown, ExtraColumnsForSM } from './commonElements';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { NumberOrEmpty } from '../../utils/lo';
import { userData, workingDetailData } from './mock';
const { MonthPicker } = DatePicker;
const Column = Table.Column;

const CoachDetail = ({ dispatch, location, loading, result = {}, YM }) => {
  const { data, Level, is_DSM, is_RSM, is_REP, is_SM } = handleResult(result);
  const { WorkingDays, WorkingDaysTarget, DoctorNumber } = data;
  const eventTableDataRSM = [
    {
      UserName: data.UserName,
      UserCode: data.UserCode,
      Level: data.Level,
      ProductName: data.ProductName,
      OnPositionNumber: NumberOrEmpty(data.OnPositionNumber),
      PositionNumber: NumberOrEmpty(data.PositionNumber),

      TotalCallNumber: NumberOrEmpty(data.TotalCallNumber),
      TargetCallNumber: NumberOrEmpty(data.TargetCallNumber),
      NonTargetCallNumber: NumberOrEmpty(data.NonTargetCallNumber),

      WorkingDays: NumberOrEmpty(data.WorkingDays),
      WorkingDaysTarget: NumberOrEmpty(data.WorkingDaysTarget),
      WorkingDaysAchiRate: NumberOrEmpty(data.WorkingDaysAchiRate),

      // name: '实地协防',
      RegionalCoach: NumberOrEmpty(data.RegionalCoach),
      RegionalCoachTarget: NumberOrEmpty(data.RegionalCoachTarget),
      RegionalCoachAchiRate: NumberOrEmpty(data.RegionalCoachAchiRate),

      // name: '区域辅导',
      AssistCoach: NumberOrEmpty(data.AssistCoach),
      AssistCoachTarget: NumberOrEmpty(data.AssistCoachTarget),
      AssistCoachAchiRate: NumberOrEmpty(data.AssistCoachAchiRate),
    },
  ];

  const eventTableDataDSM = [
    {
      UserName: data.UserName,
      UserCode: data.UserCode,
      Level: data.Level,
      ProductName: data.ProductName,
      OnPositionNumber: NumberOrEmpty(data.OnPositionNumber),
      PositionNumber: NumberOrEmpty(data.PositionNumber),

      TotalCallNumber: NumberOrEmpty(data.TotalCallNumber),
      TargetCallNumber: NumberOrEmpty(data.TargetCallNumber),
      NonTargetCallNumber: NumberOrEmpty(data.NonTargetCallNumber),

      WorkingDays: NumberOrEmpty(data.WorkingDays),
      WorkingDaysTarget: NumberOrEmpty(data.WorkingDaysTarget),
      WorkingDaysAchiRate: NumberOrEmpty(data.WorkingDaysAchiRate),

      // name: '会议辅导',
      MeetingCoach: NumberOrEmpty(data.MeetingCoach),
      MeetingCoachTarget: NumberOrEmpty(data.MeetingCoachTarget),
      MeetingCoachAchiRate: NumberOrEmpty(data.MeetingCoachAchiRate),

      // name: '销售拜访辅导',
      SalesCoach: NumberOrEmpty(data.SalesCoach),
      SalesCoachTarget: NumberOrEmpty(data.SalesCoachTarget),
      SalesCoachAchiRate: NumberOrEmpty(data.SalesCoachAchiRate),
    },
  ];

  const columnsDSM = [
    {
      title: crmIntlUtil.fmtStr('text.report.username'),
      dataIndex: 'UserName',
      key: 'UserName',
      fixed: 'left',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.usercode'),
      dataIndex: 'UserCode',
      key: 'UserCode',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.role'),
      dataIndex: 'Level',
      key: 'Level',
      render(text, record) {
        return getUserRole(record);
      },
    },
    {
      title: crmIntlUtil.fmtStr('text.report.on_positions'),
      dataIndex: 'OnPositionNumber',
      key: 'OnPositionNumber',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.positions'),
      dataIndex: 'PositionNumber',
      key: 'PositionNumber',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.meeting_counseling'),
      children: [
        {
          title: crmIntlUtil.fmtStr('text.report.the_standard_of_the_coach'),
          dataIndex: 'MeetingCoachTarget',
          key: 'MeetingCoachTarget',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_the_coach'),
          dataIndex: 'MeetingCoach',
          key: 'MeetingCoach',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_achieving_of_the_coach'),
          dataIndex: 'MeetingCoachAchiRate',
          key: 'MeetingCoachAchiRate',
        },
      ],
    },
    {
      title: crmIntlUtil.fmtStr('text.report.sales_call_counseling'),
      children: [
        {
          title: crmIntlUtil.fmtStr('text.report.the_standard_of_the_coach'),
          dataIndex: 'SalesCoachTarget',
          key: 'SalesCoachTarget',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_the_coach'),
          dataIndex: 'SalesCoach',
          key: 'SalesCoach',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_achieving_of_the_coach'),
          dataIndex: 'SalesCoachAchiRate',
          key: 'SalesCoachAchiRate',
        },
      ],
    },
  ];
  const columnsRSM = [
    {
      title: crmIntlUtil.fmtStr('text.report.username'),
      dataIndex: 'UserName',
      key: 'UserName',
      fixed: 'left',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.usercode'),
      dataIndex: 'UserCode',
      key: 'UserCode',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.role'),
      dataIndex: 'Level',
      key: 'Level',
      render(text, record) {
        return getUserRole(record);
      },
    },
    {
      title: crmIntlUtil.fmtStr('text.report.on_positions'),
      dataIndex: 'OnPositionNumber',
      key: 'OnPositionNumber',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.positions'),
      dataIndex: 'PositionNumber',
      key: 'PositionNumber',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.regional_counseling'),
      children: [
        // {
        //   title: crmIntlUtil.fmtStr('text.report.the_standard_of_the_coach'),
        //   dataIndex: 'RegionalCoachTarget',
        //   key: 'RegionalCoachTarget',
        // },
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_the_coach'),
          dataIndex: 'RegionalCoach',
          key: 'RegionalCoach',
        },
        // {
        //   title: crmIntlUtil.fmtStr('text.report.the_achieving_of_the_coach'),
        //   dataIndex: 'RegionalCoachAchiRate',
        //   key: 'RegionalCoachAchiRate',
        // },
      ],
    },
    {
      title: crmIntlUtil.fmtStr('text.report.assist_counseling'),
      children: [
        // {
        //   title: crmIntlUtil.fmtStr('text.report.the_standard_of_the_coach'),
        //   dataIndex: 'AssistCoachTarget',
        //   key: 'AssistCoachTarget',
        // },
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_the_coach'),
          dataIndex: 'AssistCoach',
          key: 'AssistCoach',
        },
        // {
        //   title: crmIntlUtil.fmtStr('text.report.the_achieving_of_the_coach'),
        //   dataIndex: 'AssistCoachAchiRate',
        //   key: 'AssistCoachAchiRate',
        // },
      ],
    },
  ];
  const tablePropsDSM = {
    columns: columnsDSM,
    dataSource: eventTableDataDSM,
    pagination: false,
    bordered: true,
  };
  const tablePropsRSM = {
    columns: columnsRSM,
    dataSource: eventTableDataRSM,
    pagination: false,
    bordered: true,
  };
  return (
    <div className="k_container bg_white">
      <Row
        className={cx(
          sizeStyles['height-50'],
          sizeStyles['lineHeight-50'],
          styles['toolbar-transparent'],
        )}
      >
        <span className={styles['text-title-big']}>
          {crmIntlUtil.fmtStr('text.report.report_detail')}
        </span>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'])}>
        <DateMonthDropDown
          startDate="2018-12"
          defaultValue={YM}
          dispatch={dispatch}
          ns="report_all_product_index/updateDate"
        />
        <div className={utilitiesStyles.right}>
          {/* <Button
            type="primary"
            // onClick={() => {
            //   dispatch({
            //     type: 'report_index/download',
            //     payload: {
            //       type: 'workingDays',
            //     },
            //   });
            // }}
          >
            {crmIntlUtil.fmtStr('text.report.download')}
          </Button> */}
          <Button
            type="primary"
            className={utilitiesStyles['margin-l-5']}
            onClick={() => {
              // hashHistory.push('/report_all_product_rep');
              hashHistory.goBack();
            }}
          >
            {crmIntlUtil.fmtStr('text.report.back')}
          </Button>
        </div>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('label.coach_feedback')}
          {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>
      {is_RSM && <Table {...tablePropsRSM} />}
      {is_DSM && <Table {...tablePropsDSM} />}
    </div>
  );
};
export default connect(mapStateToProps)(CoachDetail);
