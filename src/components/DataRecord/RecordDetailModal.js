/**
 * @flow
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'antd';
import _ from 'lodash';
import { embedObjectDetail } from '../../embed/page';

export default class RecordDetailModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    }

    /**
     * 实例保存
     */
    const uniqKey = RecordDetailModal.generateUniqKey(props);
    RecordDetailModal.INSTANCES[uniqKey] = this;

    this.key = uniqKey;
  }

  getKey = () => {
    return this.key;
  }

  getModalPropsFromStateAndProps = () => {
    const stateKeys = ['visible'];
    const propKeys = ['width'];
    return Object.assign({}, _.pick(this.state, stateKeys), _.pick(this.props, propKeys));
  }

  open = () => {
    this.setState({
      visible: true,
    })
  }

  close = ({
    onClose
  } = {
    onClose: null
  }) => {
    this.setState({
      visible: false,
    }, () => {
      const key = this.getKey();
      delete RecordDetailModal.INSTANCES[key];
      window.fc_unRegisterAppModel(`detail_page_${key}`);
      const handleOnClose = (onClose) => {
        if(_.isFunction(onClose)) {
          onClose();
        }
      }
      if(onClose) {
        handleOnClose(onClose)
      }else {
        const { onClose } = this.props;
        handleOnClose(onClose)
      }
    });
  }

  handleCancel = () => {
    this.close();
  }

  static INSTANCES = {}

  static generateUniqKey = ({
    object_api_name,
    record_type,
    id,
  }) => {
    return `${object_api_name}_${record_type}_${id}`
  }

  static findInstance = (key) => {
    return RecordDetailModal.INSTANCES[key];
  }

  static newInstance = (props) => {
    const { object_api_name, record_type, id, record = null } = props;
    const uniqKey = RecordDetailModal.generateUniqKey({
      object_api_name,
      record_type,
      id,
    });
    const alreadyInstance = RecordDetailModal.INSTANCES[uniqKey];
    /**
     * 避免重复渲染
     */
    if(!alreadyInstance) {
      const Content = embedObjectDetail({
        object_api_name,
        record_type,
        id,
        record,
      });
      return React.createElement(RecordDetailModal, props, <Content/>);
    }
    return alreadyInstance;
  }

  render() {
    const { children } = this.props;
    return (
      <Modal {...this.getModalPropsFromStateAndProps()} onCancel={this.handleCancel} footer={null}>
      {
        children
      }
      </Modal>
    );
  }

}