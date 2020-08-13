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

const CustomerNumDetail = ({ dispatch, location, loading, result = {}, YM }) => {
  const { data, Level, is_DSM, is_RSM, is_REP, is_SM } = handleResult(result);
  const { WorkingDays, WorkingDaysTarget, DoctorNumber } = data;
  const getRecordByData = (data) => {
    return {
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
    };
  };

  const datas = getDatas({ is_SM, data, getRecordByData });
  const tableDataRep = [
    {
      name: crmIntlUtil.fmtStr('text.report.doctor'),
      key: '医生',
      number: NumberOrEmpty(data.DoctorNumber),
      targetNumber: NumberOrEmpty(data.DoctorTargetNumber),
      achiRate: NumberOrEmpty(data.DoctorAchiRate),
      nonTargetNumber: NumberOrEmpty(data.DoctorNonTargetNumber),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.business'),
      key: '商业',
      number: NumberOrEmpty(data.DisNumber),
      targetNumber: NumberOrEmpty(data.DisTargetNumber),
      achiRate: NumberOrEmpty(data.DisAchiRate),
      nonTargetNumber: NumberOrEmpty(data.DisNonTargetNumber),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.government_association'),
      key: '政府/学会',
      number: NumberOrEmpty(data.GovSocNumber),
      targetNumber: NumberOrEmpty(data.GovSocTargetNumber),
      achiRate: NumberOrEmpty(data.GovSocAchiRate),
      nonTargetNumber: NumberOrEmpty(data.GovSocNonTargetNumber),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.summary'),
      key: '汇总',
      number: NumberOrEmpty(data.CustomerNumber),
      targetNumber: NumberOrEmpty(data.TargetCustomerNumber),
      achiRate: NumberOrEmpty(data.TargetCustomerRate),
      nonTargetNumber: NumberOrEmpty(data.NonTargetCustomerNumber),
    },
  ];

  const tableDataSM = [
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

      // name:'医生',
      DoctorNumber: NumberOrEmpty(data.DoctorNumber),
      DoctorTargetNumber: NumberOrEmpty(data.DoctorTargetNumber),
      DoctorAchiRate: NumberOrEmpty(data.DoctorAchiRate),
      DoctorNonTargetNumber: NumberOrEmpty(data.DoctorNonTargetNumber),

      // name:'商业',
      DisNumber: NumberOrEmpty(data.DisNumber),
      DisTargetNumber: NumberOrEmpty(data.DisTargetNumber),
      DisAchiRate: NumberOrEmpty(data.DisAchiRate),
      DisNonTargetNumber: NumberOrEmpty(data.DisNonTargetNumber),

      // name:'政府/学会',
      GovSocNumber: NumberOrEmpty(data.GovSocNumber),
      GovSocTargetNumber: NumberOrEmpty(data.GovSocTargetNumber),
      GovSocAchiRate: NumberOrEmpty(data.GovSocAchiRate),
      GovSocNonTargetNumber: NumberOrEmpty(data.GovSocNonTargetNumber),

      // name:'汇总',
      CustomerNumber: NumberOrEmpty(data.CustomerNumber),
      TargetCustomerNumber: NumberOrEmpty(data.TargetCustomerNumber),
      TargetCustomerRate: NumberOrEmpty(data.TargetCustomerRate),
      NonTargetCustomerNumber: NumberOrEmpty(data.NonTargetCustomerNumber),
    },
  ];

  const columnsRep = [
    {
      title: crmIntlUtil.fmtStr('text.report.type'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.the_number_of_the_target_customers'),
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.the_standard_of_the_target_customers'),
      dataIndex: 'targetNumber',
      key: 'targetNumber',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.achieving_rate'),
      dataIndex: 'achiRate',
      key: 'achiRate',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.the_number_of_the_non_target_customers'),
      dataIndex: 'nonTargetNumber',
      key: 'nonTargetNumber',
    },
  ];

  const columnsSM = [
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
      title: crmIntlUtil.fmtStr('text.report.doctor'),
      children: [
        {
          title: crmIntlUtil.fmtStr('text.report.the_standard_of_the_target_customers'),
          dataIndex: 'DoctorTargetNumber',
          key: 'DoctorTargetNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_the_target_customers'),
          dataIndex: 'DoctorNumber',
          key: 'DoctorNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.achieving_rate'),
          dataIndex: 'DoctorAchiRate',
          key: 'DoctorAchiRate',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_the_non_target_customers'),
          dataIndex: 'DoctorNonTargetNumber',
          key: 'DoctorNonTargetNumber',
        },
      ],
    },
    {
      title: crmIntlUtil.fmtStr('text.report.business'),
      children: [
        {
          title: crmIntlUtil.fmtStr('text.report.the_standard_of_the_target_customers'),
          dataIndex: 'DisTargetNumber',
          key: 'DisTargetNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_the_target_customers'),
          dataIndex: 'DisNumber',
          key: 'DisNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.achieving_rate'),
          dataIndex: 'DisAchiRate',
          key: 'DisAchiRate',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_the_non_target_customers'),
          dataIndex: 'DisNonTargetNumber',
          key: 'DisNonTargetNumber',
        },
      ],
    },
    {
      title: crmIntlUtil.fmtStr('text.report.government_association'),
      children: [
        {
          title: crmIntlUtil.fmtStr('text.report.the_standard_of_the_target_customers'),
          dataIndex: 'GovSocTargetNumber',
          key: 'GovSocTargetNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_the_target_customers'),
          dataIndex: 'GovSocNumber',
          key: 'GovSocNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.achieving_rate'),
          dataIndex: 'GovSocAchiRate',
          key: 'GovSocAchiRate',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_the_non_target_customers'),
          dataIndex: 'GovSocNonTargetNumber',
          key: 'GovSocNonTargetNumber',
        },
      ],
    },
    {
      title: crmIntlUtil.fmtStr('text.report.summary'),
      children: [
        {
          title: crmIntlUtil.fmtStr('text.report.the_standard_of_the_target_customers'),
          dataIndex: 'TargetCustomerNumber',
          key: 'TargetCustomerNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_the_target_customers'),
          dataIndex: 'CustomerNumber',
          key: 'CustomerNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.achieving_rate'),
          dataIndex: 'TargetCustomerRate',
          key: 'TargetCustomerRate',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_the_non_target_customers'),
          dataIndex: 'NonTargetCustomerNumber',
          key: 'NonTargetCustomerNumber',
        },
      ],
    },
  ];
  const tableProps = {
    columns: is_SM ? columnsSM : columnsRep,
    dataSource: is_SM ? tableDataSM : tableDataRep,
    pagination: false,
    bordered: true,
    scroll: { x: 2000 },
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
          {crmIntlUtil.fmtStr('text.report.the_number_of_the_target_doctors')}
          {/* {_SM_text} */}
          {/* <strong>{DoctorNumber}</strong> */}
          {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>
      {!is_SM ? <UserDetail data={datas[0]} /> : null}
      <Table {...tableProps} />
    </div>
  );
};
export default connect(mapStateToProps)(CustomerNumDetail);
