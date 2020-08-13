import React from 'react';
import _ from 'lodash';
import RecordList from '../DataRecord/RecordList';
import Warner from '../Page/Warner';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import consoleUtil from '../../utils/consoleUtil';

class ObjectPageIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  onUpdateAfterRowsSelectedOk = (data, callBack) => {
    const { layoutData } = this.props;
    const objectApiName = layoutData.object_describe_api_name;
    // consoleUtil.log(data,objectApiName)
    this.props.dispatch({
      type: 'object_page/updateBatch',
      payload: { dealData: { data }, object_api_name: objectApiName, callBack }
    });
  }
  onApprovalAfterRowsSelectedOk = (data, callBack) => {
    const { layoutData } = this.props;
    const objectApiName = layoutData.object_describe_api_name;
    consoleUtil.log(data, objectApiName)
    this.props.dispatch({
      type: 'object_page/approvalBatchOperation',
      payload: { dealData: data, callBack }
    });
  }

  pageListItems = () => {
    const {
      layoutData, describeData, recordList,
      pagination, filterCriterias, selectorExtenderFilterCriterias,
      viewCriterias, default_view_index
    } = this.props;
    if (layoutData && !_.isEmpty(layoutData) && _.has(layoutData, 'containers[0].components[0]')) {
      const recordListKey = `object_page_index_${layoutData.api_name}`;
      const component = _.get(layoutData, 'containers[0].components[0]');
      return (<RecordList
        describeData={describeData}
        recordList={recordList}
        pagination={pagination}
        filterCriterias={filterCriterias}
        viewCriterias={viewCriterias}
        selectorExtenderFilterCriterias={selectorExtenderFilterCriterias}
        layoutData={layoutData}
        component={component}
        dispatch={this.props.dispatch}
        location={this.props.location}
        key={recordListKey}
        onUpdateAfterRowsSelectedOk={this.onUpdateAfterRowsSelectedOk}
        onApprovalAfterRowsSelectedOk={this.onApprovalAfterRowsSelectedOk}
        default_view_index={default_view_index}
      />);
    } else {
      return <Warner content={crmIntlUtil.fmtStr('Not Found Render Object')} />;
    }
  };

  render() {
    const { layoutData } = this.props;
    const actionRefObjectApiName = _.get(layoutData, 'object_describe_api_name');
    if (!fc_hasObjectPrivilege(actionRefObjectApiName, 5)) {
      const recordType = _.get(layoutData, 'record_type');
      const warnerProps = {
        apiName: actionRefObjectApiName,
        recordType,
        needCallBack: false
      };
      return <Warner content={crmIntlUtil.fmtStr('The current user no access')} {...warnerProps} />;
    }
    return (
      <div>
        {this.pageListItems()}
      </div>
    );
  }
}

ObjectPageIndex.proTypes = {
  // onSearch: PropTypes.func.isRequired,
  // onEdit : PropTypes.func.isRequired,
  // user: PropTypes.array.isRequired,
};

export default ObjectPageIndex;

