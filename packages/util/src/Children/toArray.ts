import type { VNode } from 'vue'
import { isFragment } from './isFragment'

export interface Option {
  keepEmpty?: boolean
}

export function toArray(children: any, option: Option = {}) {
  // 从slots中获取的必定是数组
  let ret: VNode[] = []
  // 判断children是否是一个数组，如果不是就把它放到一个数组中
  if (!Array.isArray(children))
    children = [children]
  for (const child of children) {
    if ((child === undefined || child === null) && !option.keepEmpty)
      continue

    if (Array.isArray(child))
      ret = ret.concat(toArray(child, option))

    else if (isFragment(child) && child.children)
      ret = ret.concat(toArray(child.children, option))
    else
      ret.push(child)
  }
  return ret
}
