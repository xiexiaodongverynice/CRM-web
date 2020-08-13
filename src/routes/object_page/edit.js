import { connect } from 'dva';
import ObjectEdit from './object_edit';

function mapStateToProps(state) {
  const { layout, describe, record, relationLookupLayoutList, pageType } = state.edit_page;
  const loading = state.loading.models.edit_page;
  return {
    layoutData:layout,
    describe,
    record,
    relationLookupLayoutList,
    loading,
    pageType,
  };
}
export default connect(mapStateToProps)(ObjectEdit);
