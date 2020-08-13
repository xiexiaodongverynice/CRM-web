/**
 * Created by wans on 2017/10/3 0003.
 */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  Col,
} from 'antd';
import RecordFormDetailItem from '../../components/DataRecord/RecordFormDetailItem';
import * as recordService from '../../services/object_page/recordService';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';
import Warner from '../Page/Warner';
import consoleUtil from '../../utils/consoleUtil';


class RelatedDetailFormItem extends React.Component{

  constructor(props){
    super(props);
    this.state={
      dataSource:[],
      formRowItems:[],
      needDisabled:_.get(this.props,'needDisabled',false),
    }
  }


  getInitialState = () => {}

  componentWillMount = () => {
    const { parentRecord } =this.props;
    const parentId = _.get(parentRecord,'id');
    if(parentId !==undefined){ ///如果有id，说明不是新增页面，需要对数据进行回显
      this.fetchCallProduct(parentId);
    }

  }
  componentWillReceiveProps = () => {
  };
  componentWillUpdate = () => {
  }
  componentDidUpdate = () => {

  }
  componentWillUnmount = () => {
  }



  fetchCallProduct = (parentId) => {
    const {  formItemExtenderLayout,} =this.props;
    const formItemExtenderFilterLayout = _.get(formItemExtenderLayout,'form_item_extender_filter');

    const defaultFilterCriterias = _.get(formItemExtenderFilterLayout,'default_filter_criterias',[]);
    const relatedListName = _.get(formItemExtenderFilterLayout,'related_list_name');
    const refObDescribeApiName = _.get(formItemExtenderFilterLayout,'ref_obj_describe');

    const relatedFieldDescribe = fieldDescribeService.loadRefObjectFieldDescribe({object_api_name:refObDescribeApiName,related_list_name:relatedListName});
    const relatedFieldApiName = _.get(relatedFieldDescribe,'api_name');
    const baseCriterias = _.concat(defaultFilterCriterias,{
      "field" : relatedFieldApiName,
      "value" : [parentId],
      "operator" : "=="
    });
    const relatedDetailFormPayload={
      "joiner": "and",
      "criterias": baseCriterias,
      "orderBy": _.get(formItemExtenderFilterLayout,'default_sort_by', _.get(formItemExtenderFilterLayout, 'orderBy', 'update_time')),
      "order": _.get(formItemExtenderFilterLayout,'default_sort_order', _.get(formItemExtenderFilterLayout, 'order', 'desc')),
      "objectApiName": refObDescribeApiName,
      "pageSize": 10000,
      "pageNo": 1
    }
    this.promise = recordService.queryRecordList({dealData:relatedDetailFormPayload}).then((resp) => {
      let resultData =_.get(resp,'result');
      // consoleUtil.log(resultData);
      this.setState({dataSource:resultData},()=>{
        // _.forEach(this.state.dataSource,(record)=>{
        //   this.buildRelatedDetailFormItem(record);
        // })

      })
    });
  }

buildRelatedDetailFormItem =(record)=>{
  const {  formItemExtenderLayout,} =this.props;
  const fieldSectionFields = _.get(formItemExtenderLayout, 'fields', []);
  const formItemExtenderFilterLayout = _.get(formItemExtenderLayout,'form_item_extender_filter');
  const refObDescribeApiName = _.get(formItemExtenderFilterLayout,'ref_obj_describe');
  const relatedDescribe = fieldDescribeService.loadObject({object_api_name:refObDescribeApiName});
  const fieldList = _.get(relatedDescribe,'fields');
  const columns = _.get(formItemExtenderLayout, 'columns', []);
  const formRowItems = _.map(fieldSectionFields,(renderField, fieldIndex) => {
  if (fieldList && !_.isEmpty(fieldList)) {

    const fieldItem = _.find(fieldList, {api_name: renderField.field});
    const fieldApiName = renderField.field;
    if (_.isEmpty(fieldItem)) {
      consoleUtil.error('[配置错误]：字段在对象描述里面没有找到：', refObDescribeApiName, fieldApiName);
      return;
    }

    const fieldLabel = fieldItem.label;
    const hasFieldPrivilege = fc_hasFieldPrivilege(refObDescribeApiName, fieldApiName, [2, 4]);
    if (!hasFieldPrivilege) {
      consoleUtil.warn('[权限不足]：', refObDescribeApiName, fieldApiName, fieldLabel);
      return;
    }
    if (fieldItem !== undefined) {
      const formRowKey = `form_detail_item_row_${fieldItem.api_name}_${fieldIndex}_${record.id}`;
      const colKey = `detail_row_${fieldItem.api_name}_${fieldIndex}_${record.id}`;
      const contentSpan = _.floor(24 / columns);
      const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 18},
      };
      const recordFormItemProps = {
        objectApiName:refObDescribeApiName,
        fieldItem,
        dataItem: record,
        renderFieldItem: renderField,
        formItemLayout,
      };
      if (_.indexOf(_.get(renderField, 'hidden_when'), 'detail') < 0) {
        return (
          <Col span={contentSpan} key={colKey}>
            <RecordFormDetailItem {...recordFormItemProps} key={formRowKey}/>
          </Col>
        );
      }
    }
  } else {
    return '没有找到表单渲染字段';
  }

});
  return formRowItems;

}

buildReturnItems=()=>{
  const {dataSource} = this.state;
  let returnItems = <div></div>;
  if(!_.isEmpty(dataSource)){
    returnItems = _.map(dataSource, (record) => {
      return this.buildRelatedDetailFormItem(record)
    })
  }
  return returnItems;
}

  render (){
    const {  formItemExtenderLayout,} =this.props;
    const formItemExtenderFilterLayout = _.get(formItemExtenderLayout,'form_item_extender_filter');
    const refObDescribeApiName = _.get(formItemExtenderFilterLayout,'ref_obj_describe');

    if(!fc_hasObjectPrivilege(refObDescribeApiName,3)){
      return  <Warner content={'当前用户无访问详情权限。'}/>;
    }
    return (<div>{this.buildReturnItems()}</div>);
}

}

RelatedDetailFormItem.propTypes = {
  formItemExtenderLayout:PropTypes.object,
};
export default RelatedDetailFormItem;
