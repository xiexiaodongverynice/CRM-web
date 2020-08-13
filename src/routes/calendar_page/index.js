import React, { Component } from 'react';
import { connect } from 'dva';
import CalendarPageIndex from './../../components/calendar_page/index';
import Warner from '../../components/Page/Warner';
import * as crmIntlUtil from '../../utils/crmIntlUtil';

const CalendarIndex = ({ dispatch, calendarLayout, defaultView, location, loading }) => {
  if(calendarLayout == null){
    return <div className="k_container bg_white"> {crmIntlUtil.fmtStr('Rendering')}</div>;
  }else if(_.isEmpty(calendarLayout)){
    return <div className="k_container bg_white"><Warner content={crmIntlUtil.fmtStr('Not Found Render Object')} /></div>;
  }
  return (
    <div>
      <CalendarPageIndex
        dispatch={dispatch}
        loading={loading}
        defaultView={defaultView}
        location={location}
        calendarLayout={calendarLayout}
      />
    </div>
  );
}

function mapStateToProps(state) {
  const { calendarLayout, defaultView, loading, } = state.calendar_page;
  // const loading = state.loading.global;
  return {
    calendarLayout,defaultView,loading,
  };
}
export default connect(mapStateToProps)(CalendarIndex);
