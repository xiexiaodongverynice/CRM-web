import config from '../utils/config';
import { request } from '../utils';

const { api } = config;
const { approval_flow } = api;

/**
 * payload = {
 *   flow_api_name String,
 *   record_id String,
 *   record_api_name array,
 * }
 * @param payload
 * @returns {*}
 */
export function submitApproval(payload) {
  const url = `${approval_flow}/start/`;
  return request({
    url,
    method: 'post',
    data: payload
  });
}

/**
 *
 * @param payload = {
 *   node_id :  long
 *   operation: string
 *   comments:  string
 * }
 *
 * @returns {*}
 */
export function nodeOperation(payload) {
  const url = `${approval_flow}/operation/`;
  return request({
    url,
    method: 'post',
    data: payload
  });
}

/**
 *
 * @param payload = {
 *  flow_id : long
 * }
 * @returns {*}
 */
export function cancelApproval(payload) {
  const url = `${approval_flow}/cancel/`;
  return request({
    url,
    method: 'post',
    data: payload
  });
}

export function getApprovalNodesByRecordId(payload) {
  const url = `${approval_flow}/approval_nodes/${payload.record_id}`;
  return request({
    url,
    method: 'get'
  });
}

/**
 *
 * @param payload = [
 * {
 *   node_id :  long
 *   operation: string
 *   comments:  string
 * },{
 *   node_id :  long
 *   operation: string
 *   comments:  string
 * }
 * ]
 *
 * @returns {*}
 */
export function nodeBatchOperation(payload) {
  const url = `${approval_flow}/operation/batch`;
  return request({
    url,
    method: 'post',
    data: payload.dealData
  });
}
