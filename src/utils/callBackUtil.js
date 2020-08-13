// import React from 'react';
import _ from 'lodash';
import { hashHistory } from 'dva/router';
import { useRouterHistory } from 'dva/router';
import { createHashHistory } from 'history';
import consoleUtil from '../utils/consoleUtil';

export function callBackDeal(params) {
  const {
    callback_code, apiName, recordType, recordId,
  } = params;
 let { callback_url } = params;
  const callbackFromStore = window.CALLBACK_FROM_STORE;
  if (!_.isEmpty(callbackFromStore)) {
    // consoleUtil.info('发现雷坑，准备起跳……',callbackFromStore);
    const fromUrl = _.last(callbackFromStore);
    const remainCallBackFromStore = _.dropRight(callbackFromStore);
    window.CALLBACK_FROM_STORE = remainCallBackFromStore;
    // consoleUtil.info('雷坑已填，还剩雷坑……',CALLBACK_FROM_STORE);
    hashHistory.push(fromUrl);
  } else if (!_.isEmpty(callback_url)) {
    callBackToGo(callback_url);
  } else if (_.toUpper(callback_code) === 'CALLBACK_TO_INDEX' && !_.isEmpty(apiName) && !_.isEmpty(recordType)) {
    callback_url = `object_page/${apiName}/index_page?recordType=${recordType}`;
    callBackToIndex(callback_url);
  } else if (_.toUpper(callback_code) === 'CALLBACK_TO_DETAIL' && !_.isEmpty(apiName) && !_.isEmpty(recordType)) {
    callback_url = `object_page/${apiName}/${recordId}/detail_page?recordType=${recordType}`;
    callBackToGo(callback_url);
  } else if (_.toUpper(callback_code) === 'CALLBACK_TO_EDIT' && !_.isEmpty(apiName) && !_.isEmpty(recordType)) {
    callback_url = `object_page/${apiName}/${recordId}/edit_page?recordType=${recordType}`;
    callBackToGo(callback_url);
  } else if (_.toUpper(callback_code) === 'CALLBACK_TO_ADD' && !_.isEmpty(apiName) && !_.isEmpty(recordType)) {
    callback_url = `object_page/${apiName}/add_page?recordType=${recordType}`;
    callBackToGo(callback_url);
  }
}

export function callBackToGo(callback_url) {
  consoleUtil.info('need to brower history ', callback_url);
  hashHistory.push(callback_url);
}

export function reloadPage(params) {
  dealNeedCallBack(params);
  callBackDeal(params);
}
export function callBackToIndex(callback_url) {
  // consoleUtil.info('need to brower history ',callback_url)
  hashHistory.push(callback_url);
}
export function removeCallBack(removeAll = false) {
  const callbackFromStore = window.CALLBACK_FROM_STORE;
  const remainCallBackFromStore = _.dropRight(callbackFromStore);
  window.CALLBACK_FROM_STORE = removeAll ? [] : remainCallBackFromStore;
}

const concatUrl = (pathname, search) => {
  return `${pathname.replace(/\?$/, '')}?${search.replace(/^\?/, '')}`;
};

export function dealNeedCallBack(params) {
  const { location } = params;

  const callbackFromStore = window.CALLBACK_FROM_STORE == undefined ? [] : window.CALLBACK_FROM_STORE;
  const fromUrl = location.pathname;
  let fromUrlSearch = location.search;
  const fromUrlQuewry = location.query;
  const k = _.get(fromUrlQuewry, '_k');
  fromUrlSearch = fromUrlSearch.replace(`&_k=${k}`, '').replace(`_k=${k}`, '');
  if (_.size(fromUrlQuewry) == 1) {
    fromUrlSearch = fromUrlSearch.replace('?', '');
  }
  // consoleUtil.log('fromUrlQuewry',fromUrlQuewry)
  callbackFromStore.push(concatUrl(fromUrl, fromUrlSearch));
  window.CALLBACK_FROM_STORE = callbackFromStore;
  // consoleUtil.info('埋雷坑……',CALLBACK_FROM_STORE);
}

