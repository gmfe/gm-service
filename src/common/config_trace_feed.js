// 要求 __DEBUG__ 存在
// dev devhost
const CLIENTIDKEY = '_GM_SERVICE_CLIENT_ID'
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
  console.warn('废弃废弃废弃，直接调configTrace就可以了')
  const extension = Object.assign({
    origin: window.location.href
  }, data.extension, _extension)

  if (options) { // options通过参数的形式传进来，为非RequestInterceptor方式的调用
    data = Object.assign({}, data, {extension}, options.extension)
  } else { // 通过RequestInterceptor方式的调用
    // 排查丢失cookie bug， bshop的每个请求都带上cookie和clientId
    if (platform === 'bshop') data.extension = Object.assign({}, extension, {clientId: window.localStorage && window.localStorage.getItem(CLIENTIDKEY), cookie: window.document.cookie})
    else data.extension = extension
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
