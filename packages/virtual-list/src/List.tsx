import type { CSSProperties, DefineComponent, HTMLAttributes, VNode, VNodeChild } from 'vue'
import {
  computed,
  createVNode,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  toRef,
  watch,
  watchPostEffect,
} from 'vue'
import classNames from 'classnames'
import type { ResizeObserverProps } from '@vue-components/resize-observer'
import ResizeObserver from '@vue-components/resize-observer'
import type { ScrollPos, ScrollTarget } from './hooks/useScrollTo'
import type { ExtraRenderInfo, Key, SharedConfig } from './interface.ts'
import type { ScrollBarDirectionType, ScrollBarRef } from './ScrollBar.tsx'
import type { InnerProps } from './Filter.tsx'
import useDiffItem from './hooks/useDiffItem.ts'
import useHeights from './hooks/useHeights.tsx'
import useOriginScroll from './hooks/useOriginScroll.ts'
import useFrameWheel from './hooks/useFrameWheel.ts'
import useMobileTouchMove from './hooks/useMobileTouchMove.ts'
import { getSpinSize } from './utils/scrollbarUtil.ts'
import useScrollTo from './hooks/useScrollTo'
import { useGetSize } from './hooks/useGetSize.ts'
import useChildren from './hooks/useChildren.tsx'
import Filter from './Filter.tsx'
import ScrollBar from './ScrollBar.tsx'

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

export type ScrollTo = (arg: number | ScrollConfig | null) => void

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
  setup(props, { attrs, expose, slots }) {
    // ================================= MISC =================================
    const useVirtual = computed(() => !!(props.virtual !== false && props.height && props.itemHeight))
    const inVirtual = computed(() => useVirtual.value && props.data && (props.itemHeight! * props.data.length > props.height! || !!props.scrollWidth))
    const isRTL = computed(() => props.direction === 'rtl')

    const mergedData = computed(() => props.data || EMPTY_DATA)
    const componentRef = shallowRef<HTMLDivElement>()
    const fillerInnerRef = shallowRef<HTMLDivElement>()
    const itemHeight = toRef(props, 'itemHeight')
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
      const alignedTop = keepInRange(value)
      if (componentRef.value)
        componentRef.value.scrollTop = alignedTop
      offsetTop.value = alignedTop
    }

    // ================================ Legacy ================================
    // Put ref here since the range is generate by follow
    const rangeRef = shallowRef({
      start: 0,
      end: mergedData.value?.length,
    })
    const diffItemRef = shallowRef()

    const [diffItem] = useDiffItem<any>(mergedData, getKey)
    diffItemRef.value = diffItem.value

    // ================================ Height ================================
    const [setInstanceRef, collectHeight, heights, heightUpdatedMark] = useHeights<any>(getKey)

    // ========================== Visible Calculation =========================
    const visibleCalculations = computed(() => {
      if (heightUpdatedMark.value) {
        // TODO
      }
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
      const { itemHeight, height } = props
      const dataLen = mergedData.value.length
      for (let i = 0; i < dataLen; i += 1) {
        const item = mergedData.value?.[i]
        const key = getKey(item)

        const cacheHeight = heights.get(key)
        const currentItemBottom = itemTop + (cacheHeight === undefined ? itemHeight! : cacheHeight)

        // Check item top in the range
        if (currentItemBottom >= offsetTop.value && startIndex === undefined) {
          startIndex = i
          startOffset = itemTop
        }

        // Check item bottom in the range. We will render additional one item for motion usage
        if (currentItemBottom > offsetTop.value + height! && endIndex === undefined)
          endIndex = i

        itemTop = currentItemBottom
      }

      // When scrollTop at the end but data cut to small count will reach this
      if (startIndex === undefined) {
        startIndex = 0
        startOffset = 0

        endIndex = Math.ceil(height! / itemHeight!)
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

    // ================================= Size =================================
    const size = shallowRef({ width: 0, height: props.height || 0 })
    const onHolderResize: ResizeObserverProps['onResize'] = (sizeInfo) => {
      size.value = {
        width: sizeInfo.width || sizeInfo.offsetWidth,
        height: sizeInfo.height || sizeInfo.offsetHeight,
      }
    }
    // Hack on scrollbar to enable flash call
    const verticalScrollBarRef = shallowRef<ScrollBarRef>()
    const horizontalScrollBarRef = shallowRef<ScrollBarRef>()
    const horizontalScrollBarSpinSize = computed(() => getSpinSize(size.value.width, props.scrollWidth))
    const verticalScrollBarSpinSize = computed(() => getSpinSize(size.value.height, visibleCalculations.value.scrollHeight))
    // =============================== In Range ===============================
    const maxScrollHeight = computed(() => {
      return (visibleCalculations.value.scrollHeight ?? 0) - (props?.height ?? 0)
    })
    const maxScrollHeightRef = computed(() => (maxScrollHeight.value))

    function keepInRange(newScrollTop: number) {
      let newTop = newScrollTop
      if (!Number.isNaN(maxScrollHeightRef.value))
        newTop = Math.min(newTop, maxScrollHeightRef.value)

      newTop = Math.max(newTop, 0)
      return newTop
    }
    const isScrollAtTop = computed(() => offsetTop.value <= 0)
    const isScrollAtBottom = computed(() => offsetTop.value >= maxScrollHeightRef.value)

    const originScroll = useOriginScroll(isScrollAtTop, isScrollAtBottom)
    // ================================ Scroll ================================
    const getVirtualScrollInfo = () => ({
      x: isRTL.value ? -offsetLeft.value : offsetLeft.value,
      y: offsetTop.value,
    })

    const lastVirtualScrollInfoRef = shallowRef(getVirtualScrollInfo())

    const triggerScroll = () => {
      if (props.onVirtualScroll) {
        const nextInfo = getVirtualScrollInfo()
        // Trigger when offset changed
        if (
          lastVirtualScrollInfoRef.value.x !== nextInfo.x
            || lastVirtualScrollInfoRef.value.y !== nextInfo.y
        ) {
          props.onVirtualScroll(nextInfo)

          lastVirtualScrollInfoRef.value = nextInfo
        }
      }
    }

    function onScrollBar(newScrollOffset: number, horizontal?: boolean) {
      const newOffset = newScrollOffset

      if (horizontal) {
        offsetLeft.value = newOffset
        triggerScroll()
      }
      else {
        syncScrollTop(newOffset)
      }
    }

    // When data size reduce. It may trigger native scroll event back to fit scroll position

    function onFallbackScroll(e: any) {
      const { scrollTop: newScrollTop } = e.target as HTMLDivElement
      if (newScrollTop !== offsetTop.value)
        syncScrollTop(newScrollTop)

      // Trigger origin onScroll
      props?.onScroll?.(e)
      triggerScroll()
    }

    const keepInHorizontalRange = (nextOffsetLeft: number) => {
      let tmpOffsetLeft = nextOffsetLeft
      const { scrollWidth = 0 } = props
      const max = scrollWidth - size.value.width
      tmpOffsetLeft = Math.max(tmpOffsetLeft, 0)
      tmpOffsetLeft = Math.min(tmpOffsetLeft, max)

      return tmpOffsetLeft
    }

    const onWheelDelta: Parameters<typeof useFrameWheel>[4] = (offsetXY, fromHorizontal) => {
      if (fromHorizontal) {
        // Horizontal scroll no need sync virtual position
        const nextOffsetLeft = offsetLeft.value + (isRTL.value ? -offsetXY : offsetXY)
        offsetLeft.value = keepInHorizontalRange(nextOffsetLeft)

        triggerScroll()
      }
      else {
        syncScrollTop((top) => {
          return top + offsetXY
        })
      }
    }
    // Since this added in global,should use ref to keep update
    const [onRawWheel, onFireFoxScroll] = useFrameWheel(
      useVirtual,
      isScrollAtTop,
      isScrollAtBottom,
      computed(() => !!props.scrollWidth),
      onWheelDelta,
    )

    useMobileTouchMove(useVirtual, componentRef, (deltaY, smoothOffset) => {
      if (originScroll(deltaY, smoothOffset))
        return false

      onRawWheel({ preventDefault() {}, deltaY } as WheelEvent)
      return true
    })
    function onMozMousePixelScroll(e: Event) {
      if (useVirtual.value)
        e.preventDefault()
    }
    onMounted(() => {
      // Firefox only
      const componentEle = componentRef.value
      if (componentEle) {
        componentEle.addEventListener('wheel', onRawWheel)
        componentEle.addEventListener('DOMMouseScroll', onFireFoxScroll as any)
        componentEle.addEventListener('MozMousePixelScroll', onMozMousePixelScroll)
      }
    })

    onBeforeUnmount(() => {
      const componentEle = componentRef.value
      if (!componentEle)
        return
      componentEle.removeEventListener('wheel', onRawWheel)
      componentEle.removeEventListener('DOMMouseScroll', onFireFoxScroll as any)
      componentEle.removeEventListener('MozMousePixelScroll', onMozMousePixelScroll as any)
    })

    watchPostEffect(() => {
      if (props.scrollWidth)
        offsetLeft.value = keepInHorizontalRange(offsetLeft.value)
    })

    // ================================= Ref ==================================
    const delayHideScrollBar = () => {
      verticalScrollBarRef.value?.delayHidden()
      horizontalScrollBarRef.value?.delayHidden()
    }

    const scrollTo = useScrollTo<any>(
      componentRef,
      mergedData,
      heights,
      computed(() => props.itemHeight!),
      getKey,
      () => collectHeight(true),
      syncScrollTop,
      delayHideScrollBar,
    )

    expose({
      getScrollInfo: getVirtualScrollInfo,
      scrollTo: (config) => {
        function isPosScroll(arg: any): arg is ScrollPos {
          return arg && typeof arg === 'object' && ('left' in arg || 'top' in arg)
        }
        if (isPosScroll(config)) {
          // Scroll X
          if (config.left !== undefined)
            offsetLeft.value = keepInHorizontalRange(config.left)

          // Scroll Y
          scrollTo(config.top)
        }
        else {
          scrollTo(config)
        }
      },
    } as ListRef)

    watch([() => visibleCalculations.value.start, () => visibleCalculations.value.end, mergedData], ([start, end]) => {
      if (props.onVisibleChange) {
        const renderList = mergedData.value.slice(start, end + 1)
        props.onVisibleChange(renderList, mergedData.value)
      }
    }, {
      flush: 'post',
    })
    // ================================ Extra =================================
    const getSize = useGetSize(mergedData, getKey, heights, itemHeight)

    return () => {
      const { prefixCls = 'vc-virtual-list', styles, scrollWidth, innerProps, component = 'div', height, fullHeight = true } = props
      const mergedClassName = classNames(prefixCls, {
        [`${prefixCls}-rtl`]: isRTL.value,
      }, attrs.class as any)

      const extraRender = slots?.extraRender ?? props?.extraRender
      const {
        scrollHeight,
        start,
        end,
        offset: fillerOffset,
      } = visibleCalculations.value
      rangeRef.value.start = start
      rangeRef.value.end = end
      const extraContent = extraRender?.({
        start,
        end,
        virtual: inVirtual.value,
        offsetX: offsetLeft.value,
        offsetY: fillerOffset,
        rtl: isRTL.value,
        getSize,
      })
      // ================================ Render ================================
      const listChildren = useChildren(mergedData.value, start, end, scrollWidth!, setInstanceRef, slots.default as any, sharedConfig)
      let componentStyle: CSSProperties | null = null
      if (height) {
        componentStyle = { [fullHeight ? 'height' : 'maxHeight']: `${height}px`, ...ScrollStyle }

        if (useVirtual.value) {
          componentStyle.overflowY = 'hidden'

          if (scrollWidth)
            componentStyle.overflowX = 'hidden'

          if (scrollMoving.value)
            componentStyle.pointerEvents = 'none'
        }
      }

      const containerProps: HTMLAttributes = {}
      if (isRTL.value)
        containerProps.dir = 'rtl'

      const divStyle: any[] = [
        attrs.style,
        {
          position: 'relative',
        },
      ]
      const Comp = createVNode(component, {
        class: `${prefixCls}-holder`,
        style: componentStyle,
        ref: componentRef,
        onScroll: onFallbackScroll,
        onMouseEnter: delayHideScrollBar,
      }, {
        default: () => [
          <Filter
            prefixCls={prefixCls}
            height={scrollHeight!}
            offsetX={offsetLeft.value}
            offsetY={fillerOffset}
            scrollWidth={scrollWidth}
            onInnerResize={collectHeight}
            ref={fillerInnerRef}
            innerProps={innerProps}
            rtl={isRTL.value}
            extra={extraContent}
          >
            {listChildren}
          </Filter>,
        ],
      })
      return (
        <div {...attrs} style={divStyle} class={mergedClassName} {...containerProps}>
          <ResizeObserver onResize={onHolderResize}>
            {Comp}
          </ResizeObserver>
          {
            inVirtual.value && scrollHeight! > height! && (
              <ScrollBar
                ref={verticalScrollBarRef}
                prefixCls={prefixCls}
                scrollOffset={offsetTop.value}
                scrollRange={scrollHeight!}
                rtl={isRTL.value}
                onScroll={onScrollBar}
                onStartMove={onScrollbarStartMove}
                onStopMove={onScrollbarStopMove}
                spinSize={verticalScrollBarSpinSize.value}
                containerSize={size.value.height}
                style={styles?.verticalScrollBar}
                thumbStyle={styles?.verticalScrollBarThumb}
              />
            )
          }
          {
              inVirtual.value && scrollWidth && (
                <ScrollBar
                  ref={horizontalScrollBarRef}
                  prefixCls={prefixCls}
                  scrollOffset={offsetLeft.value}
                  scrollRange={scrollWidth!}
                  rtl={isRTL.value}
                  onScroll={onScrollBar}
                  onStartMove={onScrollbarStartMove}
                  onStopMove={onScrollbarStopMove}
                  spinSize={horizontalScrollBarSpinSize.value}
                  containerSize={size.value.width}
                  style={styles?.horizontalScrollBar}
                  thumbStyle={styles?.horizontalScrollBarThumb}
                />
              )
          }
        </div>
      )
    }
  },
})

export default List
