import modelExtend from 'dva-model-extend';
import * as addModel from './object_add';
import { matchPath } from './helper'

const forgeLoation = ({
  object_api_name,
  record_type,
}) => {
  const search = `?recordType=${record_type}`;
  return {
    $searchBase: {
      search,
      searchBase: ''
    },
    pathname: '/object_page/call/add_page',
    query: {
      recordType: record_type,
    },
    search,
    state: null,
  }
}

const ObjectAddModel = modelExtend(addModel, {
  /**
   * model配置
   */
  __location__: {},
});

export const NewObjectAddModel = ({
  object_api_name,
  record_type,
  relatedListName,
  parentId,
  parentName,
  parentApiName,
  parentRecord,
}) => {
  return modelExtend(addModel, {
    namespace: `add_page_${object_api_name}_${record_type}`,
    subscriptions: {
      setupHistory({ dispatch, history }) {
        return history.listen((location) => {
          if(matchPath(location.pathname)) {
            dispatch({
              type: 'updateState',
              payload: {
                pageType: 'add_page',
                __location__: Object.assign({}, location, forgeLoation({
                  object_api_name,
                  record_type,
                })),
                edit_mode: 'embed_modal',
              },
            });
  
            dispatch({
              type: 'fetchAll',
              payload: {
                object_api_name, 
                layout_type: 'detail_page',
                query: {
                  recordType: record_type,
                  relatedListName,
                  parentId,
                  parentName,
                  parentApiName,
                  parentRecord,
                }
              },
            });
          }
        });
      },
    },
  })
}