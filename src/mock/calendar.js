import { color } from '../utils/theme'
const Mock = require('mockjs')
const config = require('../utils/config')
const { apiPrefix } = config


const CalendarLayout = Mock.mock( {
  "calendar_items":
    [
      {
        "ref_object":"call",
        "start_field":"start_time",
        "end_field": "end_time",
        "item_content":"{{name}}-{{customer__r.name}}",
        "popup":{
          "fields":[
            { "field" : "customer" },
            {
              "field" : "parent_customer"
            },
            {
              "field" : "start_time",
              "render_type" : "date_time",
              "date_time_format" : "yyyy-mm-dd HH:mm:ss"
            },
            {
              "field" : "end_time",
              "render_type" : "date_time",
              "date_time_format" : "yyyy-mm-dd HH:mm:ss"
            },
            {
              "field" : "done_time",
              "render_type" : "date_time",
              "date_time_format" : "yyyy-mm-dd HH:mm:ss"
            },
            {
              "field" : "purpose",
              "render_type" : "select_one"
            },
            {
              "field" : "type",
              "render_type" : "select_one"
            },
            {
              "field" : "status",
              "render_type" : "select_one"
            },
            {
              "field" : "channel",
              "render_type" : "select_one"
            }

          ]
        },
        "support_action":{},
        "legend":
          [
            {
              "id":11,
              "label":"拜访计划",
              "bg_color":"#cc00ff",
              "text_color":"#BEBAB9",
              "critiria":[],
              "record_type":"plan",
              "joiner":"and"
            },
            {
              "id":12,
              "label":"拜访记录（新建）",
              "bg_color":"#278AE2",
              "text_color":"#BEBAB9",
              "critiria":[
                {
                  "field": "status",
                  "operator": "==",
                  "value": [
                    0
                  ]
                }
              ],
              "joiner":"and",
              "record_type":"report"
            },
            {
              "id":13,
              "label":"拜访记录（完成）",
              "bg_color":"#1FCB24",
              "text_color":"#BEBAB9",
              "critiria":[
                {
                  "field": "status",
                  "operator": "==",
                  "value": [
                    1
                  ]
                }
              ],
              "joiner":"and",
              "record_type":"report"
            }
          ]
      },
      {
        "ref_object":"coach_feedback",
        "start_field":"coach_date",
        "item_content":"{{employee_name}}",
        "popup":{
          "fields":[
            { "field" : "manager_name" },
            { "field" : "employee_name" },
            { "field" : "type" },
            { "field" : "coach_date" },
            { "field" : "status" }
          ]
        },
        "support_action":{},
        "legend":
          [
            {
              "id":21,
              "label":"辅导记录",
              "bg_color":"#ff3300",
              "text_color":"#BEBAB9",
              "critiria":[],
              // "record_type":"coach",
              "joiner":"and"
            }
          ]
      },
      {
        "ref_object":"event",
        "start_field":"start_time",
        "end_field":"end_time",
        "item_content":"{{event_name}}}",
        "popup":{
          "fields":[
            {
              "field" : "name",
              "render_type" : "link"
            },
            {
              "field" : "location",
              "render_type" : "text"
            },
            {
              "field" : "start_time",
              "render_type" : "date_time",
              "date_time_format" : "yyyy-mm-dd HH:mm:ss"
            },
            {
              "field" : "end_time",
              "render_type" : "date_time",
              "date_time_format" : "yyyy-mm-dd HH:mm:ss"
            },
            {
              "field" : "status",
              "render_type" : "select_one"
            }
          ]
        },
        "support_action":{},
        "legend":
          [
            {
              "id":31,
              "label":"活动记录（已完成）",
              "bg_color":"#FF00FF",
              "text_color":"#BEBAB9",
              "critiria":[
                {
                  "field": "status",
                  "operator": "==",
                  "value": [
                    1
                  ]
                }
              ],
              "record_type":"event",
              "joiner":"and"
            }
          ]
      },
      {
        "ref_object":"time_off_territory",
        "start_field":"start_date",
        "end_field":"endtype_date",
        "item_content":"{{reason}}",
        "popup":{
          "fields":[
            { "field" : "user_info" },
            { "field" : "territory" },
            { "field" : "reason" },
            {
              "field" : "start_date",
              "render_type" : "date_time",
              "date_time_format" : "yyyy-mm-dd HH:mm:ss"
            },
            {
              "field" : "end_date",
              "render_type" : "date_time",
              "date_time_format" : "yyyy-mm-dd HH:mm:ss"
            },
            { "field" : "status" },
            { "field" : "remark" }
          ]
        },
        "support_action":{},
        "legend":
          [
            {
              "id":41,
              "label":"TOT",
              "bg_color":"#b5b5b5",
              "text_color":"#BEBAB9",
              "critiria":[
                {
                  "field": "status",
                  "operator": "==",
                  "value": [
                    1
                  ]
                }
              ],
              "record_type":"tot",
              "joiner":"and"
            }
          ]
      }
    ],
  "calendar_actions":[
    {
      "label" : "新建拜访计划",
      "action" : "ADD",
      "object_describe_api_name" : "call",
      "record_type" : "plan"
    },
    {
      "label" : "新建拜访记录",
      "action" : "ADD",
      "action_code" : "call_history",
      "object_describe_api_name" : "call",
      "record_type" : "report"
    },
    {
      "label" : "新建离岗",
      "action" : "ADD",
      "record_type" : "master",
      "object_describe_api_name" : "time_off_territory"
    },
  ]
});
const CalendarRecord = Mock.mock({
  "events":[
    {
      start: "2017-09-09",
      end: "2017-09-09",
      rendering: "background",
      color: '#00FF00'
    },{
      title: 'All Day Event',
      start: '2017-09-01'
    },
    {
      title: 'Long Event',
      start: '2017-09-07',
      end: '2017-09-10'
    },
    {
      id: 999,
      title: 'Repeating Event',
      start: '2017-09-09T16:00:00',
      end: '2017-09-09T17:00:00'
    },
    {
      id: 999,
      title: 'Repeating Event',
      start: '2017-09-16T16:00:00'
    },
    {
      title: 'Conference',
      start: '2017-09-11',
      end: '2017-09-13'
    },
    {
      title: 'Meeting',
      start: '2017-09-12T10:30:00',
      end: '2017-09-12T12:30:00'
    },
    {
      title: 'Lunch',
      start: '2017-09-12T12:00:00'
    },
    {
      title: 'Meeting',
      start: '2017-09-12T14:30:00'
    },
    {
      title: 'Happy Hour',
      start: '2017-09-12T17:30:00'
    },
    {
      title: 'Happy Hour',
      start: '2017-09-12T17:30:00'
    },
    {
      title: 'Happy Hour',
      start: '2017-09-12T17:30:00'
    },
    {
      title: 'Dinner',
      start: '2017-09-12T20:00:00'
    },
    {
      title: 'Birthday Party',
      start: '2017-09-13T07:00:00'
    },
    {
      title: 'Click for Baidu',
      url: 'http://baidu.com/',
      start: '2017-09-28'
    }
  ]
})

module.exports = {
  [`GET ${apiPrefix}/calendar/layout`] (req, res) {
    res.status(200).json({
      head:{code:200,msg:'ok'},body:CalendarLayout
    })
  },
  [`GET ${apiPrefix}/calendar/record`] (req, res) {
    // res.json(CalendarRecord);
    // res.status(200).end()
    res.status(200).json({
      head:{code:200,msg:'ok'},body:CalendarRecord
    })

  },
}

