import React, { Component } from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button, Row, Form, Input, Col, message, Icon, Alert } from 'antd';
import _ from 'lodash';
import { Link } from 'react-router';
import { hashHistory } from 'dva/router';
import styles from './userPassword.less';
import { config } from '../../utils';
import * as crmIntlUtil from '../../utils/crmIntlUtil';

const FormItem = Form.Item;

const ChangePasswordPage = ({
  dispatch,
  form: {
    getFieldDecorator,
    validateFieldsAndScroll,
    getFieldsError,
    getFieldError,
    isFieldTouched,
  },
  user_password: { securityCheck },
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
      const { oldPwd, newPwd, renewPwd } = values;
      const token = localStorage.getItem('token');
      const loginId = localStorage.getItem('loginName');
      if (newPwd !== renewPwd) {
        message.error(
          crmIntlUtil.fmtStr(
            'message.password_is_not_consistent',
            '两次新密码输入不一致，请重新输入',
          ),
        );
      } else {
        dispatch({
          type: 'user_password/change',
          payload: {
            head: {
              token,
            },
            body: {
              loginId,
              oldPwd,
              newPwd,
            },
          },
          callback: (success) => {
            if (success) {
              message.success(
                crmIntlUtil.fmtStr(
                  'message.password_change_success',
                  '密码修改成功，正在退出，请重新登录',
                ),
                1.5,
              );
              setTimeout(() => {
                dispatch({
                  type: 'App/logout',
                });
              }, 2000);
            }
          },
        });
      }
    });
  }

  const oldPwdError = isFieldTouched('oldPwd') && getFieldError('oldPwd');
  const newPwdError = isFieldTouched('newPwd') && getFieldError('newPwd');
  const renewPwdError = isFieldTouched('renewPwd') && getFieldError('renewPwd');
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      md: { span: 12 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      md: { span: 12 },
      sm: { span: 16 },
    },
  };
  const description = crmIntlUtil.fmtStr(
    `security_check_${_.get(securityCheck, 'api_name')}`,
    _.get(securityCheck, 'description', ''),
  );
  return (
    <div className={styles.wrap}>
      <Row className={styles.header} span={24}>
        <Col span={20}>
          <h1>{crmIntlUtil.fmtStr('action.change_password', '修改密码')}</h1>
        </Col>
        <Col
          span={4}
          style={{ textAlign: 'right', fontSize: 20, cursor: 'pointer' }}
          onClick={goBack}
        >
          <Icon type="close" />
        </Col>
      </Row>

      {!_.isEmpty(securityCheck) && (
        <Row span={24}>
          <Col span={24} offset={0}>
            <Alert
              message={crmIntlUtil.fmtStr('label.announcements', '注意')}
              description={<pre dangerouslySetInnerHTML={{ __html: description }} />}
              // description={<pre>{description}</pre>}
              type="warning"
              showIcon
              closable
            />
          </Col>
        </Row>
      )}

      <div className={styles.changePasswordBox}>
        <form>
          <FormItem
            label={crmIntlUtil.fmtStr('label.old_password', '旧密码')}
            {...formItemLayout}
            help={oldPwdError || ''}
          >
            {getFieldDecorator('oldPwd', {
              rules: [
                {
                  required: true,
                  message: `${crmIntlUtil.fmtStr('placeholder.old_password', '请输入旧密码')}`,
                },
              ],
            })(
              <Input
                size="large"
                onPressEnter={handleOk}
                placeholder={crmIntlUtil.fmtStr('placeholder.old_password', '请输入旧密码')}
                type="password"
              />,
            )}
          </FormItem>
          <FormItem
            label={crmIntlUtil.fmtStr('label.new_password', '新密码')}
            {...formItemLayout}
            help={newPwdError || ''}
          >
            {getFieldDecorator('newPwd', {
              rules: [
                {
                  required: true,
                  message: `${crmIntlUtil.fmtStr('placeholder.new_password', '请输入新密码')}`,
                },
              ],
            })(
              <Input
                size="large"
                onPressEnter={handleOk}
                placeholder={crmIntlUtil.fmtStr('placeholder.new_password', '请输入新密码')}
                type="password"
              />,
            )}
          </FormItem>
          <FormItem
            label={crmIntlUtil.fmtStr('label.new_password.again', '重复新密码')}
            {...formItemLayout}
            help={renewPwdError || ''}
          >
            {getFieldDecorator('renewPwd', {
              rules: [
                {
                  required: true,
                  message: `${crmIntlUtil.fmtStr(
                    'placeholder.new_passwpord.again',
                    '请再次输入新密码',
                  )}`,
                },
              ],
            })(
              <Input
                size="large"
                onPressEnter={handleOk}
                placeholder={crmIntlUtil.fmtStr(
                  'placeholder.new_passwpord.again',
                  '请再次输入密码',
                )}
                type="password"
              />,
            )}
          </FormItem>
          <FormItem>
            <Row>
              <Button
                type="primary"
                size="large"
                disabled={hasErrors(getFieldsError())}
                onClick={handleOk}
              >
                {crmIntlUtil.fmtStr('action.ok', '确定')}
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
    </div>
  );
};

ChangePasswordPage.propTypes = {
  form: PropTypes.object,
  dispatch: PropTypes.func,
};
export default connect(({ user_password }) => ({ user_password }))(
  Form.create()(ChangePasswordPage),
);
