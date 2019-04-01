import React from 'react'
import ReactDOM from 'react-dom'
import semver from 'semver'
import { asyncLoadJS } from '../async_load_js'

if (!window.React) window.React = React
if (!window.ReactDOM) window.ReactDOM = ReactDOM

const reactVersionToSatisfy = '^16.3.1'

if (!semver.satisfies(window.React.version, reactVersionToSatisfy)) {
  throw new Error(`当前window.React版本 ${React.version} 不兼容react-beautiful-dnd@10.1.1，须满足 ${reactVersionToSatisfy}`)
}

function requireBeautifulDnd () {
  return new Promise(resolve => {
    asyncLoadJS('react-beautiful-dnd', resolve)
  })
}

export default requireBeautifulDnd
