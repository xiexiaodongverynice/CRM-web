/**
 * Created by xinli on 2017/9/4.
 */
import React from 'react';
import { Card, Tag, Spin } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import * as recordService from '../../../../services/object_page/recordService';
import HomeNoticeDetail from './HomeNoticeDetail';
import * as crmIntlUtil from '../../../../utils/crmIntlUtil';

class NoticeWidget extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      myNoticeList: [
      ],
      loading: true,
    };
  }

  componentDidMount() {
    recordService.queryRecordList({ dealData: {
      objectApiName: 'notice',
      criterias: [
        { field: 'profiles', operator: 'contains', value: ['$$CurrentProfileId$$'] },
        { field: 'expire_date', operator: '>', value: [new Date().getTime()] },
      ],
      orderBy: 'publish_date',
      order: 'desc',
      joiner: 'and',
      pageSize: 1,
      pageNo: 1,
    } }).then((response) => {
      const { result: myNoticeList } = response;
      if (!_.isEmpty(myNoticeList)) {
        this.setState({
          myNoticeList,
          loading: false,
        });
      } else {
        this.setState({
          loading: false,
        });
      }
    });
  }

  render() {
    const { myNoticeList, loading } = this.state;
    const cardProps = {
      title: crmIntlUtil.fmtStr('tab.fc_notice'),
      bordered: false
    };
    if(loading){
      return (
        <Spin spinning={loading}>
          <Card {...cardProps}>
            <h2 style={{ textAlign: 'center' }}>{crmIntlUtil.fmtStr('message.no_notice')}</h2>
          </Card>
        </Spin>
      );
    }else{
      if (!_.isEmpty(myNoticeList)) {
        const [notice] = myNoticeList;
        return (
          <Card
            {...cardProps}
            extra={<a href="#/fc_notice">{crmIntlUtil.fmtStr('action.more')}</a>}
          >
            <HomeNoticeDetail notice={notice} />
          </Card>
        );
      } else {
        return (
          <Card {...cardProps} >
            <h2 style={{ textAlign: 'center' }}>{crmIntlUtil.fmtStr('message.no_notice')}</h2>
          </Card>
        );
      }
    }
  }
}

export default NoticeWidget;
