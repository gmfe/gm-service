import { RequestInterceptor } from 'gm-util'

// 要求 reqeust config headers 中含 X-Guanmai-Request-Id X-Guanmai-Client
// 要求 __DEBUG__ 存在

const CLIENTIDKEY = '_GM_SERVICE_CLIENT_ID'
const enterPageTime = new Date().toString()

function getExtension () {
  let extension = {
    branch: window.____fe_branch,
    commit: window.____git_commit,
    group_id: window.g_group_id || window.g_partner_id || (window.g_user && window.g_user.group_id),
    name: (window.g_user && (window.g_user.name || window.g_user.username || window.g_user.user_name)) || null,
    station_id: window.g_user && window.g_user.station_id,
    cms: window.g_cms_config && window.g_cms_config.key,
    enterPageTime
  }

  return extension
}

// 请求统计需要
function configTrace (platform, options) {
  options = Object.assign({}, options)

  feed({
    clientId: window.localStorage && window.localStorage.getItem(CLIENTIDKEY),
    cookie: window.document.cookie,
    userAgent: window.navigator.userAgent
  }, `//trace.guanmai.cn/api/logs/environment/${platform}`)

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
      }, `//trace.guanmai.cn/api/logs/request/${platform}`)

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
      }, `//trace.guanmai.cn/api/logs/request/${platform}`)
    }
  })

  // dev devhost
  const noTest = window.location.host.indexOf('dev.guanmai.cn') === -1 && window.location.host.indexOf('devhost.guanmai.cn') === -1

  function feed (data, url) {
    data.extension = Object.assign({
      origin: window.location.href
    }, data.extension, getExtension())
    // 异步，不阻塞
    setTimeout(() => {
      if (__DEBUG__) { // eslint-disable-line
        // nothing
      } else if (noTest) {
        window.fetch(url, {
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
