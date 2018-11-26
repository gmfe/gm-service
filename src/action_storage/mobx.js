import Storage from './core/db_action_storage'
import {reaction} from 'mobx'
import {setBySelector, getBySelector} from './core/util'

// targetClass 是 mobx 的 store
const withMobxStorage = (options) => (targetClass) => {
  const {name, selector, storageName} = options

  function init (self) {
    if (!selector) {
      return
    }
    const storage = Storage.getInstance(storageName)
    // 从 storage 获取到记忆值
    let value = storage.get(name)
    // 初始化
    setBySelector(self, selector, value)
    createUpdateHandler(name, () => {
      return getBySelector(self, selector)
    })
    // 数据变化时 更新Storage
    function createUpdateHandler (name, getter) {
      reaction(
        () => {
          let value = getter()
          return value
        },
        (state, reaction) => {
          storage.set(name, state)
        },
        {
          delay: 500
        }
      )
    }
  }
  return class extends targetClass {
    constructor (...args) {
      super(...args)
      init(this)
    }
  }
}
export {
  withMobxStorage
}
