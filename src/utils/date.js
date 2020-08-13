import moment from 'moment';
import _ from 'lodash';

const patchMonth = (month) => {
  if (month < 10) {
    return `0${month}`;
  } else {
    return month;
  }
};

export const monthFormat = 'YYYY/MM';
export const monthFormat_ = 'YYYYMM';

// 获取两个日期区间的月份，注意：结束时间必须大于开始时间
export const caculateYearMonths = (startDate, endDate = new Date().getTime()) => {
  startDate = moment(startDate);
  endDate = moment(endDate);
  endDate = subtractOneDayIfTodayIsFirstInMonth(endDate);
  const startYear = startDate.year();
  const startMonth = startDate.month();
  const endYear = endDate.year();
  const endMonth = endDate.month();

  const yearMonths = [];
  if (endYear - startYear === 0) {
    if (endMonth - startMonth === 0) {
      yearMonths.push(`${startYear}${patchMonth(startMonth + 1)}`);
    } else {
      _.range(0, endMonth - startMonth + 1).forEach((month) => {
        yearMonths.push(`${endYear}${patchMonth(startMonth + month + 1)}`);
      });
    }
  } else {
    _.range(0, 12 - startMonth).forEach((month) => {
      yearMonths.push(`${startYear}${patchMonth(startMonth + month + 1)}`);
    });
    _.range(0, endYear - startYear - 1).forEach((year) => {
      _.range(0, 12).forEach((month) => {
        yearMonths.push(`${startYear + year + 1}${patchMonth(month + 1)}`);
      });
    });
    if (endMonth === 0) {
      yearMonths.push(`${endYear}${patchMonth(endMonth + 1)}`);
    } else {
      _.range(0, endMonth + 1).forEach((month) => {
        yearMonths.push(`${endYear}${patchMonth(month + 1)}`);
      });
    }
  }
  return yearMonths;
};

/**
 * 如果当天为本月第一天，则向前推到上月
 * @param {*momnet} dt
 */
export const subtractOneDayIfTodayIsFirstInMonth = (dt) => {
  const dayInMonth = dt.format('DD');
  // 01/02/2018 - TAG: 若当天为本月的第一天，则去掉本月
  if (dayInMonth === '01') {
    return dt.subtract(1, 'days');
  }
  return dt;
};

// 获取今天 0:00:00 时的时间戳
export function todayStartTime() {
  const date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return Date.parse(date);
}

export const formatTimeFull = (value) => {
  return moment(value).format('YYYY-MM-DD HH:mm:ss');
};
