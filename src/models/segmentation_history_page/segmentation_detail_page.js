import { message } from 'antd';
import pathToRegexp from 'path-to-regexp';
import { parse } from 'qs';
import _ from 'lodash';
import * as recordService from '../../services/object_page/recordService';
import * as encryptJwtService from '../../services/encryptJwtService';
import config from '../../utils/config';
const { baseURL } = config;


export default {
  namespace: 'segmentation_detail_page',
  state: {
    loading: true,
    segmentationRecordData:{},
    secretJwtData:'',
    segmentationId:'',
    pageType: 'segmentation_detail_page',
  },
  reducers: {
    buildPageSuccess(state, { payload: { segmentationId, segmentationRecordData, secretJwtData } }) {
      return { ...state, segmentationId, segmentationRecordData, secretJwtData };
    },

  },
  effects: {
    *fetchAll({ payload }, { call, put }) {

      const {segmentation_history_id} = payload;
      const {product_id} = payload.query;
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
          "call_back_base_url":baseURL,
          "token":localStorage.getItem('token'),
        },
        "module": "segment",
        "source": "web"
      }

      const secretJwtData = yield call(encryptJwtService.encryptJwt, {dealData:secretData});
      yield put({
        type: 'buildPageSuccess',
        payload: {segmentationId:segmentation_history_id,segmentationRecordData:_.head(_.get(segmentationList,'result')), secretJwtData:_.get(secretJwtData,'result') },
      });

    },

  },
  subscriptions: {
    // 路由监听器
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        const match = pathToRegexp('/segmentation_history/:segmentation_history_id/segmentation_detail_page').exec(pathname);
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
