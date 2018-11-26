import ActionStorage from './action_storage'
import DBConnection from './connection'
import {DEFAULT_STORAGE_NAME} from './constant'
import {assert, firstUppercase, getBySelector} from './util'

// DBActionStorage 管理不同 namespace 的 Storage
// 通过 DBConnection 同步数据到服务端
class DBActionStorage {
  constructor () {
    this.dbConnection = new DBConnection()
    this.storageContainer = {}
    this.helpers = {}
    this._setup()
  }
  _setup () {
    // 页面关闭同步
    window.addEventListener('unload', () => {
      this.sync()
    })
    // 5分钟同步一次
    this.timer = setInterval(() => {
      this.sync()
    }, 5 * 60 * 1000)
  }

  // 从服务端加载keys
  async loadServerData () {
    if (!this.dbConnection) {
      return
    }
    let con = this.dbConnection
    let allStorage = this._getAllStorage()
    let prefixes = allStorage.map((storage) => storage.prefix)
    // 只加载需要的 prefix
    let entriesArray = await con.getEntriesByPrefixes(prefixes)
    entriesArray.forEach((entries, i) => {
      let storage = allStorage[i]
      // TODO: 确认 entries key 包含了 BASE_PREFIX
      storage.load(entries)
    })
  }
  // 与服务端同步
  async sync () {
    if (!this.dbConnection) {
      return
    }
    let con = this.dbConnection
    let allStorage = this._getAllStorage()
    let entries = []
    allStorage.forEach((storage) => {
      let changed = storage.getChangedEntries()
      storage.setChanged({})
      entries = entries.concat(changed)
    })
    console.log('同步 entries', entries)
    // TODO: 同步失败 如何处理 changed
    await con.syncEntries(entries)
  }
  _getAllStorage () {
    return Object.values(this.storageContainer)
  }
  _createStorage (namespace) {
    let storage = new ActionStorage(namespace)
    return {
      set: storage.set.bind(storage),
      get: storage.get.bind(storage),
      assign: storage.assign.bind(storage)
    }
  }
  addStorage ({name, namespace}) {
    let instance = this.storageContainer[name]
    assert(instance === undefined, `Storage ${DEFAULT_STORAGE_NAME} 只能初始化一次!`)
    this.storageContainer[name] = this._createStorage(namespace)
    let upperCase = firstUppercase(name)
    // 添加快捷方法
    this[`get${upperCase}Storage`] = () => {
      return this.getInstance(name)
    }
    return instance
  }
  addDefaultStorage ({name, namespace}) {
    this.addStorage({name, namespace})
    this.defaultName = name
  }
  addHelper (helper) {
    let name = helper.name
    assert(name !== '', 'helper name 不能为空!')
    this.helpers[name] = helper
  }
  get helper () {
    return this.helpers
  }
  get (keyName) {
    return this.getInstance().get(keyName)
  }
  set (name, value) {
    return this.getInstance().set(name, value)
  }
  assign (name, value) {
    return this.getInstance().assign(name, value)
  }
  assignBySelector (name, state, selector) {
    let value = getBySelector(state, selector)
    return this.assign(name, value)
  }
  setBySelector (name, state, selector) {
    let value = getBySelector(state, selector)
    return this.set(name, value)
  }
  getInstance (name) {
    if (!name) {
      name = this.defaultName
    }
    let instance = this.storageContainer[name]
    assert(instance !== undefined, `Storage ${name} 尚未初始化!`)
    return instance
  }
}

// 统一管理不同 namespace 的 storage
export default new DBActionStorage()
