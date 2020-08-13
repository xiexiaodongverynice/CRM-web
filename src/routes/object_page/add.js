import { connect } from 'dva';
import ObjectAdd from './object_add';

function mapStateToProps(state) {
  const { layout, describe, record, relationLookupLayoutList, pageType } = state.add_page;
  return {
    layoutData:layout,
    describe,
    record,
    relationLookupLayoutList,
    pageType,
  };
}
export default connect(mapStateToProps)(ObjectAdd);
