import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type {
  ActionType,
  AlignType,
  AnimationType,
  ArrowPos,
  ArrowTypeOuter,
  BuildInPlacements,
  TransitionNameType,
} from './interface'

import ResizeObserver from '@v-c/resize-observer'
import { isDOM } from '@v-c/util/dist/Dom/findDOMNode'
import { getShadowRoot } from '@v-c/util/dist/Dom/shadow'
import useEvent from '@v-c/util/dist/hooks/useEvent'
import useId from '@v-c/util/dist/hooks/useId'
import { useLayoutEffect } from '@v-c/util/dist/hooks/useLayoutEffect'
import isMobile from '@v-c/util/dist/isMobile'
import { cloneElement } from '@v-c/util/dist/vnode'
import classNames from 'classnames'

import { computed, defineComponent, ref, watchEffect } from 'vue'
import { useProviderTriggerContext } from './context'
import useAction from './hooks/useAction'
import useAlign from './hooks/useAlign'
import useWatch from './hooks/useWatch'
import useWinClick from './hooks/useWinClick'
import { Popup } from './Popup'
import { getAlignPopupClassName, getMotion } from './util'

export type {
  ActionType,
  AlignType,
  ArrowTypeOuter as ArrowType,
  BuildInPlacements,
}

export interface TriggerRef {
  nativeElement: HTMLElement
  popupElement: HTMLDivElement
  forceAlign: VoidFunction
}

// Removed Props List
// Seems this can be auto
// getDocument?: (element?: HTMLElement) => Document;

// New version will not wrap popup with `rc-trigger-popup-content` when multiple children

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

  /** @deprecated Please use `autoDestroy` instead */
  destroyPopupOnHide?: boolean

  // ==================== Mask =====================
  mask?: boolean
  maskClosable?: boolean

  // =================== Motion ====================
  /** Set popup motion. You can ref `rc-motion` for more info. */
  popupMotion?: CSSMotionProps
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps

  /** @deprecated Please us `popupMotion` instead. */
  popupTransitionName?: TransitionNameType
  /** @deprecated Please us `popupMotion` instead. */
  popupAnimation?: AnimationType
  /** @deprecated Please us `maskMotion` instead. */
  maskTransitionName?: TransitionNameType
  /** @deprecated Please us `maskMotion` instead. */
  maskAnimation?: AnimationType

  // ==================== Delay ====================
  mouseEnterDelay?: number
  mouseLeaveDelay?: number

  focusDelay?: number
  blurDelay?: number

  // ==================== Popup ====================
  popup: VueNode
  popupPlacement?: string
  builtinPlacements?: BuildInPlacements
  popupAlign?: AlignType
  popupClassName?: string
  popupStyle?: CSSProperties
  getPopupClassNameFromAlign?: (align: AlignType) => string
  onPopupClick?: MouseEvent

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
  getTriggerDOMNode?: (node: VueNode) => HTMLElement

  // // ========================== Mobile ==========================
  // /** @private Bump fixed position at bottom in mobile.
  //  * This is internal usage currently, do not use in your prod */
  // mobile?: MobileConfig;
}

function triggerProps() {
  return {
    action: [String, Array<string>],
    showAction: Array<string>,
    hideAction: Array<string>,

    prefixCls: String,

    zIndex: Number,

    onPopupAlign: Function,

    stretch: String,

    // ==================== Open =====================
    popupVisible: Boolean,
    defaultPopupVisible: Boolean,
    onPopupVisibleChange: Function,
    afterPopupVisibleChange: Function,

    // =================== Portal ====================
    getPopupContainer: Function,
    forceRender: Boolean,
    autoDestroy: Boolean,

    /** @deprecated Please use `autoDestroy` instead */
    destroyPopupOnHide: Boolean,

    // ==================== Mask =====================
    mask: Boolean,
    maskClosable: Boolean,

    // =================== Motion ====================
    /** Set popup motion. You can ref `rc-motion` for more info. */
    popupMotion: Object,
    /** Set mask motion. You can ref `rc-motion` for more info. */
    maskMotion: Object,

    /** @deprecated Please us `popupMotion` instead. */
    popupTransitionName: Object,
    /** @deprecated Please us `popupMotion` instead. */
    popupAnimation: Object,
    /** @deprecated Please us `maskMotion` instead. */
    maskTransitionName: Object,
    /** @deprecated Please us `maskMotion` instead. */
    maskAnimation: Object,

    // ==================== Delay ====================
    mouseEnterDelay: Number,
    mouseLeaveDelay: Number,

    focusDelay: Number,
    blurDelay: Number,

    // ==================== Popup ====================
    popup: Object,
    popupPlacement: String,
    builtinPlacements: Object,
    popupAlign: Object,
    popupClassName: String,
    popupStyle: [Object, String],
    getPopupClassNameFromAlign: Function,
    onPopupClick: Function,

    alignPoint: Boolean, // Maybe we can support user pass position in the future

    /**
     * Trigger will memo content when close.
     * This may affect the case if want to keep content update.
     * Set `fresh` to `false` will always keep update.
     */
    fresh: Boolean,

    // ==================== Arrow ====================
    arrow: [Boolean, Object],

    // =================== Private ===================
    /**
     * @private Get trigger DOM node.
     * Used for some component is function component which can not access by `findDOMNode`
     */
    getTriggerDOMNode: Function,
  }
}

export const Trigger = defineComponent({
  name: 'Trigger',
  props: {
    ...triggerProps(),
  },
  setup(props, { attrs, slots }) {
    const {
      prefixCls = 'vc-trigger-popup',

      // Action
      action = 'hover',
      showAction,
      hideAction,

      // Open
      popupVisible,
      defaultPopupVisible,
      onPopupVisibleChange,
      afterPopupVisibleChange,

      // Delay
      mouseEnterDelay,
      mouseLeaveDelay = 0.1,

      focusDelay,
      blurDelay,

      // Mask
      mask,
      maskClosable = true,

      // Portal
      getPopupContainer,
      forceRender,
      autoDestroy,
      destroyPopupOnHide,

      // Popup
      popup,
      popupClassName,
      popupStyle,

      popupPlacement,
      builtinPlacements = {},
      popupAlign,
      zIndex,
      stretch,
      getPopupClassNameFromAlign,
      fresh,

      alignPoint,

      onPopupClick,
      onPopupAlign,

      // Arrow
      arrow,

      // Motion
      popupMotion,
      maskMotion,
      popupTransitionName,
      popupAnimation,
      maskTransitionName,
      maskAnimation,

      // Deprecated
      className,

      // Private
      getTriggerDOMNode,

      ...restProps
    } = props

    const mergedAutoDestroy = autoDestroy || destroyPopupOnHide || false

    // =========================== Mobile ===========================
    const mobile = ref(false)
    useLayoutEffect(() => {
      mobile.value = isMobile()
    }, [])

    // ========================== Context ===========================
    const subPopupElements = ref<Record<string, HTMLElement>>({})

    const parentContext = useProviderTriggerContext()

    // =========================== Popup ============================
    const id = useId()
    const popupEle = ref<HTMLDivElement>(null)

    // Used for forwardRef popup. Not use internal
    const externalPopupRef = ref<HTMLDivElement>(null)

    const setPopupRef = useEvent((node: HTMLDivElement) => {
      externalPopupRef.value = node

      if (isDOM(node) && popupEle.value !== node) {
        popupEle.value = node
      }

      parentContext?.registerSubPopup(id, node)
    })

    // =========================== Target ===========================
    // Use state to control here since `useRef` update not trigger render
    const targetEle = ref<HTMLElement>(null)

    // Used for forwardRef target. Not use internal
    const externalForwardRef = ref<HTMLElement>(null)

    const setTargetRef = useEvent((node: HTMLElement) => {
      if (isDOM(node) && targetEle.value !== node) {
        targetEle.value = node
        externalForwardRef.value = node
      }
    })

    // ========================== Children ==========================
    const child = slots.default?.()
    const originChildProps = child?.props || {}
    const cloneProps: typeof originChildProps = {}

    const inPopupOrChild = useEvent((ele: EventTarget) => {
      const childDOM = targetEle.value

      return (
        childDOM?.contains(ele as HTMLElement)
        || getShadowRoot(childDOM)?.host === ele
        || ele === childDOM
        || popupEle.value?.contains(ele as HTMLElement)
        || getShadowRoot(popupEle.value)?.host === ele
        || ele === popupEle.value
        || Object.values(subPopupElements.value).some(
          subPopupEle =>
            subPopupEle?.contains(ele as HTMLElement) || ele === subPopupEle,
        )
      )
    })

    // =========================== Motion ===========================
    const mergePopupMotion = getMotion(
      prefixCls,
      popupMotion,
      popupAnimation,
      popupTransitionName,
    )

    const mergeMaskMotion = getMotion(
      prefixCls,
      maskMotion,
      maskAnimation,
      maskTransitionName,
    )

    // ============================ Open ============================
    const internalOpen = ref(
      defaultPopupVisible || false,
    )

    // Render still use props as first priority
    const mergedOpen = popupVisible ?? internalOpen.value

    // We use effect sync here in case `popupVisible` back to `undefined`
    const setMergedOpen = useEvent((nextOpen: boolean) => {
      if (popupVisible === undefined) {
        internalOpen.value = nextOpen
      }
    })

    useLayoutEffect(() => {
      internalOpen.value = popupVisible || false
    }, [popupVisible])

    const openRef = ref(mergedOpen)
    openRef.value = mergedOpen

    const lastTriggerRef = ref<boolean[]>([])
    lastTriggerRef.value = []

    const internalTriggerOpen = useEvent((nextOpen: boolean) => {
      setMergedOpen(nextOpen)

      // Enter or Pointer will both trigger open state change
      // We only need take one to avoid duplicated change event trigger
      // Use `lastTriggerRef` to record last open type
      if (
        (lastTriggerRef.value[lastTriggerRef.value.length - 1]
          ?? mergedOpen) !== nextOpen
      ) {
        lastTriggerRef.value.push(nextOpen)
        onPopupVisibleChange?.(nextOpen)
      }
    })

    // Trigger for delay
    const delayRef = ref<any>()

    const clearDelay = () => {
      clearTimeout(delayRef.value)
    }

    const triggerOpen = (nextOpen: boolean, delay = 0) => {
      clearDelay()

      if (delay === 0) {
        internalTriggerOpen(nextOpen)
      }
      else {
        delayRef.value = setTimeout(() => {
          internalTriggerOpen(nextOpen)
        }, delay * 1000)
      }
    }

    watchEffect(() => clearDelay())

    // ========================== Motion ============================
    const inMotion = ref(false)

    useLayoutEffect(
      (firstMount) => {
        if (!firstMount || mergedOpen) {
          inMotion.value = true
        }
      },
      [mergedOpen],
    )

    const motionPrepareResolve
        = ref<VoidFunction>(null)

    // =========================== Align ============================
    const mousePos = ref<[x: number, y: number] | null>(null)

    const setMousePosByEvent = (
      event: Pick<MouseEvent, 'clientX' | 'clientY'>,
    ) => {
      mousePos.value = [event.clientX, event.clientY]
    }

    const [
      ready,
      offsetX,
      offsetY,
      offsetR,
      offsetB,
      arrowX,
      arrowY,
      scaleX,
      scaleY,
      alignInfo,
      onAlign,
    ] = useAlign(
      mergedOpen,
      popupEle.value,
      alignPoint && mousePos.value !== null ? mousePos.value : targetEle.value,
      popupPlacement,
      builtinPlacements,
      popupAlign,
      onPopupAlign,
    )

    const [showActions, hideActions] = useAction(
      mobile.value,
      action,
      showAction,
      hideAction,
    )

    const clickToShow = showActions.has('click')
    const clickToHide
        = hideActions.has('click') || hideActions.has('contextMenu')

    const triggerAlign = useEvent(() => {
      if (!inMotion.value) {
        onAlign()
      }
    })

    const onScroll = () => {
      if (openRef.value && alignPoint && clickToHide) {
        triggerOpen(false)
      }
    }

    useWatch(mergedOpen, targetEle.value, popupEle.value, triggerAlign, onScroll)

    useLayoutEffect(() => {
      triggerAlign()
    }, [mousePos.value, popupPlacement])

    // When no builtinPlacements and popupAlign changed
    useLayoutEffect(() => {
      if (mergedOpen && !builtinPlacements?.[popupPlacement]) {
        triggerAlign()
      }
    }, [JSON.stringify(popupAlign)])

    const alignedClassName = computed(() => {
      const baseClassName = getAlignPopupClassName(
        builtinPlacements,
        prefixCls,
        alignInfo,
        alignPoint,
      )
      return classNames(baseClassName, getPopupClassNameFromAlign?.(alignInfo))
    })

    // ============================ Refs ============================
    // 从子组件中取出值或事件
    // React.useImperativeHandle(ref, () => ({
    //   nativeElement: externalForwardRef.value,
    //   popupElement: externalPopupRef.value,
    //   forceAlign: triggerAlign,
    // }))

    // ========================== Stretch ===========================
    const targetWidth = ref(0)
    const targetHeight = ref(0)

    const syncTargetSize = () => {
      if (stretch && targetEle.value) {
        const rect = targetEle.value.getBoundingClientRect()
        targetWidth.value = rect.width
        targetHeight.value = rect.height
      }
    }

    const onTargetResize = () => {
      syncTargetSize()
      triggerAlign()
    }

    // ========================== Motion ============================
    const onVisibleChanged = (visible: boolean) => {
      inMotion.value = false
      onAlign()
      afterPopupVisibleChange?.(visible)
    }

    // We will trigger align when motion is in prepare
    const onPrepare = () =>
      new Promise<void>((resolve) => {
        syncTargetSize()
        motionPrepareResolve.value = resolve
      })

    useLayoutEffect(() => {
      if (motionPrepareResolve) {
        onAlign()
        // motionPrepareResolve()
        motionPrepareResolve.value = null
      }
    }, [motionPrepareResolve])

    // =========================== Action ===========================
    /**
     * Util wrapper for trigger action
     */
    function wrapperAction<Event>(
      eventName: string,
      nextOpen: boolean,
      delay?: number,
      preEvent?: (event: Event) => void,
    ) {
      cloneProps[eventName] = (event: any, ...args: any[]) => {
        preEvent?.(event)
        triggerOpen(nextOpen, delay)

        // Pass to origin
        originChildProps[eventName]?.(event, ...args)
      }
    }

    // ======================= Action: Click ========================
    if (clickToShow || clickToHide) {
      cloneProps.onClick = (
        event: MouseEvent,
        ...args: any[]
      ) => {
        if (openRef.value && clickToHide) {
          triggerOpen(false)
        }
        else if (!openRef.value && clickToShow) {
          setMousePosByEvent(event)
          triggerOpen(true)
        }

        // Pass to origin
        originChildProps.onClick?.(event, ...args)
      }
    }

    // Click to hide is special action since click popup element should not hide
    useWinClick(
      mergedOpen,
      clickToHide,
      targetEle.value,
      popupEle.value,
      mask,
      maskClosable,
      inPopupOrChild,
      triggerOpen,
    )

    // ======================= Action: Hover ========================
    const hoverToShow = showActions.has('hover')
    const hoverToHide = hideActions.has('hover')

    let onPopupMouseEnter: MouseEvent
    let onPopupMouseLeave: VoidFunction

    if (hoverToShow) {
      // Compatible with old browser which not support pointer event
      wrapperAction<MouseEvent>(
        'onMouseEnter',
        true,
        mouseEnterDelay,
        (event) => {
          setMousePosByEvent(event)
        },
      )
      wrapperAction<PointerEvent>(
        'onPointerEnter',
        true,
        mouseEnterDelay,
        (event) => {
          setMousePosByEvent(event)
        },
      )
      onPopupMouseEnter = (event) => {
        // Only trigger re-open when popup is visible
        if (
          (mergedOpen || inMotion.value)
          && popupEle.value?.contains(event.target as HTMLElement)
        ) {
          triggerOpen(true, mouseEnterDelay)
        }
      }

      // Align Point
      if (alignPoint) {
        cloneProps.onMouseMove = (event: MouseEvent) => {
          // setMousePosByEvent(event);
          originChildProps.onMouseMove?.(event)
        }
      }
    }

    if (hoverToHide) {
      wrapperAction('onMouseLeave', false, mouseLeaveDelay)
      wrapperAction('onPointerLeave', false, mouseLeaveDelay)
      onPopupMouseLeave = () => {
        triggerOpen(false, mouseLeaveDelay)
      }
    }

    // ======================= Action: Focus ========================
    if (showActions.has('focus')) {
      wrapperAction('onFocus', true, focusDelay)
    }

    if (hideActions.has('focus')) {
      wrapperAction('onBlur', false, blurDelay)
    }

    // ==================== Action: ContextMenu =====================
    if (showActions.has('contextMenu')) {
      cloneProps.onContextMenu = (event: MouseEvent, ...args: any[]) => {
        if (openRef.value && hideActions.has('contextMenu')) {
          triggerOpen(false)
        }
        else {
          setMousePosByEvent(event)
          triggerOpen(true)
        }

        event.preventDefault()

        // Pass to origin
        originChildProps.onContextMenu?.(event, ...args)
      }
    }

    // ========================= ClassName ==========================
    if (attrs.class) {
      cloneProps.class = classNames(originChildProps.class, attrs.class)
    }

    // =========================== Render ===========================
    const mergedChildrenProps = {
      ...originChildProps,
      ...cloneProps,
    }

    // Pass props into cloneProps for nest usage
    const passedProps: Record<string, any> = {}
    const passedEventList = [
      'onContextMenu',
      'onClick',
      'onMouseDown',
      'onTouchStart',
      'onMouseEnter',
      'onMouseLeave',
      'onFocus',
      'onBlur',
    ]

    passedEventList.forEach((eventName) => {
      if (restProps[eventName]) {
        passedProps[eventName] = (...args: any[]) => {
          mergedChildrenProps[eventName]?.(...args)
          restProps[eventName](...args)
        }
      }
    })

    // Child Node
    const triggerNode = cloneElement(child, {
      ...mergedChildrenProps,
      ...passedProps,
    })

    const arrowPos: ArrowPos = {
      x: arrowX,
      y: arrowY,
    }

    const innerArrow: ArrowTypeOuter = arrow
      ? {
          // true and Object likely
          ...(arrow !== true ? arrow : {}),
        }
      : null
    return () => {
      // Render
      return (
        <>
          <ResizeObserver
            disabled={!mergedOpen}
            ref={targetEle.value}
            onResize={onTargetResize}
          >
            {triggerNode}
          </ResizeObserver>
          <Popup
            ref={setPopupRef}
            prefixCls={prefixCls}
            popup={popup}
            className={classNames(popupClassName, alignedClassName.value)}
            style={popupStyle}
            target={targetEle.value}
            onMouseEnter={onPopupMouseEnter}
            onMouseLeave={onPopupMouseLeave}
            // https://github.com/ant-design/ant-design/issues/43924
            onPointerEnter={onPopupMouseEnter}
            zIndex={zIndex}
            // Open
            open={mergedOpen}
            keepDom={inMotion.value}
            fresh={fresh}
            // Click
            onClick={onPopupClick}
            // Mask
            mask={mask}
            // Motion
            motion={mergePopupMotion}
            maskMotion={mergeMaskMotion}
            onVisibleChanged={onVisibleChanged}
            onPrepare={onPrepare}
            // Portal
            forceRender={forceRender}
            autoDestroy={mergedAutoDestroy}
            getPopupContainer={getPopupContainer}
            // Arrow
            align={alignInfo}
            arrow={innerArrow}
            arrowPos={arrowPos}
            // Align
            ready={ready}
            offsetX={offsetX}
            offsetY={offsetY}
            offsetR={offsetR}
            offsetB={offsetB}
            onAlign={triggerAlign}
            // Stretch
            stretch={stretch}
            targetWidth={targetWidth.value / scaleX}
            targetHeight={targetHeight.value / scaleY}
          />
        </>
      )
    }
  },
})
