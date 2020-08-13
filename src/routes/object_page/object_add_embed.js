
/**
 * 支持组件动态的绑定model
 */

import { connect } from 'dva';
import ObjectAdd from './object_add';

function mapStateToProps({
  object_api_name,
  record_type,
  onSave,
}) {
  return (state) => {
    const { layout, 
      describe, 
      record, 
      relationLookupLayoutList, 
      pageType, 
      __location__, 
      edit_mode 
    } = _.get(state, `add_page_${object_api_name}_${record_type}`);
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


export const NewObjectAdd = ({
  object_api_name,
  record_type,
  onSave,
}) => {
  return connect(mapStateToProps({
    object_api_name,
    record_type,
    onSave,
  }))(ObjectAdd)
}
