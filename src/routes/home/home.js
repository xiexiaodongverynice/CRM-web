import { connect } from 'dva';
import _ from 'lodash';
import Home from '../../components/home/home';
import SettingHome from '../../components/home/settingHome';

const HomePage = ({
  dispatch,
  sales,
  notice,
  recentSales,
  comments,
  completed,
  browser,
  cpu,
  user,
  body,
  kpi_result,
  location,
  menu,
}) => {
  const app_authorize = JSON.parse(localStorage.getItem('app_authorize'));
  const crmHomeConfig = _.find(app_authorize, { appName: 'CRM' });
  const webHomePageType = _.get(crmHomeConfig, 'webHomePageType', '1'); // *'1'默认；'2'自定义home

  if (!_.isEmpty(crmHomeConfig) && webHomePageType !== '1') {
    // *crmHomeConfig非空且webHomePageType不等于'1'则确定是自定义设置的首页，其他走默认首页
    // *自定义设置的首页
    return (
      <div>
        <SettingHome app_authorize={app_authorize} menu={menu} dispatch={dispatch} />
      </div>
    );
  } else {
    // *默认首页
    return (
      <div className="k_container">
        <Home
          body={body}
          dispatch={dispatch}
          sales={sales}
          notice={notice}
          kpi_result={kpi_result}
          recentSales={recentSales}
          comments={comments}
          completed={completed}
          browser={browser}
          user={user}
          location={location}
        />
      </div>
    );
  }
};

function mapStateToProps(state) {
  const {
    sales,
    notice,
    recentSales,
    comments,
    completed,
    browser,
    cpu,
    user,
    body,
    kpi_result,
  } = state.home;
  const { menu } = state.App;
  return {
    sales,
    notice,
    recentSales,
    comments,
    completed,
    browser,
    cpu,
    user,
    body,
    kpi_result,
    menu,
  };
}
export default connect(mapStateToProps)(HomePage);
