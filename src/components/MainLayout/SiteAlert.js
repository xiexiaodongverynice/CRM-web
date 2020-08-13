/**
 * Created by xinli on 2017/9/22.
 */
import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Icon, Popover, Row, Col, Tag, Badge } from 'antd';
import { Link } from 'react-router';
import styles from './Header.less';
import * as recordService from '../../services/object_page/recordService';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';
import style from '../../components/home/components/HomeCardScroll.less';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import FormEvent from '../common/FormEvents';

const tagColors = {
  0: '#87d068',
  1: '#2db7f5',
  2: '#87d068',
  3: '#108ee9',
  4: '#d0cd5f',
  5: '#d0764a'
};

const AlertItem = ({ record, onMarkRead, alertTypes }) => {
  const typeTag = (type) => {
    const alertTypesLabel = crmIntlUtil.fmtStr(`options.alert.type.${type}`, _.get(_.find(alertTypes, { value: type }), 'label'));
    return (
      <Tag color={tagColors[type] || '#87d068'} >{alertTypesLabel}</Tag>
    );
  };
  return (
    <li key={record.id} style={{ padding: '0.5em', borderTop: '1px solid #f4f4f4', borderBottom: '1px solid #f4f4f4' }}>
      <Row type="flex" justify="space-between">
        <Col span={18}>
          <div>
            <Link to={`object_page/alert/${record.id}/detail_page?recordType=${record.record_type}`} onClick={onMarkRead}>
              {typeTag(record.type)}
              <strong>{record.name}</strong>
            </Link>
          </div>
          <div className={styles.alertItem} style={{ color: '#828080' }} dangerouslySetInnerHTML={{ __html: record.content }} />
        </Col>
        <Col span={6} style={{ textAlign: 'right' }}>
          <Link onClick={onMarkRead}>{crmIntlUtil.fmtStr('alert.marked_as_read')}</Link>
        </Col>
      </Row>
    </li>);
};
const ALERT_REFRESH = 'alert_refresh';
const ALERT_ON_MAKEREADED = 'alert_on_make_read';
class SiteAlert extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: [
      ],
      total: ''
    };
  }
  componentWillMount() {
    Promise
      .resolve(
        fieldDescribeService.loadObjectFieldDescribe({ object_api_name: 'alert', field_api_name: 'type' }),
      )
      .then((response) => {
        if (!_.isEmpty(response)) {
          const { options } = response;
          this.setState({
            alertTypes: options
          });
        }
      })
      .then(this.loadUnreadAlerts.bind(this));
  }

  componentWillReceiveProps(newProps, prevProps) {
    const reloadTimestamp = _.get(newProps, 'reloadTimestamp');
    const preReloadTimestamp = _.get(prevProps, 'reloadTimestamp');

    if (reloadTimestamp !== null && reloadTimestamp !== preReloadTimestamp) {
      this.loadUnreadAlerts();
      return;
    }

    // 其他对消息的更新通知会改变timestamp值
    const lastSuccessOperation = _.result(newProps, 'lastSuccessOperation', {});
    const { object_api_name, actionOperactionCode, timestamp } = lastSuccessOperation;
    const prevTimestamp = _.chain(prevProps).result('lastSuccessOperation').result('timestamp').value();
    if (object_api_name === 'alert' && (actionOperactionCode === 'UPDATE' || actionOperactionCode === 'DETAIL')) {
      if (timestamp !== prevTimestamp) {
        this.loadUnreadAlerts();
      }
    }
  }

  componentDidMount() {
    FormEvent.subscribe(ALERT_REFRESH, (formEvent) => {
      this.loadUnreadAlerts();
    });
    FormEvent.subscribe(ALERT_ON_MAKEREADED, (formEvent) => {
      const { record } = formEvent;
      this.onMarkRead(record);
    });
  }

  onMarkRead(record) {
    const { id, version } = record;
    Promise.resolve(
      recordService.updateRecord({
        object_api_name: 'alert',
        id,
        dealData: {
          status: '1',
          id,
          version
        }
      }),
    ).then((response) => {
      this.loadUnreadAlerts();
    });
  }

  onMarkAllRead() {
    const { messages } = this.state;
    const data = messages.map((x) => {
      return {
        id: x.id,
        version: x.version,
        status: '1'
      };
    });
    Promise
      .resolve(recordService.batchUpdateRecords({ object_api_name: 'alert', dealData: { data } }))
      .then((response) => {
        this.loadUnreadAlerts();
      });
  }

  loadUnreadAlerts() {
    const userId = localStorage.getItem('userId');
    Promise
      .resolve(
        recordService.queryRecordList({
          dealData: {
            objectApiName: 'alert',
            joiner: 'and',
            criterias: [
              { field: 'status', operator: '==', value: [0] }, // 仅查询未读消息
              { field: 'owner', operator: '==', value: [`${userId}`] }
            ],
            orderBy: 'create_time',
            order: 'desc',
            pageSize: 100000,
            pageNo: 1
          }
        }),
      )
      .then((response) => {
        if (response.status === 200 && response.result) {
          this.setState({
            messages: response.result,
            total: response.resultCount
          });
        }
      });
  }

  render() {
    const { messages, alertTypes, total } = this.state;
    const content = (
      <div style={{ width: '300px', padding: '0px' }}>
        <ul
          className={style.Scroll}
          style={{
            textAlign: 'justify',
            overflowY: 'auto',
            overflowX: 'hidden',
            maxHeight: '288px',
            fontFamily: '-apple-system'
          }}
        >
          {messages.map((x) => (
            <AlertItem
              record={x}
              onMarkRead={this.onMarkRead.bind(this, x)}
              alertTypes={alertTypes}
              key={`site_alert_item_${x.id}`}
            />
          ))}
        </ul>
        <div style={{ borderTop: '1px solid #f4f4f4', paddingTop: '0.5em' }}>
          <Link to="/object_page/alert/index_page">{crmIntlUtil.fmtStr('alert.view_all_alert')}</Link>
        </div>
      </div>
    );
    const MarkAllRead = () => {
      if (messages && messages.length > 0) {
        return (
          <span style={{ float: 'right', fontSize: '0.8em' }}>
            <Link onClick={this.onMarkAllRead.bind(this)}>{crmIntlUtil.fmtStr('alert.marked_all_as_read')}</Link>
          </span>
        );
      } else {
        return <div />;
      }
    };
    return (
      <Popover
        content={content}
        trigger="hover"
        placement="bottomLeft"
        overlayStyle={{ padding: 0 }}
        title={
          (
            <div>
              <span style={{ fontSize: '1.2em' }}><strong>{crmIntlUtil.fmtStr('alert.unread')}{crmIntlUtil.fmtStr('(alert.total')}{total}{crmIntlUtil.fmtStr('alert.count)')}</strong></span>
              <MarkAllRead />
            </div>
          )
        }
      >
        <Badge count={total}>
          <Icon className={styles.trigger} type="mail" />
        </Badge>
      </Popover>
    );
  }
}

function mapStateToProps(state) {
  const { lastSuccessOperation } = _.result(state, 'object_page', {});
  // const { reloadTimestamp } = _.result(state, 'app', {});
  return {
    lastSuccessOperation
    // reloadTimestamp
  };
}

export default connect(mapStateToProps)(SiteAlert);
