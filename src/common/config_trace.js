import { RequestInterceptor } from 'gm-util'
import configTraceFeed from './config_trace_feed'

// 要求 reqeust config headers 中含 X-Guanmai-Request-Id X-Guanmai-Client

// 请求统计需要
function configTrace (platform, options) {
  const timeMap = {}
  RequestInterceptor.add({
    request (config) {
      const uuid = config.options.headers['X-Guanmai-Request-Id']
      timeMap[uuid] = Date.now()

      return config
    },
    response (json, config) {
      const isSuccess = config.sucCode.indexOf(json.code) > -1
      const uuid = config.options.headers['X-Guanmai-Request-Id']

      configTraceFeed({
        url: config.url,
        req: {
          data: config.data
        },
        res: {
          code: json.code,
          msg: json.msg
        },
        isSuccess,
        time: Date.now() - timeMap[uuid],
        extension: {
          client: config.options.headers['X-Guanmai-Client'],
          requestId: uuid
        }
      }, platform, options)

      return json
    },
    responseError (reason, config) {
      const uuid = config.options.headers['X-Guanmai-Request-Id']

      configTraceFeed({
        url: config.url,
        req: {
          data: config.data
        },
        res: {
          code: null,
          msg: reason + ''
        },
        isSuccess: false,
        time: Date.now() - timeMap[uuid],
        extension: {
          client: config.options.headers['X-Guanmai-Client'],
          requestId: uuid
        }
      }, platform, options)
    }
  })
}

export default configTrace
