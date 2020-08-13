/**
 * notification，
 * 当连续传入相同的message时，会只显示第一个提示，直到这个提示隐藏。
 * 不同的提示信息不受影响
 * Created by wans on 2018/11/04.
 */
import { Button, notification } from 'antd';
import _ from 'lodash';
import storageUtil from '../utils/storageUtil';
import consoleUtil from '../utils/consoleUtil';


const close = (message) => {
  window.errors = window.errors.filter((x) => x !== message);
};

window.errors = [];

/**
 *
 * @param type default 'open',others: success、error、info、warning、warn
 * @param message 通知提醒标题，必选
 * @param description 'required'
 * @param confirm 是否需要自定义关闭按钮，true：使用自带的bt（我知道了），只有close事件；false：没有关闭按钮；element：使用自定义div，需要div包裹
 * @param duration 默认 4.5 秒后自动关闭，配置为 null 则不自动关闭
 */
export function open(type = 'open', message, description, confirm, duration = 4.5) {
  if (storageUtil.get(`disabled_notification_open_${message}`, false)) {
    return;
  }

  const key = `open_${message}`;
  const btnClick = function () {
    // to hide notification box
    window.errors = window.errors.filter((x) => x !== message);
    storageUtil.set('disabled_notification_open_通知', true);
    notification.close(key);
  };
  const btn = (
    <Button type="primary" size="small" onClick={btnClick}>
      我知道了
    </Button>
  );

  consoleUtil.log('errors==>', window.errors);
  if (window.errors.indexOf(message) < 0) {
    window.errors.push(message);

    const args = {
      message,
      description,
      duration,
      key,
      onClose: close.bind(this, message)
    };

    if (_.get(confirm, 'type') === 'div') {
      _.set(args, 'btn', confirm);
    } else if (_.isBoolean(confirm) && confirm) {
      _.set(args, 'btn', btn);
    }

    notification[type](args);
  }
}


export function destroy(message) {
  notification.destroy();
  window.errors = window.errors.filter((x) => x !== message);
}

