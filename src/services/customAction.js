import _ from 'lodash';
import config from '../utils/config';
import {request} from '../utils';

const {api} = config;
const {custom_action} = api;

/**
 * payload = {
 *   objectApiName String,
 *   action String,
 *   ids array,
 *   params object
 * }
 * @param payload
 * @returns {*}
 */
export function executeAction(payload) {
  const {objectApiName, action, ids, params = {}} = payload;
  const url = `${custom_action}/${objectApiName}/${action}`;
  return request({
    url,
    method: 'post',
    data: {
      ids,
      params
    },
  });
}
