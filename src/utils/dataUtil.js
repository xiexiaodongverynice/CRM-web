import _ from 'lodash';
import consoleUtil from './consoleUtil';

/**
 * 将小数转换为百分比形式的字符串
 * @param {String|Float} value
 */
export const convertToPercentage = (value) => {
  if(_.isUndefined(value)) {
    return '';
  }
  if(_.endsWith(value, '%')) {
    return value;
  }else {
    const dotIndex = _.indexOf(`${value}`, '.');
    if(dotIndex != -1) {
      const length = `${value}`.length;
      if(length === 3) {
        if(/^0\./.test(`${value}`)) {
          return parseInt(`${value}`.replace(/^0\./, '')) * 10 + '%'
        }else {
          return parseInt(`${value}`.replace(/\./, '')) * 10 + '%' 
        }
      }else {
        const noDotStr = `${value}`.replace(/\./, '');
        const arr = noDotStr.split('');
        if(noDotStr.length < dotIndex + 2) {
          _.range(0, dotIndex + 2 - noDotStr.length).forEach(x => {
            arr.push(0)
          })
        }else {
          arr.splice(dotIndex + 2, 0, '.')
        }
        const str = arr.join('').replace(/^0+/, '')
        if(_.startsWith(str, '.')) {
          return `0${str}` + '%';
        } else if(_.endsWith(str, '.')) {
          return str.replace(/\./, '') + '%'
        }else {
          return str + '%'
        }
      }
    }else {
      return value * 100 + '%'
    }
  }
}

/**
 * @param {String} value
 */
export const fixPercentage = (value) => {
  if(_.endsWith(value, '%')) {
    const unfixValue = _.replace(value, '%', '');
    if(_.startsWith(unfixValue, '.')) {
      consoleUtil.warn('不合法的浮点小数:', unfixValue)
    }else {
      const arr = unfixValue.split('.');
      let integerStr = arr[0]
      if(arr.length === 1) {
        return parseInt(integerStr) / 100;
      }else {
        if(integerStr.length === 1) {
          integerStr = '0.0' + integerStr;
        }else if(integerStr.length === 2) {
          integerStr = '0.' + integerStr;
        }else {
          const arr = integerStr.split('');
          arr.splice(-2, 0, '.');
          integerStr = arr.join('');
        }
        return parseFloat(integerStr + arr[1])
      }
    }
  }
  return value;
}
