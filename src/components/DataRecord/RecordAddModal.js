/**
 * @flow
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'antd';
import _ from 'lodash';
import { embedObjectAdd } from '../../embed/page';

export default class RecordAddModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    }

    /**
     * 实例保存
     */
    const uniqKey = RecordAddModal.generateUniqKey(props);
    RecordAddModal.INSTANCES[uniqKey] = this;

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
      delete RecordAddModal.INSTANCES[RecordAddModal.generateUniqKey(this.props)];
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
    record_type
  }) => {
    return `${object_api_name}_${record_type}`
  }

  static findInstance = (key) => {
    return RecordAddModal.INSTANCES[key];
  }

  static newInstance = (props) => {
    const { object_api_name, record_type, relatedListName, parentId, parentName, onSave, parentApiName, parentRecord } = props;
    const uniqKey = RecordAddModal.generateUniqKey({
      object_api_name,
      record_type,
    });
    const alreadyInstance = RecordAddModal.INSTANCES[uniqKey];
    /**
     * 避免重复渲染
     */
    if(!alreadyInstance) {
      const Content = embedObjectAdd({
        object_api_name,
        record_type,
        relatedListName,
        parentId,
        parentName,
        parentApiName,
        parentRecord,
        onSave,
      });
      return React.createElement(RecordAddModal, props, <Content/>);
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