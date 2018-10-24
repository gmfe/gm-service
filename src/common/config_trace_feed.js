// 要求 __DEBUG__ 存在
// dev devhost
const noTest = window.location.host.indexOf('dev.guanmai.cn') === -1 && window.location.host.indexOf('devhost.guanmai.cn') === -1

const groupId = (window.g_group_id !== undefined && window.g_group_id) || (window.g_partner_id !== undefined && window.g_partner_id)
const _extension = {
  // 应在 上报 的时候才获取
  // origin: window.location.href,
  branch: window.____fe_branch,
  commit: window.____git_commit,
  group_id: groupId,
  name: (window.g_user && (window.g_user.name || window.g_user.username)) || null,
  station_id: window.g_user && window.g_user.station_id,
  cms: window.g_cms_config && window.g_cms_config.key
}

function configTraceFeed (data, platform, options) {
  const extension = Object.assign({
    origin: window.location.href
  }, data.extension, _extension)

  if (options) { // options通过参数的形式传进来，为非RequestInterceptor方式的调用
    data = Object.assign({}, data, {extension}, options.extension)
  } else { // 通过RequestInterceptor方式的调用
    data.extension = extension
  }
  // 异步，不阻塞
  setTimeout(() => {
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

export default configTraceFeed
