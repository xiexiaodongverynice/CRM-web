/**
 * Created by xinli on 2017/9/5.
 */
import React, { Component } from 'react';
import { hashHistory } from 'react-router';
import _ from 'lodash';
import { Table, Icon, Form, Input, Button, DatePicker, Select, Upload } from 'antd';
import * as recordService from '../../services/object_page/recordService';
import styles from './../../components/DataRecord/detail.less'
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';
import AttachmentFieldItem from '../../components/DataRecord/AttachmentFieldItem';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';

const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;

const message_require = crmIntlUtil.fmtStr('message.is_required');
class NoticeForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      profiles: [],
    };
  }

  componentWillMount() {
    recordService.queryRecordList({ dealData: {
      needRelationQuery:false,
      objectApiName: 'profile',
      joiner: 'and',
      pageSize: 1000,
      pageNo: 1,
    } }).then((response) => {
      const { result: profiles } = response;
      this.setState({
        profiles,
      });
    });
  }

  componentDidMount() {
    // consoleUtil.log('componentDidMount');
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const formValue = {
          ...values,
          expire_date: values.expire_date.valueOf(),
          publish_date: new Date().getTime(),
        };
        const { notice: oldValue } = this.props;
        this.props.dispatch({
          type: 'notice_form/createOrUpdate',
          payload: { ...oldValue, ...formValue },
        });
      }
    });
  };

  loadObjectFieldDescribe = () => {
    const allObject = fieldDescribeService.loadAllObject();
    const objectDescibeList = _.get(allObject, 'items');
    const refObjectDescribe = _.find(objectDescibeList, { api_name: 'notice' });
    const objectFieldDescribe = _.find(_.get(refObjectDescribe, 'fields'), { api_name: 'attachment' });
    return objectFieldDescribe;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { notice } = this.props;
    const objectFieldDescribe = this.loadObjectFieldDescribe();

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
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 20,
          offset: 4,
        },
      },
    };

    const profileOptions = this.state.profiles.map(x => <Option key={x.id} value={x.id.toString()} >{x.name}</Option>);


    return (
      <div className="k_container bg_white">
        <Form onSubmit={this.handleSubmit} className={styles.fieldSectionForm}>
          <FormItem
            {...formItemLayout}
            label={`${crmIntlUtil.fmtStr('field.title','标题')}`}
            hasFeedback
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true,
                message: `${crmIntlUtil.fmtStr('field.title','标题')} ${message_require}.`,
              }],
              initialValue: notice.name,
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={`${crmIntlUtil.fmtStr('field.priority','级别')}`}
          >
            {getFieldDecorator('priority', {
              rules: [{
                required: true,
                message: `${crmIntlUtil.fmtStr('field.priority','级别')} ${message_require}.`,
              }],
              initialValue: notice.priority,
            })(
              <Select>
                <Option value="1">{crmIntlUtil.fmtStr('label.major','重要')}</Option>
                <Option value="2">{crmIntlUtil.fmtStr('label.general','一般')}</Option>
              </Select>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={`${crmIntlUtil.fmtStr('field.expire_date','失效日期')}`}
            hasFeedback
          >
            {getFieldDecorator('expire_date', {
              rules: [{
                required: true,
                message: `${crmIntlUtil.fmtStr('field.expire_date','失效日期')} ${message_require}.`,
              }],
            })(
              <DatePicker />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={`${crmIntlUtil.fmtStr('field.profiles','发布范围')}`}
          >
            {getFieldDecorator('profiles', {
              rules: [{
                required: true,
                message: `${crmIntlUtil.fmtStr('field.profiles','发布范围')} ${message_require}.`,
              }],
              initialValue: notice.profiles,
            })(
              <Select
                mode="multiple"
                style={{ width: '100%' }}
              >
                {profileOptions}
              </Select>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={`${crmIntlUtil.fmtStr('field.description','内容')}`}
            hasFeedback
          >
            {getFieldDecorator('description', {
              rules: [{
                required: true,
                message: `${crmIntlUtil.fmtStr('field.description','内容')} ${message_require}.`,
              }],
            })(
              <TextArea autosize={{ minRows: 10, maxRows: 200 }} />,
            )}
          </FormItem>
          {objectFieldDescribe && <FormItem
            {...formItemLayout}
            label={`${crmIntlUtil.fmtStr('label.upload_file', '上传附件')}`}
            hasFeedback
          >
            {getFieldDecorator('attachment', {
              rules: [{
                required: objectFieldDescribe.is_required,
                message: `${crmIntlUtil.fmtStr('label.upload_file', '上传附件')} ${message_require}.`,
              }],
            })(
              <AttachmentFieldItem relationField={objectFieldDescribe} />
            )}
          </FormItem>}
          <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit">{crmIntlUtil.fmtStr('action.save','保存')}</Button>
            <Button onClick={() => { hashHistory.push('/fc_notice'); }} style={{ marginLeft: '1em' }}>{crmIntlUtil.fmtStr('action.callback','返回')}</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(NoticeForm);
