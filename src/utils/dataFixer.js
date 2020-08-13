import _ from 'lodash';
import fieldTypes from './fieldTypes';
import { fixPercentage } from './dataUtil';

/**
 * 保存时对数据进行修正
 * @param {Object} param
 * 
 * TODO 应该在form表单变化时，实时对数据进行修正
 */
const dataFixer = ({
  fieldList = [],
  record = {},
}) => {
  _.keys(record).forEach(key => {
    const field = _.find(fieldList, {
      api_name: key,
    });
    if(field) {
      const { type } = field;
      if(type === fieldTypes.PERCENTAGE) {
        _.set(record, key, fixPercentage(_.get(record, key)))
      }
    }
  })
  return record;
}

export default dataFixer;