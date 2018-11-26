import {keyFactory, joinKey, assert} from './util'
import {BASE_PREFIX} from './constant'

let localStorage = window.localStorage
// 1. 从 localStorage 中获取数据
// 2. 管理 namespace
// PREFIX = BASE::{namespace}::name(key)
class ActionStorage {
  constructor (namespace) {
    assert(namespace !== undefined, 'namespace 不能为空!')
    // namespace 为字符串 or 字符串数组
    // BASE_PREFIX + namespace 作为 prefix
    this.prefix = joinKey([BASE_PREFIX].concat(namespace))
    this.changed = {}
    this.getPrefixKey = keyFactory(this.prefix)
  }
  load (entries) {
    for (let [key, value] of entries) {
      this._set(key, value)
    }
  }
  checkAccess (name) {
    assert(name !== undefined, 'key name 为 undefined! 检查传入的 keyName')
  }
  set (name, value) {
    this.checkAccess(name)
    let key = this.getPrefixKey(name)
    this._set(key, value)
    this.changed[key] = value
    return [key, value]
  }
  get (name) {
    this.checkAccess(name)
    let key = this.getPrefixKey(name)
    return this._get(key)
  }
  assign (name, value) {
    let oldValue = this.get(name)
    value = Object.assign({}, oldValue, value)
    this.set(name, value)
  }
  getAll () {
    let entries = []
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i)
      if (key.startsWith(this.prefix)) {
        entries.push([key, this._get(key)])
      }
    }
    return entries
  }
  getChangedEntries () {
    return Object.entries(this.changed)
  }
  setChanged (changed) {
    this.changed = changed
  }
  _get (key, value) {
    let str = localStorage.getItem(key)
    return JSON.parse(str)
  }
  _set (key, value) {
    value = JSON.stringify(value)
    localStorage.setItem(key, value)
  }
}

export default ActionStorage
