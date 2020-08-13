import React, { Component } from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Button, Row, Form, Input, Checkbox, Spin, Col, Icon } from 'antd';
import _ from 'lodash';
import { Link } from 'react-router';
import { hashHistory } from 'dva/router';
import styles from './userPassword.less';
import { config } from '../../utils';
import * as crmIntlUtil from '../../utils/crmIntlUtil';

const FormItem = Form.Item;

const ResetPasswordPage = ({
  user_password,
  loading,
  dispatch,
  form: {
    getFieldDecorator,
    validateFieldsAndScroll,
    getFieldsError,
    getFieldError,
    isFieldTouched,
  },
}) => {
  function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some((field) => fieldsError[field]);
  }
  function goBack() {
    hashHistory.go(-1);
  }
  function handleOk() {
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return;
      }
      const suffix = _.get(config.DOMAIN_LOGINNAME_DIC, document.domain);
      const { loginId } = values;
      // 如果loginName包含@，则不自动添加后面的域名，以便兼容登陆其他未在DOMAIN_LOGICNAME_DIC中注册的租户的情况
      if (loginId.indexOf('@') < 0 && !_.isEmpty(suffix) && !_.endsWith(loginId, suffix)) {
        _.set(values, 'loginId', `${loginId}${suffix}`);
      }
      dispatch({
        type: 'user_password/reset',
        payload: {
          body: values,
        },
      });
    });
  }
  const userError = isFieldTouched('user') && getFieldError('user');
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
  return (
    <div className={styles.form} style={{ background: '#FFFFFF', height: 250 }}>
      <Row className={styles.header} span={24}>
        <Col span={20}>
          <h1>{crmIntlUtil.fmtStr('label.retrieve_password')}</h1>
        </Col>
        <Col
          span={4}
          style={{ textAlign: 'right', fontSize: 20, cursor: 'pointer' }}
          onClick={goBack}
        >
          <Icon type="close" />
        </Col>
      </Row>
      <form>
        <FormItem
          label={crmIntlUtil.fmtStr('label.account_name')}
          help={userError || ''}
          {...formItemLayout}
        >
          {getFieldDecorator('loginId', {
            rules: [
              {
                required: true,
                message: crmIntlUtil.fmtStr('message.login_name is required'),
              },
            ],
          })(<Input size="large" onPressEnter={handleOk} placeholder="" />)}
        </FormItem>
        <FormItem>
          <Row>
            <Button
              type="primary"
              size="large"
              loading={loading.models.user_password}
              disabled={hasErrors(getFieldsError())}
              onClick={handleOk}
            >
              {crmIntlUtil.fmtStr('action.ok')}
            </Button>
            <p>
              <span>{config.footerText}</span>
              <span>
                <a href="http://www.beian.miit.gov.cn" target="_blank">
                  {config.recordNumbe}
                </a>
              </span>
            </p>
          </Row>
        </FormItem>
      </form>
    </div>
  );
};

ResetPasswordPage.propTypes = {
  form: PropTypes.object,
  user_password: PropTypes.object,
  loading: PropTypes.object,
  dispatch: PropTypes.func,
};

export default connect(({ user_password, loading }) => ({ user_password, loading }))(
  Form.create()(ResetPasswordPage),
);
