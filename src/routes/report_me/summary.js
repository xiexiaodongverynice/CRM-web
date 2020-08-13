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
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { DateMonthDropDown } from '../report/commonElements';
import { NumberOrEmpty } from '../../utils/lo';

const { MonthPicker } = DatePicker;
const Column = Table.Column;

const EventSummaryDetail = ({ dispatch, location, loading, result = {}, YM}) => {

  const { data } = handleResult(result);

  const { UserName, Realm } = data;

  // 09/01/2018 - TAG: 汇总数据-table
  const summaryData = [{
    Plans: NumberOrEmpty(data.Plans),
    Completions: NumberOrEmpty(data.Completions),
    CompletionRate: NumberOrEmpty(data.CompletionRate),
    Incompletions: NumberOrEmpty(data.Incompletions),
    Cancels: NumberOrEmpty(data.Cancels),
    Chairmen: NumberOrEmpty(data.Chairmen),
    Speakers: NumberOrEmpty(data.Speakers),
    Attendees: NumberOrEmpty(data.Attendees),
    SubstituteEvents: NumberOrEmpty(data.SubstituteEvents),
    SubstitutedEvents: NumberOrEmpty(data.SubstitutedEvents),
    ActualEvents: NumberOrEmpty(data.ActualEvents),
  }];

  // 09/01/2018 - TAG: 活动分类汇总-table
  const categoryData = [{
    name: crmIntlUtil.fmtStr('text.report.area_category'),
    AC: NumberOrEmpty(data.AreaAC),
    ACChairmen: NumberOrEmpty(data.AreaACChairmen),
    ACSpeakers: NumberOrEmpty(data.AreaACSpeakers),
    ACAttendees: NumberOrEmpty(data.AreaACAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.hospital_category'),
    AC: NumberOrEmpty(data.HospitalAC),
    ACChairmen: NumberOrEmpty(data.HospitalACChairmen),
    ACSpeakers: NumberOrEmpty(data.HospitalACSpeakers),
    ACAttendees: NumberOrEmpty(data.HospitalACAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.department_category'),
    AC: NumberOrEmpty(data.DepartmentAC),
    ACChairmen: NumberOrEmpty(data.DepartmentACChairmen),
    ACSpeakers: NumberOrEmpty(data.DepartmentACSpeakers),
    ACAttendees: NumberOrEmpty(data.DepartmentACAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.city_category'),
    AC: NumberOrEmpty(data.CityAC),
    ACChairmen: NumberOrEmpty(data.CityACChairmen),
    ACSpeakers: NumberOrEmpty(data.CityACSpeakers),
    ACAttendees: NumberOrEmpty(data.CityACAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.roundtable_category'),
    AC: NumberOrEmpty(data.RoundTableAC),
    ACChairmen: NumberOrEmpty(data.RoundTableACChairmen),
    ACSpeakers: NumberOrEmpty(data.RoundTableACSpeakers),
    ACAttendees: NumberOrEmpty(data.RoundTableACAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.mundi_national_category'),
    AC: NumberOrEmpty(data.MundiNationalAC),
    ACChairmen: NumberOrEmpty(data.MundiNationalACChairmen),
    ACSpeakers: NumberOrEmpty(data.MundiNationalACSpeakers),
    ACAttendees: NumberOrEmpty(data.MundiNationalACAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.third_party_category'),
    AC: NumberOrEmpty(data.ThirdPartyAC),
    ACChairmen: NumberOrEmpty(data.ThirdPartyACChairmen),
    ACSpeakers: NumberOrEmpty(data.ThirdPartyACSpeakers),
    ACAttendees: NumberOrEmpty(data.ThirdPartyACAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.abroad_category'),
    AC: NumberOrEmpty(data.AbroadAC),
    ACChairmen: NumberOrEmpty(data.AbroadACChairmen),
    ACSpeakers: NumberOrEmpty(data.AbroadACSpeakers),
    ACAttendees: NumberOrEmpty(data.AbroadACAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.expert_conf_category'),
    AC: NumberOrEmpty(data.ExpertConf),
    ACChairmen: NumberOrEmpty(data.ExpertConfChairmen),
    ACSpeakers: NumberOrEmpty(data.ExpertConfSpeakers),
    ACAttendees: NumberOrEmpty(data.ExpertConfAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.anesthesiology_training_category'),
    AC: NumberOrEmpty(data.AnesthesiologyTraining),
    ACChairmen: NumberOrEmpty(data.AnesthesiologyTrainingChairmen),
    ACSpeakers: NumberOrEmpty(data.AnesthesiologyTrainingSpeakers),
    ACAttendees: NumberOrEmpty(data.AnesthesiologyTrainingAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.business_conf_category'),
    AC: NumberOrEmpty(data.BusinessConf),
    ACChairmen: NumberOrEmpty(data.BusinessConfChairmen),
    ACSpeakers: NumberOrEmpty(data.BusinessConfSpeakers),
    ACAttendees: NumberOrEmpty(data.BusinessConfAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.no_cancer_pain_ward_category'),
    AC: NumberOrEmpty(data.NoCancerPainWard),
    ACChairmen: NumberOrEmpty(data.NoCancerPainWardChairmen),
    ACSpeakers: NumberOrEmpty(data.NoCancerPainWardSpeakers),
    ACAttendees: NumberOrEmpty(data.NoCancerPainWardAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.doc_continuing_edu_category'),
    AC: NumberOrEmpty(data.DocContinuingEdu),
    ACChairmen: NumberOrEmpty(data.DocContinuingEduChairmen),
    ACSpeakers: NumberOrEmpty(data.DocContinuingEduSpeakers),
    ACAttendees: NumberOrEmpty(data.DocContinuingEduAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.mtm_review_meeting_category'),
    AC: NumberOrEmpty(data.MTMReviewMeeting),
    ACChairmen: NumberOrEmpty(data.MTMReviewMeetingChairmen),
    ACSpeakers: NumberOrEmpty(data.MTMReviewMeetingSpeakers),
    ACAttendees: NumberOrEmpty(data.MTMReviewMeetingAttendees),
  },{
    name: crmIntlUtil.fmtStr('text.report.dept_roundtable_case_review_category'),
    AC: NumberOrEmpty(data.DeptRoundTableCaseReview),
    ACChairmen: NumberOrEmpty(data.DeptRoundTableCaseReviewChairmen),
    ACSpeakers: NumberOrEmpty(data.DeptRoundTableCaseReviewSpeakers),
    ACAttendees: NumberOrEmpty(data.DeptRoundTableCaseReviewAttendees),
  }];

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
                type: 'summary',
              },
            });
          }}>{crmIntlUtil.fmtStr('text.report.download')}</Button>
          <Button type="primary" className={utilitiesStyles['margin-l-5']} onClick={() => {
            hashHistory.push('/report_me');
          }}>{crmIntlUtil.fmtStr('text.report.back')}</Button>
        </div>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles['toolbar-transparent'])}>
        <span className={cx(styles['text-item'], utilitiesStyles['margin-l-5'])}>
          {crmIntlUtil.fmtStr('text.report.username')}: <strong>{UserName}</strong>
        </span>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.realm')}: <strong>{Realm}</strong>
        </span>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.the_summary_of_the_event_report')}
        </span>
      </Row>

      <Table dataSource={summaryData} pagination={false}>

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
          title={crmIntlUtil.fmtStr('text.report.event_substitute_events')}
          dataIndex="SubstituteEvents"
          key="SubstituteEvents"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.event_substituted_events')}
          dataIndex="SubstitutedEvents"
          key="SubstitutedEvents"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.event_actual_events')}
          dataIndex="ActualEvents"
          key="ActualEvents"
        />
      </Table>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.the_summary_of_the_event_category')}
        </span>
      </Row>

      <Table dataSource={categoryData} pagination={false}>

        <Column
          title={crmIntlUtil.fmtStr('text.report.event_category')}
          dataIndex="name"
          key="name"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.event_times')}
          dataIndex="AC"
          key="AC"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.event_chairmen')}
          dataIndex="ACChairmen"
          key="ACChairmen"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.event_speakers')}
          dataIndex="ACSpeakers"
          key="ACSpeakers"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.event_attendees')}
          dataIndex="ACAttendees"
          key="ACAttendees"
        />

      </Table>

    </div>
  );
};

export default connect(mapStateToProps)(EventSummaryDetail);
