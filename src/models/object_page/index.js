import { message } from 'antd';
import pathToRegexp from 'path-to-regexp';
import _ from 'lodash';
import { parse } from 'qs';
import { FormattedMessage } from 'react-intl';
import * as layoutService from '../../services/object_page/layoutService';
import * as recordService from '../../services/object_page/recordService';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { processCriterias } from '../../utils/criteriaUtil';
import * as customActionService from '../../services/customAction';
import * as approvalFlowService from '../../services/approvalFlowService';
import consoleUtil from '../../utils/consoleUtil';
import { relatedADD } from '../../components/DataRecord/common/record';

const matchPath = (pathname) => {
  return pathToRegexp('/object_page/:object_api_name/index_page').exec(pathname);
};

export default {
  namespace: 'object_page',
  state: {
    layoutData: null,
    describeData: {},
    loading: true,
    currentItem: {},
    recordList: [],
    default_view_index: 0,
    selectorExtenderFilterCriterias: {},
    selectorExtenderFilterTerritoryCriterias: {}, // 扩展组件储存岗位查询条件
    filterCriterias: [],
    viewCriterias: [],
    approvalCriterias: [],
    territoryCriterias: [],
    pagination: {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total) => (
        <FormattedMessage
          id="show total"
          defaultMessage="共 {total} 条"
          values={{
            total,
          }}
        />
      ),
      current: 1,
      total: null,
    },
  },
  reducers: {
    buildPageSuccess(
      state,
      {
        payload: {
          layoutData,
          describeData,
          viewCriterias,
          approvalCriterias,
          territoryCriterias,
          default_view_index,
        },
      },
    ) {
      return {
        ...state,
        layoutData,
        describeData,
        viewCriterias,
        approvalCriterias,
        territoryCriterias,
        default_view_index,
      };
    },
    queryRecordListSuccess(state, action) {
      const { recordList, pagination } = action.payload;
      return {
        ...state,
        recordList,
        pagination: {
          ...state.pagination,
          ...pagination,
        },
      };
    },

    setSelectorFilterCriterias(
      state,
      { payload: { selectorExtenderFilterCriterias, selectorExtenderFilterTerritoryCriterias } },
    ) {
      return {
        ...state,
        selectorExtenderFilterCriterias,
        selectorExtenderFilterTerritoryCriterias,
      };
    },
    setFilterCriterias(state, { payload: { filterCriterias } }) {
      // consoleUtil.log('object_page > setFilterCriterias', filterCriterias);
      return {
        ...state,
        filterCriterias,
      };
    },
    setViewCriterias(
      state,
      { payload: { viewCriterias, approvalCriterias = [], territoryCriterias = [] } },
    ) {
      // consoleUtil.log('object_page > setViewCriterias', viewCriterias);
      return {
        ...state,
        viewCriterias: processCriterias(viewCriterias),
        approvalCriterias: processCriterias(approvalCriterias),
        territoryCriterias: processCriterias(territoryCriterias),
      };
    },

    resetFilterAndPagination(state, { payload }) {
      return {
        ...state,
        filterCriterias: [],
        selectorExtenderFilterCriterias: {},
        selectorExtenderFilterTerritoryCriterias: {},
        pagination: {
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => (
            <FormattedMessage
              id="show total"
              defaultMessage="共 {total} 条"
              values={{
                total,
              }}
            />
          ),
          // showTotal: total => `共 ${total} 条`,
          current: 1,
          total: null,
        },
      };
    },
    del(state, { payload }) {
      const { recordList } = state;
      const current = payload.id;
      const newRecordList = recordList.filter((item) => item.id !== current);
      return { ...state, recordList: newRecordList };
    },
    updateState(state, { payload }) {
      return {
        state,
        ...payload,
      };
    },
    modify(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
  effects: {
    *queryRecordList({ payload }, { call, put, select }) {
      // todo 应当中这里使用select 从state中读取各种条件，进行组装，而不是直接使用payload中的dealData
      // const viewCriterias = yield select(state => state.viewCriterias);
      const state = yield select((state) => state.object_page);
      const {
        approvalCriterias,
        territoryCriterias,
        selectorExtenderFilterTerritoryCriterias,
      } = state;
      const dealData = {
        ...payload.dealData,
        approvalCriterias,
        territoryCriterias: [
          ...territoryCriterias,
          ..._.chain(selectorExtenderFilterTerritoryCriterias)
            .values()
            .flattenDeep()
            .value(),
        ],
      };
      const data = yield call(
        recordService.queryRecordList,
        Object.assign({}, payload, {
          dealData,
        }),
      );
      if (data) {
        // consoleUtil.log('data.result',data.result)
        yield put({
          type: 'queryRecordListSuccess',
          payload: {
            recordList: data.result,
            pagination: {
              current: Number(payload.dealData.pageNo) || 1,
              pageSize: Number(payload.dealData.pageSize) || 10,
              total: data.resultCount,
            },
          },
        });
      }
    },
    *buildPageData({ payload }, { call, put }) {
      const response = yield call(layoutService.loadLayout, payload);
      const layoutData = _.get(response, 'resultData');
      if (!_.isEmpty(layoutData)) {
        const component_0 = _.get(layoutData, 'containers[0].components[0]');
        const apiName = _.get(component_0, 'object_describe_api_name');
        const views = _.get(component_0, 'views');
        const default_view_index = _.get(payload, 'query.default_view_index', '0');
        const view_0 = _.get(views, `[${default_view_index}]`); // 使用默认的view，优先使用url参数中default_view_index
        const viewCriterias = processCriterias(_.get(view_0, 'criterias', []));
        const approvalCriterias = processCriterias(_.get(view_0, 'approval_criterias', []));
        const territoryCriterias = processCriterias(_.get(view_0, 'territory_criterias', []));
        const describeData = yield call(fieldDescribeService.loadObject, {
          object_api_name: apiName,
        });
        yield put({
          type: 'buildPageSuccess',
          payload: {
            layoutData,
            describeData,
            viewCriterias,
            approvalCriterias,
            territoryCriterias,
            default_view_index,
          },
        });
      } else {
        yield put({
          type: 'buildPageSuccess',
          payload: { layoutData },
        });
      }
    },
    *create({ payload }, { call, put }) {
      const data = yield call(recordService.create, payload);
      if (data.success) {
        message.success(data.message);
        // yield put({ type: 'query' });
      } else {
        // throw data;
      }
    },
    *update({ payload }, { select, call, put }) {
      // consoleUtil.log(recordList,pagination);
      const data = yield call(recordService.updateRecord, payload);
      // consoleUtil.log(call,payload,data);
      if (data.success) {
        message.success(data.message);

        yield put({
          type: 'queryRecordList',
          // payload: { object_api_name: payload.object_api_name},
          payload: {
            dealData: {
              objectApiName: payload.object_api_name,
              criterias: [
                // { field: 'profiles', operator: 'contains', value: ['$$CurrentProfileId$$'] },
              ],
            },
          },
        });
      } else {
        // throw data;
      }
    },
    *updateBatch({ payload }, { select, call, put }) {
      const { callBack } = payload;
      const data = yield call(recordService.batchUpdateRecords, payload);
      if (data.success) {
        message.success(data.message);
        callBack();
      } else {
        // throw data;
      }
    },
    *delete({ payload }, { call, put }) {
      const data = yield call(recordService.deleteRecord, payload);
      if (data.success) {
        message.success(data.message);
        yield put({
          type: 'del',
          payload: {
            object_api_name: payload.object_api_name,
            layout_type: 'index_page',
            id: payload.id,
          },
        });
      } else {
        // throw data;
      }
    },
    *operationSuccess({ payload }, { put }) {
      yield put({
        type: 'modify',
        payload,
      });
    },
    /**
     * 根据ID数组和ApiName获取数据并更新state.recordList中对应的record
     */
    *syncRecords({ payload }, { put, call, select }) {
      const { ids, objectApiName } = payload;
      if (_.isEmpty(ids) || _.isEmpty(objectApiName)) {
        return;
      }
      const data = yield call(recordService.queryRecordList, {
        dealData: {
          objectApiName,
          criterias: [{ field: 'id', operator: 'in', value: [].concat(ids) }],
          joiner: 'and',
        },
      });

      if (data) {
        const { result } = data;
        const recordList = yield select((state) => state.object_page.recordList);
        let i = 0;
        for (; i < recordList.length; i++) {
          const { id } = recordList[i];
          const newValue = _.find(result, (x) => x.id === id);
          if (newValue) {
            recordList[i] = newValue;
          }
        }
        yield put({
          type: 'modify',
          payload: {
            recordList,
          },
        });
      }
    },

    *approvalAccept({ payload }, { put, call, select }) {
      const { objectApiName, node_id } = payload;
      consoleUtil.log(payload);
      const resp = yield call(approvalFlowService.nodeOperation, payload);
      consoleUtil.log(resp);
      if (resp.success) {
        message.success(resp.message);
        yield put({
          type: 'syncRecords',
          // payload: { object_api_name: payload.object_api_name},
          payload: {
            objectApiName,
            ids: [node_id],
          },
        });
      }
    },

    /**
     * 批量审批
     * @param payload
     * @param put
     * @param call
     * @param select
     * @returns {IterableIterator<*>}
     */
    *approvalBatchOperation({ payload }, { put, call, select }) {
      const { callBack } = payload;
      const data = yield call(approvalFlowService.nodeBatchOperation, payload);
      if (data.success) {
        const { success, fail, count } = _.get(data, 'resultData');
        const resultsAnalysisMessage = crmIntlUtil.fmtWithTemplate(
          'message.approval_result_message',
          '{{message}}，共：{{count}}条，成功{{success}}条，失败{{failed}}条',
          { count, success: _.size(success), failed: _.size(fail), message: data.message },
        );
        message.success(resultsAnalysisMessage);
        if (callBack) callBack();
      } else {
        // throw data;
      }
    },

    *callCustomAction({ payload, callback }, { put, call, select }) {
      const { objectApiName, actionLayout, ids } = payload;

      // if (_.isEmpty(ids)) {
      //   consoleUtil.error('ids is empty');
      //   return;
      // }
      const describe = yield select((state) => state.object_page.describeData);
      const { actions } = describe;
      const actionDef = actions[actionLayout.action];
      if (!actionDef) {
        message.error(`未定义的Action${actionLayout.action}`);
        return;
      }

      const data = yield call(customActionService.executeAction, {
        objectApiName,
        ids,
        action: actionLayout.action,
        params: Object.assign({}, actionDef.params, actionLayout.params),
      });

      if (data && data.success) {
        const { onSuccess } = actionLayout;
        if (onSuccess) {
          if (callback) callback();
          const { expression = _.noop } = onSuccess;
          /**
           * thiz中的方法请自行扩展
           */
          new Function('__web__', '__phone__', '__pad__', expression)(
            {
              thiz: {
                relatedADD: (actionLayout) => {
                  /**
                   * 添加相关列表数据
                   */
                  relatedADD(actionLayout, _.get(actionLayout, 'ref_obj_describe'), {
                    id: _.first(ids),
                  });
                },
              },
              actionLayout,
              message,
            },
            null,
            null,
          );
        } else {
          message.success('操作成功');
          // TODO 这里应该根据actionLayout配置的执行Action后的操作来决定下一步动作，目前默认采取更新数据的机制
          yield put({
            type: 'syncRecords',
            // payload: { object_api_name: payload.object_api_name},
            payload: {
              objectApiName,
              ids,
            },
          });
        }
      }
    },
  },
  subscriptions: {
    setupHistory({ dispatch, history }) {
      return history.listen((location) => {
        // window.CALLBACK_FROM_STORE = [];
        if (matchPath(location.pathname)) {
          dispatch({
            type: 'updateState',
            payload: {
              pageType: 'index_page',
              // locationPathname: location.pathname,
              // locationQuery: parse(location.search),
              layoutData: null,
              describeData: {},
              loading: true,
              currentItem: {},
              recordList: [],
              selectorExtenderFilterCriterias: {},
              filterCriterias: [],
              pagination: {
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => (
                  <FormattedMessage
                    id="show total"
                    defaultMessage="共 {total} 条"
                    values={{
                      total,
                    }}
                  />
                ),
                current: 1,
                total: null,
              },
              lastSuccessOperation: {},
            },
          });
        }
      });
    },
    // 路由监听器
    setup({ dispatch, history }) {
      // state.layoutData = null;
      return history.listen(({ pathname, query }) => {
        const match = matchPath(pathname);
        if (match) {
          window.CALLBACK_FROM_STORE = [];
          dispatch({ type: 'resetFilterAndPagination', payload: {} });
          dispatch({
            type: 'buildPageData',
            payload: { object_api_name: match[1], layout_type: 'index_page', query },
          });
          // dispatch({ type: 'fetchDescribe', payload: {object_api_name : match[1]}});
        }
      });
    },
  },
};
