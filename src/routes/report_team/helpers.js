import _ from 'lodash';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { UserLevelMap } from '../../utils/dicts';
import styles from './index.less';

export const handleResult = (result = {}) => {
  const data = _.chain(result)
    .result('result', {})
    .value();
  const { Level, is_SM, is_REP, _SM_text } = handleRecord(data);
  return {
    data,
    Level,
    is_SM,
    is_REP,
    _SM_text,
  };
};

export const handleRecord = (data) => {
  const { Level } = data;
  const is_SM = Level === 'DSM' || Level === 'RSM'; // 是否为经理 DSM RSM
  const is_REP = Level === 'REP';
  const _SM_text = is_SM ? `(${crmIntlUtil.fmtStr('text.report.team_with_an_average')})` : '';
  return {
    Level,
    is_SM,
    is_REP,
    _SM_text,
  };
};

export const mapStateToProps = (state) => {
  const { result, YM, activeTabKey } = state.report_team_index;
  return {
    result,
    YM,
    activeTabKey,
  };
};

export const getUserRole = (record) => {
  return `${record.ProductName}-${UserLevelMap[record.Level]}`;
};

/**
 * 递归取数据
 * @param {*} data
 * @param {*} getRecordByData
 * @param {*} wh
 * @param {*} nest
 */
export const getSubWhatDatas = (data, getRecordByData, wh = '_subs', nest = false, result = []) => {
  const subs = _.result(data, wh, []);
  subs.forEach((item) => {
    result.push(getRecordByData(item));
    if (nest) {
      if (_.get(item, wh)) {
        result.concat(getSubWhatDatas(item, getRecordByData, wh, nest, result));
      }
    }
  });
  return result;
};

export const getSubDatas = (data, getRecordByData) => {
  return getSubWhatDatas(data, getRecordByData);
};

export const getDatas = ({ is_SM, data, getRecordByData }) => {
  if (_.isEmpty(data)) {
    return [];
  } else {
    let datas = [getRecordByData(data)];
    if (is_SM) {
      datas.push(getSubDatas(data, getRecordByData));
    }
    return _.flatten(datas);
  }
};

export const stages = ['A', 'B', 'C', 'V'];

export const rowClassNameForSM = (is_SM) => {
  return (record, index) => {
    if (is_SM) {
      if (index === 0) {
        return styles.sm_row;
      } else {
        return null;
      }
    } else {
      return null;
    }
  };
};

export const NaNColumnRender = (text) => {
  return _.isNaN(text) ? '' : text;
};

export const barFill = {
  green: '#40D1A9',
  blue: '#368FE9',
};
