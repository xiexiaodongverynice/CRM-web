import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button, DatePicker } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from './index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { handleResult, mapStateToProps, getUserRole, getDatas, rowClassNameForSM } from './helpers';
import { UserDetail, DateMonthDropDown, ExtraColumnsForSM } from './commonElements';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { NumberOrEmpty } from '../../utils/lo';
import { userData, workingDetailData } from './mock';
const { MonthPicker } = DatePicker;
const Column = Table.Column;

const CallRateDetail = ({ dispatch, location, loading, result = {}, YM }) => {
  const { data, Level, is_DSM, is_RSM, is_REP, is_SM } = handleResult(result);
  const { WorkingDays, WorkingDaysTarget, DoctorNumber } = data;
  const getRecordByData = (data) => {
    return {
      UserName: data.UserName,
      UserCode: data.UserCode,
      Level: data.Level,
      ProductName: data.ProductName,
      OnPositionNumber: NumberOrEmpty(data.OnPositionNumber),
      PositionNumber: NumberOrEmpty(data.PositionNumber),

      TotalCallNumber: NumberOrEmpty(data.TotalCallNumber),
      TargetCallNumber: NumberOrEmpty(data.TargetCallNumber),
      NonTargetCallNumber: NumberOrEmpty(data.NonTargetCallNumber),

      WorkingDays: NumberOrEmpty(data.WorkingDays),
      WorkingDaysTarget: NumberOrEmpty(data.WorkingDaysTarget),
      WorkingDaysAchiRate: NumberOrEmpty(data.WorkingDaysAchiRate),
    };
  };
  const datas = getDatas({ is_SM, data, getRecordByData });

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

  const callTableDataSM = [
    {
      UserName: data.UserName,
      UserCode: data.UserCode,
      Level: data.Level,
      ProductName: data.ProductName,
      OnPositionNumber: NumberOrEmpty(data.OnPositionNumber),
      PositionNumber: NumberOrEmpty(data.PositionNumber),

      TotalCallNumber: NumberOrEmpty(data.TotalCallNumber),

      WorkingDays: NumberOrEmpty(data.WorkingDays),
      WorkingDaysTarget: NumberOrEmpty(data.WorkingDaysTarget),
      WorkingDaysAchiRate: NumberOrEmpty(data.WorkingDaysAchiRate),

      // name: 'A级',
      ACustomerCallNumber: NumberOrEmpty(data.ACustomerCallNumber),
      ACustomer: NumberOrEmpty(data.ACustomer),
      ACustomerCallRate: NumberOrEmpty(data.ACustomerCallRate),
      ACustomerCallTarget: NumberOrEmpty(data.ACustomerCallTarget),
      ACustomerCallAchiRate: NumberOrEmpty(data.ACustomerCallAchiRate),

      // name: 'B级',
      BCustomerCallNumber: NumberOrEmpty(data.BCustomerCallNumber),
      BCustomer: NumberOrEmpty(data.BCustomer),
      BCustomerCallRate: NumberOrEmpty(data.BCustomerCallRate),
      BCustomerCallTarget: NumberOrEmpty(data.BCustomerCallTarget),
      BCustomerCallAchiRate: NumberOrEmpty(data.BCustomerCallAchiRate),

      // name: 'V级',
      VCustomerCallNumber: NumberOrEmpty(data.VCustomerCallNumber),
      VCustomer: NumberOrEmpty(data.VCustomer),
      VCustomerCallRate: NumberOrEmpty(data.VCustomerCallRate),
      VCustomerCallTarget: NumberOrEmpty(data.VCustomerCallTarget),
      VCustomerCallAchiRate: NumberOrEmpty(data.VCustomerCallAchiRate),

      // name: '目标客户合计',
      TargetCallNumber: NumberOrEmpty(data.TargetCallNumber),
      TargetCustomer: '-',
      TargetCustomerCallRate: '-',
      TargetCustomerCallTarget: '-',
      TargetCustomerCallAchiRate: '-',

      // name: '非目标客户合计',
      NonTargetCallNumber: NumberOrEmpty(data.NonTargetCallNumber),
      NonTargetCustomer: '-',
      NonTargetCustomerCallRate: '-',
      NonTargetCustomerCallTarget: '-',
      NonTargetCustomerCallAchiRate: '-',
    },
  ];

  const renderTableREP = () => {
    const columns = [
      {
        title: crmIntlUtil.fmtStr('text.report.the_number_of_visit'),
        dataIndex: 'callNumber',
        key: 'callNumber',
      },
      {
        title: crmIntlUtil.fmtStr('text.report.customers_number_owns'),
        dataIndex: 'customer',
        key: 'customer',
      },
      {
        title: crmIntlUtil.fmtStr('text.report.the_standard_rate_of_the_visits'),
        dataIndex: 'customerCallTarget',
        key: 'customerCallTarget',
      },
      {
        title: (
          <div>
            <div>{crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}</div>
            <div>
              ({crmIntlUtil.fmtStr('text.report.the_number_of_visit')}/
              {crmIntlUtil.fmtStr('text.report.customers_number_owns')})
            </div>
          </div>
        ),
        dataIndex: 'customerCallRate',
        key: 'customerCallRate',
      },
      {
        title: crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_visits'),
        dataIndex: 'customerCallAchiRate',
        key: 'customerCallAchiRate',
      },
    ];
    return _.map(callTableData, (item) => {
      let renderColumns = columns;
      if (
        item.name == crmIntlUtil.fmtStr('text.report.the_total_of_the_target_customers') ||
        item.name == crmIntlUtil.fmtStr('text.report.the_total_of_the_non_target_customers')
      ) {
        renderColumns = _.filter(columns, function(o) {
          return o.key !== 'customerCallTarget' && o.key !== 'customerCallAchiRate';
        });
      }
      const tableProps = {
        columns: renderColumns,
        dataSource: [item],
        pagination: false,
      };
      return (
        <div key={item.key}>
          <Row
            className={cx(
              sizeStyles['height-50'],
              sizeStyles['lineHeight-50'],
              styles['toolbar-transparent'],
            )}
          >
            <span className={styles['text-item']}>
              <strong>{crmIntlUtil.fmtStr(item.name)}</strong>
            </span>
          </Row>
          <Table {...tableProps} />
        </div>
      );
    });
  };

  const columnsSM = [
    {
      title: crmIntlUtil.fmtStr('text.report.username'),
      dataIndex: 'UserName',
      key: 'UserName',
      fixed: 'left',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.usercode'),
      dataIndex: 'UserCode',
      key: 'UserCode',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.role'),
      dataIndex: 'Level',
      key: 'Level',
      render(text, record) {
        return getUserRole(record);
      },
    },
    {
      title: crmIntlUtil.fmtStr('text.report.on_positions'),
      dataIndex: 'OnPositionNumber',
      key: 'OnPositionNumber',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.positions'),
      dataIndex: 'PositionNumber',
      key: 'PositionNumber',
    },
    {
      title: crmIntlUtil.fmtStr('text.report.level_a'),
      children: [
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_visit'),
          dataIndex: 'ACustomerCallNumber',
          key: 'ACustomerCallNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.customers_number_owns'),
          dataIndex: 'ACustomer',
          key: 'ACustomer',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_standard_rate_of_the_visits'),
          dataIndex: 'ACustomerCallTarget',
          key: 'ACustomerCallTarget',
        },
        {
          title: (
            <div>
              <div>{crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}</div>
              <div>
                ({crmIntlUtil.fmtStr('text.report.the_number_of_visit')}/
                {crmIntlUtil.fmtStr('text.report.customers_number_owns')})
              </div>
            </div>
          ),
          dataIndex: 'ACustomerCallRate',
          key: 'ACustomerCallRate',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_visits'),
          dataIndex: 'ACustomerCallAchiRate',
          key: 'ACustomerCallAchiRate',
        },
      ],
    },
    {
      title: crmIntlUtil.fmtStr('text.report.level_b'),
      children: [
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_visit'),
          dataIndex: 'BCustomerCallNumber',
          key: 'BCustomerCallNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.customers_number_owns'),
          dataIndex: 'BCustomer',
          key: 'BCustomer',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_standard_rate_of_the_visits'),
          dataIndex: 'BCustomerCallTarget',
          key: 'BCustomerCallTarget',
        },
        {
          title: (
            <div>
              <div>{crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}</div>
              <div>
                ({crmIntlUtil.fmtStr('text.report.the_number_of_visit')}/
                {crmIntlUtil.fmtStr('text.report.customers_number_owns')})
              </div>
            </div>
          ),
          dataIndex: 'BCustomerCallRate',
          key: 'BCustomerCallRate',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_visits'),
          dataIndex: 'BCustomerCallAchiRate',
          key: 'BCustomerCallAchiRate',
        },
      ],
    },
    {
      title: crmIntlUtil.fmtStr('text.report.level_v'),
      children: [
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_visit'),
          dataIndex: 'VCustomerCallNumber',
          key: 'VCustomerCallNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.customers_number_owns'),
          dataIndex: 'VCustomer',
          key: 'VCustomer',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_standard_rate_of_the_visits'),
          dataIndex: 'VCustomerCallTarget',
          key: 'VCustomerCallTarget',
        },
        {
          title: (
            <div>
              <div>{crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}</div>
              <div>
                ({crmIntlUtil.fmtStr('text.report.the_number_of_visit')}/
                {crmIntlUtil.fmtStr('text.report.customers_number_owns')})
              </div>
            </div>
          ),
          dataIndex: 'VCustomerCallRate',
          key: 'VCustomerCallRate',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.the_achieving_rate_of_the_visits'),
          dataIndex: 'VCustomerCallAchiRate',
          key: 'VCustomerCallAchiRate',
        },
      ],
    },
    {
      title: crmIntlUtil.fmtStr('text.report.target_doctor'),
      children: [
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_visit'),
          dataIndex: 'TargetCallNumber',
          key: 'TargetCallNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.customers_number_owns'),
          dataIndex: 'TargetCustomer',
          key: 'TargetCustomer',
        },
        {
          title: (
            <div>
              <div>{crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}</div>
              <div>
                ({crmIntlUtil.fmtStr('text.report.the_number_of_visit')}/
                {crmIntlUtil.fmtStr('text.report.customers_number_owns')})
              </div>
            </div>
          ),
          dataIndex: 'TargetCustomerCallRate',
          key: 'TargetCustomerCallRate',
        },
      ],
    },
    {
      title: crmIntlUtil.fmtStr('text.report.non_target_doctor'),
      children: [
        {
          title: crmIntlUtil.fmtStr('text.report.the_number_of_visit'),
          dataIndex: 'NonTargetCallNumber',
          key: 'NonTargetCallNumber',
        },
        {
          title: crmIntlUtil.fmtStr('text.report.customers_number_owns'),
          dataIndex: 'NonTargetCustomer',
          key: 'NonTargetCustomer',
        },
        {
          title: (
            <div>
              <div>{crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}</div>
              <div>
                ({crmIntlUtil.fmtStr('text.report.the_number_of_visit')}/
                {crmIntlUtil.fmtStr('text.report.customers_number_owns')})
              </div>
            </div>
          ),
          dataIndex: 'NonTargetCustomerCallRate',
          key: 'NonTargetCustomerCallRate',
        },
      ],
    },
  ];

  const tablePropsSM = {
    columns: columnsSM,
    dataSource: callTableDataSM,
    pagination: false,
    bordered: true,
    scroll: { x: 2550 },
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
        <span className={styles['text-title-big']}>
          {crmIntlUtil.fmtStr('text.report.report_detail')}
        </span>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'])}>
        <DateMonthDropDown
          startDate="2018-12"
          defaultValue={YM}
          dispatch={dispatch}
          ns="report_all_product_index/updateDate"
        />
        <div className={utilitiesStyles.right}>
          {/* <Button
            type="primary"
            // onClick={() => {
            //   dispatch({
            //     type: 'report_index/download',
            //     payload: {
            //       type: 'workingDays',
            //     },
            //   });
            // }}
          >
            {crmIntlUtil.fmtStr('text.report.download')}
          </Button> */}
          <Button
            type="primary"
            className={utilitiesStyles['margin-l-5']}
            onClick={() => {
              // hashHistory.push('/report_all_product_rep');
              hashHistory.goBack();
            }}
          >
            {crmIntlUtil.fmtStr('text.report.back')}
          </Button>
        </div>
      </Row>

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.the_rate_of_the_visits')}
          {/* {_SM_text} */}
          {crmIntlUtil.fmtStr('text.report.report')}
        </span>
      </Row>
      {is_SM ? (
        <Table {...tablePropsSM} />
      ) : (
        <div>
          <UserDetail data={datas[0]} />
          {renderTableREP()}
        </div>
      )}
    </div>
  );
};
export default connect(mapStateToProps)(CallRateDetail);
