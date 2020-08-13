/**
 * Created by wans on 10/11/2017.
 * http://www.unicode.org/cldr/charts/28/supplemental/language_plural_rules.html#zh
 * @flow
 */
import antdEn_US from 'antd/lib/locale-provider/en_US';
import antdZh_TW from 'antd/lib/locale-provider/zh_TW';
import _ from 'lodash';
import React from 'react';
// 推荐在入口文件全局设置 locale
import moment from 'moment';
import { addLocaleData, FormattedMessage } from 'react-intl';

import appLocaleData_zh from 'react-intl/locale-data/zh';
import appLocaleData_en from 'react-intl/locale-data/en';

import zh_Messages from '../../locales/zh.json';
import zh_TWMessages from '../../locales/zh_TW.json';
import en_USMessages from '../../locales/en.json';
import consoleUtil from './consoleUtil';

const CRM_INTL = 'CRM_INTL';
const CRM_INTL_TYPE = 'CRM_INTL_TYPE';
// 01/02/2018 - TAG: 用户手动设置的语言类型
const CRM_INTL_TYPE_USER = 'CRM_INTL_TYPE_USER';

export const setIntlSetting = (intl) => {
  consoleUtil.log('setIntlSetting');
  if (intl === undefined) {
    intl = {};
  }
  localStorage.setItem(CRM_INTL, JSON.stringify(intl));
  const intlType = getCRM_INTL_TYPE();
  const intlMessage = _.get(intl, intlType);
  loadIntlSetting(intlType, intlMessage);
  window.APP_INTL_TYPE = intlType;
};

export const getCrmIntl = () => {
  const localCrmIntlJson = localStorage.getItem(CRM_INTL);
  if (localCrmIntlJson) {
    return JSON.parse(localCrmIntlJson);
  } else {
    return {};
  }
};

// 通过指定的key，获取方言数据缓存
export const getAppIntlItem = (itemCode) => {
  const crmIntl = getCrmIntl();
  const crmIntlItem = _.get(crmIntl, itemCode);
  return crmIntlItem;
};

// 获取方言翻译所需要的appLocle
export const getAppLocale = () => {
  const intlType = getCRM_INTL_TYPE();
  const locale = loadIntlSetting(intlType, getAppIntlItem(intlType));
  consoleUtil.log('getAppLocale===>>>', window.appLocale);
  return locale;
};

// 加载当前方言的翻译集合
export const loadIntlSetting = (intlType, message = {}) => {
  consoleUtil.log('load intl===>', intlType, message);
  if (intlType === 'en_US') {
    moment.locale('en');
    window.appLocale = {
      messages: {
        ...en_USMessages,
        ...message,
      },
      antd: antdEn_US,
      locale: 'en-US',
      data: appLocaleData_en,
    };
  } else if (intlType === 'zh_TW') {
    moment.locale('zh-tw');
    window.appLocale = {
      messages: {
        ...zh_TWMessages,
        ...message,
      },
      antd: antdZh_TW,
      locale: 'zh',
      data: appLocaleData_zh,
    };
  } else if (intlType === 'zh_HK') {
    moment.locale('zh-hk');
    window.appLocale = {
      messages: {
        ...zh_TWMessages,
        ...message,
      },
      antd: antdZh_TW,
      locale: 'zh',
      data: appLocaleData_zh,
    };
  } else {
    moment.locale('zh-cn');
    window.appLocale = {
      messages: {
        ...zh_Messages,
        ...message,
      },
      antd: null,
      locale: 'zh-CN',
      data: appLocaleData_zh,
    };
  }
  // consoleUtil.log('moment=====>',moment(1316116057189).fromNow());
  addLocaleData(window.appLocale.data);
  return window.appLocale;
};

// 默认初始化方言
export const initIntlSetting = () => {
  const crmIntlType = getCRM_INTL_TYPE();
  changeCRM_INTL_TYPE(crmIntlType);
  loadIntlSetting(crmIntlType, {});
};

// 修改缓存的方言类型
export function changeCRM_INTL_TYPE(crmIntlType) {
  localStorage.setItem(CRM_INTL_TYPE, crmIntlType);
}

// 01/02/2018 - TAG: 用户手动设置语言类型
export function changeCRM_INTL_TYPE_USER(crmIntlType) {
  localStorage.setItem(CRM_INTL_TYPE_USER, crmIntlType);
}
// 获取当前方言，默认为系统浏览器方言
export const getCRM_INTL_TYPE = () => {
  // 01/02/2018 - TAG: 用户手动设置的语言类型优先于租户系统语言
  let crmIntlType = localStorage.getItem(CRM_INTL_TYPE_USER) || localStorage.getItem(CRM_INTL_TYPE);
  try {
    if (_.isEmpty(crmIntlType) || crmIntlType === 'undefiend' || crmIntlType === 'null') {
      // 01/02/2018 - TAG: 如果用户从未登录过，则读取浏览器的语言
      crmIntlType = navigator.language || navigator.browserLanguage;
      if (!_.includes(['zh-CN', 'zh-TW', 'zh-HK'], crmIntlType)) {
        if (_.startsWith(crmIntlType, 'en')) {
          crmIntlType = 'en-US';
        } else {
          crmIntlType = 'zh-CN';
        }
      }
    } else {
      const crmIntl = getCrmIntl();
      if (_.indexOf(_.keys(crmIntl), crmIntlType) < 0) {
        crmIntlType = navigator.language || navigator.browserLanguage;
        if (_.startsWith(crmIntlType, 'en')) {
          crmIntlType = 'en-US';
        } else {
          crmIntlType = 'zh-CN';
        }
      }
    }
  } catch (e) {
    consoleUtil.error(e);
    crmIntlType = 'zh_CN';
  }
  crmIntlType = _.replace(crmIntlType, '-', '_');
  consoleUtil.log('getCRM_INTL_TYPE==>', crmIntlType);
  return crmIntlType;
};

// 清除方言缓存，保留方言类型，只清除数据
export const cleanLocalStorage = () => {
  localStorage.removeItem(CRM_INTL);
  // delete window.fc_permission;
};

export function fmt(code, defaultTxt = code) {
  return <FormattedMessage id={code} defaultMessage={defaultTxt} />;
}

export function fmtStr(code, defaultTxt = code) {
  if (_.isEmpty(code) || _.isUndefined(code) || _.isNull(code)) {
    return defaultTxt;
  }
  try {
    return _.get(window.appLocale.messages, code, defaultTxt);
  } catch (e) {
    consoleUtil.error(`[crm intl util] get code error, code=${code}`);
    return defaultTxt;
  }
}

/**
 *
 * @param code 用于从locale文件中查找的key值
 * @param defaultTemplate 当code不存在时使用的默认key值
 * @param values Map字典，其中包含模版中要替换的变量
 */
export function fmtWithTemplate(code, defaultTemplate, values) {
  try {
    const template = _.template(_.get(window.appLocale.messages, code, defaultTemplate));
    return template(values || {});
  } catch (e) {
    consoleUtil.error(`[crm intl util] get code error. code = ${code}`);
    return defaultTemplate;
  }
}
