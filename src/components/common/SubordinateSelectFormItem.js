import React from 'react';
import { Select } from 'antd';
import { request } from '../../utils';
import config from '../../utils/config';

const { api } = config;
const { subordinate_query, tutorial_query } = api;

const Option = Select.Option;

class SubordinateSelectFormItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      managerId: props.managerId || localStorage.getItem('userId'),  // 经理ID， 不设置的话默认是当前用户ID
      subordinates: [ // 下级员工列表
      ],
      value: props.value || '',
      selectedSubordinate: props.selectedSubordinate || {},
    };
  }

  componentDidMount() {
    const { managerId } = this.state;
    const url = tutorial_query.replace('{id}', managerId);
    request({
      url,
      data: {
        restrict: true
      }
    }).then((response) => {
      if (response.status === 200 && response.success === true) {
        const { result } = response;
        this.setState({
          subordinates: result,
        });
      }
    });
  }

  handleChange = (value) => {
    const { subordinates } = this.state;
    const selectedSubordinate = subordinates.find(x => x.id.toString() === value);
    this.setState({
      value,
      selectedSubordinate,
    }, () => {
      if (this.props.onChange) {
        this.props.onChange(value);
      }
    });
  };

  render() {
    const { subordinates, selectedSubordinate, value } = this.state;
    const { disabled } = this.props;
    const options = subordinates.map(x => <Option key={x.id} >{x.name}</Option>);
    return (
      <Select
        disabled={disabled}
        defaultValue={selectedSubordinate.name}
        onChange={this.handleChange.bind(this)}
      >
        {options}
      </Select>
    );
  }
}

export default SubordinateSelectFormItem;
