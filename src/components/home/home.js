import React, { Component } from 'react';
import { Link } from 'react-router';
import {
  Modal,
  Form,
  Select,
  InputNumber,
  Switch,
  Radio,
  Slider,
  Button,
  Upload,
  Icon,
  Input,
  Tabs,
  Card,
  Row,
  Col,
} from 'antd';
import _ from 'lodash';
import {
  NumberCard,
  Quote,
  Sales,
  Weather,
  RecentSales,
  Comments,
  Completed,
  Browser,
  Cpu,
  User,
} from './components';
import NoticeWidget from './components/widgets/noticeWidget';
import HomeSchedule from './components/schedule/HomeSchedule';
import HomeTodo from './components/todo/HomeTodo';
import styles from './index.less';
import * as recordService from '../../services/object_page/recordService';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';
import { color } from '../../utils';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';

const TabPane = Tabs.TabPane;
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      todoSegmentationList: [],
      todoCoachList: [],
      otherTodoList: [],
      coachType: [],
      myScheduleList: [],
      totType: [],
      loading: true,
    };
  }
  componentWillMount() {
    const userId = localStorage.getItem('userId');
    const subordinateIds = window.fc_getSubordinateIds();
    const subordinateIdsandUserIdArryString = [];
    const allSubordinateIds = window.fc_getSubordinateIds('all');
    const allSubordinates = window.fc_getSubordinates('all');
    const profile = window.fc_getProfile();
    if (window.isJmkx()) {
      _.each(allSubordinates, (subor) => {
        const parent_id = _.get(subor, 'parent_id', undefined);
        if (parent_id && parent_id == userId) {
          if (subor.id) {
            subordinateIdsandUserIdArryString.push(subor.id);
          }
        }
      });
    } else {
      _.map(subordinateIds, (item) => {
        subordinateIdsandUserIdArryString.push(`${item}`);
      });
    }
    // subordinateIdsandUserIdArryString.push(userId);
    // ****************************************************************      mylan      ******************************************* //

    const mylanInitData = [
      /**
       * 日程
       */
      {
        criterias: [
          {
            field: 'status',
            operator: 'in',
            value: ['application_approved', 'hx_approved'],
          },
          {
            field: 'owner',
            operator: '==',
            value: [window.FC_CRM_USERID],
          },
          { field: 'my_time_begin', operator: '>', value: [new Date().setHours(0, 0, 0, 0)] },
          { field: 'my_time_begin', operator: '<', value: [new Date().setHours(24, 0, 0, 0)] },
        ],
        objectApiName: 'my_event',
        orderBy: 'create_time',
        order: 'desc',
        joiner: 'and',
      },
    ];
    let mylanDealData = [
      /**
       * mylan查询的数据--------------------------------
       */
      /**
       * 活动
       */
      {
        approvalCriterias: [
          {
            field: 'candidate_operators',
            value: [parseInt(window.FC_CRM_USERID)],
            operator: 'contains',
          },
          {
            field: 'status',
            value: ['waiting'],
            operator: '==',
          },
          {
            field: 'approval_flow__r.status',
            value: ['in_progress'],
            operator: 'in',
          },
        ],
        criterias: [],
        objectApiName: 'my_event',
        orderBy: 'create_time',
        order: 'desc',
        joiner: 'and',
      },
      /**
       * 讲者
       */
      {
        approvalCriterias: [
          {
            field: 'candidate_operators',
            value: [parseInt(window.FC_CRM_USERID)],
            operator: 'contains',
          },
          {
            field: 'status',
            value: ['waiting'],
            operator: '==',
          },
          {
            field: 'approval_flow__r.status',
            value: ['in_progress'],
            operator: 'in',
          },
        ],
        criterias: [],
        objectApiName: 'customer',
        orderBy: 'create_time',
        order: 'desc',
        joiner: 'and',
      },
      /**
       * 推广资料
       */
      {
        approvalCriterias: [
          {
            field: 'candidate_operators',
            value: [parseInt(window.FC_CRM_USERID)],
            operator: 'contains',
          },
          {
            field: 'status',
            value: ['waiting'],
            operator: '==',
          },
          {
            field: 'approval_flow__r.status',
            value: ['in_progress'],
            operator: 'in',
          },
        ],
        criterias: [],
        objectApiName: 'my_promo_materials',
        orderBy: 'create_time',
        order: 'desc',
        joiner: 'and',
      },
      /**
       * 供应商服务
       */
      {
        approvalCriterias: [
          {
            field: 'candidate_operators',
            value: [parseInt(window.FC_CRM_USERID)],
            operator: 'contains',
          },
          {
            field: 'status',
            value: ['waiting'],
            operator: '==',
          },
          {
            field: 'approval_flow__r.status',
            value: ['in_progress'],
            operator: 'in',
          },
        ],
        criterias: [],
        objectApiName: 'my_vendor_approval',
        orderBy: 'create_time',
        order: 'desc',
        joiner: 'and',
      },
      /**
       * 活动代办，（合同已上传）
       */
      {
        criterias: [
          {
            field: 'status',
            value: ['proc_vendor_chosen'],
            operator: '==',
          },
          {
            field: 'owner',
            value: [window.FC_CRM_USERID],
            operator: '==',
          },
        ],
        objectApiName: 'my_event',
        orderBy: 'create_time',
        order: 'desc',
        joiner: 'and',
      },
      /**
       * 普通待上传--------------------------------
       */
      {
        criterias: [
          { field: 'create_by', value: [`${window.FC_CRM_USERID}`], operator: '==' },
          { field: 'status', value: ['proc_vendor_chosen'], operator: '==' },
        ],
        objectApiName: 'my_vendor_approval',
        orderBy: 'create_time',
        order: 'desc',
        joiner: 'and',
      },
    ];

    if (window.isMylan() && profile.api_name === 'my_procurement_01_profile') {
      const cri = [
        {
          field: 'status',
          operator: 'in',
          value: ['proc_processed'],
        },
      ];
      mylanDealData = [
        {
          criterias: cri,
          objectApiName: 'my_event',
          joiner: 'and',
          pageSize: 100,
          pageNo: 1,
        },
        {
          criterias: cri,
          objectApiName: 'my_vendor_approval',
          joiner: 'and',
          pageSize: 100,
          pageNo: 1,
        },
      ];
    } else if (window.isMylan() && profile.api_name === 'my_procurement_02_profile') {
      const cri = [
        {
          field: 'status',
          operator: 'in',
          value: ['proc_inquiry_sent', 'proc_price_compare'],
        },
      ];
      mylanDealData = [
        {
          criterias: cri,
          objectApiName: 'my_event',
          joiner: 'and',
          pageSize: 100,
          pageNo: 1,
        },
        {
          criterias: cri,
          objectApiName: 'my_vendor_approval',
          joiner: 'and',
          pageSize: 100,
          pageNo: 1,
        },
      ];
    } else if (window.isMylan() && profile.api_name === 'my_procurement_03_profile') {
      const cri = [
        {
          field: 'status',
          operator: 'in',
          value: ['proc_director_approval'],
        },
      ];
      mylanDealData = [
        {
          criterias: cri,
          objectApiName: 'my_event',
          joiner: 'and',
          pageSize: 100,
          pageNo: 1,
        },
        {
          criterias: cri,
          objectApiName: 'my_vendor_approval',
          joiner: 'and',
          pageSize: 100,
          pageNo: 1,
        },
      ];
    }

    const luozhenExtBody = [
      {
        objectApiName: 'call',
        criterias: [
          {
            field: 'owner',
            operator: 'in',
            value: [window.FC_CRM_USERID],
          },
          {
            field: 'start_time',
            operator: '>',
            value: [new Date().setHours(0, 0, 0, 0)],
          },
          {
            field: 'start_time',
            operator: '<',
            value: [new Date().setHours(24, 0, 0, 0)],
          },
          {
            field: 'record_type',
            operator: 'in',
            value: ['plan'],
          },
          {
            field: 'status',
            operator: 'in',
            value: ['1', '2'],
          },
        ],
        orderBy: 'start_time',
        order: 'desc',
        joiner: 'and',
      },
      {
        objectApiName: 'call',
        criterias: [
          {
            field: 'owner',
            operator: 'in',
            value: [window.FC_CRM_USERID],
          },
          {
            field: 'real_start_time',
            operator: '>',
            value: [new Date().setHours(0, 0, 0, 0)],
          },
          {
            field: 'real_start_time',
            operator: '<',
            value: [new Date().setHours(24, 0, 0, 0)],
          },
          {
            field: 'record_type',
            operator: 'in',
            value: ['report'],
          },
          {
            field: 'status',
            operator: 'in',
            value: ['1', '2'],
          },
        ],
        orderBy: 'real_start_time',
        order: 'desc',
        joiner: 'and',
      },
      {
        objectApiName: 'call',
        criterias: [
          {
            field: 'owner',
            operator: 'in',
            value: [window.FC_CRM_USERID],
          },
          {
            field: 'real_start_time',
            operator: '>',
            value: [new Date().setHours(0, 0, 0, 0)],
          },
          {
            field: 'real_start_time',
            operator: '<',
            value: [new Date().setHours(24, 0, 0, 0)],
          },
          {
            field: 'record_type',
            operator: 'in',
            value: ['coach'],
          },
          {
            field: 'status',
            operator: 'in',
            value: ['1', '2'],
          },
        ],
        orderBy: 'real_start_time',
        order: 'desc',
        joiner: 'and',
      },
    ];

    const jmkxExtBody = [
      {
        objectApiName: 'call_plan',
        criterias: [
          {
            field: 'owner',
            operator: 'in',
            value: subordinateIdsandUserIdArryString,
          },
          {
            field: 'status',
            operator: 'in',
            value: ['待审批'],
          },
        ],
        orderBy: 'start_date',
        order: 'desc',
        joiner: 'and',
      },
      {
        objectApiName: 'time_off_territory',
        criterias: [
          {
            field: 'owner',
            operator: 'in',
            value: subordinateIdsandUserIdArryString,
          },
          {
            field: 'status',
            operator: 'in',
            value: [1],
          },
        ],
        orderBy: 'start_date',
        order: 'desc',
        joiner: 'and',
      },
      {
        objectApiName: 'dcr',
        criterias: [
          {
            field: 'owner',
            operator: 'in',
            value: subordinateIdsandUserIdArryString,
          },
          {
            field: 'mgr_status',
            value: ['0'],
            operator: 'in',
          },
        ],
        orderBy: 'create_time',
        order: 'desc',
        joiner: 'and',
      },
    ];

    const straumannExtBody = [
      {
        objectApiName: 'call',
        criterias: [
          {
            field: 'call_date',
            operator: '>',
            value: [new Date().getTime()],
          },
          {
            field: 'status',
            operator: 'in',
            value: ['草稿'],
          },
        ],
        orderBy: 'call_date',
        order: 'desc',
        joiner: 'and',
      },
      {
        objectApiName: 'event',
        criterias: [
          {
            field: 'plan_start_time',
            operator: '>',
            value: [new Date().getTime()],
          },
          {
            field: 'event_status',
            operator: 'in',
            value: ['计划中', '执行中'],
          },
        ],
        orderBy: 'plan_start_time',
        order: 'desc',
        joiner: 'and',
      },
      {
        objectApiName: 'call',
        criterias: [
          {
            field: 'call_date',
            operator: '>',
            value: [new Date().setHours(0, 0, 0, 0)],
          },
          {
            field: 'call_date',
            operator: '<',
            value: [new Date().setHours(24, 0, 0, 0)],
          },
          {
            field: 'status',
            operator: 'in',
            value: ['草稿'],
          },
        ],
        orderBy: 'call_date',
        order: 'desc',
        joiner: 'and',
      },
      {
        objectApiName: 'event',
        criterias: [
          {
            field: 'plan_start_time',
            operator: '>',
            value: [new Date().setHours(0, 0, 0, 0)],
          },
          {
            field: 'plan_start_time',
            operator: '<',
            value: [new Date().setHours(24, 0, 0, 0)],
          },
          {
            field: 'event_status',
            operator: 'in',
            value: ['计划中', '执行中'],
          },
        ],
        orderBy: 'plan_start_time',
        order: 'desc',
        joiner: 'and',
      },
    ];

    let dealData = [
      {
        criterias: [
          {
            field: 'owner',
            operator: 'in',
            value: [`${userId}`], // isJmkx ? allSubordinateIds :
          },
          { field: 'status', operator: '==', value: [1] },
        ],
        objectApiName: 'coach_feedback',
        joiner: 'and',
      },
      {
        criterias: [
          { field: 'approver', operator: '==', value: [`${userId}`] },
          { field: 'status', operator: '==', value: [0] },
        ],
        objectApiName: 'segmentation_history',
        joiner: 'and',
      },
      {
        objectApiName: 'event',
        criterias: [
          {
            field: 'owner',
            operator: 'in',
            value: window.isJmkx()
              ? allSubordinateIds
              : window.isLuozhen()
              ? [`${userId}`]
              : subordinateIdsandUserIdArryString,
          },
          { field: 'status', operator: '==', value: [1] },
          { field: 'start_time', operator: '>', value: [new Date().setHours(0, 0, 0, 0)] },
          { field: 'start_time', operator: '<', value: [new Date().setHours(24, 0, 0, 0)] },
        ],
        orderBy: 'start_time',
        order: 'desc',
        joiner: 'and',
      },
      {
        objectApiName: 'call',
        criterias: [
          {
            field: 'owner',
            operator: 'in',
            value: window.isJmkx()
              ? allSubordinateIds
              : window.isLuozhen()
              ? [`${userId}`]
              : subordinateIdsandUserIdArryString,
          },
          { field: 'status', operator: 'in', value: window.isLuozhen() ? [1, 2] : [1, 2, 3] },
          { field: 'start_time', operator: '>', value: [new Date().setHours(0, 0, 0, 0)] },
          { field: 'start_time', operator: '<', value: [new Date().setHours(24, 0, 0, 0)] },
        ],
        orderBy: 'start_time',
        order: 'desc',
        joiner: 'and',
      },
      {
        objectApiName: 'time_off_territory',
        criterias: [
          {
            field: 'owner',
            operator: 'in',
            value: window.isJmkx()
              ? allSubordinateIds
              : window.isLuozhen()
              ? [`${userId}`]
              : subordinateIdsandUserIdArryString,
          },
          { field: 'start_date', operator: '>', value: [new Date().setHours(0, 0, 0, 0)] },
          { field: 'start_date', operator: '<', value: [new Date().setHours(24, 0, 0, 0)] },
          { field: 'status', operator: 'in', value: window.isLuozhen() ? [1] : [0, 1] },
        ],
        orderBy: 'start_date',
        order: 'desc',
        joiner: 'and',
      },
    ];
    /**
     * 判断当前是否是mylan项目
     */
    if (window.isMylan()) {
      dealData = [...dealData, ...mylanInitData, ...mylanDealData];
    }
    if (window.isJmkx()) {
      let is_have = false;
      dealData[3].criterias.forEach((cri, index) => {
        if (cri && cri.field === 'status') {
          is_have = true;
          cri.value = ['计划中', '已完成'];
        }
      });
      if (!is_have) {
        dealData[3].criterias.push({
          field: 'status',
          operator: 'in',
          value: ['计划中', '已完成'],
        });
      }
      dealData = [...dealData, ...jmkxExtBody];
    }
    if (window.isLuozhen()) {
      dealData = [...dealData, ...luozhenExtBody];
    }

    if (window.isStraumann()) {
      dealData = [...dealData, ...straumannExtBody];
    }

    consoleUtil.log('isMylan', window.isMylan());
    consoleUtil.log('isLuozhen', window.isLuozhen());
    consoleUtil.log('isStraumann', window.isStraumann());
    const record = Promise.resolve(recordService.MutipleQueryRecordList({ dealData }));
    const coachDescribeOptions = Promise.resolve(
      fieldDescribeService.storeObject({ object_api_name: 'coach_feedback' }),
    );
    const totDescribe = Promise.resolve(
      fieldDescribeService.storeObject({ object_api_name: 'time_off_territory' }),
    );
    Promise.all([record, coachDescribeOptions, totDescribe]).then(
      ([record, coachDescribeOptions, totDescribe]) => {
        const result = _.get(record, 'batch_result', []);

        if (!_.isEmpty(coachDescribeOptions && totDescribe)) {
          const { batch_result: result } = record;
          const { fields: coachOptions } = coachDescribeOptions;
          const { fields: totOptions } = totDescribe;
          const coachList = _.get(result, '[0].result');
          const segmentationList = _.get(result, '[1].result');
          const eventResult = _.get(result, '[2].result');
          const callResult = _.get(result, '[3].result');
          const totResult = _.get(result, '[4].result');
          let otherTodoList = [];
          const scheduleList = [];
          let myScheduleList = _.concat(scheduleList, eventResult, callResult, totResult);
          if (window.isMylan()) {
            otherTodoList = _.chain(result)
              .slice(6, 12)
              .map((v) => v.result)
              .flatten()
              .value();
            myScheduleList = _.concat(myScheduleList, _.get(result, '[5].result'));
          }
          if (window.isJmkx()) {
            const callPlans = _.get(result, '[5].result', []);
            const tots = _.get(result, '[6].result', []);
            const dcrs = _.get(result, '[7].result', []);
            otherTodoList = _.concat(coachList, tots, dcrs);
          }
          if (window.isLuozhen()) {
            const callPlanResult = _.get(result, '[5].result', []);
            const callReportResult = _.get(result, '[6].result', []);
            const callCoachResult = _.get(result, '[7].result', []);
            myScheduleList = _.concat(
              eventResult,
              totResult,
              callPlanResult,
              callReportResult,
              callCoachResult,
            );
            otherTodoList = _.concat(coachList, segmentationList);
          }

          const coachTypes = _.get(
            _.filter(coachOptions, { api_name: 'record_type' }),
            '[0].options',
          );
          const totTypes = _.get(_.filter(totOptions, { api_name: 'type' }), '[0].options');
          consoleUtil.log('dasdadadasa:', myScheduleList);
          if (!_.isEmpty(result)) {
            this.setState({
              todoCoachList: coachList,
              todoSegmentationList: segmentationList,
              otherTodoList,
              myScheduleList,
              coachType: coachTypes,
              totType: totTypes,
              loading: false,
            });
          } else {
            this.setState({
              loading: false,
            });
          }
        } else if (!_.isEmpty(result) && window.isStraumann()) {
          const todoCall = _.get(result, '[5].result', []);
          const todoevent = _.get(result, '[6].result', []);
          const scheduleCall = _.get(result, '[7].result', []);
          const scheduleEvent = _.get(result, '[8].result', []);
          const myScheduleList = _.concat(scheduleCall, scheduleEvent);
          const otherTodoList = _.concat(todoCall, todoevent);
          this.setState({
            otherTodoList,
            myScheduleList,
            loading: false,
          });
        } else {
          this.setState({
            loading: false,
          });
        }
      },
    );
  }

  render() {
    const { kpi_result } = this.props;
    const {
      todoCoachList,
      todoSegmentationList,
      coachType,
      myScheduleList,
      totType,
      loading,
      otherTodoList,
    } = this.state;
    const numberCards = kpi_result.map((item, key) => (
      <Col key={key} lg={6} md={12}>
        <NumberCard
          {...item}
          done_number={_.toNumber(item.numerator)}
          number={_.toNumber(item.denominator)}
          icon={_.get(item, 'icon', 'fa-male')}
          color={color.orange}
        />
      </Col>
    ));

    return (
      <div style={{ margin: '-16px -30px 0' }}>
        <Row gutter={24} className={styles.card_home}>
          {window.isHr() ? (
            ''
          ) : (
            <Col span={8}>
              <HomeTodo
                todoCoachList={window.isJmkx() ? [] : todoCoachList}
                todoSegmentationList={window.isJmkx() ? [] : todoSegmentationList}
                otherTodoList={otherTodoList}
                coachType={coachType}
                loading={loading}
                location={this.props.location}
              />
            </Col>
          )}
          {window.isHr() ? (
            ''
          ) : (
            <Col span={8}>
              <HomeSchedule
                myScheduleList={myScheduleList}
                totType={totType}
                loading={loading}
                location={this.props.location}
              />
            </Col>
          )}
          <Col span={8}>
            <NoticeWidget />
          </Col>
        </Row>
        {window.fc_hasFunctionPrivilege('query_kpi') && (
          <Card title={crmIntlUtil.fmtStr('tab.my_kpi')} bordered={false}>
            <Row gutter={24} className="bg_white">
              {!_.isEmpty(numberCards) && numberCards}
              {_.isEmpty(numberCards) && (
                <h2 style={{ textAlign: 'center' }}>{crmIntlUtil.fmtStr('message.no_data')}</h2>
              )}
            </Row>
          </Card>
        )}
      </div>
    );
  }
}

export default Home;
