/**
 * 日期组件返回的valueCell就是valueText, _.isUndefined(valueCell, 'props') === true
 * 
 * TODO dcr是否应该支持所有类型的数据
 */
import _ from 'lodash';

export const getDcrValueText = (valueCell, fieldDescribe) => {
  const { type } = fieldDescribe;
  const fieldType = fieldDescribe.type;
  let valueText;
  if (_.includes(['date', 'date_time', 'time'], type)) {
    valueText = valueCell;
  } else {
    if (_.isArray(valueCell)) {
      valueText = valueCell.map(x => x.props.children);
      valueText = valueText.map(x => {
        if (_.isArray(x)) {
          x = x[x.length - 1];
          return x;
        } else if (x !== ',') {
          return x;
        }
      }).filter(x => x !== undefined).toString();
    } else {
      valueText = valueCell.props.children;
      if (_.isArray(valueText)) {
        valueText = valueText[valueText.length - 1]
      }
    }
  }
  return valueText;
}