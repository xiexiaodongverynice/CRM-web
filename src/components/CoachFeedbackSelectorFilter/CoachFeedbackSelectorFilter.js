/**
 * Created by wans on 2017/10/1 0001.
 * 辅导下属下拉过滤选择器
 */

/* "selector_filter_extender" : {
    "show_filter" : true,
    "extender_item" : "SubordinateSelectorFilter",
    "render_type" : "tree",
    "extender_option" : {
      "disabled" : false,
      "showSearch" : true,
      "placeholder" : "选择一个下属"
    },
  "filter_criterias" :
    {
      "field" : "create_by",
      "operator" : "=="
    }
}, */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import FcTreeSelector from '../FcTreeSelector';
import FcSelector from '../FcSelector';
import config from '../../utils/config';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { assembleCriterias } from '../common/criterias';

const { api } = config;
const { tutorial_query } = api;

const CoachFeedbackSelectorFilter = ({
  onSelectorFilterExtenderChange,
  selectorFilterExtenderLayout,
}) => {
  const dataUrl = tutorial_query.replace('{id}', localStorage.getItem('userId'));
  const filterCriteriasLayout = _.get(selectorFilterExtenderLayout, 'filter_criterias');
  const renderType = _.get(selectorFilterExtenderLayout, 'render_type', 'normal');
  const extenderItemAlias = _.get(selectorFilterExtenderLayout, 'extender_item_alias', 'coach_feedback_selector_filter');
  const extenderOption = _.get(selectorFilterExtenderLayout, 'extender_option');
  const subordinateSelectorProps = {
    fetch: {
      url: dataUrl,
      data: {
        orderBy: _.get(filterCriteriasLayout, 'default_sort_by', _.get(filterCriteriasLayout, 'orderBy', 'update_time')),
        order: _.get(filterCriteriasLayout, 'default_sort_order', _.get(filterCriteriasLayout, 'order', 'desc')),
      },
      dataKey: 'result',
    },

    selectorOption: {
      ...extenderOption,
      placeholder: crmIntlUtil.fmtStr(_.get(extenderOption, 'placeholder.i18n_key'), _.get(extenderOption, 'placeholder')),
    },
    renderType: _.get(selectorFilterExtenderLayout, 'render_type', 'tree'),
  };

  const onChange = (nodes) => {
    const userIds = _.map(nodes, node => _.get(node, 'value'));
    const criterias = assembleCriterias(userIds, filterCriteriasLayout);
    onSelectorFilterExtenderChange(_.zipObject([extenderItemAlias], [{
      criterias
    }]));
    // onSelectorFilterExtenderChange({suborainate_selector_filter:criterias});
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

CoachFeedbackSelectorFilter.propTypes = {
  onSelectorFilterExtenderChange: PropTypes.func,
  selectorFilterExtenderLayout: PropTypes.object,
};
export default CoachFeedbackSelectorFilter;
