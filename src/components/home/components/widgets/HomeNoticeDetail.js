import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col } from 'antd';
import styles from '../../components/HomeCardScroll.less';
import * as crmIntlUtil from '../../../../utils/crmIntlUtil';

class HomeNoticeDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notice: {},
    };
  }
  componentWillMount() {
    const { notice } = this.props;
    this.setState({
      notice,
    });
  }
  componentWillReceiveProps = (nextProps) => {
  };
  componentWillUpdate = () => {
  };
  componentDidUpdate = () => {
  };
  componentWillUnmount = () => {
  };

  render() {
    const { notice } = this.state;
    return (
      <div style={{ marginTop: '-15px' }}>
        <Row>
          <Col span={24}>
            <h3 style={{ textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <a href={`#/fc_notice/view?id=${notice.id}`} title={notice.name}>{notice.name}</a></h3>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'center' }}>
            <pre
              className={styles.Scroll}
              style={{
                whiteSpace: 'pre-wrap',
                textAlign: 'justify',
                padding: '1em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxHeight: '100px',
                fontFamily: '-apple-system',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              {notice.description}</pre>
          </Col>
        </Row>
        <Row align="bottom">
          <Col span={24} style={{ textAlign: 'right' }}>
            <h6>{crmIntlUtil.fmtStr('label.publish_date')}:<i>{moment.unix(notice.publish_date / 1000).format('YYYY-MM-DD HH:mm')}</i></h6>
          </Col>
        </Row>
      </div>
    );
  }
}
HomeNoticeDetail.propTypes = {
};
export default HomeNoticeDetail;
