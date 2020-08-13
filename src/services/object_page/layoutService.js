import config from '../../utils/config';
import { request } from '../../utils';

const { api } = config;
const { layout_by_object_layoutType } = api;

export function loadLayout(payload) {
  let url = layout_by_object_layoutType.replace('{objectApiName}', payload.object_api_name).replace('{layoutType}', payload.layout_type);
  url += `?recordType=${_.get(payload, 'query.recordType', 'master')}`;// 如果不存在recordType,那么使用默认的master

  const userId = localStorage.getItem('userId');
  // let data = localStorage.getItem(`layout_${url}_${userId}`);
  // if (!_.isEmpty(data)&& _.get(JSON.parse(data),'success')) {
  //   return JSON.parse(data);
  // }
  const data = request({
    url,
    data: {}
  })
  //   .then((repData) => {
  //   // localStorage.setItem(`layout_${url}_${userId}`, JSON.stringify(repData));
  //   return repData;
  // });

  return data;
}
