import pathToRegexp from 'path-to-regexp';

export const matchPath = (pathname) => {
  const basepath = '/object_page/:object_api_name/';
  return (pathToRegexp(`${basepath}add_page`).exec(pathname) || pathToRegexp(`${basepath}:record_id/detail_page`).exec(pathname) || pathToRegexp(`${basepath}:record_id/edit_page`).exec(pathname))
}