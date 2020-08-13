import React, { Component } from 'react';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import { Icon, Popconfirm, Menu, Popover, Affix, Card, Dropdown, Modal, Avatar, Spin } from 'antd';
import { hashHistory } from 'dva/router';
import styles from './MainHeader.less';
import { color, config } from '../../utils';
import SiteAlert from './SiteAlert';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import storageUtil from '../../utils/storageUtil';
import windowUtil from '../../utils/windowUtil';
import authUtil from '../../utils/authUtil';
import SelectLang from '../SelectLang';
import consoleUtil from '../../utils/consoleUtil';

// import NoticeIcon from '../NoticeIcon';
// import HeaderSearch from '../HeaderSearch';

const SubMenu = Menu.SubMenu;
const confirm = Modal.confirm;

class MainHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      accountMenus: [],
      timestamp: null,
    };
  }

  toggle = () => {
    const { onOk } = this.props;
    onOk(!this.state.visible);
    this.setState({
      visible: !this.state.visible,
    });
  };
  logout = () => {
    this.props.logout();
  };
  reLoadAlert = () => {
    this.setState({ timestamp: _.now() });
  };
  changeIntl = (intlType) => {
    consoleUtil.log('intlType===>', intlType);
    this.props.changeIntl(intlType);
  };
  menuOnClick = ({ key }) => {
    const { dispatch } = this.props;
    if (key === 'change_territory') {
      hashHistory.push('/change_territory');
    } else if (key === 'change_pwd') {
      hashHistory.push('/change_password');
    } else if (key === 'logout') {
      confirm({
        title: crmIntlUtil.fmtStr('message.logout'),
        onOk: () => {
          this.logout();
        },
        onCancel: () => {},
      });
    } else if (key === 'switch_account') {
      // 切换账户
      const loginAsBy = storageUtil.get('loginAsBy');
      // 切换到授权给我页面
      if (!_.isEmpty(loginAsBy)) {
        // 如果已经登录上其他人的账号进行切换的话，那么只需要将当前授权人的账户信息清空，返回到被授权人
        authUtil.rollBackLicenseeAccount();
        windowUtil.cleanGlobalCRMSettingProperties();
        windowUtil.initGlobalWindowProperties();
        windowUtil.initGlobalCRMProperties();
        this.reLoadAlert();

        // 保存列表项action的当前成功操作
      }
      // 直接到静默切换页面即可
      hashHistory.push('/object_page/login_auth/index_page?recordType=master&default_view_index=1');
    } else if (key === 'auth_account') {
      // 账户授权
      // 静默方式切换到我的授权页面
      hashHistory.push('/object_page/login_auth/index_page?recordType=master');
    }
  };

  loadAccountMenu = () => {
    // if (!_.isEmpty(this.state.accountMenus) && _.keys(this.state.accountMenus).length > 3) {
    //   return;
    // }
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    const loginAsBy = storageUtil.get('loginAsBy');
    const is_super_profile =
      _.get(loginAsBy, 'profile.is_super_profile', false) ||
      _.get(userProfile, 'is_super_profile', false);
    const userTerritoryList = localStorage.getItem('userTerritoryList');
    const menus = [];

    if (_.isEmpty(loginAsBy) && !is_super_profile && window.ENABLE_ACCOUNT_AUTHORIZATION) {
      menus.push(
        <Menu.Item key="auth_account">
          <Icon type="appstore-o" />
          {crmIntlUtil.fmtStr('action.auth_account')}
        </Menu.Item>,
      );
    }

    if (!is_super_profile && window.ENABLE_ACCOUNT_AUTHORIZATION) {
      menus.push(
        <Menu.Item key="switch_account">
          <Icon type="switcher" />
          {crmIntlUtil.fmtStr('action.switch_account')}
        </Menu.Item>,
      );
    }
    if (menus.length > 0) {
      menus.push(<Menu.Divider key="account_authorization_key" />);
    }
    if (userTerritoryList) {
      menus.push(
        <Menu.Item key="change_territory">
          <Icon type="idcard" />
          岗位选择
        </Menu.Item>,
      );
      menus.push(<Menu.Divider key="change_territory_key" />);
    }

    menus.push(
      <Menu.Item key="change_pwd">
        <Icon type="key" />
        {crmIntlUtil.fmtStr('action.change_password')}
      </Menu.Item>,
    );

    menus.push(<Menu.Divider key="pwd_logout_key" />);

    menus.push(
      <Menu.Item key="logout">
        <Icon type="logout" />
        {crmIntlUtil.fmtStr('action.logout')}
      </Menu.Item>,
    );

    this.setState({ accountMenus: menus });
  };

  render() {
    const userInfo = JSON.parse(localStorage.getItem('user_info'));
    const loginAsBy = storageUtil.get('loginAsBy');

    let userName = '';
    let tip = '';
    let adminTipStart = '';
    let adminTipEnd = '';
    if (!_.isEmpty(userInfo)) {
      userName = userInfo.name;
      tip = crmIntlUtil.fmtStr('label.hello');
      if (!_.isEmpty(loginAsBy)) {
        adminTipStart = crmIntlUtil.fmtWithTemplate(
          'label.loginAsBy_logged',
          '{{loginAsBy}}，您已经登录',
          { loginAsBy: _.get(loginAsBy, 'user_info.name', '') },
        );
        adminTipEnd = crmIntlUtil.fmtStr("label.'s_account");
        userName = userInfo.name;
        tip = '';
      }
    }

    let logoSrc = '';
    const pngBase64 = localStorage.getItem('logo');
    const logoFormService = `data:image/png;base64,${pngBase64}`;
    const defaultLogo = config.homeLogo;
    if (!_.isEmpty(pngBase64)) {
      logoSrc = logoFormService;
    } else {
      logoSrc = defaultLogo;
    }

    const crmIntl = crmIntlUtil.getCrmIntl();

    const accountMenu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.menuOnClick} mode="inline">
        {this.state.accountMenus}
      </Menu>
    );
    return (
      <div style={{ background: color.deepskyblue, padding: 0, height: 66 }}>
        <div className={styles.triggerC}>
          <img alt="logo" src={logoSrc} className={styles.homeLogo} />
        </div>
        <div className={styles.triggerR}>
          <span style={{ fontSize: 16 }}>
            {adminTipStart}
            {userName}
            {adminTipEnd}
            {tip}
          </span>
          <SiteAlert reloadTimestamp={this.state.timestamp} />
          <Dropdown overlay={accountMenu} trigger={['click']} onClick={this.loadAccountMenu}>
            <Icon type="user" />
          </Dropdown>

          {!_.isEmpty(crmIntl) && _.keys(crmIntl).length > 1 && (
            <SelectLang className={styles.action} changLang={this.changeIntl} />
          )}
        </div>
      </div>
    );
  }
}

export default MainHeader;
