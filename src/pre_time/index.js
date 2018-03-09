import moment from 'moment';
import Big from 'big.js';

const convertDateString = (str = '') => str.replace(/-/g, '/');

const unixToDate = (time) => {
    const date = moment(time);
    return `${('0' + (date.get('month') + 1)).slice(-2)}-${('0' + date.get('date')).slice(-2)} ${date.format('HH:mm')}`;
};

const standardTime = (receiveTimeSpan) => {
    const timeSpan = receiveTimeSpan * 60 * 1000;
    const oneDaySpan = 24 * 60 * 60 * 1000;
    const todayZero = moment().set({'hours': 0, 'minute': 0, 'second': 0});
    const yesterdayZero = todayZero - oneDaySpan;
    let temp = todayZero;
    const timeArr = [];
    while (yesterdayZero < temp) {
        temp -= timeSpan;
        const hourMin = moment(temp).format('HH:mm');
        timeArr.unshift(hourMin);
    }
    return timeArr;
};

// 格式化日期为YYYY-MM-DD
const dateFullFormat = (m = moment()) => {
    return `${m.year()}-${('0' + (m.month() + 1)).slice(-2)}-${('0' + m.date()).slice(-2)}`;
};

/**
 * 如'02-02'转化为flag
 * @param date
 * @param order_time_limit_end
 * @param order_time_limit_e_span_time
 * @returns {number}
 */
const dateToFlag = (date, order_time_limit_end, order_time_limit_e_span_time) => {
    const selectedDate = moment(date, 'MM-DD'),
        today = moment(moment().format('MM-DD'), 'MM-DD');
    const isCrossYear = moment(moment().format('MM-DD'), 'MM-DD').isAfter(moment(date, 'MM-DD')); // 是否跨年了
    const now = moment();
    const month = date.split('-')[0];
    const day = date.split('-')[1];
    let flagDate;
    const orderLimitEndTime = convertDateString(dateFullFormat(moment()) + ' ' + order_time_limit_end);

    if (isCrossYear) {
        const days = today.diff(selectedDate, 'days'),
            dayCount = moment().endOf('y').dayOfYear();

        return dayCount - days;
    }


    if (order_time_limit_e_span_time === '1' && now < moment(orderLimitEndTime, 'YYYY/MM/DD HH:mm').valueOf()) {
        //当前日期减一天
        flagDate = moment(moment().set({'month': Number(month) - 1, 'date': Number(day) + 1})).valueOf();

        return Big(flagDate - now).div(24 * 60 * 60 * 1000).toString();
    }

    flagDate = moment(moment().set({'month': Number(month) - 1, 'date': Number(day)})).valueOf();

    return Big(flagDate - now).div(24 * 60 * 60 * 1000).toString();
};

/**
 * 生成日期列表
 * @param s_span_time
 * @param e_span_time
 * @param receiveEndSpan
 * @param r_end
 * @param order_time_limit_end
 * @returns {Array}
 */
const receiveDateGeneratorNew = (s_span_time, e_span_time, receiveEndSpan, r_end, order_time_limit_end) => {
    const now = moment().valueOf();
    const dateObj = {};
    const oneDaySpan = 24 * 60 * 60 * 1000;
    const orderLimitEndTime = convertDateString(dateFullFormat(moment()) + ' ' + order_time_limit_end).split(' ')[1];

    let endTime = Number(e_span_time),
        startTime = Number(s_span_time);

    if (Number(receiveEndSpan) === 1) {
        const date = moment();
        const hours = date.get('hour');
        const minutes = ('0' + date.get('minute')).slice(-2);
        const time = hours + ':' + minutes;

        // 跨周期时，如果此刻小于最晚下单时间，那么就以昨天为第一个周期
        endTime = (s_span_time === '0' && time < orderLimitEndTime) ? endTime : endTime + 1;
    }

    for (let i = startTime; i <= endTime; i++) {
        const temp = now + i * oneDaySpan;
        const tempDate = moment(temp);
        dateObj[i] = `${('0' + (tempDate.get('month') + 1)).slice(-2)}-${('0' + tempDate.get('date')).slice(-2)}`;
    }
    return _.toArray(dateObj);
};

/**
 * 生成预售收货日期时间数组
 * eg: receiveTimeSpanGeneratorPreSell("20:00", "13:30", 0, 2, '60', 1, "22:00")
 * @param r_start  收货周期开始时间
 * @param r_end    收货周期结束时间
 * @param startFlag   可选的收货时间开始天，相对今天的第n天
 * @param endFlag     可选的收货时间截止天，相对今天的第n天
 * @param receiveTimeSpan  收货时间间隔
 * @param receiveEndSpan   收货周期是否跨天
 * @param order_time_limit_end  今天下单截止时间
 * @returns {Array}  由形式为 '12-19 22：30' 的元素组成的数组
 */
const receiveTimeSpanGeneratorPreSell = (r_start, r_end, startFlag, endFlag, receiveTimeSpan, receiveEndSpan, order_time_limit_end) => {
    const dateArr = _.toArray(receiveDateGeneratorNew(startFlag, endFlag, receiveEndSpan, r_end, order_time_limit_end));
    const timeSpan = receiveTimeSpan * 60 * 1000;
    const oneDaySpan = 24 * 60 * 60 * 1000;
    const dateTimeArr = [];
    const dateArrLength = dateArr.length;

    for (let i = 0; i < dateArrLength; i++) {
        // 收货日期跨天
        let timeArr = [];
        let nowTimeTemp = moment().valueOf();
        const startHour = r_start.slice(0, 2);
        const startMin = r_start.slice(-2);
        const endHour = r_end.slice(0, 2);
        const endMin = r_end.slice(-2);
        let startTimeTemp = moment().set({'hour': startHour, 'minute': startMin, 'second': 0}).valueOf();
        let endTimeTemp = moment().set({'hour': endHour, 'minute': endMin, 'second': 0}).valueOf();
        const todayZero = moment().set({'hour': 0, 'minute': 0, 'second': 0}).valueOf();

        if (i === 0) {
            // 第二天 00:00
            let temp = endTimeTemp;
            if (dateToFlag(dateArr[i]) === '0') {
                while (nowTimeTemp <= temp && startTimeTemp <= temp) {
                    const hourMin = moment(temp).format('HH:mm');
                    timeArr.unshift(hourMin);
                    temp -= timeSpan;
                }

            } else {
                while (startTimeTemp <= temp) {
                    const hourMin = moment(temp).format('HH:mm');
                    timeArr.unshift(hourMin);
                    temp -= timeSpan;
                }
            }
            if (receiveEndSpan + '' === '1') {
                const end = todayZero + oneDaySpan;
                let temp = startTimeTemp;

                while (temp < end) {
                    if (temp < nowTimeTemp) {
                        temp += timeSpan;
                    } else {
                        const hourMin = moment(temp).format('HH:mm');
                        timeArr.push(hourMin);
                        temp += timeSpan;
                    }
                }
            }

            const endIndex = _.indexOf(timeArr, r_end);
            if (endIndex > -1) {
                timeArr.splice(endIndex, 1);
            }
        } else {
            if (receiveEndSpan + '' === '1') {
                let temp = todayZero + oneDaySpan;

                if(receiveTimeSpan === '60' && r_start.split(':')[1] === '30') {
                    temp = moment().set({'hour': 0, 'minute': 30, 'second': 0}).valueOf() + oneDaySpan;
                }

                endTimeTemp += oneDaySpan;
                while (endTimeTemp > temp) {
                    const hourMin = moment(temp).format('HH:mm');
                    timeArr.push(hourMin);
                    temp += timeSpan;
                }
                temp = todayZero + oneDaySpan;
                const laterTemp = [];

                if (i !== dateArrLength - 1) {
                    while (startTimeTemp < temp) {
                        temp -= timeSpan;
                        const hourMin = moment(temp).format('HH:mm');
                        laterTemp.unshift(hourMin);
                    }
                }
                timeArr.push(...laterTemp);
            } else {
                const timeArrTemp = standardTime(receiveTimeSpan);
                const startIndex = _.indexOf(timeArrTemp, r_start);
                const endIndex = _.indexOf(timeArrTemp, r_end);
                timeArr = timeArrTemp.slice(startIndex, endIndex);
            }
        }

        _.each(timeArr, time => {
            dateTimeArr.push(`${dateArr[i]} ${time}`);
        });
    }
    return dateTimeArr;
};

/**
 * 获取同一个周期的日期时间数组
 * eg: getCircleDateTime('03-11 21:00', "20:00", "13:30", 1, '60')
 * @param targetDateTime   最早收货时间
 * @param start            收货周期开始时间
 * @param end              收货周期结束时间
 * @param receiveEndSpan   收货周期是否跨天 [0, 1]
 * @param receiveTimeSpan  收货时间间隔 [15, 30, 60]
 * @returns {Array} 由形式为 '12-19 22：30' 的元素组成的数组
 */
const getCircleDateTime = (targetDateTime, start, end, receiveEndSpan, receiveTimeSpan) => {
    const nowYear = moment().year();
    const targetDate = targetDateTime.slice(0, 5);
    const targetTime = targetDateTime.slice(-5);
    const targetUnix = moment(convertDateString(`${nowYear}-${targetDate} ${targetTime}:00`), 'YYYY/MM/DD HH:mm:ss').valueOf();

    const targetFlag = dateToFlag(targetDate);
    const startTime = targetFlag === 0 ? moment().valueOf() : moment(convertDateString(`${nowYear}-${targetDate} ${start}:00`), 'YYYY/MM/DD HH:mm:ss').valueOf();
    let endTime;
    const circleDateTime = [],
        span = receiveTimeSpan * 60 * 1000;

    circleDateTime.push(targetDateTime);

    // 收货日期不跨天
    if (receiveEndSpan + '' === '0') {
        endTime = moment(convertDateString(`${nowYear}-${targetDate} ${end}:00`), 'YYYY/MM/DD HH:mm:ss').valueOf();
    } else {
        let tempStart = moment(convertDateString(`${nowYear}-${targetDate} ${start}:00`), 'YYYY/MM/DD HH:mm:ss').valueOf();
        // 当前所选处于第二天凌晨
        if (targetUnix < tempStart) {
            endTime = moment(convertDateString(`${nowYear}-${targetDate} ${end}:00`), 'YYYY/MM/DD HH:mm:ss').valueOf();
        } else {
            endTime = moment(convertDateString(`${nowYear}-${targetDate} ${end}:00`), 'YYYY/MM/DD HH:mm:ss').valueOf() + 24 * 60 * 60 * 1000;
        }

    }

    let before = targetUnix - span;
    while (before >= startTime) {
        circleDateTime.unshift(unixToDate(before));
        before -= span;
    }

    let after = targetUnix + span;
    while (after <= endTime) {
        circleDateTime.push(unixToDate(after));
        after += span;
    }

    return circleDateTime;
};

module.exports = {
    receiveTimeSpanGeneratorPreSell,
    getCircleDateTime
};