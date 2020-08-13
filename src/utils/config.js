// const baseAddress = 'http://localhost:8098';
// const ssoAddress = 'http://localhost:8090';

const baseAddress = 'https://dev-tm.crmpower.cn';
const ssoAddress = 'https://dev-sso.crmpower.cn';
const pollingIntervalAddress =
  'http://crmpower-dev-notification-1883293186.cn-north-1.elb.amazonaws.com.cn';
const fsAddress = 'https://dev-fs.crmpower.cn';
const pdfAddress = 'https://pdf.crmpower.cn';
const dataExportAddress = 'https://dev-data-export.crmpower.cn';
const previewAddress = 'https://dev-file-preview.crmpower.cn/rest/preview/upload';

module.exports = {
  deployEnvironment: 'dev',
  name: 'CRMpower',
  footerText: 'ForceClouds software Co. Ltd |',
  recordNumbe: '京ICP备17004747号-1 ',
  version: 'V1.0',
  loginLogo: 'CRMPOWER.png',
  homeLogo: 'CRMpower-white-logo.png',
  baseURL: baseAddress,
  ssoURL: ssoAddress,
  pollingIntervalUrl: pollingIntervalAddress,
  YQL: ['http://www.zuimeitianqi.com'],
  CORS: ['http://localhost:7000'],
  FS: fsAddress,
  PDF: pdfAddress,
  DATA_EXPORT_BASE: dataExportAddress,
  DOMAIN_LOGINNAME_DIC: {
    localhost: '@mundi.uat.cn',
    // 'dev.crmpower.cn': '@mundi.uat.cn',
    // 'stg.crmpower.cn': '@mundipharma.uat',
    // 'prod.crmpower.cn': '@mundipharma.com.cn',
    'sinepharm.crmpower.cn': '@sinepharm.com',
    'sinepharm.sfapower.cn': '@sinepharm.com',
    'mundi-cn.crmpower.cn': '@mundipharma.com.cn',
  },
  // 根据域名配置登录logo，默认使用配置项 loginLogo的属性
  DOMAIN_LOGINLOGO_DIC: {
    // localhost: 'mylan-LOGO@3x.png',
    'myevent.crmpower.cn': 'mylan-LOGO@3x.png',
  },
  // 根据域名配置登录logo的大小，系统默认只限制宽度为300px
  DOMAIN_LOGINLOGO_WH_DIC: {
    // localhost: { width: '300px', height: '68px' },
    'myevent.crmpower.cn': { height: '68px' },
  },
  DOMAIN_DEFAULT_DEBUG: ['localhost', 'dev.crmpower.cn', 'stg.crmpower.cn'],
  apiPrefix: '/api/v1',
  workFlowURL: 'http://dev-workfolw.territorypower.cn', //* 外嵌工作流地址
  // https://stg-workflow.territorypower.cn  //* 认真看地址单词dev（workflow）有坑
  // https://workflow.territorypower.cn
  previewUrl: previewAddress,

  api: {
    dashboard: '/dashboard',
    user_data: '/rest/data_record/user_info',
    // 菜单
    tab: '/rest/metadata/tab/',
    data_record: '/rest/data_record',
    custom_objects_all: '/rest/metadata/object_describe/all',
    custom_object: '/rest/metadata/object_describe/:id', // includeFields=false
    // layout api
    layout: '/rest/metadata/layout/:id',
    layout_by_object_layoutType: '/rest/metadata/layout/{objectApiName}/{layoutType}',
    layout_list_by_object: '/rest/metadata/layout/list/{objectApiName}',
    // record api
    record: '/rest/data_record/{api_name}', // ?includeDeleted=false
    multiple_record: '/rest/data_record/batchCreate/{api_name}',
    record_query: '/rest/data_record/query', // post
    multiple_query: '/rest/data_record/batch_query', // post
    record_detail: '/rest/data_record/{api_name}/{id}', // ?includeDeleted=false
    record_del: '/rest/data_record/{api_name}/{id}',
    batch_delete: '/rest/data_record/batchDelete/{api_name}',
    record_ubatch: '/rest/data_record/ubatch/{api_name}',
    record_list_part: '/rest/data_record/{api_name}/{pageSize}/{pageNo}', // ?includeDeleted=false
    record_data_upload: '/rest/upload/{api_name}',
    record_data_download: '/rest/download/{api_name}',
    // 选择被辅导人
    coach_user_info: '/rest/user_info/listSubordinate/{id}',
    // 日历
    calendar_layout: '/calendar/layout',
    calendar_record: '/calendar/record',
    // 活动打印
    event_print: 'rest/data_record/print/{api_name}/{id}',
    custom_action: '/rest/action',
    encrypt_jwt: '/rest/encrypt/jwt',
    subordinate_query: '/rest/user_info/listSubordinate/{id}',
    //* 不包含共享岗位的下属territoryId 集合
    list_territoryId_query: '/rest/user_info/listTerritory/{id}',
    list_tutorial_territory: '/rest/user_info/listTutorialTerritory/{id}',
    territory_customer_query: '/rest/data_record/listCustomerId/{userId}',
    tutorial_query: '/rest/user_info/listTutorial/{id}',
    calendar_setting: 'rest/metadata/setting/calendar_setting',
    kpi: 'rest/kpi/{user_id}',
    kpi_encrypt_jwt: '/rest/kpi/jwt',
    kpi_download: '/rest/kpi/download',
    kpi_admin_download: '/rest/kpi/admin_download',
    kpi_record: '/rest/kpi/record',
    locale_all: '/rest/metadata/translation/language/all',
    default_language: '/rest/metadata/setting/default_language',
    // logo
    logo: '/rest/metadata/setting/{apiName}',
    notice_read: '/rest/data_record/notice_read_log',
    approval_flow: '/rest/approval_flow',
    call_template: '/rest/call_template',

    polling_notification_interval: '/notification', // ?token={token}&polling_interval_s={polling_interval_s}
    serverTime: '/rest/time',
    security_check: '/rest/metadata/security_check',
  },
  data_export_api: {
    export_history: '/rest/metadata/export_history',
    export_history_log: '/rest/metadata/export_history_log',
    export_script: '/rest/metadata/export_script',
    export_script_async: '/rest/async/metadata/export_script',
  },
  fs_api: {
    files: '/rest/files/',
  },
};
