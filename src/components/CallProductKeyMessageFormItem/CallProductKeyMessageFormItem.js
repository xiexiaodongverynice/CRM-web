/**
 * Created by wans on 2017/10/3 0003.
 */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { message } from 'antd';
import * as styles from './CallProductKeyMessageFormItem.less';
import { request } from '../../utils';
import FcProductSelector from '../FcProductSelector';
import FcKeyMessageSelector from '../FcKeyMessageSelector';
import FcClmInCallSelector from '../FcClmInCallSelector/FcClmInCallSelector';
import * as recordService from '../../services/object_page/recordService';
import consoleUtil from '../../utils/consoleUtil';

class CallProductKeyMessageFormItem extends React.Component {
  constructor(props) {
    super(props);
    const { needDisabled } = this.props;
    this.state = {
      productCheckedList: [],
      productReactionList: [],
      keyMessageCheckedList: {},
      keyMessageReactionList: [],

      defaultProductCheckedList: [],
      defaultProductReactionList: [],
      defaultKeyMessageCheckedList: {},
      defaultKeyMessageReactionList: [],

      defaultCallProductRecordList: [],
      defaultCallKeyMessageRecordList: [],

      needDisabled: _.get(this.props, 'needDisabled', false),
      defaultCallClmList: [],
    };
  }

  getInitialState = () => {};

  componentWillMount = () => {
    const { parentRecord } = this.props;
    const callId = _.get(parentRecord, 'id');
    if (callId !== undefined) {
      // /如果有id，说明不是新增页面，需要对数据进行回显
      this.fetchCallProduct(callId);
      this.fetchCallKeyMessage(callId);
      this.fetchCallClm(callId);
    }
  };
  componentWillReceiveProps = () => {};
  componentWillUpdate = () => {};
  componentDidUpdate = () => {};
  componentWillUnmount = () => {};

  fetchCallProduct = (callId) => {
    // consoleUtil.log('获取拜访产品列表')
    // message.config({
    //   top: '50%',
    // });
    // message.loading('loading..', 5);

    const callProductPayload = {
      joiner: 'and',
      criterias: [{ field: 'call', operator: '==', value: [callId] }],
      orderBy: 'create_time',
      order: 'asc',
      objectApiName: 'call_product',
      pageSize: 10000,
      pageNo: 1,
    };
    this.promise = recordService.queryRecordList({ dealData: callProductPayload }).then((resp) => {
      const resultData = _.get(resp, 'result');
      // consoleUtil.log(resultData);
      const defaultProductCheckedList = [];
      const defaultProductReactionList = [];
      _.forEach(resultData, (callProduct, key) => {
        const { name, id } = callProduct;
        defaultProductCheckedList.push({
          id: _.get(callProduct, 'product'),
          name: _.get(callProduct, 'product__r.name'),
        });
        defaultProductReactionList.push({
          id: _.get(callProduct, 'product'),
          name: _.get(callProduct, 'product__r.name'),
          reaction: _.get(callProduct, 'reaction'),
          importance: _.get(callProduct, 'importance'),
        });
      });
      const productCheckedList = _.cloneDeep(defaultProductCheckedList);
      this.setState(
        {
          defaultProductCheckedList,
          defaultProductReactionList,
          productCheckedList, // 数据初始化的时候，需要对productCheckedList赋值为默认值
        },
        () => {
          // consoleUtil.log('init product and reaction list',defaultProductReactionList,defaultProductCheckedList)
          this.fetchCallKeyMessage(callId);
          // message.destroy();
        },
      );
      this.props.loadDefaultRecordData({
        productCheckedList,
        defaultCallProductRecordList: resultData,
        defaultProductCheckedList, // :this.state.defaultProductCheckedList,
        defaultProductReactionList, // :this.state.defaultProductReactionList,
        // defaultKeyMessageCheckedList:this.state.defaultKeyMessageCheckedList,
        // defaultKeyMessageReactionList:this.state.defaultKeyMessageReactionList,
        product_reaction_list: this.state.defaultProductReactionList,
      });
    });
  };

  fetchCallKeyMessage = (callId) => {
    // consoleUtil.log('获取拜访反馈列表')

    const callKeyMessagePayload = {
      joiner: 'and',
      criterias: [{ field: 'call', operator: '==', value: [callId] }],
      orderBy: 'create_time',
      order: 'asc',
      objectApiName: 'call_key_message',
      pageSize: 10000,
      pageNo: 1,
    };
    this.promise = recordService
      .queryRecordList({ dealData: callKeyMessagePayload })
      .then((resp) => {
        const resultData = _.get(resp, 'result');
        // consoleUtil.log(resultData);
        const defaultKeyMessageCheckedList = {};
        const defaultKeyMessageReactionList = [];

        _.forEach(resultData, (callKeyMessage, key) => {
          const { name, product: productId } = callKeyMessage;
          let keyMessageList = _.get(defaultKeyMessageCheckedList, productId, []);
          keyMessageList = _.concat(keyMessageList, {
            id: _.get(callKeyMessage, 'key_message__r.id'),
            name: _.get(callKeyMessage, 'key_message__r.name'),
          });

          defaultKeyMessageReactionList.push({
            id: _.get(callKeyMessage, 'key_message__r.id'),
            name: _.get(callKeyMessage, 'key_message__r.name'),
            productId: _.get(callKeyMessage, 'product'),
            reaction: _.get(callKeyMessage, 'reaction', null),
          });

          _.set(defaultKeyMessageCheckedList, productId, keyMessageList);
        });

        this.setState({ defaultKeyMessageCheckedList, defaultKeyMessageReactionList }, () => {
          // consoleUtil.log('init callKeyMessage and reaction list',defaultKeyMessageCheckedList,defaultKeyMessageReactionList)
          // message.destroy();
        });
        const defaultKeyMessageReactionListState = _.cloneDeep(defaultKeyMessageReactionList);
        this.props.loadDefaultRecordData({
          defaultCallKeyMessageRecordList: resultData,
          // defaultProductCheckedList:this.state.defaultProductCheckedList,
          // defaultProductReactionList:this.state.defaultProductReactionList,
          defaultKeyMessageCheckedList, // this.state.defaultKeyMessageCheckedList,
          defaultKeyMessageReactionList, // this.state.defaultKeyMessageReactionList,
          keyMessage_reaction_list: defaultKeyMessageReactionListState,
        });
      });
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
    // consoleUtil.log('productOnChange',values);
  };

  productReactionOnChange = (values) => {
    // consoleUtil.log('productReactionOnChange', values, this.state.defaultProductReactionList);
    const { onProductReactionChange } = this.props;
    this.setState(
      {
        productReactionList: values,
      },
      () => {
        onProductReactionChange({
          product_reaction_list: this.state.productReactionList,
          // keyMessage_reaction_list: this.state.keyMessageReactionList
        });
        // consoleUtil.log('productReactionOnChange productReactionList',values);
      },
    );
    // consoleUtil.log('productReactionList',values);
  };

  keyMessageOnChange = (values) => {
    const { onKeyMessageChange } = this.props;
    consoleUtil.log('keyMessageOnChange', values, this.state.keyMessageCheckedList);
    this.setState(
      {
        keyMessageCheckedList: values,
      },
      () => {
        onKeyMessageChange(this.state.keyMessageCheckedList);
      },
    );
  };
  keyMessageReactionOnChange = (values) => {
    // consoleUtil.log('keyMessageReactionOnChange',values,this.state.defaultKeyMessageReactionList);
    const { onKeyMessageReactionChange } = this.props;
    this.setState(
      {
        keyMessageReactionList: values,
      },
      () => {
        onKeyMessageReactionChange({
          // product_reaction_list:this.state.productReactionList,
          keyMessage_reaction_list: this.state.keyMessageReactionList,
        });
        // consoleUtil.log('keyMessageReactionOnChange keyMessageReactionList',values);
      },
    );
  };

  fetchCallClm = (callId) => {
    //* 详情页获取拜访里面的媒体
    const payload = {
      // token: global.FC_CRM_TOKEN,
      criterias: [
        {
          field: 'call',
          operator: '==',
          value: [callId],
        },
      ],
      joiner: 'and',
      objectApiName: 'survey_feedback',
      order: 'asc',
      orderBy: 'create_time',
      pageNo: 1,
      pageSize: 100,
    };
    this.promise = recordService.queryRecordList({ dealData: payload }).then((resp) => {
      const resultData = _.get(resp, 'result');
      this.setState({ defaultCallClmList: resultData });
    });
  };

  render() {
    const { formItemExtenderFilterLayout } = this.props;
    const create_clm_in_call = _.get(this.props, 'fieldSection.create_clm_in_call', false);
    //* 是否显示媒体信息组件

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
      fieldSection: this.props.fieldSection,
      needDisabled: this.state.needDisabled,
      productCheckedList: this.state.productCheckedList,
      keyMessageCheckedList: this.state.keyMessageCheckedList,
      defaultProductCheckedList: this.state.defaultProductCheckedList,
      defaultProductReactionList: this.state.defaultProductReactionList,
      defaultKeyMessageCheckedList: this.state.defaultKeyMessageCheckedList,
      defaultKeyMessageReactionList: this.state.defaultKeyMessageReactionList,
    };

    const fcCallClmSelectorProps = {
      fieldSection: this.props.fieldSection,
      needDisabled: this.state.needDisabled,
      productCheckedList: this.state.productCheckedList,
      defaultCallClmList: this.state.defaultCallClmList,
    };
    // consoleUtil.log('fcKeyMessageSelectorProps:',fcKeyMessageSelectorProps)
    return (
      <div>
        <FcProductSelector {...fcProductSelectorProps} productOnChange={this.productOnChange} />
        <FcKeyMessageSelector
          {...fcKeyMessageSelectorProps}
          productReactionOnChange={this.productReactionOnChange}
          keyMessageOnChange={this.keyMessageOnChange}
          keyMessageReactionOnChange={this.keyMessageReactionOnChange}
        />
        {create_clm_in_call && (
          <FcClmInCallSelector
            {...fcCallClmSelectorProps}
            productReactionOnChange={this.productReactionOnChange}
            onCallClmListchange={this.props.onCallClmListchange}
            onCallClmReactionChange={this.props.onCallClmReactionChange}
          />
        )}
      </div>
    );
  }
}

CallProductKeyMessageFormItem.propTypes = {
  formItemExtenderFilterLayout: PropTypes.object,
  onChange: PropTypes.func,
};
export default CallProductKeyMessageFormItem;
