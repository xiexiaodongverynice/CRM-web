import React, { Component } from 'react';
import { connect } from 'dva';
import NoticeForm from './form';

const AddNotice = ({ dispatch, notice, location, loading }) => {
  return (
    <NoticeForm
      dispatch={dispatch}
      notice={notice}
      location={location}
    />
  );
};

function mapStateToProps(state) {
  const { notice } = state.notice_form;
  return {
    notice,
  };
}
export default connect(mapStateToProps)(AddNotice);
