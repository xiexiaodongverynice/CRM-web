import _ from 'lodash';
import React, { Component } from 'react';
import { Col, Form, Select } from 'antd';
import { hashHistory } from 'dva/router';
import RecordFormRelatedListItem from '../RecordFormRelatedListItem';
import * as describeService from '../../../services/object_page/fieldDescribeService';
import * as crmIntlUtil from '../../../utils/crmIntlUtil';
import { hasExpression, getExpression } from '../../../utils/expressionUtils';
import { callAnotherFunc } from '../../../utils';
import { checkSectionShowable } from '../helpers/recordHelper';
import { formItemLayout } from './layout';
import RecordFormItem from '../RecordFormItem';
import { RenderBar } from '../../../components/index';
import { ACTION_EDIT_MODE } from './constants';
import dataFixer from '../../../utils/dataFixer';
import * as recordService from '../../../services/object_page/recordService';
import { processCriterias } from '../../../utils/criteriaUtil';
import { randomKey } from '../../../utils/lo';
import consoleUtil from '../../../utils/consoleUtil';

const Option = Select.Option;

/**
 * 查找表单中的相关列表
 */
export const findRelatedSectionField = ({ fieldSection, relatedListComponents }) => {
  /**
   * 获取相关列表形式的表单项
   * 数据结构如下:
   *
   * {
        "related_refs":[
            {
              "ref": "hco_hcp_list",
              "props":{
                  "fields":[]
              }
            }
          ]
    }
    */
  const fieldRelatedRefSectionFields = _.get(fieldSection, 'related_refs');
  const list = [];
  if (_.isArray(fieldRelatedRefSectionFields) && !_.isEmpty(fieldRelatedRefSectionFields)) {
    if (_.isArray(relatedListComponents) && !_.isEmpty(relatedListComponents)) {
      fieldRelatedRefSectionFields.forEach((refSectionField) => {
        const { ref: related_field_ref, props: related_field_props = {} } = refSectionField;
        const relatedListComponent = _.chain(relatedListComponents)
          .find({ related_list_name: related_field_ref })
          .value();
        if (relatedListComponent === null) {
          consoleUtil.warn('没有找到需要渲染到表单的相关列表.');
        } else {
          const realRelatedListComponent = Object.assign(
            {},
            relatedListComponent,
            related_field_props,
          );
          list.push(realRelatedListComponent);
        }
      });
    }
  }
  return list;
};

export const findRelatedSectionFieldNames = ({ fieldSection }) => {
  const fieldRelatedRefSectionFields = _.get(fieldSection, 'related_refs', []);
  return fieldRelatedRefSectionFields.map((relatedRef) => _.get(relatedRef, 'ref'));
};

export const renderRelatedListField = (props) => {
  const { name, rendered_callback } = props;
  return (
    <RecordFormRelatedListItem
      {..._.omit(props, ['name', 'rendered_callback'])}
      ref={(el) =>
        rendered_callback({
          ref: el,
          name,
        })
      }
    />
  );
};

export const FormRelatedField = Form.create()(renderRelatedListField);

/**
 * 应用相关列表到表单中
 * @param {Object} param0
 */
export const appendRelatedFieldToSection = ({
  fieldSection,
  relatedListComponents,
  formRowItems,
  parentRecord,
  pageType,
  location,
  form,
  rendered_callback = _.noop,
  isFormCreate = false,
  parentApiName,
}) => {
  const realRelatedListComponents = findRelatedSectionField({
    fieldSection,
    relatedListComponents,
  });
  realRelatedListComponents.forEach((relatedFieldComponent) => {
    const props = {
      component: relatedFieldComponent,
      refObjectDescribe: describeService.loadObject({
        object_api_name: _.get(relatedFieldComponent, 'ref_obj_describe'),
      }),
      parentRecord,
      pageType,
      location,
      form,
      name: _.get(relatedFieldComponent, 'related_list_name'),
      rendered_callback,
      isFormCreate,
      parentApiName,
    };
    formRowItems.push(
      <Col span={24}>
        {isFormCreate ? (
          <FormRelatedField {..._.omit(props, ['form'])} />
        ) : (
          renderRelatedListField(props)
        )}
      </Col>,
    );
  });
  return formRowItems;
};

/**
 * 判断action是否有权限
 * @param {Object} param0
 */
export const assertActionPrivilege = ({
  actionRefObjectApiName,
  actionOperactionCode,
  actionOperactionLabel,
}) => {
  if (
    (actionOperactionCode === 'ADD' && !fc_hasObjectPrivilege(actionRefObjectApiName, 1)) ||
    (actionOperactionCode === 'EDIT' && !fc_hasObjectPrivilege(actionRefObjectApiName, 2)) ||
    (actionOperactionCode === 'DETAIL' && !fc_hasObjectPrivilege(actionRefObjectApiName, 3)) ||
    (actionOperactionCode === 'DELETE' && !fc_hasObjectPrivilege(actionRefObjectApiName, 4)) ||
    (actionOperactionCode === 'UPDATE' && !fc_hasObjectPrivilege(actionRefObjectApiName, 2)) ||
    (actionOperactionCode === 'RELATEDADD' && !fc_hasObjectPrivilege(actionRefObjectApiName, 1))
  ) {
    consoleUtil.warn(
      '[权限不足]：',
      actionRefObjectApiName,
      actionOperactionCode,
      actionOperactionLabel,
    );
    return false;
  }
  return true;
};

/**
 * action prop's alias
 * @param {Object} param0
 */
export const getActionProps = ({
  actionLayout,
  component,
  parentRecord,
  recordData,
  baseKey,
  pageType,
}) => {
  const actionRefObjectApiName = getObjectApiNameFromAction({
    actionLayout,
    component,
  });

  const { actionOperactionCode, actionOperactionLabel, actionLabel } = getActionLabelProps({
    actionLayout,
  });

  const { actionShow, actionHidden } = getActionShowableProps({
    actionLayout,
    recordData,
    parentRecord,
    pageType,
  });

  const disabledFun = getExpression(actionLayout, 'disabled_expression', 'return false');
  const actionDisabled = callAnotherFunc(
    new Function('t', 'p', disabledFun),
    recordData,
    parentRecord,
  );

  const actionKey = `${baseKey}_${_.get(
    actionLayout,
    'action_code',
    _.get(actionLayout, 'action'),
  )}_${actionLayout.label}`;
  const actionNeedFold = _.get(actionLayout, 'need_fold', false);

  const { actionConfirmMessage, actionNeedConfirm } = getActionConfirmProps({
    actionLayout,
  });

  if (actionShow === true) {
    assertActionPrivilege({
      actionLayout,
      objectApiName: actionRefObjectApiName,
    });
  }
  return {
    actionRefObjectApiName,
    actionOperactionCode,
    actionOperactionLabel,
    actionLabel,
    actionShow,
    actionHidden,
    actionDisabled,
    actionKey,
    actionNeedFold,
    actionNeedConfirm,
    actionConfirmMessage,
  };
};

export const getPageTypePrefix = (pageType) => {
  return _.chain(pageType)
    .split('_', 1)
    .toLower()
    .value();
};

export const getActionShowableProps = ({ actionLayout, recordData, parentRecord, pageType }) => {
  const showWhen = _.chain(actionLayout)
    .get('show_when', [])
    .map((item) => _.toLower(item))
    .value();
  const hiddenWhen = _.chain(actionLayout)
    .get('hidden_when', [])
    .map((item) => _.toLower(item))
    .value();
  const page_type = getPageTypePrefix(pageType);

  const showFun = getExpression(actionLayout, 'show_expression', 'return true');
  let actionShow = callAnotherFunc(new Function('t', 'p', showFun), recordData, parentRecord);

  const hiddenFun = getExpression(actionLayout, 'hidden_expression', 'return false');
  const actionHidden = callAnotherFunc(new Function('t', 'p', hiddenFun), recordData, parentRecord);
  actionShow =
    actionShow &&
    !actionHidden &&
    (_.includes(showWhen, page_type) || _.isEmpty(showWhen)) &&
    !_.includes(hiddenWhen, page_type);

  return {
    actionShow,
    actionHidden,
  };
};

export const getActionLabelProps = ({ actionLayout }) => {
  const actionOperactionCode = _.toUpper(_.get(actionLayout, 'action'));
  const actionOperactionLabel = _.get(
    actionLayout,
    'label',
    crmIntlUtil.fmtStr(`action.${_.toLower(actionOperactionCode)}`),
  );
  const actionLabel = crmIntlUtil.fmtStr(
    _.get(actionLayout, 'action.i18n_key'),
    actionOperactionLabel,
  );
  return {
    actionLabel,
    actionOperactionLabel,
    actionOperactionCode,
  };
};

export const getActionConfirmProps = ({ actionLayout }) => {
  const { actionLabel } = getActionLabelProps({
    actionLayout,
  });
  const actionNeedConfirm = _.get(actionLayout, 'need_confirm', false);
  const actionConfirmMessage = crmIntlUtil.fmtStr(
    _.get(
      actionLayout,
      'confirm_message.i18n_key',
      `confirm_message.${_.get(actionLayout, 'action')}`,
    ),
    `${crmIntlUtil.fmtStr('message.yes_or_no', '是否')}${actionLabel}?`,
  );
  return {
    actionConfirmMessage,
    actionNeedConfirm,
  };
};

/**
 * 获取指定类型的按钮定义
 * @param {Object} param0
 */
export const getActionByTypeFromComponent = ({ component, type }) => {
  return _.chain(component)
    .result('actions', [])
    .find({
      action: type,
    })
    .value();
};

/**
 * 解析默认值表达式
 */
export const getFieldDefaultValueByLayout = ({ renderField }) => {
  const default_value = _.get(renderField, 'default_value');
  if (default_value) {
    if (_.isObject(default_value)) {
      if (hasExpression(default_value, 'expression')) {
        return callAnotherFunc(
          new Function('t', getExpression(default_value, 'expression', false)),
        );
      }
    }
    return default_value;
  }
};

/**
 * 处理fieldObject中此字段定义的默认值
 */
export const getFieldDefaultValueByFieldDescribe = ({ fieldDescribe }) => {
  const { default_value } = fieldDescribe;
  if (!_.isUndefined(default_value) && !_.isNull(default_value)) {
    return default_value;
  }
};

// TODO composeSetRecordFieldDetaultValue作用是什么，fieldApiName如何获取？
/**
 * 给record的field添加默认值
 * @param {Object} param0
 */
export const composeSetRecordFieldDetaultValue = ({ record, fieldItem, renderField }) => {
  /**
   * 处理fieldObject中此字段定义的默认值
   */
  const field_default_value_from_field_describe = getFieldDefaultValueByFieldDescribe({
    fieldDescribe: fieldItem,
  });

  if (!_.isUndefined(field_default_value_from_field_describe)) {
    // eslint-disable-next-line
    _.set(record, fieldApiName, field_default_value_from_field_describe);
  }
  /**
   * 解析默认值表达式
   */
  const default_value_from_layout = getFieldDefaultValueByLayout({
    renderField,
  });
  if (!_.isUndefined(default_value_from_layout)) {
    // eslint-disable-next-line
    _.set(record, fieldApiName, default_value_from_layout);
  }
};

/**
 * 检查field是否可显示
 * @param {Object} param0
 */
export const checkFieldShowable = ({ renderField, edit_mode, pageType, dataItem }) => {
  const pageCode = getPageTypePrefix(pageType);
  const hidden_when = _.get(renderField, 'hidden_when', []);
  let showable =
    _.indexOf(hidden_when, pageCode) < 0 && checkSectionShowable(renderField, 'web', pageCode);
  const hiddable = callAnotherFunc(
    new Function('t', getExpression(renderField, 'hidden_expression')),
    dataItem || {},
  );
  if (hiddable === true) {
    showable = false;
  }
  if (!_.isNull(edit_mode) && !_.isUndefined(edit_mode)) {
    if (!_.includes(hidden_when, edit_mode)) {
      showable = true;
    } else {
      showable = false;
    }
  }
  return showable;
};

/**
 * 检查一个field是否可用，包括权限
 * @param {Object} param0
 */
export const checkFieldAvailable = ({ fieldItem, objectApiName, fieldApiName, renderField }) => {
  if (_.isEmpty(fieldItem)) {
    consoleUtil.error('[配置错误]：字段在对象描述里面没有找到：', objectApiName, fieldApiName);
    return false;
  }
  const mergedObjectFieldDescribe = Object.assign({}, fieldItem, renderField);

  const fieldLabel = mergedObjectFieldDescribe.label;
  const hasFieldPrivilege = fc_hasFieldPrivilege(objectApiName, fieldApiName, [4]);
  if (!hasFieldPrivilege) {
    consoleUtil.warn('[权限不足]：', objectApiName, fieldApiName, fieldLabel);
    return false;
  }
  return true;
};

/**
 * 渲染表单项
 * @param {Object} param0
 */
export const renderFieldComponent = ({
  related_list_name,
  renderField,
  fieldList,
  fieldIndex,
  fieldSectionIndex,
  record = {},
  parentRecord,
  objectApiName,
  applyScene = 'form', // 默认应用到表单中
  columns = [],
  pageType,
  dispatch = _.noop,
  form,
  onChange = _.noop,
  formItemValueChange = _.noop,
  location = {},
  labelShowable = false,
}) => {
  if (fieldList && !_.isEmpty(fieldList)) {
    const fieldApiName = _.get(renderField, 'field');
    const formRowKey = `form_item_row_${fieldSectionIndex}_${fieldIndex}_${_.get(
      location,
      'query._k',
    )}`;
    const colKey = `row_${fieldSectionIndex}_${fieldIndex}`;
    let recordItemComponent = null;

    if (
      checkFieldShowable({
        renderField,
        pageType,
      })
    ) {
      if (!_.isEmpty(fieldApiName)) {
        const fieldItem = _.find(fieldList, { api_name: fieldApiName });

        const fieldAvailable = checkFieldAvailable({
          fieldItem,
          objectApiName,
          fieldApiName,
          renderField,
        });
        if (fieldAvailable === false) {
          return;
        }

        composeSetRecordFieldDetaultValue({
          record,
          fieldItem,
          renderField,
        });

        const { query } = location;
        const recordFormItemProps = {
          objectApiName,
          fieldItem,
          dataItem: record,
          parentRecord,
          renderFieldItem: renderField,
          formItemLayout,
          form,
          dispatch,
          pageType,
          query,
          onChange,
          formItemValueChange,
          location,
          namespace: related_list_name,
          labelShowable,
          isRelationModalDestroyedWhenClosed: true, // relation lookuppage 关闭后是否销毁
        };
        recordItemComponent = <RecordFormItem {...recordFormItemProps} key={formRowKey} />;
      } else if (_.endsWith(_.get(renderField, 'render_type'), '_bar')) {
        recordItemComponent = <RenderBar renderLayout={renderField} key={formRowKey} />;
      } else {
        return false;
      }

      if (applyScene === 'form') {
        const contentSpan = _.floor(24 / columns);
        return (
          <Col span={contentSpan} key={colKey}>
            {recordItemComponent}
          </Col>
        );
      } else {
        return recordItemComponent;
      }
    }
  } else {
    return crmIntlUtil.fmtStr('没有找到表单渲染字段');
  }
};

/**
 * 根据field过滤条件多fieldList重新排序
 * @param {Object} param0
 */
export const reOrderFieldListByFilterFields = ({ filterFields, fieldList }) => {
  if (!_.isEmpty(filterFields)) {
    fieldList = _.map(filterFields, (filterField) => {
      const fieldApiName =
        filterField.indexOf('__r.') > 0 ? filterField.split('__r.')[0] : filterField;
      return _.find(fieldList, { api_name: fieldApiName });
    });
  }
  return fieldList;
};

/**
 * get form fields values
 * @param {Object} param0
 */
export const getFieldsValue = ({ form }) => {
  return form.getFieldsValue();
};

export const getFieldListNames = ({ fieldList = [] }) => {
  return fieldList.map((field) => _.get(field, 'api_name'));
};

export const getFieldsValueExpect = ({ form, fieldNames }) => {
  return _.chain(
    getFieldsValue({
      form,
    }),
  )
    .pick(fieldNames)
    .value();
};

export const getFieldsValueExcept = ({ form, fieldNames }) => {
  return _.chain(
    getFieldsValue({
      form,
    }),
  )
    .omit(fieldNames)
    .value();
};

export const handlFormValidateError = ({ error }) => {
  /**
   * do nothing
   */
};

export const getColumnFieldApiNames = ({ columns = [] }) => {
  return columns.map((column) => _.get(column, 'fieldDefinition.api_name'));
};

export const getActionDefaultFieldVals = ({
  default_field_val = [],
  parentRecord,
  thizRecord,
  relatedRecord,
}) => {
  const result = {};
  default_field_val.forEach((default_field) => {
    const { val, field, field_type } = default_field;
    let caculatedVal = val;
    if (_.isEqual(field_type, 'js')) {
      // 如果配置的为js脚本
      caculatedVal = callAnotherFunc(
        new Function('t', 'p', 'r', val),
        thizRecord,
        parentRecord,
        relatedRecord,
      );
    }
    result[field] = caculatedVal;
  });
  return result;
};

export const getObjectApiNameFromAction = ({ actionLayout, component }) => {
  return _.get(actionLayout, 'ref_obj_describe') || _.get(component, 'ref_obj_describe');
};

/**
 *
 * @param {Object} param0
 */
export const getRelationApiNameFromRelatedList = ({ component }) => {
  /**
   * 以call_inventory_list为例，关联的父对象为call
   */
  const { related_list_name } = component;
  return _.chain(related_list_name)
    .split('_', 1)
    .first()
    .value();
};

export const getDataSourceMutations = ({ dataSource, originDataSource }) => {
  const originIds = originDataSource.map((source) => source.id);
  const updated = [],
    created = [],
    deleted = [];
  dataSource.forEach((source) => {
    const { id } = source;
    if (_.isUndefined(id) || _.isNull(id)) {
      created.push(source);
    } else {
      const originSource = _.find(originDataSource, {
        id,
      });
      if (originSource) {
        if (!_.isEqual(source, originSource)) {
          updated.push(source);
        }
      }
    }
  });

  originDataSource.forEach((originSource) => {
    const source = _.find(dataSource, {
      id: originSource.id,
    });
    if (!source) {
      deleted.push(originSource);
    }
  });

  return {
    created,
    updated,
    deleted,
  };
};

export const getActionEditMode = ({ actionLayout, isFormRelated = true }) => {
  return _.get(
    actionLayout,
    'edit_mode',
    isFormRelated ? ACTION_EDIT_MODE.editable_table : ACTION_EDIT_MODE.lookup_modal,
  );
};

export const rowActionAdditionalSet = ({ actionLayout, component }) => {
  const { related_list_name, ref_obj_describe } = component;
  return Object.assign(
    {},
    {
      related_list_name,
      ref_obj_describe,
    },
    actionLayout,
  );
};

export const checkoutShowableDevice = ({ layout }) => {
  const hidden_devices = _.get(layout, 'hidden_devices', []);
  const platform = 'web';
  return !_.includes(hidden_devices, platform);
};

/**
 * 判断字段内容发生变化后，是否清除section中相关列表内的数据
 *
 * 供以下组件使用:
 * RecordAdd.js
 * RecordEdit.js
 */
export const checkRelatedFieldClear = ({ renderField }) => {
  const { onChange } = renderField;
  if (onChange) {
    if (_.isObject(onChange)) {
      let { clear } = onChange;
      if (_.isString(clear)) {
        clear = [clear];
      }
      const { relatedFields } = renderField;
      const relatedFieldKeys = _.keys(relatedFields);
      clear.forEach((related_list_name) => {
        if (_.includes(relatedFieldKeys, related_list_name)) {
          const ref = relatedFields[related_list_name];
          if (ref) {
            if (_.isFunction(ref.clearInternalState)) {
              ref.clearInternalState();
            }
          }
        } else {
          consoleUtil.log(`发现无效的相关列表清除操作: ${related_list_name}`);
        }
      });
    }
  }
};

/**
 * 验证表单内容
 *
 * 供以下组件使用:
 * RecordAdd.js
 * RecordEdit.js
 * @param {Object} param0
 */
export const validForm = ({ actionLayout, form, thiz, fieldList }) => {
  const formState = _.get(thiz || this, 'state.record', {});
  let record = Object.assign(
    {},
    formState,
    getFieldsValue({
      form,
    }),
  );
  record = dataFixer({
    record,
    fieldList,
  });
  /**
   * 默认验证通过
   */
  const valid_expression = _.get(actionLayout, 'valid_expression', 'return true');
  const valid = callAnotherFunc(new Function('t', valid_expression), record);
  return valid;
};

/**
 * 根据data_source构建选项

 * @param {Number}composeCriteriasStatus //* 查询条件区分，1为data_source配置的查询条件，2为id或target_field的查询条件，3为id和data_source查询条件的并集
 */
export const buildOptionsWithDataSource = ({
  renderFieldItem,
  dataItem = {},
  composeCriteriasStatus = 1,
}) => {
  const { field } = renderFieldItem;
  const { object_api_name, target_field, need_relation_query = true } = renderFieldItem.data_source;
  const { criterias = [] } = renderFieldItem.data_source;
  /**
   * 渲染label的配置
   */
  const render_label_expression = getExpression(renderFieldItem, 'render_label_expression', false);
  const dataSourceCriterias = processCriterias(criterias, dataItem);
  let processedCriterias = dataSourceCriterias.slice();

  if (composeCriteriasStatus !== 1) {
    let fieldRecord = _.get(dataItem, field);
    if (!fieldRecord || (_.isArray(fieldRecord) && _.isEmpty(fieldRecord))) return [];
    fieldRecord = fieldRecord ? _.split(_.toString(fieldRecord), ',') : [];
    const selectedCriterias = [
      { field: target_field ? `${target_field}.id` : 'id', operator: 'in', value: fieldRecord },
    ];

    if (composeCriteriasStatus === 2) {
      processedCriterias = selectedCriterias;
    } else if (composeCriteriasStatus === 3) {
      processedCriterias = _.concat([], dataSourceCriterias, selectedCriterias);
    }
  }

  return recordService
    .queryRecordList({
      dealData: {
        needRelationQuery: need_relation_query,
        objectApiName: object_api_name,
        criterias: processedCriterias,
        joiner: 'and',
        pageNo: 1,
        pageSize: 2000,
      },
    })
    .then((response) => {
      const { result } = response;
      const options = [];
      if (Array.isArray(result)) {
        _.forEach(result, (o) => {
          let targetFieldObj = o;
          if (!_.isEmpty(target_field)) {
            targetFieldObj = _.get(o, target_field);
          }
          /**
           * 渲染label
           */
          const id_str = targetFieldObj.id.toString();
          if (!_.isUndefined(render_label_expression)) {
            if (render_label_expression.indexOf('return ') !== -1) {
              const label = callAnotherFunc(new Function('t', render_label_expression), o);
              options.push({ label, value: id_str });
            } else {
              options.push({ label: render_label_expression, value: id_str });
            }
          } else {
            options.push({ label: targetFieldObj.name, value: id_str });
          }
        });
      }
      return options;
    });
};

/**
 * 构建选项
 */
export const buildOptions = ({ options, objectApiName, fieldApiName, isIntlLabel = true }) => {
  return _.map(options, (op) => {
    let { label } = op;
    if (isIntlLabel) {
      label = crmIntlUtil.fmtStr(
        `options.${objectApiName}.${fieldApiName}.${op.value}`,
        _.get(op, 'label'),
      );
    }
    return (
      <Option key={`op-${randomKey()}`} value={op.value}>
        {label}
      </Option>
    );
  });
};

/**
 * 添加相关列表数据
 */
export const relatedADD = (action, objectApiName, record) => {
  const actionCode = _.get(action, 'action_code');
  const relatedListName = _.get(action, 'related_list_name');
  const UserId = localStorage.getItem('userId');
  let parentId = _.get(record, 'id');
  if (actionCode === 'coach_feedback') {
    // 新建辅导，取当前账号信息赋给辅导人
    parentId = UserId;
  }
  let addUrl = '/object_page/:object_api_name/add_page'.replace(':object_api_name', objectApiName);
  addUrl += `?recordType=${action.target_layout_record_type}&relatedListName=${relatedListName}&parentId=${parentId}`;
  hashHistory.push(addUrl);
};
