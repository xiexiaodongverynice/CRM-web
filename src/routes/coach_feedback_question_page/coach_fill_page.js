import React, { Component } from 'react';
import { connect } from 'dva';
import CoachFillPage from '../../components/coach_feedback_page/CoachFillPage';

const CoachFillRoutePage = ({ dispatch, location, pageType, coachId, coachRecordData, secretJwtData }) => {
  return (
    <div style={{ padding: 24, background: '#fff', minHeight: 525 }}>
      <CoachFillPage
        dispatch={dispatch}
        location={location}
        pageType={pageType}
        coachId={coachId}
        coachRecordData={coachRecordData}
        secretJwtData={secretJwtData}
      />
    </div>
  );
};

function mapStateToProps(state) {
  const { pageType, coachId, coachRecordData, secretJwtData } = state.coach_fill_page;
  return {
    pageType, coachId, coachRecordData, secretJwtData,
  };
}
export default connect(mapStateToProps)(CoachFillRoutePage);
