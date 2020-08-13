import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import pathToRegexp from 'path-to-regexp';
import { Tabs, Row, Col, Collapse } from 'antd';
import styles from './detail.less';
import RelatedList from './RelatedList';
import RelatedMilestone from './RelatedMilestone';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';
import { getActionShowableProps, checkoutShowableDevice } from './common/record';

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

class RelatedDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      newKey: new Date(),
      disState: false,
      editDisState: false,
      cardActiveKey: null,
    };
  }
  componentWillMount() {}
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {
    // consoleUtil.log('this.props.record.version==>', this.props.record.version)
    // consoleUtil.log('nextProps.record.version==>', nextProps.record.version)

    if (this.props.record.version !== nextProps.record.version) {
    }
  }
  componentWillUpdate = () => {
    // consoleUtil.log('componentWillUpdate RelatedDetail');
  };
  componentDidUpdate = () => {
    // consoleUtil.log('componentDidUpdate RelatedDetail');
  };
  componentWillUnmount = () => {
    // consoleUtil.log('componentWillUnmount RelatedDetail');
  };
  loadRelated = (key) => {
    // consoleUtil.log(key);
  };

  onUpdateAfterRowsSelectedOk = (data, relatedLayout, callBack) => {
    // const { layoutData } = this.props;
    const objectApiName = relatedLayout.ref_obj_describe;
    consoleUtil.log(data, objectApiName);
    this.props.dispatch({
      type: 'detail_page/updateBatch',
      payload: { dealData: { data }, object_api_name: objectApiName, callBack },
    });
  };

  getQueryStringObj = (url) => {
    const allObj = {};
    const afterArgs = {};
    if (url) {
      const qs = url.split('?')[1];
      const az = url.split('?')[0];
      const match =
        pathToRegexp('#/object_page/:object_api_name/:record_id/detail_page').exec(az) || [];
      const items = qs.length > 0 ? qs.split('&') : [];
      let item = null;
      let name = null;
      let value = null;
      _.map(items, (ite) => {
        item = ite.split('=');
        name = decodeURIComponent(item[0]);
        value = decodeURIComponent(item[1]);

        if (name.length && name !== '_k') {
          afterArgs[name] = value;
        }
      });
      allObj.afterArgs = afterArgs;
      allObj.beforeArgs = match;
    }

    return allObj;
  };

  allRefresh = () => {
    const pathname = window.location.hash;
    const params = this.getQueryStringObj(pathname);
    this.props.dispatch({
      type: 'detail_page/fetchAll',
      payload: {
        childrenToParentRefresh: true,
        object_api_name: params.beforeArgs[1],
        layout_type: 'detail_page',
        record_id: params.beforeArgs[2],
        query: params.afterArgs,
        recordType: _.get(params.afterArgs, 'recordType'),
      },
    });
  };
  recordFormItem = () => {
    const {
      renderViewLayout,
      component,
      fieldList,
      relatedList,
      describe,
      record,
      location,
      pageType,
      childrenToParentRefresh,
    } = this.props;
    const tabPaneItems = relatedList.map((relatedLayout, index) => {
      const {
        header,
        fields,
        default_sort_by,
        ref_obj_describe,
        related_list_name,
        default_sort_order,
        loose_relation = false,
        hidden_when,
      } = relatedLayout;

      const { actionShow: listShow } = getActionShowableProps({
        actionLayout: relatedLayout,
        recordData: {},
        parentRecord: {},
        pageType,
      });

      const showInDevice = checkoutShowableDevice({
        layout: relatedLayout,
      });

      const cardKey = `card_tab_${header}_${ref_obj_describe}_${record.id}`;
      const indexKey = `related_index_page_${header}_${ref_obj_describe}`;

      const { relatedFieldList, dispatch, loading } = this.props;

      if (_.isEmpty(relatedLayout)) {
        return '<span>没有找到相关列表布局配置</span>';
      } else {
        // 临时先不删除，防止其他地方有使用，当其他地方确定没有使用的时候，统一使用外部传参
        const refObjectDescribe = _.find(relatedFieldList, { api_name: ref_obj_describe });

        const refObjectFieldDescribe = !loose_relation
          ? _.find(_.get(refObjectDescribe, 'fields'), { related_list_api_name: related_list_name })
          : {};
        if (listShow && showInDevice) {
          const relatedLayoutType = _.get(relatedLayout, 'type', 'related_list');
          if (
            relatedLayoutType == 'related_list' &&
            !_.isEmpty(refObjectDescribe) &&
            (loose_relation || !_.isEmpty(refObjectFieldDescribe))
          ) {
            // *默认list
            return (
              <TabPane
                tab={crmIntlUtil.fmtStr(_.get(relatedLayout, 'header.i18n_key'), header)}
                key={cardKey}
              >
                {_.isEmpty(record) ? (
                  'No Data'
                ) : (
                  <RelatedList
                    component={relatedLayout}
                    refObjectDescribe={refObjectDescribe}
                    loose_relation={loose_relation}
                    dispatch={this.props.dispatch}
                    location={location}
                    parentRecord={record}
                    onUpdateAfterRowsSelectedOk={this.onUpdateAfterRowsSelectedOk}
                    allRefresh={this.allRefresh}
                    childrenToParentRefresh={childrenToParentRefresh}
                  />
                )}
              </TabPane>
            );
          } else if (relatedLayoutType == 'milestone') {
            // *里程碑
            return (
              <TabPane
                tab={crmIntlUtil.fmtStr(_.get(relatedLayout, 'header.i18n_key'), header)}
                key={cardKey}
              >
                <RelatedMilestone
                  component={relatedLayout}
                  refObjectDescribe={refObjectDescribe}
                  loose_relation={loose_relation}
                  dispatch={this.props.dispatch}
                  location={location}
                  parentRecord={record}
                  onUpdateAfterRowsSelectedOk={this.onUpdateAfterRowsSelectedOk}
                  allRefresh={this.allRefresh}
                  childrenToParentRefresh={childrenToParentRefresh}
                />
              </TabPane>
            );
          } else if (relatedLayoutType == 'webView') {
            // *外嵌
            return (
              <TabPane
                tab={crmIntlUtil.fmtStr(_.get(relatedLayout, 'header.i18n_key'), header)}
                key={cardKey}
              >
                俺是外嵌页面
              </TabPane>
            );
          }
        } /* else {
          return '<span>没有找到相关列表对象的字段属性</span>'
        } */
      }
    });

    const field_section_key = 'related_list_key';
    if (!_.isEmpty(renderViewLayout)) {
      const renderView = _.get(renderViewLayout, 'view');
      const viewOptions = _.get(renderViewLayout, 'view_options');
      const customPanelStyle = _.get(
        viewOptions,
        `custom_panel_style.${field_section_key}`,
        _.get(viewOptions, 'custom_panel_style.default'),
      );
      const defaultDisabledKeys = _.get(viewOptions, 'default_disabled_key');
      const needPanelDisabled = _.indexOf(defaultDisabledKeys, field_section_key) >= 0;
      const defaultActiveKey = _.get(viewOptions, 'default_active_key');
      const isAccordion = _.get(viewOptions, 'is_accordion', false);
      const isBordered = _.get(viewOptions, 'is_bordered', true);
      const header = crmIntlUtil.fmtStr('header.related_list');
      switch (renderView) {
        case 'collapse': {
          return (
            <div style={{ marginBottom: 20 }}>
              <Collapse
                accordion={isAccordion}
                bordered={isBordered}
                defaultActiveKey={defaultActiveKey}
              >
                <Panel
                  header={header}
                  disabled={needPanelDisabled}
                  key={field_section_key}
                  className={styles.fieldSectionHeader}
                  style={customPanelStyle}
                >
                  <Tabs onChange={this.loadRelated}>{tabPaneItems}</Tabs>
                </Panel>
              </Collapse>
            </div>
          );
        }
        default: {
          break;
        }
      }
    } else {
      return (
        <div style={{ marginBottom: 20 }}>
          <Row className={styles.fieldSectionHeader}>
            <Col span={24}>
              <span>{crmIntlUtil.fmtStr('tab.related_list')}</span>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Tabs onChange={this.loadRelated}>{tabPaneItems}</Tabs>
            </Col>
          </Row>
        </div>
      );
    }
  };

  render() {
    const { children, ...modalProps } = this.props;
    const modalOpts = {
      ...modalProps,
    };

    return <span>{this.recordFormItem()}</span>;
  }
}

export default RelatedDetail;
