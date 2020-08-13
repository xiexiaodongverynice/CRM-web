import { message } from 'antd'
import _ from 'lodash';
import { routerRedux } from 'dva/router';
import * as layoutService from '../../services/object_page/layoutService';
import * as recordService from '../../services/object_page/recordService';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';
import { renderCell } from '../../components/DataRecord/RecordTableHelper';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';
import { getDcrValueText } from '../../utils/dcrUtil';
import { isEmptyData } from '../../utils/index';

export default {
  state: {
    layout: null,
    describe: {},
    record: {},
    relationLookupLayoutList: {},
    pageType: 'add_page',

    /**
     * blow nothing to use
     */
    locationPathname: '',
    locationQuery: {},
  },
  reducers: {
    buildPageSuccess(state, { payload: { layout, describe, record } }) {
      return {
        ...state, layout, describe, record,
      };
    },
    buildRelationLookupListSuccess(state, { payload: { relationLookupLayoutList } }) {
      return { ...state, relationLookupLayoutList };
    },
    updateState(state, { payload }) {
      return {
        state,
        ...payload,
      };
    },
  },
  effects: {
    *fetchAll({ payload }, { call, put }) {
      const layoutResponse = yield call(layoutService.loadLayout, payload);
      const describe = yield call(fieldDescribeService.loadObject, payload);

      const layoutData = _.get(layoutResponse, 'resultData', {});
      const record = {};
      /**
       * relatedListName === parentApiName,
       */
      const {
        relatedListName, parentId, parentName, recordType, parentApiName, parentRecord
      } = payload.query;

      if (!_.isEmpty(relatedListName) && !_.isEmpty(parentId)) {
        if (_.isEmpty(parentName)) {
          // parentName=parentId;
        }

        const allObjectDescribeList = yield call(fieldDescribeService.loadAllObject, {});
        const relatedFieldList = [];
        const objectDescibeList = _.get(allObjectDescribeList, 'items');
        const refObjectDescribe = _.find(objectDescibeList, { api_name: payload.object_api_name });
        const refObjectFieldDescribe = _.find(_.get(refObjectDescribe, 'fields'), { related_list_api_name: relatedListName });

        const { api_name, target_object_api_name } = refObjectFieldDescribe;

        _.set(record, api_name, parentId);
        _.set(record, `${api_name}__r.id`, parentId);
        _.set(record, `${api_name}__r.name`, parentName);

        /**
         * 请求下parent object 的数据
         */
        const parentObjectRecord = yield call(recordService.loadRecord, {
          object_api_name: target_object_api_name,
          record_id: parentId
        })
        if(parentObjectRecord) {
          _.set(record, `${api_name}__r`, parentObjectRecord)
        }

      }

      if (!_.isEmpty(recordType)) {
        _.set(record, 'record_type', recordType);
      }

      /**
       * 用于新建数据时，关联的上级数据还没有创建时，应用场景通常为模式窗口添加数据
       *
       */
      if(parentApiName && parentRecord) {
        _.set(record, `${parentApiName}__r`, parentRecord);
      }

      // consoleUtil.log('record',record);
      yield put({
        type: 'buildPageSuccess',
        payload: { layout: layoutData, describe, record },
      });
    },
    *create({ payload }, { select, call, put }) {
      const data = yield call(recordService.create, payload);
      const objectApiName = payload.object_api_name;
      const { actionLayout, callBack, namespace } = payload;
      if (data.success) {
        const layout = yield select(({ [namespace]: add_page }) => add_page.layout);
        const describe = yield select(({ [namespace]: add_page }) => add_page.describe);
        yield put({
          type: 'saveDCR',
          payload: {
            record: _.get(data, 'resultData'),
            layout,
            describe,
            objectApiName,
          },
        });
        // 2018-02-05 14点52分 后台处理这块内容，去掉
        // if(objectApiName === 'customer'){
        //   yield put({ type: 'App/loadTerritoryCustomerIds' });
        // }
        message.success(data.message);
        callBack(actionLayout, data);
      } else {
        // throw data;
      }
    },

    *saveDCR({ payload }, { select, call, put }) {
      const {
        record,
        layout,
        describe,
        objectApiName,
      } = payload;

      const needDcr = window.DCR_CREATE_CUSTOMER_RULE === '0'
      if (_.get(layout, 'is_dcr', false) && needDcr) {
        // const {dealData,}=payload;
        const dcrData = {
          customer: _.get(record, 'id'),
          parent_customer: _.get(record, 'parent_id'),
          type: 1,
          status: 1,
        };
        const dcrDetailList = [];
        const detailFormComponent = _.find(_.get(layout, 'containers[0].components'), { type: 'detail_form' });
        const fieldSections = _.get(detailFormComponent, 'field_sections');

        const fieldsDescribe = _.get(describe, 'fields');

        _.forEach(fieldSections, (fieldSection) => {
          const fields = _.get(fieldSection, 'fields');
          const dcrFields = _.filter(fields, 'is_dcr');

          _.forEach(dcrFields, (dcrField) => {
            const fieldApiName = _.get(dcrField, 'field');
            const isDcr = _.get(dcrField, 'is_dcr', false);
            // const oldValue = _.get(record,fieldApiName);
            const newValue = _.get(record, fieldApiName);
            if (isDcr && !isEmptyData(newValue)) { // 是dcr字段
              const fieldDescribe = _.find(fieldsDescribe, { api_name: fieldApiName });
              const fieldName = crmIntlUtil.fmtStr(_.get(fieldDescribe, 'field.i18n_key'), crmIntlUtil.fmtStr(`field.${objectApiName}.${fieldDescribe.api_name}`, _.get(fieldDescribe, 'label')));
              // const fieldName = _.get(fieldDescribe, 'label');
              const newValueCell = renderCell(newValue, record, 0, fieldDescribe, objectApiName);
              const newValueText = getDcrValueText(newValueCell, fieldDescribe);
              dcrDetailList.push({
                field_api_name: fieldApiName,
                field_name: fieldName,
                old_value: '',
                new_value: newValueText,
                old_data: '',
                new_data: newValue,
                status: 1,
              });
            }
          });
        });

        const dcrBodyData = {
          ...dcrData,
          _cascade: {
            create: {
              dcr_dcr_detail_list:
              dcrDetailList,
            },
          },
        };

        if (!_.isEmpty(dcrBodyData)) {
          yield call(recordService.create, { dealData: dcrBodyData, object_api_name: 'dcr' });
        }

        // consoleUtil.log('end save dcr');
      }
    },
    /**
     * 不知道这段代码有什么用
     */
    *buildRelationLookupLayoutList({ payload }, { select, call, put }) {
      // consoleUtil.log('buildRelationLookupLayoutList', payload.object_api_name);
      const relationLookupLayout = yield call(layoutService.loadLayout, payload);
      const relationLookupLayoutList = yield select(({ add_page }) => add_page.relationLookupLayoutList);
      _.update(relationLookupLayoutList, payload.object_api_name, (n) => { return relationLookupLayout; });// 将新的对象布局放入对象布局数组里面
      yield put({
        type: 'buildRelationLookupListSuccess',
        payload: { relationLookupLayoutList },
      });
    },
  },
}
