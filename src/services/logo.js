/**
 *Created by Guanghua on 01/16;
 */

import config from '../utils/config';
import { request } from '../utils';
const { api } = config;

export default function getLogo(payload) {
  const url = api.logo.replace('{apiName}', payload.apiName);
  return request({
    url,
    method: 'GET',
    body: payload,
  });
}
