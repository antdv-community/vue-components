import type { VNode, VNodeChild } from 'vue'
import { Fragment, isVNode } from 'vue'

export function isFragment(node: VNodeChild): node is VNode {
  return isVNode(node) && node.type === Fragment
}
