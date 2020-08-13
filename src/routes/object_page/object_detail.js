import React, { Component } from 'react';
import _ from 'lodash';
import { hashHistory, routerRedux } from 'dva/router';
import ApprovalStateBar from '../../components/approval/ApprovalState';
import WorkFlowStateBar from '../../components/workFlow/WorkFlowState';
import ObjectPageDetail from './../../components/object_page/ObjectPageDetail';
import Warner from '../../components/Page/Warner';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';

const ObjectDetail = ({
  dispatch,
  layoutData,
  describe,
  record,
  location,
  relatedLayout,
  pageType,
  relatedFieldList,
  approval_info,
  recordType,
  edit_mode,
  childrenToParentRefresh,
}) => {
  const realRecordType = _.get(record, 'record_type', 'master');
  if (_.isEmpty(layoutData) && !_.isEmpty(record)) {
    if (recordType !== realRecordType) {
      consoleUtil.warn('发现布局属性不一致现象，自动匹配正确布局');
      if (recordType) {
        const fromUrl = location.pathname;
        let fromUrlSearch = location.search;
        const fromUrlQuery = location.query;
        const k = _.get(fromUrlQuery, 'k');
        fromUrlSearch = fromUrlSearch
          .replace(`&k=${k}`, '')
          .replace(`_k=${k}`, '')
          .replace(`recordType=${recordType}`, `recordType=${realRecordType}`);
        dispatch(routerRedux.push(fromUrl + fromUrlSearch));
      }
    }
  }

  if (layoutData == null) {
    return <div className="k_container bg_white"> {crmIntlUtil.fmtStr('Rendering')}</div>;
  } else if (_.isEmpty(layoutData)) {
    return (
      <div className="k_container bg_white">
        <Warner content={crmIntlUtil.fmtStr('Not Found Render Object')} />
      </div>
    );
  }

  const { enable_approval_flow } = describe;
  const RenderApprovalBar = () => {
    return enable_approval_flow ? (
      <ApprovalStateBar record={record} approval_info={approval_info} dispatch={dispatch} />
    ) : null;
  };
  const RenderWorkFlowBar = () => {
    // approval_flow_status  流程状态 string
    // 0：草稿、待提交
    // 1：处理中
    // 2：结束
    // 3：撤回

    // approval_flow_result  流程结果 string
    // 0：未提交、待提交
    // 1：处理中
    // 2：通过
    // 3：拒绝
    const approval_flow_result = _.get(record, 'approval_flow_result', '0');
    const approval_flow_status = _.get(record, 'approval_flow_status', 0);

    return approval_flow_result && approval_flow_status ? (
      <WorkFlowStateBar record={record} approval_info={approval_info} dispatch={dispatch} />
    ) : null;
  };
  return (
    <div className="k_container bg_white" key={`div_object_page_object_detail_${record.id}`}>
      <RenderApprovalBar />
      <RenderWorkFlowBar />
      <ObjectPageDetail
        key={`object_page_object_detail_${record.id}`}
        dispatch={dispatch}
        location={location}
        layout={layoutData}
        relatedLayout={relatedLayout}
        describe={describe}
        record={record}
        relatedFieldList={relatedFieldList}
        pageType={pageType}
        edit_mode={edit_mode}
        childrenToParentRefresh={childrenToParentRefresh}
      />
    </div>
  );
};

export default ObjectDetail;
