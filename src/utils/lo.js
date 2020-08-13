import _ from 'lodash';

export const NumberOrEmpty = (canNumber) => {
  const canNaN = Number(canNumber);
  if(_.isNaN(canNaN)){
    return 0;
  }
  return canNaN;
};

export const randomKey = () => {
  return (Math.random() * 100000).toFixed();
};

export const valueToArray = (value) => {
  if (_.isUndefined(value) || value === '' || value === null) {
    return null;
  }
  if (!_.isArray(value)) {
    return [value];
  }
  return value;
};

export const ifEmptyToUndefined = (value) => {
  return _.isEmpty(value) ? undefined : value;
};

export const ifArrayGetFirst = (value) => {
  return _.isArray(value)? _.first(value): value
}