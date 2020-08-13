
/**
 * 支持组件动态的绑定model
 */

import { connect } from 'dva';
import ObjectDetail from './object_detail';

function mapStateToProps({
  object_api_name,
  record_type,
  id,
}) {
  return (state) => {
    const { layout, 
      describe, 
      record, 
      relatedLayout, 
      pageType, 
      relatedFieldList, 
      approval_info, 
      recordType, 
      __location__, 
      edit_mode 
    } = _.get(state, `detail_page_${object_api_name}_${record_type}_${id}`);
    return {
      layoutData:layout,
      describe, 
      record, 
      relatedLayout, 
      pageType, 
      relatedFieldList, 
      approval_info, 
      recordType,
      location: __location__,
      edit_mode,
    };
  } 
}


export const NewObjectDetail = ({
  object_api_name,
  record_type,
  id,
  onSave,
}) => {
  return connect(mapStateToProps({
    object_api_name,
    record_type,
    id,
  }))(ObjectDetail)
}
