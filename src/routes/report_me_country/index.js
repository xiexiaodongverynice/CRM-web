import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button, Select } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import sizeStyles from '../../themes/size.less';
import styles from '../report/index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { handleResult } from '../report_me/helpers';
import { getSubWhatDatas, getSubDatas, getDatas, rowClassNameForSM, handleRecord } from '../report/helpers';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { DateMonthDropDown, craftSubordinatesSeletor } from '../report/commonElements';
import { getRecordByData as getSupportRecordData, craftSupportTable } from '../report_me/support';
import { craftSummaryTable } from './commonElements';
import { getRecordByData } from './helpers';

const ReportMeCountryIndex = ({ dispatch, location, loading, result = {}, YM, subordinates, kpiUserId, kpiUserLevel}) => {

  const { data } = handleResult(result);

  /**
   * 下属
   */
  let staffs = getSubWhatDatas(data, getRecordByData, '_staff', true);

  if(kpiUserLevel > 0) {
    staffs = [getRecordByData(data), ...staffs];
  }

  return (
    <div className="k_container bg_white">

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles['toolbar-transparent'])}>
        <span className={styles['text-title-big']}>
        {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'])}>
        <DateMonthDropDown startDate="2017-12" defaultValue={YM} dispatch={dispatch} ns="report_index_me_country/updateDate"/>
        {
          craftSubordinatesSeletor(kpiUserId, subordinates, dispatch, 'report_index_me_country/updateDate')
        }
        <div className={utilitiesStyles.right}>
          <Button type="primary" onClick={()=>{
            dispatch({
              type: 'report_index_me_country/download',
              payload: {
                type: 'summary',
              },
            });
          }}>{crmIntlUtil.fmtStr('text.report.download')}</Button>
        </div>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.the_summary_of_the_event_report')}
        </span>
      </Row>

      {
        craftSummaryTable(staffs, loading)
      }

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.the_summary_of_the_event_support_report')}
        </span>
      </Row>

      {
        craftSupportTable(getSubWhatDatas(data, getSupportRecordData, '_subs', true), loading)
      }
    </div>
  );
};

const mapStateToProps = (state) => {
  const { result, YM, subordinates, kpiUserId, kpiUserLevel, loading } = state.report_index_me_country;
  return {
    result,
    YM,
    subordinates,
    kpiUserId,
    kpiUserLevel,
    loading,
  };
};

export default connect(mapStateToProps)(ReportMeCountryIndex);
