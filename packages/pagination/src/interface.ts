import type { Component, PropType, VNode } from 'vue'

export function paginationProps() {
  return {
    disabled: {
      type: Boolean,
      default: undefined,
    },
    prefixCls: {
      type: String,
      default: 'vc-pagination',
    },
    selectPrefixCls: {
      type: String,
      default: 'vc-select',
    },
    current: Number,
    pageSize: Number,
    defaultCurrent: {
      type: Number,
      default: 1,
    },
    defaultPageSize: {
      type: Number,
      default: 10,
    },
    total: {
      type: Number,
      default: 0,
    },
    hideOnSinglePage: {
      type: Boolean,
      default: false,
    },
    showSizeChanger: {
      type: Boolean,
      default: undefined,
    },
    showLessItems: {
      type: Boolean,
      default: false,
    },
    selectComponentClass: Object as PropType<Component>,
    showTotal: Function as PropType<(total: number, range: [number, number]) => VNode>,
  }
}
