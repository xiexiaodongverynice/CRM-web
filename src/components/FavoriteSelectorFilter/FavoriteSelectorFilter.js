/**
 * Created by wans on 2017/10/1 0001.
 * 下属下拉过滤选择器
 */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Checkbox } from 'antd';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';

const FavoriteSelectorFilter = ({
  onSelectorFilterExtenderChange,
  selectorFilterExtenderLayout,
}) => {
  const filterCriteriasLayout = _.get(selectorFilterExtenderLayout, 'filter_criterias');
  const renderType = _.get(selectorFilterExtenderLayout, 'render_type', 'check_box');
  const extenderItemAlias = _.get(selectorFilterExtenderLayout, 'extender_item_alias', 'favorite_selector_filter');

  const onChange = (e) => {
    consoleUtil.log(`checked = ${e.target.checked}`);

    const criterias = [];
    if (e.target.checked) {
      criterias.push({
        field: _.get(filterCriteriasLayout, 'field'),
        operator: _.get(filterCriteriasLayout, 'operator', '=='),
        value: [true],
      });
    }
    // onSelectorFilterExtenderChange({suborainate_selector_filter:criterias});
    onSelectorFilterExtenderChange(_.zipObject([extenderItemAlias], [{
      criterias
    }]));
  };

  if (renderType === 'check_box') {
    return (
      <Checkbox onChange={onChange}>{crmIntlUtil.fmtStr('action.view_only_collection', '仅显示收藏')}</Checkbox>
    );
  } else {
    return (
      <Checkbox onChange={onChange}>{crmIntlUtil.fmtStr('action.view_only_collection', '仅显示收藏')}</Checkbox>
    );
  }
};

FavoriteSelectorFilter.propTypes = {
  onSelectorFilterExtenderChange: PropTypes.func,
  selectorFilterExtenderLayout: PropTypes.object,
};
export default FavoriteSelectorFilter;
