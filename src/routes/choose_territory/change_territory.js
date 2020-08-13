import React, { Component } from 'react';
import { connect } from 'dva';
import { hashHistory } from 'dva/router';
import { Form, Button, Icon, Select } from 'antd';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import styles from './choose_territory.less';
import storageUtil from '../../utils/storageUtil';

const FormItem = Form.Item;
const Option = Select.Option;
const ChangeTerritory = ({
  dispatch,
  form: {
    getFieldDecorator,
    validateFieldsAndScroll,
    getFieldsError,
    getFieldError,
    isFieldTouched,
  },
}) => {
  // const userTerritory = JSON.parse(localStorage.getItem('userTerritory'));
  // let selected = userTerritory.id;
  function renderOption() {
    const userTerritoryList = JSON.parse(localStorage.getItem('userTerritoryList'));
    return userTerritoryList.map((item) => {
      return (
        <Option value={item.id} key={item.id}>
          {item.name}
        </Option>
      );
    });
  }

  function handleOk() {
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return;
      }
      const authTerritory = values.authTerritory;
      // const userPostMsg = JSON.parse(localStorage.getItem('userTerritory'));
      // const id = values.authTerritory ? values.authTerritory : userPostMsg.id;
      // const payload = values.authTerritory ? values : { authTerritory: id };
      dispatch({
        type: 'switch_territory/SwitchTerritory',
        payload: { authTerritory },
        callBack: () => {
          localStorage.setItem('userTerritory', authTerritory);
          window.CURRENT_ACTIVE_TERRITORY = authTerritory
        },
      });
    });
  }

  function goBack() {
    hashHistory.go(-1);
  }
  // function change_territory(e) {
  //   selected = e.target.value;
  // }
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };
  const postError = isFieldTouched('authTerritory') && getFieldError('authTerritory');
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.change_territory_title}>岗位选择</h1>
        <div onClick={goBack} className={styles.goBackBtn}>
          <Icon type="close" />
        </div>
      </div>
      <Form className={styles.form}>
        <FormItem
          {...formItemLayout}
          className={styles.formItem}
          help={postError || ''}
          label={'岗位'}
        >
          {getFieldDecorator('authTerritory', {
            initialValue: localStorage.getItem('userTerritory'),
            rules: [
              {
                required: true,
                message: crmIntlUtil.fmtStr('message.login_name is required'),
              },
            ],
          })(
            <Select
              // onChange={(e) => change_territory(e)}
              // defaultValue={selected}
              className={styles.select}
            >
              {renderOption()}
            </Select>,
          )}
        </FormItem>
        <FormItem className={styles.formItem}>
          <Button className={styles.changePostBtn} type="primary" size="large" onClick={handleOk}>
            {crmIntlUtil.fmtStr('action.ok')}
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};

export default connect(({ App }) => ({ App }))(Form.create()(ChangeTerritory));
