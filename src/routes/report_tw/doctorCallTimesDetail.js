import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button, DatePicker, Icon } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { hashHistory } from 'react-router';
import sizeStyles from '../../themes/size.less';
import styles from '../report/index.less';
import utilitiesStyles from '../../themes/utilities.less';
import { handleResult, getUserRole, getSubWhatDatas } from '../report/helpers';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { mapStateToProps } from './helpers';
import { NumberOrEmpty } from '../../utils/lo';
import { craftCallTimesTable } from '../report/commonElements';

const { MonthPicker } = DatePicker;
const Column = Table.Column;

const getRecordByData = (data) => {
  return {
    CustomerName: data.CustomerName,
    CustomerSegmentation: data.CustomerSegmentation,
    CallTarget: NumberOrEmpty(data.CallTarget),
    CallNumber: NumberOrEmpty(data.CallNumber),
    OnTarget: Boolean(data.OnTarget),
  }
}

const DoctorCallTimesDetail = ({ dispatch, location, loading, result = {}, YM}) => {

  const { data } = handleResult(result);

  const datas = getSubWhatDatas(data, getRecordByData, "_doctors");

  return (
    <div className="k_container bg_white">

      {
        craftCallTimesTable(datas)
      }

      <Row className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'])}>
        <div className={utilitiesStyles.right}>
          <Button type="primary" onClick={()=>{
            dispatch({
              type: 'report_index_tw/download',
              payload: {
                type: 'callTimes',
              },
            });
          }}>{crmIntlUtil.fmtStr('text.report.download')}</Button>
        </div>
      </Row>

    </div>
  );
};

export default connect(mapStateToProps)(DoctorCallTimesDetail);
