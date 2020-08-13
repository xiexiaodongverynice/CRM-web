import pathToRegexp from 'path-to-regexp';
import _ from 'lodash';
import config from '../../utils/config';
import { request } from '../../utils';
import { processCriterias } from '../../utils/criteriaUtil';
import * as notification from '../../util/notification';
import consoleUtil from '../../utils/consoleUtil';
const { api } = config;
const {
  record,
  record_query,
  record_detail,
  record_del,
  record_ubatch,
  multiple_query,
  batch_delete,
} = api;

export function queryRecordList(payload) {
  // notification.open('info', '通知', '今天晚上19:00～22:00点进行系统升级，请提前做好数据保存工作，给您带来的不变，敬请原谅，谢谢配合。',true,null)
  const url = record_query;
  const { dealData } = payload;
  const { criterias, approvalCriterias } = dealData;
  let data = { ...dealData, criterias: processCriterias(criterias) };
  if (approvalCriterias) {
    data = { ...data, approvalCriterias: processCriterias(approvalCriterias) };
  }
  return request({
    url,
    method: 'post',
    data,
    // data: _.omit(payload, 'object_api_name'),
  });
}
export function MutipleQueryRecordList(payload) {
  const url = multiple_query;
  return request({
    url,
    method: 'post',
    data: payload.dealData,
  });
}
export function loadRecord(payload) {
  // notification.open('info', '通知', '今天晚上19:00～22:00点进行系统升级，请提前做好数据保存工作，给您带来的不变，敬请原谅，谢谢配合',true,null)
  const url = record_detail
    .replace('{api_name}', payload.object_api_name)
    .replace('{id}', payload.record_id);
  return request({
    url,
    data: {},
  });
}
export function create(payload) {
  const url = record.replace('{api_name}', payload.object_api_name);
  return request({
    url,
    method: 'post',
    data: payload.dealData,
  });
}
export function deleteRecord(payload) {
  const url = record_del.replace('{api_name}', payload.object_api_name).replace('{id}', payload.id);
  return request({
    url,
    method: 'delete',
    data: {},
  });
}
export function updateRecord(payload) {
  const url = record_detail
    .replace('{api_name}', payload.object_api_name)
    .replace('{id}', payload.id);
  return request({
    url,
    method: 'put',
    data: payload.dealData,
  });
}

export function batchUpdateRecords(payload) {
  const url = record_ubatch.replace('{api_name}', payload.object_api_name);
  return request({
    url,
    method: 'put',
    data: payload.dealData,
  });
}

export function createOrUpdate(payload) {
  // consoleUtil.log('createOrUpdate', payload);
  if (payload.dealData.id) {
    payload.id = payload.dealData.id;
    return updateRecord(payload);
  } else {
    return create(payload);
  }
}

export function batchDeleteRecord(payload) {
  const { recordIds = [] } = payload;
  const url = batch_delete.replace('{api_name}', payload.object_api_name);
  return request({
    url,
    method: 'post',
    data: {
      recordIds,
    },
  });
}

export function queryRecordListByLocalStorage(payload) {
  const objectApiName = payload.object_api_name;
  const userId = localStorage.getItem('userId');

  const localStorageKey = `RelatedCollect_${userId}_${objectApiName}`;
  const data = localStorage.getItem(localStorageKey);
  if (!_.isEmpty(data)) {
    return JSON.parse(data);
  }
  const url = record_query;
  const resultData = request({
    url,
    method: 'post',
    data: payload.dealData,
    // data: _.omit(payload, 'object_api_name'),
  }).then((repData) => {
    const resultData = repData.result;
    localStorage.setItem(localStorageKey, JSON.stringify(resultData));
    return resultData;
  });

  return resultData;
}
