import React from 'react';
import { Row, Select, Col, Button } from 'antd';
import { connect } from 'dva';
import cx from 'classnames';
import sizeStyles from '../../themes/size.less';
import styles from '../report/index.less';
import { DateMonthDropDown } from '../report/commonElements';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { UserLevelMap, ProductLinesMap } from '../../utils/dicts';

const labelStyle = {
  textAlign: 'right',
  fontWeight: 'bold',
  display: 'block',
  paddingRight: 10,
};

const rowClass = cx(sizeStyles['height-50'], sizeStyles['lineHeight-50']);

const ReportIndexTWSenior = ({dispatch, YM, level, levels, productLines, product_line}) => {

  const levelChange = (v) => {
    dispatch({
      type: 'report_index_tw_senior/updateState',
      payload: {
        level: v,
      },
    });
  };

  const download = () => {
    dispatch({
      type: 'report_index_tw_senior/download',
    });
  };


  const productLineChange = (v) => {
    dispatch({
      type: 'report_index_tw_senior/updateState',
      payload: {
        product_line: v,
      },
    });
  };

  return (
    <div className="k_container bg_white">
      <Row className={rowClass}>
        <Col span={3} style={labelStyle}>
          {
            crmIntlUtil.fmtStr('text.report.month')
          }
          :
        </Col>
        <Col span={3}>
          <DateMonthDropDown startDate="2018-03" defaultValue={YM} dispatch={dispatch} ns="report_index_tw_senior/updateState"/>
        </Col>
        <Col span={3} style={labelStyle}>
          {
            crmIntlUtil.fmtStr('text.report.role')
          }
          :
        </Col>
        <Col span={3}>
          <Select onChange={levelChange} style={{ width: 120 }} defaultValue={level}>
            {
              levels.map(t => {
                return (
                  <Option key={t} value={t}>
                    {UserLevelMap[t]}
                  </Option>
                );
              })
            }
          </Select>
        </Col>

      </Row>

      <Row className={rowClass}>
        <Col span={3} style={labelStyle}>
          {
            crmIntlUtil.fmtStr('text.report.product_line')
          }
          :
        </Col>
        <Col span={3}>
          <Select onChange={productLineChange} style={{ width: 120 }} defaultValue={product_line}>
            {
              productLines.map(t => {
                return (
                  <Option key={t} value={t}>
                    {ProductLinesMap[t]}
                  </Option>
                );
              })
            }
          </Select>
        </Col>
      </Row>

      <Row className={rowClass}>
        <Button type='primary' onClick={download} style={{marginLeft: 142.5}}>
          {crmIntlUtil.fmtStr('text.report.download')}
        </Button>
      </Row>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { YM,  level, levels, productLines, product_line} = state.report_index_tw_senior;
  return {
    YM,
    level,
    levels,
    productLines,
    product_line,
  };
};


export default connect(mapStateToProps)(ReportIndexTWSenior);
