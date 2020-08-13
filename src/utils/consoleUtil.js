// http://www.cnblogs.com/see7di/archive/2011/11/21/2257442.html
import _ from 'lodash';
import UrlParse from 'url-parse';
import config from './config';

const { DOMAIN_DEFAULT_DEBUG } = config;
const urlParams = new UrlParse(window.location.href, true);
const needDebug = _.indexOf(DOMAIN_DEFAULT_DEBUG, document.domain) >= 0 || _.get(urlParams, 'query.debug') === 'true';

function info(...params) {
  if (needDebug) {
    console.info(...params);
  }
}
function log(...params) {
  if (needDebug) {
    console.log(...params);
  }
}
function error(...params) {
  if (needDebug) {
    console.error(...params);
  }
}
function debug(...params) {
  if (needDebug) {
    console.debug(...params);
  }
}
function warn(...params) {
  if (needDebug) {
    console.warn(...params);
  }
}
export default {
  info, log, debug, error, warn
};
