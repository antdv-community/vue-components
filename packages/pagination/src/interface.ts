import type { Component, CSSProperties, PropType, VNode } from 'vue'

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
    align: {
      type: String as PropType<'start' | 'center' | 'end'>,
      default: 'start',
    },
    style: {
      type: Object as PropType<CSSProperties>,
      default: undefined,
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
    simple: {
      type: [Boolean, Object] as PropType<boolean | { readOnly?: boolean }>,
      default: undefined,
    },
  }
}
