/* eslint-disable no-case-declarations,no-underscore-dangle,react/no-multi-comp */
/**
 * Created by xinli on 2017/8/28.
 */
import React from 'react';
import _ from 'lodash';
// import { FormattedMessage } from 'react-intl';
import { Button, Row, Col, Modal, Tag } from 'antd';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import CriteriaRow from './recordFilterCriteriaRow';

const criteria_row_prefixer = 'criteria-row-';

class RecordFilter extends React.Component {
  constructor(props) {
    super(props);
    const { filter, defaultFilterCriterias } = this.props;

    // 默认展开第一项
    const fieldList = _.get(filter, 'fieldList', []);
    const field = _.head(fieldList);
    const fieldType = _.get(field, 'type');
    let fieldApiName = _.get(field, 'api_name');
    if (
      fieldType === 'relation' ||
      _.indexOf(['create_by', 'update_by', 'owner'], fieldApiName) >= 0
    ) {
      fieldApiName = `${fieldApiName}__r.name`;
    }
    // fieldApiName = fieldType === 'relation' ? `${fieldApiName}__r.name` : fieldApiName;
    // 拼接默认过滤条件defaultFilterCriterias
    const defaultFilters = _.get(defaultFilterCriterias, 'criterias', []);
    // _.forEach(defaultFilterCriterias, (defaultFilterCriteria)=>{
    //   defaultFilter.push(defaultFilterCriteria);
    // })
    const criteriasState =
      defaultFilters.length > 0
        ? defaultFilters
        : [
            {
              field: fieldApiName,
              operator: undefined,
              value: [],
            },
          ];
    this.state = {
      criterias: criteriasState,
      showFilterModal: false,
      defaultFilters,
    };
  }

  okHandler = () => {
    const criterias = this.harvestFields();
    this.setState(
      {
        criterias,
      },
      () => {
        const { onCriteriasChange } = this.props;
        if (_.isFunction(onCriteriasChange)) {
          const validCriterias = criterias.filter((x) => {
            return x.field && x.operator && x.value && x.value[0] !== undefined;
          });
          onCriteriasChange(validCriterias);
        }
        this.closeFilterModal();
      },
    );
  };

  showFilterForm = () => {
    this.setState({
      showFilterModal: true,
    });
  };

  cancelHandler = () => {
    this.closeFilterModal();
  };

  closeFilterModal() {
    this.setState({
      showFilterModal: false,
    });
  }

  criteriaRowAddHandler = () => {
    this.setState({
      criterias: this.harvestFields().concat({ value: [] }),
    });
  };

  /**
   * 从子组件中传递数据容易造成不可控或者反复渲染的问题，因此最好从父组件中主动获取子组件内的数据，或者使用redux
   */
  harvestFields = () => {
    const criteriasState = [];
    _.chain(this.refs)
      .keys()
      .forEach((key) => {
        if (_.startsWith(key, criteria_row_prefixer)) {
          const item = _.pick(this.refs[key].state, ['field', 'operator', 'value']);
          const value = _.get(item, 'value');
          if (value && _.isArray(value)) {
            // *对value去空处理
            const newValue = [];
            _.map(value, (o) => {
              newValue.push(_.trim(o));
            });
            item.value = newValue;
          }
          criteriasState.push(item);
        }
      })
      .value();
    return criteriasState;
  };

  removeCriteria = (index) => {
    const criterias = this.harvestFields();
    criterias.splice(index, 1);
    this.setState({
      criterias,
    });
  };

  renderCriterias = () => {
    const { criterias, defaultFilters } = this.state;
    const size = criterias.length || 0;
    const { filter = {} } = this.props;
    const { fieldList, objectApiName, component } = filter;
    /**
     * 过滤选项额外的条件配置
     */
    const { filter_fields_extra_config: filterFieldsExtraConfig } = component;
    const items = criterias.map((criteria, index) => {
      const { field, operator, value } = criteria;
      /**
       * TODO hhy 此处使用Math.random()作为key存在性能问题，需要优化
       */
      return (
        <CriteriaRow
          key={Math.random()}
          defaultField={field}
          defaultOperator={operator}
          defaultValue={value}
          index={index}
          size={size}
          ref={`${criteria_row_prefixer}${index}`}
          fieldList={fieldList}
          filterFieldsExtraConfig={filterFieldsExtraConfig}
          defaultFilters={defaultFilters}
          objectApiName={objectApiName}
          onClickRowAdd={this.criteriaRowAddHandler}
          onClickRowRemove={this.removeCriteria.bind(this, index)}
        />
      );
    });

    return <div>{items}</div>;
  };

  renderCriteriaTags = () => {
    const { criterias } = this.state;
    const items = criterias.map((x, index) => {
      return (
        <Tag key={`tag-${index}`} closable>{`${x.field} ${x.operator} ${
          x.value && x.value.join(', ')
        }`}</Tag>
      );
    });

    return <div>{items}</div>;
  };

  render() {
    return (
      <div style={{ display: 'inline' }}>
        <Button size="large" icon="filter" onClick={this.showFilterForm}>
          {crmIntlUtil.fmtStr('label.filter', '筛选')}
        </Button>
        {/* this.renderCriteriaTags()*/}
        <Modal
          style={{ top: 200 }}
          width={800}
          visible={this.state.showFilterModal}
          onOk={this.okHandler}
          onCancel={this.cancelHandler}
        >
          <Row type="flex" justify="end">
            <Col span={24}>
              <Button icon="plus" onClick={this.criteriaRowAddHandler}>
                {crmIntlUtil.fmtStr('filter.add.condition')}
              </Button>
            </Col>
          </Row>
          {this.renderCriterias()}
        </Modal>
      </div>
    );
  }
}

export default RecordFilter;
