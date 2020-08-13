export const mapStateToProps = (state) => {
  const { result, YM, activeTabKey } = state.report_index_tw;
  return {
    result,
    YM,
    activeTabKey,
  };
};
