import _ from 'lodash';

export const handleResultData = (resultData) => {
  const arrayTreeData = [];
  if (!_.isEmpty(resultData)) {
    _.forEach(resultData, (item) => {
      const name = item.name ? (item.name + '-') : '';
      arrayTreeData.push({
        label: `${name}${_.get(item, 'territory_name', '')}`,
        id: item.id ? _.toString(item.id) : 'key' + _.toString(item.territory_id), // 区分是否空岗
        value: _.toString(item.territory_id),
        key: _.toString(item.territory_id),
        disabled: !_.has(item, 'id'),
        pid: item.parent_territory_id ? _.toString(item.parent_territory_id) : '',
      });
    });
  }
  return arrayTreeData;
}

export const findData = (result, key, value) => {
  return _.filter(result, (record) => {
    const recordValue = _.get(record, key);
    if(_.isArray(value)) {
      return _.includes(value, recordValue);
    }else if(_.isString(value) || _.isNumber(value) || _.isInteger(value)) {
      return _.isEqual(value, recordValue);
    }
  })
}
