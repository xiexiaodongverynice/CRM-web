
/**
 * 支持组件动态的绑定model
 */

import { connect } from 'dva';
import ObjectEdit from './object_edit';

function mapStateToProps({
  object_api_name,
  record_type,
  id,
  onSave,
}) {
  return (state) => {
    const {
      layout, 
      describe, 
      record, 
      relationLookupLayoutList,
       pageType,
      __location__, 
      edit_mode 
    } = _.get(state, `edit_page_${object_api_name}_${record_type}_${id}`);
    return {
      layoutData:layout,
      describe,
      record,
      relationLookupLayoutList,
      pageType,
      location: __location__,
      edit_mode,
      onSave,
    };
  } 
}


export const NewObjectEdit = ({
  object_api_name,
  record_type,
  id,
  onSave,
}) => {
  return connect(mapStateToProps({
    object_api_name,
    record_type,
    id,
    onSave,
  }))(ObjectEdit)
}
