import React, { Component } from 'react';
import { Row, Col, Button, Popover, Timeline, Form, Modal, Input, Radio, Upload, Icon, Tooltip } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import classnames from 'classnames';
import * as styles from './ApprovalState.less';
import * as AttachmentService from '../../services/AttachmentService';
import * as CallBackUtil from '../../utils/callBackUtil';
import consoleUtil from '../../utils/consoleUtil';
import RecordFormItem from '../DataRecord/RecordFormItem';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';
/**
 * Created by xinli on 2018/5/18.
 */

const FormItem = Form.Item;

const ApprovalForm = Form.create()(
  class extends React.Component {

    state={
      allObject:{}
    }

    componentDidMount = () => {
      const allObject = fieldDescribeService.loadAllObject()
      this.setState({
        allObject
      })
    }

    handleAttachmentChange = (info) => {
      // consoleUtil.log('handleAttachmentChange', info);
    }

    loadObjectFieldDescribe = (payload) => {
      const { allObject } = this.state;
      const objectDescibeList = _.get(allObject,'items');
      const refObjectDescribe = _.find(objectDescibeList,{api_name:payload.object_api_name});
      const objectFieldDescribe = _.find(_.get(refObjectDescribe,'fields'),{'api_name':payload.field_api_name});
      return objectFieldDescribe;
    }


    renderFormItem = ({
      formItemValueChange = () => {}
    }) => {
      const { approvalComments = [], commentLabel = '审批意见', defaultComments, form } = this.props;
      const { getFieldDecorator } = form;
      if(!_.isEmpty(approvalComments)){
         return _.map(approvalComments,(approvalField)=>{
          const { field, is_required } = approvalField;
          const fieldDescribe = this.loadObjectFieldDescribe({ object_api_name: 'approval_node', field_api_name: field });
          const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 24 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 24 },
            },
          };
          _.set(fieldDescribe, 'is_required', is_required);
          const recordFormItemProps = {
            objectApiName: 'approval_node',
            fieldItem: fieldDescribe,
            renderFieldItem: approvalField,
            formItemLayout,
            form,
            formItemValueChange,
          };
      
          return <RecordFormItem {...recordFormItemProps} />;
        })
      }else{
        return <FormItem
          label={commentLabel}
        >
          {getFieldDecorator('comments', {
            initialValue: defaultComments
          })(
            <Input type="textarea" />,
          )}
        </FormItem>
      }
    }

    render() {
      const { visible, onCancel, onConfirm, title } = this.props;
     
      return (
        <Modal
          visible={visible}
          title={title}
          okText="确定"
          cancelText="取消"
          onCancel={onCancel}
          onOk={onConfirm}
        >
          <Form layout="vertical">
            {this.renderFormItem({formItemValueChange : () => {}})}
          </Form>
        </Modal>
      );
    }
  },
);

class ApprovalStateBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showAgreeModal: false,
      showRejectModal: false,
      showCancelModal: false
    };
  }

  saveAgreeFormRef = (formRef) => {
    this.agreeFormRef = formRef;
  };

  saveRejectFormRef = (formRef) => {
    this.rejectFormRef = formRef;
  };

  saveCancelFormRef = (formRef) => {
    this.cancelFormRef = formRef;
  }

  showAgreeModal = () => {
    this.setState({ showAgreeModal: true });
  };

  showRejectModal = () => {
    this.setState({ showRejectModal: true });
  };

  showCancelModal = () => {
    this.setState({ showCancelModal: true });
  }

  handleCancelAgreeForm = () => {
    this.setState({ showAgreeModal: false });
  };

  handleCancelRejectForm = () => {
    this.setState({ showRejectModal: false });
  };

  handleCancelCancelForm = () => {
    this.setState({ showCancelModal: false });
  }


  handleConfirmAgreeForm = (node_id) => {
    const form = this.agreeFormRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      _.forEach(values, (value, key) => {
        if (_.has(value, '_isAMomentObject')) {
          _.set(values, key, value.valueOf());
        }
        if(_.endsWith(value,'%')){
          _.set(values, key, _.replace(value,"%","")*0.01);
        }
      });
      const fileKeys = _.get(values, 'attachments.fileList', []).map((x) => x.response.key);
      this.agreeNode(node_id, 'agree', values, fileKeys);
      form.resetFields();
      this.setState({ showAgreeModal: false });
    });
  };

  handleConfirmRejectForm = (node_id) => {
    const form = this.rejectFormRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.agreeNode(node_id, 'reject', values);
      form.resetFields();
      this.setState({ showRejectModal: false });
    });
  };

  handleConfirmCancelForm = (flow_id) => {
    const form = this.cancelFormRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      // this.agreeNode(node_id, 'reject', values.comments);
      this.cancelApproval(flow_id, values.comments);
      form.resetFields();
      this.setState({ showCancelModal: false });
    });
  };

  agreeNode = (node_id, operation, values, attachments = []) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'detail_page/nodeOperation',
      payload: { node_id, operation, ...values, attachments }
    });
  };

  rejectNode = (nodeId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'detail_page/nodeOperation',
      payload: {
        node_id: nodeId,
        operation: 'reject',
        comments: 'Reject'
      }
    });
  };
  cancelApproval = (flow_id, comments) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'detail_page/cancelApproval',
      payload: {
        flow_id,
        comments
      },
    });
  };

  approvalComments = (key) => {
    const { approval_info = {} } = this.props;
    const { approval_flow } = approval_info;
    const flow_definition = JSON.parse(_.get(approval_flow,'flow_definition',"{}"));
    const approvalComments = _.get(flow_definition,`nodes.${key}.approval_comments_contents`);
    return approvalComments
  }


  render() {
    const { record, approval_info = {}, dispatch } = this.props;
    const { approval_nodes = [], approval_flow } = approval_info;
    if (!approval_flow) {
      return null;
    }
    const nodeNeedOperate = approval_nodes.filter((x) =>
      x.type === 'user_task'
      && (x.status === 'waiting' || x.status === 'accepted')
      // 当前用户是operator或candidate_operators之一
      && (x.operator === _.toNumber(window.FC_CRM_USERID)
        || (x.candidate_operators || []).indexOf(_.toNumber(window.FC_CRM_USERID)) >= 0),
    )[0];


    const approvalComments = this.approvalComments(_.get(nodeNeedOperate,'key',''))

    const currentNodeName = nodeNeedOperate ? (
      <div>当前节点:<span>{nodeNeedOperate.name}</span></div>
    ) : null;

    const agreeButton = nodeNeedOperate ? (
      <div style={{ display: 'inline-block' }}>
        <Button
          className={styles.btnAgree}
          icon="check"
          onClick={this.showAgreeModal}
        >同意</Button>
        <ApprovalForm
          wrappedComponentRef={this.saveAgreeFormRef}
          title="同意审批"
          approvalComments = {_.get(approvalComments,'agree',[])}
          visible={this.state.showAgreeModal}
          defaultComments=""
          onCancel={this.handleCancelAgreeForm}
          onConfirm={this.handleConfirmAgreeForm.bind(this, nodeNeedOperate.id)}
          nodeNeedOperate={nodeNeedOperate}
        />
      </div>) : null;

    const rejectButton = nodeNeedOperate ? (
      <div style={{ display: 'inline-block' }}>
        <Button
          className={styles.btnReject}
          icon="close" onClick={this.showRejectModal}
        >拒绝</Button>
        <ApprovalForm
          wrappedComponentRef={this.saveRejectFormRef}
          title="拒绝审批"
          approvalComments = {_.get(approvalComments,'reject',[])}
          defaultComments=""
          visible={this.state.showRejectModal}
          onCancel={this.handleCancelRejectForm}
          onConfirm={this.handleConfirmRejectForm.bind(this, nodeNeedOperate.id)}
          nodeNeedOperate={nodeNeedOperate}
        />
      </div>) : null;

    const showCancelBtn = approval_flow.status === 'in_progress' && approval_flow.submitter === _.toNumber(window.FC_CRM_USERID);
    const cancelButton = showCancelBtn ? (
      <div style={{ display: 'inline-block' }}>
        <Button
          className={styles.btn}
          icon="rollback"
          onClick={this.showCancelModal.bind(this, approval_flow.id)}
        >撤回</Button>
        <ApprovalForm
          wrappedComponentRef={this.saveCancelFormRef}
          title="撤回审批"
          commentLabel="撤回原因"
          defaultComments=""
          enableAttachement={false}
          visible={this.state.showCancelModal}
          onCancel={this.handleCancelCancelForm}
          onConfirm={this.handleConfirmCancelForm.bind(this, approval_flow.id)}
        />
      </div>
    ) : null;


    const Summary = () => {
      if (approval_flow.status === 'agreed') {
        return (
          <div>
            <div>单号：{approval_flow.name}-{approval_flow.id}</div>
            <div>
              <span>{moment(approval_flow.update_time).format('YYYY-MM-DD HH:mm')}</span>
              <span className={styles.labelAgree}>审批通过</span>
            </div>
          </div>
        );
      } else if (approval_flow.status === 'rejected') {
        return (
          <div>
            <div>单号：{approval_flow.name}-{approval_flow.id}</div>
            <div>
              <span>{moment(approval_flow.update_time).format('YYYY-MM-DD HH:mm')}</span>
              <span className={styles.labelReject}>审批拒绝</span>
            </div>
          </div>
        );
      } else if (approval_flow.status === 'canceled') {
        return (
          <div>
            <div>单号：{approval_flow.name}-{approval_flow.id}</div>
            <div>
              <span>{moment(approval_flow.update_time).format('YYYY-MM-DD HH:mm')}</span>
              <span className={styles.labelCanceled}>撤销审批</span>
            </div>
          </div>
        );
      } else {
        const lastAgreedNode = approval_nodes
          .filter((x) => x.type === 'user_task' & x.status === 'agreed')
          .sort((x, y) => { return x.update_time < y.update_time; })[0];

        const waitingNodes = approval_nodes
          .filter((x) => x.type === 'user_task' & x.status === 'waiting')
          .map((x) => <span key={`waiting_${x.name}`}>{x.name} </span>);

        const acceptedNodes = approval_nodes
          .filter((x) => x.type === 'user_task' & x.status === 'accepted')
          .map((x) => <span key={`accepted_${x.name}`}>{x.name} </span>);


        if (lastAgreedNode) {
          const isInsteadOperator = _.has(lastAgreedNode, 'instead_operator', false);
          const lastNodeOperation = lastAgreedNode.status === 'agreed' ? '同意' : lastAgreedNode.status === 'accepted' ? '受理' : '拒绝';
          return (
            <div>
              <div>单号：{approval_flow.id}</div>
              <div>
                <span>{moment(lastAgreedNode.update_time).format('YYYY-MM-DD HH:mm')}</span>
                <span style={{ paddingLeft: '1.2em' }}>{lastAgreedNode.name}</span>
                <span style={{ paddingLeft: '0.2em' }} className={styles.labelUserName}>{lastAgreedNode.operator__r.name} </span>

                {isInsteadOperator &&
                <Tooltip
                  title={
                    <div>
                      <div>代审批人：{lastAgreedNode.instead_operator__r.name}</div>
                      <div>职务：{lastAgreedNode.instead_operator_duty}</div>
                    </div>
                  }
                >
                  <Icon type="info-circle-o" />
                </Tooltip>
                }

                <span className={_.isEqual(lastAgreedNode.status, 'accepted') ? styles.labelAccepted : styles.labelAgree}>{lastNodeOperation}</span>
                {!_.isEmpty(acceptedNodes) && <div>待审批：{acceptedNodes}</div>}
                {!_.isEmpty(waitingNodes) && <div>待审批：{waitingNodes}</div>}
              </div>
            </div>
          );
        } else {
          return (
            <div>
              <div>单号：{approval_flow.id}</div>
              {!_.isEmpty(acceptedNodes) && <div>待审批：{acceptedNodes}</div>}
              {!_.isEmpty(waitingNodes) && <div>待审批：{waitingNodes}</div>}
            </div>
          );
        }
      }
    };

    const timelineAttachments = (node) => {
      // TODO 在时间轴上显示附件
      return null;
    };

    const FlowViewer = () => {
      const timeLines =
        _.sortBy(approval_nodes, ['create_time'])
        .map((node) => {
          const isInsteadOperator = _.has(node, 'instead_operator', false);
          const hasComments = _.has(node, 'comments', false);
          const start = moment(node.create_time);
          const end = moment(_.get(node, 'node_finish_time', node.update_time));// 兼容之前审批没有node_finish_time的情况
          let duration = moment.duration(end.diff(start));
          let duration_days = duration.days();
          let duration_hrs = duration.hours();
          let duration_mins = duration.minutes();
          if (node.status === 'agreed') {
            return (
              <Timeline.Item key={node.id} color="green">
                <div>
                  <span className={styles.labelUserName}>{node.operator__r.name}</span>
                  {isInsteadOperator &&
                  <Tooltip
                    title={
                      <div>
                        <div>代审批人：{node.instead_operator__r.name}</div>
                        <div>职务：{node.instead_operator_duty}</div>
                      </div>
                    }
                  >
                    <Icon style={{ paddingLeft: '0.2em' }} type="info-circle-o" />
                  </Tooltip>
                  }
                  <span className={styles.labelLeftSpan}>{moment(node.update_time).format('YYYY-MM-DD HH:mm')}</span>
                  <span className={styles.labelAgree}>同意</span>

                </div>
                <div>
                  <span>职务：</span>
                  <span>{node.operator_duty}</span>
                </div>
                <div>
                  <span>用时：</span>
                  <span>{duration_days}天{duration_hrs}小时{duration_mins}分</span>
                </div>
                {timelineAttachments(node)}
                {hasComments && <div style={{ padding: '0.5em', backgroundColor: '#f9f9f9' }}>{node.comments}</div>}
              </Timeline.Item>);
          } else if (node.status === 'rejected') {
            return (
              <Timeline.Item key={node.id} color="red">
                <div>
                  <span className={styles.labelUserName}>{node.operator__r.name}</span>
                  {isInsteadOperator &&
                  <Tooltip
                    title={
                      <div>
                        <div>代审批人：{node.instead_operator__r.name}</div>
                        <div>职务：{node.instead_operator_duty}</div>
                      </div>
                    }
                  >
                    <Icon style={{ paddingLeft: '0.2em' }} type="info-circle-o" />
                  </Tooltip>
                  }
                  <span className={styles.labelLeftSpan}>{moment(node.update_time).format('YYYY-MM-DD HH:mm')}</span>
                  <span className={styles.labelReject}>拒绝</span>
                </div>
                <div>
                  <span>职务：</span>
                  <span>{node.operator_duty}</span>
                </div>
                <div>
                  <span>用时：</span>
                  <span>{duration_days}天{duration_hrs}小时{duration_mins}分</span>
                </div>
                {timelineAttachments(node)}
                {hasComments && <div style={{ padding: '0.5em', backgroundColor: '#f9f9f9' }}>{node.comments}</div>}
              </Timeline.Item>);
          } else if (node.status === 'waiting') {
            // 此处应该用（当前时间）来处理「等待时间」
            duration = moment.duration(moment().diff(start));
            duration_days = duration.days();
            duration_hrs = duration.hours();
            duration_mins = duration.minutes();
            return (<Timeline.Item key={node.id} color="blue">
              <div>{node.name} 等待处理</div>
              <div>等待 {duration_days}天{duration_hrs}小时{duration_mins}分 </div>
            </Timeline.Item>);
          } else if (node.status === 'accepted') {
            return (<Timeline.Item
              key={node.id}
              dot={<Icon type="clock-circle-o" style={{ fontSize: '16px' }} />}
              color="blue"
            >
              <div>
                <span className={styles.labelUserName}>{node.operator__r.name}</span>
                {isInsteadOperator &&
                <Tooltip
                  title={
                    <div>
                      <div>代审批人：{node.instead_operator__r.name}</div>
                      <div>职务：{node.instead_operator_duty}</div>
                    </div>
                  }
                >
                  <Icon style={{ paddingLeft: '0.2em' }} type="info-circle-o" />
                </Tooltip>
                }
                <span className={styles.labelLeftSpan}>{moment(node.update_time).format('YYYY-MM-DD HH:mm')}</span>
                <span className={styles.labelAccepted}>受理</span>
              </div>
              <div>
                <span>职务：</span>
                <span>{node.operator_duty}</span>
              </div>
              <div>
                <span>用时：</span>
                <span>{duration_days}天{duration_hrs}小时{duration_mins}分</span>
              </div>
              {timelineAttachments(node)}
              {hasComments && <div style={{ padding: '0.5em', backgroundColor: '#f9f9f9' }}>{node.comments}</div>}
            </Timeline.Item>);
          } else {
            return null;
          }
        });

      const content = (
        <div>
          <Timeline>
            <Timeline.Item color="green">
              <div>
                <span className={styles.labelUserName}>{approval_flow.submitter__r.name}</span>
                <span className={styles.labelLeftSpan}>{moment(approval_flow.create_time).format('YYYY-MM-DD HH:mm')}</span>
                <span className={styles.labelAgree}>发起审批</span>
              </div>
              <div>
                <span>职务：</span>
                <span>{approval_flow.operator_duty}</span>
              </div>
            </Timeline.Item>
            {timeLines}

            {
              approval_flow.status=="canceled" &&
              <Timeline.Item color="yellow">
                <div>
                  <span className={styles.labelUserName}>{approval_flow.submitter__r.name}</span>
                  <span className={styles.labelLeftSpan}>{moment(approval_flow.update_time).format('YYYY-MM-DD HH:mm')}</span>
                  <span className={styles.labelCanceled}>撤销审批</span>
                </div>
                <div>
                  <span>职务：</span>
                  <span>{approval_flow.operator_duty}</span>
                </div>
              </Timeline.Item>
            }


          </Timeline>
        </div>
      );

      return (
        <Popover
          content={content} placement="bottomLeft"
        >
          <Button>查看审批流程</Button>
        </Popover>
      );
    };

    return (
      <div id="approvalStatusBar" className={styles.approvalStatusBar}>
        <Row className={styles.content}>
          <Col span={8}>
            <Summary />
          </Col>
          <Col span={8}>
            <FlowViewer />
          </Col>
          <Col style={{ textAlign: 'right' }} span={8}>
            {currentNodeName}
            <div>
              {agreeButton}
              {rejectButton}
              {cancelButton}
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ApprovalStateBar;
