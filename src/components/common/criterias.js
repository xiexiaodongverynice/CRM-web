import _ from 'lodash';
import consoleUtil from '../../utils/consoleUtil';

/**
 * 对criteria进行填充
 * 
 * "filter_criterias" : {
      "field" : "create_by",
      "operator" : "in"
  }

 * @param {String|Array} value 
 * @param {Object} filter_criterias
 * @param {restrict_filter_criterias} 如果filter_criterias为undefined，null，是否直接返回[]
 */
export const assembleCriterias = (value, filter_criterias, restrict_filter_criterias = false) => {
  let criterias = [];
  if(restrict_filter_criterias) {
    if(_.isNil(filter_criterias)) {
      return criterias;
    }
  }
  if (!_.isEmpty(value)) {
    if (!_.isArray(value)) {
      value = _.concat([], value);
    }
    /**
     * 存在不配置filter_criterias的情况
     * 我也没办法了，只能这么判断了，要疯
     */
    if(_.isNil(filter_criterias) && window.location.hash.indexOf('index_page') != -1) {
      consoleUtil.log("由于布局未配置filter_criterias，因此这里不做处理.");
      return [];
    }else {
      if (!_.isEmpty(filter_criterias)) {
        criterias.push({
          field: _.get(filter_criterias, 'field'),
          operator: _.get(filter_criterias, 'operator', 'in'),
          value,
        });
      } else {
        /**
         * 日历是不会配置filter_criterias的
         */
        criterias = value;
      }
    }
  }else {
    consoleUtil.warn('none value can not be assembled for criterias or territoryCriterias.')
  }
  return criterias;
}

export const pickCriteriasFromSelectorExtender = (selectorExtenderFilterCriterias, criteriasKey) => {
  return _.mapValues(selectorExtenderFilterCriterias, (value, key) => {
    return _.get(value, criteriasKey, [])
  });
}