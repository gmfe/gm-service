import _ from 'lodash'
import moment from 'moment'

// 注意：为了方便，此库的日期都用 moment 格式表示，非 Date
// 选开始才选结束
//
// 收货开始时间不能和结束时间一样
// 如果某周期只有一个点，则此周期不能选

// 数据结构
// const receive_ime = {
//   'msg': '12-26 00:00~12-27 00:00',
//   'receive_time_limit': {
//     'r_start': '01:30',
//     'e_span_time': 14,
//     'receiveTimeSpan': '15',
//     's_span_time': 0,
//     'time_config_id': 'ST1305',
//     'r_end': '01:30',
//     'receiveEndSpan': 1
//   },
//   'receive_time': {
//     'defaultStart': '00:00',
//     'defaultSpanStartFlag': 12,
//     'defaultEnd': '00:00',
//     'defaultSpanEndFlag': 13
//   }
// }

/*
* 收货时间分可以分为于是和非预售
* 目前 receiveTimeSpan 为 null，即代表非预售（预算这个一定有值）
* 非预售可以通过 e_span_time 和 s_span_time 来判断是否跨天
* */
function processReceiveTimeLimit(receive_time_limit) {
  const {
    receiveEndSpan,
    s_span_time,
    e_span_time
  } = receive_time_limit

  return {
    ...receive_time_limit,
    receiveEndSpan: receiveEndSpan !== null ? receiveEndSpan : (e_span_time - s_span_time)
  }
}

// 处理 默认收货时间时间。receive_time 可能不存在。默认收货时间可能不合法，和当前时间比较
function processStartEndValues(receiveTime) {
  console.warn('废弃，请用 processStartEndValuesWithCycleList')
  if (!receiveTime) {
    return {
      startValues: [],
      endValues: []
    }
  }

  // 当天才需要校验,不合法直接 start end 不用
  if (receiveTime.defaultSpanStartFlag === 0) {
    const start = moment().set({
      hours: receiveTime.defaultStart.split(':')[0],
      minute: receiveTime.defaultStart.split(':')[1]
    }).startOf('minute')

    if (start < moment()) {
      return {
        startValues: [],
        endValues: []
      }
    }
  }

  // 默认
  let startValues = [
    receiveTime.defaultSpanStartFlag,
    receiveTime.defaultStart
  ]
  let endValues = [
    receiveTime.defaultSpanEndFlag,
    receiveTime.defaultEnd
  ]

  return {
    startValues,
    endValues
  }
}

function processStartEndValuesWithCycleList(receiveTime, cycleList, orderTime = null) {
  const now = orderTime ? moment(orderTime) : moment()
  if (!receiveTime) {
    return {
      startValues: [],
      endValues: []
    }
  }

  const {
    defaultSpanStartFlag,
    defaultStart,
    defaultSpanEndFlag,
    defaultEnd
  } = receiveTime

  const start = moment(now).add(defaultSpanStartFlag, 'days').set({
    hours: defaultStart.split(':')[0],
    minute: defaultStart.split(':')[1]
  }).startOf('minute')

  const end = moment(now).add(defaultSpanEndFlag, 'days').set({
    hours: defaultEnd.split(':')[0],
    minute: defaultEnd.split(':')[1]
  }).startOf('minute')

  // 默认
  let startValues = [
    defaultSpanStartFlag,
    defaultStart
  ]
  let endValues = [
    defaultSpanEndFlag,
    defaultEnd
  ]

  const list = _.flatten(cycleList)
  const hasStart = _.find(list, v => +v === +start)
  const hasEnd = _.find(list, v => +v === +end)
  if (!hasStart) {
    startValues = []
    endValues = []
  } else if (!hasEnd) {
    endValues = []
  }

  return {
    startValues,
    endValues
  }
}

function getFlag(m, orderTime = null) {
  let current = orderTime ? moment(orderTime) : moment()
  return Math.floor((m - current.startOf('day')) / (3600 * 24 * 1000))
}

function getTime(spanTime, timeStr, orderTime = null) {
  let time = orderTime ? moment(orderTime) : moment()
  return time.add(spanTime, 'days').set({
    hours: timeStr.split(':')[0],
    minute: timeStr.split(':')[1]
  }).startOf('minute')
}

// 获取一个周期的时间
function getOneCycleTimes(spanTime, receive_time_limit, orderTime = null) {
  const {
    receiveEndSpan,
    r_start,
    r_end,
    receiveTimeSpan
  } = receive_time_limit

  const now = orderTime ? moment(orderTime) : moment()
  let flag = getTime(spanTime, r_start, orderTime)
  if (spanTime === 1) spanTime = 0
  const end = getTime(spanTime + receiveEndSpan, r_end, orderTime)

  const result = []

  while (flag <= end) {
    // 只有大于当前时间才有效
    if (flag > now) {
      result.push(moment(flag))
    }

    flag = flag.add(~~receiveTimeSpan, 'minutes')
  }

  return result
}

// 核心。把周期时间输出一个二维数组，每个元素是当前周期的时间点
function getCycleList(receive_time_limit, orderTime = null) {
  const {
    r_end, receiveEndSpan, // eslint-disable-line
    s_span_time,
    e_span_time
  } = receive_time_limit

  let end = e_span_time + 1

  const spanList = _.range(s_span_time, end)

  let cycleList = _.map(spanList, cycle => {
    return getOneCycleTimes(cycle, receive_time_limit, orderTime)
  })

  // 开始时间不能和结束时间一样，估需过滤掉只有一个数据的周期
  cycleList = _.filter(cycleList, cycle => cycle.length > 1)

  return cycleList
}

// 获取开始收货时间的带选项
function getStartCycleList(cycleList) {
  let result = _.map(cycleList, list => {
    return list.slice(0, -1)
  })

  return result
}

// 获取开始后货时间的待选项。
// 当开始选择后，自然有开始时间 startDate，根据此时间去查属于哪个周期，自然得到待选项
function getEndCycleList(startDate, cycleList) {
  let cycleIndex = 0
  _.each(cycleList, (list, i) => {
    if (startDate >= list[0]) {
      cycleIndex = i
    }
  })

  return [_.filter(cycleList[cycleIndex], v => v > startDate)]
}

// 周期列表格式对用户看到的待选项UI并不友好，估需要转换下，按日期格式分
function cycleListToDayList(cycleList) {
  const result = []
  // 打平
  const list = _.flatten(cycleList)

  let dayEnd = null
  let temp = []
  _.each(list, d => {
    if (!dayEnd) {
      dayEnd = moment(d).endOf('day')
    }
    if (d > dayEnd) {
      result.push(temp)

      dayEnd = moment(d).endOf('day')
      temp = [d]
    } else {
      temp.push(d)
    }
  })

  result.push(temp)

  return result
}

export {
  processReceiveTimeLimit,
  processStartEndValues,
  processStartEndValuesWithCycleList,
  getFlag,
  getCycleList,
  getStartCycleList,
  getEndCycleList,
  cycleListToDayList
}
