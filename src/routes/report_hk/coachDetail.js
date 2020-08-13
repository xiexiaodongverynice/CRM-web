import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from '../report/index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { DateMonthDropDown, ExtraColumnsForSM } from '../report/commonElements';
import { handleResult, mapStateToProps, getDatas, rowClassNameForSM, NaNColumnRender } from '../report/helpers';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { NumberOrEmpty } from '../../utils/lo';

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

    CallCoachTarget: NumberOrEmpty(data.CallCoachTarget),
    CallCoachAchiRate: NumberOrEmpty(data.CallCoachAchiRate),
    CallCoachNumber: NumberOrEmpty(data.CallCoachNumber),

    EventCoachNumber: NumberOrEmpty(data.EventCoachNumber),
    EventCoachTarget: NumberOrEmpty(data.EventCoachTarget),
    EventCoachAchi: NumberOrEmpty(data.EventCoachAchi),
  };
};

const CoachDetail = ({ dispatch, location, loading, result = {}, YM}) => {

  const { data, is_SM } = handleResult(result);

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
              type: 'report_index_hk/download',
              payload: {
                type: 'coach',
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
          {crmIntlUtil.fmtStr('text.report.sales_call_counseling_times_report')}
        </span>
      </Row>

      <Table dataSource={datas} pagination={false} rowClassName={rowClassNameForSM(is_SM)}>

        {ExtraColumnsForSM}

        <Column
          title={crmIntlUtil.fmtStr('text.report.the_standard_of_the_coachs')}
          dataIndex="CallCoachTarget"
          key="CallCoachTarget"
          render={NaNColumnRender}
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.the_number_the_coaches')}
          dataIndex="CallCoachNumber"
          key="CallCoachNumber"
          render={NaNColumnRender}
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.coach_to_achieve')}
          dataIndex="CallCoachAchiRate"
          key="CallCoachAchiRate"
          render={NaNColumnRender}
        />

      </Table>

    </div>
  );
};

export default connect(mapStateToProps)(CoachDetail);
