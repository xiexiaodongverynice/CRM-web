import React, { Component } from 'react';
import { Row, Col, Upload, message, Icon, Modal } from 'antd';
import AvatarEditor from 'react-avatar-editor';

import * as crmIntlUtil from '../../utils/crmIntlUtil';
import styles from './ImageUploadFieldItem.less';

const imgLoaded = (img) => {
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.onabort = reject;
    img.onerror = reject;
  });
};

export default class ImageViewer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      scale: 0.8, // 02/03/2018 - TAG: 图片缩放比例

      imageUrl: null
    }
  }

  getImageUrl = () => {
    const imageUrl = _.get(this.props, 'imageUrl', _.get(this.state, 'imageUrl'))
    return imageUrl;
  }

  /**
   * 切换图片预览状态
   */
  changeImageViewerStatus = (status) => {
    this.setState({
      showModal: status,
    });
  };

  /**
   * 显示图片预览
   * 
   * 外部方法
   */
  show = async (filepath) => {
    const imageUrl = filepath || this.getImageUrl()
    if(!_.isNull(imageUrl)) {
      let img = new Image();
      img.src = imageUrl;
      await imgLoaded(img);
      const height = img.naturalHeight;
      const width = img.naturalWidth;
      let scale;
      if (height >= width) {
        scale = width / height;
      } else {
        scale = height / width;
      }
      scale = parseFloat(scale.toFixed(1));
      this.setState({
        showModal: true,
        scale,
        imageUrl,
      });
    }
  }

  zoomin = (percent) => {
    this.setState({
      scale: this.state.scale + percent,
    });
  };

  zoomout = (percent) => {
    const scale = this.state.scale - percent;
    this.setState({
      scale: scale >= 0 ? scale : 0,
    });
  };

  render() {
    const imageUrl = this.getImageUrl();
    const { showModal, scale } = this.state;
    return (
      <Modal
        visible={showModal}
        footer={null}
        bodyStyle={{
          height: 640,
          width: 600,
          paddingTop: 50,
        }}
        headers={crmIntlUtil.fmtStr('header.upload_image_view')}
        width={572}
        closable={true}
        onOk={this.changeImageViewerStatus.bind(this, false)}
        onCancel={this.changeImageViewerStatus.bind(this, false)}
      >
        {imageUrl ? (
          <AvatarEditor
            image={imageUrl}
            width={540}
            height={540}
            border={0}
            color={[255, 255, 255, 0.6]} // RGBA
            scale={parseFloat(scale)}
            rotate={0}
          />
        ) : null}
        <div className={styles.zoom_bar}>
          <i className="iconfont icon-zoomin" onClick={this.zoomin.bind(this, 0.1)} />
          <i className="iconfont icon-zoomout" onClick={this.zoomout.bind(this, 0.1)} />
        </div>
      </Modal>
    );
  }
}