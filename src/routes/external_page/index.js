import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import _ from 'lodash';
import { hashHistory } from 'dva/router';
import { allowCookie } from '../../utils/cookie';
import * as message from '../../services/msg';
import consoleUtil from '../../utils/consoleUtil';

// TODO window.resize
class ExternalPageIndex extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.iframe = null;
  }

  componentDidMount() {
    if (!this.src) {
      return;
    }

    allowCookie(this.src).catch((err) => {
      if (err) {
        message.error(err.message, 5);
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.onPostMessage);
  }

  updateSrc() {
    const { object_page } = this.props;
    this.src = _.result(object_page, 'external_page_src', null);
    const { external_page_param = '', param_encryption = 'none' } = object_page;
    if (external_page_param) {
      const userInfo = JSON.parse(localStorage.getItem('user_info'));
      const fcToken = localStorage.getItem('token');
      const fcTerritoryId = localStorage.getItem('userTerritory');
      let encodedParam = '';
      external_page_param.split('\n').forEach((x) => {
        if (!_.isEmpty(x)) {
          const [key, value] = x.split('=');
          if (!_.isUndefined(value)) {
            const converted = _.template(value.trim())({
              user: userInfo,
              fc_token: fcToken,
              fc_territoryId: fcTerritoryId,
            });
            let encrypted = '';
            switch (param_encryption) {
              // TODO  BASE64起不到加密作用，仅仅做一下编码避免用户可以手工修改参数, 后续可以支持其它加密方式
              case 'base64':
                encrypted = window.btoa(converted);
                break;
              default:
                //
                encrypted = converted;
                break;
            }
            encodedParam = `${encodedParam + key.trim()}=${encrypted}&`;
          } else {
            encodedParam = `${encodedParam + key.trim()}=&`;
          }
        }
      });
      this.src = encodedParam ? `${this.src}?${encodedParam}` : this.src;
    }
  }

  /**
   * 消息处理
   */
  handleMessage = (receivedMessageData) => {
    const { onMessage } = this.props;
    if (!_.isUndefined(receivedMessageData)) {
      const { action = {}, data = {} } = receivedMessageData || {};
      switch (action) {
        case 'resolvePage': {
          const { hashPath, target = 'self' } = data;
          if (_.isString(hashPath) && !_.isEmpty(hashPath)) {
            switch (target) {
              case 'blank':
                window.open(hashPath);
                break;
              case 'self':
                hashHistory.push({
                  pathname: hashPath,
                });
                break;
              default: {
                break;
              }
            }
          }
          break;
        }
        default:
          consoleUtil.warn('页面交互未知动作', action);
          break;
      }
    }
  };

  onPostMessage = (event) => {
    const { data = {} } = event;
    const { code } = data;
    switch (code) {
      case 1:
        this.handleMessage(data);
        break;
      default:
        break;
    }
  };

  linkIframe = (ref) => {
    if (!_.isNull(ref)) {
      this.iframe = ref;
      window.addEventListener('message', this.onPostMessage);
    }
  };

  render() {
    const { width, height, timeStamp } = this.props;
    this.updateSrc();

    return this.src ? (
      <iframe
        key={timeStamp}
        style={{ marginTop: '-27px', marginBottom: '-35px' }}
        src={this.src}
        frameBorder="0"
        width={width}
        height={height}
        ref={this.linkIframe.bind(this)}
      />
    ) : null;
  }
}

ExternalPageIndex.propTypes = {
  object_page: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default connect(({ external_page: { object_page, width, height, timeStamp } }) => ({
  object_page,
  width,
  height,
  timeStamp,
}))(ExternalPageIndex);
