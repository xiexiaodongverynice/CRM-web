import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import _ from 'lodash';
import { checkPx } from '../../utils/style';
import { mapObject, joinParams } from '../../utils/custom_util';
import { baseURL } from '../../utils/config';
import { getExpression } from '../../utils/expressionUtils';
import { callAnotherFunc } from '../../utils/index';

export default class FcModalWidget extends Component {

  static defaultProps = {
    width: 1000,
    height: 800,
    src: '',
    onClose: _.noop,
    onMessage: _.noop,
    
    thizRecord: {},
    parentRecord: {},
    record: {},

    containerId: null,
  }

  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    src: PropTypes.string,
    onClose: PropTypes.func,
    onMessage: PropTypes.func,

    thizRecord: PropTypes.object,
    parentRecord: PropTypes.object,
    record: PropTypes.object,

    containerId: PropTypes.string,
  }

  static INSTANCES = {}

  static linkInstance = (fcModalWidget, ref) => {
    if(!_.isNull(ref)) {
      const { props } = ref;
      const { ['meta-data']: metaData } = props;
      const { src } = metaData;
      FcModalWidget.INSTANCES[src] = {
        widget: fcModalWidget,
        ['meta-data']: metaData
      };
    }
  }

  static newInstance = (props) => {
    return new Promise((resolve, reject) => {
      let { src } = props;
      /**
       * TODO 头痛欲裂，去它的优化
       * 
       * src = {
            expression: 'if(getDeployEnvironment() == "stg") {return "https://widget-zhiying-stg.crmpower.cn/#/listSelectPc/replenishment"}'
        }
      */
      if (_.isObject(src) && _.has(src, 'expression')) {
        const expresson = getExpression(src, 'expression', '');
        src = callAnotherFunc(new Function('t', 'p', 'r', expresson), {}, {}, {});
      }
      let instance = FcModalWidget.INSTANCES[src];
      const root = document.getElementById('root');
      const container = document.createElement('div');
      const containerId = `fc_modal_widget_${new Date().getTime()}`;
      container.id = containerId

      root.appendChild(container);
      ReactDOM.render(<FcModalWidget {...Object.assign({}, props, {
        containerId,
        src
      })}/>, container, () => {
        resolve(FcModalWidget.INSTANCES[src]);
      })
    });
  }

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    }

    this.iframe = null;
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.onPostMessage);
  }

  /**
   * 消息处理
   */
  handleMessage = (receivedMessageData) => {
    const { onMessage } = this.props;
    if(!_.isUndefined(receivedMessageData)) {
      onMessage(receivedMessageData);
    }
  }

  /**
   * 内部外部组件主动调用
   */
  close = () => {
    const { containerId, onClose } = this.props;
    this.setState({
      visible: false,
    }, () => {
      onClose();
      ReactDOM.unmountComponentAtNode(document.getElementById(containerId));
    });
  }

  open = () => {
    this.setState({
      visible: true
    });
  }

  onPostMessage = (event) => {
    const { data = {} } = event;
    const { code } = data;
    switch(code) {
      case 1:
        this.handleMessage(data);
        break;
      default:
        break;
    }
  }

  linkIframe = (ref) => {
    if(!_.isNull(ref)) {
      this.iframe = ref;
      window.addEventListener('message', this.onPostMessage);
    }
  }

  render() {
    const { width, height, params = {}, src, parentRecord, thizRecord, record } = this.props;
    const { visible } = this.state;
    return (
      <Modal onCancel={this.close.bind(this)} closable={true} maskClosable={false} visible={visible} footer={null} width={width} height={height} ref={FcModalWidget.linkInstance.bind(null, this)} {...{'meta-data': this.props}}>
        <iframe frameBorder="0" src={`${src}?${joinParams(Object.assign({}, mapObject(params, { thizRecord, parentRecord, record }), {
          parentOrigin: window.location.origin,
          baseURL,
        }))}`} width={checkPx(width - 37)} height={checkPx(height - 37)} ref={this.linkIframe.bind(this)}/>
      </Modal>
    );
  }

}

