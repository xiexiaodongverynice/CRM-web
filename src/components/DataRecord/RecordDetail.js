/**
 * @flow
 */
import React, { Component } from 'react';
import _ from 'lodash';
import { Form, Row, Col, Collapse } from 'antd';
import styles from './detail.less';
import RecordFormDetailItem from './RecordFormDetailItem';
import {
  CallProductKeyMessageFormItem,
  RelatedDetailFormItem,
  RenderBar,
} from '../../components/index';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { callAnotherFunc } from '../../utils';
import SignIn from '../SignIn';
import { checkSectionShowable } from './helpers/recordHelper';
import { getExpression } from '../../utils/expressionUtils';
import { appendRelatedFieldToSection, checkFieldShowable } from './common/record';
import consoleUtil from '../../utils/consoleUtil';

const Panel = Collapse.Panel;

type Prop = {};

type State = {
  visible: boolean,
  newKey: Date,
  disState: boolean,
  editDisState: boolean,
};

class RecordDetail extends Component<Prop, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      newKey: new Date(),
      disState: false,
      editDisState: false,
    };
  }

  componentWillMount() {
    // consoleUtil.log(this.props);
  }

  recordFormItem = () => {
    const {
      renderViewLayout,
      fieldList,
      component,
      describe,
      record,
      pageType,
      object_api_name: objectApiName,
      location,
      relatedListComponents,
      edit_mode,
    } = this.props;
    const { component_name, type } = component;

    if (type === 'detail_form') {
      const fieldSections = component.field_sections;
      if (fieldSections && fieldSections.length > 0) {
        const recordFormItems = fieldSections.map((fieldSection, index) => {
          const dataItem = record;
          const content = [];
          const columns = fieldSection.columns;

          let needDisplay = checkSectionShowable(fieldSection, 'web', 'detail');
          if (_.startsWith(pageType, 'detail')) {
            if (_.indexOf(_.get(fieldSection, 'hidden_when'), 'detail') >= 0) {
              needDisplay = false;
            }
          }

          if (needDisplay) {
            let formRowItems;
            const fieldSectionFields = _.get(fieldSection, 'fields', []);
            const isExtender = _.get(fieldSection, 'is_extender', false);
            const isRequired = _.get(fieldSection, 'is_required', false);

            if (isExtender) {
              // 如果渲染字段fields是空的，或者没有配置，检查是否配置的为组件
              const formItemExtender = _.get(
                fieldSection,
                'form_item_extender',
              );
              const formItemExtenderFilterLayout = _.get(
                fieldSection,
                'form_item_extender_filter',
              );
              switch (formItemExtender) {
                case 'CallProductKeyMessageFormItem': {
                  const productKeyMessageFormItemProps = {
                    needDisabled: true,
                    formItemExtenderFilterLayout,
                    fieldSection,
                    parentRecord: record,
                    onReactionChange: (values) => {
                      // consoleUtil.log('keyMessageOnChange',values)
                    },

                    onProductChange: (values) => {
                      // consoleUtil.log('productChecked',values);
                    },
                    onKeyMessageChange: (values) => {
                      // consoleUtil.log('onKeyMessageChange',values);
                    },
                    loadDefaultRecordData: (values) => {},
                  };

                  formRowItems = (
                    <CallProductKeyMessageFormItem
                      {...productKeyMessageFormItemProps}
                    />
                  );
                  break;
                }

                case 'RelatedDetailFormItem': {
                  const relatedDetailFormItemProps = {
                    needDisabled: true,
                    formItemExtenderLayout: fieldSection,
                    parentRecord: record,
                  };

                  formRowItems = (
                    <RelatedDetailFormItem {...relatedDetailFormItemProps} />
                  );

                  break;
                }
                // 签到
                case 'SignInLiteFormItem': {
                  const signInProps = {
                    needDisabled: true,
                    parentRecord: record,
                    required: isRequired,
                    fieldLayout: fieldSection,
                  };
                  formRowItems = <SignIn {...signInProps} />;
                }
              }
            }

            // 根据配置的fields，渲染出form表单，开始
            if (!isExtender) {
              formRowItems = fieldSectionFields.map(
                (renderField, fieldIndex) => {
                  if (fieldList && !_.isEmpty(fieldList)) {
                    const fieldApiName = _.get(renderField, 'field');
                    const formRowKey = `form_item_row_${index}_${fieldIndex}_${_.get(
                      location,
                      'query._k',
                    )}`;
                    const colKey = `row_${index}_${fieldIndex}`;
                    const contentSpan = _.floor(24 / columns);

                    /**
                     * 检查表单项是否可以显示
                     */
                    const showable = checkFieldShowable({
                      renderField,
                      pageType,
                      edit_mode,
                      dataItem
                    });

                    if (showable) {
                      const formItemLayout = {
                        labelCol: { span: 6 },
                        wrapperCol: { span: 18 },
                      };

                      if (!_.isEmpty(fieldApiName)) {
                        const fieldItem = _.find(fieldList, {
                          api_name: renderField.field,
                        });
                        if (_.isEmpty(fieldItem)) {
                          consoleUtil.error(
                            '[配置错误]：字段Record在对象描述里面没有找到：',
                            objectApiName,
                            fieldApiName,
                          );
                          return;
                        }

                        const fieldLabel = fieldItem.label;
                        const hasFieldPrivilege = window.fc_hasFieldPrivilege(
                          objectApiName,
                          fieldApiName,
                          [2, 4],
                        );
                        if (!hasFieldPrivilege) {
                          consoleUtil.warn(
                            '[权限不足]：',
                            objectApiName,
                            fieldApiName,
                            fieldLabel,
                          );
                          return;
                        }

                        const recordFormItemProps = {
                          objectApiName,
                          fieldItem,
                          dataItem: record,
                          renderFieldItem: renderField,
                          formItemLayout,
                        };

                        return (
                          <Col span={contentSpan} key={colKey}>
                            <RecordFormDetailItem
                              {...recordFormItemProps}
                              key={+new Date()}
                            />
                          </Col>
                        );
                      } else if (
                        _.endsWith(_.get(renderField, 'render_type'), '_bar')
                      ) {
                        return (
                          <Col span={contentSpan} key={colKey}>
                            <RenderBar
                              renderLayout={renderField}
                              formItemLayout={formItemLayout}
                              key={formRowKey}
                            />
                          </Col>
                        );
                      } else {
                        return false;
                      }
                    }
                  } else {
                    return '没有找到表单渲染字段';
                  }
                },
              );
              /**
               * 添加相关列表到表单中
               */
              formRowItems = appendRelatedFieldToSection({
                fieldSection,
                relatedListComponents,
                formRowItems,
                parentRecord: record,
                pageType,
                location,
                isFormCreate: true,
                parentApiName: objectApiName,
                rendered_callback: this.relatedFieldRenderedCallback
              })
            }

            const header = crmIntlUtil.fmtStr(
              _.get(fieldSection, 'header.i18n_key'),
              _.get(
                fieldSection,
                'header',
                `header_${_.get(fieldSection, 'id')}`,
              ),
            );
            const field_section_key = _.get(fieldSection, 'id');
            if (field_section_key === undefined) {
              consoleUtil.warn('布局field section缺少id');
            }

            if (!_.isEmpty(renderViewLayout)) {
              const renderView = _.get(renderViewLayout, 'view');
              const viewOptions = _.get(renderViewLayout, 'view_options');
              const customPanelStyle = _.get(
                viewOptions,
                `custom_panel_style.${field_section_key}`,
                _.get(viewOptions, 'custom_panel_style.default'),
              );
              const defaultDisabledKeys = _.get(
                viewOptions,
                'default_disabled_key',
              );
              const needPanelDisabled =
                _.indexOf(defaultDisabledKeys, field_section_key) >= 0;
              switch (renderView) {
                case 'collapse': {
                  return (
                    <Panel
                      header={header}
                      disabled={needPanelDisabled}
                      key={field_section_key}
                      className={styles.fieldSectionHeader}
                      style={customPanelStyle}
                    >
                      {formRowItems}
                    </Panel>
                  );
                }
                default: {
                  break;
                }
              }
            } else {
              return (
                <div key={field_section_key} style={{ marginBottom: 20 }}>
                  {header && (
                    <Row className={styles.fieldSectionHeader}>
                      <Col span={24}>
                        <span>{header}</span>
                      </Col>
                    </Row>
                  )}
                  <Row className={styles.fieldSectionForm}>{formRowItems}</Row>
                </div>
              );
            }
          }
        });

        if (!_.isEmpty(renderViewLayout)) {
          const renderView = _.get(renderViewLayout, 'view');
          const viewOptions = _.get(renderViewLayout, 'view_options');
          const defaultActiveKey = _.get(viewOptions, 'default_active_key');
          const isAccordion = _.get(viewOptions, 'is_accordion', false);
          const isBordered = _.get(viewOptions, 'is_bordered', true);
          switch (renderView) {
            case 'collapse': {
              return recordFormItems ? (
                <div>
                  <Collapse
                    accordion={isAccordion}
                    bordered={isBordered}
                    defaultActiveKey={defaultActiveKey}
                  >
                    {recordFormItems}
                  </Collapse>
                </div>
              ) : null;
            }
            default: {
              break;
            }
          }
        } else {
          return recordFormItems ? (
            <div>
              <Form horizontal key={component_name}>
                {recordFormItems}
              </Form>
            </div>
          ) : null;
        }
      } else {
        return '正在渲染。';
      }
    } else {
    }
  }

  render() {
    return <div>{this.recordFormItem()}</div>;
  }
}
export default RecordDetail;
