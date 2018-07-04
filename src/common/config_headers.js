import {md5, UUID, RequestInterceptor} from 'gm-util'

const CLIENTIDKEY = '_GM_SERVICE_CLIENT_ID'
const {localStorage} = window

let clientId = localStorage.getItem(CLIENTIDKEY) || ''
if (!clientId) {
  clientId = md5(UUID.generate())
  localStorage.setItem(CLIENTIDKEY, clientId)
}

const configHeaders = (name, version) => {
  RequestInterceptor.add({
    request (config) {
      config.options.headers = config.options.headers || {}

      config.options.headers['X-Guanmai-Client'] = `${name}/${version} ${clientId}`
      config.options.headers['X-Guanmai-Request-Id'] = md5(UUID.generate())

      return config
    }
  })
}

export default configHeaders
