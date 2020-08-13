/**
 * @flow
 */

import React from 'react';
import _ from 'lodash';
// import moment from 'moment';
import { hashHistory } from 'dva/router';
import { Modal, Button, Row, Col, Table, message, Menu, Dropdown, Icon } from 'antd';
import * as CallBackUtil from '../../utils/callBackUtil';
import RecordDetail from '../DataRecord/RecordDetail';
import RelatedDetail from '../DataRecord/RelatedDetail';
import RecordOperationItem from '../DataRecord/RecordOperationItem';
import * as crmIntlUtil from '../../utils/crmIntlUtil';

import Warner from '../Page/Warner';

import config from '../../utils/config';
import { callAnotherFunc } from '../../utils';
import { checkForHiddenDevice } from '../../utils/tools';
import { getExpression } from '../../utils/expressionUtils';
import {
  checkRenderConditions,
  getRelatedListComponents,
  getRelatedListInkProperties,
  getRelatedListInkPropertiesFromLayout,
  checkValidExpression,
  parseParamsExpression,
} from './common/page';
import { ACTION_EDIT_MODE } from '../DataRecord/common/constants';
import WorkFlowModalFom from '../workFlow/workFlowModalFom';

const { baseURL, workFlowURL } = config;
const Base64 = require('js-base64').Base64;
const moment = require('moment');

const confirm = Modal.confirm;

class ObjectPageDetail extends React.Component {
  constructor(props) {
    super(props);

    this.initRelatedList();
    this.state = {
      workFlowModalFomState: false,
      WorkFlowModalFomTitleType: '',
      currentButtonAction: {},
      palyClmItemProps: {
        visible: false,
        title: '',
        clmHtmlUrl: '',
      },
      eventCodeModalStatus: false,
      eventCodeValue: '',
    };
  }

  initRelatedList = () => {
    const { dispatch, layout } = this.props;
    if (dispatch) {
      const { relatedListName, refObjDescribe } = getRelatedListInkPropertiesFromLayout({
        layout,
      });
      dispatch({
        type: 'detail_page/buildRelateFieldList',
        payload: { relatedListName, refObjDescribe },
      });
    }
  };

  editActionConfirm = (actionLayout) => {
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
      _.get(actionLayout, 'confirm_message.i18n_key'),
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
          this.editAction(actionLayout);
        },
        onCancel: () => {
          if (_.get(actionLayout, 'need_callback', false)) {
            CallBackUtil.removeCallBack();
          }
        },
      });
    } else {
      this.editAction(actionLayout);
    }
  };

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
      _.get(actionLayout, 'confirm_message.i18n_key'),
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
          this.relatedADDAction(actionLayout);
        },
        onCancel: () => {
          if (_.get(actionLayout, 'need_callback', false)) {
            CallBackUtil.removeCallBack();
          }
        },
      });
    } else {
      this.relatedADDAction(actionLayout);
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
      _.get(actionLayout, 'confirm_message.i18n_key'),
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
          this.updateAction(actionLayout);
        },
        onCancel: () => {
          if (_.get(actionLayout, 'need_callback', false)) {
            CallBackUtil.removeCallBack();
          }
        },
      });
    } else {
      this.updateAction(actionLayout);
    }
  };

  historyBackActionConfirm = (actionLayout) => {
    /**
     * 返回前一页（或关闭本页面）
     * <li>如果没有前一页历史，则直接关闭当前页面</li>
     * Internet Explorer和Opera从0开始，而Firefox、Chrome和Safari从1开始
     */
    if (navigator.userAgent.indexOf('MSIE') >= 0 || navigator.userAgent.indexOf('Opera') >= 0) {
      // IE || Opera
      if (window.history.length > 0) {
        window.history.go(-1);
      } else {
        window.opener = null;
        window.close();
      }
    } else {
      // 非IE浏览器
      if (window.history.length > 1) {
        window.history.go(-1);
      } else {
        window.opener = null;
        window.close();
      }
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
      _.get(actionLayout, 'confirm_message.i18n_key'),
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
          this.callBackAction(actionLayout);
        },
      });
    } else {
      this.callBackAction(actionLayout);
    }
  };

  onCustomActionButtonClick = (actionDef) => {
    const { describe, dispatch, record } = this.props;
    const { api_name: objectApiName } = describe;
    const action = (describe.actions || {})[actionDef.action] || null;
    if (action !== null) {
      /**
       * 验证actionLayout 上的valid_expression表达式
       */

      const valid_result = checkValidExpression({
        layout: actionDef,
        thizRecord: record,
      });
      if (_.isString(valid_result)) {
        message.error(valid_result);
        return false;
      }

      const params = parseParamsExpression(
        Object.assign({}, action.params || {}, actionDef.params),
        record,
      );

      dispatch({
        type: 'detail_page/callCustomAction',
        payload: {
          objectApiName,
          action: actionDef.action,
          actionLayout: actionDef,
          ids: [record.id],
          params,
          thiz: {
            callBackAction: () => {
              this.callBackAction(actionDef);
            },
            editAction: () => {
              this.editAction(actionDef);
            },
          },
        },
      });
    }
  };

  submitApprovalActionConfirm = (actionLayout) => {
    // if (_.get(actionLayout, 'need_callback', false)) {
    //   CallBackUtil.dealNeedCallBack({
    //     location: this.props.location
    //   });
    // }
    /**
     * 验证actionLayout 上的valid_expression表达式
     */
    const { record } = this.props;
    const valid_result = checkValidExpression({
      layout: actionLayout,
      thizRecord: record,
    });
    if (_.isString(valid_result)) {
      message.error(valid_result);
      return;
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
      _.get(actionLayout, 'confirm_message.i18n_key'),
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
          this.onSubmitApproval(actionLayout);
        },
        onCancel: () => {
          // if (_.get(actionLayout, 'need_callback', false)) {
          //   CallBackUtil.removeCallBack();
          // }
        },
      });
    } else {
      this.onSubmitApproval(actionLayout);
    }
  };

  onSubmitApproval = (actionDef) => {
    const { describe, dispatch, record } = this.props;
    const { api_name: objectApiName } = describe;
    const { flow_api_name } = actionDef;
    dispatch({
      type: 'detail_page/submitApproval',
      payload: {
        record_id: record.id,
        record_api_name: objectApiName,
        flow_api_name,
        record_type: record.record_type,
      },
    });
  };

  editAction = (action) => {
    const { layout, record, location } = this.props;
    const recordType = _.get(action, 'target_layout_record_type', _.get(layout, 'record_type'));
    const apiName = layout.object_describe_api_name;
    let editUrl = 'object_page/:object_api_name/:record_id/edit_page'
      .replace(':object_api_name', apiName)
      .replace(':record_id', record.id);
    if (recordType) editUrl += `?recordType=${recordType}`;
    hashHistory.push(editUrl);
  };

  relatedADDAction = (action) => {
    const { layout, record } = this.props;
    const actionCode = _.get(action, 'action_code');
    const refObjDescribeApiName = _.get(action, 'ref_obj_describe');
    const relatedListName = _.get(action, 'related_list_name');
    const recordType = _.get(action, 'target_layout_record_type');
    let addUrl = '/object_page/:object_api_name/add_page'.replace(
      ':object_api_name',
      refObjDescribeApiName,
    );
    addUrl += `?recordType=${recordType}&relatedListName=${relatedListName}&parentId=${_.get(
      record,
      _.get(action, 'target_value_field', 'id'),
    )}&parentName=${_.get(record, 'name')}`;

    hashHistory.push(addUrl);
  };

  printEvent = (action) => {
    const { record } = this.props;
    const EventId = record.id;
    const token = localStorage.getItem('token');
    const DataStr = `{"head":{"token":"${token}"},"body":{"joiner":"and","objectApiName":"event_attendee","criterias":[{"field":"event","operator":"==","value":[${EventId}]}],"pageNo":1,"pageSize":1000,"order":"desc","orderBy":"is_walkin_attendee"}}`;
    const Base64Str = Base64.encode(DataStr);

    const { data_fetch, template_api_name, ref_obj_describe } = action;

    const Url = `${baseURL}/rest/data_record/print/${ref_obj_describe ||
      'event'}/${EventId}?data=${Base64Str}&data_fetch=${data_fetch ||
      ''}&template_api_name=${template_api_name || ''}`;
    const myWin = window.open(
      Url,
      '_blank',
      // 'fullscreen=1,toolbar=0,scrollbars=1,location=0,directories=0,status=0,menubar=0,resizable=0,top=0,left=0',
      // false,
    );
    // myWin.moveTo(0, 0);
    // myWin.resizeTo(screen.availWidth, screen.availHeight);
  };

  updateAction = (actionLayout) => {
    const data = {};
    const { record } = this.props;
    const objectApiName = record.object_describe_name;
    _.set(data, 'version', _.get(record, 'version'));
    _.set(data, 'id', _.get(record, 'id'));
    _.set(data, 'status', _.get(record, 'status'));

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

    /**
     * 验证actionLayout 上的valid_expression表达式
     */
    const valid_result = checkValidExpression({
      layout: actionLayout,
      thizRecord: record,
    });

    if (_.isNull(valid_result) || _.isEqual(valid_result, true)) {
      // if (objectApiName === 'coach_feedback') {
      //   this.props.dispatch({
      //     type: 'detail_page/UpdateUnback',
      //     payload: { dealData: data, object_api_name: objectApiName, id: _.get(record, 'id') },
      //   });
      // } else {
      //
      // }
      this.props.dispatch({
        type: 'detail_page/update',
        payload: {
          dealData: data,
          object_api_name: objectApiName,
          id: _.get(record, 'id'),
          actionLayout,
          callBack: this.callBackAction,
        },
      });
    } else {
      message.error(valid_result);
    }
  };

  callBackAction = (actionLayout, recordData = {}) => {
    const { layout, record } = this.props;
    const recordType = _.get(
      actionLayout,
      'target_layout_record_type',
      _.get(layout, 'record_type'),
    );
    const apiName = layout.object_describe_api_name;

    CallBackUtil.callBackDeal({
      callback_code: _.get(actionLayout, 'callback_code', 'CALLBACK_TO_INDEX'),
      apiName,
      recordType,
      recordId: _.get(record, 'id'),
    });
  };

  onCancelWorkFlowModalFom = () => {
    this.setState({
      workFlowModalFomState: false,
      WorkFlowModalFomTitleType: '',
    });
  };

  onOkWorkFlowModalFom = (data) => {
    this.setState({
      workFlowModalFomState: false,
      WorkFlowModalFomTitleType: '',
    });
    const { describe, dispatch, record } = this.props;
    const { currentButtonAction } = this.state;
    const actionCode = _.get(currentButtonAction, 'action_code', '');
    const workflowResult = _.get(record, 'workflowResult', {});
    const businessKey = _.get(record, 'approval_flow_business_key', '');
    const taskId = `${_.get(workflowResult, 'current_user_operation_task.id', '')}`;
    const procInstId = _.get(workflowResult, 'proc_inst_id', '');
    const priority = _.get(workflowResult, 'priority', '');
    const comment = _.get(data, 'comment', '');
    const assigneeList =
      actionCode === 'workflow_add_execution' ? _.get(data, 'selectIds', []) : [];
    const assignee = actionCode === 'workflow_delegate' ? _.get(data, 'selectIds[0]', '') : '';
    const attachmentsArr = _.get(data, 'attachments', []);
    const attachments = [];
    _.map(attachmentsArr, (item) => {
      attachments.push({
        url: item,
        name: '',
        description: '',
      });
    });

    const { api_name: objectApiName } = describe;
    const actionParams = _.get(currentButtonAction, 'params', {});
    const params = Object.assign({}, actionParams, {
      taskId,
      procInstId,
      assigneeList,
      assignee,
      priority,
      comment,
      attachments,
      businessKey,
    });

    dispatch({
      type: 'detail_page/callCustomAction',
      payload: {
        objectApiName,
        action: currentButtonAction.action,
        actionLayout: currentButtonAction,
        ids: [],
        params,
      },
    });
  };

  // *显示工作流操作弹层
  onWorlFlowShowModal = (action) => {
    let WorkFlowModalFomTitleType = '';
    const actionCode = _.get(action, 'action_code', '');
    switch (actionCode) {
      case 'workflow_agree':
        // *同意
        WorkFlowModalFomTitleType = 'AGREE';
        break;
      case 'workflow_reject':
        // *拒绝
        WorkFlowModalFomTitleType = 'REJECT';
        break;
      case 'workflow_add_execution':
        // *加签
        WorkFlowModalFomTitleType = 'ADDSIGN';
        break;
      case 'workflow_delegate':
        // *委托
        WorkFlowModalFomTitleType = 'ENTRUST';
        break;
      case 'workflow_recall':
        // *撤回
        WorkFlowModalFomTitleType = 'WITHDRAW';
        break;
      default:
        WorkFlowModalFomTitleType = '';
    }
    this.setState({
      workFlowModalFomState: true,
      WorkFlowModalFomTitleType,
      currentButtonAction: action,
    });
  };

  // *工作流审批历史
  onWorlFlowApprovalHistoryButtonClick = () => {
    const { record } = this.props;
    const businessKey = _.get(record, 'approval_flow_business_key', '');
    hashHistory.push({
      pathname: '/external_page/approval_history/index_page',
      state: {
        object_page: {
          external_page_param: `token={{fc_token}}\nid=${businessKey}`,
          external_page_src: `${workFlowURL}/#/iframe/approval_historic_list`,
        },
      },
    });
  };

  // *工作流提交审批
  onWorlFlowSubmitButtonClick = (actionDef) => {
    /**
     * 验证actionLayout 上的valid_expression表达式
     */
    const { describe, dispatch, record } = this.props;

    const valid_result = checkValidExpression({
      layout: actionDef,
      thizRecord: record,
    });
    if (_.isString(valid_result)) {
      message.error(valid_result);
      return false;
    }
    confirm({
      title: '确认提交审批？',
      onOk: () => {
        const { api_name: objectApiName } = describe;
        const { business_title } = actionDef;
        const actionParams = _.get(actionDef, 'params', {});
        const business_title_str = callAnotherFunc(
          new Function('t', business_title.expression),
          record,
        );
        const params = Object.assign({}, actionParams, {
          record: {},
          business_title: business_title_str,
          business_object_api_name: objectApiName,
          business_record_id: `${record.id}`,
          businessKey: `${_.get(record, 'workflowResult.id', '')}`,
        });
        dispatch({
          type: 'detail_page/callCustomAction',
          payload: {
            objectApiName,
            action: actionDef.action,
            actionLayout: actionDef,
            ids: [],
            params,
          },
        });
      },
    });
  };

  // *展示签到二维码
  onGenerateEventCodeButtonClick = (actionDef) => {
    const { describe, dispatch, record } = this.props;
    const { api_name: objectApiName } = describe;
    const actionParams = _.get(actionDef, 'params', {});
    const params = {};
    if (!_.isEmpty(actionParams)) {
      _.forEach(actionParams, (val, key) => {
        if (_.includes(val, 'return')) {
          // * values是个表达式
          const relVal = callAnotherFunc(new Function('t', val), record);
          params[key] = relVal;
        } else {
          params[key] = val;
        }
      });
    }
    dispatch({
      type: 'detail_page/callCustomAction',
      payload: {
        objectApiName,
        action: actionDef.action_code,
        actionLayout: actionDef,
        ids: [record.id],
        params,
        callBack: (data) => {
          this.setState({
            eventCodeValue: _.get(data, 'value', ''),
            eventCodeModalStatus: true,
          });
        },
      },
    });
  };

  onCancelEventCodeModal = () => {
    this.setState({
      eventCodeValue: '',
      eventCodeModalStatus: false,
    });
  };

  previewCLMActionBtn = (actionDef) => {
    const { record } = this.props;
    const clmName = _.get(record, 'name', '');
    const visitUrl = _.get(record, 'visit_url', '');

    this.setState({
      palyClmItemProps: {
        visible: true,
        title: clmName,
        clmHtmlUrl: visitUrl,
      },
    });
  };

  palyClmItemCancel = () => {
    this.setState({
      palyClmItemProps: {
        visible: false,
        title: '',
        clmHtmlUrl: '',
      },
    });
  };

  targetHrefPageBtn = (actionDef) => {
    const targetPath = _.get(actionDef, 'params.target_path');
    const hrefType = _.get(actionDef, 'params.href_type', 'internal');
    const { record } = this.props;
    const pathUrl = callAnotherFunc(new Function('t', targetPath), record);

    if (!pathUrl) {
      return false;
    }
    if (hrefType == 'internal') {
      // *内部跳转
      hashHistory.push(pathUrl);
    } else {
      // * 新页面打开
      let domainName = window.location.origin;
      if (!domainName) {
        // *IE10以下（包括10）不支持 window.location.origin
        // *Edge支持
        domainName = `${window.location.protocol}//${window.location.hostname}${
          window.location.port ? `:${window.location.port}` : ''
        }`;
      }
      window.open(`${domainName}/#/${pathUrl}`, '_blank');
    }
  };

  buttonListItems = (bear) => {
    const {
      layout,
      record,
      location,
      describe: { enable_approval_flow = false },
      edit_mode,
    } = this.props;
    const needrenderbyRecord = false;

    if (
      layout &&
      !_.isEmpty(layout) &&
      layout.containers !== undefined &&
      _.has(layout, 'containers[0].components[0]') &&
      !_.isEmpty(record)
    ) {
      const objectApiName = layout.object_describe_api_name;
      const detailFormComponent = _.find(_.get(layout, 'containers[0].components'), {
        type: 'detail_form',
      });
      const baseKey = `${layout.api_name}_action`;
      const actionList = _.filter(detailFormComponent.actions, (action) => {
        const isfindDetail = _.indexOf(_.get(action, 'show_when'), 'detail');
        return isfindDetail >= 0;
      });
      let actionMenuOptions = [];
      let foldMenus = [];
      _.forEach(actionList, (action) => {
        const key = `${action.label}_${action.action}`;
        const needFold = _.get(action, 'need_fold', false);

        const buttonShowWhere = _.get(action, 'show_where', ['head', 'bottom']);

        const disabledFun = getExpression(action, 'disabled_expression');
        const disabledValidResult = callAnotherFunc(new Function('t', disabledFun), record); // 判断是否禁用编辑按钮，默认不禁用，当满足禁用条件的时候会禁用按钮
        const hiddenFun = getExpression(action, 'hidden_expression');
        const hiddenValidResult = callAnotherFunc(new Function('t', hiddenFun), record); // 判断是否隐藏编辑按钮，默认不隐藏，当满足隐藏条件的时候会隐藏按钮

        const disabled_tip_title = disabledValidResult
          ? _.get(action, 'disabled_tip_title', '')
          : '';

        if (hiddenValidResult) {
          return;
        }

        const actionRefObjectApiName = _.get(
          action,
          'ref_obj_describe',
          _.get(layout, 'object_describe_api_name'),
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
        if (
          _.toUpper(action.action) === 'EDIT' &&
          _.indexOf(buttonShowWhere, bear) >= 0 &&
          fc_hasObjectPrivilege(actionRefObjectApiName, 2) &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          // 跳转到编辑页面
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a
                  disabled={disabledValidResult}
                  title={disabled_tip_title}
                  onClick={this.editActionConfirm.bind(null, action)}
                  key={`edit_${action.label}`}
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
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={this.editActionConfirm.bind(null, action)}
                key={`edit_${action.label}`}
              >
                {actionLabel}
              </Button>,
            );
          }
        } else if (
          _.toUpper(action.action) === 'DELETE' &&
          _.indexOf(buttonShowWhere, bear) >= 0 &&
          fc_hasObjectPrivilege(actionRefObjectApiName, 4) &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          // 删除
          const recordOperationItemProps = {
            recordData: record,
            actionLayout: action,
            objectApiName,
            onSuccess: (recordData, successData) => {
              message.success(successData.message);
              this.callBackAction(action);
            },
            onError: (recordData, errorData) => {},
          };

          const key = `recordOperationItemProps_${_.get(
            action,
            'action_code',
            _.get(action, 'action'),
          )}_${record.id}_${record.version}_${_.random(99)}`;
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <RecordOperationItem {...recordOperationItemProps} key={key} />
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <RecordOperationItem {...recordOperationItemProps} renderAs="button" key={key} />,
            );
          }
        } else if (
          _.toUpper(action.action) === 'RELATEDADD' &&
          _.indexOf(buttonShowWhere, bear) >= 0 &&
          fc_hasObjectPrivilege(actionRefObjectApiName, 1) &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a
                  onClick={this.relatedADDActionConfirm.bind(null, action)}
                  key={`related_add_${action.label}`}
                >
                  {actionLabel}
                </a>
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={this.relatedADDActionConfirm.bind(null, action)}
                key={`related_add_${action.label}`}
              >
                {actionLabel}
              </Button>,
            );
          }
          // 新建相关记录
        } else if (
          _.toUpper(action.action) === 'UPDATE' &&
          _.indexOf(buttonShowWhere, bear) >= 0 &&
          fc_hasObjectPrivilege(actionRefObjectApiName, 2) &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a
                  disabled={disabledValidResult}
                  title={disabled_tip_title}
                  onClick={this.updateActionConfirm.bind(this, action)}
                  key={`${action.label}_custom_update`}
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
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={this.updateActionConfirm.bind(this, action)}
                key={`${action.label}_custom_update`}
              >
                {actionLabel}
              </Button>,
            );
          }
          // 更新记录
        } else if (
          _.toUpper(action.action) === 'PRINT' &&
          _.indexOf(buttonShowWhere, bear) >= 0 &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          // 活动打印
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a onClick={this.printEvent.bind(this, action)} key="printEvent">
                  {actionLabel}
                </a>
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={this.printEvent.bind(this, action)}
                key="printEvent"
              >
                {actionLabel}
              </Button>,
            );
          }
        } else if (
          _.toUpper(action.action) === 'CALLBACK' &&
          _.indexOf(buttonShowWhere, bear) >= 0 &&
          !_.isEqual(edit_mode, ACTION_EDIT_MODE.embed_modal) &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          /**
           * 模式窗口状态下，不显示返回按钮
           */
          // 返回
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a onClick={this.callBackActionConfirm.bind(this, action)} key="callback">
                  {actionLabel}
                </a>
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                type={`${_.get(action, 'button_class_type', 'default')}`}
                style={{ marginLeft: 8 }}
                onClick={this.callBackActionConfirm.bind(this, action)}
                key="callback"
              >
                {actionLabel}
              </Button>,
            );
          }
        } else if (_.toUpper(action.action) === 'BACK') {
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a onClick={this.historyBackActionConfirm.bind(this, action)} key="callback">
                  {actionLabel}
                </a>
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                type={`${_.get(action, 'button_class_type', 'default')}`}
                style={{ marginLeft: 8 }}
                onClick={this.historyBackActionConfirm.bind(this, action)}
                key="callback"
              >
                {actionLabel}
              </Button>,
            );
          }
        } else if (
          _.toUpper(action.action) === 'RELATEDCOLLECT' &&
          _.indexOf(buttonShowWhere, bear) >= 0 &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          const recordOperationItemProps = {
            recordData: record,
            actionLayout: action,
            objectApiName,
            onSuccess: (recordData, successData) => {
              const fromUrl = location.pathname;
              let fromUrlSearch = location.search;
              const fromUrlQuewry = location.query;
              const k = _.get(fromUrlQuewry, '_k');
              fromUrlSearch = fromUrlSearch.replace(`&_k=${k}`, '').replace(`_k=${k}`, '');
              if (_.size(fromUrlQuewry) === 1) {
                fromUrlSearch = fromUrlSearch.replace('?', '');
              }
              hashHistory.push(`${fromUrl}${fromUrlSearch}`);
            },
            onError: (recordData, errorData) => {},
          };

          const key = `recordOperationItemProps_${_.get(
            action,
            'action_code',
            _.get(action, 'action'),
          )}_${record.id}_${record.version}_${_.random(99)}`;
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <RecordOperationItem {...recordOperationItemProps} key={key} />
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <RecordOperationItem {...recordOperationItemProps} renderAs="button" key={key} />,
            );
          }
        } else if (
          _.toUpper(action.action) === 'RESURVEY' &&
          _.indexOf(buttonShowWhere, bear) >= 0 &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          // 针对辅导的问卷重填按钮
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a
                  type={`${_.get(action, 'button_class_type', 'primary')}`}
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    const coachFieldUrl = `/coach_feedback/${record.id}/coach_fill_page?recordType=${record.record_type}&version=${record.version}`;
                    hashHistory.push(coachFieldUrl);
                  }}
                  key={`RESURVEY_${action.label}`}
                >
                  {actionLabel}
                </a>
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={() => {
                  const coachFieldUrl = `/coach_feedback/${record.id}/coach_fill_page?recordType=${record.record_type}&version=${record.version}`;
                  hashHistory.push(coachFieldUrl);
                }}
                key={`RESURVEY_${action.label}`}
              >
                {actionLabel}
              </Button>,
            );
          }
        } else if (
          action.action === 'SUBMIT_APPROVAL' &&
          enable_approval_flow &&
          !checkForHiddenDevice(action, 'PC')
        ) {
          // 提交审批
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a onClick={this.submitApprovalActionConfirm.bind(this, action)} key={key}>
                  {actionLabel}
                </a>
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                type={`${_.get(action, 'button_class_type', 'default')}`}
                style={{ marginLeft: 8 }}
                onClick={this.submitApprovalActionConfirm.bind(this, action)}
                key={key}
              >
                {actionLabel}
              </Button>,
            );
          }
        } else if (_.toUpper(action.action) === 'PREVIEWCLM') {
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a onClick={this.previewCLMActionBtn.bind(this, action)} key="previewCLM">
                  {actionLabel}
                </a>
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={this.previewCLMActionBtn.bind(this, action)}
                key="previewCLM"
              >
                {actionLabel}
              </Button>,
            );
          }
        } else if (_.toUpper(action.action) === 'TARGET_HREF_PAGE') {
          // *自定义页面跳转
          if (needFold) {
            foldMenus = foldMenus.concat(
              <Menu.Item key={key} disabled={disabledValidResult}>
                <a onClick={this.targetHrefPageBtn.bind(this, action)} key="TARGET_HREF_PAGE">
                  {actionLabel}
                </a>
              </Menu.Item>,
            );
          } else {
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={this.targetHrefPageBtn.bind(this, action)}
                key="TARGET_HREF_PAGE"
              >
                {actionLabel}
              </Button>,
            );
          }
        } else if (action.is_custom && !checkForHiddenDevice(action, 'PC')) {
          /**
           * 自定义action
           */
          if (_.startsWith(action.action_code, 'workflow')) {
            //* 工作流自定义action
            if (action.action_code === 'workflow_reject') {
              actionMenuOptions = actionMenuOptions.concat(
                <Button
                  type={`${_.get(action, 'button_class_type', 'primary')}`}
                  style={{ marginLeft: 8 }}
                  onClick={this.onWorlFlowShowModal.bind(this, action)}
                  key={key}
                >
                  {actionLabel}
                </Button>,
              );
            } else if (action.action_code === 'workflow_agree') {
              actionMenuOptions = actionMenuOptions.concat(
                <Button
                  type={`${_.get(action, 'button_class_type', 'primary')}`}
                  style={{ marginLeft: 8 }}
                  onClick={this.onWorlFlowShowModal.bind(this, action)}
                  key={key}
                >
                  {actionLabel}
                </Button>,
              );
            } else if (action.action_code === 'workflow_add_execution') {
              actionMenuOptions = actionMenuOptions.concat(
                <Button
                  type={`${_.get(action, 'button_class_type', 'primary')}`}
                  style={{ marginLeft: 8 }}
                  onClick={this.onWorlFlowShowModal.bind(this, action)}
                  key={key}
                >
                  {actionLabel}
                </Button>,
              );
            } else if (action.action_code === 'workflow_delegate') {
              actionMenuOptions = actionMenuOptions.concat(
                <Button
                  type={`${_.get(action, 'button_class_type', 'primary')}`}
                  style={{ marginLeft: 8 }}
                  onClick={this.onWorlFlowShowModal.bind(this, action)}
                  key={key}
                >
                  {actionLabel}
                </Button>,
              );
            } else if (action.action_code === 'workflow_history') {
              actionMenuOptions = actionMenuOptions.concat(
                <Button
                  type={`${_.get(action, 'button_class_type', 'primary')}`}
                  style={{ marginLeft: 8 }}
                  onClick={this.onWorlFlowApprovalHistoryButtonClick.bind(this, action)}
                  key={key}
                >
                  {actionLabel}
                </Button>,
              );
            } else if (action.action_code === 'workflow_recall') {
              actionMenuOptions = actionMenuOptions.concat(
                <Button
                  type={`${_.get(action, 'button_class_type', 'primary')}`}
                  style={{ marginLeft: 8 }}
                  onClick={this.onWorlFlowShowModal.bind(this, action)}
                  key={key}
                >
                  {actionLabel}
                </Button>,
              );
            } else if (
              action.action_code === 'workflow_submit' ||
              action.action_code === 'workflow_resubmit'
            ) {
              actionMenuOptions = actionMenuOptions.concat(
                <Button
                  type={`${_.get(action, 'button_class_type', 'primary')}`}
                  style={{ marginLeft: 8 }}
                  onClick={this.onWorlFlowSubmitButtonClick.bind(this, action)}
                  key={key}
                >
                  {actionLabel}
                </Button>,
              );
            }
          } else if (action.action_code === 'generate_event_qr_code') {
            actionMenuOptions = actionMenuOptions.concat(
              <Button
                type={`${_.get(action, 'button_class_type', 'primary')}`}
                style={{ marginLeft: 8 }}
                onClick={this.onGenerateEventCodeButtonClick.bind(this, action)}
                key={key}
              >
                {actionLabel}
              </Button>,
            );
          } else {
            // * 其他自定义action
            if (needFold) {
              foldMenus = foldMenus.concat(
                <Menu.Item key={key} disabled={disabledValidResult}>
                  <a onClick={this.onCustomActionButtonClick.bind(this, action)} key={key}>
                    {actionLabel}
                  </a>
                </Menu.Item>,
              );
            } else {
              actionMenuOptions = actionMenuOptions.concat(
                <Button
                  type={`${_.get(action, 'button_class_type', 'default')}`}
                  style={{ marginLeft: 8 }}
                  onClick={this.onCustomActionButtonClick.bind(this, action)}
                  key={key}
                >
                  {actionLabel}
                </Button>,
              );
            }
          }
        }
      });

      if (!_.isEmpty(foldMenus)) {
        foldMenus = <Menu>{foldMenus}</Menu>;
        actionMenuOptions.push(
          <Dropdown overlay={foldMenus} key={`${baseKey}_dropdown`}>
            <a style={{ padding: '0 10px', marginLeft: 8 }}>
              <img
                alt={'logo'}
                src="/img/more_action.png"
                style={{ verticalAlign: 'bottom', height: 28 }}
              />
            </a>
          </Dropdown>,
        );
      }
      return (
        <div style={{ marginBottom: 20 }}>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              {actionMenuOptions}
            </Col>
          </Row>
        </div>
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
                {crmIntlUtil.fmtStr('返回')}
              </Button>
            </Col>
          </Row>
        </div>
      );
    }
  };

  pageDetailItems = () => {
    const { layout, describe, record, dispatch, pageType, edit_mode } = this.props;
    const fieldList = _.get(describe, 'fields');
    // if (!_.isEmpty(layout) && _.has(layout, 'containers[0].components[0]')) {
    const apiName = layout.object_describe_api_name;
    const detailKey = `detail_form_${apiName}_${record.id}`;
    const detailFormComponent = _.find(_.get(layout, 'containers[0].components'), {
      type: 'detail_form',
    });
    const renderViewLayout = _.get(layout, 'containers[0].render_view');

    const relatedListComponents = getRelatedListComponents({
      layout,
    });
    return (
      <RecordDetail
        renderViewLayout={renderViewLayout}
        component={detailFormComponent}
        fieldList={fieldList}
        record={record}
        object_api_name={apiName}
        dispatch={dispatch}
        key={detailKey}
        location={location}
        relatedListComponents={relatedListComponents}
        pageType={pageType}
        edit_mode={edit_mode}
      />
    );
  };

  pageRelatedItems = () => {
    const {
      layout,
      describe,
      record,
      relatedLayout,
      dispatch,
      relatedFieldList,
      location,
      pageType,
      childrenToParentRefresh,
    } = this.props;
    const fieldList = describe.fields;
    // if (!_.isEmpty(layout) && _.has(layout, 'containers[0].components[0]')) {
    const apiName = layout.object_describe_api_name;
    const relatedList = getRelatedListComponents({
      layout,
    });
    const renderViewLayout = _.get(layout, 'containers[0].render_view');
    if (_.isEmpty(relatedList)) {
      return;
    }
    const { relatedListName } = getRelatedListInkProperties({
      relatedList,
    });

    const relatedKey = `related_tab_${relatedListName}_${record.id}`;
    return (
      <RelatedDetail
        renderViewLayout={renderViewLayout}
        relatedList={relatedList}
        relatedLayout={relatedLayout}
        relatedFieldList={relatedFieldList}
        fieldList={fieldList}
        record={record}
        object_api_name={apiName}
        dispatch={this.props.dispatch}
        key={relatedKey}
        location={location}
        pageType={pageType}
        childrenToParentRefresh={childrenToParentRefresh}
      />
    );
  };

  render() {
    const { layout, record } = this.props;
    const {
      workFlowModalFomState,
      WorkFlowModalFomTitleType,
      currentButtonAction,
      palyClmItemProps,
      eventCodeModalStatus,
      eventCodeValue,
    } = this.state;
    const actionRefObjectApiName = _.get(layout, 'object_describe_api_name');
    if (!fc_hasObjectPrivilege(actionRefObjectApiName, 3)) {
      const recordType = _.get(layout, 'record_type');
      const warnerProps = {
        apiName: actionRefObjectApiName,
        recordType,
      };
      return <Warner content={crmIntlUtil.fmtStr('The current user no access')} {...warnerProps} />;
    }
    const { needrenderbyLayout, needrenderbyRecord } = checkRenderConditions({
      layout,
      record,
    });
    return (
      <div>
        {workFlowModalFomState && (
          <WorkFlowModalFom
            modalFomState={workFlowModalFomState}
            onCancelokHandler={this.onCancelWorkFlowModalFom}
            okHandler={this.onOkWorkFlowModalFom}
            titleType={WorkFlowModalFomTitleType}
            actionLayout={currentButtonAction}
          />
        )}
        {palyClmItemProps.visible && (
          <Modal
            title={palyClmItemProps.title}
            visible={palyClmItemProps.visible}
            footer={null}
            width="70%"
            maskClosable={false}
            onCancel={this.palyClmItemCancel}
          >
            <iframe
              // key={timeStamp}
              src={palyClmItemProps.clmHtmlUrl}
              frameBorder="0"
              width="100%"
              height="600px"
            />
          </Modal>
        )}
        {eventCodeModalStatus && (
          <Modal
            title={'生成二维码'}
            visible={eventCodeModalStatus}
            footer={null}
            width="30%"
            maskClosable={false}
            onCancel={this.onCancelEventCodeModal}
          >
            <div style={{ textAlign: 'center' }}>
              {eventCodeValue ? (
                <img src={`data:image/jpeg;base64,${eventCodeValue}`} alt="二维码" />
              ) : (
                '二维码生成失败'
              )}
            </div>
          </Modal>
        )}
        {this.buttonListItems('head')}
        {needrenderbyLayout && needrenderbyRecord && this.pageDetailItems()}
        {needrenderbyLayout && needrenderbyRecord && this.pageRelatedItems()}
        {!needrenderbyLayout && <Warner content={crmIntlUtil.fmtStr('Not Found Render Object')} />}
        {!needrenderbyRecord && <Warner content={crmIntlUtil.fmtStr('Not Found Record Data')} />}
        {this.buttonListItems('bottom')}
      </div>
    );
  }
}

export default ObjectPageDetail;
