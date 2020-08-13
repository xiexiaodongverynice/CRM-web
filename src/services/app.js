import moment from 'moment'
import _ from 'lodash'
import config from '../utils/config';
import { request } from '../utils';

const { api } = config;
const { tab, serverTime } = api;

export function loadMenu(payload) {
  const url = tab;
  return request({
    url,
    data: {},
  });
}


//* 获取服务器时间
export async function getServerTime() {
  let resultTime = moment().valueOf()
  try {
    const { result } = await request({
      url: serverTime,
      method: 'GET'
    });
    if(result && _.isNumber(result)){
      resultTime = result
    }
  } catch (e) {
    console.warn('[warn] getServerTime failed', e)
  }

  return resultTime
}
