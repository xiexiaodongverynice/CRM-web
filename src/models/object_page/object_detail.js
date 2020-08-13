import { message } from 'antd';
import _ from 'lodash';
import * as layoutService from '../../services/object_page/layoutService';
import * as recordService from '../../services/object_page/recordService';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';
import * as customActionService from '../../services/customAction';
import * as approvalFlowService from '../../services/approvalFlowService';
import consoleUtil from '../../utils/consoleUtil';
import { relatedADD } from '../../components/DataRecord/common/record';

function* refresh({ select, call, put }) {
  const { record } = yield select((state) => state.detail_page);
  const recordRespond = yield call(recordService.loadRecord, {
    object_api_name: record.object_describe_name,
    record_id: record.id,
  });
  const newRecord = recordRespond.success ? recordRespond.resultData : record;
  const approvalNodes = yield call(approvalFlowService.getApprovalNodesByRecordId, {
    record_id: record.id,
  });
  const approvalNodesData = approvalNodes.success ? approvalNodes.resultData : {};
  yield put({
    type: 'updateState',
    payload: {
      record: newRecord,
      approval_info: approvalNodesData,
    },
  });
}

export default {
  state: {
    layout: null,
    describe: {},
    record: {},
    relatedLayout: {},
    relatedFieldList: {},
    loading: true,
    pageType: 'detail_page',
    approval_info: {}, // 审批节点
    recordType: 'master',
    childrenToParentRefresh: false,
  },
  reducers: {
    buildPageSuccess(
      state,
      { payload: { layout, describe, record, approval_info, recordType, childrenToParentRefresh } },
    ) {
      return {
        ...state,
        layout,
        describe,
        record,
        approval_info,
        recordType,
        childrenToParentRefresh,
      };
    },
    relatedLayout(state, { payload: { relatedLayout } }) {
      return { ...state, relatedLayout };
    },
    describe(state, { payload: { describe } }) {
      return { ...state, describe };
    },
    record(state, { payload: { record } }) {
      return { ...state, record };
    },
    buildRelatedFieldListSuccess(state, { payload: { relatedFieldList } }) {
      return { ...state, relatedFieldList };
    },
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
  effects: {
    *query({ payload }, { call, put }) {
      const data = yield call(fieldDescribeService.loadObject, payload);
      if (data) {
        yield put({
          type: 'describe',
          payload: {
            list: data.data,
            pagination: {
              current: Number(payload.page) || 1,
              pageSize: Number(payload.pageSize) || 10,
              total: data.total,
            },
          },
        });
      }
    },
    *fetchAll({ payload }, { call, put }) {
      const recordType = _.get(payload, 'recordType');
      const childrenToParentRefresh = _.get(payload, 'childrenToParentRefresh', false);
      const layout = yield call(layoutService.loadLayout, payload);
      const describe = yield call(fieldDescribeService.loadObject, payload);
      const { existRecord } = payload;
      let record;
      if (existRecord) {
        record = existRecord;
      } else {
        record = yield call(recordService.loadRecord, payload);
      }
      let approvalNodesData;
      if (describe.enable_approval_flow) {
        const approvalNodes = yield call(approvalFlowService.getApprovalNodesByRecordId, payload);
        approvalNodesData = approvalNodes.success ? approvalNodes.resultData : {};
      } else {
        approvalNodesData = {
          approval_flow: {},
          approval_nodes: [],
        };
      }

      const layoutData = layout.success ? layout.resultData : {};
      const recordData = record.success ? record.resultData : {};
      yield put({
        type: 'buildPageSuccess',
        payload: {
          layout: layoutData,
          describe,
          record: recordData,
          approval_info: approvalNodesData,
          recordType,
          childrenToParentRefresh,
        },
      });
      yield put({
        type: 'buildPageSuccess',
        payload: {
          layout: layoutData,
          describe,
          record: recordData,
          approval_info: approvalNodesData,
          recordType,
          childrenToParentRefresh: false,
        },
      });
    },
    *fetchDescribe({ payload }, { call, put }) {
      // consoleUtil.log('获取对象');
      const data = yield call(fieldDescribeService.loadObject, payload);
      const describe = data;
      // consoleUtil.log(describe);
      // return describe;
      yield put({
        type: 'describe',
        payload: { describe },
      });
    },
    *fetchRelatedLayout({ payload }, { call, put }) {
      // consoleUtil.log('获取对象');
      const relatedLayout = yield call(layoutService.loadLayout, payload);
      yield put({
        type: 'relatedLayout',
        payload: { relatedLayout },
      });
    },
    *buildRelateFieldList({ payload }, { call, put }) {
      const { refObjDescribe } = payload;
      const relatedFieldList = yield call(fieldDescribeService.loadObjectList, {
        object_api_name_list: refObjDescribe,
      });
      yield put({
        type: 'buildRelatedFieldListSuccess',
        payload: { relatedFieldList },
      });
    },
    *update({ payload }, { call, put }) {
      const { actionLayout, callBack } = payload;
      const data = yield call(recordService.updateRecord, payload);
      // consoleUtil.log(data);
      if (data.success) {
        message.success(data.message);
        callBack(actionLayout, data);
        // window.history.go(-1);
      } else {
        // throw data;
      }
    },
    *UpdateUnback({ payload }, { call, put }) {
      // 更新后不会返回上一页
      const data = yield call(recordService.updateRecord, payload);
      // const data = { success: true, message: 'success' };
      // consoleUtil.log('payload', payload);
      if (data.success) {
        message.success(data.message);
        yield put({
          type: 'record',
          payload: {
            record: data,
          },
        });
      } else {
        // throw data;
      }
    },
    *updateBatch({ payload }, { select, call, put }) {
      const { callBack } = payload;
      // const data = { success: true, message: 'success' };
      // consoleUtil.log('payload', payload);
      const data = yield call(recordService.batchUpdateRecords, payload);
      if (data.success) {
        message.success(data.message);
        if (callBack) callBack();
      } else {
        // throw data;
      }
    },

    *callCustomAction({ payload }, { select, call, put }) {
      const {
        objectApiName,
        action,
        ids,
        params,
        onSuccess,
        actionLayout,
        thiz = {},
        callBack,
      } = payload;
      const data = yield call(customActionService.executeAction, {
        objectApiName,
        action,
        ids,
        params,
      });
      if (data && data.success) {
        const { onSuccess } = actionLayout;
        if (onSuccess) {
          const { expression = _.noop } = onSuccess;
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
                ...thiz,
              },
              actionLayout,
              message,
            },
            null,
            null,
          );
        } else if (_.isFunction(callBack)) {
          callBack(data);
        } else {
          message.success('操作成功');
          // consoleUtil.log('onSuccess', onSuccess);
          // TODO 处理Action调用完成后的行为，目前默认为刷新页面
          window.location.reload();
        }
      }
    },
    *submitApproval({ payload }, { select, call, put }) {
      const data = yield call(approvalFlowService.submitApproval, payload);
      if (data.success) {
        yield refresh({ select, call, put });
        message.success('操作成功');
        // message.success('操作成功', 0.1, () => window.location.reload());
      }
    },
    *cancelApproval({ payload }, { select, call, put }) {
      const data = yield call(approvalFlowService.cancelApproval, payload);
      if (data.success) {
        yield refresh({ select, call, put });
        message.success('操作成功');
      }
    },
    *nodeOperation({ payload }, { select, call, put }) {
      const data = yield call(approvalFlowService.nodeOperation, payload);
      if (data.success) {
        yield refresh({ select, call, put });
        message.success('操作成功');
      }
    },
  },
};
