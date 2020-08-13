/**
 * Created by Uncle Charlie, 2018/05/17
 */

import { FS, previewUrl } from '../utils/config';
import request from '../utils/request';

const restUrl = `${FS}/rest/files/`;
const uploadUrl = restUrl;
const downloadUrl = restUrl;

const getFileMeta = (key) => {
  return request({
    url: `${restUrl}/${key}/info`,
    method: 'GET',
  });
};

const getFilePreview = (key) => {
  return request({
    url: `${previewUrl}?attachment=${key}`,
    method: 'GET',
  });
};

// TODO: delete uploaded files.
export default {
  uploadUrl,
  downloadUrl,
  getFileMeta,
  getFilePreview,
};
