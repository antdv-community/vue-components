import type { CSSProperties } from 'vue'
import { computed, defineComponent, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import raf from '@v-c/util/dist/raf'
import classNames from 'classnames'

export type ScrollBarDirectionType = 'ltr' | 'rtl'

export interface ScrollBarProps {
  prefixCls: string
  scrollOffset: number
  scrollRange: number
  rtl: boolean
  onScroll: (scrollOffset: number, horizontal?: boolean) => void
  onStartMove: () => void
  onStopMove: () => void
  horizontal?: boolean
  thumbStyle?: CSSProperties
  spinSize: number
  containerSize: number
}

export interface ScrollBarRef {
  delayHidden: () => void
}

function getPageXY(
  e: MouseEvent | TouchEvent,
  horizontal: boolean,
) {
  const obj = 'touches' in e ? e.touches[0] : e
  return obj[horizontal ? 'pageX' : 'pageY']
}

const ScrollBar = defineComponent<ScrollBarProps>({
  setup(props, { expose, attrs }) {
    const dragging = shallowRef(false)
    const pageXY = shallowRef<number | null>(null)
    const startTop = shallowRef<number | null>(null)

    const isLTR = computed(() => !props.rtl)

    // ========================= Refs =========================
    const scrollbarRef = shallowRef<HTMLDivElement>()
    const thumbRef = shallowRef<HTMLDivElement>()

    // ======================= Visible ========================
    const visible = shallowRef(false)
    const visibleTimeoutRef = shallowRef<ReturnType<typeof setTimeout>> ()

    const delayHidden = () => {
      if (visibleTimeoutRef.value)
        clearTimeout(visibleTimeoutRef.value)

      visible.value = true
      visibleTimeoutRef.value = setTimeout(() => {
        visible.value = false
      }, 3000)
    }

    // ======================== Range =========================

    const enableScrollRange = computed(() => props.scrollRange - props.containerSize || 0)
    const enableOffsetRange = computed(() => props.containerSize - props.spinSize || 0)
    // `scrollWidth` < `clientWidth` means no need to show scrollbar
    const canScroll = computed(() => enableScrollRange.value > 0)

    // ========================= Top ==========================
    const top = computed(() => {
      const { scrollOffset } = props
      if (scrollOffset === 0 || enableOffsetRange.value === 0)
        return 0

      const ptg = scrollOffset / enableScrollRange.value
      return ptg * enableOffsetRange.value
    })

    // ====================== Container =======================
    const onContainerMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    // ======================== Thumb =========================

    const stateRef = computed(() => ({
      top: top.value,
      dragging: dragging.value,
      pageY: pageXY.value,
      startTop: startTop.value,
    }))

    const onThumbMouseDown = (e: MouseEvent | TouchEvent) => {
      dragging.value = true
      pageXY.value = getPageXY(e, props.horizontal || false)
      startTop.value = stateRef.value.top

      props?.onStartMove?.()
      e.stopPropagation()
      e.preventDefault()
    }
    const onScrollbarTouchStart = (e: TouchEvent) => {
      e.preventDefault()
    }

    let moveRafId: number | null = null
    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.value)
        return

      const { dragging: stateDragging, pageY: statePageY, startTop: stateStartTop } = stateRef.value
      raf.cancel(moveRafId as any)
      if (stateDragging) {
        const offset = getPageXY(e, props.horizontal || false) - statePageY!
        let newTop = stateStartTop!

        if (!isLTR.value && props.horizontal)
          newTop -= offset

        else
          newTop += offset

        const tmpEnableScrollRange = enableScrollRange.value
        const tmpEnableOffsetRange = enableOffsetRange.value
        const ptg: number = tmpEnableOffsetRange ? newTop / tmpEnableOffsetRange : 0
        let newScrollTop = Math.ceil(ptg * tmpEnableScrollRange)
        newScrollTop = Math.max(newScrollTop, 0)
        newScrollTop = Math.min(newScrollTop, tmpEnableScrollRange)

        moveRafId = raf(() => {
          props.onScroll(newScrollTop, props.horizontal)
        })
      }
    }
    const onMouseUp = () => {
      dragging.value = false
      props?.onStopMove?.()
    }
    onMounted(() => {
      const scrollbarEle = scrollbarRef.value
      const thumbEle = thumbRef.value
      scrollbarEle?.addEventListener('touchstart', onScrollbarTouchStart, { passive: true })
      thumbEle?.addEventListener('touchstart', onThumbMouseDown, { passive: true })
      window.addEventListener('mousemove', onMouseMove, { passive: true })
      window.addEventListener('mouseup', onMouseUp, { passive: true })
      window.addEventListener('touchmove', onMouseMove, { passive: true })
      window.addEventListener('touchend', onMouseUp, { passive: true })
    })

    onBeforeUnmount(() => {
      const scrollbarEle = scrollbarRef.value
      const thumbEle = thumbRef.value
      scrollbarEle?.removeEventListener('touchstart', onScrollbarTouchStart)
      thumbEle?.removeEventListener('touchstart', onThumbMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onMouseMove)
      window.removeEventListener('touchend', onMouseUp)
      raf.cancel(moveRafId as any)
    })

    watch(() => props.scrollOffset, () => {
      delayHidden()
    })

    expose({
      delayHidden,
    })
    return () => {
      const { prefixCls, horizontal, spinSize, thumbStyle: propsThumbStyle } = props
      // ======================== Render ========================
      const scrollbarPrefixCls = `${prefixCls}-scrollbar`

      const containerStyle: CSSProperties = {
        position: 'absolute',
        visibility: visible.value && canScroll.value ? undefined : 'hidden',
      }

      const thumbStyle: CSSProperties = {
        position: 'absolute',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '99px',
        cursor: 'pointer',
        userSelect: 'none',
      }

      if (horizontal) {
        // Container
        containerStyle.height = '8px'
        containerStyle.left = '0'
        containerStyle.right = '0'
        containerStyle.bottom = '0'

        // Thumb
        thumbStyle.height = '100%'
        thumbStyle.width = `${spinSize}px`
        if (isLTR.value)
          thumbStyle.left = `${top.value}px`

        else
          thumbStyle.right = `${top.value}px`
      }
      else {
        // Container
        containerStyle.width = '8px'
        containerStyle.top = '0'
        containerStyle.bottom = '0'
        if (isLTR.value)
          containerStyle.right = '0'
        else
          containerStyle.left = '0'

        // Thumb
        thumbStyle.width = '100%'
        thumbStyle.height = `${spinSize}px`
        thumbStyle.top = `${top.value}px`
      }

      return (
        <div
          ref={scrollbarRef}
          class={classNames(scrollbarPrefixCls, {
            [`${scrollbarPrefixCls}-horizontal`]: horizontal,
            [`${scrollbarPrefixCls}-vertical`]: !horizontal,
            [`${scrollbarPrefixCls}-visible`]: visible,
          })}
          style={{ ...containerStyle, ...(attrs as any).style }}
          onMousedown={onContainerMouseDown}
          onMousemove={delayHidden}
        >
          <div
            ref={thumbRef}
            class={classNames(`${scrollbarPrefixCls}-thumb`, {
              [`${scrollbarPrefixCls}-thumb-moving`]: dragging.value,
            })}
            style={{ ...thumbStyle, ...propsThumbStyle }}
            onMousedown={onThumbMouseDown}
          />
        </div>
      )
    }
  },
})

export default ScrollBar
