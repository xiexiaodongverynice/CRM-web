import { callAnotherFunc } from '../../utils';
import { getServerTime } from '../../services/app'
import * as layoutService from '../../services/object_page/layoutService';
import { getExpression } from '../../utils/expressionUtils';
import { BRANCH_CALL_PLAN_APINAME } from './branchCreateComponent'

/**
 * 解析hidden_expression表达式，默认返回false
 */
export const checkLegendHiddenWhen = (legend) => {
  if(legend) {
    const hidden_expression = getExpression(legend, 'hidden_expression');
    if(hidden_expression) {
      return callAnotherFunc(new Function('t', hidden_expression), {});
    }
    return false;
  }
  return false;
};

/**
 * 解析hidden_expression表达式，默认返回true
 */
export const checkLegendShowWhen = (legend) => {
  if(legend) {
    const show_expression = getExpression(legend, 'show_expression', 'return true');
    if(show_expression) {
      return callAnotherFunc(new Function('t', show_expression), {});
    }
    return true;
  }
  return true;
};

/**
 * 根据hidden_expression表达式过滤calendar_items
 * @param {Array<Object>} calendar_items 
 */
export const filterCalendarItems = (calendar_items = []) => {
  return calendar_items.filter(item => {
    if(item) {
      const hidden_expression = getExpression(item, 'hidden_expression', 'return false');
      if(hidden_expression) {
        return !callAnotherFunc(new Function('t', hidden_expression), {});
      }
      return true;
    }
    return false;
  })
}

export const branchInitData = async (layoutType) => {
  const getLayout = Promise.resolve(layoutService.loadLayout({
    object_api_name: BRANCH_CALL_PLAN_APINAME,
    layout_type: 'relation_lookup_page',
    query: {
      recordType: layoutType
    }
  }))

  let resultData
  try {
    resultData = await Promise.all([getLayout, getServerTime()])
  } catch (e) {
    console.warn('[branchInitData error] 批量新建拜访失败 e')
  }

  return {
    branchCreateCallLayout: resultData[0],
    currentTime: resultData[1]
  }
}