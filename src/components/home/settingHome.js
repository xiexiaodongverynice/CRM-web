import React, { Component } from 'react';
import { hashHistory } from 'dva/router';
import _ from 'lodash';
import menuUtil from '../../utils/menuUtil';

class SettingHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      todoSegmentationList: [],
      todoCoachList: [],
      otherTodoList: [],
      coachType: [],
      myScheduleList: [],
      totType: [],
      loading: true,
    };
  }
  componentWillMount() {
    this.getHomeItem(this.props, 111);
  }

  componentWillReceiveProps(nextProps) {
    const oldMenu = _.get(this.props, 'menu', []);
    const newMenu = _.get(nextProps, 'menu', []);
    if (oldMenu !== newMenu) {
      this.getHomeItem(nextProps);
    }
  }

  getHomeItem = (props) => {
    const app_authorize = _.get(props, 'app_authorize', []);
    const crmHomeConfig = _.find(app_authorize, { appName: 'CRM' });
    const webHomePageName = _.get(crmHomeConfig, 'webHomePageName', '');
    const menu = _.get(props, 'menu', []);
    const menuItem = _.find(menu, { api_name: webHomePageName });
    if (!_.isEmpty(menuItem)) {
      const itemPath = menuUtil.conversionPath(menuItem);
      hashHistory.push(itemPath);
    }
  };

  render() {
    return <div>【首页配置错误】</div>;
  }
}

export default SettingHome;
