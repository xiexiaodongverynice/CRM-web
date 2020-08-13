/**
 * Created by wans on 2017/10/3 0003.
 */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Modal, Radio, Row, Col, message, Button, Select } from 'antd';
import * as styles from './FcClmInCallSelector.less';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';
import RecordFormItem from '../DataRecord/RecordFormItem';
import { checkFieldShowable } from '../DataRecord/common/record';
import { layer } from '../../components';
import PopupRecordSelector from '../DataRecord/PopupRecordSelector';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';
import * as recordService from '../../services/object_page/recordService';

const RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 14,
  },
};
class FcClmInCallSelector extends React.Component {
  constructor(props) {
    super(props);
    const { needDisabled } = this.props;
    this.state = {
      needDisabled,
      productCheckedList: [],
      selectedRecord: [],
      callProductReactionOptionList: [],
      filterSelectedItems: [],
      defaultCallClmList: [],
      reactionRadioValue: {},
      _cascade: {
        create: [],
        update: [],
        delete: [],
      },
      palyClmItemProps: {
        visible: false,
        title: '',
        clmHtmlUrl: '',
      },
    };
  }

  componentDidMount() {
    const callProductReactionFieldDescribe = fieldDescribeService.loadObjectFieldDescribe({
      object_api_name: 'call_product',
      field_api_name: 'reaction',
    });
    const callProductReactionOptionList = _.get(callProductReactionFieldDescribe, 'options');

    this.setState({
      callProductReactionOptionList,
    });
  }

  componentWillReceiveProps(nextProps) {
    const {
      productCheckedList: productCheckedList_new,
      defaultCallClmList: defaultCallClmList_new,
    } = nextProps;
    const {
      productCheckedList: productCheckedList_old,
      defaultCallClmList: defaultCallClmList_old,
    } = this.props;
    if (defaultCallClmList_old !== defaultCallClmList_new) {
      const filterClmIds = [];
      _.map(defaultCallClmList_new, (ite) => {
        filterClmIds.push(ite.clm_presentation);
      });
      this.setState({
        selectedRecord: defaultCallClmList_new,
        filterSelectedItems: filterClmIds,
      });
    }
    const diffAddNewProduct = _.difference(
      _.map(productCheckedList_new, 'id'),
      _.map(productCheckedList_old, 'id'),
    );
    if (!_.isEmpty(diffAddNewProduct)) {
      // *产品新增
      this.setState({ productCheckedList: productCheckedList_new });
    }
    const diffProductCheckedList = _.difference(
      _.map(productCheckedList_old, 'id'),
      _.map(productCheckedList_new, 'id'),
    );

    if (!_.isEmpty(diffProductCheckedList)) {
      // *产品删除
      // 清理productCheckedList
      // _.remove(),有一个致命的“bug“，不仅仅会移除掉productCheckedList，还会移除掉defaultProductCheckedList_new，甚至影响到父组件，所以此处将对象另起一个。
      const productCheckedListState = _.cloneDeep(this.state.productCheckedList);
      _.remove(productCheckedListState, (productChecked) => {
        const productId = productChecked.id;
        return _.indexOf(diffProductCheckedList, productId) >= 0;
      });
      const needRemoveSelectedClmObj = _.find(this.state.selectedRecord, {
        product: diffProductCheckedList[0],
      });
      this.onPrductChangeClearClm(diffProductCheckedList[0]);
      this.setState({ productCheckedList: productCheckedListState });
    }
  }

  onPrductChangeClearClm = async (productId) => {
    const { productCheckedList, selectedRecord } = this.state;
    const productIds = [];
    _.map(productCheckedList, (ite) => {
      productIds.push(ite.id);
    });
    const query = {
      needRelationQuery: true,
      joiner: 'and',
      objectApiName: 'clm_presentation',
      orderBy: 'update_time',
      order: 'desc',
      criterias: [
        {
          field: 'record_type',
          operator: 'in',
          value: ['master'],
        },
        {
          field: 'status',
          operator: '==',
          value: [1],
        },
        {
          field: 'product',
          operator: 'in',
          value: productIds,
        },
      ],
      pageSize: 100000,
      pageNo: 1,
    };

    await recordService
      .queryRecordList({
        dealData: query,
      })
      .then((response) => {
        const allProductClms = _.get(response, 'result', []);

        const clmIdMap = _.chain(allProductClms)
          .filter((clm) => _.get(clm, 'product') === productId)
          .map((item) => _.get(item, 'id'))
          .value();
        const deteleSelectedClmList = _.filter(selectedRecord, (message) =>
          clmIdMap.includes(this.getClmId(message)),
        );
        _.map(deteleSelectedClmList, (item) => {
          this.removeCallClmItem(this.getClmId(item), item);
        });
      });
  };

  getClmId = (item) => {
    const clmId = _.has(item, 'clm_presentation')
      ? _.get(item, 'clm_presentation')
      : _.get(item, 'id');
    return clmId;
  };

  onOpenClmListModal = () => {
    const { filterSelectedItems, productCheckedList } = this.state;
    const relationLayoutApiName = 'clm_presentation';
    const productId = [];
    _.map(productCheckedList, (ite) => {
      productId.push(ite.id);
    });
    const filterCase = [
      {
        field: 'status',
        operator: '==',
        value: [1],
      },
      {
        field: 'product',
        operator: 'in',
        value: productId,
      },
    ];
    layer.open({
      title: crmIntlUtil.fmtStr('header.clmInfo', '媒体信息'),
      width: 800,
      content: (
        <PopupRecordSelector
          key={`${relationLayoutApiName}`}
          ref={(el) => {
            this.popupRecordSelectorRef = el;
          }}
          objectApiName={relationLayoutApiName}
          recordType="master"
          defaultFilterCriterias={filterCase}
          filterSelectedItems={filterSelectedItems}
        />
      ),
      onOk: (e) => {
        const { keyMessageCheckedList, selectedRecord, filterSelectedItems, _cascade } = this.state;
        const popupRecordSelectorRefSeletedRows = this.popupRecordSelectorRef.getSelectedRows();

        if (!_.isEmpty(popupRecordSelectorRefSeletedRows)) {
          const createObj = {
            clm_presentation: _.get(popupRecordSelectorRefSeletedRows, '[0].id', ''),
            reaction: '',
            object_describe_name: 'call_survey_feedback_list',
          };
          this.setState(
            {
              selectedRecord: _.concat(selectedRecord, popupRecordSelectorRefSeletedRows),
              filterSelectedItems: _.concat(filterSelectedItems, [
                _.get(popupRecordSelectorRefSeletedRows, '[0].id'),
              ]),
              _cascade: {
                create: _.concat(_cascade.create, [createObj]),
                update: _cascade.update,
                delete: _cascade.delete,
              },
            },
            () => {
              this.props.onCallClmListchange(this.state.selectedRecord);
              this.props.onCallClmReactionChange(this.state._cascade);
            },
          );
        }

        layer.closeAll();
      },
    });
  };

  onClmReactionChange = (clmId, e) => {
    const { selectedRecord, _cascade } = this.state;
    const { defaultCallClmList } = this.props;
    const cloneDeepDefaultCallClmList = _.cloneDeep(defaultCallClmList);
    const onChangeOldClm = _.find(cloneDeepDefaultCallClmList, (o) => {
      return o.clm_presentation === clmId && o.reaction !== e.target.value;
    });
    const selectedReactionValueObj = {};
    _.set(selectedReactionValueObj, `${clmId}.reaction`, e.target.value);

    if (_.isEmpty(onChangeOldClm)) {
      //* 新增或者恢复了源数据的重要度
      const isCreate = _.find(cloneDeepDefaultCallClmList, (o) => {
        return o.clm_presentation === clmId;
      });
      if (!isCreate) {
        //* 新增
        const cloneDeepSelectedRecord = _.cloneDeep(selectedRecord);
        const cloneDeep_cascadeCreate = _.cloneDeep(_cascade.create);
        const findIndex = _.findIndex(cloneDeepSelectedRecord, (o) => o.id === clmId);
        cloneDeepSelectedRecord[findIndex].reaction = e.target.value;
        const findCreateIndex = _.findIndex(_cascade.create, (o) => o.clm_presentation === clmId);
        const createObj = {
          clm_presentation: clmId,
          reaction: e.target.value,
          object_describe_name: 'call_survey_feedback_list',
        };
        let createArr = [];
        if (findCreateIndex >= 0) {
          cloneDeep_cascadeCreate.splice(findCreateIndex, 1, createObj);
          createArr = cloneDeep_cascadeCreate;
        } else {
          createArr = _.concat(_cascade.create, [createObj]);
        }

        this.setState({
          selectedRecord: cloneDeepSelectedRecord,
          _cascade: {
            create: createArr,
            update: _cascade.update,
            delete: _cascade.delete,
          },
        });
      } else {
        //* 恢复了源数据的重要度
        const cloneDeepSelectedRecord = _.cloneDeep(selectedRecord);
        const findIndex = _.findIndex(cloneDeepSelectedRecord, (o) => o.clm_presentation === clmId);
        cloneDeepSelectedRecord[findIndex].reaction = e.target.value;
        this.setState({
          selectedRecord: cloneDeepSelectedRecord,
        });
      }
    } else {
      //* 旧数据更新
      //* 去掉selectedRecord更新的数据，添加更新后的媒体数据
      const cloneDeepSelectedRecord = _.cloneDeep(selectedRecord);
      const findIndex = _.findIndex(selectedRecord, (o) => o.clm_presentation === clmId);
      onChangeOldClm.reaction = e.target.value;
      cloneDeepSelectedRecord.splice(findIndex, 1, onChangeOldClm);
      const updateArr = _.concat(_cascade.update, [onChangeOldClm]);
      this.setState({
        selectedRecord: cloneDeepSelectedRecord,
        _cascade: {
          create: _cascade.create,
          update: updateArr,
          delete: _cascade.delete,
        },
      });
    }
    this.setState(
      {
        reactionRadioValue: selectedReactionValueObj,
      },
      () => {
        this.props.onCallClmReactionChange(this.state._cascade);
      },
    );
  };

  removeCallClmItem = (clmId, item) => {
    // *处理删除后update和create里面的数据
    const { selectedRecord, _cascade, reactionRadioValue } = this.state;
    let clmSurveyFeedbackId = _.get(item, 'clm_presentation')
      ? (clmSurveyFeedbackId = _.get(item, 'id'))
      : '';

    const removeMarkObj = _.find(selectedRecord, { clm_presentation: clmId })
      ? { clm_presentation: clmId }
      : { id: clmId };
    const callId = _.get(item, 'call', ''); //* 源数据的媒体信息里面才有callId，用来判断是否是原始数据
    const filterClmIds = [];
    const deleteArr = [];
    const selectedReactionValueObj = _.omit(reactionRadioValue, [`${clmId}`]);
    _.pull(selectedRecord, _.find(selectedRecord, removeMarkObj));
    _.map(selectedRecord, (ite) => {
      filterClmIds.push(ite.clm_presentation || ite.id);
    });
    if (callId) {
      //* 删除的是源数据
      deleteArr.push({
        id: clmSurveyFeedbackId,
        // status: 'delete',
        // objectApiName: 'call_survey_feedback_list',
        // _parentId: callId,
        // related_list_name: 'call_survey_feedback_list',
      });
      _.pull(_cascade.update, _.find(_cascade.update, { clm_presentation: clmId }));
    } else {
      // *删除的是新增数据
      _.pull(_cascade.create, _.find(_cascade.create, { clm_presentation: clmId }));
    }
    this.setState(
      {
        selectedRecord,
        filterSelectedItems: filterClmIds,
        _cascade: {
          create: _cascade.create,
          update: _cascade.update,
          delete: _.concat(_cascade.delete, deleteArr),
        },
        reactionRadioValue: selectedReactionValueObj,
      },
      () => {
        this.props.onCallClmReactionChange(this.state._cascade);
      },
    );
  };

  palyClmItem = (clmId, item) => {
    const clmName = _.get(item, 'name', _.get(item, 'clm_presentation__r.name'));
    this.setState({
      palyClmItemProps: {
        visible: true,
        title: clmName,
        clmHtmlUrl: _.get(item, 'visit_url', ''),
      },
    });
  };

  palyClmItemCancel = () => {
    this.setState({
      palyClmItemProps: {
        visible: false,
        title: '',
        clmHtmlUrl: '',
      },
    });
  };

  renderClmItem = () => {
    const { selectedRecord, reactionRadioValue } = this.state;

    return _.map(selectedRecord, (item) => {
      const clmName = _.get(item, 'name', _.get(item, 'clm_presentation__r.name'));
      const clmId = _.has(item, 'clm_presentation')
        ? _.get(item, 'clm_presentation')
        : _.get(item, 'id');
      return (
        <div key={`${clmId}_clm_div_`} className={styles.medicine}>
          <div className={styles.name}>
            <div className={styles.prod_name}>{clmName}</div>
            <div style={{ marginRight: '40px' }}>
              <Button
                type="default"
                size="default"
                onClick={this.palyClmItem.bind(this, clmId, item)}
                // disabled={this.state.needDisabled}
                style={{ borderColor: '#108ee9', color: '#108ee9' }}
              >
                播放媒体
              </Button>
            </div>
            <div className={styles.totalAttitude}>
              <RadioGroup
                onChange={this.onClmReactionChange.bind(this, clmId)}
                id={clmId}
                value={_.get(item, 'reaction', _.get(reactionRadioValue, `${clmId}.reaction`, ''))}
                disabled={this.state.needDisabled}
              >
                {_.map(this.state.callProductReactionOptionList, (callProductReactionOption) => {
                  return (
                    <Radio
                      key={`${clmId}_${callProductReactionOption.value}`}
                      name={`${clmId}_${callProductReactionOption.value}`}
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
                type="default"
                shape="circle"
                icon="minus"
                size="default"
                onClick={this.removeCallClmItem.bind(this, clmId, item)}
                disabled={this.state.needDisabled}
              />
            </div>
          </div>
        </div>
      );
    });
  };

  buildClmList = () => {
    const { productCheckedList, selectedRecord, needDisabled } = this.state;
    if (_.isEmpty(productCheckedList)) {
      return crmIntlUtil.fmtStr('header.product.select', '选择产品');
    }
    if (_.isEmpty(selectedRecord) && needDisabled) {
      return crmIntlUtil.fmtStr('未选择媒体');
    }
    return (
      <div>
        <div>{this.renderClmItem()}</div>
        {!needDisabled && (
          <div>
            <Button
              type="primary"
              shape="circle"
              icon="plus"
              size="default"
              onClick={() => this.onOpenClmListModal()}
            />
            <span style={{ marginLeft: '10px', color: '#3399FF', fontWeight: 'bold' }}>
              添加媒体
            </span>
          </div>
        )}
      </div>
    );
  };

  render() {
    const { palyClmItemProps } = this.state;
    return (
      <div className={styles.productSelectorLayout}>
        <div className={styles.productAttitude}>
          <div className={styles.productSelectorHeader}>
            {crmIntlUtil.fmtStr('header.clmInfo', '媒体信息')}
          </div>
          <div className={styles.productAttitudeList}>{this.buildClmList()}</div>
        </div>
        {palyClmItemProps.visible && (
          <Modal
            title={palyClmItemProps.title}
            visible={palyClmItemProps.visible}
            footer={null}
            width="70%"
            // onOk={this.handleOk}
            maskClosable={false}
            onCancel={this.palyClmItemCancel}
          >
            <iframe
              // key={timeStamp}
              // style={{ marginTop: '-27px', marginBottom: '-35px' }}
              src={palyClmItemProps.clmHtmlUrl}
              frameBorder="0"
              width="100%"
              height="600px"
            />
          </Modal>
        )}
      </div>
    );
  }
}

FcClmInCallSelector.propTypes = {
  fetch: PropTypes.object,
  onChangeSelect: PropTypes.func,
};

export default FcClmInCallSelector;
