import _ from 'lodash';
import { callAnotherFunc } from '../../../utils';

export const checkRenderConditions = ({ layout, record }) => {
  let needrenderbyLayout = false;
  let needrenderbyRecord = false;
  if (!_.isEmpty(layout) && _.has(layout, 'containers[0].components[0]')) {
    needrenderbyLayout = true;
  }
  if (!_.isEmpty(record)) {
    needrenderbyRecord = true;
  }
  return {
    needrenderbyLayout,
    needrenderbyRecord,
  };
};

export const getRelatedListComponents = ({ layout }) => {
  return _.filter(_.get(layout, 'containers[0].components'), (o) => {
    // *相关列表支持的type类型
    // *目前支持：列表（related_list），里程碑（milestone），外嵌功能（webView）
    return _.includes(['milestone', 'related_list', 'webView'], _.get(o, 'type'));
  });
};

export const getRelatedListInkProperties = ({ relatedList }) => {
  const relatedListName = _.map(relatedList, 'related_list_name');
  const refObjDescribe = _.map(relatedList, 'ref_obj_describe');
  return {
    relatedListName,
    refObjDescribe,
  };
};

export const getRelatedListInkPropertiesFromLayout = ({ layout }) => {
  return getRelatedListInkProperties({
    relatedList: getRelatedListComponents({
      layout,
    }),
  });
};

export const checkValidExpression = ({
  layout,
  thizRecord = {},
  parentRecord = {},
  record = {},
}) => {
  const { valid_expression } = layout;
  let valid_result = null;
  if (valid_expression) {
    valid_result = callAnotherFunc(
      new Function('t', 'p', 'r', valid_expression),
      thizRecord,
      parentRecord,
      record,
    );
  }
  return valid_result;
};

export const parseParamsExpression = (params, record) => {
  const resultParams = {};

  _.each(params, (value, key) => {
    let tempValue = value;
    if (_.startsWith(value, 'return ')) {
      try {
        tempValue = new Function('t', value)(record);
      } catch (err) {
        console.log(err);
      }
    }
    resultParams[key] = tempValue;
  });

  return resultParams;
};
