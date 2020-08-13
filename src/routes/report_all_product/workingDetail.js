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

const WorkingDetail = ({ dispatch, location, loading, result = {}, YM }) => {
  const { data, Level, is_DSM, is_RSM, is_REP, is_SM } = handleResult(result);
  const { WorkingDays, WorkingDaysTarget } = data;
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
  const afterColumns = [
    {
      title: crmIntlUtil.fmtStr('text.report.the_totality_of_the_visits'),
      dataIndex: 'TotalCallNumber',
      key: 'TotalCallNumber',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.the_number_of_the_target_customers_by_visit'),
      dataIndex: 'TargetCallNumber',
      key: 'TargetCallNumber',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.the_number_of_the_non_target_customers_by_visit'),
      dataIndex: 'NonTargetCallNumber',
      key: 'NonTargetCallNumber',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.the_standard_number_of_working_days_in_the_area'),
      dataIndex: 'WorkingDaysTarget',
      key: 'WorkingDaysTarget',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.number_of_working_days_in_the_area'),
      dataIndex: 'WorkingDays',
      key: 'WorkingDays',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.the_achieving_number_of_working_days_in_the_area'),
      dataIndex: 'WorkingDaysAchiRate',
      key: 'WorkingDaysAchiRate',
    },
  ];
  const beforeColumns = [
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
  ];
  const tableProps = {
    columns: is_SM ? beforeColumns.concat(afterColumns) : afterColumns,
    dataSource: datas,
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
          {crmIntlUtil.fmtStr('text.report.number_of_working_days_in_the_area')}
          {/* {_SM_text} */}
          {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>
      {!is_SM ? <UserDetail data={datas[0]} /> : null}
      <Table {...tableProps} />
    </div>
  );
};
export default connect(mapStateToProps)(WorkingDetail);
