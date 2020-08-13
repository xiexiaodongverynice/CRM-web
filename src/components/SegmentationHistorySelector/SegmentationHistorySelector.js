/**
 * Created by wans on 2017/10/3 0003.
 */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import * as styles from './SegmentationHistorySelector.less';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';
import RecordFormItem from '../DataRecord/RecordFormItem';
import { checkFieldShowable } from '../DataRecord/common/record';

const formItemLayout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 14,
  },
};
class SegmentationHistorySelector extends React.Component {
  constructor(props) {
    super(props);
    const { needDisabled } = this.props;
    this.state = {
      needDisabled,
      productCheckedList: [],
    };
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    const { productCheckedList: productCheckedList_new } = nextProps;
    const { productCheckedList: productCheckedList_old } = this.props;

    const diffAddNewProduct = _.difference(
      _.map(productCheckedList_new, 'id'),
      _.map(productCheckedList_old, 'id'),
    );
    if (!_.isEmpty(diffAddNewProduct)) {
      this.setState({ productCheckedList: productCheckedList_new });
    }
    const diffProductCheckedList = _.difference(
      _.map(productCheckedList_old, 'id'),
      _.map(productCheckedList_new, 'id'),
    );

    if (!_.isEmpty(diffProductCheckedList)) {
      // 清理productCheckedList
      // _.remove(),有一个致命的“bug“，不仅仅会移除掉productCheckedList，还会移除掉defaultProductCheckedList_new，甚至影响到父组件，所以此处将对象另起一个。
      const productCheckedListState = _.cloneDeep(this.state.productCheckedList);
      _.remove(productCheckedListState, (productChecked) => {
        const productId = productChecked.id;
        return _.indexOf(diffProductCheckedList, productId) >= 0;
      });

      this.setState({ productCheckedList: productCheckedListState });
    }
  }

  renderFormItems = (prod) => {
    const {
      form,
      fieldList,
      pageType,
      objectApiName,
      fieldSectionFields,
      formItemValueChange,
    } = this.props;
    return _.map(fieldSectionFields, (renderField, fieldIndex) => {
      if (fieldList && !_.isEmpty(fieldList)) {
        const fieldApiName = _.get(renderField, 'field');
        const formRowKey = `customer_key_form_item_row_${prod.id}_${fieldIndex}_${_.get(
          'query._k',
        )}`;
        const showable = checkFieldShowable({
          renderField,
          pageType,
        });
        if (showable) {
          if (!_.isEmpty(fieldApiName)) {
            const fieldItem = _.find(fieldList, { api_name: fieldApiName });
            if (_.isEmpty(fieldItem)) {
              consoleUtil.error(
                '[配置错误]：字段在对象描述里面没有找到：',
                objectApiName,
                fieldApiName,
              );
              return;
            }
            const fieldItemCloneDeep = _.cloneDeep(fieldItem);
            fieldItemCloneDeep.api_name = `SegmentationHistoryFormItem-${prod.id}-${fieldItem.api_name}`;

            const tipHint = _.get(renderField, 'tip.hint');
            if (_.isObject(tipHint) && !_.isEmpty(tipHint)) {
              const { productCheckedList } = this.state;
              renderField.tip.productCheckedList = productCheckedList;
            }

            const recordFormItemProps = {
              objectApiName,
              fieldItem: fieldItemCloneDeep,
              renderFieldItem: renderField,
              form,
              pageType,
              formItemValueChange,
              formItemLayout,
            };
            return <RecordFormItem {...recordFormItemProps} key={formRowKey} />;
          }
        }
      }
    });
  };

  buildProductList = () => {
    const { productCheckedList } = this.state;

    if (_.isEmpty(productCheckedList)) {
      return crmIntlUtil.fmtStr('header.product.select', '选择产品');
    }
    return productCheckedList.map((prod) => {
      return (
        <div key={`${prod.id}_product_div_${prod.name}`} className={styles.medicine}>
          <div className={styles.name}>
            <div className={styles.prod_name}>{prod.name}</div>
            <div className={styles.totalAttitude}>{this.renderFormItems(prod)}</div>
          </div>
        </div>
      );
    });
  };

  render() {
    return (
      <div className={styles.productSelectorLayout}>
        <div className={styles.productAttitude}>
          <div className={styles.productSelectorHeader}>
            {crmIntlUtil.fmtStr('label.segmentation', '产品定级')}
          </div>
          <div className={styles.productAttitudeList}>{this.buildProductList()}</div>
        </div>
      </div>
    );
  }
}

SegmentationHistorySelector.propTypes = {
  fetch: PropTypes.object,
  onChangeSelect: PropTypes.func,
};

export default SegmentationHistorySelector;
