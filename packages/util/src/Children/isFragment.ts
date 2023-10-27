import type { VNodeChild } from 'vue'
import { Fragment, isVNode } from 'vue'

export function isFragment(node: VNodeChild) {
  return isVNode(node) && node.type === Fragment
}
