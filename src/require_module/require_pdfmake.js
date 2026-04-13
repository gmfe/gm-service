import {asyncLoadJS} from '../async_load_js'

const array = ['gm-pdfmake', 'gm-pdfmake-font-bold-0', 'gm-pdfmake-font-bold-1', 'gm-pdfmake-font-regular-0', 'gm-pdfmake-font-regular-1']

function requirePdfMake (callback) {
  asyncLoadJS(array).then(() => {
    // Compatible with both webpack and rspack
    // Modules are external (loaded from CDN as globals), use window directly
    const pdfMake = window.pdfMake

    // Font files define globals that need to be concatenated
    const bold0 = window['gm-pdfmake-font-bold-0'] || ''
    const bold1 = window['gm-pdfmake-font-bold-1'] || ''
    const regular0 = window['gm-pdfmake-font-regular-0'] || ''
    const regular1 = window['gm-pdfmake-font-regular-1'] || ''

    pdfMake.vfs = {
      'regular.ttf': regular0 + regular1,
      'bold.ttf': bold0 + bold1
    }
    pdfMake.fonts = {
      MicrosoftYaHei: {
        normal: 'regular.ttf',
        bold: 'bold.ttf'
      }
    }
    callback(pdfMake)
  })
}

export default requirePdfMake
