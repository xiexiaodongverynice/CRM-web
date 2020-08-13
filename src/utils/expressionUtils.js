import _ from 'lodash';

/**
 * 获取一个对象上定义的表达式
 * @param {object} someObject 
 * @param {string} expressionName 
 * @param {boolean} needReturnOrReturnWhat 
 */
export const getExpression = (someObject, expressionName, needReturnOrReturnWhat = true) => {
  let fun;
  const webExpressionName = `${expressionName}_web`;
  let name = expressionName;
  /**
   * 是否包含web独有的表达式解析，如果是，则优先级最高
   */
  if(_.has(someObject, `${webExpressionName}`)){
    name = webExpressionName;
  }
  if(_.isBoolean(needReturnOrReturnWhat)) {
    if(needReturnOrReturnWhat) {
      fun = _.get(someObject, name, 'return false');
    }else {
      fun = _.get(someObject, name);
    }
  }else if(_.isString(needReturnOrReturnWhat)) {
    fun = _.get(someObject, name, needReturnOrReturnWhat);
  }
  return fun;
}

/**
 * 判断一个对象是否含有表达式
 * @param {object} someObject 
 * @param {string} expressionName 
 */
export const hasExpression = (someObject, expressionName) => {
  const webExpressionName = `${expressionName}_web`;
  return _.has(someObject, webExpressionName) || _.has(someObject, expressionName);
}