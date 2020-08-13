import React, { Component } from 'react';
import { Icon, Popconfirm } from 'antd';
import { hashHistory } from 'dva/router';
import styles from './MenuHeader.less';
import MainMenu from './Menu';
import { color } from '../../utils';

class MenuHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  // toggle = () => {
  //   const { onOk } = this.props;
  //   onOk(!this.state.visible);
  //   this.setState({
  //     visible: !this.state.visible,
  //   });
  // };
  // logout = () => {
  //   this.props.logout();
  //   // hashHistory.push('/login');
  //   // localStorage.removeItem('token');
  //   // localStorage.removeItem('userId');
  // };


  render() {
    const { ...headerProps } = this.props;

    return (
      <div className={styles.triggerL} style={{ padding: 0, width: '100%', textAlign: 'center', margin: '0px auto', position: 'relative' }}>
        <MainMenu location={location} {...headerProps} />
      </div>
    );
  }
}

export default MenuHeader;
