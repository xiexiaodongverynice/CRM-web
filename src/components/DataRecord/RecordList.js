import React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import XLSX from 'xlsx';
import { Modal, Button, Row, Col, Table, message, Menu, Dropdown, Icon, Select, Input } from 'antd';

import { hashHistory, Link } from 'dva/router';
import classnames from 'classnames';

import { SelectorFilterExtender, layer } from '../../components/index';
import styles from './List.less';
import RecordFilter from './recordFilter';
import RecordOperationItem from './RecordOperationItem';
import * as recordService from '../../services/object_page/recordService';
import { renderCell, getCellContent } from './RecordTableHelper';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { processCriterias } from '../../utils/criteriaUtil';
import { callAnotherFunc } from '../../utils';
import { getExpression } from '../../utils/expressionUtils';
import { checkForHiddenDevice } from '../../utils/tools';
import consoleUtil from '../../utils/consoleUtil';
import FcModalWidget from '../FcModalWidget';
import { pickCriteriasFromSelectorExtender } from '../common/criterias';
import { relatedADD } from './common/record';
import PopupRecordSelector from './PopupRecordSelector';
import * as layoutService from '../../services/object_page/layoutService';
import * as customActionService from '../../services/customAction';

const confirm = Modal.confirm;
const Option = Select.Option;
class RecordList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRecordList: [],
      IndexViewSelectName: '',
      showBatchRejectDCRModal: false,
      DCRTextareaValue: '',
      currentRejectDCRAction: {},
    };
  }

  componentWillMount() {
    const { component, describeData, recordList, dispatch, pagination } = this.props;
    const showFields = component.fields;
    const rowActions = component.row_actions;
    const componentType = component.type;
    let objectApiName = null;
    if (componentType === 'record_list') {
      objectApiName = component.object_describe_api_name;
    }

    let columnsData = [];
    // 处理fileds
    const fields = describeData.fields;
    // const objectApiName = describeData.api_name;
    if (!_.isEmpty(showFields)) {
      // const showFieldList = _.map(showFields, _.property('field'));
      if (!_.isEmpty(fields)) {
        for (const showField of showFields) {
          const fieldName = showField.field;
          const hsdFieldPrivailege = fc_hasFieldPrivilege(objectApiName, fieldName, [2, 4]);
          if (!hsdFieldPrivailege) {
            consoleUtil.warn('[权限不足]：', objectApiName, fieldName);
            continue;
          }
          const renderType = showField.render_type;
          // consoleUtil.log(renderType);
          const fieldDescribe = _.find(fields, { api_name: fieldName });
          if (!_.isEmpty(fieldDescribe)) {
            // const fieldDescribe = fields[fieldIndex];
            const fieldKey = `record_list_field_${fieldDescribe.api_name}`;
            const merged = Object.assign({}, fieldDescribe, showField);
            // fix bug,优先使用布局里面field.i18n_key，第二选择 field.<object_api_name>.<field_api_name>，最后选择label
            const fieldLabel = crmIntlUtil.fmtStr(
              _.get(merged, 'field.i18n_key'),
              crmIntlUtil.fmtStr(`field.${objectApiName}.${fieldDescribe.api_name}`, merged.label),
            );
            const column = {
              title: (
                <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
                  <strong>{fieldLabel}</strong>
                </div>
              ),
              dataIndex: fieldDescribe.api_name,
              key: fieldKey,
              sorter: false, // 2017-09-30 16:25:13 by K 暂时隐藏
              width: _.get(merged, 'width', 80),
              sortOrder: true,
              render: (text, record, index) => {
                // consoleUtil.log('objectApiName', text,record,index);
                return renderCell(text, record, index, merged, objectApiName);
              },
            };
            columnsData = columnsData.concat(column);
          }
        }
      }
    }

    if (!_.isEmpty(rowActions)) {
      // 处理row_actions
      const operation = {
        title: crmIntlUtil.fmtStr('field.operation'),
        key: 'operation',
        width: 100,
        render: (text, recordData) => {
          let menuOptions = [];
          let foldMenus = [];
          const baseKey = `recordOperationItemProps_${recordData.id}_${
            recordData.version
          }_${_.random(0, 5)}`;
          let needHiddenFoldMenu = false; // 是否需要隐藏折叠按钮
          for (const rowAction of rowActions) {
            const actionLayout = rowAction;

            // 判断是否需要在PC上显示
            if (checkForHiddenDevice(actionLayout, 'PC')) continue;

            const actionRefObjectApiName = _.get(actionLayout, 'ref_obj_describe', objectApiName);
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
            const showFun = getExpression(actionLayout, 'show_expression', 'return true');
            const needShowOperaction = callAnotherFunc(new Function('t', showFun), recordData);
            if (needShowOperaction === true) {
              if (
                actionOperactionCode === 'ADD' &&
                !fc_hasObjectPrivilege(actionRefObjectApiName, 1)
              ) {
                consoleUtil.warn(
                  '[权限不足]：',
                  actionRefObjectApiName,
                  actionOperactionCode,
                  actionOperactionLabel,
                );
              } else if (
                actionOperactionCode === 'EDIT' &&
                !fc_hasObjectPrivilege(actionRefObjectApiName, 2)
              ) {
                consoleUtil.warn(
                  '[权限不足]：',
                  actionRefObjectApiName,
                  actionOperactionCode,
                  actionOperactionLabel,
                );
              } else if (
                actionOperactionCode === 'DETAIL' &&
                !fc_hasObjectPrivilege(actionRefObjectApiName, 3)
              ) {
                consoleUtil.warn(
                  '[权限不足]：',
                  actionRefObjectApiName,
                  actionOperactionCode,
                  actionOperactionLabel,
                );
              } else if (
                actionOperactionCode === 'DELETE' &&
                !fc_hasObjectPrivilege(actionRefObjectApiName, 4)
              ) {
                consoleUtil.warn(
                  '[权限不足]：',
                  actionRefObjectApiName,
                  actionOperactionCode,
                  actionOperactionLabel,
                );
              } else if (
                actionOperactionCode === 'UPDATE' &&
                !fc_hasObjectPrivilege(actionRefObjectApiName, 2)
              ) {
                consoleUtil.warn(
                  '[权限不足]：',
                  actionRefObjectApiName,
                  actionOperactionCode,
                  actionOperactionLabel,
                );
              } else if (
                actionOperactionCode === 'RELATEDADD' &&
                !fc_hasObjectPrivilege(_.get(actionLayout, 'ref_obj_describe'), 1)
              ) {
                consoleUtil.warn(
                  '[权限不足]：',
                  _.get(actionLayout, 'ref_obj_describe'),
                  actionOperactionCode,
                  actionOperactionLabel,
                );
              }
            } else {
              needHiddenFoldMenu = true;
            }

            const key = `${baseKey}_${_.get(
              rowAction,
              'action_code',
              _.get(rowAction, 'action'),
            )}_${rowAction.label}`;
            const needFold = _.get(rowAction, 'need_fold', false);
            const recordOperationItemProps = {
              recordData,
              parentRecord: {},
              actionLayout: rowAction,
              objectApiName,
              location: this.props.location,
              onSuccess: (recordData, successData) => {
                const showAlert = _.get(rowAction, 'show_alert', true);
                const { queryDataDeal } = this.state;
                this.props.dispatch({
                  type: 'object_page/queryRecordList',
                  payload: { dealData: queryDataDeal, object_api_name: objectApiName },
                });
                // 保存列表项action的当前成功操作
                this.props.dispatch({
                  type: 'object_page/operationSuccess',
                  payload: {
                    lastSuccessOperation: {
                      object_api_name: objectApiName,
                      actionOperactionCode,
                      timestamp: new Date().getTime(),
                    },
                  },
                });
                if (showAlert) message.success(successData.message);
              },
              onError: (recordData, errorData) => {
                // message.error(errorData.message);
              },
            };

            // consoleUtil.warn('actionLayout start ',rowAction)
            const menuOption = (
              <RecordOperationItem
                {...recordOperationItemProps}
                dispatch={dispatch}
                pagination={pagination}
                key={key}
              />
            );

            if (needFold) {
              if (needShowOperaction) {
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
                  <img alt={'logo'} src="/img/more_row.png" style={{ verticalAlign: 'bottom' }} />
                </a>
              </Dropdown>,
            );
          }

          return menuOptions;
        },
      };
      columnsData = columnsData.concat(operation);
    }
    this.setState({ columns: columnsData });
    this.setState({ fieldList: fields });
  }

  componentDidMount() {
    const { component } = this.props;
    const objectApiName = this.props.component.object_describe_api_name;
    const page_size = _.get(this.props.component, 'page_size', 10);
    const needRelationQuery = _.get(this.props.component, 'need_relation_query', true);
    const pagination = this.props.pagination;

    const criterias = this.buildFilterCriterias([], {});
    const dataDeal = {
      needRelationQuery,
      joiner: 'and',
      criterias,
      orderBy: _.get(component, 'default_sort_by', _.get(component, 'orderBy', 'update_time')),
      order: _.get(component, 'default_sort_order', _.get(component, 'order', 'desc')),
      objectApiName,
      pageSize: page_size,
      pageNo: pagination.current,
    };
    this.setState({ queryDataDeal: dataDeal });
    this.props.dispatch({
      type: 'object_page/queryRecordList',
      payload: { dealData: dataDeal, object_api_name: objectApiName },
    });
  }

  onSelectChange = (keys) => {
    const { recordList } = this.props;
    const { selectedRowKeys, selectedRecordList } = this.state;
    const addKeys = _.difference(keys, selectedRowKeys);
    const removeKeys = _.difference(selectedRowKeys, keys);

    _.forEach(addKeys, (adddKey) => {
      selectedRecordList.push(_.find(recordList, { id: adddKey }));
    });
    _.forEach(removeKeys, (removeKey) => {
      _.pullAt(selectedRecordList, _.findIndex(selectedRecordList, { id: removeKey }));
    });
    // consoleUtil.log('selectedRowKeys changed: ', keys, addKeys, removeKeys);
    // consoleUtil.log('selectedRecordList changed: ', selectedRecordList);
    this.setState({ selectedRowKeys: keys, selectedRecordList });
  };
  onUpdateCallBack = () => {
    this.setState({ selectedRowKeys: [], selectedRecordList: [] });
    const objectApiName = this.props.component.object_describe_api_name;
    const { queryDataDeal } = this.state;
    this.props.dispatch({
      type: 'object_page/queryRecordList',
      payload: { dealData: queryDataDeal, object_api_name: objectApiName },
    });
  };

  buildFilterCriterias = (
    filterCriterias = [],
    selectorExtenderFilterCriterias = {},
    viewCriterias = [],
  ) => {
    const { component } = this.props;

    if (_.isEmpty(filterCriterias)) {
      filterCriterias = this.props.filterCriterias;
    }
    if (_.isEmpty(selectorExtenderFilterCriterias)) {
      selectorExtenderFilterCriterias = this.props.selectorExtenderFilterCriterias;
    }

    if (_.isEmpty(viewCriterias)) {
      viewCriterias = this.props.viewCriterias;
    }

    const recordType = component.record_type;
    const defaultFilterCriterias = _.get(component, 'default_filter_criterias');

    const selectorFilterCriteriaData = _.values(selectorExtenderFilterCriterias);

    let criterias = recordType ? [{ field: 'record_type', operator: 'in', value: recordType }] : [];
    if (!_.isEmpty(filterCriterias)) criterias = _.concat(criterias, filterCriterias);
    if (!_.isEmpty(viewCriterias)) criterias = _.concat(criterias, viewCriterias);
    if (!_.isEmpty(selectorFilterCriteriaData)) {
      _.forEach(selectorFilterCriteriaData, (criteriaData) => {
        criterias = _.concat(criterias, criteriaData);
      });
    }
    if (_.get(defaultFilterCriterias, 'criterias') && _.isEmpty(filterCriterias)) {
      criterias = criterias.concat(_.get(defaultFilterCriterias, 'criterias'));
    }
    // if (!_.isEmpty(recordType)) criterias = _.concat(criterias, [{ field: 'record_type', operator: 'in', value: recordType }]);

    return criterias;
  };

  onBatchAddCustomerTerritory = (actionLayout) => {
    const multiple_select = _.get(actionLayout, 'multiple_select', true);
    const actionObjectApiName = _.get(actionLayout, 'object_describe_api_name', 'customer');
    const targetLayoutRecordType = _.get(actionLayout, 'target_layout_record_type', 'hcp');
    const filterCriterias = _.get(actionLayout, 'target_filter_criterias.criterias', []);
    // * 选择医生页布局查询条件
    const LookupLayout = Promise.resolve(
      layoutService.loadLayout({
        object_api_name: actionObjectApiName,
        layout_type: 'relation_lookup_page',
        query: {
          recordType: targetLayoutRecordType,
        },
      }),
    );
    let selectIds = [];
    LookupLayout.then((data) => {
      const onCustomerTerritoryRowSelect = (ids, recoeds) => {
        selectIds = ids;
      };
      layer.open({
        title: crmIntlUtil.fmtStr(actionLayout.label),
        width: 870,
        content: (
          <PopupRecordSelector
            // objectApiName={'customer'}
            objectApiName={actionObjectApiName}
            recordType={targetLayoutRecordType}
            layout={data}
            defaultFilterCriterias={filterCriterias}
            multipleSelect={multiple_select}
            onRowSelect={onCustomerTerritoryRowSelect.bind(this)}
            // parentRecord={parentRecord}
          />
        ),
        onOk: () => {
          const {
            component: { object_describe_api_name: objectApiName },
          } = this.props;
          layer.closeAll();
          customActionService
            .executeAction({
              objectApiName,
              ids: selectIds,
              action: actionLayout.action,
            })
            .then(() => {
              this.refreshList();
            });
        },
      });
    });
  };

  onBatchRejectDCRAction = (action) => {
    this.setState({
      showBatchRejectDCRModal: true,
      currentRejectDCRAction: action,
    });
  };

  onCancelBatchRejectDCRM = () => {
    this.setState({
      showBatchRejectDCRModal: false,
      DCRTextareaValue: '',
    });
  };

  BatchRejectDCRMTextareaChange = (e) => {
    this.setState({
      DCRTextareaValue: e.target.value,
    });
  };

  onBatchRejectDCRMHandler = () => {
    const { DCRTextareaValue, currentRejectDCRAction } = this.state;
    if (_.isEmpty(currentRejectDCRAction)) {
      console.log('Action Is Error', currentRejectDCRAction);
      return false;
    }
    _.set(currentRejectDCRAction, 'params.resolution_note', DCRTextareaValue);
    this.onCallCustomAction(currentRejectDCRAction);
    this.setState({
      showBatchRejectDCRModal: false,
      DCRTextareaValue: '',
    });
  };

  _callCustomAction = (actionLayout, popupRefSeletedRowKeys = []) => {
    const needRowsSelected = _.get(actionLayout, 'need_rows_selected', true); // table有勾选功能时。根据need_rows_selected属性判断ids是否必有值 （默认true ids必有值）
    const showModel = _.get(actionLayout, 'show_modal', {}); //* 是否配有查询功能，如果有查询选择完之后在调用自定义接口，如果没有直接调用自定义接口

    let selectedRowKeys = this.state.selectedRowKeys;
    if (!_.isEmpty(showModel)) {
      selectedRowKeys = popupRefSeletedRowKeys;
    }

    if (_.isEmpty(selectedRowKeys) && needRowsSelected) {
      consoleUtil.error('ids is empty');
      return;
    }
    const { dispatch, describeData } = this.props;
    const actionObjectApiName = _.get(
      actionLayout,
      'object_describe_api_name',
      describeData.api_name,
    );
    dispatch({
      type: 'object_page/callCustomAction',
      payload: {
        objectApiName: actionObjectApiName,
        actionLayout,
        ids: selectedRowKeys,
      },
    });
  };

  customeLookPage = (actionLayout) => {
    const { describeData } = this.props;
    const showModel = _.get(actionLayout, 'show_modal', {}); //* 是否配有查询功能，如果有查询选择完之后在调用自定义接口，如果没有直接调用自定义接口
    const multiple_select = _.get(showModel, 'multiple_select', true);
    const actionObjectApiName = _.get(
      actionLayout,
      'object_describe_api_name',
      describeData.api_name,
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
              defaultFilterCriterias={[filterCriterias[0], filterCriterias[1]]}
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
   * 刷新列表
   *
   * TODO 将其他刷新列表的代码也替换为此方法
   */
  refreshList = () => {
    const { queryDataDeal } = this.state;
    const {
      component: { object_describe_api_name: objectApiName },
    } = this.props;
    this.props.dispatch({
      type: 'object_page/queryRecordList',
      payload: { dealData: queryDataDeal, object_api_name: objectApiName },
    });
  };

  // 选定之后，批量更新操作
  onApprovalAfterRowsSelectedAction = (actionLayout) => {
    const that = this;
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
          that.onApprovalAfterRowsSelectedFun(actionLayout);
        },
        onCancel() {
          // consoleUtil.log('Cancel');
        },
      });
    } else {
      that.onApprovalAfterRowsSelectedFun(actionLayout);
    }
  };
  onApprovalAfterRowsSelectedFun = (actionLayout) => {
    const { onApprovalAfterRowsSelectedOk, recordList } = this.props;
    const selectedRowKeys = this.state.selectedRowKeys;
    const selectedRecordList = this.state.selectedRecordList;

    const defaultFieldVals = _.get(actionLayout, 'default_field_val');

    const dealData = _.map(selectedRowKeys, (recordId) => {
      const data = {};
      const record = _.find(selectedRecordList, { id: recordId });

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
    onApprovalAfterRowsSelectedOk(dealData, this.onUpdateCallBack);
  };

  /**
   * 添加相关列表数据
   */
  relatedADD = (action) => {
    const {
      component: { object_describe_api_name: objectApiName },
      record,
    } = this.props;
    relatedADD(action, objectApiName, record);
  };

  downLoadCurrentTable = (headerContent) => {
    const { component, describeData, recordList } = this.props;
    const showFields = component.fields;
    const componentType = component.type;
    let objectApiName = null;
    if (componentType === 'record_list') {
      objectApiName = component.object_describe_api_name;
    }

    const showFieldCollection = {};
    let contentCell = [];
    const contentData = [];
    const tableHead = [];
    const fields = describeData.fields;
    if (!_.isEmpty(showFields)) {
      for (const showField of showFields) {
        const fieldName = showField.field;
        const hsdFieldPrivailege = fc_hasFieldPrivilege(objectApiName, fieldName, [2, 4]);
        if (!hsdFieldPrivailege) {
          consoleUtil.warn('[权限不足]：', objectApiName, fieldName);
          continue;
        }
        const fieldDescribe = _.find(fields, { api_name: fieldName });
        if (!_.isEmpty(fieldDescribe)) {
          const merged = Object.assign({}, fieldDescribe, showField);
          const fieldLabel = crmIntlUtil.fmtStr(
            _.get(merged, 'field.i18n_key'),
            crmIntlUtil.fmtStr(`field.${objectApiName}.${fieldDescribe.api_name}`, merged.label),
          );
          tableHead.push(fieldLabel);
          showFieldCollection[fieldName] = merged;
        }
      }
    }

    contentData.push(tableHead);

    _.map(recordList, (field, index) => {
      if (!_.isEmpty(showFields)) {
        if (!_.isEmpty(fields)) {
          _.forIn(showFieldCollection, (value, key) => {
            const renderContent =
              getCellContent(_.get(field, key), field, index, value, objectApiName) || '';
            contentCell.push(renderContent);
          });
        }
      }
      contentData.push(contentCell);
      contentCell = [];
    });
    const ws = XLSX.utils.aoa_to_sheet(contentData);
    const wb = XLSX.utils.book_new();
    //* 第三个参数是表格名
    XLSX.utils.book_append_sheet(wb, ws);
    return XLSX.writeFile(wb, `${headerContent}.xlsx`);
  };

  render() {
    const {
      component,
      describeData,
      recordList,
      dispatch,
      location,
      pagination,
      default_view_index = 0,
    } = this.props;
    const componentType = component.type;
    let showRowRelection = _.get(component, 'show_row_selection', false);
    if (!_.isBoolean(showRowRelection)) {
      showRowRelection = callAnotherFunc(new Function('t', showRowRelection), {});
    }
    const rowSelectionCheckboxProps = _.get(component, 'row_selection_checkboxProps');
    let showFilter = _.get(component, 'show_filter', false);
    if (!_.isBoolean(showFilter)) {
      showFilter = callAnotherFunc(new Function('t', showFilter), {});
    }
    const objectApiName = component.object_describe_api_name;
    const recordType = component.record_type;
    const { pageSize } = pagination;

    const { selectedRowKeys } = this.state;

    const criterias = this.buildFilterCriterias([], {});
    // pageSizeOptions:['10','20','30','40','50','60'],
    const paginationOptions = _.get(component, 'pagination_options', {});
    let tableProps = {
      dataSource: recordList,
      // loading: loading.effects['object_page/queryRecordList'],
      pagination: { ...pagination, ...paginationOptions },
      location,
      onChange: (page) => {
        const dataDeal = {
          needRelationQuery: _.get(component, 'need_relation_query', true),
          joiner: 'and',
          criterias,
          orderBy: _.get(component, 'default_sort_by', _.get(component, 'orderBy', 'update_time')),
          order: _.get(component, 'default_sort_order', _.get(component, 'order', 'desc')),
          objectApiName,
          pageSize: page.pageSize,
          pageNo: page.current,
        };
        this.setState({ queryDataDeal: dataDeal });
        dispatch({
          type: 'object_page/queryRecordList',
          payload: { dealData: dataDeal, object_api_name: objectApiName },
        });
      },
      onDeleteItem(id) {},
      onEditItem(item) {},
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

    const isMotion = false;

    const onAddAction = (actionCode, actionRecordType) => {
      let addUrl = '/object_page/:object_api_name/add_page'.replace(
        ':object_api_name',
        objectApiName,
      );
      if (actionRecordType) {
        addUrl += `?recordType=${actionRecordType}`;
      }
      hashHistory.push(addUrl);
    };

    // 选定之后，批量更新操作
    const onUpdateAfterRowsSelectedAction = (actionLayout) => {
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
            onUpdateAfterRowsSelectedFun(actionLayout);
          },
          onCancel() {
            // consoleUtil.log('Cancel');
          },
        });
      } else {
        onUpdateAfterRowsSelectedFun(actionLayout);
      }
    };
    const onUpdateAfterRowsSelectedFun = (actionLayout) => {
      const { onUpdateAfterRowsSelectedOk, recordList } = this.props;
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
      onUpdateAfterRowsSelectedOk(dealData, this.onUpdateCallBack);

      // consoleUtil.log('updates rows',this.state.selectedRowKeys);
    };

    /**
     * 内嵌iframe页面打开模式模式窗口容器
     * @param {Object} actionLayout
     */
    const onModalWidgetOpen = async (actionLayout) => {
      const { options } = actionLayout;
      const instance = await FcModalWidget.newInstance(
        Object.assign({}, options, {
          onMessage: (receivedMessageData) => {
            const { action: widgetAction, data: widgetData = {} } = receivedMessageData || {};
            switch (widgetAction) {
              case 'refreshList':
                this.refreshList();
                instance.widget.close();
                break;
              case 'resolvePage':
                const { hashPath, target = 'self' } = widgetData;
                if (_.isString(hashPath) && !_.isEmpty(hashPath)) {
                  switch (target) {
                    case 'blank':
                      window.open(hashPath);
                      break;
                    case 'self':
                      hashHistory.push(hashPath);
                      break;
                  }
                }
                break;
              default:
                consoleUtil.warn('模式窗口未知动作', widgetAction);
                break;
            }
          },
        }),
      );
      instance.widget.open();
    };

    const buttonListItems = (headerContent) => {
      const { layoutData, component } = this.props;
      const { selectedRowKeys } = this.state;
      const baseKey = `${layoutData.api_name}_action`;
      const actionList = _.filter(component.actions, (action) => {
        const isfindDetail = _.indexOf(_.get(action, 'show_when'), 'index');
        return isfindDetail >= 0;
      });
      let actionMenuOptions = [];
      let foldMenus = [];
      _.forEach(actionList, (action) => {
        const key = `${action.label}_${action.action}`;
        const needFold = _.get(action, 'need_fold', false);
        const disabledFun = getExpression(action, 'disabled_expression');
        const disabledValidResult = callAnotherFunc(new Function('t', disabledFun), {}); // 判断是否禁用编辑按钮，默认不禁用，当满足禁用条件的时候会禁用按钮
        const hiddenFun = getExpression(action, 'hidden_expression');
        const hiddenValidResult = callAnotherFunc(new Function('t', hiddenFun), {}); // 判断是否隐藏编辑按钮，默认不隐藏，当满足隐藏条件的时候会隐藏按钮
        const needRowsSelected = _.get(action, 'need_rows_selected', true); // table有勾选功能时。根据need_rows_selected属性判断ids是否必有值 （默认true ids必有值）

        const disabled_tip_title = disabledValidResult
          ? crmIntlUtil.fmtStr(
              _.get(action, 'disabled_tip_title.i18n_key'),
              _.get(action, 'disabled_tip_title', ''),
            )
          : '';

        if (hiddenValidResult) {
          return;
        }
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
        const actionRefObjectApiName = _.get(
          action,
          'ref_obj_describe',
          _.get(layoutData, 'object_describe_api_name'),
        );
        if (
          _.toUpper(action.action) === 'ADD' &&
          fc_hasObjectPrivilege(actionRefObjectApiName, 1) &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a
                  size="large"
                  disabled={disabledValidResult}
                  title={disabled_tip_title}
                  key={action.label}
                  onClick={onAddAction.bind(
                    null,
                    _.get(action, 'action_code'),
                    _.get(action, 'target_layout_record_type', _.get(layoutData, 'record_type')),
                  )}
                >
                  {actionLabel}
                </a>
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                size="large"
                disabled={disabledValidResult}
                title={disabled_tip_title}
                style={{ padding: '0 10px', marginLeft: 8 }}
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                key={action.label}
                onClick={onAddAction.bind(
                  null,
                  _.get(action, 'action_code'),
                  _.get(action, 'target_layout_record_type', _.get(layoutData, 'record_type')),
                )}
              >
                {actionLabel}
              </Button>,
            );
          }
        } else if (
          _.toUpper(action.action) === 'RELATEDADD' &&
          fc_hasObjectPrivilege(actionRefObjectApiName, 1) &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a
                  size="large"
                  disabled={disabledValidResult}
                  title={disabled_tip_title}
                  key={action.label}
                  onClick={this.relatedADD.bind(null, action)}
                >
                  {actionLabel}
                </a>
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                size="large"
                disabled={disabledValidResult}
                title={disabled_tip_title}
                style={{ padding: '0 10px', marginLeft: 8 }}
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                key={action.label}
                onClick={this.relatedADD.bind(null, action)}
              >
                {actionLabel}
              </Button>,
            );
          }
        } else if (
          _.toUpper(action.action) === 'UPDATE_AFTER_ROWS_SELECTED' &&
          fc_hasObjectPrivilege(actionRefObjectApiName, 2) &&
          !checkForHiddenDevice(action, 'PC')
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
                  onClick={onUpdateAfterRowsSelectedAction.bind(this, action)}
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
                onClick={onUpdateAfterRowsSelectedAction.bind(this, action)}
              >
                {actionLabel}
              </Button>,
            );
          }
        } else if (
          _.toUpper(action.action) === 'APPROVAL_AFTER_ROWS_SELECTED' &&
          fc_hasObjectPrivilege(actionRefObjectApiName, 2) &&
          !checkForHiddenDevice(action, 'PC')
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
                  onClick={this.onApprovalAfterRowsSelectedAction.bind(this, action)}
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
                onClick={this.onApprovalAfterRowsSelectedAction.bind(this, action)}
              >
                {actionLabel}
              </Button>,
            );
          }
        } else if (
          _.toUpper(action.action) === 'MODAL_WIDGET' &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          // PC独有
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a
                  size="large"
                  title={disabled_tip_title}
                  disabled={disabledValidResult}
                  key={action.label}
                  onClick={onModalWidgetOpen.bind(this, action)}
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
                onClick={onModalWidgetOpen.bind(this, action)}
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

          if (_.toUpper(action.action) === 'BATCH_ADD_CUSTOMER_TERRITORY') {
            // *批量创建目标医生
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                size="large"
                title={disabled_tip_title}
                disabled={disabledValidResult}
                style={{ padding: '0 10px', marginLeft: 8 }}
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                key={`${action.label}_b`}
                onClick={this.onBatchAddCustomerTerritory.bind(this, action)}
              >
                {actionLabel}
              </Button>,
            );
          } else if (_.toUpper(action.action) === 'BATCH_REJECT_DCR') {
            // *绿谷批量拒绝
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                size="large"
                title={disabled_tip_title}
                disabled={disabledValidResult || hasSelected}
                style={{ padding: '0 10px', marginLeft: 8 }}
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                key={`${action.label}_b`}
                onClick={this.onBatchRejectDCRAction.bind(this, action)}
              >
                {actionLabel}
              </Button>,
            );
          } else {
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
        } else if (
          _.toUpper(action.action) === 'EXPORT' &&
          fc_hasObjectPrivilege(actionRefObjectApiName, 1) &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a
                  size="large"
                  disabled={disabledValidResult}
                  title={disabled_tip_title}
                  key={action.label}
                  onClick={() => this.downLoadCurrentTable(headerContent)}
                >
                  {actionLabel}
                </a>
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                size="large"
                disabled={disabledValidResult}
                title={disabled_tip_title}
                style={{ padding: '0 10px', marginLeft: 8 }}
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                key={action.label}
                onClick={() => this.downLoadCurrentTable(headerContent)}
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
            <a style={{ padding: '0 10px', marginLeft: 8 }}>
              <img alt={'logo'} src="/img/more_action.png" style={{ verticalAlign: 'bottom' }} />
            </a>
          </Dropdown>,
        );
      }
      return actionMenuOptions;
    };

    const onSelectorFilterExtenderChange = (values) => {
      const pureCriterias = pickCriteriasFromSelectorExtender(values, 'criterias');
      const pureTerritoryCriterias = pickCriteriasFromSelectorExtender(
        values,
        'territoryCriterias',
      );
      dispatch({
        type: 'object_page/setSelectorFilterCriterias',
        payload: {
          selectorExtenderFilterCriterias: pureCriterias,
          selectorExtenderFilterTerritoryCriterias: pureTerritoryCriterias,
        },
      });

      // waiting for dispatch end.
      setTimeout(() => {
        const criterias = this.buildFilterCriterias([], pureCriterias);
        const dealData = {
          needRelationQuery: _.get(component, 'need_relation_query', true),
          joiner: 'and',
          criterias,
          orderBy: _.get(component, 'default_sort_by', _.get(component, 'orderBy', 'update_time')),
          order: _.get(component, 'default_sort_order', _.get(component, 'order', 'desc')),
          objectApiName,
          pageSize,
          pageNo: 1,
        };
        this.setState({ queryDataDeal: dealData });
        dispatch({
          type: 'object_page/queryRecordList',
          payload: { dealData, object_api_name: objectApiName },
        });
      }, 100);
    };

    const onViewChange = (value) => {
      const selectValue = _.get(value, 'key');
      const view = component.views.find((x) => x.name === selectValue);
      const selectValueName = crmIntlUtil.fmtStr(_.get(view, 'view.i18n_key'), view.name);
      const { criterias: view_criterias, approval_criterias, territory_criterias } = view;
      // crmIntlUtil.fmtStr(_.get(component, 'header.i18n_key'), component.header)
      // crmIntlUtil.fmtStr(_.get(views, ['0', 'view.i18n_key']), _.get(views, '[0].name'))
      this.setState({ IndexViewSelectName: selectValueName });
      dispatch({
        type: 'object_page/setViewCriterias',
        payload: {
          viewCriterias: view_criterias,
          approvalCriterias: approval_criterias,
          territoryCriterias: territory_criterias,
        },
      });

      /**
        FIXME
        这里使用延时器的处理方式并不合理，应该是在前面的action对应的effect中，dispatch一个 'object_page/queryRecordList'，
        将组装查询条件的任务封装在queryRecordList的reducer中, filter组件和viewSelect组件都只负责更新state即可
      */
      setTimeout(() => {
        const viewCriterias = processCriterias(view_criterias);
        const approvalCriterias = processCriterias(approval_criterias);
        const territoryCriterias = processCriterias(territory_criterias);
        const criterias = this.buildFilterCriterias([], [], viewCriterias);
        const dataDeal = {
          needRelationQuery: _.get(component, 'need_relation_query', true),
          joiner: 'and',
          criterias,
          approvalCriterias,
          territoryCriterias,
          orderBy: _.get(component, 'default_sort_by', _.get(component, 'orderBy', 'update_time')),
          order: _.get(component, 'default_sort_order', _.get(component, 'order', 'desc')),
          objectApiName,
          pageSize,
          pageNo: 1,
        };
        this.setState({ queryDataDeal: dataDeal });
        dispatch({
          type: 'object_page/queryRecordList',
          payload: { dealData: dataDeal, object_api_name: objectApiName },
        });
      }, 100);
    };

    const onCriteriasChange = (values) => {
      dispatch({
        type: 'object_page/setFilterCriterias',
        payload: {
          filterCriterias: values,
        },
      });

      setTimeout(() => {
        const criterias = this.buildFilterCriterias(values, {});
        const dataDeal = {
          needRelationQuery: _.get(component, 'need_relation_query', true),
          joiner: 'and',
          criterias,
          orderBy: _.get(component, 'default_sort_by', _.get(component, 'orderBy', 'update_time')),
          order: _.get(component, 'default_sort_order', _.get(component, 'order', 'desc')),
          objectApiName,
          pageSize,
          pageNo: 1,
        };
        this.setState({ queryDataDeal: dataDeal });
        dispatch({
          type: 'object_page/queryRecordList',
          payload: { dealData: dataDeal, object_api_name: objectApiName },
        });
      }, 100);
    };

    // wans 2017年9月1日15:56:25 修改，按照layout中filter的顺序进行排序
    const filterFields = component.filter_fields;
    let fieldList = this.state.fieldList;
    if (!_.isEmpty(filterFields)) {
      fieldList = _.map(filterFields, (filterField) => {
        // debugger;
        const fieldApiName =
          filterField.indexOf('__r.') > 0 ? filterField.split('__r.')[0] : filterField;
        const field = _.find(fieldList, { api_name: fieldApiName });
        if (_.isEmpty(field)) {
          consoleUtil.warn('[过滤器错误]：没有找到该字段的描述', fieldApiName);
        } else {
          return field;
        }
      });
    }

    const buildSelectorFilterExtender = () => {
      const selectorFilterExtender = _.get(component, 'selector_filter_extender');
      // const selectorFilterExtenderLayout = _.get(component, 'selector_filter_extender');
      if (_.isEmpty(selectorFilterExtender)) {
        return false;
      }

      const selectorFilterExtenders = _.map(selectorFilterExtender, (extender) => {
        const hiddenFun = getExpression(extender, 'hidden_expression');
        const hiddenValidResult = callAnotherFunc(new Function('t', hiddenFun), {}); // 判断是否隐藏编辑按钮，默认不隐藏，当满足隐藏条件的时候会隐藏按钮
        if (hiddenValidResult) {
          return false;
        }
        const subordinateSelectorProps = {
          onSelectorFilterExtenderChange,
          selectorFilterExtenderLayout: extender,
        };
        return (
          <SelectorFilterExtender
            {...subordinateSelectorProps}
            key={_.get(extender, 'extender_item')}
            style={{ padding: '0 10px', marginRight: 8 }}
          />
        );
      });
      return selectorFilterExtenders;
    };
    const recordListKey = `object_page_index_${component.api_name}`;
    const { views } = component;
    const menuItems = views
      ? views.map((x) => (
          <Menu.Item key={x.name} value={crmIntlUtil.fmtStr(_.get(x, 'view.i18n_key'), x.name)}>
            {crmIntlUtil.fmtStr(_.get(x, 'view.i18n_key'), x.name)}
          </Menu.Item>
        ))
      : false;
    const menu = <Menu onClick={onViewChange}>{menuItems}</Menu>;
    const defaultSelectHeader = views
      ? crmIntlUtil.fmtStr(
          _.get(views, [default_view_index, 'view.i18n_key']),
          _.get(views, `[${default_view_index}].name`),
        )
      : '';
    const viewHeader = this.state.IndexViewSelectName
      ? this.state.IndexViewSelectName
      : defaultSelectHeader;
    const dropHeader = views ? (
      <Dropdown overlay={menu}>
        <h1 className="ant-dropdown-link">
          {viewHeader} <Icon type="down" />
        </h1>
      </Dropdown>
    ) : (
      false
    );
    const defaultHeader = (
      <Row>
        <Col span={24}>
          <h1>{crmIntlUtil.fmtStr(_.get(component, 'header.i18n_key'), component.header)}</h1>
        </Col>
      </Row>
    );
    const header = views ? dropHeader : defaultHeader;
    const headerContent = views
      ? viewHeader
      : crmIntlUtil.fmtStr(_.get(component, 'header.i18n_key'), component.header);
    const defaultFilterCriterias = _.get(component, 'default_filter_criterias', []);
    const { showBatchRejectDCRModal } = this.state;
    return (
      <div>
        {showBatchRejectDCRModal && (
          <Modal
            visible={showBatchRejectDCRModal}
            title={'批量拒绝'}
            width={500}
            okText="确定"
            cancelText="取消"
            onCancel={this.onCancelBatchRejectDCRM}
            onOk={this.onBatchRejectDCRMHandler}
          >
            <Row style={{ textAlign: 'center' }}>
              <Col span={4}>拒绝原因:</Col>
              <Col span={20}>
                <Input type="textarea" onChange={this.BatchRejectDCRMTextareaChange} />
              </Col>
            </Row>
          </Modal>
        )}
        <Table
          key={recordListKey}
          title={(record) => {
            return (
              <Row type="flex" justify="space-between" align="bottom">
                <Col span={6}>{header}</Col>
                <Col span={18} style={{ textAlign: 'right' }}>
                  {buildSelectorFilterExtender()}
                  {showFilter && (
                    <RecordFilter
                      onCriteriasChange={onCriteriasChange}
                      defaultFilterCriterias={defaultFilterCriterias}
                      filter={{ objectApiName, component, fieldList }}
                    />
                  )}
                  {buttonListItems(headerContent)}
                </Col>
              </Row>
            );
          }}
          {...tableProps}
          className={classnames({ [styles.table]: true, [styles.motion]: isMotion })}
          bordered={false}
          scroll={{ x: '100%', y: '100%' }}
          columns={this.state.columns}
          simple
          rowKey={(record) => record.id}
          // getBodyWrapper={getBodyWrapper}
        />
      </div>
    );
  }
}

RecordList.proTypes = {
  // onSearch: PropTypes.func.isRequired,
  // onEdit : PropTypes.func.isRequired,
  // user: PropTypes.array.isRequired,
  fetch: PropTypes.object,
  rowKey: PropTypes.string,
  pagination: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.object]),
  columns: PropTypes.array,
  dataSource: PropTypes.array,
};

export default RecordList;
