/*
 * @Author: mll
 * @Date: 2018-10-22 18:37:39
 * @LastEditors: mll
 * @LastEditTime: 2018-10-23 10:41:30
 * @Description: 缓存上传附件
 */

export default {
  cache: [],
  add(item) {
    this.cache.push(item)
  },
  delete(item) {
    this.cache = this.cache.filter(({ id }) => id !== item.id);
  },
  clear() {
    this.cache = []
  }
}