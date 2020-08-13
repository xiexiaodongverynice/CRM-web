/* eslint-disable no-case-declarations,no-underscore-dangle,react/no-multi-comp */
/**
 * Created by xinli on 2017/8/28.
 */
import React from 'react';
import moment from 'moment';
import _ from 'lodash';
// import { FormattedMessage } from 'react-intl';
import {
  Form,
  Button,
  Row,
  Col,
  DatePicker,
  Input,
  Cascader,
  Switch,
  Select,
  InputNumber,
  Radio,
  Slider,
  Modal,
  Collapse,
  Tag,
} from 'antd';
import styles from './recordFilter.less';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import RecordFilterSelector from './RecordFilterSelector';
import { randomKey, valueToArray, ifEmptyToUndefined, ifArrayGetFirst } from '../../utils/lo';
import { buildOptions } from './common/record';
import consoleUtil from '../../utils/consoleUtil';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const datePickerProps = () => {
  return {
    key: `dp-${randomKey()}`,
    style: {
      width: '100%',
    },
    size: 'large',
  };
};

const getNameIfTypeIsRelation = (api_name, fieldType) => {
  if (fieldType === 'relation' || _.indexOf(['create_by', 'update_by', 'owner'], api_name) >= 0) {
    return `${api_name}__r.name`;
  }
  return api_name;
};

const toMoment = (v) => {
  return moment(v);
  // v ? moment.unix(v / 1000) : moment();
};

export default class CriteriaRow extends React.Component {
  constructor(props) {
    super(props);

    const { defaultField, defaultOperator, defaultValue } = this.props;

    this.state = {
      field: defaultField,
      operator: defaultOperator,
      value: defaultValue,

      selectedField: null,

      operatorOptions: [],
    };
  }

  componentWillMount() {
    const { field } = this.state;
    if (!_.isEmpty(field)) {
      this.onFieldSelectorChange(field);
    }
  }

  onFieldSelectorChange = (fieldName, initOperatorAndValue = false) => {
    const { index, fieldList } = this.props;

    // const fieldApiName = field && field.indexOf('__r.') > 0 ? field.split('__r.')[0] : field;
    // const isDefaultFilter = !_.isEmpty(_.find(defaultFilters, { field: fieldApiName }));

    const fieldApiName = fieldName.indexOf('__r.') > 0 ? fieldName.split('__r.')[0] : fieldName;
    const selectedField = fieldList.filter((x) => x.api_name === fieldApiName)[0];
    // const selectedField = fieldList.filter(x => x.api_name === fieldApiName)[0];

    let operatorOptions = [];
    switch (_.get(selectedField, 'type')) {
      case 'text':
      case 'long_text':
      case 'relation':
        operatorOptions = [
          {
            label: crmIntlUtil.fmtStr('filter.condition.contains'),
            value: 'contains',
            checked: true,
          },
          // { label: crmIntlUtil.fmtStr('filter.condition.not_equal'), value: '<>' },
        ];
        break;
      case 'date':
      case 'date_time':
        operatorOptions = [
          { label: crmIntlUtil.fmtStr('filter.condition.before'), value: '<' },
          { label: crmIntlUtil.fmtStr('filter.condition.after'), value: '>' },
        ];
        break;
      case 'select_one':
        operatorOptions = [
          { label: crmIntlUtil.fmtStr('filter.condition.equal'), value: '==' },
          { label: crmIntlUtil.fmtStr('filter.condition.not_equal'), value: '<>' },
        ];
        break;
      case 'select_many':
        operatorOptions = [
          {
            label: crmIntlUtil.fmtStr('filter.condition.contains'),
            value: 'contains',
            checked: true,
          },
        ];
        break;
      case 'boolean':
        operatorOptions = [{ label: crmIntlUtil.fmtStr('filter.condition.equal'), value: '==' }];
        break;
      default:
        operatorOptions = [{ label: crmIntlUtil.fmtStr('filter.condition.equal'), value: '==' }];
    }
    // eslint-disable-next-line no-unused-vars
    let newoperator = '';
    _.each(operatorOptions, (item) => {
      // eslint-disable-next-line eqeqeq
      if (item.value == this.state.operator) {
        newoperator = item.value;
      }
    });
    this.setState(
      Object.assign(
        {},
        {
          operatorOptions,
          selectedField,
          field: getNameIfTypeIsRelation(selectedField.api_name, selectedField.type),
          operator: _.isEmpty(newoperator)
            ? _.get(operatorOptions, '[0].value', undefined)
            : newoperator,
        },
        initOperatorAndValue ? { value: [] } : {},
      ),
    );
  };

  // 31/01/2018 - TAG: 表达式条件变化
  onOperatorSelectorChange = (operator) => {
    this.setState({
      operator,
    });
  };

  // 当选值组件为input
  onValueInputChange = (event) => {
    this.setState({
      value: valueToArray(event.target.value),
    });
  };

  onBooleanInputChange = (event) => {
    this.setState({
      value: valueToArray(event.target.value === 'true'),
    });
  };

  onDateTimeValueChange = (dateTime) => {
    this.setState({
      value: valueToArray(dateTime ? dateTime.valueOf() : null),
    });
  };

  // 当选值组件为Select
  onSelectValueChange = (value) => {
    consoleUtil.log(value);
    this.setState({
      value: valueToArray(value),
    });
  };
  // 当选值组件为Select
  onSelectMultipleValueChange = (value) => {
    this.setState({
      value: valueToArray(value),
    });
  };

  makeFieldOptions = () => {
    const { objectApiName, fieldList } = this.props;
    // onFieldSelectorChange(field);
    return fieldList.map((option) => {
      // 获取字段方言
      // fix bug,优先使用布局里面field.i18n_key，第二选择 field.<object_api_name>.<field_api_name>，最后选择label
      const fieldLabel = crmIntlUtil.fmtStr(
        _.get(option, 'field.i18n_key'),
        crmIntlUtil.fmtStr(`field.${objectApiName}.${option.api_name}`, option.label),
      );

      // todo 暂时，如果是关联关系，直接拼成<api_name>__r.name, 操作符只支持 等于，不等于，包含
      const optionValue = getNameIfTypeIsRelation(option.api_name, _.get(option, 'type'));
      return (
        <Option key={`option-${randomKey()}`} value={optionValue}>
          {fieldLabel}
        </Option>
      );
    });
  };

  makeOperatorOptions = () => {
    const { operatorOptions } = this.state;
    return operatorOptions.map((option) => {
      return (
        <Option
          key={`option-${randomKey()}`}
          value={option.value}
          checked={_.get(option, 'checked', false)}
        >
          {option.label}
        </Option>
      );
    });
  };

  getFieldApiName = () => {
    const { field } = this.state;
    const fieldApiName = field && field.indexOf('__r.') > 0 ? field.split('__r.')[0] : field;
    return fieldApiName;
  };

  /**
   * 查找额外配置
   */
  findExtraConfig = () => {
    const { filterFieldsExtraConfig = {} } = this.props;
    const {
      selectedField: { api_name },
    } = this.state;
    return _.get(filterFieldsExtraConfig, api_name);
  };

  /**
   * 渲染单选多选过滤组件
   */
  renderSelectFilter = ({ selectedField, value, multiple = false }) => {
    const { options, api_name } = selectedField;
    let props = {};
    if (multiple) {
      props = Object.assign(
        {},
        {
          onChange: this.onSelectMultipleValueChange,
          mode: 'multiple',
          placeholder: 'Please select',
          defaultValue: value,
        },
      );
    } else {
      props = Object.assign(
        {},
        {
          onChange: this.onSelectValueChange,
          defaultValue: ifArrayGetFirst(value),
        },
      );
    }
    const extraConfig = this.findExtraConfig();
    if (_.isObject(extraConfig) && _.has(extraConfig, 'data_source')) {
      return <RecordFilterSelector {...props} {...{ renderFieldItem: extraConfig }} />;
    } else {
      if (_.isEmpty(options)) {
        consoleUtil.warn('[警告]', api_name, '选项配置为空，请检查');
      }
      const fieldApiName = this.getFieldApiName();
      const { objectApiName } = this.props;
      const _options = buildOptions({
        options,
        objectApiName,
        fieldApiName,
      });
      return (
        <Select key={`s-${randomKey()}`} size="large" style={{ width: '100%' }} {...props}>
          {_options}
        </Select>
      );
    }
  };

  render() {
    const {
      index,
      size,
      onClickRowAdd,
      onClickRowRemove,
      defaultFilters,
      objectApiName,
    } = this.props;
    const { field, operator, value } = this.state;
    const fieldApiName = this.getFieldApiName();
    const isDefaultFilter = !_.isEmpty(_.find(defaultFilters, { field: fieldApiName }));

    const valueComponent = () => {
      const { selectedField } = this.state;

      switch (_.get(selectedField, 'type')) {
        case 'date': {
          if (!_.isEmpty(value)) {
            return (
              <DatePicker
                {...datePickerProps()}
                onChange={this.onDateTimeValueChange}
                format="YYYY-MM-DD"
                value={toMoment(value[0])}
              />
            );
          } else {
            return (
              <DatePicker
                {...datePickerProps()}
                onChange={this.onDateTimeValueChange}
                format="YYYY-MM-DD"
                value={toMoment(value[0])}
              />
            );
          }
        }
        case 'date_time': {
          if (!_.isEmpty(value)) {
            return (
              <DatePicker
                {...datePickerProps()}
                onChange={this.onDateTimeValueChange}
                showTime
                format="YYYY-MM-DD HH:mm"
                value={toMoment(value[0])}
              />
            );
          } else {
            return (
              <DatePicker
                {...datePickerProps()}
                onChange={this.onDateTimeValueChange}
                showTime
                format="YYYY-MM-DD HH:mm"
              />
            );
          }
        }
        case 'number':
          return (
            <InputNumber
              size="large"
              defaultValue={_.get(value, '[0]') || 1}
              value={_.get(value, '[0]')}
              // placeholder="请输入查询值"
              onChange={this.onValueInputChange}
            />
          );
        case 'boolean':
          return (
            <RadioGroup
              style={{ minHeight: 32, lineHeight: '32px' }}
              size="large"
              key={`radio-${randomKey()}`}
              onChange={this.onBooleanInputChange}
              value={ifEmptyToUndefined(_.chain(value).get('[0]').toString().valueOf())}
            >
              <Radio value="true">{crmIntlUtil.fmtStr('field.common.yes')}</Radio>
              <Radio value="false">{crmIntlUtil.fmtStr('field.common.no')}</Radio>
            </RadioGroup>
          );
        case 'select_one': {
          return this.renderSelectFilter({
            selectedField,
            value,
            multiple: false,
          });
        }
        case 'select_many': {
          return this.renderSelectFilter({
            selectedField,
            value,
            multiple: true,
          });
        }
        default:
          return (
            <Input
              size="large"
              style={{ width: '100%' }}
              defaultValue={_.get(value, '[0]')}
              value={_.get(value, '[0]')}
              placeholder={crmIntlUtil.fmtStr('placeholder.please_enter_the_query_value')}
              onChange={this.onValueInputChange}
            />
          );
      }
    };

    return (
      <Row gutter={12} className={styles.filterCriteriaRow}>
        <Col span={6}>
          <Select
            size="large"
            defaultValue={field}
            value={field}
            style={{ width: '100%' }}
            placeholder={crmIntlUtil.fmtStr('placeholder.please_select_one_field')}
            disabled={isDefaultFilter}
            onChange={(fieldName) => {
              this.onFieldSelectorChange(fieldName, true);
            }}
          >
            {this.makeFieldOptions()}
          </Select>
        </Col>
        <Col span={3}>
          <Select
            size="large"
            defaultValue={operator}
            value={operator}
            style={{ width: '100%' }}
            placeholder={crmIntlUtil.fmtStr('placeholder.please_select_one_condition')}
            onChange={this.onOperatorSelectorChange}
          >
            {this.makeOperatorOptions()}
          </Select>
        </Col>
        <Col span={12}>{valueComponent()}</Col>
        <Col span={3} className="text_left">
          <Button.Group style={{ width: '100%' }}>
            <Button icon="plus" onClick={onClickRowAdd} size="large" style={{ width: '50%' }} />
            {!isDefaultFilter && (
              <Button
                icon="minus"
                onClick={onClickRowRemove}
                size="large"
                style={{ width: '50%' }}
              />
            )}
          </Button.Group>
        </Col>
      </Row>
    );
  }
}
