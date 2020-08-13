/**
 * Created by Uncle Charlie, 2018/05/08
 */

import React from 'react';
import { Form, Col, Row } from 'antd';
import moment from 'moment';
import * as crmIntlUtil from '../utils/crmIntlUtil';

const FormItem = Form.Item;

export default function SignIn({
  required,
  parentRecord,
  fieldLayout,
  needDisabled = true,
}: {
  parentRecord: any,
  needDisabled: boolean,
  required: boolean,
  fieldLayout: any,
}) {
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  };

  const address = _.get(parentRecord, 'sign_in_location', '');
  const signInTime = _.get(parentRecord, 'sign_in_time');
  const columnNum = _.get(fieldLayout, 'columns', 1);
  const columnSpan = Math.floor(24 / columnNum);

  if (columnNum > 1) {
    return (
      <Row>
        <Col span={columnSpan}>
          <FormItem
            requred={required}
            label={crmIntlUtil.fmtStr('sign_in_location')}
            {...formItemLayout}
          >
            <span>{address}</span>
          </FormItem>
        </Col>
        <Col span={columnSpan}>
          <FormItem
            requred={required}
            label={crmIntlUtil.fmtStr('sign_in_time')}
            {...formItemLayout}
          >
            <span>{moment(signInTime).format('YYYY-MM-DD HH:mm')}</span>
          </FormItem>
        </Col>
      </Row>
    );
  } else {
    return (
      <Row>
        <Col span={columnSpan}>
          <FormItem
            requred={required}
            label={crmIntlUtil.fmtStr('sign_in_location')}
            {...formItemLayout}
          >
            <span>{address}</span>
          </FormItem>
          <FormItem
            requred={required}
            label={crmIntlUtil.fmtStr('sign_in_time')}
            {...formItemLayout}
          >
            <span>{moment(signInTime).format('YYYY-MM-DD HH:mm')}</span>
          </FormItem>
        </Col>
      </Row>
    );
  }
}
