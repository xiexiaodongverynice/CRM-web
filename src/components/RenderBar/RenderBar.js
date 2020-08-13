import React from 'react'
import {
  Form,
} from 'antd';
import styles from './RenderBar.less';
import * as crmIntlUtil from '../../utils/crmIntlUtil';

const FormItem = Form.Item;
const RenderBar = ({renderLayout, formItemLayout = {}}) => {

  const { render_type} = renderLayout;
  // const label = _.get(renderLayout,'label')
  const label = crmIntlUtil.fmtStr(_.get(renderLayout,'label.i18n_key'), renderLayout.label);

  if (_.isEmpty(render_type)) {
    return false;
  }

  if(_.isEmpty(label)){
    return (<FormItem
        {...formItemLayout}
      >
        <span className={styles[`${render_type}`]}>&nbsp;</span>
      </FormItem>
    );
  }
  return (<FormItem
      {...formItemLayout}
    >
      <span className={styles[`${render_type}`]}>{label}</span>
    </FormItem>
  );

}


export default RenderBar
