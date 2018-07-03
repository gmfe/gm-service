import {asyncLoadJS} from '../async_load_js'

function requireGmXlsx (callback) {
  asyncLoadJS('xlsx', () => {
    require.ensure([], function (require) {
      const res = require('gm-xlsx')
      callback(res)
    })
  })
}

export {
  requireGmXlsx
}
