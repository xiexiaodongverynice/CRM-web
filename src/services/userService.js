/**
 * Created by xinli on 2017/12/19.
 */

import { api, baseURL } from '../utils/config';
import { request } from '../utils';

const { subordinate_query, list_tutorial_territory, list_territoryId_query } = api;
const { territory_customer_query } = api;

export function getSubordinates(payload) {
  let url = subordinate_query.replace('{id}', payload.user_id);
  const { parent = false } = payload;
  /**
   * 是否获取上级的下属
   */
  if (parent) {
    url = `${url}?parent=true`
  } else {
    /**
     * 请求所有下属，包括虚线下级和岗位直属下级
     */
    url = `${url}?sub_type=all`
  }
  return request({
    url,
    method: 'GET',
    body: payload,
  });
}

export function getDirectSubordinates(payload) {
  const url = list_tutorial_territory.replace('{id}', payload.user_id) + '?restrict=true'
  return request({
    url,
    method: 'GET'
  });
}

export function getTerritoryIds(payload){
  const url = list_territoryId_query.replace('{id}', payload.user_id) + '?restrict=true'
  return request({
    url,
    method: 'GET'
  });
}

export function getTerritoryCustomerIds(payload) {
  const url = territory_customer_query.replace('{userId}', payload.user_id);
  return request({
    url,
    method: 'GET',
    body: payload,
  });
}

//导入导出相关
export function upload() {
  return request(
    '/rest/download/territory', {
      method: 'GET',
    });
}

