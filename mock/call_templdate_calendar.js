const o = {
  "timeFormat" : "HH(:mm)",
  "calendar_items" : [
      {
          "ref_object" : "call",
          "start_field" : "start_time",
          "end_field" : "end_time",
          "item_content" : "{{customer__r.name}}",
          "popup" : {
              "fields" : [
                  {
                      "field" : "customer"
                  },
                  {
                      "field" : "parent_customer"
                  },
                  {
                      "field" : "start_time",
                      "render_type" : "date_time",
                      "date_time_format" : "YYYY-MM-DD HH:mm"
                  },
                  {
                      "field" : "end_time",
                      "render_type" : "date_time",
                      "date_time_format" : "YYYY-MM-DD HH:mm"
                  },
                  {
                      "field" : "done_time",
                      "render_type" : "date_time",
                      "date_time_format" : "YYYY-MM-DD HH:mm"
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
                  },
                  {
                      "field" : "create_by"
                  }
              ]
          },
          "support_action" : {},
          "legend" : [
              {
                  "id" : 11,
                  "label" : "拜访计划",
                  "label.i18n_key" : "label.call.plan",
                  "bg_color" : "#40d1a9",
                  "border_color" : "#40d1a9",
                  "text_color" : "#FFFFFF",
                  "critiria" : [
                      {
                          "field" : "status",
                          "operator" : "==",
                          "value" : ["1"]
                      },
                      {
                          "field" : "create_by",
                          "operator" : "in",
                          "default_value" : ["$$CurrentUserId$$"],
                          "value" : "suborainate_selector_filter",
                          "field_type" : "selector_filter_extender"
                      }
                  ],
                  "record_type" : "plan",
                  "joiner" : "and",
                  "show_when": "return fc_getProfile().api_name === 'cp_rep'"
              },
              {
                  "id" : 12,
                  "label" : "拜访记录[已执行]",
                  "label.i18n_key" : "label.call.report.status.2",
                  "bg_color" : "#45b9e9",
                  "border_color" : "#45b9e9",
                  "text_color" : "#FFFFFF",
                  "critiria" : [
                      {
                          "field" : "status",
                          "operator" : "==",
                          "value" : ["2"]
                      },
                      {
                          "field" : "create_by",
                          "operator" : "in",
                          "default_value" : ["$$CurrentUserId$$"],
                          "value" : "suborainate_selector_filter",
                          "field_type" : "selector_filter_extender"
                      }
                  ],
                  "joiner" : "and",
                  "record_type" : "report"
              },
              {
                  "id" : 13,
                  "label" : "拜访记录[已完成]",
                  "label.i18n_key" : "label.call.report.status.3",
                  "bg_color" : "#368FE9",
                  "border_color" : "#368FE9",
                  "text_color" : "#FFFFFF",
                  "critiria" : [
                      {
                          "field" : "status",
                          "operator" : "==",
                          "value" : ["3"]
                      },
                      {
                          "field" : "create_by",
                          "operator" : "in",
                          "default_value" : ["$$CurrentUserId$$"],
                          "value" : "suborainate_selector_filter",
                          "field_type" : "selector_filter_extender"
                      }
                  ],
                  "joiner" : "and",
                  "record_type" : "report"
              }
          ]
      },
      {
          "ref_object" : "event",
          "start_field" : "start_time",
          "end_field" : "end_time",
          "item_content" : "{{name}}",
          "popup" : {
              "fields" : [
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
                      "date_time_format" : "YYYY-MM-DD HH:mm"
                  },
                  {
                      "field" : "end_time",
                      "render_type" : "date_time",
                      "date_time_format" : "YYYY-MM-DD HH:mm"
                  },
                  {
                      "field" : "status",
                      "render_type" : "select_one"
                  },
                  {
                      "field" : "create_by"
                  }
              ]
          },
          "support_action" : {},
          "legend" : [
              {
                  "id" : 31,
                  "label" : "活动[新建]",
                  "bg_color" : "#ff967d",
                  "label.i18n_key" : "label.event.master.1",
                  "border_color" : "#ff967d",
                  "text_color" : "#FFFFFF",
                  "critiria" : [
                      {
                          "field" : "status",
                          "operator" : "==",
                          "value" : [1]
                      },
                      {
                          "field" : "create_by",
                          "operator" : "in",
                          "default_value" : ["$$CurrentUserId$$"],
                          "value" : "suborainate_selector_filter",
                          "field_type" : "selector_filter_extender"
                      }
                  ],
                  "record_type" : "master",
                  "joiner" : "and"
              },
              {
                  "id" : 32,
                  "label" : "活动[已完成]",
                  "bg_color" : "#fc636b",
                  "border_color" : "#fc636b",
                  "label.i18n_key" : "label.event.master.2",
                  "text_color" : "#FFFFFF",
                  "critiria" : [
                      {
                          "field" : "status",
                          "operator" : "==",
                          "value" : [2]
                      },
                      {
                          "field" : "create_by",
                          "operator" : "in",
                          "default_value" : ["$$CurrentUserId$$"],
                          "value" : "suborainate_selector_filter",
                          "field_type" : "selector_filter_extender"
                      }
                  ],
                  "record_type" : "master",
                  "joiner" : "and"
              }
          ]
      },
      {
          "ref_object" : "time_off_territory",
          "start_field" : "start_date",
          "end_field" : "end_date",
          "item_content" : "{{type}}",
          "popup" : {
              "fields" : [
                  {
                      "field" : "type",
                      "render_type" : "select_one"
                  },
                  {
                      "field" : "start_date",
                      "render_type" : "date_time",
                      "date_time_format" : "YYYY-MM-DD HH:mm"
                  },
                  {
                      "field" : "end_date",
                      "render_type" : "date_time",
                      "date_time_format" : "YYYY-MM-DD HH:mm"
                  },
                  {
                      "field" : "status",
                      "render_type" : "select_one"
                  },
                  {
                      "field" : "remark"
                  },
                  {
                      "field" : "create_by"
                  }
              ]
          },
          "support_action" : {},
          "legend" : [
              {
                  "id" : 41,
                  "label" : "离岗活动",
                  "bg_color" : "#ccd7dd",
                  "label.i18n_key" : "label.tot.master.1",
                  "border_color" : "#ccd7dd",
                  "text_color" : "#333333",
                  "critiria" : [
                      {
                          "field" : "status",
                          "operator" : "==",
                          "value" : [1]
                      },
                      {
                          "field" : "create_by",
                          "operator" : "in",
                          "default_value" : ["$$CurrentUserId$$"],
                          "value" : "suborainate_selector_filter",
                          "field_type" : "selector_filter_extender"
                      }
                  ],
                  "record_type" : "master",
                  "joiner" : "and"
              }
          ]
      }
  ],
  "calendar_actions" : [
      {
          "label" : "新建拜访计划",
          "action" : "ADD",
          "action.i18n_key" : "action.add.call.plan",
          "show_when" : ["index"],
          "action_code" : "create_call_plan",
          "object_describe_api_name" : "call",
          "hidden_expression" : "return !fc_hasFunctionPrivilege('add_call_plan')",
          "target_layout_record_type" : "plan"
      },
      {
          "label" : "新建拜访记录",
          "action" : "ADD",
          "action.i18n_key" : "action.add.call.report",
          "show_when" : ["index"],
          "action_code" : "create_call_report",
          "object_describe_api_name" : "call",
          "hidden_expression" : "return !fc_hasFunctionPrivilege('add_call_report')",
          "target_layout_record_type" : "report"
      },
      {
          "label" : "新建离岗活动",
          "action" : "ADD",
          "action.i18n_key" : "action.add.tot.master",
          "object_describe_api_name" : "time_off_territory",
          "hidden_expression" : "return !fc_hasFunctionPrivilege('add_tot')",
          "target_layout_record_type" : "master"
      },
      {
          "label" : "新建活动",
          "action" : "ADD",
          "object_describe_api_name" : "event",
          "action.i18n_key" : "action.add.event.master",
          "hidden_expression" : "return !fc_hasFunctionPrivilege('add_event')",
          "target_layout_record_type" : "master"
      }
  ],
  "selector_filter_extender" : [
      {
          "show_filter" : true,
          "hidden_expression" : "return !fc_hasFunctionPrivilege('suborainate_selector_filter_for_calendar')",
          "extender_item_alias" : "suborainate_selector_filter",
          "extender_item" : "SubordinateSelectorFilter",
          "render_type" : "tree",
          "extender_option" : {
              "disabled" : false,
              "showSearch" : true,
              "allowClear" : true,
              "treeCheckable" : true,
              "showCheckedStrategy" : "SHOW_ALL",
              "placeholder" : "选择一个下属",
              "placeholder.i18n_key" : "placeholder.select_the_subordinate"
          }
      }
  ],
  "views" : [
      {
          "name" : "call_template",
          "disabledCustomButtons" : ["next", "pre"],
          "title" : {
              "text" : ""
          },
          "options" : {
              "type" : "agendaWeek",
              "buttonText" : "action.call_template.view.name"
          },
          "calendar_items" : [
              {
                  "ref_object" : "call_template_detail",
                  "item_content" : "{{customer__r.name}}",
                  "popup" : {
                      "fields" : [
                          {
                              "field" : "customer"
                          },
                          {
                              "field" : "parent_customer"
                          },
                          {
                              "field" : "start_time",
                              "render_type" : "time",
                              "date_time_format" : "HH:mm"
                          },
                          {
                              "field" : "end_time",
                              "render_type" : "time",
                              "date_time_format" : "HH:mm"
                          }
                      ],
                      "actions" : [
                          {
                              "label" : "删除",
                              "action" : "DELETE",
                              "action.i18n_key" : "action.delete"
                          },
                          {
                              "label" : "编辑",
                              "action" : "EDIT",
                              "action.i18n_key" : "action.edit"
                          }
                      ]
                  },
                  "support_action" : {},
                  "legend" : [
                      {
                          "id" : 51,
                          "label" : "拜访模板明细",
                          "label.i18n_key" : "label.call.plan",
                          "bg_color" : "#205081",
                          "border_color" : "#205081",
                          "text_color" : "#FFFFFF",
                          "critiria" : [
                              {
                                  "field" : "create_by",
                                  "operator" : "in",
                                  "default_value" : ["$$CurrentUserId$$"],
                                  "value" : "suborainate_selector_filter",
                                  "field_type" : "selector_filter_extender"
                              },
                              {
                                  "field" : "parent_id",
                                  "operator" : "==",
                                  "value" : "call_template_selector_filter",
                                  "field_type" : "selector_filter_extender"
                              }
                          ],
                          "record_type" : "master",
                          "joiner" : "and"
                      }
                  ]
              }
          ],
          "selector_filter_extender" : [
              {
                  "extender_item_alias" : "call_template_selector_filter",
                  "extender_item" : "CallTemplateSelectorFilter",
                  "extender_option" : {
                      "placeholder" : "选择一个模板",
                      "placeholder.i18n_key" : "placeholder.select_the_template"
                  },
                  "extender_align" : "left"
              }
          ],
          "calendar_actions" : [
              {
                  "label" : "新建拜访模板",
                  "action" : "ADD",
                  "object_describe_api_name" : "call_template",
                  "action.i18n_key" : "action.add.call_template.week",
                  "hidden_expression" : "return !fc_hasFunctionPrivilege('add_call_template')",
                  "target_layout_record_type" : "week"
              }
          ]
      }
  ]
}

export default JSON.stringify(o);