import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Modal, Button, message } from 'antd';
import { hashHistory } from 'dva/router';
import * as styles from './RecordOperationItem.less';
import * as recordService from '../../services/object_page/recordService';
import * as CallBackUtil from '../../utils/callBackUtil';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { callAnotherFunc } from '../../utils';
import { getExpression } from '../../utils/expressionUtils';
import { checkForHiddenDevice } from '../../utils/tools';
import windowUtil from '../../utils/windowUtil';
import consoleUtil from '../../utils/consoleUtil';
import { checkValidExpression } from '../object_page/common/page';
import FcModalWidget from '../FcModalWidget/FcModalWidget';

const confirm = Modal.confirm;
class RecordOperationItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOption: null,
      needShowOperationItem: false,
    };
  }
  componentWillMount() {
    this.buildMenuOption();
  }
  // componentWillUpdate() {
  //   consoleUtil.log('componentWillUpdate', this.props);
  // }

  dataRecordUpdate = (recordData) => {
    const { objectApiName, actionLayout, onSuccess, onError, parentRecord } = this.props;
    const data = {};
    _.set(data, 'version', _.get(recordData, 'version'));
    // _.set(data, 'status', _.get(recordData, 'status'));
    _.set(data, 'id', _.get(recordData, 'id'));
    // _.set(data, `${fieldName}`, value);
    // add by wans 2017年9月20日16:43:23

    const defaultFieldVals = _.get(actionLayout, 'default_field_val');
    if (!_.isEmpty(defaultFieldVals)) {
      _.forEach(defaultFieldVals, (defaultFieldValLayout) => {
        const defaultVal = defaultFieldValLayout.val;
        const defaultField = defaultFieldValLayout.field;
        if (_.eq(_.get(defaultFieldValLayout, 'field_type'), 'js')) {
          // 如果配置的为js脚本
          const resultVal = callAnotherFunc(
            new Function('t', 'p', defaultVal),
            recordData,
            parentRecord,
          );
          _.set(data, defaultField, resultVal);
        } else {
          _.set(data, defaultField, defaultVal);
        }
      });
    }

    recordService
      .updateRecord({ dealData: data, object_api_name: objectApiName, id: _.get(recordData, 'id') })
      .then((data) => {
        if (data.success) {
          onSuccess(recordData, data);
        } else {
          onError(recordData, data);
        }
      })
      .catch(() => {});
  };

  approvalAccept = (recordData) => {
    const { objectApiName, actionLayout, onSuccess, onError, parentRecord, dispatch } = this.props;
    dispatch({
      type: 'object_page/approvalAccept',
      payload: {
        node_id: recordData.id,
        operation: 'accept',
        objectApiName,
      },
    });
  };

  // Switch Account
  switchAccount = (recordData) => {
    consoleUtil.log('switch account');
    const { dispatch } = this.props;
    dispatch({
      type: 'App/loginAsWithToken',
      payload: {
        licensor: _.get(recordData, 'licensor'),
      },
      callback: () => {
        windowUtil.cleanGlobalCRMSettingProperties();
        windowUtil.initGlobalWindowProperties();
        windowUtil.initGlobalCRMProperties();
        // 保存列表项action的当前成功操作
        dispatch({
          type: 'object_page/operationSuccess',
          payload: {
            lastSuccessOperation: {
              object_api_name: 'alert',
              actionOperactionCode: 'UPDATE',
              timestamp: new Date().getTime(),
            },
          },
        });
        CallBackUtil.callBackToGo('/home');
        // window.location.reload();
      },
    });
  };

  handleMenuClick = (recordData, key) => {
    const userId = localStorage.getItem('userId');
    const { objectApiName, actionLayout, onSuccess, onError, parentRecord } = this.props;

    /**
     * 对按钮动作进行检查
     */
    const valid_result = checkValidExpression({
      layout: actionLayout,
      thizRecord: recordData,
    });
    if (_.isString(valid_result)) {
      message.error(valid_result);
      return;
    }

    const actionRefObjectApiName = _.get(actionLayout, 'ref_obj_describe', objectApiName);
    const actionOperactionCode = _.toUpper(_.get(actionLayout, 'action'));
    // const recordId = recordData.id;

    // const [actionCode, recordId] = _.split(key, '_');
    const recordType = _.get(actionLayout, 'target_layout_record_type', recordData.record_type);
    const needConfirm = _.get(actionLayout, 'need_confirm', false);

    const confirmMessage = crmIntlUtil.fmtStr(
      _.get(
        actionLayout,
        'confirm_message.i18n_key',
        `confirm_message.${_.get(actionLayout, 'action')}`,
      ),
      _.get(actionLayout, 'confirm_message', `请确认${this.state.menuOptionLabel}?`),
    );

    if (
      _.toUpper(actionOperactionCode) === 'RELATEDADD' &&
      fc_hasObjectPrivilege(actionRefObjectApiName, 1)
    ) {
      if (_.get(actionLayout, 'need_callback', false)) {
        CallBackUtil.dealNeedCallBack({
          location: this.props.location,
        });
      }

      const refObjDescribeApiName = _.get(actionLayout, 'ref_obj_describe');
      const relatedListName = _.get(actionLayout, 'related_list_name');
      // const recordType = _.get(actionLayout, 'target_layout_record_type');
      let addUrl = '/object_page/:object_api_name/add_page'.replace(
        ':object_api_name',
        refObjDescribeApiName,
      );
      addUrl += `?recordType=${recordType}&relatedListName=${relatedListName}&parentId=${_.get(
        recordData,
        _.get(actionLayout, 'target_value_field', 'id'),
      )}&parentName=${_.get(recordData, 'name')}`;
      hashHistory.push(addUrl);
    } else if (_.toUpper(actionOperactionCode) === 'RELATEDDETAIL') {
      // TODO 需要使用功能权限，再次限定
      if (_.get(actionLayout, 'need_callback', true)) {
        // 默认都是需要返回到父对象的页面
        CallBackUtil.dealNeedCallBack({
          location: this.props.location,
        });
      }
      let refObjectDescribe = actionRefObjectApiName;
      let refRecordId = _.get(actionLayout, 'target_data_record_Id');
      let refRecordType = recordType;
      if (_.startsWith(actionRefObjectApiName, '$$') && _.endsWith(actionRefObjectApiName, '$$')) {
        refObjectDescribe = _.get(recordData, _.replace(refObjectDescribe, /[$]/g, ''));
      }
      if (_.startsWith(refRecordId, '$$') && _.endsWith(refRecordId, '$$')) {
        refRecordId = _.get(recordData, _.replace(refRecordId, /[$]/g, ''));
      }
      if (_.startsWith(recordType, '$$') && _.endsWith(recordType, '$$')) {
        refRecordType = _.get(recordData, _.replace(recordType, /[$]/g, ''), 'master1');
      }

      let refDetailUrl = `object_page/${refObjectDescribe}/${refRecordId}/detail_page`;
      if (refRecordType) refDetailUrl += `?recordType=${refRecordType}`;
      hashHistory.push(refDetailUrl);
    } else if (
      _.toUpper(actionOperactionCode) === 'EDIT' &&
      fc_hasObjectPrivilege(actionRefObjectApiName, 2)
    ) {
      if (_.get(actionLayout, 'need_callback', false)) {
        CallBackUtil.dealNeedCallBack({
          location: this.props.location,
        });
      }

      let editUrl = 'object_page/:object_api_name/:record_id/edit_page'
        .replace(':object_api_name', objectApiName)
        .replace(':record_id', recordData.id);
      if (recordType) editUrl += `?recordType=${recordType}`;
      hashHistory.push(editUrl);
    } else if (
      _.toUpper(actionOperactionCode) === 'DETAIL' &&
      fc_hasObjectPrivilege(actionRefObjectApiName, 3)
    ) {
      if (_.get(actionLayout, 'need_callback', false)) {
        CallBackUtil.dealNeedCallBack({
          location: this.props.location,
        });
      }
      if (_.get(actionLayout, 'default_field_val')) {
        this.dataRecordUpdate(recordData);
      }

      let detailUrl = 'object_page/:object_api_name/:record_id/detail_page'
        .replace(':object_api_name', objectApiName)
        .replace(':record_id', recordData.id);
      if (recordType) detailUrl += `?recordType=${recordType}`;
      hashHistory.push(detailUrl);
    } else if (
      _.toUpper(actionOperactionCode) === 'PARENTDETAIL' &&
      fc_hasObjectPrivilege(actionRefObjectApiName, 3)
    ) {
      if (_.get(actionLayout, 'need_callback', false)) {
        CallBackUtil.dealNeedCallBack({
          location: this.props.location,
        });
      }

      let detailUrl = 'object_page/:object_api_name/:record_id/detail_page'
        .replace(':object_api_name', actionRefObjectApiName)
        .replace(':record_id', _.get(recordData, _.get(actionLayout, 'target_value_field')));
      if (recordType) {
        detailUrl += `?recordType=${_.get(actionLayout, 'target_layout_record_type')}`;
      }
      hashHistory.push(detailUrl);
    } else if (
      _.toUpper(actionOperactionCode) === 'DELETE' &&
      fc_hasObjectPrivilege(actionRefObjectApiName, 4)
    ) {
      if (needConfirm) {
        confirm({
          title: confirmMessage,
          onOk() {
            // onDeleteItem(record.id);
            recordService
              .deleteRecord({ id: recordData.id, object_api_name: objectApiName })
              .then((data) => {
                if (data.success) {
                  onSuccess(recordData, data);
                } else {
                  onError(recordData, data);
                }
              })
              .catch(() => {});
          },
        });
      } else {
        recordService
          .deleteRecord({ id: recordData.id, object_api_name: objectApiName })
          .then((data) => {
            if (data.success) {
              onSuccess(recordData, data);
            } else {
              onError(recordData, data);
            }
          })
          .catch(() => {});
      }
    } else if (
      _.toUpper(actionOperactionCode) === 'UPDATE' &&
      fc_hasObjectPrivilege(actionRefObjectApiName, 2)
    ) {
      if (needConfirm) {
        confirm({
          title: confirmMessage,
          onOk: () => {
            this.dataRecordUpdate(recordData);
          },
        });
      } else {
        this.dataRecordUpdate(recordData);
      }
    } else if (_.toUpper(actionOperactionCode) === 'APPROVAL_ACCEPT') {
      if (needConfirm) {
        confirm({
          title: confirmMessage,
          onOK: () => {
            this.approvalAccept(recordData);
          },
        });
      } else {
        this.approvalAccept(recordData);
      }
    } else if (_.toUpper(actionOperactionCode) === 'SWITCHACCOUNT') {
      consoleUtil.log('actionOperactionCode====>', actionOperactionCode);
      // if (needConfirm) {
      //   confirm({
      //     title: confirmMessage,
      //     onOK: () => {
      //       consoleUtil.log('on ok')
      //       this.switchAccount(recordData);
      //     }
      //   });
      // } else {
      this.switchAccount(recordData);
      // }
    } else if (_.toUpper(actionOperactionCode) === 'MODAL_WIDGET') {
      // alert('MODAL_WIDGET');
      this.onModalWidgetOpen(actionLayout);
    } else if (actionLayout.is_custom && !checkForHiddenDevice(actionLayout, 'PC')) {
      // 处理CustomAction
      if (needConfirm) {
        confirm({
          title: confirmMessage,
          onOk: () => {
            this.callCustomAction({ objectApiName, actionLayout, recordData });
          },
        });
      } else {
        this.callCustomAction({ objectApiName, actionLayout, recordData });
      }
    } else {
      message.error(
        crmIntlUtil.fmtWithTemplate(
          'action.un_parsable_action',
          `无法解析动作${actionOperactionCode}`,
          { actionOperactionCode },
        ),
      );
    }
  };

  /**
   * 内嵌iframe页面打开模式模式窗口容器
   * @param {Object} actionLayout
   */
  onModalWidgetOpen = async (actionLayout) => {
    const { options } = actionLayout;
    const { parentRecord, recordData } = this.props;
    const instance = await FcModalWidget.newInstance(
      Object.assign({}, options, {
        thizRecord: recordData, // 方便实施写表达式（return t.id）
        parentRecord, // 方便实施写表达式（return p.id）
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

  // 处理CustomAction
  callCustomAction(params) {
    const { objectApiName, actionLayout, recordData } = params;
    const { dispatch, location } = this.props;
    dispatch({
      type: 'object_page/callCustomAction',
      payload: {
        objectApiName,
        actionLayout,
        ids: [recordData.id],
      },
      callback: () => {
        if (_.get(actionLayout, 'need_callback', false)) {
          CallBackUtil.dealNeedCallBack({
            location,
          });
        }
      },
    });
  }

  queryData = (queryData) => {
    return Promise.resolve(recordService.queryRecordListByLocalStorage(queryData)).then((value) => {
      return value;
    });
  };

  buildMenuOption = () => {
    const { objectApiName, recordData, actionLayout, parentRecord, needHidden } = this.props;

    if (needHidden) {
      return;
    }
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

    const key = `${_.get(actionLayout, 'action_code', _.get(actionLayout, 'action'))}_${
      recordData.id
    }_${recordData.version}_${actionOperactionLabel}`;
    // consoleUtil.log('relatedList===>key===>>', key)
    const menuSpanOptionKey = `span_${_.get(
      actionLayout,
      'action_code',
      _.get(actionLayout, 'action'),
    )}_${recordData.id}_${recordData.version}_${actionOperactionLabel}`;
    // consoleUtil.log('menuSpanOptionKey===>key===>>', menuSpanOptionKey)
    const showFun = getExpression(actionLayout, 'show_expression', 'return true');
    const validResult = callAnotherFunc(new Function('t', 'p', showFun), recordData, parentRecord);
    if (validResult === true) {
      if (actionOperactionCode === 'ADD' && !fc_hasObjectPrivilege(actionRefObjectApiName, 1)) {
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
      } else {
        this.setState({ needShowOperationItem: true });
        this.setState(
          { menuSpanOptionKey, menuOptionKey: key, menuOptionLabel: actionLabel },
          () => {},
        );
      }
    }
  };

  render() {
    const { recordData, renderAs, childQuerys, actionLayout } = this.props;

    if (_.isEmpty(this.state.menuOptionLabel) || !this.state.needShowOperationItem) {
      // consoleUtil.error('actionLayout',actionLayout);
      return false;
    } else {
      const buttonOrLink =
        renderAs === 'button' ? (
          <Button
            style={{ marginRight: 8 }}
            key={this.state.menuSpanOptionKey}
            onClick={this.handleMenuClick.bind(this, recordData, this.state.menuOptionKey)}
          >
            {this.state.menuOptionLabel}
          </Button>
        ) : (
          <a
            style={{ marginRight: 8 }}
            key={this.state.menuSpanOptionKey}
            onClick={this.handleMenuClick.bind(this, recordData, this.state.menuOptionKey)}
          >
            {this.state.menuOptionLabel}
          </a>
        );

      return buttonOrLink;
    }
    // return this.state.menuOption;
  }
}

RecordOperationItem.propTypes = {
  // dataItem: PropTypes.object,
  // fieldItem: PropTypes.object,
  // renderFieldItem: PropTypes.object
};

export default RecordOperationItem;
