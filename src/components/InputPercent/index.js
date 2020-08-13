/*
 * @Author: mll
 * @Date: 2018-10-18 15:13:09
 * @LastEditors: mll
 * @LastEditTime: 2018-10-22 15:51:11
 * @Description: 百分比 input 输入框
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cls from './styles.less';
import { convertToPercentage } from '../../utils/dataUtil';

// decimal_max_length && integer_max_length
const INTEGER_MAX_LENGTH = 2;
const DECIMAL_MAX_LENGTH = 3;
const MAX = 1000000;
const MIN = 0;
const STYLE = {};

const isFunc = (fn) => typeof fn == 'function';

export default class InputPercent extends Component {
  static defaultProps = {
    integer_max_length: INTEGER_MAX_LENGTH,
    decimal_max_length: DECIMAL_MAX_LENGTH,
    max: MAX,
    min: MIN,
    disabled: false,
    formatter: convertToPercentage,
    parser: (value) => value.replace('%', ''),
    onChange: () => {},
    size: 'default',
  };

  static propTypes = {
    integer_max_length: PropTypes.number,
    decimal_max_length: PropTypes.number,
    max: PropTypes.number,
    min: PropTypes.number,
    disabled: PropTypes.bool,
    formatter: PropTypes.func,
    parser: PropTypes.func,
    onChange: PropTypes.func,
    size: PropTypes.string,
  };

  getInitialValue = () => {
    return _.get(this.props, 'data-__meta.initialValue');
  };

  constructor(props) {
    super(props);
    const { formatter } = props;
    const initialValue = this.getInitialValue();

    // 根据传入的 props 初始化 value 值
    let value;
    /**
     * 如果初始值为undefined,则不进行格式化，因为没有值，所以不需要显示在文本框中
     */
    if (!isNaN(Number(initialValue)) && !_.isUndefined(initialValue)) {
      value = isFunc(formatter) ? formatter(initialValue) : initialValue;
    }

    if (isFunc(props.onChange) && props.onChange(value));

    this.state = {
      value,
      isValid: true,
      focused: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    // *https://jira.forceclouds.com/browse/CRM-6505
    // *【web端】onLookupChange带过来的值，类型为百分比时未进行转换
    // *暂时补救方法，逻辑上应该重构一下（类money字段）
    if (
      _.isEmpty(_.get(nextProps, 'changeInitialVal')) &&
      _.get(nextProps, 'changeInitialVal') !== _.get(this.props, 'changeInitialVal')
    ) {
      const changeInitialVal = _.get(nextProps, 'changeInitialVal');
      const { formatter } = this.props;
      let value;
      if (!isNaN(Number(changeInitialVal)) && !_.isUndefined(changeInitialVal)) {
        value = isFunc(formatter) ? formatter(changeInitialVal) : changeInitialVal;
      }
      if (isFunc(this.props.onChange) && this.props.onChange(value));

      this.state = {
        value,
        isValid: true,
        focused: false,
      };
    }
  }

  inputChange = (e) => {
    const { onChange } = this.props;
    // xxx.yy% -> xxx.yy
    const value = e.target.value.trim().replace('%', '');

    this.setState({ value: `${value}%` });

    if (isFunc(onChange) && onChange(`${value}%`));
  };

  checkInputValue = () => {
    const { onChange, integer_max_length, decimal_max_length, min, max } = this.props;

    const value = this.state.value.replace('%', '');

    // 如果 value 是 NaN
    if (isNaN(Number(value))) return this.setState({ isValid: false, focused: false });

    const [integer = '', decimal = ''] = value.split('.');

    // 剪切不符合长度的整数位
    const i = integer.length > integer_max_length ? integer.substr(0, integer_max_length) : integer;
    // 剪切不符合长度的小数位
    const d = decimal.length > decimal_max_length ? decimal.substr(0, decimal_max_length) : decimal;

    // min ~ max
    const nValue =
      Number(`${i}.${d}`) > max
        ? Number(max)
        : Number(`${i}.${d}`) < min
        ? Number(min)
        : Number(`${i}.${d}`);

    this.setState({
      value: `${nValue}%`,
      isValid: true,
      focused: false,
    });

    if (isFunc(onChange) && onChange(`${nValue}%`));
  };

  inputFocus = () => {
    this.setState({ focused: true });
  };

  render() {
    const {
      className,
      style,
      size,
      disabled,
      onChange,
      parser,
      formatter,
      integer_max_length,
      decimal_max_length,
      ...props
    } = this.props;
    const { value, isValid, focused } = this.state;

    const clss = classnames(
      className,
      `${cls[`fc-input-${size}`]}`,
      `${cls['fc-input-percent']}`,
      { [`${cls['fc-input-invalid']}`]: !isValid },
      { [`${cls['fc-input-focus']}`]: focused },
      { [`${cls['fc-input-disabled']}`]: disabled },
    );
    const styles = Object.assign({}, STYLE, style);

    return (
      <div className={clss} style={styles}>
        <input
          onChange={this.inputChange}
          onBlur={this.checkInputValue}
          onFocus={this.inputFocus}
          value={value}
          disabled={disabled}
          {...props}
        />
      </div>
    );
  }
}
