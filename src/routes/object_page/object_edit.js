import React, { Component } from 'react';
import ObjectPageEdit from './../../components/object_page/ObjectPageEdit';
import Warner from '../../components/Page/Warner';
import * as crmIntlUtil from '../../utils/crmIntlUtil';

const ObjectEdit = ({ dispatch, layoutData, describe, relationLookupLayoutList, record, location, loading, pageType, edit_mode, onSave }) => {
  if(layoutData==null){
    return <div className="k_container bg_white"> {crmIntlUtil.fmtStr('Rendering')}</div>;
  }else if(_.isEmpty(layoutData)){
    return <div className="k_container bg_white"><Warner content={crmIntlUtil.fmtStr('Not Found Render Object')} /></div>;
  }
  return (
    <div className="k_container bg_white">
      <ObjectPageEdit
        dispatch={dispatch}
        loading={loading}
        location={location}
        layout={layoutData}
        relationLookupLayoutList={relationLookupLayoutList}
        describe={describe}
        record={record}
        pageType={pageType}
        edit_mode={edit_mode}
        onSave={onSave}
      />
    </div>
  );
}

export default ObjectEdit;
