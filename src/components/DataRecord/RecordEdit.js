/* eslint-disable no-new-func */
import React, { Component } from 'react';
import _ from 'lodash';
import { hashHistory } from 'dva/router';
import { Modal, Form, Button, Row, Col, message, Collapse } from 'antd';
import * as CallBackUtil from '../../utils/callBackUtil';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import RecordFormItem from './RecordFormItem';
import styles from './detail.less';
import { CallProductKeyMessageFormItem, RenderBar } from '../../components/index';
import { callAnotherFunc } from '../../utils';
import { checkSectionShowable } from './helpers/recordHelper';
import { getExpression } from '../../utils/expressionUtils';
import consoleUtil from '../../utils/consoleUtil';
import {
  appendRelatedFieldToSection,
  getDataSourceMutations,
  checkFieldShowable,
  checkRelatedFieldClear,
  validForm,
} from './common/record';
import { ACTION_EDIT_MODE } from '../../components/DataRecord/common/constants';
import dataFixer from '../../utils/dataFixer';
import Attachment from '../../utils/cache';
import FcModalWidget from '../FcModalWidget';

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

const confirm = Modal.confirm;
const Panel = Collapse.Panel;
class RecordEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      record: props.record || {},
      product_reaction_list: [],
      keyMessage_reaction_list: [],
      isFormItemValueChange: false,
      callBackActionLayout: {},
      callClmCheckedList: [],
      callClm_cascadeList: [],
    };

    /**
     * section related fields
     */
    this.relatedFields = {};
  }

  componentWillUnmount() {
    Attachment.clear();
  }

  getInitialState = () => {};

  relatedADDActionConfirm = (actionLayout) => {
    if (_.get(actionLayout, 'need_callback', false)) {
      CallBackUtil.dealNeedCallBack({
        location: this.props.location,
      });
    }
    const needConfirm = _.get(actionLayout, 'need_confirm', false);
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
    const confirmMessage = crmIntlUtil.fmtStr(
      _.get(
        actionLayout,
        'confirm_message.i18n_key',
        `confirm_message.${_.get(actionLayout, 'action')}`,
      ),
      `${crmIntlUtil.fmtStr('message.yes_or_no', '是否')}${actionLabel}?`,
    );

    if (needConfirm) {
      confirm({
        title: confirmMessage,
        onOk: () => {
          this.relatedADDAction(actionLayout);
        },
        onCancel: () => {
          CallBackUtil.removeCallBack();
        },
      });
    } else {
      this.relatedADDAction(actionLayout);
    }
  };
  okHandlerConfirm = (actionLayout) => {
    const { form, fieldList } = this.props;

    // 判断附件列表是否完成上传
    if (!_.isEmpty(Attachment.cache)) {
      return message.error(
        `${_.get(Attachment.cache, '[0].label')} ${crmIntlUtil.fmtStr(
          'message.upload uncompleted',
        )}`,
      );
    }
    const valid = validForm.bind(this)({
      actionLayout,
      thiz: this,
      form,
      fieldList,
    });

    if (_.isString(valid)) return message.error(valid);

    if (_.get(actionLayout, 'need_callback', false)) {
      CallBackUtil.dealNeedCallBack({
        location: this.props.location,
      });
    }
    const needConfirm = _.get(actionLayout, 'need_confirm', false);
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
    const confirmMessage = crmIntlUtil.fmtStr(
      _.get(
        actionLayout,
        'confirm_message.i18n_key',
        `confirm_message.${_.get(actionLayout, 'action')}`,
      ),
      _.get(
        actionLayout,
        'confirm_message',
        `${crmIntlUtil.fmtStr('message.yes_or_no', '是否')}${actionLabel}?`,
      ),
    );

    if (needConfirm) {
      confirm({
        title: confirmMessage,
        onOk: () => {
          this.okHandler(actionLayout);
        },
        onCancel: () => {
          CallBackUtil.removeCallBack();
        },
      });
    } else {
      _.debounce(this.okHandler, 400)(actionLayout);
    }
  };
  updateActionConfirm = (actionLayout) => {
    if (_.get(actionLayout, 'need_callback', false)) {
      CallBackUtil.dealNeedCallBack({
        location: this.props.location,
      });
    }
    const needConfirm = _.get(actionLayout, 'need_confirm', false);
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
    const confirmMessage = crmIntlUtil.fmtStr(
      _.get(
        actionLayout,
        'confirm_message.i18n_key',
        `confirm_message.${_.get(actionLayout, 'action')}`,
      ),
      `${crmIntlUtil.fmtStr('message.yes_or_no', '是否')}${actionLabel}?`,
    );

    if (needConfirm) {
      confirm({
        title: confirmMessage,
        onOk: () => {
          this.updateAction(actionLayout);
        },
        onCancel: () => {
          CallBackUtil.removeCallBack();
        },
      });
    } else {
      this.updateAction(actionLayout);
    }
  };
  callBackActionConfirm = (actionLayout) => {
    const needConfirm = _.get(actionLayout, 'need_confirm', false);
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
    const confirmMessage = crmIntlUtil.fmtStr(
      _.get(
        actionLayout,
        'confirm_message.i18n_key',
        `confirm_message.${_.get(actionLayout, 'action')}`,
      ),
      `${crmIntlUtil.fmtStr('message.yes_or_no', '是否')}${actionLabel}?`,
    );

    if (needConfirm) {
      confirm({
        title: this.state.isFormItemValueChange
          ? crmIntlUtil.fmtStr('message.is_give_up.edit')
          : confirmMessage,
        onOk: () => {
          this.callBackAction(actionLayout);
        },
      });
    } else if (this.state.isFormItemValueChange) {
      confirm({
        title: crmIntlUtil.fmtStr('message.is_give_up.edit'),
        onOk: () => {
          this.callBackAction(actionLayout);
        },
      });
    } else {
      this.callBackAction(actionLayout);
    }
  };

  /**
   * 内嵌iframe页面打开模式模式窗口容器
   * @param {Object} actionLayout
   */
  onModalWidgetOpen = async (actionLayout) => {
    const { options } = actionLayout;
    const { record } = this.props;
    const instance = await FcModalWidget.newInstance(
      Object.assign({}, options, {
        thizRecord: record, // 方便实施写表达式（return t.id）
        onMessage: (receivedMessageData) => {
          const { action: widgetAction, data: widgetData = {} } = receivedMessageData || {};
          switch (widgetAction) {
            case 'refreshList':
              this.refreshList();
              instance.widget.close();
              break;
            case 'resolvePage': {
              const { hashPath, target = 'self' } = widgetData;
              if (_.isString(hashPath) && !_.isEmpty(hashPath)) {
                switch (target) {
                  case 'blank':
                    window.open(hashPath);
                    break;
                  case 'self':
                    hashHistory.push(hashPath);
                    break;
                  default: {
                    break;
                  }
                }
              }
              break;
            }
            default:
              consoleUtil.warn('模式窗口未知动作', widgetAction);
              break;
          }
        },
      }),
    );
    instance.widget.open();
  };

  updateAction = (actionLayout) => {
    const data = {};
    const { record } = this.props;
    const objectApiName = this.props.object_api_name;
    _.set(data, 'version', _.get(record, 'version'));
    _.set(data, 'id', _.get(record, 'id'));

    // add by wans 2017年9月20日16:43:23
    const defaultFieldVals = _.get(actionLayout, 'default_field_val');
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

    this.props.dispatch({
      type: 'edit_page/update',
      payload: {
        dealData: data,
        object_api_name: objectApiName,
        id: _.get(record, 'id'),
        callBack: this.callBackAction,
      },
    });
  };
  relatedADDAction = (action) => {
    const { record } = this.props;
    const actionCode = _.get(action, 'action_code');
    const refObjDescribeApiName = _.get(action, 'ref_obj_describe');
    const relatedListName = _.get(action, 'related_list_name');
    const recordType = _.get(action, 'target_record_type', 'master');

    const type = recordType;
    let addUrl = '/object_page/:object_api_name/add_page'.replace(
      ':object_api_name',
      refObjDescribeApiName,
    );

    addUrl += `?recordType=${type}&relatedListName=${relatedListName}&parentId=${_.get(
      record,
      'id',
    )}&parentName=${_.get(record, 'name')}`;

    hashHistory.push(addUrl);
  };

  relatedFieldRenderedCallback = ({ ref, name }) => {
    this.relatedFields[name] = ref;
  };

  harvestRelatedFieldInternalState = () => {
    const { relatedFields } = this;
    return _.mapValues(relatedFields, (ref) => {
      const { dataSource, originDataSource } = ref.getInternalState();
      return getDataSourceMutations({
        dataSource,
        originDataSource,
      });
    });
  };

  appendRelatedFieldValuesToCascade = (values) => {
    const relatedFieldValues = this.harvestRelatedFieldInternalState();
    const {
      _cascade: { create = {}, update = {}, delete: deleted = {} },
    } = values;
    const finalValues = Object.assign({}, values, {
      _cascade: {
        create: Object.assign(
          {},
          create,
          _.mapValues(relatedFieldValues, (rfv) => _.get(rfv, 'created', [])),
        ),
        update: Object.assign(
          {},
          update,
          _.mapValues(relatedFieldValues, (rfv) => _.get(rfv, 'updated', [])),
        ),
        delete: Object.assign(
          {},
          deleted,
          _.mapValues(relatedFieldValues, (rfv) => _.get(rfv, 'deleted', [])),
        ),
      },
    });
    return finalValues;
  };

  okHandler = (actionLayout) => {
    const { onOk, component, fieldList } = this.props;
    const { record } = this.state; //* CRM6553 修复t未更新问题，原因是record用的是this.props的旧的
    let okKey = true;

    this.props.form.validateFields((err, values) => {
      if (!err) {
        /**
         * 修正表单数据
         */
        values = dataFixer({
          fieldList,
          record: values,
        });
        const mergedRecord = Object.assign({}, record, values);
        const fun = getExpression(component, 'expression', false);
        if (fun) {
          const validResult = callAnotherFunc(new Function('t', fun), mergedRecord);
          if (!(validResult === true)) {
            okKey = false;
            message.error(crmIntlUtil.fmtStr(validResult));
          }
        }

        if (okKey) {
          _.forEach(values, (value, key) => {
            if (_.has(value, '_isAMomentObject')) {
              _.set(values, key, value.valueOf());
            }
          });

          // add by wans 2017年9月20日16:43:23
          const defaultFieldVals = _.get(actionLayout, 'default_field_val');
          const dcrFieldApiNames = [];
          if (!_.isEmpty(defaultFieldVals)) {
            _.forEach(defaultFieldVals, (defaultFieldValLayout) => {
              const defaultVal = defaultFieldValLayout.val;
              const defaultField = defaultFieldValLayout.field;
              if (_.eq(_.get(defaultFieldValLayout, 'field_type'), 'js')) {
                // 如果配置的为js脚本
                const resultVal = callAnotherFunc(new Function('t', defaultVal), mergedRecord);
                _.set(values, defaultField, resultVal);
              } else {
                _.set(values, defaultField, defaultVal);
              }
            });
          }

          const fieldSections = _.get(component, 'field_sections');

          const newRecord = _.cloneDeep(values);
          _.forEach(fieldSections, (fieldSection) => {
            const fields = _.get(fieldSection, 'fields');
            const dcrFields = _.filter(fields, 'is_dcr');

            _.forEach(dcrFields, (dcrField) => {
              const fieldApiName = _.get(dcrField, 'field');
              const fieldDescribe = _.find(fieldList, { api_name: fieldApiName });
              const fielType = _.get(fieldDescribe, 'type');
              const isDcr = _.get(dcrField, 'is_dcr', false);

              if (isDcr && _.eq(window.DCR_EDIT_CUSTOMER_RULE, '0')) {
                // 是dcr字段  &&  DCR验证后可用
                dcrFieldApiNames.push(fieldApiName);
                if (fielType === 'relation') {
                  const fieldInstance = this.props.form.getFieldInstance(fieldApiName);
                  const targetName = _.get(fieldInstance, 'state.targetName');
                  const targetValue = _.get(fieldInstance, 'state.value');
                  _.set(newRecord, `${fieldApiName}__r.name`, targetName);
                  _.set(newRecord, `${fieldApiName}__r.id`, targetValue);
                }
              }
            });
          });

          const flowFunc = _.flow(
            this.processCascadeRecords,
            this.appendRelatedFieldValuesToCascade,
          );
          const valueWithChildren = flowFunc(_.omit(values, dcrFieldApiNames));
          onOk(valueWithChildren, newRecord, actionLayout, this.callBackAction);
        }
      }
    });
  };

  callBackAction = (actionLayout, recordData = {}) => {
    const { layout, record } = this.props;
    const recordType = _.get(
      actionLayout,
      'target_layout_record_type',
      _.get(layout, 'record_type'),
    );
    const actionCode = _.toUpper(_.get(actionLayout, 'action'));
    const apiName = layout.object_describe_api_name;
    if (actionCode === 'SAVEANDCREATEHCP') {
      //* 绿谷定制需求，新建/编辑临时参会人时，跳转新建医生
      const targetLayoutRecordType = _.get(
        actionLayout,
        'target_layout_record_type',
        'from_attendee',
      );
      const targetObjectApiName = _.get(actionLayout, 'target_object_api_name', 'customer');
      const targetFieldApiName = _.get(actionLayout, 'target_field_api_name', 'event_attendee');
      const pathUrl = `/object_page/${targetObjectApiName}/add_page?recordType=${targetLayoutRecordType}`;
      const routerParams = {};
      routerParams[targetFieldApiName] = _.get(recordData, 'id');
      hashHistory.push({
        pathname: pathUrl,
        state: routerParams,
      });
    } else {
      CallBackUtil.callBackDeal({
        callback_code: _.get(actionLayout, 'callback_code', 'CALLBACK_TO_INDEX'),
        apiName,
        recordType,
        recordId: _.get(recordData, 'id', _.get(record, 'id')),
      });
    }
  };

  processCascadeRecords = (values) => {
    // 拜访的产品选择将需要保存的信息都放在了state里面_cascade，为了兼容以前的代码，这里写个判断，以后需要将地址等其他的地方均封装成组件，统一由_cascade来管理。
    const { _cascade } = this.state;
    if (!_.isEmpty(_cascade)) {
      // 此处是新的代码，用于拜访记录页面，产品的选择功能
      return {
        ...values,
        _cascade,
      };
    } else {
      // 这里是之前的代码，主要用于地址的新增和保存功能
      const { relatedLists } = this.state;
      const create = {};
      for (const relatedListApiName in relatedLists) {
        if (relatedLists.hasOwnProperty(relatedListApiName)) {
          create[relatedListApiName] = relatedLists[relatedListApiName];
        }
      }
      return {
        ...values,
        _cascade: {
          create,
        },
      };
    }
  };

  relationFieldOnChange = ({ fieldApiName, lookupRecord, id }) => {
    const { record } = this.state;
    this.setState({
      record: Object.assign({}, record, {
        [fieldApiName]: id,
        [`${fieldApiName}__r`]: lookupRecord,
      }),
    });
  };

  buttonListItems = (bear) => {
    const { layout, record, edit_mode } = this.props;
    if (
      layout &&
      !_.isEmpty(layout) &&
      layout.containers !== undefined &&
      _.has(layout, 'containers[0].components[0]')
    ) {
      const detailFormComponent = _.find(_.get(layout, 'containers[0].components'), {
        type: 'detail_form',
      });
      const actionList = _.filter(detailFormComponent.actions, (action) => {
        const isfindDetail = _.indexOf(_.get(action, 'show_when'), 'edit');
        return isfindDetail >= 0;
      });

      const buttonList = actionList.map((action) => {
        const buttonShowWhere = _.get(action, 'show_where', ['head', 'bottom']);
        const buttonItem = '';

        const disabledFun = getExpression(action, 'disabled_expression');
        const disabledValidResult = callAnotherFunc(new Function('t', disabledFun), record); // 判断是否禁用编辑按钮，默认不禁用，当满足禁用条件的时候会禁用按钮
        const hiddenDevices = _.toUpper(_.get(action, 'hidden_devices', []));
        const hiddenFun = getExpression(action, 'hidden_expression');
        const hiddenValidResult = callAnotherFunc(new Function('t', hiddenFun), record); // 判断是否隐藏编辑按钮，默认不隐藏，当满足隐藏条件的时候会隐藏按钮

        const disabled_tip_title = disabledValidResult
          ? crmIntlUtil.fmtStr(
              _.get(action, 'disabled_tip_title.i18n_key'),
              _.get(action, 'disabled_tip_title', ''),
            )
          : '';

        if (hiddenValidResult || _.includes(hiddenDevices, 'PC')) {
          return '';
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
        if (_.indexOf(buttonShowWhere, bear) < 0) return null;
        switch (_.toUpper(action.action)) {
          case 'RELATEDADD':
            return (
              <Button
                disabled={disabledValidResult}
                title={disabled_tip_title}
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={this.relatedADDActionConfirm.bind(null, action)}
                key={`related_add_${action.label}`}
              >
                {actionLabel}
              </Button>
            );
          case 'UPDATE':
            return _.toUpper(action.action_code) === 'COMPLETE_CALL' ? (
              <Button
                disabled={disabledValidResult}
                title={disabled_tip_title}
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={_.debounce(this.okHandlerConfirm.bind(this, action), 400)}
                key={`save_${action.label}`}
              >
                {actionLabel}
              </Button>
            ) : (
              <Button
                disabled={disabledValidResult}
                title={disabled_tip_title}
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={this.updateActionConfirm.bind(this, action)}
                key={`update_${action.label}`}
              >
                {actionLabel}
              </Button>
            );
          case 'SAVE':
            return (
              <Button
                disabled={disabledValidResult}
                title={disabled_tip_title}
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={_.debounce(this.okHandlerConfirm.bind(this, action), 400)}
                key={`save_${action.label}`}
              >
                {actionLabel}
              </Button>
            );
          case 'CALLBACK':
            return !_.isEqual(edit_mode, ACTION_EDIT_MODE.embed_modal) ? (
              <Button
                disabled={disabledValidResult}
                title={disabled_tip_title}
                type={`${_.get(action, 'button_class_type', 'default')}`}
                style={{ marginLeft: 8 }}
                onClick={this.callBackActionConfirm.bind(this, action)}
                key={`callback_${action.label}`}
              >
                {actionLabel}
              </Button>
            ) : null;
          case 'MODAL_WIDGET':
            return (
              <Button
                disabled={disabledValidResult}
                title={disabled_tip_title}
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={this.onModalWidgetOpen.bind(this, action)}
                key={`modal_${action.label}`}
              >
                {actionLabel}
              </Button>
            );
          case 'SAVEANDCREATEHCP':
            //* 绿谷定制需求，新建/编辑临时参会人时，新建医生
            return (
              <Button
                disabled={disabledValidResult}
                title={disabled_tip_title}
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={_.debounce(this.okHandlerConfirm.bind(this, action), 400)}
                key="saveAndCreateHCP"
              >
                {actionLabel}
              </Button>
            );
          default:
            return null;
        }
        // ----
        // if (_.toUpper(action.action) === 'RELATEDADD' && _.indexOf(buttonShowWhere, bear) >= 0) {
        //   buttonItem = (
        //     <Button
        //       disabled={disabledValidResult}
        //       title={disabled_tip_title}
        //       type={`${_.get(action, 'button_class_type', 'primary')}`}
        //       style={{ marginLeft: 8 }}
        //       onClick={this.relatedADDActionConfirm.bind(null, action)}
        //       key={`related_add_${action.label}`}
        //     >
        //       {actionLabel}
        //     </Button>
        //   );
        // } else if (_.toUpper(action.action) === 'UPDATE' && _.indexOf(buttonShowWhere, bear) >= 0) {
        //   if (_.toUpper(action.action_code) === 'COMPLETE_CALL') {
        //     // 完成拜访记录时走保存
        //     buttonItem = (
        //       <Button
        //         disabled={disabledValidResult}
        //         title={disabled_tip_title}
        //         type={`${_.get(action, 'button_class_type', 'primary')}`}
        //         style={{ marginLeft: 8 }}
        //         onClick={this.okHandlerConfirm.bind(this, action)}
        //         key={`save_${action.label}`}
        //       >
        //         {actionLabel}
        //       </Button>
        //     );
        //   } else {
        //     buttonItem = (
        //       <Button
        //         disabled={disabledValidResult}
        //         title={disabled_tip_title}
        //         type={`${_.get(action, 'button_class_type', 'primary')}`}
        //         style={{ marginLeft: 8 }}
        //         onClick={this.updateActionConfirm.bind(this, action)}
        //         key={`update_${action.label}`}
        //       >
        //         {actionLabel}
        //       </Button>
        //     );
        //   }
        // } else if (_.toUpper(action.action) === 'SAVE' && _.indexOf(buttonShowWhere, bear) >= 0) {
        //   buttonItem = (
        //     <Button
        //       disabled={disabledValidResult}
        //       title={disabled_tip_title}
        //       type={`${_.get(action, 'button_class_type', 'primary')}`}
        //       style={{ marginLeft: 8 }}
        //       onClick={this.okHandlerConfirm.bind(this, action)}
        //       key={`save_${action.label}`}
        //     >
        //       {actionLabel}
        //     </Button>
        //   );
        // } else if (_.toUpper(action.action) === 'CALLBACK' && _.indexOf(buttonShowWhere, bear) >= 0 && !_.isEqual(edit_mode, ACTION_EDIT_MODE.embed_modal)) {
        //   /**
        //    * 模式窗口编辑情况下不显示返回按钮
        //    */
        //   buttonItem = (
        //     <Button
        //       disabled={disabledValidResult}
        //       title={disabled_tip_title}
        //       type={`${_.get(action, 'button_class_type', 'default')}`}
        //       style={{ marginLeft: 8 }}
        //       onClick={this.callBackActionConfirm.bind(this, action)}
        //       key={`callback_${action.label}`}
        //     >
        //       {actionLabel}
        //     </Button>
        //   );
        // }
        // return buttonItem;
      });

      return (
        <Row className={styles.formButtonGroup}>
          <Col span={24} className="text_right">
            {buttonList}
          </Col>
        </Row>
      );
    } else if (bear === 'head') {
      return (
        <div style={{ marginBottom: 20 }}>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button
                type="default"
                style={{ marginLeft: 8 }}
                onClick={this.callBackActionConfirm.bind(this, {})}
                key="callback"
              >
                返回
              </Button>
            </Col>
          </Row>
        </div>
      );
    }
  };

  recordFormItem = () => {
    const {
      renderViewLayout,
      fieldList,
      component,
      describe,
      relationLookupLayoutList,
      pageType,
      object_api_name: objectApiName,
      relatedListComponents,
      form,
      edit_mode,
    } = this.props;
    const { record } = this.state;
    const { component_name, type } = component;

    if (type === 'detail_form') {
      const fieldSections = component.field_sections;
      if (fieldSections && fieldSections.length > 0) {
        const content = [];
        const recordFormItems = fieldSections.map((fieldSection, index) => {
          const dataItem = record;
          const columns = fieldSection.columns;

          let needDisplay = checkSectionShowable(fieldSection, 'web', 'edit');
          if (_.startsWith(pageType, 'edit')) {
            if (_.indexOf(_.get(fieldSection, 'hidden_when'), 'edit') >= 0) {
              needDisplay = false;
            }
          }

          if (needDisplay) {
            let formRowItems;
            const fieldSectionFields = _.get(fieldSection, 'fields', []);
            const isExtender = _.get(fieldSection, 'is_extender', false);

            if (isExtender) {
              // 如果渲染字段fields是空的，或者没有配置，检查是否配置的为组件
              const fieldName = _.get(fieldSection, 'fields[0].field');
              const fieldItem = fieldName ? _.find(fieldList, { api_name: fieldName }) : '';
              const formItemExtender = _.get(fieldSection, 'form_item_extender');
              const formItemExtenderFilterLayout = _.get(fieldSection, 'form_item_extender_filter');
              const contentSpan = _.floor(24 / columns);
              const colKey = `row_${index}_${formItemExtender}`;
              switch (formItemExtender) {
                case 'CallProductKeyMessageFormItem':
                  {
                    const buildCall_cascade = () => {
                      const { productCheckedList, reactionList } = this.state;
                      const {
                        defaultCallProductRecordList,
                        defaultCallKeyMessageRecordList,
                        defaultProductCheckedList,
                        defaultProductReactionList,
                        defaultKeyMessageCheckedList,
                        defaultKeyMessageReactionList,
                        product_reaction_list,
                        keyMessage_reaction_list,
                        callClm_cascadeList,
                        callClmCheckedList,
                      } = this.state;

                      const createCallProductList = [];
                      const updateCallProductList = [];
                      const deleteCallProductList = [];

                      const createKeyMessageList = [];
                      const updateKeyMessageList = [];
                      let deleteKeyMessageList = [];

                      const callClmAndReactionList = [];

                      // consoleUtil.log('===========buildCall_cascade===========')
                      // 重组create，根据新增的产品来重组产品反馈和关键信息反馈的新增集合
                      const createCallProductIds = _.difference(
                        _.map(productCheckedList, 'id'),
                        _.map(defaultProductCheckedList, 'id'),
                      ); // 判断新增的product
                      if (!_.isEmpty(createCallProductIds)) {
                        _.forEach(createCallProductIds, (prodId) => {
                          // 构建createCallProductList
                          const thisProductReactionList = _.filter(product_reaction_list, {
                            id: prodId,
                          });
                          if (!_.isEmpty(thisProductReactionList)) {
                            _.forEach(thisProductReactionList, (productReaction) => {
                              createCallProductList.push({
                                product: prodId,
                                reaction: productReaction.reaction,
                                importance: productReaction.importance,
                              });
                            });
                          } else {
                            createCallProductList.push({
                              product: prodId,
                            });
                          }

                          // 构建createKeyMessageList
                          const thisKeyMessageReactionList = _.filter(keyMessage_reaction_list, {
                            productId: prodId,
                          });

                          _.forEach(thisKeyMessageReactionList, (keyMessageReaction) => {
                            createKeyMessageList.push({
                              key_message: keyMessageReaction.id,
                              product: prodId,
                              reaction: _.get(keyMessageReaction, 'reaction'),
                            });
                          });
                        });
                      }

                      // 重组delete，根据删除的product来重组产品反馈和关键反馈的删除集合。删除该产品的所有下属集合
                      const deleteCallProductIds = _.difference(
                        _.map(defaultProductCheckedList, 'id'),
                        _.map(productCheckedList, 'id'),
                      ); // 判断删除的product
                      if (!_.isEmpty(deleteCallProductIds)) {
                        _.forEach(deleteCallProductIds, (prodId) => {
                          const callProduct = _.find(defaultCallProductRecordList, {
                            product: prodId,
                          });
                          const callProductId = callProduct.id;

                          // 如果删除了product的话，所有的产品反馈都需要删除，deleteCallProductList
                          deleteCallProductList.push({
                            id: callProductId,
                          });

                          // 如果删除了product的时候，所有的关键信息反馈都需要删除
                          deleteKeyMessageList = _.concat(
                            deleteKeyMessageList,
                            _.map(
                              _.filter(defaultCallKeyMessageRecordList, { product: prodId }),
                              (callKeyMessage) => {
                                return { id: callKeyMessage.id };
                              },
                            ),
                          );
                        });
                      }

                      /** 如果产品选择没有变动的话，那么针对这样的情况，进行分解。
                       * 包含：
                       * 1、产品反馈的更新
                       * 2、关键信息的新增、更新、删除
                       */
                      const stubbornCallProductIds = _.intersectionBy(
                        defaultProductCheckedList,
                        productCheckedList,
                        'id',
                      ); // _.difference(_.map(defaultProductCheckedList,'id'),_.map(productCheckedList,'id'));//判断没有变动的product
                      // consoleUtil.log('stubbornCallProductIds',stubbornCallProductIds)
                      if (!_.isEmpty(stubbornCallProductIds)) {
                        _.forEach(stubbornCallProductIds, (stubbornCallProduct) => {
                          const productId = stubbornCallProduct.id;

                          // 1、产品反馈的更新处理
                          // 处理产品反馈中reaction更新的数组集合，因为productReaction是不可新增或者减少的，所以可以直接对比是否更新了reaction数据
                          // productReactionList  [{id:123456,name:'abc',reaction:1}]
                          const diffCallProductReactionList = _.differenceWith(
                            _.filter(product_reaction_list, { id: productId }),
                            _.filter(defaultProductReactionList, { id: productId }),
                            _.isEqual,
                          );
                          if (!_.isEmpty(diffCallProductReactionList)) {
                            _.forEach(diffCallProductReactionList, (diffCallProductReaction) => {
                              const productId = diffCallProductReaction.id;
                              const callProductRecord = _.find(defaultCallProductRecordList, {
                                product: productId,
                              });
                              const callProductRecordId = _.get(callProductRecord, 'id');
                              const callProductRecordVersion = _.get(callProductRecord, 'version');
                              updateCallProductList.push({
                                id: callProductRecordId,
                                reaction: diffCallProductReaction.reaction,
                                version: callProductRecordVersion,
                                importance: diffCallProductReaction.importance,
                              });
                            });
                          }

                          // consoleUtil.log('diffCallProductReactionList',product_reaction_list,defaultProductReactionList,diffCallProductReactionList)

                          // 2、关键信息的新增、更新、删除
                          // 从全部关键信息反馈集合中，得到当前需要处理的product下的关键信息集合，
                          // 因为关键信息可能、更新、删除，所以不能直接比对，需要获取制定productId下的关键信息反馈集合，进行新增、更新、删除的处理
                          // keyMessageReactionList  [{id:123456,productId:123456,name:'abc',reaction:1}]
                          const needDealProductKeyMessageReactionList = _.filter(
                            keyMessage_reaction_list,
                            {
                              productId,
                            },
                          ); // keyMessage_reaction_list 包含已经选定的关键信息和关键信息的反馈结果，下面将要获取的关键信息列表和对应的反馈结果都可以获取到
                          const defaultProductKeyMessageReactionList = _.filter(
                            defaultKeyMessageReactionList,
                            {
                              productId,
                            },
                          );

                          // 处理关键信息反馈中新增的数组集合
                          const createProductKeyMessageList = _.differenceBy(
                            needDealProductKeyMessageReactionList,
                            defaultProductKeyMessageReactionList,
                            'id',
                          ); // 判断新增的product
                          _.forEach(createProductKeyMessageList, (createProductKeyMessage) => {
                            createKeyMessageList.push({
                              key_message: createProductKeyMessage.id,
                              product: productId,
                              reaction: createProductKeyMessage.reaction,
                            });
                          });

                          // 处理关键信息反馈中更新的数组集合
                          const updateProductKeyMessageList = _.intersectionWith(
                            needDealProductKeyMessageReactionList,
                            defaultProductKeyMessageReactionList,
                            (
                              needDealProductKeyMessageReaction,
                              defaultProductKeyMessageReaction,
                            ) => {
                              return (
                                _.eq(
                                  needDealProductKeyMessageReaction.id,
                                  defaultProductKeyMessageReaction.id,
                                ) &&
                                !_.eq(
                                  needDealProductKeyMessageReaction.reaction,
                                  defaultProductKeyMessageReaction.reaction,
                                )
                              );
                            },
                          );

                          if (!_.isEmpty(updateProductKeyMessageList)) {
                            _.forEach(updateProductKeyMessageList, (updateProductKeyMessage) => {
                              const keyMessageId = _.get(updateProductKeyMessage, 'id');
                              const callKeyMessageRecord = _.find(defaultCallKeyMessageRecordList, {
                                key_message: keyMessageId,
                                product: productId,
                              });
                              const callKeyMessageRecordId = _.get(callKeyMessageRecord, 'id');
                              const callKeyMessageRecordVersion = _.get(
                                callKeyMessageRecord,
                                'version',
                              );
                              updateKeyMessageList.push({
                                id: callKeyMessageRecordId,
                                reaction: _.get(updateProductKeyMessage, 'reaction'),
                                version: callKeyMessageRecordVersion,
                              });
                            });
                          }

                          // 处理关键信息反馈中删除的数组集合
                          const deleteProductKeyMessageList = _.differenceBy(
                            defaultProductKeyMessageReactionList,
                            needDealProductKeyMessageReactionList,
                            'id',
                          ); // 判断新增的product

                          _.forEach(deleteProductKeyMessageList, (deleteProductKeyMessage) => {
                            const keyMessageId = _.get(deleteProductKeyMessage, 'id');
                            const callKeyMessageRecord = _.find(defaultCallKeyMessageRecordList, {
                              key_message: keyMessageId,
                              product: productId,
                            });
                            const callKeyMessageRecordId = _.get(callKeyMessageRecord, 'id');
                            deleteKeyMessageList.push({
                              id: callKeyMessageRecordId,
                            });
                          });
                        });
                      }

                      const _cascade = {
                        create: {
                          call_call_key_message_list: createKeyMessageList,
                          call_call_product_list: createCallProductList,
                          call_survey_feedback_list: callClm_cascadeList.create,
                        },
                        update: {
                          call_call_key_message_list: updateKeyMessageList,
                          call_call_product_list: updateCallProductList,
                          call_survey_feedback_list: callClm_cascadeList.update,
                        },
                        delete: {
                          call_call_key_message_list: deleteKeyMessageList,
                          call_call_product_list: deleteCallProductList,
                          call_survey_feedback_list: callClm_cascadeList.delete,
                        },
                      };
                      this.setState({ _cascade }, () => {
                        consoleUtil.log('_cascade', _cascade);
                      });
                    };

                    const productKeyMessageFormItemProps = {
                      parentRecord: record,
                      formItemExtenderFilterLayout,
                      fieldSection,
                      onProductReactionChange: (values) => {
                        const product_reaction_list = _.get(values, 'product_reaction_list');
                        this.setState({ product_reaction_list }, () => {
                          buildCall_cascade();
                        });
                      },
                      onKeyMessageReactionChange: (values) => {
                        const keyMessage_reaction_list = _.get(values, 'keyMessage_reaction_list');
                        this.setState({ keyMessage_reaction_list }, () => {
                          buildCall_cascade();
                        });
                      },

                      onProductChange: (values) => {
                        this.setState({ productCheckedList: values }, () => {
                          buildCall_cascade();
                        });
                      },
                      loadDefaultRecordData: (values) => {
                        const {
                          productCheckedList,
                          defaultCallProductRecordList,
                          defaultCallKeyMessageRecordList,
                          defaultProductCheckedList,
                          defaultProductReactionList,
                          defaultKeyMessageCheckedList,
                          defaultKeyMessageReactionList,
                          product_reaction_list,
                          keyMessage_reaction_list,
                        } = values;

                        if (!_.isEmpty(productCheckedList)) {
                          this.setState({ productCheckedList }, () => {});
                        }
                        if (!_.isEmpty(defaultCallProductRecordList)) {
                          this.setState({ defaultCallProductRecordList }, () => {});
                        }
                        if (!_.isEmpty(defaultCallKeyMessageRecordList)) {
                          this.setState({ defaultCallKeyMessageRecordList }, () => {});
                        }
                        if (!_.isEmpty(defaultProductCheckedList)) {
                          this.setState({ defaultProductCheckedList }, () => {});
                        }
                        if (!_.isEmpty(defaultProductReactionList)) {
                          this.setState({ defaultProductReactionList }, () => {});
                        }
                        if (!_.isEmpty(defaultKeyMessageCheckedList)) {
                          this.setState({ defaultKeyMessageCheckedList }, () => {});
                        }
                        if (!_.isEmpty(defaultKeyMessageReactionList)) {
                          this.setState({ defaultKeyMessageReactionList }, () => {});
                        }
                        if (!_.isEmpty(product_reaction_list)) {
                          this.setState({ product_reaction_list }, () => {});
                        }
                        if (!_.isEmpty(keyMessage_reaction_list)) {
                          this.setState({ keyMessage_reaction_list }, () => {});
                        }
                      },
                      onCallClmListchange: (values) => {
                        this.setState({ callClmCheckedList: values }, () => {
                          buildCall_cascade();
                        });
                      },
                      onCallClmReactionChange: (values) => {
                        this.setState({ callClm_cascadeList: values }, () => {
                          buildCall_cascade();
                        });
                      },
                    };

                    formRowItems = (
                      <Col span={contentSpan} key={colKey}>
                        <CallProductKeyMessageFormItem {...productKeyMessageFormItemProps} />
                      </Col>
                    );
                  }
                  break;
                default: {
                  break;
                }
              }
            }

            // 根据配置的fields，渲染出form表单，开始
            if (!isExtender) {
              formRowItems = fieldSectionFields.map((renderField, fieldIndex) => {
                if (fieldList && !_.isEmpty(fieldList)) {
                  const fieldApiName = _.get(renderField, 'field');

                  const formRowKey = `form_item_row_${index}_${fieldIndex}_${_.get(
                    location,
                    'query._k',
                  )}`;
                  const colKey = `row_${index}_${fieldIndex}`;
                  const contentSpan = _.floor(24 / columns);

                  /**
                   * 检查表单项是否可以显示
                   */
                  const showable = checkFieldShowable({
                    renderField,
                    pageType,
                    edit_mode,
                    dataItem,
                  });

                  if (showable) {
                    if (!_.isEmpty(fieldApiName)) {
                      const fieldItem = _.find(fieldList, { api_name: renderField.field });
                      if (_.isEmpty(fieldItem)) {
                        consoleUtil.error(
                          '[配置错误]：字段Record在对象描述里面没有找到：',
                          objectApiName,
                          fieldApiName,
                        );
                        return;
                      }

                      const fieldLabel = fieldItem.label;
                      const hasFieldPrivilege = fc_hasFieldPrivilege(objectApiName, fieldApiName, [
                        4,
                      ]);
                      if (!hasFieldPrivilege) {
                        consoleUtil.warn('[权限不足]：', objectApiName, fieldApiName, fieldLabel);
                        return;
                      }

                      const recordFormItemProps = {
                        objectApiName,
                        dataItem: record,
                        fieldItem,
                        renderFieldItem: renderField,
                        relationLookupLayoutList,
                        form: this.props.form,
                        formItemLayout,
                        dispatch: this.props.dispatch,
                        pageType: this.props.pageType,
                        onChange: (val, lookupRecord) => {
                          const triggerRelationFieldOnChange = () => {
                            /**
                             * 保存relation对象的信息
                             * 主要保存__r
                             */
                            this.relationFieldOnChange({
                              fieldApiName,
                              lookupRecord,
                              id: val,
                            });
                          };

                          // 处理级联设值的情况
                          const { onLookupChange } = renderField;
                          this.setState({
                            isFormItemValueChange: true,
                          });
                          if (onLookupChange) {
                            const { record } = this.state;
                            const { setFields } = onLookupChange;
                            const updateFields = {};

                            setFields.forEach(({ source, target }) => {
                              updateFields[target] = _.get(lookupRecord, source);
                            });
                            this.setState(
                              {
                                record: Object.assign({}, record, updateFields),
                              },
                              triggerRelationFieldOnChange,
                            );
                          } else {
                            triggerRelationFieldOnChange();
                          }

                          const { onChange } = renderField;
                          if (onChange) {
                            // const { record } = this.state;
                            const clearList = {};
                            const { setFieldsValue } = form;
                            if (_.isObject(onChange)) {
                              let { clear } = onChange;
                              if (_.isString(clear)) {
                                clear = [clear];
                              }
                              clear.forEach((related_list_name) => {
                                clearList[related_list_name] = undefined;
                              });
                              setFieldsValue(clearList);
                            }
                          }

                          checkRelatedFieldClear.bind(this)({
                            renderField,
                          });
                        },
                        formItemValueChange: (isChange) => {
                          this.setState({
                            isFormItemValueChange: isChange,
                          });
                        },
                      };

                      return (
                        <Col span={contentSpan} key={colKey}>
                          <RecordFormItem {...recordFormItemProps} key={formRowKey} />
                        </Col>
                      );
                    } else if (_.endsWith(_.get(renderField, 'render_type'), '_bar')) {
                      return (
                        <Col span={contentSpan} key={colKey}>
                          <RenderBar renderLayout={renderField} key={formRowKey} />
                        </Col>
                      );
                    } else {
                      return false;
                    }
                  }
                } else {
                  return '没有找到表单渲染字段';
                }
              });

              /**
               * 添加相关列表到表单中
               */
              formRowItems = appendRelatedFieldToSection({
                fieldSection,
                relatedListComponents,
                formRowItems,
                parentRecord: record,
                pageType,
                location,
                form,
                parentApiName: objectApiName,
                rendered_callback: this.relatedFieldRenderedCallback,
              });
            }
            // 根据配置的fields渲染出表单，结束

            // const header = crmIntlUtil.fmtStr(_.get(fieldSection, 'header.i18n_key', _.get(fieldSection, 'header', `header_${_.get(fieldSection, 'id')}`)));
            const header = crmIntlUtil.fmtStr(
              _.get(fieldSection, 'header.i18n_key'),
              _.get(fieldSection, 'header', `header_${_.get(fieldSection, 'id')}`),
            );
            const field_section_key = _.get(fieldSection, 'id');
            if (!_.isEmpty(renderViewLayout)) {
              const renderView = _.get(renderViewLayout, 'view');
              const viewOptions = _.get(renderViewLayout, 'view_options');
              const customPanelStyle = _.get(
                viewOptions,
                `custom_panel_style.${field_section_key}`,
                _.get(viewOptions, 'custom_panel_style.default'),
              );
              const defaultDisabledKeys = _.get(viewOptions, 'default_disabled_key');
              const needPanelDisabled = _.indexOf(defaultDisabledKeys, field_section_key) >= 0;
              switch (renderView) {
                case 'collapse': {
                  return (
                    <Panel
                      header={header}
                      disabled={needPanelDisabled}
                      key={field_section_key}
                      className={styles.fieldSectionHeader}
                      style={customPanelStyle}
                    >
                      <Row type="flex">{formRowItems}</Row>
                    </Panel>
                  );
                }
                default: {
                  break;
                }
              }
            } else {
              return (
                <div key={header} style={{ marginBottom: 20 }}>
                  {header && (
                    <Row className={styles.fieldSectionHeader}>
                      <Col span={24}>
                        <span>{header}</span>
                      </Col>
                    </Row>
                  )}
                  <Row className={styles.fieldSectionForm} type="flex">
                    {formRowItems}
                  </Row>
                </div>
              );
            }
          }
        });

        if (!_.isEmpty(renderViewLayout)) {
          const renderView = _.get(renderViewLayout, 'view');
          const viewOptions = _.get(renderViewLayout, 'view_options');
          const defaultActiveKey = _.get(viewOptions, 'default_active_key');
          const isAccordion = _.get(viewOptions, 'is_accordion', false);
          const isBordered = _.get(viewOptions, 'is_bordered', true);
          switch (renderView) {
            case 'collapse': {
              return recordFormItems ? (
                <div>
                  <Collapse
                    accordion={isAccordion}
                    bordered={isBordered}
                    defaultActiveKey={defaultActiveKey}
                  >
                    {recordFormItems}
                  </Collapse>
                </div>
              ) : null;
            }
            default: {
              break;
            }
          }
        } else {
          return recordFormItems ? (
            <div>
              <Form horizontal key={component_name}>
                {recordFormItems}
              </Form>
            </div>
          ) : null;
        }
      } else {
        return '正在渲染。';
      }
    } else {
      return '';
    }
  };

  render() {
    return (
      <div>
        {this.buttonListItems('head')}
        {this.recordFormItem()}
        {this.buttonListItems('bottom')}
      </div>
    );
  }
}

export default Form.create()(RecordEdit);
