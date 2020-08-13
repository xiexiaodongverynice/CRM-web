import _ from 'lodash';
import axios from 'axios';
import config from '../utils/config';

const { fs_api, FS } = config;

export async function uploadImage({ fileParam, token }) {
  const fd = new FormData();

  fd.append('file', fileParam.file);
  fd.append('public_flag', true);

  const fileConfig = {
    headers: { 'Content-Type': 'multipart/form-data', token },
  }; // 添加请求头

  const serverURL = `${FS}${fs_api.files}`;

  const response = await axios.post(serverURL, fd, fileConfig);
  if (_.get(response, 'status') === 200) {
    const key = response.data.key;
    // const fileUrl = `${FS}${fs_api.files}/${key}?token=${token}`;
    const fileUrl = `${FS}${fs_api.files}public/${key}`;
    return fileUrl;
  }

  return null;
}
