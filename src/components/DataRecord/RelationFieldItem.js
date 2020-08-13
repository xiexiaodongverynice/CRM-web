/**
 * Created by apple on 18/09/2017.
 */
import React from 'react';
import * as _ from 'lodash';
import { Input, Modal, Icon } from 'antd';
import * as recordService from '../../services/object_page/recordService';
import * as layoutService from '../../services/object_page/layoutService';
import PopupRecordSelector from './PopupRecordSelector';
import { processCriterias } from '../../utils/criteriaUtil';
import consoleUtil from '../../utils/consoleUtil';

const Search = Input.Search;

class RelationFieldItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value || -1,
      relationField: props.relationField,
      renderFieldOption: props.renderFieldOption,
      showModal: false,
      lookupLayout: {},
      targetName: '',
      selectedRecord: {}, // 选中的记录
      needDisabled: props.needDisabled,
      modalCreated: true, // 模式窗口是否创建
    };

    this.popupRecordSelectorRef = null;
  }

  componentWillMount() {
    const { relationField, renderFieldOption, value } = this.state;
    const targetObjectApiName = relationField.target_object_api_name;
    // target_record_type是为了兼容老的layout， 旧的layout并不区分data和layout的recordType
    // const targetRecordType = renderFieldOption.target_data_record_type || renderFieldOption.target_record_type;
    const layoutRecordType =
      renderFieldOption.target_layout_record_type ||
      renderFieldOption.target_record_type ||
      renderFieldOption.target_data_record_type;

    // eslint-disable-next-line eqeqeq
    if (value != null && value != -1 && !_.isUndefined(value)) {
      // consoleUtil.log('load record', value);
      recordService
        .loadRecord({
          object_api_name: targetObjectApiName,
          record_id: value,
        })
        .then((response) => {
          const { name: targetName } = response;
          this.setState({
            targetName,
            selectedRecord: response,
          });
        });
    }

    Promise.resolve(
      layoutService.loadLayout({
        object_api_name: targetObjectApiName,
        layout_type: 'relation_lookup_page',
        query: {
          recordType: layoutRecordType,
        },
      }),
    ).then((response) => {
      this.setState({
        lookupLayout: response,
      });
    });
    // 如果存在配置的默认过滤条件，需要进行拼接处理
    const targetFilterCriterias = _.get(renderFieldOption, 'target_filter_criterias');
    if (!_.isEmpty(targetFilterCriterias)) {
      const criterias = _.get(targetFilterCriterias, 'criterias');
      const filterCriterias = _.map(criterias, (criteria) => {
        const field = criteria.field;
        const values = _.get(criteria, 'value');
        const operator = _.get(criteria, 'operator');

        // if (!_.isEmpty(values)) {
        //   values = _.map(values, (value) => {
        //     // 针对特定的值，进行替换
        //     if (_.eq(value, '$USER_ID$')) {
        //       const userId = localStorage.getItem('userId');
        //       return userId;
        //     } else {
        //       return value;
        //     }
        //   });
        // }

        return {
          field,
          value: values,
          operator,
        };
      });

      this.setState({ filterCriterias }, () => {
        // consoleUtil.log(filterCriterias);
      });
    }
  }

  componentDidMount() {
    //* 表单新建时如果lookup字段有初始值，则触发一下onChange事件，以便处理onLookupChange上定义当行为
    //* 只有add_page会触发
    const { pageType } = this.props;
    const { renderFieldOption } = this.state;
    if (renderFieldOption.onLookupChange && _.startsWith(pageType, 'add')) {
      const triggerOnChange = setInterval(() => {
        const { value, selectedRecord } = this.state;
        if (value > 0 && selectedRecord.id) {
          const { onChange, renderFieldOption } = this.props;
          if (onChange) {
            onChange(value, selectedRecord, renderFieldOption);
          }
          clearInterval(triggerOnChange);
        }
      }, 100);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { value: nextValue } = nextProps;
    const { value } = this.state;
    if (_.isUndefined(nextValue) && nextValue !== value) {
      this.setState({ targetName: undefined });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // consoleUtil.log('shouldComponentUpdate', nextProps, nextState);
    const { value, selectedRecord, showModal } = this.state;
    const { needDisabled } = this.props;
    return (
      nextState.showModal !== showModal ||
      nextProps.value !== value ||
      nextState.selectedRecord.id !== selectedRecord.id ||
      nextProps.needDisabled !== needDisabled
    );
  }

  componentWillUpdate(nextProps, nextState) {
    // 这里主要是处理联动的情况
    const { relationField, value } = this.state;
    const targetObjectApiName = relationField.target_object_api_name;
    const nextValue = nextProps.value;
    if (
      !_.isEqual(nextValue, '') &&
      nextValue !== value &&
      nextValue !== -1 &&
      !_.isNull(nextValue) &&
      !_.isUndefined(nextValue)
    ) {
      recordService
        .loadRecord({
          object_api_name: targetObjectApiName,
          record_id: nextValue,
        })
        .then((response) => {
          const { name: targetName } = response;
          this.setState({
            targetName,
            value: nextValue,
          });
        });
    }
  }

  onRowSelect(selectedRowKeys, records) {
    if (Array.isArray(records)) {
      const selectedRecord = records[0];
      this.setState({
        selectedRecord,
      });
    } else {
      this.setState({
        selectedRecord: records,
      });
    }
  }

  showRecordSelector(value) {
    this.setState(
      {
        showModal: true,
        modalCreated: true,
      },
      () => {
        const { popupRecordSelectorRef } = this;
        const doQuery = _.get(popupRecordSelectorRef, 'doQuery');
        if (_.isFunction(doQuery)) {
          /**
           * 重新调用接口，请求最新的 数据
           */
          popupRecordSelectorRef.doQuery({
            clear: true,
          });
        }
      },
    );
  }

  closeRecordSelector() {
    const { isRelationModalDestroyedWhenClosed } = this.props;
    this.setState({
      showModal: false,
      modalCreated: !isRelationModalDestroyedWhenClosed, // 关闭的模式窗口的时候，判断是否需要销毁模式窗口
    });
  }

  updateValue() {
    const { selectedRecord } = this.state;
    let changeselectedRecord = true;
    const {
      isRelationModalDestroyedWhenClosed,
      renderFieldOption: { onLookupChange: { setFields = [] } = {} },
    } = this.props;

    if (!_.isEmpty(setFields)) {
      const updateFields = {};
      setFields.forEach(({ source, target, render_type }) => {
        if (render_type === 'date_time') {
          // eslint-disable-next-line no-undef
          updateFields[target] = moment(_.get(selectedRecord, source));
          return;
        }
        updateFields[target] = _.get(selectedRecord, source);
      });
      this.props.form.setFieldsValue(updateFields);
    }
    if (_.get(selectedRecord, 'id')) {
      changeselectedRecord = true;
    } else {
      changeselectedRecord = false;
    }
    this.setState(
      {
        value: selectedRecord.id,
        targetName: selectedRecord.name,
        showModal: false,
        modalCreated: changeselectedRecord,
      },
      () => {
        const { onChange, renderFieldOption } = this.props;
        if (onChange) {
          onChange(this.state.value, selectedRecord, renderFieldOption);
        }
      },
    );
  }

  emitEmpty = () => {
    const { renderFieldOption } = this.props;
    const updateValues = {};
    const apiName = _.get(renderFieldOption, 'api_name');
    updateValues[apiName] = '';
    this.props.form.setFieldsValue(updateValues);
    this.setState(
      {
        selectedRecord: {
          id: null,
          targetName: undefined,
        },
        value: -1,
        targetName: undefined,
      },
      () => {
        this.updateValue();
      },
    );
    // this[this.props.id].focus();
    // this.props.form.setFieldsValue({[this.props.id]: undefined});
  };

  processFilterCriterias = ({ filterCriterias }) => {
    const { dataItem, parentRecord = {} } = this.props;
    return processCriterias(filterCriterias, dataItem, parentRecord);
  };

  render() {
    const { value } = this.props;
    const {
      relationField,
      targetName,
      showModal,
      renderFieldOption,
      lookupLayout,
      filterCriterias,
      selectedRecord,
      needDisabled,
      modalCreated,
    } = this.state;
    return (
      <div>
        <Input
          value={targetName}
          disabled={this.props.needDisabled}
          onClick={this.showRecordSelector.bind(this)}
          size="large"
          suffix={
            !this.props.needDisabled && targetName ? (
              <Icon
                type="close-circle"
                style={{ cursor: 'pointer', color: '#999', right: 25 }}
                onClick={this.emitEmpty.bind(this)}
              />
            ) : null
          }
        />
        {modalCreated ? (
          <Modal
            key={lookupLayout.id || relationField.api_name}
            title={lookupLayout.header}
            visible={showModal}
            onOk={this.updateValue.bind(this)}
            onCancel={this.closeRecordSelector.bind(this)}
            width={800}
            style={{ top: 200 }}
          >
            <PopupRecordSelector
              objectApiName={relationField.target_object_api_name}
              recordType={
                renderFieldOption.target_data_record_type || renderFieldOption.target_record_type
              }
              defaultFilterCriterias={this.processFilterCriterias({
                filterCriterias,
              })}
              layout={lookupLayout}
              onRowSelect={this.onRowSelect.bind(this)}
              ref={(el) => {
                this.popupRecordSelectorRef = el;
              }}
              needRelationQuery={_.get(
                renderFieldOption,
                'need_relation_query',
                _.get(lookupLayout, 'containers[0].components[0].need_relation_query', true),
              )}
            />
          </Modal>
        ) : null}
      </div>
    );
  }
}

export default RelationFieldItem;
