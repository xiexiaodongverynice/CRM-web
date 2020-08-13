import React, { Component } from 'react';
import { connect } from 'dva';
import { hashHistory } from 'dva/router';
import { Icon, Spin, Button } from 'antd';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { white } from '../../stylers/colors';
import * as userPermissionUtil from '../../utils/userPermissionUtil';
import styles from './choose_territory.less';
import * as userProfileUtil from '../../utils/userProfileUtil';
import authUtil from '../../utils/authUtil';

const ChooseTerritory = ({ choose_territory, App, dispatch }) => {
  const { initLoading } = App;
  const { territoryLoading } = choose_territory;
  function selectPost(item) {
    // 发送请求
    const authTerritory = item.id;
    dispatch({
      type: 'choose_territory/ChooseTerritory',
      payload: {
        authTerritory,
      },
      callBack: () => {
        localStorage.setItem('userTerritory', authTerritory);
        window.CURRENT_ACTIVE_TERRITORY = authTerritory
      },
    });
  }
  function changeColor(e) {
    const defaultBtn = document.getElementById('defaultBtn');
    if (e.target.id !== 'defaultBtn') {
      defaultBtn.style.backgroundColor = 'white';
      defaultBtn.style.color = '#101010';
    }
  }
  function renderBtn() {
    const postList = JSON.parse(localStorage.getItem('userTerritoryList'));
    if (postList)
      return postList.map((item) => {
        return (
          <Button
            key={item.id}
            type="primary"
            onFocus={(e) => changeColor(e)}
            onClick={() => selectPost(item)}
            id={item.is_primary ? 'defaultBtn' : 'btn'}
            className={item.is_primary ? styles.defaultBtn : styles.btn}
          >
            {item.name}
          </Button>
        );
      });
  }
  function goBack() {
    hashHistory.go(-1);
    authUtil.cleanAllStorageButExclude();
  }
  return (
    <div
      style={{
        backgroundColor: '#F5F5F5',
        display: 'flex',
        width: window.document.body.offsetWidth,
        height: window.document.body.offsetHeight,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '20ppx',
      }}
    >
      <Spin spinning={initLoading} tip={crmIntlUtil.fmtStr('loading.init_system_basic_data')}>
        <Spin spinning={territoryLoading}>
          <div className={styles.job_select}>
            <div onClick={goBack} className={styles.closeBtn}>
              <Icon type="close-circle-o" />
            </div>
            <div className={styles.title}>岗位选择</div>
            <div className={styles.btnBox}>{renderBtn()}</div>
          </div>
        </Spin>
      </Spin>
    </div>
  );
};

export default connect(({ choose_territory, App }) => ({ choose_territory, App }))(ChooseTerritory);
