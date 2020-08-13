import pathToRegexp from 'path-to-regexp';
import _ from 'lodash';
import config from '../utils/config';
import { request } from '../utils';

const { api } = config;
const { kpi } = api;


export function getKpi(payload) {
  const url = kpi.replace('{user_id}',payload.userId);
  return request({
    url,
    method: 'get',
    data: {},
  });
}
