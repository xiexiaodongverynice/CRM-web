import React, { Component } from 'react';
import { connect } from 'dva';
import * as crmIntlUtil from '../../utils/crmIntlUtil';

const Redirect = ({}) => {
    return (
        <div style={{
            backgroundColor: '#FFF',
            display: 'flex',
            width: window.document.body.offsetWidth,
            height: window.document.body.offsetHeight,
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '20ppx',
        }}>
            {
                crmIntlUtil.fmtStr('message.login_loading')
            }
        </div>
    );
};

export default connect()(Redirect);