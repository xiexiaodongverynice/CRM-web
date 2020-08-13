import React from 'react';
import _ from 'lodash';
import { Button, Row, Col } from 'antd';
import RecordAdd from '../DataRecord/RecordAdd';
import Warner from '../Page/Warner';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';
import { getRelatedListComponents } from './common/page';

class ObjectPageAdd extends React.Component {
  constructor(props) {
    // consoleUtil.log('constructor');
    super(props);
    this.state = {
    };
  }

  getInitialState = () => {
  }
  componentWillMount = () => {
  }
  componentWillReceiveProps = () => {
  };
  componentWillUpdate = () => {
  }
  componentDidUpdate = () => {
  }
  componentWillUnmount = () => {
    this.props;
  }

  onOk = (data, actionLayout, callBack, namespace_key) => {
    const { layout } = this.props;
    const objectApiName = layout.object_describe_api_name;
    const namespace = `add_page${namespace_key? `_${namespace_key}`: ''}`;
    const dealData = data.hasOwnProperty('percentage')
      ? Object.assign({}, data, {percentage: Number(data.percentage.replace('%', '')) / 100})
      : data;
    this.props.dispatch({
      type: `${namespace}/create`,
      payload: {
        actionLayout,
        callBack,
        namespace,
        dealData,
        object_api_name: objectApiName
      },
    });
  }

  pageDetailItems = () => {
    const {
      layout, describe, record, relationLookupLayoutList, location, dispatch, pageType, edit_mode, onSave
    } = this.props;
    const fieldList = describe.fields;
    if (!_.isEmpty(layout) && _.has(layout, 'containers[0].components[0]')) {
      const apiName = layout.object_describe_api_name;
      const recordType = _.get(layout, 'record_type', 'master');
      const addFormKey = `add_form_${apiName}_${recordType}_${_.get(location, 'query._k')}`;
      const detailFormComponent = _.head(_.filter(_.get(layout, 'containers[0].components'), { type: 'detail_form' }));
      const relatedListComponents = getRelatedListComponents({
        layout,
      })
      const renderViewLayout = _.get(layout, 'containers[0].render_view');
      // debugger;
      return (
        <RecordAdd
          renderViewLayout={renderViewLayout}
          layout={layout}
          dispatch={dispatch}
          location={location}
          component={detailFormComponent}
          pageType={pageType}
          record={record}
          // recordType={recordType}
          fieldList={fieldList}
          object_api_name={apiName}
          relationLookupLayoutList={relationLookupLayoutList}
          relatedListComponents={relatedListComponents}
          onOk={_.isFunction(onSave)? onSave.bind(this, this.onOk): this.onOk}
          key={addFormKey}
          edit_mode={edit_mode}
        />);
    } else {
      return <Warner content={crmIntlUtil.fmtStr('Not Found Render Object')} />;
    }
  };

  render() {
    const { layout } = this.props;
    const actionRefObjectApiName = _.get(layout, 'object_describe_api_name');
    if (!fc_hasObjectPrivilege(actionRefObjectApiName, 1)) {
      const recordType = _.get(layout, 'record_type');
      const warnerProps = {
        apiName: actionRefObjectApiName,
        recordType,
      };
      return <Warner content={crmIntlUtil.fmtStr('The current user no access')} {...warnerProps} />;
    }
    return (
      <div>
        {this.pageDetailItems()}
      </div>
    );
  }
}

ObjectPageAdd.proTypes = {
};

export default ObjectPageAdd;

