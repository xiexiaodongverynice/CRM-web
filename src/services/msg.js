/**
 * 这是对antDesign的message函数的封装，
 * 唯一的修改是error函数，当连续传入相同的content时，会只显示第一个错误提示，直到这个错误提示隐藏。
 * 不同的错误提示信息不受影响
 * Created by xinli on 2017/11/28.
 */
import { message } from 'antd';

let errors = [];
export function error(content, duration) {
  if (errors.indexOf(content) < 0) {
    errors.push(content);
    message.error(content, duration, () => {
      errors = errors.filter(x => x !== content);
    });
  }
}

export function success(content, duration) {
  message.success(content, duration);
}

export function warning(content, duration) {
  message.warning(content, duration);
}

export function warn(content, duration) {
  warning(content, duration);
}

export function info(content, duration) {
  message.info(content, duration);
}

export function loading(content, duration) {
  message.loading(content, duration);
}

export function config(options) {
  message.config(options);
}

export function destroy() {
  message.destroy();
}

