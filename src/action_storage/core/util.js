import _ from 'lodash'
import {SEPARATOR} from './constant'

function traverseObj (path, paths, parentPathArr = []) {
  if (_.isPlainObject(path)) {
    Object.keys(path).forEach((key) => {
      let value = path[key]
      parentPathArr.push(key)
      traverseObj(value, paths, parentPathArr)
    })
  } else if (_.isArray(path)) {
    path.forEach((obj) => {
      traverseObj(obj, paths, parentPathArr)
    })
  } else {
    let curPath = parentPathArr.concat(path)
    paths.push(curPath.join('.'))
  }
}
function flatttenObjPath (obj) {
  let paths = []
  traverseObj(obj, paths)
  return paths
}
// obj = { a:{b,c,d},e:'',f:{g:''} }
// selector = ['e','f.g', {a:[b,c,d]}]
// selector 是基于 paths 的扩展
function selector2Paths (selector) {
  let paths = []
  if (!Array.isArray(selector)) {
    selector = [selector]
  }
  selector.forEach((path) => {
    if (typeof path === 'string') {
      paths.push(path)
    } else if (typeof path === 'object') {
      let objPaths = flatttenObjPath(path)
      paths = paths.concat(objPaths)
    } else {
      throw new Error('illegal selector')
    }
  })
  return paths
}
function setBySelector (obj, selector, value) {
  let paths = selector2Paths(selector)
  for (let path of paths) {
    let data = _.get(value, path)
    if (data !== undefined) {
      _.set(obj, path, data)
    }
  }
}
function getBySelector (obj, selector) {
  let paths = selector2Paths(selector)
  return _.pick(obj, paths)
}

const joinKey = (...keys) => {
  if (Array.isArray(keys[0])) {
    keys = keys[0]
  }
  return keys.join(SEPARATOR)
}
const keyFactory = (prefix) => keyStr => {
  return joinKey(prefix, keyStr)
}
const assert = (exp, msg) => {
  if (!exp) {
    throw new Error(msg)
  }
}
const firstUppercase = (name) => {
  return name.slice(0, 1).toUpperCase() + name.slice(1)
}
export {
  setBySelector, getBySelector, joinKey, keyFactory, assert, firstUppercase
}
