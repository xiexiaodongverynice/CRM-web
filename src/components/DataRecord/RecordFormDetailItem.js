import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { Form, Switch, Radio, Icon, Input, Collapse, Checkbox, InputNumber } from 'antd';
import { Link } from 'dva/router';
import JsonTable from '../common/JsonTable';
import FcSelectMultipleDetailItem from '../common/FcSelectMultipleDetailItem';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import ImageUploadFieldItem from './ImageUploadFieldItem';
import AttachmentFieldItem from './AttachmentFieldItem';
import fieldTypes from '../../utils/fieldTypes';
import { convertToPercentage } from '../../utils/dataUtil';
import consoleUtil from '../../utils/consoleUtil';
import FcFieldLableTip from '../common/FcFieldLableTip';

const Panel = Collapse.Panel;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;

const RecordFormDetailItem = ({
  objectApiName,
  dataItem,
  fieldItem = {},
  renderFieldItem = {},
  formItemLayout,
}) => {
  const mergedObjectFieldDescribe = Object.assign({}, fieldItem, renderFieldItem);
  let fieldRecord = _.get(dataItem, mergedObjectFieldDescribe.api_name);
  const o = _.has(dataItem, `${mergedObjectFieldDescribe.api_name}__r`);
  const renderType = _.get(renderFieldItem, 'render_type');

  const colKey = `detail_col_${mergedObjectFieldDescribe.api_name}`;
  const { type } = mergedObjectFieldDescribe;
  const fieldApiName = mergedObjectFieldDescribe.field;
  const fieldLabel = crmIntlUtil.fmtStr(
    `field.${objectApiName}.${mergedObjectFieldDescribe.api_name}`,
    mergedObjectFieldDescribe.label,
  );
  const hasFieldPrivilege = fc_hasFieldPrivilege(objectApiName, fieldApiName, [2, 4]);
  if (!hasFieldPrivilege) {
    consoleUtil.warn('[权限不足]：', objectApiName, fieldApiName, fieldLabel);
    return false;
  }

  // fieldRecord !== null && fieldRecord != undefined
  if ((renderType === 'date_time' || renderType === 'time') && _.isNumber(fieldRecord)) {
    const formatStr = _.get(
      mergedObjectFieldDescribe,
      'date_time_format',
      _.get(mergedObjectFieldDescribe, 'date_format'),
    );
    if (renderType === 'time') {
      fieldRecord = moment.utc(fieldRecord).format(formatStr);
    } else {
      fieldRecord = moment(fieldRecord).format(formatStr);
    }
  } else if (type === 'relation' && _.get(mergedObjectFieldDescribe, 'is_link', false)) {
    // *relation字段设置is_link支持页面跳转 CRM-3993
    const targetApiName = mergedObjectFieldDescribe.target_object_api_name;
    const targetId = dataItem[mergedObjectFieldDescribe.api_name];
    const targetLayoutRecordType = _.get(
      mergedObjectFieldDescribe,
      'target_layout_record_type',
      _.get(dataItem, `${mergedObjectFieldDescribe.api_name}__r.record_type`, 'master'),
    );
    const detailUrl = `object_page/${targetApiName}/${targetId}/detail_page?recordType=${targetLayoutRecordType}`;
    fieldRecord = (
      <Link to={detailUrl} target="_blank">
        <span>
          {o ? _.get(dataItem, `${mergedObjectFieldDescribe.api_name}__r.name`) : fieldRecord}
        </span>
      </Link>
    );
  } else if (o) {
    fieldRecord = _.get(dataItem, `${mergedObjectFieldDescribe.api_name}__r.name`);
  } else if (renderType === 'radio') {
    let { options } = mergedObjectFieldDescribe;
    if (type === 'boolean' && _.isEmpty(options)) {
      options = [
        {
          label: crmIntlUtil.fmtStr('label.yes', '是'),
          value: true,
        },
        {
          label: crmIntlUtil.fmtStr('label.no', '否'),
          value: false,
        },
      ];
    }
    if (_.isEmpty(options)) {
      consoleUtil.warn('[缺少配置项]', mergedObjectFieldDescribe.api_name, '选项配置为空，请检查');
    }
    const radioChildren = options.map((pro) => {
      const optionsLabel = crmIntlUtil.fmtStr(
        `options.${objectApiName}.${fieldApiName}.${pro.value}`,
        _.get(pro, 'label'),
      );
      return (
        <Radio value={pro.value} key={pro.value}>
          {optionsLabel}
        </Radio>
      );
    });
    fieldRecord = (
      <RadioGroup value={fieldRecord} disabled>
        {radioChildren}
      </RadioGroup>
    );
  } else if (renderType === 'boolean') {
    let { options } = mergedObjectFieldDescribe;
    if (_.isEmpty(options)) {
      options = [
        {
          label: crmIntlUtil.fmtStr('label.yes', '是'),
          value: true,
        },
        {
          label: crmIntlUtil.fmtStr('label.no', '否'),
          value: false,
        },
      ];
    }
    let option = _.find(options, { value: fieldRecord });
    if (_.isEmpty(option)) {
      option = {
        label: fieldRecord,
        value: fieldRecord,
      };
    }
    fieldRecord = crmIntlUtil.fmtStr(
      `options.${objectApiName}.${fieldApiName}.${fieldRecord}`,
      _.get(option, 'label', ''),
    );
  } else if (renderType === 'select_one' || renderType === 'star') {
    const props = {
      fieldItem,
      fieldRecord,
      renderFieldItem,
      mergedObjectFieldDescribe,
      fieldLabel,
      objectApiName,
      fieldApiName,
      dataItem,
    };

    if (
      ((_.isArray(fieldRecord) || _.isNull(fieldRecord)) && _.isEmpty(fieldRecord)) ||
      fieldRecord === undefined
    ) {
      fieldRecord = null;
    } else {
      fieldRecord = <FcSelectMultipleDetailItem {...props} />;
    }
  } else if (renderType === 'select_multiple') {
    // let { options } = mergedObjectFieldDescribe;
    const props = {
      fieldItem,
      fieldRecord,
      renderFieldItem,
      mergedObjectFieldDescribe,
      fieldLabel,
      objectApiName,
      fieldApiName,
      dataItem,
    };
    if (
      ((_.isArray(fieldRecord) || _.isNull(fieldRecord)) && _.isEmpty(fieldRecord)) ||
      fieldRecord === undefined
    ) {
      fieldRecord = null;
    } else {
      fieldRecord = <FcSelectMultipleDetailItem {...props} mode="multiple" />;
    }
  } else if (renderType === 'checkbox') {
    const { options } = mergedObjectFieldDescribe;
    if (_.isEmpty(options)) {
      consoleUtil.log(objectApiName, '选项配置为空，请检查');
    }
    const checkboxOption = options.map((pro) => {
      const optionsLabel = crmIntlUtil.fmtStr(
        `options.${objectApiName}.${fieldApiName}.${pro.value}`,
        _.get(pro, 'label'),
      );
      const ck = { label: optionsLabel, value: pro.value };
      return ck;
    });
    const checkboxChildren = options.map((pro) => {
      const optionsLabel = crmIntlUtil.fmtStr(
        `options.${objectApiName}.${fieldApiName}.${pro.value}`,
        _.get(pro, 'label'),
      );
      return (
        <Checkbox value={pro.value} key={pro.value}>
          {optionsLabel}
        </Checkbox>
      );
    });
    fieldRecord = (
      <div style={{ display: 'inline-block' }}>
        <CheckboxGroup options={checkboxOption} defaultValue={fieldRecord} disabled />
      </div>
    );
  } else if (renderType === 'switch') {
    fieldRecord = (
      <Switch
        checkedChildren={<Icon type="check" />}
        unCheckedChildren={<Icon type="cross" />}
        defaultChecked={fieldRecord}
        onChange={this.dataRecordUpdate.bind(
          null,
          mergedObjectFieldDescribe.api_name,
          !fieldRecord,
        )}
      />
    );
  } else if (renderType === 'json_table') {
    if (!fieldRecord) {
      fieldRecord = <pre />;
    }
    // 针对辅导问卷结果的特殊renderType
    try {
      const value = JSON.parse(fieldRecord);
      if (Array.isArray(value)) {
        fieldRecord = <JsonTable value={value} />;
      } else {
        // consoleUtil.log('Invalid json format', fieldRecord);
        fieldRecord = <pre>{fieldRecord}</pre>;
      }
    } catch (ex) {
      consoleUtil.warn('Coach survey invalid json format: ', fieldRecord);
      fieldRecord = <pre>{fieldRecord}</pre>;
    }
  } else if (mergedObjectFieldDescribe.type === 'long_text') {
    const collapseKey = `long_text_${mergedObjectFieldDescribe.api_name}`;
    const mix_length = _.get(mergedObjectFieldDescribe, 'mix_length');
    const max_length = _.get(mergedObjectFieldDescribe, 'max_length');
    const width = _.get(mergedObjectFieldDescribe, 'width', '400px');
    const height = _.get(mergedObjectFieldDescribe, 'height', '60px');
    fieldRecord = (
      <TextArea
        readOnly
        style={{ width, height }}
        maxLength={max_length}
        minLength={mix_length}
        value={fieldRecord}
      />
    );

    // fieldRecord = (<Collapse bordered={false} key={collapseKey} style={{ position: 'relative', left: 20 }}>
    //   <Panel key="1">
    //     <pre>{fieldRecord}</pre>
    //   </Panel>
    // </Collapse>);
  } else if (renderType === 'url' || type === 'url') {
    const collapseKey = `url_${mergedObjectFieldDescribe.api_name}`;
    try {
      fieldRecord = decodeURIComponent(fieldRecord);
      if (_.get(mergedObjectFieldDescribe, 'is_link', true)) {
        fieldRecord = /^https?:\/\//.test(fieldRecord) ? (
          <a href={fieldRecord} target="_blank">
            <span>{fieldRecord}</span>
          </a>
        ) : (
          <Link to={fieldRecord} target="_blank">
            <span>{fieldRecord}</span>
          </Link>
        );
      }
    } catch (e) {
      consoleUtil.error(e);
    }
  } else if (renderType === 'image_upload') {
    const value = fieldRecord;
    fieldRecord = (
      <ImageUploadFieldItem
        value={value}
        relationField={fieldItem}
        renderFieldOption={mergedObjectFieldDescribe}
        onlyView
      />
    );
  } else if (renderType === 'money') {
    const value = fieldRecord;
    const symbol = _.get(mergedObjectFieldDescribe, 'symbol', '');
    fieldRecord =
      // eslint-disable-next-line eqeqeq
      value == undefined ? '' : symbol + `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // (
    //   <InputNumber
    //   size="large"
    //   defaultValue = {symbol + `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    //   disabled
    // />
    // );
  } else if (renderType === 'attachment' || renderType === 'video') {
    // consoleUtil.log(fieldItem, '--------fieldItem');
    fieldRecord = <AttachmentFieldItem value={fieldRecord} relationField={fieldItem} onlyView />;
  } else if (renderType === fieldTypes.PERCENTAGE || type === fieldTypes.PERCENTAGE) {
    fieldRecord = convertToPercentage(fieldRecord);
  } else if (renderType === 'inner_html') {
    fieldRecord = <span dangerouslySetInnerHTML={{ __html: _.toString(fieldRecord) }} />;
  }

  // fieldLabelTip;
  // label增加tip配置
  const fieldLabelTip = FcFieldLableTip(renderFieldItem, fieldLabel);

  return (
    <FormItem
      {...formItemLayout}
      // required={_.get(mergedObjectFieldDescribe, 'is_required', false)}
      label={fieldLabelTip}
      key={colKey}
    >
      {renderType === 'attachment' ? (
        fieldRecord
      ) : (
        <span
          style={{ fontSize: 14, color: '#333', wordBreak: 'break-word' }}
          className="ant-form-text"
        >
          {fieldRecord}
        </span>
      )}
    </FormItem>
  );
};

RecordFormDetailItem.propTypes = {
  objectApiName: PropTypes.string,
  dataItem: PropTypes.object,
  fieldItem: PropTypes.object,
  renderFieldItem: PropTypes.object,
};

export default RecordFormDetailItem;
