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

const EventDetail = ({ dispatch, location, loading, result = {}, YM }) => {
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
  const eventTableData = [
    {
      name: crmIntlUtil.fmtStr('text.report.hospital'),
      hospitalEventNumber: NumberOrEmpty(data.HospitalEventNumber),
      hospitalTarget: NumberOrEmpty(data.HospitalTarget),
      hospitalAchiRate: NumberOrEmpty(data.hospitalAchiRate),
    },
  ];
  const eventTableDataSM = [
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

      name: crmIntlUtil.fmtStr('text.report.hospital'),
      hospitalEventNumber: NumberOrEmpty(data.HospitalEventNumber),
      hospitalTarget: NumberOrEmpty(data.HospitalTarget),
      hospitalAchiRate: NumberOrEmpty(data.hospitalAchiRate),
    },
  ];
  const columns = [
    {
      title: crmIntlUtil.fmtStr('text.report.promotional_type'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.organization_frequency'),
      dataIndex: 'hospitalEventNumber',
      key: 'hospitalEventNumber',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.target_frequency'),
      dataIndex: 'hospitalTarget',
      key: 'hospitalTarget',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.achieving'),
      dataIndex: 'hospitalAchiRate',
      key: 'hospitalAchiRate',
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
      title: crmIntlUtil.fmtStr('text.report.promotional_type'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.organization_frequency'),
      dataIndex: 'hospitalEventNumber',
      key: 'hospitalEventNumber',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.target_frequency'),
      dataIndex: 'hospitalTarget',
      key: 'hospitalTarget',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.achieving'),
      dataIndex: 'hospitalAchiRate',
      key: 'hospitalAchiRate',
    },
  ];
  const tableProps = {
    columns: columns,
    dataSource: eventTableData,
    pagination: false,
  };
  const tablePropsSM = {
    columns: columnsSM,
    dataSource: eventTableDataSM,
    pagination: false,
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
          {crmIntlUtil.fmtStr('text.report.number_of_the_mettings')}
          {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>
      {is_SM ? (
        <Table {...tablePropsSM} />
      ) : (
        <div>
          <UserDetail data={datas[0]} />
          <Table {...tableProps} />
        </div>
      )}
    </div>
  );
};
export default connect(mapStateToProps)(EventDetail);
