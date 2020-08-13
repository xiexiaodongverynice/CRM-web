/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
import _ from 'lodash';
import moment from 'moment';
import { hashHistory } from 'react-router';
import { BigNumber } from 'bignumber.js';
import * as crmPowerSettingUtil from './crmPowerSettingUtil';
import * as crmIntlUtil from './crmIntlUtil';
import storageUtil from './storageUtil';
import consoleUtil from './consoleUtil';
import { deployEnvironment } from './config';
import authUtil from './authUtil';

function initGlobalWindowProperties() {
  consoleUtil.log('initGlobalWindowProperties==>');
  // 设置全局lodash模版的变量解析使用{{}}包裹
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  window.moment = moment;
  window.BigNumber = BigNumber;
}

function initGlobalCRMProperties() {
  consoleUtil.log('initGlobalCRMProperties==>');
  window.CRMUtils = require('./index');

  // 默认需要初始化的
  crmIntlUtil.initIntlSetting();

  window.APP_INTL_TYPE = crmIntlUtil.getCRM_INTL_TYPE();
  // crmIntlUtil.changeCRM_INTL_TYPE(window.APP_INTL_TYPE);

  window.appLocale = crmIntlUtil.getAppLocale();

  window.fc_getPermission = () => {
    window.fc_permission = JSON.parse(localStorage.getItem('userPermission'));
    return window.fc_permission;
  };

  window.FC_CRM_USERID = localStorage.getItem('userId');
  // 判断当前用户是否具有某功能权限的全局函数，可用于布局的show_expression中
  window.fc_hasFunctionPrivilege = (functionCode, expectedCodeValue = 2) => {
    if (_.isEmpty(functionCode)) {
      return false;
    }
    const permission = window.fc_getPermission();
    return permission && permission[`function.${functionCode}`] === expectedCodeValue;
  };
  window.fc_hasFieldPrivilege = (objCode, fieldCode, expectedCodeValues = [4]) => {
    if (_.isEmpty(objCode) || _.isEmpty(fieldCode)) {
      return false;
    }
    const permissionCode = _.get(window.fc_getPermission(), `field.${objCode}.${fieldCode}`, 4);
    return _.indexOf(expectedCodeValues, permissionCode) >= 0;
  };
  window.fc_hasObjectPrivilege = (objectCode, expectedCodeValue = 0) => {
    if (_.isEmpty(objectCode)) {
      return false;
    }
    const permissions = window.fc_getPermission();
    const objectPrivilegeCode = _.get(permissions, `obj.${objectCode}`);
    // consoleUtil.log(objectCode,expectedCodeValue,objectPrivilegeCode)
    return (objectPrivilegeCode | (2 ** expectedCodeValue)) === objectPrivilegeCode;
  };

  const checkLocalStorage = () => {
    // if (_.isEmpty(window.FC_CRM_SUBORDINATES)) {
    //* 切换岗位后需要重置下属数据
    window.FC_CRM_ALL_SUBORDINATES = window.FC_CRM_SUBORDINATES =
      JSON.parse(localStorage.getItem(`subordinateResults_${window.FC_CRM_USERID}`)) || [];
    // }
    //* 获取下属接口获取的原始数据(包含空岗)
    window.FC_CRM_ALL_SOURCE_SUBORDINATES =
      JSON.parse(localStorage.getItem(`subordinates_${window.FC_CRM_USERID}`)) || [];

    if (_.isEmpty(window.fc_permission)) {
      window.fc_permission = JSON.parse(localStorage.getItem('userPermission'));
    }
    if (_.isEmpty(window.FC_CRM_PARENT_SUBORDINATES)) {
      window.FC_CRM_PARENT_SUBORDINATES =
        JSON.parse(localStorage.getItem(`parent_subordinateResults_${window.FC_CRM_USERID}`)) || [];
    }
    // if(_.isEmpty(window.FC_CRM_TERRITORY_CUSTOMER_IDS)) {
    window.FC_CRM_TERRITORY_CUSTOMER_IDS =
      JSON.parse(localStorage.getItem(`territory_customer_ids_${window.FC_CRM_USERID}`)) || [];
    // }

    //* 直接下级(不包含共享岗位)
    window.FC_CRM_DIRECTSUB =
      JSON.parse(localStorage.getItem(`directSubordinates_${window.FC_CRM_USERID}`)) || [];

    //* 下级岗位 territoryId 集合(不包含共享岗位、虚线岗位)
    window.FC_CRM_TERRITOYIDS =
      JSON.parse(localStorage.getItem(`territoryIds_${window.FC_CRM_USERID}`)) || [];
  };

  /**
   * 获取当前用户的下属
   */
  window.fc_getSubordinates = (type) => {
    checkLocalStorage();
    if (!type) {
      return window.FC_CRM_SUBORDINATES;
    } else if (type === 'all') {
      return window.FC_CRM_ALL_SUBORDINATES;
    } else if (type === 'by_territory') {
      const allSubors = _.cloneDeep(window.FC_CRM_ALL_SUBORDINATES);
      const userDoitSubors = window.fc_getDotedSubordinateIds();
      _.remove(allSubors, (sub) => {
        return _.includes(userDoitSubors, sub.id) && sub.dotted_line_manager;
      });
      return allSubors;
    } else if (type === 'by_user') {
      return window.fc_getDotedSubordinates();
    }
  };

  window.fc_getSubTerritoryIds = (type) => {
    checkLocalStorage();
    let subTerritoryIds = [];
    if (!type) {
      subTerritoryIds = window.FC_CRM_TERRITOYIDS;
    } else if (type === 'all') {
      _.each(window.FC_CRM_ALL_SOURCE_SUBORDINATES, (user) => {
        // eslint-disable-next-line no-unused-expressions
        _.get(user, 'territory_id') && subTerritoryIds.push(_.get(user, 'territory_id'));
      });
    } else if (type === 'direct') {
      subTerritoryIds = window.FC_CRM_DIRECTSUB;
    }

    return subTerritoryIds;
  };

  /**
   * 获取虚线下级
   */
  window.fc_getDotedSubordinates = () => {
    checkLocalStorage();
    const allSubors = window.FC_CRM_ALL_SUBORDINATES;
    let userDoitSubors = [];
    _.each(allSubors, (sub) => {
      if (sub && sub.dotted_line_manager && sub.dotted_line_manager == window.FC_CRM_USERID) {
        userDoitSubors.push(sub);
        userDoitSubors = window.findUser(allSubors, 'parent_id', sub.id, userDoitSubors);
      }
    });
    return userDoitSubors;
  };

  /**
   * 获取虚线下级id集合
   */
  window.fc_getDotedSubordinateIds = () => {
    return window.fc_getDotedSubordinates().map((x) => x.id);
  };

  /**
   * 递归查找用户方法
   * @param {需要遍历的集合} array
   * @param {根据key进行遍历比较} key
   * @param {需要比较的值} compareId
   * @param {遍历的结果集} result
   */
  window.findUser = (array = [], key = 'parent_id', compareId, result = []) => {
    _.each(array, (item) => {
      if (item[key] === compareId) {
        if (item.id) {
          result.push(item);
          window.findUser(array, key, item.id, result);
        }
      }
    });
    return result;
  };

  window.fc_getSubordinateIds = (type) => {
    return window.fc_getSubordinates(type).map((x) => x.id);
  };

  /**
   * 根据当前用户获取上级的下属
   */
  window.fc_getParentSubordinates = () => {
    checkLocalStorage();
    return window.FC_CRM_PARENT_SUBORDINATES;
  };

  window.fc_getParentSubordinateIds = () => {
    return window.fc_getParentSubordinates().map((x) => x.id);
  };

  window.fc_getDirectSubordinates = () => {
    return window
      .fc_getSubordinates('by_territory')
      .filter((x) => _.toString(x.parent_territory_id) === _.toString(CURRENT_ACTIVE_TERRITORY));
  };

  window.fc_getDirectSubordinateIds = () => {
    return window.fc_getDirectSubordinates().map((x) => x.id);
  };

  window.fc_getTerritoryCustomerIds = () => {
    checkLocalStorage();
    return window.FC_CRM_TERRITORY_CUSTOMER_IDS;
  };

  // crmPowerSettingUtil.initGlobalWindowsVariables();
  initGlobalCRMSettingProperties();

  window.CALLBACK_FROM_STORE = [];

  /**
   * 从当前历史记录中获取查询参数值
   */
  window.fc_getValueFromHistoryQuery = (name) => {
    const location = window.fc_getLocation();
    const query = location.query || {};
    return _.get(query, name);
  };

  /**
   * 获取当前页面地址信息
   */
  window.fc_getLocation = () => {
    return app._store.getState().routing.locationBeforeTransitions;
  };

  /**
   * 获取当前登录用户的岗位信息
   */

  window.fc_getProfile = () => {
    const userProfile = localStorage.getItem('userProfile');
    if (!_.isUndefined(userProfile) && !_.isNull(userProfile)) {
      return JSON.parse(userProfile);
    }
    return {};
  };

  window.fc_getObjectDescribe = (api_name) => {
    const userId = localStorage.getItem('userId');
    let data = localStorage.getItem(`object_all_describe_${userId}`);
    if (!_.isEmpty(data) && _.get(JSON.parse(data), 'success')) {
      data = JSON.parse(data);
      return _.chain(data)
        .result('items', [])
        .find({
          api_name,
        })
        .value();
    }
    return null;
  };

  window.getToken = () => {
    return localStorage.getItem('token');
  };
  window.fc_getCurrentUserInfo = (type) => {
    const user_info = localStorage.getItem('user_info');
    if (!_.isUndefined(user_info) && !_.isNull(user_info)) {
      if (!_.isEmpty(type)) {
        return _.get(JSON.parse(user_info), `${type}`);
      } else {
        return JSON.parse(user_info);
      }
    }
  };
  // 租户ID
  // Customize home page for HengRui
  window.TENANT_ID_COLLECT = {
    JMKX_TENEMENT: [
      'T8017851384171529',
      'T8067297675447296',
      'T8087395524742152',
      'T8389310571023369',
    ],
    MYLAN_TENEMENT: [
      'T7970395608550402',
      'T8199700825082882',
      'T8258661973494787',
      'T8278788381543428',
    ],
    CHENPON_TENEMENT: ['T7684028447329283', 'T7684209048357890'],
    LUOZHEN_TENEMENT: [
      'T8049506594262021',
      'T8200040335019009',
      'T8313225060191236',
      'T8366657535282184',
    ],
    HENGRUI_TENEMENT: ['T8743344183086085', 'T8559716081044486'],
    STRAUMANN_TENEMENT: ['T8995372716592129'],
  };

  window.isMylan = () =>
    _.includes(window.TENANT_ID_COLLECT.MYLAN_TENEMENT, window.fc_getProfile().tenant_id);
  window.isLuozhen = () =>
    _.includes(window.TENANT_ID_COLLECT.LUOZHEN_TENEMENT, window.fc_getProfile().tenant_id);
  window.isJmkx = () =>
    _.includes(window.TENANT_ID_COLLECT.JMKX_TENEMENT, window.fc_getProfile().tenant_id);
  window.isHr = () =>
    _.includes(window.TENANT_ID_COLLECT.HENGRUI_TENEMENT, window.fc_getProfile().tenant_id);
  window.isStraumann = () =>
    _.includes(window.TENANT_ID_COLLECT.STRAUMANN_TENEMENT, window.fc_getProfile().tenant_id);

  window.getDeployEnvironment = () => {
    return deployEnvironment;
  };

  window.deployEnvironment = deployEnvironment;
}

window.CURRENT_ACTIVE_TERRITORY = storageUtil.get('userTerritory', '');

function initGlobalCRMSettingProperties() {
  crmPowerSettingUtil.initGlobalWindowsVariables();
}

window.logoutWhereToGo = () => {
  setTimeout(() => {
    const from = localStorage.getItem('from');
    const portal_domain = localStorage.getItem('portal_domain');
    authUtil.cleanAllStorageButExclude();
    if (from === 'portal') {
      if (portal_domain !== 'undefined') {
        window.open(portal_domain, '_self');
      } else {
        message.error('登出地址解析失败');
        return false;
      }
    } else {
      hashHistory.push('/login');
    }
  }, 100);
};

/**
 * 在初始化全局变量的时候，需要对某些个顽固不化的属性进行清空，比如 window.fc_permission
 */
function cleanGlobalCRMSettingProperties() {
  delete window.FC_CRM_SUBORDINATES; // 根据当前用户获取下属
  delete window.FC_CRM_ALL_SUBORDINATES;
  delete window.FC_CRM_PARENT_SUBORDINATES; // 根据当前用户获取上级的下属
  delete window.FC_CRM_TERRITORY_CUSTOMER_IDS;

  delete window.CALLBACK_FROM_STORE;

  delete window.fc_permission;
}

export default {
  initGlobalWindowProperties,
  initGlobalCRMProperties,
  cleanGlobalCRMSettingProperties,
};
