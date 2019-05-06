import Storage from './core/db_action_storage'
import {getBySelector, assert} from './core/util'

// 需要拿到 state 所以 targetClass 必须是组件自身
// 而不是包装过的(redux connect)
const withViewStateStorage = (options) => (targetClass) => {
  const {selector, name, storageName} = options
  return class extends targetClass {
    constructor (...args) {
      super(...args)
      assert(name !== undefined, '必须提供 key 名称用于存储!')
      this.__storage = Storage.getInstance(storageName)
      // 从 storage 获取到记忆值
      let partialState = this.__storage.get(name)
      this.state = Object.assign({}, this.state, partialState)
    }
    componentDidUpdate (...args) {
      super.componentDidUpdate && super.componentDidUpdate(...args)
      let newValue = getBySelector(this.state, selector)
      this.__storage.set(name, newValue)
    }
    componentWillUnmount (...args) {
      super.componentWillUnmount && super.componentWillUnmount(...args)
      let newValue = getBySelector(this.state, selector)
      this.__storage.set(name, newValue)
    }
  }
}

// 通过 props storageOptions 动态传递
// 如果没传 不记忆
const withPropsViewStateStorage = (options) => (targetClass) => {
  return class extends targetClass {
    constructor (...args) {
      super(...args)
      const storageOptions = this.props.storageOptions
      if (!storageOptions) {
        return
      }
      this.needStorage = true
      const {name, selector, storageName} = Object.assign({}, options, storageOptions)
      this.__selector = selector
      this.__key = name
      this.__storage = Storage.getInstance(storageName)

      let partialState = this.__storage.get(this.__key)
      this.state = Object.assign({}, this.state, partialState)
    }
    componentDidUpdate (...args) {
      super.componentDidUpdate && super.componentDidUpdate(...args)
      if (!this.needStorage) {
        return
      }
      let newValue = getBySelector(this.state, this.__selector)
      this.__storage.set(this.__key, newValue)
    }
    // 从 storage 获取到记忆值
    componentWillUnmount (...args) {
      super.componentWillUnmount && super.componentWillUnmount(...args)
      if (!this.needStorage) {
        return
      }
      let newValue = getBySelector(this.state, this.__selector)
      this.__storage.set(this.__key, newValue)
    }
  }
}

export {
  withViewStateStorage, withPropsViewStateStorage
}
