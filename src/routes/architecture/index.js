import React from 'react';
import { connect } from 'dva';
import ArchitectureIndexs from '../../components/architecture/architecture';

const architecture = ({ dispatch }) => {
    return (
        <div style={{ padding: '45px', background: '#fff', minHeight: 525, margin: '0 7.5rem' }}>
            <ArchitectureIndexs dispatch={dispatch} />
        </div>
    );
};
export default connect()(architecture);
