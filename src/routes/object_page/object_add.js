import React, { Component } from 'react';
import ObjectPageAdd from './../../components/object_page/ObjectPageAdd';
import Warner from '../../components/Page/Warner';
import * as crmIntlUtil from '../../utils/crmIntlUtil';

const ObjectAdd = ({ dispatch, layoutData, describe, record, relationLookupLayoutList, pageType, location, edit_mode, onSave }) => {
  if(layoutData==null){
    return <div className="k_container bg_white"> {crmIntlUtil.fmtStr('Rendering')}</div>;
  }else if(_.isEmpty(layoutData)){
    return <div className="k_container bg_white"><Warner content={crmIntlUtil.fmtStr('Not Found Render Object')} /></div>;
  }

  return (
    <div className="k_container bg_white">
      <ObjectPageAdd
        key={`object_page_object_add_${location.query._k}`}
        dispatch={dispatch}
        location={location}
        layout={layoutData}
        record={record}
        relationLookupLayoutList={relationLookupLayoutList}
        describe={describe}
        pageType={pageType}
        edit_mode={edit_mode}
        onSave={onSave}
      />
    </div>
  );
}

export default ObjectAdd;