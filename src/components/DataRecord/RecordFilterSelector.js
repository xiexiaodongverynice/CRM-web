/**
 * 专为过滤组件中单选下拉为data_source时使用
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Select } from 'antd';
import { buildOptionsWithDataSource, buildOptions } from './common/record';
import { randomKey } from '../../utils/lo';

export default class RecordFilterSelector extends Component {
  static displayName = 'RecordFilterSelector';

  static defaultProps = {
    renderFieldItem: {},
    dataItem: {},
    defaultValue: '',
    onChange: _.noop,
    placeholder: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      options: [],
    };
  }

  componentDidMount() {
    this.build();
  }

  build = async () => {
    const { renderFieldItem, dataItem } = this.props;
    const options = await buildOptionsWithDataSource({
      renderFieldItem,
      dataItem,
    });
    if (_.isArray(options)) {
      this.setState({
        options: buildOptions({
          options,
          isIntlLabel: false,
        }),
      });
    }
  };

  render() {
    const { defaultValue } = this.props;
    const { options } = this.state;
    return (
      <Select
        key={`s-${randomKey()}`}
        size="large"
        style={{ width: '100%' }}
        {..._.pick(this.props, ['defaultValue', 'onChange', 'mode', 'placeholder'])}
      >
        {options}
      </Select>
    );
  }
}

RecordFilterSelector.propTypes = {
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  renderFieldItem: PropTypes.object,
  dataItem: PropTypes.object,
  onChange: PropTypes.func,
  mode: PropTypes.string,
  placeholder: PropTypes.string,
};
