import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Modal, Form, Button, Row, Col, message, Table, Collapse } from 'antd';
import { FormattedMessage } from 'react-intl';
import { hashHistory } from 'dva/router';
import RecordFormItem from './RecordFormItem';
import * as CallBackUtil from '../../utils/callBackUtil';
import styles from './detail.less';
import AddressForm from '../common/addressForm';
import {
  CallProductKeyMessageFormItem,
  RenderBar,
  SegmentationHistoryFormItem,
} from '../../components/index';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { callAnotherFunc } from '../../utils';
import { checkSectionShowable } from './helpers/recordHelper';
import { getExpression, hasExpression } from '../../utils/expressionUtils';
import consoleUtil from '../../utils/consoleUtil';
import {
  appendRelatedFieldToSection,
  checkFieldShowable,
  checkRelatedFieldClear,
  validForm,
} from './common/record';
import { ACTION_EDIT_MODE } from './common/constants';
import dataFixer from '../../utils/dataFixer';
import Attachment from '../../utils/cache';
import * as customActionService from '../../services/customAction';

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

class RecordAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      relatedLists: {},
      record: props.record,
      isFormItemValueChange: false,
      isHasSegmentationHistory: false,
      segmentationProductCheckedList: [],
      callClmCheckedList: [],
      callClm_cascadeList: [],
      canRender: true,
    };

    /**
     * section related fields
     */
    this.relatedFields = {};
  }

  componentWillMount() {
    this.setState({ productCheckedList: [] });
  }

  componentWillUnmount() {
    Attachment.clear();
  }

  callBackActionConfirm = (actionLayout) => {
    const needConfirm = _.get(actionLayout, 'need_confirm', false);
    // const confirmMessage = _.get(actionLayout, 'confirm_message', `${crmIntlUtil.fmtStr('message.yes_or_no', '是否')}${actionLayout.label}?`);
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
   * 保存按钮
   */
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
    const confirmMessage = crmIntlUtil.fmtStr(
      _.get(
        actionLayout,
        'confirm_message.i18n_key',
        `confirm_message.${_.get(actionLayout, 'action')}`,
      ),
      _.get(
        actionLayout,
        'confirm_message',
        `${crmIntlUtil.fmtStr('message.yes_or_no', '是否')}${actionLayout.label}?`,
      ),
    );
    if (needConfirm) {
      confirm({
        title: confirmMessage,
        onOk: () => {
          this.okHandler(actionLayout);
        },
      });
    } else {
      _.debounce(this.okHandler, 400)(actionLayout);
    }
  };

  onCheckLastSegmentation = (actionLayout) => {
    //* 带出上次定级信息
    const record = _.get(this.state, 'record');
    if (!_.get(record, 'product')) {
      message.error('请填写定级产品信息');
      return false;
    }
    this.props.form.resetFields();
    this.setState({
      record: Object.assign({}, record, {
        avg_prescription_qty: '',
        is_kol: '',
        is_speaker: '',
        potential: '',
        support_degree: '',
      }),
    });
    customActionService
      .executeAction({
        objectApiName: 'segmentation_history',
        action: actionLayout.action,
        params: {
          productId: _.get(record, 'product'),
          customerId: _.get(record, 'customer'),
        },
      })
      .then((res) => {
        if (_.isEmpty(_.get(res, 'resultData'))) {
          message.error('未查询到符合的历史定级信息。');
          return false;
        }
        this.setState({ record: Object.assign({}, record, _.get(res, 'resultData')) });
      });
  };

  mixinRecordRelationToFormValues = ({ values }) => {
    const { record } = this.state;
    const relations = _.chain(record)
      .pickBy((value, key) => {
        return _.endsWith(key, '__r');
      })
      .value();
    const keys = _.keys(values);
    return Object.assign({}, values, _.omit(relations, keys));
  };

  okHandler = (actionLayout) => {
    const { layout, record, onOk, fieldList } = this.props;
    this.props.form.validateFields((err, values) => {
      /**
       * 修正表单数据
       */
      values = dataFixer({
        fieldList,
        record: values,
      });
      consoleUtil.log('values:YYYY-MM-DD', moment(values.end_time).format('YYYY-MM-DD'));
      const { component, location } = this.props;
      if (!err) {
        const fun = getExpression(component, 'expression', false);
        const validResult = fun ? callAnotherFunc(new Function('t', fun), values) : true;
        if (!(validResult === true)) {
          message.error(crmIntlUtil.fmtStr(validResult));
        } else {
          _.forEach(values, (value, key) => {
            if (_.has(value, '_isAMomentObject')) {
              _.set(values, key, value.valueOf());
            } else if (key === 'product') {
              const { record } = this.state;
              _.set(values, 'product__r', _.get(record, 'product__r', {}));
            }
          });

          /**
           * 以拜访模板为例：
           * 拜访模板布局上定义的record_type为week,但是在fields字段上同样定义了一个record_type字段，而且为单选，可选值为week、day,当选择日模板时，record_type=day
           * 所以需要在此处进行判断
           */
          if (!_.has(values, 'record_type')) {
            _.set(
              values,
              'record_type',
              _.get(actionLayout, 'target_data_record_type', _.get(layout, 'record_type')),
            );
          }
          // 优先使用action布局里面配置的record_type代表数据的record_type，没有的话使用布局的record_type
          // add by wans 2017年9月20日16:43:23
          const defaultFieldVals = _.get(actionLayout, 'default_field_val');
          if (!_.isEmpty(defaultFieldVals)) {
            _.forEach(defaultFieldVals, (defaultFieldValLayout) => {
              const defaultVal = defaultFieldValLayout.val;
              const defaultField = defaultFieldValLayout.field;
              if (_.eq(_.get(defaultFieldValLayout, 'field_type'), 'js')) {
                // 如果配置的为js脚本
                const resultVal = callAnotherFunc(
                  new Function('t', defaultVal),
                  this.mixinRecordRelationToFormValues({
                    values,
                  }),
                );
                _.set(values, defaultField, resultVal);
              } else {
                _.set(values, defaultField, defaultVal);
              }
            });
          }
          const flowFunc = _.flow(
            this.processCascadeRecords,
            this.appendRelatedFieldValuesToCascade,
            this.appendSegmentationValuesToCascade,
          );
          const valueWithChildren = flowFunc(values);
          onOk(valueWithChildren, actionLayout, this.callBackAction);
        }
      }
    });
    // }
  };

  callBackAction = (actionLayout, recordData = {}) => {
    // consoleUtil.log(actionLayout,recordData)
    const { layout } = this.props;
    const recordType = _.get(
      actionLayout,
      'target_layout_record_type',
      _.get(layout, 'record_type'),
    );
    const actionCode = _.toUpper(_.get(actionLayout, 'action'));
    const apiName = layout.object_describe_api_name;
    const nextAction = actionLayout.next_action;
    if (!_.isEmpty(nextAction)) {
      // *问卷的相关回调
      if (_.isEqual(nextAction, 'Segmentation_ADD')) {
        // 定级问卷的填写
        const fillUrl = `segmentation_history/${recordData.id}/segmentation_fill_page?product_id=${recordData.product}&version=${recordData.version}`;
        CallBackUtil.callBackToGo(fillUrl);
      } else if (_.startsWith(nextAction, 'Coach')) {
        // 辅导问卷的填写
        const coachFieldUrl = `/coach_feedback/${recordData.id}/coach_fill_page?recordType=${recordData.record_type}&version=${recordData.version}`;
        CallBackUtil.callBackToGo(coachFieldUrl);
      }
    } else if (actionCode === 'SAVEANDCREATEHCP') {
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
        recordId: _.get(recordData, 'id'),
      });
    }
  };

  buttonListItems = (bear) => {
    const { component, object_api_name, edit_mode } = this.props;
    const actionList = _.filter(component.actions, (action) => {
      const isFindDetail = _.indexOf(_.get(action, 'show_when'), 'add');
      return isFindDetail >= 0;
    });
    const buttonList = actionList.map((action) => {
      let buttonItem = '';
      const buttonShowWhere = _.get(action, 'show_where', ['head', 'bottom']);
      const disabledFun = getExpression(action, 'disabled_expression');
      const disabledValidResult = callAnotherFunc(new Function('t', disabledFun), {}); // 判断是否禁用编辑按钮，默认不禁用，当满足禁用条件的时候会禁用按钮
      const hiddenDevices = _.toUpper(_.get(action, 'hidden_devices', []));
      const hiddenFun = getExpression(action, 'hidden_expression');
      const hiddenValidResult = callAnotherFunc(new Function('t', hiddenFun), {}); // 判断是否隐藏编辑按钮，默认不隐藏，当满足隐藏条件的时候会隐藏按钮
      const isCustom = _.get(action, 'is_custom', false);
      const actionCode = _.toUpper(_.get(action, 'action'));

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

      if (
        action.action === 'SAVE' &&
        _.indexOf(buttonShowWhere, bear) >= 0 &&
        fc_hasObjectPrivilege(object_api_name, [1])
      ) {
        buttonItem = (
          <Button
            disabled={disabledValidResult}
            title={disabled_tip_title}
            type={`${_.get(action, 'button_class_type', 'primary')}`}
            style={{ marginLeft: 8 }}
            onClick={_.debounce(this.okHandlerConfirm.bind(this, action), 400)}
            key="SAVE"
          >
            {actionLabel}
          </Button>
        );
      } else if (
        action.action === 'CALLBACK' &&
        _.indexOf(buttonShowWhere, bear) >= 0 &&
        !_.isEqual(edit_mode, ACTION_EDIT_MODE.embed_modal)
      ) {
        /**
         * 当页面嵌入到模式窗口中时，不显示返回按钮
         */
        buttonItem = (
          <Button
            disabled={disabledValidResult}
            title={disabled_tip_title}
            type={`${_.get(action, 'button_class_type', 'default')}`}
            style={{ marginLeft: 8 }}
            onClick={this.callBackActionConfirm.bind(this, action)}
            key="callback"
          >
            {actionLabel}
          </Button>
        );
      } else if (isCustom) {
        if (actionCode === 'CHECK_LAST_SEGMENTATION') {
          const objectItself = _.get(this.state, 'record');
          const disabledVal = callAnotherFunc(new Function('t', disabledFun), objectItself);
          buttonItem = (
            <Button
              disabled={disabledVal}
              title={disabled_tip_title}
              type={`${_.get(action, 'button_class_type', 'primary')}`}
              style={{ marginLeft: 8 }}
              onClick={this.onCheckLastSegmentation.bind(this, action)}
              key="CHECK_LAST_SEGMENTATION"
            >
              {actionLabel}
            </Button>
          );
        } else if (actionCode === 'SAVEANDCREATEHCP') {
          //* 绿谷定制需求，新建/编辑临时参会人时，新建医生
          buttonItem = (
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
        }
      }
      return buttonItem;
    });

    return (
      <Row className={styles.formButtonGroup}>
        <Col span={24} className="text_right">
          {buttonList}
        </Col>
      </Row>
    );
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

  relatedFieldRenderedCallback = ({ ref, name }) => {
    this.relatedFields[name] = ref;
  };

  harvestRelatedFieldInternalState = () => {
    const { relatedFields } = this;
    return _.mapValues(relatedFields, (ref) => {
      return ref.getInternalState().dataSource;
    });
  };

  appendRelatedFieldValuesToCascade = (values) => {
    const relatedFieldValues = this.harvestRelatedFieldInternalState();
    const {
      _cascade: { create = {} },
    } = values;
    const finalValues = Object.assign({}, values, {
      _cascade: {
        create: Object.assign({}, create, relatedFieldValues),
      },
    });
    return finalValues;
  };

  appendSegmentationValuesToCascade = (values) => {
    // * 级联保存绿谷批量定级历史
    const { isHasSegmentationHistory, segmentationProductCheckedList, canRender } = this.state;
    if (isHasSegmentationHistory && canRender) {
      if (!_.isEmpty(segmentationProductCheckedList)) {
        const {
          _cascade: { create = {} },
        } = values;
        const segmentatFieldValues = [];
        _.map(segmentationProductCheckedList, (pord, index) => {
          const item = {};
          _.forIn(values, (value, key) => {
            if (_.includes(key, `SegmentationHistoryFormItem-${pord.id}`)) {
              const keysArr = key.split('-');
              item.product = pord.id;
              item[keysArr[2]] = value;
              item.status = '0';
              item.submit_time = _.now();
              item.profile = window.fc_getProfile().id;
              item.bu = window.fc_getProfile().name;
              delete values[key]; // 处理一下脏数据
            }
          });
          item.personal_segmentation = item.potential + item.support_degree;
          segmentatFieldValues.push(item);
        });
        const finalValues = Object.assign({}, values, {
          _cascade: {
            create: Object.assign({}, create, {
              customer_segmentation_history_list: segmentatFieldValues,
            }),
          },
        });
        return finalValues;
      } else {
        message.error('请填写定级产品');
      }
    } else {
      return values;
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

  recordFormItem = () => {
    const {
      renderViewLayout,
      fieldList,
      component,
      relationLookupLayoutList,
      pageType,
      location,
      object_api_name: objectApiName,
      relatedListComponents,
      form,
      edit_mode,
    } = this.props;
    const { record } = this.state;
    const { component_name, type } = component;
    const query = location.query;

    if (type === 'detail_form') {
      const fieldSections = component.field_sections;
      if (fieldSections && fieldSections.length > 0) {
        const recordFormItems = fieldSections.map((fieldSection, index) => {
          const dataItem = null;
          const columns = fieldSection.columns;

          let needDisplay = checkSectionShowable(fieldSection, 'web', 'add');
          if (_.startsWith(pageType, 'add')) {
            if (_.indexOf(_.get(fieldSection, 'hidden_when'), 'add') >= 0) {
              needDisplay = false;
            }
          }
          if (needDisplay) {
            let formRowItems;
            const fieldSectionFields = _.get(fieldSection, 'fields', []);

            const isExtender = _.get(fieldSection, 'is_extender', false);

            if (isExtender) {
              // 如果渲染字段fields是空的，或者没有配置，检查是否配置的为组件
              const formItemExtender = _.get(fieldSection, 'form_item_extender');
              const formItemExtenderFilterLayout = _.get(fieldSection, 'form_item_extender_filter');
              const contentSpan = _.floor(24 / columns);
              const colKey = `row_${index}_${formItemExtender}`;
              switch (formItemExtender) {
                case 'CallProductKeyMessageFormItem':
                  {
                    const buildCall_cascade = () => {
                      const {
                        productCheckedList,
                        product_reaction_list,
                        keyMessageCheckedList,
                        keyMessage_reaction_list,
                        callClm_cascadeList,
                        callClmCheckedList,
                      } = this.state;

                      const keyMessageList = [];
                      const callProductList = [];

                      // 对已经选择的产品进行数据重组，新增
                      _.forEach(productCheckedList, (product) => {
                        const prodId = product.id;

                        const thisProductReactionList = _.filter(product_reaction_list, {
                          id: prodId,
                        });
                        // 构造拜访产品表数据，如果仅仅是选择了产品，但是没有进行反馈的填写
                        if (!_.isEmpty(thisProductReactionList)) {
                          _.forEach(thisProductReactionList, (productReaction) => {
                            callProductList.push({
                              product: prodId,
                              reaction: productReaction.reaction,
                              importance: productReaction.importance,
                            });
                          });
                        } else {
                          callProductList.push({
                            product: prodId,
                          });
                        }
                        const thisKeyMessageReactionList = _.filter(keyMessage_reaction_list, {
                          productId: prodId,
                        });
                        // 构造拜访反馈信息表数据，选择了反馈和反馈态度
                        if (!_.isEmpty(thisKeyMessageReactionList)) {
                          _.forEach(thisKeyMessageReactionList, (keyMessageReaction) => {
                            keyMessageList.push({
                              key_message: keyMessageReaction.id,
                              product: prodId,
                              reaction: _.get(keyMessageReaction, 'reaction'),
                            });
                          });
                        } else {
                          // 选择了反馈信息，而没有选择反馈态度
                          _.forEach(keyMessageCheckedList, (keyMessage) => {
                            const keyMessageId = keyMessage.id;
                            keyMessageList.push({
                              product: keyMessage.product,
                              key_message: keyMessage.id,
                            });
                          });
                        }
                      });

                      const _cascade = {
                        create: {
                          call_call_key_message_list: keyMessageList,
                          call_call_product_list: callProductList,
                          call_survey_feedback_list: callClm_cascadeList.create,
                        },
                      };
                      this.setState({ _cascade }, () => {
                        consoleUtil.log('_cascade', _cascade);
                      });
                    };

                    const productKeyMessageFormItemProps = {
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
                      onKeyMessageChange: (values) => {
                        this.setState({ keyMessageCheckedList: values }, () => {
                          buildCall_cascade();
                        });
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
                case 'SegmentationHistoryFormItem':
                  {
                    // this.setState({
                    //   isHasSegmentationHistory: true
                    // })
                    // * 绿谷定制产品定级
                    const segmentationHistoryFormItemProps = {
                      formItemExtenderFilterLayout,
                      fieldSectionFields,
                      form,
                      fieldSection,
                      parentRecord: record,
                      // fieldList,
                      pageType: this.props.pageType,
                      objectApiName: 'segmentation_history',
                      isRenderSegmentationHeader: (canRender) => {
                        this.setState({ canRender });
                      },
                      onProductChange: (values) => {
                        this.setState({ segmentationProductCheckedList: values });
                      },
                      hasSegmentationHistory: (boolean) => {
                        this.setState({
                          isHasSegmentationHistory: boolean,
                        });
                      },
                      formItemValueChange: (isChange) => {
                        this.setState({
                          isFormItemValueChange: isChange,
                        });
                      },
                    };
                    const { canRender } = this.state;
                    if (canRender) {
                      formRowItems = (
                        <Col
                          span={contentSpan}
                          key={`row_${index}_${formItemExtender}`}
                          className={styles.segmentationHistory}
                        >
                          <SegmentationHistoryFormItem {...segmentationHistoryFormItemProps} />
                        </Col>
                      );
                    }
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
                  });

                  if (showable) {
                    if (!_.isEmpty(fieldApiName)) {
                      const fieldItem = _.find(fieldList, { api_name: fieldApiName });

                      if (_.isEmpty(fieldItem)) {
                        consoleUtil.error(
                          '[配置错误]：字段在对象描述里面没有找到：',
                          objectApiName,
                          fieldApiName,
                        );
                        return false;
                      }
                      const mergedObjectFieldDescribe = Object.assign({}, fieldItem, renderField);

                      const fieldLabel = mergedObjectFieldDescribe.label;
                      const hasFieldPrivilege = fc_hasFieldPrivilege(objectApiName, fieldApiName, [
                        4,
                      ]);
                      if (!hasFieldPrivilege) {
                        consoleUtil.warn('[权限不足]：', objectApiName, fieldApiName, fieldLabel);
                        return false;
                      }
                      /**
                       * 处理fieldObject中此字段定义的默认值
                       */
                      const { default_value: field_default_value } = fieldItem;
                      if (!_.isUndefined(field_default_value) && !_.isNull(field_default_value)) {
                        _.set(record, fieldApiName, field_default_value);
                      }
                      /**
                       * 解析默认值表达式
                       */
                      const default_value = _.get(renderField, 'default_value');
                      if (default_value || default_value === 0) {
                        if (_.isObject(default_value)) {
                          if (hasExpression(default_value, 'expression')) {
                            record[fieldApiName] = callAnotherFunc(
                              new Function('t', getExpression(default_value, 'expression', false)),
                              record,
                            );
                          } else {
                            record[fieldApiName] = default_value;
                          }
                        } else {
                          record[fieldApiName] = default_value;
                        }
                      }
                      const routerParams = _.get(this, 'props.location.state', {});
                      const recordFormItemProps = {
                        routerParams,
                        objectApiName,
                        fieldItem,
                        // recordType,
                        dataItem: record,
                        renderFieldItem: renderField,
                        relationLookupLayoutList,
                        form,
                        formItemLayout,
                        dispatch: this.props.dispatch,
                        pageType: this.props.pageType,
                        query,
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

                          this.setState({
                            isFormItemValueChange: true,
                          });
                          // 处理级联设值的情况
                          const { onLookupChange } = renderField;
                          if (onLookupChange) {
                            const { record } = this.state;
                            const { setFields } = onLookupChange;
                            const updateFields = {};
                            setFields.forEach(({ source, target }) => {
                              const sourceExpression = _.get(source, 'expression', false);
                              if (sourceExpression) {
                                const func = new Function('r', sourceExpression);
                                updateFields[target] = func(lookupRecord) || null;
                              } else {
                                updateFields[target] = _.get(lookupRecord, source, null);
                              }
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
                  return crmIntlUtil.fmtStr('没有找到表单渲染字段');
                }
              });
              /**
               * 添加相关列表到表单中
               */
              formRowItems = appendRelatedFieldToSection({
                fieldSection,
                relatedListComponents,
                formRowItems,
                parentRecord: Object.assign({}, record, {
                  sign_in_time: moment(),
                }),
                pageType,
                location,
                form,
                parentApiName: objectApiName,
                rendered_callback: this.relatedFieldRenderedCallback,
              });
              // 根据配置的fields渲染出表单，结束
            }

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
                  return formRowItems ? (
                    <Panel
                      header={header}
                      disabled={needPanelDisabled}
                      key={field_section_key}
                      className={styles.fieldSectionHeader}
                      style={customPanelStyle}
                    >
                      <Row type="flex">{formRowItems}</Row>
                    </Panel>
                  ) : null;
                  // break;
                }
                default: {
                  break;
                }
              }
            } else {
              return formRowItems ? (
                <div key={field_section_key} style={{ marginBottom: 20 }}>
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
              ) : null;
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
              return (
                <div>
                  <Collapse
                    accordion={isAccordion}
                    bordered={isBordered}
                    defaultActiveKey={defaultActiveKey}
                  >
                    {recordFormItems}
                  </Collapse>
                </div>
              );
              // break;
            }
            default: {
              break;
            }
          }
        } else {
          return (
            <div>
              <Form horizontal key={component_name}>
                {recordFormItems}
              </Form>
            </div>
          );
        }
      } else {
        return crmIntlUtil.fmtStr('正在渲染');
      }
    } else {
      return '';
    }
  };

  relatedListItems = () => {
    const { relatedListComponents } = this.props;
    if (_.isEmpty(relatedListComponents)) {
      return '';
    }
    return relatedListComponents.map((x) => this.renderRelatedList(x));
  };

  onClickRelatedListAdd = (relatedListComponent) => {
    this.setState({
      modalVisible: true,
    });
  };

  childObjectAddModal = (relatedListComponent) => {
    const isAddress = relatedListComponent.ref_obj_describe === 'address';
    const relatedListApiName = relatedListComponent.related_list_name;
    let content = null;
    if (isAddress) {
      content = (
        <AddressForm
          ref={(ref) => {
            this.addForm = ref;
          }}
        />
      );
    } else {
      content = (
        <div>
          <p>{crmIntlUtil.fmtStr('通用子对象添加框')}</p>
        </div>
      );
    }
    const onModalOk = () => {
      this.addForm.validateFields((err, values) => {
        if (!err) {
          const relatedLists = this.state.relatedLists;
          if (relatedLists[relatedListApiName] == null) {
            relatedLists[relatedListApiName] = [];
          }
          relatedLists[relatedListApiName].push(values);
          this.setState({ modalVisible: false, relatedLists });
          // consoleUtil.log(this.state);
        }
      });
    };
    return (
      <Modal
        key={`modal- + ${relatedListComponent.header}`}
        title={crmIntlUtil.fmtStr('地址')}
        visible={this.state.modalVisible}
        onOk={onModalOk}
        onCancel={() => {
          this.setState({ modalVisible: false });
        }}
      >
        {content}
      </Modal>
    );
  };

  // 此处需要修改，此时是当页面有address的时候，就会显示
  renderRelatedList = (relatedListComponent) => {
    const isAddress = relatedListComponent.ref_obj_describe === 'address';
    const relatedListName = relatedListComponent.related_list_name;
    const dataSource = this.state.relatedLists[relatedListName] || [];
    // todo 改成读取组件的fields数组, 并结合子对象的字段描述生成列
    const columns = [
      {
        title: crmIntlUtil.fmtStr('label.country'),
        dataIndex: 'country',
        width: '20%',
        key: `${relatedListName}-country`,
      },
      {
        title: crmIntlUtil.fmtStr('label.province'),
        dataIndex: 'province',
        width: '20%',
        key: `${relatedListName}-province`,
      },
      {
        title: crmIntlUtil.fmtStr('label.city'),
        dataIndex: 'city',
        key: `${relatedListName}-city`,
      },
      {
        title: crmIntlUtil.fmtStr('label.district'),
        dataIndex: 'district',
        key: `${relatedListName}-district`,
      },
      {
        title: crmIntlUtil.fmtStr('label.detail_address'),
        dataIndex: 'address',
        key: `${relatedListName}-address`,
      },
      {
        title: crmIntlUtil.fmtStr('field.operation'),
        dataIndex: 'operation',
        key: 'operation',
        render: () => (
          <span className="table-operation" key={`${relatedListName}-address_span`}>
            <button>{crmIntlUtil.fmtStr('action.delete')}</button>
          </span>
        ),
      },
    ];

    const addressList = (
      <div key={`addressList_${relatedListComponent.header}`}>
        <Row className={styles.fieldSectionHeader}>
          <Col span={24}>
            <span>{relatedListComponent.header}</span>
          </Col>
        </Row>
        <Row className={styles.relationListBtnRow}>
          <Col span={2} offset={22}>
            <Button
              icon="plus-circle-o"
              className="primary btn"
              size="small"
              onClick={this.onClickRelatedListAdd.bind(this, relatedListComponent)}
            >
              {crmIntlUtil.fmtStr('添加')}
            </Button>
          </Col>
        </Row>
        <Row>
          <Table
            dataSource={dataSource}
            columns={columns}
            size="small"
            key="address_table_related"
          />
        </Row>
        {this.childObjectAddModal(relatedListComponent)}
      </div>
    );
    // todo 暂时只支持地址
    const commonRelatedList = <div />;
    return isAddress ? addressList : commonRelatedList;
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
export default Form.create()(RecordAdd);
