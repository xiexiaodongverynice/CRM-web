import React from 'react';
import _ from 'lodash';
import { hashHistory } from 'dva/router';
import { Modal, Button, Row, Col } from 'antd';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import * as CallBackUtil from '../../utils/callBackUtil';

const confirm = Modal.confirm;

class CoachFillPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  getInitialState = () => {
  };
  componentWillMount = () => {
  };
  componentWillReceiveProps = () => {
  };
  componentWillUpdate = () => {
  };
  componentDidUpdate = () => {
  };
  componentWillUnmount = () => {
  };

  goDetail = () => {
    const { coachId, location } = this.props;
    const search = location.search;
    // const detailUrl = `object_page/coach_feedback/${coachId}/detail_page${search}`;
    const detailUrl = 'object_page/:object_api_name/:record_id/detail_page'.replace(':object_api_name', 'coach_feedback').replace(':record_id', coachId);
    CallBackUtil.callBackToGo(`${detailUrl}${search}`);
    // confirm({
    //   title: '确定下一步?',
    //   onOk() {
    //     hashHistory.push(detailUrl);
    //   },
    // });
  };
  callBack = () => {
    const { coachId, location } = this.props;
    const search = location.search;
    const detailUrl = 'object_page/:object_api_name/:record_id/detail_page'.replace(':object_api_name', 'coach_feedback').replace(':record_id', coachId);
    CallBackUtil.callBackDeal({
      callback_url: `${detailUrl}${search}`, // 如果雷坑丢失的时候，需要有一个页面可以返回
    });

    // confirm({
    //   title: '确定返回?',
    //   onOk() {
    //     window.history.go(-1);
    //   },
    // });
  };
  buttonListItems = (bear) => {
    return (
      <div style={{ marginBottom: 20 }}>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button
              type="default"
              style={{ marginLeft: 8 }}
              onClick={this.callBack}
              key="callback"
            >
              {crmIntlUtil.fmtStr('action.cancel')}
            </Button>
            <Button
              type="primary"
              style={{ marginLeft: 8 }}
              onClick={this.goDetail}
              key="ok"
            >
              {crmIntlUtil.fmtStr('action.done')}
            </Button>
          </Col>
        </Row>
      </div>
    );
  };

  pageDetailItems = () => {
    const { coachRecordData, secretJwtData } = this.props;
    const coachUrl = _.get(coachRecordData, 'url');
    if (_.isEmpty(coachUrl)) {
      return '没有找到辅导问卷';
    } else if (_.isEmpty(secretJwtData)) {
      return '获取辅导问卷加密信息失败';
    } else {
      return (
        <div style={{ textAlign: 'center' }}>
          <iframe src={`${coachUrl}?x_field_1=${secretJwtData}`} style={{ width: '1000px', height: '800px', border: '0px' }} />
        </div>
      );
    }
  };

  render() {
    return (
      <div style={{ width: '100%' }}>
        {this.buttonListItems('head')}
        {this.pageDetailItems()}
      </div>
    );
  }
}

CoachFillPage.proTypes = {
};

export default CoachFillPage;

