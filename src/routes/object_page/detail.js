import { connect } from 'dva';
import ObjectDetail from './object_detail';

function mapStateToProps(state) {
  const { layout, describe, record, relatedLayout, pageType, relatedFieldList, approval_info, recordType, childrenToParentRefresh } = state.detail_page;
  return {
    layoutData: layout,
    describe,
    record,
    relatedLayout,
    relatedFieldList,
    pageType,
    approval_info,
    recordType,
    childrenToParentRefresh
  };
}
export default connect(mapStateToProps)(ObjectDetail);
