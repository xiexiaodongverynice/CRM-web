import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Button, Row, Form, Input, Checkbox, Spin, Col } from 'antd';
import styles from './login.less';
import { config } from '../../utils';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { clearOtherLocalStoragesOfUsers } from '../../utils/login';
import consoleUtil from '../../utils/consoleUtil';

const FormItem = Form.Item;
const Login = ({
  login,
  App,
  dispatch,
  form: {
    getFieldDecorator,
    validateFieldsAndScroll,
    getFieldsError,
    getFieldError,
    isFieldTouched,
  },
}) => {
  const { loginLoading, errMessage } = login;
  const { initLoading } = App;
  function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some((field) => fieldsError[field]);
  }
  function handleOk() {
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return;
      }

      // consoleUtil.log('document.domain', document.domain);
      const suffix = _.get(config.DOMAIN_LOGINNAME_DIC, document.domain);
      values.loginName = _.trim(_.get(values, 'loginName')); // 去空

      const { loginName } = values;

      // 如果loginName包含@，则不自动添加后面的域名，以便兼容登陆其他未在DOMAIN_LOGICNAME_DIC中注册的租户的情况
      if (loginName.indexOf('@') < 0 && !_.isEmpty(suffix) && !_.endsWith(loginName, suffix)) {
        _.set(values, 'loginName', `${loginName}${suffix}`);
        localStorage.setItem('loginName', `${loginName}${suffix}`); // 修改密码时从本地取，不必输入账号，登出清除
      } else {
        localStorage.setItem('loginName', loginName);
      }
      clearOtherLocalStoragesOfUsers();
      dispatch({
        type: 'login/login',
        payload: values,
        callBack: () => {
          consoleUtil.log('ready init system data');
          dispatch({
            type: 'App/initSystemData',
            callBack: () => {
              alert('ok');
            },
          });
        },
      });
    });
  }

  function handleOks(event) {
    if (event.keyCode === 13) {
      validateFieldsAndScroll((errors, values) => {
        if (errors) {
          return;
        }
        dispatch({ type: 'logins/login', payload: values });
      });
    }
  }
  const userError = isFieldTouched('loginName') && getFieldError('loginName');
  const pwdError = isFieldTouched('pwd') && getFieldError('pwd');

  // 根据域名切换login logo，以及logo大小
  let logoSrc = config.loginLogo;
  const domainLoginLogo = _.get(config.DOMAIN_LOGINLOGO_DIC, document.domain);
  const domainLoginLogoCss = _.get(config.DOMAIN_LOGINLOGO_WH_DIC, document.domain);
  if (!_.isEmpty(domainLoginLogo)) {
    logoSrc = domainLoginLogo;
  }

  return (
    <div className={styles.login_page}>
      <div className={styles.page_content}>
        <div className={styles.login_box}>
          <Spin spinning={initLoading} tip={crmIntlUtil.fmtStr('loading.init_system_basic_data')}>
            <div className={styles.form} style={{ background: '#FFFFFF' }}>
              <div className={styles.logo}>
                <img alt={'logo'} src={logoSrc} />
              </div>
              <div className={styles.login_header}>
                <div className={styles.welcome_tip}>
                  {crmIntlUtil.fmtStr('message.login_welcome')}
                </div>
                {config.deployEnvironment === 'stg' || config.deployEnvironment === 'dev' ? (
                  <div className={styles.environment}>
                    <span>
                      {config.deployEnvironment}
                      {crmIntlUtil.fmtStr('lable.environment')}
                    </span>
                  </div>
                ) : null}
              </div>
              <div style={{ height: '28px', marginBottom: '10px' }}>
                {errMessage ? (
                  <div className={styles.err_tip}>
                    <img
                      alt={'logo'}
                      src="cuowu.png"
                      style={{ verticalAlign: 'middle', paddingLeft: '10px' }}
                    />
                    <span style={{ paddingLeft: '5px', fontSize: '14px;', color: '#f10' }}>
                      {errMessage}
                    </span>
                  </div>
                ) : null}
              </div>
              <form>
                <Row>
                  <Col span={12} style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '14px', color: '#7F8FA4' }}>
                      {crmIntlUtil.fmtStr('placeholder.login_name')}
                    </span>
                  </Col>
                </Row>
                <FormItem
                  help={userError || ''}
                  style={{ marginLeft: '0px', marginBottom: '13px' }}
                >
                  {getFieldDecorator('loginName', {
                    rules: [
                      {
                        required: true,
                        message: crmIntlUtil.fmtStr('message.login_name is required'),
                      },
                    ],
                  })(
                    <Input
                      size="large"
                      onPressEnter={handleOk}
                      placeholder={crmIntlUtil.fmtStr('placeholder.login_name')}
                    />,
                  )}
                </FormItem>
                <Row>
                  <Col span={12} style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '14px', color: '#7F8FA4' }}>
                      {crmIntlUtil.fmtStr('placeholder.login_password')}
                    </span>
                  </Col>
                </Row>
                <FormItem help={pwdError || ''} style={{ marginLeft: '0px', marginBottom: '13px' }}>
                  {getFieldDecorator('pwd', {
                    rules: [
                      {
                        required: true,
                        message: crmIntlUtil.fmtStr('message.login_password is required'),
                      },
                    ],
                  })(
                    <Input
                      size="large"
                      type="password"
                      onPressEnter={handleOk}
                      placeholder={crmIntlUtil.fmtStr('placeholder.login_password')}
                    />,
                  )}
                </FormItem>
                <FormItem style={{ marginLeft: '0px', marginBottom: '20px' }}>
                  <Row>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleOk}
                      loading={loginLoading}
                      disabled={hasErrors(getFieldsError())}
                    >
                      {crmIntlUtil.fmtStr('action.login')}
                    </Button>
                  </Row>
                </FormItem>
              </form>
            </div>
            <div>
              <Row style={{ marginTop: '6px' }}>
                <Col span={12} style={{ textAlign: 'left', fontSize: '14px' }}>
                  <Link to={'/admin_login_as'}>{crmIntlUtil.fmtStr('action.admin_login_as')}</Link>
                </Col>
                <Col span={12} style={{ textAlign: 'right', fontSize: '14px' }}>
                  <Link to={'/reset_password'} style={{ color: '#7F8FA4' }}>
                    {crmIntlUtil.fmtStr('action.forget_password')}？
                  </Link>
                </Col>
              </Row>
            </div>
          </Spin>
        </div>
      </div>
      <div className={styles.page_footer}>
        <span>{config.footerText}</span>
        <span>
          <a href="http://www.beian.miit.gov.cn" target="_blank">
            {config.recordNumbe}
          </a>
        </span>
        <span>| </span>
        <span>
          <a href="http://www.forceclouds.com/index.php?_f=aboutus1" target="_blank">
            {crmIntlUtil.fmtStr('label.about_us')}
          </a>
        </span>
      </div>
    </div>
  );
};

Login.propTypes = {
  form: PropTypes.object,
  login: PropTypes.object,
  App: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
};
export default connect(({ login, App }) => ({ login, App }))(Form.create()(Login));
