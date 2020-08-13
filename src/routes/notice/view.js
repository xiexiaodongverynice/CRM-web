import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { connect } from 'dva';
import { hashHistory } from 'dva/router';
import { Row, Col, Button } from 'antd';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import AttachmentFieldItem from '../../components/DataRecord/AttachmentFieldItem';

const ViewNotice = ({ dispatch, notice, location, loading }) => {
  return (
    <div className="k_container">
      <div className="bg_white">
        <Row>
          <Col span={24} style={{ textAlign: 'center' }}>
            <h1>{notice.name}</h1>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'center' }}>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                textAlign: 'justify',
                padding: '1em',
                fontSize: '1.1em',
              }}
            >
              {notice.description}
            </pre>
          </Col>
        </Row>
        {!_.isEmpty(notice.attachment) && (
          <Row>
            <Col span={12} style={{ paddingLeft: '10px' }}>
              <AttachmentFieldItem value={notice.attachment} relationField={{}} onlyView />
            </Col>
          </Row>
        )}
        <Row>
          <Col span={24} style={{ textAlign: 'right', padding: '1em' }}>
            <h3>
              {crmIntlUtil.fmtStr('field.publish_date', '发布时间')} :{' '}
              <i>{moment.unix(notice.publish_date / 1000).format('YYYY-MM-DD HH:mm')}</i>
            </h3>
          </Col>
        </Row>
      </div>
      <Row span={24}>
        <Col span={24} style={{ textAlign: 'right', paddingTop: 20 }}>
          <Button type="default" size="large" onClick={GoBack.bind(this)}>
            {crmIntlUtil.fmtStr('action.callback', '返回')}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

const GoBack = () => {
  hashHistory.go(-1);
};
function mapStateToProps(state) {
  const { notice } = state.notice_form;
  return {
    notice,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    onNextStep: () => {
      dispatch(nextStep());
    },
  };
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ViewNotice);
