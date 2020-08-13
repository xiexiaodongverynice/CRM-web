import React, { Component } from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Button, Row, Form, Input, Checkbox, Spin, Col } from 'antd';
import _ from 'lodash';
import { Link } from 'react-router';
import styles from '../login/login.less';
import { config } from '../../utils';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { clearOtherLocalStoragesOfUsers } from '../../utils/login';
import consoleUtil from '../../utils/consoleUtil';

const FormItem = Form.Item;

const AdminLoginAsPage = ({
  admin_login_as,
  App,
  dispatch,
  form: { getFieldDecorator, validateFieldsAndScroll },
}) => {
  function handleOk() {
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return;
      }
      const { loginName, loginAsName, pwd } = values;
      const suffix = _.get(config.DOMAIN_LOGINNAME_DIC, document.domain);
      // 如果loginName包含@，则不自动添加后面的域名，以便兼容登陆其他未在DOMAIN_LOGICNAME_DIC中注册的租户的情况
      if (loginName.indexOf('@') < 0 && !_.isEmpty(suffix) && !_.endsWith(loginName, suffix)) {
        _.set(values, 'loginName', `${loginName}${suffix}`);
      }
      if (loginAsName.indexOf('@') < 0 && !_.isEmpty(suffix) && !_.endsWith(loginAsName, suffix)) {
        _.set(values, 'loginAsName', `${loginAsName}${suffix}`);
      }
      clearOtherLocalStoragesOfUsers();
      dispatch({
        type: 'admin_login_as/loginAs',
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

  // 根据域名切换login logo，以及logo大小
  let logoSrc = config.loginLogo;
  const domainLoginLogo = _.get(config.DOMAIN_LOGINLOGO_DIC, document.domain);
  const domainLoginLogoCss = _.get(config.DOMAIN_LOGINLOGO_WH_DIC, document.domain);
  if (!_.isEmpty(domainLoginLogo)) {
    logoSrc = domainLoginLogo;
  }

  const { loginLoading, errMessage } = admin_login_as;
  const { initLoading } = App;
  return (
    <div className={styles.login_page}>
      <div className={styles.login_box}>
        <Spin spinning={initLoading} tip="初始化系统基础数据，请稍后...">
          <div className={styles.form} style={{ background: '#FFFFFF' }}>
            {/* <div className={styles.logo}>
                <img alt={'logo'} src={logoSrc} style={domainLoginLogoCss} />
              </div> */}
            <div className={styles.logo}>
              <img alt={'logo'} src={logoSrc} />
            </div>
            <div className={styles.login_header}>
              <div className={styles.welcome_tip}>
                {crmIntlUtil.fmtStr('message.login_welcome')}
              </div>
              {config.deployEnvironment == 'stg' || config.deployEnvironment == 'dev' ? (
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
              <FormItem style={{ marginLeft: '0px', marginBottom: '20px' }}>
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
                    placeholder={crmIntlUtil.fmtStr('placeholder.manager_login_name')}
                  />,
                )}
              </FormItem>
              <Row>
                <Col span={12} style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '14px', color: '#7F8FA4' }}>
                    {crmIntlUtil.fmtStr('placeholder.manager_login_password')}
                  </span>
                </Col>
              </Row>
              <FormItem style={{ marginLeft: '0px', marginBottom: '20px' }}>
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
                    placeholder={crmIntlUtil.fmtStr('placeholder.manager_login_password')}
                  />,
                )}
              </FormItem>
              <Row>
                <Col span={12} style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '14px', color: '#7F8FA4' }}>
                    {crmIntlUtil.fmtStr('placeholder.need_login_name')}
                  </span>
                </Col>
              </Row>
              <FormItem style={{ marginLeft: '0px', marginBottom: '20px' }}>
                {getFieldDecorator('loginAsName', {
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
                    placeholder={crmIntlUtil.fmtStr('placeholder.need_login_name')}
                  />,
                )}
              </FormItem>
              <FormItem style={{ marginLeft: '0px', marginBottom: '20px' }}>
                <Row>
                  <Button loading={loginLoading} type="primary" size="large" onClick={handleOk}>
                    {crmIntlUtil.fmtStr('action.login')}
                  </Button>
                </Row>
              </FormItem>
            </form>
          </div>
          <div>
            <Row style={{ marginTop: '6px' }}>
              <Col span={12} style={{ textAlign: 'left', fontSize: '14px' }}>
                <Link to={'/login'}>{crmIntlUtil.fmtStr('action.normal_login_as')}</Link>
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

AdminLoginAsPage.propTypes = {
  form: PropTypes.object,
  dispatch: PropTypes.func,
};

export default connect(({ admin_login_as, App }) => ({ admin_login_as, App }))(
  Form.create()(AdminLoginAsPage),
);
