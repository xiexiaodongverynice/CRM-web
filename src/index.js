import dva from 'dva';
import createLoading from 'dva-loading';
import _ from 'lodash';
import 'es6-shim';
import './index.css';
import windowUtil from './utils/windowUtil';

import '../public/crm/iconfont.css';
import './assets/icomoon.css';
// import * as notification from './services/notification';

windowUtil.initGlobalWindowProperties();
windowUtil.initGlobalCRMProperties();
// 1. Initialize
const app = dva({});

// 2. Plugins
app.use(createLoading());

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');

window.fc_getApp = () => {
  return app;
};

window.fc_unRegisterAppModel = (namespace) => {
  const models = app._models;
  const model_namespaces = models.map((model) => model.namespace);
  if (_.includes(model_namespaces, namespace)) {
    app.unmodel(namespace);
  }
};
// notification.open('info', '通知', '今天晚上19:00～22:00点进行系统升级，请提前做好数据保存工作，给您带来的不变，敬请原谅，谢谢配合', null, true)
