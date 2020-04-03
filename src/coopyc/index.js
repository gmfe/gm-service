import _ from 'lodash'
// 屏蔽
const funcList = [
  'gio',
  'log', // 日志
  'app_center', // 应用中心
  'kf', // 客服
  'arrears_tip', // 到期提醒
  'upgrade_warning', // 配置公告
  'new_func', // 新功能
  'change_template', // 切换新旧模版
  'domain_name', // 观麦客户定制域名
  'multilingual', // 多语言
  'multi_currency' // 多币种
]

export const isCoopyc = () => {
  const { href } = window.location
  return _.includes(href, 'coopyc.com') || _.includes(href, 'gxyj.com')
}

export const isDisabledFunc = key => {
  return isCoopyc() && _.includes(funcList, key)
}
