/**
 * Created by wans on 2017/10/1 0001.
 * 下属下拉过滤选择器
 * @flow
 */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import FcTreeSelector from '../FcTreeSelector';
import FcSelector from '../FcSelector';
import config from '../../utils/config';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { assembleCriterias } from '../common/criterias';

const { api } = config;
const { subordinate_query } = api;

const SubordinateSelectorFilter = ({
  onSelectorFilterExtenderChange,
  selectorFilterExtenderLayout
}) => {
  const needBelongTerritory = _.get(selectorFilterExtenderLayout, 'need_belong_territory', false);
  const extenderOption = _.get(selectorFilterExtenderLayout, 'extender_option');
  const { sub_type = 'by_territory' } = extenderOption;
  const dataUrl = subordinate_query.replace(
    '{id}',
    localStorage.getItem('userId'),
  );
  // 普通过滤条件
  const filterCriteriasLayout = _.get(
    selectorFilterExtenderLayout,
    'filter_criterias',
  );
  // 岗位过滤条件
  const filterTerritoryCriteriasLayout = _.get(selectorFilterExtenderLayout, 'filter_territory_criterias');
  const renderType = _.get(
    selectorFilterExtenderLayout,
    'render_type',
    'normal',
  );
  const extenderItemAlias = _.get(
    selectorFilterExtenderLayout,
    'extender_item_alias',
    'suborainate_selector_filter',
  );
  const subordinateSelectorProps = {
    fetch: {
      url: `${dataUrl}?sub_type=${sub_type}`,
      data: {
        orderBy: _.get(filterCriteriasLayout, 'default_sort_by', _.get(filterCriteriasLayout, 'orderBy', 'update_time')),
        order: _.get(filterCriteriasLayout, 'default_sort_order', _.get(filterCriteriasLayout, 'order', 'desc'))
      },
      dataKey: 'result'
    },

    selectorOption: {
      ...extenderOption,
      placeholder: crmIntlUtil.fmtStr(
        _.get(extenderOption, 'placeholder.i18n_key'),
        _.get(extenderOption, 'placeholder'),
      )
    },
    renderType: _.get(selectorFilterExtenderLayout, 'render_type', 'tree')
  };

  /**
   * 监听下拉组件的点击事件
   * @param {Object} value
   */
  const onChange = (nodes) => {
    const userIds = _.map(nodes, (node) => _.get(node, 'id'));
    const territoryIds = _.map(nodes, (node) => _.get(node, 'key'));
    const criterias = assembleCriterias(userIds, filterCriteriasLayout);
    if (needBelongTerritory && !_.isEmpty(territoryIds)) {
      criterias.push({
        field: 'belong_territory',
        operator: 'in',
        value: territoryIds
      })
    }
    const territoryCriterias = assembleCriterias(territoryIds, filterTerritoryCriteriasLayout, true);
    onSelectorFilterExtenderChange(
      _.zipObject([extenderItemAlias], [{
        criterias,
        territoryCriterias
      }]),
    );
  };

  if (renderType === 'tree') {
    return (
      <FcTreeSelector {...subordinateSelectorProps} onChangeSelect={onChange} />
    );
  } else {
    return (
      <FcSelector {...subordinateSelectorProps} onChangeSelect={onChange} />
    );
  }
};

SubordinateSelectorFilter.propTypes = {
  onSelectorFilterExtenderChange: PropTypes.func,
  selectorFilterExtenderLayout: PropTypes.object
};

export default SubordinateSelectorFilter;
