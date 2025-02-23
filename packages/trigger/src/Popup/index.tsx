import type { MouseEventHandler } from '@v-c/util/dist/EventInterface'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { Component, CSSProperties } from 'vue'
import type { TriggerProps } from '../index.tsx'
import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface.ts'
import ResizeObserver from '@v-c/resize-observer'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { computed, defineComponent, nextTick, shallowRef, Transition, watch } from 'vue'
import Arrow from './Arrow.tsx'
import Mask from './Mask.tsx'
import PopupContent from './PopupContent.tsx'

export interface PopupProps {
  prefixCls: string
  className?: string
  // style?: CSSProperties
  popup?: TriggerProps['popup']
  target: HTMLElement
  onMouseEnter?: MouseEventHandler
  onMouseLeave?: MouseEventHandler
  onPointerEnter?: MouseEventHandler
  onPointerDownCapture?: MouseEventHandler
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
  onClick?: MouseEventHandler

  // Motion
  motion?: CSSMotionProps
  maskMotion?: CSSMotionProps

  // Portal
  forceRender?: boolean
  getPopupContainer?: TriggerProps['getPopupContainer']
  autoDestroy?: boolean
  portal: Component

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

const Popup = defineComponent<PopupProps>((props, { attrs }) => {
  // We can not remove holder only when motion finished.
  const isNodeVisible = computed(() => props.open || props.keepDom)

  // ======================= Container ========================
  const getPopupContainerNeedParams = computed(() => (props.getPopupContainer?.length ?? 0) > 0)
  const show = shallowRef(!props.getPopupContainer || !getPopupContainerNeedParams.value)
  watch([() => props.getPopupContainer, getPopupContainerNeedParams], () => {
    show.value = !props.getPopupContainer || !getPopupContainerNeedParams.value
  })

  watch(
    [show, getPopupContainerNeedParams, () => props.target],
    async () => {
      await nextTick()
      if (!show.value && getPopupContainerNeedParams.value && props.target) {
        show.value = true
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  return () => {
    const {
      popup,
      prefixCls,
      target,

      onVisibleChanged,

      // Open
      open,
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
      onPointerDownCapture,

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
      const { points } = align!
      const dynamicInset
          = align!.dynamicInset || (align as any)._experimental?.dynamicInset
      const alignRight = dynamicInset && points?.[0]?.[1] === 'r'
      const alignBottom = dynamicInset && points?.[0]?.[0] === 'b'

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
    const childNode = typeof popup === 'function' ? popup() : popup

    const Portal1 = Portal as any

    return (
      <Portal1
        open={forceRender || isNodeVisible.value}
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
          <Transition
            {...getTransitionProps(motion?.name, motion)}
            onBeforeAppear={onPrepare}
            onBeforeEnter={onPrepare}
            onAfterEnter={() => {
              onVisibleChanged?.(true)
            }}
            onAfterLeave={() => {
              onVisibleChanged?.(false)
            }}
          >
            {open && (
              <div
                class={[prefixCls, attrs.class]}
                style={
                  {
                    '--arrow-x': `${arrowPos.x || 0}px`,
                    '--arrow-y': `${arrowPos.y || 0}px`,
                    ...offsetStyle,
                    ...miscStyle,
                    'boxSizing': 'border-box',
                    zIndex,
                    ...(attrs as any).style,
                  } as CSSProperties
                }
                onMouseenter={onMouseEnter}
                onMouseleave={onMouseLeave}
                onPointerenter={onPointerEnter}
                onClick={onClick}
                onPointerdown={onPointerDownCapture}
              >
                {arrow && (<Arrow prefixCls={prefixCls} arrow={arrow} arrowPos={arrowPos} align={align!} />)}
                <PopupContent cache={!open && !fresh}>
                  {childNode}
                </PopupContent>
              </div>
            )}
          </Transition>
        </ResizeObserver>
      </Portal1>
    )
  }
}, {
  name: 'Popup',
})

export default Popup
