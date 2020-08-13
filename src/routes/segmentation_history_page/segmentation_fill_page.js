import React, { Component } from 'react';
import { connect } from 'dva';
import SegmentationFillPage from './../../components/segmentation_history_page/SegmentationFillPage';

const SegmentationFillRoutePage = ({ dispatch,  location, pageType, segmentationId, segmentationRecordData, secretJwtData }) => {
  return (
    <div style={{  background: '#fff', minHeight: 525 }}>
      <SegmentationFillPage
        dispatch={dispatch}
        location={location}
        pageType={pageType}
        segmentationId={segmentationId}
        segmentationRecordData={segmentationRecordData}
        secretJwtData={secretJwtData}
      />
    </div>
  );
}

function mapStateToProps(state) {
  const { pageType, segmentationId, segmentationRecordData, secretJwtData } = state.segmentation_fill_page;
  return {
    pageType, segmentationId, segmentationRecordData, secretJwtData
  };
}
export default connect(mapStateToProps)(SegmentationFillRoutePage);
