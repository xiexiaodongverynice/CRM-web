/**
 * 提供查找数据的弹出框
 * Created by apple on 18/09/2017.
 */
import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { addLocaleData, IntlProvider, FormattedMessage } from 'react-intl';
import { Table, Row, Col, Input, Radio, LocaleProvider } from 'antd';
import styles from './recordFilter.less';
import * as recordService from '../../services/object_page/recordService';
import * as fieldDescribeService from '../../services/object_page/fieldDescribeService';
import RecordFilter from './recordFilter';
import { renderCell } from './RecordTableHelper';
import * as crmIntlUtil from '../../utils/crmIntlUtil';
import { processCriterias } from '../../utils/criteriaUtil';
import consoleUtil from '../../utils/consoleUtil';

const appLocale = window.appLocale;
addLocaleData(appLocale.data);

const Search = Input.Search;

class PopupRecordSelector extends React.Component {
  constructor(props) {
    super(props);
    const { objectApiName, recordType, needRelationQuery = true } = props;
    this.state = {
      columns: [],
      dataSource: [],
      layout: this.props.layout || {},
      objectApiName,
      recordType,
      queryString: '',
      selectedRowKeys: _.get(props, 'selectedRowKeys', []),
      filterSelectedItems: _.get(props, 'filterSelectedItems', []),
      selectedRows: [],
      orderBy: _.get(
        this.props.layout,
        'default_sort_by',
        _.get(this.props.layout, 'orderBy', 'update_time'),
      ),
      order: _.get(
        this.props.layout,
        'default_sort_order',
        _.get(this.props.layout, 'order', 'desc'),
      ),
      needRelationQuery,
      pagination: {
        showSizeChanger: true,
        showQuickJumper: false,
        showTotal: (total) => (
          <FormattedMessage
            id="show total"
            defaultMessage="共 {total} 条"
            values={{
              total,
            }}
          />
        ),
        current: 1,
        total: 0,
        defaultCurrent: 1,
        pageSize: _.get(this.props.layout, 'containers[0].components[0].page_size', 10),
      },
      fieldDescribes: [],
      filterCriterias: [],
      multipleSelect: props.multipleSelect || false,
    };
  }

  componentWillMount() {
    const { objectApiName, recordType, layout, selectedRowKeys, multipleSelect } = this.state;
    let columnFields = [];
    if (_.has(layout, 'containers[0].components[0].fields')) {
      columnFields = columnFields.concat(layout.containers[0].components[0].fields);
    } else {
      columnFields = columnFields.concat({ field: 'name' });
    }

    Promise.resolve(fieldDescribeService.loadObject({ object_api_name: objectApiName })).then(
      (response) => {
        const { fields: fieldDescribeList } = response;
        const renderFields = columnFields
          .map((x) => {
            const fieldDescribe = fieldDescribeList.find((y) => y.api_name === x.field);
            return Object.assign({}, fieldDescribe, x);
          })
          .filter((x) => x && x.api_name);
        const columns = renderFields.map((x) => {
          const fieldKey = `record_list_field_${x.api_name}`;
          // fix bug,优先使用布局里面field.i18n_key，第二选择 field.<object_api_name>.<field_api_name>，最后选择label
          const fieldLabel = crmIntlUtil.fmtStr(
            _.get(x, 'field.i18n_key'),
            crmIntlUtil.fmtStr(`field.${objectApiName}.${x.api_name}`, x.label),
          );

          return {
            title: <strong>{fieldLabel}</strong>,
            // title: field.label,
            key: fieldKey,
            dataIndex: x.api_name,
            width: _.get(x, 'width', 150),
            render: (text, record, index) => {
              return renderCell(text, record, index, x, objectApiName);
            },
          };
        });
        this.setState(
          {
            fieldDescribes: fieldDescribeList,
            columns,
            loading: true,
          },
          () => {
            this.doQuery();
          },
        );
      },
    );
  }

  /**
   * 给外部方法使用, 切勿删除
   */
  getSelectedRows = () => {
    return this.state.selectedRows;
  };

  getSelectedRowKeys = () => {
    return this.state.selectedRowKeys;
  };
  /**
   * 给外部方法使用, 切勿删除
   */

  onSearch(searchValue) {
    const { pagination } = this.state;
    // 查询时将页码归为第一页
    const newPagination = Object.assign(pagination, { current: 1 });
    this.setState(
      {
        loading: true,
        queryString: searchValue,
        pagination: newPagination,
      },
      () => {
        this.doQuery();
      },
    );
  }

  onRowClick(record, index, event) {
    const { multipleSelect, selectedRowKeys, selectedRows } = this.state;
    const { id } = record;
    if (multipleSelect) {
      /* checkbox mode */
      if (selectedRowKeys.indexOf(id) < 0) {
        // this.onSelectionChange(selectedRowKeys.concat(record.id), selectedRows.concat(record));
        this.onRowSelect(record, true, selectedRows);
      } else {
        this.onRowSelect(record, false, selectedRows);
      }
    } else if (selectedRowKeys.indexOf(id) < 0) {
      /* radio mode */
      // this.onSelectionChange([record.id], record);
      this.onRowSelect(record, true, selectedRows);
    }
  }

  onSelectionChange(selectedRowKeys, selectedRows) {
    // const { multipleSelect } = this.state;
    this.setState(
      {
        selectedRowKeys,
        selectedRows,
      },
      () => {
        if (this.props.onRowSelect) {
          this.props.onRowSelect(selectedRowKeys, selectedRows);
        }
      },
    );
  }

  onRowSelect(record, selected, selectedRows) {
    const {
      selectedRows: oldSelectedRows,
      selectedRowKeys: oldSelectedRowKeys,
      multipleSelect,
    } = this.state;
    if (multipleSelect) {
      if (selected) {
        this.setState(
          {
            selectedRowKeys: oldSelectedRowKeys.concat(record.id),
            selectedRows: oldSelectedRows.concat(record),
          },
          this.notifyOuterComponent,
        );
      } else {
        this.setState(
          {
            selectedRowKeys: oldSelectedRowKeys.filter((x) => x !== record.id),
            selectedRows: oldSelectedRows.filter((x) => x.id !== record.id),
          },
          this.notifyOuterComponent,
        );
      }
    } else {
      this.setState(
        {
          selectedRowKeys: [record.id],
          selectedRows: [record],
        },
        this.notifyOuterComponent,
      );
    }
  }

  onRowSelectAll(selected, selectedRows, changeRows) {
    const { selectedRows: oldSelectedRows, selectedRowKeys: oldSelectedRowKeys } = this.state;
    if (selected) {
      this.setState(
        {
          selectedRows: oldSelectedRows.concat(changeRows),
          selectedRowKeys: oldSelectedRowKeys.concat(changeRows.map((x) => x.id)),
        },
        this.notifyOuterComponent,
      );
    } else {
      const changedIds = changeRows.map((x) => x.id);
      this.setState(
        {
          selectedRows: oldSelectedRows.filter((x) => changedIds.indexOf(x.id) < 0),
          selectedRowKeys: oldSelectedRowKeys.filter((x) => changedIds.indexOf(x) < 0),
        },
        this.notifyOuterComponent,
      );
    }
  }

  onPageChange(pagination, filters, sorter) {
    this.setState(
      {
        pagination,
        loading: true,
      },
      () => {
        this.doQuery();
      },
    );
  }

  onCriteriasChange(values) {
    const { pagination } = this.state;
    // 筛选变化时时将页码归为第一页
    const newPagination = Object.assign({}, pagination, { current: 1 });
    this.setState(
      {
        loading: true,
        filterCriterias: values,
        pagination: newPagination,
      },
      () => {
        this.doQuery();
      },
    );
  }

  notifyOuterComponent() {
    if (this.props.onRowSelect) {
      const { selectedRows: newSelectedRows, selectedRowKeys: newSelectedRowKeys } = this.state;
      this.props.onRowSelect(newSelectedRowKeys, newSelectedRows);
    }
  }

  /**
   * 上一级组件可能会传递默认的选中项，因此为了保持数据一致性，此处需要处理
   */
  mapSelectedRecordsWithKeys = (selectedRowKeys, data) => {
    const selectedRows = _.map(selectedRowKeys, (key) => {
      return _.find(data, {
        id: key,
      });
    });
    if (_.size(selectedRows) !== _.size(selectedRowKeys)) {
      consoleUtil.warn('selectedRowKeys not match current page data, may be in next page.');
    }
    return selectedRows;
  };
  /**
   * sortByObjectArrayKey
   * 按照数组对象的某个键排序 可以是数字或者字符
   * 需配合sort()使用 eg: array.sort(sortByObjectArrayKey('key',false,parseInt));
   *
   * @param {String} filed
   * filed 数组对象中的键
   *
   * @param {Boolean} rev
   * 是否反转顺序 true代表反转 也就是从小到大 false反之
   *
   * @param {function} primer
   * 判断方法 可选参数 如果没有这个参数就按照sort()方法的默认排序(默认按照字符编码的顺序进行排序) eg: parseInt 数字取整排序
   *
   * @returns {function}
   * sort()方法的参数
   * */
  sortByObjectArrayKey = (filed, rev, primer) => {
    rev = rev ? -1 : 1;
    // eslint-disable-next-line space-before-function-paren
    return function(a, b) {
      a = a[filed];
      b = b[filed];
      if (typeof primer !== 'undefined') {
        a = primer(a);
        b = primer(b);
      }
      if (a < b) return rev * -1;
      if (a > b) return rev * 1;
      return 1;
    };
  };
  /**
   *
   * @param {Object} param0 // 调用接口请求数据前是否清除组件内已经加载的数据
   */
  doQuery({ clear = false } = {}) {
    const {
      objectApiName,
      recordType,
      queryString,
      pagination,
      filterCriterias,
      orderBy,
      order,
      selectedRowKeys,
      needRelationQuery,
    } = this.state;
    const { defaultFilterCriterias } = this.props;
    let criterias = [];
    if (recordType) {
      criterias = criterias.concat([
        {
          field: 'record_type',
          operator: 'in',
          value: [].concat(recordType),
        },
      ]);
    }
    if (queryString) {
      criterias = criterias.concat([
        {
          field: 'name',
          operator: 'contains',
          value: [queryString],
        },
      ]);
    }
    if (filterCriterias) {
      criterias = criterias.concat(filterCriterias);
    }

    if (!_.isEmpty(defaultFilterCriterias)) {
      criterias = criterias.concat(defaultFilterCriterias);
    }

    const { parentRecord = {} } = this.props;

    // 处理条件中的表达式等
    const processedCriterias = processCriterias(criterias, {}, parentRecord);
    const fetchData = () => {
      recordService
        .queryRecordList({
          dealData: {
            needRelationQuery,
            joiner: 'and',
            objectApiName,
            orderBy,
            order,
            criterias: processedCriterias,
            pageSize: pagination.pageSize,
            pageNo: pagination.current,
          },
        })
        .then((response) => {
          const { result, resultCount } = response;
          const { filterSelectedItems } = this.state;
          // _.includes([1, 2, 3], 1)
          // _.filter(users, function(o) { return !o.active; });
          //* 过滤已经选中的项
          const dataSourceArr = _.filter(
            result.sort(this.sortByObjectArrayKey(orderBy, order !== 'asc')),
            (o) => {
              return !_.includes(filterSelectedItems, o.id);
            },
          );

          const selectedItemSize = _.isArray(filterSelectedItems) ? filterSelectedItems.length : 0;
          const newPagination = Object.assign({}, pagination, {
            total: Math.abs(resultCount - selectedItemSize),
          });
          this.setState({
            dataSource: dataSourceArr,
            loading: false,
            pagination: newPagination,
            selectedRows: this.mapSelectedRecordsWithKeys(selectedRowKeys, result),
          });
        });
    };

    if (clear) {
      this.setState(
        {
          dataSource: [],
          loading: true,
          pagination: Object.assign(pagination, {
            pageNo: 1,
            total: 0,
          }),
        },
        fetchData,
      );
    } else {
      fetchData();
    }
  }

  render() {
    const {
      objectApiName,
      recordType,
      fieldDescribes,
      selectedRowKeys,
      pagination,
      filterCriterias,
      multipleSelect,
    } = this.state;
    /**
     * 判断是否有列显示，如果没有，没必要渲染
     */
    if (_.isEmpty(fieldDescribes)) {
      return null;
    }
    const { defaultFilterCriterias } = this.props;
    const { columns, dataSource, layout } = this.state;
    const component = _.has(layout, 'containers[0].components[0]')
      ? layout.containers[0].components[0]
      : { header: '' };

    let fieldList = [];
    if (component.filter_fields) {
      _.some(component.filter_fields, (field) => {
        if (field === 'name') return;
        fieldList = fieldList.concat(fieldDescribes.filter((x) => x.api_name === field));
      });
    } else if (component.fields) {
      // 设置了show_filter, 但是没有设置filter_fields时，按照表格显示那些列就使用那些列进行筛选
      // fields 是一个[{field:'name'}...]的结构
      const tableFields = component.fields.map((y) => y.field);
      _.some(tableFields, (field) => {
        fieldList = fieldList.concat(fieldDescribes.filter((x) => x.api_name === field));
      });
    }
    const filter = {
      objectApiName,
      fieldList,
      component,
    };

    const rowSelection = {
      type: multipleSelect ? 'checkbox' : 'radio',
      // onChange: this.onSelectionChange.bind(this),
      onSelect: this.onRowSelect.bind(this),
      onSelectAll: this.onRowSelectAll.bind(this),
      selectedRowKeys,
    };

    const filterUnVisible = !component.show_filter && !component.filter_fields;

    return (
      <LocaleProvider locale={appLocale.antd}>
        <IntlProvider
          locale={appLocale.locale}
          messages={appLocale.messages}
          // formats={appLocale.formats}
        >
          <Row>
            <Col span={24}>
              <Table
                rowKey="id"
                loading={this.state.loading}
                scroll={{ x: 850, y: 300 }}
                title={(record) => {
                  return (
                    <Row style={{ marginTop: '13px' }}>
                      <Col span={filterUnVisible ? 24 : 20}>
                        <Search
                          placeholder={crmIntlUtil.fmtStr(
                            _.get(component, ['header.i18n_key']),
                            _.get(component, 'header'),
                          )}
                          onSearch={this.onSearch.bind(this)}
                          size="large"
                        />
                      </Col>
                      {!filterUnVisible ? (
                        <Col span={4} style={{ textAlign: 'right' }}>
                          <RecordFilter
                            filter={filter}
                            onCriteriasChange={this.onCriteriasChange.bind(this)}
                            defaultFilterCriterias={defaultFilterCriterias}
                          />
                        </Col>
                      ) : null}
                    </Row>
                  );
                }}
                columns={columns}
                dataSource={dataSource}
                onRowClick={this.onRowClick.bind(this)}
                pagination={pagination}
                onChange={this.onPageChange.bind(this)}
                rowSelection={rowSelection}
              />
            </Col>
          </Row>
        </IntlProvider>
      </LocaleProvider>
    );
  }
}

export default PopupRecordSelector;
