import storageUtil from './storageUtil';

/**
 * access cookie-storage with opening url of browser on Safari
 * Safari privacy policy：
 *   仅允许被浏览器访问过的域在 iframe 中对浏览器进行 cookie 读写。
 */

export const COOKIE_WHITELIST = 'com_forceclouds_whitelist_cookie';
const userAgent = navigator.userAgent.toLocaleLowerCase();
const isSafari = userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') < 0;

/**
 * 因为被标记为 httpOnly 的 cookie 无法通过 JS 访问，所以不能够通过是否有 cookie 来判断能否正常加载
 * 因此我们用 localstorage 在本地创建了域名白名单的方式来控制是否走本流程
 * @param {string} target
 */
function hasCookiePermission(target) {
  const whitelist = storageUtil.get(COOKIE_WHITELIST, '');
  return whitelist.indexOf(target) > -1;
}

function updateCookieWhitelist(target) {
  const whitelist = storageUtil.get(COOKIE_WHITELIST, '');
  storageUtil.set(COOKIE_WHITELIST, `${target}\n${whitelist}`);
}

export function allowCookie(target) {
  return new Promise((resolve, reject) => {
    const domain = target.split('/')[2]
    if (!isSafari || hasCookiePermission(domain)) {
      reject()
      return;
    }
    const w = window.open(target);
    setTimeout(() => {
      if (w) {
        w.close();
        resolve();
        updateCookieWhitelist(domain);
      } else {
        reject(new Error('为了网页能够正常访问，请打开地址栏弹窗，关闭后并刷新本页面'))
      }
    }, 100)
  })
}
