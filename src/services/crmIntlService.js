/**
 * I18n module
 * @flow
 */

import config from '../utils/config';
import { request } from '../utils';

const { api } = config;
const { locale_all, default_language } = api;

export function loadCrmIntl(payload) {
  return request({
    url: locale_all,
    data: {},
  });
}
export function loadDefaultLanguage(payload) {
  return request({
    url: default_language,
    data: {},
  });
}
