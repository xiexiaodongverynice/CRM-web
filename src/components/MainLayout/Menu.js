import React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'dva/router';
import _ from 'lodash';
import menuUtil from '../../utils/menuUtil';
import styles from './Menu.less';

const SubMenu = Menu.SubMenu;

const mainMenu = ({ location, collapsed, ...headerProps }) => {
  const { menu } = headerProps;
  const str = {};
  str.pathname = location.pathname;
  const linkToUrl = '/object_page/:api_name/index_page';
  // 菜单类型为外部页面时的pathname
  const externalLinkToUrl = '/external_page/:api_name/index_page';
  const { hash } = location; // 设置当前菜单默认选中状态的selectKey，刷新页面不影响
  let selectKey = '';
  const menuNameSplit = hash.split('/');
  if (_.includes(menuNameSplit, 'object_page') || _.includes(menuNameSplit, 'external_page')) {
    // 针对配置出来的菜单
    selectKey = menuNameSplit[2];
    if (_.includes(menuNameSplit, 'customer')) {
      // 针对医生医院相同的key进行处理
      const recordType = _.last(menuNameSplit);
      const type = recordType.split('&')[0];
      selectKey += type;
    }
  } else if (menuNameSplit[1]) {
    const otherKey = menuNameSplit[1].split('?'); // 针对其他菜单
    [selectKey] = otherKey;
  }
  const menuItems = menuUtil.getNavMenuItems(menu);

  const app_authorize = JSON.parse(localStorage.getItem('app_authorize'));
  const crmHomeConfig = _.find(app_authorize, { appName: 'CRM' });
  const webHomePageType = _.get(crmHomeConfig, 'webHomePageType', '1'); // *'1'默认；'2'自定义home
  return (
    <Menu mode="horizontal" defaultSelectedKeys={[`${selectKey}`]}>
      {(_.isEmpty(crmHomeConfig) || webHomePageType == '1') && (
        <Menu.Item key="home">
          <Link to={'/home'} style={{ fontSize: '20px' }}>
            <Icon type="home" />
          </Link>
        </Menu.Item>
      )}

      {menuItems}
      {/* {
        isMylan() ? null : (
          <Menu.Item key="calendar_page">
            <Link to={'/calendar_page'}>
              {crmIntlUtil.fmtStr('tab.fc_calendar', '日历')}
            </Link>
          </Menu.Item>
        )
      }
      <Menu.Item key="notice">
        <Link to={'/notice'}>
          {crmIntlUtil.fmtStr('tab.fc_notice', '公告')}
        </Link>
      </Menu.Item>*/}
    </Menu>
  );
};
export default mainMenu;
