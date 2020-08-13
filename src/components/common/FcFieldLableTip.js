import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Tooltip, Icon } from 'antd';

const FcFieldLableTip = (mergedObjectFieldDescribe, fieldLabel) => {
  const tip = _.get(mergedObjectFieldDescribe, 'tip');
  // 判断tip属性是否存在
  // 判断有没有icon属性，根据antD提供的icon,用户可自选，默认提示图标为exclamation-circle
  // position after before 需求不明确暂未实现
  // <br>支持tip换行配置
  if (tip !== undefined) {
    let hint = _.get(tip, 'hint', '');
    const icon = _.get(tip, 'icon', 'exclamation-circle');
    const position = _.get(tip, 'position', 'after');
    if (_.isObject(hint) && !_.isEmpty(hint)) {
      // *特殊处理绿谷产品定级需求
      // *https://jira.forceclouds.com/browse/CRM-6352
      const formItemApiNameArr = _.split(_.get(mergedObjectFieldDescribe, 'api_name'), '-');
      const productCheckedList = _.get(tip, 'productCheckedList');
      _.map(productCheckedList, (pord) => {
        if (_.includes(formItemApiNameArr, `${_.get(pord, 'id')}`)) {
          const tipHint = _.get(tip, 'hint', '');
          hint = _.get(tipHint, _.get(pord, 'name'), _.get(tip, 'hint.default', ''));
        } else {
          return fieldLabel;
        }
      });
    }
    const hintArr = hint ? hint.split('<br>') : [];

    return (
      <span>
        {fieldLabel}&nbsp;
        <Tooltip
          title={_.map(hintArr, (item, i) => {
            return <div key={i}>{item}</div>;
          })}
        >
          <Icon type={icon} />
        </Tooltip>
      </span>
    );
  } else {
    return fieldLabel;
  }
};

FcFieldLableTip.propTypes = {
  fieldLabel: PropTypes.string,
  mergedObjectFieldDescribe: PropTypes.object,
};

export default FcFieldLableTip;
