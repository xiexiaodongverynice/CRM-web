import * as crmIntlUtil from './crmIntlUtil';

export const UserLevelMap = {
  REP: crmIntlUtil.fmtStr('text.report.sales_representative'),
  DSM: crmIntlUtil.fmtStr('text.report.district_manager'),
  RSM: crmIntlUtil.fmtStr('text.report.regional_manager'),
};

export const AllProductUserLevelMap = {
  REP: crmIntlUtil.fmtStr('text.report.sales_representative_all_product'),
  DSM: crmIntlUtil.fmtStr('text.report.province_manager'),
  RSM: crmIntlUtil.fmtStr('text.report.regional_manager'),
};

export const GrafalonUserLevelMap = {
  REP: crmIntlUtil.fmtStr('text.report.grapalon_sales_representative'),
  DSM: crmIntlUtil.fmtStr('text.report.grapalon_province_manager')
}

export const ProductLinesMap = {
  HK_RX: crmIntlUtil.fmtStr('text.report.hk_rx'),
  HK_CX: crmIntlUtil.fmtStr('text.report.hk_cx'),

  TW_RX: crmIntlUtil.fmtStr('text.report.tw_rx'),
  TW_CX: crmIntlUtil.fmtStr('text.report.tw_cx'),
  TW_OP: crmIntlUtil.fmtStr('text.report.tw_op'),

  '癌痛': crmIntlUtil.fmtStr('text.report.cancer_pain'),
  '非癌痛': crmIntlUtil.fmtStr('text.report.none_cancer_pain'),
  '术后痛': crmIntlUtil.fmtStr('text.report.surgery_pain'),

  ME: crmIntlUtil.fmtStr('text.report.me'),
};

