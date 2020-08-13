/**
 * @flow
 */
/**
 * 此组件内部维护数据，与外部表单数据不同步，暴露方法getInternalState/clearInternalState
 * 由于外部组件的state频繁发生变化，导致此组件存在严重的性能问题
 * TODO （╯‵□′）╯︵┴─┴
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Table, Row, Col, Menu, Dropdown, Icon, Button, Modal } from 'antd';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { processCriterias } from '../../utils/criteriaUtil';
import { recordTypeCriteria, relationCriteria } from './helpers/recordHelper';
import * as recordService from '../../services/object_page/recordService';
import * as layoutService from '../../services/object_page/layoutService';
import * as describeService from '../../services/object_page/fieldDescribeService';
import { callAnotherFunc } from '../../utils';
import { hasExpression, getExpression } from '../../utils/expressionUtils';
import RecordOperationItem from './RecordOperationItem';
import { assertActionPrivilege, getActionProps, getActionByTypeFromComponent, getActionShowableProps } from './common/record';
import { renderCell } from './RecordTableHelper';
import {
  renderFieldComponent,
  reOrderFieldListByFilterFields,
  getFieldsValue,
  getColumnFieldApiNames,
  handlFormValidateError,
  getActionDefaultFieldVals,
  getObjectApiNameFromAction,
  getRelationApiNameFromRelatedList,
  getActionConfirmProps,
  getActionEditMode,
  rowActionAdditionalSet
} from './common/record';
import { PAGE_TYPE, ACTION_EDIT_MODE} from './common/constants';
import RecordAddModal from './RecordAddModal';
import RecordDetailModal from './RecordDetailModal';
import RecordEditModal from './RecordEditModal';
import styles from './List.less';
import relatedListItemStyle from './RecordFormRelatedListItem.less';
import RecordDetail from './RecordDetail';
import consoleUtil from '../../utils/consoleUtil';

const immutable = require('immutable')
const confirm = Modal.confirm;

const pickComparableFields = ({
  record,
  keys
}) => {
  return _.pick(record, keys)
}
/**
 * 详情页内嵌关联列表
 */
export default class RecordFormRelatedListItem extends Component {

  constructor(props) {
    super(props);

    const { dataSource } = props;

    this.state = {
      dataSource: [],
      currentEditingRecordIndex: null,        //  正在编辑的行
      recordType: [],
      loading: false,
      columns: [],
      key: null,
      targetValueField: null,
      relationField: null,

      parentRecord: props.parentRecord,

      dataSourceSnapshot: [],   // datasource快照
      originDataSource: [],  // 只在fetchData时进行修改

      recordAddModalReadyOrAlreadyRender: false,
      recordAddModalProps: {},

      recordDetailModalReadyOrAlreadyRender: false,
      recordDetailModalProps: {},

      recordEditModalReadyOrAlreadyRender: false,
      recordEditModalProps: {},
    }

  }

  componentWillReceiveProps(newProps) {
    if(!this.checkFormCreate()) {
      const parentRecord = Object.assign({}, newProps.parentRecord || {}, this.getParentRecordFromForm(newProps));
      this.setState({
        parentRecord,
      })
    }
  }

  checkFormCreate = () => {
    const { isFormCreate } = this.props;
    return !!isFormCreate;
  }

  compareMmutableState = ({
    nextProps,
    nextState
  }) => {
    const keys = _.chain(this.state).keys().value();
    if (immutable.Map(_.pick(this.state, keys)).equals(immutable.Map(_.pick(nextState, keys)))) {
      return false;
    }
    return true;
  }

  /**
   * 上级表单重复渲染导致页面卡顿
   * @param {Object} nextProps
   * @param {Object} nextState
   */
  shouldComponentUpdate(nextProps, nextState) {
    const comparePropsAndStates = {
      nextProps,
      nextState
    };
    const mutationed = this.checkFormCreate() || this.compareMmutableState(comparePropsAndStates);
    return mutationed;
  }

  componentWillMount() {
    const {
      component, refObjectDescribe, key,
    } = this.props;
    const { api_name: objectApiName, fields: fieldDescribes } = refObjectDescribe;
    const {
      fields: fieldsInColumns,
      record_type: recordType,
      target_value_field,
      related_list_name,
    } = component;
    const columns = fieldsInColumns
      .map((x) => {
        const fieldName = x.field;
        const fieldDescribe = fieldDescribes.find(y => y.api_name === x.field);
        if (_.isEmpty(fieldDescribe)) {
          consoleUtil.error('[配置错误]：字段在对象描述里面没有找到：', objectApiName, fieldName);
          return;
        }
        const merged = Object.assign({}, fieldDescribe, x);
        const hasFieldPrivilege = fc_hasFieldPrivilege(objectApiName, fieldName, [2, 4]);
        const fieldKey = `related_list_field_${merged.api_name}`;
        // fix bug,优先使用布局里面field.i18n_key，第二选择 field.<object_api_name>.<field_api_name>，最后选择label
        const fieldLabel = crmIntlUtil.fmtStr(_.get(merged, 'field.i18n_key'), crmIntlUtil.fmtStr(`field.${objectApiName}.${fieldDescribe.api_name}`, merged.label));

        if (!hasFieldPrivilege) {
          consoleUtil.warn('[权限不足]：', objectApiName, fieldName);
          return;
        }
        return {
          title: fieldLabel,
          dataIndex: merged.api_name,
          key: fieldKey,
          width: x.width || 'auto',
          fieldDefinition: merged,
          render: (text, record, index) => {
            return renderCell(text, record, index, merged, objectApiName);
          },
        };
      })
      .filter(x => x && x.title && x.dataIndex);

    const relationField = fieldDescribes.find(x => x.type === 'relation' && x.related_list_api_name === related_list_name);

    this.setState({
      refObjectDescribe,
      key,
      columns,
      recordType,
      targetValueField: target_value_field || 'id', // 默认使用父记录的ID做关联
      relationField,
    }, () => {
      const { pageType } = this.props;
      if (_.includes(['detail_page', 'edit_page'], _.toLower(pageType))) {
        this.fetchData();
      }
    });
  }

  fetchData = () => {
    const {
      refObjectDescribe: { api_name },
    } = this.state;
    const { component } = this.props;
    const { default_filter_criterias, need_relation_query=true } = component;
    const defaultCriterias = _.get(component, 'default_filter_criterias.criterias', []);
    const criterias = [].concat(this.recordTypeCriteria(), this.relationCriteria(), defaultCriterias);
    const processedCriterias = processCriterias(criterias);
    const query = {
      needRelationQuery:need_relation_query,
      joiner: 'and',
      objectApiName: api_name,
      criterias: processedCriterias,
      pageNo: 1,
      pageSize: 1000,
      order: _.get(component, 'default_sort_order', _.get(component, 'order', 'desc')),
      orderBy: _.get(component, 'default_sort_by', _.get(component, 'orderBy', 'id')),
    };
    this.setState({
      loading: true,
    }, () => {
      recordService.queryRecordList({ dealData: query })
        .then((response) => {
          let { result } = response;
          this.setState({
            dataSource: result,
            dataSourceSnapshot: result,
            originDataSource: result,
            currentEditingRecordIndex: null,
            loading: false,
          });
        });
    });
  }

  /**
   * 相关列表的查询条件
   */
  relationCriteria() {
    const { parentRecord, targetValueField, relationField } = this.state;
    return relationCriteria({ parentRecord, targetValueField, relationField });
  }

  /**
   * 基于recordType的查询条件
   */
  recordTypeCriteria = () => {
    return recordTypeCriteria(this.state.recordType);
  }

  /**
   * 操作列
   * @param {Array} rowActions
   */
  actionColumn() {
    const { currentEditingRecordIndex } = this.state;
    return {
      title: crmIntlUtil.fmtStr('field.operation'),
      key: 'operation',
      width: 150,
      render: (text, recordData, rowIndex) => {
        const { pageType } = this.props;

        if (_.isEqual(pageType, PAGE_TYPE.detail_page)) {
          if(_.isNull(currentEditingRecordIndex) || !_.isEqual(currentEditingRecordIndex, rowIndex)) {
            /**
             * 主要渲染布局中的编辑/删除/查看按钮
             */
            return this.renderRowActions({
              recordData,
              rowIndex,
            })();
          }else {
            /**
             * 主要渲染保存和取消按钮
             */
            return this.renderRecordSavableRowAction({
              rowIndex,
            })();
          }
        } else if (_.isEqual(pageType, PAGE_TYPE.add_page) || _.isEqual(pageType, PAGE_TYPE.edit_page)) {
          return this.renderEditableRowActions({
            rowIndex,
          })();
        }
      },
    };
  }

  /**
   * 为新建的数据添加默认值
   */
  appendDataSourceWithDefaultFieldVals = (dataSource) => {
    return dataSource.map(record => {
      if(_.has(record, 'id') && !_.isNull(record.id)) {
        return record;
      }else {
        const { __action__: { default_field_val } } = record;
        return Object.assign({}, _.omit(record, ['__action__']), this.getAddActionDefaultFieldVals({
          record,
          default_field_val,
        }))
      }
    });
  }

  createRecordWithDefaultFieldVals = (record) => {
    return _.flow(this.appendDataSourceWithDefaultFieldVals)([record])[0]
  }

  /**
   * 外部调用方法，获取组件内部state
   */
  getInternalState = () => {
    const { dataSource, originDataSource } = this.state;
    return {
      dataSource: _.flow(this.appendDataSourceWithDefaultFieldVals)(dataSource),
      originDataSource,
    }
  }

  /**
   * 清除内部state
   */
  clearInternalState = () => {
    this.setState({
      dataSource: [],
      dataSourceSnapshot: [],
      originDataSource: [],
      currentEditingRecordIndex: null,
    })
  }

  /**
   * 添加操作列
   */
  appendRowActionColumn = ({
    component
  }) => {
    return this.actionColumn();
  }

  /**
   * 清除当前编辑状态
   */
  clearCurrentEditingState = ({
    callback
  } = {
      callback: _.noop
    }) => {
    this.setState({
      currentEditingRecordIndex: null,
    }, callback);
  }

  /**
   * 给字段绑定命名空间
   */
  bindFieldApiNamesWithNamespace = ({
    names = []
  }) => {
    const { component: { related_list_name } } = this.props;
    return names.map(name => `${related_list_name}.${name}`)
  }

  /**
   * 验证表单项
   */
  validateRecordWithForm = ({
    nextHandler
  }) => {
    const { form } = this.props;
    const { columns } = this.state;
    /**
     * 携带命名空间的字段名称
     */
    const validateFormFieldNames = this.bindFieldApiNamesWithNamespace({
      names: getColumnFieldApiNames({
        columns,
      })
    });
    form.validateFields(validateFormFieldNames, nextHandler);
  }

  /**
   * 记录保存，临时数据
   */
  recordSave = () => {
    this.validateRecordWithForm({
      nextHandler: (error, record) => {
        if (!error) {
          this.updateDataSourceWithRecord({
            record
          })
        } else {
          handlFormValidateError({
            error
          })
        }
      }
    })
  }

  /**
   * 更新数据记录，临时更新
   */
  updateDataSourceWithRecord = ({
    record,
  }) => {
    const { dataSource, currentEditingRecordIndex } = this.state;
    const { component: { related_list_name } } = this.props;
    const currentEditingRecord = dataSource[currentEditingRecordIndex];
    const newDataSource = _.cloneDeep(dataSource);
    newDataSource.splice(currentEditingRecordIndex, 1, Object.assign({}, currentEditingRecord, _.get(record, related_list_name)));
    this.clearCurrentEditingState({
      callback: () => {
        this.setState({
          dataSource: newDataSource
        })
      }
    })
  }

  /**
   * 用于模式窗口下的记录更新
   */
  updateDataSrouceWithModalRecord = ({
    record,
    currentEditingRecordIndex,
  }) => {
    const { dataSource } = this.state;
    const { component: { related_list_name } } = this.props;
    const currentEditingRecord = dataSource[currentEditingRecordIndex];
    const newDataSource = _.cloneDeep(dataSource);
    /**
     * 如果根据currentEditingRecordIndex没有找到记录，则表示新建
     */
    newDataSource.splice(currentEditingRecordIndex, 1, Object.assign({}, currentEditingRecord || {}, _.get(record, related_list_name)));
    this.clearCurrentEditingState({
      callback: () => {
        this.setState({
          dataSource: newDataSource
        })
      }
    })
  }

  /**
   * 取消保存或者编辑操作
   */
  recordCancel = () => {
    const { dataSource = [], dataSourceSnapshot } = this.state;
    this.setState({
      dataSource: dataSourceSnapshot
    }, this.clearCurrentEditingState)
  }

  /**
   * 编辑按钮点击事件
   */
  recordEdit = ({
    rowIndex,
    actionLayout
  }) => {
    const { dataSource, currentEditingRecordIndex } = this.state;
    const edit_mode = _.get(actionLayout, 'edit_mode');
    /**
     * 模式窗口方式的编辑
     */
    if(_.isEqual(edit_mode, ACTION_EDIT_MODE.embed_modal)) {
      const recordData = _.get(dataSource, `[${rowIndex}]`);
      const { pageType } = this.props;
      if(recordData) {
        const { id } = recordData;
        const { target_layout_record_type: record_type, ref_obj_describe: object_api_name, related_list_name, embed_modal_options = {} } = actionLayout;
        let recordEditModalProps = {
          object_api_name,
          record_type,
          id,
          ...embed_modal_options,
          onClose: this.clearEditModalState,
          onSave: (onOk, record, newRecord, saveActionLayout, callback) => {
            const RecordEditModalInstance = this.getRecordEditModalInstance({
              actionLayout,
              id,
            });
            /**
             * 添加及编辑页，数据存储在当前页面
             */
            if(_.isEqual(pageType, PAGE_TYPE.edit_page) || _.isEqual(pageType, PAGE_TYPE.add_page)) {
              /**
               * 优先关闭模式窗口，否则会报错
               */
              RecordEditModalInstance.close()
              this.updateDataSrouceWithModalRecord({
                record: {
                  [related_list_name]: record,
                },
                currentEditingRecordIndex: rowIndex,
              })
            }else if(_.isEqual(pageType, PAGE_TYPE.detail_page)){
              /**
               * 详情页直接修改数据
               */
              this.onEditModalSave({
                record,
                newRecord,
                actionLayout,
                saveActionLayout,
                RecordEditModalInstance,
                callback,
                onOk
              })
            }
          }
        };
        /**
         * 如果是编辑及新建页面，则模式窗口中显示本地数据
         */
        if(_.isEqual(pageType, PAGE_TYPE.edit_page) || _.isEqual(pageType, PAGE_TYPE.add_page)) {
          recordEditModalProps = Object.assign({}, recordEditModalProps, {
            record: recordData,
          });
        }
        this.setState({
          recordEditModalReadyOrAlreadyRender: true,
          recordEditModalProps,
        }, () => {
          const RecordEditModalInstance = this.getRecordEditModalInstance({
            actionLayout,
            id,
          });
          if(RecordEditModalInstance) {
            RecordEditModalInstance.open();
          }else {
            consoleUtil.warn('错误:编辑页模式窗口未开启。')
          }
        })
      }
    }else {
      /**
      * 如果当前有正在操作的行，则取消当前操作
      */
      if (_.isNull(currentEditingRecordIndex)) {
        this.setState({
          currentEditingRecordIndex: rowIndex,
          dataSourceSnapshot: dataSource,    // 记录上一次的原始数据
        })
      }
    }
  }

  /**
   * 删除按钮点击事件
   */
  recordDelete = ({
    rowIndex
  }) => {
    const { dataSource, currentEditingRecordIndex } = this.state;
    /**
     * 如果有当前正在操作的行，则禁止删除当前行
     */
    if (_.isNull(currentEditingRecordIndex)) {
      const newDataSource = _.cloneDeep(dataSource);
      newDataSource.splice(rowIndex, 1);
      this.setState({
        dataSource: newDataSource,
      })
    }
  }

  /**
   * 通过接口直接删除数据
   */
  recordDeleteNow = async ({
    rowIndex,
    actionLayout
  }) => {
    const { dataSource, currentEditingRecordIndex } = this.state;
    if (_.isNull(currentEditingRecordIndex)) {
      const { actionNeedConfirm, actionConfirmMessage } = getActionConfirmProps({
        actionLayout
      });
      if(actionNeedConfirm) {
        confirm({
          title: actionConfirmMessage,
          onOk: () => {
            this.deleteRecord({
              rowIndex,
              actionLayout
            })
          },
        });
      }else {
        this.deleteRecord({
          rowIndex,
          actionLayout
        })
      }
    }
  }

  /**
   * 删除记录
   */
  deleteRecord = async ({
    rowIndex,
    actionLayout
  }) => {
    const { dataSource } = this.state;
    const record = dataSource[rowIndex];
    const { id } = record;
    const { component } = this.props;
    const object_api_name = getObjectApiNameFromAction({
      actionLayout,
      component,
    })
    const deletedResponse = await recordService.deleteRecord({
      object_api_name,
      id,
    });
    if(deletedResponse && deletedResponse.success === true) {
      this.fetchData();
    }
  }

  /**
   * 渲染保存按钮
   */
  renderEditableRowSaveAction = () => {
    return () => {
      return (
        <a onClick={this.recordSave.bind(this)} className={relatedListItemStyle['btn-link']}>
          {
            crmIntlUtil.fmtStr('action.save')
          }
        </a>
      )
    }
  }

  /**
   * 渲染取消按钮
   */
  renderEditableRowCancelAction = () => {
    return () => {
      return (
        <a onClick={this.recordCancel.bind(this)} className={relatedListItemStyle['btn-link']}>
          {
            crmIntlUtil.fmtStr('action.cancel')
          }
        </a>
      )
    }
  }

  /**
   * 渲染编辑按钮
   */
  renderEditableRowEditAction = ({
    rowIndex,
    actionLayout,
    baseKey
  }) => {
    return () => {
      return (
        <a onClick={this.recordEdit.bind(this, {
          rowIndex,
          actionLayout
        })} className={relatedListItemStyle['btn-link']} key={`${baseKey}_edit_btn`}>
          {
            crmIntlUtil.fmtStr('action.edit')
          }
        </a>
      )
    }
  }

  /**
   * 删除按钮绑定的删除方法
   */
  bindRecordDeleteMethod = ({
    rowIndex,
    actionLayout
  }) => {
    const { pageType } = this.props;
    if (_.isEqual(pageType, PAGE_TYPE.detail_page)) {
      this.recordDeleteNow({
        rowIndex,
        actionLayout,
      })
    } else if (_.isEqual(pageType, PAGE_TYPE.add_page) || _.isEqual(pageType, PAGE_TYPE.edit_page)) {
      this.recordDelete({
        rowIndex
      })
    }
  }

  /**
   * 打开详情页模式窗口
   */
  bindRecordDetailMethod = ({
    rowIndex,
    actionLayout
  }) => {
    const { dataSource } = this.state;
    const { pageType } = this.props;
    const record = _.get(dataSource, `[${rowIndex}]`);
    if(record) {
      const { id } = record;
      const { target_layout_record_type: record_type, ref_obj_describe: object_api_name, related_list_name, embed_modal_options = {} } = actionLayout;
      let recordDetailModalProps = {
        object_api_name,
        record_type,
        id,
        ...embed_modal_options,
        onClose: this.clearDetailModalState,
      };
      /**
       * 如果是编辑及新建页面，则模式窗口中显示本地数据
       */
      if(_.isEqual(pageType, PAGE_TYPE.edit_page) || _.isEqual(pageType, PAGE_TYPE.add_page)) {
        recordDetailModalProps = Object.assign({}, recordDetailModalProps, {
          record,
        });
      }
      this.setState({
        recordDetailModalReadyOrAlreadyRender: true,
        recordDetailModalProps,
      }, () => {
        const RecordDetailModalInstance = this.getRecordDetailModalInstance({
          actionLayout,
          id,
        });
        if(RecordDetailModalInstance) {
          RecordDetailModalInstance.open();
        }else {
          consoleUtil.warn('错误:详情页模式窗口未开启。')
        }
      })
    }
  }



  /**
   * 渲染删除按钮
   */
  renderEditableRowDeleteAction = ({
    rowIndex,
    actionLayout,
    baseKey
  }) => {
    return () => {
      return (
        <a onClick={this.bindRecordDeleteMethod.bind(this, {
          rowIndex,
          actionLayout,
        })} className={relatedListItemStyle['btn-link']} key={`${baseKey}_delete_btn`}>
          {
            crmIntlUtil.fmtStr('action.delete')
          }
        </a>
      )
    }
  }

  /**
   * 渲染详情按钮
   */
  renderEditableRowDetailAction = ({
    rowIndex,
    actionLayout,
    baseKey
  }) => {
    return () => {
      return (
        <a onClick={this.bindRecordDetailMethod.bind(this, {
          rowIndex,
          actionLayout,
        })} className={relatedListItemStyle['btn-link']} key={`${baseKey}_detail_btn`}>
          {
            crmIntlUtil.fmtStr('action.detail')
          }
        </a>
      )
    }
  }

  /**
   * 将新建的数据与parent进行绑定，用于详情页添加数据
   */
  bindCreateRecordWithParent = ({
    record,
  }) => {
    const { component } = this.props;
    const { dataSource, currentEditingRecordIndex, parentRecord } = this.state;
    const { related_list_name } = component;
    const dealData = Object.assign({}, this.createRecordWithDefaultFieldVals(_.get(Object.assign({}, record, {
      [related_list_name]: Object.assign({}, record[related_list_name], dataSource[currentEditingRecordIndex])
    }), related_list_name, {})), {
      [getRelationApiNameFromRelatedList({
        component
      })]: _.get(parentRecord, 'id')
    });
    return dealData;
  }

  /**
   * 新进或更新记录
   * record struct:
   * {
   *  call_inventory_list: {
   *    batch_number； 0,
   *    ...
   *  }
   * }
   */
  recordCreateOrUpdate = async ({
    record,
  }) => {
    const { component } = this.props;
    const { ref_obj_describe: object_api_name } = component;
    const { dataSource, currentEditingRecordIndex } = this.state;
    const dealData = this.bindCreateRecordWithParent({
      record,
    })
    let postResponse;
    if(_.has(dealData, 'id')) {
      postResponse = await recordService.updateRecord({
        object_api_name,
        id: dealData.id,
        dealData: Object.assign({}, dataSource[currentEditingRecordIndex], dealData),
      })
    }else {
      postResponse = await recordService.create({
        object_api_name,
        dealData,
      })
    }
    if(postResponse && postResponse.success === true) {
      this.fetchData();
    }
  }

  /**
   * 立即执行保存操作
   */
  recordSaveNow = () => {
    this.validateRecordWithForm({
      nextHandler: async (error, record) => {
        if (!error) {
          this.recordCreateOrUpdate({
            record,
          })
        } else {
          handlFormValidateError({
            error
          })
        }
      }
    })
  }

  /**
   * 渲染保存按钮
   */
  renderRecordSaveAction = ({
    rowIndex,
  }) => {
    return () => {
      return (
        <a onClick={this.recordSaveNow.bind(this)} className={relatedListItemStyle['btn-link']}>
          {
            crmIntlUtil.fmtStr('action.save')
          }
        </a>
      )
    }
  }

  /**
   * 渲染编辑状态下的保存和取消按钮，此按钮不需要通过布局进行配置
   */
  renderEditableRowActions = ({
    rowIndex,
  }) => {
    return () => {
      const { currentEditingRecordIndex, dataSource } = this.state;
      if (!_.isNull(currentEditingRecordIndex) && _.isEqual(currentEditingRecordIndex, rowIndex)) {
        return [
          this.renderEditableRowSaveAction()(),
          this.renderEditableRowCancelAction()(),
        ]
      } else {
        const { dataSource } = this.state;
        const recordData = dataSource[rowIndex];
        return this.renderRowActions({
          rowIndex,
          recordData,
        })();
      }
    }
  }

  /**
   * 渲染保存和取消按钮
   */
  renderRecordSavableRowAction = ({
    rowIndex,
  }) => {
    return () => {
      const { currentEditingRecordIndex } = this.state;
      return [
        this.renderRecordSaveAction({
          rowIndex
        })(),
        this.renderEditableRowCancelAction()(),
      ]
    }
  }

  findEditAction = ({
    parentRecord,
    recordData,
    rowIndex,
    baseKey,
  }) => {
    const { component, pageType } = this.props;
    const { row_actions } = component;
    /**
     * edit action
     */
    let editAction = _.find(row_actions, {
      action: 'EDIT',
    })
    const { actionShow: editActionShow } = getActionShowableProps({
      actionLayout: editAction,
      parentRecord,
      recordData,
      pageType,
    })
    if (editAction && editActionShow) {
      editAction = Object.assign({}, rowActionAdditionalSet({
        actionLayout: editAction,
        component,
      }), {
        target_layout_record_type: recordData.record_type,
      });
      return this.renderEditableRowEditAction({
        rowIndex,
        actionLayout: editAction,
        baseKey,
      })();
    }
    return null;
  }

  findDetailAction = ({
    parentRecord,
    recordData,
    rowIndex,
    baseKey
  }) => {
    const { component, pageType } = this.props;
    const { row_actions } = component;

    let detailAction = _.find(row_actions, {
      action: 'DETAIL',
    });
    const { actionShow: detailActionShow } = getActionShowableProps({
      actionLayout: detailAction,
      parentRecord,
      recordData,
      pageType
    })
    if (detailAction && detailActionShow) {
      detailAction = Object.assign({}, rowActionAdditionalSet({
        actionLayout: detailAction,
        component,
      }), {
        target_layout_record_type: recordData.record_type,
      });
      return this.renderEditableRowDetailAction({
        rowIndex,
        actionLayout: detailAction,
        baseKey
      })();
    }
    return null;
  }

  findDeleteAction = ({
    parentRecord,
    recordData,
    rowIndex,
    baseKey,
  }) => {
    const { component, pageType } = this.props;
    const { row_actions } = component;

    const deleteAction = _.find(row_actions, {
      action: 'DELETE',
    });
    const { actionShow: deleteActionShow } = getActionShowableProps({
      actionLayout: deleteAction,
      parentRecord,
      recordData,
      pageType
    })
    if (deleteAction && deleteActionShow) {
      return this.renderEditableRowDeleteAction({
        rowIndex,
        actionLayout: deleteAction,
        baseKey,
      })();
    }
    return null;
  }

  /**
   * 渲染详情，编辑和删除按钮
   */
  renderCompositeUsageActions = ({
    rowIndex,
    alreadyExistActions = [],
    parentRecord,
    recordData,
    baseKey,
  }) => {
    const funcParams = {
      recordData,
      parentRecord,
      rowIndex,
      baseKey,
    }

    /**
     * detail action
     */
    const detailAction = this.findDetailAction(funcParams);
    if(detailAction) {
      alreadyExistActions.push(detailAction);
    }

    /**
     * edit action
     */
    const editAction = this.findEditAction(funcParams)
    if(editAction) {
      alreadyExistActions.push(editAction);
    }

    /**
     * delete action
     */
    const deleteAction = this.findDeleteAction(funcParams);
    if(deleteAction) {
      alreadyExistActions.push(deleteAction);
    }
    return alreadyExistActions;
  }



  /**
   * 渲染按钮
   */
  renderRowActions = ({
    recordData,
    rowIndex,
  }) => {
    return () => {
      const { component } = this.props;
      const { row_actions: rowActions } = component;
      if (_.isEmpty(rowActions)) {
        return [];
      }
      const { dispatch, location, pageType } = this.props;
      const { parentRecord } = this.state;
      const objectApiName = _.get(component, 'ref_obj_describe');
      let menuOptions = [];
      let foldMenus = [];
      const baseKey = `recordOperationItemProps_${_.get(recordData, 'id', '')}_${_.get(recordData, 'version', '')}_${_.random(0, 5)}`;
      let needHiddenFoldMenu = false; // 是否需要隐藏折叠按钮

      const handleCommonOpertionItem = ({
        rowAction
      }) => {
        const actionLayout = rowAction;
        const { actionOperactionLabel, actionShow, actionKey: key, actionNeedFold } = getActionProps({
          actionLayout,
          component,
          recordData,
          parentRecord,
          baseKey,
          pageType
        })
        let needHiddenFoldMenu = !actionShow; // 是否需要隐藏折叠按钮

        const recordOperationItemProps = {
          recordData,
          parentRecord,
          actionLayout: rowAction,
          objectApiName,
          location,
          onSuccess: (recordData, successData) => {
            message.success(successData.message);
            this.fetchData();
          },
          onError: (recordData, errorData) => {
            message.error(errorData.message);
            this.fetchData();
          },
        };

        const menuOption = (
          <RecordOperationItem
            {...recordOperationItemProps}
            dispatch={dispatch}
            key={key}
          />
        );

        if (actionNeedFold) {
          if (actionShow) {
            foldMenus = foldMenus.concat(<Menu.Item key={`${key}_menu_item`} >{menuOption}</Menu.Item>);
          }
        } else {
          if(actionShow) {
            menuOptions = menuOptions.concat(menuOption);
          }
        }
      }

      this.renderCompositeUsageActions({
        alreadyExistActions: menuOptions,
        rowIndex,
        parentRecord,
        recordData,
        baseKey
      })

      for (const rowAction of rowActions) {
        const { action } = rowAction;
        /**
         * 对于delete 和 edit 进行特殊处理
         */
        const wannaActions = ['DELETE', 'EDIT', 'DETAIL'];
        if (!_.includes(wannaActions, _.toUpper(action))) {
          handleCommonOpertionItem({
            rowAction
          })
        }
      }


      if (!_.isEmpty(foldMenus)) {
        foldMenus = (<Menu>
          {foldMenus}
        </Menu>);
        menuOptions.push(<Dropdown overlay={foldMenus} key={`${baseKey}_dropdown`}>
          <a style={{ border: 'none' }}>
            <Icon style={{ marginLeft: 8 }} type="bars" />
            <Icon type="down" />
          </a>
        </Dropdown>);
      }
      return menuOptions;
    }
  }

  getParentRecordFromForm = (props) => {
    const { form } = props || this.props;
    return getFieldsValue({
      form
    })
  }

  /**
   * 获取按钮上定义的默认值
   */
  getAddActionDefaultFieldVals = ({
    record,
    default_field_val,
  }) => {
    const { parentRecord } = this.state;
    return getActionDefaultFieldVals({
      default_field_val,
      parentRecord,
      thizRecord: record,
      relatedRecord: record,
    })
  }

  /**
   * 获取添加页的模式窗口实例
   */
  getRecordAddModalInstance = ({
    actionLayout
  }) => {
    const { target_layout_record_type: record_type, ref_obj_describe: object_api_name } = actionLayout;
    return RecordAddModal.findInstance(RecordAddModal.generateUniqKey({
      object_api_name,
      record_type,
    }));
  }

  /**
   * 获取详情页的模式窗口
   */
  getRecordDetailModalInstance = ({
    actionLayout,
    id,
  }) => {
    const { target_layout_record_type: record_type, ref_obj_describe: object_api_name, related_list_name } = actionLayout;
    return RecordDetailModal.findInstance(RecordDetailModal.generateUniqKey({
      object_api_name,
      record_type,
      id,
    }))
  }

  /**
   * 获取编辑页的模式窗口
   */
  getRecordEditModalInstance = ({
    actionLayout,
    id,
  }) => {
    const { target_layout_record_type: record_type, ref_obj_describe: object_api_name, related_list_name } = actionLayout;
    return RecordEditModal.findInstance(RecordEditModal.generateUniqKey({
      object_api_name,
      record_type,
      id,
    }))
  }

  /**
   * add modal onClose
   */
  clearAddModalState = ({
    callback
  } = {
    callback: _.noop
  }) => {
    this.setState({
      recordAddModalReadyOrAlreadyRender: false,
      recordAddModalProps: {},
    }, callback)
  }

  /**
   * detail modal close
   */
  clearDetailModalState = ({
    callback
  } = {
    callback: _.noop
  }) => {
    this.setState({
      recordDetailModalReadyOrAlreadyRender: false,
      recordDetailModalProps: {},
    }, callback)
  }

  /**
   * edit modal close
   */
  clearEditModalState = ({
    callback
  } = {
    callback: _.noop
  }) => {
    this.setState({
      recordEditModalReadyOrAlreadyRender: false,
      recordEditModalProps: {},
    }, callback)
  }

  /**
   * 模式添加数据保存
   */
  onAddModalSave = ({
    record,
    actionLayout,
    RecordAddModalInstance,
    callback = _.noop,
    onOk,
    saveActionLayout,
  }) => {
    RecordAddModalInstance.close({
      onClose: () => {
        this.clearAddModalState({
          /**
           * close的同时，处理数据变更
           */
          callback: () => {
            const { pageType, component } = this.props;
            const { related_list_name } = component;
            const recordWithListName = {
              [related_list_name]: Object.assign({}, record, {
                __action__: actionLayout,
              })
            };
            const { dataSource } = this.state;
            if(_.isEqual(pageType, PAGE_TYPE.add_page) || _.isEqual(pageType, PAGE_TYPE.edit_page)) {
              /**
               * 添加和编辑页，直接更新本地数据
               */
              this.updateDataSrouceWithModalRecord({
                record: recordWithListName,
                currentEditingRecordIndex: dataSource.length,
              })
            }else if(_.isEqual(pageType, PAGE_TYPE.detail_page)) {
              /**
               * 详情页直接对数据进行远程更新
               */
              onOk(this.bindCreateRecordWithParent({
                record: recordWithListName,
              }), saveActionLayout, () => {
                this.fetchData();
              }, RecordAddModalInstance.getKey())
            }
          }
        })
      }
    });
  }

  /**
   * 模式窗口下的数据保存
   */
  onEditModalSave = ({
    onOk,
    RecordEditModalInstance,
    record,
    newRecord,
    saveActionLayout,
    actionLayout,
    callback
  }) => {
    RecordEditModalInstance.close({
      onClose: () => {
        this.clearEditModalState({
          /**
           * close的同时，处理数据变更
           */
          callback: async () => {
            const { dataSource } = this.state;
            const { pageType } = this.props;
            if(_.isEqual(pageType, PAGE_TYPE.detail_page)) {
              onOk(record, newRecord, saveActionLayout, () => {
                this.fetchData();
              }, RecordEditModalInstance.getKey());
            }else if(_.isEqual(pageType, PAGE_TYPE.add_page) || _.isEqual(pageType, PAGE_TYPE.edit_page)) {
              /**
               * 编辑及新建页面更新页面临时数据
               */

            }
          }
        })
      }
    });
  }

  /**
   * 显示模式窗口方式的添加页
   */
  showAddModel = ({
    actionLayout
  }) => {
    const RecordAddModalInstance = this.getRecordAddModalInstance({
      actionLayout
    })
    const { target_layout_record_type: record_type, ref_obj_describe: object_api_name, embed_modal_options = {} } = actionLayout;
    const { recordAddModalReadyOrAlreadyRender } = this.state;
    if(recordAddModalReadyOrAlreadyRender && RecordAddModalInstance) {
      /**
       * 程序不会运行至此处
       */
      RecordAddModalInstance.open();
    }else {
      const { parentApiName } = this.props;
      const { parentRecord } = this.state;
      this.setState({
        recordAddModalReadyOrAlreadyRender: true,
        recordAddModalProps: {
          object_api_name,
          record_type,
          parentId: null,
          parentName: null,
          parentApiName,
          parentRecord,
          ...embed_modal_options,
          onClose: this.clearAddModalState,
          onSave: (onOk, record, saveActionLayout, callback) => {
            this.onAddModalSave({
              record,
              actionLayout,
              saveActionLayout,
              callback,
              onOk,
              RecordAddModalInstance: this.getRecordAddModalInstance({
                actionLayout
              }),
            })
          }
        }
      }, () => {
        const RecordAddModalInstance = this.getRecordAddModalInstance({
          actionLayout
        });
        RecordAddModalInstance.open();
      })
    }
  }

  /**
   * 监听添加按钮的点击事件
   */
  onAddableActionClick = ({
    actionLayout
  }) => {
    const action_edit_mode = getActionEditMode({
      actionLayout,
    });
    switch(action_edit_mode) {
      case ACTION_EDIT_MODE.editable_table: {
        this.addRecordRow({
          actionLayout,
        })
        break;
      }
      case ACTION_EDIT_MODE.embed_modal: {
        this.showAddModel({
          actionLayout,
        })
        break;
      }
      default:
        break;
    }
  }

  /**
   * 主要渲染添加按钮
   */
  renderActions = () => {
    const { component, form, pageType } = this.props;
    const { parentRecord } = this.state;
    const { actions = [] } = component;
    return actions.map((actionLayout, index) => {
      const { actionOperactionLabel, actionShow, actionDisabled } = getActionProps({
        actionLayout,
        component,
        recordData: {},
        parentRecord,
        pageType,
      });

      if (actionShow) {
        return (
          <Button type="dashed" icon='plus' disabled={actionDisabled} onClick={this.onAddableActionClick.bind(this, {
            actionLayout,
          })} style={{
            width: '100%',
            marginTop: index === actions.length -1? 10: 0
          }}>
            {
              actionOperactionLabel
            }
          </Button>
        )
      }
      return null;
    }).filter(actionLayout => !_.isNull(actionLayout));
  }

  /**
   * 添加新记录
   */
  addRecordRow = ({
    actionLayout,
  }) => {
    const { dataSource = [], currentEditingRecordIndex , parentRecord} = this.state;
    const { component, parentApiName } = this.props;
    const { target_layout_record_type = "master" } = actionLayout;

    if (_.isNull(currentEditingRecordIndex)) {
      this.setState({
        dataSource: [...dataSource, this.createEmptyRecord({
          record_type: target_layout_record_type,
          __action__: actionLayout,   // 标记新记录是由哪个添加按钮新建的
          [`${parentApiName}__r`]: parentRecord,
        })],
        dataSourceSnapshot: dataSource,
        currentEditingRecordIndex: dataSource.length,
      })
    }
  }

  /**
   * relation field item value changed then refresh datasource
   */
  relationFormItemChange = (recordValue, record, renderField) => {
    const { currentEditingRecordIndex, dataSource } = this.state;
    if (!_.isNull(currentEditingRecordIndex)) {
      const { id, name, object_describe_name } = record;
      const currentEditingRecord = Object.assign({}, dataSource[currentEditingRecordIndex] || {}, {
        [object_describe_name]: id,
        [`${object_describe_name}__r`]: {
          id,
          name,
        },
        [`${renderField.api_name}__r`]: {
          id,
          name,
        }
      });
      const newDataSource = _.cloneDeep(dataSource);
      newDataSource.splice(currentEditingRecordIndex, 1, currentEditingRecord)
      this.setState({
        dataSource: newDataSource,
      })
    }
  }

  decorateColumnProps = ({
    columns,
    fieldList,
    location,
    form,
    related_list_name,
  }) => {
    const { currentEditingRecordIndex, refObjectDescribe: { api_name: objectApiName }, parentRecord } = this.state;
    const { pageType, parentApiName } = this.props;
    if (!_.isNull(currentEditingRecordIndex)) {
      columns = columns.map(column => {
        return Object.assign({}, column, {
          render: (text, record, rowIndex) => {
            const { fieldDefinition } = column;
            if (_.isEqual(currentEditingRecordIndex, rowIndex)) {
              return renderFieldComponent({
                related_list_name,
                renderField: fieldDefinition,
                fieldList,
                fieldIndex: rowIndex,
                fieldSectionIndex: currentEditingRecordIndex,
                record: {
                  [related_list_name]: record,
                },
                parentRecord,
                parentApiName,
                objectApiName,
                applyScene: 'section_related_list', // 默认应用到表单中
                columns: [],
                pageType,
                form,
                location,
                onChange: this.relationFormItemChange
              });
            } else {
              return renderCell(text, record, rowIndex, fieldDefinition, objectApiName);
            }
          },
        })
      })
    }
    return columns;
  }

  /**
   * \创建一条新的数据
   */
  createEmptyRecord = (initRecord) => {
    const { component: { fields } } = this.props;
    const record = Object.assign({}, initRecord)
    fields.forEach(element => {
      // record[_.get(element, 'field')] = null;
    });
    return record;
  }

  /**
   * 获取字段定义
   */
  getFieldList = () => {
    const { refObjectDescribe } = this.state;
    return _.get(refObjectDescribe, 'fields');
  }

  render() {
    const {
      refObjectDescribe,
      dataSource,
      loading,
      currentEditingRecordIndex,
      columns,
      location,
      recordAddModalReadyOrAlreadyRender,
      recordAddModalProps,
      recordDetailModalReadyOrAlreadyRender,
      recordDetailModalProps,
      recordEditModalReadyOrAlreadyRender,
      recordEditModalProps,
      parentRecord
    } = this.state;
    const { component } = this.props;

    const { related_list_name, filter_fields: filterFields = [] } = component;
    const fieldList = reOrderFieldListByFilterFields({
      fieldList: this.getFieldList(),
      filterFields
    })

    const { pageType, form } = this.props;
    const renderedColumns = this.decorateColumnProps({
      columns,
      fieldList,
      location,
      form,
      related_list_name,
    });
    
    return (
      <div>
        <Table
          className={styles.table}
          columns={[...renderedColumns, this.appendRowActionColumn({
            component,
          })]}
          dataSource={dataSource}
          rowKey='id'
          loading={loading}
          pagination={false}
          title={
            (record) => {
              return (
                <Row gutter={12} type="flex" justify="space-between" align="bottom">
                  <Col span={24} className="text_right">
                  </Col>
                </Row>
              );
            }
          }
        />
        {
          this.renderActions()
        }
        {
          recordAddModalReadyOrAlreadyRender? <RecordAddModal.newInstance {...recordAddModalProps}/>: null
        }
        {
          recordDetailModalReadyOrAlreadyRender? <RecordDetailModal.newInstance {...recordDetailModalProps}/>: null
        }
        {
          recordEditModalReadyOrAlreadyRender? <RecordEditModal.newInstance {...recordEditModalProps}/>: null
        }
      </div>
    );
  }
}
