import _ from 'lodash';
import config from '../utils/config';
import { request } from '../utils';
import { joinParams } from '../utils/custom_util';

const { api: { call_template } }  = config;

/**
 * 复制模板
 */
export function copy(payload) {
  const { id } = payload;
  const url = `${call_template}/${id}/copy`;
  return request({
    url,
    method: 'post',
    data: _.pick(payload, ['start_time', 'end_time', 'zoneOffset']),
  });
};

/**
 * 应用模板
 */
export function apply_call_template(payload) {
  const { id } = payload;
  const url = `${call_template}/${id}/apply`;
  return request({
    url,
    method: 'post',
    data: _.pick(payload, ['start_time', 'end_time']),
  });
};
