/**
 * 日历
 * @flow
 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import {
  Calendar,
  Alert,
  Popover,
  Button,
  Row,
  Col,
  Form,
  message,
  Modal,
  Dropdown,
  Menu,
} from 'antd';
import moment from 'moment';
import { Link, routerRedux, hashHistory, browserHistory } from 'dva/router';
import $ from 'jquery';
import 'fullcalendar/dist/fullcalendar.css';
import 'fullcalendar/dist/fullcalendar.js';
import * as recordService from '../../services/object_page/recordService';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';
import { layer, Spinner } from '../../components';
import RecordFormDetailItem from '../DataRecord/RecordFormDetailItem';
import RecordFormItem from '../DataRecord/RecordFormItem';
import styles from './index.less';
import { renderCell } from '../DataRecord/RecordTableHelper';
import * as CallBackUtil from '../../utils/callBackUtil';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { callAnotherFunc } from '../../utils';
import * as callTemplateService from '../../services/callTemplateService';
import PopupRecordSelector from '../../components/DataRecord/PopupRecordSelector';
import * as layoutService from '../../services/object_page/layoutService';
import { getExpression } from '../../utils/expressionUtils';
import consoleUtil from '../../utils/consoleUtil';
import { filterCalendarItems } from './helper';

// import 'moment/locale/zh-cn';
// import 'moment/locale/en';
// moment.locale('en');
// moment.locale('zh-cn');

const FormItem = Form.Item;
const { confirm } = Modal;
const REAL_START_TIME = 'real_start_time';

/**
 * 拜访模板的视图类型
 */
const call_template_agendas = {
  week: 'agendaWeek',
  day: 'agendaDay',
};

/**
 * 根据record_type类型，决定哪种拜访模板可以显示
 * @param {string} record_type
 */
const deteminedWhichCallTemplateShow = (record_type, revert = true) => {
  const showDay = () => {
    $('.fc-call_template-button').css({
      display: 'none',
    });
    $('.fc-call_template_day-button').css({
      display: 'inherit',
    });
    $('.fc-call_template_day-button').click();
  };
  const showMonth = () => {
    $('.fc-call_template_day-button').css({
      display: 'none',
    });
    $('.fc-call_template-button').css({
      display: 'inherit',
    });
    $('.fc-call_template-button').click();
  };

  if (revert) {
    if (record_type === 'week') {
      showDay();
    } else if (record_type === 'day') {
      showMonth();
    }
  } else if (record_type === 'week') {
    showMonth();
  } else if (record_type === 'day') {
    showDay();
  }
};

const convertToTime = (time) => {
  return time.valueOf();
};

/**
 * 一周跨度
 */
const convertToWeekEnd = (time) => {
  return plusDayForTime(time, 7);
};

/**
 * 一天跨度
 */
const convertToDayEnd = (time) => {
  return plusDayForTime(time, 1);
};

/**
 * 对给定的时间进行增加或减除
 */
const plusDayForTime = (time, day) => {
  return time + day * 24 * 60 * 60 * 1000 - 1000;
};

/**
 * 计算时间
 * @param {开始时间戳} start
 * @param {时间} time
 * @param {哪一天} day
 */
const caculateTimePlusDay = (start, time, day) => {
  day = _.isUndefined(day) || _.isNull(day) ? 0 : day;
  return convertToTime(start) + parseInt(day, 0) * 24 * 60 * 60 * 1000 + time;
};

/**
 * 对event进行修改
 */
const decorateDate = ($calendar) => {
  // eslint-disable-next-line
  const currentView = $(calendar).fullCalendar('getView');
  const { start } = currentView;
  return (event) => {
    const {
      dataRecord: { day, start_time, end_time },
    } = event;
    return Object.assign({}, event, {
      start: caculateTimePlusDay(start, start_time, day),
      end: caculateTimePlusDay(start, end_time, day),
    });
  };
};

/**
 * make a custom button
 */
const craftACustomButton = ({ icon = '', css = {} }) => {
  const $icon = $('<button type="button"></button>');
  $icon.addClass(`fc-button fc-state-default ${icon}`);
  $icon
    .hover(() => {
      $icon.toggleClass('fc-state-hover');
    })
    .on('mousedown', () => {
      $icon.addClass('fc-state-down');
    })
    .on('mouseup', () => {
      $icon.removeClass('fc-state-down');
    })
    .css(
      Object.assign(
        {},
        {
          borderRadius: '5px',
          marginRight: '10px',
        },
        css,
      ),
    );
  return $icon;
};

/**
 * 创建表单项
 */
const craftPopupFormFields = ({
  popupFields = [],
  refObjectApiName,
  form,
  formItemValueChange = () => {},
}) => {
  return _.map(popupFields, (popupField) => {
    const { field, is_required } = popupField;
    const fieldDescribe = fieldDescribeService.loadObjectFieldDescribe({
      object_api_name: refObjectApiName,
      field_api_name: field,
    });
    const popupFieldLabel = _.get(fieldDescribe, 'label');
    const key = `${refObjectApiName}_${popupFieldLabel}`;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    };
    _.set(fieldDescribe, 'is_required', is_required);
    const recordFormItemProps = {
      objectApiName: refObjectApiName,
      fieldItem: fieldDescribe,
      renderFieldItem: popupField,
      formItemLayout,
      form,
      formItemValueChange,
    };

    return <RecordFormItem {...recordFormItemProps} key={key} />;
  });
};

/**
 * call_template 新建表单
 */
const craftCallTemplateAddForm = ({
  popupFields = [],
  refObjectApiName,
  formItemValueChange = () => {},
}) => {
  return ({ form }) => {
    const formItems = craftPopupFormFields({
      popupFields,
      refObjectApiName,
      form,
      formItemValueChange,
    });
    return <Form>{formItems}</Form>;
  };
};

/**
 * 复制模板操作
 */
const copyCallTemplate = async ({ start, end, id }) => {
  /**
   * 复制模板信息
   */
  const copyResp = await callTemplateService.copy({
    id,
    start_time: start,
    end_time: end,
    zoneOffset: moment().utcOffset() * 60 * 1000,
  });
  if (copyResp) {
    if (copyResp.status === 200) {
      message.success(copyResp.message);
    } else {
      /**
       * 复制模板失败，将新创建的模板删除
       */
      recordService.deleteRecord({
        object_api_name: 'call_template',
        // eslint-disable-next-line
        id: resp.id,
      });
    }
  }
};

/**
 * 获取模板查询布局
 */
const fetchCallTemplateLookupPage = async (recordType = 'week') => {
  return await layoutService.loadLayout({
    object_api_name: 'call_template',
    layout_type: 'relation_lookup_page',
    query: {
      recordType,
    },
  });
};

/**
 * 获取模板查询布局(week)
 */
const fetchCallTemplateWeekLookupPage = async () => {
  return await fetchCallTemplateLookupPage('week');
};

/**
 * 获取模板查询布局(day)
 */
const fetchCallTemplateDayLookupPage = async () => {
  return await fetchCallTemplateLookupPage('day');
};

/**
 * 复制拜访计划、记录到现有的模板中
 */
const copyCallTemplateToExistOne = async function copyCallTemplateToExistOne({ view }) {
  let { start } = view;
  /**
   * 在中国，start是从早八点开始的
   */
  start = convertToTime(start) - moment().utcOffset() * 60 * 1000;
  const end = this.getEndTime(start);

  let id = null;
  const isWeekUseCallTemplate = this.isWeekUseCallTemplate();
  /**
   * 查找布局
   */
  let lookupLayout;
  if (isWeekUseCallTemplate) {
    lookupLayout = await fetchCallTemplateWeekLookupPage();
  } else {
    lookupLayout = await fetchCallTemplateDayLookupPage();
  }

  layer.open({
    width: 900,
    title: '',
    content: (
      <PopupRecordSelector
        objectApiName="call_template"
        recordType={isWeekUseCallTemplate ? 'week' : 'day'}
        layout={lookupLayout}
        defaultFilterCriterias={[]}
        multipleSelect={false}
        onRowSelect={(values, records) => {
          id = _.first(values);
        }}
      />
    ),
    onOk: async () => {
      confirm({
        title: crmIntlUtil.fmtStr('pad.call_template_certain_copy'),
        onOk() {
          copyExistEnd(start, end, id);
        },
        onCancel() {
          // consoleUtil.log('Cancel');
        },
      });
    },
  });
};

const copyExistEnd = async (start, end, id) => {
  layer.closeAll();
  consoleUtil.log(start, end, id);
  await copyCallTemplate({
    start,
    end,
    id,
  });
};

/**
 * 应用模板
 */
const applyCallTemplte = async function applyCallTemplte({ view, calendar }) {
  let { start } = view;
  /**
   * 在中国，start是从早八点开始的
   */
  start = convertToTime(start) - moment().utcOffset() * 60 * 1000;
  const end = this.getEndTime(start);
  const now = moment().valueOf();
  if (now >= start) {
    if (this.isWeekUseCallTemplate()) {
      message.warning(
        crmIntlUtil.fmtStr('expression.call_template.must_be_applyed_to_feature_week'),
      );
    } else if (this.isDayUseCallTemplate()) {
      message.warning(
        crmIntlUtil.fmtStr('expression.call_template.must_be_applyed_to_feature_day'),
      );
    }
    return;
  }

  let id = null;

  const defaultFilterCriteria = {};
  const isWeekUseCallTemplate = this.isWeekUseCallTemplate();

  let lookupLayout;
  if (isWeekUseCallTemplate) {
    lookupLayout = await fetchCallTemplateWeekLookupPage();
  } else {
    lookupLayout = await fetchCallTemplateDayLookupPage();
  }

  layer.open({
    width: 900,
    title: '',
    content: (
      <PopupRecordSelector
        objectApiName="call_template"
        recordType={isWeekUseCallTemplate ? 'week' : 'day'}
        layout={lookupLayout}
        defaultFilterCriterias={[]}
        multipleSelect={false}
        onRowSelect={(values, records) => {
          id = _.first(values);
        }}
      />
    ),
    onOk: async () => {
      confirm({
        title: crmIntlUtil.fmtStr('pad.call_template_certain_apply'),
        onOk() {
          applyCallTemplteEnd(id, start, end, calendar);
        },
        onCancel() {
          // consoleUtil.log('Cancel');
        },
      });
    },
  });
};

const applyCallTemplteEnd = async (id, start, end, calendar) => {
  layer.closeAll();

  const resp = await callTemplateService.apply_call_template({
    id,
    start_time: start,
    end_time: end,
  });
  if (resp) {
    if (resp.status === 200) {
      message.success(resp.message);

      calendar.buildEvents();
    }
  }
};

/**
 * 复制拜访计划、记录到新的模板中
 */
const copyCallTemplateToNewOne = async function copyCallTemplateToNewOne({ view }) {
  let { start } = view;
  /**
   * 在中国，start是从早八点开始的
   */
  start = convertToTime(start) - moment().utcOffset() * 60 * 1000;
  const end = this.getEndTime(start);
  const isWeekUseCallTemplate = this.isWeekUseCallTemplate();
  let data = {};
  /**
   * 创建一个拜访模板表单
   */
  const AddForm = Form.create({
    onValuesChange: (props, values) => {
      data = Object.assign({}, values, {
        record_type: isWeekUseCallTemplate ? 'week' : 'day',
      });
    },
  })(
    craftCallTemplateAddForm({
      popupFields: [
        {
          field: 'name',
          is_required: true,
        },
      ],
      refObjectApiName: 'call_template',
    }),
  );

  /**
   * 新建一个拜访模板
   */
  const submit = async () => {
    const resp = await recordService.create({
      object_api_name: 'call_template',
      dealData: data,
    });
    if (resp) {
      const { status } = resp;
      if (status === 200) {
        layer.closeAll();
        await copyCallTemplate({
          start,
          end,
          id: resp.id,
        });
      } else {
        message.error(resp.message);
      }
    }
  };
  /**
   * 打开表单窗口
   */
  layer.open({
    title: '新建拜访模板',
    width: 400,
    content: <AddForm />,
    footer: [
      <Button
        size="large"
        onClick={() => {
          layer.closeAll();
        }}
      >
        {crmIntlUtil.fmtStr('action.cancel')}
      </Button>,
      <Button type="primary" size="large" onClick={submit}>
        {crmIntlUtil.fmtStr('action.ok')}
      </Button>,
    ],
  });
};

/**
 * 获取拜访模板
 * @param {string} record_id
 */
const fetchCallTemplate = async (record_id) => {
  const response = await recordService.loadRecord({
    object_api_name: 'call_template',
    record_id,
  });
  return response;
};

/**
 * 移除自定义按钮
 */
const removeCustomButtons = () => {
  $('.icon-content-duplicate').remove();
  $('.icon-copy').remove();
};

class FcCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storeOptions: {},
      currentDate: moment(),
      visible: false,
      selectorExtenderFilterCriterias: [],

      /**
       * 当前拜访模板
       */
      call_template: null,
    };

    /**
     * TODO 由于日历数据的请求与模板的数据请求是同步的，因此此处模板参数置为-1
     */
    this.state.selectorExtenderFilterCriterias.call_template_selector_filter = ['-1'];
  }

  componentDidMount = () => {
    this.applyCalendarOptions();
    this.buildEvents();
  };

  applyCalendarOptions = () => {
    const { calendar } = this.refs;
    const calendarOption = this.calendarOption();
    $(calendar).fullCalendar(calendarOption);
  };

  componentWillReceiveProps = (nextProps) => {
    if (
      !_.isEqual(
        nextProps.selectorExtenderFilterCriterias,
        this.props.selectorExtenderFilterCriterias,
      ) ||
      nextProps.calendarUpdateStatus !== this.props.calendarUpdateStatus
    ) {
      this.setState(
        {
          selectorExtenderFilterCriterias: nextProps.selectorExtenderFilterCriterias,
        },
        () => {
          this.buildEvents();
        },
      );
    } else if (!_.isEqual(nextProps.seriesStatus, this.props.seriesStatus)) {
      this.rebuildCalendar(nextProps.seriesStatus);
    }
  };

  componentWillUnmount = () => {
    this.destroy();
  };

  destroy = () => {
    const { calendar } = this.refs;
    $(calendar).fullCalendar('destroy');
  };

  getCallTemplateRecordType = () => {
    const { call_template } = this.state;
    return _.get(call_template, 'record_type');
  };

  getEndTime = (start) => {
    return this.isWeekUseCallTemplate() ? convertToWeekEnd(start) : convertToDayEnd(start);
  };

  isWeekUseCallTemplate = () => {
    return this.getCurrentViewName() === 'agendaWeek';
  };

  isDayUseCallTemplate = () => {
    return this.getCurrentViewName() === 'agendaDay';
  };

  dealCritiria = (critirias = []) => {
    const critiriasTemp = [];

    _.forEach(critirias, (critiria) => {
      const fieldType = _.get(critiria, 'field_type');
      let defaultValue = _.get(critiria, 'default_value');
      // 后台支持之后，需要对该代码进行移除start
      if (!_.isEmpty(defaultValue)) {
        defaultValue = _.map(defaultValue, (value) => {
          // 针对特定的值，进行替换
          if (_.eq(value, '$$CurrentUserId$$')) {
            const userId = localStorage.getItem('userId');
            return userId;
          } else {
            return value;
          }
        });
      }

      // 后台支持之后，需要对该代码进行移除end
      switch (fieldType) {
        case 'js': {
          const { field, operator, value } = critiria;
          const resultVal = callAnotherFunc(new Function('t', {}), value);
          _.set(critiria, 'value', resultVal);
          critiriasTemp.push({
            field,
            operator,
            value: resultVal,
          });
          break;
        }
        case 'selector_filter_extender': {
          const { field, operator, value } = critiria;
          const { selectorExtenderFilterCriterias } = this.state;
          const selectorExtenderFilterCriteriaData = _.get(selectorExtenderFilterCriterias, value);

          if (!_.isEmpty(selectorExtenderFilterCriteriaData)) {
            critiriasTemp.push({
              field,
              operator,
              value: [...selectorExtenderFilterCriteriaData],
            });
          } else if (!_.isEmpty(defaultValue)) {
            critiriasTemp.push({
              field,
              operator,
              value: defaultValue,
            });
          }
          break;
        }
        default: {
          critiriasTemp.push(critiria);
          break;
        }
      }
    });
    return critiriasTemp;
  };

  buildAllCalendarProps = () => {
    const { calendarLayout } = this.props;
    const startMonth = moment(this.state.currentDate)
      .subtract(1, 'months')
      .startOf('month')
      .valueOf(); // .format('YYYY-MM-DD HH:mm:ss');
    const endMonth = moment(this.state.currentDate)
      .endOf('month')
      .valueOf(); // .format('YYYY-MM-DD HH:mm:ss');

    let { calendar_items = [] } = calendarLayout;
    calendar_items = _.cloneDeep(calendar_items);

    /**
     * 解析自定义模板
     */
    const views = _.get(calendarLayout, 'views', []);
    if (views) {
      views.forEach((view) => {
        /**
         * 解析自定义模板中的数据定义
         */
        _.get(view, 'calendar_items', []).forEach((item) => {
          calendar_items.push(
            Object.assign({}, item, {
              view: view.name,
            }),
          );
        });
      });
    }
    calendar_items = filterCalendarItems(calendar_items);
    const allCalendarEventProps = _.map(calendar_items, (calendarItem) => {
      const legends = calendarItem.legend;
      const startField = _.get(calendarItem, 'start_field'); // start
      const endField = _.get(calendarItem, 'end_field'); // end
      const itemContent = _.get(calendarItem, 'item_content'); // title
      const refObjectApiName = calendarItem.ref_object;
      const popupFields = calendarItem.popup.fields;
      const popupActions = calendarItem.popup.actions;
      // build object field for popup
      let legendCustomeEventProps = _.map(legends, (legend) => {
        const critiria = this.dealCritiria(legend.critiria);
        const recordType = legend.record_type;

        const color = legend.color;
        const backgroundColor = legend.bg_color;
        const borderColor = legend.border_color;
        const textColor = legend.text_color;

        const monthCriterias = [];
        const recordTypeCriterias = [];

        if (!fc_hasObjectPrivilege(refObjectApiName, 5)) {
          consoleUtil.warn('[权限不足]：', refObjectApiName, '列表数据');
          return false;
        }

        if (!_.isEmpty(startField)) {
          monthCriterias.push({
            field: `${startField}`,
            operator: '>',
            value: [startMonth],
          });
        }

        if (!_.isEmpty(recordType)) {
          recordTypeCriterias.push({
            field: 'record_type',
            operator: 'in',
            value: [recordType],
          });
        }

        const dataDeal = {
          joiner: 'and',
          criterias: [...critiria, ...recordTypeCriterias, ...monthCriterias],
          pageSize: 10000,
          objectApiName: refObjectApiName,
        };
        const legendlabel = crmIntlUtil.fmtStr(
          _.get(legend, 'label.i18n_key'),
          _.get(legend, 'label'),
        );
        const calendarProps = {
          refObjectApiName,
          popupFields,
          popupActions,
          dealData: dataDeal,
          label: legendlabel,
          itemContent,
          startField,
          endField,
          color,
          textColor,
          backgroundColor,
          borderColor,
          id: legend.id,
        };
        (async () => {
          if (refObjectApiName === 'call_template_detail') {
            const record_id = _.chain(dataDeal)
              .result('criterias')
              .find({
                field: 'parent_id',
              })
              .get('value[0]')
              .value();
            if (record_id !== '-1') {
              const new_call_template = await fetchCallTemplate(record_id);
              const { call_template } = this.state;
              this.setState(
                {
                  call_template: new_call_template,
                },
                () => {
                  const record_type = _.get(call_template, 'record_type');
                  const new_record_type = _.get(new_call_template, 'record_type');
                  if (record_type !== new_record_type) {
                    this.applyCalendarOptions();
                    /**
                     * 切换拜访模板自定义按钮的显示状态
                     */
                    deteminedWhichCallTemplateShow(record_type);
                    if (_.isUndefined(record_type)) {
                      deteminedWhichCallTemplateShow(new_record_type, false);
                    }
                  }
                },
              );
            } else {
              $('.fc-call_template_day-button').css({
                display: 'none',
              });
            }
          }
        })();
        return calendarProps;
      });
      legendCustomeEventProps = _.remove(legendCustomeEventProps, (calendarProps) => {
        return calendarProps;
      });
      return legendCustomeEventProps;
    });

    return allCalendarEventProps;
  };

  /**
   * 判断当前视图是否是自定义视图
   */
  checkIsCustomView = () => {
    const name = this.getCurrentViewName();
    const {
      calendarLayout: { views },
    } = this.props;
    const isCustomView =
      _.findIndex(views, {
        name,
      }) !== -1;
    return isCustomView;
  };
  /**
   * 检查自定义按钮在自定义的视图上是否可用
   */
  checkDisabledCustomButton = (viewName, btn) => {
    const {
      calendarLayout: { views },
    } = this.props;
    const view = _.find(views, {
      name: viewName,
    });
    if (view) {
      const { disabledCustomButtons = [] } = view;
      if (_.indexOf(disabledCustomButtons, btn) !== -1) {
        return false;
      } else {
        return true;
      }
    }
    return true;
  };
  getCurrentViewName = () => {
    const { calendar } = this.refs;
    const currentView = $(calendar).fullCalendar('getView');
    return currentView.name;
  };

  rebuildCalendar = (seriesStatus) => {
    const { calendar } = this.refs;
    const { events = [] } = this;
    const __seriesStatus = seriesStatus || this.props.seriesStatus;
    $(calendar).fullCalendar('removeEventSources');
    const currentView = $(calendar).fullCalendar('getView');
    /**
     * 判断当前视图是否是自定义视图
     */
    const isCustomView = this.checkIsCustomView();
    if (isCustomView) {
      /**
       * 只显示当前自定义视图中的内容
       */
      $(calendar).fullCalendar(
        'addEventSource',
        _.chain(events)
          .filter((event) => {
            return _.get(event, '__view__') === currentView.name;
          })
          .map(decorateDate($(calendar)))
          .value(),
      );
    } else {
      $(calendar).fullCalendar(
        'addEventSource',
        events.filter((event) => __seriesStatus[event.calendarEventProp.id]),
      );
    }
  };

  buildLegendAndViewRelation = () => {
    const { calendarLayout } = this.props;
    let { calendar_items } = calendarLayout;
    calendar_items = _.cloneDeep(calendar_items);
    /**
     * 解析自定义模板
     */
    const views = _.get(calendarLayout, 'views', []);
    if (views) {
      views.forEach((view) => {
        /**
         * 解析自定义模板中的数据定义
         */
        _.get(view, 'calendar_items', []).forEach((item) => {
          calendar_items.push(
            Object.assign({}, item, {
              view: view.name,
            }),
          );
        });
      });
    }
    const relation = {};
    let count = 0;
    calendar_items = filterCalendarItems(calendar_items);
    calendar_items.forEach((item) => {
      _.get(item, 'legend', []).forEach((legend) => {
        relation[count] = item.view;
        count++;
      });
    });
    return relation;
  };

  buildEvents = () => {
    this.props.changeLoading(true);
    const { calendar } = this.refs;
    const legendAndViewRelations = this.buildLegendAndViewRelation();
    // consoleUtil.log('getEventSource',$(calendar).fullCalendar('getEventSource'));
    // $(calendar).fullCalendar('removeEventSources');
    // consoleUtil.log('buildEvents buildEvents');
    const events = [];
    const promise = Promise.resolve(this.buildAllCalendarProps())
      .then((allCalendarEventProps) => {
        const allCalendarEventPropsList = [];
        const dealDataList = [];
        _.forEach(allCalendarEventProps, (calendarEventProps) => {
          _.forEach(calendarEventProps, (calendarEventProp) => {
            if (calendarEventProp) {
              dealDataList.push(calendarEventProp.dealData);
              allCalendarEventPropsList.push(calendarEventProp);
            }
          });
        });
        const recordPromiseList = Promise.resolve(
          recordService.MutipleQueryRecordList({ dealData: dealDataList }).then((data) => {
            return _.set(data, 'allCalendarEventPropsList', allCalendarEventPropsList);
          }),
        );
        return recordPromiseList;
      })
      .then((recordPromiseList) => {
        const batchResultList = recordPromiseList.batch_result;
        const allCalendarEventPropsList = recordPromiseList.allCalendarEventPropsList;
        // consoleUtil.log('batchResult',batchResultList)
        // consoleUtil.log('allCalendarEventPropsList',allCalendarEventPropsList)
        // consoleUtil.time('build record time');
        const events = [];
        _.forEach(batchResultList, (batchResult, index) => {
          const calendarEventProp = allCalendarEventPropsList[index];
          const {
            refObjectApiName,
            itemContent,
            startField,
            endField,
            color,
            textColor,
            backgroundColor,
            borderColor,
          } = calendarEventProp;
          const view = legendAndViewRelations[index];
          const results = _.get(batchResult, 'result', []);
          // consoleUtil.time(`build record event ${refObjectApiName}`);
          _.forEach(results, (record) => {
            const itemContentTemp = this.buildCalendarTitle(itemContent, record, refObjectApiName); // 非常耗时间
            const compiled = _.template(itemContentTemp); // 此处需要获取相应的itemContent
            const title = compiled(record);

            const id = _.get(record, 'id');
            const event = {
              id,
              title,
              dataRecord: record,
              calendarEventProp,
            };
            if (!_.isEmpty(startField)) {
              // https://jira.forceclouds.com/browse/CRM-3613

              // *为保证罗诊租户不受影响做了租户判断兼容
              // https://jira.forceclouds.com/browse/CRM-6334
              let start = moment(_.get(record, startField)).format('YYYY-MM-DD HH:mm');
              if (window.isLuozhen()) {
                start = moment(_.get(record, REAL_START_TIME) || _.get(record, startField)).format(
                  'YYYY-MM-DD HH:mm',
                );
              }
              _.set(event, 'start', start);
            }
            if (!_.isEmpty(endField)) {
              const end = moment(_.get(record, endField)).format('YYYY-MM-DD HH:mm');
              _.set(event, 'end', end);
            }
            if (!_.isEmpty(color)) {
              _.set(event, 'color', color);
            }
            if (!_.isEmpty(backgroundColor)) {
              _.set(event, 'backgroundColor', backgroundColor);
            }
            if (!_.isEmpty(borderColor)) {
              _.set(event, 'borderColor', borderColor);
            }
            if (!_.isEmpty(textColor)) {
              _.set(event, 'textColor', textColor);
            }
            if (!_.isEmpty(view)) {
              _.set(event, '__view__', view);
            }
            events.push(event);
          });

          this.events = events;
          this.rebuildCalendar();
          this.props.changeLoading(false);
        });
      });
  };

  buildCalendarTitle = (itemContentTemplate, record, refObjectApiName) => {
    const itemContentArray = itemContentTemplate.match(/\{\{(.+?)\}\}/g);

    // 处理options
    if (!_.isEmpty(itemContentArray)) {
      for (const itemContent of itemContentArray) {
        const itemContentField = itemContent.replace('{{', '').replace('}}', '');
        if (itemContentField.indexOf('__r.') >= 0 || _.indexOf(['name'], itemContentField) >= 0) {
          continue;
        }

        const recordText = _.get(record, itemContentField);
        const storeOptionsKey = `${refObjectApiName}_${itemContentField}_${recordText}`;

        const { storeOptions } = this.state;

        let storeOptionsVal = _.get(storeOptions, storeOptionsKey);
        if (!_.isEmpty(storeOptionsVal)) {
          itemContentTemplate = _.replace(
            itemContentTemplate,
            `\{\{${itemContentField}\}\}`,
            storeOptionsVal,
          );
        } else {
          const fieldDescribe = fieldDescribeService.loadObjectFieldDescribe({
            object_api_name: refObjectApiName,
            field_api_name: itemContentField,
          });
          if (
            _.isEmpty(fieldDescribe) ||
            _.indexOf(['select_one', 'select_many'], fieldDescribe.type) < 0
          ) {
            continue;
          }
          if (!_.isEqual(fieldDescribe.type, 'text')) {
            _.set(fieldDescribe, 'is_link', false);
          }

          const cell = renderCell(recordText, record, 0, fieldDescribe, refObjectApiName);
          const text = _.get(cell, 'props.children', '');
          // consoleUtil.log('itemContentWord', recordText,itemContentField, text)
          itemContentTemplate = _.replace(itemContentTemplate, `\{\{${itemContentField}\}\}`, text);
          storeOptionsVal = text;

          if (!_.isEmpty(_.get(fieldDescribe, 'options'))) {
            _.set(storeOptions, storeOptionsKey, storeOptionsVal);
            this.setState({ storeOptions }, () => {
              // consoleUtil.log('storeOptions',this.state.storeOptions)
            });
          }
        }
      }
    }

    return itemContentTemplate;
  };

  calendarOption = () => {
    const initialLocaleCode = crmIntlUtil.getCRM_INTL_TYPE();
    const { defaultView, location, calendarLayout } = this.props;
    const { views = [] } = calendarLayout;
    const calendarViews = {
      basic: {
        // options apply to basicWeek and basicDay views
      },
      month: {
        // options apply to basicWeek and basicDay views
        // titleFormat: 'YYYY-MM',
        buttonText: crmIntlUtil.fmtStr('month view'),
      },
      week: {
        // options apply to basicWeek and agendaWeek views
        // titleFormat: 'YYYY-MM  DD',
        // duration: { days: 7 },
        // type: 'week',
        buttonText: crmIntlUtil.fmtStr('week view'),
      },
      day: {
        // options apply to basicDay and agendaDay views
        // type: 'day',
        buttonText: crmIntlUtil.fmtStr('day view'),
      },
    };
    const viewButtons = `${_.join(
      views.map((view) => view.name),
      ',',
    ).replace(/,$/, '')}`;

    const customButtons = {
      myCustomButton: {
        text: '自定义按钮',
        click() {
          const view = $('#calendar').fullCalendar('getView');
          alert(`The view's title is ${view.title}`);
          $('#calendar').fullCalendar('changeView', 'agendaDay', {
            start: '2017-06-01',
            end: '2017-06-08',
          });
          alert('clicked the custom button!');
        },
      },
      preButton: {
        text: 'pre',
        icon: 'left-single-arrow',
        type: 'pre',
        click: () => {
          if (this.checkDisabledCustomButton(this.getCurrentViewName(), 'pre')) {
            const view = $('#calendar').fullCalendar('getView');
            $('#calendar').fullCalendar('prev');

            if (
              !_.eq(
                moment(view.start).format('YYYY-MM'),
                moment(this.state.currentDate).format('YYYY-MM'),
              )
            ) {
              this.setState({ currentDate: moment(view.start) });
              this.buildEvents();
            }
          }
        },
      },
      nextButton: {
        text: 'next',
        icon: 'right-single-arrow',
        type: 'next',
        click: () => {
          if (this.checkDisabledCustomButton(this.getCurrentViewName(), 'next')) {
            const view = $('#calendar').fullCalendar('getView');
            $('#calendar').fullCalendar('next');
            if (
              !_.eq(
                moment(view.start).format('YYYY-MM'),
                moment(this.state.currentDate).format('YYYY-MM'),
              )
            ) {
              this.setState({ currentDate: moment(view.start) });
              this.buildEvents();
            }
          }
        },
      },
    };

    /**
     * 解析自定义视图
     */
    const calendarCustomViewMeta = {};
    const { call_template } = this.state;
    if (!_.isEmpty(views)) {
      views.forEach((view) => {
        const { options = {}, name } = view;
        const hiddenFun = getExpression(view, 'hidden_expression');
        const hiddenValidResult = callAnotherFunc(new Function('t', hiddenFun), {}); // 判断是否隐藏编辑按钮，默认不隐藏，当满足隐藏条件的时候会隐藏按钮
        if (!hiddenValidResult) {
          calendarViews[name] = Object.assign(
            {},
            view.options,
            {
              buttonText: crmIntlUtil.fmtStr(_.get(view.options, 'buttonText')),
            },
            call_template
              ? {
                  type: call_template_agendas[_.get(call_template, 'record_type')],
                }
              : {},
          );
          calendarCustomViewMeta[name] = view;
        }
      });
      /**
       * 根据自定义视图生成自定义按钮
       */
      _.forOwn(calendarViews, (options, key) => {
        customButtons[key] = {
          text: options.buttonText,
          click: (event) => {
            /**
             * 注意，这里一定要主动的切换视图，否则，rebuildCalendar不会被调用，各个view之间的数据显示会出现混淆
             */

            const $calendar = $('#calendar');
            $calendar.fullCalendar('changeView', key);
          },
          x: 1,
        };
      });
    }

    const calendarOption = {
      viewRender: (view, element) => {
        this.rebuildCalendar();
        /**
         * 预先清除自定义按钮
         */
        removeCustomButtons();
        const call_template_detail_obj_api_name = 'call_template_detail';
        const name = view.name;
        const isCustomView = this.checkIsCustomView();
        if (isCustomView) {
          /**
           * 如果是日模板，则修改header样式
           */
          if (name === 'call_template_day') {
            $('.fc-day-header span').html('');
            $('.fc-day-header').css({
              textAlign: 'right',
              paddingRight: 10,
            });
          }

          /**
           * header上添加自定义按钮
           */
          $('.fc-day-header').each((index, header) => {
            /**
             * 修改表头内容
             */
            $(header)
              .find('a')
              .html(moment($(header).data('date')).format('ddd'));

            /**
             * 当前星期
             */
            const day = index;
            /**
             * 判断是否有添加权限
             */
            if (fc_hasObjectPrivilege(call_template_detail_obj_api_name, 1)) {
              const $cell = $(
                `<i class="anticon anticon-plus-circle-o ${name}__add ${styles['icon-header-add']}" data-day="${day}"></i>`,
              );
              $cell.on('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const day = $cell.data('day');
                const { selectorExtenderFilterCriterias } = this.state;

                /**
                 * 跳转到添加页面
                 */
                const call_template_id = _.get(
                  selectorExtenderFilterCriterias,
                  'call_template_selector_filter.[0]',
                );
                if (call_template_id && call_template_id !== '-1') {
                  CallBackUtil.dealNeedCallBack({
                    location,
                  });
                  const call_template_record_type = this.getCallTemplateRecordType();
                  hashHistory.push({
                    pathname: `object_page/call_template_detail/add_page?recordType=master&parent_id=${call_template_id}&day=${day}&call_template_record_type=${call_template_record_type ||
                      ''}`,
                  });
                } else {
                  message.warn(
                    crmIntlUtil.fmtStr(
                      'confirm_message.call_template.call_template_must_be_select_one',
                    ),
                  );
                }
              });
              $(header).append($cell);
            }

            /**
             * 判断是否有删除权限
             */
            if (fc_hasObjectPrivilege(call_template_detail_obj_api_name, 4)) {
              const $cell = $(
                `<i class="anticon anticon-close-circle-o ${name}__delete ${styles['icon-header-delete']}" data-day="${day}"></i>`,
              );
              $cell.on('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                /**
                 * 根据视图和天、星期过滤要删除的数据
                 */
                const events = this.events.filter((event) => {
                  if (_.isEqual(name, 'call_template_day')) {
                    return event.__view__ === name;
                  } else if (_.isEqual(name, 'call_template')) {
                    return event.__view__ === name && `${event.dataRecord.day}` === `${day}`;
                  }
                });

                consoleUtil.log('即将删除的拜访模板明细:', events);

                if (events.length > 0) {
                  confirm({
                    title: crmIntlUtil.fmtStr('confirm_message.call_template.delete'),
                    onOk: async () => {
                      /**
                       * 删除模板明细
                       */
                      const resp = await recordService.batchDeleteRecord({
                        object_api_name: _.chain(events)
                          .first()
                          .get('dataRecord.object_describe_name')
                          .value(),
                        recordIds: events.map((event) => event.id),
                      });
                      if (resp) {
                        if (resp.status === 200) {
                          message.success(resp.message);
                          this.buildEvents();
                        }
                      }
                    },
                    onCancel() {
                      // consoleUtil.log('Cancel');
                    },
                  });
                }
              });
              $(header).append($cell);
            }
          });

          element.find('.fc-week-number').html('');
        } else if (name === 'agendaWeek' || name === 'agendaDay') {
          const $iconGroup = $('.fc-header-toolbar .fc-right .fc-button-group').get(0).firstChild;

          /**
           * 应用模板权限检查
           */
          // eslint-disable-next-line
          if (fc_hasFunctionPrivilege('apply_call_template')) {
            const $applyIcon = craftACustomButton({
              icon: 'iconfont icon-content-duplicate',
            }).on('click', () => {
              applyCallTemplte.call(this, { view, calendar: this });
            });

            $applyIcon.insertBefore($iconGroup);
          }

          /**
           * 复制模板权限检查
           */
          // eslint-disable-next-line
          if (fc_hasFunctionPrivilege('copy_call_template')) {
            const $duplicateIcon = craftACustomButton({
              icon: 'iconfont icon-copy',
            });

            $duplicateIcon.insertBefore($iconGroup);

            /**
             * 模板复制下拉操作
             */
            ReactDOM.render(
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item>
                      <a
                        onClick={() => {
                          copyCallTemplateToExistOne.call(this, { view });
                        }}
                        rel="noopener noreferrer"
                      >
                        {crmIntlUtil.fmtStr('action.call_template.copy.exist', '复制到已有模板')}
                      </a>
                    </Menu.Item>
                    <Menu.Item>
                      <a
                        onClick={() => {
                          copyCallTemplateToNewOne.call(this, { view });
                        }}
                        rel="noopener noreferrer"
                      >
                        {crmIntlUtil.fmtStr('action.call_template.copy.new', '复制到新的模板')}
                      </a>
                    </Menu.Item>
                  </Menu>
                }
                placement="bottomLeft"
              >
                <div className={styles.transparent_full} />
              </Dropdown>,
              $duplicateIcon.get(0),
            );
          }
        }

        const $calendar = $('#calendar');
        const $pre = $calendar.find('button.fc-preButton-button');
        const $next = $calendar.find('button.fc-nextButton-button');

        if ($pre) {
          if (!this.checkDisabledCustomButton(name, 'pre')) {
            $pre.css({
              display: 'none',
            });
          } else {
            $pre.css({
              display: 'block',
            });
          }
        }
        if ($next) {
          if (!this.checkDisabledCustomButton(name, 'next')) {
            $next.css({
              display: 'none',
            });
          } else {
            $next.css({
              display: 'block',
            });
          }
        }
        if (isCustomView) {
          /**
           * 切换到自定义视图时，显示自定义的title
           */
          const $title = $calendar.find('.fc-header-toolbar .fc-left h2');
          $title.html(_.get(calendarCustomViewMeta, `${name}.title.text`, ''));
        }

        const { onViewChange } = this.props;
        if (_.isFunction(onViewChange)) {
          onViewChange(view);
        }
      },
      customButtons,
      views: calendarViews,
      header: {
        left: 'title',
        center: '',
        right: `month,agendaWeek,agendaDay,${viewButtons} preButton,nextButton`,
      },
      firstDay: 0,
      footer: {},
      height() {
        // consoleUtil.log('屏幕高度', $(document).height(), $(document).height() - 150);
        const h = $(document).height() - 150;
        return h;
      },
      showNonCurrentDates: false,
      businessHours: [
        // specify an array instead
        {
          dow: [1, 2, 3, 4, 5], // Monday, Tuesday, Wednesday， Thursday, Friday
          start: '08:00', // 8am
          end: '18:00', // 6pm
        },
        {
          dow: [6, 0], //
          start: '10:00', // 10am
          end: '16:00', // 4pm
        },
      ],
      // hiddenDays: [ 1, 3, 5 ], // hide Mondays, Wednesdays, and Fridays
      locale: initialLocaleCode,
      // defaultDate: '2017-05-12',
      buttonIcons: false, // show the prev/next text
      weekNumbers: true,
      navLinks: true, // can click day/week names to navigate views
      editable: false,
      eventLimit: true, // allow "more" link when too many events
      defaultView,
      timeFormat: _.get(calendarLayout, 'timeFormat', 'h(:mm)t'), // uppercase H for 24-hour clock
      // events: this.state.events,
      selectable: true,
      select: (startDate, endDate) => {
        const view = $('#calendar').fullCalendar('getView');
        const viewType = _.get(view, 'type');
        const { selectDate } = this.props;
        if (_.isFunction(selectDate)) {
          selectDate(startDate, endDate, viewType);
        }
      },
      unselect: (a, s, d, f) => {
        const { unSelectDate } = this.props;
        if (_.isFunction(unSelectDate)) {
          unSelectDate();
        }
      },
      eventRender: (event, element) => {
        const isCustomView = this.checkIsCustomView();
        const curretViewName = this.getCurrentViewName();

        if (isCustomView && _.get(event, '__view__') === curretViewName) {
          const refObjectApiName = _.get(event, 'dataRecord.object_describe_name');
          if (fc_hasObjectPrivilege(refObjectApiName, 4)) {
            const $icon = $('<i></i>');
            $icon.addClass('anticon anticon-close-circle-o');
            $icon.css({
              fontSize: '12px',
              position: 'absolute',
              right: 0,
            });
            $icon.on('click', (e) => {
              e.preventDefault();
              e.stopPropagation();

              confirm({
                title: crmIntlUtil.fmtStr('confirm_message.call_template_detail.delete'),
                onOk: async () => {
                  const resp = await recordService.deleteRecord({
                    object_api_name: refObjectApiName,
                    id: _.get(event, 'dataRecord.id'),
                  });
                  if (resp) {
                    if (resp.status === 200) {
                      message.success(resp.message);
                      this.buildEvents();
                    }
                  }
                },
                onCancel() {
                  // consoleUtil.log('Cancel');
                },
              });
            });
            const $content = element.find('.fc-content');
            $content.css({
              display: 'flex',
              alignItems: 'center',
            });
            $content.append($icon);
          } else {
            consoleUtil.warn('[权限不足]：', refObjectApiName, '删除操作');
          }
        }
      },
      eventClick: (calEvent, jsEvent, view) => {
        // consoleUtil.log('eventClick',calEvent)
        const { dataRecord, calendarEventProp } = calEvent;
        const { refObjectApiName, popupFields } = calendarEventProp;
        let { popupActions = [] } = calendarEventProp;

        const eventHtmls = _.map(popupFields, (popupField) => {
          const fieldDescribe = fieldDescribeService.loadObjectFieldDescribe({
            object_api_name: refObjectApiName,
            field_api_name: popupField.field,
          });
          const popupFieldLabel = _.get(fieldDescribe, 'label');
          const key = `${refObjectApiName}_${popupFieldLabel}`;
          const eventFormItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
          };
          _.set(fieldDescribe, 'is_required', false);
          const recordFormItemProps = {
            objectApiName: refObjectApiName,
            fieldItem: fieldDescribe,
            // recordType,
            dataItem: dataRecord,
            renderFieldItem: popupField,
            formItemLayout: eventFormItemLayout,
          };
          /**
           * 当前字段是否显示
           */
          const hiddenFun = getExpression(popupField, 'hidden_expression');
          const hiddenValidResult = callAnotherFunc(new Function('t', hiddenFun), dataRecord);
          return hiddenValidResult ? null : (
            <RecordFormDetailItem {...recordFormItemProps} key={key} />
          );
        });

        if (popupActions.length > 0) {
          popupActions = popupActions.map((action) => {
            const type = _.toUpper(action.action);
            if (type === 'DELETE') {
              /**
               * 删除按钮
               */
              if (fc_hasObjectPrivilege(refObjectApiName, 4)) {
                return (
                  <Button
                    key="delete"
                    size="large"
                    onClick={(e) => {
                      confirm({
                        title: crmIntlUtil.fmtStr('confirm_message.call_template_detail.delete'),
                        onOk: async () => {
                          const resp = await recordService.deleteRecord({
                            object_api_name: refObjectApiName,
                            id: _.get(dataRecord, 'id'),
                          });
                          if (resp) {
                            if (resp.status === 200) {
                              message.success(resp.message);
                              hideModelHandler();
                              this.buildEvents();
                            }
                          }
                        },
                        onCancel() {
                          // consoleUtil.log('Cancel');
                        },
                      });
                    }}
                  >
                    {crmIntlUtil.fmtStr(action.i18n_key, action.label)}
                  </Button>
                );
              } else {
                return null;
              }
            } else if (type === 'EDIT') {
              /**
               * 编辑按钮
               */
              if (fc_hasObjectPrivilege(refObjectApiName, 2)) {
                return (
                  <Button
                    key="submit"
                    type="primary"
                    size="large"
                    onClick={(e) => okHandler(dataRecord, calendarEventProp, 'edit_page')}
                  >
                    {crmIntlUtil.fmtStr(action.i18n_key, action.label)}
                  </Button>
                );
              } else {
                return null;
              }
            }
          });
        } else {
          popupActions = [
            <Button key="back" size="large" onClick={(e) => hideModelHandler(e)}>
              {crmIntlUtil.fmtStr('action.close')}
            </Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              onClick={(e) => okHandler(dataRecord, calendarEventProp, 'detail_page')}
            >
              {crmIntlUtil.fmtStr('action.more')}
            </Button>,
          ];
        }

        const layoutId = layer.open({
          title: `${calEvent.title}（${calendarEventProp.label}）`,
          width: 800,
          content: (
            <Form key={calEvent.title} className={styles.calendar_blk}>
              {eventHtmls}
            </Form>
          ),
          footer: popupActions,
        });

        const hideModelHandler = () => {
          layer.closeAll();
        };

        const okHandler = (dataRecord, calendarEventProp, pageType) => {
          layer.closeAll();

          CallBackUtil.dealNeedCallBack({
            location,
          });
          const recordType = calendarEventProp.record_type || dataRecord.record_type;
          // layer.closeAll();
          let pageUrl = 'object_page/:object_api_name/:record_id/:page_type'
            .replace(':object_api_name', refObjectApiName)
            .replace(':record_id', calEvent.id)
            .replace(':page_type', pageType);
          if (recordType) pageUrl += `?recordType=${recordType}`;
          consoleUtil.log(pageUrl);
          hashHistory.push(pageUrl);
          // var win = window.open(pageUrl, '_blank');
          // win.focus();
        };
      },

      eventMouseover(calEvent, jsEvent, view) {
        // consoleUtil.log('eventMouseout',calEvent)
        // alert('Event: ' + calEvent.title);
        // alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
        // alert('View: ' + view.name);
        // change the border color just for fun
        // $(this).css('border-color', 'red');
      },
      eventMouseout(calEvent, jsEvent, view) {
        // consoleUtil.log('eventMouseout',calEvent)
        // alert('Event: ' + calEvent.title);
        // alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
        // alert('View: ' + view.name);
        // change the border color just for fun
        // $(this).css('border-color', 'red');
      },
    };

    return calendarOption;
  };

  render() {
    return (
      <Row gutter={24} type="flex" justify="space-between" align="top">
        <Col span={24}>
          <div ref="calendar" id="calendar" />
        </Col>
      </Row>
    );
  }
}

export default FcCalendar;
