import {asyncLoadJS} from '../async_load_js'

function requireGmXlsx (callback) {
  asyncLoadJS('xlsx', () => {
    // Compatible with both webpack and rspack
    // gm-xlsx is external (loaded from CDN as global), use window.XLSX directly
    if (typeof window !== 'undefined' && window.XLSX) {
      callback(window.XLSX)
    } else if (typeof require !== 'undefined') {
      // Fallback for environments where xlsx might be bundled
      callback(require('gm-xlsx'))
    }
  })
}

export {
  requireGmXlsx
}
