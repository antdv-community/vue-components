import type { CSSProperties } from 'vue'
import type { TriggerProps } from '../'
import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface'
import classNames from 'classnames'
import { defineComponent, ref, Transition } from 'vue'

// import CSSMotion from 'rc-motion'
import ResizeObserver from '@v-c/resize-observer'
import { useLayoutEffect } from '@v-c/util/dist/hooks/useLayoutEffect'
// import { composeRef } from '@v-c/util/dist/ref'
import { Arrow } from './Arrow'
import Mask from './Mask'
import PopupContent from './PopupContent'

export interface PopupProps {
  prefixCls: string
  className?: string
  style?: CSSProperties
  popup?: TriggerProps['popup']
  target: HTMLElement
  onMouseEnter?: MouseEvent
  onMouseLeave?: MouseEvent
  onPointerEnter?: MouseEvent
  zIndex?: number

  mask?: boolean
  onVisibleChanged: (visible: boolean) => void

  // Arrow
  align?: AlignType
  arrow?: ArrowTypeOuter
  arrowPos: ArrowPos

  // Open
  open: boolean
  /** Tell Portal that should keep in screen. e.g. should wait all motion end */
  keepDom: boolean
  fresh?: boolean

  // Click
  onClick?: MouseEvent

  // Motion
  motion?: unknown
  maskMotion?: unknown

  // Portal
  forceRender?: boolean
  getPopupContainer?: TriggerProps['getPopupContainer']
  autoDestroy?: boolean
  portal: any

  // Align
  ready: boolean
  offsetX: number
  offsetY: number
  offsetR: number
  offsetB: number
  onAlign: VoidFunction
  onPrepare: () => Promise<void>

  // stretch
  stretch?: string
  targetWidth?: number
  targetHeight?: number
}

const popupProps = {
  prefixCls: String,
  className: String,
  popup: Object,
  target: Object,
  onMouseEnter: Function,
  onMouseLeave: Function,
  onPointerEnter: Function,
  zIndex: Number,

  mask: Boolean,
  onVisibleChanged: Function,

  // Arrow
  align: Object,
  arrow: Object,
  arrowPos: Object,

  // Open
  open: Boolean,
  /** Tell Portal that should keep in screen. e.g. should wait all motion end */
  keepDom: Boolean,
  fresh: Boolean,

  // Click
  onClick: Function,

  // Motion
  motion: Object,
  maskMotion: Object,

  // Portal
  forceRender: Boolean,
  getPopupContainer: Array,
  autoDestroy: Boolean,
  portal: Object,

  // Align
  ready: Boolean,
  offsetX: Number,
  offsetY: Number,
  offsetR: Number,
  offsetB: Number,
  onAlign: Function,
  onPrepare: Function,

  // stretch
  stretch: String,
  targetWidth: Number,
  targetHeight: Number,
}

export const Popup = defineComponent({
  name: 'Popup',
  props: { ...popupProps },
  setup(props, { attrs, slots }) {
    const {
      popup,
      prefixCls,
      target,
      onVisibleChanged,
      // Open
      open,
      keepDom,
      fresh,
      // Click
      onClick,
      // Mask
      mask,
      // Arrow
      arrow,
      arrowPos,
      align,
      // Motion
      motion,
      maskMotion,
      // Portal
      forceRender,
      getPopupContainer,
      autoDestroy,
      portal: Portal,
      zIndex,
      onMouseEnter,
      onMouseLeave,
      onPointerEnter,
      ready,
      offsetX,
      offsetY,
      offsetR,
      offsetB,
      onAlign,
      onPrepare,
      stretch,
      targetWidth,
      targetHeight,
    } = props

    const childNode = slots.popup?.()

    // We can not remove holder only when motion finished.
    const isNodeVisible = open || keepDom

    // ======================= Container ========================
    const getPopupContainerNeedParams = getPopupContainer?.length > 0

    const show = ref(
      !getPopupContainer || !getPopupContainerNeedParams,
    )

    // Delay to show since `getPopupContainer` need target element
    useLayoutEffect(() => {
      if (!show.value && getPopupContainerNeedParams && target) {
        show.value = true
      }
    }, [show.value, getPopupContainerNeedParams, target])

    // ========================= Render =========================
    if (!show.value) {
      return null
    }

    // >>>>> Offset
    const AUTO = 'auto' as const

    const offsetStyle: CSSProperties = {
      left: '-1000vw',
      top: '-1000vh',
      right: AUTO,
      bottom: AUTO,
    }

    // Set align style
    if (ready || !open) {
      const { points } = align
      const dynamicInset
                = align.dynamicInset || (align as any)._experimental?.dynamicInset
      const alignRight = dynamicInset && points[0][1] === 'r'
      const alignBottom = dynamicInset && points[0][0] === 'b'

      if (alignRight) {
        offsetStyle.right = offsetR
        offsetStyle.left = AUTO
      }
      else {
        offsetStyle.left = offsetX
        offsetStyle.right = AUTO
      }

      if (alignBottom) {
        offsetStyle.bottom = offsetB
        offsetStyle.top = AUTO
      }
      else {
        offsetStyle.top = offsetY
        offsetStyle.bottom = AUTO
      }
    }

    // >>>>> Misc
    const miscStyle: CSSProperties = {}
    if (stretch) {
      if (stretch.includes('height') && targetHeight) {
        miscStyle.height = targetHeight
      }
      else if (stretch.includes('minHeight') && targetHeight) {
        miscStyle.minHeight = targetHeight
      }
      if (stretch.includes('width') && targetWidth) {
        miscStyle.width = targetWidth
      }
      else if (stretch.includes('minWidth') && targetWidth) {
        miscStyle.minWidth = targetWidth
      }
    }

    if (!open) {
      miscStyle.pointerEvents = 'none'
    }

    return () => {
      const cls = classNames(prefixCls)
      return (
        <Portal
          open={forceRender || isNodeVisible}
          getContainer={getPopupContainer && (() => getPopupContainer(target))}
          autoDestroy={autoDestroy}
        >
          <Mask
            prefixCls={prefixCls}
            open={open}
            zIndex={zIndex}
            mask={mask}
            motion={maskMotion}
          />
          <ResizeObserver onResize={onAlign} disabled={!open}>
            <Transition>
              <div
                class={cls}
                style={
                  {
                    '--arrow-x': `${arrowPos.x || 0}px`,
                    '--arrow-y': `${arrowPos.y || 0}px`,
                    ...offsetStyle,
                    ...miscStyle,
                    ...motionStyle,
                    'boxSizing': 'border-box',
                    zIndex,
                    ...attrs.style,
                  } as CSSProperties
                }
                onMouseenter={onMouseEnter}
                onMouseleave={onMouseLeave}
                onPointerenter={onPointerEnter}
                onClick={onClick}
              >
                {arrow && (
                  <Arrow
                    prefixCls={prefixCls}
                    arrow={arrow}
                    arrowPos={arrowPos}
                    align={align}
                  />
                )}
                <PopupContent>
                  {childNode}
                </PopupContent>
              </div>
            </Transition>
          </ResizeObserver>
        </Portal>
      )
    }
  },
})
