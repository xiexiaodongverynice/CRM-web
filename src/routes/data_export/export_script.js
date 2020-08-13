import React from 'react';
import { Table, Pagination, Row, Button, Popconfirm } from 'antd';
import { connect } from 'dva';
import styles from '../../stylers/list.less';
import { formatTimeFull } from '../../utils/date';
import { hashHistory } from 'dva/router';

const DataExportScriptPage = ({
    dispatch,
    body,
    pageNo,
    pageSize,
    resultCount,
}) => {
    function delPage(id) {
        dispatch({ type: 'data_export_script/delete', payload: { id } });
    }

    function runTask(id) {
        dispatch({
            type: 'data_export_script/run',
            payload: {
                id,
            }
        })
    }

    const indexPage = (pageNo, pageSize) => {
        dispatch({
            type: 'data_export_script/assignState',
            payload: {
                pageNo,
                pageSize,
            },
        });
        dispatch({
            type: 'data_export_script/fetch',
        });
    }

    const onChange = (pagination, filter, sorter) => {
        const { order, field } = sorter;
        dispatch({
            type: 'data_export_script/assignState',
            payload: {
                order,
                orderBy: field,
            },
        });
        dispatch({
            type: 'data_export_script/fetch',
        });
    }

    const columns = [{
        title: '名称',
        key: 'name',
        dataIndex: 'name',
    }, {
        title: '描述',
        dataIndex: 'remark',
        key: 'remark',
    }, {
        title: '操作',
        key: 'action',
        render: (text, record) => (
            <span>
                <Popconfirm title="确认要运行任务吗?" onConfirm={runTask.bind(null, record.id)}>
                    <a>导出</a>
                </Popconfirm>
            </span>
        ),
    }];
    return (
        <div>

            <Table
                pagination={false}
                rowKey={record => record.id}
                dataSource={body.result}
                columns={columns}
                onChange={onChange}
            />

            <div className={styles.PaginationBox}>
                <Pagination
                    showSizeChanger
                    total={resultCount}
                    showTotal={total => `共 ${resultCount} 条`}
                    pageSize={pageSize}
                    current={pageNo}
                    onChange={indexPage}
                    onShowSizeChange={indexPage}
                    className={styles.myPagination}
                />
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    const { body, resultCount, pageNo, pageSize } = state.data_export_script;
    return {
        body,
        resultCount,
        pageNo,
        pageSize,
    };
}


export default connect(mapStateToProps)(DataExportScriptPage);
