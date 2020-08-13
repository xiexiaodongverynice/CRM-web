/**
 * Created by wans on 26/10/2017.
 */
import _ from 'lodash';
import * as pollingIntervalUtil from '../util/pollingIntervalUtil';

const CRMPOWER_SETTING = 'crmpower_setting';
export const setCrmpowerSetting = (result) => {
  if (result == undefined) {
    result = [];
  }
  localStorage.setItem(CRMPOWER_SETTING, JSON.stringify(result));
};

export const getCrmpowerSetting = () => {
  const localCrmpowerSettingJson = localStorage.getItem(CRMPOWER_SETTING);
  if (localCrmpowerSettingJson) {
    return JSON.parse(localCrmpowerSettingJson);
  } else {
    return {};
  }
};

export const getCrmpowerSettingItem = (itemCode, defaultValue = '') => {
  const crmpowerSetting = getCrmpowerSetting();
  const crmpowerSettingItem = _.get(crmpowerSetting, itemCode, defaultValue);
  return crmpowerSettingItem;
};
// export const cleanLocalStorage = () => {
//   localStorage.removeItem(CRMPOWER_SETTING);
//   delete window.SEGMENTATION_PRODUCT_LEVEL;
//   delete window.ADD_SEGMENTATION_ONLY;
//   delete window.EDIT_SEGMENTATION;
//   delete window.CALL_BACKDATE_LIMIT;
//   delete window.SEGMENTATION_AUTHORITY;
//   delete window.DCR_CREATE_CUSTOMER_RULE;
//   delete window.DCR_EDIT_CUSTOMER_RULE;
// };

/**
 * cleanAllStorageButExclude
 */
export const initGlobalWindowsVariables = () => {
  window.SEGMENTATION_PRODUCT_LEVEL = getCrmpowerSettingItem('segmentation_product_level');
  window.ADD_SEGMENTATION_ONLY = getCrmpowerSettingItem('add_segmentation_only');
  window.EDIT_SEGMENTATION = getCrmpowerSettingItem('edit_segmentation');
  window.CALL_BACKDATE_LIMIT = getCrmpowerSettingItem('call_backdate_limit');
  window.SEGMENTATION_AUTHORITY = getCrmpowerSettingItem('segmentation_authority');
  window.DCR_CREATE_CUSTOMER_RULE = getCrmpowerSettingItem('dcr_create_customer_rule');
  window.DCR_EDIT_CUSTOMER_RULE = getCrmpowerSettingItem('dcr_edit_customer_rule');
  window.ENABLE_ACCOUNT_AUTHORIZATION = getCrmpowerSettingItem('enable_account_authorization');
  window.ENABLE_WEB_ALERT_NOTIFICATION = getCrmpowerSettingItem('enable_web_alert_notification', false);
  window.NEED_NOTICE_READ_LOG = getCrmpowerSettingItem('need_notice_read_log', false);
  analyticalGlobalVariables();
};

// 解析轮询全局控制变量
export const analyticalGlobalVariables = () => {
  if (window.ENABLE_WEB_ALERT_NOTIFICATION && !window.POLLING_NOTIFICATION_INTERVAL) {
    // 循环执行，每隔30秒钟执行一次 pollingInterval（）
    window.POLLING_NOTIFICATION_INTERVAL = window.setInterval(pollingIntervalUtil.pollingNotification, 30000);// 轮询间隔，目前先按照30s来就可以，不需要config配置，因为这块需要用户自行配置
  }
  // pollingInterval.pollingNotification();
}
