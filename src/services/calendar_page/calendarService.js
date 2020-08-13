import moment from 'moment'
import _ from 'lodash'
import config from '../../utils/config';
import { request } from '../../utils';
import * as customAction from '../../services/customAction'
import { BRANCH_TYPE_SELECTED, BRANCH_TYPE_TIME, BRANCH_CALL_PLAN_APINAME,
  BRANCH_CALL_PLAN_ACTION } from '../../components/calendar_page/branchCreateComponent'

const { api } = config;
const { calendar_setting } = api;

export function loadCalendarLayout(payload){
  return request({
    url: calendar_setting,
    data: payload.params,
  })
}

export function branchCreateCallPlanService(data) {
  const payload = {
    objectApiName: BRANCH_CALL_PLAN_APINAME,
    action: BRANCH_CALL_PLAN_ACTION,
    ids: _.get(data, BRANCH_TYPE_SELECTED, []),
    params: {
      selectDay: _.get(data, BRANCH_TYPE_TIME, moment()).valueOf()
    }
  }
  return customAction.executeAction(payload)
}
