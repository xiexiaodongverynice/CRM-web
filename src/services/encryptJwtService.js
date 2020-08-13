import pathToRegexp from 'path-to-regexp';
import _ from 'lodash';
import config from '../utils/config';
import { request } from '../utils';

const { api } = config;
const { encrypt_jwt, kpi_encrypt_jwt } = api;


export function encryptJwt(payload) {
  const url = encrypt_jwt;
  return request({
    url,
    method: 'post',
    data: payload.dealData,
  });
}

export function kpiEncryptJwt(payload) {
  const url = kpi_encrypt_jwt;
  return request({
    url,
    method: 'post',
    data: payload.dealData,
  });
};
