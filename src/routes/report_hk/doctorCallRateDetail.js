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

const getRecordByData = ({ is_SM }) => {
  return (data) => {
    return {
      UserName: data.UserName,
      UserCode: data.UserCode,
      Level: data.Level,
      ProductName: data.ProductName,
      OnPositionNumber: NumberOrEmpty(data.OnPositionNumber),
      PositionNumber: NumberOrEmpty(data.PositionNumber),

      ADoctorCallNumber: NumberOrEmpty(data.ADoctorCallNumber),
      ADoctorNumber: NumberOrEmpty(data.ADoctor),
      ADoctorCallTarget: NumberOrEmpty(data.ADoctorCallTarget),
      ADoctorCallRate: NumberOrEmpty(data.ADoctorCallRate),
      ADoctorCallAchiRate: NumberOrEmpty(data.ADoctorCallAchiRate),

      BDoctorCallNumber: NumberOrEmpty(data.BDoctorCallNumber),
      BDoctorNumber: NumberOrEmpty(data.BDoctor),
      BDoctorCallTarget: NumberOrEmpty(data.BDoctorCallTarget),
      BDoctorCallRate: NumberOrEmpty(data.BDoctorCallRate),
      BDoctorCallAchiRate: NumberOrEmpty(data.BDoctorCallAchiRate),

      CDoctorCallNumber: NumberOrEmpty(data.CDoctorCallNumber),
      CDoctorNumber: NumberOrEmpty(data.CDoctor),
      CDoctorCallTarget: NumberOrEmpty(data.CDoctorCallTarget),
      CDoctorCallRate: NumberOrEmpty(data.CDoctorCallRate),
      CDoctorCallAchiRate: NumberOrEmpty(data.CDoctorCallAchiRate),

      VDoctorCallNumber: NumberOrEmpty(data.VDoctorCallNumber),
      VDoctorNumber: NumberOrEmpty(data.VDoctor),
      VDoctorCallTarget: NumberOrEmpty(data.VDoctorCallTarget),
      VDoctorCallRate: NumberOrEmpty(data.VDoctorCallRate),
      VDoctorCallAchiRate: NumberOrEmpty(data.VDoctorCallAchiRate),

      TargetCallNumber: NumberOrEmpty(data.TargetCallNumber),
      DoctorNumber: NumberOrEmpty(data.DoctorNumber),
      TargetCallRate: NumberOrEmpty(data.TargetCallRate),

      NonTargetCallNumber: NumberOrEmpty(data.NonTargetCallNumber),
      NonTargetCallRate: NumberOrEmpty(data.NonTargetCallRate),
      DoctorNonTargetNumber: NumberOrEmpty(data.DoctorNonTargetNumber),
    };
  };
};

const craftDoctorCallRateColumnsByStage = (stage) => {
  return [
    <Column
      title={crmIntlUtil.fmtStr('text.report.the_number_of_the_visits')}
      dataIndex={`${stage}DoctorCallNumber`}
      key={`${stage}DoctorCallNumber`}
    />,
    <Column
      title={crmIntlUtil.fmtStr('text.report.number_of_the_customers')}
      dataIndex={`${stage}DoctorNumber`}
      key={`${stage}DoctorNumber`}
    />,
    <Column
      title={crmIntlUtil.fmtStr('text.report.the_standard_rate_of_the_visits')}
      dataIndex={`${stage}DoctorCallTarget`}
      key={`${stage}DoctorCallTarget`}
    />,
    <Column
      title={crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}
      dataIndex={`${stage}DoctorCallRate`}
      key={`${stage}DoctorCallRate`}
    />,
    <Column
      title={crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_visits')}
      dataIndex={`${stage}DoctorCallAchiRate`}
      key={`${stage}DoctorCallAchiRate`}
    />
  ];
};

const CommonTargetColumns = [
  <Column
    title={crmIntlUtil.fmtStr('text.report.the_number_of_the_visits')}
    dataIndex="TargetCallNumber"
    key="TargetCallNumber"
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.number_of_the_customers')}
    dataIndex="DoctorNumber"
    key="DoctorNumber"
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}
    dataIndex="TargetCallRate"
    key="TargetCallRate"
  />
];

const CommonNonTargetColumns = [
  <Column
    title={crmIntlUtil.fmtStr('text.report.the_number_of_the_visits')}
    dataIndex="NonTargetCallNumber"
    key="NonTargetCallNumber"
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.number_of_the_customers')}
    dataIndex="DoctorNonTargetNumber"
    key="DoctorNonTargetNumber"
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}
    dataIndex="NonTargetCallRate"
    key="NonTargetCallRate"
  />
];

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
        {craftDoctorCallRateColumnsByStage(stage)}
      </Table>
    ]);
  });

  elements.push([
    <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles['toolbar-transparent'])}>
      <span className={styles['text-item']}>
        <strong>{crmIntlUtil.fmtStr(`text.report.target_customer`)}</strong>
      </span>
    </Row>,
    <Table dataSource={datas} pagination={false}>
      {CommonTargetColumns}
    </Table>
  ]);

  elements.push([
    <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles['toolbar-transparent'])}>
      <span className={styles['text-item']}>
        <strong>{crmIntlUtil.fmtStr(`text.report.non_target_customer`)}</strong>
      </span>
    </Row>,
    <Table dataSource={datas} pagination={false}>
      {CommonNonTargetColumns}
    </Table>
  ]);
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
              {craftDoctorCallRateColumnsByStage(stage)}
            </ColumnGroup>
          );
        })
      }

    <ColumnGroup title={crmIntlUtil.fmtStr('text.report.target_customer')}>
      {CommonTargetColumns}
    </ColumnGroup>

    <ColumnGroup title={crmIntlUtil.fmtStr('text.report.non_target_customer')}>
      {CommonNonTargetColumns}
    </ColumnGroup>

    </Table>
  );
};

const DoctorCallRateDetail = ({ dispatch, location, loading, result = {}, YM}) => {

  const { data, Level, is_SM, _SM_text, is_REP } = handleResult(result);

  // 拜访频率表格数据
  const datas = getDatas({is_SM, data, getRecordByData: getRecordByData({is_SM})});

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
                type: 'doctorCallRate',
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
          {crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}{_SM_text} {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>

      {is_REP? craftREPElements(datas): null}
      {is_SM? craftSMElements(datas, is_SM): null}

    </div>
  );
};

export default connect(mapStateToProps)(DoctorCallRateDetail);
