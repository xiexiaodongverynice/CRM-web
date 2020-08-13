/**
 * TODO 添加图片压缩过程的信息提示
 */
import React, { Component } from 'react';
import styles from './ImageUploadFieldItem.less';
import * as _ from 'lodash';
import { Row, Col, Upload, message, Icon, Modal } from 'antd';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import * as ImageFileUploadService from '../../services/imageFileUploadService';
import ImageCompressor from 'image-compressor.js';
import consoleUtil from '../../utils/consoleUtil';
import ImageViewer from './ImageViewer';
import { getImageUrl } from '../../utils/file';

const compressFile = async (file, quality) => {
  return new Promise((resolve, reject) => {
    new ImageCompressor(file, {
      quality,
      mimeType: file.type,
      success(result) {
        resolve(result);
      },
      error(e) {
        consoleUtil.log(e.message);
        reject(e);
      },
    });
  });
};

const getIconByLoading = (loading) => {
  let icon;
  switch (loading) {
    case 1:
      icon = 'hourglass';
      break;
    case 2:
      icon = 'loading';
      break;
    default:
      break;
  }
  return icon;
};

const getValuesFromFileList = (fileList) => {
  return fileList.map((item) => {
    return item.key;
  });
};

export default class ImageUploadFieldItem extends Component {
  constructor(props) {
    super(props);

    const value = props.value || [];

    this.state = {
      value,
      relationField: props.relationField,
      needDisabled: props.needDisabled, // 这里指的是不可以上传文件

      fileList: this.createFileList({
        value,
      }), // 已经上传的文件
    };

    this.imageViewer = null;
  }

  createFileList = ({ value }) => {
    if (_.isUndefined(value) || _.isNull(value)) {
      return [];
    } else if (_.isArray(value)) {
      return value.map((item) => {
        return {
          key: item,
          loading: false,
        };
      });
    }
  };

  componentWillReceiveProps(nextProps) {
    const { value } = this.state;
    const { value: newValue } = nextProps;
    if (!_.isEqual(value, newValue)) {
      this.setState({
        value,
        fileList: this.createFileList({
          value: newValue,
        }),
      });
    }
  }

  // 02/03/2018 - TAG: 上传文件操作
  handleChange = (info) => {
    const { file } = info;
    const { error, percent, response, status, originFileObj } = file;
    const uid = originFileObj.uid;
    if (status === 'done' && percent === 100) {
      const { fileList } = this.state;
      if (!_.isUndefined(error)) {
        message.error(`${crmIntlUtil.fmtStr('message.image_upload_failed')}: ${response.message}`);
        this.setState({
          fileList: fileList.splice(
            _.findIndex(fileList, {
              key: uid,
            }),
            1,
          ),
        });
      } else {
        const finalFileList = fileList.map((item) => {
          if (item.key === uid) {
            return Object.assign({}, item, response, {
              loading: false,
            });
          }
          return item;
        });
        this.setState(
          {
            fileList: finalFileList,
            value: getValuesFromFileList(finalFileList),
          },
          this.updateValue,
        );
      }
    }
  };

  updateValue = () => {
    const { value } = this.state;
    const { onChange } = this.props;
    if (onChange && _.isFunction(onChange)) {
      onChange(value);
    }
  };

  beforeUpload = (file) => {
    return new Promise(async (resolve, reject) => {
      const uid = file.uid;
      let compressedFile = file;
      let valid = /^image\/(jpeg|png|jpg)$/.test(file.type);
      if (!valid) {
        return reject(new Error('invlid upload file type.'));
      } else {
        await new Promise((resolve) => {
          this.setState(
            {
              fileList: this.state.fileList.concat([
                {
                  key: uid,
                  loading: 1,
                },
              ]),
            },
            resolve,
          );
        });
        const { relationField } = this.state;
        let { max_size } = relationField;
        max_size = parseInt(max_size, 10) * 1024;
        // 最大压缩次数
        const maxTimes = 10;
        let times = 0;
        while (true) {
          const { size } = compressedFile;
          if (size > max_size) {
            const quality = 1 - (times + 1) * 0.08;
            try {
              if (times < maxTimes) {
                compressedFile = await compressFile(compressedFile, quality);
                if (compressedFile.size <= max_size) {
                  valid = true;
                  break;
                }
                times += 1;
              } else {
                valid = true;
                break;
              }
            } catch (e) {
              consoleUtil.error(e);
              valid = false;
              break;
            }
          } else {
            valid = true;
            break;
          }
        }
      }
      const { fileList } = this.state;
      const fileIndex = _.findIndex(fileList, {
        key: uid,
      });
      if (valid) {
        compressedFile.uid = uid;
        resolve(compressedFile);
        if (fileIndex !== -1) {
          /**
           * 如果文件压缩成功，则修改状态
           */
          this.setState({
            fileList: fileList.map((item) => {
              return Object.assign(
                {},
                item,
                item.key === uid
                  ? {
                      loading: 2,
                    }
                  : {},
              );
            }),
          });
        } else {
          /**
           * 如果文件未经过压缩，则直接修改状态
           */
          this.setState({
            fileList: fileList.concat({
              key: null,
              loading: 2,
            }),
          });
        }
      } else {
        /**
         * 如果压缩过程失败，则将当前的文件从集合中删除
         */
        if (fileIndex !== -1) {
          this.setState({
            fileList: fileList.splice(fileIndex, 1),
          });
        }
      }
    });
  };

  deleteImage = (image) => {
    const fileList = this.state.fileList.filter((item) => item.key != image.key);
    this.setState(
      {
        fileList,
        value: getValuesFromFileList(fileList),
      },
      this.updateValue,
    );
  };

  showImageViewer = async (image) => {
    const fileList = this.state.fileList.map((item) => {
      return Object.assign({}, item, {
        show: image.key === item.key,
      });
    });
    this.setState(
      {
        fileList,
      },
      () => {
        /**
         * 调用组件方法
         */
        this.imageViewer.show();
      },
    );
  };

  render() {
    const { onlyView, renderFieldOption } = this.props;
    const { relationField, fileList, needDisabled } = this.state;
    const { thumbnail_s, thumbnail_m, thumbnail_l } = relationField;
    let { max_count } = relationField;
    max_count = parseInt(max_count);
    const upload_disabled = fileList.length >= max_count || needDisabled;
    const currentViewImage = _.chain(fileList)
      .find({ show: true })
      .value();

    return (
      <div className={styles.image_upload}>
        {onlyView ? null : (
          <Row>
            <Col span={6}>
              <Upload
                multiple={false}
                name="file"
                action={ImageFileUploadService.uploadUrl}
                listType="text"
                showUploadList={false}
                accept=".jpg,.png,.jpeg"
                onChange={this.handleChange}
                beforeUpload={this.beforeUpload}
                disabled={upload_disabled}
                data={{
                  public_flag: _.get(renderFieldOption, 'public', false),
                  sizes: [thumbnail_s, thumbnail_m, thumbnail_l],
                }}
                headers={{
                  authorization: 'authorization-text',
                  token: localStorage.getItem('token'),
                }}
              >
                <a
                  href="javascript:void(0)"
                  style={
                    upload_disabled
                      ? {
                          color: 'grey',
                        }
                      : {}
                  }
                >
                  {crmIntlUtil.fmtStr('label.upload_image')}
                </a>
              </Upload>
            </Col>

            <Col span={18}>
              <label className={styles.rule}>
                {crmIntlUtil.fmtStr('label.upload_image_rules').replace('${max_count}', max_count)}
              </label>
            </Col>
          </Row>
        )}
        <Row type="flex" justify="start">
          {fileList.map((f) => {
            const fileKey = _.get(f, 'key', '');
            return (
              <div className={styles.thumb_container} key={`${fileKey}_${Math.random()}`}>
                {f.loading ? (
                  <Icon
                    type={getIconByLoading(f.loading)}
                    className={styles.thumb_loading}
                    key={`${fileKey}_icon_loading`}
                  />
                ) : (
                  [
                    onlyView || needDisabled ? null : (
                      <Icon
                        key={`${fileKey}_icon`}
                        type="close-circle"
                        className={styles.thumb_close_icon}
                        onClick={this.deleteImage.bind(this, f)}
                      />
                    ),
                    <img
                      key={`${fileKey}_img`}
                      src={getImageUrl(f)}
                      className={styles.thumb}
                      onClick={this.showImageViewer.bind(this, f)}
                    />,
                  ]
                )}
              </div>
            );
          })}
        </Row>

        <ImageViewer
          imageUrl={getImageUrl(currentViewImage)}
          ref={(el) => (this.imageViewer = el)}
        />
      </div>
    );
  }
}
