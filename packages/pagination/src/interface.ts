import type { Component, CSSProperties, PropType, VNode } from 'vue'

export interface PaginationLocale {
  // Options
  items_per_page?: string
  jump_to?: string
  jump_to_confirm?: string
  page?: string

  // Pagination
  prev_page?: string
  next_page?: string
  prev_5?: string
  next_5?: string
  prev_3?: string
  next_3?: string
  page_size?: string
}

export type ItemRender = (page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next', element: VNode) => VNode
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
    showTitle: {
      type: Boolean,
      default: true,
    },
    simple: {
      type: [Boolean, Object] as PropType<boolean | { readOnly?: boolean }>,
      default: undefined,
    },
    itemRender: {
      type: Function as PropType<ItemRender>,
      default: undefined,
    },
    prevIcon: {
      type: Object as PropType<VNode | Component>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<(page: number, pageSize: number) => void>,
      default: undefined,
    },
    locale: {
      type: Object as PropType<PaginationLocale>,
      default: undefined,
    },

  }
}
