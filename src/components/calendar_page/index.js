/* eslint-disable func-names */
import React, { Component } from 'react';
import { Link, routerRedux, hashHistory } from 'dva/router';
import _ from 'lodash';
import { Calendar, Alert, Button, Row, Col, Timeline, Icon, Modal } from 'antd';
import moment from 'moment';
import $ from 'jquery';
import FcCalendar from './FcCalendar';
import * as styles from './index.less';
import { layer, DropOption, Spinner, SelectorFilterExtender } from '../../components/index';
import * as CallBackUtil from '../../utils/callBackUtil';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
// import { SelectorFilterExtender } from '../../components/index';
import { callAnotherFunc } from '../../utils';
import { checkForHiddenDevice } from '../../utils/tools';
import * as message from '../../services/msg';
import {
  checkLegendHiddenWhen,
  checkLegendShowWhen,
  filterCalendarItems,
  branchInitData,
} from './helper';
import {
  branchCreateComponent,
  BRANCH_TYPE_SELECTED,
  BRANCH_TYPE_TIME,
  BRANCH_CALL_PLAN_ACTION,
} from './branchCreateComponent';
import { getExpression } from '../../utils/expressionUtils';
import { branchCreateCallPlanService } from '../../services/calendar_page/calendarService';
import consoleUtil from '../../utils/consoleUtil';
import { pickCriteriasFromSelectorExtender } from '../common/criterias';

class CalendarPageIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectorExtenderFilterCriterias: [],
      seriesStatus: {},
      currentView: null,
      showModal: false, // * 控制modal显示
      modalChildren: null, // * modal渲染的children组件
      modalStates: {}, // * modal层所需要的state
      calendarUpdateStatus: 0, // * 强制更新日历
      selectDateShowModal: false, // * 选择日期弹层
      startDateValueOf: 0, // * 点击日期选择的开始时间戳
      endDateValueOf: 0, // * 点击日期选择的结束时间戳
    };

    this.serieMetas = this.buildCalendarMeta();
    this.serieMetas.forEach((item) => {
      this.state.seriesStatus[item.id] = true;
    });
  }

  componentWillMount = () => {
    // consoleUtil.log('componentWillMount ObjePageIndex');
    // this.setState({events:this.props.eventsRecordList})
  };
  componentDidMount = () => {
    // consoleUtil.log('componentWillMount ObjePageIndex');
  };
  componentWillReceiveProps = () => {
    // this.setState({ pageListItemsData: '正在渲染。' });
  };
  componentWillUpdate = () => {
    // consoleUtil.log('componentWillUpdate ObjePageIndex');
  };
  componentDidUpdate = () => {
    // consoleUtil.log('componentDidUpdate ObjePageIndex');
  };
  componentWillUnmount = () => {
    // consoleUtil.log('componentWillUnmount ObjePageIndex');
  };

  handleMenuClick = (e) => {
    const { location, calendarLayout } = this.props;
    const { startDateValueOf, endDateValueOf } = this.state;
    if (!_.startsWith(e.key, 'isCustom')) {
      CallBackUtil.dealNeedCallBack({
        location,
      });
      const [objectApiName, recordType, actionCode] = _.split(e.key, '#');
      const actionMark = _.get(e, 'actionMark');
      let addUrl = '/object_page/:object_api_name/add_page'.replace(
        ':object_api_name',
        objectApiName,
      );
      if (recordType) addUrl += `?recordType=${recordType}`;
      const currentActionLayout = _.find(_.get(calendarLayout, 'calendar_actions'), {
        action_code: actionMark,
      }); // *当前action布局
      const routerParams = {};
      if ((startDateValueOf && startDateValueOf > 0) || (endDateValueOf && endDateValueOf > 0)) {
        const targetStartTime = _.get(currentActionLayout, 'params.target_start_time');
        const targetEndTime = _.get(currentActionLayout, 'params.target_end_time');
        routerParams[targetStartTime] = startDateValueOf;
        routerParams[targetEndTime] = endDateValueOf;
      }
      hashHistory.push({
        pathname: addUrl,
        state: routerParams,
      });
    } else {
      // * 自定义按钮
      const [, actionCode, layoutType] = _.split(e.key, '#');
      const calendarActions = _.get(calendarLayout, 'calendar_actions');
      const calendarActionLayout = _.find(calendarActions, {
        action: actionCode,
        target_layout_record_type: layoutType,
      });

      if (actionCode === BRANCH_CALL_PLAN_ACTION) {
        this.branchCreateCallPlan(layoutType, calendarActionLayout);
      }
    }
  };

  // * 用于绿谷批量创建拜访计划
  branchCreateCallPlan = async (layoutType, calendarActionLayout) => {
    //* 获取当前时间和relation layout
    const { currentTime, branchCreateCallLayout } = await branchInitData(layoutType);

    //* 更新绿谷批量拜访state
    const _updateCreateState = (type, data) => {
      this.setState((preStates) => {
        const { modalStates } = preStates;
        const resultData = {
          [BRANCH_TYPE_TIME]: _.get(modalStates, BRANCH_TYPE_TIME),
          [BRANCH_TYPE_SELECTED]: _.get(modalStates, BRANCH_TYPE_SELECTED, []),
        };

        if (type === BRANCH_TYPE_TIME) {
          resultData[BRANCH_TYPE_TIME] = data;
        } else {
          resultData[BRANCH_TYPE_SELECTED] = data;
        }

        return { modalStates: resultData };
      });
    };

    //* 获取modal渲染子组件
    const renderChildren = branchCreateComponent({
      currentTime,
      calendarActionLayout,
      branchCreateCallLayout,
      updateState: _updateCreateState,
    });
    this.setState({ modalChildren: renderChildren, showModal: true });
  };

  //* modal确定按钮
  updateValue = () => {
    const { modalStates } = this.state;

    const time = _.get(modalStates, BRANCH_TYPE_TIME);
    const selected = _.get(modalStates, BRANCH_TYPE_SELECTED, []);
    const localCrmpowerSettingJson = localStorage.getItem('crmpower_setting');
    let crmSettingInfo = {};
    if (localCrmpowerSettingJson) {
      crmSettingInfo = JSON.parse(localCrmpowerSettingJson);
    }
    const maxSelectedMark = _.get(crmSettingInfo, 'batch_plan_limit', 0);
    if (!time) {
      message.warn(crmIntlUtil.fmtStr('message.please_select_call_date'));
    } else if (_.isEmpty(selected)) {
      message.warn(crmIntlUtil.fmtStr('message.please_select_call_customer'));
    } else if (selected.length > maxSelectedMark) {
      message.error(
        crmIntlUtil.fmtWithTemplate(
          'message.call_plans_at_a_time',
          '一次最多可批量新建{{maxSelectedMark}}条拜访计划',
          { maxSelectedMark },
        ),
      );
    } else {
      branchCreateCallPlanService(modalStates).then(() => {
        message.info(crmIntlUtil.fmtStr('message.operation_succeeded'));
        this.setState({ calendarUpdateStatus: Date.now() });
      });
      this.closeModal();
    }
  };

  closeModal = () => {
    this.setState({ showModal: false, modalChildren: null, modalStates: {} });
  };

  onSelectorFilterExtenderChange = (values) => {
    this.setState(
      {
        selectorExtenderFilterCriterias: pickCriteriasFromSelectorExtender(values, 'criterias'),
      },
      () => {
        // consoleUtil.warn('selectorExtenderFilterCriterias',values)
      },
    );
  };

  buildSelectorFilterExtender = () => {
    const { calendarLayout } = this.props;
    const { currentView } = this.state;
    let selectorFilterExtender = _.get(calendarLayout, 'selector_filter_extender');
    selectorFilterExtender = _.cloneDeep(selectorFilterExtender);
    /**
     * 解析自定义模板
     */
    const views = _.get(calendarLayout, 'views', []);
    if (views) {
      views.forEach((view) => {
        /**
         * 解析自定义模板中的数据定义
         */
        _.get(view, 'selector_filter_extender', []).forEach((item) => {
          /**
           * 限制查询组件私有显示
           */
          if (currentView === view.name) {
            selectorFilterExtender.push(item);
          }
        });
      });
    }
    if (currentView === 'call_template_day') {
      const weekView = _.find(views, {
        name: 'call_template',
      });
      selectorFilterExtender.push(..._.get(weekView, 'selector_filter_extender'));
    }
    if (_.isEmpty(selectorFilterExtender)) {
      return false;
    }

    const selectorFilterExtenders = _.map(selectorFilterExtender, (extender) => {
      const hiddenFun = getExpression(extender, 'hidden_expression');
      const hiddenValidResult = callAnotherFunc(new Function('t', hiddenFun), {}); // 判断是否隐藏编辑按钮，默认不隐藏，当满足隐藏条件的时候会隐藏按钮
      if (hiddenValidResult) {
        return false;
      }
      const subordinateSelectorProps = {
        onSelectorFilterExtenderChange: this.onSelectorFilterExtenderChange,
        selectorFilterExtenderLayout: extender,
      };
      return (
        <SelectorFilterExtender
          {...subordinateSelectorProps}
          key={_.get(extender, 'extender_item')}
          style={{ padding: '0 10px', marginRight: 8 }}
        />
      );
    });
    // consoleUtil.log('selectorFilterExtenders',selectorFilterExtenders)
    return selectorFilterExtenders;
  };

  changeLoading = (loading = false) => {
    consoleUtil.log('loading', loading);
    // if (loading) $('#loading').show();
    // else $('#loading').hide();
    //
    this.props.dispatch({
      type: 'calendar_page/changeLoading',
      payload: loading,
    });
  };

  buildCalendarMeta = () => {
    const startMonth = moment()
      .startOf('month')
      .valueOf(); // .format('YYYY-MM-DD HH:mm:ss');
    const endMonth = moment()
      .endOf('month')
      .valueOf(); // .format('YYYY-MM-DD HH:mm:ss');

    const { calendarLayout, dispatch } = this.props;
    // consoleUtil.log('buildCalendarLegend',calendarLayout)
    let calendarItems = _.get(calendarLayout, 'calendar_items');
    calendarItems = filterCalendarItems(calendarItems);
    const serieMetas = [];
    _.forEach(calendarItems, (calendarItem, key) => {
      const { legend } = calendarItem;
      const startField = _.get(calendarItem, 'start_field');
      const endField = _.get(calendarItem, 'end_field');
      const refObjectApiName = calendarItem.ref_object;
      _.forEach(legend, (legend, key) => {
        const critiria = legend.critiria;
        const recordType = legend.record_type;
        legend.view = legend.view || calendarItem.view;
        const legendlabel = crmIntlUtil.fmtStr(
          _.get(legend, 'label.i18n_key'),
          _.get(legend, 'label'),
        );

        if (
          fc_hasObjectPrivilege(refObjectApiName, 5) &&
          !checkLegendHiddenWhen(legend) &&
          checkLegendShowWhen(legend)
        ) {
          serieMetas.push(legend);
        } else {
          consoleUtil.warn('[权限不足]：', refObjectApiName, '列表数据');
        }
      });
    });
    return serieMetas;
  };

  toggleCalendarSeries = (id) => {
    const { seriesStatus } = this.state;
    this.setState({
      seriesStatus: Object.assign({}, seriesStatus, {
        [id]: !seriesStatus[id],
      }),
    });
  };

  buildCalendarLegend = () => {
    const serieMetas = this.serieMetas;
    const legendDivs = [];
    serieMetas
      .filter((legend) => {
        return _.isEmpty(legend.view);
      })
      .forEach((legend, key) => {
        const legendlabel = crmIntlUtil.fmtStr(
          _.get(legend, 'label.i18n_key'),
          _.get(legend, 'label'),
        );
        const color = `${_.get(legend, 'color', _.get(legend, 'bg_color'))}`;
        const { id } = legend;
        const isActive = this.state.seriesStatus[id];
        legendDivs.push(
          <div
            style={Object.assign({}, !isActive ? { opacity: 0.5 } : { opacity: 1 })}
            className={styles.legend}
            onClick={this.toggleCalendarSeries.bind(this, id)}
          >
            <div
              key={`legend_bgcolor_${legend.label}_${key}`}
              style={{
                width: 20,
                height: 20,
                backgroundColor: color,
                borderTopLeftRadius: 3,
                borderBottomLeftRadius: 3,
              }}
            />
            <div
              key={`legend_label_${legend.label}_${key}`}
              style={{ marginLeft: 6, marginRight: 6 }}
            >
              {legendlabel}
            </div>
          </div>,
        );
      });
    return legendDivs;
  };

  calendarActionList = () => {
    const { calendarLayout } = this.props;
    let calendarActions = _.get(calendarLayout, 'calendar_actions');
    calendarActions = _.cloneDeep(calendarActions);
    /**
     * 解析自定义模板
     */
    const views = _.get(calendarLayout, 'views', []);
    if (views) {
      views.forEach((view) => {
        /**
         * 解析自定义模板中的数据定义
         */
        _.get(view, 'calendar_actions', []).forEach((item) => {
          calendarActions.push(item);
        });
      });
    }
    let menuOptions = [];

    _.forEach(calendarActions, (calendarAction) => {
      const actionRefObjectApiName = _.get(calendarAction, 'object_describe_api_name');
      const hiddenFun = getExpression(calendarAction, 'hidden_expression');
      const hiddenValidResult = callAnotherFunc(new Function('t', hiddenFun), {}); // 判断是否隐藏编辑按钮，默认不隐藏，当满足隐藏条件的时候会隐藏按钮
      // 判断是否需要在PC上显示
      if (checkForHiddenDevice(calendarAction, 'PC')) return;
      if (hiddenValidResult) {
        consoleUtil.warn('[权限不足]-[hidden_expression]:', actionRefObjectApiName, '新增');
        return;
      }
      const actionOperactionCode = _.toUpper(_.get(calendarAction, 'action'));
      const actionOperactionLabel = _.get(
        calendarAction,
        'label',
        crmIntlUtil.fmtStr(`action.${_.toLower(actionOperactionCode)}`),
      );
      const actionLabel = crmIntlUtil.fmtStr(
        _.get(calendarAction, 'action.i18n_key'),
        actionOperactionLabel,
      );
      const showInCalendar = _.get(calendarAction, 'show_in_calendar', false); // *是否在选择日期弹层按钮中显示
      const actionMark = _.get(calendarAction, 'action_code'); // action标识
      if (fc_hasObjectPrivilege(actionRefObjectApiName, 1)) {
        const key = `${actionRefObjectApiName}#${_.get(
          calendarAction,
          'target_layout_record_type',
        )}#${actionOperactionCode}`;
        const menuOption = {
          key,
          name: actionLabel,
          showInCalendar,
          actionMark,
        };
        menuOptions = menuOptions.concat(menuOption);
      } else if (_.get(calendarAction, 'is_custom')) {
        // TODO 暂时日历自定义按钮只支持绿谷批量创建拜访医生，后续有新的自定义按钮再进行扩展
        const key = `isCustom#${_.get(calendarAction, 'action')}#${_.get(
          calendarAction,
          'target_layout_record_type',
          'hcp',
        )}`;
        const menuOption = {
          key,
          name: actionLabel,
          showInCalendar,
          actionMark,
        };
        menuOptions = menuOptions.concat(menuOption);
      } else {
        consoleUtil.warn('[权限不足]：', actionRefObjectApiName, '新增');
      }
    });
    return menuOptions;
  };

  buildCalendarAction = () => {
    const menuOptions = this.calendarActionList();
    if (!_.isEmpty(menuOptions)) {
      return <DropOption onMenuClick={(e) => this.handleMenuClick(e)} menuOptions={menuOptions} />;
    } else {
      return false;
    }
  };

  /**
   * 日历视图切换回调
   */
  onViewChange = (view) => {
    this.setState({
      currentView: view.name,
    });
  };

  selectDate = (startDate, endDate, viewType) => {
    const menuOptions = this.calendarActionList();
    const menuOptionsArr = _.filter(menuOptions, { showInCalendar: true });
    if (!_.isEmpty(menuOptionsArr)) {
      let startDateValueOf = 0;
      let endDateValueOf = 0;
      if (viewType === 'month') {
        // 月视图
        // *开始时间时间设成当天8点，结束时间是当天18点（2号八点到2号十八点 || 2号八点到5号十八点）
        startDateValueOf = moment(startDate).valueOf();
        endDateValueOf = moment(endDate)
          .subtract(14, 'hours')
          .valueOf();
      } else {
        // 周、日视图 半个小时间隔
        startDateValueOf = moment(startDate)
          .subtract(8, 'hours')
          .valueOf();
        endDateValueOf = moment(endDate)
          .subtract(8, 'hours')
          .valueOf();
      }
      this.setState({
        selectDateShowModal: true,
        startDateValueOf,
        endDateValueOf,
      });
    }
  };

  closeSelectDateModal = () => {
    // *关闭弹层
    this.setState({
      startDateValueOf: 0,
      endDateValueOf: 0,
      selectDateShowModal: false,
    });
  };

  unSelectDate = () => {
    // 取消选择时间
  };

  renderBtnListItems = () => {
    const menuOptions = this.calendarActionList();
    const menuOptionsArr = _.filter(menuOptions, { showInCalendar: true });
    if (!_.isEmpty(menuOptionsArr)) {
      return _.map(menuOptionsArr, (item, index) => {
        return (
          <div className={styles.btn_box}>
            <p className={styles.btn_content} onClick={this.handleMenuClick.bind(this, item)}>
              {item.name}
            </p>
          </div>
        );
      });
    } else {
      return false;
    }
  };

  buildFcCalendar = () => {
    const { calendarLayout, defaultView, loading } = this.props;
    const { calendarUpdateStatus, seriesStatus } = this.state;
    // consoleUtil.log('buildFcCalendar calendarLayout',calendarLayout)
    if (!_.isEmpty(calendarLayout)) {
      const { views = [] } = calendarLayout;
      views.forEach((view) => {
        const viewName = view.name;
        if (view.name === 'call_template') {
          const dayName = `${viewName}_day`;
          const dayView = _.find(views, {
            name: dayName,
          });
          if (!dayView) {
            /**
             * 复制一个拜访模板
             */
            _.set(calendarLayout, 'views', [
              ...views,
              Object.assign({}, _.omit(view, ['selector_filter_extender', 'calendar_actions']), {
                options: Object.assign({}, _.get(view, 'options', {}), {
                  type: 'agendaDay',
                }),
                name: dayName,
              }),
            ]);
          }
        }
      });
      return (
        <FcCalendar
          calendarUpdateStatus={calendarUpdateStatus}
          changeLoading={this.changeLoading}
          calendarLayout={calendarLayout}
          loading={loading}
          defaultView={defaultView}
          dispatch={this.props.dispatch}
          location={this.props.location}
          selectorExtenderFilterCriterias={this.state.selectorExtenderFilterCriterias}
          seriesStatus={seriesStatus}
          onViewChange={this.onViewChange}
          selectDate={this.selectDate}
          unSelectDate={this.unSelectDate}
        />
      );
    }
  };

  render() {
    const { loading } = this.props;
    const { showModal, modalChildren, selectDateShowModal } = this.state;
    return (
      <div className={styles.normal}>
        <Spinner loading={loading} stylesLayout={{ right: '50%', bottom: '50%' }} />
        <div className="k_container bg_white">
          <Row
            gutter={24}
            type="flex"
            justify="space-between"
            align="bottom"
            style={{ marginBottom: 8 }}
          >
            <Col span={24}>{this.buildCalendarLegend()}</Col>
          </Row>
          <Row
            gutter={12}
            type="flex"
            justify="space-between"
            align="bottom"
            style={{ marginBottom: 8 }}
          >
            <Col span={24} style={{ textAlign: 'right' }}>
              {this.buildSelectorFilterExtender()}
              {this.buildCalendarAction()}
            </Col>
          </Row>
          <Row>
            <Col span={24}>{this.buildFcCalendar()}</Col>
          </Row>
        </div>
        <Modal
          key={1}
          visible={showModal}
          width={800}
          style={{ top: 20 }}
          onOk={this.updateValue}
          onCancel={this.closeModal}
        >
          {_.isFunction(modalChildren) ? modalChildren() : <div />}
        </Modal>
        {selectDateShowModal && (
          <Modal
            title={
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '14px', display: 'inline-block', width: '50%' }}>
                  请选择新建内容
                </p>
              </div>
            }
            key={2}
            visible={selectDateShowModal}
            width={300}
            style={{ top: 400 }}
            onCancel={this.closeSelectDateModal}
            footer={null}
          >
            <div>{this.renderBtnListItems()}</div>
          </Modal>
        )}
      </div>
    );
  }
}

export default CalendarPageIndex;
