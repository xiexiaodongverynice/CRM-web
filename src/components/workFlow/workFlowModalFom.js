// workFlowModalFom
import React, { Component } from 'react';
import { Row, Col, Button, Popover, Timeline, Form, Modal, Input, Table } from 'antd';
import _ from 'lodash';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import * as recordService from '../../services/object_page/recordService';
import AttachmentFieldItem from '../../components/DataRecord/AttachmentFieldItem';
import { processCriterias } from '../../utils/criteriaUtil';

/**
 * 撤回、同意、拒绝弹窗
 * @params {开始时间戳} start
 *
 */

const FormItem = Form.Item;
const Search = Input.Search;
const WorkFlowModalFom = Form.create()(
  class extends React.Component {
    state = {
      allObject: {},
      modalTitle: '',
      textareaTitle: '',
      textareaRequired: false,
      renderTable: false,
      TableMultipleSelect: false,
      loading: true,
      dataSource: [],
      selectIds: [],
    };

    componentDidMount = () => {
      // const allObject = fieldDescribeService.loadAllObject()
      // this.setState({
      //   allObject
      // })
      const { titleType } = this.props;
      let modalTitle = '';
      let textareaTitle = '';
      let textareaRequired = false;
      let renderTable = false;
      let TableMultipleSelect = false;
      switch (titleType) {
        case 'WITHDRAW':
          modalTitle = '审批撤回';
          textareaTitle = '撤回原因';
          break;
        case 'AGREE':
          modalTitle = '审批同意';
          textareaTitle = '审批意见';
          break;
        case 'REJECT':
          modalTitle = '审批拒绝';
          textareaTitle = '审批意见';
          textareaRequired = true;
          break;
        case 'ADDSIGN':
          modalTitle = '选择加签审批人';
          renderTable = true;
          TableMultipleSelect = true;
          break;
        case 'ENTRUST':
          modalTitle = '选择委托审批人';
          renderTable = true;
          TableMultipleSelect = false;
          break;
        default:
          modalTitle = '';
          textareaTitle = '';
      }
      if (titleType === 'ADDSIGN' || titleType === 'ENTRUST') {
        const filterCriterias = processCriterias(
          _.get(this.props, 'actionLayout.filterCriterias', []),
        );
        const query = {
          objectApiName: 'user_info',
          criterias: _.concat(
            [
              {
                field: 'enable',
                value: [true],
                operator: '==',
              },
              {
                field: 'id',
                value: [window.FC_CRM_USERID],
                operator: '<>',
              },
            ],
            filterCriterias,
          ),
          joiner: 'and',
          orderBy: 'create_time',
          order: 'desc',
          pageSize: 100000,
          pageNo: 1,
        };
        this.fetchData(query);
      }
      this.setState({
        modalTitle,
        textareaTitle,
        textareaRequired,
        renderTable,
        TableMultipleSelect,
      });
    };

    fetchData = (query) => {
      recordService.queryRecordList({ dealData: query }).then((response) => {
        const { result } = response;
        this.setState({
          dataSource: result,
          loading: false,
        });
      });
    };

    handleSearch = (value) => {
      const keyWordCriteria = [{ field: 'name', operator: 'contains', value: [_.trim(value)] }];
      const filterCriterias = processCriterias(
        _.get(this.props, 'actionLayout.filterCriterias', []),
      );
      const query = {
        objectApiName: 'user_info',
        criterias: _.concat(
          [
            {
              field: 'enable',
              value: [true],
              operator: '==',
            },
            {
              field: 'id',
              value: [window.FC_CRM_USERID],
              operator: '<>',
            },
          ],
          filterCriterias,
          keyWordCriteria,
        ),
        joiner: 'and',
        orderBy: 'create_time',
        order: 'desc',
        pageSize: 100000,
        pageNo: 1,
      };
      this.fetchData(query);
    };

    renderTableItem = () => {
      const columns = [
        {
          title: '用户名称',
          dataIndex: 'name',
          render: (text) => <a>{text}</a>,
        },
        {
          title: '角色',
          dataIndex: 'profile__r.name',
        },
        {
          title: '邮箱',
          dataIndex: 'email',
        },
        {
          title: '性别',
          dataIndex: 'gender',
        },
        {
          title: '电话',
          dataIndex: 'phone',
        },
      ];

      const { TableMultipleSelect, dataSource, loading } = this.state;
      const rowSelection = {
        type: TableMultipleSelect ? 'checkbox' : 'radio',
        onChange: (selectedRowKeys, selectedRows) => {
          const selectIds = [];
          _.map(selectedRows, (item) => {
            selectIds.push(`${item.id}`);
          });
          this.setState({
            selectIds,
          });
        },
      };

      return (
        <div>
          <Row>
            <Search
              placeholder="按用户名模糊查询"
              style={{
                width: '200px',
                margin: '0 0 10px 0',
              }}
              onSearch={this.handleSearch}
            />
          </Row>
          <Row>
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              rowKey={(record) => record.id}
            />
          </Row>
        </div>
      );
    };

    renderFormItem = () => {
      const { approvalComments = [], defaultComments, form, titleType } = this.props;
      const { textareaTitle, textareaRequired } = this.state;
      const { getFieldDecorator } = form;
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 20 },
        },
      };
      return (
        <div>
          <FormItem label={textareaTitle} {...formItemLayout}>
            {getFieldDecorator('comment', {
              initialValue: '',
              rules: [
                {
                  required: textareaRequired,
                  message: crmIntlUtil.fmtStr('message.please fill in the approval comments'),
                },
              ],
            })(<Input type="textarea" />)}
          </FormItem>
          {titleType === 'REJECT' && (
            <FormItem label={`${crmIntlUtil.fmtStr('label.upload_file', '上传附件')}`}>
              {getFieldDecorator('attachments', {
                initialValue: [],
              })(
                <AttachmentFieldItem
                  relationField={{
                    max_count: '9',
                    file_ext: ['txt', 'word', 'excel', 'ppt', 'pdf', 'img'],
                    max_size: '1047586',
                  }}
                />,
              )}
            </FormItem>
          )}
        </div>
      );
    };

    onConfirm = () => {
      const { form, okHandler } = this.props;
      const { renderTable, selectIds } = this.state;
      if (renderTable) {
        // assignees:[]
        okHandler({ selectIds });
      } else {
        form.validateFields((err, values) => {
          if (err) {
            return;
          }
          okHandler(values);
        });
      }
    };

    render() {
      const { visible, onCancelokHandler, modalFomState } = this.props;
      const { modalTitle, renderTable } = this.state;

      return (
        <Modal
          visible={modalFomState}
          title={modalTitle}
          width={renderTable ? 800 : 500}
          okText="确定"
          cancelText="取消"
          onCancel={onCancelokHandler}
          onOk={this.onConfirm}
        >
          {renderTable ? (
            <div>{this.renderTableItem()}</div>
          ) : (
            <Form layout="vertical">{this.renderFormItem()}</Form>
          )}
        </Modal>
      );
    }
  },
);
export default WorkFlowModalFom;
