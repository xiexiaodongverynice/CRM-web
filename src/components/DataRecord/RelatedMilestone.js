/* eslint-disable no-case-declarations */
import React from 'react';
import _ from 'lodash';
import { hashHistory } from 'dva/router';
import moment from 'moment';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { Spin } from 'antd';
import * as recordService from '../../services/object_page/recordService';
import { callAnotherFunc } from '../../utils';
import { processCriterias } from '../../utils/criteriaUtil';
import * as Styles from './RelatedMilestone.less';

// * 组件文档地址 https://stephane-monnot.github.io/react-vertical-timeline/#/

class RelatedMilestone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      current: 1,
    };
  }

  componentWillMount() {
    this.fetchData();
  }

  componentDidMount() {}

  fetchData = (pageNumber = 1) => {
    const { component = {}, parentRecord } = this.props;
    const { dataSource } = this.state;
    const milestone_criterias = _.get(component, 'milestone_criterias', []);
    const orderBy = _.get(component, 'default_order_by', 'start_time');

    const query = {
      joiner: 'and',
      objectApiName: 'milestone_view',
      criterias: processCriterias(milestone_criterias, {}, parentRecord),
      orderBy,
      order: 'desc',
      pageSize: 10,
      pageNo: pageNumber,
    };
    this.setState(
      {
        loading: true,
      },
      async () => {
        await recordService.queryRecordList({ dealData: query }).then((response) => {
          const result = _.get(response, 'resultData.result', []);
          const pageCount = _.get(response, 'pageCount', 1);
          this.setState({
            dataSource: _.concat(dataSource, result),
            loading: false,
            pageCount,
          });
        });
      },
    );
  };

  contentOnClick = (item) => {
    const id = _.get(item, 'id', '');
    const objectApiName = _.get(item, 'source_object_api_name', 'master');
    const recordType = _.get(item, 'record_type', 'master');
    let domainName = window.location.origin;
    if (!domainName) {
      // *IE10以下（包括10）不支持 window.location.origin
      // *Edge支持
      domainName = `${window.location.protocol}//${window.location.hostname}${
        window.location.port ? `:${window.location.port}` : ''
      }`;
    }
    const detailUrl = `${domainName}/#/object_page/${objectApiName}/${id}/detail_page?recordType=${recordType}`;
    window.open(detailUrl, '_blank');
    // hashHistory.push(detailUrl);
  };

  onClickfetchMore = () => {
    const { current } = this.state;
    const pageNumber = current + 1;
    this.setState({
      current: pageNumber,
    });
    this.fetchData(pageNumber);
  };

  renderString = (itemValue, itemRecord) => {
    const type = _.get(itemValue, 'type', '');
    const value = _.get(itemValue, 'value', '');
    if (type && type == 'expression') {
      return callAnotherFunc(new Function('t', value), itemRecord);
    } else {
      return value;
    }
  };

  renderItemElement = (momentDataSource) => {
    const { component = {} } = this.props;
    const milestone_layout = _.get(component, 'milestone_layout', {});
    return _.map(momentDataSource, (item, key) => {
      const sourceRecordType = _.get(item, 'source_object_api_name');
      const itemLayout = _.get(milestone_layout, sourceRecordType, {});
      const iconWebStyle = _.get(itemLayout, 'webStyle', {});
      const iconColor = _.get(iconWebStyle, 'iconColor', '#fff');
      const iconSize = _.get(iconWebStyle, 'iconSize', 40);
      const iconCircleColor = _.get(iconWebStyle, 'circleColor', 'blue');
      const iconName = _.get(itemLayout, 'icon', {});
      const titleObj = _.get(itemLayout, 'title', '');
      const itemContent = _.get(itemLayout, 'contents', []);
      return (
        <VerticalTimelineElement
          // className="vertical-timeline-element--work"
          // contentStyle={{ cursor: 'pointer' }}
          contentArrowStyle={{ borderRight: '7px solid  #fff' }}
          // date="2011 - present"
          iconStyle={{
            background: iconCircleColor,
            color: iconColor,
            fontSize: iconSize,
            textAlign: 'center',
          }}
          icon={<i className={`icomoon ${iconName}`} />}
          key={`item${moment() + key}`}
        >
          <div className={Styles.content_box} onClick={this.contentOnClick.bind(this, item)}>
            <p className={Styles.element_title}>{this.renderString(titleObj, item)}</p>
            {_.map(itemContent, (ite, i) => {
              return <p key={i}>{this.renderString(ite, item)}</p>;
            })}
          </div>
        </VerticalTimelineElement>
      );
    });
  };

  renderItemTimeLine = () => {
    // *按日期分组生成对应日期树
    const { component = {} } = this.props;
    const { dataSource } = this.state;
    const orderBy = _.get(component, 'default_order_by', 'start_time');
    const mapData = {};
    _.each(dataSource, (ite) => {
      const orderByTime = moment(_.get(ite, orderBy)).format('YYYY-MM');
      if (!mapData[orderByTime]) {
        mapData[orderByTime] = [ite];
      } else {
        mapData[orderByTime].push(ite);
      }
    });

    return _.map(mapData, (item, key) => {
      return (
        <div style={{ paddingTop: '10px' }} key={`timeLine${moment() + key}`}>
          <div className={Styles.month_box}>{key}</div>
          <VerticalTimeline
            className={Styles.line}
            key={`timeLine${moment() + key}`}
            animate={false}
          >
            {this.renderItemElement(item)}
          </VerticalTimeline>
        </div>
      );
    });
  };

  render() {
    const { current, pageCount, dataSource } = this.state;
    return (
      <Spin spinning={this.state.loading} size="large">
        {/* <div className={Styles.milestone_box}>
          <div>{this.renderItemTimeLine()}</div>
          {current < pageCount ? (
            <div className={Styles.month_box} onClick={this.onClickfetchMore}>
              加载更多
            </div>
          ) : !_.isEmpty(dataSource) ? (
            <div className={Styles.month_box}>已经到底了</div>
          ) : (
            <div>暂无数据</div>
          )}
        </div> */}
        {_.isEmpty(dataSource) ? (
          <div className={Styles.no_data}>
            <div>暂无数据</div>
          </div>
        ) : (
          <div className={Styles.milestone_box}>
            <div>{this.renderItemTimeLine()}</div>
            {current < pageCount ? (
              <div className={Styles.month_box} onClick={this.onClickfetchMore}>
                加载更多
              </div>
            ) : (
              <div className={Styles.month_box}>已经到底了</div>
            )}
          </div>
        )}
      </Spin>
    );
  }
}

export default RelatedMilestone;
