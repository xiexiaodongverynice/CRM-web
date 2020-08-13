import { Input, Tooltip } from 'antd';
import consoleUtil from '../../utils/consoleUtil';
// import * as styles from 'index.less'
function formatNumber(value) {
  value += '';
  const list = value.split('.');
  const prefix = list[0].charAt(0) === '-' ? '-' : '';
  let num = prefix ? list[0].slice(1) : list[0];
  let result = '';
  while (num.length > 3) {
    result = `,${num.slice(-3)}${result}`;
    num = num.slice(0, num.length - 3);
  }
  if (num) {
    result = num + result;
  }
  return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
}

class NumericInput extends React.Component {
  onChange = (e) => {
    const { value } = e.target;
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
      this.props.onChange(value);
    }
  }
  // '.' at the end or only '-' in the input box.
  onBlur = () => {
    const { value, onBlur, onChange } = this.props;
    //consoleUtil.log('value',value)
    if (_.endsWith(value,'.') || value === '-') {
      onChange({ value: value.slice(0, -1) });
    }
    if (onBlur) {
      onBlur();
    }
  }
  render() {
    const { value } = this.props;
    const title = value ? (
      <span className="numeric-input-title">
        {value !== '-' ? formatNumber(value) : '-'}
      </span>
    ) : 'Input a number';
    return (
        <Input
          {...this.props}
          onChange={this.onChange}
          onBlur={this.onBlur}
          placeholder="Input a number"
        />
    );
  }
}
export default  NumericInput;
