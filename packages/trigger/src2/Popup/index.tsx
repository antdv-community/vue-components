import type { MouseEventHandler } from '@v-c/util/dist/EventInterface'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { Component } from 'vue'
import type { TriggerProps } from '../index.tsx'
import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface.ts'

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
