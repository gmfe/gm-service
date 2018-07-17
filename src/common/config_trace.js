import { RequestInterceptor } from 'gm-util'

// 要求 reqeust config headers 中含 X-Guanmai-Request-Id X-Guanmai-Client
// 要求 __DEBUG__ 存在

// 请求统计需要
function configTrace (platform, options) {
  let groupId = (window.g_group_id !== undefined && window.g_group_id) || (window.g_partner_id !== undefined && window.g_partner_id)

  options = Object.assign({}, {
    extension: {
      origin: window.location.href,
      branch: window.____fe_branch,
      commit: window.____git_commit,
      group_id: groupId,
      name: (window.g_user && (window.g_user.name || window.g_user.username)) || null,
      station_id: window.g_user && window.g_user.station_id,
      cms: window.g_cms_config && window.g_cms_config.key
    }
  }, options)

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

      feed({
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
      })

      return json
    },
    responseError (reason, config) {
      const uuid = config.options.headers['X-Guanmai-Request-Id']

      feed({
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
      })
    }
  })

  // dev devhost
  const noTest = window.location.host.indexOf('dev.guanmai.cn') === -1 && window.location.host.indexOf('devhost.guanmai.cn') === -1

  function feed (data) {
    // 异步，不阻塞
    setTimeout(() => {
      data.extension = Object.assign(data.extension, options.extension)

      if (__DEBUG__) { // eslint-disable-line
        // nothing
      } else if (noTest) {
        window.fetch(`//trace.guanmai.cn/api/logs/request/${platform}`, {
          method: 'post',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        })
      }
    }, 10)
  }
}

export default configTrace
