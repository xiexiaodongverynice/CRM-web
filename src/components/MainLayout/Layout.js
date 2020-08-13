import React from 'react';
import { connect } from 'dva';

import DocumentTitle from 'react-document-title';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import { Menu, Icon, Layout, Spin, Row, Col, Affix, Button, LocaleProvider } from 'antd';
import { Link } from 'react-router';
import { hashHistory } from 'react-router';
import { addLocaleData, IntlProvider } from 'react-intl';
import MainHeader from './MainHeader';
import MenuHeader from './MenuHeader';
import { color, config } from '../../utils';
import styles from './Layout.less';

const { Content } = Layout;
const mainLayout = ({
                      routes,
                      children,
                      location,
                      dispatch,
                      collapsed,
                      loading,
                      ...headerProps
                    }) => {
  function createHandler(collapseds) {
    dispatch({
      type: 'App/isswitch',
      payload: collapseds
    });
  }


  const query = {
    'screen-xs': {
      maxWidth: 575
    },
    'screen-sm': {
      minWidth: 576,
      maxWidth: 767
    },
    'screen-md': {
      minWidth: 768,
      maxWidth: 991
    },
    'screen-lg': {
      minWidth: 992,
      maxWidth: 1199
    },
    'screen-xl': {
      minWidth: 1200,
      maxWidth: 1599
    },
    'screen-xxl': {
      minWidth: 1600
    }
  };
  // return (
  //   <Layout>
  //     <div style={{ padding: '0 0 2rem 0' }}>
  //       <Layout className={styles.boxShadow} >
  //         <MainHeader collapsed={collapsed} onOk={createHandler}{...headerProps} />
  //         <MenuHeader collapsed={collapsed} onOk={createHandler} {...headerProps} style={{ float: 'left' }} />
  //       </Layout>
  //     </div>
  //     <Layout>
  //       <Spin spinning={loading} size="large" >
  //         <Content style={{ padding: '0 0 2rem 0' }}>
  //           {children}
  //         </Content>
  //       </Spin>
  //     </Layout>
  //   </Layout>
  // );

  const getPageTitle = () => {
    return 'CRMpower'
  }

  const layout = (<Layout>
    <div style={{ padding: '0 0 2rem 0' }}>
      <Layout className={styles.boxShadow} >
        <MainHeader collapsed={collapsed} onOk={createHandler}{...headerProps} />
        <MenuHeader collapsed={collapsed} onOk={createHandler} {...headerProps} style={{ float: 'left' }} />
      </Layout>
    </div>
    <Layout>
      <Spin spinning={loading} size="large" >
        <Content style={{ padding: '0 0 2rem 0' }}>
          {children}
        </Content>
      </Spin>
    </Layout>
  </Layout>);
  return (
    <LocaleProvider locale={window.appLocale.antd}>
      <IntlProvider
        locale={window.appLocale.locale}
        messages={window.appLocale.messages}
        // formats={appLocale.formats}
      >
        <DocumentTitle title={getPageTitle()}>
          <ContainerQuery query={query}>
            {(params) => (
              <div className={classNames(params)}>{layout}</div>
            )}
          </ContainerQuery>
        </DocumentTitle>
      </IntlProvider>
    </LocaleProvider>

  );
};

function mapStateToProps(state) {
  const { collapsed } = (state.App);
  return {
    loading: state.loading.global,
    collapsed
  };
}
export default connect(mapStateToProps)(mainLayout);
