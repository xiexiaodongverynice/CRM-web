import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button, DatePicker } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from '../report/index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { handleResult, getUserRole, getDatas, rowClassNameForSM, stages } from '../report/helpers';
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

    AOnTargetDoctorNumber: NumberOrEmpty(data.AOnTargetDoctorNumber),
    ADoctorNumber: NumberOrEmpty(data.ADoctor),
    AValidDoctorCoverRateTarget: NumberOrEmpty(data.AValidDoctorCoverRateTarget),
    AValidDoctorCoverRate: NumberOrEmpty(data.AValidDoctorCoverRate),
    AValidDoctorCoverRateAchiRate: NumberOrEmpty(data.AValidDoctorCoverRateAchiRate),

    BOnTargetDoctorNumber: NumberOrEmpty(data.BOnTargetDoctorNumber),
    BDoctorNumber: NumberOrEmpty(data.BDoctor),
    BValidDoctorCoverRateTarget: NumberOrEmpty(data.BValidDoctorCoverRateTarget),
    BValidDoctorCoverRate: NumberOrEmpty(data.BValidDoctorCoverRate),
    BValidDoctorCoverRateAchiRate: NumberOrEmpty(data.BValidDoctorCoverRateAchiRate),

    COnTargetDoctorNumber: NumberOrEmpty(data.COnTargetDoctorNumber),
    CDoctorNumber: NumberOrEmpty(data.CDoctor),
    CValidDoctorCoverRateTarget: NumberOrEmpty(data.CValidDoctorCoverRateTarget),
    CValidDoctorCoverRate: NumberOrEmpty(data.CValidDoctorCoverRate),
    CValidDoctorCoverRateAchiRate: NumberOrEmpty(data.CValidDoctorCoverRateAchiRate),

    VOnTargetDoctorNumber: NumberOrEmpty(data.VOnTargetDoctorNumber),
    VDoctorNumber: NumberOrEmpty(data.VDoctor),
    VValidDoctorCoverRateTarget: NumberOrEmpty(data.VValidDoctorCoverRateTarget),
    VValidDoctorCoverRate: NumberOrEmpty(data.VValidDoctorCoverRate),
    VValidDoctorCoverRateAchiRate: NumberOrEmpty(data.VValidDoctorCoverRateAchiRate),
  };
};

const craftColumnsByStage = (stage) => {
  return [
    <Column
      title={crmIntlUtil.fmtStr('text.report.the_number_of_the_customers_by_standard_visit')}
      dataIndex={`${stage}OnTargetDoctorNumber`}
      key={`${stage}OnTargetDoctorNumber`}
    />,
    <Column
      title={crmIntlUtil.fmtStr('text.report.number_of_the_customers')}
      dataIndex={`${stage}DoctorNumber`}
      key={`${stage}DoctorNumber`}
    />,
    <Column
      title={crmIntlUtil.fmtStr('text.report.the_effective_standard_coverage_rate_of_the_visits')}
      dataIndex={`${stage}ValidDoctorCoverRateTarget`}
      key={`${stage}ValidDoctorCoverRateTarget`}
    />,
    <Column
      title={crmIntlUtil.fmtStr('text.report.the_effective_coverage_rate_of_the_visits')}
      dataIndex={`${stage}ValidDoctorCoverRate`}
      key={`${stage}ValidDoctorCoverRate`}
    />,
    <Column
      title={crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_effective_coverage_by_visit')}
      dataIndex={`${stage}ValidDoctorCoverRateAchiRate`}
      key={`${stage}ValidDoctorCoverRateAchiRate`}
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
        {craftColumnsByStage(stage)}
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
              {craftColumnsByStage(stage)}
            </ColumnGroup>
          );
        })
      }

    </Table>
  );
};

const ValidDoctorCallCoverDetail = ({ dispatch, location, loading, result = {}, YM}) => {

  const { data, Level, is_SM, _SM_text, is_REP } = handleResult(result);

  // 有效拜访覆盖率表格数据
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
                type: 'validDoctorCallCover',
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
          {crmIntlUtil.fmtStr('text.report.the_effective_coverage_rate_of_the_visits')}{_SM_text} {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>

      {is_REP? craftREPElements(datas): null}
      {is_SM? craftSMElements(datas, is_SM): null}

    </div>
  );
};

export default connect(mapStateToProps)(ValidDoctorCallCoverDetail);
