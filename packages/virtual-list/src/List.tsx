import type { CSSProperties, DefineComponent, VNode, VNodeChild } from 'vue'
import { computed, defineComponent, shallowRef } from 'vue'
import classNames from 'classnames'
import type { ScrollPos, ScrollTarget } from './hooks/useScrollTo'
import type { ExtraRenderInfo, GetKey, Key, SharedConfig } from './interface.ts'
import type { ScrollBarDirectionType } from './ScrollBar.tsx'
import type { InnerProps } from './Filter.tsx'

const EMPTY_DATA = [] as any[]

const ScrollStyle: CSSProperties = {
  overflowY: 'auto',
  overflowAnchor: 'none',
}

export interface ScrollInfo {
  x: number
  y: number
}

export type ScrollConfig = ScrollTarget | ScrollPos

export type ScrollTo = (arg: number | ScrollConfig) => void

export interface ListRef {
  scrollTo: ScrollTo
  getScrollInfo: () => ScrollInfo
}

export interface ListProps<T> {
  prefixCls?: string
  data: T[]
  height?: number
  itemHeight?: number
  /** If not match virtual scroll condition, Set List still use height of container. */
  fullHeight?: boolean
  itemKey: Key | ((item: T) => Key)
  component?: string | VNode | DefineComponent<any>
  /** Set `false` will always use real scroll instead of virtual one */
  virtual?: boolean
  direction?: ScrollBarDirectionType
  /**
   * By default `scrollWidth` is same as container.
   * When set this, it will show the horizontal scrollbar and
   * `scrollWidth` will be used as the real width instead of container width.
   * When set, `virtual` will always be enabled.
   */
  scrollWidth?: number

  styles?: {
    horizontalScrollBar?: CSSProperties
    horizontalScrollBarThumb?: CSSProperties
    verticalScrollBar?: CSSProperties
    verticalScrollBarThumb?: CSSProperties
  }

  onScroll?: (...args: any[]) => void

  /**
   * Given the virtual offset value.
   * It's the logic offset from start position.
   */
  onVirtualScroll?: (info: ScrollInfo) => void

  /** Trigger when render list item changed */
  onVisibleChange?: (visibleList: T[], fullList: T[]) => void

  /** Inject to inner container props. Only use when you need pass aria related data */
  innerProps?: InnerProps

  /** Render extra content into Filler */
  extraRender?: (info: ExtraRenderInfo) => VNodeChild
}

const List = defineComponent<ListProps<any>>({
  name: 'List',
  setup(props, { attrs }) {
    // ================================= MISC =================================
    const useVirtual = computed(() => !!(props.virtual !== false && props.height && props.itemHeight))
    const inVirtual = computed(() => useVirtual.value && !!props.data.length && (props.itemHeight! * props.data.length > props.height! || !!props.scrollWidth))
    const isRTL = computed(() => props.direction === 'rtl')

    const componentRef = shallowRef<HTMLDivElement>()
    const fillerInnerRef = shallowRef<HTMLDivElement>()
    // =============================== Item Key ===============================

    const offsetTop = shallowRef(0)
    const offsetLeft = shallowRef(0)
    const scrollMoving = shallowRef(false)
    const onScrollbarStartMove = () => {
      scrollMoving.value = true
    }

    const onScrollbarStopMove = () => {
      scrollMoving.value = false
    }
    // =============================== Item Key ===============================
    const getKey = <T = any>(item: T): GetKey<any> => {
      if (typeof props.itemKey === 'function')
        return props.itemKey(item) as any
      return (item as any)?.[props.itemKey]
    }

    const sharedConfig: SharedConfig<any> = {
      getKey,
    } as any

    function syncScrollTop(newTop: number | ((prev: number) => number)) {
      let value: number
      if (typeof newTop === 'function')
        value = newTop(offsetTop.value)

      else
        value = newTop

      // const alignedTop =
      // componentRef.value?.scrollTop = value
    }

    return () => {
      const { prefixCls = 'rc-virtual-list', data } = props
      const mergedClassName = classNames(prefixCls, {
        [`${prefixCls}-rtl`]: isRTL.value,
      }, attrs.class as any)
      const mergeData = data || EMPTY_DATA
      return <div>list</div>
    }
  },
})

export default List
