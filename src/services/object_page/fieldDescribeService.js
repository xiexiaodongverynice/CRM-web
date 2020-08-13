import _ from 'lodash';
import config from '../../utils/config';
import { request } from '../../utils';

const { api } = config;
const { custom_object, custom_objects_all, coach_user_info } = api;

// 提供一个object_api_name，返回该对象的object_describe描述信息，包含字段集合
// {object_api_name:xxx}
export function loadObject(payload) {
  const allObjectDescribeListData = loadAllObject({});
  const objectDescibeList = _.get(allObjectDescribeListData, 'items');
  const refObjectDescribe = _.find(objectDescibeList, { api_name: payload.object_api_name });
  return refObjectDescribe;
}
// 提供一个object_api_name_list，返回该集合对象的object_describe描述信息，包含字段集合
// {object_api_name_list:[]}
export function loadObjectList(payload) {
  const objectApiNameList = payload.object_api_name_list;
  const allObjectDescribeListData = loadAllObject({});
  const objectDescribeList = [];
  const allObjectDescibeList = _.get(allObjectDescribeListData, 'items');

  _.forEach(objectApiNameList, (value, key) => {
    const objDescribe = _.find(allObjectDescibeList, { api_name: value });
    objectDescribeList.push(objDescribe);
  });
  return objectDescribeList;
}

// 提供一个object_api_name和related_list_name，返回该对象下的field为related_list_api_name的字段描述信息
// //{object_api_name:xxx,related_list_name:xxx}
export function loadRefObjectFieldDescribe(payload) {
  const refObjectDescribe = loadObject(payload);
  const refObjectFieldDescribe = _.find(_.get(refObjectDescribe, 'fields'), {
    related_list_api_name: payload.related_list_name
  });
  return refObjectFieldDescribe;
}
// 提供一个object_api_name和field_api_name，返回该对象下的field为api_name的字段描述信息
// //{object_api_name:xxx,field_api_name:xxx}
export function loadObjectFieldDescribe(payload) {
  const objectDescribe = loadObject(payload);
  const objectFieldDescribe = _.find(_.get(objectDescribe, 'fields'), {
    api_name: payload.field_api_name
  });
  return objectFieldDescribe;
}

export function loadAllObject(payload) {
  const url = `${custom_objects_all}?includeFields=true`;
  const userId = localStorage.getItem('userId');
  let data = localStorage.getItem(`object_all_describe_${userId}`);
  if (!_.isEmpty(data) && _.get(JSON.parse(data), 'success')) {
    return JSON.parse(data);
  } else {
    data = request({
      url,
      data: {}
    }).then((repData) => {
      localStorage.setItem(`object_all_describe_${userId}`, JSON.stringify(repData));
      return repData;
    });
    return data;
  }
}
// 选择辅导下属
export function loadCoachList(payload) {
  const url = coach_user_info.replace('{id}', payload.record_id);
  return request({
    url,
    data: payload.dealData
  });
}

export async function storeObject(payload) {
  const userId = localStorage.getItem('userId');
  const dataObjectDesc = localStorage.getItem(`object_all_describe_${userId}`);
  let allObjectDescribeListData = {};
  if (!_.isEmpty(dataObjectDesc) && _.get(JSON.parse(dataObjectDesc), 'success')) {
    allObjectDescribeListData = JSON.parse(dataObjectDesc);
  } else {
    allObjectDescribeListData = JSON.parse(window.objectAllDescribe);
  }
  const objectDescibeList = _.get(allObjectDescribeListData, 'items');
  const refObjectDescribe = _.find(objectDescibeList, { api_name: payload.object_api_name });
  return refObjectDescribe;
}
