import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeStyles from '../../themes/size.less';
import styles from './index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { Row, Select, Table, Icon } from 'antd';
import cx from 'classnames';
import { caculateYearMonths } from '../../utils/date';
import moment from 'moment';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { getUserRole } from './helpers';
import * as colors from '../../stylers/colors';

const Option = Select.Option;
const Column = Table.Column;

export class UserDetail extends Component {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    data: {},
  };

  render() {
    const { data } = this.props;
    return (
      <Row
        className={cx(
          sizeStyles['height-50'],
          sizeStyles['lineHeight-50'],
          styles['toolbar-transparent'],
        )}
      >
        <span className={cx(styles['text-item'], utilitiesStyles['margin-l-5'])}>
          {crmIntlUtil.fmtStr('text.report.username')}: <strong>{data.UserName}</strong>
        </span>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.usercode')}: <strong>{data.UserCode}</strong>
        </span>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.role')}: <strong>{getUserRole(data)}</strong>
        </span>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.on_positions')}: <strong>{data.OnPositionNumber}</strong>
        </span>
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.positions')}: <strong>{data.PositionNumber}</strong>
        </span>
      </Row>
    );
  }
}

UserDetail.propTypes = {
  data: PropTypes.object,
};

export class DateMonthDropDown extends Component {
  constructor(props) {
    super(props);

    const { startDate, endDate } = this.props;
    this.months = caculateYearMonths(startDate, endDate);
  }

  render() {
    const { defaultValue, dispatch, ns } = this.props;
    return (
      <Select
        defaultValue={defaultValue || _.last(this.months)}
        style={{ width: 120 }}
        onChange={(value) => {
          dispatch({
            type: ns,
            payload: {
              YM: value,
            },
          });
        }}
      >
        {this.months.map((item) => {
          const arr = item.split('');
          arr.splice(4, 0, '-');
          return (
            <Option value={item} key={item}>
              {moment(arr.join('')).format('YYYY-MM')}
            </Option>
          );
        })}
      </Select>
    );
  }
}

DateMonthDropDown.propTypes = {
  startDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(moment),
    PropTypes.instanceOf(Date),
  ]).isRequired,
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.instanceOf(Date)]),
  defaultValue: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

export const ExtraColumnsForSM = [
  <Column
    title={crmIntlUtil.fmtStr('text.report.username')}
    dataIndex="UserName"
    key="UserName"
    fixed="left"
    width={120}
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.usercode')}
    dataIndex="UserCode"
    key="Usercode"
    width={120}
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.role')}
    dataIndex="Level"
    key="Level"
    width={120}
    render={(value, record) => {
      return getUserRole(record);
    }}
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.on_positions')}
    dataIndex="OnPositionNumber"
    key="OnPositionNumber"
    width={120}
  />,
  <Column
    title={crmIntlUtil.fmtStr('text.report.positions')}
    dataIndex="PositionNumber"
    key="PositionNumber"
    width={120}
  />,
];

export const craftCallTimesTable = (datas) => {
  return (
    <Table dataSource={datas} pagination={false}>
      <Column
        title={crmIntlUtil.fmtStr('text.report.doctor_name')}
        dataIndex="CustomerName"
        key="CustomerName"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.level')}
        dataIndex="CustomerSegmentation"
        key="CustomerSegmentation"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.the_target_call_times')}
        dataIndex="CallTarget"
        key="CallTarget"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.the_actual_call_times')}
        dataIndex="CallNumber"
        key="CallNumber"
      />
      <Column
        title={crmIntlUtil.fmtStr('text.report.reach_the_target')}
        dataIndex="OnTarget"
        key="OnTarget"
        render={(value) => {
          if (value) return <Icon type="check" style={{ color: 'green' }} />;
          else return <Icon type="close" style={{ color: 'red' }} />;
        }}
      />
    </Table>
  );
};

export const craftSubordinatesSeletor = (kpiUserId, subordinates, dispatch, ns) => {
  const getName = (name, level) => {
    return <span style={{ paddingLeft: level * 10 }}>{name}</span>;
  };
  const getStyle = (level) => {
    let color;
    switch (level) {
      case 0:
        color = colors.black;
        break;
      case 1:
        color = colors.black;
        break;
      case 2:
        color = colors.black;
        break;
      default:
        break;
    }
    return {
      color,
    };
  };
  const options = [];
  const createOptions = (item, level = 0) => {
    options.push(
      <Select.Option
        value={`${item.key}`}
        name={item.label}
        title={item.label}
        key={Math.random()}
        data-level={level}
        style={getStyle(level)}
      >
        {getName(item.label, level)}
      </Select.Option>,
    );
    if (item.children && !_.isEmpty(item.children)) {
      item.children.forEach((o) => {
        createOptions(o, level + 1);
      });
    }
  };
  subordinates.forEach((item) => {
    createOptions(item);
  });
  return (
    <Select
      multiple={false}
      style={{ marginLeft: 10, width: 120 }}
      optionLabelProp="name"
      defaultValue={`${kpiUserId}`}
      value={`${kpiUserId}`}
      onSelect={(value, options) => {
        dispatch({
          type: ns,
          payload: {
            kpiUserId: parseInt(value),
            kpiUserLevel: options.props['data-level'],
          },
        });
      }}
    >
      {options}
    </Select>
  );
};

// export const renderCustomizedLabel = ({
//   cx,
//   cy,
//   midAngle,
//   innerRadius,
//   outerRadius,
//   percent,
//   index,
//   customerTypeData,
// }) => {
//   const RADIAN = Math.PI / 180;
//   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//   const x = cx + radius * Math.cos(-midAngle * RADIAN);
//   const y = cy + radius * Math.sin(-midAngle * RADIAN);
//   return (
//     <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
//       {`${customerTypeData[index].name}`}
//     </text>
//   );
// };
