import _ from 'lodash';

export const handleResult = (result = {}) => {
  const data = _.chain(result).result('result', {}).value();
  return {
    data,
  };
};

export const mapStateToProps = (state) => {
  const { result, YM } = state.report_index_me;
  return {
    result,
    YM,
  };
};
