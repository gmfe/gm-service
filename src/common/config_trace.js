import { RequestInterceptor } from 'gm-util'

// 要求 reqeust config headers 中含 X-Guanmai-Request-Id X-Guanmai-Client
// 要求 __DEBUG__ 存在

// 请求统计需要
function configTrace (platform, options) {
  let groupId = (window.g_group_id !== undefined && window.g_group_id) || (window.g_partner_id !== undefined && window.g_partner_id)
  const CLIENTIDKEY = '_GM_SERVICE_CLIENT_ID'
  // dev devhost
  const noTest = window.location.host.indexOf('dev.guanmai.cn') === -1 && window.location.host.indexOf('devhost.guanmai.cn') === -1

  options = Object.assign({}, {
    extension: {
      // 应在 上报 的时候才获取
      // origin: window.location.href,
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
      report(json, config, isSuccess)

      return json
    },
    responseError (reason, config) {
      report(reason, config, false)
    }
  })

  function report (result, config, isSuccess) {
    const uuid = config.options.headers['X-Guanmai-Request-Id']
    feed({
      url: config.url,
      req: {
        data: config.data
      },
      res: {
        code: isSuccess ? result.code : null,
        msg: isSuccess ? result.msg : result + ''
      },
      isSuccess: isSuccess,
      time: Date.now() - timeMap[uuid],
      extension: {
        client: config.options.headers['X-Guanmai-Client'],
        requestId: uuid
      }
    }, `//trace.guanmai.cn/api/logs/request/${platform}`)
    feed({
      time: Date.now(),
      clientId: window.localStorage && window.localStorage.getItem(CLIENTIDKEY),
      cookie: window.document.cookie,
      userAgent: window.navigator.userAgent
    }, `//trace.guanmai.cn/api/logs/environment/${platform}`)
  }

  function feed (data, url) {
    data.extension = Object.assign({
      origin: window.location.href
    }, data.extension, options.extension)

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
