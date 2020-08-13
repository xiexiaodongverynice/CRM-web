import { FS } from '../utils/config';
import request from '../utils/request';

const images_api = `${FS}/rest/images/`;

export const uploadUrl = images_api;


export const downloadUrl = images_api;

// 02/03/2018 - TAG: 删除图片，目前不使用
export const deleteImage = (key) => {
  return request({
      url: `${images_api}/${key}`,
      method: 'DELETE',
    });
};
