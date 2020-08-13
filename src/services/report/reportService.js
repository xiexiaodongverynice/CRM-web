import config from '../../utils/config';
import { request } from '../../utils';
import _ from 'lodash';
import { joinParams } from '../../utils/custom_util';

const { api, KPI_SERVE, baseURL } = config;
const { kpi_record, kpi_download, kpi_admin_download, notice_read } = api;

export function query(payload) {
  return request({
    url: `${kpi_record}`,
    method: 'post',
    data: payload,
  });
}

export function download(payload) {
  const url = `${baseURL}/${kpi_download}?${joinParams(
    _.pick(payload, ['userId', 'type', 'token', 'ym', 'lang', 'kpi_type', 'kpi_user_level']),
  )}`;
  window.open(url);
}

export function admin_download(payload) {
  const url = `${baseURL}/${kpi_admin_download}?${joinParams(
    _.pick(payload, ['userId', 'type', 'token', 'ym', 'lang', 'kpi_type', 'level', 'product_line']),
  )}`;
  window.open(url);
}


//* 更新公告已读状态
export function update_notice_status(notice){
  const data = {
    notice,
    user_info: window.FC_CRM_USERID
  }

  return request({
    url: notice_read,
    method: 'post',
    data
  });
}