/**
 * Created by wans on 2017/10/3 0003.
 */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { message } from 'antd';
import * as styles from './SegmentationHistoryFormItem.less';
import { request } from '../../utils';
import SegmentationHistoryProductSelector from '../SegmentationHistoryProductSelector/SegmentationHistoryProductSelector';
import SegmentationHistorySelector from '../SegmentationHistorySelector/SegmentationHistorySelector';
import * as recordService from '../../services/object_page/recordService';
import consoleUtil from '../../utils/consoleUtil';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';

class SegmentationHistoryFormItem extends React.Component {
  constructor(props) {
    super(props);
    const { needDisabled } = this.props;
    this.state = {
      productCheckedList: [],
      keyMessageCheckedList: {},
      defaultProductCheckedList: [],
      defaultProductReactionList: [],
      defaultKeyMessageCheckedList: {},
      defaultKeyMessageReactionList: [],
      needDisabled: _.get(this.props, 'needDisabled', false),
      fieldList: [],
      canRender: false,
    };
  }

  componentWillMount = () => {
    const { hasSegmentationHistory, objectApiName } = this.props;
    hasSegmentationHistory(true);
    const allObject = fieldDescribeService.loadAllObject();
    const fieldList = _.get(
      this.loadObjectFieldDescribe({ allObject, object_api_name: objectApiName }),
      'fields',
      [],
    );
    this.setState({
      fieldList,
    });
    this.getProductList();
  };

  productOnChange = (values) => {
    const { onProductChange } = this.props;
    this.setState(
      {
        productCheckedList: values,
      },
      () => {
        onProductChange(this.state.productCheckedList);
      },
    );
  };

  loadObjectFieldDescribe = (payload) => {
    const { allObject } = payload;
    const objectDescibeList = _.get(allObject, 'items');
    const refObjectDescribe = _.find(objectDescibeList, { api_name: payload.object_api_name });
    return refObjectDescribe;
  };

  getProductList = async () => {
    const { formItemExtenderFilterLayout } = this.props;
    const dataDeal = {
      joiner: 'and',
      criterias: _.get(formItemExtenderFilterLayout, 'default_filter_criterias', []),
      orderBy: _.get(formItemExtenderFilterLayout, 'default_sort_by'),
      order: _.get(formItemExtenderFilterLayout, 'default_sort_order'),
      objectApiName: 'user_product',
    };

    this.promise = await recordService.queryRecordList({ dealData: dataDeal }).then((resp) => {
      const resultData = _.get(resp, 'result');

      this.setState({ productList: resultData });
      this.checkIsExistSegmentation(resultData);
    });
  };

  checkIsExistSegmentation = (productList) => {
    const fieldSection = _.get(this.props, 'fieldSection');
    const parentRecord = _.get(this.props, 'parentRecord');
    const checkIsExist = _.get(fieldSection, 'check_is_exist', false); // * check_is_exist根据布局判断是否需要检查
    if (checkIsExist) {
      // * 通过cp表查customer是当前医生的，product是当用用户产品的，
      // * 有则是存在定级，不显示定级section，未定级则显示定级section
      const customerId = _.get(parentRecord, 'customer');

      const productIds =
        !_.isEmpty(productList) && _.isArray(productList) ? _.map(productList, 'product') : [];

      const payload = {
        criterias: [
          { field: 'customer', operator: '==', value: [customerId] },
          { field: 'product', operator: 'in', value: productIds },
        ],
        joiner: 'and',
        objectApiName: 'customer_product',
        order: 'asc',
        orderBy: 'create_time',
        pageNo: 1,
        pageSize: 100,
      };

      this.promise = recordService.queryRecordList({ dealData: payload }).then((resp) => {
        const resultData = _.get(resp, 'result');
        if (_.isEmpty(resultData)) {
          this.setState({ canRender: true });
        } else {
          this.props.isRenderSegmentationHeader(false);
        }
      });
    } else {
      this.setState({ canRender: true });
    }
  };

  render() {
    const {
      formItemExtenderFilterLayout,
      fieldSectionFields,
      form,
      pageType,
      objectApiName,
      formItemValueChange,
    } = this.props;
    const { fieldList, canRender } = this.state;
    const fcProductSelectorProps = {
      fetch: {
        data: {
          defaultFilterCriterias: _.get(
            formItemExtenderFilterLayout,
            'default_filter_criterias',
            [],
          ),
          orderBy: _.get(formItemExtenderFilterLayout, 'default_sort_by'),
          order: _.get(formItemExtenderFilterLayout, 'default_sort_order'),
        },
        dataKey: 'result',
      },
      defaultProductCheckedList: this.state.defaultProductCheckedList,
      needDisabled: this.state.needDisabled,
    };

    const fcKeyMessageSelectorProps = {
      needDisabled: this.state.needDisabled,
      productCheckedList: this.state.productCheckedList,
      fieldSectionFields,
      form,
      fieldList,
      pageType,
      objectApiName,
      formItemValueChange,
    };

    return (
      <div>
        {canRender && (
          <div>
            <SegmentationHistoryProductSelector
              {...fcProductSelectorProps}
              productOnChange={this.productOnChange}
            />
            <SegmentationHistorySelector {...fcKeyMessageSelectorProps} />
          </div>
        )}
      </div>
    );
  }
}

SegmentationHistoryFormItem.propTypes = {
  formItemExtenderFilterLayout: PropTypes.object,
  onChange: PropTypes.func,
};
export default SegmentationHistoryFormItem;
