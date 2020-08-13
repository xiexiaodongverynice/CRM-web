import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { hashHistory } from 'react-router';
import { message, Spin } from 'antd';
import MainLayout from '../components/MainLayout/Layout';
import * as crmIntlUtil from '../utils/crmIntlUtil';
import * as callBackUtil from '../utils/callBackUtil';
import consoleUtil from '../utils/consoleUtil';

const IndexPage = ({ location, routes, loading, children, dispatch, menu }) => {
  // const { user, siderFold, darkTheme, isNavbar, menuPopoverVisible, navOpenKeys, menu } = app
  // const { menu } = app
  const href = window.location.href;

  const headerProps = {
    menu,
    // user,
    // siderFold,
    location,
    // isNavbar,
    // menuPopoverVisible,
    // navOpenKeys,
    // switchMenuPopover() {
    //   dispatch({ type: 'app/switchMenuPopver' });
    // },
    logout() {
      // consoleUtil.log('route app logout')；
      dispatch({ type: 'App/logout' });
    },
    changeIntl(intlType) {
      consoleUtil.log('route app change intl type ', intlType);
      // 01/02/2018 - TAG: 用户手动设置语言类型
      crmIntlUtil.changeCRM_INTL_TYPE_USER(intlType);
      reloadPage();
      // dispatch({ type: 'App/loadCRMIntl', payload:{callback:reloadPage}});
    },
    // switchSider() {
    //   dispatch({ type: 'app/switchSider' });
    // },
    // changeOpenKeys(openKeys) {
    //   dispatch({ type: 'app/handleNavOpenKeys', payload: { navOpenKeys: openKeys } });
    // },
  };
  const breadProps = {
    menu,
  };

  const reloadPage = () => {
    consoleUtil.log('reloadPage');
    // callBackUtil.reloadPage({location})
    window.location.reload();
  };
  if (
    ['/login', '/reset_password', '/admin_login_as', '/redirect', '/choose_territory'].indexOf(
      location.pathname,
    ) > -1
  ) {
    return <div>{children}</div>;
  }

  return (
    <MainLayout routes={routes} {...headerProps}>
      {children}
    </MainLayout>
  );
};
// IndexPage.propTypes = {
//   children: PropTypes.element.isRequired,
//   location: PropTypes.object,
//   dispatch: PropTypes.func,
//   // app: PropTypes.object,
//   // loading: PropTypes.object,
// };

function mapStateToProps(state) {
  const { menu } = state.App;
  const loading = state.loading.models.App;
  return {
    menu,
    // layout,
    loading,
    // modalVisible,
    // modalType,
    // currentItem,
    // modalViewVisible,
  };
}
export default connect(mapStateToProps)(IndexPage);
// export default connect(({ app, loading }) => ({ app, loading }))(IndexPage)
