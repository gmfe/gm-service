# 动作记忆
## 介绍与使用
简单的记录一些 UI 状态(比如搜索条件)到 localStorage , 后面可能增加服务端存储, 自动同步 localStorage 到服务端 DB , 实现跨端存储。
基本使用与 react-gm 的 Storage 类似，都向外暴露了 set 与 get 接口。当然还提供了一些额外的能力

### 目录
```bash
├── core
│   ├── action_storage.js # 不同 namespace 的 action_storage
│   ├── connection.js # 负责向服务端 同步数据
│   ├── constant.js 
│   ├── db_action_storage.js # 管理所有 action_storage
│   └── util.js
├── index.js
├── mobx.js # mobx 集成
├── redux.js # redux 集成
└── state.js # state 集成
```
### namespace
UI 状态可能有用户级别 / app 级别/ group 级别... 等等
namespace 用来区分这些，其实就是一个字符串数组，会影响到 key 的名称
key 格式 `{BASE}::{namespace}::{name(key)}`

### key的管理
使用单一文件描述 KeyName

### 服务端同步
TODO

### 状态集成
对常用的状态(redux, mobx, state) 提供简单的集成支持，能自动的对状态进行 **初始化(从 localStorage 读取值)** 和 **更新(状态更新到 localStorage)**。但是 **只适用于一些简单场景**（对初始化和更新时机没有特别要求）。

### 基本使用
```javascript
// action_storage.js 做初始化
import {DBActionStorage} from 'gm-service/src/action_storage'

// 添加各种 namespace 的 storage
// 默认为 user
DBActionStorage.addDefaultStorage({name: 'user', namespace: user.name})

// station 添加后可通过 get{Name}Storage (getStationStorage) 获取
DBActionStorage.addStorage({name: 'station', namespace: station.id})

// -------

// xx.js 使用
import {DBActionStorage} from 'gm-service/src/action_storage';
import ACTION_STORAGE_KEY_NAMES from '../common/action_storage_key_names';
// 读写默认 namespace (user) 的 storage
DBActionStorage.set(ACTION_STORAGE_KEY_NAMES.AA, {a:'a'})
DBActionStorage.get(ACTION_STORAGE_KEY_NAMES.AA)

// 读写 station namespace 的 storage
let stationStorage = DBActionStorage.getStationStorage()
stationStorage.set(ACTION_STORAGE_KEY_NAMES.AA, {a:'a'})
stationStorage.get(ACTION_STORAGE_KEY_NAMES.AA)
```
### 状态集成
#### Options
统一通过 options 来配置，目前只有三个字段
* **storageName**
使用哪个 storage 来 set 和 get，如果没传，则取 default
* **name**
会在 set/get 时用到
* **selector**
选择器，用于从对象中选择一部分属性，基本等同于 lodash 中的 paths

#### Mobx
```javascript
import {withMobxStorage} from 'gm-service/src/action_storage'
import GM_ACTION_STORAGE_KEY_NAMES from '../../common/action_storage_key_names'
@withMobxStorage({name: GM_ACTION_STORAGE_KEY_NAMES.FINANCE_BILL, selector: ['data.search_type']})
class Store {
  @observable data = {
    begin_time: new Date(),
    end_time: new Date(),
    search_text: '',
    search_type: '1',
  }

  @observable stationList = []
}
```

#### Redux
```javascript
import {mapActionStorage} from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../common/action_storage_key_names'

const initState = {
  salesList: {},
  salesBossList: {},
  filter: {
    search_type: '1',
    search_txt: '',
  }
}

let reducers = {}
reducers.customerBill = (state = initState, action) => {
  switch (action.type) {
    /* ... */
  }
}

let storageOptions = {}
// 使用同样的 optiosn 配置
// customerBill 与 reducer 要一致
storageOptions.customerBill = {
  selector: ['filter.search_type'],
  name: ACTION_STORAGE_KEY_NAMES.FINANCE_BILL
}

mapActionStorage(reducers, storageOptions)
mapReducers(reducers)
```
#### State
```javascript
import {withViewStateStorage, withPropsViewStateStorage} from 'gm-service/src/action_storage'

// 会自动 初始化/更新 search_type 字段
@withViewStateStorage({selector: ['search_type'], name: ACTION_STORAGE_KEY_NAMES.FINANCE_BILL})
class Customer extends React.Component {
  state = {
    search_type: '1'
  }
}

// 可能一个组件会被很多地方复用
// 这时可以由调用方传递 props storageOptions 来配置 options
@withPropsViewStateStorage({selector: ['search_type']})
class Filter extends React.Component {
  state = {
    search_type: '1'
  }
  render(){
    return <Flex>
      {/* ... */}
    </Flex>
  }
}
class App extends React.Component {
  render(){
    // 配置存储 的 name
    return <Filter storageOptions={{name: ACTION_STORAGE_KEY_NAMES.FINANCE_BILL}}/>
  }
}
```