export const mapStateToProps = (state) => {
  const { result, YM, activeTabKey } = state.report_index_hk;
  return {
    result,
    YM,
    activeTabKey,
  };
};
