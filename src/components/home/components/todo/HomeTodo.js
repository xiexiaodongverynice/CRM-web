import React from 'react';
import { Card, Tag, Spin } from 'antd';
import { Link, routerRedux, hashHistory } from 'dva/router';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import styles from '../../components/HomeCardScroll.less';
import * as crmIntlUtil from '../../../../utils/crmIntlUtil';
import * as CallBackUtil from '../../../../utils/callBackUtil';

class HomeTodo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      todoSegmentationList: [],
      todoCoachList: [],
      coachType: [],
      loading: true,
    };
  }

  componentWillMount() {}
  componentWillReceiveProps = (nextProps) => {
    const { todoCoachList, todoSegmentationList, coachType, loading, otherTodoList } = nextProps;
    this.setState({
      todoCoachList,
      todoSegmentationList,
      coachType,
      loading,
      otherTodoList,
    });
  };

  tag = (x) => {
    const checkLabel = () => {
      if (isMylan()) {
        const profile = fc_getProfile();
        const { status, owner } = x;
        let label;
        switch (status) {
          case 'proc_director_approval':
            label = crmIntlUtil.fmtStr('label.daishenpi');
            break;
          case 'proc_vendor_chosen':
            label = crmIntlUtil.fmtStr('label.proc_vendor_chosen');
            break;
          case 'application_approved':
          case 'hx_approved':
            if (owner == window.FC_CRM_USERID) {
              label = crmIntlUtil.fmtStr('label.my_event.status.application_approved');
            } else {
              label = crmIntlUtil.fmtStr('label.approval_waiting');
            }
            break;
          case 'proc_inquiry_sent':
          case 'proc_price_compare':
          case 'proc_processed':
            label = crmIntlUtil.fmtStr('label.daichuli');
            break;
          default:
            label = crmIntlUtil.fmtStr('label.daishenpi');
            break;
        }
        return label;
      }
      return '';
    };
    let tag;
    switch (x.object_describe_name) {
      case 'coach_feedback':
        tag = <Tag color="#87d068">{crmIntlUtil.fmtStr('label.coach_feedback')}</Tag>;
        if (isJmkx()) {
          tag = <Tag color="#87d068">{crmIntlUtil.fmtStr('label.call_coach_feedback')}</Tag>;
        }
        break;
      case 'segmentation_history':
        tag = <Tag color="#2db7f5">{crmIntlUtil.fmtStr('label.segmentation')}</Tag>;
        break;
      case 'customer':
        tag = (
          <Tag color="#2db7f5">
            {crmIntlUtil.fmtStr('tab.customer')} {checkLabel()}
          </Tag>
        );
        if (isMylan()) {
          tag = (
            <Tag color="#2db7f5">
              {crmIntlUtil.fmtStr('tab.customer')} {checkLabel()}
            </Tag>
          );
        }
        break;
      case 'my_event':
        tag = (
          <Tag color="#2db7f5">
            {crmIntlUtil.fmtStr('tab.my_event')} {checkLabel()}
          </Tag>
        );
        break;
      case 'my_promo_materials':
        tag = (
          <Tag color="#2db7f5">
            {crmIntlUtil.fmtStr('tab.my_promo_materials')} {checkLabel()}
          </Tag>
        );
        break;
      case 'my_vendor_approval':
        tag = (
          <Tag color="#2db7f5">
            {crmIntlUtil.fmtStr('tab.my_vendor_approval')} {checkLabel()}
          </Tag>
        );
        break;
      case 'dcr':
        tag = (
          <Tag color="#2db7f5">
            {crmIntlUtil.fmtStr('DCR')} {checkLabel()}
          </Tag>
        );
        break;
      case 'call_plan':
        tag = (
          <Tag color="#2db7f5">
            {crmIntlUtil.fmtStr('header.call.plan')} {checkLabel()}
          </Tag>
        );
        break;
      case 'call':
        tag = (
          <Tag color="#2db7f5">
            {crmIntlUtil.fmtStr('label.call')} {checkLabel()}
          </Tag>
        );
        break;
      case 'time_off_territory':
        tag = (
          <Tag color="#2db7f5">
            {crmIntlUtil.fmtStr('label.tot')} {checkLabel()}
          </Tag>
        );
        break;
      default:
        break;
    }
    return tag;
  };
  okHandler = (x) => {
    CallBackUtil.dealNeedCallBack({
      location: this.props.location,
    });
  };
  renderLabel(item) {
    let tag = item.name;
    const { coachType } = this.state;
    switch (item.object_describe_name) {
      case 'dcr':
        tag = item.customer__r ? item.customer__r.name : item.customer;
        break;
      case 'time_off_territory':
        tag = isJmkx() ? item.type : item.name;
        break;
      case 'coach_feedback':
        tag = _.get(_.find(coachType, { value: item.record_type }), 'label');
      default:
        break;
    }
    return tag;
  }
  TodoCard = () => {
    const { loading, todoCoachList, todoSegmentationList, coachType, otherTodoList } = this.state;
    const getLink = (x) => {
      return `#/object_page/${x.object_describe_name}/${x.id}/detail_page?recordType=${
        x.record_type
      }`;
    };
    const todoCoach = (todoCoachList || []).map((x) => (
      <li key={x.id} style={{ marginBottom: '0.3em' }} onClick={this.okHandler.bind()}>
        {this.tag(x)}
        <a href={getLink(x)}>
          {crmIntlUtil.fmtStr(
            `options.${x.object_describe_name}.record_type.${x.record_type}`,
            _.get(_.find(coachType, { value: x.record_type }), 'label'),
          )}{' '}
          {crmIntlUtil.fmtStr('label.TBC')}
        </a>
      </li>
    ));
    const todoSegmentation = (todoSegmentationList || []).map((x) => (
      <li key={x.id} style={{ marginBottom: '0.3em' }} onClick={this.okHandler.bind()}>
        {this.tag(x)}
        <a href={getLink(x)}>
          {x.owner__r.name} {crmIntlUtil.fmtStr('action.submit')} {x.customer__r.name}{' '}
          {crmIntlUtil.fmtStr('label.segmentation')}
        </a>
      </li>
    ));

    const otherTodos = (otherTodoList || []).map((x) => {
      const label = this.renderLabel(x);
      if (!_.isUndefined(label)) {
        return (
          <li key={x.id} style={{ marginBottom: '0.3em' }} onClick={this.okHandler.bind()}>
            {this.tag(x)}
            <a href={getLink(x)}>{label}</a>
          </li>
        );
      }
      return null;
    });
    const cardProps = {
      title: crmIntlUtil.fmtStr('tab.my_to_do'),
      bordered: false
    };    
    if(loading){
      return (
        <Spin spinning={loading}>
          <Card {...cardProps}>
            <h2 style={{ textAlign: 'center' }}>{crmIntlUtil.fmtStr('message.no_to_do_list')}</h2>
          </Card>
        </Spin>
      );
    }else{
      if (
        !_.isEmpty(todoCoachList) ||
        !_.isEmpty(todoSegmentationList) ||
        !_.isEmpty(otherTodoList)
      ) {
        return (
          <Card {...cardProps}>
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
                wordBreak: 'break-all'
              }}
            >
              {todoCoach}
              {todoSegmentation}
              {otherTodos}
            </ul>
          </Card>
        );
      } else {
        return (
          <Card {...cardProps}>
            <h2 style={{ textAlign: 'center' }}>{crmIntlUtil.fmtStr('message.no_to_do_list')}</h2>
          </Card>
        );
      }
    }
  };

  render() {
    return <div>{this.TodoCard()}</div>;
  }
}

export default HomeTodo;
