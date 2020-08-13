import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button, DatePicker } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from './index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { handleResult, mapStateToProps, getDatas, rowClassNameForSM, handleRecord } from './helpers';
import { UserDetail, DateMonthDropDown, ExtraColumnsForSM } from './commonElements';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { NumberOrEmpty } from '../../utils/lo';

const { MonthPicker } = DatePicker;
const Column = Table.Column;
const getRecordByData = (data) => {
  const { is_SM } = handleRecord(data);
  return {
    UserName: data.UserName,
    UserCode: data.UserCode,
    Level: data.Level,
    ProductName: data.ProductName,
    OnPositionNumber: NumberOrEmpty(data.OnPositionNumber),
    PositionNumber: NumberOrEmpty(data.PositionNumber),

    DoctorTargetNumber: NumberOrEmpty(data.DoctorTargetNumber),
    DoctorNumber: is_SM? NumberOrEmpty(data.AvgDoctorNumber): NumberOrEmpty(data.DoctorNumber),
    DoctorNonTargetNumber: NumberOrEmpty(data.DoctorNonTargetNumber),
    DoctorAchiRate: NumberOrEmpty(data.DoctorAchiRate),
  };
};

const DoctorDetail = ({ dispatch, location, loading, result = {}, YM}) => {

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
        <DateMonthDropDown startDate="2017-12" defaultValue={YM} dispatch={dispatch} ns="report_index/updateDate"/>
        <div className={utilitiesStyles.right}>
          <Button type="primary" onClick={()=>{
            dispatch({
              type: 'report_index/download',
              payload: {
                type: 'doctor',
              },
            });
          }}>{crmIntlUtil.fmtStr('text.report.download')}</Button>
          <Button type="primary" className={utilitiesStyles['margin-l-5']} onClick={() => {
            hashHistory.push('/report');
          }}>{crmIntlUtil.fmtStr('text.report.back')}</Button>
        </div>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.the_number_of_the_target_doctors')}{_SM_text} {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>

      {
        !is_SM? (
          <UserDetail data={datas[0]}/>
        ): null
      }

      <Table dataSource={datas} pagination={false} rowClassName={rowClassNameForSM(is_SM)}>

        {
          is_SM? ExtraColumnsForSM: null
        }

        <Column
          title={crmIntlUtil.fmtStr('text.report.the_standard_number_of_the_target_doctors')}
          dataIndex="DoctorTargetNumber"
          key="DoctorTargetNumber"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.the_number_of_the_target_doctors')}
          dataIndex="DoctorNumber"
          key="DoctorNumber"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.the_number_of_the_non_target_doctor')}
          dataIndex="DoctorNonTargetNumber"
          key="DoctorNonTargetNumber"
        />

        <Column
          title={crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_target_doctors')}
          dataIndex="DoctorAchiRate"
          key="DoctorAchiRate"
        />

      </Table>

    </div>
  );
};

export default connect(mapStateToProps)(DoctorDetail);
