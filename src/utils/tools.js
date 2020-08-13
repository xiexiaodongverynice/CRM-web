import _ from 'lodash';

/**
 * 判断目标对象在设备上的显示情况
 * @param {Object} params 目标对象
 * @param {String} device 目标值
 * @returns {Boolean} true 需要隐藏; false 不需要隐藏
 */
export function checkForHiddenDevice(params, device) {
  const hidden_devices = _.get(params, 'hidden_devices', []);
  return _.indexOf(hidden_devices, device) !== -1
}
