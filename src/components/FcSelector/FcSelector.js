import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Select } from 'antd';
import './FcSelector.less';
import { request, config } from '../../utils';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';
import { handleResultData, findData } from '../common/dataUtil';
import * as recordService from '../../services/object_page/recordService';

const Option = Select.Option;
const { api } = config;
const { subordinate_query } = api;

class FcSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      resultData: [],
    };
  }

  componentWillMount() {}

  componentDidMount() {
    if (this.props.fetch) {
      this.byExternalIdGetFetchUrl();
      // this.fetch();
    }
  }

  componentWillReceiveProps(nextProps) {}

  byExternalIdGetFetchUrl = () => {
    // *拓展功能
    // *如果筛选条件有direct_to_user属性则根据外部id（external_id）查询下属
    const { selectorOption } = this.props;
    const direct_to_user = _.get(selectorOption, 'direct_to_user', '');
    const sub_type = _.get(selectorOption, 'sub_type', 'by_territory');
    if (direct_to_user) {
      const query = {
        joiner: 'and',
        objectApiName: 'user_info',
        criterias: [
          {
            field: 'external_id',
            operator: '==',
            value: [direct_to_user],
          },
        ],
        pageNo: 1,
        pageSize: 100000,
        order: 'desc',
        orderBy: 'id',
      };

      recordService.queryRecordList({ dealData: query }).then((data) => {
        const fetchId = _.get(data, 'result[0].id');
        const dataUrl = subordinate_query.replace('{id}', fetchId);
        const fetchUrl = `${dataUrl}?sub_type=${sub_type}&restrict=false`;
        this.fetch(fetchUrl);
      });
    } else {
      const {
        fetch: { url, data, dataKey },
      } = this.props;
      this.fetch(url);
    }
  };

  fetch = (url) => {
    // consoleUtil.log('获取下拉列表')
    // console.log(selectorOption, 'selectorOption====>');
    this.promise = request({
      url,
    }).then((resp) => {
      // consoleUtil.log(resp);

      const resultData = _.get(resp, 'result');
      const options = [];
      options.push(
        <Option key="ALL_SELECT" value="ALL_SELECT">
          {crmIntlUtil.fmtStr('全部')}
        </Option>,
      );
      _.forEach(resultData, (r) => {
        options.push(
          <Option key={_.toString(r.id)} value={_.toString(r.id)}>
            {r.name}
          </Option>,
        );
      });

      this.setState({ options, resultData });
    });
  };

  handleChange = (value) => {
    const { onChangeSelect } = this.props;
    // consoleUtil.log(`selected ${value}`);
    onChangeSelect(findData(handleResultData(this.state.resultData), 'value', value));
  };

  handleBlur = (value) => {
    // consoleUtil.log('blur');
  };

  handleFocus = (value) => {
    // consoleUtil.log('focus');
  };

  render() {
    const { selectorOption } = this.props;
    return (
      <Select
        style={{ width: 200, marginRight: 8 }}
        placeholder="Select a option"
        optionFilterProp="children"
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        {...selectorOption}
      >
        {this.state.options}
      </Select>
    );
  }
}

FcSelector.propTypes = {
  fetch: PropTypes.object,
  onChangeSelect: PropTypes.func,
};

export default FcSelector;
