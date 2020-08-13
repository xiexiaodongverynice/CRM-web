import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Select, Modal, message } from 'antd';
import { hashHistory } from 'dva/router';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import * as recordService from '../../services/object_page/recordService';
import * as CallBackUtil from '../../utils/callBackUtil';
import style from './CallTemplateSelectorFilter.less';
import consoleUtil from '../../utils/consoleUtil';
import { assembleCriterias } from '../common/criterias';

const { Option } = Select;
const { confirm } = Modal;

const recordTypes = {
  week: crmIntlUtil.fmtStr('options.call_template.record_type.week'),
  day: crmIntlUtil.fmtStr('options.call_template.record_type.day'),
}

export default class CallTemplateSelectorFilter extends Component{
  constructor(props){
    super(props);
    this.state = {
      optionList: [],
      value: null,
    };

    /**
     * TODO 对象自由配置
     */
    this.objectApiName = 'call_template';
  }

  async componentDidMount() {
    await this.refresh();
  }

  async refresh() {
    const { selectorFilterExtenderLayout } = this.props;
    const filterCriteriasLayout = _.get(selectorFilterExtenderLayout, 'filter_criterias', {});

    const defaultCriteria = _.get(selectorFilterExtenderLayout, 'defaultFilterCriterias', []);
    const dataDeal = {
      joiner: 'and',
      criterias: defaultCriteria,
      orderBy: _.get(filterCriteriasLayout, 'default_sort_by', _.get(filterCriteriasLayout, 'orderBy', 'name')),
      order: _.get(filterCriteriasLayout, 'default_sort_order', _.get(filterCriteriasLayout, 'order', 'desc')),
      objectApiName: this.objectApiName,
      pageSize: 20000,
    };
    const resp = await recordService.queryRecordList({ dealData: dataDeal });
    if(resp) {
      const resultData = _.get(resp, "result");
      const optionList = [];
      _.forEach(resultData, (value, key) => {
        optionList.push({
          label: `${_.get(value, 'name')} - (${recordTypes[_.get(value, 'record_type')]})`,
          value: _.get(value, 'id'),
        });
      });
      this.setState({optionList}, () => {
        setTimeout(() => {
          if(optionList.length > 0) {
            const value = _.chain(optionList).get('[0].value').toString().value();
            this.onChange(value);
          }
        }, 100);
      });
    }
  }

  onChange = (value) => {
    const { onSelectorFilterExtenderChange, selectorFilterExtenderLayout } = this.props;
    const filterCriteriasLayout = _.get(selectorFilterExtenderLayout, 'filter_criterias', {});
    const extenderItemAlias = _.get(selectorFilterExtenderLayout, 'extender_item_alias', 'call_template_selector_filter');
    const criterias = assembleCriterias(value, filterCriteriasLayout);
    onSelectorFilterExtenderChange(_.zipObject([extenderItemAlias], [{
      criterias
    }]));
    this.setState({
      value: _.get(value, '0'),
    })
  }

  editCallTemplate = () => {
    CallBackUtil.dealNeedCallBack({
      location: fc_getLocation(),
    });
    hashHistory.push({
      pathname: `object_page/${this.objectApiName}/${this.state.value}/edit_page?recordType=week`
    })
  }

  deleteCallTemplate = () => {
    confirm({
      title: crmIntlUtil.fmtStr('confirm_message.call_template.delete'),
      onOk: async () => {
        const { value } = this.state;
        let { optionList } = this.state;
        const resp = await recordService.deleteRecord({
          object_api_name: this.objectApiName,
          id: value,
        });
        if(resp) {
          if(resp.status === 200) {
            message.success(resp.message);
            optionList = optionList.filter(option => `${option.value}` !== `${value}`);
            this.setState({
              optionList,
              value: _.chain(optionList).first().get('value', null).toString().value(),
            }, () => {
              this.onChange(this.state.value || -1);
            });
          }
        }
      },
      onCancel() {
        // consoleUtil.log('Cancel');
      },
    });
  }

  render() {
    const { optionList, value } = this.state;
    const { selectorFilterExtenderLayout } = this.props;
    const extender_align = _.get(selectorFilterExtenderLayout, 'extender_align',  'right');
    const extenderOption = _.get(selectorFilterExtenderLayout, 'extender_option');
    const placeholder = crmIntlUtil.fmtStr(_.get(extenderOption, 'placeholder.i18n_key'), _.get(extenderOption, 'placeholder'));
    return (
      <div style={{display: 'inline-flex', alignItems: 'center', float: extender_align}}>
        <Select
          value={value}
          style={{ width: 200, marginRight: 8 }}
          placeholder={placeholder}
          optionFilterProp="children"
          onChange={this.onChange}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {optionList.map(r => <Option key={_.toString(r.value)} value={_.toString(r.value)}>{r.label}</Option>)}
        </Select>

        {
          fc_hasObjectPrivilege(this.objectApiName, 2) && value? (
            <i className={`iconfont icon-edit ${style.icon}`} onClick={this.editCallTemplate}/>
          ): null
        }
        {
          fc_hasObjectPrivilege(this.objectApiName, 3) && value? (
            <i className={`iconfont icon-closeoutline ${style.icon}`} onClick={this.deleteCallTemplate}/>
          ): null
        }
      </div>
    );
  }
}

CallTemplateSelectorFilter.propTypes = {
  onSelectorFilterExtenderChange: PropTypes.func,
  selectorFilterExtenderLayout: PropTypes.object,
};
