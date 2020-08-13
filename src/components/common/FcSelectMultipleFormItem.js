/**
 * Created by xinli on 2017/10/10.
 */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Form, Select, Spin } from 'antd';
import * as recordService from '../../services/object_page/recordService';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import FormEvent from './FormEvents';
import { processCriterias } from '../../utils/criteriaUtil';
import { callAnotherFunc } from '../../utils';
import { getExpression } from '../../utils/expressionUtils';
import { buildOptionsWithDataSource } from '../DataRecord/common/record';
import consoleUtil from '../../utils/consoleUtil';
import FcFieldLableTip from './FcFieldLableTip';

const FormItem = Form.Item;
const Option = Select.Option;
const message_require = crmIntlUtil.fmtStr('message.is_required');
const FIELD_VALUE_CHANGE = 'field_value_change';

class FcSelectMultipleFormItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      fetchDataSourceStatus: true, // * 控制datasouce 加载 loading
      optionsFilter: undefined,
      dependentFieldUnset: false,
      selected: undefined,
      changed: false,
    };
  }

  async componentWillMount() {
    const {
      fieldItem,
      formItemLayout,
      getFieldDecorator,
      dataItem,
      renderFieldItem,
      mergedObjectFieldDescribe,
      needDisabled,
      fieldLabel,
    } = this.props;

    let { options } = mergedObjectFieldDescribe;
    if (mergedObjectFieldDescribe.type === 'boolean' && _.isEmpty(options)) {
      options = [
        {
          label: crmIntlUtil.fmtStr('label.yes', '是'),
          value: 'true',
        },
        {
          label: crmIntlUtil.fmtStr('label.no', '否'),
          value: 'false',
        },
      ];
    }

    // 首先判断是否有DataSource
    if (Array.isArray(options)) {
      if (_.isEmpty(options)) {
        consoleUtil.warn(
          '[警告]',
          this.getFieldApiName(fieldItem.api_name),
          '选项配置为空，请检查',
        );
      }
    } else if (renderFieldItem.data_source) {
      this.dataSource = renderFieldItem.data_source;
      const initValue = _.get(dataItem, _.get(fieldItem, 'api_name'));
      const enablecAsyncCriterias = _.get(
        renderFieldItem,
        'data_source.enablec_async_criterias',
        false,
      );
      const isSelectOne = _.get(mergedObjectFieldDescribe, 'render_type') === 'select_one';
      if ((isSelectOne && initValue) || !_.isEmpty(initValue)) {
        options = await buildOptionsWithDataSource({
          renderFieldItem,
          dataItem,
          composeCriteriasStatus: enablecAsyncCriterias ? 3 : 2,
        });
      }
    }
    this.setState({ options });
  }

  componentDidMount() {
    const { mergedObjectFieldDescribe, dataItem, form } = this.props;
    const { dependency, api_name } = mergedObjectFieldDescribe;

    // done 记录当前单选选项的id值，
    // 作为 单选框切换时 是否 置空 多选框的依据
    let done;
    if (!_.isEmpty(dependency)) {
      // 订阅单选值改变事件
      FormEvent.subscribe(FIELD_VALUE_CHANGE, (formEvent) => {
        const { on, rules, defaults = [] } = dependency;
        const { type, value, field, formItemLayout } = formEvent;
        /**
         * TODO 是否需要改成?
         * @author huang
         * on === this.getFieldApiName(field.api_name)
         */
        // 依赖字段当值发生了改变
        if (on === field.api_name) {
          // 当依赖的字段被清空时
          if (value === undefined) {
            this.setState({
              dependentFieldUnset: true,
              selected: undefined,
              optionsFilter: defaults === 'all' ? undefined : [], // 默认全部可选
            });
            // let fields = {};
            // fields[mergedObjectFieldDescribe.api_name] = {
            //   value: null,
            //   // errors : [new Error('Invalid Option')]
            // };
            // form.setFields(fields);
            this.onChange(undefined, false);
          } else {
            const rule = rules.find((x) => x.when.indexOf(value) >= 0);
            // 若没有设置对应的规则，则下拉选项为空
            const optionValues = rule ? rule.then : defaults;
            const { selected } = this.state;

            let newSelected;
            // 如果 mode 没值，则当前渲染的是 单选框，
            // 如果 选中值selected 存在于 optionValues 中，展示selected
            // 否则 默认展示 optionValues 第一项
            if (!this.props.mode) {
              newSelected = optionValues.indexOf(selected) < 0 ? optionValues[0] : selected;
            }
            // mode='mutiple' 有值，则为多选情况
            // 在 新建页面 _.get(dataItem, api_name) 为undefined，编辑页面 为 所选值
            // 编辑页面订阅函数会先自动执行一次，切value有值；新建页面不会自动执行。
            // 如果切换的选项 value 与 上一次选项 done 相同，则使用选中的；反之，则置空。
            newSelected = value
              ? done && done !== value
                ? []
                : selected || _.get(dataItem, api_name)
              : selected || [];
            done = value;
            const fields = {};
            fields[this.getFieldApiName(mergedObjectFieldDescribe.api_name)] = {
              value: newSelected,
              // errors : [new Error('Invalid Option')]
            };
            form.setFields(fields);
            this.setState(
              {
                optionsFilter: rule ? optionValues : defaults,
                dependentFieldUnset: false,
                selected: newSelected,
                changed: selected !== newSelected,
              },
              () => {
                if (selected !== newSelected) {
                  this.onChange(newSelected, false);
                }
              },
            );
          }
        }
      });

      // 处理编辑时刚加载完的情况
      const dependentFieldValue = _.get(dataItem, `${dependency.on}`);
      const { rules, defaults = [] } = dependency;
      if (dependentFieldValue) {
        const rule = rules.find((x) => x.when.indexOf(dependentFieldValue) >= 0);
        const optionValues = rule ? rule.then : defaults;
        this.setState({
          optionsFilter: optionValues,
          dependentFieldUnset: false,
        });
      } else {
        this.setState({
          dependentFieldUnset: true,
        });
      }
    }

    /**
     * 当此组件设置了默认值检查，且另外一个FcSelectMultipleFormItem这是了对它的依赖，则需要在此主动触发FormEvent.fire
     */
    const initialValue = this.getInitialValue();
    if (!_.isUndefined(initialValue) && !_.isNull(initialValue)) {
      /**
       * TODO 目前控制台会报如下错误：
       * Warning: setState(...): Can only update a mounted or mounting component. This usually means you called setState() on an unmounted component.
       * This is a no-op. Please check the code for the FcSelectMultipleFormItem component.
       *
       * 此种错误产生的原因大概有两种：
       * 1.当前组件还未完全加载完成，onChange主动调用了setState
       * 2.FormEvent.fire时，另外一个组件还未完全加载完成
       *
       * 大概可以解决的方式：
       * 1.setTimeout
       * 2.其他
       */
      this.onChange(initialValue, false);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { fieldApiName, dataItem } = nextProps;

    this.setState({
      selected: dataItem[fieldApiName],
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { selected: preSelected } = prevState;
    const { selected } = this.state;
    if (preSelected !== selected) {
      const { formItemLayout, mergedObjectFieldDescribe } = this.props;
      FormEvent.fire({
        type: FIELD_VALUE_CHANGE,
        value: selected,
        field: mergedObjectFieldDescribe,
        formItemLayout,
      });
    }
  }

  getDataSourceOptions = async () => {
    if (_.isEmpty(this.dataSource)) return;

    const { dataItem, renderFieldItem } = this.props;
    const options = await buildOptionsWithDataSource({
      renderFieldItem,
      dataItem,
    });

    const data = await buildOptionsWithDataSource({
      renderFieldItem,
      dataItem,
      composeCriteriasStatus: 2,
    });

    if (_.isArray(options)) {
      if (_.isArray(data)) {
        _.each(data, (item) => {
          const exit = _.some(options, (option) => _.get(item, 'value') === _.get(option, 'value'));
          if (!exit) {
            const option = item;
            option.disabled = true;
            options.push(option);
          }
        });
      }

      this.setState({
        options,
        fetchDataSourceStatus: false,
      });
    }
  };

  clearDatasource = () => {
    if (_.isEmpty(this.dataSource)) return;

    this.setState({
      fetchDataSourceStatus: true,
    });
  };

  onChange = (value, openOnChange = true) => {
    const { formItemLayout, mergedObjectFieldDescribe, form, renderFieldItem } = this.props;
    this.setState(
      {
        selected: value,
      },
      () => {
        FormEvent.fire({
          type: FIELD_VALUE_CHANGE,
          value,
          field: mergedObjectFieldDescribe,
          formItemLayout,
        });
        if (value === undefined) {
          const fields = {};
          fields[this.getFieldApiName(mergedObjectFieldDescribe.api_name)] = {
            value: this.props.mode ? [] : null,
          };
          form.setFields(fields);
        }
        const changValue = _.get(this.props, 'onChange');
        if (openOnChange && changValue) {
          changValue(value, openOnChange);
        }
      },
    );
  };

  /**
   * 如果字段名称需要约束命名空间，则加入命名空间前缀
   * @param {String} field_api_name
   */
  getFieldApiName = (field_api_name) => {
    const { namespace } = this.props;
    if (!_.isNull(namespace) && !_.isEqual('', _.trim(field_api_name))) {
      return `${namespace}.${field_api_name}`;
      // return field_api_name == 'product' ? `${namespace}.${field_api_name}__r.name` : `${namespace}.${field_api_name}`
    }
    return field_api_name;
    // return field_api_name == 'product' ? `${field_api_name}__r.name` : field_api_name;
  };

  handleDependencyValidate = (rule, value, cb) => {
    const { mergedObjectFieldDescribe, dataItem, form } = this.props;
    const { dependency } = mergedObjectFieldDescribe;
    // 没有依赖时校验通过，value为undefined时通过
    if (!dependency || !value) {
      cb();
    } else {
      const { on, rules = [], defaults = [] } = dependency;
      const dependentFieldValue = form.getFieldValue(on);

      // 验证value
      const v = value || defaults;

      // 如果没有 rule 则不需要匹配
      if (!rule) return cb();
      // 如果 rules 为空数组，则无匹配规则
      if (_.isEmpty(rules)) return cb();

      const rulesTree = rules.reduce(
        (t, { then, when }) =>
          Object.assign(
            {},
            t,
            when.length > 1
              ? when.reduce((wt, wv) => Object.assign({}, wt, { [wv]: then }), {})
              : { [_.get(when, 0)]: then },
          ),
        {},
      );

      // 当前 多选内容 与 依赖内容 无关联，不需要进行验证
      if (!_.get(rulesTree, dependentFieldValue)) return cb();
      const then = _.get(rulesTree, dependentFieldValue);
      // 如果 v 包含在 then 中
      if (_.union(then, v).length === then.length) return cb();

      // 其他情况下，都认为验证失败
      return cb();

      // if (dependentFieldValue) {
      //   // 依赖的字段有值时，校验是否符合依赖规则
      //   // const rule = _.chain(rules).find(r => {
      //   //   return _.chain(r).result('when', []).findIndex(dependentFieldValue).value() >= 0;
      //   // }).value();
      //
      //   if (rule) {
      //     if (rules.then.indexOf(value) >= 0) {
      //       cb();
      //     } else {
      //       cb(true);
      //     }
      //   } else if (defaults.indexOf(value) >= 0) {
      //     cb();
      //   } else {
      //     cb(true);
      //   }
      // } else {
      //   // 根据默认规则
      //   if (defaults.indexOf(value) >= 0) {
      //     cb();
      //   } else {
      //     cb(true);
      //   }
      // }
    }
  };

  /**
   * 从字段配置中解析默认值
   *
   * code example
   *  <code>
   *    "field" : "product_type",
        "disabled_when" : ["edit", "add"],
        "is_required" : true,
        "need_default_checked" : {
            "checked_value" : "device",
            "need_checked" : true
        },
        "render_type" : "select_one"
   *  </code>
   */
  getInitialValue = (
    { props } = {
      props: null,
    },
  ) => {
    const { fieldItem, dataItem, mergedObjectFieldDescribe, mode = null } = props || this.props;
    const { options = [] } = this.state;
    const needDefaultCheckedLayout = _.get(mergedObjectFieldDescribe, 'need_default_checked');
    // 兼容初始值为数组／字符串／空值的情况
    const fieldValue = _.get(dataItem, `${this.getFieldApiName(fieldItem.api_name)}`);
    let initialValue;
    if (fieldValue || _.isBoolean(fieldValue)) {
      if (Array.isArray(fieldValue)) {
        initialValue = fieldValue.map((x) => _.toString(x));
      } else if (_.isEqual(mode, 'multiple')) {
        // initialValue = [fieldValue.toString()];
        initialValue = _.split(_.toString(fieldValue), ',');
      } else {
        initialValue = _.toString(fieldValue);
      }
    } else if (!_.isEmpty(needDefaultCheckedLayout)) {
      const needChecked = _.get(needDefaultCheckedLayout, 'need_checked', false);
      const checkedValue = _.get(needDefaultCheckedLayout, 'checked_value', []);
      if (needChecked) {
        if (!_.isEqual(checkedValue, '')) {
          initialValue = checkedValue;
        } else {
          initialValue = _.get(_.head(options), 'value');
        }
      }
    }
    /**
     * 当初始值为数组时，且数组中含有空字符，则会报错
     */
    if (_.isArray(initialValue)) {
      initialValue = initialValue.filter((x) => !_.isEmpty(x));
    }
    return initialValue;
  };

  render() {
    const {
      fieldItem,
      formItemLayout,
      getFieldDecorator,
      dataItem,
      renderFieldItem,
      needDisabled,
      mergedObjectFieldDescribe,
      mode,
      fieldLabel,
      objectApiName,
      fieldApiName,
    } = this.props;

    const {
      options = [],
      optionsFilter,
      dependentFieldUnset,
      selected,
      changed,
      fetchDataSourceStatus,
    } = this.state;

    const selectOptionChildren = options
      .filter((x) => {
        return optionsFilter ? optionsFilter.indexOf(x.value) >= 0 : true;
      })
      .map((pro) => {
        const optionsLabel = crmIntlUtil.fmtStr(
          `options.${objectApiName}.${fieldApiName}.${pro.value}`,
          _.get(pro, 'label'),
        );
        return (
          <Option
            disabled={pro.disabled}
            value={pro.value}
            key={`${this.getFieldApiName(fieldItem.api_name)}_${pro.value}`}
            title={optionsLabel}
          >
            {optionsLabel}
          </Option>
        );
      });

    /**
     * 初始默认值
     */
    const initialValue = this.getInitialValue();

    const needShowSearch = _.get(mergedObjectFieldDescribe, 'need_show_search', false);
    const style = { width: '100%' };
    let rules = [
      {
        required: fieldItem.is_required || _.get(renderFieldItem, 'is_required', false),
        message: `${fieldLabel} ${message_require}.`,
      },
    ];
    const { dependency } = mergedObjectFieldDescribe;
    if (!_.isEmpty(dependency)) {
      const dependentFieldApiName = _.get(mergedObjectFieldDescribe, 'dependency.on', '');
      const fieldLabel = crmIntlUtil.fmtStr(`field.${objectApiName}.${dependentFieldApiName}`);
      rules = rules.concat({
        message: crmIntlUtil.fmtWithTemplate(
          'field.dependency_not_select',
          '选项与依赖的字段{{field}}不匹配',
          { field: fieldLabel },
        ),
        validator: this.handleDependencyValidate.bind(this),
      });
    }
    // lableTip配置
    const fieldLabelTip = FcFieldLableTip(renderFieldItem, fieldLabel);

    return (
      <FormItem label={fieldLabelTip} {...formItemLayout}>
        {getFieldDecorator(`${this.getFieldApiName(fieldItem.api_name)}`, {
          initialValue,
          rules,
        })(
          <Select
            mode={mode}
            size={`${_.get(mergedObjectFieldDescribe, 'size', 'large')}`}
            disabled={needDisabled || dependentFieldUnset}
            allowClear
            onBlur={this.clearDatasource}
            onFocus={this.getDataSourceOptions}
            notFoundContent={
              !_.isEmpty(this.dataSource) && fetchDataSourceStatus ? <Spin size="small" /> : null
            }
            className={`probe.${objectApiName}.${fieldApiName}`}
            dropdownClassName={`probe.${objectApiName}.${fieldApiName}.dropdown`}
            showSearch={needShowSearch}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={this.onChange.bind(this)}
            style={style}
          >
            {selectOptionChildren}
          </Select>,
        )}
      </FormItem>
    );
  }
}

FcSelectMultipleFormItem.propTypes = {
  fieldItem: PropTypes.object,
  formItemLayout: PropTypes.object,
  getFieldDecorator: PropTypes.func,
  dataItem: PropTypes.object,
  needDisabled: PropTypes.bool,
  renderFieldItem: PropTypes.object,
};

export default FcSelectMultipleFormItem;
