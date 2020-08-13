/**
 * Created by wans on 2017/10/3 0003.
 */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Checkbox, Radio, Row, Col, message, Button, Select } from 'antd';
import * as styles from './FcKeyMessageSelector.less';
import { request } from '../../utils';
import * as recordService from '../../services/object_page/recordService';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';
import * as layoutService from '../../services/object_page/layoutService';
import { layer } from '../../components';
import RelatedList from '../DataRecord/RelatedList';
import PopupRecordSelector from '../DataRecord/PopupRecordSelector';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const Option = Select.Option;

class FcKeyMessageSelector extends React.Component {
  constructor(props) {
    super(props);
    const { needDisabled } = this.props;
    this.state = {
      needDisabled,
      productCheckedList: [],
      productReactionList: [],
      keyMessageCheckedList: {},
      keyMessageReactionList: [],
      callProductImportanceOptionList: [],
    };

    this.popupRecordSelectorRef = null;
  }
  getInitialState = () => {};
  componentWillMount() {
    const callProductReactionFieldDescribe = fieldDescribeService.loadObjectFieldDescribe({
      object_api_name: 'call_product',
      field_api_name: 'reaction',
    });
    const callProductImportanceFieldDescribe = fieldDescribeService.loadObjectFieldDescribe({
      object_api_name: 'call_product',
      field_api_name: 'importance',
    });

    const callProductReactionOptionList = _.get(callProductReactionFieldDescribe, 'options');
    const callProductImportanceOptionList = _.get(callProductImportanceFieldDescribe, 'options');
    this.setState({ callProductReactionOptionList, callProductImportanceOptionList }, () => {
      // consoleUtil.log('callProductReactionOptionList',callProductReactionOptionList)
    });

    const keyMessageDescribe = fieldDescribeService.loadObjectFieldDescribe({
      object_api_name: 'key_message',
      field_api_name: 'reaction_options',
    });
    const keyMessageReactionFieldDescribe = fieldDescribeService.loadObjectFieldDescribe({
      object_api_name: 'key_message',
      field_api_name: 'reaction_options',
    });
    const keyMessageReactionOptionList = _.get(keyMessageReactionFieldDescribe, 'options');
    this.setState({ keyMessageReactionOptionList }, () => {
      // consoleUtil.log('keyMessageReactionOptionList',keyMessageReactionOptionList)
    });
    this.setState({ keyMessageDescribe });

    // 获取产品related_layout

    this.promise = layoutService
      .loadLayout({ object_api_name: 'key_message', layout_type: 'relation_lookup_page' })
      .then((resp) => {
        this.setState({ relationLookupLayout: resp });
      });
  }

  componentDidMount() {
    const { productCheckedList } = this.props;
    // consoleUtil.log('已经选择的product,需要从新渲染下方数据：',productCheckedList)
    // if (this.props.fetch && this.props.productCheckedList ) {
    // this.fetch();
    // }
  }
  componentWillUpdate = () => {};

  componentWillReceiveProps(nextProps) {
    // consoleUtil.log('=====fckeymessageSelector will receive props=====')
    const {
      productCheckedList: productCheckedList_new,
      defaultProductCheckedList: defaultProductCheckedList_new,
      defaultProductReactionList: defaultProductReactionList_new,
      defaultKeyMessageCheckedList: defaultKeyMessageCheckedList_new,
      defaultKeyMessageReactionList: defaultKeyMessageReactionList_new,
    } = nextProps;
    const {
      productCheckedList: productCheckedList_old,
      defaultProductCheckedList: defaultProductCheckedList_old,
      defaultProductReactionList: defaultProductReactionList_old,
      defaultKeyMessageCheckedList: defaultKeyMessageCheckedList_old,
      defaultKeyMessageReactionList: defaultKeyMessageReactionList_old,
    } = this.props;

    // /////默认值初始化赋值开始，有且今次执行一次执行一次//////////
    // 需要对
    // productCheckedList   [{id:123456,name:'abc'}]
    // productReactionList  [{id:123456,name:'abc',reaction:1}]
    // keyMessageCheckedList {123456:[{id:456,name:'abc'}]}
    // keyMessageReactionList  [{id:123456,productId:123456,name:'abc',reaction:1}]
    // 进行数据的初始化赋值

    // 因为默认选择的产品，defaultProductCheckedList仅仅更新一次。所有当defaultProductCheckedList_有变动的时候
    // 说明父组件已经获取到值 defaultProductCheckedList 并且传递过来，
    // 需要将productCheckedList，变成默认提供的产品选择集合
    // 需要将productReactionList，变成默认提供的产品反馈集合
    const diffDefaultProductCheckedList = _.difference(
      _.map(defaultProductCheckedList_new, 'id'),
      _.map(defaultProductCheckedList_old, 'id'),
    ); // [{id:123456,name:'abc'}]
    let isNotInitDefaultProductCheckedList = true;
    if (!_.isEmpty(diffDefaultProductCheckedList)) {
      // consoleUtil.log('diffDefaultProductCheckedList',diffDefaultProductCheckedList)
      isNotInitDefaultProductCheckedList = false;
      const productReactionListState = _.cloneDeep(defaultProductReactionList_new);
      const productCheckedListState = _.cloneDeep(defaultProductCheckedList_new);
      this.setState(
        {
          productCheckedList: productCheckedListState,
          productReactionList: productReactionListState,
        },
        () => {},
      );
    }

    // 同上。defaultKeyMessageCheckedList。
    // 需要将keyMessageCheckedList，变成默认提供的关键信息选择集合。
    // 需要将keyMessageReactionList，变成默认提供的关键信息反馈选择集合。
    const diffDefaultKeyMessageCheckedList = _.difference(
      _.keys(defaultKeyMessageCheckedList_new),
      _.keys(defaultKeyMessageCheckedList_old),
    ); // {123456:{id:456,name:'abc'}}
    if (!_.isEmpty(diffDefaultKeyMessageCheckedList)) {
      // consoleUtil.log('diffKeyMessageCheckedList',diffDefaultKeyMessageCheckedList)
      const keyMessageCheckedListState = _.cloneDeep(defaultKeyMessageCheckedList_new);
      const keyMessageReactionListState = _.cloneDeep(defaultKeyMessageReactionList_new);
      this.setState({
        keyMessageCheckedList: keyMessageCheckedListState,
        keyMessageReactionList: keyMessageReactionListState,
      });
    }
    // /////默认值初始化赋值结束，有且今次执行一次执行一次//////////

    // 普通操作的时候，如果是针对当前页面状态来说，父组件有新选择（新增）的产品（包含先取消、后选择回来的情况，适用于页面编辑的时候）
    // 需要查看默认的集合里面有没有这样的数据，如果有的话，将数据回显
    // 判断依据：新传递productCheckedList_new比productCheckedList_old数据有不同，不同的即为新选择的。
    // 特殊：当刚默认值初始化了之后，productCheckedList_old是为空的，所以需要父组件在获取defaultProductCheckList的时候，对productCheckedList_new进行赋值，并且传递。
    const diffAddNewProduct = _.difference(
      _.map(productCheckedList_new, 'id'),
      _.map(productCheckedList_old, 'id'),
    );
    // _.isEmpty(_.difference(_.map(productCheckedList_new,'id'),_.map(defaultProductCheckedList_new,'id')))
    if (!_.isEmpty(diffAddNewProduct) && isNotInitDefaultProductCheckedList) {
      this.setState({ productCheckedList: productCheckedList_new }, () => {});
      if (!_.isEmpty(defaultProductCheckedList_new)) {
        // 如果有新选择的产品的话，需要查看default里面是否有相应的记录，如果有的话，需要回显
        _.forEach(diffAddNewProduct, (productId) => {
          if (!_.isEmpty(defaultProductCheckedList_new, { id: productId })) {
            // 如果所选择的产品在默认的数据集合里面存在，那么需要进行数据回显
            let productReactionListState = _.cloneDeep(this.state.productReactionList);
            productReactionListState = _.concat(
              productReactionListState,
              _.filter(defaultProductReactionList_new, { id: productId }),
            );

            let keyMessageCheckedListState = _.cloneDeep(this.state.keyMessageCheckedList);
            keyMessageCheckedListState = _.set(
              keyMessageCheckedListState,
              productId,
              _.get(defaultKeyMessageCheckedList_new, productId, []),
            );

            let keyMessageReactionListState = _.cloneDeep(this.state.keyMessageReactionList);
            keyMessageReactionListState = _.concat(
              keyMessageReactionListState,
              _.filter(defaultKeyMessageReactionList_new, { productId }),
            );

            this.setState(
              {
                productReactionList: productReactionListState,
                keyMessageCheckedList: keyMessageCheckedListState,
                keyMessageReactionList: keyMessageReactionListState,
              },
              () => {
                this.props.productReactionOnChange(productReactionListState);
                this.props.keyMessageReactionOnChange(keyMessageReactionListState);
              },
            );
          }
        });
      }
    }
    // TODO 此处下方clone的部分，可能不需要了，因为上面在赋值之前已经clone了，UAT之后，需要改掉试试
    // 如果有删除的product
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

      this.setState({ productCheckedList: productCheckedListState }, () => {});

      // 清除选择出来的产品反馈 keyMessageCheckedList
      let keyMessageCheckedListState = _.cloneDeep(this.state.keyMessageCheckedList);
      keyMessageCheckedListState = _.omit(keyMessageCheckedListState, diffProductCheckedList);
      this.setState({ keyMessageCheckedList: keyMessageCheckedListState });

      // 清除产品的反馈信息 productReactionList
      const productReactionListState = _.cloneDeep(this.state.productReactionList);
      _.pullAllBy(
        productReactionListState,
        _.differenceBy(productReactionListState, productCheckedList_new, 'id'),
        'id',
      );
      this.setState({ productReactionList: productReactionListState }, () => {
        this.props.productReactionOnChange(this.state.productReactionList);
      });

      // 清除产品反馈的反馈信息 keyMessageReactionList
      const keyMessageReactionListState = _.cloneDeep(this.state.keyMessageReactionList);
      _.remove(keyMessageReactionListState, (productReaction) => {
        const productId = productReaction.productId;
        return _.indexOf(diffProductCheckedList, productId) >= 0;
      });

      this.setState({ keyMessageReactionList: keyMessageReactionListState }, () => {
        this.props.keyMessageReactionOnChange(this.state.keyMessageReactionList);
      });
    }

    // eslint-disable-next-line
    (nextProps, nextState) => {
      // return nextProps.id !== this.props.id;
      return !_.isEmpty(diffProductCheckedList);
    };
  }

  onProductReactionChange = (productId, e) => {
    const { productReactionOnChange } = this.props;
    // consoleUtil.log('radio checked', e.target.value);
    const checkValue = e.target.value;
    const { productReactionList, productCheckedList } = this.state;
    let productReactionListState = _.cloneDeep(this.state.productReactionList);
    const product = _.find(productCheckedList, { id: productId });
    const productReaction = _.find(productReactionListState, { id: productId });

    if (productReaction == undefined) {
      productReactionListState = _.concat(productReactionListState, {
        id: product.id,
        name: product.name,
      });
    }
    _.update(_.find(productReactionListState, { id: productId }), 'reaction', (n) => {
      return checkValue;
    });
    this.setState(
      {
        productReactionList: productReactionListState,
      },
      () => {
        // consoleUtil.log('productReactionList',this.state.productReactionList);
        productReactionOnChange(this.state.productReactionList);
      },
    );
  };

  onProductImportanceChange = (productId, value) => {
    const { productReactionOnChange } = this.props;
    const checkValue = value;
    const { productCheckedList } = this.state;
    let productReactionListState = _.cloneDeep(this.state.productReactionList);
    const product = _.find(productCheckedList, { id: productId });
    const productReaction = _.find(productReactionListState, { id: productId });

    if (productReaction == undefined) {
      productReactionListState = _.concat(productReactionListState, {
        id: product.id,
        name: product.name,
      });
    }
    _.update(_.find(productReactionListState, { id: productId }), 'importance', (n) => {
      return checkValue;
    });
    this.setState(
      {
        productReactionList: productReactionListState,
      },
      () => {
        // consoleUtil.log('productReactionList',this.state.productReactionList);
        productReactionOnChange(this.state.productReactionList);
      },
    );
  };

  onKeyMessageReactionsChange = (productId, keyMessage, e) => {
    const { keyMessageReactionOnChange } = this.props;
    // consoleUtil.log('radio checked', e.target.value);
    const checkValue = e.target.value;
    // let {keyMessageReactionList} = this.state;
    const keyMessageId = keyMessage.id;
    const keyMessageReactionListState = this.buildKeyMessageReactionList(
      this.state.keyMessageReactionList,
      productId,
      keyMessageId,
      checkValue,
    );
    this.setState(
      {
        keyMessageReactionList: keyMessageReactionListState,
      },
      () => {
        // consoleUtil.log('productReactionList',this.state.productReactionList);
        keyMessageReactionOnChange(this.state.keyMessageReactionList);
      },
    );
  };

  /**
   * 此方法在初始化selectedRowKeys存在全选情况时，此方法不触发，导致this.state.selectedRecord===[]
   * @param {Array} selectedRowKeys
   * @param {Array} records
   */
  onRowSelect(selectedRowKeys, records) {
    const selectKeyMessage = [];
    this.setState({
      selectedRecord: records,
    });
  }

  buildKeyMessageReactionList = (
    keyMessageReactionList,
    productId,
    keyMessageId,
    checkValue = null,
  ) => {
    let keyMessageReactionListState = _.cloneDeep(keyMessageReactionList);
    const keyMessageReaction = _.find(keyMessageReactionListState, { id: keyMessageId });

    if (keyMessageReaction === undefined) {
      keyMessageReactionListState = _.concat(keyMessageReactionListState, {
        id: keyMessageId,
        productId,
      });
    }
    _.update(_.find(keyMessageReactionListState, { id: keyMessageId }), 'reaction', (n) => {
      return checkValue;
    });
    return keyMessageReactionListState;
  };

  /**
   * 处理弹出窗口的数据
   *
   * TODO 多次调用setState需要优化
   */
  handlePopupRecordSelectorOk = (productId) => {
    const { keyMessageReactionOnChange } = this.props;
    const { keyMessageCheckedList, selectedRecord } = this.state;
    _.set(keyMessageCheckedList, productId, selectedRecord);
    this.setState({ keyMessageCheckedList }, () => {
      let keyMessageReactionListState = this.state.keyMessageReactionList;
      _.forEach(_.get(this.state.keyMessageCheckedList, productId), (keyMessageChecked) => {
        const keyMessageId = keyMessageChecked.id;
        keyMessageReactionListState = this.buildKeyMessageReactionList(
          keyMessageReactionListState,
          productId,
          keyMessageId,
        );
      });
      this.setState(
        {
          keyMessageReactionList: keyMessageReactionListState,
        },
        () => {
          keyMessageReactionOnChange(keyMessageReactionListState);
        },
      );
    });
  };

  openKeyMessage = (productId) => {
    const { relationLookupLayout, keyMessageDescribe, keyMessageReactionList } = this.state;
    const relatedLayout = relationLookupLayout;
    const relationLayoutApiName = relationLookupLayout.object_describe_api_name;
    const filterCase = _.get(relatedLayout, 'default_filter_criterias.criterias', []).concat({
      field: 'product',
      operator: '==',
      value: [productId],
    });

    const selectedRowKeys = _.map(_.filter(keyMessageReactionList, { productId }), (record) =>
      _.get(record, 'id'),
    );
    layer.open({
      title: crmIntlUtil.fmtStr(
        _.get(relatedLayout, 'header.i18n_key', 'header.product.feedback'),
        _.get(relatedLayout, 'header'),
      ),
      width: _.get(relatedLayout, 'layer.width', 800),
      // content: <input type="text" id="input1"/>,
      content: (
        <PopupRecordSelector
          key={`${relationLayoutApiName}_${productId}`}
          ref={(el) => {
            this.popupRecordSelectorRef = el;
          }}
          objectApiName={relationLayoutApiName}
          recordType="master"
          defaultFilterCriterias={filterCase}
          layout={relatedLayout}
          multipleSelect
          onRowSelect={this.onRowSelect.bind(this)}
          selectedRowKeys={selectedRowKeys}
        />
      ),
      onOk: (e) => {
        const { keyMessageCheckedList, selectedRecord } = this.state;
        const popupRecordSelectorRefSeletedRows = this.popupRecordSelectorRef.getSelectedRows();
        if (_.size(selectedRecord) !== _.size(popupRecordSelectorRefSeletedRows)) {
          this.setState(
            {
              selectedRecord: popupRecordSelectorRefSeletedRows,
            },
            this.handlePopupRecordSelectorOk.bind(this, productId),
          );
        } else {
          this.handlePopupRecordSelectorOk(productId);
        }
        layer.closeAll();
      },
    });
  };

  removeKeyMessage(productId, keyMessage) {
    const keyMessageId = keyMessage.id;
    const { selectedRecord, keyMessageCheckedList, keyMessageReactionList } = this.state;
    const { keyMessageReactionOnChange } = this.props;

    // 处理keyMessageCheckedList
    // _.set(keyMessageCheckedList,productId,selectedRecord); //不知道为啥要加的了
    _.pull(
      _.get(keyMessageCheckedList, productId),
      _.find(_.get(keyMessageCheckedList, productId), { id: keyMessageId }),
    );
    this.setState({ keyMessageCheckedList });

    // 清除 keyMessageReactionList
    _.pull(keyMessageReactionList, _.find(keyMessageReactionList, { id: keyMessageId }));
    this.setState({ keyMessageReactionList }, () => {
      keyMessageReactionOnChange(this.state.keyMessageReactionList);
    });
  }

  clearBeforeOpen = (func) => {
    this.setState(
      {
        selectedRecord: [],
      },
      func,
    );
  };

  buildProductList = () => {
    const {
      productCheckedList,
      productReactionList,
      keyMessageCheckedList,
      keyMessageReactionList,
    } = this.state;

    if (_.isEmpty(productCheckedList)) {
      return crmIntlUtil.fmtStr('header.product.select', '选择产品');
    }
    // debugger;
    return productCheckedList.map((prod) => {
      const prodId = prod.id;
      const productReaction = _.find(productReactionList, { id: prodId });
      const showProductImportance = _.get(
        this.props,
        'fieldSection.show_product_importance',
        false,
      ); //* 是否显示产品重要度

      const { callProductImportanceOptionList } = this.state;
      return (
        <div key={`${prod.id}_product_div_${Math.random(0, 5)}`} className={styles.medicine}>
          <div className={styles.name}>
            <div className={styles.prod_name}>{prod.name}</div>
            {showProductImportance && (
              <div style={{ marginRight: '40px' }}>
                <Select
                  placeholder="请选择重要度"
                  disabled={this.state.needDisabled}
                  value={_.get(productReaction, 'importance')}
                  defaultValue=""
                  style={{ width: 120 }}
                  onChange={this.onProductImportanceChange.bind(this, prodId)}
                >
                  {_.map(callProductImportanceOptionList, (callProductImportanceOption) => {
                    return (
                      <Option value={callProductImportanceOption.value}>
                        {callProductImportanceOption.label}
                      </Option>
                    );
                  })}
                </Select>
              </div>
            )}
            <div className={styles.totalAttitude}>
              <RadioGroup
                onChange={this.onProductReactionChange.bind(this, prodId)}
                id={prodId}
                value={_.get(productReaction, 'reaction')}
                disabled={this.state.needDisabled}
              >
                {_.map(this.state.callProductReactionOptionList, (callProductReactionOption) => {
                  return (
                    <Radio
                      key={`${prodId}_${callProductReactionOption.value}_${Math.random(0, 5)}`}
                      name={`${prodId}_${callProductReactionOption.value}`}
                      value={callProductReactionOption.value}
                    >
                      {crmIntlUtil.fmtStr(
                        `options.call_product.reaction.${callProductReactionOption.value}`,
                        _.get(callProductReactionOption, 'label'),
                      )}
                    </Radio>
                  );
                })}
              </RadioGroup>
              <Button
                type="primary"
                shape="circle"
                icon="plus"
                size="default"
                onClick={this.clearBeforeOpen.bind(this, this.openKeyMessage.bind(this, prodId))}
                disabled={this.state.needDisabled}
                style={{ margin: '2px 8px' }}
              />
            </div>
          </div>
          <div>
            {_.map(_.get(keyMessageCheckedList, prodId), (keyMessage, index) => {
              const keyMessageId = keyMessage.id;
              const keyMessageReaction = _.find(keyMessageReactionList, { id: keyMessageId });
              return (
                <div
                  className={styles.attitude}
                  key={`${keyMessage.id}_key_message_div${Math.random(0, 5)}`}
                >
                  <div className={styles.des_name}>{keyMessage.name}</div>
                  <div className={styles.totalAttitude}>
                    <RadioGroup
                      onChange={this.onKeyMessageReactionsChange.bind(this, prodId, keyMessage)}
                      id={`key_message_id_${prodId}_${keyMessage.id}`}
                      value={_.get(keyMessageReaction, 'reaction')}
                      disabled={this.state.needDisabled}
                    >
                      {_.map(
                        this.state.keyMessageReactionOptionList,
                        (callKeyMessageReactionOption) => {
                          return (
                            <Radio
                              key={`${prodId}_${keyMessage.id}_${
                                callKeyMessageReactionOption.value
                              }_${Math.random(0, 5)}`}
                              name={`${prodId}_${keyMessage.id}_${callKeyMessageReactionOption.value}`}
                              value={callKeyMessageReactionOption.value}
                            >
                              {crmIntlUtil.fmtStr(
                                `options.call_key_message.reaction.${callKeyMessageReactionOption.value}`,
                                _.get(callKeyMessageReactionOption, 'label'),
                              )}
                            </Radio>
                          );
                        },
                      )}
                    </RadioGroup>
                    <Button
                      type="default"
                      shape="circle"
                      icon="minus"
                      size="default"
                      onClick={this.removeKeyMessage.bind(this, prodId, keyMessage)}
                      disabled={this.state.needDisabled}
                    />
                  </div>
                </div>
              );
            })}
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
            {crmIntlUtil.fmtStr('header.product.feedback', '产品反馈')}
          </div>
          <div className={styles.productAttitudeList}>{this.buildProductList()}</div>
        </div>
      </div>
    );
  }
}

FcKeyMessageSelector.propTypes = {
  fetch: PropTypes.object,
  onChangeSelect: PropTypes.func,
};

export default FcKeyMessageSelector;
