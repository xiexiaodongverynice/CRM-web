import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Icon, Row, Col, Button, Tag, Popconfirm, DatePicker, Tabs } from 'antd';
import {
  BarChart,
  Tooltip,
  Legend,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Text,
  PieChart,
  Pie,
  Cell,
  Label,
  LabelList,
} from 'recharts';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from './index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { mapStateToProps, barFill, handleResult, is_iPad } from './helpers';
import { DateMonthDropDown, renderCustomizedLabel } from './commonElements';
import { NumberOrEmpty } from '../../utils/lo';
import { data1, data2, data3, data4, colors, result } from './mock';
const { MonthPicker } = DatePicker;
const Column = Table.Column;
const TabPane = Tabs.TabPane;

const ReportAllProductIndex = ({ dispatch, result = {}, YM, activeTabKey }) => {
  const { data, Level, is_DSM, is_RSM, is_REP, is_SM } = handleResult(result);
  const { WorkingDays, WorkingDaysTarget } = data;
  const is_IPad = is_iPad();
  //汇总客户数
  const customerSummaryData = [
    {
      name: crmIntlUtil.fmtStr('text.report.summary'),
      customerNumber: NumberOrEmpty(data.CustomerNumber),
      customerTargetNumber: NumberOrEmpty(data.CustomerNumber),
      customerAchiRate: NumberOrEmpty(data.CustomerNumber),
    },
  ];

  //日常汇总table
  const dailySummaryTableData = [
    {
      name: crmIntlUtil.fmtStr('text.report.doctor'),
      key: '医生',
      number: NumberOrEmpty(data.DoctorNumber),
      targetNumber: NumberOrEmpty(data.DoctorTargetNumber),
      achiRate: NumberOrEmpty(data.DoctorAchiRate),
      nonTargetNumber: NumberOrEmpty(data.DoctorNonTargetNumber),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.business'),
      key: '商业',
      number: NumberOrEmpty(data.DisNumber),
      targetNumber: NumberOrEmpty(data.DisTargetNumber),
      achiRate: NumberOrEmpty(data.DisAchiRate),
      nonTargetNumber: NumberOrEmpty(data.DisNonTargetNumber),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.government_association'),
      key: '政府/学会',
      number: NumberOrEmpty(data.GovSocNumber),
      targetNumber: NumberOrEmpty(data.GovSocTargetNumber),
      achiRate: NumberOrEmpty(data.GovSocAchiRate),
      nonTargetNumber: NumberOrEmpty(data.GovSocNonTargetNumber),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.summary'),
      key: '汇总',
      number: NumberOrEmpty(data.CustomerNumber),
      targetNumber: NumberOrEmpty(data.TargetCustomerNumber),
      achiRate: NumberOrEmpty(data.TargetCustomerRate),
      nonTargetNumber: NumberOrEmpty(data.NonTargetCustomerNumber),
    },
  ];

  //客户类型分布饼状图
  const customerTypeData = [
    {
      value: NumberOrEmpty(data.DoctorNumber),
      name: crmIntlUtil.fmtStr('text.report.doctor'),
    },
    {
      value: NumberOrEmpty(data.GovSocNumber),
      name: crmIntlUtil.fmtStr('text.report.government_association'),
    },
    {
      value: NumberOrEmpty(data.DisNumber),
      name: crmIntlUtil.fmtStr('text.report.business'),
    },
  ];

  // 拜访相关
  const callNumberData = [
    {
      name: crmIntlUtil.fmtStr('text.report.level_a'),
      callRate: NumberOrEmpty(data.ACustomerCallRate), //频率
      callTarget: NumberOrEmpty(data.ACustomerCallTarget), //标准
    },
    {
      name: crmIntlUtil.fmtStr('text.report.level_b'),
      callRate: NumberOrEmpty(data.BCustomerCallRate),
      callTarget: NumberOrEmpty(data.BCustomerCallTarget),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.level_v'),
      callRate: NumberOrEmpty(data.VCustomerCallRate),
      callTarget: NumberOrEmpty(data.VCustomerCallTarget),
    },
  ];

  // 拜访table
  const callTableData = [
    {
      name: crmIntlUtil.fmtStr('text.report.level_a'),
      key: 'A级',
      callNumber: NumberOrEmpty(data.ACustomerCallNumber),
      customer: NumberOrEmpty(data.ACustomer),
      customerCallRate: NumberOrEmpty(data.ACustomerCallRate),
      customerCallTarget: NumberOrEmpty(data.ACustomerCallTarget),
      customerCallAchiRate: NumberOrEmpty(data.ACustomerCallAchiRate),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.level_b'),
      key: 'B级',
      callNumber: NumberOrEmpty(data.BCustomerCallNumber),
      customer: NumberOrEmpty(data.BCustomer),
      customerCallRate: NumberOrEmpty(data.BCustomerCallRate),
      customerCallTarget: NumberOrEmpty(data.BCustomerCallTarget),
      customerCallAchiRate: NumberOrEmpty(data.BCustomerCallAchiRate),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.level_v'),
      key: 'V级',
      callNumber: NumberOrEmpty(data.VCustomerCallNumber),
      customer: NumberOrEmpty(data.VCustomer),
      customerCallRate: NumberOrEmpty(data.VCustomerCallRate),
      customerCallTarget: NumberOrEmpty(data.VCustomerCallTarget),
      customerCallAchiRate: NumberOrEmpty(data.VCustomerCallAchiRate),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.the_total_of_the_target_customers'),
      key: '目标客户合计',
      callNumber: NumberOrEmpty(data.TargetCallNumber),
      customer: '-',
      customerCallRate: '-',
      customerCallTarget: '-',
      customerCallAchiRate: '-',
    },
    {
      name: crmIntlUtil.fmtStr('text.report.the_total_of_the_non_target_customers'),
      key: '非目标客户合计',
      callNumber: NumberOrEmpty(data.NonTargetCallNumber),
      customer: '-',
      customerCallRate: '-',
      customerCallTarget: '-',
      customerCallAchiRate: '-',
    },
  ];

  //活动相关
  const eventNumberData = [
    {
      name: crmIntlUtil.fmtStr('text.report.hospital'),
      hospitalEventNumber: NumberOrEmpty(data.HospitalEventNumber),
      hospitalTarget: NumberOrEmpty(data.HospitalTarget),
    },
  ];
  // 推广活动表格
  const eventTableData = [
    {
      name: crmIntlUtil.fmtStr('text.report.hospital'),
      hospitalEventNumber: NumberOrEmpty(data.HospitalEventNumber),
      hospitalTarget: NumberOrEmpty(data.HospitalTarget),
      hospitalAchiRate: NumberOrEmpty(data.HospitalAchiRate),
    },
  ];

  // 辅导相关DSM or RSM
  const coachNumberDataDSM = [
    {
      name: crmIntlUtil.fmtStr('text.report.meeting_counseling'),
      coachNumber: NumberOrEmpty(data.MeetingCoach),
      coachTarget: NumberOrEmpty(data.MeetingCoachTarget),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.sales_call_counseling'),
      coachNumber: NumberOrEmpty(data.SalesCoach),
      coachTarget: NumberOrEmpty(data.SalesCoachTarget),
    },
  ];

  const coachNumberDataRSM = [
    {
      name: crmIntlUtil.fmtStr('text.report.regional_counseling'),
      coachNumber: NumberOrEmpty(data.RegionalCoach),
      coachTarget: NumberOrEmpty(data.RegionalCoachTarget),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.assist_counseling'),
      coachNumber: NumberOrEmpty(data.AssistCoach),
      coachTarget: NumberOrEmpty(data.AssistCoachTarget),
    },
  ];

  // 辅导Table
  const coachTableDataDSM = [
    {
      name: crmIntlUtil.fmtStr('text.report.sales_call_counseling'),
      coachNumber: NumberOrEmpty(data.SalesCoach),
      coachTarget: NumberOrEmpty(data.SalesCoachTarget),
      coachAchiRate: NumberOrEmpty(data.SalesCoachAchiRate),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.meeting_counseling'),
      coachNumber: NumberOrEmpty(data.MeetingCoach),
      coachTarget: NumberOrEmpty(data.MeetingCoachTarget),
      coachAchiRate: NumberOrEmpty(data.MeetingCoachAchiRate),
    },
  ];

  const coachTableDataRSM = [
    {
      name: crmIntlUtil.fmtStr('text.report.regional_counseling'),
      coachNumber: NumberOrEmpty(data.RegionalCoach),
      coachTarget: NumberOrEmpty(data.RegionalCoachTarget),
      coachAchiRate: NumberOrEmpty(data.RegionalCoachAchiRate),
    },
    {
      name: crmIntlUtil.fmtStr('text.report.assist_counseling'),
      coachNumber: NumberOrEmpty(data.AssistCoach),
      coachTarget: NumberOrEmpty(data.AssistCoachTarget),
      coachAchiRate: NumberOrEmpty(data.AssistCoachAchiRate),
    },
  ];

  const renderReportAllProductRep = () => {
    return (
      <div className="k_container bg_white">
        <Tabs
          defaultActiveKey={activeTabKey}
          onChange={(index) => {
            dispatch({
              type: 'report_all_product_index/updateState',
              payload: {
                activeTabKey: index,
              },
            });
          }}
          tabBarExtraContent={
            <DateMonthDropDown
              startDate="2018-12"
              defaultValue={YM}
              dispatch={dispatch}
              ns="report_all_product_index/updateDate"
            />
          }
        >
          <TabPane tab={crmIntlUtil.fmtStr('text.report.daily_statistics')} key="1">
            <Row
              className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}
            >
              <span className={styles['text-item']}>
                {crmIntlUtil.fmtStr('text.report.number_of_working_days_in_the_area')}:
                <strong>{WorkingDays}</strong>
              </span>
              <span className={styles['text-item']}>
                {crmIntlUtil.fmtStr('text.report.the_standard_number_of_working_days_in_the_area')}:{' '}
                <strong>{WorkingDaysTarget}</strong>
              </span>
              <span className={utilitiesStyles['right']}>
                <a
                  onClick={() => {
                    hashHistory.push('/report_all_product/workingDetail');
                  }}
                >
                  {crmIntlUtil.fmtStr('text.report.details')}
                </a>
              </span>
            </Row>
            <Row
              className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}
            >
              <span className={styles['text-item']}>
                {crmIntlUtil.fmtStr('text.report.customers_number')}
              </span>

              <span className={utilitiesStyles['right']}>
                <a
                  onClick={() => {
                    hashHistory.push('/report_all_product/customerNumDetail');
                  }}
                >
                  {crmIntlUtil.fmtStr('text.report.details')}
                </a>
              </span>
            </Row>
            <Row>
              <Col span={12}>
                <ResponsiveContainer height={400}>
                  <BarChart
                    data={customerSummaryData}
                    margin={{ left: 20, right: 30 }}
                    layout={'vertical'}
                    barGap={30}
                    barSize={10}
                  >
                    <YAxis dataKey="name" type="category" />
                    <XAxis type="number" />
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconType="circle" />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Bar
                      dataKey="customerTargetNumber"
                      name={crmIntlUtil.fmtStr('text.report.summary')}
                      fill={barFill.green}
                      label
                    />
                  </BarChart>
                </ResponsiveContainer>
                <p className={cx(styles.notes)}>
                  {crmIntlUtil.fmtStr('text.report.customers_number')}
                </p>
              </Col>
              <Col span={12}>
                <div>
                  <PieChart width={540} height={400} style={{ paddingLeft: '10%' }}>
                    <Pie
                      isAnimationActive={false}
                      data={customerTypeData}
                      cx={200}
                      cy={200}
                      outerRadius={is_IPad ? 100 : 130}
                      label
                    >
                      {customerTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                  <p className={cx(styles.notes)}>
                    {crmIntlUtil.fmtStr('text.report.customers_type_distribution')}
                  </p>
                </div>
              </Col>
            </Row>
            <Table dataSource={dailySummaryTableData} pagination={false}>
              <Column title={crmIntlUtil.fmtStr('text.report.type')} dataIndex="name" key="name" />
              <Column
                title={crmIntlUtil.fmtStr('text.report.the_number_of_the_target_customers')}
                dataIndex="number"
                key="number"
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.the_standard_of_the_target_customers')}
                dataIndex="targetNumber"
                key="targetNumber"
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.achieving_rate')}
                dataIndex="achiRate"
                key="achiRate"
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.the_number_of_the_non_target_customers')}
                dataIndex="nonTargetNumber"
                key="nonTargetNumber"
              />
            </Table>
          </TabPane>
          <TabPane tab={crmIntlUtil.fmtStr('text.report.visit_about')} key="2">
            <Row
              className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}
            >
              <span className={styles['text-item']}>
                {crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}
              </span>

              <span className={utilitiesStyles['right']}>
                <a
                  onClick={() => {
                    hashHistory.push('/report_all_product/callRateDetail');
                  }}
                >
                  {crmIntlUtil.fmtStr('text.report.details')}
                </a>
              </span>
            </Row>

            <ResponsiveContainer height={300}>
              <BarChart
                data={callNumberData}
                margin={{ left: 0, right: 20 }}
                layout={'vertical'}
                barGap={10}
                barSize={10}
              >
                <YAxis dataKey="name" type="category" />
                <XAxis type="number" />
                <Tooltip />
                <Legend verticalAlign="top" iconType="circle" />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar
                  dataKey="callTarget"
                  fill={barFill.green}
                  name={crmIntlUtil.fmtStr('text.report.the_standard_rate_of_the_visits')}
                  label
                />
                <Bar
                  dataKey="callRate"
                  fill={barFill.blue}
                  name={crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}
                  label
                />
              </BarChart>
            </ResponsiveContainer>
            <Table dataSource={callTableData} pagination={false}>
              <Column title={crmIntlUtil.fmtStr('text.report.level')} dataIndex="name" key="name" />
              <Column
                title={crmIntlUtil.fmtStr('text.report.the_number_of_visit')}
                dataIndex="callNumber"
                key="callNumber"
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.customers_number_owns')}
                dataIndex="customer"
                key="customer"
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.the_standard_rate_of_the_visits')}
                dataIndex="customerCallTarget"
                key="customerCallTarget"
              />
              <Column
                title={
                  <div>
                    <div>{crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}</div>
                    <div>
                      ({crmIntlUtil.fmtStr('text.report.the_number_of_visit')}/
                      {crmIntlUtil.fmtStr('text.report.customers_number_owns')})
                    </div>
                  </div>
                }
                dataIndex="customerCallRate"
                key="customerCallRate"
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_visits')}
                dataIndex="customerCallAchiRate"
                key="customerCallAchiRate"
              />
            </Table>
          </TabPane>
          <TabPane tab={crmIntlUtil.fmtStr('text.report.event_about')} key="3">
            <Row
              className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}
            >
              <span className={styles['text-item']}>
                {crmIntlUtil.fmtStr('text.report.promotional_activities')}
              </span>

              <span className={utilitiesStyles['right']}>
                <a
                  onClick={() => {
                    hashHistory.push('/report_all_product/eventDetail');
                  }}
                >
                  {crmIntlUtil.fmtStr('text.report.details')}
                </a>
              </span>
            </Row>
            <ResponsiveContainer height={300}>
              <BarChart
                data={eventNumberData}
                margin={{ left: 10, right: 20 }}
                layout={'vertical'}
                barGap={30}
                barSize={10}
              >
                <YAxis dataKey="name" type="category" hide={false} />
                <XAxis type="number" />
                <Tooltip />
                <Legend verticalAlign="top" iconType="rect" />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar
                  dataKey="hospitalEventNumber"
                  name={crmIntlUtil.fmtStr('text.report.reality')}
                  fill={barFill.green}
                  label
                />
                <Bar
                  dataKey="hospitalTarget"
                  name={crmIntlUtil.fmtStr('text.report.target')}
                  fill={barFill.blue}
                  label
                />
              </BarChart>
            </ResponsiveContainer>
            <Table dataSource={eventTableData} pagination={false}>
              <Column
                title={crmIntlUtil.fmtStr('text.report.promotional_type')}
                dataIndex="name"
                key="name"
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.organization_frequency')}
                dataIndex="hospitalEventNumber"
                key="hospitalEventNumber"
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.target_frequency')}
                dataIndex="hospitalTarget"
                key="hospitalTarget"
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.achieving')}
                dataIndex="hospitalAchiRate"
                key="hospitalAchiRate"
              />
            </Table>
          </TabPane>
          {is_SM && (
            <TabPane tab={crmIntlUtil.fmtStr('text.report.coach_about')} key="4">
              <Row
                className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}
              >
                <span className={styles['text-item']}>
                  {crmIntlUtil.fmtStr('text.report.coach_report')}
                </span>

                <span className={utilitiesStyles['right']}>
                  <a
                    onClick={() => {
                      hashHistory.push('/report_all_product/coachDetail');
                    }}
                  >
                    {crmIntlUtil.fmtStr('text.report.details')}
                  </a>
                </span>
              </Row>
              <ResponsiveContainer height={300}>
                <BarChart
                  data={is_DSM ? coachNumberDataDSM : coachNumberDataRSM}
                  margin={{ left: 30, right: 20 }}
                  layout={'vertical'}
                  barGap={30}
                  barSize={10}
                >
                  <YAxis dataKey="name" type="category" hide={false} />
                  <XAxis type="number" />
                  <Tooltip />
                  <Legend verticalAlign="top" iconType="rect" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Bar
                    dataKey="coachNumber"
                    name={crmIntlUtil.fmtStr('text.report.number')}
                    fill={barFill.green}
                    label
                  />
                  {
                    is_DSM && (
                      <Bar
                        dataKey="coachTarget"
                        name={crmIntlUtil.fmtStr('text.report.standard')}
                        fill={barFill.blue}
                        label
                      />
                    )
                  }
                </BarChart>
              </ResponsiveContainer>
              <Table dataSource={is_DSM ? coachTableDataDSM : coachTableDataRSM} pagination={false}>
                <Column
                  title={crmIntlUtil.fmtStr('text.report.the_type_of_the_coach')}
                  dataIndex="name"
                  key="name"
                />
                <Column
                  title={crmIntlUtil.fmtStr('text.report.the_number_of_the_coach')}
                  dataIndex="coachNumber"
                  key="coachNumber"
                />
                {
                  is_DSM && (
                    <Column
                      title={crmIntlUtil.fmtStr('text.report.the_standard_of_the_coach')}
                      dataIndex="coachTarget"
                      key="coachTarget"
                    />
                  )
                }
                {
                  is_DSM && (
                    <Column
                      title={crmIntlUtil.fmtStr('text.report.the_achieving_of_the_coach')}
                      dataIndex="coachAchiRate"
                      key="coachAchiRate"
                    />
                  )
                }
              </Table>
            </TabPane>
          )}
        </Tabs>
      </div>
    );
  };
  return (
    <div className="k_container bg_white">
      <Row
        className={cx(
          sizeStyles['height-50'],
          sizeStyles['lineHeight-50'],
          styles['toolbar-transparent'],
        )}
      >
        <span className={styles['text-title-big']}>{crmIntlUtil.fmtStr('text.report.report')}</span>
      </Row>
      {renderReportAllProductRep()}
    </div>
  );
};

export default connect(mapStateToProps)(ReportAllProductIndex);
