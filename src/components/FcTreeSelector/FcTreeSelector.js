/**
 * @flow
 */

import React from 'react';
import _ from 'lodash';
import { Button, TreeSelect } from 'antd';
import './FcTreeSelector.less';
import { request, arrayToTree, queryArray, config } from '../../utils';
import { handleResultData, findData } from '../common/dataUtil';
import * as recordService from '../../services/object_page/recordService';

type Prop = {
  selectorOption: any,
  fetch: any,
  onChangeSelect: any,
};

type State = {
  value: Array<any>,
  treeData?: any,
  arrayTreeData?: Array<any>,
};

const SHOW_ALL = TreeSelect.SHOW_ALL;
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const SHOW_CHILD = TreeSelect.SHOW_CHILD;
const { api } = config;
const { subordinate_query } = api;

class FcTreeSelector extends React.Component<Prop, State> {
  state: State = {
    value: [],
    treeData: [],
    arrayToTree: [],
  };

  componentDidMount() {
    if (this.props.fetch) {
      this.byExternalIdGetFetchUrl();
      // this.fetch();
    }
  }

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
    this.promise = request({
      url,
    }).then((resp) => {
      const arrayTreeData = handleResultData(_.get(resp, 'result', []));
      const treeData = arrayToTree(arrayTreeData, 'key', 'pid');
      this.setState({ treeData, arrayTreeData });
    });
  };

  handleChange = (value) => {
    const { onChangeSelect } = this.props;
    onChangeSelect(findData(this.state.arrayTreeData, 'value', value));
  };

  onSearch = () => {};

  onChange = (value: any[]) => {
    const searchValue = [];
    if (typeof value === 'string') {
      searchValue.push(value);
    } else {
      value.forEach((val) => {
        if (val.indexOf('key') < 0) {
          searchValue.push(val);
        }
      });
    }
    // 判断是否空岗
    if (value.indexOf('key') < 0) {
      this.setState({ value: searchValue }, () => {
        this.props.onChangeSelect(findData(this.state.arrayTreeData, 'value', searchValue));
      });
    }
  };

  onSelect = (value, node, extra) => {};

  getShowCheckedStrategy = () => {
    const { selectorOption } = this.props;
    const showCheckedStrategy = _.get(selectorOption, 'showCheckedStrategy', 'SHOW_PARENT');
    switch (showCheckedStrategy) {
      case 'SHOW_ALL':
        return SHOW_ALL;
      case 'SHOW_PARENT':
        return SHOW_PARENT;
      case 'SHOW_CHILD':
        return SHOW_CHILD;
      default: {
        break;
      }
    }
  };

  render() {
    const { selectorOption } = this.props;
    const tProps = {
      treeData: this.state.treeData,
      value: this.state.value,
      onChange: this.onChange,
      onSelect: this.onSelect,
      showCheckedStrategy: this.getShowCheckedStrategy(),
      searchPlaceholder: 'Please select',
      filterTreeNode: (input, treeNode) => {
        const b = treeNode.props.title.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        return b;
      },
      style: {
        width: 300,
        marginRight: 8,
      },
    };
    return <TreeSelect {...tProps} {...selectorOption} />;
  }
}

export default FcTreeSelector;
