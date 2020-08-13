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

const WorkingDetail = ({ dispatch, location, loading, result = {}, YM}) => {

  const { data, Level, is_SM, _SM_text } = handleResult(result);

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
                type: 'workingDays',
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
          {crmIntlUtil.fmtStr('text.report.number_of_working_days_in_the_area')}{_SM_text} {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>

      {
        !is_SM? (
          <UserDetail data={datas[0]}/>
        ): null
      }

      <Table dataSource={datas} pagination={false} rowClassName={rowClassNameForSM(is_SM)}>

        {is_SM? ExtraColumnsForSM: null}

        <Column
          title={crmIntlUtil.fmtStr('text.report.the_totality_of_the_visits')}
          dataIndex="TotalCallNumber"
          key="TotalCallNumber"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.the_number_of_the_target_customers_by_visit')}
          dataIndex="TargetCallNumber"
          key="TargetCallNumber"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.the_number_of_the_non_target_customers_by_visit')}
          dataIndex="NonTargetCallNumber"
          key="NonTargetCallNumber"
        />

        <Column
          title={crmIntlUtil.fmtStr('text.report.the_standard_number_of_working_days_in_the_area')}
          dataIndex="WorkingDaysTarget"
          key="WorkingDaysTarget"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.number_of_working_days_in_the_area')}
          dataIndex="WorkingDays"
          key="WorkingDays"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.the_achieving_number_of_working_days_in_the_area')}
          dataIndex="WorkingDaysAchiRate"
          key="WorkingDaysAchiRate"
        />

      </Table>

    </div>
  );
};

export default connect(mapStateToProps)(WorkingDetail);
