import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Icon, Row, Col, Button, Tag, Popconfirm, DatePicker, Tabs } from 'antd';
import { BarChart, Tooltip, Legend, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Text, PieChart, Pie, Sector } from 'recharts';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from '../report/index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { handleResult, mapStateToProps } from './helpers';
import { getSubDatas, barFill } from '../report/helpers';
import { DateMonthDropDown } from '../report/commonElements';
import TwoLevelPieChart from '../../components/chart/twoLevelPieChart';
import { NumberOrEmpty } from '../../utils/lo';

const getRecordByData = (data) => {
  return {
    ProductLine: data.ProductLine,
    Area: data.Area,
    SalesEmployee: data.SalesEmployee,
    Plans: NumberOrEmpty(data.Plans),
    Completions: NumberOrEmpty(data.Completions),
    CompletionRate: NumberOrEmpty(data.CompletionRate),
    Incompletions: NumberOrEmpty(data.Incompletions),
    Cancels: NumberOrEmpty(data.Cancels),
  }
};

const { MonthPicker } = DatePicker;
const Column = Table.Column;
const TabPane = Tabs.TabPane;

const ReportIndexME = ({ dispatch, location, loading, result = {}, YM}) => {

  let { data } = handleResult(result);

  // 09/01/2018 - TAG: 活动执行汇总-pie
  const summaryPieData = [{
    name: crmIntlUtil.fmtStr('text.report.event_completions'),
    value: NumberOrEmpty(data.Completions),
  },{
    name: crmIntlUtil.fmtStr('text.report.event_incompletions'),
    value: NumberOrEmpty(data.Incompletions),
  },{
    name: crmIntlUtil.fmtStr('text.report.event_cancels'),
    value: NumberOrEmpty(data.Cancels),
  }];

  // 09/01/2018 - TAG: 活动执行汇总-table
  const summaryTableData = [{
    Plans: NumberOrEmpty(data.Plans),
    Completions: NumberOrEmpty(data.Completions),
    CompletionRate: NumberOrEmpty(data.CompletionRate),
    Incompletions: NumberOrEmpty(data.Incompletions),
    Cancels: NumberOrEmpty(data.Cancels),
  }];

  // 09/01/2018 - TAG: 活动支持统计数据
  const subs = getSubDatas(data, getRecordByData);

  let chartHeight = 200;
  const increHeight = subs.length * 80;
  if(chartHeight < increHeight){
    chartHeight = increHeight;
  }

  return (
    <div className="k_container bg_white">

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles['toolbar-transparent'])}>
        <span className={styles['text-title-big']}>
        {
          crmIntlUtil.fmtStr('text.report.report')
        }
        </span>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'])}>
        <DateMonthDropDown startDate="2017-12" defaultValue={YM} dispatch={dispatch} ns="report_index_me/updateDate"/>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.the_summary_of_the_event')}
        </span>

        <span className={utilitiesStyles['right']}>
          <a onClick={() => {
            hashHistory.push('/report_me/eventSummaryDetail');
          }}>{crmIntlUtil.fmtStr('text.report.details')}</a>
        </span>
      </Row>

      <ResponsiveContainer height={340}>
          <TwoLevelPieChart data={summaryPieData} width={300} height={310}/>
      </ResponsiveContainer>

      <Table dataSource={summaryTableData} pagination={false}>
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
      </Table>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.the_summary_of_the_event_support')}
        </span>

        <span className={utilitiesStyles['right']}>
          <a onClick={() => {
            hashHistory.push('/report_me/eventSupportDetail');
          }}>{crmIntlUtil.fmtStr('text.report.details')}</a>
        </span>
      </Row>

      <ResponsiveContainer height={chartHeight}>
        <BarChart data={subs} margin={{ left: 20, right: 20 }} layout={'vertical'} barGap={10} barSize={10}>
          <YAxis dataKey="SalesEmployee" type="category"/>
          <XAxis type="number"/>
          <Tooltip />
          <Legend verticalAlign="top" iconType="circle"/>
          <CartesianGrid strokeDasharray="3 3"/>
          <Bar dataKey="Plans" fill={barFill.green} name={crmIntlUtil.fmtStr('text.report.event_plans')} label/>
          <Bar dataKey="Completions" fill={barFill.blue} name={crmIntlUtil.fmtStr('text.report.event_completions')} label/>
        </BarChart>
      </ResponsiveContainer>

      <Table dataSource={subs} pagination={false}>
        <Column
          title={crmIntlUtil.fmtStr('text.report.product_line')}
          dataIndex="ProductLine"
          key="ProductLine"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.event_area')}
          dataIndex="Area"
          key="Area"
        />
        <Column
          title={crmIntlUtil.fmtStr('text.report.event_sales_employee')}
          dataIndex="SalesEmployee"
          key="SalesEmployee"
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
      </Table>


    </div>
  );
};

export default connect(mapStateToProps)(ReportIndexME);
