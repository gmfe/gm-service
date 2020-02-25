import React from 'react'
import { RequestInterceptor } from 'gm-util'
import { Tip } from 'react-gm'

// 操作记录log
const reportOperationLog = config => {
  // dev devhost
  const isTest =
    window.location.host.indexOf('dev.k8s.guanmai.cn') !== -1 ||
    window.location.host.indexOf('devhost.guanmai.cn') !== -1
  const CLIENTIDKEY = '_GM_SERVICE_CLIENT_ID'
  // eslint-disable-next-line
  if (__DEBUG__ || isTest) {
    return
  }

  // eslint-disable-next-line
  const { key } = window.g_cms_config
  const data = {
    config: JSON.stringify(config),
    key: key,
    clientId: window.localStorage && window.localStorage.getItem(CLIENTIDKEY)
  }

  // 异步，不阻塞
  setTimeout(() => {
    window.fetch('//trace.guanmai.cn/api/logs/more/bshop', {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    })
  }, 100)
}


const useErrorInterceptor = () => {
  const showMsg = (shower, msgs) => {
    shower({
      children: msgs.map((msg, i) => <div key={i}> {msg} </div>),
      time: 5000
    })
  }
  const errorInterceptor = {
    response (json, config) {
      if (!config.sucCode.includes(json.code)) {
        // 业务错误
        let msg = [json.msg || '未知的错误']
        showMsg(Tip.warning.bind(Tip), msg)
      }
      return json
    },
    responseError (reason, config) {
      // reason 两种
      // 1. http错误 502 Bad Gateway 等
      // 2. 连接超时 TypeError Failed to fetch 等网络问题

      let msg = [reason + '' + config.url]
      reportOperationLog(config)
      showMsg(Tip.danger.bind(Tip), msg)
    }
  }
  RequestInterceptor.add(errorInterceptor)
}
export default useErrorInterceptor
