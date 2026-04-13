import {asyncLoadJS} from '../async_load_js'

function requireEcharts (callback) {
  asyncLoadJS('echarts', () => {
    // Compatible with both webpack and rspack
    // echarts is external (loaded from CDN as global), use window.echarts directly
    // require.ensure is webpack-specific and not supported by rspack
    if (typeof window !== 'undefined' && window.echarts) {
      callback(window.echarts)
    } else if (typeof require !== 'undefined') {
      // Fallback for environments where echarts might be bundled
      callback(require('echarts'))
    }
  })
}

export default requireEcharts
