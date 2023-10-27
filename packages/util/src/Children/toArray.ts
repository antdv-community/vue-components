import type { VNode } from 'vue'

export interface Option {
  keepEmpty?: boolean
}

export function toArray(children: VNode[], option: Option = {}) {
  // 从slots中获取的必定是数组
}
