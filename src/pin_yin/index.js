import pinyin from 'gm-pinyin'
import _ from 'lodash'

const cache = {}

const pinYinV2Filter = (list, filterText, what) => {
  if (!filterText) {
    return list || []
  }

  what = what || (v => v)
  filterText = filterText.toLowerCase()

  return _.filter(list, v => {
    let w = what(v)
    if (!_.isString(w)) {
      w = ''
    }
    w = w.toLowerCase()

    // cache
    let pyList = cache[w]
    if (!pyList) {
      pyList = pinyin(w, {
        style: pinyin.STYLE_NORMAL
      })
      cache[w] = pyList
    }

    // 全拼集合
    const normal = _.map(pyList, v => v[0]).join('')

    // 首字母集合
    const firstLetter = _.map(pyList, v => v[0][0]).join('')

    return (w.indexOf(filterText) > -1 || normal.indexOf(filterText) > -1 || firstLetter.indexOf(filterText) > -1)
  })
}

const firstLetterCache = {}
const getFirstLetter = (w) => {
  // cache
  let fl = firstLetterCache[w]
  if (!fl) {
    fl = _.map(pinyin(w, {
      style: pinyin.STYLE_NORMAL
    }), v => v[0][0]).join('')
    firstLetterCache[w] = fl
  }

  return fl
}

export {
  pinYinV2Filter,
  getFirstLetter
}
