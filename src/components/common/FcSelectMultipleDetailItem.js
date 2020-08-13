/**
 * Created by xinli on 2017/10/10.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import _ from 'lodash';
import * as recordService from '../../services/object_page/recordService';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { processCriterias } from '../../utils/criteriaUtil';
import { callAnotherFunc } from '../../utils';
import { getExpression } from '../../utils/expressionUtils';

class FcSelectMultipleDetailItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [],
    };
  }

  componentWillMount() {
    this.dealFieldItemRender(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataItem.version !== this.props.dataItem.version) {
      this.dealFieldItemRender(nextProps);
    }
  }

  dealFieldItemRender = (currentProps) => {
    const {
      fieldItem,
      renderFieldItem,
      mergedObjectFieldDescribe,
      mode,
      objectApiName,
      fieldApiName,
      dataItem,
    } = currentProps;

    let { fieldRecord } = currentProps;
    let { options } = mergedObjectFieldDescribe;
    // if (!_.isEqual(mode, 'multiple')) {
    //   fieldRecord = _.split(_.toString(fieldRecord),',')
    // }

    fieldRecord = _.split(_.toString(fieldRecord), ',');

    if (mergedObjectFieldDescribe.type === 'boolean' && _.isEmpty(options)) {
      options = [
        {
          label: '是',
          value: true,
        },
        {
          label: '否',
          value: false,
        },
      ];
    }

    if (Array.isArray(options) && Array.isArray(fieldRecord)) {
      const labels = options
        .filter((x) => fieldRecord.indexOf(x.value) >= 0)
        .map((x) => {
          const optionsLabel = crmIntlUtil.fmtStr(
            `options.${objectApiName}.${fieldApiName}.${x.value}`,
            _.get(x, 'label'),
          );
          return optionsLabel;
        });
      this.setState({ value: labels });
    } else if (renderFieldItem.data_source && Array.isArray(fieldRecord)) {
      // 处理DataSource的情况
      const {
        object_api_name,
        target_field,
        need_relation_query = true,
      } = renderFieldItem.data_source;
      // let { criterias = [] } = renderFieldItem.data_source;
      /**
       * 渲染label的配置
       */
      const render_label_expression = getExpression(
        renderFieldItem,
        'render_label_expression',
        false,
      );

      const enablecAsyncCriterias = _.get(
        renderFieldItem,
        'data_source.enablec_async_criterias',
        false,
      );

      const dataSourceCri = _.get(renderFieldItem, 'data_source.criterias', []);
      const queryValueCri = [
        { field: target_field ? `${target_field}.id` : 'id', operator: 'in', value: fieldRecord },
      ];

      const processedCriterias = enablecAsyncCriterias
        ? _.concat(processCriterias(dataSourceCri, dataItem), queryValueCri)
        : queryValueCri;

      recordService
        .queryRecordList({
          dealData: {
            needRelationQuery: need_relation_query,
            objectApiName: object_api_name,
            joiner: 'and',
            criterias: processedCriterias,
            pageNo: 1,
            pageSize: fieldRecord.length,
          },
        })
        .then((response) => {
          const { result } = response;
          const value = result.map((x) => {
            let targetFieldObj = x;
            if (!_.isEmpty(target_field)) {
              targetFieldObj = _.get(x, target_field);
            }

            /**
             * 解析自定义label
             */
            if (!_.isUndefined(render_label_expression)) {
              if (render_label_expression.indexOf('return ') !== -1) {
                const label = callAnotherFunc(
                  new Function('t', render_label_expression),
                  targetFieldObj,
                );
                return label;
              }
            }
            return targetFieldObj.name;
          });

          this.setState({
            value,
          });
        });
    }
  };

  render() {
    const { fieldItem, fieldRecord, renderFieldItem, mode, fieldApiName, dataItem } = this.props;
    const { value } = this.state;

    let tags;
    if (mode) {
      tags = value.map((v) => <Tag key={`${fieldItem.api_name}_${v}`}>{v}</Tag>);
    } else {
      tags = value.map((v) => <span key={`${fieldItem.api_name}_${v}`}>{v}</span>);
    }
    return <div>{tags}</div>;
  }
}

FcSelectMultipleDetailItem.propTypes = {
  fieldItem: PropTypes.object,
  // fieldRecord: PropTypes.array,
  renderFieldItem: PropTypes.object,
};

export default FcSelectMultipleDetailItem;
