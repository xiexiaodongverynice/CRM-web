import React from 'react';
import _ from 'lodash';
import RecordEdit from '../DataRecord/RecordEdit';
import Warner from '../Page/Warner';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { checkRenderConditions, getRelatedListComponents, getRelatedListInkProperties, getRelatedListInkPropertiesFromLayout } from './common/page';

class ObjectPageEdit extends React.Component {
  constructor(props) {
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
  }

  onOk = (data, newRecord, actionLayout, callBack, namespace_key) => {
    const { layout, record } = this.props;
    const objectApiName = layout.object_describe_api_name;
    _.set(data, 'version', _.get(record, 'version'));
    _.set(data, 'id', _.get(record, 'id'));
    const namespace = `edit_page${namespace_key? `_${namespace_key}`: ''}`;
    const dealData = data.hasOwnProperty('percentage')
      ? Object.assign({}, data, {percentage: Number(data.percentage.replace('%', '')) / 100})
      : data;
    this.props.dispatch({
      type: `${namespace}/update`,
      payload: {
        actionLayout,
        callBack,
        newRecord,
        namespace,
        record,
        dealData,
        object_api_name: objectApiName,
        id: _.get(record, 'id')
      },
    });
  }
  pageDetailItems = () => {
    const {
      layout, describe, record, relationLookupLayoutList, dispatch, location, pageType, edit_mode, onSave
    } = this.props;
    const fieldList = _.get(describe, 'fields');
    if (!_.isEmpty(layout) && _.has(layout, 'containers[0].components[0]')) {
      const apiName = layout.object_describe_api_name;
      const editFormKey = `edit_form_${apiName}_${record.id}_${record.version}`;
      const detailFormComponent = _.head(_.filter(_.get(layout, 'containers[0].components'), { type: 'detail_form' }));
      const renderViewLayout = _.get(layout, 'containers[0].render_view');
      const relatedListComponents = getRelatedListComponents({
        layout,
      })
      return (
        <RecordEdit
          renderViewLayout={renderViewLayout}
          layout={layout}
          component={detailFormComponent}
          location={location}
          pageType={pageType}
          fieldList={fieldList}
          record={record}
          relationLookupLayoutList={relationLookupLayoutList}
          relatedListComponents={relatedListComponents}
          object_api_name={apiName}
          dispatch={dispatch}
          key={editFormKey}
          onOk={_.isFunction(onSave)? onSave.bind(this, this.onOk): this.onOk}
          edit_mode={edit_mode}
        />);
    } else {
      return <Warner content={crmIntlUtil.fmtStr('Not Found Render Object')} />;
    }
  };

  render() {
    const { layout, record } = this.props;
    const actionRefObjectApiName = _.get(layout, 'object_describe_api_name');
    if (!fc_hasObjectPrivilege(actionRefObjectApiName, 2)) {
      const recordType = _.get(layout, 'record_type');
      const warnerProps = {
        apiName: actionRefObjectApiName,
        recordType,
      };
      return <Warner content={crmIntlUtil.fmtStr('The current user no access')} {...warnerProps} />;
    }
    const { needrenderbyLayout, needrenderbyRecord } = checkRenderConditions({
      layout,
      record,
    })

    return (
      <div>
        {(needrenderbyLayout && needrenderbyRecord) && this.pageDetailItems()}
        {!needrenderbyLayout && <Warner content={crmIntlUtil.fmtStr('Not Found Render Object')} />}
        {!needrenderbyRecord && <Warner content={crmIntlUtil.fmtStr('Not Found Record Data')} />}
      </div>
    );
  }
}

ObjectPageEdit.proTypes = {
  // onSearch: PropTypes.func.isRequired,
  // onEdit : PropTypes.func.isRequired,
  // user: PropTypes.array.isRequired,
};

export default ObjectPageEdit;

