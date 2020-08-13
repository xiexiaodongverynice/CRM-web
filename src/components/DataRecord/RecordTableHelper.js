import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Badge, Tag } from 'antd';
import { hashHistory, Link } from 'dva/router';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { callAnotherFunc } from '../../utils';
import AttachmentFieldItem from './AttachmentFieldItem';
import ImageUploadFieldItem from './ImageUploadFieldItem';
import FcSelectMultipleDetailItem from '../common/FcSelectMultipleDetailItem';
import consoleUtil from '../../utils/consoleUtil';
import { getDcrValueText } from '../../utils/dcrUtil';

/**
 * 渲染列表页单元格的工具函数
 * @param text 当前cell的文本值
 * @param record 当前行对应的dataRecord
 * @param index 当前行的index
 * @param fieldDescribe 字段描述，注意的是这里的字段描述是混合了布局组件上的定义的额外属性，如render_type的
 * @returns {XML}
 */
const randomKey = () => {
  return (Math.random() * 10000).toFixed();
};

const renderCellTagText = (fieldVal, renderText, fieldDescribe) => {
  // const renderType = fieldDescribe.render_type;
  const renderColor = _.get(fieldDescribe, 'tag_color');
  const renderIcon = _.get(fieldDescribe, 'tag_icon');

  // 如果对文本有额外的渲染的时候
  if (!_.isEmpty(renderIcon)) {
    const icon = _.isString(renderIcon) ? renderIcon : _.get(renderIcon, fieldVal); // 获取图标
    if (!_.isEmpty(renderColor)) {
      const color = _.isString(renderColor) ? renderColor : _.get(renderColor, fieldVal); // 获取颜色
      if (!_.isEmpty(color)) {
        renderText = (
          <span key={`render-cell-text-${randomKey()}`}>
            {' '}
            <i className={`fa fa-${icon}`} style={{ color, marginRight: 2 }} />
            {renderText}
          </span>
        );
      } else {
        renderText = <span key={`render-cell-text-${randomKey()}`}> {renderText}</span>;
      }
    }
  }
  // TODO 可以支持tag标签
  /* let color = '';
  if(!_.isEmpty(renderColor)) {
    color = _.isString(renderColor)?renderColor:_.get(renderColor,fieldVal);//获取颜色
  }
  if(!_.isEmpty(renderIcon)){
    const icon = _.isString(renderIcon)?renderIcon:_.get(renderIcon,fieldVal);//获取图标
    if(!_.isEmpty(color)){
      renderText = (
        <span key={`render-cell-text-${randomKey()}`} > <i className={`fa fa-${icon}`} style={{color,marginRight:2}}/>{renderText}</span>
      )
    }else{
      renderText = (
        <span key={`render-cell-text-${randomKey()}`} > {renderText}</span>
      )
    }
  }else{
    if(!_.isEmpty(color)){
      renderText = <Tag color="red">{renderText}</Tag>
    }else{
      renderText = <Tag >{renderText}</Tag>
    }
  } */

  return renderText;
};
const renderCellText = (fieldVal, renderText, fieldDescribe) => {
  const renderType = fieldDescribe.render_type;
  if (_.eq(renderType, 'tag')) {
    return renderCellTagText(fieldVal, renderText, fieldDescribe);
  } else {
    return (
      <span style={styles.wordBreak} key={`render-cell-text-${randomKey()}`}>
        {renderText}
      </span>
    );
  }
};

export const renderCell = (text, record, index, fieldDescribe, objectApiName, editable) => {
  const recordId = _.get(record, 'id');
  const fieldApiName = fieldDescribe.api_name; // 跟渲染布局里面的field是一样的
  const fieldLabel = fieldDescribe.label; // 跟渲染布局里面的field是一样的
  const renderType = fieldDescribe.render_type;
  const fieldType = fieldDescribe.type;
  const recordType = _.get(record, 'record_type');
  // if(fieldType === 'boolean')
  //   debugger
  const o = _.has(record, `${fieldDescribe.api_name}__r`);

  const hasFieldPrivilege = fc_hasFieldPrivilege(objectApiName, fieldApiName, [2, 4]);
  if (!hasFieldPrivilege) {
    consoleUtil.warn('[权限不足]：', objectApiName, fieldApiName, fieldLabel);
    return;
  }
  if (_.isNull(text)) {
    // 不是字符串、不是数字、不是布尔，那么返回
    return text;
  }
  // if (!(_.isString(text)||_.isNumber(text)||_.isBoolean(text))){//不是字符串、不是数字、不是布尔，那么返回
  //   return text;
  // }
  if (fieldApiName === 'name') {
    const detailUrl = `object_page/${record.object_describe_name}/${recordId}/detail_page?recordType=${recordType}`;
    let isLink = _.get(fieldDescribe, 'is_link', 'return true');
    if (!_.isBoolean(isLink)) {
      isLink = callAnotherFunc(new Function('t', isLink), record);
    }
    if (isLink) {
      return (
        <Link style={styles.wordBreak} to={detailUrl} target="_blank">
          {text}
        </Link>
      );
    } else {
      return <span style={styles.wordBreak}>{text}</span>;
    }
  } else if (renderType === 'object_link') {
    const targetRecordType = record.record_type || 'master';
    const detailUrl = `object_page/${fieldApiName}/${recordId}/detail_page?recordType=${targetRecordType}`;
    return (
      <Link to={detailUrl} target="_blank">
        {text}
      </Link>
    );
  } else if (renderType === 'inner_html') {
    return <span dangerouslySetInnerHTML={{ __html: _.toString(text) }}></span>;
  }

  switch (
    fieldType // todo 在此处增加其他字段类型的单元格渲染方式
  ) {
    case 'select_one': {
      const { options } = fieldDescribe;
      let renderText = text;
      if (_.isEmpty(options)) {
        // consoleUtil.log(fieldApiName, '选项配置为空，请检查');
      }
      if (options) {
        const op = options.find((x) => x.value === text);
        // const optionsLabel = crmIntlUtil.fmtStr(`options.${objectApiName}.${fieldApiName}.${text}`, _.get(_.find(options, { value: text }), 'label'));
        renderText = op
          ? crmIntlUtil.fmtStr(
              `options.${objectApiName}.${fieldApiName}.${text}`,
              _.get(op, 'label', text),
            )
          : text;
        if (op) {
          return renderCellText(text, renderText, fieldDescribe);
        } else {
          const value = options.find((y) => y.label === text);
          if (value) {
            return renderCellText(value.value, renderText, fieldDescribe);
          } else {
            return renderCellText(text, renderText, fieldDescribe);
          }
        }
        // return renderCellText(text,renderText,fieldDescribe);
      }
    }
    case 'select_many': {
      const { options } = fieldDescribe;
      if (_.isEmpty(options)) {
        // consoleUtil.log(fieldApiName, '选项配置为空，请检查');
      }

      if (!_.isArray(text)) {
        text = [text];
      }

      if (!_.isEmpty(text)) {
        let renderedElement;
        /**
         * 判断是否是数据源形式的多选，并且区分是否为字段定义中的数据源
         */
        const { data_source } = fieldDescribe;
        const object_api_name = _.get(data_source, 'object_api_name');
        if (object_api_name) {
          const props = {
            fieldItem: fieldDescribe,
            fieldRecord: text,
            renderFieldItem: {
              data_source,
            },
            mode: true,
            mergedObjectFieldDescribe: fieldDescribe,
            objectApiName: fieldApiName,
            dataItem: record,
          };
          renderedElement = <FcSelectMultipleDetailItem {...props} />;
        } else {
          renderedElement = text.map((oneText) => {
            // const renderText = _.get(_.find(options, { value: oneText }), 'label');
            const renderText = crmIntlUtil.fmtStr(
              `options.${objectApiName}.${fieldApiName}.${oneText}`,
              _.get(_.find(options, { value: oneText }), 'label', text),
            );
            return renderCellText(oneText, renderText, fieldDescribe);
          });
          renderedElement = _.chain(renderedElement)
            .map((text, index) => {
              return index === renderedElement.length - 1 ? [text] : [text, <span>,</span>];
            })
            .flatten()
            .value();
        }
        return renderedElement;
      } else {
        return text;
      }

      // // if (!_.isEmpty(text) && _.isObject(text)) {////忘记下面为什么这么写的了额，注掉，从写这块逻辑
      //   return String(text.map((oneText) => {
      //     return _.map(_.filter(options, { value: oneText }), 'label');
      //   }));
      // } else {
      //   return text;
      // }
    }
    case 'boolean': {
      let { options } = fieldDescribe;
      if (_.isEmpty(options)) {
        options = [
          {
            label: crmIntlUtil.fmtStr('label.yes', '是'),
            value: true,
          },
          {
            label: crmIntlUtil.fmtStr('label.no', '否'),
            value: false,
          },
        ];
      }

      let option = _.find(options, { value: text });
      if (_.isEmpty(option)) {
        option = {
          label: text,
          value: text,
        };
      }
      const optionsLabel = crmIntlUtil.fmtStr(
        `options.${objectApiName}.${fieldApiName}.${text}`,
        _.get(option, 'label', ''),
      );
      return renderCellText(text, optionsLabel, fieldDescribe);
    }
    case 'image': {
      if (renderType === 'image_upload') {
        return <ImageUploadFieldItem value={text} relationField={fieldDescribe} onlyView />;
      }
      return <img alt="avatar" width={24} src={text} />;
    }
    case 'time': {
      const formatStr = _.get(fieldDescribe, 'date_time_format', 'HH:mm:ss');
      if (_.isNumber(text)) {
        return moment.utc(text).format(formatStr);
      } else {
        return '';
      }
    }
    case 'date':
    case 'date_time': {
      const formatStr = _.get(
        fieldDescribe,
        'date_time_format',
        _.get(fieldDescribe, 'date_format'),
      );
      if (_.isNumber(text)) {
        return moment(text).format(formatStr);
      } else {
        return '';
      }
    }
    case 'relation': {
      const targetId = record[fieldDescribe.api_name];
      const targetApiName = fieldDescribe.target_object_api_name;
      const targetName = record[`${fieldDescribe.api_name}__r`]
        ? record[`${fieldDescribe.api_name}__r`].name
        : targetId;
      const targetLayoutRecordType = _.get(
        fieldDescribe,
        'target_layout_record_type',
        _.get(record, `${fieldDescribe.api_name}__r.record_type`, 'master'),
      );
      const detailUrl = `object_page/${targetApiName}/${targetId}/detail_page?recordType=${targetLayoutRecordType}`;
      let isLink = _.get(fieldDescribe, 'is_link', 'return true');
      if (!_.isBoolean(isLink)) {
        isLink = callAnotherFunc(new Function('t', isLink), record);
      }
      if (isLink) {
        return (
          <Link style={styles.wordBreak} to={detailUrl} target="_blank">
            {targetName}
          </Link>
        );
      } else {
        return <span style={styles.wordBreak}>{targetName}</span>;
      }
    }
    case 'attachment': {
      return <AttachmentFieldItem value={text} relationField={fieldDescribe} onlyView />;
    }
    case 'text':
    case 'long_text': {
      if (o) {
        return (
          <span style={styles.textOmit}>{_.get(record, `${fieldDescribe.api_name}__r.name`)}</span>
        );
      } else {
        return <span style={styles.textOmit}>{_.toString(text)}</span>;
      }
    }
    // case 'phone':
    // case 'email':
    // case 'url':
    // case 'big_int':
    // case 'real_number':
    // case 'currency':
    // case 'auto_number':
    // case 'rel_fields':
    case 'percentage': {
      if (+text !== 0 && !_.isNaN(+text)) {
        return <span>{`${(text * 100).toFixed(2)}%`}</span>;
      } else {
        return <span>{''}</span>;
      }
    }
    default: {
      if (o) {
        return (
          <span style={styles.wordBreak}>{_.get(record, `${fieldDescribe.api_name}__r.name`)}</span>
        );
      } else {
        return <span style={styles.wordBreak}>{_.toString(text)}</span>;
      }
    }
  }
};

export const getCellContent = (text, record, index, fieldDescribe, objectApiName, editable) => {
  const valueCell = renderCell(text, record, 0, fieldDescribe, objectApiName);
  return getDcrValueText(valueCell, fieldDescribe);
};

const styles = {
  textOmit: {
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
    wordWrap: 'break-word',
  },
  wordBreak: {
    wordWrap: 'break-word',
    wordBreak: 'break-word',
  },
};
