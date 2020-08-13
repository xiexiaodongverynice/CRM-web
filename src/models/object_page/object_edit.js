import { message } from 'antd';
import _ from 'lodash';
import * as layoutService from '../../services/object_page/layoutService';
import * as recordService from '../../services/object_page/recordService';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';
import { renderCell } from '../../components/DataRecord/RecordTableHelper';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';
import { getDcrValueText } from '../../utils/dcrUtil';
import { isEmptyData } from '../../utils/index';

export default {
  namespace: 'edit_page',
  state: {
    layout: null,
    describe: {},
    record: {},
    relationLookupLayoutList: [],
    loading: true,
    pageType: 'edit_page',
  },
  reducers: {
    buildPageSuccess(state, { payload: { layout, describe, record } }) {
      return {
        ...state, layout, describe, record,
      };
    },
    buildRelationLookupLayoutListSuccess(state, { payload: { relationLookupLayoutList } }) {
      return { ...state, relationLookupLayoutList };
    },
    updateRecord(state, { payload: { record } }) {
      return { ...state, record };
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
      // consoleUtil.log('获取布局数据');
      const layout = yield call(layoutService.loadLayout, payload);
      const describe = yield call(fieldDescribeService.loadObject, payload);
      const { existRecord } = payload;
      let record;
      if(existRecord) {
        record = existRecord;
      }else {
        record  = yield call(recordService.loadRecord, payload);
      }
      const layoutData = layout.success ? layout.resultData : {};
      const recordData = record.success ? record.resultData : {};
      yield put({
        type: 'buildPageSuccess',
        payload: { layout: layoutData, describe, record: recordData },
      });
    },
    *update({ payload }, { select, call, put }) {
      const data = yield call(recordService.updateRecord, payload);
      const {
        actionLayout, callBack, dealData, record, object_api_name: objectApiName, newRecord, namespace,
      } = payload;
      // consoleUtil.log(data);
      if (data.success) {
        // yield put({ type: 'saveDCR', payload });
        /**
         * 此处指定model命名空间
         */
        const layout = yield select(({ [namespace]: edit_page }) => edit_page.layout);
        const describe = yield select(({ [namespace]: edit_page }) => edit_page.describe);
        const mergedRecord = Object.assign({}, data, newRecord);
        yield put({ type: 'updateRecord', payload: { record: data } });
        yield put({
          type: 'saveDCR',
          payload: {
            record, // 老对象
            dealData: data, // 新对象,可能会包含去除了dcr字段的对象
            newRecord: mergedRecord, // 完整的新对象
            layout,
            describe,
            objectApiName,
          },
        });

        message.success(data.message);
        callBack(actionLayout, data);
      } else {
        // throw data;
      }
    },
    *saveDCR({ payload }, { select, call, put }) {
      const {
        record,
        dealData,
        newRecord,
        layout,
        describe,
        objectApiName,
      } = payload;

      const needDcr = _.get(record, 'id') ? window.DCR_EDIT_CUSTOMER_RULE === '0' : window.DCR_CREATE_CUSTOMER_RULE === '0'

      if (_.get(layout, 'is_dcr', false) && needDcr) {
        const dcrData = {
          customer: _.get(record, 'id'),
          parent_customer: _.get(record, 'parent_id'),
          type: 2,
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
            const fieldDescribe = _.find(fieldsDescribe, { api_name: fieldApiName });
            const fieldType = _.get(fieldDescribe, 'type');
            const isDcr = _.get(dcrField, 'is_dcr', false);
            const oldValue = _.get(record, fieldApiName);
            const newValue = _.get(newRecord, fieldApiName);

            // 24/02/2018 - TAG: 临时解决方案
            // 24/02/2018 - TAG: parent_id 的新值类型为字符串，旧值为数字
            // 24/02/2018 - TAG: TODO 王帅
            // 27/03/2018 wans 通过判断fild type 是否为relation来解决数字型和字符型的判断对比
            let isPass;
            if (fieldType === 'relation') {
              isPass = isDcr && !_.eq(`${oldValue}`, `${newValue}`);
            } else {
              isPass = isDcr && !_.eq(oldValue, newValue);
            }
            if (isEmptyData(oldValue) && isEmptyData(newValue)) {
              isPass = false;
            }

            if (isPass) { // 是dcr字段  &&  新值旧值不一样
              // const fieldName = _.get(fieldDescribe, 'label');
              const fieldName = crmIntlUtil.fmtStr(_.get(fieldDescribe, 'field.i18n_key'), crmIntlUtil.fmtStr(`field.${objectApiName}.${fieldDescribe.api_name}`, _.get(fieldDescribe, 'label')));
              const newValueCell = renderCell(newValue, newRecord, 0, fieldDescribe, objectApiName);
              const newValueText = getDcrValueText(newValueCell, fieldDescribe);
              const oldValueCell = renderCell(oldValue, record, 0, fieldDescribe, objectApiName);
              const oldValueText = getDcrValueText(oldValueCell, fieldDescribe);
              dcrDetailList.push({
                field_api_name: fieldApiName,
                field_name: fieldName,
                old_value: oldValueText,
                new_value: newValueText,
                old_data: oldValue,
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

        if (!_.isEmpty(dcrDetailList)) {
          yield call(recordService.create, { dealData: dcrBodyData, object_api_name: 'dcr' });
        }

        // consoleUtil.log('end save dcr');
      }
    },
    /**
     * 不知道这段代码有什么用
     */
    *buildRelationLookupLayoutList({ payload }, { select, call, put }) {
      const relationLookupLayout = yield call(layoutService.loadLayout, payload);

      const relationLookupLayoutList = yield select(({ edit_page }) => edit_page.relationLookupLayoutList);

      _.update(relationLookupLayoutList, payload.object_api_name, (n) => { return relationLookupLayout; });

      yield put({
        type: 'buildRelationLookupLayoutListSuccess',
        payload: { relationLookupLayoutList },
      });
    },
  },
};
