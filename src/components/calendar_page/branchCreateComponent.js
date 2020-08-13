/**
 * * 绿谷批量创建拜访计划
 */

import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { DatePicker } from 'antd';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import PopupRecordSelector from '../DataRecord/PopupRecordSelector';

const BRANCH_CALL_PLAN_CRITERIAS = [
  {
    field: 'id',
    value: ['$$AreaCustomerIds$$'],
    operator: 'in',
  },
  {
    field: 'is_active',
    value: [true],
    operator: '==',
  },
  {
    field: 'record_type',
    value: ['hcp'],
    operator: '==',
  },
];

export const BRANCH_CALL_PLAN_APINAME = 'customer';
export const BRANCH_TYPE_TIME = 'branch_time';
export const BRANCH_TYPE_SELECTED = 'branch_selected';
export const BRANCH_CALL_PLAN_ACTION = 'batch_create_call_plan';

export const branchCreateComponent = ({
  currentTime,
  calendarActionLayout,
  branchCreateCallLayout,
  updateState,
}) => () => {
  const _disabledDate = (current) => {
    return current && current < moment(currentTime).endOf('day');
  };

  const target_filter_criterias = _.get(calendarActionLayout, 'target_filter_criterias.cirterias');

  const criterias =
    target_filter_criterias && _.isArray(target_filter_criterias)
      ? target_filter_criterias
      : BRANCH_CALL_PLAN_CRITERIAS;

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ marginBottom: '-10px' }}>
        <span>{crmIntlUtil.fmtStr('label.please_first_select_call_date')}： </span>
        <DatePicker
          onChange={(date) => {
            updateState(BRANCH_TYPE_TIME, date);
          }}
          disabledDate={_disabledDate}
        />
      </div>
      <PopupRecordSelector
        objectApiName={BRANCH_CALL_PLAN_APINAME}
        defaultFilterCriterias={criterias}
        layout={branchCreateCallLayout}
        multipleSelect
        onRowSelect={(data) => {
          updateState(BRANCH_TYPE_SELECTED, data);
        }}
      />
    </div>
  );
};
