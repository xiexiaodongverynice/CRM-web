import React from 'react'
import {
  Button, Row, Col, } from 'antd';
import * as CallBackUtil from '../../utils/callBackUtil'

const Warner = ({ content,apiName,recordType,needCallBack=true }) => {
  const callBackAction = () => {
    CallBackUtil.callBackDeal({
      callback_code:'CALLBACK_TO_INDEX',
      apiName,
      recordType
    });
  }

  if (_.isEmpty(apiName) || _.isEmpty(recordType)) {
    needCallBack=false;
  }

  return (<div style={{marginBottom: 20}}>
    {
      needCallBack && <Row>
        <Col span={24} style={{textAlign: 'right'}}>
          <Button
            type='default'
            style={{marginLeft: 8}}
            key={`callback_${apiName}`}
            onClick={callBackAction.bind(this, {})}
          >返回</Button>
        </Col>
      </Row>
    }
    <Row>
      <Col span={24} style={{textAlign: 'left'}}>
        {content}
      </Col>
    </Row>
  </div>);

}


// Warner.propTypes = {
//   content: PropTypes.string,
// }

export default Warner
