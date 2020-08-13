import React, { Component } from 'react';
import { Row, Col } from 'antd';
import _ from 'lodash';
import * as styles from './WorkFlowState.less';

/**
 * Created by xinli on 2018/5/18.
 */

class WorkFlowStateBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAgreeModal: false,
      showRejectModal: false,
      showCancelModal: false,
    };
  }

  componentDidMount() {}

  render() {
    const { record, approval_info = {}, dispatch } = this.props;
    const { approval_flow_result, approval_flow_status } = record;
    const workflowResult = _.get(record, 'workflowResult', {});
    const process_name = _.get(workflowResult, 'process_name', '');
    const node_name = _.get(workflowResult, 'curr_task_name', '');
    const taskId = _.get(workflowResult, 'id', '');
    // if (!approval_flow) {
    //   return null;
    // }
    let approvalStatusStr = '';
    let approvalStatusStrColor = '#FF9933';
    switch (approval_flow_result) {
      case '0':
        if (approval_flow_status && approval_flow_status === '3') {
          approvalStatusStr = '已撤回';
        } else {
          approvalStatusStr = '未提交';
        }
        break;
      case '1':
        approvalStatusStr = '审批中';
        break;
      case '2':
        approvalStatusStr = '通过';
        approvalStatusStrColor = '#20B558';
        break;
      case '3':
        approvalStatusStr = '拒绝';
        approvalStatusStrColor = '#f10';
        break;
      default:
        approvalStatusStr = '';
        approvalStatusStrColor = '#FF9933';
        break;
    }
    return (
      <div id="workFlowStateBar" className={styles.workFlowStateBar}>
        <Row className={styles.content}>
          <Col span={6}>
            <div>审批流程：{process_name}</div>
          </Col>
          {/* <Col span={6}>
            <div>当前节点：{node_name}</div>
          </Col> */}
          <Col span={6}>
            <div>
              流程状态：<span style={{ color: approvalStatusStrColor }}>{approvalStatusStr}</span>
            </div>
          </Col>
          <Col span={6} />
        </Row>
      </div>
    );
  }
}

export default WorkFlowStateBar;
