import React from 'react';
import _ from 'lodash';
import { Link, routerRedux, hashHistory } from 'dva/router';
import {
  Modal, Form, Select, InputNumber, Switch, Radio,
  Slider, Button, Upload, Icon, Input, Tabs, Card,Row,Col,
} from 'antd';
import consoleUtil from '../../utils/consoleUtil';

class SegmentationFillPage extends React.Component {
  constructor(props) {
    //consoleUtil.log('constructor');
    super(props);
    this.state = {

    }
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

  callBack = () => {
    const {segmentationId}  = this.props;
    let segmentationDetailUrl = `segmentation_history/${segmentationId}/segmentation_detail_page`;
    hashHistory.push(segmentationDetailUrl);
    // window.history.go(-1);
  }


  buttonListItems = (bear) => {
      return (
        <div  style={{marginBottom:20}}>
          <Row>
            <Col span={24} style={{ textAlign: 'center' }}>
              <Button type='default'
                      style={{ marginLeft: 8 }} onClick={this.callBack}
                      key="callback">放弃</Button>
              <Button type='primary'
                      style={{ marginLeft: 8 }} onClick={this.callBack}
                      key="ok">完成</Button>
            </Col>
          </Row>
        </div>
      );
  }


  pageDetailItems = () => {
    const { segmentationRecordData,secretJwtData, dispatch } = this.props;
    const segmentationUrl = _.get(segmentationRecordData,'url');
    if(_.isEmpty(segmentationUrl)){
      return '没有找到定级问卷'
    }else if(_.isEmpty(secretJwtData)){
      return '获取定级问卷加密信息失败'
    }else{
      return (
        <iframe src={`${segmentationUrl}?x_field_1=${secretJwtData}`} style={{width:'1000px',height:'800px'}}></iframe>
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
}

export default SegmentationFillPage;

