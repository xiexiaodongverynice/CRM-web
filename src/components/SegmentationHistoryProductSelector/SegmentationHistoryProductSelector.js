/**
 * Created by wans on 2017/10/3 0003.
 * 产品选择器，多选框类型
 */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Checkbox, Row, Col } from 'antd';
import * as styles from './SegmentationHistoryProductSelector.less';
import * as recordService from '../../services/object_page/recordService';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';

const CheckboxGroup = Checkbox.Group;
class SegmentationHistoryProductSelector extends React.Component {
  constructor(props) {
    super(props);
    const { needDisabled } = this.props;
    this.state = {
      productCheckedList: [],
      needDisabled,
    };
  }

  componentWillMount() {

  }

  componentDidMount() {
    if (this.props.fetch) {
      this.fetch();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { defaultProductCheckedList: defaultProductCheckedList_new } = nextProps;
    const { defaultProductCheckedList: defaultProductCheckedList_old } = this.props;

    const diffProductCheckedList = _.difference(_.map(defaultProductCheckedList_new, 'id'), _.map(defaultProductCheckedList_old, 'id'));
    if (!_.isEmpty(diffProductCheckedList)) {
      this.setState({ productCheckedList: _.map(defaultProductCheckedList_new, 'id') });
    }
  }
  fetch =() => {
    // consoleUtil.log('获取产品列表');
    const { fetch: { data, dataKey } } = this.props;
    const defaultCriteria = _.get(data, 'defaultFilterCriterias', []);
    const dataDeal = {
      joiner: 'and',
      criterias: defaultCriteria,
      orderBy: _.get(data, 'orderBy', 'create_time'),
      order: _.get(data, 'order', 'desc'),
      objectApiName: 'user_product',
    };

    this.promise = recordService.queryRecordList({ dealData: dataDeal }).then((resp) => {
      const resultData = _.get(resp, dataKey);
      const productOptionList = [];
      _.forEach(resultData, (value, key) => {
        productOptionList.push({
          label: _.get(value, 'product__r.name'),
          value: _.get(value, 'product__r.id'),
        });
      });

      this.setState({ productOptionList });
    });
  }


  onCheckChange = (productCheckedList) => {
    const { productOnChange } = this.props;
    // consoleUtil.log('productCheckedList', productCheckedList);
    const { productOptionList } = this.state;
    this.setState({
      productCheckedList,
      indeterminate: !!productCheckedList.length && (productCheckedList.length < productOptionList.length),
      checkAll: productCheckedList.length === productOptionList.length,
    }, () => {
      const products = _.map(this.state.productCheckedList, (productId) => {
        const product = _.find(productOptionList, { value: productId });
        return {
          id: _.get(product, 'value'),
          name: _.get(product, 'label'),
        };
      });
      productOnChange(products);
    });
  }

  onCheckAllChange = (e) => {
    const { productOnChange } = this.props;
    const { productOptionList } = this.state;
    this.setState({
      productCheckedList: e.target.checked ? _.map(productOptionList, 'value') : [],
      indeterminate: false,
      checkAll: e.target.checked,
    }, () => {
      const products = _.map(this.state.productCheckedList, (productId) => {
        const product = _.find(productOptionList, { value: productId });
        return {
          id: _.get(product, 'value'),
          name: _.get(product, 'label'),
        };
      });
      productOnChange(products);
    });
  }

  render() {
    return (
      <div className={styles.productSelectorLayout}>
        <div className={styles.productSelectorHeader} >
          <Checkbox
            indeterminate={this.state.indeterminate}
            onChange={this.onCheckAllChange}
            checked={this.state.checkAll}
            disabled={this.state.needDisabled}
          >
            <span style={{ fontSize: 14 }}>{crmIntlUtil.fmtStr('header.product.list', '产品列表')}</span>
          </Checkbox>
        </div>
        <Row gutter={8}>
          <Col span={24} style={{ margin: '16px 8px' }}>
            <CheckboxGroup
              options={this.state.productOptionList}
              value={this.state.productCheckedList}
              onChange={this.onCheckChange}
              disabled={this.state.needDisabled}
            />
          </Col>
        </Row>

      </div>
    );
  }
}


SegmentationHistoryProductSelector.propTypes = {
  fetch: PropTypes.object,
  onChangeSelect: PropTypes.func,
};

export default SegmentationHistoryProductSelector;
