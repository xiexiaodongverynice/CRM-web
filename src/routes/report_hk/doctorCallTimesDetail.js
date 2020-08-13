import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button, DatePicker, Icon } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from '../report/index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { handleResult, getUserRole, getSubWhatDatas } from '../report/helpers';
import { UserDetail, DateMonthDropDown, ExtraColumnsForSM } from '../report/commonElements';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { mapStateToProps } from './helpers';
import { NumberOrEmpty } from '../../utils/lo';
import { craftCallTimesTable } from '../report/commonElements';

const { MonthPicker } = DatePicker;
const Column = Table.Column;

const getRecordByData = (data) => {
  return {
    CustomerName: data.CustomerName,
    CustomerSegmentation: data.CustomerSegmentation,
    CallTarget: NumberOrEmpty(data.CallTarget),
    CallNumber: NumberOrEmpty(data.CallNumber),
    OnTarget: Boolean(data.OnTarget),
  }
}

const DoctorCallTimesDetail = ({ dispatch, location, loading, result = {}, YM}) => {

  const { data, Level } = handleResult(result);

  const summaryData = {
    UserName: data.UserName,
    UserCode: data.UserCode,
    Level: data.Level,
    ProductName: data.ProductName,
    OnPositionNumber: NumberOrEmpty(data.OnPositionNumber),
    PositionNumber: NumberOrEmpty(data.PositionNumber),
  };

  const datas = getSubWhatDatas(data, getRecordByData, "_doctors");

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
                type: 'callTimes',
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
          {crmIntlUtil.fmtStr('text.report.the_number_of_the_customer_times_report')}
        </span>
      </Row>

      <UserDetail data={summaryData}/>

      {
        craftCallTimesTable(datas)
      }

    </div>
  );
};

export default connect(mapStateToProps)(DoctorCallTimesDetail);
