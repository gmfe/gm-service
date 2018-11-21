import React from 'react'
import { RequestInterceptor } from 'gm-util'
import { Tip } from 'react-gm'

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
      let msg = [reason + '']
      showMsg(Tip.danger.bind(Tip), msg)
    }
  }
  RequestInterceptor.add(errorInterceptor)
}
export default useErrorInterceptor
