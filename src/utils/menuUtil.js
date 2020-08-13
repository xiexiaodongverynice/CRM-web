/**
 * 这是一个构造Menu的工具类
 * wans 2019-01-08
 */
import _ from 'lodash';
import { Layout, Menu, Icon } from 'antd';
import { Link } from 'dva/router';
import * as crmIntlUtil from './crmIntlUtil';
import * as userPermissionUtil from './userPermissionUtil';

import { arrayToTree } from './index';

const SubMenu = Menu.SubMenu;

const linkToUrl = '/object_page/:api_name/index_page';
// 菜单类型为外部页面时的pathname
const externalLinkToUrl = '/external_page/:api_name/index_page';

const getIcon = (icon) => {
  if (typeof icon === 'string' && icon.indexOf('http') === 0) {
    return <img src={icon} alt="icon" style={{ width: 14, marginRight: 10 }} />;
  }
  if (typeof icon === 'string') {
    return <Icon type={icon} />;
  }
  return icon;
};
/**
 * 获得菜单子节点
 * @memberof SiderMenu
 */
function getNavMenuItems(menusData) {
  if (!menusData) {
    return [];
  }
  const dataTree = arrayToTree(
    _.sortBy(menusData, ['display_order', 'create_time']),
    'api_name',
    'p_api_name',
  );
  return dataTree
    .filter((item) => item.label)
    .map((item) => {
      const ItemDom = getSubMenuOrItem(item);
      return checkPermissionItem(item, ItemDom);
    })
    .filter((item) => !!item);
}
// conversion Path
// 转化路径
function conversionPath(item) {
  let menuUrl;
  if (item.type === 'external_page') {
    menuUrl = externalLinkToUrl.replace(':api_name', item.api_name);
  } else if (item.type === 'internal_page') {
    // 内部页面地址
    menuUrl = item.internal_page_src;
  } else if (_.get(item, 'define_type') === 'system') {
    menuUrl = item.api_name;
  } else {
    menuUrl = linkToUrl.replace(':api_name', item.object_describe_api_name);
  }

  if (item.record_type) {
    menuUrl += `?recordType=${item.record_type}`;
  }
  return menuUrl;
}
// permission to check
function checkPermissionItem(item, itemDom) {
  const permission = userPermissionUtil.getPermission();
  const hiddenDevices = _.get(item, 'hidden_devices', []);
  //* 兼容过去菜单配置，没有设置show_app时默认展示
  const showApp = _.isEmpty(item.show_app) ? ['CRM'] : item.show_app;
  if (
    _.eq(_.get(permission, `tab.${item.api_name}`), 2) &&
    _.indexOf(hiddenDevices, 'PC') < 0 &&
    _.includes(showApp, 'CRM')
  ) {
    return itemDom;
  }
  return false;
}

/**
 * 判断是否是http链接.返回 Link 或 a
 * Judge whether it is http link.return a or Link
 * @memberof SiderMenu
 */
function getMenuItemPath(item) {
  const itemPath = conversionPath(item);
  const icon = getIcon(item.icon);
  // const { target } = item;
  const label = crmIntlUtil.fmtStr(`tab.${item.api_name}`, item.label);
  // Is it a http link
  if (item.type === 'internal_page' && item.api_name === 'fc_architecture') {
    const navPathName = 'fc_architecture';
    return (
      <Link to={navPathName}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  }
  if (item.type === 'internal_page' && item.api_name === 'fc_custom_report') {
    const navPathName = 'fc_custom_report';
    return (
      <Link to={navPathName}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  }
  return (
    <Link
      // to={itemPath}
      to={Object.assign(
        {},
        {
          pathname: itemPath,
        },
        item.type === 'external_page'
          ? {
              state: {
                object_page: item,
                timeStamp: _.now(),
              },
            }
          : {},
      )}
      // target={target}
      // replace={itemPath === props.location.pathname}
      // onClick={props.isMobile ? () => { props.onCollapse(true); } : undefined}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
/**
 * get SubMenu or Item
 */
function getSubMenuOrItem(item) {
  let key;
  if (
    item.type === 'external_page' ||
    item.type === 'internal_page' ||
    _.get(item, 'define_type', 'custom') === 'system'
  ) {
    key = item.api_name;
  } else {
    key = `${item.api_name}_${item.object_describe_api_name}`;
  }
  const label = crmIntlUtil.fmtStr(`tab.${item.api_name}`, item.label);
  if (item.children && item.children.some((child) => child.label)) {
    return (
      <SubMenu
        inlineCollapsed
        title={
          item.icon ? (
            <span>
              {getIcon(item.icon)}
              <span>{label}</span>
            </span>
          ) : (
            label
          )
        }
        key={key}
      >
        {getNavMenuItems(item.children)}
      </SubMenu>
    );
  } else {
    return <Menu.Item key={key}>{getMenuItemPath(item)}</Menu.Item>;
  }
}
export default {
  getNavMenuItems,
  conversionPath,
};
