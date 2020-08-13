import axios from 'axios';
import moment from 'moment';
import { Button } from 'antd';
import * as notification from './notification';
import { pollingIntervalUrl, api } from '../utils/config';
import consoleUtil from '../utils/consoleUtil';
import * as CallBackUtil from '../utils/callBackUtil';
import * as recordService from '../services/object_page/recordService';
import FormEvent from '../components/common/FormEvents';

const { polling_notification_interval } = api;
const ALERT_REFRESH = 'alert_refresh';
const ALERT_ON_MAKEREADED = 'alert_on_make_read';
// 请求通知信息
function pollingNotification() {
  const token = localStorage.getItem('token')
  const url = `${pollingIntervalUrl + polling_notification_interval}?token=${token}&polling_interval_s=${30}`// &_t=${moment.now()}
  axios.get(url).then((response) => {
    return response.data
  }).then((data) => {
    // console.log(data);
    if (_.get(data, 'success', false) && !_.isEmpty(_.get(data, 'result', []))) {
      const record = _.get(data, 'result[0]');
      const title = _.get(record, 'name');
      const confirmBtn = (
        <div>
          {/* <a
            onClick={() => {
              console.log('Button click')
              notification.destroy(title)
            }}
            style={{ marginRight: '10px' }}
          >
            我知道了
          </a>*/}
          <Button type="primary" size="small" onClick={onMarkRead.bind(this, record)}>
              查看
            </Button>
        </div>
      );
      // 通知列表刷新
      FormEvent.fire({
        type: ALERT_REFRESH
      });
      notification.open('info', title, <div dangerouslySetInnerHTML={{ __html: _.get(record, 'content', '') }} />, confirmBtn, null)
    }
  }).catch((error) => {
    consoleUtil.log(error);
  });
}

const onMarkRead = (record) => {
  FormEvent.fire({
    type: ALERT_ON_MAKEREADED,
    record
  });

  const url = `object_page/alert/${record.id}/detail_page?recordType=${record.record_type}`;
  CallBackUtil.callBackToGo(url);
  notification.destroy(record.name);
}


module.exports = {
  pollingNotification
};

