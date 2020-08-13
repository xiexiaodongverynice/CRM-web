import React from 'react';
import { Card, Tag, Spin } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import styles from '../../components/HomeCardScroll.less';
import * as CallBackUtil from '../../../../utils/callBackUtil';
import * as crmIntlUtil from '../../../../utils/crmIntlUtil';
import { todayStartTime } from '../../../../utils/date';

class HomeSchedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myScheduleList: [],
      loading: true,
    };
  }

  componentWillMount() {}
  componentWillReceiveProps = (nextProps) => {
    const { myScheduleList, totType, loading } = nextProps;

    const newScheduleList = _.sortBy(myScheduleList, (x) => {
      return x.real_start_time || x.start_time || x.start_date || x.call_date || x.plan_start_time;
    }).filter((v) => {
      const date =
        v.real_start_time || v.start_time || v.start_date || v.call_date || v.plan_start_time;
      return todayStartTime() < date;
    });

    this.setState({
      myScheduleList: newScheduleList,
      totType,
      loading,
    });
  };
  tag = (x) => {
    if (x.object_describe_name === 'event') {
      switch (x.status) {
        case '1':
          return <Tag color="#F7957A">{crmIntlUtil.fmtStr('label.event')}</Tag>;
        case '2':
          return <Tag color="#F36168">{crmIntlUtil.fmtStr('label.event')}</Tag>;
        default:
          return <Tag color="#d0cd5f">{crmIntlUtil.fmtStr('label.event')}</Tag>;
      }
    } else if (x.object_describe_name === 'call') {
      if (x.record_type.indexOf('plan') > -1) {
        switch (x.status) {
          case '1':
            return <Tag color="#5AD2A8">{crmIntlUtil.fmtStr('label.call')}</Tag>;
          default:
            return <Tag color="#108ee9">{crmIntlUtil.fmtStr('label.call')}</Tag>;
        }
      } else if (x.record_type.indexOf('report') > -1) {
        switch (x.status) {
          case '2':
            return <Tag color="#FFCC00">{crmIntlUtil.fmtStr('label.call')}</Tag>;
          case '3':
            return <Tag color="#4990EC">{crmIntlUtil.fmtStr('label.call')}</Tag>;
          default:
            return <Tag color="#108ee9">{crmIntlUtil.fmtStr('label.call')}</Tag>;
        }
      } else if (x.record_type === 'coach') {
        switch (x.status) {
          case '1':
            return <Tag color="#5AD2A8">{crmIntlUtil.fmtStr('label.call_coach')}</Tag>;
          default:
            return <Tag color="#108ee9">{crmIntlUtil.fmtStr('label.call_coach')}</Tag>;
        }
      }
    } else if (x.object_describe_name === 'time_off_territory') {
      return <Tag color="#CDD7DE">{crmIntlUtil.fmtStr('label.tot')}</Tag>;
    } else if (x.object_describe_name === 'my_event') {
      return <Tag color="#F7957A">{crmIntlUtil.fmtStr('label.my_event')}</Tag>;
    }
  };
  renderLuozhenCall = (x) => {
    if (x.record_type === 'plan' && !x.real_start_time) {
      return `${moment.unix(x.start_time / 1000).format('HH:mm')} ${x.customer__r.name}`;
    } else if (x.real_start_time) {
      return `${moment.unix(x.real_start_time / 1000).format('HH:mm')} ${x.customer__r.name}`;
    }
  };
  scheduleTitle = (x) => {
    const { eventType, totType } = this.state;
    if (x.object_describe_name === 'event') {
      return window.isStraumann()
        ? `${moment.unix(x.plan_start_time / 1000).format('HH:mm')} ${x.name}`
        : `${moment.unix(x.start_time / 1000).format('HH:mm')} ${x.name}`;
    } else if (x.object_describe_name === 'call') {
      return window.isLuozhen()
        ? this.renderLuozhenCall(x)
        : window.isStraumann()
        ? `${moment.unix(x.call_date / 1000).format('HH:mm')} ${x.customer__r.name}`
        : `${moment.unix(x.start_time / 1000).format('HH:mm')} ${x.customer__r.name}`;
    } else if (x.object_describe_name === 'time_off_territory') {
      const optionsLabel = crmIntlUtil.fmtStr(
        `options.${x.object_describe_name}.type.${x.type}`,
        _.get(_.find(totType, { value: x.type }), 'label'),
      );
      return `${moment.unix(x.start_date / 1000).format('HH:mm')} ${optionsLabel}`;
    } else if (x.object_describe_name === 'my_event') {
      return `${moment.unix(x.my_time_begin / 1000).format('HH:mm')} ${x.name}`;
    }
  };
  okHandler = (x) => {
    CallBackUtil.dealNeedCallBack({
      location: this.props.location,
    });
  };
  scheduleCard = () => {
    const { myScheduleList, loading } = this.state;
    const myScheduleLists = (myScheduleList || []).map((x) => {
      if (
        x.object_describe_name === 'call' &&
        x.status !== '1' &&
        x.status !== '2' &&
        x.status !== '计划中' &&
        x.status !== '已完成'
      ) {
        if (window.isStraumann()) {
          // 草稿
          return (
            <li key={x.id} style={{ marginBottom: '0.3em' }} onClick={this.okHandler.bind()}>
              {this.tag(x)}
              <a
                href={`#/object_page/${x.object_describe_name}/${x.id}/detail_page?recordType=${x.record_type}`}
              >
                {this.scheduleTitle(x)}
              </a>
            </li>
          );
        }
      } else {
        return (
          <li key={x.id} style={{ marginBottom: '0.3em' }} onClick={this.okHandler.bind()}>
            {this.tag(x)}
            <a
              href={`#/object_page/${x.object_describe_name}/${x.id}/detail_page?recordType=${x.record_type}`}
            >
              {this.scheduleTitle(x)}
            </a>
          </li>
        );
      }
    });
    const cardProps = {
      title: crmIntlUtil.fmtStr('tab.my_schedule'),
      bordered: false,
    };
    if (loading) {
      return (
        <Spin spinning={loading}>
          <Card {...cardProps}>
            <h2 style={{ textAlign: 'center' }}>
              {crmIntlUtil.fmtStr('message.no_arrangement_list')}
            </h2>
          </Card>
        </Spin>
      );
    } else {
      if (!_.isEmpty(myScheduleLists)) {
        return (
          <Card
            {...cardProps}
            extra={<a href="#fc_calendar">{crmIntlUtil.fmtStr('action.more')}</a>}
          >
            <ul
              className={styles.Scroll}
              style={{
                whiteSpace: 'no-wrap',
                textAlign: 'justify',
                padding: '1em',
                overflowY: 'auto',
                overflowX: 'hidden',
                maxHeight: '140px',
                fontFamily: '-apple-system',
                marginTop: '-15px',
              }}
            >
              {myScheduleLists}
            </ul>
          </Card>
        );
      } else {
        return (
          <Card {...cardProps}>
            <h2 style={{ textAlign: 'center' }}>
              {crmIntlUtil.fmtStr('message.no_arrangement_list')}
            </h2>
          </Card>
        );
      }
    }
  };
  render() {
    return <div>{this.scheduleCard()}</div>;
  }
}

export default HomeSchedule;
