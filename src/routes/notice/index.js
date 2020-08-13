import React, { Component } from 'react';
import { connect } from 'dva';
import _ from 'lodash'
import { Table, Icon, Row, Col, Button, Tag, Popconfirm } from 'antd';
import { hashHistory, Link } from 'react-router';
import styles from '../app.less';
import moment from 'moment';
import { update_notice_status } from '../../services/report/reportService'
import * as crmIntlUtil from '../../utils/crmIntlUtil';

const Column = Table.Column;
const NoticeIndex = ({ dispatch, noticeList, location, loading, resultCount, current }) => {
  const onClickDelete = (id) => {
    dispatch({
      type: 'notice_index/deleteNotice',
      payload: {
        id,
      },
    });
  };

  const toDateString = (timestamp) => {
    return moment.unix(timestamp / 1000).format('YYYY-MM-DD HH:mm');
  };

  const changeStatus = (record) => {
    if (window.NEED_NOTICE_READ_LOG && _.get(record, 'read_status') !== '1'){
      const notice = _.get(record, 'id')
      update_notice_status(notice)
    }
  }

  return (
    <div className="k_container bg_white">
      <Table
        dataSource={noticeList}
        pagination={{
          total: resultCount,
          current,
          onChange: (page, pageSize) => {
            dispatch({
              type: 'notice_index/queryNoticeList',
              payload: {
                dealData: {
                  objectApiName: 'notice',
                  orderBy: 'create_time',
                  criterias: [
                    { field: 'profiles', operator: 'contains', value: ['$$CurrentProfileId$$'] }
                  ],
                  pageSize: 10,
                  pageNo: page
                }
              }
            });
          }
        }}
        rowKey="id"
        title={(record) => {
          // fc_hasFunctionPrivilege 是在index.js中国定义的全局函数
          // eslint-disable-next-line no-undef
          const publishNotice = fc_hasFunctionPrivilege('publish_notice') ? (<Button
            size="large"
            type="primary"
            onClick={() => { hashHistory.push('/fc_notice/add'); }}
            key="publishNotice"
            style={{ paddingRight: '15px', marginRight: '15px' }}
          >{crmIntlUtil.fmtStr('action.publish_notice','发布公告')}</Button>) : (<div />);

          const sendbox = fc_hasFunctionPrivilege('publish_notice') ? (<Button
            size="large"
            onClick={() => { hashHistory.push('/fc_notice/sendbox'); }}
            key="notice_send_box"
            style={{ paddingRight: '15px', marginRight: '15px' }}
          >{crmIntlUtil.fmtStr('action.me_publish_notice','我发布的')}</Button>) : (<div />);

          return (
            <Row gutter={12} type="flex" justify="space-between" align="bottom">
              <Col span={12}>
                <h1>{crmIntlUtil.fmtStr('header.notice','公告')}</h1>
              </Col>
              <Col span={12} className={styles.text_right}>
                {sendbox}
                {publishNotice}
              </Col>
            </Row>
          );
        }}
      >
        <Column
          title={`${crmIntlUtil.fmtStr('field.title','标题')}`}
          dataIndex="name"
          key="name"
          render={(text, record) => (
            <span onClick={() => changeStatus(record)}>
              <a href={`#/fc_notice/view/?id=${record.id}`}>{text}</a>
            </span>
          )}
        />
        <Column
          title={`${crmIntlUtil.fmtStr('field.priority','优先级')}`}
          dataIndex="priority"
          key="priority"
          render={(text, record) => (text === '1' ? <Tag color="red">{crmIntlUtil.fmtStr('label.major','重要')}</Tag> : <Tag>{crmIntlUtil.fmtStr('label.general','一般')}</Tag>)}
        />
        <Column
          title={`${crmIntlUtil.fmtStr('field.publish_date','发布时间')}`}
          dataIndex="publish_date"
          key="publish_date"
          render={(text, record) => (
            <span>
              {toDateString(record.publish_date)}
            </span>
          )}
        />
        <Column
          title={`${crmIntlUtil.fmtStr('field.expire_date','过期时间')}`}
          dataIndex="expire_date"
          key="expire_date"
          render={(text, record) => (
            <span>
              {toDateString(record.expire_date)}
            </span>
          )}
        />
        {
          window.NEED_NOTICE_READ_LOG && (
            <Column
              title="是否已读"
              dataIndex="read_log"
              key="read_log"
              render={(text, record) => (
                <span>
                  {_.get(record, 'read_status') === '1' ? '已读' : '未读'}
                </span>
              )}
            />
          )
        }
        {/* <Column
            title="操作"
            key="action"
            render={(text, record) => (
              <Popconfirm title="确认要删除公告？" okText="是" cancelText="否" onConfirm={onClickDelete.bind(this, record.id)}>
                <a href="#">删除</a>
              </Popconfirm>
            )}
          />*/}
      </Table>
    </div>
  );
};

function mapStateToProps(state) {
  const { noticeList, resultCount, current } = state.notice_index;
  return {
    noticeList,
    resultCount,
    current
  };
}
export default connect(mapStateToProps)(NoticeIndex);
