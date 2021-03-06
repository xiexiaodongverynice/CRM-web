import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button, DatePicker } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from '../report/index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { handleResult, getUserRole, getDatas, rowClassNameForSM } from '../report/helpers';
import { UserDetail, DateMonthDropDown, ExtraColumnsForSM } from '../report/commonElements';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { mapStateToProps } from './helpers';
import { NumberOrEmpty } from '../../utils/lo';

const { MonthPicker } = DatePicker;
const Column = Table.Column;
const ColumnGroup = Table.ColumnGroup;
const getRecordByData = (data) => {
  return {
    UserName: data.UserName,
    UserCode: data.UserCode,
    Level: data.Level,
    ProductName: data.ProductName,
    OnPositionNumber: NumberOrEmpty(data.OnPositionNumber),
    PositionNumber: NumberOrEmpty(data.PositionNumber),

    AvgCallTarget: NumberOrEmpty(data.AvgCallTarget),
    AvgCallNumber: NumberOrEmpty(data.AvgCallNumber),
    AvgCallAchiRate: NumberOrEmpty(data.AvgCallAchiRate),

  };
};

const AvgCallColumns = [
  <Column
    title={crmIntlUtil.fmtStr('text.report.the_standard_number_of_the_daily_visits')}
    dataIndex="AvgCallTarget"
    key="AvgCallTarget"
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.the_number_of_the_daily_visits')}
    dataIndex="AvgCallNumber"
    key="AvgCallNumber"
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_daily_visits')}
    dataIndex="AvgCallAchiRate"
    key="AvgCallAchiRate"
  />
];

const craftREPElements = (datas) => {
  return [
    <UserDetail data={datas[0]}/>,
    <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles['toolbar-transparent'])}>
      <span className={styles['text-item']}>
        <strong>{crmIntlUtil.fmtStr('text.report.daily_visit')}</strong>
      </span>
    </Row>,
    <Table dataSource={datas} pagination={false}>

      {AvgCallColumns}

    </Table>,
  ];
};

const craftSMElements = (datas, is_SM) => {
  return [
    <Table dataSource={datas} pagination={false} rowClassName={rowClassNameForSM(is_SM)}>

      {ExtraColumnsForSM}

      <ColumnGroup title={crmIntlUtil.fmtStr('text.report.daily_visit')}>
        {AvgCallColumns}
      </ColumnGroup>

    </Table>
  ];
};


const DoctorCallDetail = ({ dispatch, location, loading, result = {}, YM}) => {

  const { data, Level, is_SM, _SM_text, is_REP } = handleResult(result);

  // 拜访频率表格数据
  const datas = getDatas({is_SM, data, getRecordByData});

  return (
    <div className="k_container bg_white">

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles['toolbar-transparent'])}>
        <span className={styles['text-title-big']}>
        {crmIntlUtil.fmtStr('text.report.report_detail')}
        </span>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'])}>
        <DateMonthDropDown startDate="2017-12" defaultValue={YM} dispatch={dispatch} ns="report_index_hk/updateDate"/>
        <div className={utilitiesStyles.right}>
          <Button type="primary" onClick={()=>{
            dispatch({
              type: 'report_index_hk/download',
              payload: {
                type: 'doctorCall',
              },
            });
          }}>{crmIntlUtil.fmtStr('text.report.download')}</Button>
          <Button type="primary" className={utilitiesStyles['margin-l-5']} onClick={() => {
            hashHistory.push('/report_hk');
          }}>{crmIntlUtil.fmtStr('text.report.back')}</Button>
        </div>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.daily_visit')}{_SM_text} {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>

      {is_REP? craftREPElements(datas): null}
      {is_SM? craftSMElements(datas, is_SM): null}

    </div>
  );
};

export default connect(mapStateToProps)(DoctorCallDetail);
