import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Card } from 'antd';
import _ from 'lodash';
import CountUp from 'react-countup';
import styles from './numberCard.less';
import * as crmIntlUtil from '../../../utils/crmIntlUtil';

function NumberCard({ compType, compVal, icon, color, title, number, done_number, countUp }) {
  let iconText = '';
  if (_.startsWith(icon, 'le')) {
    iconText = _.trim(icon, 'le-');
  }
  return (
    <Card className={styles.numberCard} bordered bodyStyle={{ padding: 0 }}>
      <p className={styles.title} title={crmIntlUtil.fmtStr(title)}>{crmIntlUtil.fmtStr(title)}</p>
      <i className={`${styles.iconWarp} fa ${icon}`} style={{ color, marginRight: 2 }}>{iconText}</i>
      <div className={styles.content}>
        <p className={styles.number} title={`${done_number} / ${number}`}>
          <span className={styles.realnumber} >{done_number}</span>/<span className={styles.targetnumber}>{number}</span>
        </p>
      </div>
    </Card>
  );
}

NumberCard.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
  title: PropTypes.string,
  number: PropTypes.number,
  done_number: PropTypes.number,
  countUp: PropTypes.object,
};

export default NumberCard;
