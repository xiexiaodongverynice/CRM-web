import React from 'react';
import { Table, Tabs } from 'antd';
import { connect } from 'dva';
import DataExportHistoryPage from './export_history';
import DataExportScriptPage from './export_script';

const TabPane = Tabs.TabPane;

class DataExportPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'data_export/fetchData',
        })
    }

    tabChange = (active) => {
        this.props.dispatch({
            type: 'data_export/assignState',
            payload: {
                active
            }
        });

        this.props.dispatch({
            type: 'data_export/fetchData',
        })
    };

    render() {
        return (
            <div style={{ padding: 45, margin: '0 7.5rem', backgroundColor: '#fff' }}>
                <Tabs onChange={this.tabChange} type="card">
                    <TabPane tab="报告列表" key="2">
                        <DataExportScriptPage />
                    </TabPane>
                    <TabPane tab="导出历史" key="1">
                        <DataExportHistoryPage />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { active } = state.data_export;
    return {
        active,
    };
}

export default connect(mapStateToProps)(DataExportPage);