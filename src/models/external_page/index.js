import pathToRegexp from 'path-to-regexp';
import _ from 'lodash';

// 11/01/2018 - TAG: 获取iframe高度
const getHeight = () => {
  return document.querySelector('body').clientHeight - 114 - 7;
};

// 11/01/2018 - TAG: 监听处理函数
let onWindowResizeHandler = null;

const onWindowResize = ({ dispatch }) => {
  return () => {
    dispatch({
      type: 'assignState',
      payload: {
        height: getHeight(),
      },
    });
  };
};

// 11/01/2018 - TAG: 事件监听
const setupWindowListener = () => {
  window.addEventListener('resize', onWindowResizeHandler);
};

const unsetupWindowListener = () => {
  window.removeEventListener('resize', onWindowResizeHandler);
};

export default {
  namespace: 'external_page',
  state: {
    object_page: {},
    width: '100%',
    height: '100%',
    timeStamp: null,
  },
  reducers: {
    assignState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
  effects: {
    *loginWithTokenMenuDataItem({ payload }, { call, put, select }) {
      const MenuData = yield select((data) => {
        return _.get(data, 'App.menu');
      });
      const { objectApiName } = payload;
      if (!_.isEmpty(MenuData) && !_.isEmpty(objectApiName)) {
        const menuItem = _.find(MenuData, { api_name: objectApiName });
        if (!_.isEmpty(menuItem)) {
          yield put({
            type: 'assignState',
            payload: {
              object_page: menuItem,
              height: getHeight(),
              timeStamp: _.now(),
            },
          });
        }
      }
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen((location) => {
        const { pathname } = location;
        const match = pathToRegexp('/external_page/:object_api_name/index_page').exec(pathname);
        if (match) {
          // 11/01/2018 - TAG: 从history state 中获取网页地址
          const object_page = _.chain(location)
            .result('state')
            .result('object_page', null)
            .value();
          const timeStamp = _.chain(location)
            .result('state')
            .result('timeStamp', null)
            .value();
          const { query } = location;
          const token = _.get(query, 'token');
          const from = _.get(query, 'from');
          if (_.isEmpty(object_page)) {
            setTimeout(() => {
              dispatch({
                type: 'loginWithTokenMenuDataItem',
                payload: {
                  objectApiName: _.split(pathname, '/')[2],
                },
              });
            }, 1000);
          }
          if (!_.isNull(timeStamp)) {
            // 单独传送一次 timeStamp
            dispatch({
              type: 'assignState',
              payload: { timeStamp },
            });
          }
          if (!_.isNull(object_page)) {
            dispatch({
              type: 'assignState',
              payload: {
                object_page,
                height: getHeight(),
              },
            });
          }

          onWindowResizeHandler = _.throttle(onWindowResize({ dispatch }), 100, {
            trailing: true,
          });

          setupWindowListener();
        } else {
          unsetupWindowListener();
        }
      });
    },
  },
};
