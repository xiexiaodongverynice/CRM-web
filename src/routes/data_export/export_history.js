import React from 'react';
import { Table, Pagination, Row, Button, Popconfirm, Modal } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import AceEditor from 'react-ace';
import 'brace/mode/text';
import 'brace/theme/github';
import 'brace/ext/searchbox';
import styles from '../../stylers/list.less';
import { formatTimeFull } from '../../utils/date';
import { hashHistory } from 'dva/router';
import { red500, green500, blue500 } from '../../stylers/colors';
import Style from '../../components/common/common.less';

const DataExportHistoryPage = ({ dispatch, body, pageNo, pageSize, resultCount, visible, export_history_log }) => {

    function delPage(id) {
        dispatch({ type: 'data_export_history/delete', payload: { id } });
    }

    const indexPage = (pageNo, pageSize) => {
        dispatch({
            type: 'data_export_history/assignState',
            payload: {
                pageNo,
                pageSize,
            },
        });
        dispatch({
            type: 'data_export_history/fetch',
        });
    };

    const onChange = (pagination, filter, sorter) => {
        const { order, field } = sorter;
        dispatch({
            type: 'data_export_history/assignState',
            payload: {
                order,
                orderBy: field,
            },
        });
        dispatch({
            type: 'data_export_history/fetch',
        });
    };

    const download = (record) => {
        const { file_key } = record;
        dispatch({
            type: 'data_export_history/download',
            payload: {
                file_key,
            },
        });
    };

    const columns = [
        {
            title: '报告名称',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: '创建人',
            dataIndex: 'create_by__r.name',
            key: 'create_by__r.name',
            width: 150,
        },
        {
            title: '开始时间',
            dataIndex: 'run_time',
            key: 'run_time',
            width: 150,
            render: (val) => {
                if (val) {
                    return formatTimeFull(val);
                } else {
                    return null;
                }
            },
        },
        {
            title: '完成时间',
            dataIndex: 'done_time',
            key: 'done_time',
            width: 150,
            render: (val) => {
                if (val) {
                    return formatTimeFull(val);
                } else {
                    return null;
                }
            },
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (val) => {
                switch (val) {
                    case '0':
                        return '已经初始化';
                    case '1':
                        return '等待执行';
                    case '2':
                        return (
                            <span
                                style={{
                                    color: blue500,
                                }}
                            >
                                运行中
              </span>
                        );
                    case '3':
                        return '已取消';
                    case '4':
                        return (
                            <span
                                style={{
                                    color: green500,
                                }}
                            >
                                已完成
              </span>
                        );
                    case '5':
                        return (
                            <span
                                style={{
                                    color: red500,
                                }}
                            >
                                失败
              </span>
                        );
                    default:
                        return '状态未知';
                }
            },
        },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <span>
                    {record.status === '4' && record.file_key
                        ? [<a onClick={download.bind(null, record)}>下载</a>]
                        : null}
                    {record.status === '3' || record.status === '5'
                        ? [
                            <Popconfirm title="确认要删除菜单?" onConfirm={delPage.bind(null, record.id)}>
                                <a>删除</a>
                            </Popconfirm>,
                        ]
                        : null}
                </span>
            ),
        },
    ];
    return (
        <div>

            <Table
                pagination={false}
                rowKey={(record) => record.id}
                dataSource={body.result}
                columns={columns}
                onChange={onChange}
            />

            <div className={styles.PaginationBox}>
                <Pagination
                    showSizeChanger
                    total={resultCount}
                    showTotal={(total) => `共 ${resultCount} 条`}
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
    const { body, resultCount, pageNo, pageSize, visible, export_history_log } = state.data_export_history;
    return {
        body,
        resultCount,
        pageNo,
        pageSize,
        visible,
        export_history_log,
    };
}

export default connect(mapStateToProps)(DataExportHistoryPage);
