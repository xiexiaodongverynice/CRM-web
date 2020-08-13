/* eslint-disable no-case-declarations */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Row, Col, Table, Button, Modal, message, Menu, Dropdown, Icon } from 'antd';
import { hashHistory, Link } from 'dva/router';
import { FormattedMessage } from 'react-intl';
import RecordFilter from './recordFilter';
import PopupRecordSelector from './PopupRecordSelector';
import { DropOption, layer } from '../../components/index';
import { renderCell } from './RecordTableHelper';
import config from '../../utils/config';
import RecordOperationItem from './RecordOperationItem';
import * as recordService from '../../services/object_page/recordService';
import * as layoutService from '../../services/object_page/layoutService';
import * as describeService from '../../services/object_page/fieldDescribeService';
import styles from './List.less';
import * as CallBackUtil from '../../utils/callBackUtil';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { callAnotherFunc, request } from '../../utils';
import { checkForHiddenDevice } from '../../utils/tools';
import { hasExpression, getExpression } from '../../utils/expressionUtils';
import { processCriterias } from '../../utils/criteriaUtil';
import { recordTypeCriteria, relationCriteria } from './helpers/recordHelper';
import { assertActionPrivilege, getActionProps } from './common/record';
import consoleUtil from '../../utils/consoleUtil';
import FcModalWidget from '../FcModalWidget';

const { api } = config;
const { record, record_query, record_detail, multiple_record } = api;

const confirm = Modal.confirm;

class RelatedList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      dataSource: [],
      recordType: [],
      filterCriterias: [],
      loading: false,
      targetValueField: 'id',
      relationField: {},
      parentRecord: {},
      selectedRowKeys: [],
      selectedRecordList: [],
      pagination: {
        showSizeChanger: true,
        showQuickJumper: false,
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
        total: 0,
        defaultCurrent: 1,
        defaultPageSize: 10,
      },
      actionMenuOptions: [],
    };
  }

  componentWillMount() {
    const { component, refObjectDescribe, parentRecord, key } = this.props;
    const { api_name: objectApiName, fields: fieldDescribes } = refObjectDescribe;
    const {
      fields: fieldsInColumns,
      record_type: recordType,
      target_value_field,
      related_list_name,
      loose_relation = false,
    } = component;
    const columns = fieldsInColumns
      .map((x) => {
        const fieldName = x.field;
        const fieldDescribe = fieldDescribes.find((y) => y.api_name === x.field);
        if (_.isEmpty(fieldDescribe)) {
          consoleUtil.error('[配置错误]：字段在对象描述里面没有找到：', objectApiName, fieldName);
          return;
        }
        const merged = Object.assign({}, fieldDescribe, x);
        const hasFieldPrivilege = fc_hasFieldPrivilege(objectApiName, fieldName, [2, 4]);
        const fieldKey = `related_list_field_${merged.api_name}`;
        // fix bug,优先使用布局里面field.i18n_key，第二选择 field.<object_api_name>.<field_api_name>，最后选择label
        const fieldLabel = crmIntlUtil.fmtStr(
          _.get(merged, 'field.i18n_key'),
          crmIntlUtil.fmtStr(`field.${objectApiName}.${fieldDescribe.api_name}`, merged.label),
        );

        if (!hasFieldPrivilege) {
          consoleUtil.warn('[权限不足]：', objectApiName, fieldName);
          return false;
        }
        return {
          title: (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{fieldLabel}</div>
          ),
          dataIndex: merged.api_name,
          key: fieldKey,
          width: x.width || 'auto',
          render: (text, record, index) => {
            return renderCell(text, record, index, merged, objectApiName);
          },
        };
      })
      .filter((x) => x && x.title && x.dataIndex);

    const relationField = !loose_relation
      ? fieldDescribes.find(
          (x) => x.type === 'relation' && x.related_list_api_name === related_list_name,
        )
      : {};

    this.setState(
      {
        component,
        refObjectDescribe,
        parentRecord,
        key,
        columns,
        recordType,
        targetValueField: target_value_field || 'id', // 默认使用父记录的ID做关联
        relationField,
        looseRelation: loose_relation,
      },
      () => {
        this.buttonListItems();
        this.fetchData(true);
      },
    );
  }

  componentWillReceiveProps(nextProps, nextState) {
    // consoleUtil.log('this.props.parentRecord.version==>', this.props.parentRecord.version,this.props.childrenToParentRefresh)
    // consoleUtil.log('nextProps.parentRecord.version==>', nextProps.parentRecord.version,nextProps.childrenToParentRefresh)
    if (!nextProps.childrenToParentRefresh) {
      // 相关列表更新后主数据不需要再次更新（已经更新过了）
      if (this.props.parentRecord.version !== nextProps.parentRecord.version) {
        // 当主数据变更之后，那么相关列表也需要从新获取数据
        this.setState(
          {
            parentRecord: nextProps.parentRecord,
          },
          () => {
            this.buttonListItems();
            this.fetchData();
          },
        );
      }
    }
  }

  onCriteriasChange(values) {
    this.setState(
      {
        filterCriterias: values,
      },
      () => {
        this.fetchData();
      },
    );
  }

  onPageChange(pagination, filters, sorter) {
    this.setState(
      {
        pagination,
      },
      () => {
        this.fetchData();
      },
    );
  }

  fetchData = (firstRefresh) => {
    const {
      refObjectDescribe,
      filterCriterias,
      pagination,
      component,
      parentRecord,
      looseRelation,
    } = this.state;
    // const { default_filter_criterias } = component;
    const defaultCriterias = _.get(component, 'default_filter_criterias.criterias', []);
    const needRelationQuery = _.get(component, 'need_relation_query', true);
    const criterias = [].concat(
      this.recordTypeCriteria(),
      looseRelation ? [] : this.relationCriteria(),
      defaultCriterias,
      filterCriterias,
    );
    const processedCriterias = processCriterias(criterias, {}, parentRecord);
    const query = {
      needRelationQuery,
      joiner: 'and',
      objectApiName: refObjectDescribe.api_name,
      criterias: processedCriterias,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      order: _.get(component, 'default_sort_order', _.get(component, 'order', 'desc')),
      orderBy: _.get(component, 'default_sort_by', _.get(component, 'orderBy', 'id')),
    };
    this.setState(
      {
        loading: true,
      },
      () => {
        recordService.queryRecordList({ dealData: query }).then((response) => {
          const { resultCount } = response;
          pagination.total = resultCount;
          this.setState({
            dataSource: response.result,
            pagination,
            loading: false,
          });
          const { allRefresh } = this.props;
          if (allRefresh && !firstRefresh) {
            allRefresh();
          }
        });
      },
    );
  };

  relationCriteria() {
    const { parentRecord, targetValueField, relationField } = this.state;
    return relationCriteria({ parentRecord, targetValueField, relationField });
  }

  recordTypeCriteria = () => {
    return recordTypeCriteria(this.state.recordType);
  };

  relateModalAction = (action) => {
    let url = '';
    let selectedRecord = {};
    const { component } = this.state;
    const { parentRecord } = this.state;
    const ObjectApiName = _.get(component, 'ref_obj_describe');
    /**
     * 需要保存的对象字段
     */
    const record_fields = _.get(action, 'record_fields', []);
    /**
     * 兼容旧版本的参会人功能
     * @TODO 移除customer默认值
     */
    const actionObjectApiName = _.get(action, 'ref_obj_describe', 'customer');
    /**
     * 获取record_type，兼容活动参会人默认值
     * @TODO 移除， 直接使用target_data_record_type
     */
    const getRecordType = () => {
      if (!_.has(action, 'target_data_record_type')) {
        if (_.isEqual(actionObjectApiName, 'customer')) {
          return 'hcp';
        } else {
          return 'master';
        }
      }
      return _.get(action, 'target_data_record_type');
    };

    const recordType = _.get(action, 'target_layout_record_type', 'master');
    const LookupLayout = Promise.resolve(
      layoutService.loadLayout({
        object_api_name: actionObjectApiName,
        layout_type: 'relation_lookup_page',
        query: {
          recordType: getRecordType(),
        },
      }),
    );

    // 如果存在配置的默认过滤条件，需要进行拼接处理
    const targetFilterCriterias = _.get(action, 'target_filter_criterias');
    let filterCriterias = [];
    if (!_.isEmpty(targetFilterCriterias)) {
      const criterias = _.get(targetFilterCriterias, 'criterias');
      filterCriterias = _.map(criterias, (criteria) => {
        const field = criteria.field;
        const values = _.get(criteria, 'value');
        const operator = _.get(criteria, 'operator');

        // if (!_.isEmpty(values)) {
        //   values = _.map(values, (value) => {
        //     // 针对特定的值，进行替换
        //     if (_.eq(value, '$USER_ID$')) {
        //       const userId = localStorage.getItem('userId');
        //       return userId;
        //     } else {
        //       return value;
        //     }
        //   });
        // }

        return {
          field,
          value: values,
          operator,
        };
      });
    }

    const CustomersDescribes = Promise.resolve(
      describeService.loadObject({ object_api_name: actionObjectApiName }),
    );
    Promise.all([LookupLayout, CustomersDescribes]).then(([lookupLayout, customersDescribes]) => {
      const onRowSelect = (selectedRowKeys, records) => {
        const fieldList = customersDescribes.fields;
        if (records.length) {
          const values = [];
          const datas = {};
          const DataList = this.state.dataSource;
          const FilterList = [];
          let Records = [];
          records.map((d) => {
            DataList.map((e) => {
              if (e.customer === d.id) {
                FilterList.push(d);
              }
            });
          });
          if (!_.isEmpty(FilterList)) {
            /**
             * 重复数据错误提示，支持多语言
             */
            message.error(
              crmIntlUtil.fmtStr(
                _.get(action, 'repeat_record_alert.i18n_key'),
                _.get(action, 'repeat_record_alert', '有重复参会人,请重新选择'),
              ),
            );
            Records = _.filter(records, FilterList);
          } else {
            Records = records;
          }
          /**
           * 兼容活动参会人，旧版本的参会人布局是没有设置record_fields的
           * @TODO 移除
           */
          if (_.isEmpty(record_fields) && actionObjectApiName === 'customer') {
            /**
             * TODO 计划移除代码 <<<<<<<<<<<<<<<<<<<<<<<<<<<<
             */
            Records.map((x) => {
              const value = {
                name: x.name,
                record_type: recordType,
                event: parentRecord.id,
                customer: x.id,
                is_walkin_attendee: false,
                is_sign_in: false,
              };
              if (_.get(x, 'parent_id__r.name', false)) {
                _.set(value, 'attendee_organization', x.parent_id__r.name);
              }
              if (_.get(x, 'department', false)) {
                _.set(value, 'attendee_department', x.department);
              }
              if (_.get(x, 'admin_title', false)) {
                _.set(value, 'attendee_title', x.admin_title);
              }
              if (_.get(x, 'phone', false)) {
                _.set(value, 'attendee_phone', x.phone);
              }

              fieldList.map((y) => {
                if (y.api_name === 'admin_title') {
                  if (!y.options) return;
                  y.options.map((n) => {
                    if (x.admin_title === n.value) {
                      value.attendee_title = n.label;
                    }
                  });
                } else if (y.api_name === 'department') {
                  if (!y.options) return;
                  y.options.map((n) => {
                    if (x.department === n.value) {
                      value.attendee_department = n.label;
                    }
                  });
                }
              });
              values.push(value);
            });
            /**
             * TODO 计划移除代码 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
             */
          } else {
            Records.forEach((record) => {
              const newRecord = {};
              record_fields.forEach((record_field) => {
                if (_.has(record_field, 'field')) {
                  let record_value = null;
                  /**
                   * 解析默认值表达式
                   */
                  const default_value = _.get(record_field, 'default_value');
                  if (!_.isUndefined(default_value)) {
                    if (_.isObject(default_value)) {
                      if (hasExpression(default_value, 'expression')) {
                        record_value = callAnotherFunc(
                          new Function('r', 'p', getExpression(default_value, 'expression', false)),
                          record,
                          parentRecord,
                        );
                      } else {
                        record_value = default_value;
                      }
                    } else {
                      record_value = default_value;
                    }
                  }
                  newRecord[record_field.field] = record_value;
                }
              });
              values.push(newRecord);
            });
          }

          if (Records.length === 1) {
            _.map(values, (item, i) => {
              datas[i] = item;
              selectedRecord = datas[i];
              url = record.replace('{api_name}', ObjectApiName);
            });
          } else if (Records.length >= 1) {
            url = multiple_record.replace('{api_name}', ObjectApiName);
            const mutiplevalues = { data: values };
            selectedRecord = mutiplevalues;
          }
        }
      };

      const multiple_select = _.get(action, 'multiple_select', true);
      layer.open({
        title: crmIntlUtil.fmtStr(action.label),
        width: 870,
        content: (
          <PopupRecordSelector
            objectApiName={actionObjectApiName}
            // recordType={'hcp'}
            layout={lookupLayout}
            defaultFilterCriterias={filterCriterias}
            multipleSelect={multiple_select}
            onRowSelect={onRowSelect.bind(this)}
            parentRecord={parentRecord}
          />
        ),
        onOk: () => {
          layer.closeAll();
          const dealData = selectedRecord;
          return request({
            url,
            method: 'post',
            data: dealData,
          }).then(() => {
            this.fetchData();
          });
        },
      });
    });
    const modalActionProps = {
      component,
      onSuccess: (recordData, successData) => {
        message.success(successData.message);
        this.fetchData();
      },
      onError: (recordData, errorData) => {
        message.error(errorData.message);
        this.fetchData();
      },
    };
  };

  onAddAction = (action) => {
    const {
      component,
      refObjectDescribe,
      relationField,
      parentRecord,
      targetValueField,
    } = this.state;
    const actionRecordType = _.get(action, 'target_layout_record_type');
    const addMode = _.get(action, 'show_render_mode');
    if (addMode === 'modal') {
      this.relateModalAction(action);
    } else {
      const objectApiName = refObjectDescribe.api_name;
      let addUrl = '/object_page/:object_api_name/add_page'.replace(
        ':object_api_name',
        objectApiName,
      );
      const parentName =
        targetValueField === 'id' ? parentRecord.name : parentRecord[`${targetValueField}__r`].name;
      if (actionRecordType) {
        addUrl += `?recordType=${actionRecordType}&relatedListName=${relationField.related_list_api_name}&parentId=${parentRecord[targetValueField]}&parentName=${parentName}`;
      } else {
        addUrl += `?relatedListName=${relationField.related_list_api_name}&parentId=${parentRecord[targetValueField]}&parentName=${parentName}`;
      }

      if (_.get(action, 'need_callback', false)) {
        CallBackUtil.dealNeedCallBack({
          location: this.props.location,
        });
      }
      hashHistory.push(addUrl);
    }
  };

  relatedADD = (action) => {
    const { parentRecord } = this.state;
    const refObjDescribeApiName = _.get(action, 'ref_obj_describe');
    const relatedListName = _.get(action, 'related_list_name');
    const recordType = _.get(action, 'target_layout_record_type');
    let addUrl = '/object_page/:object_api_name/add_page'.replace(
      ':object_api_name',
      refObjDescribeApiName,
    );
    addUrl += `?recordType=${recordType}&relatedListName=${relatedListName}&parentId=${_.get(
      parentRecord,
      _.get(action, 'target_value_field', 'id'),
    )}&parentName=${_.get(parentRecord, 'name')}`;

    if (_.get(action, 'need_callback', false)) {
      CallBackUtil.dealNeedCallBack({
        location: this.props.location,
      });
    }
    hashHistory.push(addUrl);
  };

  // 选定之后，批量更新操作
  onUpdateAfterRowsSelectedAction = (actionLayout) => {
    const updateAfterRowsSelectedFun = this.onUpdateAfterRowsSelectedFun;
    const needConfirm = _.get(actionLayout, 'need_confirm', false);
    const confirmMessage = crmIntlUtil.fmtStr(
      _.get(actionLayout, 'confirm_message.i18n_key'),
      _.get(actionLayout, 'confirm_message', `请确认是否${_.get(actionLayout, 'label')}`),
    );

    if (needConfirm) {
      confirm({
        title: confirmMessage,
        onOk() {
          // consoleUtil.log('OK');
          updateAfterRowsSelectedFun(actionLayout);
        },
        onCancel() {
          // consoleUtil.log('Cancel');
        },
      });
    } else {
      updateAfterRowsSelectedFun(actionLayout);
    }
  };
  onUpdateAfterRowsSelectedFun = (actionLayout) => {
    const { onUpdateAfterRowsSelectedOk, component } = this.props;
    const selectedRowKeys = this.state.selectedRowKeys;
    const selectedRecordList = this.state.selectedRecordList;

    const defaultFieldVals = _.get(actionLayout, 'default_field_val');

    const dealData = _.map(selectedRowKeys, (recordId) => {
      const data = {};
      const record = _.find(selectedRecordList, { id: recordId });

      _.set(data, 'version', _.get(record, 'version'));
      _.set(data, 'id', _.get(record, 'id'));

      if (!_.isEmpty(defaultFieldVals)) {
        _.forEach(defaultFieldVals, (defaultFieldValLayout) => {
          const defaultVal = defaultFieldValLayout.val;
          const defaultField = defaultFieldValLayout.field;
          if (_.eq(_.get(defaultFieldValLayout, 'field_type'), 'js')) {
            // 如果配置的为js脚本
            const resultVal = callAnotherFunc(new Function('t', defaultVal), record);
            _.set(data, defaultField, resultVal);
          } else {
            _.set(data, defaultField, defaultVal);
          }
        });
      }
      return data;
    });
    // consoleUtil.log('data',dealData)
    onUpdateAfterRowsSelectedOk(dealData, component, this.onUpdateCallBack);

    // consoleUtil.log('updates rows',this.state.selectedRowKeys);
  };

  onUpdateCallBack = () => {
    this.setState({ selectedRowKeys: [], selectedRecordList: [] });
    // const objectApiName = this.props.component.object_describe_api_name;
    this.fetchData();
    this.buttonListItems();
  };

  /**
   * TODO 此处应该参考recordList.js中的实现
   */
  onModalWidgetOpen = async (actionLayout) => {
    const { parentRecord } = this.props;
    const { options } = actionLayout;
    const instance = await FcModalWidget.newInstance(
      Object.assign({}, options, {
        thizRecord: parentRecord, // 方便实施写表达式（return t.id）
        parentRecord, // 方便实施写表达式（return p.id） 同上
      }),
    );
    instance.widget.open();
  };

  _callCustomAction = (actionLayout, popupRefSeletedRowKeys = []) => {
    const needRowsSelected = _.get(actionLayout, 'need_rows_selected', true); // table有勾选功能时。根据need_rows_selected属性判断ids是否必有值 （默认true ids必有值）
    const showModel = _.get(actionLayout, 'show_modal', {}); //* 是否配有查询功能，如果有查询选择完之后在调用自定义接口，如果没有直接调用自定义接口
    const { parentRecord } = this.props;

    let selectedRowKeys = this.state.selectedRowKeys;
    if (!_.isEmpty(showModel)) {
      selectedRowKeys = popupRefSeletedRowKeys;
    }

    if (_.isEmpty(selectedRowKeys) && needRowsSelected) {
      consoleUtil.error('ids is empty');
      return;
    }
    const actionParams = _.get(actionLayout, 'params', {});
    const params = {};
    if (!_.isEmpty(actionParams)) {
      _.forEach(actionParams, (val, key) => {
        if (_.includes(val, 'return')) {
          // * values是个表达式
          const relVal = callAnotherFunc(new Function('p', val), parentRecord);
          params[key] = relVal;
        } else {
          params[key] = val;
        }
      });
    }
    const { dispatch, refObjectDescribe } = this.props;
    dispatch({
      type: 'detail_page/callCustomAction',
      payload: {
        objectApiName: refObjectDescribe.api_name,
        action: actionLayout.action,
        actionLayout,
        ids: selectedRowKeys,
        params,
      },
    });
  };

  customeLookPage = (actionLayout) => {
    const { refObjectDescribe } = this.props;
    const showModel = _.get(actionLayout, 'show_modal', {}); //* 是否配有查询功能，如果有查询选择完之后在调用自定义接口，如果没有直接调用自定义接口
    const multiple_select = _.get(showModel, 'multiple_select', true);
    const actionObjectApiName = _.get(
      actionLayout,
      'object_describe_api_name',
      refObjectDescribe.api_name,
    );
    const targetLayoutRecordType = _.get(showModel, 'target_layout_record_type', 'master');
    const filterCriterias = _.get(showModel, 'target_filter_criterias.criterias', []);

    layoutService
      .loadLayout({
        object_api_name: actionObjectApiName,
        layout_type: 'relation_lookup_page',
        query: {
          recordType: targetLayoutRecordType,
        },
      })
      .then((res) => {
        const lookupLayout = _.get(res, 'resultData', {});
        const { parentRecord } = this.state;
        layer.open({
          title: crmIntlUtil.fmtStr(_.get(lookupLayout, 'display_name', '')),
          width: 900,
          content: (
            <PopupRecordSelector
              objectApiName={actionObjectApiName}
              // recordType={'hcp'}
              ref={(el) => {
                this.popupRecordSelectorRef = el;
              }}
              layout={lookupLayout}
              defaultFilterCriterias={filterCriterias}
              multipleSelect={multiple_select}
              parentRecord={parentRecord}
            />
          ),
          onOk: () => {
            const popupRefSeletedRowKeys = this.popupRecordSelectorRef.getSelectedRowKeys();
            if (_.isEmpty(popupRefSeletedRowKeys)) {
              message.error('未选择任何数据');
              return false;
            }
            this._callCustomAction(actionLayout, popupRefSeletedRowKeys);
            layer.closeAll();
          },
        });
      });
  };

  onCallCustomAction = (actionLayout) => {
    const needConfirm = _.get(actionLayout, 'need_confirm', false);
    const confirmMessage = crmIntlUtil.fmtStr(
      _.get(actionLayout, 'confirm_message.i18n_key'),
      _.get(actionLayout, 'confirm_message', `请确认是否${_.get(actionLayout, 'label')}`),
    );

    const showModel = _.get(actionLayout, 'show_modal', {}); //* 是否配有查询功能，如果有查询选择完之后在调用自定义接口，如果没有直接调用自定义接口

    if (needConfirm) {
      confirm({
        title: confirmMessage,
        onOk() {
          this._callCustomAction(actionLayout);
        },
        onCancel() {
          // consoleUtil.log('Cancel');
        },
      });
    } else if (_.isEmpty(showModel)) {
      this._callCustomAction(actionLayout);
    } else {
      // alert(1);
      // 调用自定义查询
      this.customeLookPage(actionLayout);
    }
  };

  /**
   * TODO 支持show_when
   */
  buttonListItems = () => {
    const {
      component,
      refObjectDescribe,
      relationField,
      parentRecord,
      targetValueField,
      selectedRowKeys,
    } = this.state;
    const actionList = _.get(component, 'actions');
    const baseKey = `${refObjectDescribe.api_name}_action`;
    let actionMenuOptions = [];
    let foldMenus = [];
    _.forEach(actionList, (action) => {
      // 判断是否需要在PC上显示
      if (checkForHiddenDevice(action, 'PC')) return;

      const key = `${action.label}_${action.action}`;
      const needFold = _.get(action, 'need_fold', false);

      // 判断是否是隐藏还是禁用掉
      const disabledFun = getExpression(action, 'disabled_expression');
      const disabledValidResult = callAnotherFunc(new Function('p', disabledFun), parentRecord); // 判断是否禁用编辑按钮，默认不禁用，当满足禁用条件的时候会禁用按钮
      const hiddenFun = getExpression(action, 'hidden_expression', 'return false');
      const hiddenValidResult = callAnotherFunc(new Function('p', hiddenFun), parentRecord); // 判断是否隐藏编辑按钮，默认不隐藏，当满足隐藏条件的时候会隐藏按钮
      const showFun = getExpression(action, 'show_expression', 'return true');
      const showValidResult = callAnotherFunc(new Function('p', showFun), parentRecord); // 判断是否隐藏编辑按钮，默认不隐藏，当满足隐藏条件的时候会隐藏按钮
      const disabled_tip_title = disabledValidResult ? _.get(action, 'disabled_tip_title', '') : '';
      const needRowsSelected = _.get(action, 'need_rows_selected', true); // table有勾选功能时。根据need_rows_selected属性判断ids是否必有值 （默认true ids必有值）
      if (hiddenValidResult || !showValidResult) {
        return '';
      }

      const actionRefObjectApiName = _.get(
        action,
        'ref_obj_describe',
        _.get(component, 'ref_obj_describe'),
      );
      const actionOperactionCode = _.toUpper(_.get(action, 'action'));
      const actionOperactionLabel = _.get(
        action,
        'label',
        crmIntlUtil.fmtStr(`action.${_.toLower(actionOperactionCode)}`),
      );
      const actionLabel = crmIntlUtil.fmtStr(
        _.get(action, 'action.i18n_key'),
        actionOperactionLabel,
      );

      // 开始匹配按钮
      if (_.toUpper(action.action) === 'ADD' && fc_hasObjectPrivilege(actionRefObjectApiName, 1)) {
        if (needFold) {
          foldMenus = foldMenus.concat(
            <Menu.Item key={key} disabled={disabledValidResult}>
              <a
                disabled={disabledValidResult}
                title={disabled_tip_title}
                size="large"
                key={action.label}
                onClick={this.onAddAction.bind(null, action)}
              >
                {actionLabel}
              </a>
            </Menu.Item>,
          );
        } else {
          actionMenuOptions = actionMenuOptions.concat(
            <Button
              disabled={disabledValidResult}
              title={disabled_tip_title}
              size="large"
              style={{ padding: '0 10px', marginLeft: 8 }}
              type="primary"
              key={action.label}
              onClick={this.onAddAction.bind(null, action)}
            >
              {actionLabel}
            </Button>,
          );
        }
      } else if (
        _.toUpper(action.action) === 'RELATEDADD' &&
        fc_hasObjectPrivilege(actionRefObjectApiName, 1)
      ) {
        if (needFold) {
          foldMenus = foldMenus.concat(
            <Menu.Item key={key} disabled={disabledValidResult}>
              <a
                disabled={disabledValidResult}
                title={disabled_tip_title}
                size="large"
                onClick={this.relatedADD.bind(null, action)}
                key={`related_add_${action.label}`}
              >
                {actionLabel}
              </a>
            </Menu.Item>,
          );
        } else {
          actionMenuOptions = actionMenuOptions.concat(
            <Button
              disabled={disabledValidResult}
              title={disabled_tip_title}
              size="large"
              type={`${_.get(action, 'button_class_type', 'primary')}`}
              style={{ marginLeft: 8 }}
              onClick={this.relatedADD.bind(null, action)}
              key={`related_add_${action.label}`}
            >
              {actionLabel}
            </Button>,
          );
        }
      } else if (
        _.toUpper(action.action) === 'UPDATE_AFTER_ROWS_SELECTED' &&
        fc_hasObjectPrivilege(actionRefObjectApiName, 2)
      ) {
        const hasSelected = _.size(selectedRowKeys);
        if (needFold) {
          foldMenus = foldMenus.concat(
            <Menu.Item key={key} disabled={disabledValidResult && !hasSelected}>
              <a
                size="large"
                title={disabled_tip_title}
                disabled={disabledValidResult && !hasSelected}
                key={action.label}
                onClick={this.onUpdateAfterRowsSelectedAction.bind(this, action)}
              >
                {actionLabel}
              </a>
            </Menu.Item>,
          );
        } else {
          actionMenuOptions = actionMenuOptions.concat(
            <Button
              size="large"
              title={disabled_tip_title}
              disabled={disabledValidResult && !hasSelected}
              style={{ padding: '0 10px', marginLeft: 8 }}
              type={`${_.get(action, 'button_class_type', 'primary')}`}
              key={action.label}
              onClick={this.onUpdateAfterRowsSelectedAction.bind(this, action)}
            >
              {actionLabel}
            </Button>,
          );
        }
      } else if (_.toUpper(action.action) === 'MODAL_WIDGET') {
        if (needFold) {
          foldMenus = foldMenus.concat(
            <Menu.Item key={key} disabled={disabledValidResult}>
              <a
                size="large"
                title={disabled_tip_title}
                disabled={disabledValidResult}
                key={action.label}
                onClick={this.onModalWidgetOpen.bind(this, action)}
              >
                {actionLabel}
              </a>
            </Menu.Item>,
          );
        } else {
          actionMenuOptions = actionMenuOptions.concat(
            <Button
              size="large"
              title={disabled_tip_title}
              disabled={disabledValidResult}
              style={{ padding: '0 10px', marginLeft: 8 }}
              type={`${_.get(action, 'button_class_type', 'primary')}`}
              key={action.label}
              onClick={this.onModalWidgetOpen.bind(this, action)}
            >
              {actionLabel}
            </Button>,
          );
        }
      } else if (action.is_custom && !checkForHiddenDevice(action, 'PC')) {
        // 处理CustomAction，未选中记录时disable掉
        let hasSelected = !_.size(selectedRowKeys);
        if (!needRowsSelected) {
          // *needRowsSelected == false时不用做这个禁用判断
          hasSelected = false;
        }

        if (needFold) {
          foldMenus = foldMenus.concat(
            <Menu.Item key={key} disabled={disabledValidResult || hasSelected}>
              <a
                size="large"
                title={disabled_tip_title}
                disabled={disabledValidResult || hasSelected}
                key={`${action.label}_a`}
                onClick={this.onCallCustomAction.bind(this, action)}
              >
                {actionLabel}
              </a>
            </Menu.Item>,
          );
        } else {
          actionMenuOptions = actionMenuOptions.concat(
            <Button
              size="large"
              title={disabled_tip_title}
              disabled={disabledValidResult || hasSelected}
              style={{ padding: '0 10px', marginLeft: 8 }}
              type={`${_.get(action, 'button_class_type', 'primary')}`}
              key={`${action.label}_b`}
              onClick={this.onCallCustomAction.bind(this, action)}
            >
              {actionLabel}
            </Button>,
          );
        }
      }
    });
    if (!_.isEmpty(foldMenus)) {
      foldMenus = <Menu>{foldMenus}</Menu>;
      actionMenuOptions.push(
        <Dropdown overlay={foldMenus} key={`${baseKey}_dropdown`}>
          <Button style={{ border: 'none' }}>
            <Icon style={{ marginRight: 2 }} type="bars" />
            <Icon type="down" />
          </Button>
        </Dropdown>,
      );
    }
    this.setState({ actionMenuOptions });
    return actionMenuOptions;
  };

  actionColumn(rowActions) {
    const { dispatch, component, parentRecord, pageType } = this.props;
    const objectApiName = _.get(component, 'ref_obj_describe');

    return {
      title: crmIntlUtil.fmtStr('field.operation'),
      key: 'operation',
      width: 150,
      render: (text, recordData) => {
        let menuOptions = [];
        let foldMenus = [];
        const baseKey = `recordOperationItemProps_${recordData.id}_${recordData.version}_${_.random(
          0,
          5,
        )}`;

        for (const rowAction of rowActions) {
          const actionLayout = rowAction;

          // 判断是否需要在PC上显示
          if (checkForHiddenDevice(actionLayout, 'PC')) continue;

          const {
            actionOperactionLabel,
            actionShow,
            actionKey: key,
            actionNeedFold,
          } = getActionProps({
            actionLayout,
            component,
            recordData,
            parentRecord,
            baseKey,
            pageType,
          });
          const needHiddenFoldMenu = !actionShow; // 是否需要隐藏折叠按钮

          const recordOperationItemProps = {
            recordData,
            parentRecord,
            actionLayout: rowAction,
            objectApiName,
            location: this.props.location,
            onSuccess: (recordData, successData) => {
              // consoleUtil.log('success')
              message.success(successData.message);
              this.fetchData();
              this.buttonListItems();
            },
            onError: (recordData, errorData) => {
              message.error(errorData.message);
              this.fetchData();
              this.buttonListItems();
            },
          };

          const menuOption = (
            <RecordOperationItem {...recordOperationItemProps} dispatch={dispatch} key={key} />
          );

          if (actionNeedFold) {
            if (actionShow) {
              foldMenus = foldMenus.concat(
                <Menu.Item key={`${key}_menu_item`}>{menuOption}</Menu.Item>,
              );
            }
          } else {
            menuOptions = menuOptions.concat(menuOption);
          }
        }
        if (!_.isEmpty(foldMenus)) {
          foldMenus = <Menu>{foldMenus}</Menu>;
          menuOptions.push(
            <Dropdown overlay={foldMenus} key={`${baseKey}_dropdown`}>
              <a style={{ border: 'none' }}>
                <Icon style={{ marginLeft: 8 }} type="bars" />
                <Icon type="down" />
              </a>
            </Dropdown>,
          );
        }
        return menuOptions;
      },
    };
  }

  onSelectChange = (keys) => {
    const { dataSource } = this.state;
    const { selectedRowKeys, selectedRecordList } = this.state;
    const addKeys = _.difference(keys, selectedRowKeys);
    const removeKeys = _.difference(selectedRowKeys, keys);

    _.forEach(addKeys, (adddKey) => {
      selectedRecordList.push(_.find(dataSource, { id: adddKey }));
    });
    _.forEach(removeKeys, (removeKey) => {
      _.pullAt(selectedRecordList, _.findIndex(selectedRecordList, { id: removeKey }));
    });
    // consoleUtil.log('selectedRowKeys changed: ', keys, addKeys, removeKeys);
    // consoleUtil.log('selectedRecordList changed: ', selectedRecordList);
    this.setState({ selectedRowKeys: keys, selectedRecordList }, () => {
      this.buttonListItems();
    });
  };

  render() {
    const { component, refObjectDescribe, dataSource, columns, loading, pagination } = this.state;
    const { filter_fields = [], show_filter } = component;
    const objectApiName = _.get(component, 'ref_obj_describe');

    let showRowRelection = _.get(component, 'show_row_selection', false);
    if (!_.isBoolean(showRowRelection)) {
      showRowRelection = callAnotherFunc(new Function('t', showRowRelection), {});
    }
    const rowSelectionCheckboxProps = _.get(component, 'row_selection_checkboxProps');

    // wans 2017年11月23日23:17:23 修改，按照layout中filter的顺序进行排序
    const filterFields = component.filter_fields;
    let fieldList = refObjectDescribe.fields;
    if (!_.isEmpty(filterFields)) {
      fieldList = _.map(filterFields, (filterField) => {
        const fieldApiName =
          filterField.indexOf('__r.') > 0 ? filterField.split('__r.')[0] : filterField;
        return _.find(fieldList, { api_name: fieldApiName });
      });
    }

    const filter = {
      objectApiName,
      component,
      fieldList,
      // fieldList: refObjectDescribe.fields.filter(x => filter_fields.indexOf(x.api_name) >= 0),
    };
    const { selectedRowKeys } = this.state;
    let tableProps = {
      rowSelection: {
        selectedRowKeys,
        onChange: this.onSelectChange,
        getCheckboxProps: (record) => ({
          disabled: callAnotherFunc(
            new Function('t', _.get(rowSelectionCheckboxProps, 'disabled', 'return false')),
            record,
          ),
        }),
      },
    };

    if (!showRowRelection) {
      tableProps = _.omit(tableProps, 'rowSelection');
    }
    const rowActions = _.get(component, 'row_actions');
    const actionColumn = !_.isEmpty(rowActions) ? this.actionColumn(component.row_actions) : [];
    const paginationOptions = _.get(component, 'pagination_options', {});
    /**
     * 解析分页选项
     * 优先级 page_size > pagination_options.pageSize
     */
    const { page_size = 10 } = component;
    const finalPaginationOptions = Object.assign({}, paginationOptions, {
      defaultPageSize: page_size,
    });
    return (
      <Table
        className={styles.table}
        columns={columns.concat(actionColumn)}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        pagination={{ ...pagination, ...finalPaginationOptions }}
        onChange={this.onPageChange.bind(this)}
        {...tableProps}
        title={(record) => {
          return (
            <Row gutter={12} type="flex" justify="space-between" align="bottom">
              <Col span={24} className="text_right">
                {show_filter && (
                  <RecordFilter
                    onCriteriasChange={this.onCriteriasChange.bind(this)}
                    filter={filter}
                  />
                )}
                {/* {this.buttonListItems()} */}
                {this.state.actionMenuOptions}
              </Col>
            </Row>
          );
        }}
      />
    );
  }
}

export default RelatedList;
