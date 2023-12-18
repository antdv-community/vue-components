import type { CSSProperties, DefineComponent, VNode, VNodeChild } from 'vue'
import { computed, defineComponent, shallowRef } from 'vue'
import classNames from 'classnames'
import type { ScrollPos, ScrollTarget } from './hooks/useScrollTo'
import type { ExtraRenderInfo, Key, SharedConfig } from './interface.ts'
import type { ScrollBarDirectionType } from './ScrollBar.tsx'
import type { InnerProps } from './Filter.tsx'
import useDiffItem from './hooks/useDiffItem.ts'
import useHeights from './hooks/useHeights.tsx'

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

    const mergedData = computed(() => props.data || EMPTY_DATA)
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
    const getKey = <T = any>(item: T) => {
      if (typeof props.itemKey === 'function')
        return props.itemKey(item) as any
      return (item as any)?.[props.itemKey] as any
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

    // ================================ Legacy ================================
    // Put ref here since the range is generate by follow
    const rangeRef = shallowRef({
      start: 0,
      end: mergedData.value?.length,
    })
    const diffItemRef = shallowRef()

    const [diffItem] = useDiffItem<any>(mergeData, getKey)
    diffItemRef.value = diffItem.value

    // ================================ Height ================================
    const [setInstanceRef, collectHeight, heights, heightUpdatedMark] = useHeights<any>(getKey)

    // ========================== Visible Calculation =========================
    const visibleCalculations = computed(() => {
      if (!useVirtual.value) {
        return {
          scrollHeight: undefined,
          start: 0,
          end: mergedData.value.length - 1,
          offset: undefined,
        }
      }

      // Always use virtual scroll bar in avoid shaking
      if (!inVirtual.value) {
        return {
          scrollHeight: fillerInnerRef.value?.offsetHeight || 0,
          start: 0,
          end: mergedData.value.length - 1,
          offset: undefined,
        }
      }

      let itemTop = 0
      let startIndex: any
      let startOffset: any
      let endIndex: any
      const { itemHeight = 0, height = 0 } = props
      const dataLen = mergedData.value.length
      for (let i = 0; i < dataLen; i += 1) {
        const item = mergedData.value?.[i]
        const key = getKey(item)

        const cacheHeight = heights.get(key)
        const currentItemBottom = itemTop + (cacheHeight === undefined ? itemHeight : cacheHeight)

        // Check item top in the range
        if (currentItemBottom >= offsetTop.value && startIndex === undefined) {
          startIndex = i
          startOffset = itemTop
        }

        // Check item bottom in the range. We will render additional one item for motion usage
        if (currentItemBottom > offsetTop.value + height && endIndex === undefined)
          endIndex = i

        itemTop = currentItemBottom
      }

      // When scrollTop at the end but data cut to small count will reach this
      if (startIndex === undefined) {
        startIndex = 0
        startOffset = 0

        endIndex = Math.ceil(height / itemHeight)
      }
      if (endIndex === undefined)
        endIndex = mergedData.value.length - 1

      // Give cache to improve scroll experience
      endIndex = Math.min(endIndex + 1, mergedData.value.length - 1)

      return {
        scrollHeight: itemTop,
        start: startIndex,
        end: endIndex,
        offset: startOffset,
      }
    })
    // =============================== In Range ===============================
    const maxScrollHeight = computed(() => {
      // return
    })
    const maxScrollHeightRef = shallowRef(maxScrollHeight.value)
    maxScrollHeightRef.value = maxScrollHeight.value

    function keepInRange(newScrollTop: number) {
      let newTop = newScrollTop
      if (!Number.isNaN(maxScrollHeightRef.current))
        newTop = Math.min(newTop, maxScrollHeightRef.current)

      newTop = Math.max(newTop, 0)
      return newTop
    }

    return () => {
      const { prefixCls = 'rc-virtual-list', data } = props
      const mergedClassName = classNames(prefixCls, {
        [`${prefixCls}-rtl`]: isRTL.value,
      }, attrs.class as any)
      return <div>list</div>
    }
  },
})

export default List
