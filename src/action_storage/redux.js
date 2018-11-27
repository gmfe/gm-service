import Storage from './core/db_action_storage'
import { getBySelector, setBySelector } from './core/util'

let INIT_TYPE = '@@GM_ACTION_STORAGE_REDUX_INIT'

let optsStore = {}

// 在 mapReducers 调用前 修改 initialState
function mapActionStorage (reducers, options) {
  Object.assign(optsStore, options)
  Object.keys(reducers).forEach(field => {
    let originalReducer = reducers[field]
    let {selector, name, storageName} = options[field]
    let storage = Storage.getInstance(storageName)
    if (selector) {
      let initialState = originalReducer(undefined, INIT_TYPE)
      let value = storage.get(name)
      setBySelector(initialState, selector, value)
    }
  })
}
function initReduxActionStorage (store) {
  let previousCache = {}
  let handleUpdate = () => {
    let state = store.getState()
    Object.entries(optsStore)
      .forEach(([field, {name, selector, storageName}]) => {
        let curState = state[field]
        if (!previousCache[field]) { // dispatch INIT
          previousCache[field] = curState
        }
        if (previousCache[field] === curState) {
          return
        }
        let storage = Storage.getInstance(storageName)
        previousCache[field] = curState
        let newValue = getBySelector(curState, selector)
        storage.set(name, newValue)
      })
  }
  store.subscribe(handleUpdate)
}
export {
  mapActionStorage, initReduxActionStorage
}
