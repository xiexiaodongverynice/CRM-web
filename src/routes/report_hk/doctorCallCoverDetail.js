import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button, DatePicker } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from '../report/index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { handleResult, getUserRole, getDatas, rowClassNameForSM,stages } from '../report/helpers';
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

    ADoctorCoverNumber: NumberOrEmpty(data.ADoctorCoverNumber),
    ADoctorNumber: NumberOrEmpty(data.ADoctor),
    ADoctorCoverRateTarget: NumberOrEmpty(data.ADoctorCoverRateTarget),
    ADoctorCoverRate: NumberOrEmpty(data.ADoctorCoverRate),
    ADoctorCoverRateAchiRate: NumberOrEmpty(data.ADoctorCoverRateAchiRate),

    BDoctorCoverNumber: NumberOrEmpty(data.BDoctorCoverNumber),
    BDoctorNumber: NumberOrEmpty(data.BDoctor),
    BDoctorCoverRateTarget: NumberOrEmpty(data.BDoctorCoverRateTarget),
    BDoctorCoverRate: NumberOrEmpty(data.BDoctorCoverRate),
    BDoctorCoverRateAchiRate: NumberOrEmpty(data.BDoctorCoverRateAchiRate),

    CDoctorCoverNumber: NumberOrEmpty(data.CDoctorCoverNumber),
    CDoctorNumber: NumberOrEmpty(data.CDoctor),
    CDoctorCoverRateTarget: NumberOrEmpty(data.CDoctorCoverRateTarget),
    CDoctorCoverRate: NumberOrEmpty(data.CDoctorCoverRate),
    CDoctorCoverRateAchiRate: NumberOrEmpty(data.CDoctorCoverRateAchiRate),

    VDoctorCoverNumber: NumberOrEmpty(data.VDoctorCoverNumber),
    VDoctorNumber: NumberOrEmpty(data.VDoctor),
    VDoctorCoverRateTarget: NumberOrEmpty(data.VDoctorCoverRateTarget),
    VDoctorCoverRate: NumberOrEmpty(data.VDoctorCoverRate),
    VDoctorCoverRateAchiRate: NumberOrEmpty(data.VDoctorCoverRateAchiRate),
  };
};

const craftDoctorCoverColumnsByStage = (stage) => {
  return [
    <Column
      title={crmIntlUtil.fmtStr('text.report.the_number_of_the_customers_by_coverage')}
      dataIndex={`${stage}DoctorCoverNumber`}
      key={`${stage}DoctorCoverNumber`}
      width={120}
    />,
    <Column
      title={crmIntlUtil.fmtStr('text.report.number_of_the_customers')}
      dataIndex={`${stage}DoctorNumber`}
      key={`${stage}DoctorNumber`}
      width={120}
    />,
    <Column
      title={crmIntlUtil.fmtStr('text.report.the_standard_coverage_rate_of_the_customers')}
      dataIndex={`${stage}DoctorCoverRateTarget`}
      key={`${stage}DoctorCoverRateTarget`}
      width={120}
    />,
    <Column
      title={crmIntlUtil.fmtStr('text.report.the_coverage_rate_of_the_customers')}
      dataIndex={`${stage}DoctorCoverRate`}
      key={`${stage}DoctorCoverRate`}
      width={120}
    />,
    <Column
      title={crmIntlUtil.fmtStr('text.report.the_achieving_coverage_rate_of_the_customers')}
      dataIndex={`${stage}DoctorCoverRateAchiRate`}
      key={`${stage}DoctorCoverRateAchiRate`}
      width={120}
    />
  ];
};

const craftREPElements = (datas) => {
  const elements = [
    <UserDetail data={datas[0]}/>
  ];
  stages.forEach(stage => {
    elements.push([
      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles['toolbar-transparent'])}>
        <span className={styles['text-item']}>
          <strong>{crmIntlUtil.fmtStr(`text.report.level_${stage.toLowerCase()}`)}</strong>
        </span>
      </Row>,

      <Table dataSource={datas} pagination={false}>

        {craftDoctorCoverColumnsByStage(stage)}

      </Table>
    ]);
  });
  return _.flatten(elements);
};

const craftSMElements = (datas, is_SM) => {
  return (
    <Table dataSource={datas} pagination={false} scroll={{ x: 3000}} rowClassName={rowClassNameForSM(is_SM)}>

      {ExtraColumnsForSM}

      {
        stages.map(stage => {
          return (
            <ColumnGroup title={crmIntlUtil.fmtStr(`text.report.level_${stage.toLowerCase()}`)}>
              {craftDoctorCoverColumnsByStage(stage)}
            </ColumnGroup>
          );
        })
      }

    </Table>
  );
};

const DoctorCallCoverDetail = ({ dispatch, location, loading, result = {}, YM}) => {

  const { data, Level, is_SM, _SM_text, is_REP } = handleResult(result);

  // 医生覆盖率表格数据
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
                type: 'doctorCallCoverRate',
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
          {crmIntlUtil.fmtStr('text.report.the_coverage_rate_of_the_customers')}{_SM_text} {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>

      {is_REP? craftREPElements(datas): null}
      {is_SM? craftSMElements(datas, is_SM): null}

    </div>
  );
};

export default connect(mapStateToProps)(DoctorCallCoverDetail);
