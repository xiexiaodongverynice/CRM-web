/**
 * Created by wans on 2017/11/15 0001.
 * 过滤选择器
 * @flow
 */

import React from 'react';
import PropTypes from 'prop-types';
import SubordinateSelectorFilter from '../SubordinateSelectorFilter';
import CoachFeedbackSelectorFilter from '../CoachFeedbackSelectorFilter';
import FavoriteSelectorFilter from '../FavoriteSelectorFilter';
import CallTemplateSelectorFilter from '../CallTemplateSelectorFilter';
import consoleUtil from '../../utils/consoleUtil';

const SelectorFilterExtender = ({
  onSelectorFilterExtenderChange,
  selectorFilterExtenderLayout,
}) => {
  const {
    extender_item: extenderItem,
    show_filter: showFilter = true,
  } = selectorFilterExtenderLayout;
  const selectorFilterExtenderProps = {
    onSelectorFilterExtenderChange,
    selectorFilterExtenderLayout,
  };
  if (showFilter) {
    switch (extenderItem) {
      case 'SubordinateSelectorFilter':
        return <SubordinateSelectorFilter {...selectorFilterExtenderProps} />;
        break;
      case 'CoachFeedbackSelectorFilter':
        return <CoachFeedbackSelectorFilter {...selectorFilterExtenderProps} />;
        break;
      case 'FavoriteSelectorFilter':
        return <FavoriteSelectorFilter {...selectorFilterExtenderProps} />;
        break;
      case 'CallTemplateSelectorFilter':
        return <CallTemplateSelectorFilter {...selectorFilterExtenderProps} />;
        break;
      default: {
        consoleUtil.error('[ERROR]暂时支持您的配置项', extenderItem);
        return false;
      }
    }
  } else {
    return false;
  }
};

SelectorFilterExtender.propTypes = {
  onSelectorFilterExtenderChange: PropTypes.func,
  selectorFilterExtenderLayout: PropTypes.object,
};
export default SelectorFilterExtender;
