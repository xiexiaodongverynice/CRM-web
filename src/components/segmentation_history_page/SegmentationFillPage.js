import React from 'react';
import _ from 'lodash';
import { hashHistory } from 'dva/router';
import {
  Button, Row, Col,
} from 'antd';
import * as CallBackUtil from '../../utils/callBackUtil';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';

class SegmentationFillPage extends React.Component {
  constructor(props) {
    // consoleUtil.log('constructor');
    super(props);
    this.state = {

    };
  }
  getInitialState = () => {}

  componentWillMount = () => {
  }
  componentWillReceiveProps = () => {
  };
  componentWillUpdate = () => {
  }
  componentDidUpdate = () => {

  }
  componentWillUnmount = () => {
  }

  goDetail = () => {
    const { segmentationId } = this.props;
    const detailUrl = 'object_page/:object_api_name/:record_id/detail_page'.replace(':object_api_name', 'segmentation_history').replace(':record_id', segmentationId);
    CallBackUtil.callBackToGo(detailUrl);
  }
  callBack = () => {
    const { segmentationId } = this.props;
    const detailUrl = 'object_page/:object_api_name/:record_id/detail_page'.replace(':object_api_name', 'segmentation_history').replace(':record_id', segmentationId);
    CallBackUtil.callBackDeal({
      callback_url: detailUrl, // 如果雷坑丢失的时候，需要有一个页面可以返回
    });
  }


  buttonListItems = (bear) => {
    return (
      <div style={{ marginBottom: 20, padding: 40 }}>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button
              type="default"
              style={{ marginLeft: 8 }}
              onClick={this.callBack}
              key="callback"
            >{crmIntlUtil.fmtStr('action.cancel')}
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
  }


  pageDetailItems = () => {
    const { segmentationRecordData, secretJwtData, dispatch } = this.props;
    const segmentationUrl = _.get(segmentationRecordData, 'url');

    if (_.isEmpty(segmentationUrl)) {
      return '没有找到定级问卷';
    } else if (_.isEmpty(secretJwtData)) {
      return '获取定级问卷加密信息失败';
    } else {
      return (
        <div style={{ textAlign: 'center' }}>
          <iframe src={`${segmentationUrl}?x_field_1=${secretJwtData}`} style={{ width: '1000px', height: '800px', border: '0px' }} />
        </div>
      );
    }
  };

  render() {
    return (
      <div style={{ width: '100%' }}>
        {this.buttonListItems('head')}
        {this.pageDetailItems()}
        {this.buttonListItems('bottom')}
      </div>
    );
  }
}

SegmentationFillPage.proTypes = {
  // onSearch: PropTypes.func.isRequired,
  // onEdit : PropTypes.func.isRequired,
  // user: PropTypes.array.isRequired,
};

export default SegmentationFillPage;

