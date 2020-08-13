import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {
  Form,
  Switch,
  Radio,
  Row,
  Col,
  Checkbox,
  Icon,
  Input,
  DatePicker,
  TimePicker,
  InputNumber,
} from 'antd';
import RelationFieldItem from './RelationFieldItem';
import SubordinateSelectFormItem from '../common/SubordinateSelectFormItem';
import FcSelectMultipleFormItem from '../common/FcSelectMultipleFormItem';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import ImageUploadFieldItem from './ImageUploadFieldItem';
import { callAnotherFunc } from '../../utils';
import AttachmentFieldItem from './AttachmentFieldItem';
import { getExpression } from '../../utils/expressionUtils';
import InputPercent from '../InputPercent';
import fieldTypes from '../../utils/fieldTypes';
import consoleUtil from '../../utils/consoleUtil';
import FcFieldLableTip from '../common/FcFieldLableTip';

const { TextArea } = Input;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const message_require = crmIntlUtil.fmtStr('message.is_required');
const RecordFormItem = ({
  routerParams,
  objectApiName,
  dataItem,
  fieldItem = {},
  renderFieldItem = {},
  relationLookupLayoutList = {},
  form,
  formItemLayout,
  dispatch,
  pageType,
  onChange,
  formItemValueChange,
  labelShowable = true,
  namespace = null,
  parentRecord = {},
  isRelationModalDestroyedWhenClosed = false,
}) => {
  /**
   * 如果字段名称需要约束命名空间，则加入命名空间前缀
   * @param {String} field_api_name
   */
  const getFieldApiName = (field_api_name) => {
    if (!_.isNull(namespace) && !_.isEqual('', _.trim(field_api_name))) {
      return `${namespace}.${field_api_name}`;
    }
    return field_api_name;
  };

  const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
  const handleFormItemValueChange = (val) => {
    formItemValueChange(true);
  };
  const mergedObjectFieldDescribe = Object.assign({}, fieldItem, renderFieldItem);
  const { type, is_virtual } = mergedObjectFieldDescribe;
  const renderType = mergedObjectFieldDescribe.render_type;
  const hiddenWhen = _.get(renderFieldItem, 'hidden_when');
  const pattern = _.get(mergedObjectFieldDescribe, 'pattern');
  const message = _.get(mergedObjectFieldDescribe, 'message');
  const fieldApiName = mergedObjectFieldDescribe.field;

  /**
   * 表单不同步，需要手动merge表单内容
   *
   * TODO merge操作最好可以放到上层组件中， 但不知道是否会造成其他问题，需要在前端重构的时候，彻底梳理下
   *
   */
  const completeDataItem = Object.assign(
    {},
    form.getFieldsValue(),
    _.omitBy(dataItem, _.isUndefined),
    routerParams,
  );

  const isRequired =
    callAnotherFunc(
      new Function('t', _.get(mergedObjectFieldDescribe, 'is_required_expression', 'return false')),
      completeDataItem,
    ) || _.get(mergedObjectFieldDescribe, 'is_required', false);

  let fieldLabel = '';
  if (labelShowable) {
    // fix bug,优先使用布局里面field.i18n_key，第二选择 field.<object_api_name>.<field_api_name>，最后选择label
    fieldLabel = crmIntlUtil.fmtStr(
      _.get(mergedObjectFieldDescribe, 'field.i18n_key'),
      crmIntlUtil.fmtStr(
        `field.${objectApiName}.${mergedObjectFieldDescribe.api_name}`,
        mergedObjectFieldDescribe.label,
      ),
    );
  }
  // labelTip配置;
  const fieldLabelTip = FcFieldLableTip(mergedObjectFieldDescribe, fieldLabel);
  let needDisabled = false;
  let needDisplay = true;

  /**
   * TODO 此处写了一大堆，需要优化
   */
  if (_.startsWith(pageType, 'add')) {
    if (is_virtual || _.indexOf(hiddenWhen, 'add') >= 0) {
      needDisplay = false;
    }
    if (_.indexOf(_.get(mergedObjectFieldDescribe, 'disabled_when'), 'add') >= 0) {
      needDisabled = true;
    }
  } else if (_.startsWith(pageType, 'edit')) {
    if (is_virtual || _.indexOf(hiddenWhen, 'edit') >= 0) {
      needDisplay = false;
    }
    if (_.indexOf(_.get(mergedObjectFieldDescribe, 'disabled_when'), 'edit') >= 0) {
      needDisabled = true;
    }
  }
  const fun = getExpression(mergedObjectFieldDescribe, 'disabled_expression');
  needDisabled = callAnotherFunc(new Function('t', fun), form.getFieldsValue()) || needDisabled;

  if (!needDisplay) {
    return null;
  }

  const hasFieldPrivilege = fc_hasFieldPrivilege(objectApiName, fieldApiName, [4]);
  if (!hasFieldPrivilege) {
    consoleUtil.warn('[权限不足]：', objectApiName, fieldApiName, fieldLabel);
    return false;
  }

  // if(needDisabled){
  //   const recordFormItemProps = {
  //     objectApiName,
  //     fieldItem,
  //     dataItem,
  //     renderFieldItem,
  //     formItemLayout,
  //   };
  //   return (
  //     <RecordFormDetailItem {...recordFormItemProps}/>
  //   )
  // }

  if (renderType === 'radio') {
    let { options } = mergedObjectFieldDescribe;

    if (type === 'boolean' && _.isEmpty(options)) {
      options = [
        {
          label: crmIntlUtil.fmtStr('label.yes'),
          value: true,
        },
        {
          label: crmIntlUtil.fmtStr('label.no'),
          value: false,
        },
      ];
    }
    if (_.isEmpty(options)) {
      consoleUtil.warn('[警告]', getFieldApiName(fieldItem.api_name), '选项配置为空，请检查');
    }

    const radioChildren = options.map((pro) => {
      const optionsLabel = crmIntlUtil.fmtStr(
        `options.${objectApiName}.${fieldApiName}.${pro.value}`,
        _.get(pro, 'label'),
      );
      return (
        <Radio
          value={pro.value}
          key={`${getFieldApiName(fieldItem.api_name)}_${pro.value}`}
          onChange={handleFormItemValueChange}
        >
          {optionsLabel}
        </Radio>
      );
    });

    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              required: isRequired,
              message: message ? crmIntlUtil.fmtStr(message) : `${fieldLabel} ${message_require}.`,
            },
          ],
        })(
          <RadioGroup disabled={needDisabled} onChange={handleFormItemValueChange}>
            {radioChildren}
          </RadioGroup>,
        )}
      </FormItem>
    );
  } else if (renderType === 'select_one' || renderType === 'star') {
    const props = {
      fieldItem,
      formItemLayout,
      getFieldDecorator,
      dataItem: completeDataItem,
      renderFieldItem,
      needDisabled,
      mergedObjectFieldDescribe,
      fieldLabel,
      objectApiName,
      fieldApiName,
      form,
      namespace,
      onChange,
    };
    return <FcSelectMultipleFormItem {...props} />;
  } else if (renderType === 'select_multiple') {
    const props = {
      fieldItem,
      formItemLayout,
      getFieldDecorator,
      dataItem: completeDataItem,
      renderFieldItem,
      needDisabled,
      mergedObjectFieldDescribe,
      fieldLabel,
      objectApiName,
      fieldApiName,
      form,
      namespace,
    };

    return <FcSelectMultipleFormItem {...props} mode="multiple" />;
  } else if (renderType === 'checkbox') {
    const { options } = mergedObjectFieldDescribe;
    if (_.isEmpty(options)) {
      consoleUtil.warn('[警告]', getFieldApiName(fieldItem.api_name), '选项配置为空，请检查');
    }
    const checkboxChildren = options.map((pro) => {
      const optionsLabel = crmIntlUtil.fmtStr(
        `options.${objectApiName}.${fieldApiName}.${pro.value}`,
        _.get(pro, 'label'),
      );
      return (
        <Checkbox
          value={pro.value}
          key={`${getFieldApiName(fieldItem.api_name)}_${pro.value}`}
          onChange={handleFormItemValueChange}
        >
          {optionsLabel}
        </Checkbox>
      );
    });
    const checkboxIndex = `checkbox_${getFieldApiName(fieldItem.api_name)}`;
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              required: isRequired,
              message: message ? crmIntlUtil.fmtStr(message) : `${fieldLabel} ${message_require}.`,
            },
          ],
        })(
          <Checkbox.Group
            key={checkboxIndex}
            disabled={needDisabled}
            onChange={handleFormItemValueChange}
          >
            {checkboxChildren}
          </Checkbox.Group>,
        )}
      </FormItem>
    );
  } else if (renderType === 'switch') {
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          rules: [
            {
              required: isRequired,
              message: message ? crmIntlUtil.fmtStr(message) : `${fieldLabel} ${message_require}.`,
            },
          ],
        })(
          <Switch
            disabled={needDisabled}
            checkedChildren={<Icon type="check" />}
            unCheckedChildren={<Icon type="cross" />}
            defaultChecked={_.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`)}
            onChange={handleFormItemValueChange}
          />,
        )}
      </FormItem>
    );
  } else if (renderType === 'long_text') {
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              pattern,
              required: isRequired,
              message: message ? crmIntlUtil.fmtStr(message) : `${fieldLabel} ${message_require}.`,
            },
          ],
        })(
          <TextArea
            disabled={needDisabled}
            placeholder={fieldItem.help_text}
            autosize
            maxLength={fieldItem.max_length}
            minLength={fieldItem.mix_length}
            onChange={handleFormItemValueChange}
          />,
        )}
      </FormItem>
    );
  } else if (renderType === 'phone') {
    // const prefixSelector = getFieldDecorator('prefix', {
    //   initialValue: '86',
    // })(
    //   <Select style={{ width: 60 }}>
    //     <Option value="86">+86</Option>
    //   </Select>,
    // );

    const onChange = (value) => {
      // this.setState({ value });
    };
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              required: isRequired,
              pattern:
                pattern ||
                /^(((\+86)|(\+86-)|(86)|(86-))?(\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)$/,
              message: crmIntlUtil.fmtStr(message || 'Need the correct phone number'),
            },
          ],
        })(
          <Input
            style={{ width: '100%', flex: 1 }}
            disabled={needDisabled}
            placeholder={fieldItem.help_text}
            onChange={handleFormItemValueChange}
            minLength={fieldItem.min_length}
            maxLength={fieldItem.max_length}
          />,
        )}
      </FormItem>
    );
  } else if (renderType === 'email') {
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              type: 'email',
              pattern: pattern || /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
              required: isRequired,
              message: crmIntlUtil.fmtStr(message || 'message.Need the correct email address'),
            },
          ],
        })(
          <Input
            disabled={needDisabled}
            placeholder={fieldItem.help_text}
            maxLength={fieldItem.max_length}
            onChange={handleFormItemValueChange}
          />,
        )}
      </FormItem>
    );
  } else if (renderType === 'subordinate') {
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              required: isRequired,
              message: message ? crmIntlUtil.fmtStr(message) : `${fieldLabel} ${message_require}.`,
            },
          ],
        })(
          <SubordinateSelectFormItem
            selectedSubordinate={
              _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}__r`) || {}
            }
            disabled={needDisabled}
            onChange={handleFormItemValueChange}
          />,
        )}
      </FormItem>
    );
  } else if (type === 'relation') {
    const itemFieldApiName = `${getFieldApiName(fieldItem.api_name)}`;
    let itemInitialValue = _.get(completeDataItem, itemFieldApiName);
    itemInitialValue =
      _.isUndefined(itemInitialValue) || _.isNull(itemInitialValue)
        ? itemInitialValue
        : String(itemInitialValue);
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        <Row gutter={8}>
          <Col span={24}>
            {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
              initialValue: _.has(completeDataItem, itemFieldApiName) ? itemInitialValue : '',
              rules: [
                {
                  required: isRequired,
                  message: message
                    ? crmIntlUtil.fmtStr(message)
                    : `${fieldLabel} ${message_require}.`,
                },
              ],
            })(
              <RelationFieldItem
                form={form}
                pageType={pageType}
                relationField={fieldItem}
                renderFieldOption={mergedObjectFieldDescribe}
                needDisabled={needDisabled}
                dataItem={
                  !_.isNull(namespace) ? _.get(completeDataItem, namespace) : completeDataItem
                }
                parentRecord={parentRecord}
                onChange={onChange}
                isRelationModalDestroyedWhenClosed={isRelationModalDestroyedWhenClosed}
              />,
            )}
          </Col>
        </Row>
      </FormItem>
    );
  } else if (
    renderType === 'date_time' ||
    type === 'date_time' ||
    type === 'date' ||
    type === 'time'
  ) {
    const logDate = (value) => {
      if (type === 'time') {
        consoleUtil.log('onChange Time: ', moment(value).format('HH:mm'));
      } else {
        consoleUtil.log('onChange Time: ', moment(value).format('YYYY-MM-DD HH:mm:ss'));
      }
    };
    const onChange = (value, dateString) => {
      logDate(value);
      consoleUtil.log('Formatted onChange Time: ', dateString);
    };
    const onOk = (value, renderType) => {
      logDate(value);

      const onDatePickerChangeLayout = _.get(mergedObjectFieldDescribe, 'onDatePickerChange');
      if (!_.isEmpty(onDatePickerChangeLayout)) {
        const setFieldsLayout = _.get(onDatePickerChangeLayout, 'setFields');
        _.forEach(setFieldsLayout, (setFields) => {
          const { target } = setFields;
          const source = _.get(setFields, 'source', fieldApiName);
          const operator = _.get(setFields, 'operator', 'add');
          let val = _.get(setFields, 'val');
          const option = {};
          const souceValTime = getFieldValue(source);
          /**
           * 当不选时间直接点确认时，此处会报错
           */
          if (_.isUndefined(souceValTime)) {
            return;
          }
          const sourceVal = getFieldValue(source).valueOf();
          if (renderType === 'time') {
            if (operator === 'add') {
              _.set(option, `${target}`, moment.utc(sourceVal).add(val, 'seconds'));
            } else if (operator === 'subtract') {
              if (val < 0) {
                val *= -1;
                _.set(option, `${target}`, moment.utc(sourceVal).subtract(val, 'seconds'));
              } else {
                _.set(option, `${target}`, moment.utc(sourceVal).subtract(val, 'seconds'));
              }
            } else {
              consoleUtil.warn(`[警告]您的配置操作符${operator}仅支持add,subtract操作符，请确认。`);
            }
          } else if (operator === 'add') {
            _.set(option, `${target}`, moment(sourceVal).add(val, 'seconds'));
          } else if (operator === 'subtract') {
            if (val < 0) {
              val *= -1;
              _.set(option, `${target}`, moment(sourceVal).subtract(val, 'seconds'));
            } else {
              _.set(option, `${target}`, moment(sourceVal).subtract(val, 'seconds'));
            }
          } else {
            consoleUtil.warn(`[警告]您的配置操作符${operator}仅支持add,subtract操作符，请确认。`);
          }
          setFieldsValue(option);
        });
      }
    };

    const dateFormat = _.get(
      mergedObjectFieldDescribe,
      'date_time_format',
      _.get(mergedObjectFieldDescribe, 'date_format'),
    );

    const defaultValue = _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`);
    const datePickerConfig = {
      rules: [
        {
          required: isRequired,
          message: message ? crmIntlUtil.fmtStr(message) : `${fieldLabel} ${message_require}.`,
        },
      ],
    };
    if (defaultValue) {
      if (renderType === 'time') {
        _.set(datePickerConfig, 'initialValue', moment.utc(defaultValue));
      } else {
        _.set(datePickerConfig, 'initialValue', moment(defaultValue));
      }
    } else {
      // _.set(datePickerConfig,'initialValue',null)
    }

    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(
          `${getFieldApiName(fieldItem.api_name)}`,
          datePickerConfig,
        )(
          type === 'time' ? (
            <TimePicker
              disabled={needDisabled}
              format={dateFormat}
              style={{ width: '100%', flex: 1 }}
              // disabledHours={disabledHours}
              // disabledMinutes={disabledMinutes}
              // disabledSeconds={disabledSeconds}
              onChange={(val) => {
                if (val === null) return;
                // eslint-disable-next-line no-mixed-operators
                val = moment.utc((val.hour() * 60 + val.minute()) * 60 * 1000);
                handleFormItemValueChange(val);
                /**
                 * 将onOk任务排到最后，等待form表单的值发生变化，否则onOK会发生错误
                 */
                setTimeout(() => {
                  setFieldsValue({
                    [getFieldApiName(fieldItem.api_name)]: val,
                  });
                  onOk(val, 'time');
                }, 0);
              }}
            />
          ) : (
            <DatePicker
              disabled={needDisabled}
              showTime
              format={dateFormat}
              style={{ width: '100%', flex: 1 }}
              // disabledHours={disabledHours}
              // disabledMinutes={disabledMinutes}
              // disabledSeconds={disabledSeconds}
              onChange={handleFormItemValueChange}
              onOk={onOk}
            />
          ),
        )}
      </FormItem>
    );
  } else if (renderType === 'money') {
    const symbol = _.get(mergedObjectFieldDescribe, 'symbol', '');
    let MoneyPattern;
    let reg = /\$\s?|(,*)/g;
    if (symbol === '$') {
      reg = /\$\s?|(,*)/g;
    }
    if (symbol === '￥') {
      reg = /￥\s?|(,*)/g;
    }
    if (symbol === '¥') {
      reg = /¥\s?|(,*)/g;
    }
    if (type === 'big_int') {
      MoneyPattern = new RegExp('^[1-9]\\d*$');
    } else {
      const decimal_places = _.get(mergedObjectFieldDescribe, 'decimal_places', 2);
      MoneyPattern = new RegExp(`(^[0-9]([0-9]+)?(\\.[0-9]{1,${decimal_places}})?$)`);
      // new RegExp(`(^[1-9]([0-9]+)?(\\.[0-9]{1,${decimal_places}})?$)|(^(0){1}$)|(^[0-9]\\.[0-9]([0-9])?$)`);
    }
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              required: isRequired,
              pattern: pattern || MoneyPattern,
              message: crmIntlUtil.fmtStr(
                message || 'message.please enter the correct integer format',
              ),
            },
          ],
        })(
          <InputNumber
            style={{ width: '100%', flex: 1 }}
            size="large"
            formatter={(value) => `${symbol} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(reg, '')}
          />,
        )}
      </FormItem>
    );
  } else if (type === 'big_int') {
    const onChange = (value) => {
      // this.setState({ value }
    };
    let max_length = _.get(mergedObjectFieldDescribe, 'max_length', 10);
    if (!max_length) {
      max_length = 5;
    }
    const bigIntPattern = new RegExp(`(^-?[1-9]\\d{0,${max_length - 1}}?$)`);
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              required: isRequired,
              pattern: pattern || bigIntPattern,
              message: crmIntlUtil.fmtStr(
                message || 'message.please enter the correct integer format',
              ),
            },
          ],
        })(
          <Input
            style={{ width: '100%', flex: 1 }}
            disabled={needDisabled}
            placeholder={fieldItem.help_text}
            minLength={fieldItem.min_length}
            maxLength={fieldItem.max_length}
          />,
        )}
      </FormItem>
    );
  } else if (type === 'real_number') {
    const decimal_places = _.get(mergedObjectFieldDescribe, 'decimal_places', 1);
    const realNumberPattern = new RegExp(`^[+-]?\\d+(\\.\\d{1,${decimal_places}})?$`);
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              required: isRequired,
              pattern: pattern || realNumberPattern,
              message: `${crmIntlUtil.fmtStr(
                message ||
                  'message.please enter the correct number, if it is decimal, the decimal number is',
              )} ${decimal_places}.`,
            },
          ],
        })(
          <Input
            style={{ width: '100%', flex: 1 }}
            disabled={needDisabled}
            placeholder={fieldItem.help_text}
            onChange={handleFormItemValueChange}
            minLength={fieldItem.min_length}
            maxLength={fieldItem.max_length}
          />,
        )}
      </FormItem>
    );
  } else if (renderType === 'image_upload') {
    // 01/03/2018 - TAG: 图片上传组件
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              required: isRequired,
              message: message ? crmIntlUtil.fmtStr(message) : `${fieldLabel} ${message_require}.`,
            },
          ],
        })(
          <ImageUploadFieldItem
            relationField={fieldItem}
            renderFieldOption={mergedObjectFieldDescribe}
            needDisabled={needDisabled}
            onChange={handleFormItemValueChange}
          />,
        )}
      </FormItem>
    );
  } else if (type === 'attachment' || renderType === 'video') {
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              required: isRequired,
              message: message ? crmIntlUtil.fmtStr(message) : `${fieldLabel} ${message_require}.`,
            },
          ],
        })(
          <AttachmentFieldItem
            relationField={fieldItem}
            renderFieldOption={mergedObjectFieldDescribe}
            needDisabled={needDisabled}
            onChange={handleFormItemValueChange}
          />,
        )}
      </FormItem>
    );
  } else if (renderType === fieldTypes.PERCENTAGE || type === fieldTypes.PERCENTAGE) {
    const integer_max_length = _.get(mergedObjectFieldDescribe, 'integer_max_length');
    const decimal_max_length = _.get(mergedObjectFieldDescribe, 'decimal_max_length');
    const message_decimal = '的小数位长度超出限制，限制位数：';
    const message_integer = '的整数位长度超出限制，限制位数：';
    const patt = new RegExp(
      `^\\d{1,${integer_max_length}}%$|^\\d{1,${integer_max_length}}[.]\\d{1,${decimal_max_length}}%$`,
    );
    const validFunction = (rule, value, callback) => {
      if (value != undefined) {
        const index = toString(value).indexOf('.');
        if (!patt.test(value)) {
          if (index !== 0) {
            callback(`${getFieldApiName(fieldItem.label)}${message_decimal}${decimal_max_length}`);
          } else {
            callback(`${getFieldApiName(fieldItem.label)}${message_integer}${integer_max_length}`);
          }
        }
        callback();
      }
      callback();
    };
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              required: isRequired,
              message: message ? crmIntlUtil.fmtStr(message) : `${fieldLabel} ${message_require}.`,
            },
            {
              validator: validFunction,
            },
          ],
        })(
          <InputPercent
            integer_max_length={Number(integer_max_length)}
            decimal_max_length={Number(decimal_max_length)}
            disabled={needDisabled}
            onChange={handleFormItemValueChange}
            changeInitialVal={_.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`)}
          />,
        )}
      </FormItem>
    );
  } else {
    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${getFieldApiName(fieldItem.api_name)}`, {
          initialValue: _.get(completeDataItem, `${getFieldApiName(fieldItem.api_name)}`),
          rules: [
            {
              pattern,
              required: isRequired,
              message: message ? crmIntlUtil.fmtStr(message) : `${fieldLabel} ${message_require}.`,
              whitespace: !_.get(mergedObjectFieldDescribe, 'need_whitespace', false), // 空格是否视为错误，默认：是错误
            },
          ],
        })(
          <Input
            disabled={needDisabled}
            placeholder={fieldItem.help_text}
            maxLength={fieldItem.max_length}
            onChange={handleFormItemValueChange}
          />,
        )}
      </FormItem>
    );
  }
};

RecordFormItem.propTypes = {
  form: PropTypes.object.isRequired,
  objectApiName: PropTypes.string,
  mergedObjectFieldDescribe: PropTypes.object,
  dataItem: PropTypes.object,
  fieldItem: PropTypes.object,
  renderFieldItem: PropTypes.object,
  // recordType: PropTypes.object,
  relationLookupLayout: PropTypes.object,
  // pageType: PropTypes.String,
  dispatch: PropTypes.func,
};

export default RecordFormItem;
