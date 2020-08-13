import _ from 'lodash';
import React, { PureComponent } from 'react';
// import { formatMessage, setLocale, getLocale } from 'umi/locale';
import { Menu, Icon, Dropdown } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import consoleUtil from '../../utils/consoleUtil';

import * as crmIntlUtil from '../../utils/crmIntlUtil';


export default class SelectLang extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // selectedLang: window.APP_INTL_TYPE
    };
  }

  componentDidMount() {
    // consoleUtil.log(this.props);
    // this.loadIntlMenu();
  }
  changLang = ({ key }) => {
    if (key === window.APP_INTL_TYPE) {
      return
    }
    this.props.changLang(key);
  };

  loadIntlMenu=() => {
    if (!_.isEmpty(this.state.intlMenus)) {
      return;
    }
    const crmIntl = crmIntlUtil.getCrmIntl();
    const intlTypes = _.keys(crmIntl);
    const intlMenus = [];
    _.forEach(intlTypes, (intlType) => {
      switch (intlType) {
        case 'zh_CN': {
          intlMenus.push(<Menu.Item key="zh_CN"><span role="img" aria-label="简体中文" >🇨🇳</span>{' '}简体中文</Menu.Item>);
          break;
        }
        case 'zh_TW': {
          intlMenus.push(<Menu.Item key="zh_TW"><span role="img" aria-label="中文（繁體）" >🇨🇳</span>{' '}中文（繁體）</Menu.Item>);
          break;
        }
        case 'zh_HK': {
          intlMenus.push(<Menu.Item key="zh_HK"><span role="img" aria-label="中文（繁體）" >🇭🇰</span>{' '}中文（香港）</Menu.Item>);
          break;
        }
        case 'en_US': {
          intlMenus.push(<Menu.Item key="en_US"><span role="img" aria-label="English" >🇬🇧</span>{' '}English</Menu.Item>);
          break;
        }
        default: {
          break;
        }
      }
    });
    this.setState({ intlMenus });
  }

  render() {
    const { className } = this.props;
    const selectedLang = window.APP_INTL_TYPE;
    const langMenu = (
      <Menu className={styles.menu} selectedKeys={[selectedLang]} onClick={this.changLang}>
        {this.state.intlMenus}
      </Menu>
    );
    return (
      <Dropdown overlay={langMenu} placement="bottomLeft" trigger={['click']} onClick={this.loadIntlMenu}>
        <Icon
          type="global"
          className={classNames(styles.dropDown, className)}
          title={crmIntlUtil.fmtStr('navBar.lang')}
        />
      </Dropdown>
    );
  }
}
