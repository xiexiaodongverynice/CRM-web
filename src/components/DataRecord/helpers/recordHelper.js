import _ from 'lodash';
import consoleUtil from '../../../utils/consoleUtil';
/**
 * 判断section是否显示
 */
export const checkSectionShowable = (fieldOrSection, device = 'web', page) => {
  /**
   * section是否显示
   */
  let isShow = true;
  /**
   * 指定设备显示配置项
   */
  const showInDevice = fieldOrSection.show_in_device;
  if(showInDevice) {
    /**
     * 判断是否在web端显示section
     */
    const pages = _.get(showInDevice, device, []);
    if(pages && _.isArray(pages)){
      isShow = _.indexOf(pages, page) >= 0;
    }
  }
  return isShow;
}

export const recordTypeCriteria = (recordType) => {
  if (!recordType) {
    return [];
  }
  if (Array.isArray(recordType) && recordType.length > 0) {
    return {
      field: 'record_type',
      operator: 'in',
      value: recordType,
    };
  } else {
    return {
      field: 'record_type',
      operator: '==',
      value: [recordType],
    };
  }
}

export const relationCriteria = ({parentRecord, targetValueField, relationField}) => {
  if (parentRecord && targetValueField && parentRecord[targetValueField]) {
    return [{
      field: relationField.api_name,
      operator: '==',
      value: [parentRecord[targetValueField]],
    }];
  } else {
    consoleUtil.error(`Invalid relation, parentRecord = ${parentRecord}, targetValueField = ${targetValueField}, relationField = ${relationField}`);
    return [];
  }
}
