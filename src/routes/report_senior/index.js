import React from 'react';
import { Row, Select, Col, Button } from 'antd';
import { connect } from 'dva';
import cx from 'classnames';
import sizeStyles from '../../themes/size.less';
import styles from '../report/index.less';
import { DateMonthDropDown } from '../report/commonElements';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { UserLevelMap, ProductLinesMap, AllProductUserLevelMap, GrafalonUserLevelMap } from '../../utils/dicts';

const labelStyle = {
  textAlign: 'right',
  fontWeight: 'bold',
  display: 'block',
  paddingRight: 10,
};

const rowClass = cx(sizeStyles['height-50'], sizeStyles['lineHeight-50']);

const ReportIndexHKSenior = ({dispatch, YM, level, levels, productLines, product_line}) => {

  const levelChange = (v) => {
    dispatch({
      type: 'report_index_senior/updateState',
      payload: {
        level: v,
      },
    });
  };

  const download = () => {
    dispatch({
      type: 'report_index_senior/download',
    });
  };

  const downloadAllProduct = () => {
    dispatch({
      type: 'report_index_senior/download_all_product',
    });
  };

  const downloadGrafalon = () => {
    dispatch({
      type: 'report_index_senior/download_grafalon',
    });
  };


  const productLineChange = (v) => {
    dispatch({
      type: 'report_index_senior/updateState',
      payload: {
        product_line: v,
      },
    });
  };

  return (
    <div className="k_container bg_white">

      <Row
        className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}
      >
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.admin_report')}
        </span>
      </Row>
      <Row className={rowClass}>
        <Col span={3} style={labelStyle}>
          {
            crmIntlUtil.fmtStr('text.report.month')
          }
          :
        </Col>
        <Col span={3}>
          <DateMonthDropDown startDate="2018-03" defaultValue={YM} dispatch={dispatch} ns="report_index_senior/updateState"/>
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

      <Row
        className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}
      >
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.admin_all_product_report')}
        </span>
      </Row>

      <Row className={rowClass}>
        <Col span={3} style={labelStyle}>
          {
            crmIntlUtil.fmtStr('text.report.month')
          }
          :
        </Col>
        <Col span={3}>
          <DateMonthDropDown startDate="2018-12" defaultValue={YM} dispatch={dispatch} ns="report_index_senior/updateState"/>
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
                    {AllProductUserLevelMap[t]}
                  </Option>
                );
              })
            }
          </Select>
        </Col>
      </Row>

      <Row className={rowClass}>
        <Button type='primary' onClick={downloadAllProduct} style={{marginLeft: 142.5}}>
          {crmIntlUtil.fmtStr('text.report.download')}
        </Button>
      </Row>

      <Row
        className={cx(sizeStyles['height-50'], sizeStyles['lineHeight-50'], styles.toolbar)}
      >
        <span className={styles['text-item']}>
          {crmIntlUtil.fmtStr('text.report.admin_Grafalon')}
        </span>
      </Row>

      <Row className={rowClass}>
        <Col span={3} style={labelStyle}>
          {
            crmIntlUtil.fmtStr('text.report.month')
          }
          :
        </Col>
        <Col span={3}>
          <DateMonthDropDown startDate="2018-12" defaultValue={YM} dispatch={dispatch} ns="report_index_senior/updateState"/>
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
                if(t !== 'RSM'){
                  return ( 
                    <Option key={t} value={t}>
                      {GrafalonUserLevelMap[t]}
                    </Option>
                  );
                }
              })
            }
          </Select>
        </Col>
      </Row>

      <Row className={rowClass}>
        <Button type='primary' onClick={downloadGrafalon} style={{marginLeft: 142.5}}>
          {crmIntlUtil.fmtStr('text.report.download')}
        </Button>
      </Row>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { YM,  level, levels, productLines, product_line} = state.report_index_senior;
  return {
    YM,
    level,
    levels,
    productLines,
    product_line,
  };
};


export default connect(mapStateToProps)(ReportIndexHKSenior);
