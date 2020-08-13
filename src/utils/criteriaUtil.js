/**
 * Created by xinli on 2017/12/19.
 */
import _ from 'lodash';

export const processCriterias = (criterias = [], t, p) => {
  const processed = criterias.map((x) => {
    if (is_Criteria_a_CustomAction(x.value)) {
      const criteriaWillReturn = {
        ...x,
        actionName: x.value.action,
        params: process_CustomeAction_params(x.value.params, t, p),
      };
      if (_.size(criteriaWillReturn.params) === 0) {
        delete criteriaWillReturn.params;
      } else {
        criteriaWillReturn.params = JSON.stringify(criteriaWillReturn.params); // 这个字段的类型要求是string！
      }
      delete criteriaWillReturn.value; // 不要返回value
      return criteriaWillReturn;
    } else if (x.actionName) {
      return {
        ...x,
      };
    } else {
      return {
        ...x,
        value: processCriteriaValues(x.value, t, p),
      };
    }
  }); // 去掉value为空的查询条件，避免后台接口报错
  return processed;
};

export const processCriteriaValues = (value = [], t, p) => {
  if (_.isArray(value)) {
    return value.map((x) => {
      if (_.isObject(x) && x.expression) {
        if (x.expression.indexOf('return') >= 0) {
          // 使用函数
          return new Function('t', 'p', x.expression)(t, p);
        } else {
          // 直接使用eval表达式
          // eslint-disable-next-line no-eval
          const evaled = eval(x.expression);
          if (typeof evaled === 'function') {
            return evaled();
          } else {
            return evaled;
          }
        }
      } else {
        return x;
      }
    });
  } else if (_.isObject(value) && value.expression) {
    if (value.expression.indexOf('return') >= 0) {
      return [].concat(new Function('t', 'p', value.expression)(t, p));
    } else {
      // eslint-disable-next-line no-eval
      const evaled = eval(value.expression);
      if (typeof evaled === 'function') {
        return [].concat(evaled());
      } else {
        return [].concat(evaled);
      }
    }
  } else {
    // 无法解析
    return [];
  }
};
function is_Criteria_a_CustomAction(value) {
  const reallyIs = _.isObject(value) && _.isString(value.action) && _.size(value.action) > 0;
  return reallyIs;
}
function process_CustomeAction_params(params, itemData, parentData) {
  if (!_.isObject(params)) {
    return {};
  }
  // 到这里肯定是object了
  const paramsWillReturn = {};
  _.forEach(params, (value, key) => {
    const expression = value; // value中应保存expression
    if (!_.isString(expression)) {
      // 忽略非string的value
      console.warn(`${key}类型错误。${JSON.stringify(params)}`);
      return;
    }
    const valueEvaled = tryEval(expression, null, itemData, parentData);
    if (valueEvaled) {
      paramsWillReturn[key] = valueEvaled;
    } else {
      paramsWillReturn[key] = _.get(parentData, `${key}`, '');
    }
  });
  return paramsWillReturn;
}
function tryEval(expression, fallbackValue, itemData, parentData) {
  try {
    if (expression.indexOf('return') >= 0) {
      const func = new Function('t', 'p', expression);
      const result = func(itemData, parentData);
      return result;
    } else {
      // eslint-disable-next-line no-eval
      const evaled = eval(expression);
      if (typeof evaled === 'function') {
        return evaled();
      } else if (!_.isEmpty(evaled) || _.isNumber(evaled)) {
        return evaled;
      }
    }
  } catch (e) {
    return fallbackValue;
  }
}
