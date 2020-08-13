import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button, DatePicker } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from './index.less';
import utilitiesStyles from '../../themes/utilities.less';
import {
  handleResult,
  mapStateToProps,
  getDatas,
  rowClassNameForSM,
  handleRecord,
} from './helpers';
import { UserDetail, DateMonthDropDown, ExtraColumnsForSM } from './commonElements';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { NumberOrEmpty } from '../../utils/lo';

const { MonthPicker } = DatePicker;
const Column = Table.Column;

const getRecordByData = (data) => {
  const { is_SM } = handleRecord(data);
  return Object.assign(
    {},
    {
      UserName: data.UserName,
      UserCode: data.UserCode,
      Level: data.Level,
      ProductName: data.ProductName,
      OnPositionNumber: NumberOrEmpty(data.OnPositionNumber),
      PositionNumber: NumberOrEmpty(data.PositionNumber),

      EventTarget: NumberOrEmpty(data.EventTarget),
      EventNumber: NumberOrEmpty(data.EventNumber),
      EventAchiRate: NumberOrEmpty(data.EventAchiRate),
    },
    is_SM
      ? {
          ManagerEventTarget: NumberOrEmpty(data.ManagerEventTarget),
          ManagerEventAchiRate: NumberOrEmpty(data.ManagerEventAchiRate),
          ManagerEventNumber: NumberOrEmpty(data.ManagerEventNumber),
          EventNumber: NumberOrEmpty(data.AvgEventNumber),
        }
      : {},
  );
};

const EventColumns = [
  <Column
    title={crmIntlUtil.fmtStr('text.report.the_standard_of_the_event')}
    dataIndex="EventTarget"
    key="EventTarget"
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.the_complete_number_the_events')}
    dataIndex="EventNumber"
    key="EventNumber"
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.event_to_achieve')}
    dataIndex="EventAchiRate"
    key="EventAchiRate"
  />,
];

const ManagerEventColumns = [
  <Column
    title={crmIntlUtil.fmtStr('text.report.the_standard_of_the_event')}
    dataIndex="ManagerEventTarget"
    key="ManagerEventTarget"
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.the_complete_number_the_events')}
    dataIndex="ManagerEventNumber"
    key="ManagerEventNumber"
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.event_to_achieve')}
    dataIndex="ManagerEventAchiRate"
    key="ManagerEventAchiRate"
  />,
];

const EventDetail = ({ dispatch, location, loading, result = {}, YM }) => {
  const { data, Level, is_SM, _SM_text, is_REP } = handleResult(result);

  // 拜访频率表格数据
  const datas = getDatas({ is_SM, data, getRecordByData });

  return (
    <div className="k_container bg_white">
      <Row
        className={cx(
          sizeStyles['height-50'],
          sizeStyles['lineHeight-50'],
          styles['toolbar-transparent'],
        )}
      >
        <span className={styles['text-title-big']}>
          {crmIntlUtil.fmtStr('text.report.report_detail')}
        </span>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'])}>
        <DateMonthDropDown
          startDate="2017-12"
          defaultValue={YM}
          dispatch={dispatch}
          ns="report_team_index/updateDate"
        />
        <div className={utilitiesStyles.right}>
          <Button
            type="primary"
            onClick={() => {
              dispatch({
                type: 'report_team_index/download',
                payload: {
                  type: 'event',
                },
              });
            }}
          >
            {crmIntlUtil.fmtStr('text.report.download')}
          </Button>
          <Button
            type="primary"
            className={utilitiesStyles['margin-l-5']}
            onClick={() => {
              hashHistory.push('/report_team');
            }}
          >
            {crmIntlUtil.fmtStr('text.report.back')}
          </Button>
        </div>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.number_of_the_mettings')}
          {_SM_text} {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>

      {is_SM ? (
        <Row>
          <Row
            className={cx(
              sizeStyles['height-50'],
              sizeStyles['lineHeight-50'],
              styles['toolbar-transparent'],
            )}
          >
            <span className={styles['text-item']}>
              <strong>{crmIntlUtil.fmtStr('text.report.team_with_an_average')}</strong>
            </span>
          </Row>

          <Table dataSource={datas} pagination={false} rowClassName={rowClassNameForSM(is_SM)}>
            {ExtraColumnsForSM}
            {EventColumns}
          </Table>

          <Row
            className={cx(
              sizeStyles['height-50'],
              sizeStyles['lineHeight-50'],
              styles['toolbar-transparent'],
            )}
          >
            <span className={styles['text-item']}>
              <strong>{crmIntlUtil.fmtStr('text.report.district_manager')}</strong>
            </span>
          </Row>

          <Table dataSource={[_.first(datas)]} pagination={false}>
            {ExtraColumnsForSM}
            {ManagerEventColumns}
          </Table>
        </Row>
      ) : null}

      {is_REP
        ? [
            <UserDetail data={datas[0]} />,
            <Table dataSource={datas} pagination={false}>
              {EventColumns}
            </Table>,
          ]
        : null}
    </div>
  );
};

export default connect(mapStateToProps)(EventDetail);
