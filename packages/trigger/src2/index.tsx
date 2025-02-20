import type { MouseEventHandler } from '@v-c/util/dist/EventInterface'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties, VNodeChild } from 'vue'
import type { ActionType, AlignType, ArrowTypeOuter, BuildInPlacements } from './interface.ts'

export interface TriggerProps {
  action?: ActionType | ActionType[]
  showAction?: ActionType[]
  hideAction?: ActionType[]

  prefixCls?: string

  zIndex?: number

  onPopupAlign?: (element: HTMLElement, align: AlignType) => void

  stretch?: string

  // ==================== Open =====================
  popupVisible?: boolean
  defaultPopupVisible?: boolean
  onPopupVisibleChange?: (visible: boolean) => void
  afterPopupVisibleChange?: (visible: boolean) => void

  // =================== Portal ====================
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  forceRender?: boolean
  autoDestroy?: boolean

  // ==================== Mask =====================
  mask?: boolean
  maskClosable?: boolean

  // =================== Motion ====================
  /** Set popup motion. You can ref `rc-motion` for more info. */
  popupMotion?: CSSMotionProps
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps

  // ==================== Delay ====================
  mouseEnterDelay?: number
  mouseLeaveDelay?: number

  focusDelay?: number
  blurDelay?: number

  // ==================== Popup ====================
  popup: VNodeChild | (() => VNodeChild)
  popupPlacement?: string
  builtinPlacements?: BuildInPlacements
  popupAlign?: AlignType
  popupClassName?: string
  popupStyle?: CSSProperties
  getPopupClassNameFromAlign?: (align: AlignType) => string
  onPopupClick?: MouseEventHandler

  alignPoint?: boolean // Maybe we can support user pass position in the future

  /**
   * Trigger will memo content when close.
   * This may affect the case if want to keep content update.
   * Set `fresh` to `false` will always keep update.
   */
  fresh?: boolean

  // ==================== Arrow ====================
  arrow?: boolean | ArrowTypeOuter

  // =================== Private ===================
  /**
   * @private Get trigger DOM node.
   * Used for some component is function component which can not access by `findDOMNode`
   */
  getTriggerDOMNode?: (node: VNodeChild) => HTMLElement

  // // ========================== Mobile ==========================
  // /** @private Bump fixed position at bottom in mobile.
  //  * This is internal usage currently, do not use in your prod */
  // mobile?: MobileConfig;
}
