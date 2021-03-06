import _ from 'lodash';
import { getExpression } from './expressionUtils';
import { callAnotherFunc } from './index';

export const joinParams = (obj) => {
  return _.chain(obj)
    .toPairs()
    .filter(item => !_.isNull(item[1]) && !_.isUndefined(item[1]))
    .map((item) => {
      return `${item[0]}=${item[1]}`;
    })
    .join('&')
    .value();
};

export const mapObject = (obj, { thizRecord = {}, parentRecord = {}, record = {} } = {}) => {
  return _.chain(obj).mapValues((value, key) => {
    if (_.isObject(value) && _.has(value, 'expression')) {
      const expresson = getExpression(value, 'expression', '');
      return callAnotherFunc(new Function('t', 'p', 'r', expresson), thizRecord, parentRecord, record);
    }
    return value;
  }).value();
}

export function isEmptyObject(e) {
  let t;
  for (t in e) { return !1; }
  return !0;
}

// 08/01/2018 - TAG: 去除无效参数
export const pickValues = (values) => {
  return _.pickBy(values, (value, key) => {
    return key !== 'pageNo' && key !== 'pageSize' && !_.isNull(value) && !_.isUndefined(value);
  });
};

// 11/01/2018 - TAG: 跳转到列表页
export function* redirectToList(data, path, { put }, { msg }) {
  if (data) {
    const code = _.chain(data).result('data').result('head').result('code').value();
    if (code === 200) {
      if (msg) {
        message.success(msg);
      }
      yield put(routerRedux.push(path));
    }
  }
}

// 11/01/2018 - TAG: 保存数据，仅限于分页使用
export function* saveData(data, { put }) {
  if (data) {
    const { data: { body, head } } = data;
    yield put({
      type: 'save',
      payload: { body, head },
    });
  }
}
