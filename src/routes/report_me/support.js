import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button, DatePicker } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from '../report/index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { handleResult, mapStateToProps } from './helpers';
import { getSubDatas } from '../report/helpers';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { DateMonthDropDown } from '../report/commonElements';
import { NumberOrEmpty } from '../../utils/lo';

const Column = Table.Column;

export const getRecordByData = (data) => {
  return {
    ProductLine: data.ProductLine,
    Area: data.Area,
    SalesEmployee: data.SalesEmployee,
    Plans: NumberOrEmpty(data.Plans),
    Completions: NumberOrEmpty(data.Completions),
    CompletionRate: NumberOrEmpty(data.CompletionRate),
    Incompletions: NumberOrEmpty(data.Incompletions),
    Cancels: NumberOrEmpty(data.Cancels),

    Chairmen: NumberOrEmpty(data.Chairmen),
    Speakers: NumberOrEmpty(data.Speakers),
    Attendees: NumberOrEmpty(data.Attendees),
    AreaAC: NumberOrEmpty(data.AreaAC),
    HospitalAC: NumberOrEmpty(data.HospitalAC),
    DepartmentAC: NumberOrEmpty(data.DepartmentAC),
    CityAC: NumberOrEmpty(data.CityAC),
    RoundTableAC: NumberOrEmpty(data.RoundTableAC),
    MundiNationalAC: NumberOrEmpty(data.MundiNationalAC),
    ThirdPartyAC: NumberOrEmpty(data.ThirdPartyAC),
    AbroadAC: NumberOrEmpty(data.AbroadAC),
    ExpertConf: NumberOrEmpty(data.ExpertConf),
    AnesthesiologyTraining: NumberOrEmpty(data.AnesthesiologyTraining),
    BusinessConf: NumberOrEmpty(data.BusinessConf),
    NoCancerPainWard: NumberOrEmpty(data.NoCancerPainWard),
    DocContinuingEdu: NumberOrEmpty(data.DocContinuingEdu),
    MTMReviewMeeting: NumberOrEmpty(data.MTMReviewMeeting),
    DeptRoundTableCaseReview: NumberOrEmpty(data.DeptRoundTableCaseReview),
  }
};

const EventSupportDetail = ({ dispatch, location, loading, result = {}, YM}) => {

  const { data } = handleResult(result);

  const subs = getSubDatas(data, getRecordByData);

  return (
    <div className="k_container bg_white">

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles['toolbar-transparent'])}>
        <span className={styles['text-title-big']}>
        {crmIntlUtil.fmtStr('text.report.report_detail')}
        </span>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'])}>
        <DateMonthDropDown startDate="2017-12" defaultValue={YM} dispatch={dispatch} ns="report_index_me/updateDate"/>
        <div className={utilitiesStyles.right}>
          <Button type="primary" onClick={()=>{
            dispatch({
              type: 'report_index_me/download',
              payload: {
                type: 'support',
              },
            });
          }}>{crmIntlUtil.fmtStr('text.report.download')}</Button>
          <Button type="primary" className={utilitiesStyles['margin-l-5']} onClick={() => {
            hashHistory.push('/report_me');
          }}>{crmIntlUtil.fmtStr('text.report.back')}</Button>
        </div>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.the_summary_of_the_event_support_report')}
        </span>
      </Row>

      {
        craftSupportTable(subs)
      }

    </div>
  );
};

export default connect(mapStateToProps)(EventSupportDetail);
export const craftSupportTable = (subs, loading) => {
  return (
    <Table dataSource={subs} pagination={false} scroll={{ x: 6000}} loading={loading}>

      <Column
        title={crmIntlUtil.fmtStr('text.report.product_line')}
        dataIndex="ProductLine"
        key="ProductLine"
        width="100"
        fixed
      />

      <Column
        title={crmIntlUtil.fmtStr('text.report.event_area')}
        dataIndex="Area"
        key="Area"
        width="100"
        fixed
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.event_sales_employee')}
        dataIndex="SalesEmployee"
        key="SalesEmployee"
        width="200"
        fixed
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.event_plans')}
        dataIndex="Plans"
        key="Plans"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.event_completions')}
        dataIndex="Completions"
        key="Completions"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.event_completion_rate')}
        dataIndex="CompletionRate"
        key="CompletionRate"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.event_incompletions')}
        dataIndex="Incompletions"
        key="Incompletions"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.event_cancels')}
        dataIndex="Cancels"
        key="Cancels"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.event_chairmen')}
        dataIndex="Chairmen"
        key="Chairmen"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.event_speakers')}
        dataIndex="Speakers"
        key="Speakers"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.event_attendees')}
        dataIndex="Attendees"
        key="Attendees"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.area_category')}
        dataIndex="AreaAC"
        key="AreaAC"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.hospital_category')}
        dataIndex="HospitalAC"
        key="HospitalAC"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.department_category')}
        dataIndex="DepartmentAC"
        key="DepartmentAC"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.city_category')}
        dataIndex="CityAC"
        key="CityAC"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.roundtable_category')}
        dataIndex="RoundTableAC"
        key="RoundTableAC"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.mundi_national_category')}
        dataIndex="MundiNationalAC"
        key="MundiNationalAC"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.third_party_category')}
        dataIndex="ThirdPartyAC"
        key="ThirdPartyAC"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.abroad_category')}
        dataIndex="AbroadAC"
        key="AbroadAC"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.expert_conf_category')}
        dataIndex="ExpertConf"
        key="ExpertConf"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.anesthesiology_training_category')}
        dataIndex="AnesthesiologyTraining"
        key="AnesthesiologyTraining"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.business_conf_category')}
        dataIndex="BusinessConf"
        key="BusinessConf"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.no_cancer_pain_ward_category')}
        dataIndex="NoCancerPainWard"
        key="NoCancerPainWard"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.doc_continuing_edu_category')}
        dataIndex="DocContinuingEdu"
        key="DocContinuingEdu"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.mtm_review_meeting_category')}
        dataIndex="MTMReviewMeeting"
        key="MTMReviewMeeting"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.dept_roundtable_case_review_category')}
        dataIndex="DeptRoundTableCaseReview"
        key="DeptRoundTableCaseReview"
      />

    </Table>
  );
};
