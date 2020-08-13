import React from 'react';
import { Table } from 'antd';
import Style from './jsonTable.less';
import * as crmIntlUtil from '../../utils/crmIntlUtil';

const NestedTable = ({ data }) => {
  const columns = [
    { title: crmIntlUtil.fmtStr('field.common.items'), dataIndex: 'label', key: 'label' },
    { title: crmIntlUtil.fmtStr('field.common.appraise'), dataIndex: 'value', key: 'value' },
  ];
  if (data && data.length > 0) {
    return (
      <Table
        rowkey="label"
        columns={columns}
        dataSource={data.filter(x => x.label !== 'final_value')}
        pagination={false}
        size="small"
        bordered={false}
        className={Style.nestedTable}
      />);
  } else {
    return (
      <span />
    );
  }
};

const expandedRowRender = (record) => {
  return (<NestedTable data={record.items} />);
};

class JsonTable extends React.Component {

  render() {
    const { value = [] } = this.props;
    const [first, ...others] = value;
    const columns = [
      {
        title: crmIntlUtil.fmtStr('field.common.appraise'),
        dataIndex: 'title',
        key: 'title',
        width: '40%',
      }, {
        title: crmIntlUtil.fmtStr('field.common.score'),
        dataIndex: 'items',
        width: '60%',
        render: (text, record) => {
          let sectionScore = 0;
          if (record.items && record.items.length > 0) {
            record.items.forEach((item, index, arr) => {
              if (item.score > 0) {
                sectionScore += item.score;
              }
            });
          }

          return (<span>{sectionScore}</span>);
        },
      },
    ];
    const dataSource = others || [];
    return (
      <Table
        rowKey="title"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        expandedRowRender={expandedRowRender}
        size="small"
        style={{ minWidth: '800px' }}
      />
    );
  }
}

export default JsonTable;
