import modelExtend from 'dva-model-extend';
import * as detailModel from './object_detail';
import { matchPath } from './helper'

const forgeLoation = ({
  object_api_name,
  record_type,
  id,
}) => {
  const search = `?recordType=${record_type}`;
  return {
    $searchBase: {
      search,
      searchBase: ''
    },
    pathname: `/object_page/call/${id}/detail_page`,
    query: {
      recordType: record_type,
    },
    search,
    state: null,
  }
}

const ObjectDetailModel = modelExtend(detailModel, {
  /**
   * model配置
   */
  __location__: {},
});

export const NewObjectDetailModel = ({
  object_api_name,
  record_type,
  id,
  record = null, // 现有数据
}) => {
  return modelExtend(detailModel, {
    namespace: `detail_page_${object_api_name}_${record_type}_${id}`,
    subscriptions: {
      setupHistory({ dispatch, history }) {
        return history.listen((location) => {
          if(matchPath(location.pathname)) {
            dispatch({
              type: 'updateState',
              payload: {
                pageType: 'detail_page',
                recordType: record_type,
                __location__: Object.assign({}, location, forgeLoation({
                  object_api_name,
                  record_type,
                })),
                edit_mode: 'embed_modal',
              },
            });
            
            dispatch({
              type: 'fetchAll',
              payload: Object.assign({}, {
                object_api_name, 
                layout_type: 'detail_page',
                record_id: id,
                recordType: record_type,
                query: {
                  recordType: record_type,
                }
              }, !_.isNull(record)? {
                existRecord: {
                  success: true,
                  resultData: record
                }
              }: {}),
            });
          }
        });
      },
    },
  })
}