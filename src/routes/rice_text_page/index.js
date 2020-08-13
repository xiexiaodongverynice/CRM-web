import React, { Component } from 'react';
import { Button, Spin, message } from 'antd';
import _ from 'lodash';
import BraftEditor from 'braft-editor';

import 'braft-editor/dist/index.css';
import * as RichTextService from '../../services/richTextService';
import * as RecordService from '../../services/object_page/recordService';
import previewHtml from '../../utils/previewHtml';

export default class RichText extends Component {
  state = {
    editorState: null,
    loadingStatus: true,
  };

  async componentDidMount() {
    this.token = localStorage.getItem('token');
    const pathObj = this.pareseUrlObj();
    this.recordId = _.get(pathObj, 'param.[3]');
    this.objectApiname = _.get(pathObj, 'param.[2]');
    this.autoUpdateTimer = null;

    this.initData();
  }

  componentWillUnmount() {
    this.autoUpdateTimer && clearTimeout(this.autoUpdateTimer);
  }

  pareseUrlObj = () => {
    const hash = decodeURIComponent(location.hash);
    const [paramStr, queryStr] = hash.split('?');

    const param = paramStr.split('/');

    if (_.isUndefined(queryStr)) return { param };

    const query = _.reduce(
      queryStr.split('&'),
      (queryObj, currentQuery) => {
        const [label, value] = currentQuery.split('=');
        if (!_.isUndefined(value)) {
          return { ...queryObj, [label]: value };
        }
      },
      {},
    );
    return { param, query };
  };

  initData = async () => {
    const statesParams = {
      loadingStatus: false,
    };

    const result = await RecordService.loadRecord({
      object_api_name: this.objectApiname,
      record_id: this.recordId,
    });

    this.recordData = result;
    this.version = _.get(result, 'version', 0);

    const htmlCode = _.get(result, 'html_code');
    if (htmlCode) {
      _.set(statesParams, 'editorState', BraftEditor.createEditorState(htmlCode));
    }

    this.setState(statesParams);
  };

  //* 预览
  preview = () => {
    const { editorState } = this.state;
    if (_.isNull(editorState)) return;
    previewHtml(editorState.toHTML());
  };

  submitHandle = async () => {
    const { loadingStatus } = this.state;
    if (loadingStatus) return;

    this.setState({ loadingStatus: true });

    const updateResponse = await this.saveContent();
    if (_.get(updateResponse, 'status')) {
      this.successHandle();
    } else {
      const erroMessage = _.get(updateResponse, 'message');
      _.isString(erroMessage) && message.warning(erroMessage);
    }

    this.setState({ loadingStatus: false });
  };

  saveContent = async () => {
    const { editorState } = this.state;
    const htmlContent = editorState.toHTML();
    const payload = {
      object_api_name: this.objectApiname,
      id: this.recordId,
      dealData: { html_code: htmlContent, version: this.version },
    };

    const updateResponse = await RecordService.updateRecord(payload);
    if (_.get(updateResponse, 'version')) {
      this.version = _.get(updateResponse, 'version');
    }
    return updateResponse;
  };

  successHandle = () => {
    if (window.history.length > 0) {
      window.history.go(-1);
    } else {
      window.opener = null;
      window.close();
    }
  };

  handleEditorChange = _.debounce(
    (editorState) => {
      //* 停止编辑10s后自动保存
      if (!_.isNull(this.autoUpdateTimer)) {
        clearTimeout(this.autoUpdateTimer);
      }
      this.autoUpdateTimer = setTimeout(this.saveContent, 10000);

      this.setState({ editorState });
    },
    200,
    { leading: true, trailing: false },
  );

  uploadFn = async (fileParam) => {
    const fileUrl = await RichTextService.uploadImage({ fileParam, token: this.token });

    if (_.isNull(fileUrl)) return;
    fileParam.success({
      url: fileUrl,
    });
  };

  blockExportFn = (contentState, block) => {
    const previousBlock = contentState.getBlockBefore(block.key);

    if (block.type === 'unstyled' && previousBlock && previousBlock.getType() === 'atomic') {
      return {
        start: '',
        end: '',
      };
    }
  };

  render() {
    const { editorState, loadingStatus } = this.state;

    return (
      <Spin spinning={loadingStatus} size="large">
        <div style={{ width: 1200, margin: 'auto' }}>
          <div style={{ backgroundColor: '#fff', padding: '16px 30px' }}>
            <BraftEditor
              ref={(instance) => (this.editorInstance = instance)}
              converts={{ blockExportFn: this.blockExportFn }}
              contentStyle={{
                border: '1px solid rgba(0,0,0,.1)',
                borderTop: 'none',
              }}
              value={editorState}
              onChange={this.handleEditorChange}
              media={{ uploadFn: this.uploadFn }}
            />
            <div
              style={{
                paddingTop: '20px',
                paddingBottom: '30px',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button type="primary" onClick={this.preview} style={{ marginRight: '8px' }}>
                预览
              </Button>
              <Button type="primary" onClick={this.submitHandle}>
                保存
              </Button>
            </div>
          </div>
        </div>
      </Spin>
    );
  }
}
