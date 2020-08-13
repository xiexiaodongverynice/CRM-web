import React from 'react';
import { Breadcrumb } from 'antd';
import styles from './Breadcrumb.less';

const mainBreadcrumb = ({
                          routes,
                        }) => {
  return (
    <div className={styles.Bread}>
      <span className={styles.BreadLeft}>当前位置</span>
      <Breadcrumb className={styles.BreadLeft} separator=">" routes={routes} />
    </div>
  );
};

export default mainBreadcrumb;
