import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Icon, Row, Col, Button, Tag, Popconfirm, DatePicker, Tabs } from 'antd';
import { BarChart, Tooltip, Legend, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Text } from 'recharts';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from '../report/index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { handleResult, barFill } from '../report/helpers';
import { mapStateToProps } from './helpers';
import { DateMonthDropDown } from '../report/commonElements';
import { NumberOrEmpty } from '../../utils/lo';
import DoctorCallTimesDetail from './doctorCallTimesDetail';

const { MonthPicker } = DatePicker;
const Column = Table.Column;
const TabPane = Tabs.TabPane;

const ReportIndex = ({ dispatch, location, loading, result = {}, YM, activeTabKey}) => {

  const { data, Level, is_SM, _SM_text } = handleResult(result);
  const { WorkingDays, WorkingDaysTarget } = data;

  // 拜访频率数据
  const doctorCallData = [{
    name: crmIntlUtil.fmtStr('text.report.level_a'),
    doctorCallNumber: NumberOrEmpty(data.ADoctorCallNumber),
    doctorNumber: NumberOrEmpty(data.ADoctor),
    doctorCallTarget: NumberOrEmpty(data.ADoctorCallTarget),
    doctorCallRate: NumberOrEmpty(data.ADoctorCallRate),
    doctorCallAchiRate: NumberOrEmpty(data.ADoctorCallAchiRate),
    doctorCoverNumber: NumberOrEmpty(data.ADoctorCoverNumber),
    doctorCoverRateTarget: NumberOrEmpty(data.ADoctorCoverRateTarget),
    doctorCoverRate: NumberOrEmpty(data.ADoctorCoverRate),
    doctorCoverRateAchiRate: NumberOrEmpty(data.ADoctorCoverRateAchiRate),
    onTargetDoctorNumber: NumberOrEmpty(data.AOnTargetDoctorNumber),
    validDoctorCoverRateTarget: NumberOrEmpty(data.AValidDoctorCoverRateTarget),
    validDoctorCoverRate: NumberOrEmpty(data.AValidDoctorCoverRate),
    validDoctorCoverRateAchiRate: NumberOrEmpty(data.AValidDoctorCoverRateAchiRate),
  }, {
    name: crmIntlUtil.fmtStr('text.report.level_b'),
    doctorCallNumber: NumberOrEmpty(data.BDoctorCallNumber),
    doctorNumber: NumberOrEmpty(data.BDoctor),
    doctorCallTarget: NumberOrEmpty(data.BDoctorCallTarget),
    doctorCallRate: NumberOrEmpty(data.BDoctorCallRate),
    doctorCallAchiRate: NumberOrEmpty(data.BDoctorCallAchiRate),
    doctorCoverNumber: NumberOrEmpty(data.BDoctorCoverNumber),
    doctorCoverRateTarget: NumberOrEmpty(data.BDoctorCoverRateTarget),
    doctorCoverRate: NumberOrEmpty(data.BDoctorCoverRate),
    doctorCoverRateAchiRate: NumberOrEmpty(data.BDoctorCoverRateAchiRate),
    onTargetDoctorNumber: NumberOrEmpty(data.BOnTargetDoctorNumber),
    validDoctorCoverRateTarget: NumberOrEmpty(data.BValidDoctorCoverRateTarget),
    validDoctorCoverRate: NumberOrEmpty(data.BValidDoctorCoverRate),
    validDoctorCoverRateAchiRate: NumberOrEmpty(data.BValidDoctorCoverRateAchiRate),
  }, {
    name: crmIntlUtil.fmtStr('text.report.level_c'),
    doctorCallNumber: NumberOrEmpty(data.CDoctorCallNumber),
    doctorNumber: NumberOrEmpty(data.CDoctor),
    doctorCallTarget: NumberOrEmpty(data.CDoctorCallTarget),
    doctorCallRate: NumberOrEmpty(data.CDoctorCallRate),
    doctorCallAchiRate: NumberOrEmpty(data.CDoctorCallAchiRate),
    doctorCoverNumber: NumberOrEmpty(data.CDoctorCoverNumber),
    doctorCoverRateTarget: NumberOrEmpty(data.CDoctorCoverRateTarget),
    doctorCoverRate: NumberOrEmpty(data.CDoctorCoverRate),
    doctorCoverRateAchiRate: NumberOrEmpty(data.CDoctorCoverRateAchiRate),
    onTargetDoctorNumber: NumberOrEmpty(data.COnTargetDoctorNumber),
    validDoctorCoverRateTarget: NumberOrEmpty(data.CValidDoctorCoverRateTarget),
    validDoctorCoverRate: NumberOrEmpty(data.CValidDoctorCoverRate),
    validDoctorCoverRateAchiRate: NumberOrEmpty(data.CValidDoctorCoverRateAchiRate),
  }, {
    name: crmIntlUtil.fmtStr('text.report.level_v'),
    doctorCallNumber: NumberOrEmpty(data.VDoctorCallNumber),
    doctorNumber: NumberOrEmpty(data.VDoctor),
    doctorCallTarget: NumberOrEmpty(data.VDoctorCallTarget),
    doctorCallRate: NumberOrEmpty(data.VDoctorCallRate),
    doctorCallAchiRate: NumberOrEmpty(data.VDoctorCallAchiRate),
    doctorCoverNumber: NumberOrEmpty(data.VDoctorCoverNumber),
    doctorCoverRateTarget: NumberOrEmpty(data.VDoctorCoverRateTarget),
    doctorCoverRate: NumberOrEmpty(data.VDoctorCoverRate),
    doctorCoverRateAchiRate: NumberOrEmpty(data.VDoctorCoverRateAchiRate),
    onTargetDoctorNumber: NumberOrEmpty(data.VOnTargetDoctorNumber),
    validDoctorCoverRateTarget: NumberOrEmpty(data.VValidDoctorCoverRateTarget),
    validDoctorCoverRate: NumberOrEmpty(data.VValidDoctorCoverRate),
    validDoctorCoverRateAchiRate: NumberOrEmpty(data.VValidDoctorCoverRateAchiRate),
  }];

  // 日均拜访-图表
  const doctorCallNumberChartData = [{
    name: crmIntlUtil.fmtStr('text.report.daily_visit'),
    avgCallTarget: NumberOrEmpty(data.AvgCallTarget),
    avgCallNumber: NumberOrEmpty(data.AvgCallNumber),
  }, {
    name: crmIntlUtil.fmtStr('text.report.daily_visit_with_ppt'),
    avgCallTarget: NumberOrEmpty(data.AvgCLMTarget),
    avgCallNumber: NumberOrEmpty(data.AvgCLMNumber),
  }];

  // 日均拜访-表格
  const doctorCallNumberTableData = [{
    name: crmIntlUtil.fmtStr('text.report.average_number_of_the_daily_visits'),
    avgCallNumber: NumberOrEmpty(data.AvgCallNumber),
    avgCLMNumber: NumberOrEmpty(data.AvgCLMNumber),
    avgCallTarget: NumberOrEmpty(data.AvgCallTarget),
    avgCallAchiRate: NumberOrEmpty(data.AvgCallAchiRate),
    avgCLMTarget: NumberOrEmpty(data.AvgCLMTarget),
    avgCLMAchiRate: NumberOrEmpty(data.AvgCLMAchiRate),
  }];

  // 客户数图表数据
  const doctorNumberData = [{
    name: crmIntlUtil.fmtStr('text.report.number_of_the_doctors'),
    doctorNumber: is_SM? NumberOrEmpty(data.AvgDoctorNumber): NumberOrEmpty(data.DoctorNumber),
    doctorTargetNumber: NumberOrEmpty(data.DoctorTargetNumber),
    doctorAchiRate: NumberOrEmpty(data.DoctorAchiRate),
  }];

  // 会议活动次数
  let eventData;
  if(is_SM){
    eventData = [{
      name: crmIntlUtil.fmtStr('text.report.team_with_an_average'),
      eventTarget: NumberOrEmpty(data.EventTarget),
      eventAchiRate: NumberOrEmpty(data.EventAchiRate),
      eventNumber: NumberOrEmpty(data.AvgEventNumber),
    }];
  }else{
    eventData = [{
      name: crmIntlUtil.fmtStr('text.report.event'),
      eventTarget: NumberOrEmpty(data.EventTarget),
      eventAchiRate: NumberOrEmpty(data.EventAchiRate),
      eventNumber: NumberOrEmpty(data.EventNumber),
    }];
  }

  const coachData = [{
    name: crmIntlUtil.fmtStr('text.report.sales_call_counseling'),
    coachTarget: NumberOrEmpty(data.CallCoachTarget),
    coachNumber: NumberOrEmpty(data.CallCoachNumber),
    coachAchiRate: NumberOrEmpty(data.CallCoachAchiRate),
  }, {
    name: crmIntlUtil.fmtStr('text.report.office_counseling'),
    coachTarget: NumberOrEmpty(data.EventCoachTarget),
    coachNumber: NumberOrEmpty(data.EventCoachNumber),
    coachAchiRate: NumberOrEmpty(data.EventCoachAchi),
  }];

  return (
    <div className="k_container bg_white">

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles['toolbar-transparent'])}>
        <span className={styles['text-title-big']}>
        {
          crmIntlUtil.fmtStr('text.report.report')
        }
        </span>
      </Row>

      <Tabs defaultActiveKey={activeTabKey} onChange={(index)=>{
        dispatch({
          type: 'report_index_tw/updateState',
          payload: {
            activeTabKey: index,
          },
        });
      }} tabBarExtraContent={
        <DateMonthDropDown startDate="2017-12" defaultValue={YM} dispatch={dispatch} ns="report_index_tw/updateDate"/>
      }>
        {
          !is_SM? (
            <TabPane tab={crmIntlUtil.fmtStr('text.report.the_number_of_the_customer_visit')} key="0">
              <DoctorCallTimesDetail></DoctorCallTimesDetail>
            </TabPane>
          ): null
        }
        <TabPane tab={crmIntlUtil.fmtStr('text.report.daily_statistics')} key={is_SM? "0": "1"}>

          <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
            <span className={styles['text-item']}>
              {crmIntlUtil.fmtStr('text.report.number_of_working_days_in_the_area')}{_SM_text}: <strong>{WorkingDays}</strong>
            </span>
            <span className={cx(styles['text-item'], styles['text-item'])}>
              {crmIntlUtil.fmtStr('text.report.the_standard_number_of_working_days_in_the_area')}{_SM_text}: <strong>{WorkingDaysTarget}</strong>
            </span>
            <span className={utilitiesStyles['right']}>
              <a onClick={() => {
                hashHistory.push('/report_tw/workingDetail');
              }}>
                {
                  crmIntlUtil.fmtStr('text.report.details')
                }
              </a>
            </span>
          </Row>

          <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
            <span className={styles['text-item']}>
              {crmIntlUtil.fmtStr('text.report.the_number_of_the_target_doctors')}{_SM_text}
            </span>

            <span className={utilitiesStyles['right']}>
              <a onClick={() => {
                hashHistory.push('/report_tw/doctorDetail');
              }}>{crmIntlUtil.fmtStr('text.report.details')}</a>
            </span>
          </Row>
          <ResponsiveContainer height={200}>
            <BarChart data={doctorNumberData} margin={{ left: 20, right: 20 }} layout={'vertical'} barGap={30} barSize={10}>
              <YAxis dataKey="name" type="category" hide={true}/>
              <XAxis type="number"/>
              <Tooltip />
              <Legend verticalAlign="top" iconType="circle"/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Bar dataKey="doctorTargetNumber" name={crmIntlUtil.fmtStr('text.report.the_standard_number_of_the_target_doctors')} fill={barFill.green} label/>
              <Bar dataKey="doctorNumber" name={crmIntlUtil.fmtStr('text.report.the_number_of_the_target_doctors')} fill={barFill.blue} label/>
            </BarChart>
          </ResponsiveContainer>

          <Table dataSource={doctorNumberData} pagination={false}>
            <Column
              title={is_SM? `${crmIntlUtil.fmtStr('text.report.the_number_of_the_target_doctors')}(${crmIntlUtil.fmtStr('text.report.team_with_an_average')})`: crmIntlUtil.fmtStr('text.report.the_number_of_the_target_doctors')}
              dataIndex="doctorNumber"
              key="doctorNumber"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_standard_number_of_the_target_doctors')}
              dataIndex="doctorTargetNumber"
              key="doctorTargetNumber"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_target_doctors')}
              dataIndex="doctorAchiRate"
              key="doctorAchiRate"
            />
          </Table>

        </TabPane>
        <TabPane tab={crmIntlUtil.fmtStr('text.report.visit_about')} key="2">

          <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
            <span className={styles['text-item']}>
              {crmIntlUtil.fmtStr('text.report.daily_visit')}{_SM_text}
            </span>
            <span className={utilitiesStyles['right']}>
              <a onClick={() => {
                hashHistory.push('/report_tw/doctorCallDetail');
              }}>{crmIntlUtil.fmtStr('text.report.details')}</a>
            </span>
          </Row>

          <ResponsiveContainer height={200}>
            <BarChart data={doctorCallNumberChartData} margin={{ left: 70, right: 20 }} layout={'vertical'} barGap={10} barSize={10}>
              <YAxis dataKey="name" type="category"/>
              <XAxis type="number"/>
              <Tooltip />
              <Legend verticalAlign="top" iconType="circle"/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Bar dataKey="avgCallTarget" fill={barFill.green} name={crmIntlUtil.fmtStr('text.report.the_standard_number_of_the_visits')} label/>
              <Bar dataKey="avgCallNumber" fill={barFill.blue} name={crmIntlUtil.fmtStr('text.report.the_number_of_the_visits')} label/>
            </BarChart>
          </ResponsiveContainer>

          <Table dataSource={doctorCallNumberTableData} pagination={false}>
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_standard_number_of_the_daily_visits')}
              dataIndex="avgCallTarget"
              key="avgCallTarget"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_number_of_the_daily_visits')}
              dataIndex="avgCallNumber"
              key="avgCallNumber"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_daily_visits')}
              dataIndex="avgCallAchiRate"
              key="avgCallAchiRate"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_number_of_the_daily_visits_with_ppt')}
              dataIndex="avgCLMNumber"
              key="avgCLMNumber"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_standard_number_of_the_daily_visits_with_ppt')}
              dataIndex="avgCLMTarget"
              key="avgCLMTarget"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_daily_visits_with_ppt')}
              dataIndex="avgCLMAchiRate"
              key="avgCLMAchiRate"
            />
          </Table>

          <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
            <span className={styles['text-item']}>
              {crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}{_SM_text}
            </span>
            <span className={utilitiesStyles['right']}>
              <a onClick={() => {
                hashHistory.push('/report_tw/doctorCallRateDetail');
              }}>{crmIntlUtil.fmtStr('text.report.details')}</a>
            </span>
          </Row>

          <ResponsiveContainer height={300}>
            <BarChart data={doctorCallData} margin={{ left: 0, right: 20 }} layout={'vertical'} barGap={10} barSize={10}>
              <YAxis dataKey="name" type="category"/>
              <XAxis type="number"/>
              <Tooltip />
              <Legend verticalAlign="top" iconType="circle"/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Bar dataKey="doctorCallTarget" fill={barFill.green} name={crmIntlUtil.fmtStr('text.report.the_standard_rate_of_the_visits')} label/>
              <Bar dataKey="doctorCallRate" fill={barFill.blue} name={crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')} label/>
            </BarChart>
          </ResponsiveContainer>

          <Table dataSource={doctorCallData} pagination={false}>
            <Column
              title={crmIntlUtil.fmtStr('text.report.level')}
              dataIndex="name"
              key="name"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_number_of_the_visits')}
              dataIndex="doctorCallNumber"
              key="doctorCallNumber"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.number_of_the_doctors')}
              dataIndex="doctorNumber"
              key="doctorNumber"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_standard_rate_of_the_visits')}
              dataIndex="doctorCallTarget"
              key="doctorCallTarget"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}
              dataIndex="doctorCallRate"
              key="doctorCallRate"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_visits')}
              dataIndex="doctorCallAchiRate"
              key="doctorCallAchiRate"
            />
          </Table>

          <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
            <span className={styles['text-item']}>
              {crmIntlUtil.fmtStr('text.report.the_coverage_rate_of_the_doctors')}{_SM_text}
            </span>
            <span className={utilitiesStyles['right']}>
              <a onClick={() => {
                hashHistory.push('/report_tw/doctorCallCoverDetail');
              }}>{crmIntlUtil.fmtStr('text.report.details')}</a>
            </span>
          </Row>

          <ResponsiveContainer height={300}>
            <BarChart data={doctorCallData} margin={{ left: 0, right: 20 }} layout={'vertical'} barGap={10} barSize={10}>
              <YAxis dataKey="name" type="category"/>
              <XAxis type="number"/>
              <Tooltip />
              <Legend verticalAlign="top" iconType="circle"/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Bar dataKey="doctorCoverRateTarget" fill={barFill.green} name={crmIntlUtil.fmtStr('text.report.the_standard_coverage_rate_of_the_doctors')} label/>
              <Bar dataKey="doctorCoverRate" fill={barFill.blue} name={crmIntlUtil.fmtStr('text.report.the_coverage_rate_of_the_doctors')} label/>
            </BarChart>
          </ResponsiveContainer>

          <Table dataSource={doctorCallData} pagination={false}>
            <Column
              title={crmIntlUtil.fmtStr('text.report.level')}
              dataIndex="name"
              key="name"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_coverage_rate_of_the_doctors_by_visit')}
              dataIndex="doctorCoverNumber"
              key="doctorCoverNumber"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.number_of_the_doctors')}
              dataIndex="doctorNumber"
              key="doctorNumber"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_standard_coverage_rate_of_the_doctors')}
              dataIndex="doctorCoverRateTarget"
              key="doctorCoverRateTarget"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_coverage_rate_of_the_doctors')}
              dataIndex="doctorCoverRate"
              key="doctorCoverRate"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_achieving_coverage_rate_of_the_doctors')}
              dataIndex="doctorCoverRateAchiRate"
              key="doctorCoverRateAchiRate"
            />
          </Table>

          <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
            <span className={styles['text-item']}>
              {crmIntlUtil.fmtStr('text.report.the_effective_coverage_rate_of_the_visits')}{_SM_text}
            </span>
            <span className={utilitiesStyles['right']}>
              <a onClick={() => {
                hashHistory.push('/report_tw/validDoctorCallCoverDetail');
              }}>{crmIntlUtil.fmtStr('text.report.details')}</a>
            </span>
          </Row>

          <ResponsiveContainer height={300}>
            <BarChart data={doctorCallData} margin={{ left: 0, right: 20 }} layout={'vertical'} barGap={10} barSize={10}>
              <YAxis dataKey="name" type="category"/>
              <XAxis type="number"/>
              <Tooltip />
              <Legend verticalAlign="top" iconType="circle"/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Bar dataKey="validDoctorCoverRateTarget" fill={barFill.green} name={crmIntlUtil.fmtStr('text.report.the_effective_standard_coverage_rate_of_the_visits')} label/>
              <Bar dataKey="validDoctorCoverRate" fill={barFill.blue} name={crmIntlUtil.fmtStr('text.report.the_effective_coverage_rate_of_the_visits')} label/>
            </BarChart>
          </ResponsiveContainer>

          <Table dataSource={doctorCallData} pagination={false}>
            <Column
              title={crmIntlUtil.fmtStr('text.report.level')}
              dataIndex="name"
              key="name"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_number_of_the_doctors_by_standard_visit')}
              dataIndex="onTargetDoctorNumber"
              key="onTargetDoctorNumber"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.number_of_the_doctors')}
              dataIndex="doctorNumber"
              key="doctorNumber"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_effective_standard_coverage_rate_of_the_visits')}
              dataIndex="validDoctorCoverRateTarget"
              key="validDoctorCoverRateTarget"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_effective_coverage_rate_of_the_visits')}
              dataIndex="validDoctorCoverRate"
              key="validDoctorCoverRate"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_effective_coverage_by_visit')}
              dataIndex="validDoctorCoverRateAchiRate"
              key="validDoctorCoverRateAchiRate"
            />
          </Table>

        </TabPane>
        <TabPane tab={crmIntlUtil.fmtStr('text.report.event_about')} key="3">
          <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
            <span className={styles['text-item']}>
            {crmIntlUtil.fmtStr('text.report.number_of_the_mettings')}
            </span>

            <span className={utilitiesStyles['right']}>
              <a onClick={() => {
                hashHistory.push('/report_tw/eventDetail');
              }}>{crmIntlUtil.fmtStr('text.report.details')}</a>
            </span>
          </Row>
          <ResponsiveContainer height={200}>
            <BarChart data={eventData} margin={{ left: 20, right: 20 }} layout={'vertical'} barGap={30} barSize={10}>
              <YAxis dataKey="name" type="category" hide={!is_SM}/>
              <XAxis type="number"/>
              <Tooltip />
              <Legend verticalAlign="top" iconType="circle"/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Bar dataKey="eventTarget" name={crmIntlUtil.fmtStr('text.report.the_standard_of_the_event')} fill={barFill.green} label/>
              <Bar dataKey="eventNumber" name={crmIntlUtil.fmtStr('text.report.the_complete_number_the_events')} fill={barFill.blue} label/>
            </BarChart>
          </ResponsiveContainer>

          <Table dataSource={eventData} pagination={false}>
            {
              is_SM? (
                <Column
                  title={crmIntlUtil.fmtStr('text.report.statistics_type')}
                  dataIndex="name"
                  key="name"
                />
              ): null
            }
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_standard_of_the_event')}
              dataIndex="eventTarget"
              key="eventTarget"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.the_complete_number_the_events')}
              dataIndex="eventNumber"
              key="eventNumber"
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.event_to_achieve')}
              dataIndex="eventAchiRate"
              key="eventAchiRate"
            />
          </Table>
        </TabPane>

        {
          is_SM? (
            <TabPane tab={crmIntlUtil.fmtStr('text.report.coach_about')} key="4">
              <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
                <span className={styles['text-item']}>
                  {crmIntlUtil.fmtStr('text.report.the_number_the_coaches')}
                </span>
                <span className={utilitiesStyles['right']}>
                  <a onClick={() => {
                    hashHistory.push('/report_tw/coachDetail');
                  }}>{crmIntlUtil.fmtStr('text.report.details')}</a>
                </span>
              </Row>

              <ResponsiveContainer height={300}>
                <BarChart data={coachData} margin={{ left: 20, right: 20 }} layout={'vertical'} barGap={10} barSize={10}>
                  <YAxis dataKey="name" type="category"/>
                  <XAxis type="number"/>
                  <Tooltip />
                  <Legend verticalAlign="top" iconType="circle"/>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <Bar dataKey="coachTarget" fill={barFill.green} name={crmIntlUtil.fmtStr('text.report.the_standard_of_the_coachs')} label/>
                  <Bar dataKey="coachNumber" fill={barFill.blue} name={crmIntlUtil.fmtStr('text.report.the_number_the_coaches')} label/>
                </BarChart>
              </ResponsiveContainer>

              <Table dataSource={coachData} pagination={false}>
                <Column
                  title={crmIntlUtil.fmtStr('text.report.type')}
                  dataIndex="name"
                  key="name"
                />
                <Column
                  title={crmIntlUtil.fmtStr('text.report.the_standard_of_the_coachs')}
                  dataIndex="coachTarget"
                  key="coachTarget"
                />
                <Column
                  title={crmIntlUtil.fmtStr('text.report.the_number_the_coaches')}
                  dataIndex="coachNumber"
                  key="coachNumber"
                />
                <Column
                  title={crmIntlUtil.fmtStr('text.report.coach_to_achieve')}
                  dataIndex="coachAchiRate"
                  key="coachAchiRate"
                />
              </Table>
            </TabPane>
          ): null
        }
      </Tabs>

    </div>
  );
};

export default connect(mapStateToProps)(ReportIndex);
