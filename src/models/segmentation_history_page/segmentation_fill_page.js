import { message } from 'antd';
import pathToRegexp from 'path-to-regexp';
import { parse } from 'qs';
import _ from 'lodash';
import * as recordService from '../../services/object_page/recordService';
import * as encryptJwtService from '../../services/encryptJwtService';
import config from '../../utils/config';
import consoleUtil from '../../utils/consoleUtil';

const { baseURL } = config;

const matchPath = (pathname) => {
  return pathToRegexp('/segmentation_history/:segmentation_history_id/segmentation_fill_page').exec(pathname)
}

export default {
  namespace: 'segmentation_fill_page',
  state: {
    loading: true,
    segmentationRecordData:{},
    secretJwtData:'',
    segmentationId:'',
    pageType: 'segmentation_fill_page',
  },
  reducers: {
    buildPageSuccess(state, { payload: { segmentationId, segmentationRecordData, secretJwtData } }) {
      return { ...state, segmentationId, segmentationRecordData, secretJwtData };
    },


    updateState (state, { payload }) {
      return {
        state,
        ...payload,
      }
    },

  },
  effects: {
    *fetchAll({ payload }, { call, put }) {

      const {segmentation_history_id} = payload;
      const {product_id,version} = payload.query;
      const segmentationPayload={
        "joiner": "and",
        "criterias": [
          {"field": "product", "operator": "==", "value": [product_id]}
        ],
        "objectApiName": "segmentation",
      }
      const segmentationList = yield call(recordService.queryRecordList, {dealData:segmentationPayload});

      const secretData = {
        "org": "mundi",
        "app": "crmpower",
        "data": {
          "segmentation_history_id": segmentation_history_id,
          "callback":baseURL,
          "token":localStorage.getItem('token'),
          version,
          "update":{
            "segmentation":_.get(_.head(_.get(segmentationList,'result')),'id'),
            "submit_time":_.now()
          }
        },
        "module": "segment",
        "source": "web"
      }

      const secretJwtData = yield call(encryptJwtService.encryptJwt, {dealData:secretData});
      //consoleUtil.log('secretJwtData',secretJwtData)
      yield put({
        type: 'buildPageSuccess',
        payload: {segmentationId:segmentation_history_id,segmentationRecordData:_.head(_.get(segmentationList,'result')), secretJwtData:_.get(secretJwtData,'result') },
      });

    },

  },
  subscriptions: {


    setupHistory ({ dispatch, history }) {
      return history.listen((location) => {
        if(matchPath(location.pathname)) {
          dispatch({
            type: 'updateState',
            payload: {
              loading: true,
              pageType: 'segmentation_fill_page',
              locationPathname: location.pathname,
              locationQuery: parse(location.search),
            },
          })
        }
      })
    },


    // 路由监听器
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        const match = matchPath(pathname);
        if (match) {
          dispatch({ type: 'fetchAll',
            payload: {
              segmentation_history_id: match[1],
              query,
            } });
        }
      });
    },
  },
};
