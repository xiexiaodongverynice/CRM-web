import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import ObjectPageIndex from './../../components/object_page/ObjectPageIndex';
import Warner from '../../components/Page/Warner';
import * as crmIntlUtil from '../../utils/crmIntlUtil';

const ObjectIndex = ({ dispatch, location, object_page, loading }) => {
  const { layoutData, recordList, describeData, pagination, filterCriterias, selectorExtenderFilterCriterias, viewCriterias, default_view_index } = object_page;
  if (layoutData == null) {
    return <div className="k_container bg_white"> {crmIntlUtil.fmtStr('Rendering')}</div>;
  } else if (_.isEmpty(layoutData)) {
    return <div className="k_container bg_white"><Warner content={crmIntlUtil.fmtStr('Not Found Render Object')} /></div>;
  }

  const key = `object_page_object_index_${layoutData.api_name}`;
  return (
    <div className="k_container bg_white">
      <ObjectPageIndex
        key={key}
        dispatch={dispatch}
        loading={loading}
        location={location}
        layoutData={layoutData}
        describeData={describeData}
        recordList={recordList}
        pagination={pagination}
        filterCriterias={filterCriterias}
        viewCriterias={viewCriterias}
        selectorExtenderFilterCriterias={selectorExtenderFilterCriterias}
        default_view_index={default_view_index}
      />
    </div>
  );
};

ObjectIndex.propTypes = {
  object_page: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default connect(({ object_page, loading }) => ({ object_page, loading }))(ObjectIndex);
